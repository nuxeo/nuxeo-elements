import { html } from 'lit';
import { storiesOf } from '@storybook/polymer';
import { number } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/nuxeo-pagination-controls.js';

storiesOf('UI/nuxeo-pagination-controls', module).add('Nuxeo pagination', () => {
  const numberOfPages = number('Number of pages', 5);
  return html`
    <style include="nuxeo-styles">
      nuxeo-pagination-controls {
        margin: 2rem;
      }
    </style>
    <nuxeo-pagination-controls page="1" number-of-pages="${numberOfPages}"> </nuxeo-pagination-controls>
  `;
});
