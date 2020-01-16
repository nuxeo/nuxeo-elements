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
import '../nuxeo-layout.js';
import '../widgets/nuxeo-card.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-group-tag.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-user-suggestion.js';
import '../widgets/nuxeo-selectivity.js';
import './nuxeo-edit-password.js';
import './nuxeo-user-group-permissions-table.js';

{
  /**
   * An element for managing a user.
   *
   * Example:
   *
   *     <nuxeo-user-management user="Administrator"></nuxeo-user-management>
   *
   * Used by `nuxeo-user-group-management`
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   */
  class UserManagement extends mixinBehaviors([I18nBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="iron-flex iron-flex-alignment iron-flex-factors">
          :host {
            display: block;
          }

          [hidden] {
            display: none !important;
          }

          label {
            font-weight: bold;
            margin-bottom: 5px;
          }

          .header {
            @apply --layout-start;
          }

          .username {
            margin: 10px 0 5px 5px;
          }

          .name {
            font-weight: normal;
            margin: 0 0 0 5px;
          }

          .avatar {
            margin-top: 10px;
          }

          .actions {
            @apply --layout-horizontal;
            @apply --layout-flex;
            @apply --layout-center;
            @apply --layout-end-justified;
          }

          .actions paper-button {
            margin-left: 1em;
          }

          paper-button iron-icon {
            width: 1.3rem;
            margin-right: 0.5rem;
          }

          .activity-entry:nth-of-type(1) {
            margin-top: 20px;
          }

          .activity-entry {
            margin-top: 15px;
          }

          .remove {
            color: red;
            cursor: pointer;
            font-size: 0.8rem;
            margin-left: 10px;
            text-decoration: underline;
          }

          .table {
            margin-top: 12px;
          }

          .table-headers {
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
            padding: 0 1em;
            min-height: 48px;
            border-bottom: 1px solid var(--nuxeo-border, #eee);
            background-color: var(--nuxeo-table-items-background, #fafafa);
          }

          .table-row:hover {
            background: var(--nuxeo-container-hover, #fafafa);
          }

          .table {
            border: 1px solid var(--nuxeo-border, #eee);
          }

          .table-row:last-of-type {
            border-bottom: none;
          }

          .table-headers > div {
            background-color: var(--nuxeo-table-header-background, #f8f9fb);
            font-weight: bold;
          }

          .table-actions {
            width: 50px;
          }

          nuxeo-view-user {
            margin: 2em;
          }

          nuxeo-user-group-permissions-table {
            margin-top: 1.5em;
          }

          nuxeo-dialog {
            padding-top: 24px;
          }

          #errors {
            color: red;
            margin-top: 20px;
          }

          .buttons {
            @apply --buttons-bar;
            margin-top: 2em;
          }

          .header {
            height: auto;
            padding: 0;
          }

          .header .heading {
            font-size: 1rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .user-icon {
            margin: 8px;
            width: 1.3rem;
          }

          /* buttons */
          paper-button.primary {
            background-color: var(--nuxeo-button-primary, #00adff);
            color: #fff;
            font-weight: 700;
          }

          paper-button.primary:hover,
          paper-button.primary:focus {
            background-color: var(--nuxeo-button-primary-focus, #0079b3);
            font-weight: inherit;
            color: #fff !important;
          }
        </style>

        <nuxeo-connection user="{{_currentUser}}"></nuxeo-connection>

        <nuxeo-resource id="request" path="user/[[username]]" enrichers="userprofile" enrichers-entity="user">
        </nuxeo-resource>

        <nuxeo-resource id="editRequest" path="user/[[username]]"></nuxeo-resource>

        <paper-toast id="toast"></paper-toast>

        <nuxeo-card>
          <div class="horizontal layout center header">
            <iron-icon icon="nuxeo:user" class="user-icon"></iron-icon>
            <div class="layout vertical">
              <div class="user heading" name="userHeading">[[user.id]]</div>
              <div>[[user.properties.firstName]] [[user.properties.lastName]]</div>
            </div>

            <div class="actions">
              <!-- delete -->
              <dom-if if="[[_canDelete(readonly, _currentUser, user)]]">
                <template>
                  <paper-button
                    noink
                    id="deleteUserButton"
                    class="horizontal layout center"
                    on-click="_toggleDeleteUser"
                  >
                    <iron-icon noink icon="nuxeo:delete"></iron-icon> [[i18n('command.delete')]]
                  </paper-button>
                </template>
              </dom-if>

              <!-- change password -->
              <dom-if if="[[_canEdit(readonly, _currentUser, user)]]">
                <template>
                  <paper-button
                    noink
                    id="changePasswordButton"
                    class="primary horizontal layout center"
                    on-click="_toggleChangePassword"
                  >
                    <iron-icon icon="nuxeo:lock"></iron-icon> [[i18n('command.change.password')]]
                  </paper-button>
                </template>
              </dom-if>

              <!-- edit -->
              <dom-if if="[[_canEdit(readonly, _currentUser, user)]]">
                <template>
                  <paper-button
                    noink
                    id="editUserButton"
                    class="primary horizontal layout center"
                    on-click="_toggleEditUser"
                  >
                    <iron-icon icon="nuxeo:edit"></iron-icon> [[i18n('userManagement.editUser.button')]]
                  </paper-button>
                </template>
              </dom-if>
            </div>
          </div>

          <!-- user -->
          <nuxeo-view-user user="[[user]]"></nuxeo-view-user>
        </nuxeo-card>

        <!-- groups -->
        <nuxeo-card>
          <div class="layout horizontal center">
            <h3 class="header flex">
              <span class="heading">[[i18n('userManagement.groups')]]</span>
            </h3>
            <dom-if if="[[_canEdit(readonly, _currentUser, user)]]">
              <template>
                <paper-button noink id="addGroup" class="flex-end" on-click="_toggleEditGroups">
                  <iron-icon icon="nuxeo:add"></iron-icon> [[i18n('userManagement.addToGroup.button')]]
                </paper-button>
              </template>
            </dom-if>
          </div>
          <div class="layout vertical" hidden$="[[!showEditGroups]]">
            <nuxeo-user-suggestion
              id="picker"
              class="flex"
              search-type="GROUP_TYPE"
              placeholder="[[i18n('userManagement.search.groups')]]"
              selected-item="{{selectedGroup}}"
              result-formatter="[[resultFormatter]]"
              query-results-filter="[[resultsFilter]]"
            >
            </nuxeo-user-suggestion>
            <div id="errors" hidden$="[[!errors]]">[[errors]]</div>
            <dom-repeat items="[[activity]]">
              <template>
                <div class="activity-entry">
                  [[i18n('userManagement.memberOf.group', user.id)]]
                  <nuxeo-group-tag group="[[item]]"></nuxeo-group-tag>
                  <span class="remove" on-click="_toggleDialog">[[i18n('userManagement.group.remove')]]</span>
                </div>
              </template>
            </dom-repeat>
          </div>
          <div class="table">
            <div class="table-headers">
              <div class="flex">[[i18n('userManagement.name')]]</div>
              <div class="flex-4">[[i18n('userManagement.identifier')]]</div>
              <div class="table-actions">&nbsp;</div>
            </div>
            <dom-if if="[[!empty]]">
              <template>
                <dom-repeat items="[[groups]]">
                  <template>
                    <div class="table-row">
                      <div class="flex">
                        <nuxeo-group-tag group="[[item]]"></nuxeo-group-tag>
                      </div>
                      <div class="flex-4">[[item.name]]</div>
                      <div class="table-actions">
                        <dom-if if="[[_canEdit(readonly, _currentUser, user)]]">
                          <template>
                            <paper-icon-button
                              icon="nuxeo:remove"
                              title="[[i18n('userManagement.removeFrom.group', item.label)]]"
                              on-click="_toggleDialog"
                            >
                            </paper-icon-button>
                          </template>
                        </dom-if>
                      </div>
                    </div>
                  </template>
                </dom-repeat>
              </template>
            </dom-if>
            <dom-if if="[[empty]]">
              <template>
                <div class="table-row">
                  <div>[[i18n('userManagement.noSearchResults')]]</div>
                </div>
              </template>
            </dom-if>
          </div>
        </nuxeo-card>

        <!-- local permissions -->
        <nuxeo-card heading="[[i18n('userManagement.localPermissions.heading')]]">
          <nuxeo-user-group-permissions-table entity="[[username]]" readonly="[[readonly]]">
          </nuxeo-user-group-permissions-table>
        </nuxeo-card>

        <!-- group permissions -->
        <dom-repeat items="[[groups]]">
          <template>
            <nuxeo-card heading="[[i18n('userManagement.entityPermissions', item.name)]]">
              <nuxeo-user-group-permissions-table entity="[[item.name]]" readonly="[[readonly]]">
              </nuxeo-user-group-permissions-table>
            </nuxeo-card>
          </template>
        </dom-repeat>

        <nuxeo-dialog id="dialog" with-backdrop>
          <h2>[[i18n('userManagement.removeUserFromGroup.confirm', user.id, _removedGroup.name)]]</h2>
          <div class="buttons horizontal end-justified layout">
            <div class="flex start-justified">
              <paper-button noink dialog-dismiss>[[i18n('label.no')]]</paper-button>
            </div>
            <paper-button noink dialog-confirm on-click="_remove" class="primary">[[i18n('label.yes')]]</paper-button>
          </div>
        </nuxeo-dialog>

        <nuxeo-dialog id="deleteUserDialog" with-backdrop>
          <h2>[[i18n('userManagement.delete.user.confirm')]]</h2>
          <div class="buttons horizontal end-justified layout">
            <div class="flex start-justified">
              <paper-button noink dialog-dismiss>[[i18n('label.no')]]</paper-button>
            </div>
            <paper-button noink class="primary" on-click="_deleteUser">[[i18n('label.yes')]]</paper-button>
          </div>
        </nuxeo-dialog>

        <nuxeo-dialog id="changePasswordDialog" with-backdrop>
          <h2>[[i18n('command.change.password')]]</h2>
          <iron-form id="changePasswordForm">
            <form class="vertical layout">
              <nuxeo-edit-password required id="passwordEditor"></nuxeo-edit-password>
            </form>
          </iron-form>
          <div class="buttons horizontal end-justified layout">
            <div class="flex start-justified">
              <paper-button noink dialog-dismiss>[[i18n('command.cancel')]]</paper-button>
            </div>
            <paper-button noink class="primary" on-click="_submitChangePassword">
              [[i18n('command.save.changes')]]
            </paper-button>
          </div>
        </nuxeo-dialog>

        <nuxeo-dialog id="editUserDialog" with-backdrop>
          <h2>[[i18n('userManagement.editUser.heading')]]</h2>
          <iron-form id="editUserForm">
            <form class="vertical layout">
              <nuxeo-input
                label="[[i18n('userManagement.username')]]"
                value="[[user.properties.username]]"
                readonly
                required
              >
              </nuxeo-input>
              <nuxeo-layout id="layout" href="[[_layoutHref('nuxeo-edit-user.html')]]"></nuxeo-layout>
            </form>
          </iron-form>
          <div class="buttons horizontal end-justified layout">
            <div class="flex start-justified">
              <paper-button noink dialog-dismiss>[[i18n('command.cancel')]]</paper-button>
            </div>
            <paper-button noink class="primary" on-click="_submitEditUser">
              [[i18n('command.save.changes')]]
            </paper-button>
          </div>
        </nuxeo-dialog>
      `;
    }

    static get is() {
      return 'nuxeo-user-management';
    }

    static get properties() {
      return {
        username: {
          type: String,
          observer: '_fetch',
        },

        user: Object,

        groups: {
          type: Object,
          computed: '_computeGroups(user)',
        },

        selectedGroup: {
          type: Object,
          observer: '_groupSelected',
        },

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
        },

        showEditGroups: {
          type: Boolean,
          value: false,
        },

        empty: Boolean,

        _removedGroup: Object,

        readonly: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        errors: {
          type: String,
          reflectToAttribute: true,
        },

        _currentUser: {
          type: Object,
        },
      };
    }

    static get importMeta() {
      return import.meta;
    }

    static get observers() {
      return ['_userRemovedFromGroup(groups.splices)'];
    }

    /**
     * Fired when a user is deleted.
     *
     * @event nuxeo-user-deleted
     */

    ready() {
      super.ready();
      this.$.editUserForm.addEventListener('iron-form-presubmit', (event) => {
        event.preventDefault();
        this._saveUser();
      });
      this.$.changePasswordForm.addEventListener('iron-form-presubmit', (event) => {
        event.preventDefault();
        this._savePassword();
      });
    }

    _fetch() {
      if (this.username) {
        this.$.request.get().then((response) => {
          delete response.properties.password;
          this.user = response;
          this.activity = [];
          this.showEditGroups = false;
          this.selectedGroup = null;
        });
      }
    }

    _isAdministrator(user) {
      return user && user.isAdministrator;
    }

    _hasAdministrationPermissions(currentUser) {
      return (
        currentUser &&
        (currentUser.isAdministrator || (this.isMember(currentUser, 'powerusers') && !this.user.isAdministrator))
      );
    }

    _canEdit(readonly, currentUser, user) {
      return (
        !readonly &&
        this.user &&
        currentUser &&
        (this._hasAdministrationPermissions(currentUser) ||
          this._isSameUsername(currentUser.properties.username, user.properties.username))
      );
    }

    _canDelete(readonly, currentUser, user) {
      return (
        !readonly &&
        this.user &&
        currentUser &&
        this._hasAdministrationPermissions(currentUser) &&
        !this._isSameUsername(currentUser.properties.username, user.properties.username)
      );
    }

    _isSameUsername(username1, username2) {
      return username1 && username2 && username1 === username2;
    }

    _computeGroups() {
      if (this.user) {
        return this.user.extendedGroups.filter((group) => this.user.properties.groups.indexOf(group.name) > -1);
      }
    }

    _groupSelected() {
      if (this.selectedGroup) {
        if (!this._isAdministrator(this._currentUser) && this.selectedGroup.groupname === 'administrators') {
          this.errors = this.i18n('userManagement.errorAdministratorsGroup');
          this.selectedGroup = null;
          return;
        }
        const group = {
          name: this.selectedGroup.groupname,
          label: this.selectedGroup.grouplabel,
        };
        this.push('activity', group);
        this.$.request.path = `user/${this.user.id}/group/${group.name}`;
        this.$.request.post().then((response) => {
          this.user = response;
          this._toast(this.i18n('userManagement.addedUserToGroup', this.user.id, group.name));
        });
      }
      this.selectedGroup = null;
    }

    _remove() {
      const group = this._removedGroup;
      this.$.request.path = `user/${this.user.id}/group/${group.name}`;
      return this.$.request.remove().then(() => {
        this._removeRecent(group.name);
        this._removeFromGroup(group.name);
        this._toast(this.i18n('userManagement.removedUserFromGroup', this.user.id, group.name));
      });
    }

    _removeRecent(group) {
      // remove from 'recent', if it exists
      for (let i = 0; i < this.activity.length; i++) {
        if (this.activity[i].name === group) {
          this.splice('activity', i, 1);
          return;
        }
      }
    }

    _removeFromGroup(group) {
      // DELETE request does not return the user object, so when we remove
      // we need to manually update the user model and the list of groups
      const idx = this.user.properties.groups.indexOf(group);
      this.user.properties.groups.splice(idx, 1);
      for (let i = 0; i < this.groups.length; i++) {
        if (this.groups[i].name === group) {
          this.splice('groups', i, 1);
          return;
        }
      }
    }

    _userRemovedFromGroup() {
      this.empty = this.groups && this.groups.length === 0;
    }

    _toggleEditGroups() {
      this.showEditGroups = !this.showEditGroups;
    }

    _toggleDialog(e) {
      this._removedGroup = e.model.item;
      this.$.dialog.toggle();
    }

    _toggleChangePassword() {
      if (this.$.passwordEditor.resetFields) {
        this.$.passwordEditor.resetFields();
      }
      this.$.changePasswordDialog.toggle();
    }

    _submitChangePassword() {
      this.$.changePasswordForm.submit();
    }

    _savePassword() {
      this.$.editRequest.data = JSON.parse(JSON.stringify(this.user));
      this.$.editRequest.data.properties.password = this.$.passwordEditor.password;
      this.$.editRequest
        .put()
        .then((response) => {
          this.user = response;
          this._toast(this.i18n('userManagement.password.changed'));
          this.$.changePasswordDialog.toggle();
        })
        .catch(() => {
          this._toast(this.i18n('userProfile.password.error'));
        });
    }

    _toggleEditUser() {
      this.$.layout.model = { user: JSON.parse(JSON.stringify(this.user.properties)) };
      this.$.editUserDialog.toggle();
    }

    _submitEditUser() {
      this.$.editUserForm.submit();
    }

    _saveUser() {
      this.$.editUserDialog.toggle();
      const editedUser = JSON.parse(JSON.stringify(this.user));
      editedUser.properties = this.$.layout.model.user;
      this.$.editRequest.data = editedUser;
      this.$.editRequest.put().then((response) => {
        this.user = response;
        this._toast(this.i18n('userManagement.user.updated'));
      });
    }

    _toggleDeleteUser() {
      this.$.deleteUserDialog.toggle();
    }

    _deleteUser() {
      this.$.deleteUserDialog.toggle();
      this.$.editRequest.remove().then(() => {
        this.dispatchEvent(
          new CustomEvent('nuxeo-user-deleted', {
            composed: true,
            bubbles: true,
            detail: this.user,
          }),
        );
        this._goHome();
      });
    }

    _goHome() {
      this.dispatchEvent(
        new CustomEvent('goHome', {
          composed: true,
          bubbles: true,
        }),
      );
    }

    _resultsFilter(entry) {
      for (let i = 0; i < this.groups.length; i++) {
        if (entry.id === this.groups[i].name) {
          return false;
        }
      }
      return true;
    }

    _toast(msg) {
      this.$.toast.text = msg;
      this.$.toast.open();
    }

    _layoutHref(layout) {
      return this.resolveUrl(layout);
    }
  }

  customElements.define(UserManagement.is, UserManagement);
  Nuxeo.UserManagement = UserManagement;
}
