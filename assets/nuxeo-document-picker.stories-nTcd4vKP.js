import{b as a}from"./iframe-Yfd-OibJ.js";import"./nuxeo-document-picker-CyZw9O_C.js";import{c as o}from"./code-panel-template-DEqQD-Bc.js";import"./preload-helper-Dp1pzeXC.js";import"./render-status-BVnGG85N.js";import"./nuxeo-i18n-behavior-BhQ-sx4z.js";import"./iron-flex-layout-Db70X-7Q.js";import"./iron-collapse-BgVbqnqa.js";import"./iron-resizable-behavior-D7uxPWIp.js";import"./nuxeo-search-form-layout-D5sySwmr.js";import"./nuxeo-layout-BiYla9Cl.js";import"./nuxeo-search-results-layout-D5Tr1o0A.js";import"./nuxeo-dialog-Dw_pdDpA.js";import"./paper-material-styles-C_zSstGc.js";import"./shadow-5Ga7wkF4.js";import"./paper-ripple-DDInChqF.js";import"./iron-a11y-keys-behavior-BQM3k0wN.js";import"./paper-inky-focus-behavior-BHRRPMpt.js";import"./neon-animation-runner-behavior-BtBYKrDJ.js";import"./default-theme-DZcntQFC.js";import"./typography-C7rYHizi.js";import"./roboto-AfkCeElV.js";import"./templatizer-behavior-vG_cb1KN.js";import"./paper-icon-button-D9_twpz5.js";import"./iron-icon-DGiq-Trn.js";window.nuxeo.I18n.en["pickerSearch.title"]="Quick Search";window.nuxeo.I18n.en["searchResults.noResults"]="No documents match the search criteria.";const z={title:"UI/nuxeo-document-picker"},n={render:()=>a`
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
