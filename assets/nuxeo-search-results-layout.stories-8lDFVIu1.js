import{b as c,P as i}from"./iframe-aDtHWxuA.js";import{L as m}from"./nuxeo-layout-behavior-DBHPDcCP.js";import"./nuxeo-search-results-layout-X-iyc31c.js";import{c as h}from"./code-panel-template-Bpz85Vq9.js";import"./preload-helper-Dp1pzeXC.js";import"./nuxeo-filters-behavior-BwjeSQ5d.js";import"./nuxeo-format-behavior-DtegwsJa.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-i18n-behavior-DKHHaNJi.js";import"./nuxeo-layout-Deay3i9e.js";import"./iron-resizable-behavior-CVRHTtvv.js";import"./render-status-BqZFeuJ7.js";window.Polymer=i;window.Nuxeo.LayoutBehavior=m;const P={title:"UI/nuxeo-search-results-layout"},e={render:()=>c`
    <div style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
      <nuxeo-search-results-layout
        id="results"
        search-name="test"
        href-base="layouts/search/"
      ></nuxeo-search-results-layout>
    </div>
    <button @click=${r=>r.target.parentElement.querySelector("#results").fetch()}>
      Fetch results
    </button>
    <button @click=${r=>r.target.parentElement.querySelector("#results").reset()}>
      Reset results
    </button>
    ${h("search/test/nuxeo-test-search-results.html")}
  `},t={render:()=>c`
    <nuxeo-search-results-layout search-name="other" href-base="layouts/search/"></nuxeo-search-results-layout>
  `};var s,a,o;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: () => html\`
    <div style="margin: 8px; padding: 8px; border-radius: 8px; border: 2px solid gray;">
      <nuxeo-search-results-layout
        id="results"
        search-name="test"
        href-base="layouts/search/"
      ></nuxeo-search-results-layout>
    </div>
    <button @click=\${e => e.target.parentElement.querySelector('#results').fetch()}>
      Fetch results
    </button>
    <button @click=\${e => e.target.parentElement.querySelector('#results').reset()}>
      Reset results
    </button>
    \${codePanelTemplate('search/test/nuxeo-test-search-results.html')}
  \`
}`,...(o=(a=e.parameters)==null?void 0:a.docs)==null?void 0:o.source}}};var u,n,l;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-search-results-layout search-name="other" href-base="layouts/search/"></nuxeo-search-results-layout>
  \`
}`,...(l=(n=t.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};const k=["Default","MissingLayout"];export{e as Default,t as MissingLayout,k as __namedExportsOrder,P as default};
