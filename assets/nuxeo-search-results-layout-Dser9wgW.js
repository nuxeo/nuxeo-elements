import{m as u,h as i,c as n,p as h,d as a}from"./iframe-T5hUCbnt.js";import"./nuxeo-layout-CaN7sOfJ.js";import{a as m}from"./render-status-BJmzACxi.js";import{I as c}from"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
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
*/{class l extends u([c],Nuxeo.Element){static get template(){return i`
        <nuxeo-layout
          id="results"
          href="[[_resultsHref(searchName, hrefBase)]]"
          model="[[_resultsModel(searchName,nxProvider)]]"
          error="[[i18n('searchResults.layoutNotFound', searchName)]]"
          on-element-changed="_formChanged"
        ></nuxeo-layout>
      `}static get is(){return"nuxeo-search-results-layout"}static get importMeta(){return import.meta}static get properties(){return{searchName:String,nxProvider:HTMLElement,model:{type:Object,value(){return{}}},results:{type:Object,notify:!0},hrefBase:{type:String,value(){return n.get("layouts.search.hrefBase")}}}}get element(){return this.$.results&&this.$.results.element}fetch(){if(this.results)this.results.fetch();else return Promise.resolve()}reset(){this.results&&this.results.reset()}_resultsHref(e,t){if(!e)return"";const r=e.toLowerCase();return`${t||h(this.__dataHost.importPath||this.importPath)}${r}/${["nuxeo",r,"search-results"].join("-")}.html`}_resultsModel(){return{nxProvider:this.nxProvider,name:this.searchName}}_formChanged(e){m(this,()=>{this.results=e.detail.value&&this._grabResults([e.detail.value])})}_grabResults(e){if(!Array.isArray(e)||e.length===0)return;let t,r;for(t=0;t<e.length;t++){r=e[t];let o=a(r).querySelector("nuxeo-results");if(!o&&r.root&&(o=a(r.root).querySelector("nuxeo-results")),o)return o}let s=[];for(t=0;t<e.length;t++)r=e[t],r.root&&(s=[].concat.apply(s,s.concat(a(r.root).querySelectorAll("*"))));return this._grabResults(s)}}customElements.define(l.is,l)}
