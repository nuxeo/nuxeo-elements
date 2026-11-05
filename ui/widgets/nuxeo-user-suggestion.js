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
      const cached = typeof item === 'string' ? this._entityCache[item] : null;
      if (cached) {
        return cached;
      }
      if (typeof item === 'string') {
        this._scheduleLabelResolution();
      }
      return this.prefixed ? { id: item, displayLabel: item, prefixed_id: item } : { id: item, displayLabel: item };
    }

    get _entityCache() {
      if (!this.__entityCache) {
        this.__entityCache = {};
      }
      return this.__entityCache;
    }

    // Ids handed to the widget (saved searches, layouts, URL params) are bare strings: look up the users / groups
    // once, in the background, and refresh the selection with the entities so their labels are displayed.
    _scheduleLabelResolution() {
      if (this._labelResolutionScheduled) {
        return;
      }
      this._labelResolutionScheduled = true;
      Promise.resolve().then(() => {
        this._labelResolutionScheduled = false;
        this._resolveLabels();
      });
    }

    _entityPaths(id) {
      const prefix = id.startsWith('user:') ? 'user' : id.startsWith('group:') ? 'group' : null;
      const bare = this.prefixed && prefix ? id.substring(prefix.length + 1) : id;
      const types =
        prefix && this.prefixed ? [prefix] : { USER_TYPE: ['user'], GROUP_TYPE: ['group'] }[this.searchType];
      return (types || ['user', 'group']).map((type) => `${type}/${encodeURIComponent(bare)}`);
    }

    _fetchEntity(id) {
      const resource = this.$.entityResource;
      const attempt = (paths) => {
        if (!paths.length) {
          return Promise.resolve(null);
        }
        resource.path = paths[0];
        return resource
          .get()
          .then((entity) => entity || attempt(paths.slice(1)))
          .catch(() => attempt(paths.slice(1)));
      };
      return attempt(this._entityPaths(id));
    }

    _resolveLabels() {
      const { value } = this;
      const ids = (Array.isArray(value) ? value : [value]).filter(
        (id) => typeof id === 'string' && id && !(id in this._entityCache) && !this._pendingIds[id],
      );
      if (!ids.length) {
        return Promise.resolve();
      }
      ids.forEach((id) => {
        this._pendingIds[id] = true;
      });
      return Promise.all(
        ids.map((id) =>
          this._fetchEntity(id).then((entity) => {
            delete this._pendingIds[id];
            // unknown ids (e.g. deleted users) keep falling back to the id itself
            this._entityCache[id] = entity ? this._withPrefixedId(entity, id) : null;
          }),
        ),
      ).then(() => {
        const selectivity = this.$.s2 && this.$.s2._selectivity;
        // only refresh if the value did not change in the meantime, and never mark the form as dirty
        if (selectivity && this.value === value && ids.some((id) => this._entityCache[id])) {
          const hydrated = Array.isArray(value)
            ? value.map((id) => this._entityCache[id] || id)
            : this._entityCache[value] || value;
          selectivity.setValue(hydrated, { triggerChange: false });
        }
      });
    }

    get _pendingIds() {
      if (!this.__pendingIds) {
        this.__pendingIds = {};
      }
      return this.__pendingIds;
    }

    _withPrefixedId(entity, id) {
      return this.prefixed ? { ...entity, prefixed_id: id } : entity;
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
