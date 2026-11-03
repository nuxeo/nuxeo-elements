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
      // A batch belongs to one document, so a tag added after switching documents starts a new one.
      const doc = this.document;
      entry.revision = this._nextTagRevision(doc.uid, entry.id);
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
            return;
          }
          const labels = tags.map((tag) => tag.label);
          this._storedTags.set(doc.uid, new Set(labels));
          if (this._isCurrentDocument(doc)) {
            this._onTagsAdded(doc, entries, labels);
          }
        },
        () => {
          // Remove the chips of the tags that were not saved, unless the user edited them again meanwhile. Only a
          // chip whose own label is on the server is kept: "my tag" is not saved just because "mytag" exists.
          if (this._isCurrentDocument(doc)) {
            const stored = this._storedTags.get(doc.uid);
            const ids = new Set(
              entries
                .filter((entry) => this._isLatestTagEdit(doc.uid, entry) && !(stored && stored.has(entry.id)))
                .map((entry) => entry.id),
            );
            this.value = (this.value || []).filter((id) => !ids.has(id));
            this._showToast(this.i18n('tags.addToDocumentFailed', entries.map((entry) => entry.id).join(', ')));
          }
        },
      );
    }

    /*
     * The tags known to be on the server, per document: the tags enricher, then every add response and successful
     * removal. A failed operation only rolls its chip back when the server state is known and no later edit of the
     * same tag is queued, since that edit decides what the server ends up with.
     */
    get _storedTags() {
      if (!this.__storedTags) {
        this.__storedTags = new Map();
      }
      return this.__storedTags;
    }

    // The label under which the server is known to keep this tag, if any.
    _getStoredTag(uid, entry) {
      const stored = this._storedTags.get(uid);
      if (!stored) {
        return null;
      }
      const label = [entry.id, entry.item.displayLabel]
        .map((id) => this._getStoredLabel(id, [...stored]))
        .find((id) => stored.has(id));
      return label || null;
    }

    _nextTagRevision(uid, id) {
      if (!this._tagRevisions) {
        this._tagRevisions = new Map();
      }
      const key = `${uid}\u0000${id}`;
      const revision = (this._tagRevisions.get(key) || 0) + 1;
      this._tagRevisions.set(key, revision);
      return revision;
    }

    _isLatestTagEdit(uid, entry) {
      return !!this._tagRevisions && this._tagRevisions.get(`${uid}\u0000${entry.id}`) === entry.revision;
    }

    _isCurrentDocument(doc) {
      return !!this.document && this.document.uid === doc.uid;
    }

    _showToast(text) {
      this.$.toast.hide();
      this.$.toast.text = text;
      this.$.toast.open();
    }

    _onTagsAdded(doc, entries, serverLabels) {
      const renamed = new Map();
      const labels = entries.map((entry) => {
        const label = this._getStoredLabel(entry.id, serverLabels);
        entry.item.displayLabel = label;
        // A chip re-added after this request was sent belongs to the newer edit, which renames it when it is saved.
        if (label !== entry.id && this._isLatestTagEdit(doc.uid, entry)) {
          renamed.set(entry.id, label);
        }
        return label;
      });
      if (renamed.size > 0) {
        // Show the tags as the server stored them. Setting the value rebuilds the chips, so their ids are the stored
        // labels used by later operations; tags stored under the same label are shown once, as on the server.
        const value = (this.value || []).map((id) => renamed.get(id) || id);
        this.value = value.filter((id, index) => value.indexOf(id) === index);
      }
      this._showToast(
        labels.length > 1
          ? this.i18n('tags.multipleAddedToDocument', labels.join(', '))
          : this.i18n('tags.addedToDocument', labels[0]),
      );
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
      const lowerCase = String(id).toLowerCase();
      const withoutPercent = lowerCase.replaceAll('%', '');
      const forms = new Set([
        lowerCase,
        withoutPercent,
        lowerCase.replace(/[ /\\']/g, ''),
        withoutPercent.replace(/[ /\\']/g, ''),
      ]);
      const stored = [...forms].filter((label) => serverLabels.includes(label));
      return stored.length === 1 ? stored[0] : id;
    }

    _removedTagHandler(entry) {
      if (this.document) {
        const doc = this.document;
        const removal = { id: entry.id, item: entry.item, revision: this._nextTagRevision(doc.uid, entry.id) };
        // Tags added after this removal must be sent after it, so they start a new batch.
        this._pendingAddBatch = null;
        this._enqueueTagOp(() => {
          this.$.removeTagOp.input = doc.uid;
          this.$.removeTagOp.params = { tags: entry.id };
          return this.$.removeTagOp.execute().then(
            () => {
              const stored = this._storedTags.get(doc.uid);
              const storedTag = this._getStoredTag(doc.uid, removal);
              if (stored && storedTag) {
                stored.delete(storedTag);
              }
              this._showToast(this.i18n('tags.removedFromDocument', entry.item.displayLabel));
            },
            () => {
              // Show the chip again if the tag is known to still be on the server and was not edited again meanwhile.
              if (this._isCurrentDocument(doc)) {
                const value = this.value || [];
                const storedTag = this._isLatestTagEdit(doc.uid, removal) && this._getStoredTag(doc.uid, removal);
                if (storedTag && !value.includes(storedTag)) {
                  this.value = [...value, storedTag];
                }
                this._showToast(this.i18n('tags.removeFromDocumentFailed', entry.item.displayLabel));
              }
            },
          );
        });
      }
    }

    // nuxeo-operation aborts its in-flight request on each execute(), so tag operations must run one at a time.
    // Each operation handles its own failure; an unexpected error must not block the next ones.
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
          this._storedTags.set(this.document.uid, new Set(this.document.contextParameters.tags));
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
