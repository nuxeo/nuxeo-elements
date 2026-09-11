import{b as r}from"./iframe-BOsZuRD5.js";import"./nuxeo-icons-DBuhqV_Q.js";import"./nuxeo-card-BrLbv-9O.js";import{i as n}from"./icons-DNX_B8Ax.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-iconset-svg-DhGL9Wod.js";import"./iron-collapse-rMeh0AQV.js";import"./iron-resizable-behavior-nA0Hq9eJ.js";import"./iron-flex-layout-DwvxVNwp.js";import"./iron-icon-B9x3FBbS.js";const m=Object.keys(n).map(t=>({name:t,icons:n[t]})),g={title:"UI/nuxeo-icons"},e={render:()=>r`
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
