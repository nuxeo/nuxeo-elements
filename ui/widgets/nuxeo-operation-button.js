/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

import '@polymer/iron-icon/iron-icon.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import { NotifyBehavior } from '@nuxeo/nuxeo-elements/nuxeo-notify-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import './nuxeo-tooltip.js';
import '../actions/nuxeo-action-button-styles.js';

{
  /**
   * An element for running an operation.
   *
   * Example:
   *
   *     <nuxeo-operation-button
   *         icon="icons:account-box" label="Get user"
   *         operation="User.Get" response="{{operationResponse}}">
   *     </nuxeo-operation-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-operation-button/index.html
   */
  class OperationButton extends mixinBehaviors([NotifyBehavior, I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="nuxeo-action-button-styles"></style>

        <nuxeo-operation
          id="op"
          op="[[operation]]"
          input="[[input]]"
          params="[[params]]"
          sync-indexing$="[[syncIndexing]]"
          async$="[[async]]"
          poll-interval="[[pollInterval]]"
          on-poll-start="_onPollStart"
          on-poll-update="_onPollUpdate"
          on-poll-error="_onPollError"
        >
        </nuxeo-operation>

        <div class="action" on-click="_execute">
          <paper-icon-button id="bt" icon="[[icon]]" aria-labelledby="label"></paper-icon-button>
          <span class="label" hidden$="[[!showLabel]]" id="label">[[i18n(label)]]</span>
          <nuxeo-tooltip position="[[tooltipPosition]]">[[i18n(_tooltip)]]</nuxeo-tooltip>
        </div>
      `;
    }

    static get is() {
      return 'nuxeo-operation-button';
    }

    static get properties() {
      return {
        /* Icon name, can be anything taken from the [material icons](https://material.io/icons/), e.g. "chat", "description". */
        icon: String,

        /* Label (shown inside menu dropdowns and on tooltips) */
        label: String,

        /* Tooltip label. If `undefined`, `label` will be used instead. */
        tooltip: String,

        /**
         * Position where to place the tooltip.
         */
        tooltipPosition: {
          type: String,
          value: 'bottom',
        },

        /**
         * `true` if the action should display the label, `false` otherwise.
         */
        showLabel: {
          type: Boolean,
          value: false,
        },

        /* The id of the operation, automation chain or script to call. */
        operation: String,

        /* Pass contextual information that will be forwarded to the operation,
         * automation chain or script triggered as the input for the first
         * operation. Possible options depend on the slot chosen.
         * [Documentation](https://doc.nuxeo.com/nxdoc/web-ui-slots)
         */
        input: Object,

        /**
         * If true, documents changed by the operation call will be reindexed synchronously server side.
         */
        syncIndexing: Boolean,

        /* The parameters to send. */
        params: {
          type: Object,
          value() {
            return {};
          },
        },

        /* The response from the server. */
        response: {
          type: Object,
          value: null,
          notify: true,
        },

        /* The text or i18n key to display in the notification. */
        notification: {
          type: String,
        },

        /* Trigger download of Blob response. */
        download: {
          type: Boolean,
          value: false,
        },

        /* The event type to fire on completion. */
        event: {
          type: String,
          value: 'operation-executed',
        },

        /* The detail of the event fired on completion.  */
        detail: {
          type: String,
        },

        /**
         * If true, execute the operation asynchronously.
         */
        async: {
          type: Boolean,
          value: false,
        },

        /**
         * Poll interval in ms.
         */
        pollInterval: {
          type: Number,
          value: 1000,
        },

        /**
         * A custom label to be displayed if there is an error during the operation execution. If `undefined`, the
         * original error message is shown. The label can receive a placeholder (i.e. `{0}`) to display the original
         * error message.
         */
        errorLabel: {
          type: String,
        },

        _tooltip: {
          type: String,
          computed: '_computeTooltip(tooltip, label)',
        },
      };
    }

    _execute() {
      return this.$.op
        .execute()
        .then((response) => {
          if (this.notification) {
            this.notify({ message: this.i18n(this.notification) });
          }
          let detail = { response };
          if (this.detail) {
            // if the supplied params are a string, parse them as JSON
            detail = typeof this.detail === 'string' ? JSON.parse(this.detail) : this.detail;
          }
          this.dispatchEvent(
            new CustomEvent(this.event, {
              composed: true,
              bubbles: true,
              detail,
            }),
          );

          if (this._hasBulkStatus(response)) {
            const { commandId, errorCount, total } = response;
            if (this._isAborted(response)) {
              this.notify({
                message: this.i18n('operationButton.bulk.poll.aborted', this.i18n(this.label)),
                dismissible: true,
                duration: 0,
                commandId,
              });
            } else {
              this.notify({
                message:
                  errorCount > 0
                    ? this.i18n('operationButton.bulk.poll.completed.error', this.i18n(this.label), errorCount)
                    : this.i18n('operationButton.bulk.poll.completed.success', this.i18n(this.label), total),
                dismissible: true,
                duration: 0,
                commandId,
                errorDetails:
                  errorCount > 0
                    ? this.i18n(
                        'bulk.errorDetails.message',
                        this.operation,
                        response.username,
                        response.submitted,
                        response.completed,
                        response.processed,
                        total,
                        errorCount,
                        response.errorMessage,
                        commandId,
                      )
                    : '',
              });
            }
            return response;
          }

          if (this.download) {
            this._download(response);
          }
        })
        .catch((error) => {
          if (this._hasBulkStatus(error)) {
            const { commandId, errorCount, total } = error;
            this.notify({
              message:
                errorCount > 0
                  ? this.i18n('operationButton.bulk.poll.completed.error', this.i18n(this.label), errorCount)
                  : this.i18n('operationButton.bulk.poll.completed.success', this.i18n(this.label), total),
              dismissible: true,
              duration: 0,
              commandId,
              errorDetails:
                errorCount > 0
                  ? this.i18n(
                      'bulk.errorDetails.message',
                      this.operation,
                      error.username,
                      error.submitted,
                      error.completed,
                      error.processed,
                      total,
                      errorCount,
                      error.errorMessage,
                      commandId,
                    )
                  : '',
            });
          } else {
            this.notify({ message: this.errorLabel ? this.i18n(this.errorLabel, error) : error });
          }

          if (error.status !== 404) {
            throw error;
          }
        });
    }

    // https://jira.nuxeo.com/browse/ELEMENTS-370
    _download(response) {
      const contentDisposition = response.headers && response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatches = contentDisposition
          .match(/filename[^;=\n]*=([^;\n]*''([^;\n]*)|[^;\n]*)/)
          .filter((match) => !!match);
        const filename = decodeURI(filenameMatches[filenameMatches.length - 1]);
        if (this.async) {
          this._triggerDownload(filename, response.url);
          return;
        }
        response.blob().then((blob) => {
          const url = URL.createObjectURL(blob);
          this._triggerDownload(filename, url);
          URL.revokeObjectURL(url);
        });
      } else {
        this._triggerDownload('', response.url);
      }
    }

    _triggerDownload(filename, url) {
      const a = document.createElement('a');
      a.style = 'display: none';
      a.download = filename;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    _computeTooltip(tooltip, label) {
      return tooltip || label;
    }

    _isPageProviderDisplayBehavior(input) {
      return (
        input &&
        input.behaviors &&
        Nuxeo.PageProviderDisplayBehavior &&
        Nuxeo.PageProviderDisplayBehavior.every((p) => input.behaviors.includes(p))
      );
    }

    _isSelectAllActive(input) {
      return this._isPageProviderDisplayBehavior(input) && input.selectAllActive;
    }

    _isRunning(status) {
      const state = this._hasBulkStatus(status) ? (status.value && status.value.state) || status.state : status;
      return state === 'RUNNING';
    }

    _isAborted(status) {
      return this._hasBulkStatus(status)
        ? ((status.value && status.value.state) || status.state) === 'ABORTED'
        : !this._isRunning(status);
    }

    _hasBulkStatus(status) {
      return status && status['entity-type'] === 'bulkStatus';
    }

    _onPollStart(e) {
      if (!e.detail || !e.detail.commandId) {
        return;
      }
      const { commandId } = e.detail;
      const detail = {
        message: this.i18n('operationButton.bulk.poll.scheduled', this.i18n(this.label)),
        abort: function() {
          this.$.op._abort(commandId);
        }.bind(this),
        dismissible: true,
        duration: 0,
        commandId,
      };
      this.notify(detail);
    }

    _onPollUpdate(e) {
      if (!e.detail || !e.detail.commandId) {
        return;
      }
      const status = e.detail;
      const { commandId, processed, total } = status;
      const detail = {
        message: this._isRunning(status)
          ? this.i18n('operationButton.bulk.poll.running', this.i18n(this.label), processed, total)
          : this.i18n('operationButton.bulk.poll.scheduled', this.i18n(this.label)),
        abort: function() {
          this.$.op._abort(commandId);
        }.bind(this),
        dismissible: true,
        duration: 0,
        commandId,
      };
      this.notify(detail);
    }

    _onPollError(e) {
      const error = e.detail;
      this.notify({
        message: this.i18n('operationButton.bulk.poll.error', this.i18n(this.label)),
        dismissible: true,
        duration: 0,
        error,
      });
    }
  }

  customElements.define(OperationButton.is, OperationButton);
  Nuxeo.OperationButton = OperationButton;
}
