/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-download-button.js';

suite('nuxeo-download-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-download-button></nuxeo-download-button>
      `,
    );
  });

  suite('_isAvailable', () => {
    test('returns true when doc has content', () => {
      const doc = {
        properties: {
          'file:content': { name: 'file.pdf', data: 'http://...' },
        },
      };
      expect(el._isAvailable(doc)).to.be.ok;
    });

    test('returns false when content is null', () => {
      const doc = { properties: { 'file:content': null } };
      expect(el._isAvailable(doc)).to.not.be.ok;
    });

    test('returns false for null doc', () => {
      expect(el._isAvailable(null)).to.not.be.ok;
    });
  });

  suite('_computeHoverLabel', () => {
    test('combines title and label', () => {
      const result = el._computeHoverLabel({ title: 'MyFile' });
      expect(result).to.include('MyFile');
    });

    test('handles null doc', () => {
      const result = el._computeHoverLabel(null);
      expect(result).to.be.a('string');
    });
  });

  suite('_deepFind', () => {
    test('finds nested property', () => {
      const obj = { files: [{ file: { name: 'a.txt' } }] };
      const result = el._deepFind(obj, 'files/0/file');
      expect(result).to.deep.equal({ name: 'a.txt' });
    });

    test('returns undefined for null obj', () => {
      expect(el._deepFind(null, 'a/b')).to.not.be.ok;
    });

    test('breaks on empty array in path', () => {
      const obj = { files: [] };
      const result = el._deepFind(obj, 'files/0/file');
      expect(result).to.deep.equal([]);
    });

    test('returns undefined for missing path', () => {
      const obj = { a: { b: 1 } };
      expect(el._deepFind(obj, 'a/c/d')).to.be.undefined;
    });
  });
});
