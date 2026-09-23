import{I as r,a as l}from"./iron-validatable-behavior-D22XWMWB.js";import{m as n,h as o}from"./iframe-DfANLok6.js";import"./paper-input-B8T425Tx.js";import{I as p}from"./nuxeo-i18n-behavior-DkDjknqP.js";import{W as u}from"./nuxeo-widget-validation-behavior-cLtHj9CV.js";/**
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
*/{class i extends n([p,r,l,u],Nuxeo.Element){static get template(){return o`
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
      `}static get is(){return"nuxeo-input"}static get properties(){return{label:{type:String,observer:"_syncNativeInputAriaLabel"},type:String,name:String,value:{type:String,notify:!0},placeholder:{type:String,observer:"_syncNativeInputAriaLabel"},errorMessage:String,autocomplete:{type:String,value:"off"},autofocus:{type:Boolean,value:!1,reflectToAttribute:!0},readonly:{type:Boolean,value:!1,reflectToAttribute:!0},disabled:{type:Boolean,value:!1,reflectToAttribute:!0},required:{type:Boolean,value:!1,reflectToAttribute:!0},min:String,max:String,step:Number,minlength:Number,maxlength:Number,pattern:String,validator:String,autoValidate:{type:Boolean,value:!1}}}focus(){this.$.paperInput.focus()}ready(){super.ready(),this.$&&this.$.paperInput&&this.$.paperInput.addEventListener("iron-input-ready",()=>{this._syncNativeInputAriaLabel(),this._syncAriaValidationState()}),this._syncNativeInputAriaLabel(),this._syncAriaValidationState()}_ariaValidationControl(){return this._getNativeInput()}_ariaValidationMessageElement(){return null}_getValidity(){const e=this.$.paperInput.validate();return e?this._clearDefaultRequiredError():this._applyDefaultRequiredError(),e}_computeAriaLabel(e,t){const a=(e||"").trim();return a||(t||"").trim()||null}_syncNativeInputAriaLabel(){setTimeout(()=>this._applyNativeInputAriaLabel(),0)}_getNativeInput(){let e;if(this.$&&(e=this.$.paperInput),!e)return null;let t=e.inputElement&&e.inputElement._inputElement||e.$.nativeInput;return!t&&e.inputElement&&(t=e.inputElement.querySelector&&e.inputElement.querySelector("input")),!t&&e.shadowRoot&&(t=e.shadowRoot.querySelector("input")),t}_applyNativeInputAriaLabel(){if(!(this.$&&this.$.paperInput))return;const t=this._computeAriaLabel(this.label,this.placeholder),a=this._getNativeInput();a&&(t?a.setAttribute("aria-label",t):a.removeAttribute("aria-label"),a.removeAttribute("aria-labelledby"))}}customElements.define(i.is,i),Nuxeo.Input=i}
