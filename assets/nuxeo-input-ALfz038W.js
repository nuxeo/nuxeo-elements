import{I as i,a as l}from"./iron-validatable-behavior-DVOrdGp7.js";import{m as n,h as o}from"./iframe-T5hUCbnt.js";import"./paper-input-CgOMKcUj.js";import{I as u}from"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
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
*/{class r extends n([u,i,l],Nuxeo.Element){static get template(){return o`
        <style>
          :host {
            display: block;
            position: relative;
            padding-bottom: 8px;
          }

          :host([hidden]) {
            display: none;
          }

          :host([required]) label::after {
            display: inline-block;
            content: '*';
            margin-left: 4px;
            color: var(--paper-input-container-invalid-color, #de350b);
          }

          paper-input {
            --paper-input-container: {
              margin-top: 5px;
              padding: 0;
            }
          }

          label {
            @apply --nuxeo-label;
          }
        </style>

        <label>[[label]]</label>

        <paper-input
          id="paperInput"
          type="[[type]]"
          name="[[name]]"
          value="{{value}}"
          placeholder$="[[placeholder]]"
          aria-label$="[[_computeAriaLabel(label, placeholder)]]"
          error-message="[[errorMessage]]"
          autocomplete="[[autocomplete]]"
          autofocus$="[[autofocus]]"
          readonly$="[[readonly]]"
          disabled$="[[disabled]]"
          required$="[[required]]"
          minlength$="[[minlength]]"
          maxlength$="[[maxlength]]"
          min$="[[min]]"
          max$="[[max]]"
          step$="[[step]]"
          pattern$="[[pattern]]"
          auto-validate$="[[autoValidate]]"
          validator$="[[validator]]"
          invalid$="[[invalid]]"
          no-label-float
        >
        </paper-input>
      `}static get is(){return"nuxeo-input"}static get properties(){return{label:{type:String,observer:"_syncNativeInputAriaLabel"},type:String,name:String,value:{type:String,notify:!0},placeholder:{type:String,observer:"_syncNativeInputAriaLabel"},errorMessage:String,autocomplete:{type:String,value:"off"},autofocus:{type:Boolean,value:!1,reflectToAttribute:!0},readonly:{type:Boolean,value:!1,reflectToAttribute:!0},disabled:{type:Boolean,value:!1,reflectToAttribute:!0},required:{type:Boolean,value:!1,reflectToAttribute:!0},min:String,max:String,step:Number,minlength:Number,maxlength:Number,pattern:String,validator:String,autoValidate:{type:Boolean,value:!1}}}focus(){this.$.paperInput.focus()}ready(){super.ready(),this.$&&this.$.paperInput&&this.$.paperInput.addEventListener("iron-input-ready",()=>this._syncNativeInputAriaLabel()),this._syncNativeInputAriaLabel()}_getValidity(){const e=this.$.paperInput.validate();return this._applyDefaultRequiredError(e),e}_applyDefaultRequiredError(e){const a=this.value==null||this.value==="";this.required&&!e&&a?(!this.errorMessage||this._defaultRequiredError)&&(this.errorMessage=this.i18n("widget.required"),this._defaultRequiredError=!0):this._clearDefaultRequiredError()}_clearDefaultRequiredError(){this._defaultRequiredError&&(this.errorMessage="",this._defaultRequiredError=!1)}_computeAriaLabel(e,a){const t=(e||"").trim();return t||(a||"").trim()||null}_syncNativeInputAriaLabel(){setTimeout(()=>this._applyNativeInputAriaLabel(),0)}_applyNativeInputAriaLabel(){const e=this.$&&this.$.paperInput;if(!e)return;const a=this._computeAriaLabel(this.label,this.placeholder);let t=e.inputElement&&e.inputElement._inputElement||e.$.nativeInput;!t&&e.inputElement&&(t=e.inputElement.querySelector&&e.inputElement.querySelector("input")),!t&&e.shadowRoot&&(t=e.shadowRoot.querySelector("input")),t&&(a?t.setAttribute("aria-label",a):t.removeAttribute("aria-label"),t.removeAttribute("aria-labelledby"))}}customElements.define(r.is,r),Nuxeo.Input=r}
