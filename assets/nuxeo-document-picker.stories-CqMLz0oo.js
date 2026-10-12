import{b as a}from"./iframe-aDtHWxuA.js";import"./nuxeo-document-picker-DX4TGXvy.js";import{c as o}from"./code-panel-template-Bpz85Vq9.js";import"./preload-helper-Dp1pzeXC.js";import"./render-status-BqZFeuJ7.js";import"./nuxeo-i18n-behavior-DKHHaNJi.js";import"./iron-flex-layout-BaH3_w-d.js";import"./iron-collapse-B1cXrE53.js";import"./iron-resizable-behavior-CVRHTtvv.js";import"./nuxeo-search-form-layout-o3CA5fSB.js";import"./nuxeo-layout-Deay3i9e.js";import"./nuxeo-search-results-layout-X-iyc31c.js";import"./nuxeo-dialog-fpQK1Nvt.js";import"./paper-material-styles-CeDe8pnr.js";import"./shadow-0lJZW1_x.js";import"./paper-ripple-CvXK8Wn4.js";import"./iron-a11y-keys-behavior-C7f4H3Su.js";import"./paper-inky-focus-behavior-D0cNeSN7.js";import"./neon-animation-runner-behavior-C740WMdn.js";import"./default-theme-D2eTFyK0.js";import"./typography-B0tNP4Nv.js";import"./roboto-AfkCeElV.js";import"./templatizer-behavior-CQc-YiEy.js";import"./paper-icon-button-CeYMakkp.js";import"./iron-icon-jrU-uo7K.js";window.nuxeo.I18n.en["pickerSearch.title"]="Quick Search";window.nuxeo.I18n.en["searchResults.noResults"]="No documents match the search criteria.";const z={title:"UI/nuxeo-document-picker"},n={render:()=>a`
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
