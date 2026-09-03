import{h as e,m as o}from"./iframe-T5hUCbnt.js";import"./paper-icon-button-BQJYUoC5.js";import{I as n}from"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./nuxeo-input-ALfz038W.js";import"./nuxeo-tooltip-BrXDqAUB.js";/**
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
*/const i=e`
  <dom-module id="nuxeo-action-button-styles">
    <template>
      <style>
        :host {
          display: inline-block;
        }

        .label {
          @apply --nuxeo-action-button-label;
        }

        .action {
          @apply --layout-horizontal;
          @apply --layout-center;
          cursor: pointer;
          @apply --nuxeo-action-button;
        }
      </style>
    </template>
  </dom-module>
`;document.head.appendChild(i.content);/**
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
*/{class t extends o([n],Nuxeo.Element){static get template(){return e`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          .action {
            text-decoration: none;
            color: var(--nuxeo-text-default);
          }
        </style>

        <template is="dom-if" if="[[_isAvailable(href, icon, iconSrc)]]">
          <a class="action" href="[[href]]" target="[[target]]">
            <paper-icon-button src="[[iconSrc]]" icon="[[icon]]" noink aria-labelledby="label"></paper-icon-button>
            <span class="label" hidden$="[[!showLabel]]" id="label">[[i18n(label)]]</span>
            <nuxeo-tooltip>[[i18n(label)]]</nuxeo-tooltip>
          </a>
        </template>
      `}static get is(){return"nuxeo-link-button"}static get properties(){return{href:String,target:String,iconSrc:String,icon:String,showLabel:{type:Boolean,value:!1},label:String}}_isAvailable(){return this.href&&(this.icon||this.iconSrc)}}customElements.define(t.is,t),Nuxeo.LinkButton=t}
