import{m as u,h as p,d as n,f as a,b as _}from"./iframe-T5hUCbnt.js";import"./iron-collapse-Q03AhJj8.js";import{T as g}from"./templatizer-behavior-BRsvGg6D.js";import{I as f}from"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-resizable-behavior-BJTBE6_U.js";/**
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
*/{class o extends u([g,f],Nuxeo.Element){static get template(){return p`
        <style>
          :host {
            display: block;
            @apply --nuxeo-tree-node-theme;
          }

          ::slotted(iron-collapse) {
            padding-left: 1em;
            @apply --nuxeo-tree-children-theme;
          }

          ::slotted(.more) {
            @apply --nuxeo-tree-node-more-theme;
          }

          ::slotted(#content) {
            position: relative;
            margin: 0.1rem 0 0.2rem;
          }

          :host([dir='rtl']) ::slotted(#content) {
            margin: 0.1rem 0.8rem 0.2rem 0;
          }

          ::slotted(#content iron-icon) {
            margin-top: -0.25rem;
          }

          ::slotted(span iron-icon) {
            width: 0.95rem;
            margin: 0 0.1rem 0.3rem 0;
          }
        </style>

        <slot></slot>
      `}static get is(){return"nuxeo-tree-node"}static get properties(){return{data:Object,_children:{type:Array},controller:Object,opened:{type:Boolean,value:!1,observer:"_openedChanged"},loading:{type:Boolean,value:!1,observer:"_loadingChanged"},template:Object,nodeKey:{type:String,value:"id"},page:{type:Number,value:1},isNextAvailable:{type:Boolean,value:!1},_parentModel:{type:Boolean,value:!0}}}connectedCallback(){if(super.connectedCallback(),!this.hasAttribute("dir")){const e=document.documentElement.getAttribute("dir");this.setAttribute("dir",e)}}static get observers(){return["_renderNodeContent(data)"]}toggle(){this._updated?this.opened=!this.opened:(this._fetchChildren(),this.opened=!0)}_selectNode(e){let t;e.detail.item?t={item:e.detail.item}:t={item:this.data},this.dispatchEvent(new CustomEvent("select",{composed:!0,bubbles:!0,detail:t}))}open(){return this.opened=!0,this._updated?Promise.resolve():this._fetchChildren()}close(){this.opened=!1}_renderNodeContent(){if(this.template){this._instance&&(this._teardownInstance(),this._fetchChildren()),this.template.__templatizeOwner=null,this.templatize(this.template,!0),this._instance=this.stamp({}),this._instance.item=this.data,this._instance.opened=this.opened,this._instance.loading=this.loading,this._instance.isLeaf=this.controller.isLeaf(this.data),this.dataset[this.nodeKey]=this.data[this.nodeKey];const e=document.createElement("div");e.id="content",n(e).appendChild(this._instance.root),n(this).appendChild(e);const t=document.createElement("iron-collapse");t.id="children",t.opened=this.opened,t.loading=this.loading,t.noAnimation="true",n(this).appendChild(t),a(),this._setupToggleListener()}}_renderChildNodes(){if(this.template)return new Promise(e=>{const t=n(this).querySelector("#children");for(;t.lastChild;)t.removeChild(t.lastChild);const i=this._children||[];for(let s=0;s<i.length;s++){const r=document.createElement("nuxeo-tree-node");r.controller=this.controller,r.template=this.template,r.nodeKey=this.nodeKey,r.dataHost=this._instance._rootDataHost,r.data=i[s],t.appendChild(r)}if(this.isNextAvailable){const s=document.createElement("a");s.setAttribute("class","more"),s.appendChild(document.createTextNode(this.i18n("tree.loadMore"))),this.listen(s,"click","_loadMoreData"),t.appendChild(s)}e(),this.loading=!1})}_loadMoreData(){this.isNextAvailable&&!this.loading&&(this.page=this.page+1,this._fetchChildren())}_fetchChildren(){if(this.loading=!0,this.page===1&&(this._children=[],this.isNextAvailable=!0),this.isNextAvailable)return this.controller.getChildren(this.data,this.page).then(e=>(e.items?(e.items.forEach(t=>{this.push("_children",t)}),this.isNextAvailable=e.isNextAvailable):(this._children=e,this.isNextAvailable=!1),this._updated=!0,this._renderChildNodes()))}_setupToggleListener(){a();const e=n(this).querySelector("#content").querySelectorAll("[select]");for(let i=0;i<e.length;i++)this.listen(e[i],"click","_selectNode");const t=n(this).querySelector("#content").querySelectorAll("[toggle]");for(let i=0;i<t.length;i++)this.listen(t[i],"click","toggle")}_forwardParentProp(e,t){this._instance&&(this._instance[e]=t)}_teardownInstance(){const{children:e}=this._instance;if(e&&e.length){const t=n(n(e[0]).parentNode);for(let i=0;i<e.length;i++)t.removeChild(e[i])}this._instance=null,this._updated=!1}_openedChanged(){this._instance&&(n(this).querySelector("#children").opened=this.opened,this._instance.notifyPath("opened",this.opened),this._setupToggleListener())}_loadingChanged(){this._instance&&(n(this).querySelector("#children").loading=this.loading,this._instance.notifyPath("loading",this.loading))}removeSelf(){return this.remove(),Promise.resolve()}}customElements.define(o.is,o),Nuxeo.TreeNode=o}/**
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
*/{class o extends Nuxeo.Element{static get template(){return p`
        <style>
          :host {
            display: block;
            @apply --nuxeo-tree-theme;
          }
        </style>

        <slot></slot>
      `}static get is(){return"nuxeo-tree"}static get properties(){return{data:Object,controller:Object,template:Object,nodeKey:{type:String,value:"id"}}}static get observers(){return["_update(data, controller)"]}_update(){if(this.data&&this.controller){const e=n(this).querySelector("template");this._root&&n(this).removeChild(this._root),this._root=document.createElement("nuxeo-tree-node"),this._root.id="root",this._root.template=e,this._root.dataHost=this.dataHost,this._root.controller=this.controller,this._root.nodeKey=this.nodeKey,this._root.data=this.data,this._root.dataset[this.nodeKey]=this.data[this.nodeKey],n(this).appendChild(this._root),this._root.open()}}open(){this._openNodes(arguments)}_openNodes(e){if(!e||e.length===0)return;const t=this._find(e[0]);t&&t.open().then(()=>{this._openNodes(Array.prototype.slice.call(e,1))})}_find(e){return this.querySelector(`[data-${this.nodeKey}="${e}"]`)}removeNodes(e){if(!e||e.length===0)return;const t=this._find(e[0]);t&&t.removeSelf().then(()=>{this.removeNodes(Array.prototype.slice.call(e,1))})}}customElements.define(o.is,o),Nuxeo.Tree=o}const y={title:"Home",children:[{title:"Kitchen",children:[]},{title:"Bedroom",children:[{title:"Bed Frames",children:[]},{title:"Mattress",children:[]}]}]},v={getChildren(o){return Promise.resolve(o.children)},isLeaf(o){return o.children.length===0}},S={title:"UI/nuxeo-tree"},l={render:()=>_`
    <nuxeo-tree .data="${y}" .controller="${v}">
      <template>
        <template class="flex" is="dom-if" if="[[!isLeaf]]">
          <iron-icon icon="icons:chevron-right" toggle></iron-icon>
        </template>
        <span>[[item.title]]</span>
      </template>
    </nuxeo-tree>
  `};var d,h,c;l.parameters={...l.parameters,docs:{...(d=l.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-tree .data="\${data}" .controller="\${controller}">
      <template>
        <template class="flex" is="dom-if" if="[[!isLeaf]]">
          <iron-icon icon="icons:chevron-right" toggle></iron-icon>
        </template>
        <span>[[item.title]]</span>
      </template>
    </nuxeo-tree>
  \`
}`,...(c=(h=l.parameters)==null?void 0:h.docs)==null?void 0:c.source}}};const K=["Default"];export{l as Default,K as __namedExportsOrder,S as default};
