import{b as r}from"./iframe-T5hUCbnt.js";import"./nuxeo-input-ALfz038W.js";import"./nuxeo-textarea-27fdnwZF.js";import"./nuxeo-date-picker-SuZnc0dq.js";import"./nuxeo-selectivity-BuHqhYsn.js";import"./iron-data-table-Ckr-f-Eg.js";import{D as m}from"./directory-suggestion.data-D1hgwuh-.js";import"./nuxeo-select-DtKfhszt.js";import{U as p}from"./user-suggestion.data-C7bZVXzL.js";import{c as a,L as u}from"./lists.data-Cg1ey1re.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-DVOrdGp7.js";import"./paper-input-CgOMKcUj.js";import"./paper-input-behavior-BtXc_mnC.js";import"./typography-Bj6IP4r5.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-CQAobW0V.js";import"./default-theme-RhyFn9QU.js";import"./iron-a11y-keys-behavior-CQeU5Yru.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./paper-textarea-Cfq8k5ev.js";import"./paper-icon-button-BQJYUoC5.js";import"./iron-icon-lX3uy4jx.js";import"./paper-inky-focus-behavior-BFu4CTGP.js";import"./paper-ripple-e9CBUXzz.js";import"./iron-icons-B0EFH-ea.js";import"./iron-iconset-svg-bEbhiue4.js";import"./nuxeo-icons-DihWRFWD.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-page-provider-display-behavior-BXf2qcae.js";import"./iron-resizable-behavior-BJTBE6_U.js";import"./templatizer-behavior-BRsvGg6D.js";import"./render-status-BJmzACxi.js";import"./nuxeo-dialog-B7wOaaIF.js";import"./paper-material-styles-B1vejkc1.js";import"./shadow-B1sjh-5Q.js";import"./neon-animation-runner-behavior-mf0Oh3zj.js";import"./paper-checkbox-DJEpcUTk.js";import"./paper-checked-element-behavior-JkhbBuKO.js";import"./paper-dialog-scrollable-BWg20tOm.js";import"./shadow-BdVOAeUX.js";import"./nuxeo-checkmark-B2kpQSOl.js";import"./nuxeo-tooltip-BrXDqAUB.js";import"./nuxeo-draggable-list-behavior-CNLYXsWu.js";import"./iron-menu-behavior-BQTarcVj.js";import"./paper-menu-button-Sy7r6r-j.js";import"./paper-item-behavior-BIRtwU7m.js";import"./iron-image-BFdhxKpa.js";import"./nuxeo-user-avatar-Bs_vnqG5.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";const i=window.nuxeo.mock;i.respondWith("post","/api/v1/automation/Directory.SuggestEntries",()=>m);i.respondWith("post","/api/v1/automation/UserGroup.Suggestion",()=>p);const pe={title:"Widgets"},t={args:{label:"Label",placeholder:"Placeholder"},render:e=>r`
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
}`,...(o=(n=t.parameters)==null?void 0:n.docs)==null?void 0:o.source}}};const ue=["VerticalAlignmentConsistency"];export{t as VerticalAlignmentConsistency,ue as __namedExportsOrder,pe as default};
