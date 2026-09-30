import{b as a}from"./iframe-aDtHWxuA.js";import"./nuxeo-select-DXDvNzgX.js";import{c as n}from"./lists.data-Cg1ey1re.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-BhRorwMT.js";import"./iron-icon-jrU-uo7K.js";import"./iron-flex-layout-BaH3_w-d.js";import"./paper-input-DT0XC6Tq.js";import"./paper-input-behavior-ocEb3FBE.js";import"./typography-B0tNP4Nv.js";import"./roboto-AfkCeElV.js";import"./default-theme-D2eTFyK0.js";import"./iron-a11y-keys-behavior-C7f4H3Su.js";import"./paper-menu-button-krnqTS4r.js";import"./iron-menu-behavior-BSglCIn4.js";import"./neon-animation-runner-behavior-C740WMdn.js";import"./iron-resizable-behavior-CVRHTtvv.js";import"./shadow-0lJZW1_x.js";import"./paper-ripple-CvXK8Wn4.js";import"./iron-iconset-svg-CL9hziFk.js";import"./paper-item-behavior-DlWeQVk1.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";const w={title:"UI/nuxeo-select"},r={args:{label:"Label",placeholder:"Placeholder",errorMessage:"Error message",horizontalAlign:"left",verticalAlign:"top",dynamicAlign:!1,readonly:!1,disabled:!1,required:!1},argTypes:{horizontalAlign:{control:"select",options:["left","right"]},verticalAlign:{control:"select",options:["top","bottom"]}},render:e=>a`
    <style>
      .container {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <div class="container">
      <nuxeo-select
        label="${e.label}"
        placeholder="${e.placeholder}"
        error-message="${e.errorMessage}"
        .options="${n}"
        .selected="${n[0]}"
        horizontal-align="${e.horizontalAlign}"
        vertical-align="${e.verticalAlign}"
        ?dynamic-align="${e.dynamicAlign}"
        ?readonly="${e.readonly}"
        ?disabled="${e.disabled}"
        ?required="${e.required}"
      >
      </nuxeo-select>
    </div>
  `};var l,o,i;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    errorMessage: 'Error message',
    horizontalAlign: 'left',
    verticalAlign: 'top',
    dynamicAlign: false,
    readonly: false,
    disabled: false,
    required: false
  },
  argTypes: {
    horizontalAlign: {
      control: 'select',
      options: ['left', 'right']
    },
    verticalAlign: {
      control: 'select',
      options: ['top', 'bottom']
    }
  },
  render: args => html\`
    <style>
      .container {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <div class="container">
      <nuxeo-select
        label="\${args.label}"
        placeholder="\${args.placeholder}"
        error-message="\${args.errorMessage}"
        .options="\${CITIES}"
        .selected="\${CITIES[0]}"
        horizontal-align="\${args.horizontalAlign}"
        vertical-align="\${args.verticalAlign}"
        ?dynamic-align="\${args.dynamicAlign}"
        ?readonly="\${args.readonly}"
        ?disabled="\${args.disabled}"
        ?required="\${args.required}"
      >
      </nuxeo-select>
    </div>
  \`
}`,...(i=(o=r.parameters)==null?void 0:o.docs)==null?void 0:i.source}}};const C=["Default"];export{r as Default,C as __namedExportsOrder,w as default};
