import { storiesOf } from '@storybook/polymer';
import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/nuxeo-document-picker/nuxeo-document-picker.js';
import { codePanelTemplate } from '../code-panel-template.js';

window.nuxeo.I18n.en['pickerSearch.title'] = 'Quick Search';
window.nuxeo.I18n.en['searchResults.noResults'] = 'No documents match the search criteria.';

storiesOf('UI/nuxeo-document-picker', module).add(
  'nuxeo-document-picker',
  () => html`
    <style>
      button {
        padding: 1em;
      }
      button,
      span.info {
        display: flex;
        margin: 1em 0 0 1em;
      }
      nuxeo-document-picker {
        --nuxeo-document-picker-dialog-max-height: calc(100% - 24px);
        --nuxeo-document-picker-dialog-max-width: calc(100% - 24px);
      }
    </style>
    <nuxeo-document-picker
      href-base="layouts/search/"
      provider="picker"
      page-size="40"
      schemas="dublincore,file"
      enrichers="thumbnail,permissions,highlight"
      search-name="picker"
      @picked="${(e) => {
        const picked = e.detail.selectedItems;
        const span = e.target.parentElement.querySelector('span.info');
        span.innerText = `${picked.length} document(s) picked (${picked.map((doc) => doc.title).join(', ')})`;
      }}"
    ></nuxeo-document-picker>
    <button @click=${(e) => e.target.parentElement.querySelector('nuxeo-document-picker').open()}>
      Open the Document Picker
    </button>
    <span class="info">No documents picked.</span>
    ${codePanelTemplate('search/picker/nuxeo-picker-search-form.html')}
    ${codePanelTemplate('search/picker/nuxeo-picker-search-results.html')}
  `,
);
