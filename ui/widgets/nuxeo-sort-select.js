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
import '@polymer/iron-icons/iron-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import './nuxeo-select.js';
import './nuxeo-tooltip.js';

{
  /**
   * An element to select sort field and sort order.
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-sort-select/index.html
   */
  class SortSelect extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            display: block;
            @apply --layout-horizontal;
            @apply --layout-center;
          }

          nuxeo-select {
            padding-left: 8px;
            width: 160px;
            --nuxeo-select-input-container-padding: 10px 0;
            --paper-input-container-input: {
              font-size: var(--nuxeo-sort-select-input-font-size, inherit);
              font-weight: bold;
            }
          }

          span {
            font-size: var(--nuxeo-sort-select-input-font-size, inherit);
          }

          paper-icon-button {
            max-width: var(--nuxeo-sort-select-order-toggle-width, 20px);
            max-height: var(--nuxeo-sort-select-order-toggle-height, 20px);
            padding: 0;
            margin: 0 16px;
          }
        </style>

        <template is="dom-if" if="[[hasLabel]]">
          <span>[[_normalizeLabel(label)]]</span>
        </template>
        <nuxeo-select aria-label="[[_normalizeLabel(label)]]" attr-for-selected="option" selected="{{selected}}">
          <dom-if if="[[options]]">
            <template>
              <dom-repeat items="[[options]]" as="item">
                <template>
                  <paper-item option="[[item]]">[[item.label]]</paper-item>
                </template>
              </dom-repeat>
            </template>
          </dom-if>
        </nuxeo-select>

        <paper-icon-button
          id="reverse"
          noink
          on-click="_toggleSortOrder"
          icon="[[_sortOrderIcon(_sortOrder)]]"
          aria-label="[[i18n('sortSelect.reverseOrder')]]"
        >
        </paper-icon-button>
        <nuxeo-tooltip for="reverse" id="tooltip">[[i18n('sortSelect.reverseOrder')]]</nuxeo-tooltip>
      `;
    }

    static get is() {
      return 'nuxeo-sort-select';
    }

    static get properties() {
      return {
        /**
         * Label of the sort field selector. Rendered inline next to the select and used as the
         * accessible name of the underlying combobox.
         */
        label: {
          type: String,
          value: null,
        },

        /**
         * Whether a non-blank `label` was provided.
         */
        hasLabel: {
          type: Boolean,
          computed: '_computeHasLabel(label)',
        },

        options: {
          type: Array,
          value: [],
          observer: '_optionsChanged',
        },

        selected: {
          type: String,
          observer: '_selectedChanged',
          notify: true,
        },

        _sortOrder: {
          type: String,
          value: 'asc',
        },
      };
    }

    /**
     * Single source of truth for the label: a blank one becomes `null`, so the visible span and the
     * combobox's accessible name can never disagree.
     */
    _normalizeLabel(label) {
      return (typeof label === 'string' ? label.trim() : label) || null;
    }

    _computeHasLabel(label) {
      return this._normalizeLabel(label) !== null;
    }

    _optionsChanged() {
      this.options.forEach((option) => {
        if (option.selected) {
          this.selected = option;
        }
      });
    }

    _selectedChanged() {
      if (this.selected) {
        this._sortOrder = this.selected.order;
      }
    }

    _toggleSortOrder() {
      this._sortOrder = this._sortOrder === 'asc' ? 'desc' : 'asc';
      if (this.selected) {
        this.set('selected.order', this._sortOrder);
        this.dispatchEvent(
          new CustomEvent('sort-order-changed', {
            composed: true,
            bubbles: true,
            detail: { sort: this.selected },
          }),
        );
      }
    }

    _sortOrderIcon() {
      return this._sortOrder === 'asc' ? 'icons:arrow-upward' : 'icons:arrow-downward';
    }
  }

  customElements.define(SortSelect.is, SortSelect);
  Nuxeo.SortSelect = SortSelect;
}
