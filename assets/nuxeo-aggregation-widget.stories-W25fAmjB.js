import{b as i}from"./iframe-aDtHWxuA.js";import"./nuxeo-checkbox-aggregation-n_Kamg8v.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-flex-layout-BaH3_w-d.js";import"./paper-checkbox-CtM8erEi.js";import"./default-theme-D2eTFyK0.js";import"./paper-checked-element-behavior-CK7xlSsy.js";import"./iron-validatable-behavior-BhRorwMT.js";import"./paper-inky-focus-behavior-D0cNeSN7.js";import"./paper-ripple-CvXK8Wn4.js";import"./iron-a11y-keys-behavior-C7f4H3Su.js";import"./render-status-BqZFeuJ7.js";import"./iron-collapse-B1cXrE53.js";import"./iron-resizable-behavior-CVRHTtvv.js";import"./iron-icon-jrU-uo7K.js";import"./nuxeo-i18n-behavior-DKHHaNJi.js";const n={"entity-type":"aggregate",extendedBuckets:[{docCount:2,fetchedKey:{"entity-type":"document",properties:{"dc:title":"Tolkien"},uid:"59cf794f-6875-45ca-a837-053c196b2292"},key:"59cf794f-6875-45ca-a837-053c196b2292"},{docCount:1,fetchedKey:{"entity-type":"document",properties:{"dc:title":"Asimov"},uid:"59cf794f-6875-45ca-a837-053c196b2291"},key:"59cf794f-6875-45ca-a837-053c196b2291"},{docCount:3,fetchedKey:{"entity-type":"document",properties:{"dc:title":"Hemingway"},uid:"59cf794f-6875-45ca-a837-053c196b2291"},key:"59cf794f-6875-45ca-a837-053c196b2291"},{docCount:4,fetchedKey:{"entity-type":"document",properties:{"dc:title":"Dostoevsky"},uid:"59cf794f-6875-45ca-a837-053c196b2291"},key:"59cf794f-6875-45ca-a837-053c196b2291"},{docCount:5,fetchedKey:{"entity-type":"document",properties:{"dc:title":"Tolstoy"},uid:"59cf794f-6875-45ca-a837-053c196b2291"},key:"59cf794f-6875-45ca-a837-053c196b2291"},{docCount:6,fetchedKey:{"entity-type":"document",properties:{"dc:title":"Pessoa"},uid:"59cf794f-6875-45ca-a837-053c196b2291"},key:"59cf794f-6875-45ca-a837-053c196b2291"},{docCount:7,fetchedKey:{"entity-type":"document",properties:{"dc:title":"Balzac"},uid:"59cf794f-6875-45ca-a837-053c196b2291"},key:"59cf794f-6875-45ca-a837-053c196b2291"},{docCount:8,fetchedKey:{"entity-type":"document",properties:{"dc:title":"Cervantes"},uid:"59cf794f-6875-45ca-a837-053c196b2291"},key:"59cf794f-6875-45ca-a837-053c196b2291"},{docCount:9,fetchedKey:{"entity-type":"document",properties:{"dc:title":"Shakespeare"},uid:"59cf794f-6875-45ca-a837-053c196b2291"},key:"59cf794f-6875-45ca-a837-053c196b2291"}],field:"book:author",id:"book_author_agg",properties:{order:"count desc",size:"20"},ranges:[],selection:[],type:"terms"},v={title:"UI/nuxeo-checkbox-aggregation"},t={args:{label:"Some Label",collapsible:!1,opened:!1,visibleItems:8},render:e=>i`
    <style>
      :root {
        display: block;
        width: 300px;
        margin: 2rem;
      }
    </style>
    <nuxeo-checkbox-aggregation
      .data="${n}"
      label="${e.label}"
      ?collapsible="${e.collapsible}"
      ?opened="${e.opened}"
      visible-items="${e.visibleItems}"
    >
    </nuxeo-checkbox-aggregation>
  `};var c,o,a;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    label: 'Some Label',
    collapsible: false,
    opened: false,
    visibleItems: 8
  },
  render: args => html\`
    <style>
      :root {
        display: block;
        width: 300px;
        margin: 2rem;
      }
    </style>
    <nuxeo-checkbox-aggregation
      .data="\${DATA}"
      label="\${args.label}"
      ?collapsible="\${args.collapsible}"
      ?opened="\${args.opened}"
      visible-items="\${args.visibleItems}"
    >
    </nuxeo-checkbox-aggregation>
  \`
}`,...(a=(o=t.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};const K=["Default"];export{t as Default,K as __namedExportsOrder,v as default};
