import { html } from 'lit';
import { storiesOf } from '@storybook/polymer';
import { boolean, number, text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-textarea.js';

storiesOf('UI/nuxeo-textarea', module).add('Default', () => {
  const numberOfRows = number('Number of rows', 3);
  const label = text('Label', 'Label');
  const placeholder = text('Placeholder', 'This element represents a multi-line plain-text editing control');
  const required = boolean('Required', false);
  const disabled = boolean('Disabled', false);
  const invalid = boolean('Invalid', false);
  const readonly = boolean('Read only', false);
  return html`
    <style>
      nuxeo-textarea {
        max-width: 300px;
      }
    </style>
    <nuxeo-textarea
      label="${label}"
      name="description"
      rows="${numberOfRows}"
      placeholder="${placeholder}"
      ?required="${required}"
      ?disabled="${disabled}"
      ?invalid="${invalid}"
      ?readonly="${readonly}"
    >
    </nuxeo-textarea>
  `;
});
