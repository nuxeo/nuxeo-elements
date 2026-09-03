import{h as a,P as n,m as s}from"./iframe-T5hUCbnt.js";import"./default-theme-RhyFn9QU.js";import"./iron-flex-layout-CQAobW0V.js";import{P as d}from"./paper-checked-element-behavior-JkhbBuKO.js";import{a as c}from"./render-status-BJmzACxi.js";import{I as p,a as u}from"./iron-menu-behavior-BQTarcVj.js";import{I as h,a as b}from"./iron-validatable-behavior-DVOrdGp7.js";import{I as m}from"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const l=a`
<style>
  :host {
    display: inline-block;
    line-height: 0;
    white-space: nowrap;
    cursor: pointer;
    @apply --paper-font-common-base;
    --calculated-paper-radio-button-size: var(--paper-radio-button-size, 16px);
    /* -1px is a sentinel for the default and is replace in \`attached\`. */
    --calculated-paper-radio-button-ink-size: var(--paper-radio-button-ink-size, -1px);
  }

  :host(:focus) {
    outline: none;
  }

  #radioContainer {
    @apply --layout-inline;
    @apply --layout-center-center;
    position: relative;
    width: var(--calculated-paper-radio-button-size);
    height: var(--calculated-paper-radio-button-size);
    vertical-align: middle;

    @apply --paper-radio-button-radio-container;
  }

  #ink {
    position: absolute;
    top: 50%;
    left: 50%;
    right: auto;
    width: var(--calculated-paper-radio-button-ink-size);
    height: var(--calculated-paper-radio-button-ink-size);
    color: var(--paper-radio-button-unchecked-ink-color, var(--primary-text-color));
    opacity: 0.6;
    pointer-events: none;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  #ink[checked] {
    color: var(--paper-radio-button-checked-ink-color, var(--primary-color));
  }

  #offRadio, #onRadio {
    position: absolute;
    box-sizing: border-box;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  #offRadio {
    border: 2px solid var(--paper-radio-button-unchecked-color, var(--primary-text-color));
    background-color: var(--paper-radio-button-unchecked-background-color, transparent);
    transition: border-color 0.28s;
  }

  #onRadio {
    background-color: var(--paper-radio-button-checked-color, var(--primary-color));
    -webkit-transform: scale(0);
    transform: scale(0);
    transition: -webkit-transform ease 0.28s;
    transition: transform ease 0.28s;
    will-change: transform;
  }

  :host([checked]) #offRadio {
    border-color: var(--paper-radio-button-checked-color, var(--primary-color));
  }

  :host([checked]) #onRadio {
    -webkit-transform: scale(0.5);
    transform: scale(0.5);
  }

  #radioLabel {
    line-height: normal;
    position: relative;
    display: inline-block;
    vertical-align: middle;
    margin-left: var(--paper-radio-button-label-spacing, 10px);
    white-space: normal;
    color: var(--paper-radio-button-label-color, var(--primary-text-color));

    @apply --paper-radio-button-label;
  }

  :host([checked]) #radioLabel {
    @apply --paper-radio-button-label-checked;
  }

  #radioLabel:dir(rtl) {
    margin-left: 0;
    margin-right: var(--paper-radio-button-label-spacing, 10px);
  }

  #radioLabel[hidden] {
    display: none;
  }

  /* disabled state */

  :host([disabled]) #offRadio {
    border-color: var(--paper-radio-button-unchecked-color, var(--primary-text-color));
    opacity: 0.5;
  }

  :host([disabled][checked]) #onRadio {
    background-color: var(--paper-radio-button-unchecked-color, var(--primary-text-color));
    opacity: 0.5;
  }

  :host([disabled]) #radioLabel {
    /* slightly darker than the button, so that it's readable */
    opacity: 0.65;
  }
</style>

<div id="radioContainer">
  <div id="offRadio"></div>
  <div id="onRadio"></div>
</div>

