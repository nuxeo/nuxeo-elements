import{m as l,h as r}from"./iframe-T5hUCbnt.js";import"./iron-flex-layout-CQAobW0V.js";import"./paper-checkbox-DJEpcUTk.js";import"./iron-collapse-Q03AhJj8.js";import"./iron-icon-lX3uy4jx.js";import{I as n}from"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
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
*/const s={properties:{data:{type:Object},value:{type:Array,value:[],notify:!0},buckets:{type:Object,computed:"_computeBuckets(data)"},_isEmpty:{type:Boolean,value:!0},sortByLabel:Boolean,labelFormatter:{type:Function,value(){return this._computeLabel.bind(this)}}},observers:["_observeData(data)"],_observeData(){this.data&&this.data.extendedBuckets?this._isEmpty=this.data.extendedBuckets.length===0:this._isEmpty=!0},_computeBuckets(e){if(e){const o=e.extendedBuckets,t=e.selection;return o.forEach(i=>{i.checked=t.indexOf(i.key)>=0,i.label=this.labelFormatter(i)}),this.sortByLabel&&o.sort((i,a)=>i.label<a.label?-1:i.label>a.label?1:0),o}},_computeValues(){const e=[];this.buckets.forEach(o=>{o.checked&&e.push(o.key)}),this.value=e},_computeLabel(e){let o;if(e.fetchedKey){const t=e.fetchedKey;return t["entity-type"]==="directoryEntry"?this.labelForDirectoryEntry(t):t["entity-type"]==="user"?this.labelForUserEntry(t):t["entity-type"]==="document"?t.properties["dc:title"]||this.i18n("aggregation.format.document.field.unknown","dc:title"):(o=this.i18n(`label.ui.aggregate.${e.key}`),o===`label.ui.aggregate.${e.key}`?e.key:o)}return o=this.i18n(`label.ui.aggregate.${e.key}`),o===`label.ui.aggregate.${e.key}`?e.key:o},labelForDirectoryEntry(e){let o=window.nuxeo.I18n.language||"en";o.indexOf("-")>-1&&([o]=o.split("-"));const t=[];for(;e;)e.properties[`label_${o}`]?t.push(e.properties[`label_${o}`]):e.properties.label?t.push(e.properties.label):e.properties.label_en?t.push(e.properties.label_en):t.push(e.properties.id),e=e.properties.parent;return t.reverse().join("/")},labelForUserEntry(e){return e.properties===void 0?e.id:e.properties.firstName&&e.properties.firstName.length>0&&e.properties.lastName&&e.properties.lastName.length>0?`${e.properties.firstName} ${e.properties.lastName}`:e.properties.username}};/**
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
*/{class e extends l([n,s],Nuxeo.Element){static get template(){return r`
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
            color: inherit;
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
                    <div role="group" aria-labelledby="heading">
                      <paper-checkbox
                        noink
                        checked="{{item.checked}}"
                        on-change="_computeValues"
                        aria-label$="[[item.label]] ([[_formatDocCount(item.docCount)]])"
                      >
                        [[item.label]] ([[_formatDocCount(item.docCount)]])
                      </paper-checkbox>
                    </div>
                  </template>
                </dom-repeat>
              </template>
            </dom-if>
          </template>
        </dom-if>

        <dom-if if="[[collapsible]]">
          <template>
            <button aria-expanded="[[opened]]" on-tap="_toggle" aria-labelledby="heading">
              <label class="heading" id="heading">[[label]]</label>
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
                      <div role="group" aria-labelledby="heading">
                        <paper-checkbox
                          noink
                          checked="{{item.checked}}"
                          on-change="_computeValues"
                          aria-label$="[[item.label]] ([[_formatDocCount(item.docCount)]])"
                        >
                          [[item.label]] ([[_formatDocCount(item.docCount)]])
                        </paper-checkbox>
                      </div>
                    </template>
                  </dom-repeat>
                  <span hidden$="[[_hideShowMoreButton(buckets, visibleItems)]]" class="show-more-button">
                    <a href="#" on-tap="_toggleShow">
                      [[_computeShowMoreLabel(_showAll, i18n)]]
                    </a>
                  </span>
                </template>
              </dom-if>
            </iron-collapse>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-checkbox-aggregation"}static get properties(){return{collapsible:{type:Boolean,value:!1,reflectToAttribute:!0},label:{type:String,value:""},opened:{type:Boolean,value:!1,reflectToAttribute:!0},visibleItems:{type:Number,value:8},_showAll:{type:Boolean,value:!1,readOnly:!0},_visibleBuckets:{type:Array,computed:"_computeVisibleBuckets(buckets, visibleItems, _showAll)"}}}ready(){super.ready(),this.setAttribute("tabindex",0)}_formatDocCount(t){return Nuxeo&&Nuxeo.UI&&Nuxeo.UI.config&&Nuxeo.UI.config.numberFormattingEnabled||!1?new Intl.NumberFormat().format(t):t}_computeVisibleBuckets(t,i,a){return!t||t.length===0?[]:a?t:t.slice(0,i)}_toggle(){this.opened=!this.opened}_toggleIcon(t){return`hardware:keyboard-arrow-${t?"up":"down"}`}_toggleShow(t){t.preventDefault(),this._set_showAll(!this._showAll)}_computeShowMoreLabel(){return this.i18n(this._showAll&&"checkboxAggregation.showLess"||"checkboxAggregation.showAll")}_hideShowMoreButton(){return this.buckets&&this.buckets.length<=this.visibleItems}}customElements.define("nuxeo-checkbox-aggregation",e)}
