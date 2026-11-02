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
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-toast/paper-toast.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import { escapeHTML } from './nuxeo-selectivity.js';

{
  /**
   * `nuxeo-tag-suggestion` allows selecting one or more tags.
   *
   *     <nuxeo-tag-suggestion document="[[document]]"
   *       placeholder="Search for Tags"
   *       value="{{tags}}" allow-new-tags>
   *     </nuxeo-tag-suggestion>
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-tag-suggestion/index.html
   */
  class TagSuggestion extends mixinBehaviors(
    [I18nBehavior, IronFormElementBehavior, IronValidatableBehavior],
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
          tagging$="[[allowNewTags]]"
          multiple
          params="[[params]]"
          placeholder="[[placeholder]]"
          error-message="[[errorMessage]]"
          readonly="[[readonly]]"
          value="{{value}}"
          selected-items="{{selectedItems}}"
          required="[[required]]"
          invalid="{{invalid}}"
          new-entry-formatter="[[newEntryFormatter]]"
          result-formatter="[[resultFormatter]]"
          added-entry-handler="[[addedTagHandler]]"
          removed-entry-handler="[[removedTagHandler]]"
          init-selection="[[initSelection]]"
          stay-open-on-select="[[stayOpenOnSelect]]"
        >
        </nuxeo-selectivity>

        <nuxeo-operation id="addTagOp" op="Services.TagDocument" input="[[document.uid]]"></nuxeo-operation>

        <nuxeo-operation id="removeTagOp" op="Services.UntagDocument" input="[[document.uid]]"></nuxeo-operation>

        <paper-toast id="toast"></paper-toast>
      `;
    }

    static get is() {
      return 'nuxeo-tag-suggestion';
    }

    static get properties() {
      return {
        /**
         * Label.
         */
        label: String,

        /**
         * Operation to call for suggestions.
         */
        operation: {
          type: String,
          value: 'Tag.Suggestion',
        },

        /**
         * Parameters for the operation.
         */
        params: Object,

        /**
         * The document to add / remove tags from.
         */
        document: {
          type: Object,
          observer: '_observeDocument',
        },

        /*
         * Set to true for allowing to add new tags.
         */
        allowNewTags: Boolean,

        /**
         * Selected value(s).
         */
        value: {
          type: String,
          notify: true,
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
          value: 1,
        },

        /**
         * Placeholder.
         */
        placeholder: String,

        /**
         * If true, the dropdown stays open after a selection is made.
         */
        stayOpenOnSelect: {
          type: Boolean,
          value: false,
        },

        /**
         * Error message to show when `invalid` is true.
         */
        errorMessage: String,

        /**
         * Selected items.
         */
        selectedItems: {
          type: Object,
          notify: true,
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
         * Formatter for initial selection.
         */
        initSelection: {
          type: Function,
          value() {
            return this._initSelection.bind(this);
          },
        },

        /**
         * Formatter for new suggested entries.
         */
        newEntryFormatter: {
          type: Function,
          value() {
            return this._newEntryFormatter.bind(this);
          },
        },

        /**
         * Handler called when a tag is added.
         */
        addedTagHandler: {
          type: Function,
          value() {
            return this._addedTagHandler.bind(this);
          },
        },

        /**
         * Handler called when a tag is removed.
         */
        removedTagHandler: {
          type: Function,
          value() {
            return this._removedTagHandler.bind(this);
          },
        },
      };
    }

    /* Override method from Polymer.IronValidatableBehavior. */
    _getValidity() {
      return this.$.s2._getValidity();
    }

    _resultFormatter(tag) {
      if (tag.newTag) {
        return `<span class='s2newTag'>+ ${escapeHTML(tag.displayLabel)}</span>`;
      }
      return `<span class='s2existingTag'>${escapeHTML(tag.displayLabel)}</span>`;
    }

    _newEntryFormatter(term) {
      term = term ? term.toLowerCase() : null;
      return { id: term, displayLabel: term, newTag: true };
    }

    _addedTagHandler(entry) {
      if (!this.document) {
        return;
      }
      // Pasting "a,b,c" adds several tags in the same tick: collect them and send a single request.
      if (!this._pendingAddedTags) {
        const entries = [];
        const doc = this.document;
        this._pendingAddedTags = entries;
        this._enqueueTagOp(() => {
          if (this._pendingAddedTags === entries) {
            this._pendingAddedTags = null;
          }
          return this._addTags(doc, entries);
        });
      }
      this._pendingAddedTags.push(entry);
    }

    _addTags(doc, entries) {
      this.$.addTagOp.input = doc.uid;
      this.$.addTagOp.params = { tags: entries.map((entry) => entry.id).join(',') };
      return this.$.addTagOp.execute().then((response) => {
        if (this.document === doc) {
          this._onTagsAdded(entries, response);
        }
      });
    }

    _onTagsAdded(entries, response) {
      if (!response || !response.properties || !Array.isArray(response.properties['nxtag:tags'])) {
        return;
      }
      const serverLabels = response.properties['nxtag:tags'].map((tag) => tag.label);
      const value = Array.isArray(this.$.s2.value) ? this.$.s2.value : [];
      const ids = new Set(entries.map((entry) => entry.id));
      const previousLabels = new Set(value.filter((id) => !ids.has(id)));
      // The server may sanitize a label, so a tag that is not returned as-is maps to the next label
      // this request added, in request order.
      const addedLabels = serverLabels.filter((label) => !previousLabels.has(label) && !ids.has(label));
      const labels = entries.map((entry) => {
        const label = serverLabels.includes(entry.id) ? entry.id : addedLabels.shift() || entry.id;
        entry.item.displayLabel = label;
        if (label !== entry.id) {
          const index = value.indexOf(entry.id);
          if (index !== -1) {
            value[index] = label;
          }
          this._relabelSelectedItem(entry.id, label);
        }
        return label;
      });
      this.$.toast.hide();
      this.$.toast.text =
        labels.length > 1
          ? this.i18n('tags.multipleAddedToDocument', labels.join(', '))
          : this.i18n('tags.addedToDocument', labels[0]);
      this.$.toast.open();
    }

    _relabelSelectedItem(id, label) {
      const selectivity = this.$.s2._selectivity;
      if (!selectivity || !selectivity.el) {
        return;
      }
      const item = Array.from(selectivity.el.querySelectorAll('.selectivity-multiple-selected-item')).find(
        (el) => el.dataset.itemId === id,
      );
      const textNode = item && item.childNodes[1];
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = label;
      }
    }

    _removedTagHandler(entry) {
      if (this.document) {
        const doc = this.document;
        // Tags added after this removal must be sent after it, so they start a new batch.
        this._pendingAddedTags = null;
        this._enqueueTagOp(() => {
          this.$.removeTagOp.input = doc.uid;
          this.$.removeTagOp.params = { tags: entry.id };
          return this.$.removeTagOp.execute().then(() => {
            this.$.toast.hide();
            this.$.toast.text = this.i18n('tags.removedFromDocument', entry.item.displayLabel);
            this.$.toast.open();
          });
        });
      }
    }

    // nuxeo-operation aborts its in-flight request on each execute(), so tag operations must run one at a time.
    // A failed operation is already reported by nuxeo-operation and must not block the next ones.
    _enqueueTagOp(op) {
      this._tagOpQueue = (this._tagOpQueue || Promise.resolve()).then(op).catch(() => {});
    }

    _initSelection(element, callback) {
      return callback(
        this.value.map((entry) => {
          return { id: entry, displayLabel: entry };
        }),
      );
    }

    _observeDocument() {
      if (this.document) {
        if (this.document.contextParameters && this.document.contextParameters.tags) {
          this.value = this.document.contextParameters.tags;
        } else {
          this.value = [];
          console.warn(
            'Cannot use nuxeo-tag-element on a document that has no tag in its contextParameters. ' +
              "Make sure you use the 'tags' enricher to fetch the document",
          );
        }
      } else {
        this.value = [];
      }
    }
  }

  customElements.define(TagSuggestion.is, TagSuggestion);
  Nuxeo.TagSuggestion = TagSuggestion;
}
