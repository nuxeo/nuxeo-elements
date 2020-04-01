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
import { fixture, flush, html, login, tap, waitForEvent } from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom';
import '../actions/nuxeo-lock-toggle-button.js';

suite('nuxeo-lock-toggle-button', () => {
  let button;
  let server;

  const lockedDocument = {
    'entity-type': 'document',
    uid: '1',
    contextParameters: {
      permissions: ['Write'],
    },
    facets: [],
    lockCreated: '2016-02-19T12:47:40.501+01:00',
    lockOwner: 'Administrator',
    type: 'File',
  };

  setup(async () => {
    server = await login();
    button = await fixture(
      html`
        <nuxeo-lock-toggle-button></nuxeo-lock-toggle-button>
      `,
    );
  });

  suite('Button Visibility', () => {
    test('Should not be visible when document is null', async () => {
      button.document = null;
      await flush();
      expect(dom(button.root).querySelector('.action')).to.be.null;
    });

    test('Should not be visible when document is a version', async () => {
      button.document = {
        isVersion: true,
      };
      await flush();
      expect(dom(button.root).querySelector('.action')).to.be.null;
    });

    test('Should not be visible when document is immutable', async () => {
      const doc = Object.assign({}, lockedDocument);
      doc.facets = ['Immutable'];
      button.document = doc;
      await flush();
      expect(dom(button.root).querySelector('.action')).to.be.null;
    });

    test("Should not be visible when document type is 'Root'", async () => {
      const doc = Object.assign({}, lockedDocument);
      doc.type = 'Root';
      button.document = doc;
      await flush();
      expect(dom(button.root).querySelector('.action')).to.be.null;
    });

    test('Should be visible otherwise', async () => {
      button.document = lockedDocument;
      await flush();

      const actionDiv = dom(button.root).querySelector('.action');
      expect(actionDiv).to.not.be.null;
      expect(actionDiv.querySelector('.label')).to.not.be.null;
      expect(actionDiv.querySelector('paper-icon-button')).to.not.be.null;
    });

    test('Should have corresponding information when visible and locked', async () => {
      button.document = lockedDocument;
      await flush();

      const actionDiv = dom(button.root).querySelector('.action');
      expect(actionDiv).to.not.be.null;

      const label = actionDiv.querySelector('.label').textContent.trim();
      expect(label).to.equal('lockToggleButton.tooltip.unlock');

      const icon = actionDiv.querySelector('paper-icon-button');
      expect(icon).to.not.be.null;
      expect(icon.icon).to.equal('nuxeo:lock');
    });

    test('Should have corresponding information when visible and unlocked', async () => {
      const doc = Object.assign({}, lockedDocument);
      doc.lockCreated = null;
      doc.lockOwner = null;
      button.document = doc;
      await flush();

      const actionDiv = dom(button.root).querySelector('.action');
      expect(actionDiv).to.not.be.null;

      const label = actionDiv.querySelector('.label').textContent.trim();
      expect(label).to.equal('lockToggleButton.tooltip.lock');

      const icon = actionDiv.querySelector('paper-icon-button');
      expect(icon).to.not.be.null;
      expect(icon.icon).to.equal('nuxeo:unlock');
    });
  });

  suite('Server Responds with Exceptions', () => {
    setup(async () => {
      sinon.spy(button.$.opUnlock, 'execute');
      sinon.spy(button.$.opLock, 'execute');
    });

    test('Should trigger notify event when trying to unlock document and permissions error is received', async () => {
      server.respondWith('POST', '/api/v1/automation/Document.Unlock', [
        403,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          'entity-type': 'exception',
          message: 'FORBIDDEN',
          status: 403,
        }),
      ]);

      button.document = lockedDocument;
      tap(button);
      expect(button.$.opUnlock.execute.calledOnce).to.be.true;
      expect(button.$.opLock.execute.notCalled).to.true;

      const event = await waitForEvent(button, 'notify');
      expect(event.detail).to.exist.and.to.have.key('message');
      expect(event.detail.message).to.equal('lockToggleButton.unlock.error.noPermissions');
    });

    test('Should trigger notify event when trying to unlock document and conflict error is received', async () => {
      server.respondWith('POST', '/api/v1/automation/Document.Unlock', [
        409,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          'entity-type': 'exception',
          message: 'CONFLICT',
          status: 409,
        }),
      ]);

      button.document = lockedDocument;
      tap(button);
      expect(button.$.opUnlock.execute.calledOnce).to.be.true;
      expect(button.$.opLock.execute.notCalled).to.be.true;

      const event = await waitForEvent(button, 'notify');
      expect(event.detail).to.exist.and.to.have.key('message');
      expect(event.detail.message).to.equal('lockToggleButton.unlock.error.lockedByAnotherUser');
    });

    test('Should trigger notify event when trying to unlock document and unexpected error is received', async () => {
      server.respondWith('POST', '/api/v1/automation/Document.Unlock', [
        500,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          'entity-type': 'exception',
          message: 'Internal Server Error',
          status: 500,
        }),
      ]);

      button.document = lockedDocument;
      tap(button);
      expect(button.$.opUnlock.execute.calledOnce).to.be.true;
      expect(button.$.opLock.execute.notCalled).to.be.true;

      const event = await waitForEvent(button, 'notify');
      expect(event.detail).to.exist.and.to.have.key('message');
      expect(event.detail.message).to.equal('lockToggleButton.unlock.error.unexpectedError');
    });

    test('Should trigger notify event when trying to lock document and permissions error is received', async () => {
      server.respondWith('POST', '/api/v1/automation/Document.Lock', [
        403,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          'entity-type': 'exception',
          message: 'FORBIDDEN',
          status: 403,
        }),
      ]);

      const doc = Object.assign({}, lockedDocument);
      doc.lockCreated = null;
      doc.lockOwner = null;
      button.document = doc;
      tap(button);
      expect(button.$.opUnlock.execute.notCalled).to.be.true;
      expect(button.$.opLock.execute.calledOnce).to.be.true;

      const event = await waitForEvent(button, 'notify');
      expect(event.detail).to.exist.and.to.have.key('message');
      expect(event.detail.message).to.equal('lockToggleButton.lock.error.noPermissions');
    });

    test('Should trigger notify event when trying to lock document and conflict error is received', async () => {
      server.respondWith('POST', '/api/v1/automation/Document.Lock', [
        409,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          'entity-type': 'exception',
          message: 'CONFLICT',
          status: 409,
        }),
      ]);

      const doc = Object.assign({}, lockedDocument);
      doc.lockCreated = null;
      doc.lockOwner = null;
      button.document = doc;
      tap(button);
      expect(button.$.opUnlock.execute.notCalled).to.be.true;
      expect(button.$.opLock.execute.calledOnce).to.be.true;

      const event = await waitForEvent(button, 'notify');
      expect(event.detail).to.exist.and.to.have.key('message');
      expect(event.detail.message).to.equal('lockToggleButton.lock.error.alreadyLocked');
    });

    test('Should trigger notify event when trying to lock document and unexpected error is received', async () => {
      server.respondWith('POST', '/api/v1/automation/Document.Lock', [
        500,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          'entity-type': 'exception',
          message: 'Internal Server Error',
          status: 500,
        }),
      ]);

      const doc = Object.assign({}, lockedDocument);
      doc.lockCreated = null;
      doc.lockOwner = null;
      button.document = doc;
      tap(button);
      expect(button.$.opUnlock.execute.notCalled).to.be.true;
      expect(button.$.opLock.execute.calledOnce).to.be.true;

      const event = await waitForEvent(button, 'notify');
      expect(event.detail).to.exist.and.to.have.key('message');
      expect(event.detail.message).to.equal('lockToggleButton.lock.error.unexpectedError');
    });
  });

  suite('Server Responds Success', () => {
    setup(async () => {
      sinon.spy(button.$.opUnlock, 'execute');
      sinon.spy(button.$.opLock, 'execute');
    });

    test('Should unlock the document', async () => {
      const doc = Object.assign({}, lockedDocument);
      doc.lockCreated = null;
      doc.lockOwner = null;

      server.respondWith('POST', '/api/v1/automation/Document.Unlock', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(doc),
      ]);

      button.document = lockedDocument;
      // Unlock the document by toggling
      tap(button);

      expect(button.$.opUnlock.execute.calledOnce).to.be.true;
      expect(button.$.opLock.execute.notCalled).to.be.true;

      const event = await waitForEvent(button, 'document-unlocked');
      expect(event.detail).to.exist.and.to.have.key('doc');
      expect(event.detail.doc.uid).to.equal(lockedDocument.uid);
      expect(event.detail.doc.lockCreated).to.be.null;
      expect(event.detail.doc.lockOwner).to.be.null;

      // Simulate document update
      button.document = event.detail.doc;
      expect(button.locked).to.be.false;
      expect(button.icon).to.equal('nuxeo:unlock');
      expect(button.tooltip).to.equal('lockToggleButton.tooltip.lock');
    });

    test('Should lock the document', async () => {
      server.respondWith('POST', '/api/v1/automation/Document.Lock', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(lockedDocument),
      ]);

      const doc = Object.assign({}, lockedDocument);
      doc.lockCreated = null;
      doc.lockOwner = null;
      button.document = doc;
      // Lock the document by toggling
      tap(button);
      expect(button.$.opUnlock.execute.notCalled).to.be.true;
      expect(button.$.opLock.execute.calledOnce).to.be.true;

      const event = await waitForEvent(button, 'document-locked');
      expect(event.detail).to.exist.and.to.have.key('doc');
      expect(event.detail.doc.uid).to.equal(lockedDocument.uid);
      expect(event.detail.doc.lockCreated).to.equal('2016-02-19T12:47:40.501+01:00');
      expect(event.detail.doc.lockOwner).to.equal('Administrator');

      // Simulate document update
      button.document = event.detail.doc;
      expect(button.locked).to.be.true;
      expect(button.icon).to.equal('nuxeo:lock');
      expect(button.tooltip).to.equal('lockToggleButton.tooltip.lockedBy');
    });
  });
});
