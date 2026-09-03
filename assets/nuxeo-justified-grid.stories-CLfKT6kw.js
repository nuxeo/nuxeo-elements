import{m as j,R as $,h as P,d as k,D as m,t as p,b as h}from"./iframe-T5hUCbnt.js";import{a as z}from"./analysis-BiUYXUaq.js";import{L as E}from"./lists.data-Cg1ey1re.js";import{T}from"./templatizer-behavior-BRsvGg6D.js";import{P as N}from"./nuxeo-page-provider-display-behavior-BXf2qcae.js";import{I as R}from"./iron-resizable-behavior-BJTBE6_U.js";import"./paper-icon-button-BQJYUoC5.js";import{a as C}from"./render-status-BJmzACxi.js";import"./iron-image-BFdhxKpa.js";import"./preload-helper-Dp1pzeXC.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./iron-icon-lX3uy4jx.js";import"./iron-flex-layout-CQAobW0V.js";import"./default-theme-RhyFn9QU.js";import"./paper-inky-focus-behavior-BFu4CTGP.js";import"./paper-ripple-e9CBUXzz.js";import"./iron-a11y-keys-behavior-CQeU5Yru.js";/**
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
*/{class i extends j([R,T,N,$],Nuxeo.Element){static get template(){return P`
        <style>
          :host {
            display: block;
          }

          #container {
            position: relative;
            height: 100%;
            width: 100%;
          }

          #list {
            @apply --layout-fit;
          }

          #list::after {
            content: '';
            flex-grow: 999999999;
          }

          #list .row {
            display: flex;
            flex-direction: row;
          }

          #list .item {
            position: relative;
            box-shadow: 0 3px 5px rgba(0, 0, 0, 0.04);
            border: 2px solid transparent;
            cursor: pointer;
            outline: none;
          }

          #list .item[selected],
          #list .item:hover,
          #list .item:focus {
            border: 2px solid var(--nuxeo-grid-selected, transparent);
            background-color: var(--nuxeo-grid-selected, transparent);
            color: white;
          }

          #list .item paper-icon-button {
            position: absolute;
            left: 10px;
            top: 10px;
            background-color: rgba(255, 255, 255, 0.95);
            border: 2px solid var(--nuxeo-grid-selected);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            padding: 2px;
            color: var(--nuxeo-grid-selected);
            display: none;
          }

          #list .item[selected] paper-icon-button {
            border: 2px solid var(--nuxeo-grid-selected);
            background-color: var(--nuxeo-grid-selected);
            color: white;
            display: block;
          }

          #list .item:hover paper-icon-button,
          #list .item paper-icon-button[selection-mode] {
            display: block;
          }

          [hidden] {
            display: none !important;
          }

          .emptyResult {
            opacity: 0.8;
            display: block;
            font-weight: 300;
            padding: 1.5em 0.7em;
            text-align: center;
            font-size: 1.1rem;
          }
        </style>

        <dom-if if="[[_isEmpty]]">
          <template>
            <div class="emptyResult">[[_computedEmptyLabel]]</div>
          </template>
        </dom-if>

        <div id="container">
          <iron-list id="list" items="[[rows]]" as="row" on-iron-resize="_resize">
            <template>
              <div class="row">
                <dom-repeat items="[[row]]">
                  <template>
                    <div
                      class="item"
                      tabindex="0"
                      on-click="_click"
                      selected$="[[_isSelected(item, selectedItems.*)]]"
                      style$="height: [[item._view.height]]px; width: [[item._view.width]]px;"
                    >
                      <div id="item-[[item._view.index]]"></div>
                      [[_itemChanged(item, item._view.width, item._view.height)]]
                      <paper-icon-button
                        noink
                        icon="icons:check"
                        selection-mode$="[[selectionMode]]"
                        hidden$="[[!selectionEnabled]]"
                        on-click="_check"
                        aria-label$="[[i18n('command.select')]]"
                      >
                      </paper-icon-button>
                    </div>
                  </template>
                </dom-repeat>
              </div>
            </template>
          </iron-list>

          <iron-scroll-threshold id="scrollThreshold" scroll-target="list" on-lower-threshold="_scrollChanged">
          </iron-scroll-threshold>
          <array-selector id="selector" items="{{items}}" selected="{{selectedItems}}" multi></array-selector>
        </div>
      `}static get is(){return"nuxeo-justified-grid"}static get properties(){return{rowHeight:{type:Number,value:196},page:{type:Number,value:1},pageSize:{type:Number,value:50},rows:{type:Array,value:[]},_isFetching:{type:Boolean,value:!1},_templateElement:{type:Object}}}static get observers(){return["_selectedItemsChanged(selectedItems.splices)"]}ready(){super.ready();const e=k(this).querySelector("template");e&&(this.templatize(e),this._templateElement=this.stamp().root.firstElementChild)}disconnectedCallback(){super.disconnectedCallback(),this._templateElement=null}_itemChanged(e){this._templateElement&&e&&e._view&&C(this,()=>{const t=this.$$(`#item-${e._view.index}`);if(t)if(t.childNodes.length>0)t.childNodes[0].set("document",e);else{const r=this._templateElement.cloneNode(!0);r.set("document",e),t.appendChild(r)}})}reset(e){this.set("items",[]),this.set("rows",[]),this.page=1,this.$.scrollThreshold.clearTriggers(),this._reset(e)}fetch(){return this._fetchNewPage(!0)}_fetchNewPage(e){return this._isFetching||!this._hasPageProvider()||this.page>this.nxProvider.numberOfPages?(e||this.$.scrollThreshold.clearTriggers(),this._isFetching=!1,Promise.resolve()):(this._isFetching=!0,this.page=e?1:this.page,this._fetchPage(this.page,this.pageSize).then(t=>{this._addItems(t.entries),(!e||this.page===1)&&(this.page+=1,this.$.scrollThreshold.clearTriggers()),this._isFetching=!1}))}_scrollChanged(){return this._debouncer=m.debounce(this._debouncer,p.after(this.scrollThrottle>0?this.scrollThrottle:1),()=>this._fetchNewPage(!1)),this._fetchNewPage(!1)}getSelectedItems(){return this.$.selector.selected}selectItem(e){this.selectionEnabled&&(this.$.selector.select(e),this._updateFlags())}selectIndex(e){this.selectionEnabled&&(this.$.selector.selectIndex(e),this._updateFlags())}selectItems(e){this.selectionEnabled&&e&&e.length>0&&(e.forEach(t=>this.$.selector.select(t)),this._updateFlags())}deselectItem(e){this.selectionEnabled&&!this.selectAllActive&&(this.$.selector.deselect(e),this._updateFlags())}deselectIndex(e){this.selectionEnabled&&!this.selectAllActive&&(this.$.selector.deselectIndex(e),this._updateFlags())}clearSelection(){this._isSelectAllActive=!1,this.$.selector.clearSelection(),this._updateFlags()}_check(e){this.selectionEnabled&&!this.selectAllActive?(this.selectionMode=!0,this._click(e)):(e.preventDefault(),e.stopPropagation())}_click(e){const{index:t}=e.model.item._view;this.selectionEnabled&&this.selectionMode&&!this.selectAllActive?this._isIndexSelected(t)?this.deselectIndex(t):this.selectIndex(t):this.dispatchEvent(new CustomEvent("navigate",{composed:!0,bubbles:!0,detail:{doc:this.items[t],index:t}})),e.stopPropagation()}_selectedItemsChanged(){this.selectionMode=this.selectedItems&&this.selectedItems.length>0}_isSelected(e){return this._isIndexSelected(e._view.index)}_isIndexSelected(e){return this.selectedItems.indexOf(this.items[e])>-1}_addItems(e){let t=e;this.rows.length>0&&(t=this.rows[this.rows.length-1].map(n=>this.items[n._view.index]).concat(t),this.pop("rows")),this._computeRows(t).forEach(r=>this.push("rows",r)),this.$.scrollThreshold.clearTriggers()}_computeRows(e){const t=this.$.list.offsetWidth,r=[];let n=0,o=[];return e.filter(a=>Object.keys(a).length!==0).forEach((a,S)=>{const s=Object.assign({},a);s.size=s.properties["picture:info"]||{width:1,height:1},s.size.width=s.size.width||1,s.size.height=s.size.height||1,s._view={},s._view.index=this.items.indexOf(a),s._view.width=s.size.width*this.rowHeight/s.size.height,s._view.height=this.rowHeight,n+s._view.width<=t?(o.push(s),n+=s._view.width):(r.push(this._fitItemsToWidth(o,n,t)),o=[s],n=s._view.width),S===e.length-1&&r.push(this._fitItemsToWidth(o,n,t))}),r}_fitItemsToWidth(e,t,r){const n=r*this.rowHeight/t;return e.forEach(o=>{o._view.height=n,o._view.width=o._view.width/t*r}),e}_resize(){(this.$.list.offsetWidth||this.$.list.offsetHeight)&&(this._debouncer=m.debounce(this._debouncer,p.after(150),()=>{this.rows=this._computeRows(this.items)}))}}customElements.define(i.is,i),Nuxeo.JustifiedGrid=i}/**
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
*/{class i extends Nuxeo.Element{static get template(){return P`
        <style>
          :host {
            display: block;
          }

          [hidden] {
            display: none !important;
          }

          .item {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
          }

          .item iron-image {
            width: 100%;
            height: 100%;
            --iron-image-placeholder: {
              background: #fafafa;
            }
          }

          .item .overlay {
            display: none;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 24px 10px 8px;
            background: rgba(0, 0, 0, 0.4);
            background: -webkit-linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
            background: -o-linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
            background: -moz-linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
            background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
            text-shadow: -1px 0 rgba(0, 0, 0, 0.4), 0 1px rgba(0, 0, 0, 0.4), 1px 0 rgba(0, 0, 0, 0.4),
              0 -1px rgba(0, 0, 0, 0.4);
          }

          .item:hover .overlay {
            display: block;
          }
        </style>

        <div class="item">
          <iron-image src="[[_url(document)]]" sizing="cover" preload fade></iron-image>
          <div class="overlay">[[document.title]]</div>
        </div>
      `}static get is(){return"nuxeo-justified-grid-item"}static get properties(){return{document:Object}}_url(e){if(e&&e.uid&&e.contextParameters&&e.contextParameters.thumbnail&&e.contextParameters.thumbnail.url){if(!this.isFollowRedirectEnabled()){const t=e.contextParameters.thumbnail.url.indexOf("?")>-1?"&":"?";e.contextParameters.thumbnail.url=`${e.contextParameters.thumbnail.url}${t}clientReason=view`}return e.contextParameters.thumbnail.url}return""}isFollowRedirectEnabled(){const e=Nuxeo&&Nuxeo.UI&&Nuxeo.UI.config&&Nuxeo.UI.config.url&&Nuxeo.UI.config.url.followRedirect;return e?String(e).toLowerCase()==="true":!1}}customElements.define(i.is,i),Nuxeo.JustifiedGridItem=i}const A=z("nuxeo-justified-grid").notes,O=window.nuxeo.mock,se={title:"UI/nuxeo-justified-grid",parameters:{docs:{description:{component:A}}}},d={render:()=>h`
      <nuxeo-justified-grid></nuxeo-justified-grid>
    `},c={args:{numberOfItems:50},render:i=>(O.respondWith("GET","/api/v1/search/pp/default_search/execute",{"entity-type":"documents",entries:E(i.numberOfItems).data,currentPage:1,numberOfPages:1,resultsCount:i.numberOfItems,offset:0,pageSize:i.numberOfItems,isPreviousPageAvailable:!1,currentPageSize:i.numberOfItems}),h`
      <style>
        nuxeo-justified-grid {
          height: 300px;
        }
      </style>
      <nuxeo-page-provider
        id="provider"
        provider="default_search"
        page-size="${i.numberOfItems}"
        enrichers="thumbnail"
      >
      </nuxeo-page-provider>
      <nuxeo-justified-grid nx-provider="provider">
        <template>
          <nuxeo-justified-grid-item></nuxeo-justified-grid-item>
        </template>
      </nuxeo-justified-grid>
      <button
        @click=${()=>{const l=document.querySelector("nuxeo-justified-grid");l.reset(),l.fetch()}}
      >
        Refresh grid
      </button>
    `)},u={args:{numberOfItems:50,selectionEnabled:!0,multiSelection:!1},render:i=>(O.respondWith("GET","/api/v1/search/pp/default_search/execute",{"entity-type":"documents",entries:E(i.numberOfItems).data,currentPage:1,numberOfPages:1,resultsCount:i.numberOfItems,offset:0,pageSize:i.numberOfItems,isPreviousPageAvailable:!1,currentPageSize:i.numberOfItems}),h`
      <style>
        nuxeo-justified-grid {
          height: 300px;
        }
      </style>
      <nuxeo-page-provider
        id="provider"
        provider="default_search"
        page-size="${i.numberOfItems}"
        enrichers="thumbnail"
      >
      </nuxeo-page-provider>
      <nuxeo-justified-grid
        nx-provider="provider"
        ?selection-enabled="${i.selectionEnabled}"
        ?multi-selection="${i.multiSelection}"
      >
        <template>
          <nuxeo-justified-grid-item></nuxeo-justified-grid-item>
        </template>
      </nuxeo-justified-grid>
      <button
        @click=${()=>{const l=document.querySelector("nuxeo-justified-grid");l.reset(),l.fetch()}}
      >
        Refresh grid
      </button>
    `)};var g,f,b;d.parameters={...d.parameters,docs:{...(g=d.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => html\`
      <nuxeo-justified-grid></nuxeo-justified-grid>
    \`
}`,...(b=(f=d.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};var x,v,_;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    numberOfItems: 50
  },
  render: args => {
    server.respondWith('GET', '/api/v1/search/pp/default_search/execute', {
      'entity-type': 'documents',
      entries: LIST(args.numberOfItems).data,
      currentPage: 1,
      numberOfPages: 1,
      resultsCount: args.numberOfItems,
      offset: 0,
      pageSize: args.numberOfItems,
      isPreviousPageAvailable: false,
      currentPageSize: args.numberOfItems
    });
    return html\`
      <style>
        nuxeo-justified-grid {
          height: 300px;
        }
      </style>
      <nuxeo-page-provider
        id="provider"
        provider="default_search"
        page-size="\${args.numberOfItems}"
        enrichers="thumbnail"
      >
      </nuxeo-page-provider>
      <nuxeo-justified-grid nx-provider="provider">
        <template>
          <nuxeo-justified-grid-item></nuxeo-justified-grid-item>
        </template>
      </nuxeo-justified-grid>
      <button
        @click=\${() => {
      const grid = document.querySelector('nuxeo-justified-grid');
      grid.reset();
      grid.fetch();
    }}
      >
        Refresh grid
      </button>
    \`;
  }
}`,...(_=(v=c.parameters)==null?void 0:v.docs)==null?void 0:_.source}}};var w,I,y;u.parameters={...u.parameters,docs:{...(w=u.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    numberOfItems: 50,
    selectionEnabled: true,
    multiSelection: false
  },
  render: args => {
    server.respondWith('GET', '/api/v1/search/pp/default_search/execute', {
      'entity-type': 'documents',
      entries: LIST(args.numberOfItems).data,
      currentPage: 1,
      numberOfPages: 1,
      resultsCount: args.numberOfItems,
      offset: 0,
      pageSize: args.numberOfItems,
      isPreviousPageAvailable: false,
      currentPageSize: args.numberOfItems
    });
    return html\`
      <style>
        nuxeo-justified-grid {
          height: 300px;
        }
      </style>
      <nuxeo-page-provider
        id="provider"
        provider="default_search"
        page-size="\${args.numberOfItems}"
        enrichers="thumbnail"
      >
      </nuxeo-page-provider>
      <nuxeo-justified-grid
        nx-provider="provider"
        ?selection-enabled="\${args.selectionEnabled}"
        ?multi-selection="\${args.multiSelection}"
      >
        <template>
          <nuxeo-justified-grid-item></nuxeo-justified-grid-item>
        </template>
      </nuxeo-justified-grid>
      <button
        @click=\${() => {
      const grid = document.querySelector('nuxeo-justified-grid');
      grid.reset();
      grid.fetch();
    }}
      >
        Refresh grid
      </button>
    \`;
  }
}`,...(y=(I=u.parameters)==null?void 0:I.docs)==null?void 0:y.source}}};const re=["Empty","Default","Selection"];export{c as Default,d as Empty,u as Selection,re as __namedExportsOrder,se as default};
