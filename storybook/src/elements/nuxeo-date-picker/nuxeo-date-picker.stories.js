import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date-picker';

export default {
  title: 'UI/nuxeo-date-picker',
};

export const NuxeoDatePicker = {
  args: {
    dateTime: new Date().getTime(),
    label: 'Choose a date',
  },
  argTypes: {
    dateTime: { control: 'date' },
  },
  render: (args) => html`
    <nuxeo-date-picker .value="${new Date(args.dateTime)}" label="${args.label}"></nuxeo-date-picker>
  `,
};
