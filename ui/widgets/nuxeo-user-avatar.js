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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

{
  /**
   * An element for showing a user's avatar if available, its initials with background otherwise.
   *
   * Example:
   *
   *     <nuxeo-user-avatar user="[[user]]"></nuxeo-user-avatar>
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-user-avatar/index.html
   */
  class UserAvatar extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
       :host {
        display: inline-block;
      }

      #container {
        position: relative;
      }

      #character {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        margin: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-transform: uppercase;
      }

    </style>

    <nuxeo-resource id="getUserProfile" enrichers="userprofile" enrichers-entity="user">
    </nuxeo-resource>

    <div id="container">
      <span id="character">{{_output}}</span>
    </div>
`;
    }

    static get is() {
      return 'nuxeo-user-avatar';
    }

    static get properties() {
      return {
        /**
         * User entity or a string
         */
        user: {
          type: Object,
        },

        /**
         * Fetch avatar from profile if not already loaded.
         */
        fetchAvatar: {
          type: Boolean,
          value: false,
        },

        height: {
          type: Number,
          value: 48,
          observer: '__obsHeight',
        },
        width: {
          type: Number,
          value: 48,
          observer: '__obsWidth',
        },
        textColor: {
          type: String,
          value: '#FFFFFF',
          observer: '__obsTextColor',
        },
        fontSize: {
          type: Number,
          value: 20,
          observer: '__obsFontSize',
        },
        fontWeight: {
          type: Number,
          value: 400,
          observer: '__obsFontWeight',
        },
        borderRadius: {
          type: Number,
          value: 0,
          observer: '__obsBorderRadius',
        },
        boxShadow: {
          type: String,
          value: '0px 0px 0px 0px rgba(33,33,33,0.75)',
          observer: '__obsBoxShadow',
        },
        textShadow: {
          type: String,
          value: '0px 0px 0px rgba(33,33,33,0.75)',
          observer: '__obsTextShadow',
        },
        _output: {
          type: String,
        },
      };
    }

    static get observers() {
      return [
        '__makeAvatar(user)',
      ];
    }

    _username(user) {
      return this._isEntity(user) ? user.properties.username || user.properties['user:username'] : this._id(user);
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
        return (firstName || lastName) ? `${firstName} ${lastName}` : this._id(user);
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

    __obsHeight() {
      this.$.container.style.height = `${this.height}px`;
    }
    __obsWidth() {
      this.$.container.style.width = `${this.width}px`;
    }
    __obsTextColor() {
      this.$.character.style.color = this.textColor;
    }
    __obsFontSize() {
      this.$.character.style.fontSize = `${this.fontSize}px`;
    }
    __obsFontWeight() {
      this.$.character.style.fontWeight = this.fontWeight;
    }
    __obsBorderRadius() {
      if (this.borderRadius === '' || this.borderRadius == null) {
        this.borderRadius = 0;
      }
      this.$.container.style.borderRadius = `${this.borderRadius}%`;
    }
    __obsBoxShadow() {
      this.$.container.style.webkitBoxShadow = this.boxShadow;
      this.$.container.style.mozBoxShadow = this.boxShadow;
      this.$.container.style.boxShadow = this.boxShadow;
    }
    __obsTextShadow() {
      this.$.character.style.webkitTextShadow = this.textShadow;
      this.$.character.style.mozTextShadow = this.textShadow;
      this.$.character.style.textShadow = this.textShadow;
    }

    __makeAvatar() {
      if (this.user) {
        if (this.user.contextParameters
            && this.user.contextParameters.userprofile
            && this.user.contextParameters.userprofile.avatar) {
          this._output = '';
          this.$.container.style.background = `url(${this.user.contextParameters.userprofile.avatar.data})`;
          this.$.container.style.backgroundRepeat = 'no-repeat';
          this.$.container.style.backgroundSize = `${this.height}px ${this.height}px`;
        } else {
          const name = this._name(this.user);
          const colors = ['#1abc9c', '#16a085', '#f1c40f', '#f39c12', '#2196F3', '#3F51B5', '#673AB7', '#E91E63',
            '#9C27B0', '#009688', '#4CAF50', '#FF9800', '#795548', '#FF5722', '#2ecc71', '#27ae60', '#e67e22',
            '#d35400', '#3498db', '#2980b9', '#e74c3c', '#c0392b', '#9b59b6', '#8e44ad', '#bdc3c7', '#34495e',
            '#2c3e50', '#95a5a6', '#7f8c8d', '#ec87bf', '#d870ad', '#f69785', '#9ba37e', '#b49255', '#b49255',
            '#a94136',
          ];
          const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
            's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
          ];
          let tempName = '';
          const splitName = name.split(' ');
          const alphabetPosition = alphabet.indexOf(name.charAt(0).toLowerCase());
          this.$.container.style.backgroundColor = colors[alphabetPosition];
          for (let i = 0; i < splitName.length; i++) {
            tempName += splitName[i].charAt(0);
          }
          this._output = tempName;
          if (this.fetchAvatar) {
            this.$.getUserProfile.path = `user/${this._username(this.user)}`;
            this.$.getUserProfile.get().then((res) => {
              if (res.contextParameters
              && res.contextParameters.userprofile
              && res.contextParameters.userprofile.avatar) {
                this.user = res;
              }
            }).catch(() => {
              console.warn(`Cannot fetch profile for user ${this._username(this.user)}`);
            });
          }
        }
      }
    }
  }

  customElements.define(UserAvatar.is, UserAvatar);
  Nuxeo.UserAvatar = UserAvatar;
}
