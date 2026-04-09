import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-textarea.js';

export default {
  title: 'UI/nuxeo-textarea',
};

export const Default = {
  args: {
    numberOfRows: 3,
    label: 'Label',
    placeholder: 'This element represents a multi-line plain-text editing control',
    required: false,
    disabled: false,
    invalid: false,
    readonly: false,
  },
  render: (args) => html`
    <style>
      nuxeo-textarea {
        max-width: 300px;
      }
    </style>
    <nuxeo-textarea
      label="${args.label}"
      name="description"
      rows="${args.numberOfRows}"
      placeholder="${args.placeholder}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
      ?invalid="${args.invalid}"
      ?readonly="${args.readonly}"
    >
    </nuxeo-textarea>
  `,
};
