import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-add-to-collection-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-favorites-toggle-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-delete-blob-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-delete-document-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-download-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-export-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-link-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-lock-toggle-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-move-documents-down-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-move-documents-up-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-notifications-toggle-button';

import '@nuxeo/nuxeo-ui-elements/nuxeo-icons';
import { storiesOf } from '@storybook/polymer';
import { color, select } from '@storybook/addon-knobs';
import { html } from 'lit-html';
import { action } from '@storybook/addon-actions';
import fakeServer from '../nuxeo.mock';

const stories = storiesOf('UI/Actions', module);

const DOCUMENT = {
  'entity-type': 'document',
  uid: '1',
  facets: [],
  properties: {
    'file:content': {
      name: 'stuff.json',
      data: '',
    },
  },
  contextParameters: {
    permissions: ['Write'],
  },
};

const DOCUMENT2 = {
  'entity-type': 'document',
  uid: '2',
  facets: [],
  properties: {
    'file:content': {
      name: 'stuff.json',
      data: '',
    },
  },
  contextParameters: {
    favorites: {
      isFavorite: false,
    },
    permissions: ['Write'],
  },
};

const DOCUMENT3 = {
  'entity-type': 'document',
  uid: '3',
  facets: [],
  properties: {
    'file:content': {
      name: 'stuff.json',
      data: '',
    },
  },
  contextParameters: {
    favorites: {
      isFavorite: false,
    },
    permissions: ['Write'],
  },
};

const DOCUMENTS = [DOCUMENT, DOCUMENT2, DOCUMENT3];

const TARGET = ['_blank', '_self', '_parent', '_top'];

const server = fakeServer.create();
server.respondWith('POST', '/api/v1/automation/Document.AddToFavorites', DOCUMENT);
server.respondWith('POST', '/api/v1/automation/Document.RemoveFromFavorites', DOCUMENT);
server.respondWith('POST', '/api/v1/automation/Blob.RemoveFromDocument', DOCUMENT);
server.respondWith('POST', '/api/v1/automation/Document.Lock', DOCUMENT);
server.respondWith('POST', '/api/v1/automation/Document.Unlock', DOCUMENT);
server.respondWith('POST', '/api/v1/automation/Document.Subscribe', DOCUMENT);
server.respondWith('POST', '/api/v1/automation/Document.Unsubscribe', DOCUMENT);

stories
  .addElement('nuxeo-add-to-collection-button', ({ knobs }) => {
    const { icon, document } = knobs({
      document: { value: DOCUMENT },
    });

    return html`
      <style>
        * {
          --nuxeo-action-color-activated: ${color('--nuxeo-action-color-activated', '#00aded', 'CSS variables')};
        }
      </style>
      <nuxeo-add-to-collection-button .document="${document}" icon="${icon}"> </nuxeo-add-to-collection-button>
    `;
  })

  .addElement('nuxeo-delete-blob-button', ({ knobs }) => {
    const { icon, document } = knobs({
      document: { value: DOCUMENT },
    });
    return html`
      <nuxeo-delete-blob-button @click=${action('clicked')} .document="${document}" icon="${icon}">
      </nuxeo-delete-blob-button>
    `;
  })

  .addElement('nuxeo-delete-document-button', ({ knobs }) => {
    const { icon, document } = knobs({
      document: { value: DOCUMENT },
    });
    return html`
      <nuxeo-delete-document-button @click=${action('clicked')} .document="${document}" icon="${icon}">
      </nuxeo-delete-document-button>
    `;
  })

  .addElement('nuxeo-download-button', ({ knobs }) => {
    const { icon, document } = knobs({
      document: { value: DOCUMENT },
    });
    return html`
      <nuxeo-download-button @click=${action('clicked')} .document="${document}" icon="${icon}">
      </nuxeo-download-button>
    `;
  })

  .addElement('nuxeo-export-button', ({ knobs }) => {
    const { icon, document } = knobs({
      document: { value: DOCUMENT },
    });
    return html`
      <nuxeo-export-button @click=${action('clicked')} .document="${document}" icon="${icon}"> </nuxeo-export-button>
    `;
  })

  .addElement('nuxeo-favorites-toggle-button', ({ knobs }) => {
    const { icon, document, favorite } = knobs({
      document: { value: DOCUMENT },
      favorite: { value: false },
    });
    return html`
      <style>
        * {
          --nuxeo-action-color-activated: ${color('--nuxeo-action-color-activated', '#00aded', 'CSS variables')};
        }
      </style>
      <nuxeo-favorites-toggle-button .document="${document}" icon="${icon}" ?favorite="${favorite}">
      </nuxeo-favorites-toggle-button>
    `;
  })

  .addElement('nuxeo-link-button', ({ knobs }) => {
    const { href, icon, document, target } = knobs({
      href: { value: 'https://nuxeo.com' },
      icon: { value: 'nuxeo:share' },
      document: { value: DOCUMENT },
      target: { type: select, options: TARGET },
    });

    return html`
      <nuxeo-link-button
        @click=${action('clicked')}
        .document="${document}"
        .href="${href}"
        .target=${target}
        .icon="${icon}"
      ></nuxeo-link-button>
    `;
  })

  .addElement('nuxeo-lock-toggle-button', ({ knobs }) => {
    const { document, locked } = knobs({
      document: { value: DOCUMENT },
      locked: { value: false },
    });
    return html`
      <nuxeo-lock-toggle-button @click=${action('clicked')} .document="${document}" ?locked=${locked}>
      </nuxeo-lock-toggle-button>
    `;
  })

  .addElement('nuxeo-move-documents-down-button', () => {
    const documents = DOCUMENTS;
    const selectedDocuments = [DOCUMENT2];
    return html`
      <nuxeo-move-documents-down-button
        @click=${action('clicked')}
        .documents="${documents}"
        .selectedDocuments="${selectedDocuments}"
      >
      </nuxeo-move-documents-down-button>
    `;
  })

  .addElement('nuxeo-move-documents-up-button', () => {
    const documents = DOCUMENTS;
    const selectedDocuments = [DOCUMENT2];
    return html`
      <nuxeo-move-documents-up-button
        @click=${action('clicked')}
        .documents="${documents}"
        .selectedDocuments="${selectedDocuments}"
      >
      </nuxeo-move-documents-up-button>
    `;
  })

  .addElement('nuxeo-notifications-toggle-button', ({ knobs }) => {
    const { document, subscribed } = knobs({
      document: { value: DOCUMENT },
      subscribed: false,
    });
    return html`
      <style>
        * {
          --nuxeo-action-color-activated: ${color('--nuxeo-action-color-activated', '#00aded', 'CSS variables')};
        }
      </style>
      <nuxeo-notifications-toggle-button @click=${action('clicked')} .document="${document}" ?subscribed=${subscribed}>
      </nuxeo-notifications-toggle-button>
    `;
  });

// .addElement('nuxeo-preview-button', ({ knobs }) => {
//   const { document, subscribed } = knobs({
//     document: { value: DOCUMENT },
//     subscribed: false,
//   });
//   return html`
//     <style>
//       * {
//         --nuxeo-action-color-activated: ${color('--nuxeo-action-color-activated', '#00aded', 'CSS variables')};
//       }
//     </style>
//     <nuxeo-preview-button
//       @click=${action('clicked')}
//       .document="${document}"
//       ?subscribed=${subscribed}
//     >
//     </nuxeo-preview-button>
//   `;
// })
