import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-card';

const ICONS = {
  attachment: 'nuxeo:attachment',
  dashboard: 'nuxeo:dashboard',
  edit: 'nuxeo:edit',
  none: '',
};

export default {
  title: 'UI/nuxeo-card',
};

export const NuxeoCard = {
  args: {
    heading: 'About Nuxeo',
    icon: ICONS.attachment,
    collapsible: false,
    opened: false,
    content:
      'Nuxeo makes it easy to build smart content applications that enhance customer experiences, improve decision making, and accelerate products to market.',
  },
  argTypes: {
    icon: { control: 'select', options: Object.values(ICONS) },
  },
  render: (args) => html`
    <nuxeo-card
      heading="${args.heading}"
      icon="${args.icon}"
      ?collapsible="${args.collapsible}"
      ?opened="${args.opened}"
    >
      ${args.content}
    </nuxeo-card>
  `,
};
