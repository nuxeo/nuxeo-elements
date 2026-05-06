import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-directory-radio-group.js';
import { DIRECTORY_SUGGESTION_ENTRIES } from '../../data/directory-suggestion.data.js';

const server = window.nuxeo.mock;
server.respondWith('post', '/api/v1/automation/Directory.SuggestEntries', () => DIRECTORY_SUGGESTION_ENTRIES);

export default {
  title: 'UI/nuxeo-directory-radio-group',
};

export const Default = {
  args: {
    label: 'Select language',
  },
  render: (args) => html`
    <style>
      .container {
        margin: 2rem;
      }
    </style>
    <div class="container">
      <nuxeo-directory-radio-group label="${args.label}" directory-name="language"> </nuxeo-directory-radio-group>
    </div>
  `,
};
