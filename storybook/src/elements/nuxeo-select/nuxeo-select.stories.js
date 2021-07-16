import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { boolean, select, text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-select.js';
import { cities as CITIES } from '../../data/lists.data';

storiesOf('UI/nuxeo-select', module).add('Default', () => {
  const label = text('Label', 'Label');
  const placeholder = text('Placeholder', 'Placeholder');
  const errorMessage = text('Error message', 'Error message');
  const horizontalAlign = select('horizontalAlign', { left: 'left', right: 'right' }, 'left');
  const verticalAlign = select('verticalAlign', { top: 'top', bottom: 'bottom' }, 'top');
  const dynamicAlign = boolean('dynamicAlign', false);
  const readonly = boolean('Read only', false);
  const disabled = boolean('Disabled', false);
  const required = boolean('Required', false);
  return html`
    <style>
      .container {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <div class="container">
      <nuxeo-select
        label="${label}"
        placeholder="${placeholder}"
        error-message="${errorMessage}"
        .options="${CITIES}"
        .selected="${CITIES[0]}"
        horizontal-align="${horizontalAlign}"
        vertical-align="${verticalAlign}"
        ?dynamic-align="${dynamicAlign}"
        ?readonly="${readonly}"
        ?disabled="${disabled}"
        ?required="${required}"
      >
      </nuxeo-select>
    </div>
  `;
});
