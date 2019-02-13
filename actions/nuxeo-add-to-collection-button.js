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
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-selectivity.js';
import '../widgets/nuxeo-textarea.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';

{
  /**
   * A button element for adding a document to a collection
   *
   * Example:
   *
   *     <nuxeo-add-to-collection-button document="[[document]]"></nuxeo-add-to-collection-button>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-add-to-collection-button/index.html
   */
  class AddToCollectionButton
    extends mixinBehaviors([I18nBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="nuxeo-action-button-styles">
      /* Fix known stacking issue in iOS (NXP-24600)
         https://github.com/PolymerElements/paper-dialog-scrollable/issues/72 */
      paper-dialog-scrollable {
        --paper-dialog-scrollable: {
          -webkit-overflow-scrolling: auto;
        };
      }
    </style>

    <nuxeo-operation id="addToCollectionOp" op="Document.AddToCollection" input="[[document.uid]]"></nuxeo-operation>
    <nuxeo-operation id="createCollectionOp" op="Collection.Create"></nuxeo-operation>

    <dom-if if="[[_isAvailable(document)]]">
      <template>
        <div class="action" on-click="_toggleDialog">
          <paper-icon-button icon="[[icon]]" noink=""></paper-icon-button>
          <span class="label" hidden\$="[[!showLabel]]">[[_label]]</span>
        </div>
        <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
      </template>
    </dom-if>

    <nuxeo-dialog id="add-to-collection-dialog" with-backdrop="" on-iron-overlay-closed="_resetPopup" no-auto-focus="">
      <h2>[[i18n('addToCollectionButton.dialog.heading')]]</h2>
      <paper-dialog-scrollable>
        <nuxeo-selectivity
          id="nxSelect"
          label="[[i18n('addToCollectionButton.dialog.collections')]]"
          required
          operation="Collection.Suggestion"
          min-chars="0"
          placeholder="[[i18n('addToCollectionButton.dialog.select')]]"
          value="{{collection}}"
          tagging="true"
          query-results-filter="[[resultsFilter]]"
          result-formatter="[[resultFormatter]]"
          selection-formatter="[[selectionFormatter]]"
          new-entry-formatter="[[newEntryFormatter]]">
        </nuxeo-selectivity>
        <nuxeo-textarea
          label="[[i18n('addToCollectionButton.dialog.description')]]"
          value="{{description::input}}"
          hidden\$="[[!_isNew(collection)]]">
        </nuxeo-textarea>
      </paper-dialog-scrollable>
      <div class="buttons">
        <paper-button dialog-dismiss>[[i18n('addToCollectionButton.dialog.cancel')]]</paper-button>
        <paper-button dialog-confirm class="primary" name="add" on-click="_add" disabled\$="[[!_isValid(collection)]]">
          [[i18n('addToCollectionButton.dialog.add')]]
        </paper-button>
      </div>
    </nuxeo-dialog>
`;
    }

    static get is() {
      return 'nuxeo-add-to-collection-button';
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
          value: 'nuxeo:collections',
        },

        collection: {
          type: String,
          value: '',
        },

        resultsFilter: {
          type: Function,
          value() {
            return this._resultsFilter.bind(this);
          },
        },

        resultFormatter: {
          type: Function,
          value() {
            return this._resultFormatter.bind(this);
          },
        },

        selectionFormatter: {
          type: Function,
          value() {
            return this._selectionFormatter.bind(this);
          },
        },

        newEntryFormatter: {
          type: Function,
          value() {
            return this._newEntryFormatter.bind(this);
          },
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
      return this.isCollectionMember(doc);
    }

    _computeLabel() {
      return this.i18n('addToCollectionButton.tooltip');
    }

    _toggleDialog() {
      this.$['add-to-collection-dialog'].toggle();
    }

    _add() {
      if (this._isNew()) {
        const op = this.$$('#createCollectionOp');
        // XXX
        const name = this.$.nxSelect.selectedItem.displayLabel;
        op.params = {
          name,
          description: this.description,
        };
        return op.execute().then((response) => {
          this.collection = response.uid;
          this._addToCollection();
        });
      } else {
        this._addToCollection();
      }
    }

    _addToCollection() {
      const op = this.$$('#addToCollectionOp');
      op.params = {
        collection: this.collection,
      };
      return op.execute().then(() => {
        this.dispatchEvent(new CustomEvent('added-to-collection', {
          composed: true,
          bubbles: true,
          detail: { docId: this.document.uid, collectionId: this.collection },
        }));
        this._resetPopup();
      });
    }

    _resultsFilter(entry) {
      return entry.id.indexOf('-999999') === -1;
    }

    _resultFormatter(item) {
      const label = item.displayLabel || item.title;

      // if we are adding a new entry with the _newEntryFormatter we don't want to escape the HTML
      return item.id === -1 ? `<iron-icon icon="nuxeo:add" item-icon></iron-icon>${label}`
        : this.$.nxSelect.escapeHTML(label);
    }

    _selectionFormatter(item) {
      const label = item.displayLabel || item.title;

      // if we are adding a new entry with the _newEntryFormatter we don't want to escape the HTML
      return item.id === -1 ? label : this.$.nxSelect.escapeHTML(label);
    }

    _newEntryFormatter(term) {
      return { id: -1, displayLabel: term };
    }

    _isValid() {
      return this.collection !== '';
    }

    _isNew() {
      return this.collection === -1;
    }

    _resetPopup() {
      this.set('collection', null);
      this.description = '';
    }
  }

  customElements.define(AddToCollectionButton.is, AddToCollectionButton);
  Nuxeo.AddToCollectionButton = AddToCollectionButton;
}
