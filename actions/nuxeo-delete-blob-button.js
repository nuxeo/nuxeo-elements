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
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';

{
  /**
   * A button element for deleting a file blob from a document.
   *
   * Example:
   *
   *     <nuxeo-delete-blob-button document="[[document]]"></nuxeo-delete-blob-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-delete-blob-button/index.html
   */
  class DeleteBlobButton extends mixinBehaviors([I18nBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="nuxeo-action-button-styles"></style>

    <nuxeo-operation id="operation" op="Blob.RemoveFromDocument" input="[[document.uid]]" params="[[_params(xpath)]]">
    </nuxeo-operation>

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
      <h2>[[i18n('deleteBlobButton.dialog.heading')]]</h2>
      <div>[[i18n('deleteBlobButton.dialog.message')]]</div>
      <div class="buttons">
        <paper-button dialog-dismiss="">[[i18n('deleteBlobButton.dialog.no')]]</paper-button>
        <paper-button dialog-confirm="" on-click="_remove">[[i18n('deleteBlobButton.dialog.yes')]]</paper-button>
      </div>
    </nuxeo-dialog>
`;
    }

    static get is() {
      return 'nuxeo-delete-blob-button';
    }

    static get properties() {
      return {
        /**
         * Input document.
         */
        document: Object,

        /**
         * Path of the file object to delete.
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
          value: 'nuxeo:remove',
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

    _isAvailable(doc) {
      return doc && this.hasPermission(doc, 'Write') && !this.isImmutable(doc) &&
          !this.hasType(doc, 'Root') && !this.isTrashed(doc);
    }

    _computeLabel() {
      return this.i18n('deleteBlobButton.tooltip');
    }

    _toggleDialog() {
      this.$.dialog.toggle();
    }

    _params(xpath) {
      return {
        xpath: xpath.startsWith('files:') ? xpath.split('/file')[0] : xpath,
      };
    }

    _remove() {
      this.$.operation.execute().then(() => {
        this.dispatchEvent(new CustomEvent('file-deleted', {
          composed: true,
          bubbles: true,
        }));
      });
    }
  }

  customElements.define(DeleteBlobButton.is, DeleteBlobButton);
  Nuxeo.DeleteBlobButton = DeleteBlobButton;
}
