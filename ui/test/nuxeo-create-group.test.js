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
import { fixture, flush, html, login, waitChanged } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { tap } from '@polymer/iron-test-helpers/mock-interactions.js';
import '../nuxeo-user-group-management/nuxeo-create-group.js';
/* eslint-disable no-unused-expressions */

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
