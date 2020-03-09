import { storiesOf } from '@storybook/polymer';
import { boolean, color } from '@storybook/addon-knobs';
import { html } from 'lit-html';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-checkmark';

storiesOf('UI/nuxeo-checkmark', module).add('nuxeo-checkmark', () => {
  const bgColor = color('--nuxeo-checkmark-background-color', '#fffff', 'CSS variables');
  const bgColorChecked = color('--nuxeo-checkmark-background-color-checked', '#0000ff', 'CSS variables');
  const checked = boolean('checked', false);
  const disabled = boolean('disabled', false);
  return html`
    <style>
      * {
        --nuxeo-checkmark-background-color: ${bgColor};
        --nuxeo-checkmark-background-color-checked: ${bgColorChecked};
      }
    </style>
    <nuxeo-checkmark ?checked="${checked}" ?disabled="${disabled}"></nuxeo-checkmark>
  `;
});
