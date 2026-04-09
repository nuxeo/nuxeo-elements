import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-selectivity.js';
import { cities as CITIES } from '../../data/lists.data.js';

export default {
  title: 'UI/nuxeo-selectivity',
};

export const Single = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    required: false,
    disabled: false,
    invalid: false,
    readonly: false,
    minChars: 0,
  },
  render: (args) => html`
    <style>
      nuxeo-selectivity {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <nuxeo-selectivity
      .data="${CITIES}"
      label="${args.label}"
      placeholder="${args.placeholder}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
      ?invalid="${args.invalid}"
      ?readonly="${args.readonly}"
      min-chars="${args.minChars}"
    >
    </nuxeo-selectivity>
  `,
};

export const Multiple = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    required: false,
    disabled: false,
    invalid: false,
    readonly: false,
    minChars: 0,
  },
  render: (args) => html`
    <style>
      nuxeo-selectivity {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <nuxeo-selectivity
      .data="${CITIES}"
      label="${args.label}"
      placeholder="${args.placeholder}"
      ?required="${args.required}"
      ?disabled="${args.disabled}"
      ?invalid="${args.invalid}"
      ?readonly="${args.readonly}"
      min-chars="${args.minChars}"
      multiple
    >
    </nuxeo-selectivity>
  `,
};
