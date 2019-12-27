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
import '@nuxeo/nuxeo-ui-elements/nuxeo-icons';
import { html } from 'lit-html';
import { storiesOf } from '@storybook/polymer';
import { color, select, text, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import DocumentBuilder from '../../data/documents.data';
import image from '../../img/nuxeo-elements-catalog.svg';
import { listOfIcons } from '../../lists/icons';

const documentBuilder = new DocumentBuilder()
  .setFileContent('Nuxeo Logo', image)
  .setPermissions(['Write', 'ManageWorkflows']);

const DOCUMENTS = [documentBuilder.build(), documentBuilder.build(), documentBuilder.build()];

const server = window.nuxeo.mock;
server.respondWith('POST', '/api/v1/automation/Document.AddToFavorites', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.RemoveFromFavorites', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Blob.RemoveFromDocument', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.Lock', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.Unlock', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.Subscribe', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.Unsubscribe', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.Untrash', DOCUMENTS[0]);

const stories = storiesOf('UI/Actions', module);
stories
  .add(
    'nuxeo-add-to-collection-button',
    () =>
      html`
        <nuxeo-add-to-collection-button
          @click=${action('clicked')}
          .document="${DOCUMENTS[0]}"
        ></nuxeo-add-to-collection-button>
      `,
  )

  .add(
    'nuxeo-delete-blob-button',
    () =>
      html`
        <nuxeo-delete-blob-button @click=${action('clicked')} .document="${DOCUMENTS[0]}"> </nuxeo-delete-blob-button>
      `,
  )

  .add(
    'nuxeo-delete-document-button',
    () =>
      html`
        <nuxeo-delete-document-button @click=${action('clicked')} .document="${DOCUMENTS[0]}">
        </nuxeo-delete-document-button>
      `,
  )

  .add(
    'nuxeo-download-button',
    () =>
      html`
        <nuxeo-download-button @click=${action('clicked')} .document="${DOCUMENTS[0]}"> </nuxeo-download-button>
      `,
  )

  .add(
    'nuxeo-export-button',
    () =>
      html`
        <nuxeo-export-button @click=${action('clicked')} .document="${document}"> </nuxeo-export-button>
      `,
  )

  .add('nuxeo-favorites-toggle-button', () => {
    const favorite = boolean('Favorite', false);
    return html`
      <style>
        * {
          --nuxeo-action-color-activated: ${color('--nuxeo-action-color-activated', '#00aded', 'CSS variables')};
        }
      </style>
      <nuxeo-favorites-toggle-button @click=${action('clicked')} .document="${DOCUMENTS[0]}" ?favorite="${favorite}">
      </nuxeo-favorites-toggle-button>
    `;
  })

  .add('nuxeo-link-button', () => {
    const href = text('Href', 'https://nuxeo.com');
    const icon = select('Icons', listOfIcons, 'nuxeo:add');
    const label = text('Label', 'Nuxeo');
    const showLabel = boolean('Show Label', false);
    return html`
      <nuxeo-link-button
        @click=${action('clicked')}
        href="${href}"
        icon="${icon}"
        label="${label}"
        ?show-label="${showLabel}"
      ></nuxeo-link-button>
    `;
  })

  .add('nuxeo-lock-toggle-button', () => {
    const locked = boolean('Locked', false);
    return html`
      <nuxeo-lock-toggle-button @click=${action('clicked')} .document="${DOCUMENTS[0]}" ?locked=${locked}>
      </nuxeo-lock-toggle-button>
    `;
  })

  .add('nuxeo-move-documents-down-button', () => {
    const documents = DOCUMENTS;
    const selectedDocuments = [DOCUMENTS[1]];
    return html`
      <nuxeo-move-documents-down-button
        @click=${action('clicked')}
        .documents="${documents}"
        .selectedDocuments="${selectedDocuments}"
      >
      </nuxeo-move-documents-down-button>
    `;
  })

  .add('nuxeo-move-documents-up-button', () => {
    const documents = DOCUMENTS;
    const selectedDocuments = [DOCUMENTS[1]];
    return html`
      <nuxeo-move-documents-up-button
        @click=${action('clicked')}
        .documents="${documents}"
        .selectedDocuments="${selectedDocuments}"
      >
      </nuxeo-move-documents-up-button>
    `;
  })

  .add('nuxeo-notifications-toggle-button', () => {
    const subscribed = boolean('Subscribed', false);
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

  .add(
    'nuxeo-share-button',
    () =>
      html`
        <nuxeo-share-button @click=${action('clicked')} .document="${document}"> </nuxeo-share-button>
      `,
  )

  .add('nuxeo-untrash-document-button', () => {
    const DOCUMENT_TRASHED = new DocumentBuilder()
      .setSystemProperties({ isTrashed: true })
      .setPermissions(['Write', 'ManageWorkflows'])
      .build();
    return html`
      <nuxeo-untrash-document-button @click=${action('clicked')} .document="${DOCUMENT_TRASHED}">
      </nuxeo-untrash-document-button>
    `;
  });
