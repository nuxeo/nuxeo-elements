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
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import { AggregationBehavior } from './nuxeo-aggregation-behavior.js';
import '../widgets/nuxeo-collapsible.js';

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
            transition: all 0.7s;
          }
          paper-checkbox {
            width: 100%;
            margin-top: 6px;
            --paper-checkbox-label-spacing: 8px;
          }
          nuxeo-collapsible {
            --nuxeo-collapsible-heading-padding: 0;
          }
          label {
            @apply --nuxeo-label;
          }
          .showButton a {
            display: block;
            margin-top: 4px;
          }
        </style>

        <dom-if if="[[_isEmpty]]">
          <template>
            <label>[[label]]</label>
            <span>[[i18n('checkboxAggregation.noResults')]]</span>
          </template>
        </dom-if>

        <dom-if if="[[!_isEmpty]]">
          <template>
            <dom-if if="[[!collapsible]]">
              <template>
                <label>[[label]]</label>
                <dom-repeat items="{{buckets}}">
                  <template>
                    <paper-checkbox noink checked="{{item.checked}}" on-change="_computeValues">
                      [[item.label]] ([[item.docCount]])
                    </paper-checkbox>
                  </template>
                </dom-repeat>
              </template>
            </dom-if>

            <dom-if if="[[collapsible]]">
              <template>
                <nuxeo-collapsible>
                  <label slot="heading">[[label]]</label>
                  <dom-repeat items="{{_visibleBuckets}}">
                    <template>
                      <paper-checkbox noink checked="{{item.checked}}" on-change="_computeValues">
                        [[item.label]] ([[item.docCount]])
                      </paper-checkbox>
                    </template>
                  </dom-repeat>
                  <span hidden$="[[_hideShowMore(buckets)]]" class="showButton">
                    <a href="javascript:void(0);" on-tap="_toggleShow">
                      [[_computeShowMoreLabel(_showAll, i18n)]]
                    </a>
                  </span>
                </nuxeo-collapsible>
              </template>
            </dom-if>
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
        },

        /**
         * Label of the element
         */
        label: {
          type: String,
          value: '',
        },

        _showAll: {
          type: Boolean,
          value: false,
          readOnly: true,
        },

        _visibleBuckets: {
          type: Array,
          value: () => [],
          readOnly: true,
        },

        /**
         * If collapsible, the default visible items.
         */
        visibleItems: {
          type: Number,
          value: 8,
        },
      };
    }

    static get observers() {
      return ['_setBuckets(buckets, visibleItems)'];
    }

    _setBuckets() {
      if (this.buckets && this.buckets.length > 0) {
        this._set_visibleBuckets(this.buckets.slice(0, this.visibleItems));
      }
    }

    _toggleShow() {
      this._set_showAll(!this._showAll);
      if (this._showAll) {
        this._set_visibleBuckets(this.buckets);
      } else {
        this._set_visibleBuckets(this.buckets.slice(0, this.visibleItems));
      }
    }

    _computeShowMoreLabel() {
      return this.i18n((this._showAll && 'checkboxAggregation.showLess') || 'checkboxAggregation.showAll');
    }

    _hideShowMore() {
      return this.buckets && this.buckets.length <= this.visibleItems;
    }
  }

  customElements.define('nuxeo-checkbox-aggregation', CheckboxAggregation);
}
