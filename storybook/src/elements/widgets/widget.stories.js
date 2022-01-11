import { html } from 'lit';
import { storiesOf } from '@storybook/polymer';
import { text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-textarea.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date-picker.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-selectivity.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-data-table/iron-data-table.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-directory-radio-group.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-select.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-user-suggestion.js';
import { USER_SUGGESTION_ENTRIES } from '../../data/user-suggestion.data';
import { cities as CITIES, LIST } from '../../data/lists.data';
import { DIRECTORY_SUGGESTION_ENTRIES } from '../../data/directory-suggestion.data.js';

const server = window.nuxeo.mock;
server.respondWith('post', '/api/v1/automation/Directory.SuggestEntries', () => DIRECTORY_SUGGESTION_ENTRIES);
server.respondWith('post', '/api/v1/automation/UserGroup.Suggestion', () => USER_SUGGESTION_ENTRIES);

storiesOf('Widgets', module).add('Vertical Alignment Consistency', () => {
  const label = text('Label', 'Label');
  const placeholder = text('Placeholder', 'Placeholder');
  return html`
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
        <nuxeo-input label="${label}" placeholder="${placeholder}"></nuxeo-input>
        <nuxeo-date-picker label="${label}" placeholder="${placeholder}"></nuxeo-date-picker>
        <nuxeo-textarea label="${label}" placeholder="${placeholder}"></nuxeo-textarea>
      </div>
      <div class="row">
        <nuxeo-selectivity .data="${CITIES}" label="${label}" placeholder="${placeholder}" min-chars="0">
        </nuxeo-selectivity>
        <nuxeo-selectivity .data="${CITIES}" label="${label}" placeholder="${placeholder}" min-chars="0" multiple>
        </nuxeo-selectivity>
        <nuxeo-input label="${label}" placeholder="${placeholder}"></nuxeo-input>
      </div>
      <div class="row">
        <nuxeo-user-suggestion label="${label}" placeholder="${placeholder}"></nuxeo-user-suggestion>
        <nuxeo-selectivity .data="${CITIES}" label="${label}" placeholder="${placeholder}" min-chars="0" multiple>
        </nuxeo-selectivity>
        <nuxeo-input label="${label}" placeholder="${placeholder}"></nuxeo-input>
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
        <nuxeo-select label="${label}" placeholder="${placeholder}" .options="${CITIES}"></nuxeo-select>
        <nuxeo-directory-radio-group label="${label}" directory-name="language"> </nuxeo-directory-radio-group>
      </div>
    </div>
  `;
});
