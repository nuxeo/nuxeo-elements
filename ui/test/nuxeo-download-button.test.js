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
    test('returns only the action label, not the document title', () => {
      const result = el._computeHoverLabel({ title: 'MyFile' });
      expect(result).to.not.include('MyFile');
      expect(result).to.be.a('string');
    });

    test('returns the same value as _computeLabel', () => {
      expect(el._computeHoverLabel({ title: 'MyFile' })).to.equal(el._computeLabel());
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

suite('nuxeo-download-button accessibility', () => {
  test('host has role="presentation" by default to collapse it out of the a11y tree', async () => {
    const el = await fixture(
      html`
        <nuxeo-download-button></nuxeo-download-button>
      `,
    );
    expect(el.getAttribute('role')).to.equal('presentation');
  });

  test('host preserves a pre-existing role attribute', async () => {
    const el = await fixture(
      html`
        <nuxeo-download-button role="button"></nuxeo-download-button>
      `,
    );
    expect(el.getAttribute('role')).to.equal('button');
  });

  test('inner .action wrapper has role="presentation"', async () => {
    const doc = {
      'entity-type': 'document',
      uid: '1',
      properties: {
        'file:content': { name: 'file.pdf', data: 'http://example/file.pdf' },
      },
    };
    const el = await fixture(
      html`
        <nuxeo-download-button .document=${doc}></nuxeo-download-button>
      `,
    );
    const action = el.shadowRoot.querySelector('.action');
    expect(action).to.exist;
    expect(action.getAttribute('role')).to.equal('presentation');
  });
});
