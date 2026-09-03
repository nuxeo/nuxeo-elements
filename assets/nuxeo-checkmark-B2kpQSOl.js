import"./iron-icon-lX3uy4jx.js";import{h as o}from"./iframe-T5hUCbnt.js";import"./nuxeo-icons-DihWRFWD.js";/**
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
*/{class r extends Nuxeo.Element{static get template(){return o`
        <style>
          :host {
            display: inline-block;
            width: var(--nuxeo-checkmark-width, 18px);
            height: var(--nuxeo-checkmark-height, 18px);
            cursor: pointer;
            /* Make the checkmark a square for consistent click target size, common change for all themes */
            border-radius: 2px;
            border: 2px solid var(--nuxeo-checkmark-border-color, var(--nuxeo-text-default, gray));
            background-color: var(--nuxeo-checkmark-background-color, transparent);
            color: var(--nuxeo-icon-color, transparent);
            padding: 0;
            margin: 0;
            opacity: 1;
          }

          :host([hidden]) {
            display: none !important;
          }

          :host(:focus) {
            border: 2px solid var(--nuxeo-checkmark-border-color, var(--nuxeo-text-default, gray));
            background-color: var(--nuxeo-checkmark-background-color-hover, transparent);
            color: var(--nuxeo-icon-color-hover, black);
          }

          :host(:hover) {
            border: 2px solid var(--nuxeo-checkmark-border-color, var(--nuxeo-text-default, gray));
            background-color: var(--nuxeo-checkmark-background-color-hover, transparent);
            color: var(--nuxeo-icon-color-hover, black);
          }

          :host([checked]) {
            border: 2px solid var(--nuxeo-checkmark-border-color-checked, var(--nuxeo-primary-color, blue));
            background-color: var(--nuxeo-checkmark-background-color-checked, var(--nuxeo-primary-color, blue));
            color: var(--nuxeo-checkmark-tick-color, white);
          }

          iron-icon {
            --iron-icon-width: 100%;
            --iron-icon-height: 100%;
            vertical-align: top;
          }
        </style>

        <iron-icon icon="nuxeo:check" on-click="_tap"></iron-icon>
      `}static get is(){return"nuxeo-checkmark"}static get properties(){return{checked:{type:Boolean,reflectToAttribute:!0,value:!1,observer:"_ariaChecked"},disabled:{type:Boolean,reflectToAttribute:!0,value:!1}}}ready(){super.ready(),this.setAttribute("role","checkbox"),this.setAttribute("aria-checked",!1),this.setAttribute("tabindex","0"),this.addEventListener("keydown",this._onKeyDown.bind(this))}_onKeyDown(e){(e.key==="Enter"||e.key===" "||e.key==="Spacebar")&&(e.preventDefault(),this._tap(!0),this.dispatchEvent(new MouseEvent("click",{bubbles:!0,composed:!0})))}_tap(e){this.disabled||(this._fromKeyboard=e===!0,this.checked=!this.checked)}_ariaChecked(){this.setAttribute("aria-checked",this.checked);const e=this._fromKeyboard;this._fromKeyboard=!1,!this.checked&&!e&&this.blur()}}customElements.define(r.is,r),Nuxeo.CheckMark=r}
