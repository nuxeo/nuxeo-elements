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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import 'moment/src/moment.js';
import '../nuxeo-pagination-controls.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-tag.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  /**
   * An element to list the permissions of an entity.
   *
   * Example:
   *
   *     <nuxeo-user-group-permissions-table entity="Administrator"></nuxeo-user-group-permissions-table>
   *
   * Example:
   *
   *     <nuxeo-user-group-permissions-table entity="members"></nuxeo-user-group-permissions-table>
   *
   * Used by `nuxeo-user-group-management`
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   */
  class UserGroupPermissionsTable extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="iron-flex iron-flex-factors">
      :host {
        display: block;
      }

      paper-button:hover {
        @apply --nx-button-hover;
      }

      paper-button.primary {
        @apply --nx-button-primary;
      }

      paper-button.primary:hover,
      paper-button.primary:focus {
        @apply --nx-button-primary-hover;
      }

      h3 {
        @apply --layout-flex;
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

      .ace-row > div {
        padding: .2em 0;
      }

      .table-headers > div {
        background-color: var(--nuxeo-table-header-background,#f8f9fb);
        font-weight: bold;
      }

      .table-actions {
        width: 50px;
      }

      .ace-permission-tag {
        background-color: var(--nuxeo-secondary-color, #7e90a5);
        border-radius: 3px;
        color: #fff;
        margin: 0 .2em .2em 0;
        padding: .06em .3em;
        text-transform: uppercase;
        white-space: nowrap;
        @apply --nuxeo-tag;
      }

      .ace-permission-path {
        color: var(--nuxeo-secondary-color, #213f7d);
        font-size: .8rem;
      }

      .buttons {
        @apply --buttons-bar;
      }

      .confirm {
        padding: 2em;
        font-size: 1.1em;
      }

      .emptyResult {
        opacity: .5;
        display: block;
        font-weight: 300;
        padding: 1.5em .7em;
        text-align: center;
      }
    </style>

    <nuxeo-operation id="permissions" op="Repository.Query" enrichers="acls"></nuxeo-operation>
    <nuxeo-operation id="rmPermission" op="Document.RemovePermission"></nuxeo-operation>

    <dom-if if="[[label]]">
      <template>
        <div class="layout horizontal center">
          <h3>[[label]]</h3>
        </div>
      </template>
    </dom-if>

    <div class="table">
      <div class="table-header">
        <div class="flex-3">[[i18n('userGroupPermissions.on')]]</div>
        <div class="flex-6 layout horizontal">
          <div class="flex-2">[[i18n('userGroupPermissions.right')]]</div>
          <div class="flex-2">[[i18n('userGroupPermissions.timeFrame')]]</div>
          <div class="flex-2">[[i18n('userGroupPermissions.grantedBy')]]</div>
          <div class="table-actions"></div>
        </div>
      </div>
      <dom-if if="[[!empty]]">
        <template>
          <dom-repeat items="[[documents]]" as="document">
            <template>
              <div class="table-row">
                <div class="flex-3">
                  <div>[[document.title]]</div>
                  <div class="ace-permission-path">[[document.path]]</div>
                </div>
                <div class="layout vertical flex-6 ace-row">
                  <dom-repeat items="[[document.aces]]" as="ace">
                    <template>
                      <div class="layout horizontal center">
                        <div class="flex-2">
                          <span class="ace-permission-tag">[[ace.permission]]</span>
                        </div>
                        <div class="flex-2">
                          <span>[[ace.timeFrame]]</span>
                        </div>
                        <div class="flex-2">
                          <dom-if if="[[ace.creator]]">
                            <template>
                              <nuxeo-tag icon="nuxeo:group">[[ace.creator]]</nuxeo-tag>
                            </template>
                          </dom-if>
                        </div>
                        <div class="table-actions">
                          <dom-if if="[[!readonly]]">
                            <template>
                              <paper-icon-button
                                icon="nuxeo:delete"
                                noink
                                title="[[i18n('userGroupPermissions.delete.button')]]"
                                on-click="_toggleDialog"
                                hidden\$="[[!_canDelete(ace)]]">
                              </paper-icon-button>
                            </template>
                          </dom-if>
                        </div>
                      </div>
                    </template>
                  </dom-repeat>
                </div>
              </div>
            </template>
          </dom-repeat>
        </template>
      </dom-if>
      <dom-if if="[[empty]]">
        <template>
          <div class="table-row">
            <div class="emptyResult">[[i18n('userGroupPermissions.noPermissions', entity)]]</div>
          </div>
        </template>
      </dom-if>
    </div>
    <nuxeo-pagination-controls page="{{_currentPage}}" number-of-pages="[[_numberOfPages]]"></nuxeo-pagination-controls>

    <nuxeo-dialog id="dialog" with-backdrop="">
      <h2>[[i18n('userGroupPermissions.delete.confirm')]]</h2>
      <div class="buttons horizontal end-justified layout">
        <div class="flex start-justified">
          <paper-button noink="" dialog-dismiss="">[[i18n('label.no')]]</paper-button>
        </div>
        <paper-button class="primary" noink dialog-confirm on-click="_deleteAce">[[i18n('label.yes')]]</paper-button>
      </div>
    </nuxeo-dialog>
`;
    }

    static get is() {
      return 'nuxeo-user-group-permissions-table';
    }

    static get properties() {
      return {
        label: String,

        entity: String,

        documents: Array,

        /**
         * If true, also displays inherited permissions. Otherwise, only displays local permissions.
         */
        displayInherited: {
          type: Boolean,
          value: false,
        },

        empty: Boolean,

        _deletedAce: Object,

        _currentPage: {
          type: Number,
          value: 1,
        },

        pageSize: {
          type: Number,
          value: 25,
        },

        _numberOfPages: Number,

        readonly: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },
      };
    }

    static get observers() {
      return [
        '_fetchPermissions(entity, _currentPage)',
      ];
    }

    _fetchPermissions() {
      this.$.permissions.params = {
        query: `${'SELECT * FROM Document WHERE ecm:mixinType != "HiddenInNavigation"' +
          'AND ecm:isProxy = 0 AND ecm:isVersion = 0 ' +
          'AND ecm:isTrashed = 0' +
          'AND ecm:acl/*1/principal = "'}${this.entity}"`,
        page: this._currentPage - 1,
        pageSize: this.pageSize,
      };
      // header for compat with 6.0
      this.$.permissions.headers = {
        'X-NXContext-Category': 'acls',
      };
      this.$.permissions.execute().then((response) => {
        this._numberOfPages = response.numberOfPages;
        this._computePermissions(response.entries);
      });
    }

    _computePermissions(entries) {
      entries.forEach((entry) => {
        entry.aces = [];
        entry.contextParameters.acls.map((acl) => {
          // in 6.0 the ace object is called 'ace' while in > 7.10 its called 'aces'
          const entryAces = acl.aces || acl.ace;
          return entryAces.forEach((ace) => {
            if (!this.displayInherited && this._isInherited(acl)) {
              return;
            }
            if (this._aceBelongsToEntity(ace)) {
              ace.docId = entry.uid;
              ace.docTitle = entry.title;
              ace.docPath = entry.path;
              ace.timeFrame = this._formatTimeFrame(ace);
              entry.aces.push(ace);
            }
          });
        });
      });
      this.documents = entries;
      this.empty = this.documents.length === 0;
    }

    _aceBelongsToEntity(ace) {
      return ace.username === this.entity;
    }

    _formatTimeFrame(ace) {
      const now = moment();
      const begin = ace.begin || null;
      const end = ace.end || null;
      const format = 'D MMM YYYY';
      const sinceStr = `${this.i18n('userGroupPermissions.since')} `;
      const fromStr = `${this.i18n('userGroupPermissions.from')} `;
      const untilStr = `${this.i18n('userGroupPermissions.until')} `;
      const untilMiddleStr = ` ${this.i18n('userGroupPermissions.untilMiddle')} `;
      if (begin !== null && end === null) {
        return (now.isAfter(begin) ? sinceStr : fromStr) + moment(begin).format(format);
      } else if (begin === null && end !== null) {
        return untilStr + moment(end).format(format);
      } else if (begin !== null && end !== null) {
        return (now.isAfter(begin) ? sinceStr : fromStr) + moment(begin).format(format) + untilMiddleStr
            + moment(end).format(format);
      } else {
        return this.i18n('userGroupPermissions.permanent');
      }
    }

    _deleteAce() {
      const ace = this._deletedAce;
      this.$.rmPermission.input = ace.docId;
      this.$.rmPermission.params = {
        id: ace.id,
      };
      this.$.rmPermission.execute().then(() => {
        this._fetchPermissions();
      });
    }

    _isInherited(acl) {
      return acl.name === 'inherited';
    }

    _toggleDialog(e) {
      this._deletedAce = e.model.ace;
      this.$.dialog.toggle();
    }

    _canDelete(ace) {
      return !!ace.id;
    }
  }

  customElements.define(UserGroupPermissionsTable.is, UserGroupPermissionsTable);
  Nuxeo.UserGroupPermissionsTable = UserGroupPermissionsTable;
}
