/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

if (!customElements.get('nuxeo-view-user')) {
  class NuxeoViewUserStub extends PolymerElement {
    static get is() {
      return 'nuxeo-view-user';
    }
  }
  customElements.define(NuxeoViewUserStub.is, NuxeoViewUserStub);
}

import '../nuxeo-user-group-management/nuxeo-user-profile.js';

suite('nuxeo-user-profile', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-user-profile></nuxeo-user-profile>
      `,
    );
    await flush();
  });

  suite('_isRegistered', () => {
    test('returns true for Polymer-based tag', () => {
      expect(el._isRegistered('nuxeo-view-user')).to.be.true;
    });

    test('returns false for unknown tag', () => {
      expect(el._isRegistered('nuxeo-view-user-unknown-tag-xyz')).to.be.false;
    });
  });

  suite('_computeErrorMessage', () => {
    test('matches edit-password messaging', () => {
      expect(el._computeErrorMessage('')).to.equal(el.i18n('editPassword.required'));
      expect(el._computeErrorMessage('x')).to.equal(el.i18n('editPassword.noMatch'));
    });
  });

  suite('_toast', () => {
    test('sets toast text and opens', () => {
      sinon.spy(el.$.toast, 'open');
      el._toast('hello');
      expect(el.$.toast.text).to.equal('hello');
      expect(el.$.toast.open).to.have.been.calledOnce;
      el.$.toast.open.restore();
    });
  });

  suite('_openChangePasswordDialog', () => {
    test('clears fields and opens dialog', () => {
      el.$.passwordOld.value = 'a';
      el.$.passwordNew.value = 'b';
      el.$.passwordConfirm.value = 'c';
      sinon.spy(el.$.changePasswordDialog, 'open');
      el._openChangePasswordDialog();
      expect(el.$.passwordOld.value).to.equal('');
      expect(el.$.passwordNew.value).to.equal('');
      expect(el.$.passwordConfirm.value).to.equal('');
      expect(el.$.changePasswordDialog.open).to.have.been.calledOnce;
      el.$.changePasswordDialog.open.restore();
    });
  });

  suite('_submitChangePassword', () => {
    test('submits nested form', () => {
      sinon.stub(el.$.changePasswordForm, 'submit');
      el._submitChangePassword();
      expect(el.$.changePasswordForm.submit).to.have.been.calledOnce;
      el.$.changePasswordForm.submit.restore();
    });
  });

  suite('_savePassword', () => {
    setup(() => {
      el.user = { id: 'jdoe', properties: { groups: [] }, extendedGroups: [] };
      el.$.passwordOld.value = 'old';
      el.$.passwordNew.value = 'new';
    });

    test('updates user closes dialog reconnects on success using properties.username', async () => {
      const updated = {
        id: 'some-uuid',
        name: 'jdoe',
        properties: { username: 'jdoe', groups: [] },
        extendedGroups: [],
      };
      sinon.stub(el.$.changePassword, 'put').returns(Promise.resolve(updated));
      sinon.spy(el.$.changePasswordDialog, 'close');
      sinon.stub(el.$.nxcon, 'connect');
      el.$.nxcon.username = '';
      el.$.nxcon.password = '';
      el._savePassword();
      await flush();
      await Promise.resolve();
      expect(el.user).to.equal(updated);
      expect(el.$.changePasswordDialog.close).to.have.been.calledOnce;
      expect(el.$.nxcon.username).to.equal('jdoe');
      expect(el.$.nxcon.password).to.equal('new');
      expect(el.$.nxcon.connect).to.have.been.calledOnce;
      el.$.changePassword.put.restore();
      el.$.changePasswordDialog.close.restore();
      el.$.nxcon.connect.restore();
    });

    test('falls back to user.name for nxcon.username when properties.username absent', async () => {
      const updated = { id: 'some-uuid', name: 'jdoe', properties: { groups: [] }, extendedGroups: [] };
      sinon.stub(el.$.changePassword, 'put').returns(Promise.resolve(updated));
      sinon.spy(el.$.changePasswordDialog, 'close');
      sinon.stub(el.$.nxcon, 'connect');
      el.$.nxcon.username = '';
      el._savePassword();
      await flush();
      await Promise.resolve();
      expect(el.$.nxcon.username).to.equal('jdoe');
      el.$.changePassword.put.restore();
      el.$.changePasswordDialog.close.restore();
      el.$.nxcon.connect.restore();
    });

    test('toasts wrong password on 401', async () => {
      sinon.stub(el.$.changePassword, 'put').returns(Promise.reject({ status: 401 }));
      sinon.spy(el, '_toast');
      el._savePassword();
      await flush();
      await Promise.resolve();
      expect(el._toast).to.have.been.calledWith(el.i18n('userProfile.password.wrong'), true);
      el.$.changePassword.put.restore();
      el._toast.restore();
    });

    test('toasts server message on 400', async () => {
      sinon.stub(el.$.changePassword, 'put').returns(Promise.reject({ status: 400, message: 'policy violation' }));
      sinon.spy(el, '_toast');
      el._savePassword();
      await flush();
      await Promise.resolve();
      expect(el._toast).to.have.been.calledWith('policy violation');
      el.$.changePassword.put.restore();
      el._toast.restore();
    });

    test('toasts generic error otherwise', async () => {
      sinon.stub(el.$.changePassword, 'put').returns(Promise.reject({ status: 500 }));
      sinon.spy(el, '_toast');
      el._savePassword();
      await flush();
      await Promise.resolve();
      expect(el._toast).to.have.been.calledWith(el.i18n('userProfile.password.error'), true);
      el.$.changePassword.put.restore();
      el._toast.restore();
    });
  });

  suite('iron-form-presubmit', () => {
    test('prevents default and saves password', () => {
      sinon.stub(el, '_savePassword');
      const ev = new CustomEvent('iron-form-presubmit', { cancelable: true });
      el.$.changePasswordForm.dispatchEvent(ev);
      expect(ev.defaultPrevented).to.be.true;
      expect(el._savePassword).to.have.been.calledOnce;
      el._savePassword.restore();
    });
  });

  suite('_userDisplayName', () => {
    test('returns empty string when user is null or undefined', () => {
      expect(el._userDisplayName(null)).to.equal('');
      expect(el._userDisplayName(undefined)).to.equal('');
    });

    test('prefers properties.username over user.name to avoid showing UUID', () => {
      expect(el._userDisplayName({ name: 'some-uuid', properties: { username: 'jdoe' } })).to.equal('jdoe');
    });

    test('falls back to user.name when properties.username is absent', () => {
      expect(el._userDisplayName({ name: 'jdoe', properties: {} })).to.equal('jdoe');
    });

    test('returns empty string when user has no name or username', () => {
      expect(el._userDisplayName({ properties: {} })).to.equal('');
    });

    test('returns empty string when user.properties is absent', () => {
      expect(el._userDisplayName({ id: 'some-uuid' })).to.equal('');
    });
  });

  // Keep _fetch last: it sets user with extendedGroups which triggers async rendering of
  // <nuxeo-group-tag> children. Their stray error after the test boundary can halt the
  // browser-side mocha runner, so running this suite last avoids skipping subsequent tests.
  suite('_fetch', () => {
    test('loads user when username is set', async () => {
      const body = {
        id: 'jdoe',
        properties: { password: 'secret', firstName: 'Jane', lastName: 'Doe', groups: ['g1'] },
        extendedGroups: [{ name: 'g1' }, { name: 'g2' }],
      };
      sinon.stub(el.$.request, 'get').returns(Promise.resolve(JSON.parse(JSON.stringify(body))));
      el.username = 'jdoe';
      await flush();
      await Promise.resolve();
      await Promise.resolve();
      expect(el.user.properties.password).to.be.undefined;
      expect(el.user.id).to.equal('jdoe');
      el.$.request.get.restore();
    });
  });
});
