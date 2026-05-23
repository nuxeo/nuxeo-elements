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
import { fakeServer, fixture, flush, html, login, tap, waitChanged } from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../nuxeo-user-group-management/nuxeo-create-group.js';

suite('nuxeo-create-group', () => {
  let server;

  setup(async () => {
    server = await login();
  });

  suite('create group', () => {
    let createGroupEl;
    let createButton;
    const suggestResponses = [
      {
        firstName: '',
        lastName: '',
        groups: [],
        company: '',
        email: 'devnull@nuxeo.com',
        username: 'Administrator',
        id: 'Administrator',
        type: 'USER_TYPE',
        prefixed_id: 'user:Administrator',
        displayLabel: 'Administrator',
        displayIcon: true,
      },
    ];
    const creationResponse = {
      'entity-type': 'group',
      groupname: 'test',
      grouplabel: 'Test',
      memberUsers: [],
      memberGroups: [],
    };
    const creationData = {
      'entity-type': 'group',
      groupname: 'test',
      grouplabel: 'Test',
      memberUsers: ['Administrator'],
      memberGroups: [],
    };

    async function testCreateGroup(createAnother) {
      // type in group name and label
      expect(createGroupEl).to.not.be.null;
      const groupName = createGroupEl.$$('#groupName');
      expect(groupName.value).to.not.be.null;
      const groupLabel = createGroupEl.$$('#groupLabel');
      expect(groupLabel.value).to.be.not.be.null;
      groupName.value = createGroupEl.groupName = 'test';
      flush(groupName);
      expect(createGroupEl.groupName).to.be.equal('test');
      groupLabel.value = createGroupEl.groupLabel = 'Test';
      flush(groupLabel);
      expect(createGroupEl.groupLabel).to.be.equal('Test');

      // select one user: Administrator
      createGroupEl.selectedUsers = suggestResponses;
      flush(createGroupEl);

      const searchEntries = dom(createGroupEl.root).querySelectorAll('.row');
      expect(searchEntries.length).to.be.equal(1);
      flush(searchEntries[0]);
      const label = searchEntries[0].querySelector('.label > span').textContent.trim();
      const uname = searchEntries[0].querySelector('.name:not([hidden])').textContent.trim();
      const email = searchEntries[0].querySelector('.email').textContent.trim();
      const expected = suggestResponses[0];
      expect(label).to.be.equal(expected.displayLabel);
      expect(uname).to.be.equal(expected.username ? expected.username : expected.groupname);
      expect(email).to.be.equal(expected.email ? expected.email : '');

      // hit the create button
      expect(createGroupEl._computeData()).to.be.deep.equal(creationData);
      if (createAnother) {
        createButton = createGroupEl.$$('#createAnotherButton');
      } else {
        createButton = createGroupEl.$$('#createButton');
      }
      expect(createButton).to.not.be.null;

      tap(createButton);

      await waitChanged(createGroupEl, 'group-name');
      await flush();

      expect(createGroupEl.groupName).to.be.equal('');
      expect(createGroupEl.groupLabel).to.be.equal('');
      expect(createGroupEl.selectedUsers).to.be.empty;
    }

    setup(async () => {
      createGroupEl = await fixture(
        html`
          <nuxeo-create-group></nuxeo-create-group>
        `,
      );
      server.respondWith('POST', '/api/v1/group', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(creationResponse),
      ]);
      flush(createGroupEl);
    });

    test('create a group with one user', () => testCreateGroup(false));

    test('create an group with "Create another" button', () => testCreateGroup(true));

    test('try to create a group with no name', () => {
      // try to create right away
      expect(createGroupEl).to.not.be.null;
      createButton = createGroupEl.$$('#createButton');
      expect(createButton).to.not.be.null;

      tap(createButton);

      // XXX: fails on iron-form trying to retrieve an attribute `novalidate` of an undefined _form
      // expect(createGroupEl.$.form.validate()).to.be.false;
      expect(createGroupEl.groupName).to.be.empty;
      expect(createGroupEl.groupLabel).to.be.empty;
      expect(createGroupEl.selectedUsers).to.be.empty;
    });
  });
});

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
