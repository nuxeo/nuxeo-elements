import{m as c,h,i as g,b as d}from"./iframe-T5hUCbnt.js";import{a as u}from"./analysis-BiUYXUaq.js";import{L as p}from"./lists.data-Cg1ey1re.js";import"./iron-icon-lX3uy4jx.js";import{P as f}from"./nuxeo-page-provider-display-behavior-BXf2qcae.js";import{I as x}from"./iron-resizable-behavior-BJTBE6_U.js";import"./nuxeo-aggregation-navigation-PPmUwl9O.js";import{D as b}from"./nuxeo-draggable-list-behavior-CNLYXsWu.js";import"./preload-helper-Dp1pzeXC.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";import"./iron-flex-layout-CQAobW0V.js";import"./templatizer-behavior-BRsvGg6D.js";import"./render-status-BJmzACxi.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
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
*/{class t extends c([x,f,b],Nuxeo.Element){static get template(){return h`
        <style>
          :host {
            display: block;
            min-height: 500px;
            position: relative;
          }

          /* scrollbars */
          :host ::-webkit-scrollbar-track {
            width: 12px !important;
            height: 3px;
          }
          :host ::-webkit-scrollbar {
            background-color: rgba(0, 0, 0, 0.03);
            width: 12px !important;
            height: 3px;
          }
          :host ::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.15);
            border-radius: 1px !important;
          }

          #container {
            @apply --layout-vertical;
            @apply --layout-fit;
          }

          .header {
            @apply --layout-horizontal;
            @apply --layout-center;
          }

          .emptyResult {
            opacity: 0.8;
            display: block;
            font-weight: 300;
            padding: 1.5em 0.7em;
            text-align: center;
            font-size: 1.1rem;
          }

          .filters > * {
            margin: 1em 0 0 2.3em;
          }

          .filter {
            display: inline-block;
            background-color: var(--nuxeo-tag-background);
            padding: 0.2rem 0.4rem;
            margin: 0 0.3em 0.1em 0;
            font-size: 0.8rem;
            border-radius: 2.5em;
            line-height: initial;
          }

          .filter .remove:hover {
            cursor: pointer;
          }

          iron-list {
            height: 100%;
          }

          nuxeo-aggregation-navigation {
            position: absolute;
            top: 82px;
            bottom: 0;
            right: 12px;
          }

          :host([draggable]) ::slotted([selected]) {
            cursor: -webkit-grab;
            cursor: grab;
          }
        </style>

        <div id="container">
          <slot name="nuxeo-selection-toolbar"></slot>

          <div class="header">
            <div id="filters" class="filters">
              <dom-repeat items="[[filters]]" as="filter">
                <template>
                  <span class="tag filter">
                    [[filter.name]]: [[filter.value]]
                    <iron-icon icon="nuxeo:remove" class="remove" on-click="_removeFilter"></iron-icon>
                  </span>
                </template>
              </dom-repeat>
            </div>
          </div>

          <dom-if if="[[_isEmpty]]">
            <template>
              <div class="emptyResult" aria-live="polite">[[_computedEmptyLabel]]</div>
            </template>
          </dom-if>

          <iron-list
            id="list"
            items="[[items]]"
            as="[[as]]"
            grid
            selection-enabled
            selected-item="{{selectedItem}}"
            selected-items="{{selectedItems}}"
            on-scroll="_scrollChanged"
          >
            <slot></slot>
          </iron-list>

          <dom-if if="[[displayNavigation]]">
            <template>
              <nuxeo-aggregation-navigation
                buckets="[[buckets]]"
                on-scroll-to="_onScrollTo"
              ></nuxeo-aggregation-navigation>
            </template>
          </dom-if>
        </div>
      `}static get is(){return"nuxeo-data-grid"}static get properties(){return{multiSelection:{type:Boolean,value:!0},displayNavigation:{type:Boolean,value:!1},_lastIndex:{type:Number,value:0},_lastIndexValue:{type:Number,value:0}}}static get observers(){return["_fetchMissingItems(loading)","_lastIndexChanged(lastIndex)"]}ready(){super.ready(),this.addEventListener("iron-resize",this._fetchMissingItems),this.addEventListener("keydown",this._handleKeyDown)}_handleKeyDown(e){e.key==="Tab"&&(this.$.list.lastVisibleIndex===this._lastIndexValue||this.$.list.lastVisibleIndex===this._lastIndexValue-1)&&(this.$.list.scrollTop=0)}_lastIndexChanged(e){this._lastIndexValue=e}_fetchMissingItems(){!this.loading&&this.$.list.lastVisibleIndex&&this._pageSize&&g.run(()=>{this.$.list.lastVisibleIndex>this._pageSize&&this._fetchRange(this._pageSize,this.$.list.lastVisibleIndex)})}_removeFilter(e){this.dispatchEvent(new CustomEvent("column-filter-changed",{composed:!0,bubbles:!0,detail:{value:"",filterBy:e.model.filter.path,filterExpression:e.model.filter.expression}}))}_onScrollTo(e){this.scrollToIndex(e.detail.index)}draggableFilter(e){return e.selected}get visible(){return!!(this.offsetWidth||this.offsetHeight)}}customElements.define(t.is,t),Nuxeo.DataGrid=t}const y=u("nuxeo-data-grid").notes,A={title:"UI/nuxeo-data-grid",parameters:{docs:{description:{component:y}}}},i={render:()=>d`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
    </style>
    <nuxeo-data-grid .items="${p(0).data}"></nuxeo-data-grid>
  `},a={args:{numberOfItems:50},render:t=>d`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
      .item {
        display: flex;
        flex-direction: column;
        width: 300px;
        height: 300px;
        margin: 0.5rem;
        padding: 0.5rem;
      }
      .thumbnail {
        overflow: hidden;
        margin-bottom: 0.5rem;
        height: 200px;
        width: 100%;
      }
      img {
        width: 100%;
        min-height: 100%;
      }
      h3,
      p {
        margin: 0;
      }
    </style>
    <nuxeo-data-grid .items="${p(t.numberOfItems).data}">
      <template>
        <div class="item">
          <div class="thumbnail">
            <img src="[[item.contextParameters.thumbnail.url]]" />
          </div>
          <h3>[[item.properties.company_name]]</h3>
          <p>[[item.properties.city]]</p>
        </div>
      </template>
    </nuxeo-data-grid>
  `};var r,s,n;i.parameters={...i.parameters,docs:{...(r=i.parameters)==null?void 0:r.docs,source:{originalSource:`{
  render: () => html\`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
    </style>
    <nuxeo-data-grid .items="\${LIST(0).data}"></nuxeo-data-grid>
  \`
}`,...(n=(s=i.parameters)==null?void 0:s.docs)==null?void 0:n.source}}};var o,l,m;a.parameters={...a.parameters,docs:{...(o=a.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    numberOfItems: 50
  },
  render: args => html\`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
      .item {
        display: flex;
        flex-direction: column;
        width: 300px;
        height: 300px;
        margin: 0.5rem;
        padding: 0.5rem;
      }
      .thumbnail {
        overflow: hidden;
        margin-bottom: 0.5rem;
        height: 200px;
        width: 100%;
      }
      img {
        width: 100%;
        min-height: 100%;
      }
      h3,
      p {
        margin: 0;
      }
    </style>
    <nuxeo-data-grid .items="\${LIST(args.numberOfItems).data}">
      <template>
        <div class="item">
          <div class="thumbnail">
            <img src="[[item.contextParameters.thumbnail.url]]" />
          </div>
          <h3>[[item.properties.company_name]]</h3>
          <p>[[item.properties.city]]</p>
        </div>
      </template>
    </nuxeo-data-grid>
  \`
}`,...(m=(l=a.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};const C=["Empty","Default"];export{a as Default,i as Empty,C as __namedExportsOrder,A as default};
