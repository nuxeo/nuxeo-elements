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
import { NotifyBehavior } from '@nuxeo/nuxeo-elements/nuxeo-notify-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';
import '../nuxeo-button-styles.js';

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
  class ShareButton extends mixinBehaviors([NotifyBehavior, I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          .horizontal {
            @apply --layout-horizontal;
            @apply --layout-center;
            @apply --layout-justified;
          }

          .selected {
            color: var(--nuxeo-primary-color, #0066ff);
            pointer-events: none;
          }

          iron-icon {
            cursor: pointer;
            margin: 20px 0 0 10px;
          }

          iron-icon:hover {
            color: var(--nuxeo-primary-color, #0066ff);
          }

          nuxeo-input {
            cursor: text;
            overflow: hidden;
            @apply --layout-flex;
          }
        </style>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" on-click="_toggleDialog">
              <paper-icon-button id="shareBtn" icon="[[icon]]" noink aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>

        <nuxeo-dialog id="dialog" with-backdrop>
          <h2>[[i18n('shareButton.dialog.heading')]]</h2>
          <div id="permanent" class="horizontal">
            <nuxeo-input
              id="permalink"
              label="[[i18n('shareButton.link.label', document.properties.dc:title)]]"
              value="[[_buildPermalink(document)]]"
              readonly
            >
            </nuxeo-input>
            <iron-icon id="permalinkIcon" name="permalinkIcon" icon="link" on-tap="_copyLink"></iron-icon>
            <nuxeo-tooltip id="tooltip" for="permalinkIcon">[[i18n('shareButton.operation.copy')]]</nuxeo-tooltip>
          </div>

          <div class="buttons">
            <paper-button dialog-dismiss class="primary">[[i18n('shareButton.dialog.close')]]</paper-button>
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
    }

    _buildPermalink(document) {
      return document ? `${window.location.origin + window.location.pathname}#!/doc/${document.uid}` : '';
    }

    _copyLink(e) {
      const shareButton = e.currentTarget;
      const link = shareButton.previousElementSibling;

      // Select Link
      link.$.paperInput.$.nativeInput.select();
      if (!window.document.execCommand('copy')) {
        return;
      }

      shareButton._debouncer = Debouncer.debounce(shareButton._debouncer, timeOut.after(2000), () => {
        // Unselect Link
        link.$.paperInput.$.nativeInput.setSelectionRange(0, 0);
        link.$.paperInput.blur();
        shareButton.set('icon', 'link');
        shareButton.classList.remove('selected');
      });

      shareButton.set('icon', 'check');
      shareButton.classList.add('selected');
      this.notify({ message: this.i18n('shareButton.operation.copied'), duration: 2000 });
    }
  }

  customElements.define(ShareButton.is, ShareButton);
  Nuxeo.ShareButton = ShareButton;
}
