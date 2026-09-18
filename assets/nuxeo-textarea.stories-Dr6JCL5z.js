import{b as t}from"./iframe-DfANLok6.js";import"./nuxeo-textarea-zMQ3bOR9.js";import"./preload-helper-Dp1pzeXC.js";import"./paper-textarea-CUnjIe5x.js";import"./iron-flex-layout-Cy57WvA0.js";import"./iron-a11y-keys-behavior-CXq8UWKK.js";import"./iron-validatable-behavior-D22XWMWB.js";import"./paper-input-behavior-DGBlyaCy.js";import"./typography-Dsqr7jdM.js";import"./roboto-AfkCeElV.js";import"./default-theme-sVFU976S.js";const $={title:"UI/nuxeo-textarea"},r={args:{numberOfRows:3,label:"Label",placeholder:"This element represents a multi-line plain-text editing control",required:!1,disabled:!1,invalid:!1,readonly:!1},render:e=>t`
    <style>
      nuxeo-textarea {
        max-width: 300px;
      }
    </style>
    <nuxeo-textarea
      label="${e.label}"
      name="description"
      rows="${e.numberOfRows}"
      placeholder="${e.placeholder}"
      ?required="${e.required}"
      ?disabled="${e.disabled}"
      ?invalid="${e.invalid}"
      ?readonly="${e.readonly}"
    >
    </nuxeo-textarea>
  `};var a,n,l;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    numberOfRows: 3,
    label: 'Label',
    placeholder: 'This element represents a multi-line plain-text editing control',
    required: false,
    disabled: false,
    invalid: false,
    readonly: false
  },
  render: args => html\`
    <style>
      nuxeo-textarea {
        max-width: 300px;
      }
    </style>
    <nuxeo-textarea
      label="\${args.label}"
      name="description"
      rows="\${args.numberOfRows}"
      placeholder="\${args.placeholder}"
      ?required="\${args.required}"
      ?disabled="\${args.disabled}"
      ?invalid="\${args.invalid}"
      ?readonly="\${args.readonly}"
    >
    </nuxeo-textarea>
  \`
}`,...(l=(n=r.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};const h=["Default"];export{r as Default,h as __namedExportsOrder,$ as default};
