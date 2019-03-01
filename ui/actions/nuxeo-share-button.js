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
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';

{
  /**
   * A button element for sharing a document.
   *
   * Example:
   *
   *     <nuxeo-share-button document="[[document]]"></nuxeo-share-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-share-button/index.html
   */
  class ShareButton extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="nuxeo-action-button-styles">
      #copyLink {
        cursor: pointer;
        color: var(--nuxeo-primary-color, #0066ff);
      }

      .heading {
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-justified;
      }
    </style>

    <dom-if if="[[_isAvailable(document)]]">
      <template>
        <div class="action" on-click="_toggleDialog">
          <paper-icon-button icon="[[icon]]" noink=""></paper-icon-button>
          <span class="label" hidden\$="[[!showLabel]]">[[_label]]</span>
        </div>
        <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
      </template>
    </dom-if>

    <nuxeo-dialog id="dialog" with-backdrop="">
      <div class="heading">
        <h2>[[i18n('shareButton.dialog.heading')]]</h2>
        <span id="copyLink" on-click="_copyPermalink">[[i18n('shareButton.operation.copy')]]</span>
      </div>
      <nuxeo-input id="permalink" value="[[_buildPermalink(document)]]" on-click="_copyPermalink" autofocus readonly>
      </nuxeo-input>
      <div class="buttons">
        <paper-button dialog-dismiss="">[[i18n('shareButton.dialog.close')]]</paper-button>
      </div>
    </nuxeo-dialog>
`;
    }

    static get is() {
      return 'nuxeo-share-button';
    }

    static get properties() {
      return {
        /**
         * Input document.
         */
        document: Object,

        /**
         * Icon to use (iconset_name:icon_name).
         */
        icon: {
          type: String,
          value: 'nuxeo:share',
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
          computed: '_computeLabel(i18n)',
        },
      };
    }

    _isAvailable(document) {
      return document;
    }

    _computeLabel() {
      return this.i18n('shareButton.tooltip');
    }

    _toggleDialog() {
      this.$.dialog.toggle();
      this._selectPermalink();
    }

    _buildPermalink(document) {
      return document ? `${location.origin + location.pathname}#!/doc/${document.uid}` : '';
    }

    _copyPermalink() {
      this._selectPermalink();
      if (!window.document.execCommand('copy')) {
        return;
      }

      const link = this.$.copyLink;
      this._debouncer = Debouncer.debounce(
        this._debouncer,
        timeOut.after(3000), () => {
          link.innerText = this.i18n('shareButton.operation.copy');
        },
      );
      link.innerText = this.i18n('shareButton.operation.copied');
    }

    _selectPermalink() {
      this.$.permalink.$.paperInput.inputElement.inputElement.select();
    }
  }

  customElements.define(ShareButton.is, ShareButton);
  Nuxeo.ShareButton = ShareButton;
}
