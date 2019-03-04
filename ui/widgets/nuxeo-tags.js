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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import './nuxeo-tag.js';
import './nuxeo-user-tag.js';
import './nuxeo-group-tag.js';

{
  /**
   * An element to display a list of tags.
   *
   * Example:
   *
   *     <nuxeo-tags type="user" tags='["User 1", "User 2", "User 3"]'></nuxeo-tags>
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-tags/index.html
   */
  class Tags extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
        :host {
          display: inline-block;
        }
      </style>
    <dom-repeat items="[[items]]" as="item">
      <template>
        <dom-if if="[[_type('tag')]]">
          <template>
            <nuxeo-tag>[[item]]</nuxeo-tag>
          </template>
        </dom-if>
        <dom-if if="[[_type('user')]]">
          <template>
            <nuxeo-user-tag user="[[item]]"></nuxeo-user-tag>
          </template>
        </dom-if>
        <dom-if if="[[_type('group')]]">
          <template>
            <nuxeo-group-tag group="[[item]]"></nuxeo-group-tag>
          </template>
        </dom-if>
      </template>
    </dom-repeat>
`;
    }

    static get is() {
      return 'nuxeo-tags';
    }

    static get properties() {
      return {
        /**
         * Type ("tag", "user", "group").
         */
        type: {
          type: String,
          value: 'tag',
        },

        /**
         * Array of user/group entities or strings.
         */
        items: {
          type: Array,
        },
      };
    }

    _type(value) {
      return this.type === value;
    }
  }

  customElements.define(Tags.is, Tags);
  Nuxeo.Tags = Tags;
}
