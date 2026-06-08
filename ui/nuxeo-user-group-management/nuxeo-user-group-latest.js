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
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/editor-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '../nuxeo-pagination-controls.js';
import '../nuxeo-data-table/data-table-icons.js';
import '../widgets/nuxeo-card.js';
import '../widgets/nuxeo-group-tag.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-user-tag.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  /**
   * An element for displaying the most recently created users and groups.
   *
   * Example:
   *
   *     <nuxeo-user-group-latest></nuxeo-user-group-latest>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-user-group-latest/index.html
   */
  class UserGroupLatest extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="iron-flex-factors">
          :host {
            display: block;
            @apply --nuxeo-user-group-latest-layout;
          }

          .title {
            margin: 0 0 0.8em;
            padding: 0;
          }

          .table {
            border: 1px solid var(--divider-color);
          }

          .table-header {
            @apply --layout-horizontal;
            @apply --layout-center;
            background-color: var(--nuxeo-table-header-background, #fafafa);
            color: var(--nuxeo-text-default, rgba(0, 0, 0, 0.54));
            font-weight: 400;
            min-height: 48px;
            padding: 0 0 0 12px;
            border-bottom: 2px solid var(--nuxeo-border, #eee);
            box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.2) inset;
          }

          .table-row {
            @apply --layout-horizontal;
            @apply --layout-center;
            padding: 12px 0 12px 12px;
            border-bottom: 1px solid var(--nuxeo-border, #eee);
            cursor: pointer;
          }

          .email-wrapper {
            max-width: 100%;
            overflow: hidden;
            text-align: left;
          }

          .email-text {
            display: inline-block;
            max-width: 240px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: middle;
          }

          .table-row:hover {
            background: var(--nuxeo-container-hover, #fafafa);
          }

          .table-actions {
            width: 3em;
          }

          .table {
            border: 1px solid var(--nuxeo-border, #eee);
          }

          h3 iron-icon {
            width: 1.3em;
            margin-right: 0.2rem;
          }

          .emptyResult {
            opacity: 0.8;
            display: block;
            font-weight: 300;
            padding: 1.5em 0.7em;
            text-align: center;
          }

          .preserve-white-space {
            white-space: pre;
          }

          .sortable {
            cursor: pointer;
            display: flex;
            align-items: center;
            user-select: none;
          }

          .sortable:hover {
            color: var(--nuxeo-primary-color, #0066ff);
          }

          .sort-btn {
            width: 24px;
            height: 24px;
            padding: 2px;
            color: var(--nuxeo-text-default, rgba(0, 0, 0, 0.54));
            opacity: 0.6;
            transition: transform 0.2s, opacity 0.2s, color 0.2s;
            flex-shrink: 0;
          }

          .sort-btn[direction='desc'] {
            transform: rotate(-180deg);
          }

          .sortable:hover .sort-btn {
            color: var(--nuxeo-primary-color, #0066ff);
            opacity: 1;
          }

          .sortable[active='true'] .sort-btn {
            color: var(--nuxeo-primary-color, #0066ff);
            opacity: 1;
          }

          .sort-container {
            position: relative;
            width: 32px;
            flex-shrink: 0;
          }

          .sort-order {
            font-size: 0.7rem;
            font-weight: bold;
            position: absolute;
            right: 2px;
            bottom: 6px;
            color: var(--nuxeo-primary-color, #0066ff);
            pointer-events: none;
            line-height: 1;
          }
        </style>

        <nuxeo-resource
          id="latestCreatedUsersGroups"
          auto
          path="/query/LATEST_CREATED_USERS_OR_GROUPS_PROVIDER"
          response="{{latestCreatedUsersGroups}}"
          headers='{"properties": "*"}'
        >
        </nuxeo-resource>

        <nuxeo-card icon="nuxeo:recent" heading="[[i18n('userGroupLatest.recentlyCreated')]]">
          <div
            class="table"
            role="table"
            aria-label="[[i18n('userGroupLatest.recentlyCreated')]]"
            aria-rowcount="[[latestCreatedUsersGroups.entries.length]]"
          >
            <div class="table-header" role="row">
              <div
                class="flex-4 sortable"
                active$="[[_isLatestSortActive(_latestSortColumns, 'name')]]"
                on-click="_sortLatest"
                data-field="name"
                role="columnheader"
                aria-sort$="[[_ariaSort(_latestSortColumns, 'name')]]"
              >
                [[i18n('userGroupLatest.name')]]
                <div class="sort-container">
                  <paper-icon-button
                    noink
                    class="sort-btn"
                    icon="data-table:arrow-upward"
                    direction$="[[_sortDirection(_latestSortColumns, 'name')]]"
                    aria-hidden="true"
                    tabindex="-1"
                  ></paper-icon-button>
                  <span class="sort-order">[[_sortIndex(_latestSortColumns, 'name')]]</span>
                </div>
              </div>
              <div
                class="flex-4 sortable"
                active$="[[_isLatestSortActive(_latestSortColumns, 'uid')]]"
                on-click="_sortLatest"
                data-field="uid"
                role="columnheader"
                aria-sort$="[[_ariaSort(_latestSortColumns, 'uid')]]"
              >
                [[i18n('userGroupLatest.identifier')]]
                <div class="sort-container">
                  <paper-icon-button
                    noink
                    class="sort-btn"
                    icon="data-table:arrow-upward"
                    direction$="[[_sortDirection(_latestSortColumns, 'uid')]]"
                    aria-hidden="true"
                    tabindex="-1"
                  ></paper-icon-button>
                  <span class="sort-order">[[_sortIndex(_latestSortColumns, 'uid')]]</span>
                </div>
              </div>
              <div
                class="flex-4 sortable"
                active$="[[_isLatestSortActive(_latestSortColumns, 'email')]]"
                on-click="_sortLatest"
                data-field="email"
                role="columnheader"
                aria-sort$="[[_ariaSort(_latestSortColumns, 'email')]]"
              >
                [[i18n('label.directories.nature.email')]]
                <div class="sort-container">
                  <paper-icon-button
                    noink
                    class="sort-btn"
                    icon="data-table:arrow-upward"
                    direction$="[[_sortDirection(_latestSortColumns, 'email')]]"
                    aria-hidden="true"
                    tabindex="-1"
                  ></paper-icon-button>
                  <span class="sort-order">[[_sortIndex(_latestSortColumns, 'email')]]</span>
                </div>
              </div>
              <div class="table-actions" role="columnheader">
                <paper-icon-button
                  noink
                  icon="nuxeo:refresh"
                  on-click="_refreshLatest"
                  aria-label$="[[i18n('command.refresh')]]"
                ></paper-icon-button>
              </div>
            </div>
            <div class="table-rows">
              <dom-repeat items="[[_sortedLatest]]" as="item">
                <template>
                  <div class="table-row" on-click="_manageUserOrGroup" role="row">
                    <div class="flex-4" role="columnheader">
                      <dom-if if="[[_isUser(item)]]">
                        <template>
                          <dom-if if="[[_userHasName(item)]]">
                            <template>
                              <nuxeo-user-tag user="[[item]]"></nuxeo-user-tag>
                            </template>
                          </dom-if>
                        </template>
                      </dom-if>
                      <dom-if if="[[_isGroup(item)]]">
                        <template>
                          <nuxeo-group-tag group="[[item]]"></nuxeo-group-tag>
                        </template>
                      </dom-if>
                    </div>
                    <div class="flex-4 preserve-white-space" role="columnheader">[[item.uid]]</div>
                    <div class="flex-4" role="columnheader">
                      <div class="email-wrapper">
                        <span class="email-text">
                          [[_getEmail(item)]]
                          <nuxeo-tooltip>[[_getEmail(item)]]</nuxeo-tooltip>
                        </span>
                      </div>
                    </div>

                    <div class="table-actions" role="columnheader"></div>
                  </div>
                </template>
              </dom-repeat>
              <dom-if if="[[_empty(latestCreatedUsersGroups.entries)]]">
                <template>
                  <div class="table-row" role="row">
                    <div class="emptyResult" role="columnheader">
                      [[i18n('userGroupLatest.emptyRecentUserOrGroup')]]
                    </div>
                  </div>
                </template>
              </dom-if>
            </div>
          </div>
        </nuxeo-card>
      `;
    }

    static get is() {
      return 'nuxeo-user-group-latest';
    }

    static get properties() {
      return {
        // Holds the list of last created users or groups
        latestCreatedUsersGroups: Object,

        // Array of { field, order } objects for multi-column sort
        _latestSortColumns: {
          type: Array,
          value: () => [],
        },

        _sortedLatest: {
          type: Array,
          value: () => [],
        },
      };
    }

    static get observers() {
      return ['_onEntriesChanged(latestCreatedUsersGroups.entries)'];
    }

    ready() {
      super.ready();
      window.addEventListener('nuxeo-user-created', () => {
        this._refreshLatestWithDelay();
      });
      window.addEventListener('nuxeo-group-created', () => {
        this._refreshLatestWithDelay();
      });
      window.addEventListener('nuxeo-user-deleted', () => {
        this._refreshLatest();
      });
      window.addEventListener('nuxeo-group-deleted', () => {
        this._refreshLatest();
      });
    }

    _empty(entries) {
      return entries && entries.length === 0;
    }

    _userHasName(user) {
      return user.properties['user:firstName'] || user.properties['user:lastName'] || user.properties['user:username'];
    }

    _getEmail(user) {
      return user.properties['user:email'];
    }

    _isUser(docModel) {
      return docModel.type === 'user';
    }

    _isGroup(docModel) {
      return docModel.type === 'group';
    }

    _displayLCUserGroup(docModel) {
      if (this._isUser(docModel)) {
        let result = '';
        if (docModel.properties['user:firstName']) {
          result += docModel.properties['user:firstName'];
        }
        if (docModel.properties['user:lastName']) {
          if (result.length > 0) {
            result += ' ';
          }
          result += docModel.properties['user:lastName'];
        }
        return result;
      }
      if (this._isGroup(docModel)) {
        return docModel.properties['group:grouplabel'];
      }
    }

    _manageUserOrGroup(e) {
      if (this._isUser(e.model.item)) {
        this.dispatchEvent(
          new CustomEvent('manageUser', {
            composed: true,
            bubbles: true,
            detail: { user: e.model.item.uid },
          }),
        );
      } else if (this._isGroup(e.model.item)) {
        this.dispatchEvent(
          new CustomEvent('manageGroup', {
            composed: true,
            bubbles: true,
            detail: { group: e.model.item.uid },
          }),
        );
      }
    }

    _refreshLatest() {
      this.latestCreatedUsersGroups = {};
      this.$.latestCreatedUsersGroups.execute().then(() => {
        this._applySort();
      });
    }

    _refreshLatestWithDelay() {
      setTimeout(() => {
        // audit is on es backend -> async
        // Let's give it 1 sec to index
        // (dirty, I know ..)
        this._refreshLatest();
      }, 1000);
    }

    _sortLatest(e) {
      const field = e.currentTarget.dataset.field;
      const cols = this._latestSortColumns.slice();
      const idx = cols.findIndex((c) => c.field === field);
      if (idx >= 0) {
        if (cols[idx].order === 'asc') {
          cols[idx] = { field, order: 'desc' };
        } else {
          cols.splice(idx, 1);
        }
      } else {
        cols.push({ field, order: 'asc' });
      }
      this._latestSortColumns = cols;
      this._applySort();
    }

    _onEntriesChanged() {
      this._applySort();
    }

    _applySort() {
      const entries = (this.latestCreatedUsersGroups && this.latestCreatedUsersGroups.entries) || [];
      const cols = this._latestSortColumns;
      if (!cols || cols.length === 0) {
        this._sortedLatest = entries.slice();
        return;
      }
      this._sortedLatest = entries.slice().sort((a, b) => {
        for (let i = 0; i < cols.length; i++) {
          const { field, order } = cols[i];
          const valA = this._getLatestSortValue(a, field);
          const valB = this._getLatestSortValue(b, field);
          const cmp = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
          if (cmp !== 0) {
            return order === 'asc' ? cmp : -cmp;
          }
        }
        return 0;
      });
    }

    _getLatestSortValue(item, field) {
      if (field === 'name') {
        return this._displayLCUserGroup(item) || item.uid || '';
      }
      if (field === 'uid') {
        return item.uid || '';
      }
      if (field === 'email') {
        return this._getEmail(item) || '';
      }
      return '';
    }

    _isLatestSortActive(cols, field) {
      return cols && cols.some((c) => c.field === field);
    }

    _sortDirection(cols, field) {
      const col = cols && cols.find((c) => c.field === field);
      if (!col) {
        return null;
      }
      return col.order === 'asc' ? 'asc' : 'desc';
    }

    _sortIndex(cols, field) {
      if (!cols || cols.length <= 1) {
        return '';
      }
      const idx = cols.findIndex((c) => c.field === field);
      return idx >= 0 ? String(idx + 1) : '';
    }

    _ariaSort(cols, field) {
      const col = cols && cols.find((c) => c.field === field);
      if (!col) {
        return 'none';
      }
      return col.order === 'asc' ? 'ascending' : 'descending';
    }
  }

  customElements.define(UserGroupLatest.is, UserGroupLatest);
  Nuxeo.UserGroupLatest = UserGroupLatest;
}
