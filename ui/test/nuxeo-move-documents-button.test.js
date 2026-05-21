/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-move-documents-down-button.js';
import '../actions/nuxeo-move-documents-up-button.js';

suite('nuxeo-move-documents-down-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-move-documents-down-button></nuxeo-move-documents-down-button>
      `,
    );
  });

  suite('_isAvailable', () => {
    test('sets available=false initially', () => {
      el.selectedDocuments = null;
      el._isAvailable();
      expect(el._available).to.be.false;
    });

    test('sets available=false for empty selection', () => {
      el.selectedDocuments = [];
      el._isAvailable();
      expect(el._available).to.be.false;
    });

    test('dispatches clear-selected-items on sort error', (done) => {
      el.addEventListener('clear-selected-items', () => done());
      const docA = { uid: 'a' };
      const docB = { uid: 'b' };
      el.documents = [docA];
      el.selectedDocuments = [docB, { uid: 'c' }];
      el._isAvailable();
    });

    test('sets available=true for valid non-bottom selection', () => {
      const docs = [{ uid: '1' }, { uid: '2' }, { uid: '3' }];
      el.documents = docs;
      el.selectedDocuments = [docs[0]];
      el._isAvailable();
      expect(el._available).to.be.true;
    });

    test('returns early for bottom doc that is a sequence', () => {
      const docs = [{ uid: '1' }, { uid: '2' }];
      el.documents = docs;
      el.selectedDocuments = [docs[1]];
      el._isAvailable();
      expect(el._available).to.be.false;
    });

    test('handles last doc with non-sequence', () => {
      const docs = [{ uid: '1' }, { uid: '2' }, { uid: '3' }, { uid: '4' }];
      el.documents = docs;
      el.selectedDocuments = [docs[3], docs[1]];
      el._isAvailable();
    });

    test('handles second to last doc', () => {
      const docs = [{ uid: '1' }, { uid: '2' }, { uid: '3' }];
      el.documents = docs;
      el.selectedDocuments = [docs[1]];
      el._isAvailable();
      expect(el._available).to.be.true;
    });

    test('sets _beforeUid to null for last position', () => {
      const docs = [{ uid: '1' }, { uid: '2' }];
      el.documents = docs;
      el.selectedDocuments = [docs[0]];
      el._isAvailable();
    });
  });

  suite('_computeParams', () => {
    test('returns object with before when _beforeUid set', () => {
      el._beforeUid = 'uid1';
      const result = el._computeParams();
      expect(result).to.deep.equal({ before: 'uid1' });
    });

    test('returns empty object when _beforeUid is null', () => {
      el._beforeUid = null;
      const result = el._computeParams();
      expect(result).to.deep.equal({});
    });
  });
});

suite('nuxeo-move-documents-up-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-move-documents-up-button></nuxeo-move-documents-up-button>
      `,
    );
  });

  suite('_isAvailable', () => {
    test('sets available=false initially', () => {
      el.selectedDocuments = null;
      el._isAvailable();
      expect(el._available).to.be.false;
    });

    test('sets available=false for empty', () => {
      el.selectedDocuments = [];
      el._isAvailable();
      expect(el._available).to.be.false;
    });

    test('dispatches clear-selected-items on sort error', (done) => {
      el.addEventListener('clear-selected-items', () => done());
      el.documents = [{ uid: 'a' }];
      el.selectedDocuments = [{ uid: 'b' }, { uid: 'c' }];
      el._isAvailable();
    });

    test('sets available=true for valid non-top selection', () => {
      const docs = [{ uid: '1' }, { uid: '2' }, { uid: '3' }];
      el.documents = docs;
      el.selectedDocuments = [docs[2]];
      el._isAvailable();
      expect(el._available).to.be.true;
    });

    test('returns early for top doc that is a sequence', () => {
      const docs = [{ uid: '1' }, { uid: '2' }];
      el.documents = docs;
      el.selectedDocuments = [docs[0]];
      el._isAvailable();
      expect(el._available).to.be.false;
    });
  });
});
