import{b as i,P as p}from"./iframe-T5hUCbnt.js";import{L as u}from"./nuxeo-layout-behavior-BXgzy8AB.js";import"./nuxeo-search-form-layout-Cyg4McPd.js";import"./nuxeo-input-ALfz038W.js";import"./nuxeo-checkbox-aggregation-CaENnGck.js";import{c}from"./code-panel-template-BzkfEgKq.js";import"./preload-helper-Dp1pzeXC.js";import"./nuxeo-filters-behavior-BwjeSQ5d.js";import"./nuxeo-format-behavior-qyIFGuqE.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./render-status-BJmzACxi.js";import"./nuxeo-layout-CaN7sOfJ.js";import"./iron-resizable-behavior-BJTBE6_U.js";import"./iron-validatable-behavior-DVOrdGp7.js";import"./paper-input-CgOMKcUj.js";import"./paper-input-behavior-BtXc_mnC.js";import"./typography-Bj6IP4r5.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-CQAobW0V.js";import"./default-theme-RhyFn9QU.js";import"./iron-a11y-keys-behavior-CQeU5Yru.js";import"./paper-checkbox-DJEpcUTk.js";import"./paper-checked-element-behavior-JkhbBuKO.js";import"./paper-inky-focus-behavior-BFu4CTGP.js";import"./paper-ripple-e9CBUXzz.js";import"./iron-collapse-Q03AhJj8.js";import"./iron-icon-lX3uy4jx.js";window.Polymer=p;window.Nuxeo.LayoutBehavior=u;window.nuxeo.I18n.en["defaultSearch.fullText"]="Full Text";window.nuxeo.I18n.en["defaultSearch.fullText.placeholder"]="Search for something...";window.nuxeo.I18n.en["defaultSearch.modifiedDate"]="Modification Date";const z={title:"UI/nuxeo-search-form-layout"},r={render:()=>i`
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
