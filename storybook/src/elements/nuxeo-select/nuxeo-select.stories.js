import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-select.js';
import { cities as CITIES } from '../../data/lists.data';

export default {
  title: 'UI/nuxeo-select',
};

export const Default = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    errorMessage: 'Error message',
    horizontalAlign: 'left',
    verticalAlign: 'top',
    dynamicAlign: false,
    readonly: false,
    disabled: false,
    required: false,
  },
  argTypes: {
    horizontalAlign: { control: 'select', options: ['left', 'right'] },
    verticalAlign: { control: 'select', options: ['top', 'bottom'] },
  },
  render: (args) => html`
    <style>
      .container {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <div class="container">
      <nuxeo-select
        label="${args.label}"
        placeholder="${args.placeholder}"
        error-message="${args.errorMessage}"
        .options="${CITIES}"
        .selected="${CITIES[0]}"
        horizontal-align="${args.horizontalAlign}"
        vertical-align="${args.verticalAlign}"
        ?dynamic-align="${args.dynamicAlign}"
        ?readonly="${args.readonly}"
        ?disabled="${args.disabled}"
        ?required="${args.required}"
      >
      </nuxeo-select>
    </div>
  `,
};
