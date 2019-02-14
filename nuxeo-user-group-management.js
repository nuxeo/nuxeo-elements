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
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/iron-input/iron-input.js';
import '@polymer/iron-pages/iron-pages.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { importHref } from './import-href.js';
import { FiltersBehavior } from './nuxeo-filters-behavior.js';
import { I18nBehavior } from './nuxeo-i18n-behavior.js';
import './nuxeo-icons.js';
import './nuxeo-user-group-management/nuxeo-create-group.js';
import './nuxeo-user-group-management/nuxeo-create-user.js';
import './nuxeo-user-group-management/nuxeo-group-management.js';
import './nuxeo-user-group-management/nuxeo-user-group-search.js';
import './nuxeo-user-group-management/nuxeo-user-management.js';
import './nuxeo-user-group-management/nuxeo-user-profile.js';
import './widgets/nuxeo-card.js';
import './widgets/nuxeo-user-suggestion.js';

{
  /**
   * An element for managing users and groups in Nuxeo.
   *
   * Example:
   *
   *     <nuxeo-user-group-management></nuxeo-user-group-management>
   *
   * ### Styling
   *
   * The following custom properties and mixins are available for styling:
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--nuxeo-user-management-layout` | Mixin applied to the host element | `{}`
   * `--nuxeo-user-management-create-button-layout` | Mixin applied to the create button | `{}`
   *
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.FiltersBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-user-group-management/index.html
   */
  class UserGroupManagement
    extends mixinBehaviors([I18nBehavior, FiltersBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="iron-flex iron-flex-alignment">
      :host {
        display: block;
        position: relative;
        @apply --layout-flex;
      }

      #createDropdown {
        position: absolute;
        right: 0;
        padding: 0;
        top: 15px;
      }

      paper-menu-button {
        width: 130px;
        height: 48px;
        margin-bottom: 16px;
      }

      paper-button {
        width: 100%;
      }

      paper-button iron-icon {
        padding-right: 8px;
      }

      paper-listbox {
        width: 130px;
        outline: none;
      }

      paper-listbox paper-icon-item iron-icon {
        width: 1.5rem;
        height: 1.5rem;
      }

      paper-listbox paper-icon-item:hover {
        background: var(--nuxeo-container-hover, #fafafa);
        cursor: pointer;
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

    <paper-toast id="toast"></paper-toast>
    <iron-pages selected="[[page]]" attr-for-selected="name">
      <section name="search">
        <div class="horizontal layout center">
          <dom-if if="[[_canCreateUserGroup(readonly, _currentUser)]]">
            <template>
              <div class="flex">
                <paper-menu-button
                  id="createDropdown"
                  no-animations
                  no-overlap
                  horizontal-align="right"
                  vertical-align="top"
                  vertical-offset="-4">
                  <paper-button noink="" class="primary" id="createButton" slot="dropdown-trigger">
                    <iron-icon icon="nuxeo:add"></iron-icon>
                    <div>[[i18n('userGroupManagement.new.usergroup')]]</div>
                  </paper-button>
                  <paper-listbox no-animations="" id="menu" selectable="item" slot="dropdown-content">
                    <paper-icon-item name="user" on-click="_createUser">
                      <iron-icon icon="nuxeo:user" slot="item-icon">&gt;</iron-icon>
                      <span>[[i18n('userGroupManagement.new.user')]]</span>
                    </paper-icon-item>
                    <paper-icon-item name="group" on-click="_createGroup">
                      <iron-icon icon="nuxeo:group" slot="item-icon">&gt;</iron-icon>
                      <span>[[i18n('userGroupManagement.new.group')]]</span>
                    </paper-icon-item>
                  </paper-listbox>
                </paper-menu-button>
              </div>
            </template>
          </dom-if>
        </div>
        <nuxeo-user-group-search></nuxeo-user-group-search>
      </section>

      <section name="create-user">
        <nuxeo-card>
          <nuxeo-create-user readonly\$="[[readonly]]"></nuxeo-create-user>
        </nuxeo-card>
      </section>

      <section name="manage-user">
        <nuxeo-user-management username="[[selectedUser]]" readonly\$="[[readonly]]"></nuxeo-user-management>
      </section>

      <section name="create-group">
        <nuxeo-card>
          <nuxeo-create-group></nuxeo-create-group>
        </nuxeo-card>
      </section>

      <section name="manage-group">
        <nuxeo-group-management groupname="[[selectedGroup]]" readonly\$="[[readonly]]"></nuxeo-group-management>
      </section>
    </iron-pages>
`;
    }

    static get is() {
      return 'nuxeo-user-group-management';
    }

    static get properties() {
      return {
        /**
         * The user-group-management page to be displayed. Possible values are:
         * `search`, `create-user`, `manage-user`, `create-group` and `manage-group`.
         */
        page: {
          type: String,
          value: 'search',
          notify: true,
        },

        /**
         * Selected user id.
         */
        selectedUser: String,

        /**
         * Selected group id.
         */
        selectedGroup: {
          type: String,
        },

        /**
         * True if currently in read only mode.
         */
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

    static get importMeta() {
      return import.meta;
    }

    ready() {
      super.ready();
      // dynamic loading of user layouts
      if (!this._isRegistered('nuxeo-view-user')) {
        importHref(this.resolveUrl('nuxeo-user-group-management/nuxeo-view-user.html'));
      }
      if (!this._isRegistered('nuxeo-edit-user')) {
        importHref(this.resolveUrl('nuxeo-user-group-management/nuxeo-edit-user.html'));
      }

      window.addEventListener('manageUser', (e) => {
        this._manageUser(e);
      });
      window.addEventListener('manageGroup', (e) => {
        this._manageGroup(e);
      });

      this.addEventListener('goHome', this._goSearch);
      this.addEventListener('nuxeo-user-created', this._toast);
      this.addEventListener('nuxeo-user-invited', this._toast);
      this.addEventListener('nuxeo-group-created', this._toast);
    }

    /**
     * Go to the 'search' page.
     */
    _goSearch() {
      this.selectedGroup = null;
      this.selectedUser = null;
      this.page = 'search';
      this.$$('nuxeo-user-group-search')._searchTermChanged();
    }

    /**
     * Got to the 'create-user' page.
     */
    _createUser() {
      this.page = 'create-user';
    }

    /**
     * Go to the 'create-group' page.
     */
    _createGroup() {
      this.page = 'create-group';
    }

    _manageUser(e) {
      this.selectedUser = null;
      this.selectedUser = e.detail.user;
      this.page = 'manage-user';
    }

    _manageGroup(e) {
      this.selectedGroup = null;
      this.selectedGroup = e.detail.group;
      this.page = 'manage-group';
    }

    _hasAdministrationPermissions(user) {
      return user && (user.isAdministrator || this.isMember(user, 'powerusers'));
    }

    _canCreateUserGroup(readonly, currentUser) {
      return !readonly && this._hasAdministrationPermissions(currentUser);
    }

    /**
     * Displays a message.
     */
    _toast(event) {
      let msg;
      switch (event.type) {
        case 'nuxeo-user-created':
        case 'nuxeo-user-invited':
          msg = `User ${event.detail.id} created`;
          break;
        case 'nuxeo-group-created':
          msg = `Group ${event.detail.groupname} created`;
          break;
        default:
          // do nothing
      }
      if (msg) {
        this.$.toast.text = msg;
        this.$.toast.open();
      }
    }

    /**
     * Determines whether a custom element is registered
     */
    _isRegistered(tag) {
      return document.createElement(tag) instanceof PolymerElement;
    }
  }

  customElements.define(UserGroupManagement.is, UserGroupManagement);
  Nuxeo.UserGroupManagement = UserGroupManagement;
}
