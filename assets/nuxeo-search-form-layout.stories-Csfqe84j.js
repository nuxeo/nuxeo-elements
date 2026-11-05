import{b as i,P as p}from"./iframe-Yfd-OibJ.js";import{L as u}from"./nuxeo-layout-behavior-DPs48gKJ.js";import"./nuxeo-search-form-layout-D5sySwmr.js";import"./nuxeo-input-p47yJwqB.js";import"./nuxeo-checkbox-aggregation-R8z0iLo9.js";import{c}from"./code-panel-template-DEqQD-Bc.js";import"./preload-helper-Dp1pzeXC.js";import"./nuxeo-filters-behavior-DmmitOzd.js";import"./nuxeo-format-behavior-Cf0PhggR.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-i18n-behavior-BhQ-sx4z.js";import"./render-status-BVnGG85N.js";import"./nuxeo-layout-BiYla9Cl.js";import"./iron-resizable-behavior-D7uxPWIp.js";import"./iron-validatable-behavior-6vvyaykN.js";import"./paper-input-vp--8Vkr.js";import"./paper-input-behavior-z3P3ngPl.js";import"./typography-C7rYHizi.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-Db70X-7Q.js";import"./default-theme-DZcntQFC.js";import"./iron-a11y-keys-behavior-BQM3k0wN.js";import"./nuxeo-widget-validation-behavior-DxbuVDIy.js";import"./paper-checkbox-DVoOtD6S.js";import"./paper-checked-element-behavior-CSt9lHWm.js";import"./paper-inky-focus-behavior-BHRRPMpt.js";import"./paper-ripple-DDInChqF.js";import"./iron-collapse-BgVbqnqa.js";import"./iron-icon-DGiq-Trn.js";window.Polymer=p;window.Nuxeo.LayoutBehavior=u;window.nuxeo.I18n.en["defaultSearch.fullText"]="Full Text";window.nuxeo.I18n.en["defaultSearch.fullText.placeholder"]="Search for something...";window.nuxeo.I18n.en["defaultSearch.modifiedDate"]="Modification Date";const A={title:"UI/nuxeo-search-form-layout"},r={render:()=>i`
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
