import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html';
import { boolean, number, text } from '@storybook/addon-knobs';
import '@nuxeo/nuxeo-ui-elements/nuxeo-aggregation/nuxeo-checkbox-aggregation.js';

const DATA = {
  'entity-type': 'aggregate',
  extendedBuckets: [
    {
      docCount: 2,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Tolkien',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2292',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2292',
    },
    {
      docCount: 1,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Asimov',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 3,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Hemingway',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 4,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Dostoevsky',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 5,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Tolstoy',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 6,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Pessoa',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 7,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Balzac',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 8,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Cervantes',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 9,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Shakespeare',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
  ],
  field: 'book:author',
  id: 'book_author_agg',
  properties: {
    order: 'count desc',
    size: '20',
  },
  ranges: [],
  selection: [],
  type: 'terms',
};

storiesOf('UI/nuxeo-checkbox-aggregation', module).add('Default', () => {
  const label = text('Label', 'Some Label');
  const collapsible = boolean('Collapsible', false);
  const opened = boolean('Opened (collapsible)', false);
  const visibleItems = number('Number of visible items (collapsible)', 8);
  return html`
    <style>
      :root {
        display: block;
        width: 300px;
        margin: 2rem;
      }
    </style>
    <nuxeo-checkbox-aggregation
      .data="${DATA}"
      label="${label}"
      ?collapsible="${collapsible}"
      ?opened="${opened}"
      visible-items="${visibleItems}"
    >
    </nuxeo-checkbox-aggregation>
  `;
});
