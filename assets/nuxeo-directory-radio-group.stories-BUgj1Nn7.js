import{b as n}from"./iframe-T5hUCbnt.js";import{D as i}from"./directory-suggestion.data-D1hgwuh-.js";import"./preload-helper-Dp1pzeXC.js";import"./default-theme-RhyFn9QU.js";import"./iron-flex-layout-CQAobW0V.js";import"./paper-checked-element-behavior-JkhbBuKO.js";import"./iron-validatable-behavior-DVOrdGp7.js";import"./paper-inky-focus-behavior-BFu4CTGP.js";import"./paper-ripple-e9CBUXzz.js";import"./iron-a11y-keys-behavior-CQeU5Yru.js";import"./render-status-BJmzACxi.js";import"./iron-menu-behavior-BQTarcVj.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";const s=window.nuxeo.mock;s.respondWith("post","/api/v1/automation/Directory.SuggestEntries",()=>i);const E={title:"UI/nuxeo-directory-radio-group"},r={args:{label:"Select language"},render:a=>n`
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
