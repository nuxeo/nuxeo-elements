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
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import '@polymer/paper-card/paper-card.js';
import { escapeHTML } from './nuxeo-selectivity.js';
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
  class UserSuggestion extends mixinBehaviors([IronFormElementBehavior, IronValidatableBehavior], Nuxeo.Element) {
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

        <nuxeo-resource id="entityResource"></nuxeo-resource>
        <nuxeo-selectivity
          id="s2"
          operation="[[operation]]"
          label="[[label]]"
          min-chars="[[minChars]]"
          frequency="[[frequency]]"
          multiple="[[multiple]]"
          params="[[_computeParams(params.*, searchType, groupRestriction)]]"
          placeholder="[[placeholder]]"
          error-message="[[errorMessage]]"
          readonly="[[readonly]]"
          value="{{value}}"
          selected-items="{{selectedItems}}"
          selected-item="{{selectedItem}}"
          required="[[required]]"
          invalid="{{invalid}}"
          selection-formatter="[[selectionFormatter]]"
          result-formatter="[[resultFormatter]]"
          resolve-entry="[[resolveEntry]]"
          id-function="[[idFunction]]"
          query-results-filter="[[queryResultsFilter]]"
          stay-open-on-select="[[stayOpenOnSelect]]"
        >
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
         * Group ID to narrow the user suggestions.
         */
        groupRestriction: {
          type: String,
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
      return {
        searchType: this.searchType,
        groupRestriction: this.groupRestriction,
        ...this.params,
      };
    }

    _selectionFormatter(item) {
      let content;
      if (item) {
        if (
          item['entity-type'] === 'user' &&
          item.properties &&
          item.properties.firstName &&
          item.properties.lastName
        ) {
          content = `${item.properties.firstName} ${item.properties.lastName}`;
        } else if (item['entity-type'] === 'group') {
          content = item.grouplabel ? item.grouplabel : item.groupname;
        } else if (item.displayLabel) {
          content = item.displayLabel;
        } else {
          content = item.id ? item.id : item;
        }
      }
      return `<span class="preserve-white-space">${escapeHTML(content)}</span>`;
    }

    _resultFormatter(item) {
      if (item.type && (item.type === 'USER_TYPE' || item.type === 'GROUP_TYPE')) {
        return `<nuxeo-user-group-formatter entity='${escapeHTML(JSON.stringify(item))}'></nuxeo-user-group-formatter>`;
      }
      // fallback, if entities are not available
      return escapeHTML(item.displayLabel || item.title);
    }

    _resolveEntry(item) {
      if (item && item['entity-type']) {
        return item;
      }
      if (typeof item === 'string') {
        if (this._entityCache.get(item)) {
          return this._entityCache.get(item);
        }
        // the internal refresh below re-resolves every entry: do not start new lookups from it, otherwise a transient
        // failure next to a resolved id would loop (failed lookup -> refresh -> lookup ...)
        if (!this._hydrating) {
          this._scheduleLabelResolution();
        }
      }
      return this.prefixed ? { id: item, displayLabel: item, prefixed_id: item } : { id: item, displayLabel: item };
    }

    // Maps are used (rather than plain objects) so ids such as `constructor` are not mistaken for cached entries.
    get _entityCache() {
      if (!this.__entityCache) {
        this.__entityCache = new Map();
      }
      return this.__entityCache;
    }

    get _pendingIds() {
      if (!this.__pendingIds) {
        this.__pendingIds = new Set();
      }
      return this.__pendingIds;
    }

    // Ids handed to the widget (saved searches, layouts, URL params) are bare strings: look up the users / groups
    // once, in the background, and refresh the selection with the entities so their labels are displayed.
    _scheduleLabelResolution() {
      if (this._labelResolutionScheduled) {
        return;
      }
      this._labelResolutionScheduled = true;
      Promise.resolve()
        .then(() => {
          this._labelResolutionScheduled = false;
          return this._resolveLabels();
        })
        .catch(() => {});
    }

    _entityTypes(id) {
      if (this.prefixed) {
        if (id.startsWith('user:')) {
          return ['user'];
        }
        if (id.startsWith('group:')) {
          return ['group'];
        }
      }
      // honour `params.searchType`, which overrides the property in the suggestion query
      const { searchType } = this._computeParams();
      if (searchType === 'USER_TYPE') {
        return ['user'];
      }
      if (searchType === 'GROUP_TYPE') {
        return ['group'];
      }
      return ['user', 'group'];
    }

    _bareId(id) {
      return this.prefixed ? id.replace(/^(user|group):/, '') : id;
    }

    _entityPaths(id) {
      const bare = encodeURIComponent(this._bareId(id));
      return this._entityTypes(id).map((type) => `${type}/${bare}`);
    }

    // REST group entities may only expose `groupname`: make sure the entity carries the id it was requested with.
    _normalizeEntity(entity, id) {
      const normalized = entity.id
        ? entity
        : { ...entity, id: entity.groupname || entity.username || this._bareId(id) };
      return this.prefixed ? { ...normalized, prefixed_id: id } : normalized;
    }

    // `nuxeo-resource` aborts the previous request and reads `path` asynchronously, so lookups must never overlap.
    // Resolves with the entity, or null when it does not exist (404); rejects on transient failures so they are
    // retried on a later initialization instead of being cached.
    _fetchEntity(id) {
      const resource = this.$.entityResource;
      const lookup = async () => {
        let transient = false;
        for (const path of this._entityPaths(id)) {
          resource.path = path;
          try {
            const entity = await resource.get();
            if (entity) {
              return this._normalizeEntity(entity, id);
            }
          } catch (error) {
            if (!error || error.status !== 404) {
              transient = true;
            }
          }
        }
        if (transient) {
          throw new Error(`Unable to resolve ${id}`);
        }
        return null;
      };
      const result = (this._lookupQueue || Promise.resolve()).then(lookup);
      // keep the queue usable whatever the outcome of this lookup
      this._lookupQueue = result.catch(() => {});
      return result;
    }

    async _resolveLabels() {
      const ids = (Array.isArray(this.value) ? this.value : [this.value]).filter(
        (id) => typeof id === 'string' && id && !this._entityCache.has(id) && !this._pendingIds.has(id),
      );
      if (!ids.length) {
        return;
      }
      ids.forEach((id) => this._pendingIds.add(id));
      await Promise.all(
        ids.map(async (id) => {
          try {
            // null (unknown id, e.g. a deleted user) is cached: the id itself stays displayed
            this._entityCache.set(id, await this._fetchEntity(id));
          } catch (_e) {
            // transient failure: not cached, so the lookup is retried next time the value is set
          } finally {
            this._pendingIds.delete(id);
          }
        }),
      );
      this._hydrateSelection();
    }

    // Refresh the *current* selection (it may have changed while the lookups were pending) without marking the
    // form as dirty.
    _hydrateSelection() {
      const selectivity = this.$.s2 && this.$.s2._selectivity;
      const { value } = this;
      const ids = Array.isArray(value) ? value : [value];
      if (!selectivity || !ids.some((id) => this._entityCache.get(id))) {
        return;
      }
      // entries picked from the dropdown meanwhile are full entities that never went through the cache: keep them
      const current = new Map();
      const data = selectivity.getData();
      (Array.isArray(data) ? data : [data]).forEach((item) => {
        // dropdown results are wrapped by selectivity as { id, text, item: entity }
        const entity = item && item.item ? item.item : item;
        if (entity && entity['entity-type']) {
          current.set(this._idFunction(entity), entity);
        }
      });
      const hydrate = (id) => this._entityCache.get(id) || current.get(id) || id;
      const hydrated = Array.isArray(value) ? value.map(hydrate) : hydrate(value);
      this._hydrating = true;
      try {
        selectivity.setValue(hydrated, { triggerChange: false });
      } finally {
        this._hydrating = false;
      }
    }

    _idFunction(item) {
      if (this.prefixed) {
        return item.prefixed_id ? item.prefixed_id : `${item['entity-type']}:${item.id}`;
      }
      return item.id;
    }
  }

  customElements.define(UserSuggestion.is, UserSuggestion);
  Nuxeo.UserSuggestion = UserSuggestion;
}
