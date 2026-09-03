import{P as u,d as a,h as d,a as c}from"./iframe-T5hUCbnt.js";/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/u({_template:d`
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
`,is:"paper-tooltip",hostAttributes:{role:"tooltip",tabindex:-1},properties:{for:{type:String,observer:"_findTarget"},manualMode:{type:Boolean,value:!1,observer:"_manualModeChanged"},position:{type:String,value:"bottom"},fitToVisibleBounds:{type:Boolean,value:!1},offset:{type:Number,value:14},marginTop:{type:Number,value:14},animationDelay:{type:Number,value:500,observer:"_delayChange"},animationEntry:{type:String,value:""},animationExit:{type:String,value:""},animationConfig:{type:Object,value:function(){return{entry:[{name:"fade-in-animation",node:this,timing:{delay:0}}],exit:[{name:"fade-out-animation",node:this}]}}},_showing:{type:Boolean,value:!1}},listeners:{webkitAnimationEnd:"_onAnimationEnd"},get target(){var t=a(this).parentNode,e=a(this).getOwnerRoot(),i;return this.for?i=a(e).querySelector("#"+this.for):i=t.nodeType==Node.DOCUMENT_FRAGMENT_NODE?e.host:t,i},attached:function(){this._findTarget()},detached:function(){this.manualMode||this._removeListeners()},playAnimation:function(t){t==="entry"?this.show():t==="exit"&&this.hide()},cancelAnimation:function(){this.$.tooltip.classList.add("cancel-animation")},show:function(){if(!this._showing){if(a(this).textContent.trim()===""){for(var t=!0,e=a(this).getEffectiveChildNodes(),i=0;i<e.length;i++)if(e[i].textContent.trim()!==""){t=!1;break}if(t)return}this._showing=!0,this.$.tooltip.classList.remove("hidden"),this.$.tooltip.classList.remove("cancel-animation"),this.$.tooltip.classList.remove(this._getAnimationType("exit")),this.updatePosition(),this._animationPlaying=!0,this.$.tooltip.classList.add(this._getAnimationType("entry"))}},hide:function(){if(this._showing){if(this._animationPlaying){this._showing=!1,this._cancelAnimation();return}else this._onAnimationFinish();this._showing=!1,this._animationPlaying=!0}},updatePosition:function(){if(!(!this._target||!this.offsetParent)){var t=this.offset;this.marginTop!=14&&this.offset==14&&(t=this.marginTop);var e=this.offsetParent.getBoundingClientRect(),i=this._target.getBoundingClientRect(),o=this.getBoundingClientRect(),n=(i.width-o.width)/2,p=(i.height-o.height)/2,h=i.left-e.left,l=i.top-e.top,s,r;switch(this.position){case"top":s=h+n,r=l-o.height-t;break;case"bottom":s=h+n,r=l+i.height+t;break;case"left":s=h-o.width-t,r=l+p;break;case"right":s=h+i.width+t,r=l+p;break}this.fitToVisibleBounds?(e.left+s+o.width>window.innerWidth?(this.style.right="0px",this.style.left="auto"):(this.style.left=Math.max(0,s)+"px",this.style.right="auto"),e.top+r+o.height>window.innerHeight?(this.style.bottom=e.height-l+t+"px",this.style.top="auto"):(this.style.top=Math.max(-e.top,r)+"px",this.style.bottom="auto")):(this.style.left=s+"px",this.style.top=r+"px")}},_addListeners:function(){this._target&&(this.listen(this._target,"mouseenter","show"),this.listen(this._target,"focus","show"),this.listen(this._target,"mouseleave","hide"),this.listen(this._target,"blur","hide"),this.listen(this._target,"tap","hide")),this.listen(this.$.tooltip,"animationend","_onAnimationEnd"),this.listen(this,"mouseenter","hide")},_findTarget:function(){this.manualMode||this._removeListeners(),this._target=this.target,this.manualMode||this._addListeners()},_delayChange:function(t){t!==500&&this.updateStyles({"--paper-tooltip-delay-in":t+"ms"})},_manualModeChanged:function(){this.manualMode?this._removeListeners():this._addListeners()},_cancelAnimation:function(){this.$.tooltip.classList.remove(this._getAnimationType("entry")),this.$.tooltip.classList.remove(this._getAnimationType("exit")),this.$.tooltip.classList.remove("cancel-animation"),this.$.tooltip.classList.add("hidden")},_onAnimationFinish:function(){this._showing&&(this.$.tooltip.classList.remove(this._getAnimationType("entry")),this.$.tooltip.classList.remove("cancel-animation"),this.$.tooltip.classList.add(this._getAnimationType("exit")))},_onAnimationEnd:function(){this._animationPlaying=!1,this._showing||(this.$.tooltip.classList.remove(this._getAnimationType("exit")),this.$.tooltip.classList.add("hidden"))},_getAnimationType:function(t){if(t==="entry"&&this.animationEntry!=="")return this.animationEntry;if(t==="exit"&&this.animationExit!=="")return this.animationExit;if(this.animationConfig[t]&&typeof this.animationConfig[t][0].name=="string"){if(this.animationConfig[t][0].timing&&this.animationConfig[t][0].timing.delay&&this.animationConfig[t][0].timing.delay!==0){var e=this.animationConfig[t][0].timing.delay;t==="entry"?this.updateStyles({"--paper-tooltip-delay-in":e+"ms"}):t==="exit"&&this.updateStyles({"--paper-tooltip-delay-out":e+"ms"})}return this.animationConfig[t][0].name}},_removeListeners:function(){this._target&&(this.unlisten(this._target,"mouseenter","show"),this.unlisten(this._target,"focus","show"),this.unlisten(this._target,"mouseleave","hide"),this.unlisten(this._target,"blur","hide"),this.unlisten(this._target,"tap","hide")),this.unlisten(this.$.tooltip,"animationend","_onAnimationEnd"),this.unlisten(this,"mouseenter","hide")}});/**
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
*/const m="nuxeo-tooltip-cloned-content-styles";function f(){if(document.getElementById(m))return;const t=document.createElement("style");t.id=m,t.textContent=`
    [data-nx-tooltip-role="resize-handle"].resize-handle-tooltip-label {
      display: block;
      max-width: 280px;
      white-space: normal;
      line-height: 1.4;
      text-align: start;
    }
  `,document.head.appendChild(t)}f();{class t extends Nuxeo.Element{static get template(){return d`
        <style>
          :host {
            display: none;
          }
        </style>

        <slot id="content"></slot>
      `}static get is(){return"nuxeo-tooltip"}static get properties(){return{for:String,position:{type:String,value:"bottom"},offset:{type:Number,value:14},animationDelay:{type:Number,value:500}}}constructor(){super(),this._showListener=this.show.bind(this),this._hideListener=this.hide.bind(this),this._keyListener=this.keydown.bind(this)}connectedCallback(){super.connectedCallback(),this._target=this.target,this._target&&(this._target.addEventListener("mouseenter",this._showListener),this._target.addEventListener("focus",this._showListener),this._target.addEventListener("mouseleave",this._hideListener),this._target.addEventListener("blur",this._hideListener),this._target.addEventListener("tap",this._hideListener),window.addEventListener("keydown",this._keyListener))}disconnectedCallback(){super.disconnectedCallback(),this._target&&(this.hide(),this._target.removeEventListener("mouseenter",this._showListener),this._target.removeEventListener("focus",this._showListener),this._target.removeEventListener("mouseleave",this._hideListener),this._target.removeEventListener("blur",this._hideListener),this._target.removeEventListener("tap",this._hideListener),window.removeEventListener("keydown",this._keyListener)),this._target=null}show(){if(!this._tooltip&&!this.hidden){this._tooltip=document.createElement("paper-tooltip"),document.body.appendChild(this._tooltip);const i=this.dataset.nxTooltipRole;this.$.content.assignedNodes().forEach(o=>{const n=o.cloneNode(!0);i&&n.nodeType===Node.ELEMENT_NODE&&!n.dataset.nxTooltipRole&&(n.dataset.nxTooltipRole=i),this._tooltip.appendChild(n)}),this._tooltip.manualMode=!0,this._tooltip._target=this._target,this._tooltip.animationDelay=this.animationDelay,this._tooltip.offset=this.offset,this._tooltip.position=this.position,this._tooltip.fitToVisibleBounds=!0,c.run(()=>{this._tooltip&&typeof this._tooltip.show=="function"&&this._tooltip.show()})}}hide(){this._tooltip&&(this._tooltip.hide(),this._tooltip.remove(),this._tooltip=null)}isShowing(){const i=this._tooltip;return i==null?!1:!!i._showing}updatePositionIfShowing(){this.isShowing()&&typeof this._tooltip.updatePosition=="function"&&this._tooltip.updatePosition()}keydown(){this.hide()}get target(){const{parentNode:i}=a(this),o=a(this).getOwnerRoot();let n;return this.for?n=a(o).querySelector(`#${this.for}`):n=i.nodeType===Node.DOCUMENT_FRAGMENT_NODE?o.host:i,n}}customElements.define(t.is,t),Nuxeo.Tooltip=t}
