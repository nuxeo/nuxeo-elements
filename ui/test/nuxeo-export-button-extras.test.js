/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-export-button.js';

suite('nuxeo-export-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-export-button></nuxeo-export-button>
      `,
    );
  });

  suite('_isAvailable', () => {
    test('returns truthy when doc exists', () => {
      expect(el._isAvailable({ uid: '1' })).to.be.ok;
    });

    test('returns falsy for null', () => {
      expect(el._isAvailable(null)).to.not.be.ok;
    });
  });

  suite('_filterRenditions', () => {
    test('filters out video and picture conversions', () => {
      const doc = {
        contextParameters: {
          renditions: [
            { name: 'pdf', kind: 'nuxeo:rendition', url: '/r/pdf' },
            { name: 'mp4', kind: 'nuxeo:video:conversion', url: '/r/mp4' },
            { name: 'jpg', kind: 'nuxeo:picture:conversion', url: '/r/jpg' },
            { name: 'xml', kind: 'nuxeo:rendition', url: '/r/xml' },
          ],
        },
      };
      const result = el._filterRenditions(doc);
      expect(result).to.have.length(2);
      expect(result[0].name).to.equal('pdf');
      expect(result[1].name).to.equal('xml');
    });

    test('returns empty array for no doc', () => {
      expect(el._filterRenditions(null)).to.deep.equal([]);
    });

    test('returns empty array when no renditions', () => {
      expect(el._filterRenditions({ contextParameters: {} })).to.deep.equal([]);
    });

    test('returns empty array for doc without contextParameters', () => {
      expect(el._filterRenditions({})).to.deep.equal([]);
    });

    test('adds label from formatRendition', () => {
      const doc = {
        contextParameters: {
          renditions: [{ name: 'pdf', kind: 'nuxeo:rendition', url: '/r' }],
        },
      };
      const result = el._filterRenditions(doc);
      expect(result[0]).to.have.property('label');
    });
  });
});
