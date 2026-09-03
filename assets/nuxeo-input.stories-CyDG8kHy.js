import{b as o}from"./iframe-T5hUCbnt.js";import"./nuxeo-input-ALfz038W.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-DVOrdGp7.js";import"./paper-input-CgOMKcUj.js";import"./paper-input-behavior-BtXc_mnC.js";import"./typography-Bj6IP4r5.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-CQAobW0V.js";import"./default-theme-RhyFn9QU.js";import"./iron-a11y-keys-behavior-CQeU5Yru.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";const y={title:"UI/nuxeo-input"},n={args:{type:"text",label:"Label",placeholder:"Placeholder",errorMessage:"",readonly:!1,disabled:!1,required:!1,invalid:!1,autofocus:!1,minlength:0,maxLength:10,min:0,max:100,step:1,invalidColor:"#de350b"},argTypes:{type:{control:"select",options:["email","number","password","tel","text","url"]},invalidColor:{control:"color"}},render:e=>o`
    <style>
      nuxeo-input {
        margin: 2rem;
        max-width: 300px;
        --paper-input-container-invalid-color: ${e.invalidColor};
      }
    </style>
    <nuxeo-input
      type="${e.type}"
      placeholder="${e.placeholder}"
      error-message="${e.errorMessage}"
      ?autofocus="${e.autofocus}"
      ?readonly="${e.readonly}"
      ?disabled="${e.disabled}"
      ?required="${e.required}"
      minlength="${e.minlength}"
      maxlength="${e.maxLength}"
      min="${e.min}"
      max="${e.max}"
      step="${e.step}"
      ?invalid="${e.invalid}"
      label="${e.label}"
    >
    </nuxeo-input>
  `};var r,a,l;n.parameters={...n.parameters,docs:{...(r=n.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    type: 'text',
    label: 'Label',
    placeholder: 'Placeholder',
    errorMessage: '',
    readonly: false,
    disabled: false,
    required: false,
    invalid: false,
    autofocus: false,
    minlength: 0,
    maxLength: 10,
    min: 0,
    max: 100,
    step: 1,
    invalidColor: '#de350b'
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['email', 'number', 'password', 'tel', 'text', 'url']
    },
    invalidColor: {
      control: 'color'
    }
  },
  render: args => html\`
    <style>
      nuxeo-input {
        margin: 2rem;
        max-width: 300px;
        --paper-input-container-invalid-color: \${args.invalidColor};
      }
    </style>
    <nuxeo-input
      type="\${args.type}"
      placeholder="\${args.placeholder}"
      error-message="\${args.errorMessage}"
      ?autofocus="\${args.autofocus}"
      ?readonly="\${args.readonly}"
      ?disabled="\${args.disabled}"
      ?required="\${args.required}"
      minlength="\${args.minlength}"
      maxlength="\${args.maxLength}"
      min="\${args.min}"
      max="\${args.max}"
      step="\${args.step}"
      ?invalid="\${args.invalid}"
      label="\${args.label}"
    >
    </nuxeo-input>
  \`
}`,...(l=(a=n.parameters)==null?void 0:a.docs)==null?void 0:l.source}}};const b=["NuxeoInput"];export{n as NuxeoInput,b as __namedExportsOrder,y as default};
