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
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-user-group-management/nuxeo-user-management.js';

suite('nuxeo-user-management', () => {
  let element;

  setup(async () => {
    element = await fixture(
      html`
        <nuxeo-user-management></nuxeo-user-management>
      `,
    );
  });

  suite('_userDisplayName', () => {
    test('should return an empty string when user is null', () => {
      expect(element._userDisplayName(null)).to.equal('');
    });

    test('should return an empty string when user is undefined', () => {
      expect(element._userDisplayName(undefined)).to.equal('');
    });

    test('should return full name when both firstName and lastName are provided', () => {
      const user = { properties: { firstName: 'John', lastName: 'Doe' } };
      expect(element._userDisplayName(user)).to.equal('John Doe');
    });

    test('should return firstName only when lastName is absent', () => {
      const user = { properties: { firstName: 'John' } };
      expect(element._userDisplayName(user)).to.equal('John');
    });

    test('should return lastName only when firstName is absent', () => {
      const user = { properties: { lastName: 'Doe' } };
      expect(element._userDisplayName(user)).to.equal('Doe');
    });

    test('should support namespaced user:firstName and user:lastName properties', () => {
      const user = { properties: { 'user:firstName': 'Jane', 'user:lastName': 'Smith' } };
      expect(element._userDisplayName(user)).to.equal('Jane Smith');
    });

    test('should fall back to user.name when no name properties are present', () => {
      const user = { name: 'jdoe', properties: {} };
      expect(element._userDisplayName(user)).to.equal('jdoe');
    });

    test('should fall back to email when no name properties or user.name are present', () => {
      const user = { properties: { email: 'jdoe@nuxeo.com' } };
      expect(element._userDisplayName(user)).to.equal('jdoe@nuxeo.com');
    });

    test('should support namespaced user:email as email fallback', () => {
      const user = { properties: { 'user:email': 'jdoe@nuxeo.com' } };
      expect(element._userDisplayName(user)).to.equal('jdoe@nuxeo.com');
    });

    test('should fall back to user.id when no name, user.name, or email is present', () => {
      const user = { id: 'jdoe', properties: {} };
      expect(element._userDisplayName(user)).to.equal('jdoe');
    });

    test('should fall back to user.uid when no other identifiers are present', () => {
      const user = { uid: 'uid-1234', properties: {} };
      expect(element._userDisplayName(user)).to.equal('uid-1234');
    });

    test('should return empty string when user has no identifiable properties', () => {
      const user = { properties: {} };
      expect(element._userDisplayName(user)).to.equal('');
    });
  });

  suite('user heading', () => {
    function makeUser(extraProps) {
      return {
        id: 'jdoe',
        extendedGroups: [],
        properties: { groups: [], ...extraProps },
      };
    }

    test('should render the display name in the user heading', async () => {
      element.user = makeUser({ firstName: 'John', lastName: 'Doe' });
      await flush();
      const heading = element.shadowRoot.querySelector('[name="userHeading"]');
      expect(heading.textContent.trim()).to.equal('John Doe');
    });

    test('should render email in the heading when no name is available', async () => {
      element.user = makeUser({ email: 'jdoe@nuxeo.com' });
      await flush();
      const heading = element.shadowRoot.querySelector('[name="userHeading"]');
      expect(heading.textContent.trim()).to.equal('jdoe@nuxeo.com');
    });

    test('should render user.id in the heading as last resort', async () => {
      element.user = makeUser({});
      await flush();
      const heading = element.shadowRoot.querySelector('[name="userHeading"]');
      expect(heading.textContent.trim()).to.equal('jdoe');
    });
  });
});
