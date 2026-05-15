/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-lock-toggle-button.js';

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
