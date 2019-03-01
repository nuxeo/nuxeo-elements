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
import '@polymer/iron-icons/social-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';

{
  /**
   * A toggle button element for subscribe/unsubscribe a document.
   *
   * Example:
   *
   *     <nuxeo-notifications-toggle-button document="[[document]]"></nuxeo-notifications-toggle-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-notifications-toggle-button/index.html
   */
  class NotificationsToggleButton
    extends mixinBehaviors([I18nBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="nuxeo-action-button-styles">
      :host([subscribed]) paper-icon-button {
        color: var(--icon-toggle-outline-color, var(--nuxeo-action-color-activated));
      }
    </style>

    <nuxeo-operation id="opSubscribe" op="Document.Subscribe" input="[[document.uid]]"></nuxeo-operation>
    <nuxeo-operation id="opUnsubscribe" op="Document.Unsubscribe" input="[[document.uid]]"></nuxeo-operation>

    <dom-if if="[[_isAvailable(document)]]">
      <template>
        <div class="action">
          <paper-icon-button icon="[[icon]]" noink=""></paper-icon-button>
          <span class="label" hidden\$="[[!showLabel]]">[[_label]]</span>
        </div>
        <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
      </template>
    </dom-if>
`;
    }

    static get is() {
      return 'nuxeo-notifications-toggle-button';
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
          value: 'nuxeo:notify',
        },

        subscribed: {
          type: Boolean,
          notify: true,
          reflectToAttribute: true,
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
          computed: '_computeLabel(subscribed, i18n)',
        },
      };
    }

    ready() {
      super.ready();
      this.documentUnsubscribedHandler = (e) => {
        if (this.document && e.detail.docUid && e.detail.docUid === this.document.uid) {
          this.subscribed = false;
        }
      };
      window.addEventListener('document-unsubscribed', this.documentUnsubscribedHandler);
      this.addEventListener('click', this._toggle);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      window.removeEventListener('document-unsubscribed', this.documentUnsubscribedHandler);
      this.documentUnsubscribedHandler = null;
    }

    _isAvailable(doc) {
      return doc && !doc.isVersion;
    }

    _toggle() {
      if (!this.subscribed) {
        this.$.opSubscribe.execute().then(() => {
          this.dispatchEvent(new CustomEvent('document-subscribed', {
            composed: true,
            bubbles: true,
            detail: { doc: this.document },
          }));
          this.subscribed = true;
        });
      } else {
        this.$.opUnsubscribe.execute().then(() => {
          this.dispatchEvent(new CustomEvent('document-unsubscribed', {
            composed: true,
            bubbles: true,
            detail: { doc: this.document },
          }));
          this.subscribed = false;
        });
      }
    }

    _computeLabel(isSubscribed) {
      return this.i18n(`notificationsToggleButton.tooltip.${isSubscribed ? 'doNotNotify' : 'notify'}`);
    }

    _documentChanged() {
      this.subscribed = this.isSubscribed(this.document);
    }
  }

  customElements.define(NotificationsToggleButton.is, NotificationsToggleButton);
  Nuxeo.NotificationsToggleButton = NotificationsToggleButton;
}
