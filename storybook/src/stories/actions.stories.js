import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-add-to-collection-button';
import '@nuxeo/nuxeo-ui-elements/actions/nuxeo-favorites-toggle-button';
import { storiesOf } from '@storybook/polymer';
import { color } from '@storybook/addon-knobs';
import { html } from 'lit-html';
import fakeServer from '../nuxeo.mock';

const DOCUMENT = {
  'entity-type': 'document',
  uid: '1',
  facets: [],
  contextParameters: {
    favorites: {
      isFavorite: false,
    },
  },
};

const server = fakeServer.create();
server.respondWith('POST', '/api/v1/automation/Document.AddToFavorites', DOCUMENT);
server.respondWith('POST', '/api/v1/automation/Document.RemoveFromFavorites', DOCUMENT);

storiesOf('UI/Actions', module)
  .addElement('nuxeo-favorites-toggle-button', ({ knobs }) => {
    const { icon, document } = knobs({
      document: { value: DOCUMENT },
    });

    return html`
      <style>
        * {
          --nuxeo-action-color-activated: ${color('--nuxeo-action-color-activated', '#00aded', 'CSS variables')};
        }
      </style>
      <nuxeo-favorites-toggle-button .document="${document}" icon="${icon}"> </nuxeo-favorites-toggle-button>
    `;
  })

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
  });
