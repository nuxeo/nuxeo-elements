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
import '@polymer/iron-icon/iron-icon.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '../nuxeo-i18n-behavior.js';

{
  /**
   * An element for showing a tag.
   *
   * Example:
   *
   *     <nuxeo-tag icon="icons:home">Home</nuxeo-tag>
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-tag/index.html
   */
  class Tag extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host {
        display: inline-block;
        background-color: var(--nuxeo-tag-background, transparent);
        color: var(--nuxeo-default-text, #000);
        padding: 4px 6px;
        font-size: .8rem;
        margin-bottom: .3em;
        border-radius: 2em;
        line-height: initial;
        text-decoration: none;

        @apply --nuxeo-tag;
      }

      :host([uppercase]) {
        text-transform: uppercase;
      }

      iron-icon {
        width: 14px;
        height: 14px;
        margin: 0;
        padding: 0;
      }
    </style>

    <dom-if if="[[icon]]">
      <template>
        <iron-icon icon="[[icon]]"></iron-icon>
      </template>
    </dom-if>
    <slot></slot>
`;
    }

    static get is() {
      return 'nuxeo-tag';
    }

    static get properties() {
      return {
        /**
         * Icon to use (iconset_name:icon_name).
         */
        icon: String,

        /**
         * Attribute to uppercase tag content.
         */
        uppercase: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },
      };
    }
  }

  customElements.define(Tag.is, Tag);
  Nuxeo.Tag = Tag;
}
