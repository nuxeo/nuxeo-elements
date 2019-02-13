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
import '@polymer/iron-icons/editor-icons.js';
import '@polymer/iron-icons/iron-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@nuxeo/nuxeo-elements/nuxeo-document.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-styles/paper-styles.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../widgets/nuxeo-card.js';
import './nuxeo-document-acl-table.js';
import './nuxeo-popup-confirm.js';
import './nuxeo-popup-permission.js';

{
  /**
   * An element providing document permissions management
   *
   *     <nuxeo-document-permissions doc-path="/default-domain"></nuxeo-document-permissions>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-document-permissions/index.html
   */
  class DocumentPermissions extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>

      nuxeo-card {
        position: relative;
      }

      nuxeo-card .actions {
        position: absolute;
        top: 16px;
        right: 16px;
      }

      nuxeo-card .content {
        margin-top: 32px;
      }

      .tip {
        display: block;
        opacity: .5;
        border-left: 4px solid var(--nuxeo-warn-text, #333);
        margin-bottom: 8px;
        padding: 8px;
      }

      .emptyResult {
        display: block;
        opacity: .5;
        font-weight: 300;
        padding: 8px;
        text-align: center;
      }

      [hidden] {
        display: none !important;
      }
    </style>

    <nuxeo-document
      id="doc"
      doc-id="{{docId}}"
      doc-path="{{docPath}}"
      response="{{doc}}"
      loading="{{loading}}"
      enrichers="acls, permissions, userVisiblePermissions"
      params="{{params}}"></nuxeo-document>

    <!-- Local permissions -->
    <nuxeo-card heading="[[i18n('documentPermissions.locallyDefined')]]">
      <dom-if if="[[_hasPermission(doc,'Everything')]]">
        <template>
          <div class="actions">
            <nuxeo-popup-permission
              id="localPermissions"
              doc-id="{{doc.uid}}"
              user-visible-permissions="{{doc.contextParameters.userVisiblePermissions}}">
            </nuxeo-popup-permission>
          </div>
        </template>
      </dom-if>
      <div class="content">
        <nuxeo-document-acl-table
          doc="[[doc]]"
          acl-filter="_excludeInheritedAcls"
          ace-filter="_excludeExternalUserAces"
          show-actions="[[_hasPermission(doc,'Everything')]]">
          <div slot="emptyResult" class="emptyResult">
            [[_emptyLabel('documentPermissions.noLocalPermissions', loading, i18n)]]
          </div>
        </nuxeo-document-acl-table>
      </div>
    </nuxeo-card>

    <!-- Inherited permissions -->
    <nuxeo-card heading="[[i18n('documentPermissions.inherited')]]">
      <dom-if if="[[_hasPermission(doc,'Everything')]]">
        <template>
          <div class="actions">
            <dom-if if="[[!_empty(inheritedAces)]]">
              <template>
                <paper-button id="block" on-click="blockInheritance">
                  [[i18n('documentPermissions.block')]]
                </paper-button>
              </template>
            </dom-if>
            <dom-if if="[[_empty(inheritedAces)]]">
              <template>
                <paper-button id="unblock" on-click="unblockInheritance">
                  [[i18n('documentPermissions.unblock')]]
                </paper-button>
              </template>
            </dom-if>
          </div>
        </template>
      </dom-if>
      <div class="content">
        <div class="tip" hidden\$="[[_empty(inheritedAces)]]">[[i18n('documentPermissions.blockDescription')]]</div>
        <nuxeo-document-acl-table
          doc="[[doc]]"
          aces="{{inheritedAces}}"
          acl-filter="_onlyInheritedAcls"
          show-actions="false">
          <div slot="emptyResult" class="emptyResult">
            [[_emptyLabel('documentPermissions.noInheritedText', loading, i18n)]]
          </div>
        </nuxeo-document-acl-table>
      </div>
    </nuxeo-card>

    <!-- External users permissions -->
    <nuxeo-card heading="[[i18n('documentPermissions.external')]]">
      <dom-if if="[[_hasPermission(doc, 'Everything')]]">
        <template>
          <div class="actions">
            <nuxeo-popup-permission
              id="externalPermissions"
              doc-id="{{doc.uid}}"
              user-visible-permissions="{{doc.contextParameters.userVisiblePermissions}}"
              share-with-external="true">
            </nuxeo-popup-permission>
          </div>
        </template>
      </dom-if>

      <div class="content">
        <div class="tip">[[i18n('documentPermissions.externalDescription')]]</div>
        <nuxeo-document-acl-table
          doc="[[doc]]"
          ace-filter="_onlyExternalUserAces"
          acl-filter="_excludeInheritedAcls"
          show-actions="[[_hasPermission(doc,'Everything')]]"
          share-with-external="true">
          <div slot="emptyResult" class="emptyResult">
            [[_emptyLabel('documentPermissions.noExternalPermission', loading, i18n)]]
          </div>
        </nuxeo-document-acl-table>
      </div>
    </nuxeo-card>

    <nuxeo-operation id="blockOp" op="Document.BlockPermissionInheritance" input="{{doc.uid}}"></nuxeo-operation>
    <nuxeo-operation id="unblockOp" op="Document.UnblockPermissionInheritance" input="{{doc.uid}}"></nuxeo-operation>

    <paper-toast id="toast"></paper-toast>
`;
    }

    static get is() {
      return 'nuxeo-document-permissions';
    }

    static get properties() {
      return {
        doc: {
          type: Object,
          value: null,
        },
        docId: {
          type: String,
          value: '',
        },
        docPath: {
          type: String,
          value: '',
        },
        params: {
          type: Object,
          value: {
            'fetch.acls': 'username,creator,extended',
            depth: 'children',
            time: new Date().getTime(),
          },
        },
        visible: {
          type: Boolean,
          value: false,
          observer: 'refresh',
        },
      };
    }

    ready() {
      super.ready();
      this.addEventListener('acecreated', this.onACECreated);
      this.addEventListener('aceupdated', this.onACEUpdated);
      this.addEventListener('acedeleted', this.onACEDeleted);
      this.addEventListener('notification', this.onNotification);
    }

    refresh() {
      if (this.visible) {
        this.doc = null;
        this.params.time = new Date().getTime();
        this.$.doc.get().then(() => {
          this.dispatchEvent(new CustomEvent('iron-resize', {
            composed: true,
            bubbles: true,
          }));
        });
      }
    }

    onACECreated() {
      this.$.toast.text = this.i18n('documentPermissions.permissionCreated');
      this.$.toast.show();
      this.refresh();
    }

    onACEUpdated() {
      this.$.toast.text = this.i18n('documentPermissions.permissionUpdated');
      this.$.toast.show();
      this.refresh();
    }

    onACEDeleted() {
      this.$.toast.text = this.i18n('documentPermissions.permissionDeleted');
      this.$.toast.show();
      this.refresh();
    }

    onNotification() {
      this.$.toast.text = this.i18n('documentPermissions.permissionNotificationSent');
      this.$.toast.show();
    }

    _hasPermission() {
      const permissions = this.doc && this.doc.contextParameters && this.doc.contextParameters.permissions;
      return permissions && permissions.indexOf('Everything') !== -1;
    }

    _empty(arr) {
      return arr.length === 0;
    }

    _excludeInheritedAcls(acl) {
      return acl.name !== 'inherited';
    }

    _onlyInheritedAcls(acl) {
      return acl.name === 'inherited';
    }

    _excludeExternalUserAces(ace) {
      return ace.granted && (ace.status === 'pending' || ace.status === 'effective') && ace.externalUser === false;
    }

    _onlyExternalUserAces(ace) {
      return ace.granted && (ace.status === 'pending' || ace.status === 'effective') && ace.externalUser === true;
    }

    blockInheritance() {
      this.$.blockOp.execute().then(this.refresh.bind(this));
    }

    unblockInheritance() {
      this.$.unblockOp.execute().then(this.refresh.bind(this));
    }

    _emptyLabel(label, loading) {
      return loading ? this.i18n('label.loading') : this.i18n(label);
    }
  }

  customElements.define(DocumentPermissions.is, DocumentPermissions);
  Nuxeo.DocumentPermissions = DocumentPermissions;
}