<div id="radioLabel"><slot></slot></div>`;l.setAttribute("strip-whitespace","");n({_template:l,is:"paper-radio-button",behaviors:[d],hostAttributes:{role:"radio","aria-checked":!1,tabindex:0},properties:{ariaActiveAttribute:{type:String,value:"aria-checked"}},ready:function(){this._rippleContainer=this.$.radioContainer},attached:function(){c(this,function(){var e=this.getComputedStyleValue("--calculated-paper-radio-button-ink-size").trim();if(e==="-1px"){var i=parseFloat(this.getComputedStyleValue("--calculated-paper-radio-button-size").trim()),t=Math.floor(3*i);t%2!==i%2&&t++,this.updateStyles({"--paper-radio-button-ink-size":t+"px"})}})}});/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const r={hostAttributes:{role:"menubar"},keyBindings:{left:"_onLeftKey",right:"_onRightKey"},_onUpKey:function(e){this.focusedItem.click(),e.detail.keyboardEvent.preventDefault()},_onDownKey:function(e){this.focusedItem.click(),e.detail.keyboardEvent.preventDefault()},get _isRTL(){return window.getComputedStyle(this).direction==="rtl"},_onLeftKey:function(e){this._isRTL?this._focusNext():this._focusPrevious(),e.detail.keyboardEvent.preventDefault()},_onRightKey:function(e){this._isRTL?this._focusPrevious():this._focusNext(),e.detail.keyboardEvent.preventDefault()},_onKeydown:function(e){this.keyboardEventMatchesKeys(e,"up down left right esc")||this._focusWithKeyboardEvent(e)}},y=[p,r];/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/n({_template:a`
    <style>
      :host {
        display: inline-block;
      }

      :host ::slotted(*) {
        padding: var(--paper-radio-group-item-padding, 12px);
      }
    </style>

    <slot></slot>
