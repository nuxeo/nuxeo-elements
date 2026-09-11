import{b as n}from"./iframe-BOsZuRD5.js";import{D as i}from"./directory-suggestion.data-D0gaUgnf.js";import"./preload-helper-Dp1pzeXC.js";import"./default-theme-DSIY_Ouo.js";import"./iron-flex-layout-DwvxVNwp.js";import"./paper-checked-element-behavior-My9BU_hs.js";import"./iron-validatable-behavior-QGTu_0wa.js";import"./paper-inky-focus-behavior-BAtTMzZe.js";import"./paper-ripple-BWj0X3eM.js";import"./iron-a11y-keys-behavior-Bowcpn4T.js";import"./render-status-bYxDoUcQ.js";import"./iron-menu-behavior-DjRgJRGR.js";import"./nuxeo-i18n-behavior-rSe54NeH.js";const s=window.nuxeo.mock;s.respondWith("post","/api/v1/automation/Directory.SuggestEntries",()=>i);const E={title:"UI/nuxeo-directory-radio-group"},r={args:{label:"Select language"},render:a=>n`
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
}`,...(t=(o=r.parameters)==null?void 0:o.docs)==null?void 0:t.source}}};const f=["Default"];export{r as Default,f as __namedExportsOrder,E as default};
