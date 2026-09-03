import{b as a}from"./iframe-T5hUCbnt.js";import"./nuxeo-document-picker-u_aJWFlx.js";import{c as o}from"./code-panel-template-BzkfEgKq.js";import"./preload-helper-Dp1pzeXC.js";import"./render-status-BJmzACxi.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./iron-flex-layout-CQAobW0V.js";import"./iron-collapse-Q03AhJj8.js";import"./iron-resizable-behavior-BJTBE6_U.js";import"./nuxeo-search-form-layout-Cyg4McPd.js";import"./nuxeo-layout-CaN7sOfJ.js";import"./nuxeo-search-results-layout-Dser9wgW.js";import"./nuxeo-dialog-B7wOaaIF.js";import"./paper-material-styles-B1vejkc1.js";import"./shadow-B1sjh-5Q.js";import"./paper-ripple-e9CBUXzz.js";import"./iron-a11y-keys-behavior-CQeU5Yru.js";import"./paper-inky-focus-behavior-BFu4CTGP.js";import"./neon-animation-runner-behavior-mf0Oh3zj.js";import"./default-theme-RhyFn9QU.js";import"./typography-Bj6IP4r5.js";import"./roboto-AfkCeElV.js";import"./templatizer-behavior-BRsvGg6D.js";import"./paper-icon-button-BQJYUoC5.js";import"./iron-icon-lX3uy4jx.js";window.nuxeo.I18n.en["pickerSearch.title"]="Quick Search";window.nuxeo.I18n.en["searchResults.noResults"]="No documents match the search criteria.";const z={title:"UI/nuxeo-document-picker"},n={render:()=>a`
    <style>
      button {
        padding: 1em;
      }
      button,
      span.info {
        display: flex;
        margin: 1em 0 0 1em;
      }
      nuxeo-document-picker {
        --nuxeo-document-picker-dialog-max-height: calc(100% - 24px);
        --nuxeo-document-picker-dialog-max-width: calc(100% - 24px);
      }
    </style>
    <nuxeo-document-picker
      href-base="layouts/search/"
      provider="picker"
      page-size="40"
      schemas="dublincore,file"
      enrichers="thumbnail,permissions,highlight"
      search-name="picker"
      @picked="${e=>{const t=e.detail.selectedItems,p=e.target.parentElement.querySelector("span.info");p.innerText=t.length+" document(s) picked ("+t.map(m=>m.title).join(", ")+")"}}"
    ></nuxeo-document-picker>
    <button @click=${e=>e.target.parentElement.querySelector("nuxeo-document-picker").open()}>
      Open the Document Picker
    </button>
    <span class="info">No documents picked.</span>
    ${o("search/picker/nuxeo-picker-search-form.html")}
    ${o("search/picker/nuxeo-picker-search-results.html")}
  `};var r,c,i;n.parameters={...n.parameters,docs:{...(r=n.parameters)==null?void 0:r.docs,source:{originalSource:`{
  render: () => html\`
    <style>
      button {
        padding: 1em;
      }
      button,
      span.info {
        display: flex;
        margin: 1em 0 0 1em;
      }
      nuxeo-document-picker {
        --nuxeo-document-picker-dialog-max-height: calc(100% - 24px);
        --nuxeo-document-picker-dialog-max-width: calc(100% - 24px);
      }
    </style>
    <nuxeo-document-picker
      href-base="layouts/search/"
      provider="picker"
      page-size="40"
      schemas="dublincore,file"
      enrichers="thumbnail,permissions,highlight"
      search-name="picker"
      @picked="\${e => {
    const picked = e.detail.selectedItems;
    const span = e.target.parentElement.querySelector('span.info');
    span.innerText = picked.length + ' document(s) picked (' + picked.map(doc => doc.title).join(', ') + ')';
  }}"
    ></nuxeo-document-picker>
    <button @click=\${e => e.target.parentElement.querySelector('nuxeo-document-picker').open()}>
      Open the Document Picker
    </button>
    <span class="info">No documents picked.</span>
    \${codePanelTemplate('search/picker/nuxeo-picker-search-form.html')}
    \${codePanelTemplate('search/picker/nuxeo-picker-search-results.html')}
  \`
}`,...(i=(c=n.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};const R=["NuxeoDocumentPicker"];export{n as NuxeoDocumentPicker,R as __namedExportsOrder,z as default};
