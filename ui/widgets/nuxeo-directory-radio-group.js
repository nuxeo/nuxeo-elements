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
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { DirectoryWidgetBehavior } from './nuxeo-directory-widget-behavior.js';

{
  /**
   * An element for selecting one directory entry with a radio group widget.
   *
   *     <nuxeo-directory-radio-group directory-name="country" value="{{value}}"></nuxeo-directory-radio-group>
   *
   * @appliesMixin Nuxeo.DirectoryWidgetBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-directory-radio-group/index.html
   */
  class DirectoryRadioGroup extends mixinBehaviors([DirectoryWidgetBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
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

    <paper-radio-group on-selected-item-changed="_updateItem" selected="{{_selected}}">
      <dom-repeat items="[[_entries]]">
        <template>
          <paper-radio-button
            name="[[idFunction(item)]]"
            data-index="[[index]]"
            checked="[[item.checked]]"
            disabled="[[readonly]]">
            [[format(item)]]
          </paper-radio-button>
        </template>
      </dom-repeat>
    </paper-radio-group>

    <label class="error" hidden\$="[[!invalid]]">[[errorMessage]]</label>
`;
    }

    static get is() {
      return 'nuxeo-directory-radio-group';
    }

    static get properties() {
      return {
        /**
         * Selected entry.
         */
        selectedItem: {
          type: Object,
          notify: true,
        },

        /**
         * Selected id.
         */
        value: {
          type: String,
          notify: true,
        },

        _selected: String,
      };
    }

    _updateItem(e) {
      if (e.detail && e.detail.value) {
        this.set('selectedItem', this._entries[e.detail.value.dataIndex]);
        this.set('value', this.idFunction(this.selectedItem));
      }
    }

    /* Override method from Polymer.IronValidatableBehavior. */
    _getValidity() {
      if (this.required) {
        return !!this.value;
      }
      return true;
    }

    _isChecked(entry) {
      const value = this.value || this.selectedItem;
      if (value && this.idFunction(value) === this.idFunction(entry)) {
        this._selected = this.idFunction(entry);
        return true;
      }
      return false;
    }
  }

  customElements.define(DirectoryRadioGroup.is, DirectoryRadioGroup);
  Nuxeo.DirectoryRadioGroup = DirectoryRadioGroup;
}
