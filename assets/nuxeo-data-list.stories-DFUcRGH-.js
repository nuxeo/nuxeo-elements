import{m as g,h as y,b as l}from"./iframe-T5hUCbnt.js";import{a as v}from"./analysis-BiUYXUaq.js";import{L as o}from"./lists.data-Cg1ey1re.js";import"./iron-icon-lX3uy4jx.js";import{P as I}from"./nuxeo-page-provider-display-behavior-BXf2qcae.js";import{I as _}from"./iron-resizable-behavior-BJTBE6_U.js";import"./shadow-BdVOAeUX.js";import"./nuxeo-aggregation-navigation-PPmUwl9O.js";import{D as k}from"./nuxeo-draggable-list-behavior-CNLYXsWu.js";import"./nuxeo-document-thumbnail-BoTgWRTm.js";import"./preload-helper-Dp1pzeXC.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";import"./iron-flex-layout-CQAobW0V.js";import"./templatizer-behavior-BRsvGg6D.js";import"./render-status-BJmzACxi.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./roboto-AfkCeElV.js";/**
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
*/{class t extends g([_,I,k],Nuxeo.Element){static get template(){return y`
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
      `}static get is(){return"nuxeo-data-list"}static get properties(){return{multiSelection:{type:Boolean,value:!1},selectOnTap:{type:Boolean,value:!1},displayNavigation:{type:Boolean,value:!1}}}ready(){super.ready(),this.listen(this.$.list,"keydown","_keydown")}_keydown(e){switch(e.key){case"ArrowUp":case"Up":this._select(-1,0);break;case"k":this._select(-1,0);break;case"ArrowDown":case"Down":this._select(1,0);break;case"j":this._select(1,0);break}}_select(e,b){const s=this._selectedItemIndex()+e;s>=0&&s<this.$.list.items.length&&(this.$.list.selectIndex(s),this.$.list.focusItem(s+b))}selectNext(){this._select(1,0)}selectPrevious(){this._select(-1,0)}_selectedItemIndex(){return this.selectedItem?this.$.list.items.indexOf(this.selectedItem):0}_removeFilter(e){this.dispatchEvent(new CustomEvent("column-filter-changed",{composed:!0,bubbles:!0,detail:{value:"",filterBy:e.model.filter.path,filterExpression:e.model.filter.expression}}))}_onScrollTo(e){this.scrollToIndex(e.detail.index)}draggableFilter(e){return e.selected}get visible(){return!!(this.offsetWidth||this.offsetHeight)}}customElements.define(t.is,t),Nuxeo.DataList=t}const O=v("nuxeo-data-list").notes,G={title:"UI/nuxeo-data-list",parameters:{docs:{description:{component:O}}}},i={render:()=>l`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
    </style>
    <nuxeo-data-list .items="${o(0).data}"></nuxeo-data-list>
  `},a={args:{numberOfItems:50},render:t=>l`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
      .list-item {
        padding: 5px;
      }
    </style>
    <nuxeo-data-list .items="${o(t.numberOfItems).data}">
      <template>
        <div tabindex$="{{tabIndex}}" class="list-item">
          <div class="list-item-title">[[item.properties.company_name]]</div>
        </div>
      </template>
    </nuxeo-data-list>
  `},n={args:{numberOfItems:50},render:t=>l`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
      .list-item {
        display: flex;
        justify-content: left;
        align-items: center;
        padding: 5px;
      }
      nuxeo-document-thumbnail {
        display: block;
      }
    </style>
    <nuxeo-data-list .items="${o(t.numberOfItems).data}">
      <template>
        <div tabindex$="{{tabIndex}}" class="list-item">
          <nuxeo-document-thumbnail document="[[item]]"></nuxeo-document-thumbnail>
          <div class="list-item-title">[[item.properties.company_name]]</div>
        </div>
      </template>
    </nuxeo-data-list>
  `};var r,m,d;i.parameters={...i.parameters,docs:{...(r=i.parameters)==null?void 0:r.docs,source:{originalSource:`{
  render: () => html\`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
    </style>
    <nuxeo-data-list .items="\${LIST(0).data}"></nuxeo-data-list>
  \`
}`,...(d=(m=i.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var p,c,u;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    numberOfItems: 50
  },
  render: args => html\`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
      .list-item {
        padding: 5px;
      }
    </style>
    <nuxeo-data-list .items="\${LIST(args.numberOfItems).data}">
      <template>
        <div tabindex$="{{tabIndex}}" class="list-item">
          <div class="list-item-title">[[item.properties.company_name]]</div>
        </div>
      </template>
    </nuxeo-data-list>
  \`
}`,...(u=(c=a.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var f,h,x;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    numberOfItems: 50
  },
  render: args => html\`
    <style>
      * {
        font-family: 'Open Sans', Arial, sans-serif;
      }
      .list-item {
        display: flex;
        justify-content: left;
        align-items: center;
        padding: 5px;
      }
      nuxeo-document-thumbnail {
        display: block;
      }
    </style>
    <nuxeo-data-list .items="\${LIST(args.numberOfItems).data}">
      <template>
        <div tabindex$="{{tabIndex}}" class="list-item">
          <nuxeo-document-thumbnail document="[[item]]"></nuxeo-document-thumbnail>
          <div class="list-item-title">[[item.properties.company_name]]</div>
        </div>
      </template>
    </nuxeo-data-list>
  \`
}`,...(x=(h=n.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};const J=["Empty","Default","WithThumbnail"];export{a as Default,i as Empty,n as WithThumbnail,J as __namedExportsOrder,G as default};
