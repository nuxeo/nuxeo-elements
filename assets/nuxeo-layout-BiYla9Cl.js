import{I as m}from"./iron-resizable-behavior-D7uxPWIp.js";import{m as c,h as f,d as g,f as v}from"./iframe-Yfd-OibJ.js";import{I as p}from"./nuxeo-i18n-behavior-BhQ-sx4z.js";/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/function h(o){window.HTMLImports?HTMLImports.whenReady(o):o()}const y=function(o,a,d,t){let e=document.head.querySelector('link[href="'+o+'"][import-href]');e||(e=document.createElement("link"),e.rel="import",e.href=o,e.setAttribute("import-href",""));let r=function(){e.removeEventListener("load",i),e.removeEventListener("error",n)},i=function(s){r(),e.__dynamicImportLoaded=!0,a&&h(()=>{a(s)})},n=function(s){r(),e.parentNode&&e.remove(),d&&h(()=>{d(s)})};return e.addEventListener("load",i),e.addEventListener("error",n),e.parentNode==null?document.head.appendChild(e):e.__dynamicImportLoaded&&e.dispatchEvent(new Event("load")),e};/**
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
*/{class o extends c([p],Nuxeo.Element){static get template(){return f`
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
      `}static get is(){return"nuxeo-error"}static get properties(){return{code:{type:String,value:""},message:{type:String,value:""},url:{type:String,value:""},hidden:{type:Boolean,value:!1,reflectToAttribute:!0}}}show(d,t,e){arguments.length&&(this.code=d,this.url=t,this.message=e),this.hidden=!1}hide(){this.hidden=!0}_label(){return this.code?this.i18n(`error.${this.code}`):null}}customElements.define(o.is,o),Nuxeo.Error=o}/**
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
*/{const o=new WeakMap;class a extends c([m,p],Nuxeo.Element){static get template(){return f`
        <nuxeo-error id="error" code="404" url="[[href]]" message="[[error]]" hidden></nuxeo-error>
        <div id="container"></div>
      `}static get is(){return"nuxeo-layout"}static get properties(){return{href:{type:String,observer:"_stamp"},model:{type:Object,value:{}},error:{type:String,value:"Failed to find layout"},element:{type:Object,readOnly:!0,notify:!0}}}static get observers(){return["_update(model.*)"]}_getBoundElements(t){const e={};for(let r=0;r<this.element.__templateInfo.nodeInfoList.length;r++){const i=this.element.__templateInfo.nodeInfoList[r],n=this.element.__templateInfo.nodeList[r];if(n.nodeType===Node.ELEMENT_NODE){const s=n.hasAttribute("field")&&n.getAttribute("field");s&&s.startsWith(t)&&(e[s]=n),i.bindings&&i.bindings.forEach(u=>{u.kind==="property"&&u.parts.forEach(l=>{l.mode==="{"&&!l.signature&&l.source.startsWith(t)&&(e[l.source]=e[l.source]||[],e[l.source]=n)})})}}return e}validate(){let t=!0;const e=[];if(this.element){const r=this._getValidatableElements(this.element.root);for(let i,n=0;n<r.length;n++){i=r[n];const s=this._validateElement(i);s||e.push(i),t=s&&t}}if(!t)return this._reportValidation(!1,e),!1;if(this.element&&typeof this.element.validate=="function"){const r=this.element.validate();return r&&typeof r.then=="function"?r.then(i=>(this._reportValidation(i,e),i)):(this._reportValidation(r,e),r)}return this._reportValidation(!0,e),!0}_validateElement(t){return t.validate?t.validate():t.checkValidity()}_reportValidation(t,e){const r=e.map(i=>{const n=this._fieldLabel(i);let s=i.errorMessage;return(!s||s===o.get(i)||i._defaultRequiredError)&&(s=this._defaultErrorMessage(i,n),o.set(i,s),"errorMessage"in i&&(i.errorMessage=s)),{element:i,label:n,message:s}});!t&&r.length===0&&r.push({element:this.element,label:"",message:this.i18n("layout.validation.invalidForm")}),this.dispatchEvent(new CustomEvent("layout-validation-errors",{bubbles:!0,composed:!0,detail:{errors:r}}))}_defaultErrorMessage(t,e){const r=this._isEmptyValue(t)?"layout.validation.requiredField":"layout.validation.invalidField";return e?this.i18n(`${r}.named`,e):this.i18n(r)}_fieldLabel(t){return((typeof t._validationLabel=="function"?t._validationLabel():"")||t.label||t.getAttribute("aria-label")||t.getAttribute("label")||"").trim()}_isEmptyValue(t){const e="value"in t?t.value:t.selected;return e==null||e===""||Array.isArray(e)&&e.length===0}_getValidatableElements(t){const e=g(t).querySelectorAll("*"),r=[];for(const i of e)!i.disabled&&this._isVisible(i)&&(i.validate||i.checkValidity?r.push(i):i.root&&Array.prototype.push.apply(r,this._getValidatableElements(i.root)));return r}_isVisible(t){const e=window.getComputedStyle(t);return t&&t.offsetParent&&(t.offsetHeight>0||t.offsetWidth>0||e.opacity>0&&e.visibility!=="hidden")}_stamp(t){if(!t){this.hidden=!0,this._setElement(null);return}this.$.error.hidden=!0,this.hidden=this.$.container.hidden=!1;const r=t.split("/").pop().split(".")[0];y(t,()=>{const i=document.createElement(r);this.$.container.hasChildNodes()?this.$.container.replaceChild(i,this.$.container.firstChild):this.$.container.appendChild(i),this._setElement(i),this._update(),this.notifyResize(),v()},()=>{this._setElement(void 0),this.$.error.hidden=!1,this.$.container.hidden=!0,this.notifyResize()})}_update(){this.element&&this.model&&Object.keys(this.model).forEach(t=>{this.element[t]=this.model[t]})}}customElements.define(a.is,a),Nuxeo.Layout=a}
