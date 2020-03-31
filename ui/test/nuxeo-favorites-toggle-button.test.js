/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { fixture, html, login, tap, waitChanged } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-favorites-toggle-button.js';

/* eslint-disable no-unused-expressions */

suite('nuxeo-favorites-toggle-button', () => {
  let server;
  setup(async () => {
    server = await login();
  });

  suite('when a document is a favorite', () => {
    let element;
    setup(async () => {
      const doc = {
        'entity-type': 'document',
        uid: '1',
        contextParameters: {
          favorites: {
            isFavorite: true,
          },
        },
        facets: [],
      };
      element = await fixture(
        html`
          <nuxeo-favorites-toggle-button .document=${doc}></nuxeo-favorites-toggle-button>
        `,
      );
      server.respondWith('POST', '/api/v1/automation/Document.RemoveFromFavorites', [
        200,
        { 'Content-Type': 'application/json' },
        '{"entity-type": "document","uid": "1"}',
      ]);
    });

    test('it should display the document as favorite', () => {
      expect(element.favorite).to.be.true;
    });

    test('toggle should remove document from favorites', async () => {
      // Remove document from favorites by toggling
      tap(element);
      await waitChanged(element, 'favorite');
      expect(element.favorite).to.be.false;
    });
  });

  suite('when a document is not in favorites', () => {
    let element;
    setup(async () => {
      const doc = {
        'entity-type': 'document',
        uid: '1',
        contextParameters: {
          favorites: {
            isFavorite: false,
          },
        },
        facets: [],
      };
      element = await fixture(
        html`
          <nuxeo-favorites-toggle-button .document=${doc}></nuxeo-favorites-toggle-button>
        `,
      );
      server.respondWith('POST', '/api/v1/automation/Document.AddToFavorites', [
        200,
        { 'Content-Type': 'application/json' },
        '{"entity-type": "document","uid": "1"}',
      ]);
    });

    test('it should display the document as not favorite', () => {
      expect(element.favorite).to.be.false;
    });

    test('toggle should add the document to favorites', async () => {
      // Add the documents to favorites by toggling
      tap(element);
      await waitChanged(element, 'favorite');
      expect(element.favorite).to.be.true;
    });
  });
});
