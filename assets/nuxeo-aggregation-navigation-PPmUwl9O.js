import{m as a,h as l}from"./iframe-T5hUCbnt.js";import{I as u}from"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
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
*/{class s extends a([u],Nuxeo.Element){static get template(){return l`
        <style>
          :host {
            display: block;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            width: 80px;
          }

          #keys {
            visibility: hidden;
            position: relative;
            height: calc(100% - 32px);
          }

          .key {
            position: absolute;
            right: 0;
            width: 64px;
            color: black;
            margin: 0;
            padding: 0 8px 0 0;
            font-size: 0.7rem;
            text-overflow: ellipsis;
            white-space: nowrap;
            pointer-events: all;
            text-align: right;
            cursor: ns-resize;
          }

          #cursor {
            display: none;
            position: absolute;
            right: 0;
            width: 56px;
            height: 2px;
            background: rgba(0, 0, 0, 0.15);
            pointer-events: none;
          }

          #cursor .label {
            position: absolute;
            right: 56px;
            top: -14px;
            white-space: nowrap;
            text-align: center;
            background: black;
            color: white;
            padding: 6px 8px;
            font-size: 0.8rem;
            font-weight: bold;
            border-radius: 4px;
            min-width: 64px;
          }
        </style>

        <div id="keys" on-mouseout="_mouseOut" on-click="_tap">
          <dom-repeat items="[[_keys]]" as="key">
            <template>
              <div
                class="key"
                on-mousemove="_mouseMove"
                style$="top: [[key.top]]px; height: [[key.height]]px; color: [[_color(key.visible)]];"
              >
                [[_label(key)]]
              </div>
            </template>
          </dom-repeat>
          <div id="cursor">
            <div class="label">[[_cursorLabel]]</div>
          </div>
        </div>
      `}static get is(){return"nuxeo-aggregation-navigation"}static get properties(){return{buckets:{type:Array,value:[],observer:"_bucketsChanged"},granularity:{type:Number,value:30},opacity:{type:Number,value:.85},_keys:{type:Array,value:[]},_count:{type:Number,value:0},_cursorIndex:{type:Number,value:0},_cursorLabel:{type:String,value:""},_rect:{type:Object,value:{top:0,right:0,left:0,bottom:0}}}}connectedCallback(){super.connectedCallback(),this.addEventListener("mouseover",()=>{this._visibility(!0)}),this.addEventListener("mouseout",()=>{this._visibility(!1)})}_visibility(e){this.$.keys.style.visibility=e?"visible":"hidden",this.style.background=e?"rgba(255, 255, 255, 0.85)":"transparent"}_label(e){return this.i18n(e.name)}_bucketsChanged(e){this._rect=this.$.keys.getBoundingClientRect(),this._count=0,e.forEach(i=>{this._count+=i.docCount}),this.style.opacity=this._count?this.opacity:0,this.set("_keys",[]);let t=1,{granularity:o}=this;e.forEach(i=>{let r=!1;o>=this.granularity&&(r=!0,o=0);const n=i.docCount*(this._rect.height/this._count);this.push("_keys",{name:i.key,offset:t,size:i.docCount,top:t*this._rect.height/this._count,height:n,visible:r}),t+=i.docCount,o+=n})}_tap(){this.dispatchEvent(new CustomEvent("scroll-to",{composed:!0,bubbles:!0,detail:{index:this._cursorIndex}}))}_mouseMove(e){const t=e.y-this._rect.top;this.$.cursor.style.display="block",this.$.cursor.style.top=`${t}px`,this._cursorIndex=Math.round(this._count*t/this._rect.height),this._cursorLabel=this._label(e.model.key)}_mouseOut(){this.$.cursor.style.display="none"}_color(e){return e?"black":"transparent"}}customElements.define(s.is,s),Nuxeo.AggregationNavigation=s}
