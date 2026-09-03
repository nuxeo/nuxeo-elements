import{b as a}from"./iframe-T5hUCbnt.js";import"./nuxeo-checkmark-B2kpQSOl.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-icon-lX3uy4jx.js";import"./iron-flex-layout-CQAobW0V.js";import"./nuxeo-icons-DihWRFWD.js";import"./iron-iconset-svg-bEbhiue4.js";const u={title:"UI/nuxeo-checkmark"},o={args:{bgColor:"#ffffff",bgColorChecked:"#0000ff",checked:!1,disabled:!1},argTypes:{bgColor:{control:"color",name:"--nuxeo-checkmark-background-color"},bgColorChecked:{control:"color",name:"--nuxeo-checkmark-background-color-checked"}},render:e=>a`
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
