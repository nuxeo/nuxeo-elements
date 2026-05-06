import { html } from 'lit';
import { analyse } from '../../../.storybook/analysis';
import { LIST } from '../../data/lists.data.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-justified-grid/nuxeo-justified-grid.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-justified-grid/nuxeo-justified-grid-item.js';

const docs = analyse('nuxeo-justified-grid').notes;
const server = window.nuxeo.mock;

export default {
  title: 'UI/nuxeo-justified-grid',
  parameters: {
    docs: { description: { component: docs } },
  },
};

export const Empty = {
  render: () =>
    html`
      <nuxeo-justified-grid></nuxeo-justified-grid>
    `,
};

export const Default = {
  args: { numberOfItems: 50 },
  render: (args) => {
    server.respondWith('GET', '/api/v1/search/pp/default_search/execute', {
      'entity-type': 'documents',
      entries: LIST(args.numberOfItems).data,
      currentPage: 1,
      numberOfPages: 1,
      resultsCount: args.numberOfItems,
      offset: 0,
      pageSize: args.numberOfItems,
      isPreviousPageAvailable: false,
      currentPageSize: args.numberOfItems,
    });
    return html`
      <style>
        nuxeo-justified-grid {
          height: 300px;
        }
      </style>
      <nuxeo-page-provider
        id="provider"
        provider="default_search"
        page-size="${args.numberOfItems}"
        enrichers="thumbnail"
      >
      </nuxeo-page-provider>
      <nuxeo-justified-grid nx-provider="provider">
        <template>
          <nuxeo-justified-grid-item></nuxeo-justified-grid-item>
        </template>
      </nuxeo-justified-grid>
      <button
        @click=${() => {
          const grid = document.querySelector('nuxeo-justified-grid');
          grid.reset();
          grid.fetch();
        }}
      >
        Refresh grid
      </button>
    `;
  },
};

export const Selection = {
  args: { numberOfItems: 50, selectionEnabled: true, multiSelection: false },
  render: (args) => {
    server.respondWith('GET', '/api/v1/search/pp/default_search/execute', {
      'entity-type': 'documents',
      entries: LIST(args.numberOfItems).data,
      currentPage: 1,
      numberOfPages: 1,
      resultsCount: args.numberOfItems,
      offset: 0,
      pageSize: args.numberOfItems,
      isPreviousPageAvailable: false,
      currentPageSize: args.numberOfItems,
    });
    return html`
      <style>
        nuxeo-justified-grid {
          height: 300px;
        }
      </style>
      <nuxeo-page-provider
        id="provider"
        provider="default_search"
        page-size="${args.numberOfItems}"
        enrichers="thumbnail"
      >
      </nuxeo-page-provider>
      <nuxeo-justified-grid
        nx-provider="provider"
        ?selection-enabled="${args.selectionEnabled}"
        ?multi-selection="${args.multiSelection}"
      >
        <template>
          <nuxeo-justified-grid-item></nuxeo-justified-grid-item>
        </template>
      </nuxeo-justified-grid>
      <button
        @click=${() => {
          const grid = document.querySelector('nuxeo-justified-grid');
          grid.reset();
          grid.fetch();
        }}
      >
        Refresh grid
      </button>
    `;
  },
};
