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
import { html } from 'lit';
import { action } from 'storybook/actions';
import DocumentBuilder from '../../data/documents.data';
import image from '../../img/nuxeo-elements-catalog.svg';
import iconMap from '../../lists/icons';

const documentBuilder = new DocumentBuilder()
  .setFileContent('Nuxeo Logo', image)
  .setPermissions(['Write', 'ManageWorkflows']);

const DOCUMENTS = [documentBuilder.build(), documentBuilder.build(), documentBuilder.build()];
const listOfIcons = iconMap.nuxeo;

const server = window.nuxeo.mock;
server.respondWith('POST', '/api/v1/automation/Document.AddToFavorites', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.RemoveFromFavorites', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Blob.RemoveFromDocument', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.Lock', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.Unlock', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.Subscribe', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.Unsubscribe', DOCUMENTS[0]);
server.respondWith('POST', '/api/v1/automation/Document.Untrash', DOCUMENTS[0]);

export default {
  title: 'UI/Actions',
};

export const NuxeoAddToCollectionButton = {
  render: () => html`
    <nuxeo-add-to-collection-button
      @click=${action('clicked')}
      .document="${DOCUMENTS[0]}"
    ></nuxeo-add-to-collection-button>
  `,
};

export const NuxeoDeleteBlobButton = {
  render: () => html`
    <nuxeo-delete-blob-button @click=${action('clicked')} .document="${DOCUMENTS[0]}"> </nuxeo-delete-blob-button>
  `,
};

export const NuxeoDeleteDocumentButton = {
  render: () => html`
    <nuxeo-delete-document-button @click=${action('clicked')} .document="${DOCUMENTS[0]}">
    </nuxeo-delete-document-button>
  `,
};

export const NuxeoDownloadButton = {
  render: () => html`
    <nuxeo-download-button @click=${action('clicked')} .document="${DOCUMENTS[0]}"> </nuxeo-download-button>
  `,
};

export const NuxeoExportButton = {
  render: () => html`
    <nuxeo-export-button @click=${action('clicked')} .document="${DOCUMENTS[0]}"> </nuxeo-export-button>
  `,
};

export const NuxeoFavoritesToggleButton = {
  args: {
    favorite: false,
    activatedColor: '#00aded',
  },
  argTypes: {
    activatedColor: { control: 'color', name: '--nuxeo-action-color-activated' },
  },
  render: (args) => html`
    <style>
      * {
        --nuxeo-action-color-activated: ${args.activatedColor};
      }
    </style>
    <nuxeo-favorites-toggle-button @click=${action('clicked')} .document="${DOCUMENTS[0]}" ?favorite="${args.favorite}">
    </nuxeo-favorites-toggle-button>
  `,
};

export const NuxeoLinkButton = {
  args: {
    href: 'https://nuxeo.com',
    icon: 'nuxeo:add',
    label: 'Nuxeo',
    showLabel: false,
  },
  argTypes: {
    icon: { control: 'select', options: listOfIcons },
  },
  render: (args) => html`
    <nuxeo-link-button
      @click=${action('clicked')}
      href="${args.href}"
      icon="${args.icon}"
      label="${args.label}"
      ?show-label="${args.showLabel}"
    ></nuxeo-link-button>
  `,
};

export const NuxeoLockToggleButton = {
  args: { locked: false },
  render: (args) => html`
    <nuxeo-lock-toggle-button @click=${action('clicked')} .document="${DOCUMENTS[0]}" ?locked=${args.locked}>
    </nuxeo-lock-toggle-button>
  `,
};

export const NuxeoMoveDocumentsDownButton = {
  render: () => html`
    <nuxeo-move-documents-down-button
      @click=${action('clicked')}
      .documents="${DOCUMENTS}"
      .selectedDocuments="${[DOCUMENTS[1]]}"
    >
    </nuxeo-move-documents-down-button>
  `,
};

export const NuxeoMoveDocumentsUpButton = {
  render: () => html`
    <nuxeo-move-documents-up-button
      @click=${action('clicked')}
      .documents="${DOCUMENTS}"
      .selectedDocuments="${[DOCUMENTS[1]]}"
    >
    </nuxeo-move-documents-up-button>
  `,
};

export const NuxeoNotificationsToggleButton = {
  args: {
    subscribed: false,
    activatedColor: '#00aded',
  },
  argTypes: {
    activatedColor: { control: 'color', name: '--nuxeo-action-color-activated' },
  },
  render: (args) => html`
    <style>
      * {
        --nuxeo-action-color-activated: ${args.activatedColor};
      }
    </style>
    <nuxeo-notifications-toggle-button
      @click=${action('clicked')}
      .document="${DOCUMENTS[0]}"
      ?subscribed=${args.subscribed}
    >
    </nuxeo-notifications-toggle-button>
  `,
};

export const NuxeoShareButton = {
  render: () => html`
    <nuxeo-share-button @click=${action('clicked')} .document="${DOCUMENTS[0]}"> </nuxeo-share-button>
  `,
};

export const NuxeoUntrashDocumentButton = {
  render: () => {
    const DOCUMENT_TRASHED = new DocumentBuilder()
      .setSystemProperties({ isTrashed: true })
      .setPermissions(['Write', 'ManageWorkflows'])
      .build();
    return html`
      <nuxeo-untrash-document-button @click=${action('clicked')} .document="${DOCUMENT_TRASHED}">
      </nuxeo-untrash-document-button>
    `;
  },
};
