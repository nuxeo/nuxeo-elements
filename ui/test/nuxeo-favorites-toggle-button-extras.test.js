/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-favorites-toggle-button.js';

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
    test('combines doc title and label', () => {
      const result = el._computeHoverLabel(false, { title: 'MyDoc' });
      expect(result).to.include('MyDoc');
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
