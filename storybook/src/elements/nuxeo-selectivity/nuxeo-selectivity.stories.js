import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { boolean, number, text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-selectivity.js';
import { cities as CITIES } from '../../data/lists.data.js';

storiesOf('UI/nuxeo-selectivity', module)
  .add('Single', () => {
    const label = text('Label', 'Label');
    const placeholder = text('Placeholder', 'Placeholder');
    const required = boolean('Required', false);
    const disabled = boolean('Disabled', false);
    const invalid = boolean('Invalid', false);
    const readonly = boolean('Read only', false);
    const minChars = number('minChars', 0);
    return html`
      <style>
        nuxeo-selectivity {
          margin: 2rem;
          max-width: 300px;
        }
      </style>
      <nuxeo-selectivity
        .data="${CITIES}"
        label="${label}"
        placeholder="${placeholder}"
        ?required="${required}"
        ?disabled="${disabled}"
        ?invalid="${invalid}"
        ?readonly="${readonly}"
        min-chars="${minChars}"
      >
      </nuxeo-selectivity>
    `;
  })
  .add('Multiple', () => {
    const label = text('Label', 'Label');
    const placeholder = text('Placeholder', 'Placeholder');
    const required = boolean('Required', false);
    const disabled = boolean('Disabled', false);
    const invalid = boolean('Invalid', false);
    const readonly = boolean('Read only', false);
    const minChars = number('minChars', 0);
    return html`
      <style>
        nuxeo-selectivity {
          margin: 2rem;
          max-width: 300px;
        }
      </style>
      <nuxeo-selectivity
        .data="${CITIES}"
        label="${label}"
        placeholder="${placeholder}"
        ?required="${required}"
        ?disabled="${disabled}"
        ?invalid="${invalid}"
        ?readonly="${readonly}"
        min-chars="${minChars}"
        multiple
      >
      </nuxeo-selectivity>
    `;
  });
