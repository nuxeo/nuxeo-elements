import{b as r}from"./iframe-aDtHWxuA.js";import"./nuxeo-input-BcgTEv-x.js";import"./nuxeo-textarea-CtphmWou.js";import"./nuxeo-date-picker-CK0rWmjB.js";import"./nuxeo-selectivity-Zp3e61Qz.js";import"./iron-data-table-0B_bDz1I.js";import{D as m}from"./directory-suggestion.data-BiXLG4xA.js";import"./nuxeo-select-DXDvNzgX.js";import{U as p}from"./user-suggestion.data-DbrKmbqZ.js";import{c as a,L as u}from"./lists.data-Cg1ey1re.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-BhRorwMT.js";import"./paper-input-DT0XC6Tq.js";import"./paper-input-behavior-ocEb3FBE.js";import"./typography-B0tNP4Nv.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-BaH3_w-d.js";import"./default-theme-D2eTFyK0.js";import"./iron-a11y-keys-behavior-C7f4H3Su.js";import"./nuxeo-i18n-behavior-DKHHaNJi.js";import"./nuxeo-widget-validation-behavior-C1npKkkK.js";import"./paper-textarea-vJQbdfFe.js";import"./paper-icon-button-CeYMakkp.js";import"./iron-icon-jrU-uo7K.js";import"./paper-inky-focus-behavior-D0cNeSN7.js";import"./paper-ripple-CvXK8Wn4.js";import"./iron-icons-DeZE89zk.js";import"./iron-iconset-svg-CL9hziFk.js";import"./nuxeo-icons-BOkmY6P9.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-page-provider-display-behavior-BuilUEWd.js";import"./iron-resizable-behavior-CVRHTtvv.js";import"./templatizer-behavior-CQc-YiEy.js";import"./render-status-BqZFeuJ7.js";import"./nuxeo-dialog-fpQK1Nvt.js";import"./paper-material-styles-CeDe8pnr.js";import"./shadow-0lJZW1_x.js";import"./neon-animation-runner-behavior-C740WMdn.js";import"./paper-checkbox-CtM8erEi.js";import"./paper-checked-element-behavior-CK7xlSsy.js";import"./paper-dialog-scrollable-__Ojgeia.js";import"./shadow-Dzvxzl5A.js";import"./nuxeo-checkmark-BCYqY_T2.js";import"./nuxeo-tooltip-AwropsMf.js";import"./nuxeo-draggable-list-behavior-DK1iwgWX.js";import"./iron-menu-behavior-BSglCIn4.js";import"./paper-menu-button-krnqTS4r.js";import"./paper-item-behavior-DlWeQVk1.js";import"./iron-image-BVGRVncu.js";import"./nuxeo-user-avatar-OdS7vHZy.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";const i=window.nuxeo.mock;i.respondWith("post","/api/v1/automation/Directory.SuggestEntries",()=>m);i.respondWith("post","/api/v1/automation/UserGroup.Suggestion",()=>p);const ue={title:"Widgets"},t={args:{label:"Label",placeholder:"Placeholder"},render:e=>r`
    <style>
      .container {
        margin: 2rem;
      }
      .row {
        display: flex;
        justify-content: space-between;
      }
      .row > * {
        width: 32%;
      }
    </style>
    <div class="container">
      <div class="row">
        <nuxeo-input label="${e.label}" placeholder="${e.placeholder}"></nuxeo-input>
        <nuxeo-date-picker label="${e.label}" placeholder="${e.placeholder}"></nuxeo-date-picker>
        <nuxeo-textarea label="${e.label}" placeholder="${e.placeholder}"></nuxeo-textarea>
      </div>
      <div class="row">
        <nuxeo-selectivity .data="${a}" label="${e.label}" placeholder="${e.placeholder}" min-chars="0">
        </nuxeo-selectivity>
        <nuxeo-selectivity
          .data="${a}"
          label="${e.label}"
          placeholder="${e.placeholder}"
          min-chars="0"
          multiple
        >
        </nuxeo-selectivity>
        <nuxeo-input label="${e.label}" placeholder="${e.placeholder}"></nuxeo-input>
      </div>
      <div class="row">
        <nuxeo-user-suggestion label="${e.label}" placeholder="${e.placeholder}"></nuxeo-user-suggestion>
        <nuxeo-selectivity
          .data="${a}"
          label="${e.label}"
          placeholder="${e.placeholder}"
          min-chars="0"
          multiple
        >
        </nuxeo-selectivity>
        <nuxeo-input label="${e.label}" placeholder="${e.placeholder}"></nuxeo-input>
      </div>
      <div class="row">
        <nuxeo-data-table
          .items="${u(5).data}"
          editable
          orderable
          settings-enabled
          selection-enabled
          multi-selection
          details-enabled
        >
          <nuxeo-data-table-column name="Image">
            <template>
              <nuxeo-document-thumbnail document="[[item]]"></nuxeo-document-thumbnail>
            </template>
          </nuxeo-data-table-column>
          <nuxeo-data-table-column name="Company">
            <template>
              [[item.properties.company_name]]
            </template>
          </nuxeo-data-table-column>
          <nuxeo-data-table-column name="Date">
            <template>
              <nuxeo-date datetime="[[item.properties.date]]"></nuxeo-date>
            </template>
          </nuxeo-data-table-column>
          <nuxeo-data-table-column name="Department">
            <template>
              [[item.properties.department]]
            </template>
          </nuxeo-data-table-column>
          <nuxeo-data-table-column name="City">
            <template>
              [[item.properties.city]]
            </template>
          </nuxeo-data-table-column>
          <nuxeo-data-table-column name="User">
            <template>
              <nuxeo-user-tag user="[[item.properties.user]]" disabled></nuxeo-user-tag>
            </template>
          </nuxeo-data-table-column>
        </nuxeo-data-table>
      </div>
    </div>
  `};var l,n,o;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    label: 'Label',
    placeholder: 'Placeholder'
  },
  render: args => html\`
    <style>
      .container {
        margin: 2rem;
      }
      .row {
        display: flex;
        justify-content: space-between;
      }
      .row > * {
        width: 32%;
      }
    </style>
    <div class="container">
      <div class="row">
        <nuxeo-input label="\${args.label}" placeholder="\${args.placeholder}"></nuxeo-input>
        <nuxeo-date-picker label="\${args.label}" placeholder="\${args.placeholder}"></nuxeo-date-picker>
        <nuxeo-textarea label="\${args.label}" placeholder="\${args.placeholder}"></nuxeo-textarea>
      </div>
      <div class="row">
        <nuxeo-selectivity .data="\${CITIES}" label="\${args.label}" placeholder="\${args.placeholder}" min-chars="0">
        </nuxeo-selectivity>
        <nuxeo-selectivity
          .data="\${CITIES}"
          label="\${args.label}"
          placeholder="\${args.placeholder}"
          min-chars="0"
          multiple
        >
        </nuxeo-selectivity>
        <nuxeo-input label="\${args.label}" placeholder="\${args.placeholder}"></nuxeo-input>
      </div>
      <div class="row">
        <nuxeo-user-suggestion label="\${args.label}" placeholder="\${args.placeholder}"></nuxeo-user-suggestion>
        <nuxeo-selectivity
          .data="\${CITIES}"
          label="\${args.label}"
          placeholder="\${args.placeholder}"
          min-chars="0"
          multiple
        >
        </nuxeo-selectivity>
        <nuxeo-input label="\${args.label}" placeholder="\${args.placeholder}"></nuxeo-input>
      </div>
      <div class="row">
        <nuxeo-data-table
          .items="\${LIST(5).data}"
          editable
          orderable
          settings-enabled
          selection-enabled
          multi-selection
          details-enabled
        >
          <nuxeo-data-table-column name="Image">
            <template>
              <nuxeo-document-thumbnail document="[[item]]"></nuxeo-document-thumbnail>
            </template>
          </nuxeo-data-table-column>
          <nuxeo-data-table-column name="Company">
            <template>
              [[item.properties.company_name]]
            </template>
          </nuxeo-data-table-column>
          <nuxeo-data-table-column name="Date">
            <template>
              <nuxeo-date datetime="[[item.properties.date]]"></nuxeo-date>
            </template>
          </nuxeo-data-table-column>
          <nuxeo-data-table-column name="Department">
            <template>
              [[item.properties.department]]
            </template>
          </nuxeo-data-table-column>
          <nuxeo-data-table-column name="City">
            <template>
              [[item.properties.city]]
            </template>
          </nuxeo-data-table-column>
          <nuxeo-data-table-column name="User">
            <template>
              <nuxeo-user-tag user="[[item.properties.user]]" disabled></nuxeo-user-tag>
            </template>
          </nuxeo-data-table-column>
        </nuxeo-data-table>
      </div>
    </div>
  \`
}`,...(o=(n=t.parameters)==null?void 0:n.docs)==null?void 0:o.source}}};const de=["VerticalAlignmentConsistency"];export{t as VerticalAlignmentConsistency,de as __namedExportsOrder,ue as default};
