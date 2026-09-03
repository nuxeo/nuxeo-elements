import"./iron-flex-layout-CQAobW0V.js";import"./paper-material-styles-B1vejkc1.js";import{h,P as b,d as p,m as y}from"./iframe-T5hUCbnt.js";import{I as _,a as d}from"./paper-ripple-e9CBUXzz.js";import{I as g}from"./iron-a11y-keys-behavior-CQeU5Yru.js";import{P as v}from"./paper-inky-focus-behavior-BFu4CTGP.js";import{I as w,a as u,N as C}from"./neon-animation-runner-behavior-mf0Oh3zj.js";import"./default-theme-RhyFn9QU.js";import"./typography-Bj6IP4r5.js";import"./shadow-B1sjh-5Q.js";import{a as k}from"./render-status-BJmzACxi.js";import{T as x}from"./templatizer-behavior-BRsvGg6D.js";/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const f={properties:{elevation:{type:Number,reflectToAttribute:!0,readOnly:!0}},observers:["_calculateElevation(focused, disabled, active, pressed, receivedFocusFromKeyboard)","_computeKeyboardClass(receivedFocusFromKeyboard)"],hostAttributes:{role:"button",tabindex:"0",animated:!0},_calculateElevation:function(){var a=1;this.disabled?a=0:this.active||this.pressed?a=4:this.receivedFocusFromKeyboard&&(a=3),this._setElevation(a)},_computeKeyboardClass:function(a){this.toggleClass("keyboard-focus",a)},_spaceKeyDownHandler:function(a){d._spaceKeyDownHandler.call(this,a),this.hasRipple()&&this.getRipple().ripples.length<1&&this._ripple.uiDownAction()},_spaceKeyUpHandler:function(a){d._spaceKeyUpHandler.call(this,a),this.hasRipple()&&this._ripple.uiUpAction()}},E=[_,g,v,f];/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const m=h`
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
*/const T={hostAttributes:{role:"dialog",tabindex:"-1"},properties:{modal:{type:Boolean,value:!1},__readied:{type:Boolean,value:!1}},observers:["_modalChanged(modal, __readied)"],listeners:{tap:"_onDialogClick"},ready:function(){this.__prevNoCancelOnOutsideClick=this.noCancelOnOutsideClick,this.__prevNoCancelOnEscKey=this.noCancelOnEscKey,this.__prevWithBackdrop=this.withBackdrop,this.__readied=!0},_modalChanged:function(a,r){r&&(a?(this.__prevNoCancelOnOutsideClick=this.noCancelOnOutsideClick,this.__prevNoCancelOnEscKey=this.noCancelOnEscKey,this.__prevWithBackdrop=this.withBackdrop,this.noCancelOnOutsideClick=!0,this.noCancelOnEscKey=!0,this.withBackdrop=!0):(this.noCancelOnOutsideClick=this.noCancelOnOutsideClick&&this.__prevNoCancelOnOutsideClick,this.noCancelOnEscKey=this.noCancelOnEscKey&&this.__prevNoCancelOnEscKey,this.withBackdrop=this.withBackdrop&&this.__prevWithBackdrop))},_updateClosingReasonConfirmed:function(a){this.closingReason=this.closingReason||{},this.closingReason.confirmed=a},_onDialogClick:function(a){for(var r=p(a).path,e=0,o=r.indexOf(this);e<o;e++){var t=r[e];if(t.hasAttribute&&(t.hasAttribute("dialog-dismiss")||t.hasAttribute("dialog-confirm"))){this._updateClosingReasonConfirmed(t.hasAttribute("dialog-confirm")),this.close(),a.stopPropagation();break}}}},B=[w,T];/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const c=document.createElement("template");c.setAttribute("style","display: none;");c.innerHTML=`<dom-module id="paper-dialog-shared-styles">
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
</dom-module>`;document.head.appendChild(c.content);/**
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
*/u._overlayWithBackdrop=function(){for(let a=0;a<this._overlays.length;a++)if(this._overlays[a].withBackdrop)return this._overlays[a]};{class a extends y([B,C,x],Nuxeo.Element){static get template(){return h`
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
      `}static get is(){return"nuxeo-dialog"}static get properties(){return{reparent:{type:Boolean,value:!1}}}static get observers(){return["_openedModalChanged(opened, modal)"]}ready(){super.ready(),this.addEventListener("iron-overlay-opened",this._opened),this.addEventListener("iron-overlay-closed",this._onDialogClosed),this._boundTrapTab=this._trapTab.bind(this)}_onCaptureTab(){}disconnectedCallback(){if(this._observer)try{this.detached()}catch(e){if(e instanceof TypeError&&/disconnect is not a function/.test(e.message))this._observer=null;else throw e}document.removeEventListener("keydown",this._boundTrapTab,!0),this._clear()}_opened(e){const o=/iPhone|iPad|iPod/.test(window.navigator.userAgent);if((this.reparent&&e.target.withBackdrop||o)&&e.target.parentNode.insertBefore(e.target.backdropElement,e.target),e.target===this){if(!this._instance){const t=p(this).querySelector("nuxeo-dialog > template");t&&(this._templatizerTemplate||this.templatize(t),this._instance=this.stamp(),this.appendChild(this._instance.root))}(this.modal||this.withBackdrop)&&(this.setAttribute("aria-modal","true"),this._enableFocusTrap(),k(this,()=>{if(!(!this.opened||!this.isConnected)&&!this._containsDeepFocus()){const t=this.querySelector("[autofocus]");if(t)t.focus({preventScroll:!0});else{const i=this._getFocusableElements();i.length>0?i[0].focus({preventScroll:!0}):this.focus({preventScroll:!0})}}}))}}_openedModalChanged(e,o){e&&o?(this.setAttribute("aria-modal","true"),this._enableFocusTrap()):e&&!o?this.withBackdrop||(this.removeAttribute("aria-modal"),this._disableFocusTrap()):!e&&o&&(this.removeAttribute("aria-modal"),this._disableFocusTrap())}_onDialogClosed(e){e.target===this&&(this.modal||this.withBackdrop)&&(this.removeAttribute("aria-modal"),this._disableFocusTrap())}_enableFocusTrap(){this._boundTrapTab||(this._boundTrapTab=this._trapTab.bind(this)),document.removeEventListener("keydown",this._boundTrapTab,!0),document.addEventListener("keydown",this._boundTrapTab,!0),this._focusTrapEnabled=!0}_disableFocusTrap(){document.removeEventListener("keydown",this._boundTrapTab,!0),this._focusTrapEnabled=!1}_trapTab(e){if(e.key!=="Tab"||!this.opened||!(this.modal||this.withBackdrop))return;if(!this._containsDeepFocus()){if(u.currentOverlay()!==this)return;const l=this._getFocusableElements();if(l.length===0)return;e.preventDefault(),(e.shiftKey?l[l.length-1]:l[0]).focus({preventScroll:!0});return}const o=this._getFocusableElements();if(o.length===0){e.preventDefault(),this.focus({preventScroll:!0});return}const t=this._getDeepActiveElement();let i=o.indexOf(t);i===-1&&(i=this._findContainingFocusableIndex(t,o)),e.shiftKey?i<=0&&(e.preventDefault(),o[o.length-1].focus({preventScroll:!0})):(i===-1||i>=o.length-1)&&(e.preventDefault(),o[0].focus({preventScroll:!0}))}_getFocusableElements(){const e=["a[href]:not([disabled]):not([inert])","button:not([disabled]):not([inert])",'input:not([disabled]):not([inert]):not([type="hidden"])',"select:not([disabled]):not([inert])","textarea:not([disabled]):not([inert])",'[contenteditable]:not([contenteditable="false"]):not([inert])',"iframe:not([disabled]):not([inert])","audio[controls]:not([disabled]):not([inert])","video[controls]:not([disabled]):not([inert])",'[tabindex]:not([tabindex="-1"]):not([disabled]):not([inert])'].join(","),o=[],t=new Set;return this._collectFocusables(this,e,o,t),o}_collectFocusables(e,o,t,i){if(i.has(e))return;i.add(e),Array.from(e.children).forEach(s=>{if(s.matches){if(s.localName==="slot"){s.assignedElements({flatten:!0}).forEach(n=>{i.has(n)||(n.matches&&n.matches(o)&&this._isVisible(n)?(t.push(n),n.shadowRoot?i.add(n):this._collectFocusables(n,o,t,i)):(this._collectFocusables(n,o,t,i),n.shadowRoot&&this._collectFocusables(n.shadowRoot,o,t,i)))});return}i.has(s)||(s.matches(o)&&this._isVisible(s)?(t.push(s),s.shadowRoot?i.add(s):this._collectFocusables(s,o,t,i)):(this._collectFocusables(s,o,t,i),s.shadowRoot&&this._collectFocusables(s.shadowRoot,o,t,i)))}})}_isVisible(e){if(e.offsetParent===null&&e.offsetWidth===0&&e.offsetHeight===0)return!1;const o=window.getComputedStyle(e);return o.display!=="none"&&o.visibility!=="hidden"}_getDeepActiveElement(){let e=document.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;return e}_containsDeepFocus(){let e=this._getDeepActiveElement();for(;e;){if(e===this)return!0;e.parentNode instanceof ShadowRoot?e=e.parentNode.host:e=e.parentElement}return!1}_findContainingFocusableIndex(e,o){let t=e;for(;t&&t!==this;){const i=o.indexOf(t);if(i!==-1)return i;t.parentNode instanceof ShadowRoot?t=t.parentNode.host:t=t.parentElement}return-1}_clear(){if(this._instance){const e=this._instance.children;if(e&&e.length){const o=p(p(e[0]).parentNode);for(let t=0,i;t<e.length&&(i=e[t]);t++)o.removeChild(i)}this._instance=null}}_forwardHostPropV2(e,o){this._instance&&this._instance.forwardHostProp(e,o)}}customElements.define(a.is,a),Nuxeo.Dialog=a}export{T as P};
