import{h as l}from"./iframe-T5hUCbnt.js";import"./paper-textarea-Cfq8k5ev.js";/**
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
*/{class r extends Nuxeo.Element{static get template(){return l`
        <style>
          :host {
            display: block;
            position: relative;
            padding-bottom: 8px;
            word-break: break-all;
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

          paper-textarea {
            --paper-input-container: {
              margin-top: 5px;
              padding: 0;
            }
            --iron-autogrow-textarea: {
              padding: 0;
            }
          }

          label {
            @apply --nuxeo-label;
          }
        </style>

        <label>[[label]]</label>

        <paper-textarea
          id="paperTextarea"
          name="[[name]]"
          value="{{value}}"
          rows$="[[rows]]"
          aria-label$="[[_computeAriaLabel(label, placeholder)]]"
          autocomplete="[[autocomplete]]"
          required$="[[required]]"
          disabled$="[[disabled]]"
          readonly$="[[readonly]]"
          error-message="[[errorMessage]]"
          validator$="[[validator]]"
          placeholder$="[[placeholder]]"
          invalid$="[[invalid]]"
          no-label-float
        >
        </paper-textarea>
      `}static get is(){return"nuxeo-textarea"}static get properties(){return{label:{type:String,observer:"_syncNativeTextareaAriaLabel"},name:String,value:{type:String,notify:!0},rows:Number,placeholder:{type:String,observer:"_syncNativeTextareaAriaLabel"},errorMessage:String,autocomplete:{type:String,value:"off"},readonly:{type:Boolean,value:!1,reflectToAttribute:!0},disabled:{type:Boolean,value:!1,reflectToAttribute:!0},required:{type:Boolean,value:!1,reflectToAttribute:!0},invalid:{type:Boolean,value:!1,reflectToAttribute:!0}}}_getValidity(){return this.$.paperTextarea.validate()}ready(){super.ready(),this.$&&this.$.paperTextarea&&this.$.paperTextarea.addEventListener("iron-input-ready",()=>this._syncNativeTextareaAriaLabel()),this._syncNativeTextareaAriaLabel()}_computeAriaLabel(e,t){const a=(e||"").trim();return a||(t||"").trim()||null}_syncNativeTextareaAriaLabel(){setTimeout(()=>this._applyNativeTextareaAriaLabel(),0)}_applyNativeTextareaAriaLabel(){const e=this.$&&this.$.paperTextarea;if(!e)return;const t=this._computeAriaLabel(this.label,this.placeholder);let a=e.shadowRoot&&e.shadowRoot.querySelector("textarea");!a&&e.$&&e.$.input&&e.$.input.textarea&&(a=e.$.input.textarea),a&&(t?a.setAttribute("aria-label",t):a.removeAttribute("aria-label"),a.removeAttribute("aria-labelledby"))}}customElements.define(r.is,r),Nuxeo.Textarea=r}
