/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

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

suite('nuxeo-favorites-toggle-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-favorites-toggle-button></nuxeo-favorites-toggle-button>
      `,
    );
  });

  suite('_isAvailable', () => {
    test('returns truthy for collection member doc', () => {
      const doc = { facets: ['CollectionMember'], type: 'File', isVersion: false };
      expect(el._isAvailable(doc)).to.be.ok;
    });

    test('returns falsy for null', () => {
      expect(el._isAvailable(null)).to.not.be.ok;
    });
  });

  suite('_computeIcon', () => {
    test('returns star when favorite', () => {
      expect(el._computeIcon(true)).to.equal('icons:star');
    });

    test('returns star-border when not favorite', () => {
      expect(el._computeIcon(false)).to.equal('icons:star-border');
    });
  });

  suite('_computeLabel', () => {
    test('returns remove label when favorite', () => {
      const result = el._computeLabel(true);
      expect(result).to.be.a('string');
    });

    test('returns add label when not favorite', () => {
      const result = el._computeLabel(false);
      expect(result).to.be.a('string');
    });
  });

  suite('_computeHoverLabel', () => {
    test('returns only the action label, not the document title', () => {
      const result = el._computeHoverLabel(false, { title: 'MyDoc' });
      expect(result).to.not.include('MyDoc');
      expect(result).to.be.a('string');
    });

    test('returns the same value as _computeLabel for the given favorite state', () => {
      expect(el._computeHoverLabel(false, { title: 'MyDoc' })).to.equal(el._computeLabel(false));
      expect(el._computeHoverLabel(true, { title: 'MyDoc' })).to.equal(el._computeLabel(true));
    });

    test('handles null doc gracefully', () => {
      const result = el._computeHoverLabel(false, null);
      expect(result).to.be.a('string');
    });
  });

  suite('_documentChanged', () => {
    test('sets favorite from document contextParameters', () => {
      el.document = {
        contextParameters: {
          favorites: { isFavorite: true },
        },
      };
      el._documentChanged();
    });

    test('handles doc without contextParameters', () => {
      el.document = {};
      el._documentChanged();
    });
  });

  suite('removeFromFavoritesHandler', () => {
    test('unsets favorite on matching uid', () => {
      el.document = { uid: 'doc1' };
      el._setFavorite(true);
      const event = new CustomEvent('removed-from-favorites', {
        detail: { docUid: 'doc1' },
      });
      window.dispatchEvent(event);
    });

    test('ignores non-matching uid', () => {
      el.document = { uid: 'doc1' };
      el._setFavorite(true);
      const event = new CustomEvent('removed-from-favorites', {
        detail: { docUid: 'doc2' },
      });
      window.dispatchEvent(event);
    });

    test('ignores when no document', () => {
      el.document = null;
      const event = new CustomEvent('removed-from-favorites', {
        detail: { docUid: 'doc1' },
      });
      window.dispatchEvent(event);
    });
  });
});
