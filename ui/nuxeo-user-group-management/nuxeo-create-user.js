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
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-layout.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-user-suggestion.js';
import './nuxeo-edit-password.js';

{
  /**
   * Used by `nuxeo-user-group-management`
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   */
  class CreateUser extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
      }

      .header {
        @apply --layout-horizontal;
        @apply --layout-center;
        margin-bottom: 16px;
      }

      .header > iron-icon {
        padding: 8px;
      }

      .form-buttons {
        margin-top: 16px;
      }

      #errors {
        color: red;
        margin: 1em 0;
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

    <nuxeo-resource id="request" path="/user" headers="{&quot;Content-Type&quot;:&quot;application/json&quot;}">
    </nuxeo-resource>

    <nuxeo-operation id="invite" op="User.Invite"></nuxeo-operation>

    <div class="header">
      <iron-icon icon="nuxeo:user"></iron-icon>
      <h3>[[i18n('createUser.heading')]]</h3>
    </div>

    <iron-form id="form">
      <form>
        <nuxeo-input label="[[i18n('createUser.username')]]" value="{{user.username}}" name="username" required="">
        </nuxeo-input>

        <nuxeo-layout
          id="layout"
          href="[[_layoutHref('nuxeo-edit-user.html')]]"
          model="[[_layoutModel(user, new)]]"
          on-element-changed="_layoutElementChanged">
        </nuxeo-layout>

        <label>[[i18n('createUser.setPassword')]]</label>
        <paper-toggle-button checked="{{usePassword}}" name="password-toggle"></paper-toggle-button>

        <dom-if if="[[usePassword]]" restamp="">
          <template>
            <nuxeo-edit-password id="passwordEditor" password="{{user.password}}" required=""></nuxeo-edit-password>
          </template>
        </dom-if>

        <div class="form-buttons">
          <paper-button noink id="cancelButton" on-click="_cancel">[[i18n('command.cancel')]]</paper-button>
          <paper-button noink id="createButton" class="primary" on-click="_submit">
            [[i18n('command.create')]]
          </paper-button>
          <paper-button noink" id="createAnotherButton" class="primary" on-click="_submitAnother">
            [[i18n('createUser.createAnother')]]
          </paper-button>
        </div>

        <span id="errors" hidden\$="[[!_hasErrors(errors)]]">[[errors]]</span>

      </form>
    </iron-form>
`;
    }

    static get is() {
      return 'nuxeo-create-user';
    }

    static get properties() {
      return {
        user: {
          type: Object,
          value: {},
        },

        usePassword: {
          type: Boolean,
          value: false,
        },

        errors: {
          type: String,
          value: '',
        },

        /**
         * If true, allows to create a new user immediately after the current one is created
         */
        _createAnother: {
          type: Boolean,
          value: false,
        },

        _currentUser: {
          type: Object,
        },
      };
    }

    static get importMeta() {
      return import.meta;
    }

    ready() {
      super.ready();
      this.$.form.addEventListener('iron-form-presubmit', (event) => {
        event.preventDefault();
        this._create();
      });
    }

    _goHome() {
      this.dispatchEvent(new CustomEvent('goHome', {
        composed: true,
        bubbles: true,
      }));
    }

    /**
     * Submits the form with `_createAnother` option set to true.
     */
    _submitAnother() {
      this._createAnother = true;
      this.$.form.submit();
    }

    /**
     * Submits the form.
     */
    _submit() {
      this._createAnother = false;
      this.$.form.submit();
    }

    /**
     * Creates a new user if the form was successfully submitted.
     */
    _create() {
      if (!this._isAdministrator(this._currentUser) &&
          this.user.groups && this.user.groups.indexOf('administrators') !== -1) {
        this.errors = this.i18n('createUser.errorAdministratorsGroup');
        return;
      }
      this._doCreate(this.user).then(() => {
        this._resetFields();
        if (!this._createAnother) {
          this._goHome();
        }
      })
        .catch((error) => {
          this.errors = error.message;
        });
    }

    _doCreate(user) {
      const entity = {
        'entity-type': 'user',
        id: '', // empty id for compat with NuxeoPrincipalReader deprecated on 7.10
        properties: user,
      };
      if (this.usePassword) {
        this.$.request.data = entity;
        return this.$.request.post().then((newUser) => {
          this.dispatchEvent(new CustomEvent('nuxeo-user-created', {
            composed: true,
            bubbles: true,
            detail: newUser,
          }));
        });
      } else {
        this.$.invite.input = entity;
        return this.$.invite.execute().then(() => {
          entity.id = user.username;
          this.dispatchEvent(new CustomEvent('nuxeo-user-invited', {
            composed: true,
            bubbles: true,
            detail: entity,
          }));
        });
      }
    }

    _cancel() {
      this._resetFields();
      this._goHome();
    }

    _resetFields() {
      this.user = { groups: [] };
      if (this.$$('#passwordEditor')) {
        this.$$('#passwordEditor').resetFields();
      }
      this.errors = '';
      this.usePassword = false;
    }

    _hasErrors() {
      return this.errors !== '';
    }

    _isAdministrator(user) {
      return user && user.isAdministrator;
    }

    _layoutHref(layout) {
      return this.resolveUrl(layout);
    }

    _layoutModel() {
      return {
        user: this.user,
        new: true,
      };
    }

    _layoutElementChanged() {
      this.$.layout.element.addEventListener('user-changed', (e) => {
        this.set(e.detail.path, e.detail.value);
      });
    }
  }

  customElements.define(CreateUser.is, CreateUser);
  Nuxeo.CreateUser = CreateUser;
}
