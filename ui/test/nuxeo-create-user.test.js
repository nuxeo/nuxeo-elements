/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-user-group-management/nuxeo-create-user.js';

suite('nuxeo-create-user', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-create-user></nuxeo-create-user>
      `,
    );
    await flush();
  });

  suite('_goHome', () => {
    test('dispatches bubbling composed goHome event', () => {
      const spy = sinon.spy();
      el.addEventListener('goHome', spy);
      el._goHome();
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].composed).to.be.true;
      expect(spy.firstCall.args[0].bubbles).to.be.true;
    });
  });

  suite('_submit / _submitAnother', () => {
    test('_submit resets create-another flag and submits form', () => {
      sinon.stub(el.$.form, 'submit');
      el._createAnother = true;
      el._submit();
      expect(el._createAnother).to.be.false;
      expect(el.$.form.submit).to.have.been.calledOnce;
      el.$.form.submit.restore();
    });

    test('_submitAnother sets create-another flag and submits form', () => {
      sinon.stub(el.$.form, 'submit');
      el._createAnother = false;
      el._submitAnother();
      expect(el._createAnother).to.be.true;
      expect(el.$.form.submit).to.have.been.calledOnce;
      el.$.form.submit.restore();
    });
  });

  suite('_cancel', () => {
    test('resets fields and navigates home', () => {
      sinon.spy(el, '_resetFields');
      sinon.spy(el, '_goHome');
      el._cancel();
      expect(el._resetFields).to.have.been.calledOnce;
      expect(el._goHome).to.have.been.calledOnce;
      el._resetFields.restore();
      el._goHome.restore();
    });
  });

  suite('_hasErrors', () => {
    test('returns false when errors string is empty', () => {
      el.errors = '';
      expect(el._hasErrors()).to.be.false;
    });

    test('returns true when errors string is non-empty', () => {
      el.errors = 'oops';
      expect(el._hasErrors()).to.be.true;
    });
  });

  suite('_isAdministrator', () => {
    test('returns falsy for missing user', () => {
      expect(el._isAdministrator(null)).to.not.be.ok;
      expect(el._isAdministrator(undefined)).to.not.be.ok;
    });

    test('returns flag from user object', () => {
      expect(el._isAdministrator({ isAdministrator: true })).to.be.true;
      expect(el._isAdministrator({ isAdministrator: false })).to.be.false;
    });
  });

  suite('_layoutHref / _layoutModel', () => {
    test('_layoutHref resolves layout path', () => {
      sinon.stub(el, 'resolveUrl').returns('/resolved/layout.html');
      expect(el._layoutHref('nuxeo-edit-user.html')).to.equal('/resolved/layout.html');
      expect(el.resolveUrl).to.have.been.calledWith('nuxeo-edit-user.html');
      el.resolveUrl.restore();
    });

    test('_layoutModel exposes user and new flag', () => {
      el.user = { username: 'jdoe' };
      expect(el._layoutModel()).to.deep.equal({ user: el.user, new: true });
    });
  });

  suite('_create', () => {
    test('blocks non-administrator assigning administrators group', () => {
      el._currentUser = { isAdministrator: false };
      el.user = { username: 'x', groups: ['administrators'] };
      sinon.spy(el, '_doCreate');
      el._create();
      expect(el.errors).to.equal(el.i18n('createUser.errorAdministratorsGroup'));
      expect(el._doCreate).to.not.have.been.called;
      el._doCreate.restore();
    });

    test('on success resets fields and goes home when not creating another', async () => {
      el._currentUser = { isAdministrator: true };
      el.user = { username: 'u', groups: [] };
      sinon.stub(el, '_doCreate').returns(Promise.resolve());
      sinon.spy(el, '_resetFields');
      sinon.spy(el, '_goHome');
      el._createAnother = false;
      el._create();
      await flush();
      await Promise.resolve();
      expect(el._resetFields).to.have.been.calledOnce;
      expect(el._goHome).to.have.been.calledOnce;
      el._doCreate.restore();
      el._resetFields.restore();
      el._goHome.restore();
    });

    test('on success stays when creating another', async () => {
      el._currentUser = { isAdministrator: true };
      sinon.stub(el, '_doCreate').returns(Promise.resolve());
      sinon.spy(el, '_goHome');
      el._createAnother = true;
      el._create();
      await flush();
      await Promise.resolve();
      expect(el._goHome).to.not.have.been.called;
      el._doCreate.restore();
      el._goHome.restore();
    });

    test('maps JSON error response to message', async () => {
      el._currentUser = { isAdministrator: true };
      el.user = { username: 'u', groups: [] };
      const err = {
        response: { text: () => Promise.resolve(JSON.stringify({ message: 'from json' })) },
      };
      sinon.stub(el, '_doCreate').returns(Promise.reject(err));
      el._create();
      await flush();
      await Promise.resolve();
      expect(el.errors).to.equal('from json');
      el._doCreate.restore();
    });

    test('falls back to error.message when response text is invalid JSON', async () => {
      el._currentUser = { isAdministrator: true };
      el.user = { username: 'u', groups: [] };
      const err = {
        response: { text: () => Promise.resolve('not-json') },
      };
      sinon.stub(el, '_doCreate').returns(Promise.reject(err));
      el._create();
      await flush();
      await Promise.resolve();
      expect(el.errors).to.equal(err);
      el._doCreate.restore();
    });

    test('uses error.message when no response', async () => {
      el._currentUser = { isAdministrator: true };
      el.user = { username: 'u', groups: [] };
      sinon.stub(el, '_doCreate').returns(Promise.reject(new Error('plain')));
      el._create();
      await flush();
      await Promise.resolve();
      expect(el.errors).to.equal('plain');
      el._doCreate.restore();
    });
  });

  suite('_doCreate', () => {
    test('posts user and fires nuxeo-user-created when usePassword', async () => {
      el.usePassword = true;
      el.user = { username: 'jdoe', password: 'pw' };
      const newUser = { id: 'jdoe' };
      sinon.stub(el.$.request, 'post').returns(Promise.resolve(newUser));
      const spy = sinon.spy();
      el.addEventListener('nuxeo-user-created', spy);
      await el._doCreate(el.user);
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail).to.equal(newUser);
      el.$.request.post.restore();
    });

    test('invites user and fires nuxeo-user-invited when not usePassword', async () => {
      el.usePassword = false;
      el.user = { username: 'invite' };
      sinon.stub(el.$.invite, 'execute').returns(Promise.resolve());
      const spy = sinon.spy();
      el.addEventListener('nuxeo-user-invited', spy);
      await el._doCreate(el.user);
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.id).to.equal('invite');
      el.$.invite.execute.restore();
    });
  });

  suite('iron-form-presubmit', () => {
    test('prevents default and creates user', () => {
      sinon.stub(el, '_create');
      const ev = new CustomEvent('iron-form-presubmit', { cancelable: true });
      el.$.form.dispatchEvent(ev);
      expect(ev.defaultPrevented).to.be.true;
      expect(el._create).to.have.been.calledOnce;
      el._create.restore();
    });
  });

  suite('_resetFields', () => {
    test('clears user groups errors and password toggle', () => {
      el.user = { username: 'x' };
      el.errors = 'e';
      el.usePassword = true;
      const pw = el.$$('#passwordEditor');
      if (pw && pw.resetFields) {
        sinon.spy(pw, 'resetFields');
      }
      el._resetFields();
      expect(el.user).to.deep.equal({ groups: [] });
      expect(el.errors).to.equal('');
      expect(el.usePassword).to.be.false;
      if (pw && pw.resetFields && pw.resetFields.restore) {
        pw.resetFields.restore();
      }
    });
  });
});
