/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-user-group-management/nuxeo-group-management.js';

suite('nuxeo-group-management', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-group-management></nuxeo-group-management>
      `,
    );
    await flush();
  });

  suite('_hasAdministrationPermissions', () => {
    test('returns falsy without user', () => {
      expect(el._hasAdministrationPermissions(null)).to.not.be.ok;
    });

    test('allows administrator always', () => {
      expect(el._hasAdministrationPermissions({ isAdministrator: true })).to.be.true;
    });

    test('allows power user except on administrators group', () => {
      const pu = { isAdministrator: false, extendedGroups: [{ name: 'powerusers' }] };
      el.groupname = 'administrators';
      expect(el._hasAdministrationPermissions(pu)).to.be.false;
      el.groupname = 'editors';
      expect(el._hasAdministrationPermissions(pu)).to.be.true;
    });
  });

  suite('_canEditGroup', () => {
    test('respects readonly flag', () => {
      sinon.stub(el, '_hasAdministrationPermissions').returns(true);
      expect(el._canEditGroup(true, {}, 'g')).to.be.false;
      expect(el._canEditGroup(false, {}, 'g')).to.be.true;
      el._hasAdministrationPermissions.restore();
    });
  });

  suite('_userHasName', () => {
    test('requires first or last name', () => {
      expect(el._userHasName({ properties: {} })).to.not.be.ok;
      expect(el._userHasName({ properties: { firstName: 'A' } })).to.be.ok;
      expect(el._userHasName({ properties: { lastName: 'B' } })).to.be.ok;
    });
  });

  suite('_getEmail', () => {
    test('returns email when present', () => {
      expect(el._getEmail({ email: 'a@b.com' })).to.equal('a@b.com');
      expect(el._getEmail(null)).to.not.be.ok;
    });
  });

  suite('_empty', () => {
    test('detects empty entry lists', () => {
      expect(el._empty([])).to.be.true;
      expect(el._empty([1])).to.be.false;
      expect(el._empty(undefined)).to.not.be.ok;
    });
  });

  suite('_computeMissingUsers', () => {
    test('returns empty array when there are no member ids', () => {
      expect(el._computeMissingUsers([], [], '', [])).to.deep.equal([]);
      expect(el._computeMissingUsers(undefined, [], '', [])).to.deep.equal([]);
    });

    test('returns empty array when the @users response is not loaded', () => {
      expect(el._computeMissingUsers(['jack'], undefined, '', [])).to.deep.equal([]);
    });

    test('flags member ids missing from the resolved entries', () => {
      el.memberUsers = { pageSize: 50, currentPageIndex: 0 };
      const missing = el._computeMissingUsers(['Administrator', 'jack'], [{ id: 'Administrator' }], '', []);
      expect(missing).to.have.lengthOf(1);
      expect(missing[0]).to.include({ id: 'jack', 'entity-type': 'user', _missing: true });
    });

    test('matches resolved users by properties.username as well as id', () => {
      el.memberUsers = { pageSize: 50, currentPageIndex: 0 };
      const missing = el._computeMissingUsers(
        ['jdoe', 'jack'],
        [{ id: 'internal-uid', properties: { username: 'jdoe' } }],
        '',
        [],
      );
      expect(missing.map((u) => u.id)).to.deep.equal(['jack']);
    });

    test('restricts detection to the current page slice', () => {
      el.memberUsers = { pageSize: 2, currentPageIndex: 1 };
      // page 2 covers ids at index 2 and 3: 'ghost' (missing) and 'real2' (resolved)
      const missing = el._computeMissingUsers(['real0', 'real1', 'ghost', 'real2'], [{ id: 'real2' }], '', []);
      expect(missing.map((u) => u.id)).to.deep.equal(['ghost']);
    });

    test('is skipped when a users filter is active', () => {
      el.memberUsers = { pageSize: 50, currentPageIndex: 0 };
      expect(el._computeMissingUsers(['Administrator', 'jack'], [{ id: 'Administrator' }], 'ja', [])).to.deep.equal([]);
    });

    test('is skipped when a column sort is active', () => {
      el.memberUsers = { pageSize: 50, currentPageIndex: 0 };
      expect(
        el._computeMissingUsers(['Administrator', 'jack'], [{ id: 'Administrator' }], '', [
          { path: 'lastName', direction: 'asc' },
        ]),
      ).to.deep.equal([]);
    });
  });

  suite('_noMemberUsers', () => {
    test('true only when there are neither resolved nor missing users', () => {
      expect(el._noMemberUsers([], [])).to.be.true;
      expect(el._noMemberUsers([], [{ id: 'jack' }])).to.be.false;
      expect(el._noMemberUsers([{ id: 'a' }], [])).to.be.false;
    });
  });

  suite('_fetch', () => {
    test('loads group context when groupname set', async () => {
      sinon.stub(el.$.request, 'get').returns(Promise.resolve());
      sinon.spy(el, '_fetchUsers');
      sinon.spy(el, '_fetchGroups');
      el.groupname = 'grp';
      await flush();
      await Promise.resolve();
      expect(el.$.request.get).to.have.been.calledOnce;
      expect(el.activity).to.deep.equal([]);
      expect(el.showEditMembers).to.be.false;
      expect(el.selectedMember).to.be.null;
      expect(el._fetchUsers).to.have.been.called;
      expect(el._fetchGroups).to.have.been.called;
      el.$.request.get.restore();
      el._fetchUsers.restore();
      el._fetchGroups.restore();
    });
  });

  suite('_fetchUsers / _fetchGroups pagination after delete', () => {
    test('decrements users page when last item deleted', () => {
      el.group = {};
      el._fromDelete = true;
      el.memberUsers = { currentPageSize: 1 };
      el.usersCurrentPage = 3;
      el._fetchUsers();
      expect(el._fromDelete).to.be.false;
      expect(el.usersCurrentPage).to.equal(2);
    });

    test('decrements groups page when last item deleted', () => {
      el.group = {};
      el._fromDelete = true;
      el.memberGroups = { currentPageSize: 1 };
      el.groupsCurrentPage = 2;
      el._fetchGroups();
      expect(el.groupsCurrentPage).to.equal(1);
    });
  });

  suite('_fetchUsers / _fetchGroups params', () => {
    test('applies filters and pagination', () => {
      el.group = { ok: true };
      el.usersFilter = 'uf';
      el.usersCurrentPage = 2;
      el._fetchUsers();
      expect(el.$.users.params).to.deep.include({
        q: 'uf',
        currentPageIndex: 1,
      });
      el.groupsFilter = 'gf';
      el.groupsCurrentPage = 3;
      el._fetchGroups();
      expect(el.$.groups.params).to.deep.include({
        q: 'gf',
        currentPageIndex: 2,
      });
    });
  });

  suite('_memberSelected', () => {
    let pickerValueStub;

    setup(async () => {
      await flush();
      const s2 = el.$.picker && el.$.picker.$ && el.$.picker.$.s2;
      if (s2) {
        if (pickerValueStub) {
          pickerValueStub.restore();
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

    test('adds user member', async () => {
      el.group = {
        groupname: 'mygrp',
        memberUsers: [],
        memberGroups: [],
      };
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve());
      sinon.spy(el, '_fetchUsers');
      sinon.spy(el, '_toast');
      el.selectedMember = {
        type: 'USER_TYPE',
        id: 'u1',
        displayLabel: 'U One',
      };
      await flush();
      await Promise.resolve();
      await Promise.resolve();
      expect(el.group.memberUsers).to.include('u1');
      expect(el.$.editRequest.put).to.have.been.calledOnce;
      expect(el._fetchUsers).to.have.been.calledOnce;
      el.$.editRequest.put.restore();
      el._fetchUsers.restore();
      el._toast.restore();
    });

    test('adds nested group member', async () => {
      el.group = {
        groupname: 'mygrp',
        memberUsers: [],
        memberGroups: [],
      };
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve());
      sinon.spy(el, '_fetchGroups');
      el.selectedMember = {
        type: 'GROUP_TYPE',
        id: 'nested',
        displayLabel: 'Nested',
      };
      await flush();
      await Promise.resolve();
      await Promise.resolve();
      expect(el.group.memberGroups).to.include('nested');
      expect(el._fetchGroups).to.have.been.calledOnce;
      el.$.editRequest.put.restore();
      el._fetchGroups.restore();
    });

    test('still records activity for unknown types', async () => {
      el.group = {
        groupname: 'mygrp',
        memberUsers: [],
        memberGroups: [],
      };
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve());
      el.activity = [];
      el.selectedMember = { type: 'OTHER', id: 'x', displayLabel: 'x' };
      await flush();
      await Promise.resolve();
      await Promise.resolve();
      expect(el.activity.length).to.equal(1);
      expect(el.$.editRequest.put).to.have.been.calledOnce;
      el.$.editRequest.put.restore();
    });
  });

  suite('_removeMember', () => {
    test('removes user reference', async () => {
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve());
      sinon.spy(el, '_fetchUsers');
      el.group = { memberUsers: ['a', 'b'], memberGroups: [] };
      el._removedMember = { id: 'b', 'entity-type': 'user' };
      el._removeMember();
      await flush();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(el.group.memberUsers).to.deep.equal(['a']);
      expect(el.$.editRequest.put).to.have.been.calledOnce;
      expect(el._fetchUsers).to.have.been.calledOnce;
      expect(el._fromDelete).to.be.true;
      el.$.editRequest.put.restore();
      el._fetchUsers.restore();
    });

    test('does not trigger the previous-page heuristic when removing a missing user', async () => {
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve());
      sinon.spy(el, '_fetchUsers');
      el.group = { memberUsers: ['Administrator', 'jack'], memberGroups: [] };
      el._removedMember = { id: 'jack', 'entity-type': 'user', _missing: true };
      el._removeMember();
      await flush();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(el.group.memberUsers).to.deep.equal(['Administrator']);
      expect(el._fromDelete).to.be.false;
      expect(el._fetchUsers).to.have.been.calledOnce;
      el.$.editRequest.put.restore();
      el._fetchUsers.restore();
    });

    test('does not page back when the last resolved user is removed while missing users remain', async () => {
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve());
      sinon.spy(el, '_fetchUsers');
      el.memberUsers = {
        pageSize: 50,
        currentPageIndex: 0,
        currentPageSize: 1,
        entries: [{ id: 'Administrator', 'entity-type': 'user', properties: { username: 'Administrator' } }],
      };
      el.group = { memberUsers: ['Administrator', 'ghost'], memberGroups: [] };
      el.usersCurrentPage = 1;
      await flush();
      // sanity: 'ghost' is an unresolved (missing) member still shown on the current page
      expect(el._missingUsers).to.have.lengthOf(1);
      el._removedMember = { id: 'Administrator', 'entity-type': 'user' };
      el._removeMember();
      await flush();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(el._fromDelete).to.be.false;
      expect(el.usersCurrentPage).to.equal(1);
      el.$.editRequest.put.restore();
      el._fetchUsers.restore();
    });

    test('does not splice when the removed id is absent (guards against dropping the last member)', async () => {
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve());
      el.group = { memberUsers: ['a', 'b'], memberGroups: ['x', 'y'] };
      el._removedMember = { id: 'missing', 'entity-type': 'user' };
      el._removeMember();
      await flush();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(el.group.memberUsers).to.deep.equal(['a', 'b']);
      el._removedMember = { id: 'missing', 'entity-type': 'group' };
      el._removeMember();
      await flush();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(el.group.memberGroups).to.deep.equal(['x', 'y']);
      el.$.editRequest.put.restore();
    });

    test('removes group reference', async () => {
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve());
      sinon.spy(el, '_fetchGroups');
      el.group = { memberUsers: [], memberGroups: ['x', 'y'] };
      el._removedMember = { id: 'y', 'entity-type': 'group' };
      el._removeMember();
      await flush();
      await Promise.resolve();
      expect(el.group.memberGroups).to.deep.equal(['x']);
      expect(el._fetchGroups).to.have.been.calledOnce;
      el.$.editRequest.put.restore();
      el._fetchGroups.restore();
    });
  });

  suite('_removeRecent', () => {
    test('splices matching activity entry', () => {
      el.activity = [{ id: '1' }, { id: '2' }];
      sinon.spy(el, 'splice');
      el._removeRecent('2');
      expect(el.splice).to.have.been.calledWith('activity', 1, 1);
      el.splice.restore();
    });
  });

  suite('edit / delete toggles', () => {
    test('_submitEditForm submits edit form', () => {
      sinon.stub(el.$.editForm, 'submit');
      el._submitEditForm();
      expect(el.$.editForm.submit).to.have.been.calledOnce;
      el.$.editForm.submit.restore();
    });

    test('_toggleEditMembers flips panel and clears picker', () => {
      el.$.picker.value = 'x';
      el.showEditMembers = false;
      el._toggleEditMembers();
      expect(el.showEditMembers).to.be.true;
      expect(el.selectedMember).to.be.null;
      expect(el.$.picker.value).to.equal('');
    });

    test('_toggleDeleteGroup toggles dialog', () => {
      sinon.stub(el.$.deleteGroupDialog, 'toggle');
      el._toggleDeleteGroup();
      expect(el.$.deleteGroupDialog.toggle).to.have.been.calledOnce;
      el.$.deleteGroupDialog.toggle.restore();
    });

    test('_toggleEditGroup clones and toggles', () => {
      el.group = { groupname: 'g' };
      sinon.spy(el, '_clone');
      sinon.stub(el.$.editGroupDialog, 'toggle');
      el._toggleEditGroup();
      expect(el._clone).to.have.been.calledOnce;
      expect(el.$.editGroupDialog.toggle).to.have.been.calledOnce;
      el._clone.restore();
      el.$.editGroupDialog.toggle.restore();
    });
  });

  suite('_toggleDeleteDialog', () => {
    test('maps user vs group id field', () => {
      sinon.stub(el.$.rmFromGroupDialog, 'toggle');
      el._toggleDeleteDialog({
        model: {
          item: {
            'entity-type': 'user',
            id: 'uid',
            groupname: 'ignored',
          },
        },
      });
      expect(el._removedMember.id).to.equal('uid');
      el._toggleDeleteDialog({
        model: {
          item: {
            'entity-type': 'group',
            groupname: 'gid',
          },
        },
      });
      expect(el._removedMember.id).to.equal('gid');
      el.$.rmFromGroupDialog.toggle.restore();
    });
  });

  suite('_saveGroup', () => {
    test('puts editable group and closes dialog', async () => {
      el._editableGroup = { grouplabel: 'L' };
      sinon.stub(el.$.editRequest, 'put').returns(Promise.resolve());
      sinon.stub(el.$.editGroupDialog, 'toggle');
      sinon.spy(el, '_toast');
      el._saveGroup();
      await flush();
      await Promise.resolve();
      expect(el.$.editRequest.put).to.have.been.calledOnce;
      expect(el.$.editGroupDialog.toggle).to.have.been.calledOnce;
      expect(el._toast).to.have.been.calledWith(el.i18n('groupManagement.group.updated'));
      el.$.editRequest.put.restore();
      el.$.editGroupDialog.toggle.restore();
      el._toast.restore();
    });
  });

  suite('_deleteGroup', () => {
    test('removes group fires event and navigates home', async () => {
      el.group = { groupname: 'gone' };
      sinon.stub(el.$.deleteGroupDialog, 'toggle');
      sinon.stub(el.$.editRequest, 'remove').returns(Promise.resolve());
      sinon.spy(el, '_goHome');
      const spy = sinon.spy();
      el.addEventListener('nuxeo-group-deleted', spy);
      el._deleteGroup();
      await flush();
      await Promise.resolve();
      expect(spy).to.have.been.calledOnce;
      expect(el._goHome).to.have.been.calledOnce;
      el.$.deleteGroupDialog.toggle.restore();
      el.$.editRequest.remove.restore();
      el._goHome.restore();
    });
  });

  suite('_filterUsers / _filterGroups', () => {
    test('resets page index and refetches', () => {
      el.group = {};
      sinon.spy(el, '_fetchUsers');
      sinon.spy(el, '_fetchGroups');
      el.usersCurrentPage = 5;
      el.groupsCurrentPage = 6;
      el._filterUsers();
      expect(el.usersCurrentPage).to.equal(1);
      expect(el._fetchUsers).to.have.been.called;
      el._filterGroups();
      expect(el.groupsCurrentPage).to.equal(1);
      expect(el._fetchGroups).to.have.been.called;
      el._fetchUsers.restore();
      el._fetchGroups.restore();
    });
  });

  suite('_resultsFilter', () => {
    test('excludes existing members and self group id', () => {
      el.group = {
        groupname: 'parent',
        memberUsers: ['u1'],
        memberGroups: ['g1'],
      };
      expect(el._resultsFilter({ id: 'u1' })).to.be.false;
      expect(el._resultsFilter({ id: 'g1' })).to.be.false;
      expect(el._resultsFilter({ id: 'parent' })).to.be.false;
      expect(el._resultsFilter({ id: 'new' })).to.be.true;
    });
  });

  suite('_icon', () => {
    test('maps group vs user icons', () => {
      expect(el._icon({ type: 'GROUP_TYPE' })).to.equal('nuxeo:group');
      expect(el._icon({ type: 'USER_TYPE' })).to.equal('nuxeo:user');
    });
  });

  suite('_countUsers / _countGroups', () => {
    test('formats singular vs plural counts', () => {
      expect(el._countUsers([{}])).to.match(/^1(\s|$)/);
      expect(el._countUsers([{}, {}])).to.match(/^2(\s|$)/);
      expect(el._countGroups([{}])).to.match(/^1(\s|$)/);
      expect(el._countGroups([{}, {}])).to.match(/^2(\s|$)/);
    });
  });

  suite('_paths', () => {
    test('_usersPath and _groupsPath use group.id when available', () => {
      el.group = { id: 'admins-id', groupname: 'admins' };
      expect(el._usersPath()).to.equal('group/admins-id/@users');
      expect(el._groupsPath()).to.equal('group/admins-id/@groups');
    });

    test('falls back to group.groupname when id is absent', () => {
      el.group = { groupname: 'admins' };
      expect(el._usersPath()).to.equal('group/admins/@users');
      expect(el._groupsPath()).to.equal('group/admins/@groups');
    });

    test('falls back to this.groupname when group has neither id nor groupname', () => {
      el.group = {};
      el.groupname = 'admins';
      expect(el._usersPath()).to.equal('group/admins/@users');
      expect(el._groupsPath()).to.equal('group/admins/@groups');
    });

    test('returns undefined when group is not set', () => {
      el.group = null;
      expect(el._usersPath()).to.not.be.ok;
      expect(el._groupsPath()).to.not.be.ok;
    });
  });

  suite('_clone', () => {
    test('deep clones group into editable holder', () => {
      el.group = { nested: { v: 1 } };
      el._clone();
      expect(el._editableGroup).to.deep.equal(el.group);
      expect(el._editableGroup).to.not.equal(el.group);
    });
  });

  suite('_goHome / _toast', () => {
    test('_goHome dispatches goHome', () => {
      const spy = sinon.spy();
      el.addEventListener('goHome', spy);
      el._goHome();
      expect(spy).to.have.been.calledOnce;
    });

    test('_toast opens toast', () => {
      sinon.spy(el.$.toast, 'open');
      el._toast('msg');
      expect(el.$.toast.text).to.equal('msg');
      expect(el.$.toast.open).to.have.been.calledOnce;
      el.$.toast.open.restore();
    });
  });

  suite('iron-form-presubmit', () => {
    test('prevents default and saves group', () => {
      sinon.stub(el, '_saveGroup');
      const ev = new CustomEvent('iron-form-presubmit', { cancelable: true });
      el.$.editForm.dispatchEvent(ev);
      expect(ev.defaultPrevented).to.be.true;
      expect(el._saveGroup).to.have.been.calledOnce;
      el._saveGroup.restore();
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
          properties: { username: 'login', firstName: 'A', lastName: 'B' },
        }),
      ).to.equal('login');
    });

    test('falls back to properties.username when name is absent', () => {
      expect(
        el._userDisplayName({
          id: 'uid-1',
          properties: { username: 'jdoe' },
        }),
      ).to.equal('jdoe');
    });

    test('falls back to id when name and username are absent', () => {
      expect(
        el._userDisplayName({
          id: 'only-id',
          properties: {},
        }),
      ).to.equal('only-id');
    });

    test('returns empty string when user.properties is absent', () => {
      expect(el._userDisplayName({ id: 'some-uuid' })).to.equal('some-uuid');
    });
  });

  suite('_removedMemberDisplayName computed property', () => {
    test('reflects _userDisplayName of _removedMember using properties.username', async () => {
      el._removedMember = {
        id: 'some-uuid',
        name: 'some-uuid',
        'entity-type': 'user',
        properties: { username: 'jdoe' },
      };
      await flush();
      expect(el._removedMemberDisplayName).to.equal('jdoe');
    });

    test('falls back to user.name when properties.username is absent', async () => {
      el._removedMember = { id: 'some-uuid', name: 'jdoe', 'entity-type': 'user', properties: {} };
      await flush();
      expect(el._removedMemberDisplayName).to.equal('jdoe');
    });
  });

  suite('_applySortDirectionChanged', () => {
    test('adds path with asc direction when not present', () => {
      const result = el._applySortDirectionChanged([], 'lastName', 'asc');
      expect(result).to.deep.equal([{ path: 'lastName', direction: 'asc' }]);
    });

    test('updates direction when path already present', () => {
      const result = el._applySortDirectionChanged([{ path: 'lastName', direction: 'asc' }], 'lastName', 'desc');
      expect(result).to.deep.equal([{ path: 'lastName', direction: 'desc' }]);
    });

    test('removes path when direction is null', () => {
      const result = el._applySortDirectionChanged([{ path: 'lastName', direction: 'asc' }], 'lastName', null);
      expect(result).to.deep.equal([]);
    });

    test('appends new path without affecting existing ones', () => {
      const result = el._applySortDirectionChanged([{ path: 'lastName', direction: 'asc' }], 'email', 'asc');
      expect(result).to.deep.equal([
        { path: 'lastName', direction: 'asc' },
        { path: 'email', direction: 'asc' },
      ]);
    });

    test('does not mutate the original array', () => {
      const cols = [{ path: 'lastName', direction: 'asc' }];
      el._applySortDirectionChanged(cols, 'lastName', null);
      expect(cols).to.deep.equal([{ path: 'lastName', direction: 'asc' }]);
    });

    test('does not add entry when direction is null and path is absent', () => {
      const result = el._applySortDirectionChanged([], 'lastName', null);
      expect(result).to.deep.equal([]);
    });
  });

  suite('_isSortActive', () => {
    test('returns true when path is active', () => {
      expect(el._isSortActive([{ path: 'lastName', direction: 'asc' }], 'lastName')).to.be.true;
    });

    test('returns false when path is not active', () => {
      expect(el._isSortActive([{ path: 'lastName', direction: 'asc' }], 'email')).to.be.false;
    });

    test('returns false for empty array', () => {
      expect(el._isSortActive([], 'lastName')).to.be.false;
    });

    test('returns falsy for null sortOrder', () => {
      expect(el._isSortActive(null, 'lastName')).to.not.be.ok;
    });
  });

  suite('_ariaSort', () => {
    test('returns ascending for asc column', () => {
      expect(el._ariaSort([{ path: 'lastName', direction: 'asc' }], 'lastName')).to.equal('ascending');
    });

    test('returns descending for desc column', () => {
      expect(el._ariaSort([{ path: 'lastName', direction: 'desc' }], 'lastName')).to.equal('descending');
    });

    test('returns none when path is not present', () => {
      expect(el._ariaSort([], 'lastName')).to.equal('none');
    });
  });

  suite('_onMemberUserSortChanged', () => {
    test('adds column, resets users page to 1, and refetches', () => {
      el.group = {};
      el.usersCurrentPage = 4;
      sinon.spy(el, '_fetchUsers');
      el._onMemberUserSortChanged({ detail: { path: 'lastName', direction: 'asc' } });
      expect(el._memberUserSortOrder).to.deep.equal([{ path: 'lastName', direction: 'asc' }]);
      expect(el.usersCurrentPage).to.equal(1);
      expect(el._fetchUsers).to.have.been.calledOnce;
      el._fetchUsers.restore();
    });

    test('updates direction on second event', () => {
      el.group = {};
      sinon.stub(el, '_fetchUsers');
      el._onMemberUserSortChanged({ detail: { path: 'email', direction: 'asc' } });
      el._onMemberUserSortChanged({ detail: { path: 'email', direction: 'desc' } });
      expect(el._memberUserSortOrder).to.deep.equal([{ path: 'email', direction: 'desc' }]);
      el._fetchUsers.restore();
    });

    test('removes column when direction is null', () => {
      el.group = {};
      sinon.stub(el, '_fetchUsers');
      el._onMemberUserSortChanged({ detail: { path: 'username', direction: 'asc' } });
      el._onMemberUserSortChanged({ detail: { path: 'username', direction: null } });
      expect(el._memberUserSortOrder).to.deep.equal([]);
      el._fetchUsers.restore();
    });
  });

  suite('_onMemberGroupSortChanged', () => {
    test('adds column, resets groups page to 1, and refetches', () => {
      el.group = {};
      el.groupsCurrentPage = 2;
      sinon.spy(el, '_fetchGroups');
      el._onMemberGroupSortChanged({ detail: { path: 'grouplabel', direction: 'asc' } });
      expect(el._memberGroupSortOrder).to.deep.equal([{ path: 'grouplabel', direction: 'asc' }]);
      expect(el.groupsCurrentPage).to.equal(1);
      expect(el._fetchGroups).to.have.been.calledOnce;
      el._fetchGroups.restore();
    });

    test('updates direction on second event', () => {
      el.group = {};
      sinon.stub(el, '_fetchGroups');
      el._onMemberGroupSortChanged({ detail: { path: 'groupname', direction: 'asc' } });
      el._onMemberGroupSortChanged({ detail: { path: 'groupname', direction: 'desc' } });
      expect(el._memberGroupSortOrder).to.deep.equal([{ path: 'groupname', direction: 'desc' }]);
      el._fetchGroups.restore();
    });

    test('removes column when direction is null', () => {
      el.group = {};
      sinon.stub(el, '_fetchGroups');
      el._onMemberGroupSortChanged({ detail: { path: 'grouplabel', direction: 'asc' } });
      el._onMemberGroupSortChanged({ detail: { path: 'grouplabel', direction: null } });
      expect(el._memberGroupSortOrder).to.deep.equal([]);
      el._fetchGroups.restore();
    });
  });

  suite('_fetchUsers with sort', () => {
    test('includes sortBy and sortOrder when member user sort columns are set', () => {
      el.group = {};
      el.usersFilter = '';
      el.usersCurrentPage = 1;
      el._memberUserSortOrder = [
        { path: 'lastName', direction: 'asc' },
        { path: 'email', direction: 'desc' },
      ];
      el._fetchUsers();
      expect(el.$.users.params.sortBy).to.equal('lastName,email');
      expect(el.$.users.params.sortOrder).to.equal('asc,desc');
    });

    test('omits sortBy and sortOrder when no sort columns', () => {
      el.group = {};
      el._memberUserSortOrder = [];
      el._fetchUsers();
      expect(el.$.users.params.sortBy).to.be.undefined;
      expect(el.$.users.params.sortOrder).to.be.undefined;
    });

    test('applies single-column sort correctly', () => {
      el.group = {};
      el._memberUserSortOrder = [{ path: 'username', direction: 'asc' }];
      el._fetchUsers();
      expect(el.$.users.params.sortBy).to.equal('username');
      expect(el.$.users.params.sortOrder).to.equal('asc');
    });
  });

  suite('_fetchGroups with sort', () => {
    test('includes sortBy and sortOrder when member group sort columns are set', () => {
      el.group = {};
      el.groupsFilter = '';
      el.groupsCurrentPage = 1;
      el._memberGroupSortOrder = [
        { path: 'grouplabel', direction: 'desc' },
        { path: 'groupname', direction: 'asc' },
      ];
      el._fetchGroups();
      expect(el.$.groups.params.sortBy).to.equal('grouplabel,groupname');
      expect(el.$.groups.params.sortOrder).to.equal('desc,asc');
    });

    test('omits sortBy and sortOrder when no sort columns', () => {
      el.group = {};
      el._memberGroupSortOrder = [];
      el._fetchGroups();
      expect(el.$.groups.params.sortBy).to.be.undefined;
      expect(el.$.groups.params.sortOrder).to.be.undefined;
    });

    test('applies single-column sort correctly', () => {
      el.group = {};
      el._memberGroupSortOrder = [{ path: 'grouplabel', direction: 'desc' }];
      el._fetchGroups();
      expect(el.$.groups.params.sortBy).to.equal('grouplabel');
      expect(el.$.groups.params.sortOrder).to.equal('desc');
    });
  });
});
