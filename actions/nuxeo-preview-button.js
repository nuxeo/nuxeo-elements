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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';
import '../nuxeo-document-preview.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';

{
  /**
   * A button element for show the preview of a document.
   *
   * Example:
   *
   *     <nuxeo-preview-button document="[[document]]"></nuxeo-preview-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-preview-button/index.html
   */
  class PreviewButton extends mixinBehaviors([I18nBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="nuxeo-action-button-styles">
      #close-icon {
        position: absolute;
        right: -12px;
        top: -12px;
        width: 25px;
        height: 25px;
        border: 1px solid rgba(0, 0, 0, 0.4);
        padding: 3px;
        background: var(--nuxeo-secondary-color);
        color: var(--nuxeo-button-primary-text);
      }

      #close-icon:hover {
        border-color: var(--nuxeo-primary-color);
      }

      nuxeo-dialog {
        width: 100%;
        height: 100%;
        min-width: 480px;
      }

      nuxeo-dialog > nuxeo-document-preview {
        height: 100%;
      }

      nuxeo-dialog > * {
        margin: 0;
        padding: 0;
      }

      nuxeo-dialog > nuxeo-document-preview ::slotted(audio) {
        height: 50%;
      }
    </style>

    <dom-if if="[[_isAvailable(document)]]">
      <template>
        <div class="action" on-click="_toggleDialog">
          <paper-icon-button icon="[[icon]]" noink=""></paper-icon-button>
          <span class="label" hidden\$="[[!showLabel]]">[[_label]]</span>
        </div>
        <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>

        <nuxeo-dialog on-iron-overlay-closed="_previewClosed" id="dialog" with-backdrop="">
          <template>
            <nuxeo-document-preview id="preview" document="[[document]]" xpath="[[xpath]]"></nuxeo-document-preview>
            <paper-icon-button id="close-icon" icon="nuxeo:clear" on-click="_toggleDialog" noink=""></paper-icon-button>
          </template>
        </nuxeo-dialog>
      </template>
    </dom-if>
`;
    }

    static get is() {
      return 'nuxeo-preview-button';
    }

    static get properties() {
      return {
        /**
         * Input document.
         */
        document: Object,

        /**
         * Path of the file object to preview.
         * For example `xpath="files:files/0/file"`.
         */
        xpath: {
          type: String,
          value: 'file:content',
        },

        /**
         * Icon to use (iconset_name:icon_name).
         */
        icon: {
          type: String,
          value: 'nuxeo:preview',
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

    _previewClosed() {
      this.$$('#preview').stop();
    }

    _isAvailable(document) {
      return !(this.hasFacet(document, 'Folderish') || this.hasFacet(document, 'Collection'));
    }

    _computeLabel() {
      return this.i18n('previewButton.tooltip');
    }

    _toggleDialog() {
      this.$$('#dialog').toggle();
    }
  }

  customElements.define(PreviewButton.is, PreviewButton);
  Nuxeo.PreviewButton = PreviewButton;
}
