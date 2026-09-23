import{b as a}from"./iframe-DfANLok6.js";import{U as t}from"./user-suggestion.data-BYd6PGtq.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-D22XWMWB.js";import"./iron-flex-layout-Cy57WvA0.js";import"./iron-image-iBBid9Md.js";import"./paper-material-styles-CVTaxaU1.js";import"./shadow-CZKJlY6X.js";import"./default-theme-sVFU976S.js";import"./nuxeo-selectivity-DwX8wClL.js";import"./nuxeo-i18n-behavior-DkDjknqP.js";import"./nuxeo-widget-validation-behavior-cLtHj9CV.js";import"./iron-icon-Bt9a3Rhq.js";import"./nuxeo-icons-Bm09xz8u.js";import"./iron-iconset-svg-5-aE6F5a.js";import"./nuxeo-user-avatar-4t6XL0nA.js";const l=window.nuxeo.mock;l.respondWith("post","/api/v1/automation/UserGroup.Suggestion",()=>t);const x={title:"UI/nuxeo-user-suggestion"},n={args:{label:"Label",searchType:"USER_GROUP_TYPE",multiple:!1,stayOpenOnSelect:!1,readonly:!1,minChars:0,placeholder:"Placeholder"},argTypes:{searchType:{control:"select",options:["USER_TYPE","GROUP_TYPE","USER_GROUP_TYPE"]}},render:e=>a`
    <style>
      .container {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <div class="container">
      <nuxeo-user-suggestion
        label="${e.label}"
        search-type="${e.searchType}"
        ?multiple="${e.multiple}"
        ?stay-open-on-select="${e.stayOpenOnSelect}"
        ?readonly="${e.readonly}"
        min-chars="${e.minChars}"
        placeholder="${e.placeholder}"
      >
      </nuxeo-user-suggestion>
    </div>
  `};var r,s,o;n.parameters={...n.parameters,docs:{...(r=n.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    label: 'Label',
    searchType: 'USER_GROUP_TYPE',
    multiple: false,
    stayOpenOnSelect: false,
    readonly: false,
    minChars: 0,
    placeholder: 'Placeholder'
  },
  argTypes: {
    searchType: {
      control: 'select',
      options: ['USER_TYPE', 'GROUP_TYPE', 'USER_GROUP_TYPE']
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
      <nuxeo-user-suggestion
        label="\${args.label}"
        search-type="\${args.searchType}"
        ?multiple="\${args.multiple}"
        ?stay-open-on-select="\${args.stayOpenOnSelect}"
        ?readonly="\${args.readonly}"
        min-chars="\${args.minChars}"
        placeholder="\${args.placeholder}"
      >
      </nuxeo-user-suggestion>
    </div>
  \`
}`,...(o=(s=n.parameters)==null?void 0:s.docs)==null?void 0:o.source}}};const R=["NuxeoUserSuggestion"];export{n as NuxeoUserSuggestion,R as __namedExportsOrder,x as default};
