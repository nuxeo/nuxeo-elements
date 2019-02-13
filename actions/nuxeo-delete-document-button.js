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
   * A button element for moving document to trash (if available server side) or permanently delete if hard set to true.
   *
   * Example:
   *
   *     <nuxeo-delete-document-button document="[[document]]"></nuxeo-delete-document-button>
   *
   *     <nuxeo-delete-document-button document="[[document]]" hard></nuxeo-delete-document-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-delete-document-button/index.html
   */
  class DeleteDocumentButton
    extends mixinBehaviors([I18nBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="nuxeo-action-button-styles"></style>

    <nuxeo-operation id="deleteOp" op="Document.Delete" input="[[document.uid]]" sync-indexing=""></nuxeo-operation>

    <nuxeo-operation id="trashOp" op="Document.Trash" input="[[document.uid]]" sync-indexing=""></nuxeo-operation>

    <dom-if if="[[_isAvailable(document)]]">
      <template>
        <div class="action" on-click="_delete">
          <paper-icon-button icon="[[icon]]" noink="" id="deleteButton"></paper-icon-button>
          <span class="label" hidden\$="[[!showLabel]]">[[_label]]</span>
        </div>
        <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
      </template>
    </dom-if>
`;
    }

    static get is() {
      return 'nuxeo-delete-document-button';
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
          value: 'nuxeo:delete',
          computed: '_computeIcon(hard)',
        },

        /**
         * Permanently delete the document.
         */
        hard: {
          type: Boolean,
          value: false,
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
          computed: '_computeLabel(hard, i18n)',
        },
      };
    }

    _isAvailable(doc) {
      return doc && !this.isVersion(doc) && this.hasPermission(doc, 'Write') && (!this.isTrashed(doc) || this.hard);
    }

    _computeIcon(hard) {
      return hard ? 'nuxeo:delete-permanently' : 'nuxeo:delete';
    }

    _computeLabel(hard) {
      return this.i18n(hard ? 'deleteButton.tooltip.permanently' : 'deleteButton.tooltip');
    }

    _delete() {
      if (!confirm(this.i18n('deleteButton.confirm'))) {
        return;
      }
      const op = this.hard ? this.$.deleteOp : this.$.trashOp;
      op.execute().then(() => {
        this.dispatchEvent(new CustomEvent('document-deleted', {
          composed: true,
          bubbles: true,
          detail: { doc: this.document },
        }));
      }).catch((error) => {
        this.dispatchEvent(new CustomEvent('document-deleted', {
          composed: true,
          bubbles: true,
          detail: { doc: this.document, error },
        }));
      });
    }
  }

  customElements.define(DeleteDocumentButton.is, DeleteDocumentButton);
  Nuxeo.DeleteDocumentButton = DeleteDocumentButton;
}
