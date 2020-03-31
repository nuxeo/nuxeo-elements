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
import { fixture, html, login, tap, waitForEvent } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-move-documents-down-button.js';
import '../actions/nuxeo-move-documents-up-button.js';

suite('Given on a Ordered Folder, I have 5 items', () => {
  let server;
  let downButton;
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

  suite('When I select items 1, 3, 4, 5', async () => {
    const selectedItems = [items[0], items[2], items[3], items[4]];
    setup(async () => {
      downButton = await fixture(html`
        <nuxeo-move-documents-down-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems.slice(0)}>
        </nuxeo-move-documents-down-button>
      `);
      upButton = await fixture(html`
        <nuxeo-move-documents-up-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems.slice(0)}>
        </nuxeo-move-documents-up-button>
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

    test('Then clicking "Up" should order items to 1, 2, 3, 4', async () => {
      tap(upButton);
      await waitForEvent(upButton, 'refresh-display');
      assert.equal(1, upButton.documents[0].uid);
      assert.equal(3, upButton.documents[1].uid);
      assert.equal(4, upButton.documents[2].uid);
      assert.equal(5, upButton.documents[3].uid);
      assert.equal(2, upButton.documents[4].uid);
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
      assert.equal(1, upButton.documents[0].uid);
      assert.equal(2, upButton.documents[1].uid);
      assert.equal(4, upButton.documents[2].uid);
      assert.equal(3, upButton.documents[3].uid);
      assert.equal(5, upButton.documents[4].uid);
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
      upButton = await fixture(html`
        <nuxeo-move-documents-up-button .documents=${items.slice(0)} .selectedDocuments=${selectedItems.slice(0)}>
        </nuxeo-move-documents-up-button>
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

    test('Then clicking "Up" should order items to 1, 2', async () => {
      tap(upButton);
      await waitForEvent(upButton, 'refresh-display');
      assert.equal(2, upButton.documents[0].uid);
      assert.equal(4, upButton.documents[1].uid);
      assert.equal(1, upButton.documents[2].uid);
      assert.equal(3, upButton.documents[3].uid);
      assert.equal(5, upButton.documents[4].uid);
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
      assert.equal(false, upButton._available);
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
