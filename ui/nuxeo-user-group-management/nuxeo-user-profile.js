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
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-icon/iron-icon.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { importHref } from '../import-href.js';
import '../widgets/nuxeo-card.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-group-tag.js';
import '../widgets/nuxeo-input.js';
import './nuxeo-user-group-permissions-table.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  /**
   * An element for viewing and editing a user.
   *
   * Example:
   *
   *     <nuxeo-user-profile username="Administrator"></nuxeo-user-profile>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   */
  class UserProfile extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="iron-flex iron-flex-alignment iron-flex-factors">
      :host {
        display: block;
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

      .actions iron-icon {
        width: 1.3rem;
        margin-right: .5rem;
      }

      .table {
        border: 1px solid var(--nuxeo-border, #e6e9ef);
        margin-top: 1em;
      }

      .table .header {
        @apply --layout-horizontal;
        @apply --layout-center;
        background-color: var(--nuxeo-table-header-background, #e6e9ef);
        padding: 1.3em 1em;
        font-weight: 400;
        border-bottom: 2px solid var(--nuxeo-border, #eee);
        box-shadow: 0 -1px 0 rgba(0,0,0,0.2) inset;
      }

      .table .row {
        @apply --layout-horizontal;
        @apply --layout-center;
        background-color: var(--nuxeo-table-items-background, #e6e9ef);
        border-bottom: 1px solid var(--nuxeo-border, #eee);
        padding: 0 1em;
        min-height: 48px;
      }

      nuxeo-view-user {
        margin: 2em;
      }

      nuxeo-dialog {
        min-width: 400px;
        padding-top: 24px;
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
        letter-spacing: .04em;
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

    <nuxeo-connection id="nxcon"></nuxeo-connection>
    <nuxeo-resource id="request" path="me/" enrichers="userprofile" enrichers-entity="user"></nuxeo-resource>
    <nuxeo-resource id="changePassword" path="me/changepassword"></nuxeo-resource>

    <paper-toast id="toast"></paper-toast>

    <nuxeo-card>

      <div class="horizontal layout center header">

        <iron-icon class="user-icon" icon="nuxeo:user"></iron-icon>
        <div class="layout vertical">
          <div class="user heading">[[user.id]]</div>
          <div>[[user.properties.firstName]] [[user.properties.lastName]]</div>
        </div>

        <div class="actions">

          <!-- change password -->
          <dom-if if="[[!readonly]]">
            <template>
              <paper-button
                noink
                id="changePasswordButton"
                class="horizontal layout center primary"
                on-click="_openChangePasswordDialog">
                <iron-icon icon="nuxeo:lock"></iron-icon> [[i18n('userProfile.password.change')]]
              </paper-button>
            </template>
          </dom-if>
          <nuxeo-dialog id="changePasswordDialog" with-backdrop="">
            <h3>[[i18n('userProfile.password.change')]]</h3>

            <iron-form id="changePasswordForm">
              <form class="vertical layout">
                <nuxeo-input id="passwordOld" type="password" label="[[i18n('userProfile.password.old')]]" required>
                </nuxeo-input>

                <nuxeo-input
                  id="passwordNew"
                  type="password"
                  label="[[i18n('userProfile.password.new')]]"
                  required
                  value="{{passwordNew}}">
                </nuxeo-input>

                <nuxeo-input
                  id="passwordConfirm"
                  type="password"
                  label="[[i18n('userProfile.password.confirm')]]"
                  required
                  pattern="[[passwordNew]]">
                </nuxeo-input>
              </form>
            </iron-form>

            <div class="buttons">
              <div class="flex start-justified">
                <paper-button noink="" dialog-dismiss="">[[i18n('command.cancel')]]</paper-button>
              </div>
              <paper-button noink="" class="primary" on-click="_submitChangePassword">
                [[i18n('command.save.changes')]]
              </paper-button>
            </div>
          </nuxeo-dialog>
        </div>
      </div>

      <!-- user -->
      <nuxeo-view-user user="[[user]]"></nuxeo-view-user>

    </nuxeo-card>

    <!-- groups -->
    <nuxeo-card heading="[[i18n('userManagement.groups')]]">
      <div class="table">
        <div class="header">
          <div class="flex">[[i18n('userManagement.name')]]</div>
          <div class="flex-4">[[i18n('userManagement.identifier')]]</div>
        </div>
        <dom-repeat items="[[groups]]">
          <template>
            <div class="row">
              <div class="flex"><nuxeo-group-tag group="[[item]]"></nuxeo-group-tag></div>
              <div class="flex-4">[[item.name]]</div>
            </div>
          </template>
        </dom-repeat>
      </div>
    </nuxeo-card>

    <!-- local permissions -->
    <nuxeo-card heading="[[i18n('userManagement.localPermissions.heading')]]">
      <nuxeo-user-group-permissions-table entity="[[username]]" readonly="">
      </nuxeo-user-group-permissions-table>
    </nuxeo-card>

    <!-- group permissions -->
    <nuxeo-card heading="[[i18n('userManagement.entityPermissions', item.name)]]">
      <dom-repeat items="[[groups]]">
        <template>
          <nuxeo-user-group-permissions-table entity="[[item.name]]" readonly="">
          </nuxeo-user-group-permissions-table>
        </template>
      </dom-repeat>
    </nuxeo-card>
`;
    }

    static get is() {
      return 'nuxeo-user-profile';
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

        readonly: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },
      };
    }

    static get importMeta() {
      return import.meta;
    }

    ready() {
      super.ready();
      if (!this._isRegistered('nuxeo-view-user')) {
        importHref(this.resolveUrl('nuxeo-view-user.html'));
      }

      this.$.changePasswordForm.addEventListener('iron-form-presubmit', (event) => {
        event.preventDefault();
        this._savePassword();
      });
    }

    _isRegistered(tag) {
      return document.createElement(tag) instanceof PolymerElement;
    }

    _fetch() {
      if (this.username) {
        this.$.request.get().then((response) => {
          delete response.properties.password;
          this.user = response;
        });
      }
    }

    _computeGroups() {
      return this.user.extendedGroups.filter((group) => this.user.properties.groups.indexOf(group.name) > -1);
    }

    _openChangePasswordDialog() {
      this.$.passwordOld.value = this.$.passwordNew.value = this.$.passwordConfirm.value = '';
      this.$.changePasswordDialog.open();
    }

    _submitChangePassword() {
      this.$.changePasswordForm.submit();
    }

    _savePassword() {
      this.$.changePassword.data = {
        oldPassword: this.$.passwordOld.value,
        newPassword: this.$.passwordNew.value,
      };
      this.$.changePassword.put().then((response) => {
        this.user = response;
        this._toast(this.i18n('userProfile.password.changed'));
        this.$.changePasswordDialog.close();

        // update connection
        this.$.nxcon.username = this.user.id;
        this.$.nxcon.password = this.$.passwordNew.value;
        this.$.nxcon.connect();

      }).catch((error) => {
        if (error.status === 401) {
          this._toast(this.i18n('userProfile.password.wrong'), true);
        } else {
          this._toast(this.i18n('userProfile.password.error'), true);
        }
      });
    }

    _toast(msg) {
      this.$.toast.text = msg;
      this.$.toast.open();
    }
  }

  customElements.define(UserProfile.is, UserProfile);
  Nuxeo.UserProfile = UserProfile;
}
