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
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { FormatBehavior } from '../nuxeo-format-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';
import '../nuxeo-button-styles.js';

{
  /**
   * A button element for exporting document's content.
   *
   * Example:
   *
   *     <nuxeo-export-button document="[[document]]"></nuxeo-export-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-export-button/index.html
   */
  class ExportButton extends mixinBehaviors([FormatBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          .item {
            @apply --layout-horizontal;
            @apply --layout-center;
            padding-top: 0.4em;
            padding-bottom: 0.4em;
          }

          .item iron-icon {
            margin-right: 1em;
          }

          a {
            color: var(--nuxeo-link-color, #3a3a54);
          }
          a:hover {
            color: var(--nuxeo-link-hover-color, #0066ff);
          }

          .container {
            overflow: auto;
          }
        </style>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" on-click="_toggleDialog">
              <paper-icon-button icon="[[icon]]" noink aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>

        <nuxeo-dialog id="dialog" with-backdrop class="container">
          <h2>[[i18n('exportButton.dialog.heading')]]</h2>

          <dom-repeat items="[[_filterRenditions(document, i18n)]]">
            <template>
              <div class="item">
                <iron-icon src="[[item.icon]]"></iron-icon><a href="[[item.url]]" download>[[item.label]]</a>
              </div>
            </template>
          </dom-repeat>

          <div class="buttons">
            <paper-button dialog-dismiss class="secondary">[[i18n('exportButton.dialog.cancel')]]</paper-button>
          </div>
        </nuxeo-dialog>
      `;
    }

    static get is() {
      return 'nuxeo-export-button';
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
          value: 'nuxeo:export',
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
      return this.i18n('exportButton.tooltip');
    }

    _toggleDialog() {
      this.$.dialog.toggle();
    }

    _filterRenditions(document) {
      if (document && document.contextParameters && document.contextParameters.renditions) {
        return document.contextParameters.renditions
          .filter(
            (rendition) => rendition.kind !== 'nuxeo:video:conversion' && rendition.kind !== 'nuxeo:picture:conversion',
          )
          .map((item) => Object.assign({ label: this.formatRendition(item.name) }, item));
      }
      return [];
    }
  }

  customElements.define(ExportButton.is, ExportButton);
  Nuxeo.ExportButton = ExportButton;
}
