import{b as a}from"./iframe-T5hUCbnt.js";import{U as t}from"./user-suggestion.data-C7bZVXzL.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-DVOrdGp7.js";import"./iron-flex-layout-CQAobW0V.js";import"./iron-image-BFdhxKpa.js";import"./paper-material-styles-B1vejkc1.js";import"./shadow-B1sjh-5Q.js";import"./default-theme-RhyFn9QU.js";import"./nuxeo-selectivity-BuHqhYsn.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./iron-icon-lX3uy4jx.js";import"./nuxeo-icons-DihWRFWD.js";import"./iron-iconset-svg-bEbhiue4.js";import"./nuxeo-user-avatar-Bs_vnqG5.js";const l=window.nuxeo.mock;l.respondWith("post","/api/v1/automation/UserGroup.Suggestion",()=>t);const P={title:"UI/nuxeo-user-suggestion"},n={args:{label:"Label",searchType:"USER_GROUP_TYPE",multiple:!1,stayOpenOnSelect:!1,readonly:!1,minChars:0,placeholder:"Placeholder"},argTypes:{searchType:{control:"select",options:["USER_TYPE","GROUP_TYPE","USER_GROUP_TYPE"]}},render:e=>a`
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
}`,...(o=(s=n.parameters)==null?void 0:s.docs)==null?void 0:o.source}}};const x=["NuxeoUserSuggestion"];export{n as NuxeoUserSuggestion,x as __namedExportsOrder,P as default};
