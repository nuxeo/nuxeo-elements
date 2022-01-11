import { storiesOf } from '@storybook/polymer';
import { boolean, color, number, select, text } from '@storybook/addon-knobs';
import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input';

storiesOf('UI/nuxeo-input', module).add('nuxeo-input', () => {
  const listOfTypes = ['email', 'number', 'password', 'tel', 'text', 'url'];
  const type = select('Type', listOfTypes, 'text');
  const label = text('Label', 'Label');
  const placeholder = text('Placeholder', 'Placeholder');
  const errorMessage = text('Error message', '');
  const readOnly = boolean('readonly', false);
  const disabled = boolean('Disabled', false);
  const required = boolean('Required', false);
  const invalid = boolean('Invalid', false);
  const autoFocus = boolean('Autofocus', false);
  const minLength = number('minlength', 0);
  const maxLength = number('maxLength', 10);
  const min = number('min', 0);
  const max = number('max', 100);
  const step = number('Step', 1);
  const invalidColor = color('--paper-input-container-invalid-color', '#de350b', 'CSS variables');

  return html`
    <style>
      nuxeo-input {
        margin: 2rem;
        max-width: 300px;
        --paper-input-container-invalid-color: ${invalidColor};
      }
    </style>
    <nuxeo-input
      type="${type}"
      placeholder="${placeholder}"
      error-message="${errorMessage}"
      auto-focus="${autoFocus}"
      ?readonly="${readOnly}"
      ?disabled="${disabled}"
      ?required="${required}"
      minlength="${minLength}"
      maxlength="${maxLength}"
      min="${min}"
      max="${max}"
      step="${step}"
      ?invalid="${invalid}"
      label="${label}"
    >
    </nuxeo-input>
  `;
});
