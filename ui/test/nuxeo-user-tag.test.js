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
import { fixture, html } from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../widgets/nuxeo-user-tag.js';

suite('nuxeo-user-tag', () => {
  suite("User's Display Name", () => {
    test('Should display first and last names concatenated when at least one is provided and defined', async () => {
      const userWithFirstAndLastNames = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'jdoe@nuxeo.com',
        },
      };

      const userWithFirstName = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: {
          firstName: 'John',
          email: 'jdoe@nuxeo.com',
        },
      };

      const userWithLastName = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: {
          lastName: 'Doe',
          email: 'jdoe@nuxeo.com',
        },
      };

      const tagWithFirstAndLastNames = await fixture(html`
        <nuxeo-user-tag id="first-last" disabled user="${JSON.stringify(userWithFirstAndLastNames)}"></nuxeo-user-tag>
      `);
      const tagWithFirstName = await fixture(html`
        <nuxeo-user-tag id="first" disabled user="${JSON.stringify(userWithFirstName)}"></nuxeo-user-tag>
      `);
      const tagWithLastName = await fixture(html`
        <nuxeo-user-tag id="last" disabled user="${JSON.stringify(userWithLastName)}"></nuxeo-user-tag>
      `);

      expect(dom(tagWithFirstAndLastNames.root).querySelector('nuxeo-tag').innerText).to.have.string('John Doe');
      expect(dom(tagWithFirstName.root).querySelector('nuxeo-tag').innerText).to.have.string('John');
      expect(dom(tagWithLastName.root).querySelector('nuxeo-tag').innerText).to.have.string('Doe');
    });

    test('Should display e-mail when no names are provided', async () => {
      const user = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: {
          email: 'jdoe@nuxeo.com',
        },
      };

      const tagWithEmail = await fixture(html`
        <nuxeo-user-tag id="email" disabled user="${JSON.stringify(user)}"></nuxeo-user-tag>
      `);

      expect(dom(tagWithEmail.root).querySelector('nuxeo-tag').innerText).to.have.string('jdoe@nuxeo.com');
    });

    test('Should display id when no names or e-mail are provided', async () => {
      const user = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: {},
      };

      const tagWithId = await fixture(html`
        <nuxeo-user-tag id="id" disabled user="${JSON.stringify(user)}"></nuxeo-user-tag>
      `);

      expect(dom(tagWithId.root).querySelector('nuxeo-tag').innerText).to.have.string('jdoe');
    });
  });
});
