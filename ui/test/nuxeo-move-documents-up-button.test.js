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
import '../actions/nuxeo-move-documents-up-button.js';

suite('Given on a Ordered Folder, I have 5 items', () => {
  let server;
  let upButton;
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
      upButton = await fixture(html`
        <nuxeo-move-documents-up-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems.slice(0)}>
        </nuxeo-move-documents-up-button>
      `);
    });

    test('Then clicking "Up" should order items to 1, 2, 3, 4', async () => {
      tap(upButton);
      await waitForEvent(upButton, 'refresh-display');
      assert.equal(upButton.documents[0].uid, 1);
      assert.equal(upButton.documents[1].uid, 3);
      assert.equal(upButton.documents[2].uid, 4);
      assert.equal(upButton.documents[3].uid, 5);
      assert.equal(upButton.documents[4].uid, 2);
    });
  });

  suite('When I select items 1, 2, 4', () => {
    const selectedItems = [items[0], items[1], items[3]];
    setup(async () => {
      upButton = await fixture(html`
        <nuxeo-move-documents-up-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems.slice(0)}>
        </nuxeo-move-documents-up-button>
      `);
    });

    test('Then clicking "Up" should order items to 1, 2, 3', async () => {
      tap(upButton);
      await waitForEvent(upButton, 'refresh-display');
      assert.equal(upButton.documents[0].uid, 1);
      assert.equal(upButton.documents[1].uid, 2);
      assert.equal(upButton.documents[2].uid, 4);
      assert.equal(upButton.documents[3].uid, 3);
      assert.equal(upButton.documents[4].uid, 5);
    });
  });

  suite('When I select items 2, 4', () => {
    const selectedItems = [items[1], items[3]];
    setup(async () => {
      upButton = await fixture(html`
        <nuxeo-move-documents-up-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems.slice(0)}>
        </nuxeo-move-documents-up-button>
      `);
    });

    test('Then clicking "Up" should order items to 1, 2', async () => {
      tap(upButton);
      await waitForEvent(upButton, 'refresh-display');
      assert.equal(upButton.documents[0].uid, 2);
      assert.equal(upButton.documents[1].uid, 4);
      assert.equal(upButton.documents[2].uid, 1);
      assert.equal(upButton.documents[3].uid, 3);
      assert.equal(upButton.documents[4].uid, 5);
    });
  });

  suite('When I select items 1, 2', () => {
    const selectedItems = [items[0], items[1]];
    setup(async () => {
      upButton = await fixture(html`
        <nuxeo-move-documents-up-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems}>
        </nuxeo-move-documents-up-button>
      `);
      server.respondWith('POST', '/api/v1/automation/Document.Order', [
        200,
        { 'Content-Type': 'application/json' },
        '{}',
      ]);
    });

    test('Then I cannot click "Up"', () => {
      assert.equal(upButton._available, false);
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
      el.addEventListener('clear-selected-items', () => done(), { once: true });
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
