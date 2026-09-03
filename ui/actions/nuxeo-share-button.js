/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

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

          /* Offsets compensate for paper-icon-button's 8px padding so the glyph keeps
             its previous position next to the permalink field. */
          #permalinkIcon {
            cursor: pointer;
            margin: 12px 0 0 2px;
          }

          #permalinkIcon:hover {
            color: var(--nuxeo-primary-color, #0066ff);
          }

          #permalinkIcon:focus-visible {
            outline: 2px solid var(--nuxeo-primary-color, #0066ff);
            outline-offset: 2px;
          }

          nuxeo-input {
            cursor: text;
            overflow: hidden;
            @apply --layout-flex;
          }

          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
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
          <div>
            <h2>[[i18n('shareButton.dialog.heading')]]</h2>
          </div>
          <div id="permanent" class="horizontal">
            <nuxeo-input
              id="permalink"
              label="[[i18n('shareButton.link.label', document.properties.dc:title)]]"
              value="[[_buildPermalink(document)]]"
              readonly
            >
            </nuxeo-input>
            <paper-icon-button
              id="permalinkIcon"
              name="permalinkIcon"
              icon="link"
              on-click="_copyLink"
              aria-label$="[[i18n('shareButton.operation.copy')]]"
            ></paper-icon-button>
            <!-- No title attribute: nuxeo-tooltip already provides the visible hint on
                 hover and on focus, and a native tooltip would render on top of it. -->
            <nuxeo-tooltip id="tooltip" for="permalinkIcon">[[i18n('shareButton.operation.copy')]]</nuxeo-tooltip>
            <!-- The dialog is aria-modal, so the app-level toast raised by notify() is
                 outside the subtree assistive technology exposes. Announce the copy here. -->
            <div id="copyStatus" class="sr-only" role="status" aria-live="polite" aria-atomic="true">
              [[_copyStatus]]
            </div>
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

        /**
         * Message announced by the dialog's live region once the link is copied.
         */
        _copyStatus: {
          type: String,
          value: '',
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
      // While the confirmation shows, the button is inert to pointers; keep keyboard
      // activation consistent with that rather than copying again in the same window.
      if (this._copyDebouncer?.isActive()) {
        return;
      }

      const copyButton = this.$.permalinkIcon;
      const link = this.$.permalink;
      // Selecting the field moves focus off the button, so keyboard users would lose
      // their place after activating it. Clicks synthesized from Enter/Space carry a
      // detail of 0, which is what tells them apart from a real pointer click.
      const activatedFromKeyboard = !!e && e.detail === 0;

      // Select Link
      link.$.paperInput.$.nativeInput.select();
      if (!window.document.execCommand('copy')) {
        return;
      }

      // Kept on this element rather than on the button, so it cannot collide with
      // paper-icon-button's own internals.
      this._copyDebouncer = Debouncer.debounce(this._copyDebouncer, timeOut.after(2000), () => {
        // Unselect Link
        link.$.paperInput.$.nativeInput.setSelectionRange(0, 0);
        link.$.paperInput.blur();
        copyButton.set('icon', 'link');
        copyButton.classList.remove('selected');
        this._copyStatus = '';
      });

      copyButton.set('icon', 'check');
      copyButton.classList.add('selected');
      if (activatedFromKeyboard) {
        copyButton.focus();
      }
      this._copyStatus = this.i18n('shareButton.operation.copied');
      this.notify({ message: this.i18n('shareButton.operation.copied'), duration: 2000 });
    }
  }

  customElements.define(ShareButton.is, ShareButton);
  Nuxeo.ShareButton = ShareButton;
}
