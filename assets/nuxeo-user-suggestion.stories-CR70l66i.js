import{b as a}from"./iframe-aDtHWxuA.js";import{U as t}from"./user-suggestion.data-DbrKmbqZ.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-BhRorwMT.js";import"./iron-flex-layout-BaH3_w-d.js";import"./iron-image-BVGRVncu.js";import"./paper-material-styles-CeDe8pnr.js";import"./shadow-0lJZW1_x.js";import"./default-theme-D2eTFyK0.js";import"./nuxeo-selectivity-Zp3e61Qz.js";import"./nuxeo-i18n-behavior-DKHHaNJi.js";import"./nuxeo-widget-validation-behavior-C1npKkkK.js";import"./iron-icon-jrU-uo7K.js";import"./nuxeo-icons-BOkmY6P9.js";import"./iron-iconset-svg-CL9hziFk.js";import"./nuxeo-user-avatar-OdS7vHZy.js";const l=window.nuxeo.mock;l.respondWith("post","/api/v1/automation/UserGroup.Suggestion",()=>t);const x={title:"UI/nuxeo-user-suggestion"},n={args:{label:"Label",searchType:"USER_GROUP_TYPE",multiple:!1,stayOpenOnSelect:!1,readonly:!1,minChars:0,placeholder:"Placeholder"},argTypes:{searchType:{control:"select",options:["USER_TYPE","GROUP_TYPE","USER_GROUP_TYPE"]}},render:e=>a`
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
