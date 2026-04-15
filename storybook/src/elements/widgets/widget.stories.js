import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-textarea.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date-picker.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-selectivity.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-data-table/iron-data-table.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-directory-radio-group.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-select.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-user-suggestion.js';
import { USER_SUGGESTION_ENTRIES } from '../../data/user-suggestion.data.js';
import { cities as CITIES, LIST } from '../../data/lists.data.js';
import { DIRECTORY_SUGGESTION_ENTRIES } from '../../data/directory-suggestion.data.js';

const server = window.nuxeo.mock;
server.respondWith('post', '/api/v1/automation/Directory.SuggestEntries', () => DIRECTORY_SUGGESTION_ENTRIES);
server.respondWith('post', '/api/v1/automation/UserGroup.Suggestion', () => USER_SUGGESTION_ENTRIES);

export default {
  title: 'Widgets',
};

export const VerticalAlignmentConsistency = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
  },
  render: (args) => html`
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
        <nuxeo-input label="${args.label}" placeholder="${args.placeholder}"></nuxeo-input>
        <nuxeo-date-picker label="${args.label}" placeholder="${args.placeholder}"></nuxeo-date-picker>
        <nuxeo-textarea label="${args.label}" placeholder="${args.placeholder}"></nuxeo-textarea>
      </div>
      <div class="row">
        <nuxeo-selectivity .data="${CITIES}" label="${args.label}" placeholder="${args.placeholder}" min-chars="0">
        </nuxeo-selectivity>
        <nuxeo-selectivity
          .data="${CITIES}"
          label="${args.label}"
          placeholder="${args.placeholder}"
          min-chars="0"
          multiple
        >
        </nuxeo-selectivity>
        <nuxeo-input label="${args.label}" placeholder="${args.placeholder}"></nuxeo-input>
      </div>
      <div class="row">
        <nuxeo-user-suggestion label="${args.label}" placeholder="${args.placeholder}"></nuxeo-user-suggestion>
        <nuxeo-selectivity
          .data="${CITIES}"
          label="${args.label}"
          placeholder="${args.placeholder}"
          min-chars="0"
          multiple
        >
        </nuxeo-selectivity>
        <nuxeo-input label="${args.label}" placeholder="${args.placeholder}"></nuxeo-input>
      </div>
      <div class="row">
        <nuxeo-data-table
          .items="${LIST(5).data}"
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
  `,
};
