import{h as l}from"./iframe-T5hUCbnt.js";/**
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
*/const a=l`
  <dom-module id="nuxeo-drag-proxy">
    <template>
      <style>
        :host {
          display: inline-block;
          position: absolute;
        }

        :host([hidden]) {
          display: none !important;
        }

        span {
          background-color: var(--nuxeo-primary-color);
          border-radius: 50%;
          color: white;
          display: inline-block;
          font-size: 10px;
          margin: 7px;
          text-align: center;
          line-height: 16px;
          height: 16px;
          width: 16px;
        }
      </style>

      <span>[[counter]]</span>
    </template>
  </dom-module>
`;document.head.appendChild(a.content);const u={properties:{draggable:{type:Boolean,value:!1,reflectToAttribute:!0},dropTargetFilter:{type:Function,value(){return this.dropTargetFilter.bind(this)}},draggableFilter:{type:Function,value(){return this.draggableFilter.bind(this)}}},attached(){let t;const r=document.querySelector("body"),i=e=>{new Date().getTime()-this._mouseDownStarted<=150||(this.style.pointerEvents="none",r.setAttribute("style","cursor: grabbing; cursor: -webkit-grabbing;"),t||(t=document.createElement("nuxeo-drag-proxy"),t.counter=this.selectedItems.length,r.appendChild(t)),t.setPosition(e.pageX,e.pageY),t.hidden=!1,this._scrollList(e),this.target=null,this.droptargets.forEach(n=>{n.classList.remove("droptarget-hover");const s=n.getBoundingClientRect();e.clientX>s.left&&e.clientX<s.right&&e.clientY>s.top&&e.clientY<s.bottom&&(this.target=n)}),this.target&&(this.selectedItems.indexOf(this.modelForElement(this.target).item)>-1?(this.target=null,t.hidden=!0,r.style.cursor="not-allowed"):this.target.classList.add("droptarget-hover")))},o=()=>{this._mouseDownStarted=null,this.style.pointerEvents="",r.style.cursor="",t&&(r.removeChild(t),t=null),document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",o),this.target&&(this.target.classList.remove("droptarget-hover"),this.fire("nuxeo-documents-dropped",{targetDocument:this.modelForElement(this.target).item,documents:this.selectedItems}),this.target=null)};this.addEventListener("mousedown",e=>{this.draggable&&e.target&&this.draggableFilter(e.target)&&(e.preventDefault(),this._mouseDownStarted=this._mouseDownStarted||new Date().getTime(),document.addEventListener("mousemove",i),document.addEventListener("mouseup",o))})},get droptargets(){return Array.from(this.$.list.queryAllEffectiveChildren("*")).filter(t=>this.dropTargetFilter(t,this.modelForElement(t)))},dropTargetFilter(){return!0},draggableFilter(){return!0},_scrollList(t){const r=this.$.list,i=100,o=r.getBoundingClientRect(),e=30;o.bottom-t.pageY<=i?r.scrollTop+=e:t.pageY>=o.top&&t.pageY<=o.top+i&&(r.scrollTop-=e)}};{class t extends Nuxeo.Element{static get is(){return"nuxeo-drag-proxy"}static get properties(){return{counter:Number}}setPosition(i,o){this.style.left=`${i}px`,this.style.top=`${o}px`}}customElements.define(t.is,t),Nuxeo.DragProxy=t}export{u as D};
