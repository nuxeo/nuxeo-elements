import{P as g,d as s,h as _,m as v,a as T}from"./iframe-DfANLok6.js";/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/g({_template:_`
    <style>
      :host {
        display: block;
        position: absolute;
        outline: none;
        z-index: 1002;
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        cursor: default;
      }

      #tooltip {
        display: block;
        outline: none;
        @apply --paper-font-common-base;
        font-size: 10px;
        line-height: 1;
        background-color: var(--paper-tooltip-background, #616161);
        color: var(--paper-tooltip-text-color, white);
        padding: 8px;
        border-radius: 2px;
        @apply --paper-tooltip;
      }

      @keyframes keyFrameScaleUp {
        0% {
          transform: scale(0.0);
        }
        100% {
          transform: scale(1.0);
        }
      }

      @keyframes keyFrameScaleDown {
        0% {
          transform: scale(1.0);
        }
        100% {
          transform: scale(0.0);
        }
      }

      @keyframes keyFrameFadeInOpacity {
        0% {
          opacity: 0;
        }
        100% {
          opacity: var(--paper-tooltip-opacity, 0.9);
        }
      }

      @keyframes keyFrameFadeOutOpacity {
        0% {
          opacity: var(--paper-tooltip-opacity, 0.9);
        }
        100% {
          opacity: 0;
        }
      }

      @keyframes keyFrameSlideDownIn {
        0% {
          transform: translateY(-2000px);
          opacity: 0;
        }
        10% {
          opacity: 0.2;
        }
        100% {
          transform: translateY(0);
          opacity: var(--paper-tooltip-opacity, 0.9);
        }
      }

      @keyframes keyFrameSlideDownOut {
        0% {
          transform: translateY(0);
          opacity: var(--paper-tooltip-opacity, 0.9);
        }
        10% {
          opacity: 0.2;
        }
        100% {
          transform: translateY(-2000px);
          opacity: 0;
        }
      }

      .fade-in-animation {
        opacity: 0;
        animation-delay: var(--paper-tooltip-delay-in, 500ms);
        animation-name: keyFrameFadeInOpacity;
        animation-iteration-count: 1;
        animation-timing-function: ease-in;
        animation-duration: var(--paper-tooltip-duration-in, 500ms);
        animation-fill-mode: forwards;
        @apply --paper-tooltip-animation;
      }

      .fade-out-animation {
        opacity: var(--paper-tooltip-opacity, 0.9);
        animation-delay: var(--paper-tooltip-delay-out, 0ms);
        animation-name: keyFrameFadeOutOpacity;
        animation-iteration-count: 1;
        animation-timing-function: ease-in;
        animation-duration: var(--paper-tooltip-duration-out, 500ms);
        animation-fill-mode: forwards;
        @apply --paper-tooltip-animation;
      }

      .scale-up-animation {
        transform: scale(0);
        opacity: var(--paper-tooltip-opacity, 0.9);
        animation-delay: var(--paper-tooltip-delay-in, 500ms);
        animation-name: keyFrameScaleUp;
        animation-iteration-count: 1;
        animation-timing-function: ease-in;
        animation-duration: var(--paper-tooltip-duration-in, 500ms);
        animation-fill-mode: forwards;
        @apply --paper-tooltip-animation;
      }

      .scale-down-animation {
        transform: scale(1);
        opacity: var(--paper-tooltip-opacity, 0.9);
        animation-delay: var(--paper-tooltip-delay-out, 500ms);
        animation-name: keyFrameScaleDown;
        animation-iteration-count: 1;
        animation-timing-function: ease-in;
        animation-duration: var(--paper-tooltip-duration-out, 500ms);
        animation-fill-mode: forwards;
        @apply --paper-tooltip-animation;
      }

      .slide-down-animation {
        transform: translateY(-2000px);
        opacity: 0;
        animation-delay: var(--paper-tooltip-delay-out, 500ms);
        animation-name: keyFrameSlideDownIn;
        animation-iteration-count: 1;
        animation-timing-function: cubic-bezier(0.0, 0.0, 0.2, 1);
        animation-duration: var(--paper-tooltip-duration-out, 500ms);
        animation-fill-mode: forwards;
        @apply --paper-tooltip-animation;
      }

      .slide-down-animation-out {
        transform: translateY(0);
        opacity: var(--paper-tooltip-opacity, 0.9);
        animation-delay: var(--paper-tooltip-delay-out, 500ms);
        animation-name: keyFrameSlideDownOut;
        animation-iteration-count: 1;
        animation-timing-function: cubic-bezier(0.4, 0.0, 1, 1);
        animation-duration: var(--paper-tooltip-duration-out, 500ms);
        animation-fill-mode: forwards;
        @apply --paper-tooltip-animation;
      }

      .cancel-animation {
        animation-delay: -30s !important;
      }

      /* Thanks IE 10. */

      .hidden {
        display: none !important;
      }
    </style>

    <div id="tooltip" class="hidden">
      <slot></slot>
    </div>
`,is:"paper-tooltip",hostAttributes:{role:"tooltip",tabindex:-1},properties:{for:{type:String,observer:"_findTarget"},manualMode:{type:Boolean,value:!1,observer:"_manualModeChanged"},position:{type:String,value:"bottom"},fitToVisibleBounds:{type:Boolean,value:!1},offset:{type:Number,value:14},marginTop:{type:Number,value:14},animationDelay:{type:Number,value:500,observer:"_delayChange"},animationEntry:{type:String,value:""},animationExit:{type:String,value:""},animationConfig:{type:Object,value:function(){return{entry:[{name:"fade-in-animation",node:this,timing:{delay:0}}],exit:[{name:"fade-out-animation",node:this}]}}},_showing:{type:Boolean,value:!1}},listeners:{webkitAnimationEnd:"_onAnimationEnd"},get target(){var t=s(this).parentNode,e=s(this).getOwnerRoot(),i;return this.for?i=s(e).querySelector("#"+this.for):i=t.nodeType==Node.DOCUMENT_FRAGMENT_NODE?e.host:t,i},attached:function(){this._findTarget()},detached:function(){this.manualMode||this._removeListeners()},playAnimation:function(t){t==="entry"?this.show():t==="exit"&&this.hide()},cancelAnimation:function(){this.$.tooltip.classList.add("cancel-animation")},show:function(){if(!this._showing){if(s(this).textContent.trim()===""){for(var t=!0,e=s(this).getEffectiveChildNodes(),i=0;i<e.length;i++)if(e[i].textContent.trim()!==""){t=!1;break}if(t)return}this._showing=!0,this.$.tooltip.classList.remove("hidden"),this.$.tooltip.classList.remove("cancel-animation"),this.$.tooltip.classList.remove(this._getAnimationType("exit")),this.updatePosition(),this._animationPlaying=!0,this.$.tooltip.classList.add(this._getAnimationType("entry"))}},hide:function(){if(this._showing){if(this._animationPlaying){this._showing=!1,this._cancelAnimation();return}else this._onAnimationFinish();this._showing=!1,this._animationPlaying=!0}},updatePosition:function(){if(!(!this._target||!this.offsetParent)){var t=this.offset;this.marginTop!=14&&this.offset==14&&(t=this.marginTop);var e=this.offsetParent.getBoundingClientRect(),i=this._target.getBoundingClientRect(),o=this.getBoundingClientRect(),n=(i.width-o.width)/2,h=(i.height-o.height)/2,a=i.left-e.left,d=i.top-e.top,r,l;switch(this.position){case"top":r=a+n,l=d-o.height-t;break;case"bottom":r=a+n,l=d+i.height+t;break;case"left":r=a-o.width-t,l=d+h;break;case"right":r=a+i.width+t,l=d+h;break}this.fitToVisibleBounds?(e.left+r+o.width>window.innerWidth?(this.style.right="0px",this.style.left="auto"):(this.style.left=Math.max(0,r)+"px",this.style.right="auto"),e.top+l+o.height>window.innerHeight?(this.style.bottom=e.height-d+t+"px",this.style.top="auto"):(this.style.top=Math.max(-e.top,l)+"px",this.style.bottom="auto")):(this.style.left=r+"px",this.style.top=l+"px")}},_addListeners:function(){this._target&&(this.listen(this._target,"mouseenter","show"),this.listen(this._target,"focus","show"),this.listen(this._target,"mouseleave","hide"),this.listen(this._target,"blur","hide"),this.listen(this._target,"tap","hide")),this.listen(this.$.tooltip,"animationend","_onAnimationEnd"),this.listen(this,"mouseenter","hide")},_findTarget:function(){this.manualMode||this._removeListeners(),this._target=this.target,this.manualMode||this._addListeners()},_delayChange:function(t){t!==500&&this.updateStyles({"--paper-tooltip-delay-in":t+"ms"})},_manualModeChanged:function(){this.manualMode?this._removeListeners():this._addListeners()},_cancelAnimation:function(){this.$.tooltip.classList.remove(this._getAnimationType("entry")),this.$.tooltip.classList.remove(this._getAnimationType("exit")),this.$.tooltip.classList.remove("cancel-animation"),this.$.tooltip.classList.add("hidden")},_onAnimationFinish:function(){this._showing&&(this.$.tooltip.classList.remove(this._getAnimationType("entry")),this.$.tooltip.classList.remove("cancel-animation"),this.$.tooltip.classList.add(this._getAnimationType("exit")))},_onAnimationEnd:function(){this._animationPlaying=!1,this._showing||(this.$.tooltip.classList.remove(this._getAnimationType("exit")),this.$.tooltip.classList.add("hidden"))},_getAnimationType:function(t){if(t==="entry"&&this.animationEntry!=="")return this.animationEntry;if(t==="exit"&&this.animationExit!=="")return this.animationExit;if(this.animationConfig[t]&&typeof this.animationConfig[t][0].name=="string"){if(this.animationConfig[t][0].timing&&this.animationConfig[t][0].timing.delay&&this.animationConfig[t][0].timing.delay!==0){var e=this.animationConfig[t][0].timing.delay;t==="entry"?this.updateStyles({"--paper-tooltip-delay-in":e+"ms"}):t==="exit"&&this.updateStyles({"--paper-tooltip-delay-out":e+"ms"})}return this.animationConfig[t][0].name}},_removeListeners:function(){this._target&&(this.unlisten(this._target,"mouseenter","show"),this.unlisten(this._target,"focus","show"),this.unlisten(this._target,"mouseleave","hide"),this.unlisten(this._target,"blur","hide"),this.unlisten(this._target,"tap","hide")),this.unlisten(this.$.tooltip,"animationend","_onAnimationEnd"),this.unlisten(this,"mouseenter","hide")}});/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.
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
*/const y=["Escape","Esc"],b=300;let u=0;function c(t){return(t||"").replace(/\s+/g," ").trim().toLowerCase()}const m=new Set;let p=null;function w(t){y.includes(t.key)&&Array.from(m).forEach(e=>e._dismissTooltip())}function L(t){m.add(t),p||(p=w,window.addEventListener("keydown",p,!0))}function E(t){m.delete(t),p&&m.size===0&&(window.removeEventListener("keydown",p,!0),p=null)}const D={properties:{pointerLeaveDelay:{type:Number,value:b}},attached(){this._armTooltipA11y()},detached(){this._disarmTooltipA11y()},_armTooltipA11y(){this._tooltipA11yArmed||(this._tooltipA11yArmed=!0,this._tooltipDismissed=!1,this._pointerOverTooltip=!1,this.setAttribute("role","tooltip"),this.id||(u+=1,this.id=`nuxeo-tooltip-${u}`),this._tooltipHiddenObserver=new MutationObserver(()=>this._syncTooltipDescription()),this._tooltipHiddenObserver.observe(this,{attributes:!0,attributeFilter:["hidden"]}),this._syncTooltipDescription())},_disarmTooltipA11y(){this._tooltipA11yArmed&&(this._tooltipA11yArmed=!1,this._onTooltipTornDown(),this._tooltipHiddenObserver&&(this._tooltipHiddenObserver.disconnect(),this._tooltipHiddenObserver=null),this._removeTooltipDescription(),this._tooltipDismissed=!1)},_syncTooltipDescription(){const t=this.target;if(!this._canDescribe(t)){this._removeTooltipDescription();return}if(this._describedTarget===t)return;this._removeTooltipDescription();const e=(t.getAttribute("aria-describedby")||"").split(/\s+/).filter(Boolean);e.includes(this.id)||(this._previousDescribedBy=t.getAttribute("aria-describedby"),e.push(this.id),t.setAttribute("aria-describedby",e.join(" ")),this._describedTarget=t)},_canDescribe(t){return!t||!t.setAttribute||this.hidden||t.getRootNode()!==this.getRootNode()?!1:!this._isDescriptionRedundant(t)},_removeTooltipDescription(){const t=this._describedTarget;this._describedTarget=null,t&&t.setAttribute&&(this._previousDescribedBy!==null?t.setAttribute("aria-describedby",this._previousDescribedBy):t.removeAttribute("aria-describedby"),this._previousDescribedBy=null)},_isDescriptionRedundant(t){const e=c(this.textContent);if(!e)return!0;const i=t.getRootNode(),o=(t.getAttribute("aria-labelledby")||"").split(/\s+/).filter(Boolean);if(o.includes(this.id))return!0;const n=[t.getAttribute("aria-label"),t.getAttribute("title")];return o.forEach(h=>{const a=i.getElementById?i.getElementById(h):null;a&&n.push(a.textContent)}),n.some(h=>c(h)===e)},isTooltipDismissed(){return!!this._tooltipDismissed},_resetTooltipDismissal(){this._tooltipDismissed=!1},_dismissTooltip(){this._tooltip&&(this._tooltipDismissed=!0,this.hide())},_onTooltipDismissKey(t){!t||!y.includes(t.key)||this._dismissTooltip()},_cancelTooltipHide(){this._tooltipHideTimer&&(clearTimeout(this._tooltipHideTimer),this._tooltipHideTimer=null)},_scheduleTooltipHide(){this._cancelTooltipHide();const t=this.pointerLeaveDelay;if(!t||t<=0){this.hide();return}this._tooltipHideTimer=setTimeout(()=>{this._tooltipHideTimer=null,this._pointerOverTooltip||this.hide()},t)},_onTriggerPointerLeave(){this._resetTooltipDismissal(),this._scheduleTooltipHide()},_onTriggerBlur(t){var e;t!=null&&t.relatedTarget&&((e=this._target)!=null&&e.contains(t.relatedTarget))||(this._resetTooltipDismissal(),this.hide())},_prepareRenderedTooltip(t){t.setAttribute("aria-hidden","true"),this._pointerOverTooltip=!1,L(this),t.addEventListener("mouseenter",()=>{this._pointerOverTooltip=!0,this._cancelTooltipHide()}),t.addEventListener("mouseleave",()=>{this._pointerOverTooltip=!1,this._scheduleTooltipHide()}),t.addEventListener("mousedown",()=>{this._pointerOverTooltip=!1,this.hide()})},_onTooltipTornDown(){this._cancelTooltipHide(),this._pointerOverTooltip=!1,E(this)}};/**
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
*/const f="nuxeo-tooltip-cloned-content-styles";function A(){if(document.getElementById(f))return;const t=document.createElement("style");t.id=f,t.textContent=`
    [data-nx-tooltip-role="resize-handle"].resize-handle-tooltip-label {
      display: block;
      max-width: 280px;
      white-space: normal;
      line-height: 1.4;
      text-align: start;
    }
  `,document.head.appendChild(t)}A();{class t extends v([D],Nuxeo.Element){static get template(){return _`
        <style>
          :host {
            display: none;
          }
        </style>

        <slot id="content"></slot>
      `}static get is(){return"nuxeo-tooltip"}static get properties(){return{for:String,position:{type:String,value:"bottom"},offset:{type:Number,value:14},animationDelay:{type:Number,value:500}}}constructor(){super(),this._showListener=this.show.bind(this),this._hideListener=this.hide.bind(this),this._pointerLeaveListener=this._onTriggerPointerLeave.bind(this),this._focusOutListener=this._onTriggerBlur.bind(this)}connectedCallback(){super.connectedCallback(),this._target=this.target,this._target&&(this._target.addEventListener("mouseenter",this._showListener),this._target.addEventListener("focusin",this._showListener),this._target.addEventListener("mouseleave",this._pointerLeaveListener),this._target.addEventListener("focusout",this._focusOutListener),this._target.addEventListener("tap",this._hideListener))}disconnectedCallback(){super.disconnectedCallback(),this._target&&(this.hide(),this._target.removeEventListener("mouseenter",this._showListener),this._target.removeEventListener("focusin",this._showListener),this._target.removeEventListener("mouseleave",this._pointerLeaveListener),this._target.removeEventListener("focusout",this._focusOutListener),this._target.removeEventListener("tap",this._hideListener)),this._target=null}show(){if(this._cancelTooltipHide(),!this.isTooltipDismissed()&&(this._syncTooltipDescription(),!this._tooltip&&!this.hidden)){this._tooltip=document.createElement("paper-tooltip"),document.body.appendChild(this._tooltip);const i=this.dataset.nxTooltipRole;this.$.content.assignedNodes().forEach(o=>{const n=o.cloneNode(!0);i&&n.nodeType===Node.ELEMENT_NODE&&!n.dataset.nxTooltipRole&&(n.dataset.nxTooltipRole=i),this._tooltip.appendChild(n)}),this._tooltip.manualMode=!0,this._tooltip._target=this._target,this._tooltip.animationDelay=this.animationDelay,this._tooltip.offset=this.offset,this._tooltip.position=this.position,this._tooltip.fitToVisibleBounds=!0,this._prepareRenderedTooltip(this._tooltip),T.run(()=>{this._tooltip&&typeof this._tooltip.show=="function"&&this._tooltip.show()})}}hide(){this._onTooltipTornDown(),this._tooltip&&(this._tooltip.hide(),this._tooltip.remove(),this._tooltip=null)}isShowing(){const i=this._tooltip;return i==null?!1:!!i._showing}updatePositionIfShowing(){this.isShowing()&&typeof this._tooltip.updatePosition=="function"&&this._tooltip.updatePosition()}keydown(i){if(!i){this._dismissTooltip();return}this._onTooltipDismissKey(i)}get target(){const{parentNode:i}=s(this),o=s(this).getOwnerRoot();let n;return this.for?n=s(o).querySelector(`#${this.for}`):n=i.nodeType===Node.DOCUMENT_FRAGMENT_NODE?o.host:i,n}}customElements.define(t.is,t),Nuxeo.Tooltip=t}
