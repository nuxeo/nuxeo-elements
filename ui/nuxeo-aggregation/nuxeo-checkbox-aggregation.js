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
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-icon/iron-icon.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import { AggregationBehavior } from './nuxeo-aggregation-behavior.js';

{
  /**
   * An element to interact with page provider aggregations as checkboxes.
   *
   * In its simplest form:
   *
   *     <nuxeo-page-provider
   *        provider="default_search"
   *        auto
   *        aggregations="{{aggregations}}"
   *        params="[[params]]"
   *     >
   *     </nuxeo-page-provider>
   *
   *     <nuxeo-checkbox-aggregation
   *        data="[[aggregations.dc_created_agg]]"
   *        value="{{params.dc_created_agg}}"
   *        label="Creation date"
   *        >
   *     </nuxeo-checkbox-aggregation>
   *
   *
   * It can also be displayed as a collapsible element, ideal for cases with a long list of checkboxes.
   * Also, when this is the case, it is possibe to show a specific number of checkboxes and hide the
   * rest of them.
   *
         <nuxeo-page-provider
   *        provider="default_search"
   *        auto
   *        aggregations="{{aggregations}}"
   *        params="[[params]]"
   *     >
   *     </nuxeo-page-provider>
   *
   *     <nuxeo-checkbox-aggregation
   *        data="[[aggregations.dc_created_agg]]"
   *        value="{{params.dc_created_agg}}"
   *        label="Creation date"
   *        collapsible
   *        visible-items="4"
   *        >
   *     </nuxeo-checkbox-aggregation>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.AggregationBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-checkbox-aggregation/index.html
   */
  class CheckboxAggregation extends mixinBehaviors([I18nBehavior, AggregationBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            @apply --layout-vertical;
          }
          button {
            height: 100%;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0;
            padding: 0;
            padding-inline-end: 2px;
            background: transparent;
            border: none;
            cursor: pointer;
            text-decoration: none;
            font-size: 1rem;
          }
          /* to fix a blinking default style on safari */
          button:active {
            color: inherit;
          }
          /* XXX - while we define our default focus state */
          button:focus {
            outline: none;
          }
          .heading {
            width: calc(100% - 20px);
            overflow-x: hidden;
            text-align: start;
          }
          iron-icon {
            --iron-icon-height: 20px;
            --iron-icon-width: 20px;
          }
          paper-checkbox {
            width: 100%;
            margin-top: 4px;
            --paper-checkbox-label-spacing: 8px;
          }
          label {
            cursor: pointer;
            @apply --nuxeo-label;
          }
          .show-more-button a {
            display: block;
            margin-top: 4px;
          }
        </style>

        <dom-if if="[[!collapsible]]">
          <template>
            <label>[[label]]</label>
            <dom-if if="[[_isEmpty]]">
              <template>
                <span>[[i18n('checkboxAggregation.noResults')]]</span>
              </template>
            </dom-if>
            <dom-if if="[[!_isEmpty]]">
              <template>
                <dom-repeat items="{{buckets}}">
                  <template>
                    <paper-checkbox noink checked="{{item.checked}}" on-change="_computeValues">
                      [[item.label]] ([[item.docCount]])
                    </paper-checkbox>
                  </template>
                </dom-repeat>
              </template>
            </dom-if>
          </template>
        </dom-if>

        <dom-if if="[[collapsible]]">
          <template>
            <button aria-expanded="[[opened]]" on-tap="_toggle">
              <label class="heading">[[label]]</label>
              <iron-icon icon="[[_toggleIcon(opened)]]"></iron-icon>
            </button>
            <iron-collapse opened="{{opened}}">
              <dom-if if="[[_isEmpty]]">
                <template>
                  <span>[[i18n('checkboxAggregation.noResults')]]</span>
                </template>
              </dom-if>
              <dom-if if="[[!_isEmpty]]">
                <template>
                  <dom-repeat items="{{_visibleBuckets}}">
                    <template>
                      <paper-checkbox noink checked="{{item.checked}}" on-change="_computeValues">
                        [[item.label]] ([[item.docCount]])
                      </paper-checkbox>
                    </template>
                  </dom-repeat>
                  <span hidden$="[[_hideShowMoreButton(buckets, visibleItems)]]" class="show-more-button">
                    <a href="javascript:void(0);" on-tap="_toggleShow">
                      [[_computeShowMoreLabel(_showAll, i18n)]]
                    </a>
                  </span>
                </template>
              </dom-if>
            </iron-collapse>
          </template>
        </dom-if>
      `;
    }

    static get is() {
      return 'nuxeo-checkbox-aggregation';
    }

    static get properties() {
      return {
        /**
         * Make the element collapsible
         */
        collapsible: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        /**
         * Label of the element
         */
        label: {
          type: String,
          value: '',
        },

        /**
         * Expanded or collapsed
         */
        opened: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        /**
         * If collapsible, the default visible items.
         */
        visibleItems: {
          type: Number,
          value: 8,
        },

        _showAll: {
          type: Boolean,
          value: false,
          readOnly: true,
        },

        _visibleBuckets: {
          type: Array,
          computed: '_computeVisibleBuckets(buckets, visibleItems, _showAll)',
        },
      };
    }

    _computeVisibleBuckets(buckets, visibleItems, _showAll) {
      if (!buckets || buckets.length === 0) {
        return [];
      }
      return _showAll ? buckets : buckets.slice(0, visibleItems);
    }

    _toggle() {
      this.opened = !this.opened;
    }

    _toggleIcon(opened) {
      return `hardware:keyboard-arrow-${opened ? 'up' : 'down'}`;
    }

    _toggleShow() {
      this._set_showAll(!this._showAll);
    }

    _computeShowMoreLabel() {
      return this.i18n((this._showAll && 'checkboxAggregation.showLess') || 'checkboxAggregation.showAll');
    }

    _hideShowMoreButton() {
      return this.buckets && this.buckets.length <= this.visibleItems;
    }
  }

  customElements.define('nuxeo-checkbox-aggregation', CheckboxAggregation);
}
