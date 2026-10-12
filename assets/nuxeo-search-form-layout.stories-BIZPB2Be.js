import{b as i,P as p}from"./iframe-aDtHWxuA.js";import{L as u}from"./nuxeo-layout-behavior-DBHPDcCP.js";import"./nuxeo-search-form-layout-o3CA5fSB.js";import"./nuxeo-input-BcgTEv-x.js";import"./nuxeo-checkbox-aggregation-n_Kamg8v.js";import{c}from"./code-panel-template-Bpz85Vq9.js";import"./preload-helper-Dp1pzeXC.js";import"./nuxeo-filters-behavior-BwjeSQ5d.js";import"./nuxeo-format-behavior-DtegwsJa.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-i18n-behavior-DKHHaNJi.js";import"./render-status-BqZFeuJ7.js";import"./nuxeo-layout-Deay3i9e.js";import"./iron-resizable-behavior-CVRHTtvv.js";import"./iron-validatable-behavior-BhRorwMT.js";import"./paper-input-DT0XC6Tq.js";import"./paper-input-behavior-ocEb3FBE.js";import"./typography-B0tNP4Nv.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-BaH3_w-d.js";import"./default-theme-D2eTFyK0.js";import"./iron-a11y-keys-behavior-C7f4H3Su.js";import"./nuxeo-widget-validation-behavior-C1npKkkK.js";import"./paper-checkbox-CtM8erEi.js";import"./paper-checked-element-behavior-CK7xlSsy.js";import"./paper-inky-focus-behavior-D0cNeSN7.js";import"./paper-ripple-CvXK8Wn4.js";import"./iron-collapse-B1cXrE53.js";import"./iron-icon-jrU-uo7K.js";window.Polymer=p;window.Nuxeo.LayoutBehavior=u;window.nuxeo.I18n.en["defaultSearch.fullText"]="Full Text";window.nuxeo.I18n.en["defaultSearch.fullText.placeholder"]="Search for something...";window.nuxeo.I18n.en["defaultSearch.modifiedDate"]="Modification Date";const A={title:"UI/nuxeo-search-form-layout"},r={render:()=>i`
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
}`,...(m=(n=e.parameters)==null?void 0:n.docs)==null?void 0:m.source}}};const C=["Default","MissingLayout"];export{r as Default,e as MissingLayout,C as __namedExportsOrder,A as default};
