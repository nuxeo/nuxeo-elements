import { storiesOf } from '@storybook/polymer';
import { text, boolean, number } from '@storybook/addon-knobs';
import { LIST_EMPTY, LIST } from '../../data/lists.data';
import { tableTemplate } from './nuxeo-data-table-structure.js';

const stories = storiesOf('UI/nuxeo-data-table', module);

stories
  .add('Empty', () => tableTemplate(LIST_EMPTY))
  .add('Basic', () => tableTemplate(LIST))
  .add('Editable and Orderable', () => {
    const orderable = boolean('Orderable', true);
    const editable = boolean('Editable', true);
    return tableTemplate(Object.assign({}, LIST, { orderable, editable }));
  })
  .add('Settings', () => {
    const settingsEnabled = boolean('Settings', true);
    return tableTemplate(Object.assign({}, LIST, { settingsEnabled }));
  })
  .add('Selectable', () => {
    const selectionEnabled = boolean('Selection Enabled', true);
    const multiSelection = boolean('Multi Selection', false);
    return tableTemplate(Object.assign({}, LIST, { selectionEnabled, multiSelection }));
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
    return tableTemplate(
      Object.assign({}, LIST, {
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
