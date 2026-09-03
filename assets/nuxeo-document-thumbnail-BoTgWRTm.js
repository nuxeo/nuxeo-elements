import{m as r,h as n}from"./iframe-T5hUCbnt.js";import{I as o}from"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
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
*/{class e extends r([o],Nuxeo.Element){static get template(){return n`
        <style>
          :host {
            height: 32px;
            width: 32px;
            display: inline-block;
            position: relative;
            flex: none;
          }

          img {
            height: auto;
            width: auto;
            max-height: 100%;
            max-width: 100%;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto 8px auto auto;
            box-sizing: border-box;
            border-radius: 3px;
            filter: brightness(1.2);
            -webkit-filter: brightness(1.2);
          }
          :host([dir='rtl']) img {
            margin: auto auto auto 8px;
          }
        </style>

        <img id="img" crossorigin="anonymous" src="[[_thumbnail(document)]]" on-error="_error" alt$="[[alt]]" />
      `}static get is(){return"nuxeo-document-thumbnail"}static get properties(){return{document:Object,alt:{type:String,value:""}}}connectedCallback(){if(super.connectedCallback(),!this.hasAttribute("dir")){const t=document.documentElement.getAttribute("dir");this.setAttribute("dir",t)}}_thumbnail(t){if(t&&t.uid&&t.contextParameters&&t.contextParameters.thumbnail&&t.contextParameters.thumbnail.url){if(!this.isFollowRedirectEnabled()){const i=t.contextParameters.thumbnail.url.indexOf("?")>-1?"&":"?";t.contextParameters.thumbnail.url=`${t.contextParameters.thumbnail.url}${i}clientReason=view`}return t.contextParameters.thumbnail.url}return""}_error(){this.$.img.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="}_title(t){return t&&t.title?this.i18n("accessibility.thumbnail",t.title):""}isFollowRedirectEnabled(){const t=Nuxeo&&Nuxeo.UI&&Nuxeo.UI.config&&Nuxeo.UI.config.url&&Nuxeo.UI.config.url.followRedirect;return t?String(t).toLowerCase()==="true":!1}}customElements.define(e.is,e),Nuxeo.DocumentThumbnail=e}
