import{b as a}from"./iframe-DfANLok6.js";import"./nuxeo-document-picker-DhbUpbp2.js";import{c as o}from"./code-panel-template-0K8q8hdy.js";import"./preload-helper-Dp1pzeXC.js";import"./render-status-DgSWxHM4.js";import"./nuxeo-i18n-behavior-DkDjknqP.js";import"./iron-flex-layout-Cy57WvA0.js";import"./iron-collapse-B1KRLpU1.js";import"./iron-resizable-behavior-AZ17E4LT.js";import"./nuxeo-search-form-layout-ZvxkAi2L.js";import"./nuxeo-layout-CRkOTeK9.js";import"./nuxeo-search-results-layout-DGJuiFqk.js";import"./nuxeo-dialog-DRutOyFJ.js";import"./paper-material-styles-CVTaxaU1.js";import"./shadow-CZKJlY6X.js";import"./paper-ripple-CvfHxnYa.js";import"./iron-a11y-keys-behavior-CXq8UWKK.js";import"./paper-inky-focus-behavior-rjTRkVyf.js";import"./neon-animation-runner-behavior-DA6rB6qM.js";import"./default-theme-sVFU976S.js";import"./typography-Dsqr7jdM.js";import"./roboto-AfkCeElV.js";import"./templatizer-behavior-Dh-bkegA.js";import"./paper-icon-button-BnBB_cCA.js";import"./iron-icon-Bt9a3Rhq.js";window.nuxeo.I18n.en["pickerSearch.title"]="Quick Search";window.nuxeo.I18n.en["searchResults.noResults"]="No documents match the search criteria.";const z={title:"UI/nuxeo-document-picker"},n={render:()=>a`
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
