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
import '@polymer/iron-icons/social-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { RoutingBehavior } from '../nuxeo-routing-behavior.js';
import './nuxeo-tooltip.js';
import './nuxeo-tag.js';

{
  /**
   * An element for showing a group entity with a tooltip.
   *
   * Example:
   *
   *     <nuxeo-group-tag group="[[group]]"></nuxeo-group-tag>
   *
   * @appliesMixin Nuxeo.RoutingBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-group-tag/index.html
   */
  class GroupTag extends mixinBehaviors([RoutingBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      a {
        @apply --nuxeo-link;
      }

      a:hover {
        @apply --nuxeo-link-hover;
      }

      .preserve-white-space {
        white-space: pre;
      }
    </style>
    <nuxeo-tag icon="nuxeo:group">
      <dom-if if="[[!disabled]]">
        <template>
          <a class="preserve-white-space" href\$="[[_href(group)]]" on-click="_preventPropagation">[[_label(group)]]</a>
        </template>
      </dom-if>
      <dom-if if="[[disabled]]">
        <template>
          <span class="preserve-white-space">[[_label(group)]]</span>
        </template>
      </dom-if>
      <dom-if if="[[_isEntity(group)]]">
        <template>
          <nuxeo-tooltip position="top" offset="0" animation-delay="0">[[_name(group)]]</nuxeo-tooltip>
        </template>
      </dom-if>
    </nuxeo-tag>
`;
    }

    static get is() {
      return 'nuxeo-group-tag';
    }

    static get properties() {
      return {
        /**
         * Group entity or a string
         */
        group: Object,

        /**
         * Disable link
         */
        disabled: {
          type: Boolean,
          value: false,
        },
      };
    }

    _isEntity(group) {
      return group && group['entity-type'] && (group['entity-type'] === 'group'
          || (group['entity-type'] === 'document' && group.type === 'group'));
    }

    _name(group) {
      if (this._isEntity(group)) {
        return group.groupname || group.properties['group:groupname'];
      } else if (group.name) {
        return group.name.replace('group:', '');
      } else {
        return group.replace('group:', '');
      }
    }

    _label(group) {
      if (this._isEntity(group)) {
        return group.grouplabel || group.properties['group:grouplabel'] || this._name(group);
      } else if (group.label) {
        return group.label.replace('group:', '');
      } else {
        return group.replace('group:', '');
      }
    }

    _href(group) {
      return this.urlFor('group', this._name(group));
    }

    /**
     * Prevents further propagation of the current event (for instance to avoid issues when the element is used
     * inside tables that add click events to the whole row).
     */
    _preventPropagation(e) {
      e.stopPropagation();
    }
  }

  customElements.define(GroupTag.is, GroupTag);
  Nuxeo.GroupTag = GroupTag;
}
