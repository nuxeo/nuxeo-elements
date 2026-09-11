import{b as i,P as p}from"./iframe-BOsZuRD5.js";import{L as u}from"./nuxeo-layout-behavior-Cz-di-Em.js";import"./nuxeo-search-form-layout-CSpP5sn5.js";import"./nuxeo-input-DmSsC08F.js";import"./nuxeo-checkbox-aggregation-FwLtDtG8.js";import{c}from"./code-panel-template-6VoNdcT9.js";import"./preload-helper-Dp1pzeXC.js";import"./nuxeo-filters-behavior-BwjeSQ5d.js";import"./nuxeo-format-behavior-B1sTohy8.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-i18n-behavior-rSe54NeH.js";import"./render-status-bYxDoUcQ.js";import"./nuxeo-layout-Bf7uzR2y.js";import"./iron-resizable-behavior-nA0Hq9eJ.js";import"./iron-validatable-behavior-QGTu_0wa.js";import"./paper-input-BATGYxlC.js";import"./paper-input-behavior-DJZN1X1Z.js";import"./typography-D5Kg0VrV.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-DwvxVNwp.js";import"./default-theme-DSIY_Ouo.js";import"./iron-a11y-keys-behavior-Bowcpn4T.js";import"./paper-checkbox-C4NEI_el.js";import"./paper-checked-element-behavior-My9BU_hs.js";import"./paper-inky-focus-behavior-BAtTMzZe.js";import"./paper-ripple-BWj0X3eM.js";import"./iron-collapse-rMeh0AQV.js";import"./iron-icon-B9x3FBbS.js";window.Polymer=p;window.Nuxeo.LayoutBehavior=u;window.nuxeo.I18n.en["defaultSearch.fullText"]="Full Text";window.nuxeo.I18n.en["defaultSearch.fullText.placeholder"]="Search for something...";window.nuxeo.I18n.en["defaultSearch.modifiedDate"]="Modification Date";const z={title:"UI/nuxeo-search-form-layout"},r={render:()=>i`
    <div style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
      <nuxeo-search-form-layout
        provider="pp_test"
        search-name="test"
        href-base="layouts/search/"
      ></nuxeo-search-form-layout>
    </div>
    ${c("search/test/nuxeo-test-search-form.html")}
  `},e={render:()=>i`
    <nuxeo-search-form-layout
      provider="pp_other"
      search-name="other"
      href-base="layouts/search/"
    ></nuxeo-search-form-layout>
  `};var o,t,a;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => html\`
    <div style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
      <nuxeo-search-form-layout
        provider="pp_test"
        search-name="test"
        href-base="layouts/search/"
      ></nuxeo-search-form-layout>
    </div>
    \${codePanelTemplate('search/test/nuxeo-test-search-form.html')}
  \`
}`,...(a=(t=r.parameters)==null?void 0:t.docs)==null?void 0:a.source}}};var s,n,m;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-search-form-layout
      provider="pp_other"
      search-name="other"
      href-base="layouts/search/"
    ></nuxeo-search-form-layout>
  \`
}`,...(m=(n=e.parameters)==null?void 0:n.docs)==null?void 0:m.source}}};const A=["Default","MissingLayout"];export{r as Default,e as MissingLayout,A as __namedExportsOrder,z as default};
