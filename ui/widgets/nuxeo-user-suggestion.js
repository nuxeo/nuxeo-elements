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
/*

*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-card/paper-card.js';
import './nuxeo-selectivity.js';
import './nuxeo-user-group-formatter.js';

{
  /**
   * `nuxeo-user-suggestion` allows selecting one or more users.
   *
   *     <nuxeo-user-suggestion search-type="GROUP_TYPE"
   *                            placeholder="Search for Groups"
   *                            value="{{groups}}"
   *                            multiple></nuxeo-user-suggestion>
   *
   * @appliesMixin Polymer.IronFormElementBehavior
   * @appliesMixin Polymer.IronValidatableBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-user-suggestion/index.html
   */
  class UserSuggestion
    extends mixinBehaviors([IronFormElementBehavior, IronValidatableBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none;
      }
    </style>

    <nuxeo-selectivity
      id="s2"
      operation="[[operation]]"
      label="[[label]]"
      min-chars="[[minChars]]"
      frequency="[[frequency]]"
      multiple="[[multiple]]"
      params="[[_computeParams(params.*, searchType)]]"
      placeholder="[[placeholder]]"
      error-message="[[errorMessage]]"
      readonly="[[readonly]]"
      value="{{value}}"
      selected-items="{{selectedItems}}"
      selected-item="{{selectedItem}}"
      required="[[required]]"
      invalid="[[invalid]]"
      selection-formatter="[[selectionFormatter]]"
      result-formatter="[[resultFormatter]]"
      resolve-entry="[[resolveEntry]]"
      id-function="[[idFunction]]"
      query-results-filter="[[queryResultsFilter]]"
      stay-open-on-select="[[stayOpenOnSelect]]">
    </nuxeo-selectivity>
`;
    }

    static get is() {
      return 'nuxeo-user-suggestion';
    }

    static get properties() {
      return {
        // USER_TYPE or GROUP_TYPE or USER_GROUP_TYPE
        searchType: {
          type: String,
          value: 'USER_GROUP_TYPE',
        },

        /**
         * Label.
         */
        label: String,

        /**
         * Operation to call for suggestions.
         */
        operation: {
          type: String,
          value: 'UserGroup.Suggestion',
        },

        /**
         * Parameters for the operation.
         */
        params: Object,

        /**
         * Selected value(s).
         */
        value: {
          type: String,
          notify: true,
        },

        /**
         * Set to `true` to allow multiple selection.
         */
        multiple: {
          type: Boolean,
          value: false,
        },

        /**
         * If true, the dropdown stays open after a selection is made.
         */
        stayOpenOnSelect: {
          type: Boolean,
          value: false,
        },

        /**
         * Set to `true` for read only mode.
         */
        readonly: {
          type: Boolean,
          value: false,
        },

        /**
         * Minimum number of chars to trigger the suggestions.
         */
        minChars: {
          type: Number,
          value: 3,
        },

        /**
         * Time in ms used to debounce requests.
         */
        frequency: Number,

        /**
         * Placeholder.
         */
        placeholder: String,

        /**
         * Error message to show when `invalid` is true.
         */
        errorMessage: String,

        /**
         * Selected items.
         */
        selectedItems: {
          type: Array,
          notify: true,
        },

        /**
         * Selected item.
         */
        selectedItem: {
          type: Object,
          notify: true,
        },

        /**
         * Formatter for a selected entry.
         */
        selectionFormatter: {
          type: Function,
          value() {
            return this._selectionFormatter.bind(this);
          },
        },

        /**
         * Formatter for suggested entries.
         */
        resultFormatter: {
          type: Function,
          value() {
            return this._resultFormatter.bind(this);
          },
        },

        /**
         * Function that transforms entries added to the element using the `value` property into objects.
         */
        resolveEntry: {
          type: Function,
          value() {
            return this._resolveEntry.bind(this);
          },
        },

        /**
         * Set to true to submit ids prefixed with "user:" or "group:".
         */
        prefixed: Boolean,

        idFunction: {
          type: Function,
          value() {
            return this._idFunction.bind(this);
          },
        },

        /**
         * Results filtering function (optional).
         */
        queryResultsFilter: Function,
      };
    }

    /* Override method from Polymer.IronValidatableBehavior. */
    _getValidity() {
      return this.$.s2._getValidity();
    }

    _computeParams() {
      return Object.assign({}, {
        searchType: this.searchType,
      }, this.params);
    }

    _selectionFormatter(item) {
      if (item) {
        switch (item['entity-type']) {
          case 'user':
            if (item.properties && item.properties.firstName && item.properties.lastName) {
              return `${item.properties.firstName} ${item.properties.lastName}`;
            }
            return item.id;
          case 'group':
            return item.grouplabel ? item.grouplabel : item.groupname;
          default:
            if (item.displayLabel) {
              return item.displayLabel;
            } else {
              return item.id ? item.id : item;
            }
        }
      }
    }

    _resultFormatter(item) {
      if (item.type && (item.type === 'USER_TYPE' || item.type === 'GROUP_TYPE')) {
        return `<nuxeo-user-group-formatter entity='${JSON.stringify(item)}'></nuxeo-user-group-formatter>`;
      }
      // fallback, if entities are not available
      return item.displayLabel || item.title;
    }

    _resolveEntry(item) {
      if (item && item['entity-type']) {
        return item;
      } else {
        return this.prefixed
          ? { id: item, displayLabel: item, prefixed_id: item }
          : { id: item, displayLabel: item };
      }
    }

    _idFunction(item) {
      if (this.prefixed) {
        return item.prefixed_id ? item.prefixed_id : `${item['entity-type']}:${item.id}`;
      } else {
        return item.id;
      }
    }
  }

  customElements.define(UserSuggestion.is, UserSuggestion);
  Nuxeo.UserSuggestion = UserSuggestion;
}
