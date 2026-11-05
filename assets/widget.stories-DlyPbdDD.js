import{b as r}from"./iframe-Yfd-OibJ.js";import"./nuxeo-input-p47yJwqB.js";import"./nuxeo-textarea-ApvyO0Ss.js";import"./nuxeo-date-picker-CSTRhU0M.js";import"./nuxeo-selectivity-DDZCiJ_D.js";import"./iron-data-table-Dg-GuZGe.js";import{D as m}from"./directory-suggestion.data-D31xSQgE.js";import"./nuxeo-select-DB1dNwCp.js";import{U as p}from"./user-suggestion.data-DFHCi1k7.js";import{c as a,L as u}from"./lists.data-Cg1ey1re.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-6vvyaykN.js";import"./paper-input-vp--8Vkr.js";import"./paper-input-behavior-z3P3ngPl.js";import"./typography-C7rYHizi.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-Db70X-7Q.js";import"./default-theme-DZcntQFC.js";import"./iron-a11y-keys-behavior-BQM3k0wN.js";import"./nuxeo-i18n-behavior-BhQ-sx4z.js";import"./nuxeo-widget-validation-behavior-DxbuVDIy.js";import"./paper-textarea-BB_u7IeO.js";import"./paper-icon-button-D9_twpz5.js";import"./iron-icon-DGiq-Trn.js";import"./paper-inky-focus-behavior-BHRRPMpt.js";import"./paper-ripple-DDInChqF.js";import"./iron-icons-BDAKcWdk.js";import"./iron-iconset-svg-DAB2Qn14.js";import"./nuxeo-icons-B4q9ae3o.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-page-provider-display-behavior-ebLKsnvq.js";import"./iron-resizable-behavior-D7uxPWIp.js";import"./templatizer-behavior-vG_cb1KN.js";import"./render-status-BVnGG85N.js";import"./nuxeo-dialog-Dw_pdDpA.js";import"./paper-material-styles-C_zSstGc.js";import"./shadow-5Ga7wkF4.js";import"./neon-animation-runner-behavior-BtBYKrDJ.js";import"./paper-checkbox-DVoOtD6S.js";import"./paper-checked-element-behavior-CSt9lHWm.js";import"./paper-dialog-scrollable-DIkusbjJ.js";import"./shadow-BmGULn5N.js";import"./nuxeo-checkmark-Dhs4NbV5.js";import"./nuxeo-tooltip-BBNPEObS.js";import"./nuxeo-draggable-list-behavior-CWlok0Pc.js";import"./iron-menu-behavior-tLsCTQb6.js";import"./paper-menu-button-BbyG7-Ch.js";import"./paper-item-behavior-BEOY3_fR.js";import"./iron-image-D2ZqewLv.js";import"./nuxeo-user-avatar-B0IdPI9j.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";const i=window.nuxeo.mock;i.respondWith("post","/api/v1/automation/Directory.SuggestEntries",()=>m);i.respondWith("post","/api/v1/automation/UserGroup.Suggestion",()=>p);const ue={title:"Widgets"},t={args:{label:"Label",placeholder:"Placeholder"},render:e=>r`
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
