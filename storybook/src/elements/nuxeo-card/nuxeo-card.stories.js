import { storiesOf } from '@storybook/polymer';
import { text } from '@storybook/addon-knobs';
import { html } from 'lit-html';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-card';

const ICONS = {
  attachment: 'nuxeo:attachment',
  dashboard: 'nuxeo:dashboard',
  edit: 'nuxeo:edit',
  none: '',
};

storiesOf('UI/nuxeo-card', module).addElement('nuxeo-card', ({ knobs }) => {
  const { heading, collapsible, icon, opened } = knobs({
    heading: { value: 'Heading' },
    icon: { type: 'select', options: ICONS },
  });
  return html`
    <style>
      nuxeo-card {
        --nuxeo-card: {
          display: block;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.04) !important;
          font-family: var(--nuxeo-app-font);
          border-radius: 0;
          background-color: var(--nuxeo-box) !important;
        }
      }
    </style>
    <nuxeo-card heading="${heading}" icon="${icon}" ?collapsible="${collapsible}" ?opened="${opened}">
      ${text(
        'Content',
        `	
            Lorem ipsum dolor sit amet, consectetur adipiscing elit,	
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.	
          `,
      )}
    </nuxeo-card>
  `;
});
