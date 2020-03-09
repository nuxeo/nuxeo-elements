import { storiesOf } from '@storybook/polymer';
import { number } from '@storybook/addon-knobs';
import { html } from 'lit-html';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-actions-menu';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-link-button';

storiesOf('UI/Widgets', module).addElement('nuxeo-actions-menu', ({ knobs }) => {
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
});
