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

{
  /**
   * An element to interact with page provider aggregations as checkboxes.
   *
   *     <nuxeo-page-provider provider="default_search" auto
   *                          aggregations="{{aggregations}}"
   *                          params="[[params]]">
   *     </nuxeo-page-provider>
   *
   *     <nuxeo-checkbox-aggregation data="[[aggregations.dc_created_agg]]"
   *                                 value="{{params.dc_created_agg}}">
   *     </nuxeo-checkbox-aggregation>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @appliesMixin Nuxeo.AggregationBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-checkbox-aggregation/index.html
   */
  class CheckboxAggregation
    extends mixinBehaviors([I18nBehavior, AggregationBehavior], Nuxeo.Element) {
    static get template() {
      return html`
   <style>
     :host {
       @apply --layout-vertical;
     }
     paper-checkbox {
       --paper-checkbox-label-spacing: 10px;
       margin-bottom: 5px;
     }
   </style>

    <dom-repeat items="{{buckets}}">
      <template>
        <paper-checkbox noink="" checked="{{item.checked}}" on-change="_computeValues">
          [[item.label]] ([[item.docCount]])
        </paper-checkbox>
      </template>
    </dom-repeat>
    <dom-if if="[[_isEmpty]]">
      <template>
        <label>[[i18n('checkboxAggregation.noResults')]]</label>
      </template>
    </dom-if>
`;
    }

    static get is() {
      return 'nuxeo-checkbox-aggregation';
    }
  }

  customElements.define(CheckboxAggregation.is, CheckboxAggregation);
  Nuxeo.CheckboxAggregation = CheckboxAggregation;
}
