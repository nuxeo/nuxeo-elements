import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-checkmark';

export default {
  title: 'UI/nuxeo-checkmark',
};

export const NuxeoCheckmark = {
  args: {
    bgColor: '#fffff',
    bgColorChecked: '#0000ff',
    checked: false,
    disabled: false,
  },
  argTypes: {
    bgColor: { control: 'color', name: '--nuxeo-checkmark-background-color' },
    bgColorChecked: { control: 'color', name: '--nuxeo-checkmark-background-color-checked' },
  },
  render: (args) => html`
    <style>
      * {
        --nuxeo-checkmark-background-color: ${args.bgColor};
        --nuxeo-checkmark-background-color-checked: ${args.bgColorChecked};
      }
    </style>
    <nuxeo-checkmark ?checked="${args.checked}" ?disabled="${args.disabled}"></nuxeo-checkmark>
  `,
};
