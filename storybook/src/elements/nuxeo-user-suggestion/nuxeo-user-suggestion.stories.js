import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-user-suggestion.js';
import { USER_SUGGESTION_ENTRIES } from '../../data/user-suggestion.data';

const server = window.nuxeo.mock;
server.respondWith('post', '/api/v1/automation/UserGroup.Suggestion', () => USER_SUGGESTION_ENTRIES);

export default {
  title: 'UI/nuxeo-user-suggestion',
};

export const NuxeoUserSuggestion = {
  args: {
    label: 'Label',
    searchType: 'USER_GROUP_TYPE',
    multiple: false,
    stayOpenOnSelect: false,
    readonly: false,
    minChars: 0,
    placeholder: 'Placeholder',
  },
  argTypes: {
    searchType: { control: 'select', options: ['USER_TYPE', 'GROUP_TYPE', 'USER_GROUP_TYPE'] },
  },
  render: (args) => html`
    <style>
      .container {
        margin: 2rem;
        max-width: 300px;
      }
    </style>
    <div class="container">
      <nuxeo-user-suggestion
        label="${args.label}"
        .search-type="${args.searchType}"
        ?multiple="${args.multiple}"
        ?stay-open-on-select="${args.stayOpenOnSelect}"
        ?readonly="${args.readonly}"
        min-chars="${args.minChars}"
        placeholder="${args.placeholder}"
      >
      </nuxeo-user-suggestion>
    </div>
  `,
};
