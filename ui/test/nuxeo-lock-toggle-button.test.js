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

suite('nuxeo-lock-toggle-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-lock-toggle-button></nuxeo-lock-toggle-button>
      `,
    );
    sinon.stub(el, 'isImmutable').returns(false);
    sinon.stub(el, 'hasPermission').returns(true);
  });

  teardown(() => {
    el.isImmutable.restore();
    el.hasPermission.restore();
  });

  suite('_isAvailable', () => {
    test('returns falsy when doc is null', () => {
      expect(el._isAvailable(null, false)).to.not.be.ok;
    });

    test('returns falsy when doc is undefined', () => {
      expect(el._isAvailable(undefined, false)).to.not.be.ok;
    });

    test('returns true for valid doc with Write permission', () => {
      const doc = { type: 'File', isVersion: false };
      expect(el._isAvailable(doc, false)).to.be.true;
    });

    test('returns false when doc is a version', () => {
      const doc = { type: 'File', isVersion: true };
      expect(el._isAvailable(doc, false)).to.be.false;
    });

    test('returns false when doc is immutable', () => {
      el.isImmutable.returns(true);
      const doc = { type: 'File', isVersion: false };
      expect(el._isAvailable(doc, false)).to.be.false;
    });

    test('returns false when doc is Root', () => {
      const doc = { type: 'Root', isVersion: false };
      expect(el._isAvailable(doc, false)).to.be.false;
    });

    test('returns true when locked and only has Read permission', () => {
      el.hasPermission.callsFake((doc, perm) => perm === 'Read');
      const doc = { type: 'File', isVersion: false };
      expect(el._isAvailable(doc, true)).to.be.true;
    });

    test('returns false when locked but no Read or Write', () => {
      el.hasPermission.returns(false);
      const doc = { type: 'File', isVersion: false };
      expect(el._isAvailable(doc, true)).to.be.false;
    });
  });

  suite('_computeIcon', () => {
    test('returns lock icon when locked', () => {
      expect(el._computeIcon(true)).to.equal('nuxeo:lock');
    });

    test('returns unlock icon when not locked', () => {
      expect(el._computeIcon(false)).to.equal('nuxeo:unlock');
    });
  });

  suite('_computeLabel', () => {
    test('returns unlock label when locked', () => {
      el.document = { lockOwner: 'jdoe', lockCreated: '2024-01-01' };
      el.locked = true;
      const result = el._computeLabel(true);
      expect(result).to.be.a('string');
    });

    test('returns lock label when not locked', () => {
      el.document = {};
      el.locked = false;
      const result = el._computeLabel(false);
      expect(result).to.be.a('string');
    });
  });

  suite('_computeTooltip', () => {
    test('returns lockedBy tooltip when locked with lockOwner and lockCreated', () => {
      el.document = { lockOwner: 'jdoe', lockCreated: '2024-01-01T00:00:00Z' };
      const result = el._computeTooltip(true);
      expect(result).to.be.a('string');
    });

    test('returns generic unlock tooltip when locked without lockOwner', () => {
      el.document = {};
      const result = el._computeTooltip(true);
      expect(result).to.be.a('string');
    });

    test('returns lock tooltip when not locked', () => {
      el.document = {};
      const result = el._computeTooltip(false);
      expect(result).to.be.a('string');
    });
  });

  suite('_documentChanged', () => {
    test('sets locked to true when document has lockCreated', () => {
      el.document = { lockCreated: '2024-01-01T00:00:00Z' };
      el._documentChanged();
      expect(el.locked).to.be.true;
    });

    test('sets locked to false when document has no lockCreated', () => {
      el.document = {};
      el._documentChanged();
      expect(el.locked).to.be.false;
    });

    test('sets locked to false when document is null', () => {
      el.document = null;
      el._documentChanged();
      expect(el.locked).to.be.false;
    });
  });

  suite('_handleError', () => {
    test('notifies with 403 error message', () => {
      const notifySpy = sinon.spy(el, 'notify');
      el.locked = false;
      el._handleError({ response: { status: 403 } });
      expect(notifySpy).to.have.been.calledOnce;
      notifySpy.restore();
    });

    test('notifies with 409 error message when locked', () => {
      el.document = { lockOwner: 'j', lockCreated: '2024-01-01' };
      el.locked = true;
      const notifySpy = sinon.spy(el, 'notify');
      el._handleError({ response: { status: 409 } });
      expect(notifySpy).to.have.been.calledOnce;
      notifySpy.restore();
    });

    test('notifies with 409 error message when not locked', () => {
      const notifySpy = sinon.spy(el, 'notify');
      el.locked = false;
      el._handleError({ response: { status: 409 } });
      expect(notifySpy).to.have.been.calledOnce;
      notifySpy.restore();
    });

    test('notifies with default error for unknown status', () => {
      const notifySpy = sinon.spy(el, 'notify');
      el.locked = false;
      el._handleError({ response: { status: 500 } });
      expect(notifySpy).to.have.been.calledOnce;
      notifySpy.restore();
    });
  });
});
