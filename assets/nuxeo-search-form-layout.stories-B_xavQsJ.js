import{b as i,P as p}from"./iframe-DfANLok6.js";import{L as u}from"./nuxeo-layout-behavior-2CMXljbc.js";import"./nuxeo-search-form-layout-ZvxkAi2L.js";import"./nuxeo-input-DuqcUoUx.js";import"./nuxeo-checkbox-aggregation-7HqzFYNm.js";import{c}from"./code-panel-template-0K8q8hdy.js";import"./preload-helper-Dp1pzeXC.js";import"./nuxeo-filters-behavior-BwjeSQ5d.js";import"./nuxeo-format-behavior-DCZ67kVR.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-i18n-behavior-DkDjknqP.js";import"./render-status-DgSWxHM4.js";import"./nuxeo-layout-CRkOTeK9.js";import"./iron-resizable-behavior-AZ17E4LT.js";import"./iron-validatable-behavior-D22XWMWB.js";import"./paper-input-B8T425Tx.js";import"./paper-input-behavior-DGBlyaCy.js";import"./typography-Dsqr7jdM.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-Cy57WvA0.js";import"./default-theme-sVFU976S.js";import"./iron-a11y-keys-behavior-CXq8UWKK.js";import"./nuxeo-widget-validation-behavior-cLtHj9CV.js";import"./paper-checkbox-J2J5-AY4.js";import"./paper-checked-element-behavior-BrE1EYlL.js";import"./paper-inky-focus-behavior-rjTRkVyf.js";import"./paper-ripple-CvfHxnYa.js";import"./iron-collapse-B1KRLpU1.js";import"./iron-icon-Bt9a3Rhq.js";window.Polymer=p;window.Nuxeo.LayoutBehavior=u;window.nuxeo.I18n.en["defaultSearch.fullText"]="Full Text";window.nuxeo.I18n.en["defaultSearch.fullText.placeholder"]="Search for something...";window.nuxeo.I18n.en["defaultSearch.modifiedDate"]="Modification Date";const A={title:"UI/nuxeo-search-form-layout"},r={render:()=>i`
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
