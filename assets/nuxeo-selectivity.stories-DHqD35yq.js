import{b as o}from"./iframe-T5hUCbnt.js";import"./nuxeo-selectivity-BuHqhYsn.js";import{c}from"./lists.data-Cg1ey1re.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-DVOrdGp7.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./iron-icon-lX3uy4jx.js";import"./iron-flex-layout-CQAobW0V.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";const q={title:"UI/nuxeo-selectivity"},l={args:{label:"Label",placeholder:"Placeholder",required:!1,disabled:!1,invalid:!1,readonly:!1,minChars:0},render:e=>o`
    <style>
      nuxeo-selectivity {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <nuxeo-selectivity
      .data="${c}"
      label="${e.label}"
      placeholder="${e.placeholder}"
      ?required="${e.required}"
      ?disabled="${e.disabled}"
      ?invalid="${e.invalid}"
      ?readonly="${e.readonly}"
      min-chars="${e.minChars}"
    >
    </nuxeo-selectivity>
  `},a={args:{label:"Label",placeholder:"Placeholder",required:!1,disabled:!1,invalid:!1,readonly:!1,minChars:0},render:e=>o`
    <style>
      nuxeo-selectivity {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <nuxeo-selectivity
      .data="${c}"
      label="${e.label}"
      placeholder="${e.placeholder}"
      ?required="${e.required}"
      ?disabled="${e.disabled}"
      ?invalid="${e.invalid}"
      ?readonly="${e.readonly}"
      min-chars="${e.minChars}"
      multiple
    >
    </nuxeo-selectivity>
  `};var r,n,i;l.parameters={...l.parameters,docs:{...(r=l.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    required: false,
    disabled: false,
    invalid: false,
    readonly: false,
    minChars: 0
  },
  render: args => html\`
    <style>
      nuxeo-selectivity {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <nuxeo-selectivity
      .data="\${CITIES}"
      label="\${args.label}"
      placeholder="\${args.placeholder}"
      ?required="\${args.required}"
      ?disabled="\${args.disabled}"
      ?invalid="\${args.invalid}"
      ?readonly="\${args.readonly}"
      min-chars="\${args.minChars}"
    >
    </nuxeo-selectivity>
  \`
}`,...(i=(n=l.parameters)==null?void 0:n.docs)==null?void 0:i.source}}};var d,s,t;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    required: false,
    disabled: false,
    invalid: false,
    readonly: false,
    minChars: 0
  },
  render: args => html\`
    <style>
      nuxeo-selectivity {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <nuxeo-selectivity
      .data="\${CITIES}"
      label="\${args.label}"
      placeholder="\${args.placeholder}"
      ?required="\${args.required}"
      ?disabled="\${args.disabled}"
      ?invalid="\${args.invalid}"
      ?readonly="\${args.readonly}"
      min-chars="\${args.minChars}"
      multiple
    >
    </nuxeo-selectivity>
  \`
}`,...(t=(s=a.parameters)==null?void 0:s.docs)==null?void 0:t.source}}};const C=["Single","Multiple"];export{a as Multiple,l as Single,C as __namedExportsOrder,q as default};
