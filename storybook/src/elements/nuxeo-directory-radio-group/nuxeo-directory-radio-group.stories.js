import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-directory-radio-group.js';
import { DIRECTORY_SUGGESTION_ENTRIES } from '../../data/directory-suggestion.data.js';

const server = window.nuxeo.mock;
server.respondWith('post', '/api/v1/automation/Directory.SuggestEntries', () => DIRECTORY_SUGGESTION_ENTRIES);

storiesOf('UI/nuxeo-directory-radio-group', module).add('Default', () => {
  const label = text('Label', 'Select language');
  return html`
    <style>
      .container {
        margin: 2rem;
      }
    </style>
    <div class="container">
      <nuxeo-directory-radio-group label="${label}" directory-name="language"> </nuxeo-directory-radio-group>
    </div>
  `;
});
