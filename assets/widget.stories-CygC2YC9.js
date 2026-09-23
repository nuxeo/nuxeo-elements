import{b as r}from"./iframe-DfANLok6.js";import"./nuxeo-input-DuqcUoUx.js";import"./nuxeo-textarea-zMQ3bOR9.js";import"./nuxeo-date-picker-CXC9AEsZ.js";import"./nuxeo-selectivity-DwX8wClL.js";import"./iron-data-table-CzZ3X19C.js";import{D as m}from"./directory-suggestion.data-Dkfix2EN.js";import"./nuxeo-select-CQwwEqNV.js";import{U as p}from"./user-suggestion.data-BYd6PGtq.js";import{c as a,L as u}from"./lists.data-Cg1ey1re.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-D22XWMWB.js";import"./paper-input-B8T425Tx.js";import"./paper-input-behavior-DGBlyaCy.js";import"./typography-Dsqr7jdM.js";import"./roboto-AfkCeElV.js";import"./iron-flex-layout-Cy57WvA0.js";import"./default-theme-sVFU976S.js";import"./iron-a11y-keys-behavior-CXq8UWKK.js";import"./nuxeo-i18n-behavior-DkDjknqP.js";import"./nuxeo-widget-validation-behavior-cLtHj9CV.js";import"./paper-textarea-CUnjIe5x.js";import"./paper-icon-button-BnBB_cCA.js";import"./iron-icon-Bt9a3Rhq.js";import"./paper-inky-focus-behavior-rjTRkVyf.js";import"./paper-ripple-CvfHxnYa.js";import"./iron-icons-Gq0N1TWG.js";import"./iron-iconset-svg-5-aE6F5a.js";import"./nuxeo-icons-Bm09xz8u.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-page-provider-display-behavior-oT_nqsn5.js";import"./iron-resizable-behavior-AZ17E4LT.js";import"./templatizer-behavior-Dh-bkegA.js";import"./render-status-DgSWxHM4.js";import"./nuxeo-dialog-DRutOyFJ.js";import"./paper-material-styles-CVTaxaU1.js";import"./shadow-CZKJlY6X.js";import"./neon-animation-runner-behavior-DA6rB6qM.js";import"./paper-checkbox-J2J5-AY4.js";import"./paper-checked-element-behavior-BrE1EYlL.js";import"./paper-dialog-scrollable-cZKEOOLz.js";import"./shadow-fPN8eZ5U.js";import"./nuxeo-checkmark-hJpRrYeJ.js";import"./nuxeo-tooltip-D6ydFGfA.js";import"./nuxeo-draggable-list-behavior-B1uVO71n.js";import"./iron-menu-behavior-BqEGeEci.js";import"./paper-menu-button-M3Il0SU0.js";import"./paper-item-behavior-BYdc6ASZ.js";import"./iron-image-iBBid9Md.js";import"./nuxeo-user-avatar-4t6XL0nA.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";const i=window.nuxeo.mock;i.respondWith("post","/api/v1/automation/Directory.SuggestEntries",()=>m);i.respondWith("post","/api/v1/automation/UserGroup.Suggestion",()=>p);const ue={title:"Widgets"},t={args:{label:"Label",placeholder:"Placeholder"},render:e=>r`
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
