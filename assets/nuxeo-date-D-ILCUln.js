import{m as r,h as m,c as n}from"./iframe-T5hUCbnt.js";import{F as s}from"./nuxeo-format-behavior-qyIFGuqE.js";import{I as p}from"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./nuxeo-tooltip-BrXDqAUB.js";/**
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
*/{class t extends r([p,s],Nuxeo.Element){static get template(){return m`
        <span id="datetime" hidden$="[[!datetime]]">[[formatDate(datetime, format, timezone)]]</span>
        <nuxeo-tooltip for="datetime" hidden$="[[_producesSameDateFormat(datetime, format, tooltipFormat, timezone)]]">
          [[formatDateTime(datetime, tooltipFormat, timezone)]]
        </nuxeo-tooltip>
      `}static get is(){return"nuxeo-date"}static get properties(){return{datetime:{type:String},format:String,tooltipFormat:String,timezone:{type:String,value(){return n.get("timezone")}}}}_producesSameDateFormat(e,a,i,o){return this.formatDate(e,a,o)===this.formatDateTime(e,i,o)}}customElements.define(t.is,t),Nuxeo.Date=t}
