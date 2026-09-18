import{b as n}from"./iframe-DfANLok6.js";import{D as i}from"./directory-suggestion.data-Dkfix2EN.js";import"./preload-helper-Dp1pzeXC.js";import"./default-theme-sVFU976S.js";import"./iron-flex-layout-Cy57WvA0.js";import"./paper-checked-element-behavior-BrE1EYlL.js";import"./iron-validatable-behavior-D22XWMWB.js";import"./paper-inky-focus-behavior-rjTRkVyf.js";import"./paper-ripple-CvfHxnYa.js";import"./iron-a11y-keys-behavior-CXq8UWKK.js";import"./render-status-DgSWxHM4.js";import"./iron-menu-behavior-BqEGeEci.js";import"./nuxeo-i18n-behavior-DkDjknqP.js";import"./nuxeo-widget-validation-behavior-cLtHj9CV.js";const s=window.nuxeo.mock;s.respondWith("post","/api/v1/automation/Directory.SuggestEntries",()=>i);const f={title:"UI/nuxeo-directory-radio-group"},r={args:{label:"Select language"},render:a=>n`
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
