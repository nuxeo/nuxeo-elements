/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-user-group-management.js';

suite('nuxeo-user-group-management', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-user-group-management></nuxeo-user-group-management>
      `,
    );
    await flush();
  });

  suite('page navigation', () => {
    test('defaults to search page', () => {
      expect(el.page).to.equal('search');
    });

    test('_createUser sets page to create-user', () => {
      el._createUser();
      expect(el.page).to.equal('create-user');
    });

    test('_createGroup sets page to create-group', () => {
      el._createGroup();
      expect(el.page).to.equal('create-group');
    });

    test('_goSearch resets state and navigates to search', () => {
      el.selectedUser = 'someUser';
      el.selectedGroup = 'someGroup';
      el.page = 'manage-user';

      const searchEl = el.$$('nuxeo-user-group-search');
      sinon.stub(searchEl, '_searchTermChanged');

      el._goSearch();

      expect(el.page).to.equal('search');
      expect(el.selectedUser).to.be.null;
      expect(el.selectedGroup).to.be.null;
      expect(searchEl._searchTermChanged).to.have.been.calledOnce;

      searchEl._searchTermChanged.restore();
    });
  });

  suite('user/group management', () => {
    test('_manageUser sets selectedUser and page', () => {
      el._manageUser({ detail: { user: 'jdoe' } });
      expect(el.selectedUser).to.equal('jdoe');
      expect(el.page).to.equal('manage-user');
    });

    test('_manageUser resets selectedUser before assigning', () => {
      el.selectedUser = 'old';
      el._manageUser({ detail: { user: 'new' } });
      expect(el.selectedUser).to.equal('new');
    });

    test('_manageGroup sets selectedGroup and page', () => {
      el._manageGroup({ detail: { group: 'admins' } });
      expect(el.selectedGroup).to.equal('admins');
      expect(el.page).to.equal('manage-group');
    });

    test('_manageGroup resets selectedGroup before assigning', () => {
      el.selectedGroup = 'old';
      el._manageGroup({ detail: { group: 'new' } });
      expect(el.selectedGroup).to.equal('new');
    });
  });

  suite('_canCreateUserGroup', () => {
    test('returns false when readonly is true', () => {
      const user = { isAdministrator: true };
      expect(el._canCreateUserGroup(true, user)).to.be.false;
    });

    test('returns falsy when user has no admin permissions', () => {
      const user = { isAdministrator: false };
      expect(el._canCreateUserGroup(false, user)).to.not.be.ok;
    });

    test('returns true when not readonly and user is administrator', () => {
      const user = { isAdministrator: true };
      expect(el._canCreateUserGroup(false, user)).to.be.true;
    });

    test('returns truthy when not readonly and user is poweruser', () => {
      const user = {
        isAdministrator: false,
        extendedGroups: [{ name: 'powerusers' }],
      };
      expect(el._canCreateUserGroup(false, user)).to.be.ok;
    });

    test('returns falsy when user is null', () => {
      expect(el._canCreateUserGroup(false, null)).to.not.be.ok;
    });
  });

  suite('_toast', () => {
    test('shows message for nuxeo-user-created', () => {
      const event = new CustomEvent('nuxeo-user-created', {
        detail: { id: 'jdoe' },
      });
      el._toast(event);
      expect(el.$.toast.text).to.contain('jdoe');
    });

    test('shows message for nuxeo-user-invited', () => {
      const event = new CustomEvent('nuxeo-user-invited', {
        detail: { id: 'asmith' },
      });
      el._toast(event);
      expect(el.$.toast.text).to.contain('asmith');
    });

    test('shows message for nuxeo-group-created', () => {
      const event = new CustomEvent('nuxeo-group-created', {
        detail: { groupname: 'editors' },
      });
      el._toast(event);
      expect(el.$.toast.text).to.contain('editors');
    });

    test('does nothing for unknown event type', () => {
      el.$.toast.text = '';
      const openSpy = sinon.spy(el.$.toast, 'open');
      const event = new CustomEvent('unknown-event', {
        detail: {},
      });
      el._toast(event);
      expect(openSpy).to.not.have.been.called;
      openSpy.restore();
    });
  });

  suite('_isRegistered', () => {
    test('returns true for a registered Polymer element', () => {
      expect(el._isRegistered('nuxeo-create-group')).to.be.true;
    });

    test('returns false for an unregistered tag', () => {
      expect(el._isRegistered('nuxeo-nonexistent-element-xyz')).to.be.false;
    });
  });

  suite('ready', () => {
    test('sets dir attribute on the element', () => {
      expect(el.hasAttribute('dir')).to.be.true;
    });

    test('preserves existing dir attribute', async () => {
      const el2 = await fixture(
        html`
          <nuxeo-user-group-management dir="rtl"></nuxeo-user-group-management>
        `,
      );
      await flush();
      expect(el2.getAttribute('dir')).to.equal('rtl');
    });

    test('registers window manageUser listener', () => {
      el.page = 'search';
      window.dispatchEvent(new CustomEvent('manageUser', { detail: { user: 'testUser' } }));
      expect(el.selectedUser).to.equal('testUser');
      expect(el.page).to.equal('manage-user');
    });

    test('registers window manageGroup listener', () => {
      el.page = 'search';
      window.dispatchEvent(new CustomEvent('manageGroup', { detail: { group: 'testGroup' } }));
      expect(el.selectedGroup).to.equal('testGroup');
      expect(el.page).to.equal('manage-group');
    });

    test('registers goHome listener on self', () => {
      el.page = 'create-user';
      el.selectedUser = 'usr';
      const searchEl = el.$$('nuxeo-user-group-search');
      sinon.stub(searchEl, '_searchTermChanged');

      el.dispatchEvent(new CustomEvent('goHome'));

      expect(el.page).to.equal('search');
      expect(el.selectedUser).to.be.null;

      searchEl._searchTermChanged.restore();
    });
  });
});
