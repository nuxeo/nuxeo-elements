import { storiesOf } from '@storybook/polymer';
import { number } from '@storybook/addon-knobs';
import { html } from 'lit-html';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-actions-menu';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-link-button';

const iconsList = [
  { icon: 'nuxeo:edit', label: 'Edit' },
  { icon: 'nuxeo:attachment', label: 'Attachment' },
  { icon: 'nuxeo:dashboard', label: 'Dashboard' },
  { icon: 'nuxeo:add', label: 'Add' },
  { icon: 'nuxeo:delete', label: 'Delete' },
  { icon: 'nuxeo:download', label: 'Download' },
  { icon: 'nuxeo:export', label: 'Export' },
  { icon: 'nuxeo:edit', label: 'Edit' },
  { icon: 'nuxeo:attachment', label: 'Attachment' },
  { icon: 'nuxeo:dashboard', label: 'Dashboard' },
  { icon: 'nuxeo:add', label: 'Add' },
  { icon: 'nuxeo:delete', label: 'Delete' },
  { icon: 'nuxeo:download', label: 'Download' },
  { icon: 'nuxeo:export', label: 'Export' },
];

const label = 'Number of items';
const defaultValue = 5;
const options = {
  range: true,
  min: 1,
  max: iconsList.length + 1,
  step: 1,
};

storiesOf('UI/nuxeo-actions-menu', module).add('Default', () => {
  const value = number(label, defaultValue, options);
  const list = iconsList.slice(0, value);
  return html`
    <style>
      nuxeo-actions-menu {
        max-width: 300px;
      }
    </style>
    <nuxeo-actions-menu>
      ${list.map(
        (i) => html`
          <nuxeo-link-button href="javascript:void(0)" icon=${i.icon} label=${i.label}> </nuxeo-link-button>
        `,
      )}
    </nuxeo-actions-menu>
  `;
});
