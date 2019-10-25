import { storiesOf } from '@storybook/polymer';
import { text, boolean, number } from '@storybook/addon-knobs';
import { LIST } from '../../data/lists.data';
import { tableTemplate } from './nuxeo-data-table-structure.js';

const stories = storiesOf('UI/nuxeo-data-table', module);

stories
  .add('Empty', () => tableTemplate(LIST(0)))
  .add('Basic', () => {
    const numberOfItems = number('Number of items', 50);
    return tableTemplate(LIST(numberOfItems));
  })
  .add('Editable and Orderable', () => {
    const orderable = boolean('Orderable', true);
    const editable = boolean('Editable', true);
    const numberOfItems = number('Number of items', 50);
    return tableTemplate(Object.assign({}, LIST(numberOfItems), { orderable, editable }));
  })
  .add('Settings', () => {
    const settingsEnabled = boolean('Settings', true);
    const numberOfItems = number('Number of items', 50);
    return tableTemplate(Object.assign({}, LIST(numberOfItems), { settingsEnabled }));
  })
  .add('Selectable', () => {
    const selectionEnabled = boolean('Selection Enabled', true);
    const multiSelection = boolean('Multi Selection', false);
    const numberOfItems = number('Number of items', 50);
    return tableTemplate(Object.assign({}, LIST(numberOfItems), { selectionEnabled, multiSelection }));
  })
  .add('Complex', () => {
    const orderable = boolean('Orderable', true);
    const editable = boolean('Editable', true);
    const settingsEnabled = boolean('Settings', true);
    const selectionEnabled = boolean('Selection Enabled', true);
    const multiSelection = boolean('Multi Selection', false);
    const label = text('Label', 'Label');
    const required = boolean('Required', false);
    const hidden = boolean('Hide Date column', false);
    const alignRight = boolean('Align Right', false);
    const flex = number('Flex size on User column', undefined);
    const columnNumbers = {
      range: false,
      min: 0,
      max: 1,
      step: 1,
    };
    const orderColumn = number('Order Department column', 0, columnNumbers);
    const numberOfItems = number('Number of items', 50);
    return tableTemplate(
      Object.assign({}, LIST(numberOfItems), {
        orderable,
        editable,
        settingsEnabled,
        selectionEnabled,
        multiSelection,
        label,
        required,
        hidden,
        alignRight,
        flex,
        orderColumn,
      }),
    );
  });