`,is:"paper-radio-group",behaviors:[y],hostAttributes:{role:"radiogroup"},properties:{attrForSelected:{type:String,value:"name"},selectedAttribute:{type:String,value:"checked"},selectable:{type:String,value:"paper-radio-button"},allowEmptySelection:{type:Boolean,value:!1}},select:function(e){var i=this._valueToItem(e);if(!(i&&i.hasAttribute("disabled"))){if(this.selected){var t=this._valueToItem(this.selected);if(this.selected==e)if(this.allowEmptySelection)e="";else{t&&(t.checked=!0);return}t&&(t.checked=!1)}u.select.apply(this,[e]),this.fire("paper-radio-group-changed")}},_activateFocusedItem:function(){this._itemActivate(this._valueForItem(this.focusedItem),this.focusedItem)},_onUpKey:function(e){this._focusPrevious(),e.preventDefault(),this._activateFocusedItem()},_onDownKey:function(e){this._focusNext(),e.preventDefault(),this._activateFocusedItem()},_onLeftKey:function(e){r._onLeftKey.apply(this,arguments),this._activateFocusedItem()},_onRightKey:function(e){r._onRightKey.apply(this,arguments),this._activateFocusedItem()}});/**
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
*/const f=[m,h,b,{properties:{directoryName:{type:String},dbl10n:{type:Boolean,value:!1},label:String,canSelectParent:Boolean,readonly:{type:Boolean,value:!1},idFunction:{type:Function,value(){return this._idFunction.bind(this)}},errorMessage:String,format:{type:Function,value(){return this._formatter.bind(this)}},_entries:Array},observers:["_fetchEntries(directoryName)"],_fetchEntries(){this.directoryName&&this.async(()=>{this.$.op.params={directoryName:this.directoryName,dbl10n:this.dbl10n,canSelectParent:this.canSelectParent,localize:!0,lang:window.nuxeo.I18n.language?window.nuxeo.I18n.language.split("-")[0]:"en"},this.$.op.execute().then(e=>{this._entries=[],e.forEach(i=>{this._populate(i)}),this.dispatchEvent(new CustomEvent("directory-entries-loaded",{composed:!0,bubbles:!0}))})})},_formatter(e){return e.absoluteLabel||e.displayLabel},_idFunction(e){return e.id||e.computedId||e.uid},_populate(e){(this.canSelectParent||!e.children)&&(e.checked=this._isChecked(e),this._entries.push(e)),e.children&&e.children.forEach(i=>{this._populate(i)})}}];/**
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
*/{class e extends s([f],Nuxeo.Element){static get template(){return a`
        <style>
          :host {
            display: block;
            position: relative;
            padding-bottom: 8px;
          }

          [hidden] {
            display: none !important;
          }

          :host([invalid]) .label,
          .error {
            color: var(--paper-input-container-invalid-color, #de350b);
          }

          :host([invalid]) .error {
            opacity: 1;
            font-size: 0.923rem;
          }

          .label {
            @apply --nuxeo-label;
          }

          .label[required]::after {
            display: inline-block;
            content: '*';
            margin-left: 4px;
            color: var(--paper-input-container-invalid-color, #de350b);
            font-size: 1.2em;
          }

          paper-checkbox {
            margin-top: 10px;
          }

          paper-radio-group {
            --paper-radio-group-item-padding: 12px 8px 0px 0px;
          }
        </style>

        <nuxeo-operation id="op" op="Directory.SuggestEntries"></nuxeo-operation>

        <label class="label" hidden$="[[!label]]" required$="[[required]]">[[label]]</label>

        <paper-radio-group on-selected-item-changed="_updateItem" selected="{{_selected}}">
          <dom-repeat items="[[_entries]]">
            <template>
              <paper-radio-button
                name="[[idFunction(item)]]"
                data-index="[[index]]"
                checked="[[item.checked]]"
                disabled="[[readonly]]"
              >
                [[format(item)]]
              </paper-radio-button>
            </template>
          </dom-repeat>
        </paper-radio-group>

        <label class="error" hidden$="[[!invalid]]">[[errorMessage]]</label>
      `}static get is(){return"nuxeo-directory-radio-group"}static get properties(){return{selectedItem:{type:Object,notify:!0},value:{type:String,notify:!0,observer:"_updateSelected"},_selected:String}}_updateItem(t){t.detail&&t.detail.value&&(this.set("selectedItem",this._entries[t.detail.value.dataIndex]),this.set("value",this.idFunction(this.selectedItem)))}_updateSelected(){this.value&&this.value.length>0&&this.value!==this._selected&&(this._selected=this.value),this._entries&&this._entries.forEach(t=>this._isChecked(t))}_getValidity(){return this.required?!!this.value:!0}_isChecked(t){const o=this.value?this.value:this.selectedItem;return o&&this.idFunction(o)===this.idFunction(t)?(this._selected=this.idFunction(t),!0):!1}}customElements.define(e.is,e),Nuxeo.DirectoryRadioGroup=e}const S=[{absoluteLabel:"Arabic",computedId:"ar",directoryName:"language",displayLabel:"Arabic","entity-type":"directoryEntry",id:"ar",label:"Arabic",obsolete:0,ordering:1e7,properties:{id:"ar",label:"Arabic",obsolete:0,ordering:1e7}},{absoluteLabel:"Chinese",computedId:"zh",directoryName:"language",displayLabel:"Chinese","entity-type":"directoryEntry",id:"zh",label:"Chinese",obsolete:0,ordering:1e7,properties:{id:"zh",label:"Chinese",obsolete:0,ordering:1e7}},{absoluteLabel:"English",computedId:"en",directoryName:"language",displayLabel:"English","entity-type":"directoryEntry",id:"en",label:"English",obsolete:0,ordering:1e7,properties:{id:"en",label:"English",obsolete:0,ordering:1e7}},{absoluteLabel:"French",computedId:"fr",directoryName:"language",displayLabel:"French","entity-type":"directoryEntry",id:"fr",label:"French",obsolete:0,ordering:1e7,properties:{id:"fr",label:"French",obsolete:0,ordering:1e7}}];export{S as D};
