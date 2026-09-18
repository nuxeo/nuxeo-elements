import{m as n,h as a,b as l}from"./iframe-DfANLok6.js";import"./iron-icons-Gq0N1TWG.js";import"./paper-icon-button-BnBB_cCA.js";import"./nuxeo-select-CQwwEqNV.js";import{I as p}from"./nuxeo-i18n-behavior-DkDjknqP.js";import"./nuxeo-tooltip-D6ydFGfA.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-icon-Bt9a3Rhq.js";import"./iron-flex-layout-Cy57WvA0.js";import"./iron-iconset-svg-5-aE6F5a.js";import"./default-theme-sVFU976S.js";import"./paper-inky-focus-behavior-rjTRkVyf.js";import"./paper-ripple-CvfHxnYa.js";import"./iron-a11y-keys-behavior-CXq8UWKK.js";import"./iron-validatable-behavior-D22XWMWB.js";import"./paper-input-B8T425Tx.js";import"./paper-input-behavior-DGBlyaCy.js";import"./typography-Dsqr7jdM.js";import"./roboto-AfkCeElV.js";import"./paper-menu-button-M3Il0SU0.js";import"./iron-menu-behavior-BqEGeEci.js";import"./neon-animation-runner-behavior-DA6rB6qM.js";import"./iron-resizable-behavior-AZ17E4LT.js";import"./shadow-CZKJlY6X.js";import"./paper-item-behavior-BYdc6ASZ.js";/**
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
*/{class r extends n([p],Nuxeo.Element){static get template(){return a`
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
      `}static get is(){return"nuxeo-sort-select"}static get properties(){return{label:{type:String,value:null},hasLabel:{type:Boolean,computed:"_computeHasLabel(label)"},options:{type:Array,value:[],observer:"_optionsChanged"},selected:{type:String,observer:"_selectedChanged",notify:!0},_sortOrder:{type:String,value:"asc"}}}_normalizeLabel(e){return(typeof e=="string"?e.trim():e)||null}_computeHasLabel(e){return this._normalizeLabel(e)!==null}_optionsChanged(){this.options.forEach(e=>{e.selected&&(this.selected=e)})}_selectedChanged(){this.selected&&(this._sortOrder=this.selected.order)}_toggleSortOrder(){this._sortOrder=this._sortOrder==="asc"?"desc":"asc",this.selected&&(this.set("selected.order",this._sortOrder),this.dispatchEvent(new CustomEvent("sort-order-changed",{composed:!0,bubbles:!0,detail:{sort:this.selected}})))}_sortOrderIcon(){return this._sortOrder==="asc"?"icons:arrow-upward":"icons:arrow-downward"}}customElements.define(r.is,r),Nuxeo.SortSelect=r}const d=[{field:"dc:title",label:"Title",order:"asc"},{field:"dc:created",label:"Created",order:"asc"},{field:"dc:modified",label:"Modified",order:"desc"},{field:"dc:lastContributor",label:"Last contributor",order:"asc"}],M={title:"UI/nuxeo-sort-select"},t={render:()=>l`
    <style>
      .container {
        margin: 2rem;
      }
    </style>
    <div class="container">
      <nuxeo-sort-select .options="${d}"></nuxeo-sort-select>
    </div>
  `};var o,i,s;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => html\`
    <style>
      .container {
        margin: 2rem;
      }
    </style>
    <div class="container">
      <nuxeo-sort-select .options="\${options}"></nuxeo-sort-select>
    </div>
  \`
}`,...(s=(i=t.parameters)==null?void 0:i.docs)==null?void 0:s.source}}};const T=["Default"];export{t as Default,T as __namedExportsOrder,M as default};
