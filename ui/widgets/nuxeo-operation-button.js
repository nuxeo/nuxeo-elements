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
import { OperationMixin } from '@nuxeo/nuxeo-elements/nuxeo-operation.js';
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
  class OperationButton extends mixinBehaviors([NotifyBehavior, I18nBehavior], OperationMixin(Nuxeo.Element)) {
    static get template() {
      return html`
        <style include="nuxeo-action-button-styles"></style>

        <div class="action" on-click="_execute">
          <paper-icon-button id="bt" icon="[[icon]]" aria-labelledby="label"></paper-icon-button>
          <span class="label" hidden$="[[!showLabel]]" id="label">[[i18n(label)]]</span>
          <nuxeo-tooltip>[[i18n(_tooltip)]]</nuxeo-tooltip>
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
      this.execute()
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

          if (this.download) {
            this._download(response);
          }
        })
        .catch((error) => {
          this.notify({ message: this.errorLabel ? this.i18n(this.errorLabel, error) : error });
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
  }

  customElements.define(OperationButton.is, OperationButton);
  Nuxeo.OperationButton = OperationButton;
}
