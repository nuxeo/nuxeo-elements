import{b as r}from"./iframe-DfANLok6.js";import"./nuxeo-icons-Bm09xz8u.js";import"./nuxeo-card-DYvUIT8L.js";import{i as n}from"./icons-9sPYDeJ6.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-iconset-svg-5-aE6F5a.js";import"./iron-collapse-B1KRLpU1.js";import"./iron-resizable-behavior-AZ17E4LT.js";import"./iron-flex-layout-Cy57WvA0.js";import"./iron-icon-Bt9a3Rhq.js";const m=Object.keys(n).map(t=>({name:t,icons:n[t]})),g={title:"UI/nuxeo-icons"},e={render:()=>r`
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
