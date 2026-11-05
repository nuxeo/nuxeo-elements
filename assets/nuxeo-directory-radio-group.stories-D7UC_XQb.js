import{b as n}from"./iframe-Yfd-OibJ.js";import{D as i}from"./directory-suggestion.data-D31xSQgE.js";import"./preload-helper-Dp1pzeXC.js";import"./default-theme-DZcntQFC.js";import"./iron-flex-layout-Db70X-7Q.js";import"./paper-checked-element-behavior-CSt9lHWm.js";import"./iron-validatable-behavior-6vvyaykN.js";import"./paper-inky-focus-behavior-BHRRPMpt.js";import"./paper-ripple-DDInChqF.js";import"./iron-a11y-keys-behavior-BQM3k0wN.js";import"./render-status-BVnGG85N.js";import"./iron-menu-behavior-tLsCTQb6.js";import"./nuxeo-i18n-behavior-BhQ-sx4z.js";import"./nuxeo-widget-validation-behavior-DxbuVDIy.js";const s=window.nuxeo.mock;s.respondWith("post","/api/v1/automation/Directory.SuggestEntries",()=>i);const f={title:"UI/nuxeo-directory-radio-group"},r={args:{label:"Select language"},render:a=>n`
    <style>
      .container {
        margin: 2rem;
      }
    </style>
    <div class="container">
      <nuxeo-directory-radio-group label="${a.label}" directory-name="language"> </nuxeo-directory-radio-group>
    </div>
  `};var e,o,t;r.parameters={...r.parameters,docs:{...(e=r.parameters)==null?void 0:e.docs,source:{originalSource:`{
  args: {
    label: 'Select language'
  },
  render: args => html\`
    <style>
      .container {
        margin: 2rem;
      }
    </style>
    <div class="container">
      <nuxeo-directory-radio-group label="\${args.label}" directory-name="language"> </nuxeo-directory-radio-group>
    </div>
  \`
}`,...(t=(o=r.parameters)==null?void 0:o.docs)==null?void 0:t.source}}};const _=["Default"];export{r as Default,_ as __namedExportsOrder,f as default};
