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
import moment from '@nuxeo/moment';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import { FormatBehavior } from '../nuxeo-format-behavior.js';
import './nuxeo-popup-confirm.js';
import './nuxeo-popup-permission.js';

/* eslint-disable prefer-spread, prefer-rest-params */
{
  /**
   * Element displaying a table with document ACLs.
   *
   *     <nuxeo-document-acl-table doc="[[doc]]"></nuxeo-document-acl>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   */
  class DocumentACLTable extends mixinBehaviors([I18nBehavior, FormatBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          .acl-table-headers {
            @apply --layout-horizontal;
            @apply --layout-center;
            background-color: var(--nuxeo-table-header-background, #fafafa);
            color: var(--nuxeo-text-default, rgba(0, 0, 0, 0.54));
            font-weight: 700;
            min-height: 48px;
            padding: 0 0 0 12px;
            border-bottom: 2px solid var(--nuxeo-border, #eee);
            box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.2) inset;
          }

          .acl-table-row {
            @apply --layout-horizontal;
            @apply --layout-center;
            border-bottom: 1px solid var(--nuxeo-border, #e3e3e3);
            background-color: var(--nuxeo-table-items-background, #fafafa);
            cursor: pointer;
            min-height: 48px;
            padding: 0 0 0 12px;
          }

          .acl-table-row:hover {
            background: var(--nuxeo-container-hover, #fafafa);
          }

          .acl-table {
            border: 1px solid var(--nuxeo-border, #eee);
          }

          .acl-table-row:last-of-type {
            border-bottom: none;
          }

          .table-headers > div {
            background-color: var(--nuxeo-table-header-background, #f8f9fb);
            font-weight: bold;
          }

          .buttons {
            @apply --buttons-bar;
          }

          .emptyResult {
            opacity: 0.5;
            display: block;
            font-weight: 300;
            padding: 1.5em 0.7em;
            text-align: center;
          }

          .flex-2 {
            @apply --layout-flex-2;
          }
        </style>

        <div hidden$="[[!_empty(aces)]]">
          <slot name="emptyResult"></slot>
        </div>

        <dom-if if="[[!_empty(aces)]]">
          <template>
            <div class="acl-table">
              <div class="acl-table-headers">
                <div class="flex-2 tmp-tab">[[i18n('documentAclTable.userGroup')]]</div>
                <div class="flex-2 tmp-tab">[[i18n('documentAclTable.right')]]</div>
                <div class="flex-2 tmp-tab">[[i18n('documentAclTable.timeFrame')]]</div>
                <div class="flex-2 tmp-tab">[[i18n('documentAclTable.grantedBy')]]</div>
                <dom-if if="[[showActions]]">
                  <template>
                    <div class="flex-2 tmp-tab">[[i18n('documentAclTable.actions')]]</div>
                  </template>
                </dom-if>
              </div>
              <dom-repeat items="[[aces]]" as="ace" sort="_sortAces" strip-whitespace>
                <template>
                  <div class$="acl-table-row [[ace.status]]">
                    <div class="flex-2">
                      <span class$="[[entityClass(ace.username)]]" title="[[entityTooltip(ace.username)]]">
                        [[entityDisplay(ace.username)]]
                      </span>
                    </div>
                    <div class="flex-2">
                      <span class="label">[[formatPermission(ace.permission, i18n)]]</span>
                    </div>
                    <div class="flex-2"><span>{{formatTimeFrame(ace)}}</span></div>
                    <div class="flex-2">
                      <span class$="[[entityClass(ace.creator)]]" title="[[entityTooltip(ace.creator)]]">
                        [[entityDisplay(ace.creator)]]
                      </span>
                    </div>
                    <dom-if if="[[showActions]]">
                      <template>
                        <div class="flex-2">
                          <nuxeo-popup-permission
                            doc-id="{{doc.uid}}"
                            ace="{{ace}}"
                            user-visible-permissions="{{doc.contextParameters.userVisiblePermissions}}"
                            share-with-external="[[shareWithExternal]]"
                          >
                          </nuxeo-popup-permission>
                          <dom-if if="[[shareWithExternal]]">
                            <template>
                              <paper-icon-button
                                icon="nuxeo:send"
                                on-click="sendEmailExternalSharing"
                                aria-label$="[[i18n('popupPermission.notify')]]"
                              ></paper-icon-button>
                            </template>
                          </dom-if>
                          <paper-icon-button
                            icon="nuxeo:delete"
                            on-click="_deleteAce"
                            aria-label$="[[i18n('command.delete')]]"
                          ></paper-icon-button>
                          <nuxeo-popup-confirm
                            id="confirmation"
                            delete-label="[[i18n('command.delete')]]"
                            cancel-label="[[i18n('documentAclTable.cancel')]]"
                          >
                            <div>
                              <h2>[[i18n('documentAclTable.deleteConfirmation')]]</h2>
                              <div class="acl-table">
                                <div class="acl-table-headers">
                                  <div class="flex-2 tmp-tab">[[i18n('documentAclTable.userGroup')]]</div>
                                  <div class="flex-2 tmp-tab">[[i18n('documentAclTable.right')]]</div>
                                  <div class="flex-2 tmp-tab">[[i18n('documentAclTable.timeFrame')]]</div>
                                  <div class="flex-2 tmp-tab">[[i18n('documentAclTable.grantedBy')]]</div>
                                </div>
                                <div class$="acl-table-row [[ace.status]]">
                                  <div class="flex-2">
                                    <span
                                      class$="[[entityClass(ace.username)]]"
                                      title="[[entityTooltip(ace.username)]]"
                                    >
                                      [[entityDisplay(ace.username)]]
                                    </span>
                                  </div>
                                  <div class="flex-2">
                                    <span class="label">[[formatPermission(ace.permission, i18n)]]</span>
                                  </div>
                                  <div class="flex-2"><span>{{formatTimeFrame(ace)}}</span></div>
                                  <div class="flex-2">
                                    <span class$="[[entityClass(ace.creator)]]" title="[[entityTooltip(ace.creator)]]">
                                      [[entityDisplay(ace.creator)]]
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </nuxeo-popup-confirm>
                        </div>
                      </template>
                    </dom-if>
                  </div>
                </template>
              </dom-repeat>
            </div>
          </template>
        </dom-if>

        <nuxeo-operation id="rmPermission" op="Document.RemovePermission" input="{{doc.uid}}"></nuxeo-operation>
        <nuxeo-operation
          id="sendNotificationEmailPermissionOp"
          op="Document.SendNotificationEmailForPermission"
          input="{{doc.uid}}"
        >
        </nuxeo-operation>
      `;
    }

    static get is() {
      return 'nuxeo-document-acl-table';
    }

    static get properties() {
      return {
        doc: {
          type: Object,
        },
        aclFilter: {
          type: Function,
          observer: 'aclFilterChanged',
        },
        aceFilter: {
          type: Function,
          observer: 'aceFilterChanged',
        },
        shareWithExternal: {
          type: Object, // Boolean
          value: false,
        },
        aces: {
          type: Array,
          value() {
            return [];
          },
          notify: true,
        },
        showActions: {
          type: Object, // Boolean
          value: false,
        },
      };
    }

    static get observers() {
      return ['_updateAces(doc)'];
    }

    aclFilterChanged(fn) {
      this._aclFilter =
        fn &&
        function() {
          return this.__dataHost[fn].apply(this.__dataHost, arguments);
        };
      this._updateAces();
    }

    aceFilterChanged(fn) {
      this._aceFilter =
        fn &&
        function() {
          return this.__dataHost[fn].apply(this.__dataHost, arguments);
        };
      this._updateAces();
    }

    _updateAces() {
      let acls = this.doc && this.doc.contextParameters && this.doc.contextParameters.acls;
      if (!acls) return;
      if (this._aclFilter) {
        acls = acls.filter(this._aclFilter.bind(this));
      }
      const aces = [];
      acls.forEach((acl) => {
        acl.aces.forEach((ace) => {
          if (this._aceFilter(ace)) {
            ace.aclName = acl.name;
            aces.push(ace);
          }
        });
      });

      this.aces = aces.sort(this._sortAces);
    }

    _aclFilter(acl) {
      return acl.name !== 'inherited';
    }

    _aceFilter(ace) {
      return ace.granted && (ace.status === 'pending' || ace.status === 'effective');
    }

    _sortAces(a, b) {
      if (a.begin === null) {
        return -1;
      }
      if (b.begin === null) {
        return 1;
      }
      const aBegin = moment(a.begin);
      const bBegin = moment(b.begin);
      return aBegin.isBefore(bBegin) ? -1 : 1;
    }

    _deleteAce(e) {
      const popup = e.currentTarget.parentElement.querySelector('nuxeo-popup-confirm');
      popup.toggle(() => {
        this.$.rmPermission.params = {
          id: e.model.ace.id,
          acl: e.model.ace.aclName,
        };
        this.$.rmPermission.execute().then(() => {
          this.dispatchEvent(
            new CustomEvent('acedeleted', {
              composed: true,
              bubbles: true,
            }),
          );
        });
      });
    }

    formatTimeFrame(ace) {
      const now = moment();
      const { begin } = ace;
      const { end } = ace;
      const format = 'D MMM YYYY';

      const sinceStr = `${this.i18n('documentAclTable.since')} `;
      const fromStr = `${this.i18n('documentAclTable.from')} `;
      const untilStr = `${this.i18n('documentAclTable.until')} `;
      const untilMiddleStr = ` ${this.i18n('documentAclTable.untilMiddle')} `;

      if (begin !== null && end === null) {
        return (now.isAfter(begin) ? sinceStr : fromStr) + moment(begin).format(format);
      }
      if (begin === null && end !== null) {
        return untilStr + moment(end).format(format);
      }
      if (begin !== null && end !== null) {
        return (
          (now.isAfter(begin) ? sinceStr : fromStr) +
          moment(begin).format(format) +
          untilMiddleStr +
          moment(end).format(format)
        );
      }
      return this.i18n('documentAclTable.permanent');
    }

    entityDisplay(entity) {
      if (!entity) {
        return '';
      }

      if (typeof entity === 'object') {
        if (entity['entity-type'] === 'user') {
          const { id } = entity;
          const first = entity.properties.firstName;
          const last = entity.properties.lastName;
          if (first === null || first.length === 0) {
            if (last === null || last.length === 0) {
              return id;
            }
            return last;
          }
          if (last === null || last.length === 0) {
            return first;
          }
          return `${first} ${last}`;
        }
        if (entity['entity-type'] === 'group') {
          const groupLabel = entity.grouplabel;
          return groupLabel !== null && groupLabel.length > 0 ? groupLabel : entity.groupname;
        }
      }
      return entity;
    }

    entityClass(entity) {
      if (!entity) {
        return '';
      }

      if (typeof entity === 'object') {
        if (entity['entity-type'] === 'user') {
          return 'tag user';
        }
        if (entity['entity-type'] === 'group') {
          return 'tag group';
        }
      }
      return '';
    }

    entityTooltip(entity) {
      if (!entity) {
        return '';
      }

      if (typeof entity === 'object') {
        if (entity['entity-type'] === 'user') {
          const { email } = entity.properties;
          return entity.id + (email !== null && email.length > 0 ? ` - ${email}` : '');
        }
        if (entity['entity-type'] === 'group') {
          return entity.groupname;
        }
      }
      return entity;
    }

    sendEmailExternalSharing(e) {
      this.$.sendNotificationEmailPermissionOp.params = {
        id: e.model.ace.id,
      };
      this.$.sendNotificationEmailPermissionOp.execute().then(() => {
        this.dispatchEvent(
          new CustomEvent('notification', {
            composed: true,
            bubbles: true,
          }),
        );
      });
    }

    _empty(arr) {
      return arr.length === 0;
    }
  }

  customElements.define(DocumentACLTable.is, DocumentACLTable);
  Nuxeo.DocumentACLTable = DocumentACLTable;
}
