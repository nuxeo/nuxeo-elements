import"./iron-flex-layout-Db70X-7Q.js";import"./paper-material-styles-C_zSstGc.js";import{h as d,P as b,d as h,m as y}from"./iframe-Yfd-OibJ.js";import{I as _,a as c}from"./paper-ripple-DDInChqF.js";import{I as g}from"./iron-a11y-keys-behavior-BQM3k0wN.js";import{P as v}from"./paper-inky-focus-behavior-BHRRPMpt.js";import{I as w,a as u,N as k}from"./neon-animation-runner-behavior-BtBYKrDJ.js";import"./default-theme-DZcntQFC.js";import"./typography-C7rYHizi.js";import"./shadow-5Ga7wkF4.js";import{a as C}from"./render-status-BVnGG85N.js";import{T as x}from"./templatizer-behavior-vG_cb1KN.js";/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const f={properties:{elevation:{type:Number,reflectToAttribute:!0,readOnly:!0}},observers:["_calculateElevation(focused, disabled, active, pressed, receivedFocusFromKeyboard)","_computeKeyboardClass(receivedFocusFromKeyboard)"],hostAttributes:{role:"button",tabindex:"0",animated:!0},_calculateElevation:function(){var i=1;this.disabled?i=0:this.active||this.pressed?i=4:this.receivedFocusFromKeyboard&&(i=3),this._setElevation(i)},_computeKeyboardClass:function(i){this.toggleClass("keyboard-focus",i)},_spaceKeyDownHandler:function(i){c._spaceKeyDownHandler.call(this,i),this.hasRipple()&&this.getRipple().ripples.length<1&&this._ripple.uiDownAction()},_spaceKeyUpHandler:function(i){c._spaceKeyUpHandler.call(this,i),this.hasRipple()&&this._ripple.uiUpAction()}},E=[_,g,v,f];/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const m=d`
  <style include="paper-material-styles">
    /* Need to specify the same specificity as the styles imported from paper-material. */
    :host {
      @apply --layout-inline;
      @apply --layout-center-center;
      position: relative;
      box-sizing: border-box;
      min-width: 5.14em;
      margin: 0 0.29em;
      background: transparent;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      -webkit-tap-highlight-color: transparent;
      font: inherit;
      text-transform: uppercase;
      outline-width: 0;
      border-radius: 3px;
      -moz-user-select: none;
      -ms-user-select: none;
      -webkit-user-select: none;
      user-select: none;
      cursor: pointer;
      z-index: 0;
      padding: 0.7em 0.57em;

      @apply --paper-font-common-base;
      @apply --paper-button;
    }

    :host([elevation="1"]) {
      @apply --paper-material-elevation-1;
    }

    :host([elevation="2"]) {
      @apply --paper-material-elevation-2;
    }

    :host([elevation="3"]) {
      @apply --paper-material-elevation-3;
    }

    :host([elevation="4"]) {
      @apply --paper-material-elevation-4;
    }

    :host([elevation="5"]) {
      @apply --paper-material-elevation-5;
    }

    :host([hidden]) {
      display: none !important;
    }

    :host([raised].keyboard-focus) {
      font-weight: bold;
      @apply --paper-button-raised-keyboard-focus;
    }

    :host(:not([raised]).keyboard-focus) {
      font-weight: bold;
      @apply --paper-button-flat-keyboard-focus;
    }

    :host([disabled]) {
      background: none;
      color: #a8a8a8;
      cursor: auto;
      pointer-events: none;

      @apply --paper-button-disabled;
    }

    :host([disabled][raised]) {
      background: #eaeaea;
    }


    :host([animated]) {
      @apply --shadow-transition;
    }

    paper-ripple {
      color: var(--paper-button-ink-color);
    }
  </style>

  <slot></slot>`;m.setAttribute("strip-whitespace","");b({_template:m,is:"paper-button",behaviors:[E],properties:{raised:{type:Boolean,reflectToAttribute:!0,value:!1,observer:"_calculateElevation"}},_calculateElevation:function(){this.raised?f._calculateElevation.apply(this):this._setElevation(0)}});/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const T={hostAttributes:{role:"dialog",tabindex:"-1"},properties:{modal:{type:Boolean,value:!1},__readied:{type:Boolean,value:!1}},observers:["_modalChanged(modal, __readied)"],listeners:{tap:"_onDialogClick"},ready:function(){this.__prevNoCancelOnOutsideClick=this.noCancelOnOutsideClick,this.__prevNoCancelOnEscKey=this.noCancelOnEscKey,this.__prevWithBackdrop=this.withBackdrop,this.__readied=!0},_modalChanged:function(i,r){r&&(i?(this.__prevNoCancelOnOutsideClick=this.noCancelOnOutsideClick,this.__prevNoCancelOnEscKey=this.noCancelOnEscKey,this.__prevWithBackdrop=this.withBackdrop,this.noCancelOnOutsideClick=!0,this.noCancelOnEscKey=!0,this.withBackdrop=!0):(this.noCancelOnOutsideClick=this.noCancelOnOutsideClick&&this.__prevNoCancelOnOutsideClick,this.noCancelOnEscKey=this.noCancelOnEscKey&&this.__prevNoCancelOnEscKey,this.withBackdrop=this.withBackdrop&&this.__prevWithBackdrop))},_updateClosingReasonConfirmed:function(i){this.closingReason=this.closingReason||{},this.closingReason.confirmed=i},_onDialogClick:function(i){for(var r=h(i).path,e=0,t=r.indexOf(this);e<t;e++){var o=r[e];if(o.hasAttribute&&(o.hasAttribute("dialog-dismiss")||o.hasAttribute("dialog-confirm"))){this._updateClosingReasonConfirmed(o.hasAttribute("dialog-confirm")),this.close(),i.stopPropagation();break}}}},B=[w,T];/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const p=document.createElement("template");p.setAttribute("style","display: none;");p.innerHTML=`<dom-module id="paper-dialog-shared-styles">
  <template>
    <style>
      :host {
        display: block;
        margin: 24px 40px;

        background: var(--paper-dialog-background-color, var(--primary-background-color));
        color: var(--paper-dialog-color, var(--primary-text-color));

        @apply --paper-font-body1;
        @apply --shadow-elevation-16dp;
        @apply --paper-dialog;
      }

      :host > ::slotted(*) {
        margin-top: 20px;
        padding: 0 24px;
      }

      :host > ::slotted(.no-padding) {
        padding: 0;
      }

      
      :host > ::slotted(*:first-child) {
        margin-top: 24px;
      }

      :host > ::slotted(*:last-child) {
        margin-bottom: 24px;
      }

      /* In 1.x, this selector was \`:host > ::content h2\`. In 2.x <slot> allows
      to select direct children only, which increases the weight of this
      selector, so we have to re-define first-child/last-child margins below. */
      :host > ::slotted(h2) {
        position: relative;
        margin: 0;

        @apply --paper-font-title;
        @apply --paper-dialog-title;
      }

      /* Apply mixin again, in case it sets margin-top. */
      :host > ::slotted(h2:first-child) {
        margin-top: 24px;
        @apply --paper-dialog-title;
      }

      /* Apply mixin again, in case it sets margin-bottom. */
      :host > ::slotted(h2:last-child) {
        margin-bottom: 24px;
        @apply --paper-dialog-title;
      }

      :host > ::slotted(.paper-dialog-buttons),
      :host > ::slotted(.buttons) {
        position: relative;
        padding: 8px 8px 8px 24px;
        margin: 0;

        color: var(--paper-dialog-button-color, var(--primary-color));

        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }
    </style>
  </template>
</dom-module>`;document.head.appendChild(p.content);/**
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
*/u._overlayWithBackdrop=function(){for(let i=0;i<this._overlays.length;i++)if(this._overlays[i].withBackdrop)return this._overlays[i]};{class i extends y([B,k,x],Nuxeo.Element){static get template(){return d`
        <style include="paper-dialog-shared-styles">
          :host {
            @apply --nuxeo-dialog;
            visibility: visible;
          }

          :host > ::slotted(h2),
          :host > ::slotted(*) {
            margin-top: 16px;
          }

          :host > ::slotted(.buttons) {
            @apply --layout-horizontal;
            @apply --layout-justified;
            margin-top: 16px;
          }
        </style>

        <slot></slot>
      `}static get is(){return"nuxeo-dialog"}static get properties(){return{reparent:{type:Boolean,value:!1}}}static get observers(){return["_openedModalChanged(opened, modal)"]}ready(){super.ready(),this.addEventListener("iron-overlay-opened",this._opened),this.addEventListener("iron-overlay-closed",this._onDialogClosed),this._boundTrapTab=this._trapTab.bind(this)}_onCaptureTab(){}disconnectedCallback(){if(this._observer)try{this.detached()}catch(e){if(e instanceof TypeError&&/disconnect is not a function/.test(e.message))this._observer=null;else throw e}document.removeEventListener("keydown",this._boundTrapTab,!0),this._clear()}_opened(e){const t=/iPhone|iPad|iPod/.test(window.navigator.userAgent);if((this.reparent&&e.target.withBackdrop||t)&&e.target.parentNode.insertBefore(e.target.backdropElement,e.target),e.target===this){if(!this._instance){const o=h(this).querySelector("nuxeo-dialog > template");o&&(this._templatizerTemplate||this.templatize(o),this._instance=this.stamp(),this.appendChild(this._instance.root))}(this.modal||this.withBackdrop)&&(this.setAttribute("aria-modal","true"),this._enableFocusTrap(),C(this,()=>{if(!(!this.opened||!this.isConnected)&&!this._containsDeepFocus()){const o=this.querySelector("[autofocus]");if(o)o.focus({preventScroll:!0});else{const a=this._getFocusableElements();a.length>0?a[0].focus({preventScroll:!0}):this.focus({preventScroll:!0})}}}))}}_openedModalChanged(e,t){e&&t?(this.setAttribute("aria-modal","true"),this._enableFocusTrap()):e&&!t?this.withBackdrop||(this.removeAttribute("aria-modal"),this._disableFocusTrap()):!e&&t&&(this.removeAttribute("aria-modal"),this._disableFocusTrap())}_onDialogClosed(e){e.target===this&&(this.modal||this.withBackdrop)&&(this.removeAttribute("aria-modal"),this._disableFocusTrap())}_enableFocusTrap(){this._boundTrapTab||(this._boundTrapTab=this._trapTab.bind(this)),document.removeEventListener("keydown",this._boundTrapTab,!0),document.addEventListener("keydown",this._boundTrapTab,!0),this._focusTrapEnabled=!0}_disableFocusTrap(){document.removeEventListener("keydown",this._boundTrapTab,!0),this._focusTrapEnabled=!1}_trapTab(e){if(e.key!=="Tab"||!this.opened||!(this.modal||this.withBackdrop))return;if(!this._containsDeepFocus()){if(u.currentOverlay()!==this)return;const l=this._getFocusableElements();if(l.length===0)return;e.preventDefault(),(e.shiftKey?l[l.length-1]:l[0]).focus({preventScroll:!0});return}const t=this._getFocusableElements();if(t.length===0){e.preventDefault(),this.focus({preventScroll:!0});return}const o=this._getDeepActiveElement();let a=t.indexOf(o);a===-1&&(a=this._findContainingFocusableIndex(o,t)),e.shiftKey?a<=0&&(e.preventDefault(),t[t.length-1].focus({preventScroll:!0})):(a===-1||a>=t.length-1)&&(e.preventDefault(),t[0].focus({preventScroll:!0}))}_getFocusableElements(){const e=["a[href]:not([disabled]):not([inert])","button:not([disabled]):not([inert])",'input:not([disabled]):not([inert]):not([type="hidden"])',"select:not([disabled]):not([inert])","textarea:not([disabled]):not([inert])",'[contenteditable]:not([contenteditable="false"]):not([inert])',"iframe:not([disabled]):not([inert])","audio[controls]:not([disabled]):not([inert])","video[controls]:not([disabled]):not([inert])",'[tabindex]:not([tabindex="-1"]):not([disabled]):not([inert])'].join(","),t=[],o=new Set;return this._collectFocusables(this,e,t,o),t}_collectFocusables(e,t,o,a){if(a.has(e))return;a.add(e),Array.from(e.children).forEach(s=>{if(s.matches){if(s.localName==="slot"){s.assignedElements({flatten:!0}).forEach(n=>{a.has(n)||(n.matches&&n.matches(t)&&this._isVisible(n)?(o.push(n),n.shadowRoot?a.add(n):this._collectFocusables(n,t,o,a)):(this._collectFocusables(n,t,o,a),n.shadowRoot&&this._collectFocusables(n.shadowRoot,t,o,a)))});return}a.has(s)||(s.matches(t)&&this._isVisible(s)?(o.push(s),s.shadowRoot?a.add(s):this._collectFocusables(s,t,o,a)):(this._collectFocusables(s,t,o,a),s.shadowRoot&&this._collectFocusables(s.shadowRoot,t,o,a)))}})}_isVisible(e){if(e.offsetParent===null&&e.offsetWidth===0&&e.offsetHeight===0)return!1;const t=window.getComputedStyle(e);return t.display!=="none"&&t.visibility!=="hidden"}_getDeepActiveElement(){let e=document.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;return e}_containsDeepFocus(){let e=this._getDeepActiveElement();for(;e;){if(e===this)return!0;e.parentNode instanceof ShadowRoot?e=e.parentNode.host:e=e.parentElement}return!1}_findContainingFocusableIndex(e,t){let o=e;for(;o&&o!==this;){const a=t.indexOf(o);if(a!==-1)return a;o.parentNode instanceof ShadowRoot?o=o.parentNode.host:o=o.parentElement}return-1}_clear(){if(this._instance){const e=this._instance.children;if(e&&e.length)for(let t=0,o;t<e.length&&(o=e[t]);t++)o.remove();this._instance=null}}_forwardHostPropV2(e,t){this._instance&&this._instance.forwardHostProp(e,t)}}customElements.define(i.is,i),Nuxeo.Dialog=i}export{T as P};
