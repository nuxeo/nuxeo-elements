import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-input';

export default {
  title: 'UI/nuxeo-input',
};

export const NuxeoInput = {
  args: {
    type: 'text',
    label: 'Label',
    placeholder: 'Placeholder',
    errorMessage: '',
    readonly: false,
    disabled: false,
    required: false,
    invalid: false,
    autofocus: false,
    minlength: 0,
    maxLength: 10,
    min: 0,
    max: 100,
    step: 1,
    invalidColor: '#de350b',
  },
  argTypes: {
    type: { control: 'select', options: ['email', 'number', 'password', 'tel', 'text', 'url'] },
    invalidColor: { control: 'color' },
  },
  render: (args) => html`
    <style>
      nuxeo-input {
        margin: 2rem;
        max-width: 300px;
        --paper-input-container-invalid-color: ${args.invalidColor};
      }
    </style>
    <nuxeo-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      error-message="${args.errorMessage}"
      ?autofocus="${args.autofocus}"
      ?readonly="${args.readonly}"
      ?disabled="${args.disabled}"
      ?required="${args.required}"
      minlength="${args.minlength}"
      maxlength="${args.maxLength}"
      min="${args.min}"
      max="${args.max}"
      step="${args.step}"
      ?invalid="${args.invalid}"
      label="${args.label}"
    >
    </nuxeo-input>
  `,
};
