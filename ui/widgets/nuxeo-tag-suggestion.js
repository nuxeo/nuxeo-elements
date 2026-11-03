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
import '@nuxeo/nuxeo-elements/nuxeo-document.js';
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

        <nuxeo-document id="tagsDoc" enrichers="tags" schemas="dublincore"></nuxeo-document>

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
      // A batch belongs to one document, so a tag added after switching documents starts a new one.
      const doc = this.document;
      let batch = this._pendingAddBatch;
      if (!batch || batch.doc.uid !== doc.uid) {
        batch = { doc, entries: [] };
        this._pendingAddBatch = batch;
        this._enqueueTagOp(() => {
          if (this._pendingAddBatch === batch) {
            this._pendingAddBatch = null;
          }
          return this._addTags(batch.doc, batch.entries);
        });
      }
      batch.entries.push(entry);
    }

    _addTags(doc, entries) {
      this.$.addTagOp.input = doc.uid;
      this.$.addTagOp.params = { tags: entries.map((entry) => entry.id).join(',') };
      return this.$.addTagOp.execute().then(
        (response) => {
          const tags = response && response.properties && response.properties['nxtag:tags'];
          if (!Array.isArray(tags)) {
            this._uncertainTags.add(doc.uid);
            return;
          }
          const labels = tags.map((tag) => tag.label);
          this._serverTags.set(doc.uid, new Set(labels));
          if (this._isCurrentDocument(doc)) {
            const added = entries.map((entry) => this._getStoredLabel(entry.id, labels));
            this._showToast(
              added.length > 1
                ? this.i18n('tags.multipleAddedToDocument', added.join(', '))
                : this.i18n('tags.addedToDocument', added[0]),
            );
          }
        },
        () => {
          this._uncertainTags.add(doc.uid);
          if (this._isCurrentDocument(doc)) {
            this._showToast(this.i18n('tags.addToDocumentFailed', entries.map((entry) => entry.id).join(', ')));
          }
        },
      );
    }

    _removedTagHandler(entry) {
      if (!this.document) {
        return;
      }
      const doc = this.document;
      // Tags added after this removal must be sent after it, so they start a new batch.
      this._pendingAddBatch = null;
      this._enqueueTagOp(() => {
        this.$.removeTagOp.input = doc.uid;
        this.$.removeTagOp.params = { tags: entry.id };
        return this.$.removeTagOp.execute().then(
          () => {
            // The response has no body: the server removed the cleaned form of the label. Only a label that is its
            // own cleaned form tells for sure which tag that was; otherwise the tags are read again.
            const tags = this._serverTags.get(doc.uid);
            if (tags) {
              tags.delete(this._getStoredLabel(entry.id, [...tags]));
            }
            const forms = this._getLabelForms(entry.id);
            if (!tags || forms.size > 1 || !forms.has(entry.id)) {
              this._uncertainTags.add(doc.uid);
            }
            if (this._isCurrentDocument(doc)) {
              this._showToast(this.i18n('tags.removedFromDocument', entry.item.displayLabel));
            }
          },
          () => {
            this._uncertainTags.add(doc.uid);
            if (this._isCurrentDocument(doc)) {
              this._showToast(this.i18n('tags.removeFromDocumentFailed', entry.item.displayLabel));
            }
          },
        );
      });
    }

    _isCurrentDocument(doc) {
      return !!this.document && this.document.uid === doc.uid;
    }

    _showToast(text) {
      this.$.toast.hide();
      this.$.toast.text = text;
      this.$.toast.open();
    }

    /**
     * The tags on the server as far as the widget knows, per document: from the tags enricher, then every add
     * response and successful removal; a failed operation leaves them unchanged. After a failure or anything unclear,
     * the document is marked uncertain and its tags are read again from the server once no operation is left.
     */
    get _serverTags() {
      if (!this.__serverTags) {
        this.__serverTags = new Map();
      }
      return this.__serverTags;
    }

    get _uncertainTags() {
      if (!this.__uncertainTags) {
        this.__uncertainTags = new Set();
      }
      return this.__uncertainTags;
    }

    /**
     * Returns the label the server stored for a tag. The server lowercases the label and, when tag sanitization is
     * enabled, removes spaces, "/", "\", "'" and "%" (see AbstractTagService#cleanLabel), so the stored label is one
     * of a few known forms of the tag and several tags can share it. The tag keeps its label when it was stored as-is,
     * when no form was returned, or when more than one form was returned and the stored one cannot be told apart.
     */
    _getStoredLabel(id, serverLabels) {
      if (serverLabels.includes(id)) {
        return id;
      }
      const stored = [...this._getLabelForms(id)].filter((label) => serverLabels.includes(label));
      return stored.length === 1 ? stored[0] : id;
    }

    // The labels the server may store for a tag, depending on whether sanitization and wildcards are enabled.
    _getLabelForms(id) {
      const lowerCase = String(id).toLowerCase();
      const withoutPercent = lowerCase.replaceAll('%', '');
      return new Set([
        lowerCase,
        withoutPercent,
        lowerCase.replace(/[ /\\']/g, ''),
        withoutPercent.replace(/[ /\\']/g, ''),
      ]);
    }

    /*
     * nuxeo-operation aborts its in-flight request on each execute(), so tag operations run one at a time. The chips
     * are updated optimistically while the user edits; once no operation is left, they are set to the tags the server
     * actually has, whatever order the edits, failures and label sanitization happened in.
     */
    _enqueueTagOp(op) {
      this._pendingTagOps = (this._pendingTagOps || 0) + 1;
      this._tagOpQueue = (this._tagOpQueue || Promise.resolve())
        .then(op)
        .catch(() => {})
        .then(() => {
          this._pendingTagOps -= 1;
          return this._pendingTagOps === 0 ? this._syncTags() : undefined;
        })
        .catch(() => {});
    }

    _syncTags() {
      const doc = this.document;
      if (!doc) {
        return undefined;
      }
      const showKnownTags = () => {
        const known = this._serverTags.get(doc.uid);
        // A tag edited meanwhile is synchronized once its own operation completes.
        if (known && !this._pendingTagOps && this._isCurrentDocument(doc)) {
          this._showServerTags([...known]);
        }
      };
      if (!this._uncertainTags.has(doc.uid)) {
        showKnownTags();
        return undefined;
      }
      this.$.tagsDoc.docId = doc.uid;
      return this.$.tagsDoc.get().then(
        (fetched) => {
          const tags = fetched && fetched.contextParameters && fetched.contextParameters.tags;
          if (Array.isArray(tags) && !this._pendingTagOps) {
            this._serverTags.set(doc.uid, new Set(tags));
            this._uncertainTags.delete(doc.uid);
          }
          showKnownTags();
        },
        // The tags could not be read: show the ones the widget knows, which leave out the failed changes.
        showKnownTags,
      );
    }

    // Shows the server tags, keeping the order of the chips; tags stored under the same label are shown once.
    _showServerTags(labels) {
      const current = this.value || [];
      const shown = current.map((id) => this._getStoredLabel(id, labels)).filter((id) => labels.includes(id));
      const value = [...new Set([...shown, ...labels])];
      if (value.length !== current.length || value.some((id, index) => id !== current[index])) {
        this.value = value;
      }
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
          const { uid } = this.document;
          if (!this._pendingTagOps || !this._serverTags.has(uid)) {
            this._serverTags.set(uid, new Set(this.document.contextParameters.tags));
          }
          if (this._pendingTagOps) {
            // The document may have been read before the pending tag operations completed.
            this._uncertainTags.add(uid);
          } else {
            this._uncertainTags.delete(uid);
          }
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
