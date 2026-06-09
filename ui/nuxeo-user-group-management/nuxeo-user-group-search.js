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
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/editor-icons.js';
import '../nuxeo-data-table/data-table-icons.js';
import '../nuxeo-data-table/data-table-column-sort.js';
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
import '../widgets/nuxeo-card.js';
import '../widgets/nuxeo-group-tag.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-user-tag.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  /**
   * Used by `nuxeo-user-management`
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   */
  class UserGroupSearch extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="iron-flex iron-flex-alignment iron-flex-factors">
          :host {
            display: block;
            @apply --nuxeo-user-group-search-layout;
          }

          .search {
            width: calc(100% - 11rem);
          }

          .title {
            margin: 0 0 0.8em;
            padding: 0;
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

          .table-row:hover {
            background: var(--nuxeo-container-hover, #fafafa);
          }

          .table {
            border: 1px solid var(--nuxeo-border, #eee);
          }

          .counter {
            margin-right: 2em;
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

          .sortable[active='true'] nuxeo-data-table-column-sort {
            --default-primary-color: var(--nuxeo-primary-color, #0066ff);
          }
        </style>

        <nuxeo-resource id="userSearch" auto path="/user/search" response="{{users}}"></nuxeo-resource>
        <nuxeo-resource
          id="groupSearch"
          auto
          path="/group/search"
          response="{{groups}}"
          headers='{"fetch-group": "memberUsers,memberGroups"}'
        >
        </nuxeo-resource>

        <nuxeo-card class="search">
          <nuxeo-input
            autofocus
            value="{{searchTerm}}"
            type="search"
            placeholder="[[i18n('userGroupSearch.search.placeholder')]]"
          >
            <iron-icon icon="nuxeo:search" prefix></iron-icon>
          </nuxeo-input>
        </nuxeo-card>

        <dom-if if="[[!_showResults(searchTerm)]]">
          <template>
            <!-- groups -->
            <nuxeo-card name="groups" icon="nuxeo:group" heading="[[i18n('userGroupSearch.groups')]]">
              <div class="table">
                <div class="table-header">
                  <div
                    class="flex-4 sortable"
                    active$="[[_isSortActive(_groupSortOrder, 'grouplabel')]]"
                    role="columnheader"
                    aria-sort$="[[_ariaSort(_groupSortOrder, 'grouplabel')]]"
                  >
                    [[i18n('userGroupSearch.name')]]
                    <nuxeo-data-table-column-sort
                      path="grouplabel"
                      sort-order="[[_groupSortOrder]]"
                      on-sort-direction-changed="_onGroupSortChanged"
                    ></nuxeo-data-table-column-sort>
                  </div>
                  <div
                    class="flex-2 sortable"
                    active$="[[_isSortActive(_groupSortOrder, 'groupname')]]"
                    role="columnheader"
                    aria-sort$="[[_ariaSort(_groupSortOrder, 'groupname')]]"
                  >
                    [[i18n('userGroupSearch.identifier')]]
                    <nuxeo-data-table-column-sort
                      path="groupname"
                      sort-order="[[_groupSortOrder]]"
                      on-sort-direction-changed="_onGroupSortChanged"
                    ></nuxeo-data-table-column-sort>
                  </div>
                  <div class="flex-4" role="columnheader">[[i18n('userGroupSearch.contains')]]</div>
                </div>
                <div class="table-rows">
                  <dom-repeat items="[[groups.entries]]" as="item">
                    <template>
                      <div class="table-row" on-click="_manageGroup">
                        <div class="flex-4">
                          <nuxeo-group-tag group="[[item]]"></nuxeo-group-tag>
                        </div>
                        <div name="id" class="flex-2 preserve-white-space">[[_groupIdentifier(item)]]</div>
                        <div class="flex-4">
                          <span class="counter">[[_countUsers(item.memberUsers)]]</span>
                          <span class="counter">[[_countGroups(item.memberGroups)]]</span>
                        </div>
                      </div>
                    </template>
                  </dom-repeat>
                  <dom-if if="[[_empty(groups.entries)]]">
                    <template>
                      <div class="table-row">
                        <div class="emptyResult">[[i18n('userGroupSearch.empty.groups')]]</div>
                      </div>
                    </template>
                  </dom-if>
                </div>
              </div>
              <nuxeo-pagination-controls page="{{groupsCurrentPage}}" number-of-pages="[[groups.numberOfPages]]">
              </nuxeo-pagination-controls>
            </nuxeo-card>

            <!-- users -->
            <nuxeo-card name="users" icon="nuxeo:user" heading="[[i18n('userGroupSearch.users.heading')]]">
              <div class="table">
                <div class="table-header">
                  <div
                    class="flex-4 sortable"
                    active$="[[_isSortActive(_userSortOrder, 'lastName')]]"
                    role="columnheader"
                    aria-sort$="[[_ariaSort(_userSortOrder, 'lastName')]]"
                  >
                    [[i18n('userGroupSearch.name')]]
                    <nuxeo-data-table-column-sort
                      path="lastName"
                      sort-order="[[_userSortOrder]]"
                      on-sort-direction-changed="_onUserSortChanged"
                    ></nuxeo-data-table-column-sort>
                  </div>
                  <div
                    class="flex-2 sortable"
                    active$="[[_isSortActive(_userSortOrder, 'username')]]"
                    role="columnheader"
                    aria-sort$="[[_ariaSort(_userSortOrder, 'username')]]"
                  >
                    [[i18n('userGroupSearch.identifier')]]
                    <nuxeo-data-table-column-sort
                      path="username"
                      sort-order="[[_userSortOrder]]"
                      on-sort-direction-changed="_onUserSortChanged"
                    ></nuxeo-data-table-column-sort>
                  </div>
                  <div
                    class="flex-4 sortable"
                    active$="[[_isSortActive(_userSortOrder, 'email')]]"
                    role="columnheader"
                    aria-sort$="[[_ariaSort(_userSortOrder, 'email')]]"
                  >
                    [[i18n('userGroupSearch.email')]]
                    <nuxeo-data-table-column-sort
                      path="email"
                      sort-order="[[_userSortOrder]]"
                      on-sort-direction-changed="_onUserSortChanged"
                    ></nuxeo-data-table-column-sort>
                  </div>
                </div>
                <div class="table-rows">
                  <dom-repeat items="[[users.entries]]" as="item">
                    <template>
                      <div class="table-row" on-click="_manageUser">
                        <div class="flex-4">
                          <dom-if if="[[_userHasName(item)]]">
                            <template>
                              <nuxeo-user-tag user="[[item]]"></nuxeo-user-tag>
                            </template>
                          </dom-if>
                        </div>
                        <div name="id" class="flex-2 preserve-white-space">[[_userIdentifier(item)]]</div>
                        <div class="flex-4">[[item.properties.email]]</div>
                      </div>
                    </template>
                  </dom-repeat>
                  <dom-if if="[[_empty(users.entries)]]">
                    <template>
                      <div class="table-row">
                        <div class="emptyResult">[[i18n('userGroupSearch.empty.users')]]</div>
                      </div>
                    </template>
                  </dom-if>
                </div>
              </div>
              <nuxeo-pagination-controls page="{{usersCurrentPage}}" number-of-pages="[[users.numberOfPages]]">
              </nuxeo-pagination-controls>
            </nuxeo-card>
          </template>
        </dom-if>
      `;
    }

    static get is() {
      return 'nuxeo-user-group-search';
    }

    static get properties() {
      return {
        searchTerm: {
          type: String,
          value: '',
          observer: '_searchTermChanged',
          notify: true,
        },

        users: Object,
        groups: Object,

        groupsCurrentPage: Number,

        usersCurrentPage: Number,

        // Array of { path, direction } for multi-column sort on groups (matches nuxeo-data-table-column-sort contract)
        _groupSortOrder: {
          type: Array,
          value: () => [],
        },

        // Array of { path, direction } for multi-column sort on users
        _userSortOrder: {
          type: Array,
          value: () => [],
        },
      };
    }

    static get observers() {
      return ['_searchGroups(groupsCurrentPage)', '_searchUsers(usersCurrentPage)'];
    }

    _searchTermChanged() {
      if (this.searchTerm !== '') {
        this.groupsCurrentPage = this.usersCurrentPage = 1;
        this._searchGroups();
        this._searchUsers();
      } else {
        this.users = this.groups = {};
      }
    }

    _searchGroups() {
      const params = {
        q: this.searchTerm,
        currentPageIndex: this.groupsCurrentPage - 1,
      };
      if (this._groupSortOrder.length > 0) {
        params.sortBy = this._groupSortOrder.map((c) => c.path).join(',');
        params.sortOrder = this._groupSortOrder.map((c) => c.direction).join(',');
      }
      this.$.groupSearch.params = params;
    }

    _searchUsers() {
      const params = {
        q: this.searchTerm,
        currentPageIndex: this.usersCurrentPage - 1,
      };
      if (this._userSortOrder.length > 0) {
        params.sortBy = this._userSortOrder.map((c) => c.path).join(',');
        params.sortOrder = this._userSortOrder.map((c) => c.direction).join(',');
      }
      this.$.userSearch.params = params;
    }

    _onGroupSortChanged(e) {
      this._groupSortOrder = this._applySortDirectionChanged(this._groupSortOrder, e.detail.path, e.detail.direction);
      if (this.groupsCurrentPage === 1) {
        this._searchGroups();
      } else {
        this.groupsCurrentPage = 1;
      }
    }

    _onUserSortChanged(e) {
      this._userSortOrder = this._applySortDirectionChanged(this._userSortOrder, e.detail.path, e.detail.direction);
      if (this.usersCurrentPage === 1) {
        this._searchUsers();
      } else {
        this.usersCurrentPage = 1;
      }
    }

    // Mirrors the logic of _sortDirectionChanged in PageProviderDisplayBehavior, adapted for REST params.
    // Accepts the element's { path, direction } schema where direction=null means "remove this column".
    _applySortDirectionChanged(sortOrder, path, direction) {
      const result = sortOrder.slice();
      const idx = result.findIndex((c) => c.path === path);
      if (idx >= 0) {
        if (direction) {
          result[idx] = { path, direction };
        } else {
          result.splice(idx, 1);
        }
      } else if (direction) {
        result.push({ path, direction });
      }
      return result;
    }

    _isSortActive(sortOrder, path) {
      return sortOrder && sortOrder.some((c) => c.path === path);
    }

    _ariaSort(sortOrder, path) {
      const col = sortOrder && sortOrder.find((c) => c.path === path);
      if (!col) {
        return 'none';
      }
      return col.direction === 'asc' ? 'ascending' : 'descending';
    }

    _manageUser(e) {
      this.dispatchEvent(
        new CustomEvent('manageUser', {
          composed: true,
          bubbles: true,
          detail: { user: e.model.item.id },
        }),
      );
    }

    _manageGroup(e) {
      this.dispatchEvent(
        new CustomEvent('manageGroup', {
          composed: true,
          bubbles: true,
          detail: { group: e.model.item.id || e.model.item.groupname },
        }),
      );
    }

    _empty(entries) {
      return entries && entries.length === 0;
    }

    _countUsers(users) {
      const label = ` ${
        users.length === 1 ? this.i18n('userGroupSearch.member') : this.i18n('userGroupSearch.members')
      }`;
      return users.length + label;
    }

    _countGroups(groups) {
      if (groups.length > 0) {
        const label = ` ${
          groups.length === 1 ? this.i18n('userGroupSearch.nestedGroup') : this.i18n('userGroupSearch.nestedGroups')
        }`;
        return groups.length + label;
      }
    }

    _userHasName(user) {
      return user.properties.firstName || user.properties.lastName || user.properties.username;
    }

    _groupIdentifier(group) {
      if (!group) {
        return '';
      }
      const props = group.properties || {};
      return group.name || group.groupname || props.groupname || group.id || '';
    }

    _userIdentifier(user) {
      if (!user) {
        return '';
      }
      const props = user.properties || {};
      const identifier = props.username || user.name || user.id || user.uid;
      return identifier || '';
    }

    _showResults() {
      return this.searchTerm.length === 0;
    }
  }

  customElements.define(UserGroupSearch.is, UserGroupSearch);
  Nuxeo.UserGroupSearch = UserGroupSearch;
}
