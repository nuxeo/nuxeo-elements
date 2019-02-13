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
import '@polymer/iron-collapse/iron-collapse.js';

import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/hardware-icons.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

{
  /**
   * An element for a generic card
   *
   * Example:
   *
   *     <nuxeo-card icon="icons:home" heading="title" collapsible opened>content</nuxeo-card>
   *
   * ### Styling
   *
   * The following custom properties and mixins are available for styling:
   *
   * Custom property         | Description | Default
   * -----------------------|------------------|----------
   * `--nuxeo-card`         | Mixin applied to the card | `{}`
   *
   * @appliesMixin Polymer.IronResizableBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-card/index.html
   *
   */
  class Card extends mixinBehaviors([IronResizableBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
        -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
        -moz-box-sizing: border-box;    /* Firefox, other Gecko */
        box-sizing: border-box;         /* Opera/IE 8+ */
        background-color: white;
        padding: 16px;
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.04);
        @apply --nuxeo-card;
      }

      :host([collapsible]) {
        padding-bottom: 1px;
      }

      :host([opened]) {
        padding-bottom: 16px;
      }

      :host([collapsible]) h3:hover {
        cursor: pointer;
        @apply --nuxeo-link-hover;
      }

      [hidden] {
        display: none !important;
      }

      .header {
        @apply --layout-horizontal;
        @apply --layout-center;
        margin: 0 0 1em;
      }

      .header .icon {
        display: inline-block;
        margin-right: 8px;
        --iron-icon-width: 16px;
        --iron-icon-height: 16px;
      }

      .header .heading {
        @apply --layout-flex;
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: .04em;
        text-transform: uppercase;
      }

      .header .toggle {
        --iron-icon-width: 20px;
        --iron-icon-height: 20px;
      }
    </style>

    <dom-if if="[[_hasHeading(icon, heading, collapsible)]]">
      <template>
        <h3 class="header" on-click="_toggle">
          <iron-icon class="icon" icon="[[icon]]" hidden\$="[[!icon]]"></iron-icon>
          <span class="heading">[[heading]]</span>
          <iron-icon class="toggle" icon="[[_toggleIcon(opened)]]" toggle="" hidden\$="[[!collapsible]]"></iron-icon>
        </h3>
      </template>
    </dom-if>

    <dom-if if="[[collapsible]]">
      <template>
        <iron-collapse opened="[[_opened(opened, collapsible)]]">
          <slot></slot>
        </iron-collapse>
      </template>
    </dom-if>

    <dom-if if="[[!collapsible]]">
      <template>
        <slot></slot>
      </template>
    </dom-if>
`;
    }

    static get is() {
      return 'nuxeo-card';
    }

    static get properties() {
      return {
        /**
         * Heading icon
         */
        icon: {
          type: String,
          value: null,
        },

        /**
         * Heading of the card
         */
        heading: {
          type: String,
          value: null,
        },

        /**
         * If the card is collapsible
         */
        collapsible: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        /**
         * If is a collapsible card, if it is opened or not
         */
        opened: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },
      };
    }

    _hasHeading(icon, heading, collapsible) {
      return icon || heading || collapsible;
    }

    _opened(opened, collapsible) {
      return !collapsible || opened;
    }

    _toggle() {
      if (this.collapsible) {
        this.opened = !this.opened;
        this.notifyResize();
      }
    }

    _toggleIcon(opened) {
      return `hardware:keyboard-arrow-${opened ? 'up' : 'down'}`;
    }
  }

  customElements.define(Card.is, Card);
  Nuxeo.Card = Card;
}
