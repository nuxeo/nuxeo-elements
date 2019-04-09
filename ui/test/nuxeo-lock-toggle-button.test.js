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
import { fixture, html, login, waitChanged } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import { tap } from '@polymer/iron-test-helpers/mock-interactions.js';
import '../actions/nuxeo-lock-toggle-button.js';
/* eslint-disable no-unused-expressions */

suite('<nuxeo-lock-toggle-button>', () => {
  let server;
  setup(async () => {
    server = await login();
  });

  suite('when a document is locked', () => {
    let element;
    setup(async () => {
      const doc = {
        'entity-type': 'document',
        uid: '1',
        lockCreated: '2016-02-19T12:47:40.501+01:00',
        lockedBy: 'Administrator',
        facets: [],
        type: 'File',
      };
      element = await fixture(
        html`
          <nuxeo-lock-toggle-button .document=${doc}></nuxeo-lock-toggle-button>
        `,
      );
      server.respondWith('POST', '/api/v1/automation/Document.Unlock', [
        200,
        { 'Content-Type': 'application/json' },
        '{"entity-type": "document","uid": "1"}',
      ]);
    });

    test('it should display the document as locked', () => {
      expect(element.locked).to.be.true;
    });

    test('toggle should unlock the document', async () => {
      // Unlock the document by toggling
      tap(element);
      await waitChanged(element, 'locked');
      expect(element.locked).to.be.false;
    });
  });

  suite('when a document is unlocked', () => {
    let element;
    setup(async () => {
      const doc = {
        'entity-type': 'document',
        uid: '1',
        facets: [],
        type: 'File',
      };
      element = await fixture(
        html`
          <nuxeo-lock-toggle-button .document=${doc}></nuxeo-lock-toggle-button>
        `,
      );
      server.respondWith('POST', '/api/v1/automation/Document.Lock', [
        200,
        { 'Content-Type': 'application/json' },
        '{"entity-type": "document","uid": "1"}',
      ]);
    });

    test('it should display the document as unlocked', () => {
      expect(element.locked).to.be.false;
    });

    test('toggle should lock the document', async () => {
      // Lock the document by toggling
      tap(element);
      await waitChanged(element, 'locked');
      expect(element.locked).to.be.true;
    });
  });
});
