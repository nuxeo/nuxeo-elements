import{b as r}from"./iframe-BOsZuRD5.js";import"./nuxeo-input-DmSsC08F.js";import"./nuxeo-textarea-CpdaWO0h.js";import"./nuxeo-date-picker-DVCmC2sB.js";import"./nuxeo-selectivity-BJtT1Z5H.js";import"./iron-data-table-CbNKSovv.js";import{D as m}from"./directory-suggestion.data-D0gaUgnf.js";import"./nuxeo-select-Bxx7ydOD.js";import{U as p}from"./user-suggestion.data-DoEbgwxv.js";import{c as a,L as u}from"./lists.data-Cg1ey1re.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-QGTu_0wa.js";import"./paper-input-BATGYxlC.js";import"./paper-input-behavior-DJZN1X1Z.js";import"./typography-D5Kg0VrV.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-DwvxVNwp.js";import"./default-theme-DSIY_Ouo.js";import"./iron-a11y-keys-behavior-Bowcpn4T.js";import"./nuxeo-i18n-behavior-rSe54NeH.js";import"./paper-textarea-u3V2zrvc.js";import"./paper-icon-button-D5khVTdX.js";import"./iron-icon-B9x3FBbS.js";import"./paper-inky-focus-behavior-BAtTMzZe.js";import"./paper-ripple-BWj0X3eM.js";import"./iron-icons-9naWcxsE.js";import"./iron-iconset-svg-DhGL9Wod.js";import"./nuxeo-icons-DBuhqV_Q.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-page-provider-display-behavior-wNfgFLRo.js";import"./iron-resizable-behavior-nA0Hq9eJ.js";import"./templatizer-behavior-BHJ57Wuh.js";import"./render-status-bYxDoUcQ.js";import"./nuxeo-dialog-D736a_Hi.js";import"./paper-material-styles-YDpzUOg2.js";import"./shadow-B2uLiFuq.js";import"./neon-animation-runner-behavior-DwSgv3bY.js";import"./paper-checkbox-C4NEI_el.js";import"./paper-checked-element-behavior-My9BU_hs.js";import"./paper-dialog-scrollable-Ip1CKN8O.js";import"./shadow-9ctAvhMv.js";import"./nuxeo-checkmark-5TUuN6sF.js";import"./nuxeo-tooltip-BXc9-NfH.js";import"./nuxeo-draggable-list-behavior-BduC1sCu.js";import"./iron-menu-behavior-DjRgJRGR.js";import"./paper-menu-button-C47XMPFI.js";import"./paper-item-behavior-C_a2uHn4.js";import"./iron-image-BxMOSoto.js";import"./nuxeo-user-avatar-DA7M2Qe6.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";const i=window.nuxeo.mock;i.respondWith("post","/api/v1/automation/Directory.SuggestEntries",()=>m);i.respondWith("post","/api/v1/automation/UserGroup.Suggestion",()=>p);const pe={title:"Widgets"},t={args:{label:"Label",placeholder:"Placeholder"},render:e=>r`
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
