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
        margin: 0 0 .8em;
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

      .table-actions {
        width: 3em;
      }

      .table {
        border: 1px solid var(--nuxeo-border, #eee);
      }

      h3 iron-icon {
         width: 1.3em;
         margin-right: .2rem;
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
    </style>

    <nuxeo-resource
      id="latestCreatedUsersGroups"
      auto
      path="/query/LATEST_CREATED_USERS_OR_GROUPS_PROVIDER"
      response="{{latestCreatedUsersGroups}}"
      headers="{&quot;properties&quot;: &quot;*&quot;}">
    </nuxeo-resource>

    <nuxeo-card icon="nuxeo:recent" heading="[[i18n('userGroupLatest.recentlyCreated')]]">
      <div class="table">
        <div class="table-header">
          <div class="flex">[[i18n('userGroupLatest.name')]]</div>
          <div class="flex-2">[[i18n('userGroupLatest.identifier')]]</div>
          <div class="table-actions">
            <paper-icon-button noink="" icon="nuxeo:refresh" on-click="_refreshLatest"></paper-icon-button>
          </div>
        </div>
        <div class="table-rows">
          <dom-repeat items="[[latestCreatedUsersGroups.entries]]" as="item">
            <template>
              <div class="table-row" on-click="_manageUserOrGroup">
                <div class="flex">
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
                <div class="flex-2 preserve-white-space">[[item.uid]]</div>
                <div class="table-actions"></div>
              </div>
            </template>
          </dom-repeat>
          <dom-if if="[[_empty(latestCreatedUsersGroups.entries)]]">
            <template>
              <div class="table-row">
                <div class="emptyResult">[[i18n('userGroupLatest.emptyRecentUserOrGroup')]]</div>
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
      };
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
      return user.properties['user:firstName'] || user.properties['user:lastName'];
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
      } else if (this._isGroup(docModel)) {
        return docModel.properties['group:grouplabel'];
      }
    }

    _manageUserOrGroup(e) {
      if (this._isUser(e.model.item)) {
        this.dispatchEvent(new CustomEvent('manageUser', {
          composed: true,
          bubbles: true,
          detail: { user: e.model.item.uid },
        }));
      } else if (this._isGroup(e.model.item)) {
        this.dispatchEvent(new CustomEvent('manageGroup', {
          composed: true,
          bubbles: true,
          detail: { group: e.model.item.uid },
        }));
      }
    }

    _refreshLatest() {
      this.latestCreatedUsersGroups = {};
      this.$.latestCreatedUsersGroups.execute();
    }

    _refreshLatestWithDelay() {
      setTimeout(() => {
        // audit is on es backend -> async
        // Let's give it 1 sec to index
        // (dirty, I know ..)
        this._refreshLatest();
      }, 1000);
    }
  }

  customElements.define(UserGroupLatest.is, UserGroupLatest);
  Nuxeo.UserGroupLatest = UserGroupLatest;
}
