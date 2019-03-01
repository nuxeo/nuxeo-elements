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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-user-suggestion.js';

{
  /**
   * Used by `nuxeo-user-group-management`
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   */
  class CreateGroup extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="iron-flex">
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

      .row {
        font-size: 0.8rem;
        border: 1px solid var(--nuxeo-border, #aaa);
        @apply --layout-horizontal;
        @apply --layout-center;
      }

      .row .label {
        font-weight: 400;
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-flex;
      }

      .row .label iron-icon {
        margin: 0 8px;
      }

      .row .name {
        @apply --layout-flex;
      }

      .row .email {
        @apply --layout-flex;
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

    <nuxeo-resource id="request" path="/group"></nuxeo-resource>

    <div class="header">
      <iron-icon icon="nuxeo:group"></iron-icon>
      <h3>[[i18n('createGroup.heading')]]</h3>
    </div>

    <iron-form id="form">
      <form>

        <nuxeo-input id="groupName" label="[[i18n('createGroup.group.name')]]" value="{{groupName}}" required>
        </nuxeo-input>
        <nuxeo-input id="groupLabel" label="[[i18n('createGroup.group.label')]]" value="{{groupLabel}}"></nuxeo-input>

        <nuxeo-user-suggestion
          id="picker"
          label="[[i18n('createGroup.members')]]"
          search-type="USER_GROUP_TYPE"
          placeholder="[[i18n('createGroup.search.placeholder')]]"
          selected-item="{{selectedUser}}"
          result-formatter="[[resultFormatter]]"
          query-results-filter="[[resultsFilter]]">
        </nuxeo-user-suggestion>

        <!-- selected members -->
        <dom-repeat items="[[selectedUsers]]">
          <template>
            <div class="row">
              <div class="label">
                <iron-icon icon="nuxeo:user" hidden="[[item.groupname]]"></iron-icon>
                <iron-icon icon="nuxeo:group" hidden="[[item.username]]"></iron-icon>
                <span>[[item.displayLabel]]</span>
              </div>
              <div class="name">
                <span hidden="[[item.groupname]]">[[item.username]]</span>
                <span hidden="[[item.username]]">[[item.groupname]]</span>
              </div>
              <div class="email">
                <span>[[item.email]]</span>
              </div>
              <paper-icon-button icon="nuxeo:remove" title="remove" on-click="_remove"></paper-icon-button>
            </div>
          </template>
        </dom-repeat>

        <div class="form-buttons">
          <paper-button noink id="cancelButton" on-click="_cancel">[[i18n('command.cancel')]]</paper-button>
          <paper-button noink id="createButton" class="primary" on-click="_submit">
            [[i18n('command.create')]]
          </paper-button>
          <paper-button noink id="createAnotherButton" class="primary" on-click="_submitAnother">
            [[i18n('createGroup.createAnother')]]
          </paper-button>
        </div>

        <span id="errors" hidden\$="[[!_hasErrors(errors)]]">[[errors]]</span>

      </form>
    </iron-form>
`;
    }

    static get is() {
      return 'nuxeo-create-group';
    }

    static get properties() {
      return {
        groupName: {
          type: String,
          notify: true,
        },

        groupLabel: {
          type: String,
          notify: true,
        },

        selectedUser: {
          type: Object,
          notify: true,
        },

        selectedUsers: {
          type: Array,
          value: [],
          notify: true,
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

        errors: {
          type: String,
          value: '',
        },

        /**
         * If true, allows to create a new group immediately after the current one is created
         */
        _createAnother: {
          type: Boolean,
          value: false,
        },
      };
    }

    static get observers() {
      return [
        '_observeSelectedUser(selectedUser)',
      ];
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

    _observeSelectedUser() {
      if (this.selectedUser && this.selectedUsers.indexOf(this.selectedUser) === -1) {
        this.push('selectedUsers', this.selectedUser);
      }
      this.selectedUser = null;
    }

    _remove(e) {
      if (e.model.item) {
        this.splice('selectedUsers', this.selectedUsers.indexOf(e.model.item), 1);
      }
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
     * Creates a new group if the form was successfully submitted.
     */
    _create() {
      this.$.request.data = this._computeData();
      this.$.request.post().then((response) => {
        this.dispatchEvent(new CustomEvent('nuxeo-group-created', {
          composed: true,
          bubbles: true,
          detail: response,
        }));
        this._resetFields();
        if (!this._createAnother) {
          this._goHome();
        }
      }).catch((error) => {
        this.errors = error.message;
      });
    }

    _cancel() {
      this._resetFields();
      this._goHome();
    }

    _resetFields() {
      this.groupName = '';
      this.groupLabel = '';
      this.errors = '';
      this.selectedUsers = [];
    }

    _computeData() {
      return {
        'entity-type': 'group',
        groupname: this.groupName,
        grouplabel: this.groupLabel,
        memberUsers: this.selectedUsers.filter((record) => record.type === 'USER_TYPE')
          .map((record) => record.username),
        memberGroups: this.selectedUsers.filter((record) => record.type === 'GROUP_TYPE')
          .map((record) => record.groupname),
      };
    }

    _resultsFilter(entry) {
      for (let i = 0; i < this.selectedUsers.length; i++) {
        if (entry.id === this.selectedUsers[i].id) {
          return false;
        }
      }
      return true;
    }

    _resultFormatter(item) {
      return `${item.displayLabel} (${item.groupname || item.username})`;
    }

    _hasErrors() {
      return this.errors !== '';
    }
  }

  customElements.define(CreateGroup.is, CreateGroup);
  Nuxeo.CreateGroup = CreateGroup;
}
