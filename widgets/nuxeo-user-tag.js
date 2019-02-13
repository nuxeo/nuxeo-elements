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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { RoutingBehavior } from '../nuxeo-routing-behavior.js';
import './nuxeo-tag.js';
import './nuxeo-user-avatar.js';
import './nuxeo-tooltip.js';

{
  /**
   * An element for showing a user entity with a tooltip.
   *
   * Example:
   *
   *     <nuxeo-user-tag user="[[user]]"></nuxeo-user-tag>
   *
   * @appliesMixin Nuxeo.RoutingBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-user-tag/index.html
   */
  class UserTag extends mixinBehaviors([RoutingBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      nuxeo-user-avatar {
        margin: 0 .5rem 0 0;
      }
      nuxeo-tag {
        padding: 0 6px 0 0;
      }
      .tag {
        @apply --layout-horizontal;
        @apply --layout-center;
      }
      a {
        @apply --nuxeo-link;
      }

      a:hover {
        @apply --nuxeo-link-hover;
      }
    </style>
    <nuxeo-tag>
      <div class="tag">
        <nuxeo-user-avatar
          user="[[user]]"
          border-radius="50"
          height="22"
          width="22"
          font-size="10"
          font-weight="500"
          fetch-avatar\$="[[fetchAvatar]]">
        </nuxeo-user-avatar>
        <dom-if if="[[_hasLink(user)]]">
          <template>
            <a href\$="[[_href(user)]]" on-click="_preventPropagation">[[_name(user)]]</a>
          </template>
        </dom-if>
        <dom-if if="[[!_hasLink(user)]]">
          <template>
            [[_name(user)]]
          </template>
        </dom-if>
        <dom-if if="[[_isEntity(user)]]">
          <template>
            <nuxeo-tooltip position="top" offset="0" animation-delay="0">
              [[_id(user)]]<br>[[_email(user)]]
            </nuxeo-tooltip>
          </template>
        </dom-if>
      </div>
    </nuxeo-tag>
`;
    }

    static get is() {
      return 'nuxeo-user-tag';
    }

    static get properties() {
      return {
        /**
         * User entity or a string
         */
        user: Object,

        /**
         * Disable link
         */
        disabled: {
          type: Boolean,
          value: false,
        },

        /**
         * Fetch avatar from profile if not already loaded.
         */
        fetchAvatar: {
          type: Boolean,
          value: false,
        },
      };
    }

    _isEntity(user) {
      return user && user['entity-type'] && (user['entity-type'] === 'user'
          || (user['entity-type'] === 'document' && user.type === 'user')) && user.properties;
    }

    _id(user) {
      if (user) {
        const id = user.id || user.uid;
        return id || user.replace('user:', '');
      }
    }

    _name(user) {
      if (this._isEntity(user)) {
        const firstName = user.properties.firstName || user.properties['user:firstName'];
        const lastName = user.properties.lastName || user.properties['user:lastName'];
        const email = user.properties.email || user.properties['user:email'];
        return (firstName || lastName) ? `${firstName} ${lastName}` : email || this._id(user);
      } else {
        return this._id(user);
      }
    }

    _email(user) {
      if (this._isEntity(user)) {
        const email = user.properties.email || user.properties['user:email'];
        return email !== this._id(user) ? email : '';
      } else {
        return '';
      }
    }

    _href(user) {
      return this.urlFor('user', this._id(user));
    }

    _hasLink(user) {
      return !(this.disabled || (this._name(user) === 'system'));
    }

    /**
     * Prevents further propagation of the current event (for instance to avoid issues when the element is used
     * inside tables that add click events to the whole row).
     */
    _preventPropagation(e) {
      e.stopPropagation();
    }
  }

  customElements.define(UserTag.is, UserTag);
  Nuxeo.UserTag = UserTag;
}
