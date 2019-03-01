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
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-listbox/paper-listbox.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';

{
  /**
   * An element for selecting options.
   *
   * Example:
   *
   *     <nuxeo-select label="Options" options=[[options]] selected={{selected}}></nuxeo-select>
   *
   * @appliesMixin Polymer.IronResizableBehavior
   * @appliesMixin Polymer.IronValidatableBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-select/index.html
   */
  class Select extends
    mixinBehaviors([IronResizableBehavior, IronValidatableBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
        position: relative;
        --paper-input-container-underline: {
          border-bottom: 1px solid var(--paper-input-container-input-color) !important;
        };
      }

      :host([hidden]) {
        display: none;
      }

      :host([required]) label::after {
        display: inline-block;
        content: '*';
        margin-left: 4px; 
        color: var(--paper-input-container-invalid-color, red);
      }

      paper-listbox {
        padding: 0;
        --paper-listbox-selected-item: {
          font-weight: normal;
        };
        --paper-listbox-focused-item: {
          font-weight: normal;
          color: var(--paper-input-container-input-color);
        };
        --paper-listbox-focused-item-after: {
          font-weight: normal;
          color: var(--nuxeo-box, white);
        }
      }

      paper-dropdown-menu {
        --paper-input-container: {
          padding-top: 0;
        }
      }

      label {
        @apply --nuxeo-label;
      }

      ::slotted(paper-item) {
        font-weight: normal !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 32px;
        min-height: 32px;
        padding: 0 12px;
        cursor: pointer;
        color: var(--paper-input-container-input-color);
      }

      ::slotted(paper-item:hover), ::slotted(paper-item[pressed]) {
        background: var(--paper-input-container-focus-color);
        color: var(--nuxeo-box, white) !important;
      }
    </style>

    <label>[[label]]</label>

    <paper-dropdown-menu
      id="paperDropdownMenu"
      placeholder="[[placeholder]]"
      error-message="[[errorMessage]]"
      no-label-float
      noink
      no-animations
      restore-focus-on-close="false"
      horizontal-align="left"
      on-paper-dropdown-open="_resize"
      readonly\$="[[readonly]]"
      disabled\$="[[disabled]]"
      required\$="[[required]]"
      validator\$="[[validator]]"
      invalid\$="[[invalid]]">

      <paper-listbox
        id="paperMenu"
        slot="dropdown-content"
        attr-for-selected="[[_computeAttrForSelected(attrForSelected, options)]]"
        selected="{{selected}}">
        <dom-if if="[[options]]">
          <template>
            <dom-repeat items="[[options]]" as="item">
              <template>
                <paper-item option="[[_id(item)]]">[[_label(item)]]</paper-item>
              </template>
            </dom-repeat>
          </template>
        </dom-if>
        <slot></slot>
      </paper-listbox>
    </paper-dropdown-menu>
`;
    }

    static get is() {
      return 'nuxeo-select';
    }

    static get properties() {
      return {
        /**
         * Label.
         */
        label: {
          type: String,
          value: null,
        },

        /**
         * Placeholder.
         */
        placeholder: {
          type: String,
          value: ' ',
        },

        /**
         * Error message.
         */
        errorMessage: {
          type: String,
        },

        /**
         * Options array to show.
         */
        options: {
          type: Array,
          value: null,
        },

        /**
         * Gets or sets the selected option.
         */
        selected: {
          type: String,
          notify: true,
        },

        /**
         * Attribute value or property of an element for `selected` instead of the default `option` value.
         */
        attrForSelected: {
          type: String,
          value: null,
        },

        /**
         * Read only.
         */
        readonly: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        /**
         * Disabled.
         */
        disabled: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        /**
         * Required.
         */
        required: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },
      };
    }

    ready() {
      super.ready();
      this.addEventListener('iron-resize', this._resize);
    }

    close() {
      this.$.paperDropdownMenu.close();
    }

    _resize() {
      const button = this.$.paperDropdownMenu.$.menuButton;
      button.noOverlap = true;
      button.verticalOffset = -8;
      const width = this.getBoundingClientRect().width;
      if (width > 0) {
        this.$.paperDropdownMenu.style.width = this.$.paperMenu.style.width = `${width}px`;
      }
    }

    _id(item) {
      if (!this.selected) { // select first item as default selection
        this.selected = (item && item.id) ? item.id : item;
      }
      return (item && item.id) ? item.id : item;
    }

    _label(item) {
      return (item && item.label) ? item.label : item;
    }

    _computeAttrForSelected(attrForSelected, options) {
      return options ? 'option' : attrForSelected;
    }

    /* Override method from Polymer.IronValidatableBehavior. */
    _getValidity() {
      return this.$.paperDropdownMenu._getValidity();
    }
  }

  customElements.define(Select.is, Select);
  Nuxeo.Select = Select;
}
