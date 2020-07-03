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
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { FormatBehavior } from '../nuxeo-format-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import { escapeHTML } from './nuxeo-selectivity.js';

{
  /**
   * An element for selecting one or more entries from a given directory.
   *
   *     <nuxeo-directory-suggestion directory-name="l10nsubjects"
   *                                 multiple="true"
   *                                 dbl10n="true"
   *                                 value="{{suggestions}}"></nuxeo-directory-suggestion>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FormatBehavior
   * @appliesMixin Polymer.IronFormElementBehavior
   * @appliesMixin Polymer.IronValidatableBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-directory-suggestion/index.html
   */
  class DirectorySuggestion extends mixinBehaviors(
    [I18nBehavior, FormatBehavior, IronFormElementBehavior, IronValidatableBehavior],
    Nuxeo.Element,
  ) {
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
          params="[[_computeParams(params.*, directoryName, dbl10n)]]"
          placeholder="[[placeholder]]"
          error-message="[[errorMessage]]"
          readonly="[[readonly]]"
          value="{{value}}"
          selected-items="{{selectedItems}}"
          selected-item="{{selectedItem}}"
          selection-formatter="[[selectionFormatter]]"
          required="[[required]]"
          invalid="[[invalid]]"
          resolve-entry="[[resolveEntry]]"
          stay-open-on-select="[[stayOpenOnSelect]]"
          id-function="[[idFunction]]"
          query-results-filter="[[queryResultsFilter]]"
        >
        </nuxeo-selectivity>
      `;
    }

    static get is() {
      return 'nuxeo-directory-suggestion';
    }

    static get properties() {
      return {
        /**
         * Name of the directory.
         */
        directoryName: {
          type: String,
        },

        /**
         * Checking this option means that the labels are localized with translations provided
         * in the directory itself (i.e. in fields). Otherwise labels are translated as usual
         * picking values in messages*.properties files.
         */
        dbl10n: { type: Boolean, value: false },

        /**
         * Label.
         */
        label: String,

        /**
         * In case of hierarchical vocabulary, if true, parent item can be selected.
         */
        canSelectParent: Boolean,

        /**
         * Operation to call for suggestions.
         */
        operation: {
          type: String,
          value: 'Directory.SuggestEntries',
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
         * Function used to get the id from the choice object.
         */
        idFunction: {
          type: Function,
          value() {
            return this._idFunction.bind(this);
          },
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
         * Separator used for hierachical vocabulary entry's label.
         */
        separator: {
          type: String,
          value: '/',
        },

        /**
         * Function that transforms the entries added using the value property into object
         */
        resolveEntry: {
          type: Function,
          value() {
            return this._resolveEntry.bind(this);
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
      return Object.assign(
        {},
        {
          directoryName: this.directoryName,
          dbl10n: this.dbl10n,
          canSelectParent: this.canSelectParent,
          localize: true,
          lang: window.nuxeo.I18n.language ? window.nuxeo.I18n.language.split('-')[0] : 'en',
        },
        this.params,
      );
    }

    _selectionFormatter(entry) {
      return escapeHTML(entry.absoluteLabel || entry.displayLabel);
    }

    _resolveEntry(entry) {
      const isEntity = entry && entry['entity-type'] && entry['entity-type'] === 'directoryEntry' && entry.properties;
      return {
        id: isEntity ? this.idFunction(entry) : entry,
        displayLabel: isEntity ? this.formatDirectory(entry, this.separator) : entry,
      };
    }

    _idFunction(item) {
      if (typeof item === 'string') {
        return item;
      }
      if (item.computedId) {
        return item.computedId;
      }
      let id = item.id || item.uid;
      // if the entry does not have a computedId but has a parent, then it must be part of the id as well
      const parent = item.properties && item.properties.parent;
      if (parent) {
        id = `${this._idFunction(parent)}/${id}`;
      }
      return id;
    }
  }

  customElements.define(DirectorySuggestion.is, DirectorySuggestion);
  Nuxeo.DirectorySuggestion = DirectorySuggestion;
}
