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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
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
  class UserTag extends mixinBehaviors([RoutingBehavior, IronResizableBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          nuxeo-user-avatar {
            margin: 0 0.5rem 0 0;
          }
          nuxeo-tag {
            padding: 0 6px 0 0;
            max-width: 100%;
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

          .user-tag {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .user-tag-nowrap {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
          }
          .user-tag-wrap {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-all;
          }
        </style>
        <nuxeo-tag>
          <div class="tag" role="button" tabindex="0" aria-describedby="tags">
            <nuxeo-user-avatar
              user="[[user]]"
              border-radius="50"
              height="22"
              width="22"
              font-size="10"
              font-weight="500"
              fetch-avatar$="[[fetchAvatar]]"
              class="user-avatar"
            >
            </nuxeo-user-avatar>
            <dom-if if="[[_hasLink(disabled, user)]]">
              <template>
                <a href$="[[_href(user)]]" class$="user_tag" on-click="_preventPropagation">
                  <span class$="username-container {{_getUserTagClass(user)}}">
                    [[_name(user)]]
                  </span>
                </a>
              </template>
            </dom-if>
            <dom-if if="[[!_hasLink(disabled, user)]]">
              <template>
                [[_name(user)]]
              </template>
            </dom-if>
            <dom-if if="[[_isEntity(user)]]">
              <template>
                <nuxeo-tooltip position="top" offset="0" animation-delay="0" id="tags">
                  [[_id(user)]]<br />[[_email(user)]]
                </nuxeo-tooltip>
              </template>
            </dom-if>
            <dom-if if="[[!_isEntity(user)]]">
              <template>
                <nuxeo-tooltip position="top" offset="0" animation-delay="0" id="tags">
                  [[_name(user)]]
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
      return (
        user &&
        user['entity-type'] &&
        (user['entity-type'] === 'user' || (user['entity-type'] === 'document' && user.type === 'user')) &&
        user.properties
      );
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
        return [firstName, lastName].join(' ').trim() || email || this._id(user);
      }
      return this._id(user);
    }

    _email(user) {
      if (this._isEntity(user)) {
        const email = user.properties.email || user.properties['user:email'];
        return email !== this._id(user) ? email : '';
      }
      return '';
    }

    _href(user) {
      return this.urlFor('user', this._id(user));
    }

    _hasLink(disabled, user) {
      return !(disabled || this._name(user) === 'system');
    }

    /**
     * Prevents further propagation of the current event (for instance to avoid issues when the element is used
     * inside tables that add click events to the whole row).
     */
    _preventPropagation(e) {
      e.stopPropagation();
    }

    _getUserTagClass(user) {
      const userFullName = this._name(user);
      const nameContainsWhiteSpace = /\s/.test(userFullName);
      return nameContainsWhiteSpace ? 'user-tag-wrap' : 'user-tag-nowrap';
    }

    _calculateElementWidth(element) {
      const currrentElement = getComputedStyle(element);
      const paddingX = parseFloat(currrentElement.paddingLeft) + parseFloat(currrentElement.paddingRight);
      const borderX = parseFloat(currrentElement.borderLeftWidth) + parseFloat(currrentElement.borderRightWidth);
      const scrollBarWidth = element.offsetWidth - element.clientWidth;
      const elementWidth = element.offsetWidth - paddingX - borderX - scrollBarWidth;
      return elementWidth;
    }

    _getHTMLRootNode(element) {
      let currentElement = element;
      while (currentElement.parentNode instanceof DocumentFragment) {
        currentElement = currentElement.parentNode.host;
      }
      return currentElement.parentNode;
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener('dom-change', this._layout);
      this.addEventListener('iron-resize', this._layout);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('dom-change', this._layout);
      this.removeEventListener('iron-resize', this._layout);
    }

    _layout() {
      if (this && this.parentNode) {
        const selectedElement = this;
        const parentElement = this._getHTMLRootNode(selectedElement);
        let elementWidth = this._calculateElementWidth(parentElement);
        const childNodes = Array.from(parentElement.children);
        const userAvatar = Array.from(selectedElement.shadowRoot.querySelectorAll('.user-avatar'));
        const userAvatarWidth = userAvatar[0].offsetWidth;
        const totalAvatarWidth = userAvatar.length * userAvatarWidth;
        const otherElementWidth = childNodes.reduce((totalWidth, currentValue) => {
          if (currentValue !== this && !currentValue.shadowRoot) {
            totalWidth += this._calculateElementWidth(currentValue);
          }
          return totalWidth;
        }, 0);
        elementWidth -= otherElementWidth + totalAvatarWidth;
        const userTagElement = this.shadowRoot.querySelector('.username-container');
        if (userTagElement && elementWidth > 0) userTagElement.setAttribute('style', `max-width:${elementWidth}px`);
      }
    }
  }

  customElements.define(UserTag.is, UserTag);
  Nuxeo.UserTag = UserTag;
}
