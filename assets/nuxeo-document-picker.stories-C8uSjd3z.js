import{b as a}from"./iframe-BOsZuRD5.js";import"./nuxeo-document-picker-DA-KyViy.js";import{c as o}from"./code-panel-template-6VoNdcT9.js";import"./preload-helper-Dp1pzeXC.js";import"./render-status-bYxDoUcQ.js";import"./nuxeo-i18n-behavior-rSe54NeH.js";import"./iron-flex-layout-DwvxVNwp.js";import"./iron-collapse-rMeh0AQV.js";import"./iron-resizable-behavior-nA0Hq9eJ.js";import"./nuxeo-search-form-layout-CSpP5sn5.js";import"./nuxeo-layout-Bf7uzR2y.js";import"./nuxeo-search-results-layout-s4BJdKPm.js";import"./nuxeo-dialog-D736a_Hi.js";import"./paper-material-styles-YDpzUOg2.js";import"./shadow-B2uLiFuq.js";import"./paper-ripple-BWj0X3eM.js";import"./iron-a11y-keys-behavior-Bowcpn4T.js";import"./paper-inky-focus-behavior-BAtTMzZe.js";import"./neon-animation-runner-behavior-DwSgv3bY.js";import"./default-theme-DSIY_Ouo.js";import"./typography-D5Kg0VrV.js";import"./roboto-AfkCeElV.js";import"./templatizer-behavior-BHJ57Wuh.js";import"./paper-icon-button-D5khVTdX.js";import"./iron-icon-B9x3FBbS.js";window.nuxeo.I18n.en["pickerSearch.title"]="Quick Search";window.nuxeo.I18n.en["searchResults.noResults"]="No documents match the search criteria.";const z={title:"UI/nuxeo-document-picker"},n={render:()=>a`
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
