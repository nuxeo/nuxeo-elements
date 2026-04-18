import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date';

export default {
  title: 'UI/nuxeo-date',
};

export const NuxeoDate = {
  args: {
    dateTime: new Date().getTime(),
    format: 'MMM D, YYYY',
    tooltipFormat: 'MMMM D, YYYY HH:mm',
  },
  argTypes: {
    dateTime: { control: 'date' },
    format: { control: 'select', options: ['MMM D, YYYY', 'MMMM D, YYYY HH:mm', 'relative'] },
    tooltipFormat: { control: 'select', options: ['MMMM D, YYYY HH:mm', 'relative'] },
  },
  render: (args) => html`
    <nuxeo-date datetime=${new Date(args.dateTime)} format="${args.format}" tooltip-format="${args.tooltipFormat}" />
  `,
};
