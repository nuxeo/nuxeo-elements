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
import { fixture, html, login, tap, waitForEvent } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-move-documents-down-button.js';

suite('Given on a Ordered Folder, I have 5 items', () => {
  let server;
  let downButton;
  const items = [{ uid: '1' }, { uid: '2' }, { uid: '3' }, { uid: '4' }, { uid: '5' }];
  setup(async () => {
    server = await login();
    server.respondWith('POST', '/api/v1/automation/Document.Order', [
      200,
      { 'Content-Type': 'application/json' },
      '{}',
    ]);
  });

  suite('When I select items 1, 3, 4, 5', () => {
    const selectedItems = [items[0], items[2], items[3], items[4]];
    setup(async () => {
      downButton = await fixture(html`
        <nuxeo-move-documents-down-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems.slice(0)}>
        </nuxeo-move-documents-down-button>
      `);
    });

    test('Then clicking "Down" should order items to 2, 3, 4, 5', async () => {
      tap(downButton);
      await waitForEvent(downButton, 'refresh-display');
      assert.equal(2, downButton.documents[0].uid);
      assert.equal(1, downButton.documents[1].uid);
      assert.equal(3, downButton.documents[2].uid);
      assert.equal(4, downButton.documents[3].uid);
      assert.equal(5, downButton.documents[4].uid);
    });
  });

  suite('When I select items 2, 4, 5', () => {
    const selectedItems = [items[1], items[3], items[4]];
    setup(async () => {
      downButton = await fixture(html`
        <nuxeo-move-documents-down-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems.slice(0)}>
        </nuxeo-move-documents-down-button>
      `);
    });

    test('Then clicking "Down" should order items to 3, 4, 5', () => {
      tap(downButton);
      return waitForEvent(downButton, 'refresh-display').then(() => {
        assert.equal(1, downButton.documents[0].uid);
        assert.equal(3, downButton.documents[1].uid);
        assert.equal(2, downButton.documents[2].uid);
        assert.equal(4, downButton.documents[3].uid);
        assert.equal(5, downButton.documents[4].uid);
      });
    });
  });

  suite('When I select items 2, 4', () => {
    const selectedItems = [items[1], items[3]];
    setup(async () => {
      downButton = await fixture(html`
        <nuxeo-move-documents-down-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems.slice(0)}>
        </nuxeo-move-documents-down-button>
      `);
    });

    test('Then clicking "Down" should order items to 4, 5', async () => {
      tap(downButton);
      await waitForEvent(downButton, 'refresh-display');
      assert.equal(1, downButton.documents[0].uid);
      assert.equal(3, downButton.documents[1].uid);
      assert.equal(5, downButton.documents[2].uid);
      assert.equal(2, downButton.documents[3].uid);
      assert.equal(4, downButton.documents[4].uid);
    });
  });

  suite('When I select items 4, 5', () => {
    const selectedItems = [items[3], items[4]];
    setup(async () => {
      downButton = await fixture(html`
        <nuxeo-move-documents-down-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems}>
        </nuxeo-move-documents-down-button>
      `);
    });

    test('Then I cannot click "Down"', () => {
      assert.equal(false, downButton._available);
    });
  });
});

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
      el.addEventListener('clear-selected-items', () => done(), { once: true });
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
