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
import '@polymer/iron-autogrow-textarea/iron-autogrow-textarea.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../widgets/nuxeo-date-picker.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-select.js';
import '../widgets/nuxeo-textarea.js';
import '../widgets/nuxeo-user-suggestion.js';

{
  /* Part of `nuxeo-document-permissions` */
  class PopupPermission extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="iron-positioning">
      /* Fix polyfill behavior for inputs disabled at initialization */
      span.btr-dateinput-value {
         color: #212121 !important;
         line-height: 35px !important;
      }

      .buttons {
        background-color: var(--nuxeo-dialog-buttons-bar, white);
        @apply --buttons-bar;
        margin-top: 2em;
      }

    </style>
    <nuxeo-operation
      id="createOp"
      op="Document.AddPermission"
      input="{{docId}}"
      params="{{params}}"
      on-response="handleResponse">
    </nuxeo-operation>
    <nuxeo-operation
      id="replaceOp"
      op="Document.ReplacePermission"
      input="{{docId}}"
      params="{{params}}"
      on-response="handleResponse">
    </nuxeo-operation>

    <dom-if if="{{!updatingACE}}">
      <template>
        <paper-button on-click="togglePopup" id="newPermissionButton">
          [[i18n('popupPermission.newPermission')]]
        </paper-button>
      </template>
    </dom-if>
    <dom-if if="{{updatingACE}}">
      <template>
        <paper-icon-button on-click="togglePopup" icon="nuxeo:edit"></paper-icon-button>
      </template>
    </dom-if>

    <nuxeo-dialog id="popupRight" with-backdrop="" no-auto-focus="">
      <h2>[[_computedTitle]]</h2>

      <!-- Give access to row -->
      <paper-dialog-scrollable>
        <div hidden\$="{{updatingACE}}">
          <div hidden\$="{{shareWithExternal}}">
            <nuxeo-user-suggestion
              name="userGroup"
              label="[[i18n('popupPermission.userGroup')]]"
              value="{{params.users}}"
              placeholder="[[i18n('popupPermission.userGroup.placeholder')]]" multiple>
            </nuxeo-user-suggestion>
          </div>
          <div hidden\$="{{!shareWithExternal}}">
            <nuxeo-input
              type="email"
              id="email"
              label="[[i18n('popupPermission.email')]]"
              placeholder="name@company.com"
              value="{{params.email}}"
              required
              auto-validate>
            </nuxeo-input>
          </div>
        </div>
        <!-- Right row -->
        <div>
          <nuxeo-select
            label="[[i18n('popupPermission.right')]]"
            name="right"
            selected="{{params.permission}}"
            options="[[userVisiblePermissions]]">
          </nuxeo-select>
        </div>
        <div>
          <dom-if if="{{!shareWithExternal}}">
            <template>
              <label>[[i18n('popupPermission.timeFrame')]]</label>
              <paper-radio-group selected="{{selectedTimeFrame}}">
                <paper-radio-button noink="" name="permanent">
                  [[i18n('popupPermission.permanent')]]
                </paper-radio-button>
                <paper-radio-button noink="" name="datebased">
                  [[i18n('popupPermission.dateBased')]]
                </paper-radio-button>
              </paper-radio-group>
            </template>
          </dom-if>
          <div>
            <nuxeo-date-picker
              id="begin"
              label="[[i18n('popupPermission.from')]]"
              value="{{params.begin}}"
              disabled="[[permissionIsPermanent]]">
            </nuxeo-date-picker>
          </div>
          <div>
            <nuxeo-date-picker
              id="end"
              label="[[i18n('popupPermission.to')]]"
              value="{{params.end}}"
              disabled="[[permissionIsPermanent]]"
              required="[[shareWithExternal]]">
            </nuxeo-date-picker>
          </div>
        </div>
        <div id="notification">
          <dom-if if="{{!shareWithExternal}}">
            <template>
              <div>
                <paper-checkbox noink="" checked="{{params.notify}}" name="notify">
                  [[i18n('popupPermission.notify')]]
                </paper-checkbox>
              </div>
            </template>
          </dom-if>
          <div>
            <nuxeo-textarea
              label="[[i18n('popupPermission.notifyLabel')]]"
              placeholder="[[i18n('popupPermission.notifyPlaceholder')]]"
              disabled="[[!params.notify]]"
              name="notifyEmail"
              id="commentText"
              value="{{params.comment}}"
              max-rows="4">
            </nuxeo-textarea>
          </div>
        </div>
      </paper-dialog-scrollable>

      <div class="buttons">
        <paper-button dialog-dismiss="">[[i18n('popupPermission.cancel')]]</paper-button>
        <dom-if if="{{!updatingACE}}">
          <template>
            <paper-button noink class="primary" on-click="doCreateAndAdd" id="createAndAddPermissionButton">
              [[i18n('popupPermission.createAndAdd')]]
            </paper-button>
            <paper-button noink class="primary" on-click="doCreate" id="createPermissionButton">
              [[i18n('popupPermission.create')]]
            </paper-button>
          </template>
        </dom-if>
        <dom-if if="{{updatingACE}}">
          <template>
            <paper-button noink class="primary" on-click="doUpdate">[[i18n('popupPermission.update')]]</paper-button>
          </template>
        </dom-if>
      </div>
    </nuxeo-dialog>
`;
    }

    static get is() {
      return 'nuxeo-popup-permission';
    }

    static get properties() {
      return {
        docId: {
          type: String,
          value: '',
        },
        ace: {
          type: Object,
          value: null,
        },
        userVisiblePermissions: {
          type: Array,
          value: [],
        },
        params: {
          type: Object,
        },
        updatingACE: {
          type: Boolean,
          computed: 'isUpdatingACE(ace)',
        },
        shareWithExternal: {
          type: Boolean,
          value: false,
        },
        selectedTimeFrame: {
          type: String,
          value: 'permanent',
          observer: '_selectedTimeFrameChanged',
        },

        /*
         * The title of the dialog
         */
        _computedTitle: {
          type: String,
          computed: '_computeTitle(shareWithExternal, updatingACE)',
        },
      };
    }

    static get observers() {
      return [
        '_computeParams(ace, shareWithExternal)',
      ];
    }

    togglePopup() {
      this.$.popupRight.toggle();
    }

    doCreate() {
      this._doSend(true);
    }

    doCreateAndAdd() {
      this._doSend(false);
    }

    doUpdate() {
      this._doSend(true);
    }

    _computeTitle() {
      if (this.updatingACE) {
        return this.i18n('popupPermission.updatePermission');
      }
      if (this.shareWithExternal) {
        return this.i18n('popupPermission.shareWithExternalUser');
      }
      return this.i18n('popupPermission.addPermission');
    }

    _doSend(togglePopup) {
      if (this.shareWithExternal &&
          ((!this.updatingACE && !this.params.email) || (this.updatingACE && !this.params.username))) {
        return;
      }
      if (!this.shareWithExternal && !this.params.username && (!this.params.users || this.params.users.length === 0)) {
        return;
      }

      // not a valid email
      if (this.params.email && !this.shadowRoot.querySelector('#email').validate()) {
        return;
      }

      const dateBased = this.selectedTimeFrame === 'datebased';

      if (this.params.begin && dateBased) {
        this.params.begin = this.params.begin.length > 0 ? moment(new Date(this.params.begin)).format() : null;
      }

      if (this.params.end && dateBased) {
        this.params.end = this.params.end.length > 0 ? moment(new Date(this.params.end)).format() : null;
      }

      if (this.params.end === null && this.shareWithExternal) {
        // do nothing, we need an end date
        return;
      }

      if (this.updatingACE) {
        this.$.replaceOp.execute();
      } else {
        this.$.createOp.execute();
      }

      if (togglePopup) {
        this.togglePopup();
      }
    }

    handleResponse() {
      if (this.updatingACE) {
        this.dispatchEvent(new CustomEvent('aceupdated', {
          composed: true,
          bubbles: true,
        }));
      } else {
        this.dispatchEvent(new CustomEvent('acecreated', {
          composed: true,
          bubbles: true,
        }));
        this.params = this._getResetParams();
        this.selectedTimeFrame = this.shareWithExternal ? 'datebased' : 'permanent';
      }
    }

    _computeParams(ace, shareWithExternal) {
      this.params = this._getResetParams();

      // force datebased and notification for external share
      if (shareWithExternal) {
        this.selectedTimeFrame = 'datebased';
      }

      if (ace !== null) {
        this.params.id = ace.id;
        if (typeof ace.username === 'object') {
          this.params.username = ace.username['entity-type'] === 'user' ? ace.username.id : ace.username.groupname;
        } else {
          this.params.username = ace.username;
        }
        this.params.permission = ace.permission;
        this.params.notify = ace.notify;
        this.params.comment = ace.comment;
        let dateBased = false;
        if (ace.begin !== null) {
          this.params.begin = moment(new Date(ace.begin)).format('YYYY-MM-DD');
          dateBased = true;
        }
        if (ace.end !== null) {
          this.params.end = moment(new Date(ace.end)).format('YYYY-MM-DD');
          dateBased = true;
        }

        if (dateBased) {
          this.selectedTimeFrame = 'datebased';
        }
      }
    }

    isUpdatingACE(ace) {
      return ace !== null;
    }

    _selectedTimeFrameChanged() {
      this.permissionIsPermanent = this.selectedTimeFrame === 'permanent';
      if (this.permissionIsPermanent) {
        this.set('params.begin', null);
        this.set('params.end', null);
      }
    }

    _getResetParams() {
      return {
        users: [],
        username: null,
        email: null,
        permission: 'Read',
        begin: null,
        end: null,
        notify: true,
        comment: '',
      };
    }
  }

  customElements.define(PopupPermission.is, PopupPermission);
  Nuxeo.PopupPermission = PopupPermission;
}
