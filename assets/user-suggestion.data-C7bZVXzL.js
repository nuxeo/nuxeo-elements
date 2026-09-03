import{P as s,h as o,m as n}from"./iframe-T5hUCbnt.js";import{I as p,a as l}from"./iron-validatable-behavior-DVOrdGp7.js";import"./iron-flex-layout-CQAobW0V.js";import"./iron-image-BFdhxKpa.js";import"./paper-material-styles-B1vejkc1.js";import"./default-theme-RhyFn9QU.js";import{e as i}from"./nuxeo-selectivity-BuHqhYsn.js";import"./iron-icon-lX3uy4jx.js";import{I as d}from"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./nuxeo-icons-DihWRFWD.js";import"./nuxeo-user-avatar-Bs_vnqG5.js";/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/s({_template:o`
    <style include="paper-material-styles">
      :host {
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        background-color: var(--paper-card-background-color, var(--primary-background-color));
        border-radius: 2px;

        @apply --paper-font-common-base;
        @apply --paper-card;
      }

      /* IE 10 support for HTML5 hidden attr */
      :host([hidden]), [hidden] {
        display: none !important;
      }

      .header {
        position: relative;
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        overflow: hidden;

        @apply --paper-card-header;
      }

      .header iron-image {
        display: block;
        width: 100%;
        --iron-image-width: 100%;
        pointer-events: none;

        @apply --paper-card-header-image;
      }

      .header .title-text {
        padding: 16px;
        font-size: 24px;
        font-weight: 400;
        color: var(--paper-card-header-color, #000);

        @apply --paper-card-header-text;
      }

      .header .title-text.over-image {
        position: absolute;
        bottom: 0px;

        @apply --paper-card-header-image-text;
      }

      :host ::slotted(.card-content) {
        padding: 16px;
        position:relative;

        @apply --paper-card-content;
      }

      :host ::slotted(.card-actions) {
        border-top: 1px solid #e8e8e8;
        padding: 5px 16px;
        position:relative;

        @apply --paper-card-actions;
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
    </style>

    <div class="header">
      <iron-image hidden\$="[[!image]]" aria-hidden\$="[[_isHidden(image)]]" src="[[image]]" alt="[[alt]]" placeholder="[[placeholderImage]]" preload="[[preloadImage]]" fade="[[fadeImage]]"></iron-image>
      <div hidden\$="[[!heading]]" class\$="title-text [[_computeHeadingClass(image)]]">[[heading]]</div>
    </div>

    <slot></slot>
`,is:"paper-card",properties:{heading:{type:String,value:"",observer:"_headingChanged"},image:{type:String,value:""},alt:{type:String},preloadImage:{type:Boolean,value:!1},fadeImage:{type:Boolean,value:!1},placeholderImage:{type:String,value:null},elevation:{type:Number,value:1,reflectToAttribute:!0},animatedShadow:{type:Boolean,value:!1},animated:{type:Boolean,reflectToAttribute:!0,readOnly:!0,computed:"_computeAnimated(animatedShadow)"}},_isHidden:function(t){return t?"false":"true"},_headingChanged:function(t){var a=this.getAttribute("heading"),e=this.getAttribute("aria-label");(typeof e!="string"||e===a)&&this.setAttribute("aria-label",t)},_computeHeadingClass:function(t){return t?" over-image":""},_computeAnimated:function(t){return t}});/**
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
*/{class t extends n([d],Nuxeo.Element){static get template(){return o`
        <style>
          #container {
            @apply --layout-horizontal;
            @apply --layout-center;
            font-size: 11px;
            line-height: 14px;
          }

          nuxeo-user-avatar,
          iron-icon {
            margin-right: 8px;
          }

          .header {
            font-weight: 700;
          }

          .preserve-white-space {
            white-space: pre;
          }
        </style>

        <div id="container">
          <dom-if if="[[_isUser(entity)]]">
            <template>
              <nuxeo-user-avatar user="[[entity]]" height="24" width="24" border-radius="50" font-size="11">
              </nuxeo-user-avatar>
            </template>
          </dom-if>

          <dom-if if="[[_isGroup(entity)]]">
            <template>
              <iron-icon icon="nuxeo:group"></iron-icon>
            </template>
          </dom-if>

          <div>
            <div class="header preserve-white-space">[[entity.displayLabel]]</div>
            <div>
              <span class="preserve-white-space">[[_computeInfo(entity)]]</span>
            </div>
          </div>
        </div>
      `}static get is(){return"nuxeo-user-group-formatter"}static get properties(){return{entity:{type:Object}}}_isUser(){return this.entity.type==="USER_TYPE"}_isGroup(){return this.entity.type==="GROUP_TYPE"}_computeInfo(){return this._isUser()?`${this.entity.email} - ${this.entity.id}`:`${this.i18n("label.group")} - ${this.entity.id}`}}customElements.define(t.is,t)}/**
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
*/{class t extends n([p,l],Nuxeo.Element){static get template(){return o`
        <style>
          :host {
            display: block;
          }

          :host([hidden]) {
            display: none;
          }
        </style>

        <nuxeo-selectivity
          id="s2"
          operation="[[operation]]"
          label="[[label]]"
          min-chars="[[minChars]]"
          frequency="[[frequency]]"
          multiple="[[multiple]]"
          params="[[_computeParams(params.*, searchType, groupRestriction)]]"
          placeholder="[[placeholder]]"
          error-message="[[errorMessage]]"
          readonly="[[readonly]]"
          value="{{value}}"
          selected-items="{{selectedItems}}"
          selected-item="{{selectedItem}}"
          required="[[required]]"
          invalid="{{invalid}}"
          selection-formatter="[[selectionFormatter]]"
          result-formatter="[[resultFormatter]]"
          resolve-entry="[[resolveEntry]]"
          id-function="[[idFunction]]"
          query-results-filter="[[queryResultsFilter]]"
          stay-open-on-select="[[stayOpenOnSelect]]"
        >
        </nuxeo-selectivity>
      `}static get is(){return"nuxeo-user-suggestion"}static get properties(){return{searchType:{type:String,value:"USER_GROUP_TYPE"},groupRestriction:{type:String},label:String,operation:{type:String,value:"UserGroup.Suggestion"},params:Object,value:{type:String,notify:!0},multiple:{type:Boolean,value:!1},stayOpenOnSelect:{type:Boolean,value:!1},readonly:{type:Boolean,value:!1},minChars:{type:Number,value:3},frequency:Number,placeholder:String,errorMessage:String,selectedItems:{type:Array,notify:!0},selectedItem:{type:Object,notify:!0},selectionFormatter:{type:Function,value(){return this._selectionFormatter.bind(this)}},resultFormatter:{type:Function,value(){return this._resultFormatter.bind(this)}},resolveEntry:{type:Function,value(){return this._resolveEntry.bind(this)}},prefixed:Boolean,idFunction:{type:Function,value(){return this._idFunction.bind(this)}},queryResultsFilter:Function}}_getValidity(){return this.$.s2._getValidity()}_computeParams(){return Object.assign({},{searchType:this.searchType,groupRestriction:this.groupRestriction},this.params)}_selectionFormatter(e){let r;return e&&(e["entity-type"]==="user"&&e.properties&&e.properties.firstName&&e.properties.lastName?r=`${e.properties.firstName} ${e.properties.lastName}`:e["entity-type"]==="group"?r=e.grouplabel?e.grouplabel:e.groupname:e.displayLabel?r=e.displayLabel:r=e.id?e.id:e),`<span class="preserve-white-space">${i(r)}</span>`}_resultFormatter(e){return e.type&&(e.type==="USER_TYPE"||e.type==="GROUP_TYPE")?`<nuxeo-user-group-formatter entity='${i(JSON.stringify(e))}'></nuxeo-user-group-formatter>`:i(e.displayLabel||e.title)}_resolveEntry(e){return e&&e["entity-type"]?e:this.prefixed?{id:e,displayLabel:e,prefixed_id:e}:{id:e,displayLabel:e}}_idFunction(e){return this.prefixed?e.prefixed_id?e.prefixed_id:`${e["entity-type"]}:${e.id}`:e.id}}customElements.define(t.is,t),Nuxeo.UserSuggestion=t}const S=[{company:"",displayIcon:!0,displayLabel:"Administrator",email:"devnull@nuxeo.com","entity-type":"user",firstName:"",groups:[],id:"Administrator",lastName:"",prefixed_id:"user:Administrator",tenantId:null,type:"USER_TYPE",username:"Administrator"},{company:"",displayIcon:!0,displayLabel:"jdoe",email:"devnull@nuxeo.com","entity-type":"user",firstName:"",groups:[],id:"jdoe",lastName:"",prefixed_id:"user:Administrator",tenantId:null,type:"USER_TYPE",username:"jdoe"},{company:"",displayIcon:!0,displayLabel:"Bob Jones",email:"bob@jones.com","entity-type":"user",firstName:"Bob",groups:[],id:"bobJones",lastName:"Jones",prefixed_id:"user:bjones",tenantId:null,type:"USER_TYPE",username:"bjones"}];export{S as U};
