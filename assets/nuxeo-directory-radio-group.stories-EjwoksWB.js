import{b as n}from"./iframe-aDtHWxuA.js";import{D as i}from"./directory-suggestion.data-BiXLG4xA.js";import"./preload-helper-Dp1pzeXC.js";import"./default-theme-D2eTFyK0.js";import"./iron-flex-layout-BaH3_w-d.js";import"./paper-checked-element-behavior-CK7xlSsy.js";import"./iron-validatable-behavior-BhRorwMT.js";import"./paper-inky-focus-behavior-D0cNeSN7.js";import"./paper-ripple-CvXK8Wn4.js";import"./iron-a11y-keys-behavior-C7f4H3Su.js";import"./render-status-BqZFeuJ7.js";import"./iron-menu-behavior-BSglCIn4.js";import"./nuxeo-i18n-behavior-DKHHaNJi.js";import"./nuxeo-widget-validation-behavior-C1npKkkK.js";const s=window.nuxeo.mock;s.respondWith("post","/api/v1/automation/Directory.SuggestEntries",()=>i);const f={title:"UI/nuxeo-directory-radio-group"},r={args:{label:"Select language"},render:a=>n`
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
