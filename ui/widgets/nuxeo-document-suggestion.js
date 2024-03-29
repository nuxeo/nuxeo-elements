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
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { RoutingBehavior } from '../nuxeo-routing-behavior.js';
import { escapeHTML } from './nuxeo-selectivity.js';

{
  /**
   * An element for selecting one or more documents.
   *
   *     <nuxeo-document-suggestion></nuxeo-document-suggestion>
   *
   * @appliesMixin Polymer.IronFormElementBehavior
   * @appliesMixin Polymer.IronValidatableBehavior
   * @appliesMixin Nuxeo.RoutingBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-document-suggestion/index.html
   */
  class DocumentSuggestion extends mixinBehaviors(
    [IronFormElementBehavior, IronValidatableBehavior, RoutingBehavior],
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

        <nuxeo-operation id="op" op="Document.FetchByProperty"></nuxeo-operation>

        <nuxeo-selectivity
          id="s2"
          operation="[[operation]]"
          label="[[label]]"
          min-chars="[[minChars]]"
          frequency="[[frequency]]"
          multiple="[[multiple]]"
          params="[[_computeParams(params.*, pageProvider, schemas, repository)]]"
          placeholder="[[placeholder]]"
          error-message="[[errorMessage]]"
          readonly="[[readonly]]"
          value="{{value}}"
          selected-items="{{selectedItems}}"
          selected-item="{{selectedItem}}"
          selection-formatter="[[selectionFormatter]]"
          result-formatter="[[resultFormatter]]"
          required="[[required]]"
          invalid="[[invalid]]"
          init-selection="[[initSelection]]"
          id-function="[[_idFunction]]"
          stay-open-on-select="[[stayOpenOnSelect]]"
          headers="[[headers]]"
          enrichers="[[enrichers]]"
          query-results-filter="[[queryResultsFilter]]"
        >
        </nuxeo-selectivity>
      `;
    }

    static get is() {
      return 'nuxeo-document-suggestion';
    }

    static get properties() {
      return {
        /**
         * Page provider to use for looking up suggestions.
         */
        pageProvider: {
          type: String,
          value: 'default_document_suggestion',
        },

        /**
         * Document schemas.
         */
        schemas: {
          type: Array,
          value: ['*'],
        },

        /**
         * Repository.
         */
        repository: {
          type: String,
          value: 'default',
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
          value: 'Repository.PageProvider',
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
         * Name of the Document property that should be used
         * to define the ID of entry.
         * */
        idProperty: {
          type: String,
          value: 'ecm:uuid',
        },

        /**
         * Fixed query part for querying documents
         */
        query: {
          type: String,
          value: null,
        },

        /**
         * Function used to get the id from the choice document.
         */
        _idFunction: {
          type: Function,
          value() {
            return this._docIdFunction.bind(this);
          },
        },

        /**
         * Formatter for initial selection.
         */
        initSelection: {
          type: Function,
          value() {
            return this._initSelection.bind(this);
          },
        },

        /**
         * The `content enricher` of the operation.
         */
        enrichers: {
          type: String,
          value: '',
        },

        /**
         *  The headers of the request.
         */
        headers: {
          type: Object,
          value: null,
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
          documentSchemas: this.schemas,
          repository: this.repository,
          providerName: this.pageProvider,
          pageProviderName: this.pageProvider,
          page: 0,
          pageSize: 20,
        },
        this.params,
      );
    }

    _selectionFormatter(doc) {
      if (typeof doc === 'string') {
        return `<span>${escapeHTML(doc)}</span>`;
      }
      return `<a href="${this.urlFor(doc)}">${escapeHTML(doc.title)}</a>`;
    }

    _resultFormatter(doc) {
      return `${escapeHTML(doc.title)}<br/>${escapeHTML(doc.path)}`;
    }

    _initSelection(element, callback) {
      if (element) {
        const hasUnknownFormatEntries = this.multiple
          ? element.some((e) => typeof e !== 'string' && typeof e !== 'object' && !e.title)
          : typeof element !== 'string' && typeof element !== 'object' && !element.title;
        const hasOnlyIdReferences = this.multiple
          ? element.length > 0 && element.every((e) => typeof e === 'string' && e.length > 0)
          : typeof element === 'string' && element.length > 0;
        if (!hasUnknownFormatEntries && hasOnlyIdReferences) {
          return this._resolveDocs(element, callback);
        }
        if (!hasUnknownFormatEntries && !hasOnlyIdReferences) {
          return callback(element);
        }
        console.warn('Unable to resolve such entry. Write your own resolver');
      }
    }

    _resolveDocs(docs, callback) {
      this.$.op.params = {
        values: docs,
        property: this.idProperty,
        query: this.query,
      };
      this.$.op.execute().then((res) => {
        if (this.multiple) {
          /**
           * XXX
           * When a user does not have permissions to see a document
           * the operation will not return that document (ELEMENTS-897)
           */
          if (res.entries.length < docs.length) {
            const reconciliatedArray = docs.map((element) => {
              const doc = res.entries.find((entry) => this._idFunction(entry) === element);
              return doc || element;
            });
            callback(reconciliatedArray);
          } else {
            callback(res.entries);
          }
        } else {
          callback(res.entries.length > 0 ? res.entries[0] : docs);
        }
      });
    }

    _docIdFunction(doc) {
      if (typeof doc === 'string') {
        return doc;
      }
      if (this.idProperty === 'ecm:uuid') {
        return doc.uid;
      }
      if (this.idProperty === 'ecm:path') {
        return doc.path;
      }
      return doc.properties[this.idProperty];
    }
  }

  customElements.define(DocumentSuggestion.is, DocumentSuggestion);
  Nuxeo.DocumentSuggestion = DocumentSuggestion;
}
