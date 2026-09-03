import{m as n,h as d,b as a}from"./iframe-T5hUCbnt.js";import{I as s}from"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./iron-flex-layout-CQAobW0V.js";import"./nuxeo-card-Cqn4D2dR.js";import{D as l}from"./documents.data-BM_UplYo.js";import{v as m}from"./video.data-CMPyVxCS.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-collapse-Q03AhJj8.js";import"./iron-resizable-behavior-BJTBE6_U.js";import"./iron-icon-lX3uy4jx.js";import"./iron-iconset-svg-bEbhiue4.js";import"./v4-BT9YOjd5.js";/**
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
*/{class e extends n([s],Nuxeo.Element){static get template(){return d`
        <style>
          .properties label {
            @apply --nuxeo-label;
            min-width: 10rem;
            margin-inline-end: 12px;
          }

          .properties .item {
            @apply --layout-horizontal;
            @apply --layout-flex;
            line-height: 2.2rem;
          }
        </style>
        <div class="properties">
          <div class="item">
            <label>[[i18n('videoViewLayout.format')]]</label>
            <div>[[document.properties.vid:info.format]]</div>
          </div>
          <div class="item">
            <label>[[i18n('videoViewLayout.duration')]]</label>
            <div>[[document.properties.vid:info.duration]]</div>
          </div>
          <div class="item">
            <label>[[i18n('videoViewLayout.width')]]</label>
            <div>[[document.properties.vid:info.width]]</div>
          </div>
          <div class="item">
            <label>[[i18n('videoViewLayout.height')]]</label>
            <div>[[document.properties.vid:info.height]]</div>
          </div>
          <div class="item">
            <label>[[i18n('videoViewLayout.frameRate')]]</label>
            <div>[[document.properties.vid:info.frameRate]]</div>
          </div>
        </div>
      `}static get is(){return"nuxeo-video-info"}static get properties(){return{document:Object}}}customElements.define(e.is,e)}const L={title:"UI/nuxeo-video"},i={render:()=>{const e=new l().setType("File").setProperties({"vid:info":m["vid:info"]}).build();return a`
      <nuxeo-card>
        <nuxeo-video-info .document="${e}"></nuxeo-video-info>
      </nuxeo-card>
    `}};var o,t,r;i.parameters={...i.parameters,docs:{...(o=i.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => {
    const document = new DocumentBuilder().setType('File').setProperties({
      'vid:info': videoProperties['vid:info']
    }).build();
    return html\`
      <nuxeo-card>
        <nuxeo-video-info .document="\${document}"></nuxeo-video-info>
      </nuxeo-card>
    \`;
  }
}`,...(r=(t=i.parameters)==null?void 0:t.docs)==null?void 0:r.source}}};const B=["NuxeoVideoInfo"];export{i as NuxeoVideoInfo,B as __namedExportsOrder,L as default};
