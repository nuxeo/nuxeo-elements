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
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-share-button.js';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-untrash-document-button.js';

import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { color } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import '@nuxeo/nuxeo-ui-elements/nuxeo-icons';
import fakeServer from '../mock/nuxeo.mock';
import { DOCUMENT1, DOCUMENT2, DOCUMENTS, DOCUMENT_DOWNLOAD, DOCUMENT_TRASHED } from '../mock/documents.mock';
import { TARGET } from '../lists/target';
import { listOfIcons } from '../lists/icons';

const server = fakeServer.create();
server.respondWith('POST', '/api/v1/automation/Document.AddToFavorites', DOCUMENT1);
server.respondWith('POST', '/api/v1/automation/Document.RemoveFromFavorites', DOCUMENT1);
server.respondWith('POST', '/api/v1/automation/Blob.RemoveFromDocument', DOCUMENT1);
server.respondWith('POST', '/api/v1/automation/Document.Lock', DOCUMENT1);
server.respondWith('POST', '/api/v1/automation/Document.Unlock', DOCUMENT1);
server.respondWith('POST', '/api/v1/automation/Document.Subscribe', DOCUMENT1);
server.respondWith('POST', '/api/v1/automation/Document.Unsubscribe', DOCUMENT1);
server.respondWith('POST', '/api/v1/automation/Document.Untrash', DOCUMENT_TRASHED);

const stories = storiesOf('UI/Actions', module);
stories
  .addElement('nuxeo-add-to-collection-button', ({ knobs }) => {
    const { document, icon } = knobs({
      document: { value: DOCUMENT1 },
      icon: { type: 'select', options: listOfIcons },
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
    const { document, icon } = knobs({
      document: { value: DOCUMENT1 },
      icon: { type: 'select', options: listOfIcons },
    });
    return html`
      <nuxeo-delete-blob-button @click=${action('clicked')} .document="${document}" icon="${icon}">
      </nuxeo-delete-blob-button>
    `;
  })

  .addElement('nuxeo-delete-document-button', ({ knobs }) => {
    const { document, icon } = knobs({
      document: { value: DOCUMENT1 },
      icon: { type: 'select', options: listOfIcons },
    });
    return html`
      <nuxeo-delete-document-button @click=${action('clicked')} .document="${document}" icon="${icon}">
      </nuxeo-delete-document-button>
    `;
  })

  .addElement('nuxeo-download-button', ({ knobs }) => {
    const { document, icon } = knobs({
      document: { value: DOCUMENT_DOWNLOAD },
      icon: { type: 'select', options: listOfIcons },
    });
    return html`
      <nuxeo-download-button @click=${action('clicked')} .document="${document}" icon="${icon}">
      </nuxeo-download-button>
    `;
  })

  .addElement('nuxeo-export-button', ({ knobs }) => {
    const { document, icon } = knobs({
      document: { value: DOCUMENT1 },
      icon: { type: 'select', options: listOfIcons },
    });
    return html`
      <nuxeo-export-button @click=${action('clicked')} .document="${document}" icon="${icon}"> </nuxeo-export-button>
    `;
  })

  .addElement('nuxeo-favorites-toggle-button', ({ knobs }) => {
    const { document, icon, favorite } = knobs({
      document: { value: DOCUMENT1 },
      icon: { type: 'select', options: listOfIcons },
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
    const { document, href, icon, target } = knobs({
      document: { value: DOCUMENT1 },
      href: { value: 'https://nuxeo.com' },
      icon: { type: 'select', options: listOfIcons, default: 'nuxeo:share' },
      target: { type: 'select', options: TARGET },
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
      document: { value: DOCUMENT1 },
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
      document: { value: DOCUMENT1 },
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
  })

  .addElement('nuxeo-share-button', ({ knobs }) => {
    const { document, icon } = knobs({
      document: { value: DOCUMENT1 },
      icon: { type: 'select', options: listOfIcons, default: 'nuxeo:share' },
    });
    return html`
      <style>
        * {
          --nuxeo-primary-color: ${color('--nuxeo-primary-color', '#0066ff', 'CSS variables')};
        }
      </style>
      <nuxeo-share-button @click=${action('clicked')} .document="${document}" icon="${icon}"> </nuxeo-share-button>
    `;
  })

  .addElement('nuxeo-untrash-document-button', ({ knobs }) => {
    const { document, icon } = knobs({
      document: { value: DOCUMENT_TRASHED },
      icon: { type: 'select', options: listOfIcons, default: 'nuxeo:restore-deleted' },
    });
    return html`
      <nuxeo-untrash-document-button @click=${action('clicked')} .document="${document}" icon="${icon}">
      </nuxeo-untrash-document-button>
    `;
  });
