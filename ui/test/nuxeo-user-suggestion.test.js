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
import { fixture, html, timePasses } from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../widgets/nuxeo-user-suggestion.js';

suite('nuxeo-user-suggestion', () => {
  test('prefixed mode intialization', async () => {
    const value = [
      {
        'entity-type': 'user',
        extendedGroups: [
          {
            label: 'My awesome group',
            name: 'awesome',
            url: 'group/awesome',
          },
        ],
        id: 'jdoe',
        isAdministrator: false,
        isAnonymous: false,
        properties: {
          company: 'nuxeo',
          email: 'jdoe@nuxeo.com',
          firstName: 'John',
          groups: ['awesome'],
          lastName: 'Doe',
          tenantId: null,
          username: 'jdoe',
        },
      },
      {
        company: 'Nux',
        displayIcon: true,
        displayLabel: 'Bob Jones',
        email: 'bob@jones.com',
        'entity-type': 'user',
        firstName: 'Bob',
        groups: [],
        id: 'bjones',
        lastName: 'Jones',
        prefixed_id: 'user:bjones',
        tenantId: null,
        type: 'USER_TYPE',
        username: 'bjones',
      },
      {
        'entity-type': 'group',
        grouplabel: 'Awesome group',
        groupname: 'awesome',
        id: 'awesome',
        properties: {
          description: 'Group of awesome users',
          grouplabel: 'Awesome group',
          groupname: 'awesome',
          tenantId: null,
        },
      },
    ];
    const prefixedWidget = await fixture(html`
      <nuxeo-user-suggestion multiple prefixed .value="${value}"></nuxeo-user-suggestion>
    `);
    await timePasses(100);

    const s2 = dom(prefixedWidget.root).querySelector('#s2');
    const items = dom(s2.root).querySelectorAll('.selectivity-multiple-selected-item');

    expect(items.length).to.be.equal(3);
    expect(items[0].textContent).to.be.equal('John Doe');
    expect(items[1].textContent).to.be.equal('Bob Jones');
    expect(items[2].textContent).to.be.equal('Awesome group');
  });
});
