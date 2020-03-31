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
import { fixture, html, login, tap, waitChanged } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-notifications-toggle-button.js';

/* eslint-disable no-unused-expressions */

suite('nuxeo-notifications-toggle-button', () => {
  let server;
  setup(async () => {
    server = await login();
  });

  suite('when a document is subscribed', () => {
    let element;
    setup(async () => {
      const doc = {
        'entity-type': 'document',
        uid: '1',
        contextParameters: {
          subscribedNotifications: ['Creation', 'Modification'],
        },
      };

      element = await fixture(html`
        <nuxeo-notifications-toggle-button .document=${doc}></nuxeo-notifications-toggle-button>
      `);
      server.respondWith('POST', '/api/v1/automation/Document.Unsubscribe', [
        200,
        { 'Content-Type': 'application/json' },
        '{"entity-type": "document","uid": "1"}',
      ]);
    });

    test('it should display the document as subscribed', () => {
      expect(element.subscribed).to.be.true;
    });

    test('toggle should unsubscribe the document', async () => {
      // Unsubscribe document by toggling
      tap(element);
      await waitChanged(element, 'subscribed');
      expect(element.subscribed).to.be.false;
    });
  });

  suite('when a document is not subscribed', () => {
    let element;
    setup(async () => {
      const doc = {
        'entity-type': 'document',
        uid: '1',
        contextParameters: {
          subscribedNotifications: [],
        },
      };
      element = await fixture(html`
        <nuxeo-notifications-toggle-button .document=${doc}></nuxeo-notifications-toggle-button>
      `);
      server.respondWith('POST', '/api/v1/automation/Document.Subscribe', [
        200,
        { 'Content-Type': 'application/json' },
        '{"entity-type": "document","uid": "1"}',
      ]);
    });

    test('it should display the document as not subscribed', () => {
      expect(element.subscribed).to.be.false;
    });

    test('toggle should subscribe the document', async () => {
      // Subscribe all documents by toggling
      tap(element);
      await waitChanged(element, 'subscribed');
      expect(element.subscribed).to.be.true;
    });
  });
});
