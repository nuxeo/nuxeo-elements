import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { boolean, number, select, text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-user-suggestion.js';
import { USER_SUGGESTION_ENTRIES } from '../../data/user-suggestion.data';

const server = window.nuxeo.mock;
server.respondWith('post', '/api/v1/automation/UserGroup.Suggestion', () => USER_SUGGESTION_ENTRIES);
storiesOf('UI/nuxeo-user-suggestion', module).add('nuxeo-user-suggestion', () => {
  const label = text('Label', 'Label');
  const searchType = select(
    'searchType',
    {
      USER_TYPE: 'USER_TYPE',
      GROUP_TYPE: 'GROUP_TYPE',
      USER_GROUP_TYPE: 'USER_GROUP_TYPE',
    },
    'USER_GROUP_TYPE',
  );
  const multiple = boolean('multiple', false);
  const stayOpenOnSelect = boolean('stayOpenOnSelect', false);
  const readonly = boolean('readonly', false);
  const minChars = number('minChars', 0);
  const placeholder = text('Placeholder', 'Placeholder');
  return html`
    <style>
      .container {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <div class="container">
      <nuxeo-user-suggestion
        label="${label}"
        .search-type="${searchType}"
        ?multiple="${multiple}"
        ?stay-open-on-select="${stayOpenOnSelect}"
        ?readonly="${readonly}"
        min-chars="${minChars}"
        placeholder="${placeholder}"
      >
      </nuxeo-user-suggestion>
    </div>
  `;
});
