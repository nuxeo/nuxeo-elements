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
import '@polymer/iron-icon/iron-icon.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import './nuxeo-user-avatar.js';

{
  class UserGroupFormatter extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      #container {
        @apply --layout-horizontal;
        @apply --layout-center;
        font-size: 11px;
        line-height: 14px;
      }

      nuxeo-user-avatar,
      iron-icon {
        margin-right: 8px;
      }

      .header {
        font-weight: 700;
      }

      .preserve-white-space {
        white-space: pre;
      }
    </style>

    <div id="container">
      <dom-if if="[[_isUser(entity)]]">
        <template>
          <nuxeo-user-avatar
            user="[[entity.displayLabel]]"
            height="24"
            width="24"
            border-radius="50"
            font-size="11">
          </nuxeo-user-avatar>
        </template>
      </dom-if>

      <dom-if if="[[_isGroup(entity)]]">
        <template>
          <iron-icon icon="nuxeo:group"></iron-icon>
        </template>
      </dom-if>

      <div>
        <div class="header preserve-white-space">[[entity.displayLabel]]</div>
        <div>
          <span class="preserve-white-space">[[_computeInfo(entity)]]</span>
        </div>
      </div>
    </div>
`;
    }

    static get is() {
      return 'nuxeo-user-group-formatter';
    }

    static get properties() {
      return {
        entity: {
          type: Object,
        },
      };
    }

    _isUser() {
      return this.entity.type === 'USER_TYPE';
    }

    _isGroup() {
      return this.entity.type === 'GROUP_TYPE';
    }

    _computeInfo() {
      if (this._isUser()) {
        return `${this.entity.email} - ${this.entity.id}`;
      } else {
        return `${this.i18n('label.group')} - ${this.entity.id}`;
      }
    }
  }
  customElements.define(UserGroupFormatter.is, UserGroupFormatter);
}
