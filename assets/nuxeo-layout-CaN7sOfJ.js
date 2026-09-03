import{I as f}from"./iron-resizable-behavior-BJTBE6_U.js";import{m as h,h as c,d as m,f as p}from"./iframe-T5hUCbnt.js";import{I as g}from"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/function u(s){window.HTMLImports?HTMLImports.whenReady(s):s()}const y=function(s,d,t,i){let e=document.head.querySelector('link[href="'+s+'"][import-href]');e||(e=document.createElement("link"),e.rel="import",e.href=s,e.setAttribute("import-href",""));let n=function(){e.removeEventListener("load",r),e.removeEventListener("error",o)},r=function(l){n(),e.__dynamicImportLoaded=!0,d&&u(()=>{d(l)})},o=function(l){n(),e.parentNode&&e.parentNode.removeChild(e),t&&u(()=>{t(l)})};return e.addEventListener("load",r),e.addEventListener("error",o),e.parentNode==null?document.head.appendChild(e):e.__dynamicImportLoaded&&e.dispatchEvent(new Event("load")),e};/**
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
*/{class s extends h([g],Nuxeo.Element){static get template(){return c`
        <style>
          :host {
            display: block;
            padding: 24px;
            background: rgba(0, 0, 0, 0.025);
            border-radius: 4px;
            border: 1px dashed rgba(0, 0, 0, 0.1);
          }

          :host([hidden]) {
            display: none !important;
          }

          .code {
            @apply --layout-flex;
            color: var(--nuxeo-text-default, rgba(0, 0, 0, 0.3));
            text-align: center;
            font-size: 1.4rem;
            font-weight: 700;
          }

          .description {
            @apply --layout-flex;
            color: var(--nuxeo-text-default, rgba(0, 0, 0, 0.3));
            text-align: center;
            font-size: 1.2rem;
            font-weight: 500;
            padding: 8px;
          }

          .url {
            @apply --layout-flex;
            color: var(--nuxeo-text-default, rgba(0, 0, 0, 0.3));
            text-align: center;
            padding: 16px 0;
            font-size: 0.8rem;
          }

          .message {
            @apply --layout-flex;
            color: var(--nuxeo-text-default, rgba(0, 0, 0, 0.3));
            text-align: center;
            padding: 8px 0;
            font-size: 1rem;
            font-weight: 500;
          }
        </style>

        <div class="code" hidden$="[[!code]]">[[code]]</div>
        <div class="description" hidden$="[[!code]]">[[_label(code)]]</div>
        <div class="url" hidden$="[[!url]]">[[url]]</div>
        <div class="message" hidden$="[[!message]]">[[message]]</div>
      `}static get is(){return"nuxeo-error"}static get properties(){return{code:{type:String,value:""},message:{type:String,value:""},url:{type:String,value:""},hidden:{type:Boolean,value:!1,reflectToAttribute:!0}}}show(t,i,e){arguments.length&&(this.code=t,this.url=i,this.message=e),this.hidden=!1}hide(){this.hidden=!0}_label(){return this.code?this.i18n(`error.${this.code}`):null}}customElements.define(s.is,s),Nuxeo.Error=s}/**
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
*/{class s extends h([f],Nuxeo.Element){static get template(){return c`
        <nuxeo-error id="error" code="404" url="[[href]]" message="[[error]]" hidden></nuxeo-error>
        <div id="container"></div>
      `}static get is(){return"nuxeo-layout"}static get properties(){return{href:{type:String,observer:"_stamp"},model:{type:Object,value:{}},error:{type:String,value:"Failed to find layout"},element:{type:Object,readOnly:!0,notify:!0}}}static get observers(){return["_update(model.*)"]}_getBoundElements(t){const i={};for(let e=0;e<this.element.__templateInfo.nodeInfoList.length;e++){const n=this.element.__templateInfo.nodeInfoList[e],r=this.element.__templateInfo.nodeList[e];if(r.nodeType===Node.ELEMENT_NODE){const o=r.hasAttribute("field")&&r.getAttribute("field");o&&o.startsWith(t)&&(i[o]=r),n.bindings&&n.bindings.forEach(l=>{l.kind==="property"&&l.parts.forEach(a=>{a.mode==="{"&&!a.signature&&a.source.startsWith(t)&&(i[a.source]=i[a.source]||[],i[a.source]=r)})})}}return i}validate(){let t=!0;if(this.element){const i=this._getValidatableElements(this.element.root);for(let e,n=0;n<i.length;n++)e=i[n],t=(e.validate?e.validate():e.checkValidity())&&t}return t?this.element&&typeof this.element.validate=="function"?this.element.validate():!0:!1}_getValidatableElements(t){const i=m(t).querySelectorAll("*"),e=[];for(let n=0;n<i.length;n++){const r=i[n];!r.disabled&&this._isVisible(r)&&(r.validate||r.checkValidity?e.push(r):r.root&&Array.prototype.push.apply(e,this._getValidatableElements(r.root)))}return e}_isVisible(t){const i=window.getComputedStyle(t);return t&&t.offsetParent&&(t.offsetHeight>0||t.offsetWidth>0||i.opacity>0&&i.visibility!=="hidden")}_stamp(t){if(!t){this.hidden=!0,this._setElement(null);return}this.$.error.hidden=!0,this.hidden=this.$.container.hidden=!1;const e=t.split("/").pop().split(".")[0];y(t,()=>{const n=document.createElement(e);this.$.container.hasChildNodes()?this.$.container.replaceChild(n,this.$.container.firstChild):this.$.container.appendChild(n),this._setElement(n),this._update(),this.notifyResize(),p()},()=>{this._setElement(void 0),this.$.error.hidden=!1,this.$.container.hidden=!0,this.notifyResize()})}_update(){this.element&&this.model&&Object.keys(this.model).forEach(t=>{this.element[t]=this.model[t]})}}customElements.define(s.is,s),Nuxeo.Layout=s}
