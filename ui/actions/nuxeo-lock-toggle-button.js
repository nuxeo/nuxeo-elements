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
import '@polymer/iron-icons/iron-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';
import { FormatBehavior } from '../nuxeo-format-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';

{
  /**
   * A toggle button element for lock/unlock a document.
   *
   * Example:
   *
   *     <nuxeo-lock-toggle-button document="[[document]]"></nuxeo-lock-toggle-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @appliesMixin Nuxeo.FormatBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-lock-toggle-button/index.html
   */
  class LockToggleButton extends mixinBehaviors([I18nBehavior, FiltersBehavior, FormatBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="nuxeo-action-button-styles">
          :host([locked]) paper-icon-button {
            color: var(--icon-toggle-outline-color, var(--nuxeo-action-color-activated));
          }
        </style>

        <nuxeo-connection id="nxcon"></nuxeo-connection>

        <nuxeo-operation
          id="opLock"
          op="Document.Lock"
          input="[[document.uid]]"
          headers='{"X-NXfetch.document": "lock"}'
        >
        </nuxeo-operation>
        <nuxeo-operation
          id="opUnlock"
          op="Document.Unlock"
          input="[[document.uid]]"
          headers='{"X-NXfetch.document": "lock"}'
        >
        </nuxeo-operation>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action">
              <paper-icon-button icon="[[icon]]" noink></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]">[[_label]]</span>
              <nuxeo-tooltip>[[tooltip]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>
      `;
    }

    static get is() {
      return 'nuxeo-lock-toggle-button';
    }

    static get properties() {
      return {
        /**
         * Input document.
         */
        document: {
          type: Object,
          observer: '_documentChanged',
        },

        /**
         * Icon to use (iconset_name:icon_name).
         */
        icon: {
          type: String,
          computed: '_computeIcon(locked)',
        },

        locked: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
        },

        /**
         * The translated label to be displayed by the action.
         */
        tooltip: {
          type: String,
          notify: true,
          computed: '_computeTooltip(locked, i18n, document)',
        },

        /**
         * `true` if the action should display the label, `false` otherwise.
         */
        showLabel: {
          type: Boolean,
          value: false,
        },

        _label: {
          type: String,
          computed: '_computeLabel(locked, i18n)',
        },
      };
    }

    ready() {
      super.ready();
      this.addEventListener('click', this._toggle);
    }

    _isAvailable(doc) {
      return doc && !doc.isVersion && this.hasPermission(doc, 'Write') && !this.isImmutable(doc) && doc.type !== 'Root';
    }

    _toggle() {
      if (!this.locked && this._canLock()) {
        this.$.opLock
          .execute()
          .then((doc) => {
            this.locked = true;
            this.dispatchEvent(
              new CustomEvent('document-locked', {
                composed: true,
                bubbles: true,
                detail: { doc },
              }),
            );
          })
          .catch(this._handleError.bind(this));
      } else if (this._canUnlock()) {
        this.$.opUnlock
          .execute()
          .then((doc) => {
            this.locked = false;
            this.dispatchEvent(
              new CustomEvent('document-unlocked', {
                composed: true,
                bubbles: true,
                detail: { doc },
              }),
            );
          })
          .catch(this._handleError.bind(this));
      }
    }

    _handleError(err) {
      const operation = this.locked ? 'unlock' : 'lock';
      let message;
      switch (err.response.status) {
        case 403:
          message = this.i18n(`lockToggleButton.${operation}.error.noPermissions`);
          break;
        case 409:
          message = this.i18n(
            `lockToggleButton.${operation}.error.${operation === 'lock' ? 'alreadyLocked' : 'lockedByAnotherUser'}`,
          );
          break;
        default:
          message = this.i18n(`lockToggleButton.${operation}.error.unexpectedError`);
      }
      this.dispatchEvent(
        new CustomEvent('notify', {
          composed: true,
          bubbles: true,
          detail: { message },
        }),
      );
    }

    _computeTooltip(locked) {
      if (locked && this.document.lockOwner && this.document.lockCreated) {
        return this.i18n(
          'lockToggleButton.tooltip.lockedBy',
          this.document.lockOwner,
          this.formatDate(this.document.lockCreated),
        );
      }
      return this.i18n(`lockToggleButton.tooltip.${locked ? 'unlock' : 'lock'}`);
    }

    _computeLabel(locked) {
      return this.i18n(`lockToggleButton.tooltip.${locked ? 'unlock' : 'lock'}`);
    }

    _computeIcon(locked) {
      return locked ? 'nuxeo:lock' : 'nuxeo:unlock';
    }

    _documentChanged() {
      this.locked = !!(this.document && this.document.lockCreated);
    }

    _canLock() {
      return this.$.nxcon.connect().then((currentUser) => {
        if (this.document.isProxy || this.document.isVersion) {
          return false;
        }
        return (
          currentUser.isAdministrator ||
          this.document.contextParameters.permissions.indexOf('Everything') > -1 ||
          this.document.contextParameters.permissions.indexOf('Write') > -1
        );
      });
    }

    _canUnlock() {
      return this.$.nxcon.connect().then((currentUser) => {
        if (this.document.isProxy) {
          return false;
        }
        return (
          (currentUser.isAdministrator || this.document.contextParameters.permissions.indexOf('Everything') > -1
            ? true
            : currentUser.id === this.document.lockOwner &&
              this.document.contextParameters.permissions.indexOf('Write') > -1) && !document.isVersion
        );
      });
    }
  }

  customElements.define(LockToggleButton.is, LockToggleButton);
  Nuxeo.LockToggleButton = LockToggleButton;
}
