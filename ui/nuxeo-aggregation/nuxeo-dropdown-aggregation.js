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
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../widgets/nuxeo-selectivity.js';
import { AggregationBehavior } from './nuxeo-aggregation-behavior.js';

{
  /**
   * An element to interact with page provider aggregations as suggestions.
   *
   *     <nuxeo-page-provider provider="default_search" auto
   *                          aggregations="{{aggregations}}"
   *                          params="[[params]]">
   *     </nuxeo-page-provider>
   *
   *     <nuxeo-dropdown-aggregation data="[[aggregations.dc_creator_agg]]" multiple
   *                                 value="{{params.dc_creator_agg}}">
   *     </nuxeo-dropdown-aggregation>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.AggregationBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-dropdown-aggregation/index.html
   */
  class DropdownAggregation
    extends mixinBehaviors([I18nBehavior, AggregationBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
        width: 100%;
      }

      [hidden] {
        display: none;
      }
    </style>

    <nuxeo-selectivity
      data="[[_computeData(buckets)]]"
      min-chars="[[minChars]]"
      multiple="[[multiple]]"
      placeholder="[[placeholder]]"
      value="{{value}}">
    </nuxeo-selectivity>
`;
    }

    static get is() {
      return 'nuxeo-dropdown-aggregation';
    }

    static get properties() {
      return {
        value: {
          type: Array,
          notify: true,
        },

        multiple: {
          type: Boolean,
          value: false,
        },

        minChars: {
          type: Number,
          value: 0,
        },

        placeholder: String,
      };
    }

    _computeData(buckets) {
      if (buckets) {
        return buckets.map((item) => {
          const label = `${item.label} (${item.docCount})`;
          return {
            id: item.key,
            text: label,
            displayLabel: label,
          };
        });
      } else {
        return [];
      }
    }
  }

  customElements.define(DropdownAggregation.is, DropdownAggregation);
  Nuxeo.DropdownAggregation = DropdownAggregation;
}
