import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs';
import { TABLE_EMPTY, TABLE } from '../mock/tables.mock';
import '@nuxeo/nuxeo-ui-elements/nuxeo-icons.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-data-table/iron-data-table.js';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date.js';
import '@nuxeo/nuxeo-elements/nuxeo-page-provider.js';

const stories = storiesOf('UI/nuxeo-data-table', module);
stories.addDecorator(withKnobs);

stories
  .add('Empty', () => {
    const emptyLabel = text('Empty Label', 'No result');
    return html`
      <nuxeo-data-table .items="${TABLE_EMPTY.properties.data}" empty-label="${emptyLabel}">
        <nuxeo-data-table-column name="Company">
          <template>
            [[item.company_name]]
          </template>
        </nuxeo-data-table-column>

        <nuxeo-data-table-column name="Date">
          <template>
            <nuxeo-date datetime="[[item.date]]"></nuxeo-date>
          </template>
        </nuxeo-data-table-column>

        <nuxeo-data-table-column name="Department">
          <template>
            [[item.department]]
          </template>
        </nuxeo-data-table-column>

        <nuxeo-data-table-column name="City">
          <template>
            [[item.city]]
          </template>
        </nuxeo-data-table-column>

        <nuxeo-data-table-column name="User">
          <template>
            [[item.user]]
          </template>
        </nuxeo-data-table-column>
      </nuxeo-data-table>
    `;
  })
  .add(
    'Default',
    () =>
      html`
        <nuxeo-data-table .items="${TABLE.properties.data}">
          <nuxeo-data-table-column name="Company">
            <template>
              [[item.company_name]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="Date">
            <template>
              <nuxeo-date datetime="[[item.date]]"></nuxeo-date>
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="Department">
            <template>
              [[item.department]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="City">
            <template>
              [[item.city]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="User">
          <nuxeo-data-table-column filter-by="dc_creator_agg">
            <template>
              [[item.user]]
            </template>
          </nuxeo-data-table-column>
        </nuxeo-data-table>
      `,
  )
  .add('Editable and Orderable', () => {
    const orderable = boolean('Orderable', true);
    const editable = boolean('Editable', true);

    return html`
        <nuxeo-data-table
          .items="${TABLE.properties.data}"
          ?editable="${editable}"
          ?orderable="${orderable}"
          >
          <nuxeo-data-table-column name="Company">
            <template>
              [[item.company_name]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="Date">
            <template>
              <nuxeo-date datetime="[[item.date]]"></nuxeo-date>
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="Department">
            <template>
              [[item.department]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="City">
            <template>
              [[item.city]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="User">
          <nuxeo-data-table-column filter-by="dc_creator_agg">
            <template>
              [[item.user]]
            </template>
          </nuxeo-data-table-column>
        </nuxeo-data-table>
      `;
  })
  .add('Settings', () => {
    const settingsEnabled = boolean('Settings', true);
    return html`
        <nuxeo-data-table
          .items="${TABLE.properties.data}"
          ?settings-enabled="${settingsEnabled}"
          >
          <nuxeo-data-table-column name="Company">
            <template>
              [[item.company_name]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="Date">
            <template>
              <nuxeo-date datetime="[[item.date]]"></nuxeo-date>
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="Department">
            <template>
              [[item.department]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="City">
            <template>
              [[item.city]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="User">
          <nuxeo-data-table-column filter-by="dc_creator_agg">
            <template>
              [[item.user]]
            </template>
          </nuxeo-data-table-column>
        </nuxeo-data-table>
      `;
  })
  .add('Selectable', () => {
    const selectionEnabled = boolean('Selection Enabled', true);
    const multiSelection = boolean('Multi Selection', false);

    return html`
        <nuxeo-data-table
          .items="${TABLE.properties.data}"
          ?selection-enabled="${selectionEnabled}"
          ?multi-selection="${multiSelection}"
          >
          <nuxeo-data-table-column name="Company">
            <template>
              [[item.company_name]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="Date">
            <template>
              <nuxeo-date datetime="[[item.date]]"></nuxeo-date>
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="Department">
            <template>
              [[item.department]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="City">
            <template>
              [[item.city]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="User">
          <nuxeo-data-table-column filter-by="dc_creator_agg">
            <template>
              [[item.user]]
            </template>
          </nuxeo-data-table-column>
        </nuxeo-data-table>
      `;
  })
  .add('Complex table', () => {
    const orderable = boolean('Orderable', true);
    const editable = boolean('Editable', true);
    const settingsEnabled = boolean('Settings', true);
    const selectionEnabled = boolean('Selection Enabled', true);
    const multiSelection = boolean('Multi Selection', false);
    const detailsEnabled = boolean('Details Enabled', false);
    const paginable = boolean('Paginable', false);
    const label = text('Label', 'Label');
    const errorMessage = text('Error message', 'Error message');
    const required = boolean('Required', false);
    const hidden = boolean('Hide Date column', false);
    const alignRight = boolean('Align Right', false);
    const flex = number('Flex', undefined);
    const columnNumbers = {
      range: false,
      min: 0,
      max: 1,
      step: 1,
    };
    const orderColumn = number('Order Department column', 0, columnNumbers);

    return html`
        <nuxeo-data-table
          .items="${TABLE.properties.data}"
          ?editable="${editable}"
          ?orderable="${orderable}"
          ?selection-enabled="${selectionEnabled}"
          ?multi-selection="${multiSelection}"
          ?settings-enabled="${settingsEnabled}"
          ?details-enabled="${detailsEnabled}"
          ?paginable="${paginable}"
          label="${label}"
          ?required="${required}"
          error-message="${errorMessage}"
          >
          <nuxeo-data-table-column name="Company" sort-by="[[item.company_name]]">
            <template>
              [[item.company_name]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="Date" ?hidden="${hidden}">
            <template>
              <nuxeo-date datetime="[[item.date]]"></nuxeo-date>
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="Department" order="${orderColumn}">
            <template>
              [[item.department]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="City" ?align-right="${alignRight}">
            <template>
              [[item.city]]
            </template>
          </nuxeo-data-table-column>

          <nuxeo-data-table-column name="User" flex="${flex}">
          <nuxeo-data-table-column filter-by="dc_creator_agg">
            <template>
              [[item.user]]
            </template>
          </nuxeo-data-table-column>
        </nuxeo-data-table>
      `;
  });
