import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-actions-menu';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-link-button';
import iconMap from '../../lists/icons';

const iconsList = iconMap.nuxeo;

export default {
  title: 'UI/nuxeo-actions-menu',
};

export const Default = {
  args: { numberOfItems: 5 },
  argTypes: {
    numberOfItems: { control: { type: 'range', min: 1, max: iconsList.length + 1, step: 1 } },
  },
  render: (args) => {
    const list = iconsList.slice(0, args.numberOfItems);
    return html`
      <style>
        nuxeo-actions-menu {
          max-width: 300px;
        }
      </style>
      <nuxeo-actions-menu>
        ${list.map(
          (i) =>
            html`
              <nuxeo-link-button href="#" icon=${i} label=${i}> </nuxeo-link-button>
            `,
        )}
      </nuxeo-actions-menu>
    `;
  },
};
