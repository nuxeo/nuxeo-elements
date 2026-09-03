import{b as r}from"./iframe-T5hUCbnt.js";import"./nuxeo-icons-DihWRFWD.js";import"./nuxeo-card-Cqn4D2dR.js";import{i as n}from"./icons-CLzwxyzJ.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-iconset-svg-bEbhiue4.js";import"./iron-collapse-Q03AhJj8.js";import"./iron-resizable-behavior-BJTBE6_U.js";import"./iron-flex-layout-CQAobW0V.js";import"./iron-icon-lX3uy4jx.js";const m=Object.keys(n).map(t=>({name:t,icons:n[t]})),g={title:"UI/nuxeo-icons"},e={render:()=>r`
    <style>
      .set {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        max-width: 100%;
        justify-content: space-between;
      }
      .icon {
        margin: 10px;
        width: 120px;
        text-align: center;
      }
    </style>
    <dom-repeat .items="${m}">
      <template>
        <nuxeo-card collapsible="true" opened="true" heading="{{item.name}}">
          <div class="set">
            <dom-repeat items="{{item.icons}}">
              <template>
                <div class="icon">
                  <iron-icon icon="{{item}}"></iron-icon>
                  <label title="{{item}}">{{item}}</label>
                </div>
              </template>
            </dom-repeat>
          </div>
        </template>
      </nuxeo-card>
    </dom-repeat>
  `};var i,o,a;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => html\`
    <style>
      .set {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        max-width: 100%;
        justify-content: space-between;
      }
      .icon {
        margin: 10px;
        width: 120px;
        text-align: center;
      }
    </style>
    <dom-repeat .items="\${items}">
      <template>
        <nuxeo-card collapsible="true" opened="true" heading="{{item.name}}">
          <div class="set">
            <dom-repeat items="{{item.icons}}">
              <template>
                <div class="icon">
                  <iron-icon icon="{{item}}"></iron-icon>
                  <label title="{{item}}">{{item}}</label>
                </div>
              </template>
            </dom-repeat>
          </div>
        </template>
      </nuxeo-card>
    </dom-repeat>
  \`
}`,...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};const v=["IconCatalogue"];export{e as IconCatalogue,v as __namedExportsOrder,g as default};
