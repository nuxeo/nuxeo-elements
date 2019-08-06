import { html } from 'lit-html';
import '@nuxeo/nuxeo-ui-elements/nuxeo-data-table/iron-data-table.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-document-thumbnail/nuxeo-document-thumbnail.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date.js';
import '../../../../ui/widgets/nuxeo-date-picker';
import '../../../.storybook/i18n';

export const tableTemplate = (params) =>
  html`
    <nuxeo-data-table
      .items="${params.data}"
      ?editable="${params.editable}"
      ?orderable="${params.orderable}"
      ?settings-enabled="${params.settingsEnabled}"
      ?selection-enabled="${params.selectionEnabled}"
      ?multi-selection="${params.multiSelection}"
      ?details-enabled="${params.detailsEnabled}"
      label="${!params.label ? '' : params.label}"
      ?required="${params.required}"
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

      <nuxeo-data-table-column name="Date" ?hidden="${params.hidden}">
        <template>
          <nuxeo-date datetime="[[item.properties.date]]"></nuxeo-date>
        </template>
      </nuxeo-data-table-column>

      <nuxeo-data-table-column name="Department" order="${params.orderColumn}">
        <template>
          [[item.properties.department]]
        </template>
      </nuxeo-data-table-column>

      <nuxeo-data-table-column name="City" ?align-right="${params.alignRight}">
        <template>
          [[item.properties.city]]
        </template>
      </nuxeo-data-table-column>

      <nuxeo-data-table-column name="User" flex="${params.flex}">
        <template>
          [[item.properties.user]]
        </template>
      </nuxeo-data-table-column>

      <nuxeo-data-table-form>
        <template>
          <nuxeo-input value="{{item.properties.company_name}}" label="Company" type="text"></nuxeo-input>
          <nuxeo-date-picker label="Date" value="{{item.properties.date}}"></nuxeo-date-picker>
          <nuxeo-input value="{{item.properties.department}}" label="Department" type="text"></nuxeo-input>
          <nuxeo-input value="{{item.properties.city}}" label="City" type="text"></nuxeo-input>
          <nuxeo-input value="{{item.properties.user}}" label="User" type="text"></nuxeo-input>
        </template>
      </nuxeo-data-table-form>
    </nuxeo-data-table>
  `;
