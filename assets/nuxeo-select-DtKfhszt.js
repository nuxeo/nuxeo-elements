import{I as u,a as s}from"./iron-validatable-behavior-DVOrdGp7.js";import{L as c,P as d,o as h,d as m,w as b,h as i,m as y}from"./iframe-T5hUCbnt.js";import"./iron-icon-lX3uy4jx.js";import"./paper-input-CgOMKcUj.js";import"./paper-menu-button-Sy7r6r-j.js";import{I as f}from"./paper-ripple-e9CBUXzz.js";import"./default-theme-RhyFn9QU.js";import"./iron-iconset-svg-bEbhiue4.js";import{I as v}from"./iron-a11y-keys-behavior-CQeU5Yru.js";import"./iron-flex-layout-CQAobW0V.js";import{P as g}from"./paper-item-behavior-BIRtwU7m.js";import{I as w}from"./iron-resizable-behavior-BJTBE6_U.js";/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const l=document.createElement("template");l.setAttribute("style","display: none;");l.innerHTML=`<iron-iconset-svg name="paper-dropdown-menu" size="24">
<svg><defs>
<g id="arrow-drop-down"><path d="M7 10l5 5 5-5z"></path></g>
</defs></svg>
</iron-iconset-svg>`;document.head.appendChild(l.content);/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const p=document.createElement("template");p.setAttribute("style","display: none;");p.innerHTML=`<dom-module id="paper-dropdown-menu-shared-styles">
  <template>
    <style>
      :host {
        display: inline-block;
        position: relative;
        text-align: left;

        /* NOTE(cdata): Both values are needed, since some phones require the
         * value to be \`transparent\`.
         */
        -webkit-tap-highlight-color: rgba(0,0,0,0);
        -webkit-tap-highlight-color: transparent;

        --paper-input-container-input: {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 100%;
          box-sizing: border-box;
          cursor: pointer;
        };

        @apply --paper-dropdown-menu;
      }

      /* paper-dropdown-menu and paper-dropdown-menu-light both delegate focus
       * to other internal elements which manage focus styling. */
      :host(:focus) {
        outline: none;
      }

      :host(:dir(rtl)) {
        text-align: right;

        @apply(--paper-dropdown-menu);
      }

      :host([disabled]) {
        @apply --paper-dropdown-menu-disabled;
      }

      :host([noink]) paper-ripple {
        display: none;
      }

      :host([no-label-float]) paper-ripple {
        top: 8px;
      }

      paper-ripple {
        top: 12px;
        left: 0px;
        bottom: 8px;
        right: 0px;

        @apply --paper-dropdown-menu-ripple;
      }

      paper-menu-button {
        display: block;
        padding: 0;

        @apply --paper-dropdown-menu-button;
      }

      paper-input {
        @apply --paper-dropdown-menu-input;
      }

      iron-icon {
        color: var(--disabled-text-color);

        @apply --paper-dropdown-menu-icon;
      }
    </style>
  </template>
</dom-module>`;document.head.appendChild(p.content);/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const _=c(HTMLElement);d({_template:i`
    <style include="paper-dropdown-menu-shared-styles"></style>

    <paper-menu-button id="menuButton" vertical-align="[[verticalAlign]]" horizontal-align="[[horizontalAlign]]" dynamic-align="[[dynamicAlign]]" vertical-offset="[[_computeMenuVerticalOffset(noLabelFloat, verticalOffset)]]" disabled="[[disabled]]" no-animations="[[noAnimations]]" on-iron-select="_onIronSelect" on-iron-deselect="_onIronDeselect" opened="{{opened}}" close-on-activate allow-outside-scroll="[[allowOutsideScroll]]" restore-focus-on-close="[[restoreFocusOnClose]]" expand-sizing-target-for-scrollbars="[[expandSizingTargetForScrollbars]]">
      <!-- support hybrid mode: user might be using paper-menu-button 1.x which distributes via <content> -->
      <div class="dropdown-trigger" slot="dropdown-trigger">
        <paper-ripple></paper-ripple>
        <!-- paper-input has type="text" for a11y, do not remove -->
        <paper-input id="input" type="text" invalid="[[invalid]]" readonly disabled="[[disabled]]" value="[[value]]" placeholder="[[placeholder]]" error-message="[[errorMessage]]" always-float-label="[[alwaysFloatLabel]]" no-label-float="[[noLabelFloat]]" label="[[label]]" input-role="button" input-aria-haspopup="listbox" autocomplete="off">
          <!-- support hybrid mode: user might be using paper-input 1.x which distributes via <content> -->
          <iron-icon icon="paper-dropdown-menu:arrow-drop-down" suffix slot="suffix"></iron-icon>
        </paper-input>
      </div>
      <slot id="content" name="dropdown-content" slot="dropdown-content"></slot>
    </paper-menu-button>
`,is:"paper-dropdown-menu",behaviors:[f,v,u,s],properties:{selectedItemLabel:{type:String,notify:!0,readOnly:!0},selectedItem:{type:Object,notify:!0,readOnly:!0},value:{type:String,notify:!0},label:{type:String},placeholder:{type:String},errorMessage:{type:String},opened:{type:Boolean,notify:!0,value:!1,observer:"_openedChanged"},allowOutsideScroll:{type:Boolean,value:!1},noLabelFloat:{type:Boolean,value:!1,reflectToAttribute:!0},alwaysFloatLabel:{type:Boolean,value:!1},noAnimations:{type:Boolean,value:!1},horizontalAlign:{type:String,value:"right"},verticalAlign:{type:String,value:"top"},verticalOffset:Number,dynamicAlign:{type:Boolean},restoreFocusOnClose:{type:Boolean,value:!0},expandSizingTargetForScrollbars:{type:Boolean,value:!1}},listeners:{tap:"_onTap"},keyBindings:{"up down":"open",esc:"close"},observers:["_selectedItemChanged(selectedItem)"],_attachDom(t){const o=b(this);return o.attachShadow({mode:"open",delegatesFocus:!0,shadyUpgradeFragment:t}),o.shadowRoot.appendChild(t),_.prototype._attachDom.call(this,t)},focus(){this.$.input._focusableElement.focus()},attached:function(){var t=this.contentElement;t&&t.selectedItem&&this._setSelectedItem(t.selectedItem)},get contentElement(){for(var t=m(this.$.content).getDistributedNodes(),o=0,e=t.length;o<e;o++)if(t[o].nodeType===Node.ELEMENT_NODE)return t[o]},open:function(){this.$.menuButton.open()},close:function(){this.$.menuButton.close()},_onIronSelect:function(t){this._setSelectedItem(t.detail.item)},_onIronDeselect:function(t){this._setSelectedItem(null)},_onTap:function(t){h(t)===this&&this.open()},_selectedItemChanged:function(t){var o="";t?o=t.label||t.getAttribute("label")||t.textContent.trim():o="",this.value=o,this._setSelectedItemLabel(o)},_computeMenuVerticalOffset:function(t,o){return o||(t?-4:8)},_getValidity:function(t){return this.disabled||!this.required||this.required&&!!this.value},_openedChanged:function(){var t=this.opened?"true":"false",o=this.contentElement;o&&o.setAttribute("aria-expanded",t)}});/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/d({_template:i`
    <style include="paper-item-shared-styles">
      :host {
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --paper-font-subhead;

        @apply --paper-item;
      }
    </style>
    <slot></slot>
`,is:"paper-item",behaviors:[g]});/**
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
*/{class t extends y([w,s],Nuxeo.Element){static get template(){return i`
        <style>
          :host {
            display: block;
            position: relative;
            --paper-input-container-underline: {
              border-bottom: 1px solid var(--paper-input-container-input-color) !important;
            }
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

          paper-listbox {
            padding: 0;
            --paper-listbox-selected-item: {
              font-weight: normal;
            }
            --paper-listbox-focused-item: {
              font-weight: normal;
              color: var(--paper-input-container-input-color);
            }
            --paper-listbox-focused-item-after: {
              font-weight: normal;
              color: var(--nuxeo-box, white);
            }
          }

          paper-dropdown-menu {
            padding: var(--nuxeo-select-dropdown-menu-padding, 5px 0 0 0);
            --paper-input-container: {
              padding: var(--nuxeo-select-input-container-padding, 0 0 8px 0);
            }
            --paper-dropdown-menu-icon: {
              color: var(--nuxeo-text-default, #3a3a54):
            }
          }

          label {
            @apply --nuxeo-label;
          }

          ::slotted(paper-item) {
            font-weight: normal !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 32px;
            min-height: 32px;
            padding: 0 12px;
            cursor: pointer;
            color: var(--paper-input-container-input-color);
          }

          :host-context(#actionsDropdown) #paperDropdownMenu paper-listbox#paperMenu {
            max-height: 80vh;
          }

          ::slotted(paper-item:hover),
          ::slotted(paper-item[pressed]) {
            background: var(--paper-input-container-focus-color);
            color: var(--nuxeo-text-color, white) !important;
          }
        </style>

        <label aria-hidden="true">[[label]]</label>

        <paper-dropdown-menu
          id="paperDropdownMenu"
          placeholder="[[placeholder]]"
          error-message="[[errorMessage]]"
          no-label-float
          noink
          no-animations
          restore-focus-on-close="false"
          horizontal-align="[[horizontalAlign]]"
          vertical-align="[[verticalAlign]]"
          dynamic-align="[[dynamicAlign]]"
          on-paper-dropdown-open="_resize"
          readonly$="[[readonly]]"
          disabled$="[[disabled]]"
          required$="[[required]]"
          validator$="[[validator]]"
          invalid$="[[invalid]]"
        >
          <paper-listbox
            id="paperMenu"
            slot="dropdown-content"
            attr-for-selected="[[_computeAttrForSelected(attrForSelected, options)]]"
            selected="{{selected}}"
          >
            <dom-if if="[[options]]">
              <template>
                <dom-repeat items="[[options]]" as="item">
                  <template>
                    <paper-item option="[[_id(item)]]">[[_label(item)]]</paper-item>
                  </template>
                </dom-repeat>
              </template>
            </dom-if>
            <slot></slot>
          </paper-listbox>
        </paper-dropdown-menu>
      `}static get is(){return"nuxeo-select"}static get properties(){return{label:{type:String,value:null,observer:"_syncAriaLabel"},placeholder:{type:String,value:" "},errorMessage:{type:String},options:{type:Array,value:null},selected:{type:String,notify:!0},attrForSelected:{type:String,value:null},horizontalAlign:{type:String,value:"left"},verticalAlign:{type:String,value:"top"},dynamicAlign:{type:Boolean},readonly:{type:Boolean,value:!1,reflectToAttribute:!0},disabled:{type:Boolean,value:!1,reflectToAttribute:!0},required:{type:Boolean,value:!1,reflectToAttribute:!0}}}connectedCallback(){super.connectedCallback(),this._resizeObserver||(this._resizeObserver=new ResizeObserver(()=>this._resize())),this._resizeObserver.observe(this),this._ariaLabelObserver||(this._ariaLabelObserver=new MutationObserver(e=>{e.some(n=>n.attributeName==="aria-label")&&this._syncAriaLabel()})),this._ariaLabelObserver.observe(this,{attributes:!0,attributeFilter:["aria-label"]})}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver.unobserve(this),this._ariaLabelObserver&&this._ariaLabelObserver.disconnect(),this._detachDropdownTabHandler()}ready(){super.ready(),this._syncAriaLabel();const e=this.$.paperDropdownMenu;e.addEventListener("paper-dropdown-open",()=>this._attachDropdownTabHandler()),e.addEventListener("paper-dropdown-close",()=>this._detachDropdownTabHandler())}close(){this.$.paperDropdownMenu.close()}_resize(){const e=this.$.paperDropdownMenu.$.menuButton;e.noOverlap=!0,e.verticalOffset=-8;const{width:n}=this.getBoundingClientRect();n>0&&(this.$.paperDropdownMenu.style.width=this.$.paperMenu.style.width=`${n}px`)}_id(e){return this.selected||(this.selected=e&&e.id?e.id:e),e&&e.id?e.id:e}_label(e){return e&&e.label?e.label:e}_computeAttrForSelected(e,n){return n?"option":e}_syncAriaLabel(){setTimeout(()=>this._applyAriaLabel(),0)}_applyAriaLabel(){const e=this.$&&this.$.paperDropdownMenu;if(!e)return;const n=(this.getAttribute("aria-label")||"").trim()||(this.label||"").trim()||null,r=e.$&&e.$.input||e.shadowRoot&&e.shadowRoot.querySelector("paper-input");if(!r)return;n?r.setAttribute("aria-label",n):r.removeAttribute("aria-label");let a=r.inputElement&&r.inputElement._inputElement||r.$.nativeInput;!a&&r.inputElement&&(a=r.inputElement.querySelector&&r.inputElement.querySelector("input")),!a&&r.shadowRoot&&(a=r.shadowRoot.querySelector("input")),a&&(n?(a.setAttribute("aria-label",n),a.removeAttribute("aria-labelledby")):a.removeAttribute("aria-label"))}_attachDropdownTabHandler(){const e=this.$.paperDropdownMenu,n=e.$.menuButton&&e.$.menuButton.$&&e.$.menuButton.$.dropdown?e.$.menuButton.$.dropdown:null;this._dropdownTabOverlay=n,this._dropdownTabHandler=r=>{if(r.key!=="Tab")return;r.preventDefault(),e.close();const a=e.$&&e.$.input||e.shadowRoot&&e.shadowRoot.querySelector("paper-input");a&&typeof a.focus=="function"&&a.focus()},n?n.addEventListener("keydown",this._dropdownTabHandler):document.addEventListener("keydown",this._dropdownTabHandler,!0)}_detachDropdownTabHandler(){this._dropdownTabHandler&&(this._dropdownTabOverlay?this._dropdownTabOverlay.removeEventListener("keydown",this._dropdownTabHandler):document.removeEventListener("keydown",this._dropdownTabHandler,!0),this._dropdownTabHandler=null,this._dropdownTabOverlay=null)}_getValidity(){return this.$.paperDropdownMenu._getValidity()}}customElements.define(t.is,t),Nuxeo.Select=t}
