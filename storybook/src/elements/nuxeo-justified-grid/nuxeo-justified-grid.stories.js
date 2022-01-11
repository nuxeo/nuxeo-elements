import { html } from 'lit';
import { storiesOf } from '@storybook/polymer';
import { boolean, button, number } from '@storybook/addon-knobs';
import { analyse } from '../../../.storybook/analysis';
import { LIST } from '../../data/lists.data.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-justified-grid/nuxeo-justified-grid.js';
import '@nuxeo/nuxeo-ui-elements/nuxeo-justified-grid/nuxeo-justified-grid-item.js';

const docs = analyse('nuxeo-justified-grid').notes;

const stories = storiesOf('UI/nuxeo-justified-grid', module);

const server = window.nuxeo.mock;

stories
  .add(
    'Empty',
    () =>
      html`
        <nuxeo-justified-grid></nuxeo-justified-grid>
      `,
    { notes: { markdown: docs } },
  )
  .add(
    'Default',
    () => {
      const numberOfItems = number('Number of items', 50);
      button('Refresh grid', () => {
        const grid = document.querySelector('nuxeo-justified-grid');
        grid.reset();
        grid.fetch();
      });
      server.respondWith('GET', '/api/v1/search/pp/default_search/execute', {
        'entity-type': 'documents',
        entries: LIST(numberOfItems).data,
        currentPage: 1,
        numberOfPages: 1,
        resultsCount: numberOfItems,
        offset: 0,
        pageSize: numberOfItems,
        isPreviousPageAvailable: false,
        currentPageSize: numberOfItems,
      });
      return html`
        <style>
          nuxeo-justified-grid {
            height: 300px;
          }
        </style>

        <nuxeo-page-provider id="provider" provider="default_search" page-size="${numberOfItems}" enrichers="thumbnail">
        </nuxeo-page-provider>

        <nuxeo-justified-grid nx-provider="provider">
          <template>
            <nuxeo-justified-grid-item></nuxeo-justified-grid-item>
          </template>
        </nuxeo-justified-grid>
      `;
    },
    { notes: { markdown: docs } },
  )
  .add(
    'Selection',
    () => {
      const numberOfItems = number('Number of items', 50);
      const selectionEnabled = boolean('Selection Enabled', true);
      const multiSelection = boolean('Multi selection', false);
      server.respondWith('GET', '/api/v1/search/pp/default_search/execute', {
        'entity-type': 'documents',
        entries: LIST(numberOfItems).data,
        currentPage: 1,
        numberOfPages: 1,
        resultsCount: numberOfItems,
        offset: 0,
        pageSize: numberOfItems,
        isPreviousPageAvailable: false,
        currentPageSize: numberOfItems,
      });
      button('Refresh grid', () => {
        const grid = document.querySelector('nuxeo-justified-grid');
        grid.reset();
        grid.fetch();
      });
      return html`
        <style>
          nuxeo-justified-grid {
            height: 300px;
          }
        </style>

        <nuxeo-page-provider id="provider" provider="default_search" page-size="${numberOfItems}" enrichers="thumbnail">
        </nuxeo-page-provider>

        <nuxeo-justified-grid
          nx-provider="provider"
          ?selection-enabled="${selectionEnabled}"
          ?multi-selection="${multiSelection}"
        >
          <template>
            <nuxeo-justified-grid-item></nuxeo-justified-grid-item>
          </template>
        </nuxeo-justified-grid>
      `;
    },
    { notes: { markdown: docs } },
  );
