import{b as a}from"./iframe-Yfd-OibJ.js";import{U as t}from"./user-suggestion.data-DFHCi1k7.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-6vvyaykN.js";import"./iron-flex-layout-Db70X-7Q.js";import"./iron-image-D2ZqewLv.js";import"./paper-material-styles-C_zSstGc.js";import"./shadow-5Ga7wkF4.js";import"./default-theme-DZcntQFC.js";import"./nuxeo-selectivity-DDZCiJ_D.js";import"./nuxeo-i18n-behavior-BhQ-sx4z.js";import"./nuxeo-widget-validation-behavior-DxbuVDIy.js";import"./iron-icon-DGiq-Trn.js";import"./nuxeo-icons-B4q9ae3o.js";import"./iron-iconset-svg-DAB2Qn14.js";import"./nuxeo-user-avatar-B0IdPI9j.js";const l=window.nuxeo.mock;l.respondWith("post","/api/v1/automation/UserGroup.Suggestion",()=>t);const x={title:"UI/nuxeo-user-suggestion"},n={args:{label:"Label",searchType:"USER_GROUP_TYPE",multiple:!1,stayOpenOnSelect:!1,readonly:!1,minChars:0,placeholder:"Placeholder"},argTypes:{searchType:{control:"select",options:["USER_TYPE","GROUP_TYPE","USER_GROUP_TYPE"]}},render:e=>a`
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
