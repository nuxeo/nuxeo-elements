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
import config from '@nuxeo/nuxeo-elements/config.js';

if (!customElements.get('nuxeo-view-user')) {
  class NuxeoViewUserStub extends PolymerElement {
    static get is() {
      return 'nuxeo-view-user';
    }
  }
  customElements.define(NuxeoViewUserStub.is, NuxeoViewUserStub);
}

import '../widgets/nuxeo-group-tag.js';
import '../nuxeo-user-group-management/nuxeo-user-management.js';

suite('nuxeo-user-management', () => {
  let el;
  let groupTagSandbox;

  suiteSetup(() => {
    // Use a dedicated sandbox so these cross-test prototype stubs survive the global
    // `sinon.restore()` that the shared test/setup.js runs after every test.
    groupTagSandbox = sinon.createSandbox();
    groupTagSandbox.stub(Nuxeo.GroupTag.prototype, '_name').callsFake(() => '');
    groupTagSandbox.stub(Nuxeo.GroupTag.prototype, '_label').callsFake(() => '');
  });

  suiteTeardown(() => {
    groupTagSandbox.restore();
  });

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-user-management></nuxeo-user-management>
      `,
    );
  });

  suite('_computeHeaders', () => {
    test('builds fetch-* headers from config', () => {
      sinon.stub(config, 'get').callsFake((key, def) => {
        if (key === 'user.management.fetch') {
          return { group: ['memberUsers', 'memberGroups'] };
        }
        return def;
      });
      expect(el._computeHeaders()).to.deep.equal({
        'fetch-group': 'memberUsers,memberGroups',
      });
      config.get.restore();
    });

    test('returns empty object when config has no fetch map', () => {
      sinon.stub(config, 'get').returns({});
      expect(el._computeHeaders()).to.deep.equal({});
      config.get.restore();
    });
  });

  suite('_fetch', () => {
    test('loads user when username set', async () => {
      const user = {
        id: 'jdoe',
        properties: { password: 'x', username: 'jdoe', groups: ['g1'] },
        extendedGroups: [{ name: 'g1', label: 'G1' }],
      };
      sinon.stub(el.$.request, 'get').returns(Promise.resolve(JSON.parse(JSON.stringify(user))));
      el.username = 'jdoe';
      await flush();
      await Promise.resolve();
      expect(el.user.properties.password).to.be.undefined;
      expect(el.activity).to.deep.equal([]);
      expect(el.showEditGroups).to.be.false;
      el.$.request.get.restore();
    });
  });

  suite('permissions helpers', () => {
    setup(() => {
      el.user = {
        id: 'jdoe',
        properties: { username: 'jdoe', groups: [], firstName: 'J', lastName: 'Doe' },
        extendedGroups: [],
      };
    });

    test('_isAdministrator reads flag', () => {
      expect(el._isAdministrator(null)).to.not.be.ok;
      expect(el._isAdministrator({ isAdministrator: true })).to.be.true;
    });

    test('_hasAdministrationPermissions for admin or power user managing non-admin user', () => {
      el.user = { id: 'u', isAdministrator: false, properties: { username: 'u', groups: [] }, extendedGroups: [] };
      expect(el._hasAdministrationPermissions({ isAdministrator: true })).to.be.true;
      const pu = { isAdministrator: false, extendedGroups: [{ name: 'powerusers' }] };
      expect(el._hasAdministrationPermissions(pu)).to.be.true;
      el.user = {
        id: 'admin',
        isAdministrator: true,
        properties: { username: 'admin', groups: [] },
        extendedGroups: [],
      };
      expect(el._hasAdministrationPermissions(pu)).to.be.false;
    });

    test('_canEdit allows self-service username match', () => {
      el.user = { properties: { username: 'jdoe' }, extendedGroups: [] };
      const same = { properties: { username: 'jdoe' } };
      expect(el._canEdit(false, same, el.user)).to.be.true;
    });

    test('_canDelete forbids deleting own account', () => {
      el.user = {
        properties: { username: 'jdoe' },
        id: 'jdoe',
        extendedGroups: [],
      };
      const admin = { isAdministrator: true, properties: { username: 'admin' } };
      expect(el._canDelete(false, admin, el.user)).to.be.true;
      const selfAdmin = { isAdministrator: true, properties: { username: 'jdoe' } };
      expect(el._canDelete(false, selfAdmin, el.user)).to.be.false;
    });

    test('_isSameUsername', () => {
      expect(el._isSameUsername('a', 'b')).to.not.be.ok;
      expect(el._isSameUsername('a', 'a')).to.be.true;
      expect(el._isSameUsername('', 'a')).to.not.be.ok;
    });
  });

  suite('_computeGroups', () => {
    test('filters extended groups by membership', () => {
      el.user = {
        properties: { groups: ['g1', 'g2'] },
        extendedGroups: [{ name: 'g1' }, { name: 'orphan' }],
      };
      expect(el._computeGroups()).to.deep.equal([{ name: 'g1' }]);
    });
  });

  suite('_groupSelected', () => {
    setup(() => {
      el.user = {
        id: 'user-uuid',
        properties: { username: 'jdoe', groups: [] },
        extendedGroups: [],
      };
      el._currentUser = { isAdministrator: true, properties: { username: 'admin' } };
    });

    test('uses group.id when available in POST path', async () => {
      sinon.stub(el.$.request, 'post').returns(
        Promise.resolve({
          id: 'user-uuid',
          properties: { username: 'jdoe', groups: ['g1'] },
          extendedGroups: [{ name: 'g1' }],
        }),
      );
      sinon.spy(el, '_toast');
      // Set directly on __data to bypass Polymer observer / selectivity widget
      el.__data.selectedGroup = { id: 'g1-uuid', groupname: 'g1', grouplabel: 'G1' };
      el._groupSelected();
      await flush();
      await Promise.resolve();
      expect(el.$.request.path).to.equal('user/user-uuid/group/g1-uuid');
      expect(el._toast).to.have.been.calledWith(el.i18n('userManagement.addedUserToGroup', 'jdoe', 'g1'));
      el.$.request.post.restore();
      el._toast.restore();
    });

    test('falls back to group.name when group.id is absent', async () => {
      sinon.stub(el.$.request, 'post').returns(
        Promise.resolve({
          id: 'user-uuid',
          properties: { username: 'jdoe', groups: ['g1'] },
          extendedGroups: [{ name: 'g1' }],
        }),
      );
      sinon.spy(el, '_toast');
      el.__data.selectedGroup = { groupname: 'g1', grouplabel: 'G1' };
      el._groupSelected();
      await flush();
      await Promise.resolve();
      expect(el.$.request.path).to.equal('user/user-uuid/group/g1');
      el.$.request.post.restore();
      el._toast.restore();
    });

    test('rejects adding non-admin to administrators group', () => {
      el._currentUser = { isAdministrator: false, extendedGroups: [], properties: { username: 'jdoe' } };
      el.__data.selectedGroup = { groupname: 'administrators' };
      el._groupSelected();
      expect(el.errors).to.be.ok;
    });
  });

  suite('_remove', () => {
    test('removes group membership using group.id when available', async () => {
      el.user = {
        id: 'jdoe',
        properties: { username: 'jdoe', groups: ['g1'] },
        extendedGroups: [{ name: 'g1', label: 'G1' }],
      };
      sinon.spy(el, '_removeRecent');
      sinon.spy(el, '_removeFromGroup');
      sinon.spy(el, '_toast');
      sinon.stub(el.$.request, 'remove').returns(Promise.resolve());
      el._removedGroup = { id: 'g1-uuid', name: 'g1', label: 'G1' };
      await el._remove();
      await Promise.resolve();
      expect(el.$.request.path).to.equal('user/jdoe/group/g1-uuid');
      expect(el._removeRecent).to.have.been.calledWith('g1');
      expect(el._removeFromGroup).to.have.been.calledWith('g1');
      expect(el._toast).to.have.been.calledWith(el.i18n('userManagement.removedUserFromGroup', 'jdoe', 'g1'));
      el.$.request.remove.restore();
      el._removeRecent.restore();
      el._removeFromGroup.restore();
      el._toast.restore();
    });

    test('removes group membership', async () => {
      el.user = {
        id: 'jdoe',
        properties: { username: 'jdoe', groups: ['g1'] },
        extendedGroups: [{ name: 'g1', label: 'G1' }],
      };
      sinon.spy(el, '_removeRecent');
      sinon.spy(el, '_removeFromGroup');
      sinon.spy(el, '_toast');
      sinon.stub(el.$.request, 'remove').returns(Promise.resolve());
      el._removedGroup = { name: 'g1', label: 'G1' };
      await el._remove();
      await Promise.resolve();
      expect(el._removeRecent).to.have.been.calledWith('g1');
      expect(el._removeFromGroup).to.have.been.calledWith('g1');
      expect(el.$.request.remove).to.have.been.calledOnce;
      el.$.request.remove.restore();
      el._removeRecent.restore();
      el._removeFromGroup.restore();
      el._toast.restore();
    });
  });

  suite('_removeRecent', () => {
    test('splices matching activity entry', () => {
      el.activity = [{ name: 'a' }, { name: 'b' }];
      sinon.spy(el, 'splice');
      el._removeRecent('b');
      expect(el.splice).to.have.been.calledWith('activity', 1, 1);
      el.splice.restore();
    });
  });

  suite('_removeFromGroup', () => {
    test('updates properties.groups and groups array', async () => {
      el.user = {
        properties: { groups: ['g1', 'g2'] },
        extendedGroups: [
          { name: 'g1', label: 'one' },
          { name: 'g2', label: 'two' },
        ],
      };
      await flush();
      sinon.spy(el, 'splice');
      el._removeFromGroup('g2');
      expect(el.user.properties.groups).to.deep.equal(['g1']);
      expect(el.splice).to.have.been.calledWith('groups', sinon.match.number, 1);
      el.splice.restore();
    });
  });

  suite('_userRemovedFromGroup', () => {
    test('sets empty when no groups remain', () => {
      el.user = {
        properties: { groups: [] },
        extendedGroups: [],
      };
      el._userRemovedFromGroup();
      expect(el.empty).to.be.true;
    });
  });

  suite('dialogs and editors', () => {
    let pickerValueStub;

    setup(async () => {
      await flush();
      const s2 = el.$.picker && el.$.picker.$ && el.$.picker.$.s2;
      if (s2) {
        if (pickerValueStub) {
          pickerValueStub.restore();
          pickerValueStub = null;
        }
        pickerValueStub = sinon.stub(s2, '_valueChanged').callsFake(() => {});
      }
    });

    teardown(() => {
      if (pickerValueStub) {
        pickerValueStub.restore();
        pickerValueStub = null;
      }
    });

    test('_toggleEditGroups resets picker state', () => {
      el.$.picker.value = 'y';
      el.showEditGroups = false;
      el._toggleEditGroups();
      expect(el.showEditGroups).to.be.true;
      expect(el.$.picker.value).to.equal('');
    });

    test('_toggleDialog assigns removed group', () => {
      sinon.stub(el.$.dialog, 'toggle');
      el._toggleDialog({
        model: { item: { name: 'gx', label: 'Gx' } },
      });
      expect(el._removedGroup.name).to.equal('gx');
      el.$.dialog.toggle.restore();
    });

    test('_toggleChangePassword resets editor when supported', () => {
      el.$.passwordEditor.resetFields = sinon.spy();
      sinon.stub(el.$.changePasswordDialog, 'toggle');
      el._toggleChangePassword();
      expect(el.$.passwordEditor.resetFields).to.have.been.calledOnce;
      el.$.changePasswordDialog.toggle.restore();
    });

    test('_toggleChangePassword skips reset when editor lacks resetFields', () => {
      delete el.$.passwordEditor.resetFields;
      sinon.stub(el.$.changePasswordDialog, 'toggle');
      expect(() => el._toggleChangePassword()).to.not.throw();
      el.$.changePasswordDialog.toggle.restore();
    });

    test('_submitChangePassword submits nested form', () => {
      sinon.stub(el.$.changePasswordForm, 'submit');
      el._submitChangePassword();
      expect(el.$.changePasswordForm.submit).to.have.been.calledOnce;
      el.$.changePasswordForm.submit.restore();
    });

    test('_savePassword updates password on success', async () => {
      el.user = { id: 'jdoe', properties: { username: 'jdoe', groups: [] }, extendedGroups: [] };
      el.$.passwordEditor.password = 'npw';
      const updated = { id: 'jdoe', properties: { username: 'jdoe', groups: [] }, extendedGroups: [] };
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve(updated));
      sinon.stub(el.$.changePasswordDialog, 'toggle');
      sinon.spy(el, '_toast');
      el._savePassword();
      await flush();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(el.user).to.equal(updated);
      expect(el.$.changePasswordDialog.toggle).to.have.been.calledOnce;
      el.$.editRequest.put.restore();
      el.$.changePasswordDialog.toggle.restore();
      el._toast.restore();
    });

    test('_savePassword shows toast on failure', async () => {
      el.user = { id: 'jdoe', properties: { username: 'jdoe', groups: [] }, extendedGroups: [] };
      el.$.passwordEditor.password = 'bad';
      sinon.stub(el.$.editRequest, 'put').returns(Promise.reject(new Error('fail')));
      sinon.spy(el, '_toast');
      el._savePassword();
      await flush();
      await Promise.resolve();
      expect(el._toast).to.have.been.calledWith(el.i18n('userProfile.password.error'));
      el.$.editRequest.put.restore();
      el._toast.restore();
    });

    test('_toggleEditUser opens dialog with cloned model', () => {
      el.user = {
        id: 'jdoe',
        properties: { username: 'jdoe', firstName: 'J', groups: [] },
        extendedGroups: [],
      };
      sinon.stub(el.$.editUserDialog, 'toggle');
      el._toggleEditUser();
      expect(el.$.layout.model.user.firstName).to.equal('J');
      expect(el.$.editUserDialog.toggle).to.have.been.calledOnce;
      el.$.editUserDialog.toggle.restore();
    });

    test('_submitEditUser submits edit form', () => {
      sinon.stub(el.$.editUserForm, 'submit');
      el._submitEditUser();
      expect(el.$.editUserForm.submit).to.have.been.calledOnce;
      el.$.editUserForm.submit.restore();
    });

    test('_saveUser persists layout model', async () => {
      el.user = {
        id: 'jdoe',
        properties: { username: 'jdoe', firstName: 'J', groups: [] },
        extendedGroups: [],
      };
      el.$.layout.model = { user: { username: 'jdoe', firstName: 'Jane' } };
      const updated = {
        id: 'jdoe',
        properties: { username: 'jdoe', firstName: 'Jane', groups: [] },
        extendedGroups: [],
      };
      sinon.stub(el.$.editUserDialog, 'toggle');
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve(updated));
      sinon.spy(el, '_toast');
      el._saveUser();
      await flush();
      await Promise.resolve();
      await Promise.resolve();
      expect(el.$.editRequest.put).to.have.been.calledOnce;
      expect(el.user).to.equal(updated);
      expect(el._toast).to.have.been.calledOnce;
      el.$.editUserDialog.toggle.restore();
      el.$.editRequest.put.restore();
      el._toast.restore();
    });

    test('_toggleDeleteUser toggles confirmation dialog', () => {
      sinon.stub(el.$.deleteUserDialog, 'toggle');
      el._toggleDeleteUser();
      expect(el.$.deleteUserDialog.toggle).to.have.been.calledOnce;
      el.$.deleteUserDialog.toggle.restore();
    });

    test('_deleteUser dispatches deleted event', async () => {
      el.user = { id: 'jdoe', properties: { username: 'jdoe', groups: [] }, extendedGroups: [] };
      sinon.stub(el.$.deleteUserDialog, 'toggle');
      sinon.stub(el.$.editRequest, 'remove').returns(Promise.resolve());
      sinon.spy(el, '_goHome');
      const spy = sinon.spy();
      el.addEventListener('nuxeo-user-deleted', spy);
      el._deleteUser();
      await flush();
      await Promise.resolve();
      expect(spy).to.have.been.calledOnce;
      expect(el._goHome).to.have.been.calledOnce;
      el.$.deleteUserDialog.toggle.restore();
      el.$.editRequest.remove.restore();
      el._goHome.restore();
    });
  });

  suite('_resultsFilter', () => {
    test('filters entries already in groups', () => {
      el.user = {
        properties: { groups: ['g1'] },
        extendedGroups: [{ name: 'g1', label: 'G1' }],
      };
      expect(el._resultsFilter({ id: 'g1' })).to.be.false;
      expect(el._resultsFilter({ id: 'g2' })).to.be.true;
    });
  });

  suite('_toast / _layoutHref / _goHome', () => {
    test('_toast opens toast', () => {
      sinon.spy(el.$.toast, 'open');
      el._toast('hi');
      expect(el.$.toast.text).to.equal('hi');
      expect(el.$.toast.open).to.have.been.calledOnce;
      el.$.toast.open.restore();
    });

    test('_layoutHref delegates to resolveUrl', () => {
      sinon.stub(el, 'resolveUrl').returns('/layout');
      expect(el._layoutHref('nuxeo-edit-user.html')).to.equal('/layout');
      el.resolveUrl.restore();
    });

    test('_goHome fires goHome event', () => {
      const spy = sinon.spy();
      el.addEventListener('goHome', spy);
      el._goHome();
      expect(spy).to.have.been.calledOnce;
    });
  });

  suite('iron-form-presubmit', () => {
    test('edit user form prevents default and saves', () => {
      sinon.stub(el, '_saveUser');
      const ev = new CustomEvent('iron-form-presubmit', { cancelable: true });
      el.$.editUserForm.dispatchEvent(ev);
      expect(ev.defaultPrevented).to.be.true;
      expect(el._saveUser).to.have.been.calledOnce;
      el._saveUser.restore();
    });

    test('change password form prevents default and saves password', () => {
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
      expect(
        el._userDisplayName({
          id: 'internal-uid',
          name: 'some-uuid',
          properties: { username: 'loginName' },
        }),
      ).to.equal('loginName');
    });

    test('falls back to user.name when properties.username is absent', () => {
      expect(
        el._userDisplayName({
          id: 'internal-uid',
          name: 'jdoe',
          properties: {},
        }),
      ).to.equal('jdoe');
    });

    test('does not use user.id as display name', () => {
      expect(
        el._userDisplayName({
          id: 'generated-uuid',
          properties: { username: 'jdoe' },
        }),
      ).to.equal('jdoe');
    });

    test('returns empty string when user.properties is absent', () => {
      expect(el._userDisplayName({ id: 'generated-uuid' })).to.equal('');
    });
  });
});
