import{m as s,h as d,b as l}from"./iframe-T5hUCbnt.js";import"./iron-flex-layout-CQAobW0V.js";import{F as p}from"./nuxeo-format-behavior-qyIFGuqE.js";import{I as m}from"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./nuxeo-icons-DihWRFWD.js";import"./nuxeo-tooltip-BrXDqAUB.js";import"./nuxeo-card-Cqn4D2dR.js";import{D as c}from"./documents.data-BM_UplYo.js";import{v as u}from"./video.data-CMPyVxCS.js";import"./preload-helper-Dp1pzeXC.js";import"./moment-with-locales-v-Wg38Ha.js";import"./iron-iconset-svg-bEbhiue4.js";import"./iron-collapse-Q03AhJj8.js";import"./iron-resizable-behavior-BJTBE6_U.js";import"./iron-icon-lX3uy4jx.js";import"./v4-BT9YOjd5.js";/**
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
*/{class e extends s([m,p],Nuxeo.Element){static get template(){return d`
        <style>
          a,
          a:active,
          a:visited,
          a:focus {
            @apply --nuxeo-link;
          }
          .properties label {
            @apply --nuxeo-label;
            min-width: 10rem;
            margin-inline-end: 12px;
          }
          .properties .item {
            @apply --layout-horizontal;
            @apply --layout-flex;
            @apply --layout-justified;
            line-height: 2.2rem;
          }
          .properties .item > * {
            unicode-bidi: plaintext;
          }
          .properties .item span {
            flex: 1;
            text-align: left;
          }
        </style>
        <dom-if if="[[label]]">
          <template>
            <h3>[[label]]</h3>
          </template>
        </dom-if>
        <div class="properties">
          <dom-repeat items="[[document.properties.vid:transcodedVideos]]" as="conversion">
            <dom-if if="[[conversion.content]]">
              <template>
                <div class="item">
                  <label>[[conversion.name]]</label>
                  <span>[[conversion.info.width]] x [[conversion.info.height]]</span>
                  <span>[[formatSize(conversion.content.length)]]</span>

                  <a href="[[_getDownloadUrl(conversion)]]" aria-label="[[conversion.name]] download">
                    <iron-icon icon="nuxeo:download" aria-hidden="true"></iron-icon>
                    <nuxeo-tooltip>[[i18n('videoViewLayout.download.tooltip')]]</nuxeo-tooltip>
                  </a>
                </div>
              </template>
            </dom-if>
          </dom-repeat>
        </div>
      `}static get is(){return"nuxeo-video-conversions"}static get properties(){return{document:Object,label:String}}_getDownloadUrl(n){return n.content.downloadUrl?n.content.downloadUrl:n.content.data}}customElements.define(e.is,e)}const $={title:"UI/nuxeo-video"},o={args:{label:"Video Conversion"},render:e=>{const t=new c().setType("File").setProperties({"vid:transcodedVideos":u["vid:transcodedVideos"]}).build();return l`
      <nuxeo-card>
        <nuxeo-video-conversions .document="${t}" label="${e.label}"> </nuxeo-video-conversions>
      </nuxeo-card>
    `}};var i,r,a;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    label: 'Video Conversion'
  },
  render: args => {
    const document = new DocumentBuilder().setType('File').setProperties({
      'vid:transcodedVideos': videoProperties['vid:transcodedVideos']
    }).build();
    return html\`
      <nuxeo-card>
        <nuxeo-video-conversions .document="\${document}" label="\${args.label}"> </nuxeo-video-conversions>
      </nuxeo-card>
    \`;
  }
}`,...(a=(r=o.parameters)==null?void 0:r.docs)==null?void 0:a.source}}};const E=["NuxeoVideoConverter"];export{o as NuxeoVideoConverter,E as __namedExportsOrder,$ as default};
