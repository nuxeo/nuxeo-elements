import{b as a}from"./iframe-DfANLok6.js";import"./nuxeo-checkmark-hJpRrYeJ.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-icon-Bt9a3Rhq.js";import"./iron-flex-layout-Cy57WvA0.js";import"./nuxeo-icons-Bm09xz8u.js";import"./iron-iconset-svg-5-aE6F5a.js";const u={title:"UI/nuxeo-checkmark"},o={args:{bgColor:"#ffffff",bgColorChecked:"#0000ff",checked:!1,disabled:!1},argTypes:{bgColor:{control:"color",name:"--nuxeo-checkmark-background-color"},bgColorChecked:{control:"color",name:"--nuxeo-checkmark-background-color-checked"}},render:e=>a`
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
