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
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-icon/iron-icon.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-pagination-controls.js';
import '../widgets/nuxeo-card.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-group-tag.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-tag.js';
import '../widgets/nuxeo-user-suggestion.js';
import '../widgets/nuxeo-user-tag.js';
import './nuxeo-user-group-permissions-table.js';

{
  /**
   * Used by `nuxeo-user-group-management`
   * An element for managing a group.
   *
   * Example:
   *
   *     <nuxeo-group-management group="administrators"></nuxeo-group-management>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   */
  class GroupManagement extends mixinBehaviors([I18nBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="iron-flex iron-flex-alignment iron-flex-factors">
      :host {
        display: block;
      }

      [hidden] {
        display: none !important;
      }

      h2 {
        color: var(--nuxeo-title-color, #213f7d);
      }

      nuxeo-user-group-permissions-table {
        margin-top: 1em;
      }

      .header-actions paper-button {
        margin-left: 1em;
      }

      .header-actions iron-icon {
        width: 1.3rem;
        margin-right: .5rem;
      }

      .card {
        background: none var(--nuxeo-box, #fff);
        box-shadow: 0 3px 5px rgba(0,0,0,0.04);
        margin: 2em 0;
        padding: 2em 1.5em;
      }

      .header {
        margin-bottom: 2rem;
        @apply --layout-start;
      }

      h3 iron-icon {
        width: 1.3em;
        margin-right: .2rem;
      }

      .groupname {
        margin: .5rem 0 0;
      }

      .grouplabel,
      .counter {
        font-weight: normal;
        margin: .5rem 0 0;
      }

      .avatar {
        margin: .5rem .5rem 0 0;
        width: 2rem;
      }

      .header-actions {
        height: 2.8rem;
        margin-top: .5em;
      }

      .activity-entry {
        margin-top: 15px;
      }

      .remove {
        @apply --nuxeo-link;
        text-decoration: underline;
        padding-left: .5em;
        font-size: .8rem;
      }

      .remove:hover {
        @apply --nuxeo-link-hover;
      }

      /* Table */
      .title {
        margin: 0 0 .8em 0;
        padding: 0;
      }

      .table {
        border: 1px solid var(--nuxeo-border, #e3e3e3);
      }

      .table-header {
        @apply --layout-horizontal;
        @apply --layout-center;
        background-color: var(--nuxeo-table-header-background, #fafafa);
        color: var(--nuxeo-table-header-titles, rgba(0, 0, 0, 0.54));
        font-weight: 400;
        min-height: 48px;
        padding: 0 0 0 12px;
        border-bottom: 2px solid var(--nuxeo-border, #eee);
        box-shadow: 0 -1px 0 rgba(0,0,0,0.2) inset;
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

      .table-row:last-of-type {
        border-bottom: none;
      }

      .table-actions {
        width: 3em;
      }

      .filter-wrapper {
        margin-top: 1em;
      }

      nuxeo-dialog[id="editGroupDialog"] {
        width: 40%;
      }

      .buttons {
        @apply --buttons-bar;
      }

      #editForm {
        padding: 1em 2em 2em;
      }

      .emptyResult {
        opacity: .5;
        display: block;
        font-weight: 300;
        padding: 1.5em .7em;
        text-align: center;
      }

      .preserve-white-space {
        white-space: pre;
      }

      /* buttons */
      paper-button.primary {
        background-color: var(--nuxeo-button-primary, #00adff);
        color: #fff;
      }

      paper-button.primary:hover,
      paper-button.primary:focus {
        background-color: var(--nuxeo-button-primary-focus, #0079b3);
        font-weight: inherit;
        color: #fff !important;
      }
    </style>

    <nuxeo-connection user="{{_currentUser}}"></nuxeo-connection>

    <nuxeo-resource
      id="request"
      path="group/[[groupname]]"
      response="{{group}}"
      headers="{&quot;fetch.group&quot;: &quot;memberUsers,memberGroups&quot;}">
    </nuxeo-resource>
    <nuxeo-resource id="users" path="[[_usersPath(groupname)]]" response="{{memberUsers}}" auto=""></nuxeo-resource>
    <nuxeo-resource id="groups" path="[[_groupsPath(groupname)]]" response="{{memberGroups}}" auto=""></nuxeo-resource>
    <nuxeo-resource
      id="editRequest"
      path="group/[[groupname]]"
      response="{{group}}"
      headers="{&quot;fetch.group&quot;: &quot;memberUsers,memberGroups&quot;}">
    </nuxeo-resource>

    <paper-toast id="toast"></paper-toast>

    <nuxeo-dialog id="deleteGroupDialog" with-backdrop="">
      <h2>[[i18n('groupManagement.delete.confirm')]]</h2>
      <div class="buttons horizontal end-justified layout">
        <div class="flex start-justified">
          <paper-button noink="" dialog-dismiss="">[[i18n('label.no')]]</paper-button>
        </div>
        <paper-button noink="" class="primary" on-click="_deleteGroup">[[i18n('label.yes')]]</paper-button>
      </div>
    </nuxeo-dialog>

    <nuxeo-dialog id="rmFromGroupDialog" with-backdrop="" class="vertical layout">
      <h2>[[i18n('groupManagement.removeUserFromGroup.confirm', _removedMember.id)]]</h2>
      <div class="buttons horizontal end-justified layout">
        <div class="flex start-justified">
          <paper-button noink="" dialog-dismiss="">[[i18n('label.no')]]</paper-button>
        </div>
        <paper-button noink class="primary" dialog-confirm="" on-click="_removeMember">
          [[i18n('label.yes')]]
        </paper-button>
      </div>
    </nuxeo-dialog>

    <nuxeo-dialog id="editGroupDialog" with-backdrop="">
      <h2>[[i18n('groupManagement.editGroup.heading')]]</h2>
      <iron-form id="editForm">
        <form>
          <nuxeo-input label="[[i18n('groupManagement.group.label')]]" value="{{_editableGroup.grouplabel}}">
          </nuxeo-input>
        </form>
      </iron-form>
      <div class="buttons horizontal end-justified layout">
        <div class="flex start-justified">
          <paper-button dialog-dismiss="">[[i18n('command.cancel')]]</paper-button>
        </div>
        <paper-button noink class="primary" on-click="_submitEditForm">
          [[i18n('command.save.changes')]]
        </paper-button>
      </div>
    </nuxeo-dialog>

    <nuxeo-card>
      <div class="header horizontal layout">
        <iron-icon icon="nuxeo:user" class="avatar"></iron-icon>
        <div class="layout vertical flex">
          <h3 class="groupname preserve-white-space">[[group.groupname]]</h3>
          <h4 class="grouplabel preserve-white-space">[[group.grouplabel]]</h4>
          <h5 class="counter">[[_countUsers(group.memberUsers)]] + [[_countGroups(group.memberGroups)]]</h5>
        </div>

        <dom-if if="[[_canEditGroup(readonly, _currentUser, groupname)]]">
          <template>
            <div class="layout horizontal header-actions">
              <paper-button id="deleteGroupButton" noink="" class="flex-end" on-click="_toggleDeleteGroup">
                <iron-icon icon="nuxeo:delete"></iron-icon> [[i18n('command.delete')]]
              </paper-button>
              <paper-button id="addMembersButton" noink="" class="flex-end primary" on-click="_toggleEditMembers">
                <iron-icon icon="nuxeo:add"></iron-icon> [[i18n('groupManagement.addMembers')]]
              </paper-button>
              <paper-button id="editGroupButton" noink="" on-click="_toggleEditGroup" class="primary">
                <iron-icon icon="nuxeo:edit"></iron-icon> [[i18n('groupManagement.editGroup')]]
              </paper-button>
            </div>
          </template>
        </dom-if>
      </div>
    </nuxeo-card>

    <div class="card layout vertical" hidden\$="[[!showEditMembers]]">
      <nuxeo-user-suggestion
        id="picker"
        search-type="USER_GROUP_TYPE"
        placeholder="[[i18n('groupManagement.addEntity')]]"
        selected-item="{{selectedMember}}"
        result-formatter="[[resultFormatter]]"
        query-results-filter="[[resultsFilter]]">
      </nuxeo-user-suggestion>
      <dom-repeat items="[[activity]]">
        <template>
          <div class="activity-entry">
            <nuxeo-tag icon="[[_icon(item)]]">
              <span class="preserve-white-space">[[item.displayLabel]]</span>
            </nuxeo-tag>
            <span>[[i18n('groupManagement.addedToGroup')]]</span>
            <span class="remove" on-click="_toggleDeleteDialog">[[i18n('groupManagement.remove')]]</span>
          </div>
        </template>
      </dom-repeat>
    </div>

    <!-- users table -->
    <nuxeo-card icon="nuxeo:user" heading="[[i18n('groupManagement.users.heading')]]">
      <div class="filter-wrapper">
        <nuxeo-input
          autofocus
          value="{{usersFilter}}"
          type="search"
          placeholder="[[i18n('groupManagement.filterUsers.placeholder')]]">
          <iron-icon icon="nuxeo:search" prefix=""></iron-icon>
        </nuxeo-input>
      </div>
      <div class="table">
        <div class="table-header">
          <div class="flex-4">[[i18n('groupManagement.name')]]</div>
          <div class="flex-4">[[i18n('groupManagement.identifier')]]</div>
          <div class="table-actions"></div>
        </div>
        <div class="table-rows">
          <dom-if if="[[!_empty(memberUsers.entries)]]">
            <template>
              <dom-repeat items="[[memberUsers.entries]]">
                <template>
                  <div class="table-row">
                    <div class="flex-4">
                      <dom-if if="[[_userHasName(item)]]">
                        <template>
                          <nuxeo-user-tag user="[[item]]"></nuxeo-user-tag>
                        </template>
                      </dom-if>
                    </div>
                    <div class="flex-4 preserve-white-space">[[item.id]]</div>
                    <div class="table-actions">
                      <dom-if if="[[_canEditGroup(readonly, _currentUser, groupname)]]">
                        <template>
                          <paper-icon-button
                            icon="nuxeo:clear"
                            noink
                            title="[[i18n('groupManagement.removeFrom', groupname)]]"
                            on-click="_toggleDeleteDialog">
                          </paper-icon-button>
                        </template>
                      </dom-if>
                    </div>
                  </div>
                </template>
              </dom-repeat>
            </template>
          </dom-if>
          <dom-if if="[[_empty(memberUsers.entries)]]">
            <template>
              <div class="table-row">
                <div class="emptyResult">[[i18n('groupManagement.noSearchResults')]]</div>
              </div>
            </template>
          </dom-if>
        </div>
      </div>
      <nuxeo-pagination-controls page="{{usersCurrentPage}}" number-of-pages="[[memberUsers.numberOfPages]]">
      </nuxeo-pagination-controls>
    </nuxeo-card>

    <!-- nested groups -->
    <nuxeo-card icon="nuxeo:group" heading="[[i18n('groupManagement.nestedGroups.heading')]]">
      <div class="filter-wrapper">
        <nuxeo-input
          autofocus
          value="{{groupsFilter}}"
          type="search"
          placeholder="[[i18n('groupManagement.filterGroups.placeholder')]]">
          <iron-icon icon="nuxeo:search" prefix=""></iron-icon>
        </nuxeo-input>
      </div>
      <div class="table">
        <div class="table-header">
          <div class="flex-4">[[i18n('groupManagement.name')]]</div>
          <div class="flex-4">[[i18n('groupManagement.identifier')]]</div>
          <div class="table-actions"></div>
        </div>
        <div class="table-rows">
          <dom-if if="[[!_empty(memberGroups.entries)]]">
            <template>
              <dom-repeat items="[[memberGroups.entries]]">
                <template>
                  <div class="table-row">
                    <div class="flex-4">
                      <nuxeo-group-tag group="[[item]]"></nuxeo-group-tag>
                    </div>
                    <div class="flex-4 preserve-white-space">[[item.grouplabel]]</div>
                    <div class="table-actions">
                      <dom-if if="[[_canEditGroup(readonly, _currentUser, groupname)]]">
                        <template>
                          <paper-icon-button
                            icon="nuxeo:clear"
                            noink
                            title="[[i18n('groupManagement.removeFrom', groupname)]]"
                            on-click="_toggleDeleteDialog">
                          </paper-icon-button>
                        </template>
                      </dom-if>
                    </div>
                  </div>
                </template>
              </dom-repeat>
            </template>
          </dom-if>
          <dom-if if="[[_empty(memberGroups.entries)]]">
            <template>
              <div class="table-row">
                <div>[[i18n('groupManagement.noSearchResults')]]</div>
              </div>
            </template>
          </dom-if>
        </div>
      </div>
      <nuxeo-pagination-controls
        page="{{groupsCurrentPage}}"
        number-of-pages="[[memberGroups.numberOfPages]]">
      </nuxeo-pagination-controls>
    </nuxeo-card>

    <!-- permissions -->
    <nuxeo-card heading="[[i18n('groupManagement.permissions.heading')]]">
      <nuxeo-user-group-permissions-table entity="[[groupname]]"></nuxeo-user-group-permissions-table>
    </nuxeo-card>
`;
    }

    static get is() {
      return 'nuxeo-group-management';
    }

    static get properties() {
      return {
        groupname: {
          type: String,
          observer: '_fetch',
        },

        group: Object,

        selectedMember: {
          type: Object,
          observer: '_memberSelected',
        },

        memberUsers: Object,

        memberGroups: Object,

        activity: {
          type: Array,
          value: [],
        },

        resultsFilter: {
          type: Function,
          value() {
            return this._resultsFilter.bind(this);
          },
        },

        resultFormatter: {
          type: Function,
          value() {
            return this._resultFormatter.bind(this);
          },
        },

        showEditMembers: {
          type: Boolean,
          value: false,
        },

        usersCurrentPage: Number,

        usersFilter: String,

        groupsCurrentPage: Number,

        groupsFilter: String,

        _editableGroup: Object,

        _removedMember: Object,

        _fromDelete: {
          type: Boolean,
          value: false,
        },

        readonly: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        _currentUser: {
          type: Object,
        },
      };
    }

    static get observers() {
      return [
        '_fetchUsers(usersCurrentPage)',
        '_filterUsers(usersFilter)',
        '_fetchGroups(groupsCurrentPage)',
        '_filterGroups(groupsFilter)',
      ];
    }

    /**
     * Fired when a group is deleted.
     *
     * @event nuxeo-group-deleted
     */

    ready() {
      super.ready();
      this.$.editForm.addEventListener('iron-form-presubmit', (event) => {
        event.preventDefault();
        this._saveGroup();
      });
    }

    _hasAdministrationPermissions(user) {
      return user && (user.isAdministrator || (this.isMember(user, 'powerusers')
          && this.groupname !== 'administrators'));
    }

    _canEditGroup(readonly, currentUser, groupname) {
      return !readonly && this._hasAdministrationPermissions(currentUser, groupname);
    }

    _userHasName(user) {
      return user.properties.firstName || user.properties.lastName;
    }

    _fetch() {
      if (this.groupname) {
        this.$.request.get().then(() => {
          this.activity = [];
          this.showEditMembers = false;
          this.selectedMember = null;
          this._fetchGroups();
          this._fetchUsers();
        });
      }
    }

    _saveGroup() {
      this.$.editRequest.data = this._editableGroup;
      this.$.editRequest.put().then(() => {
        this._toast(this.i18n('groupManagement.group.updated'));
        this.$.editGroupDialog.toggle();
      });
    }

    _fetchGroups() {
      if (this.group) {
        // if there's only one entry left in the current page and we delete it, we should go to prev page
        if (this._fromDelete && this.memberGroups.currentPageSize === 1) {
          this._fromDelete = false;
          this.groupsCurrentPage--;
          return;
        }
        const params = {
          q: this.groupsFilter,
          currentPageIndex: this.groupsCurrentPage - 1,
        };
        this.$.groups.params = params;
      }
    }

    _fetchUsers() {
      if (this.group) {
        // if there's only one entry left in the current page and we delete it, we should go to prev page
        if (this._fromDelete && this.memberUsers.currentPageSize === 1) {
          this._fromDelete = false;
          this.usersCurrentPage--;
          return;
        }
        const params = {
          q: this.usersFilter,
          currentPageIndex: this.usersCurrentPage - 1,
        };
        this.$.users.params = params;
      }
    }

    _memberSelected() {
      if (this.selectedMember) {
        const member = this.selectedMember;
        switch (member.type) {
          case 'USER_TYPE': {
            const users = this.group.memberUsers || [];
            users.push(member.id);
            member['entity-type'] = 'user';
            this.group.memberUsers = users;
            break;
          }
          case 'GROUP_TYPE': {
            const groups = this.group.memberGroups || [];
            groups.push(member.id);
            member['entity-type'] = 'group';
            this.group.memberGroups = groups;
            break;
          }
          default:
            // do nothing
        }
        this.push('activity', member);
        this.$.editRequest.data = this.group;
        this.$.editRequest.put().then(() => {
          if (member['entity-type'] === 'user') {
            this._fetchUsers();
          } else {
            this._fetchGroups();
          }
          this._toast(this.i18n('groupManagement.addedUserToGroup', member.displayLabel, this.group.groupname));
        });
      }
      this.selectedMember = null;
    }

    _removeMember() {
      const member = this._removedMember;
      let idx;
      switch (member['entity-type']) {
        case 'user':
          if (this.group.memberUsers) {
            idx = this.group.memberUsers.indexOf(this._removedMember.id);
            this.group.memberUsers.splice(idx, 1);
          }
          break;
        case 'group':
          if (this.group.memberGroups) {
            idx = this.group.memberGroups.indexOf(this._removedMember.id);
            this.group.memberGroups.splice(idx, 1);
          }
          break;
        default:
          // do nothing
      }
      this.$.editRequest.data = this.group;
      this.$.editRequest.put().then(() => {
        this._fromDelete = true;
        if (member['entity-type'] === 'user') {
          this._fetchUsers();
        } else {
          this._fetchGroups();
        }
        this._removeRecent(this._removedMember.id);
        this._toast(this.i18n('groupManagement.removedUserFromGroup', this._removedMember.id));
      });
    }

    _removeRecent(group) {
      // remove from 'recent', if it exists
      for (let i = 0; i < this.activity.length; i++) {
        if (this.activity[i].id === group) {
          this.splice('activity', i, 1);
          return;
        }
      }
    }

    _submitEditForm() {
      this.$.editForm.submit();
    }

    _filterUsers() {
      if (this.group) {
        this.usersCurrentPage = 1;
        this._fetchUsers();
      }
    }

    _filterGroups() {
      if (this.group) {
        this.groupsCurrentPage = 1;
        this._fetchGroups();
      }
    }

    _deleteGroup() {
      this.$.deleteGroupDialog.toggle();
      this.$.editRequest.data = this.group;
      this.$.editRequest.remove().then(() => {
        this.dispatchEvent(new CustomEvent('nuxeo-group-deleted', {
          composed: true,
          bubbles: true,
          detail: this.group,
        }));
        this._goHome();
      });
    }

    _toggleEditMembers() {
      this.showEditMembers = !this.showEditMembers;
    }

    _toggleDeleteDialog(e) {
      const type = e.model.item['entity-type'];
      this._removedMember = e.model.item;
      this._removedMember.id = type === 'user' ? e.model.item.id : e.model.item.groupname;
      this.$.rmFromGroupDialog.toggle();
    }

    _toggleEditGroup() {
      this._clone();
      this.$.editGroupDialog.toggle();
    }

    _toggleDeleteGroup() {
      this.$.deleteGroupDialog.toggle();
    }

    _empty(entries) {
      return entries && entries.length === 0;
    }

    _goHome() {
      this.dispatchEvent(new CustomEvent('goHome', {
        composed: true,
        bubbles: true,
      }));
    }

    _resultsFilter(entry) {
      const userInGroup = this.group.memberUsers && this.group.memberUsers.indexOf(entry.id) >= 0;
      const groupInGroup = this.group.memberGroups && this.group.memberGroups.indexOf(entry.id) >= 0;
      return !userInGroup && !groupInGroup && entry.id !== this.group.groupname;
    }

    _resultFormatter(item) {
      return `${item.displayLabel} (${item.groupname || item.username})`;
    }

    _icon(entry) {
      return entry.type === 'GROUP_TYPE' ? 'nuxeo:group' : 'nuxeo:user';
    }

    _countUsers(users) {
      if (users) {
        const label = ` ${users.length === 1 ? this.i18n('groupManagement.member') :
          this.i18n('groupManagement.members')}`;
        return users.length + label;
      }
    }

    _countGroups(groups) {
      if (groups) {
        const label = ` ${groups.length === 1 ? this.i18n('groupManagement.nestedGroup') :
          this.i18n('groupManagement.nestedGroups')}`;
        return groups.length + label;
      }
    }

    _toast(msg) {
      this.$.toast.text = msg;
      this.$.toast.open();
    }

    _clone() {
      this._editableGroup = JSON.parse(JSON.stringify(this.group));
    }

    _usersPath() {
      if (this.groupname) {
        return `group/${this.groupname}/@users`;
      }
    }

    _groupsPath() {
      if (this.groupname) {
        return `group/${this.groupname}/@groups`;
      }
    }
  }

  customElements.define(GroupManagement.is, GroupManagement);
  Nuxeo.GroupManagement = GroupManagement;
}
