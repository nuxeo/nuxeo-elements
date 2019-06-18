import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-link-button';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-actions-menu';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-card';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-checkmark';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-date-picker';
import { storiesOf } from '@storybook/polymer';
import { color, text, number } from '@storybook/addon-knobs';
import { html } from 'lit-html';

const ICONS = {
  attachment: 'nuxeo:attachment',
  dashboard: 'nuxeo:dashboard',
  edit: 'nuxeo:edit',
  none: '',
};

storiesOf('UI/Widgets', module)
  .addElement('nuxeo-actions-menu', ({ knobs }) => {
    knobs();
    return html`
      <style>
        nuxeo-actions-menu {
          max-width: 300px;
        }
      </style>
      <nuxeo-actions-menu>
        ${Array.from({ length: number('# actions', 10) }).map(
          () => html`
            <nuxeo-link-button href="javascript:void(0)" icon="nuxeo:edit" label="Dummy"></nuxeo-link-button>
          `,
        )}
      </nuxeo-actions-menu>
    `;
  })

  .addElement('nuxeo-checkmark', ({ knobs }) => {
    const { checked, disabled } = knobs();

    const bgColor = color('--nuxeo-checkmark-background-color', '#fffff', 'CSS variables');
    const bgColorChecked = color('--nuxeo-checkmark-background-color-checked', '#0000ff', 'CSS variables');
    return html`
      <style>
        * {
          --nuxeo-checkmark-background-color: ${bgColor};
          --nuxeo-checkmark-background-color-checked: ${bgColorChecked};
        }
      </style>
      <nuxeo-checkmark ?checked="${checked}" ?disabled="${disabled}"></nuxeo-checkmark>
    `;
  })

  .addElement('nuxeo-card', ({ knobs }) => {
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
  })

  .addElement('nuxeo-date-picker', ({ knobs }) => {
    const { value } = knobs();
    return html`
      <nuxeo-date-picker .value="${value}"></nuxeo-date-picker>
    `;
  });
