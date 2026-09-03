import{m as i,R as o,h as n,c as m,p as g}from"./iframe-T5hUCbnt.js";import{a as h}from"./render-status-BJmzACxi.js";import"./nuxeo-layout-CaN7sOfJ.js";import{I as l}from"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
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
*/{class a extends i([l,o],Nuxeo.Element){static get template(){return n`
        <nuxeo-layout
          id="layout"
          href="[[_formHref(provider, searchName, hrefBase)]]"
          model="[[_formModel(provider, aggregations, params)]]"
          error="[[i18n('documentSearchForm.layoutNotFound', searchName)]]"
          on-element-changed="_formChanged"
        ></nuxeo-layout>
      `}static get is(){return"nuxeo-search-form-layout"}static get importMeta(){return import.meta}static get properties(){return{provider:String,searchName:String,params:{type:Object,notify:!0},skipAggregates:{type:Boolean,notify:!0},aggregations:{type:Object,observer:"_aggregationsChanged"},model:{type:Object,value(){return{}}},hrefBase:{type:String,value(){return m.get("layouts.search.hrefBase")}}}}static get observers(){return["_paramsChanged(params.*)"]}get element(){return this.$.layout.element}_paramsChanged(){this.element&&(this.element.params=this.params)}_aggregationsChanged(){this.element&&(this.element.aggregations=this.aggregations)}_formHref(t,e,s){if(t==null)return"";const r=(e||t).toLowerCase();return`${s||g(this.__dataHost.importPath||this.importPath)}${r}/${["nuxeo",r,"search-form"].join("-")}.html`}_formModel(){return{provider:this.provider,params:this.params,aggregations:this.aggregations}}_formChanged(t){h(this,()=>{this.dispatchEvent(new CustomEvent("search-form-layout-changed",{composed:!0,bubbles:!0,detail:t.detail})),this.element.addEventListener("params-changed",e=>{this.notifyPath(e.detail.path||"params",e.detail.value)}),this.skipAggregates=this.element.skipAggregates,this.element.addEventListener("skip-aggregates-changed",e=>{this.notifyPath(e.detail.path||"skipAggregates",e.detail.value)})})}}customElements.define(a.is,a)}
