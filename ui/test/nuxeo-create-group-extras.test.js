/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fakeServer, fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-user-group-management/nuxeo-create-group.js';

suite('nuxeo-create-group extras', () => {
  let el;
  let server;

  setup(async () => {
    server = fakeServer.create();
    el = await fixture(
      html`
        <nuxeo-create-group></nuxeo-create-group>
      `,
    );
  });

  teardown(() => {
    server.restore();
  });

  suite('_hasErrors', () => {
    test('returns false when errors is empty string', () => {
      el.errors = '';
      expect(el._hasErrors()).to.be.false;
    });

    test('returns true when errors has a message', () => {
      el.errors = 'Something went wrong';
      expect(el._hasErrors()).to.be.true;
    });
  });

  suite('_resetFields', () => {
    test('clears groupName, groupLabel, errors, and selectedUsers', () => {
      el.groupName = 'grp';
      el.groupLabel = 'lbl';
      el.errors = 'err';
      el.selectedUsers = [{ id: 'u1' }];
      el._resetFields();
      expect(el.groupName).to.equal('');
      expect(el.groupLabel).to.equal('');
      expect(el.errors).to.equal('');
      expect(el.selectedUsers).to.have.lengthOf(0);
    });
  });

  suite('_computeData', () => {
    test('separates users and groups correctly', () => {
      el.groupName = 'testGroup';
      el.groupLabel = 'Test Group';
      el.selectedUsers = [
        { type: 'USER_TYPE', username: 'jdoe' },
        { type: 'GROUP_TYPE', groupname: 'admins' },
        { type: 'USER_TYPE', username: 'asmith' },
      ];
      const data = el._computeData();
      expect(data['entity-type']).to.equal('group');
      expect(data.groupname).to.equal('testGroup');
      expect(data.grouplabel).to.equal('Test Group');
      expect(data.memberUsers).to.deep.equal(['jdoe', 'asmith']);
      expect(data.memberGroups).to.deep.equal(['admins']);
    });

    test('returns empty arrays when no users selected', () => {
      el.groupName = 'g';
      el.groupLabel = 'l';
      el.selectedUsers = [];
      const data = el._computeData();
      expect(data.memberUsers).to.deep.equal([]);
      expect(data.memberGroups).to.deep.equal([]);
    });
  });

  suite('_resultsFilter', () => {
    test('returns true for entry not in selectedUsers', () => {
      el.selectedUsers = [{ id: 'u1' }];
      expect(el._resultsFilter({ id: 'u2' })).to.be.true;
    });

    test('returns false for entry already in selectedUsers', () => {
      el.selectedUsers = [{ id: 'u1' }];
      expect(el._resultsFilter({ id: 'u1' })).to.be.false;
    });

    test('returns true when selectedUsers is empty', () => {
      el.selectedUsers = [];
      expect(el._resultsFilter({ id: 'u1' })).to.be.true;
    });
  });

  suite('_observeSelectedUser (logic only)', () => {
    test('pushes selectedUser to selectedUsers when not duplicate', () => {
      const user = { id: 'u1' };
      const pushed = [];
      const ctx = {
        selectedUser: user,
        selectedUsers: [],
        push: (_path, item) => {
          pushed.push(item);
        },
      };
      Nuxeo.CreateGroup.prototype._observeSelectedUser.call(ctx);
      expect(pushed).to.have.lengthOf(1);
      expect(pushed[0]).to.equal(user);
      expect(ctx.selectedUser).to.be.null;
    });

    test('does not push duplicate', () => {
      const user = { id: 'u1' };
      const pushed = [];
      const ctx = {
        selectedUser: user,
        selectedUsers: [user],
        push: (_path, item) => {
          pushed.push(item);
        },
      };
      Nuxeo.CreateGroup.prototype._observeSelectedUser.call(ctx);
      expect(pushed).to.have.lengthOf(0);
      expect(ctx.selectedUser).to.be.null;
    });

    test('does nothing when selectedUser is null', () => {
      const pushed = [];
      const ctx = {
        selectedUser: null,
        selectedUsers: [],
        push: (_path, item) => {
          pushed.push(item);
        },
      };
      Nuxeo.CreateGroup.prototype._observeSelectedUser.call(ctx);
      expect(pushed).to.have.lengthOf(0);
    });
  });

  suite('_remove', () => {
    test('removes item from selectedUsers', () => {
      const item = { id: 'u1' };
      el.selectedUsers = [item, { id: 'u2' }];
      el._remove({ model: { item } });
      expect(el.selectedUsers).to.have.lengthOf(1);
      expect(el.selectedUsers[0].id).to.equal('u2');
    });

    test('does nothing when model.item is null', () => {
      el.selectedUsers = [{ id: 'u1' }];
      el._remove({ model: { item: null } });
      expect(el.selectedUsers).to.have.lengthOf(1);
    });
  });

  suite('_cancel', () => {
    test('resets fields and fires goHome', (done) => {
      el.groupName = 'x';
      el.addEventListener('goHome', () => {
        expect(el.groupName).to.equal('');
        done();
      });
      el._cancel();
    });
  });

  suite('_submitAnother / _submit', () => {
    test('_submitAnother sets _createAnother to true', () => {
      sinon.stub(el.$.form, 'submit');
      el._submitAnother();
      expect(el._createAnother).to.be.true;
      el.$.form.submit.restore();
    });

    test('_submit sets _createAnother to false', () => {
      sinon.stub(el.$.form, 'submit');
      el._submit();
      expect(el._createAnother).to.be.false;
      el.$.form.submit.restore();
    });
  });

  suite('_create', () => {
    test('sets errors when request.post rejects', async () => {
      const errMsg = 'Group already exists';
      sinon.stub(el.$.request, 'post').rejects(new Error(errMsg));
      el.groupName = 'dup';
      el.groupLabel = 'Dup';
      el.selectedUsers = [];

      el._create();
      await el.$.request.post.returnValues[0].catch(() => {});

      expect(el.errors).to.equal(errMsg);
      el.$.request.post.restore();
    });
  });
});
