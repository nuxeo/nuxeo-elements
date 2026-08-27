/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-share-button.js';

suite('nuxeo-share-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-share-button></nuxeo-share-button>
      `,
    );
  });

  suite('_isAvailable', () => {
    test('returns truthy when doc exists', () => {
      expect(el._isAvailable({ uid: '1' })).to.be.ok;
    });

    test('returns falsy for null doc', () => {
      expect(el._isAvailable(null)).to.not.be.ok;
    });

    test('returns falsy for undefined doc', () => {
      expect(el._isAvailable(undefined)).to.not.be.ok;
    });
  });

  suite('_buildPermalink', () => {
    test('builds permalink for document', () => {
      const result = el._buildPermalink({ uid: 'doc1' });
      expect(result).to.include('doc?id=doc1');
      expect(result).to.not.include('#!');
    });

    test('encodes the document id', () => {
      const result = el._buildPermalink({ uid: 'a b/c' });
      expect(result).to.include(`doc?id=${encodeURIComponent('a b/c')}`);
    });

    test('returns empty string for null document', () => {
      expect(el._buildPermalink(null)).to.equal('');
    });
  });
});
