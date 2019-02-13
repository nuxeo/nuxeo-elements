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
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { DirectoryWidgetBehavior } from './nuxeo-directory-widget-behavior.js';

{
  /**
   * An element for selecting one or more directory entries with checkboxes.
   *
   *     <nuxeo-directory-checkbox directory-name="country" value="{{value}}"></nuxeo-directory-checkbox>
   *
   * @appliesMixin Nuxeo.DirectoryWidgetBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-directory-checkbox/index.html
   */
  class DirectoryCheckbox extends mixinBehaviors([DirectoryWidgetBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="iron-flex iron-flex-alignment">
      :host {
        display: block;
        position: relative;
        padding-bottom: 8px;
      }

      [hidden] {
        display: none !important;
      }

      :host([invalid]) .label,
      .error {
        color: var(--paper-input-container-invalid-color, red);
      }

      :host([invalid]) .error {
        opacity: 1;
        font-size: .923rem;
      }

      .label {
         @apply --nuxeo-label;
      }

      .label[required]::after {
        display: inline-block;
        content: '*';
        margin-left: 4px;
        color: var(--paper-input-container-invalid-color, red);
        font-size: 1.2em;
      }

      paper-checkbox {
        margin-top: 10px
      }

    </style>

    <nuxeo-operation id="op" op="Directory.SuggestEntries">
    </nuxeo-operation>

    <label class="label" hidden\$="[[!label]]" required\$="[[required]]">[[label]]</label>

    <iron-selector
      attr-for-selected="name"
      multi
      selected-attribute="checked"
      class="layout vertical flex"
      selected-values="{{_selected}}"
      on-selected-items-changed="_updateItems">
      <dom-repeat items="[[_entries]]">
        <template>
          <paper-checkbox
            name="[[idFunction(item)]]"
            data-index="[[index]]"
            checked="[[item.checked]]"
            disabled="[[readonly]]">
            [[format(item)]]
          </paper-checkbox>
        </template>
      </dom-repeat>
    </iron-selector>

    <label class="error" hidden\$="[[!invalid]]">[[errorMessage]]</label>
`;
    }

    static get is() {
      return 'nuxeo-directory-checkbox';
    }

    static get properties() {
      return {
        /**
         * Selected entries.
         */
        selectedItems: {
          type: Array,
          notify: true,
        },

        /**
         * Selected ids.
         */
        value: {
          type: Array,
          notify: true,
        },

        _selected: {
          type: Array,
          value: [],
        },
      };
    }

    _updateItems(e) {
      const tmp = [];
      const tmpIds = [];
      if (e.detail.value) {
        for (let i = 0; i < e.detail.value.length; i++) {
          const item = this._entries[e.detail.value[i].dataIndex];
          tmp.push(item);
          tmpIds.push(this.idFunction(item));
        }
      }
      this.selectedItems = tmp;
      this.value = tmpIds;
    }

    /* Override method from Polymer.IronValidatableBehavior. */
    _getValidity() {
      if (this.required) {
        return this.value && this.value.length > 0;
      }
      return true;
    }

    _isChecked(entry) {
      const value = this.value || this.selectedItems;
      return value && value.some((el) => {
        if (this.idFunction(el) === this.idFunction(entry)) {
          this._selected.push(this.idFunction(entry));
          return true;
        }
        return false;
      });
    }
  }

  customElements.define(DirectoryCheckbox.is, DirectoryCheckbox);
  Nuxeo.DirectoryCheckbox = DirectoryCheckbox;
}
