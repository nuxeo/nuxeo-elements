import{m as $,h as w,p as V,b as d,P as T}from"./iframe-DfANLok6.js";import{L}from"./nuxeo-layout-behavior-2CMXljbc.js";import"./nuxeo-layout-CRkOTeK9.js";import{a as D}from"./render-status-DgSWxHM4.js";import{I as F}from"./nuxeo-i18n-behavior-DkDjknqP.js";import"./nuxeo-input-DuqcUoUx.js";import"./nuxeo-date-picker-CXC9AEsZ.js";import{i as B}from"./image01-_wyEfMQE.js";import{D as M}from"./documents.data-BM_UplYo.js";import{c as E}from"./code-panel-template-0K8q8hdy.js";import"./preload-helper-Dp1pzeXC.js";import"./nuxeo-filters-behavior-BwjeSQ5d.js";import"./nuxeo-format-behavior-DCZ67kVR.js";import"./moment-with-locales-v-Wg38Ha.js";import"./iron-resizable-behavior-AZ17E4LT.js";import"./iron-validatable-behavior-D22XWMWB.js";import"./paper-input-B8T425Tx.js";import"./paper-input-behavior-DGBlyaCy.js";import"./typography-Dsqr7jdM.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-Cy57WvA0.js";import"./default-theme-sVFU976S.js";import"./iron-a11y-keys-behavior-CXq8UWKK.js";import"./nuxeo-widget-validation-behavior-cLtHj9CV.js";import"./paper-icon-button-BnBB_cCA.js";import"./iron-icon-Bt9a3Rhq.js";import"./paper-inky-focus-behavior-rjTRkVyf.js";import"./paper-ripple-CvfHxnYa.js";import"./iron-icons-Gq0N1TWG.js";import"./iron-iconset-svg-5-aE6F5a.js";import"./nuxeo-icons-Bm09xz8u.js";import"./v4-BT9YOjd5.js";/**
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
*/{class n extends $([F],Nuxeo.Element){static get template(){return w`
        <style>
          #error {
            margin-bottom: 8px;
          }

          /* The summary is focused programmatically, where a focus ring would look like a defect.
             Keyboard driven focus still shows one. */
          #error:focus:not(:focus-visible) {
            outline: none;
          }

          .error {
            display: block;
            border-left: 4px solid var(--paper-input-container-invalid-color, #de350b);
            color: var(--paper-input-container-invalid-color, #de350b);
            padding-left: 8px;
          }
        </style>
        <div id="error" role="alert" tabindex="-1" hidden$="[[!_hasValidationErrors(_errorMessages.splices)]]">
          <dom-repeat items="[[_errorMessages]]">
            <template>
              <span class="error">[[item]]</span>
            </template>
          </dom-repeat>
        </div>
        <nuxeo-layout
          id="layout"
          href="[[_href]]"
          model="[[_model]]"
          error="[[i18n('documentLayout.notFound', layout, document.type)]]"
          on-element-changed="_elementChanged"
        >
        </nuxeo-layout>
      `}static get is(){return"nuxeo-document-layout"}static get importMeta(){return import.meta}static get properties(){return{document:{type:Object,notify:!0},layout:{type:String,value:"view",reflectToAttribute:!0},hrefTemplate:{type:String,value:()=>"${document.type}/nuxeo-${document.type}-${layout}-layout.html"},hrefBase:{type:String,value:""},hrefFunction:{type:Function,computed:"_buildHrefFn(hrefTemplate)"},_model:{type:Object,value:{},readOnly:!0},_href:{type:String,readOnly:!0},_errorMessages:{type:Array,readOnly:!0,value:[]}}}static get observers(){return["_loadLayout(document, layout, hrefFunction, hrefBase)"]}ready(){super.ready(),this.$.layout.addEventListener("layout-validation-errors",e=>this._onLayoutValidationErrors(e))}get element(){return this.$.layout.element}validate(){return this.$.layout.validate()}applyAutoFocus(){const e=this._getFocusableElement(this.element);e&&e.focus()}reportValidation(e){this._resetValidationErrors(),e.violations.reverse().forEach(t=>{this.invalid=!0,t.path?t.path.forEach(o=>{const r=this._getBoundElements(`document.properties.${o.field_name}`);if(r){const a=this.i18n(t.messageKey,t.invalid_value,o.field_name);a===t.messageKey&&t.constraint&&t.constraint.name?this._addValidationError(this.i18n(`label.schema.constraint.violation.${t.constraint.name}`,t.invalid_value,o.field_name,...Object.values(t.constraint.parameters))):this._addValidationError(a),Object.values(r).forEach(i=>{i.invalid=!0})}else this._addValidationError(this.i18n(t.messageKey,t.invalid_value,o.field_name))}):this._addValidationError(this.i18n(t.messageKey))})}_buildHrefFn(e){return()=>{const t=e.matchAll(/\${([^}]+)}/g);let o=e;for(const[r,a]of t){const i=a.match(/^(layout|document)(\.(.+))?$/)?this.get(a).toLowerCase():"";o=o.replace(r,i)}return o}}_loadLayout(e,t,o,r){if(this._resetValidationErrors(),e){(!this.previousDocument||e.uid!==this.previousDocument.uid)&&this._set_href(null),(!this.previousDocument||e.type===this.previousDocument.type)&&this._set_model({document:e});const a=r||V(this.__dataHost.importPath||this.importPath),i=[a,o(e,t)].join(a.slice(-1)!=="/"?"/":"");this._set_href(i)}else e===void 0&&this._set_model({document:e});this.previousDocument=e}_elementChanged(){this._set_model({document:this.document}),this.element&&this.element.addEventListener("document-changed",e=>{this.notifyPath(e.detail.path,e.detail.value)}),D(this,()=>{this.dispatchEvent(new CustomEvent("document-layout-changed",{bubbles:!0,composed:!0,detail:{element:this.element,layout:this.layout}})),this.applyAutoFocus()})}_getBoundElements(e){return this.$.layout._getBoundElements(e)}_getFocusableElement(e){if(e&&e.shadowRoot&&!e.shadowRoot.activeElement){const t=Array.from(e.shadowRoot.querySelectorAll("*")).filter(r=>{const a=window.getComputedStyle(r);return!r.disabled&&a.display!=="none"&&a.visibility!=="hidden"});let o=t.find(r=>r.autofocus);if(o)return o;t.filter(r=>r.shadowRoot).forEach(r=>{if(o=this._getFocusableElement(r),o)return o})}}_onLayoutValidationErrors(e){if(e.composedPath()[0]!==this.$.layout)return;this._resetValidationErrors();const{errors:t}=e.detail;t.length>0&&this._addValidationErrors(t.map(o=>o.message))}_addValidationError(e){this._addValidationErrors([e])}_addValidationErrors(e){e.forEach(t=>this.push("_errorMessages",t)),this.$.error.scrollIntoView(),this.$.error.focus()}_hasValidationErrors(){return this._errorMessages&&this._errorMessages.length>0}_resetValidationErrors(){this._set_errorMessages([])}}customElements.define(n.is,n)}window.Polymer=T;window.Nuxeo.LayoutBehavior=L;const m=new M().setTitle("My Document").setFileContent("Nuxeo Logo",B),de={title:"UI/nuxeo-document-layout"},s={args:{layout:"view"},argTypes:{layout:{control:"select",options:["view","edit","metadata"]}},render:n=>d`
    <div style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
      <nuxeo-document-layout
        .document="${m.setType("File").build()}"
        layout="${n.layout}"
        href-base="layouts/document/"
      >
      </nuxeo-document-layout>
    </div>
    ${E(`document/file/nuxeo-file-${n.layout}-layout.html`)}
  `},l={render:()=>d`
    <p style="margin-left: 16px;">This layout won't allow Title and Description to have the same value.</p>
    <iron-form>
      <form style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
        <nuxeo-document-layout
          .document="${m.setType("Picture").build()}"
          layout="edit"
          href-base="layouts/document/"
        >
        </nuxeo-document-layout>
        <button
          @click=${n=>{const c=n.target.previousElementSibling,e=n.target.parentElement,t=c.validate();e.style.border=`2px ${t?"dashed green":"solid red"}`,n.preventDefault()}}
        >
          Validate
        </button>
      </form>
    </iron-form>
    ${E("document/picture/nuxeo-picture-edit-layout.html")}
  `},u={render:()=>d`
    <nuxeo-document-layout
      .document="${m.setType("MyDoc").build()}"
      layout="edit"
      href-base="layouts/document/"
    >
    </nuxeo-document-layout>
  `};var p,y,h;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    layout: 'view'
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['view', 'edit', 'metadata']
    }
  },
  render: args => html\`
    <div style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
      <nuxeo-document-layout
        .document="\${documentBuilder.setType('File').build()}"
        layout="\${args.layout}"
        href-base="layouts/document/"
      >
      </nuxeo-document-layout>
    </div>
    \${codePanelTemplate(\`document/file/nuxeo-file-\${args.layout}-layout.html\`)}
  \`
}`,...(h=(y=s.parameters)==null?void 0:y.docs)==null?void 0:h.source}}};var f,g,_;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => html\`
    <p style="margin-left: 16px;">This layout won't allow Title and Description to have the same value.</p>
    <iron-form>
      <form style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
        <nuxeo-document-layout
          .document="\${documentBuilder.setType('Picture').build()}"
          layout="edit"
          href-base="layouts/document/"
        >
        </nuxeo-document-layout>
        <button
          @click=\${e => {
    const docLayout = e.target.previousElementSibling;
    const form = e.target.parentElement;
    const valid = docLayout.validate();
    form.style.border = \`2px \${valid ? 'dashed green' : 'solid red'}\`;
    e.preventDefault();
  }}
        >
          Validate
        </button>
      </form>
    </iron-form>
    \${codePanelTemplate('document/picture/nuxeo-picture-edit-layout.html')}
  \`
}`,...(_=(g=l.parameters)==null?void 0:g.docs)==null?void 0:_.source}}};var b,v,x;u.parameters={...u.parameters,docs:{...(b=u.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-document-layout
      .document="\${documentBuilder.setType('MyDoc').build()}"
      layout="edit"
      href-base="layouts/document/"
    >
    </nuxeo-document-layout>
  \`
}`,...(x=(v=u.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};const me=["Default","CustomValidation","MissingLayout"];export{l as CustomValidation,s as Default,u as MissingLayout,me as __namedExportsOrder,de as default};
