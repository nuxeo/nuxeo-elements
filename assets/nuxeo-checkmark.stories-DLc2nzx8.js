import{b as a}from"./iframe-aDtHWxuA.js";import"./nuxeo-checkmark-BCYqY_T2.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-icon-jrU-uo7K.js";import"./iron-flex-layout-BaH3_w-d.js";import"./nuxeo-icons-BOkmY6P9.js";import"./iron-iconset-svg-CL9hziFk.js";const u={title:"UI/nuxeo-checkmark"},o={args:{bgColor:"#ffffff",bgColorChecked:"#0000ff",checked:!1,disabled:!1},argTypes:{bgColor:{control:"color",name:"--nuxeo-checkmark-background-color"},bgColorChecked:{control:"color",name:"--nuxeo-checkmark-background-color-checked"}},render:e=>a`
    <style>
      * {
        --nuxeo-checkmark-background-color: ${e.bgColor};
        --nuxeo-checkmark-background-color-checked: ${e.bgColorChecked};
      }
    </style>
    <nuxeo-checkmark ?checked="${e.checked}" ?disabled="${e.disabled}"></nuxeo-checkmark>
  `};var c,r,n;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    bgColor: '#ffffff',
    bgColorChecked: '#0000ff',
    checked: false,
    disabled: false
  },
  argTypes: {
    bgColor: {
      control: 'color',
      name: '--nuxeo-checkmark-background-color'
    },
    bgColorChecked: {
      control: 'color',
      name: '--nuxeo-checkmark-background-color-checked'
    }
  },
  render: args => html\`
    <style>
      * {
        --nuxeo-checkmark-background-color: \${args.bgColor};
        --nuxeo-checkmark-background-color-checked: \${args.bgColorChecked};
      }
    </style>
    <nuxeo-checkmark ?checked="\${args.checked}" ?disabled="\${args.disabled}"></nuxeo-checkmark>
  \`
}`,...(n=(r=o.parameters)==null?void 0:r.docs)==null?void 0:n.source}}};const b=["NuxeoCheckmark"];export{o as NuxeoCheckmark,b as __namedExportsOrder,u as default};
