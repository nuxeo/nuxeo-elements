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
          /*
           * Sizes are expressed in em and the line height is inherited so that tags grow with
           * user text-spacing overrides (WCAG 2.1 AA 1.4.12) and browser font-size changes,
           * instead of clipping their label.
           */
          :host {
            display: inline-block;
            box-sizing: border-box;
            max-width: 100%;
            background-color: var(--nuxeo-tag-background, transparent);
            color: var(--nuxeo-default-text, #000);
            padding: 0.4em 0.6em;
            font-size: 0.8rem;
            margin-bottom: 0.3em;
            border-radius: 2em;
            min-height: 1.55em;
            text-decoration: none;
            overflow-wrap: break-word;

            @apply --nuxeo-tag;
          }

          :host([uppercase]) {
          }

          iron-icon {
            width: 1.1em;
            height: 1.1em;
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
