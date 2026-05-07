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
import '../nuxeo-user-group-management/nuxeo-user-profile.js';

suite('nuxeo-user-profile', () => {
  let element;

  setup(async () => {
    element = await fixture(
      html`
        <nuxeo-user-profile></nuxeo-user-profile>
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

    test('should return user.name when present', () => {
      const user = { name: 'jdoe', properties: {} };
      expect(element._userDisplayName(user)).to.equal('jdoe');
    });

    test('should return properties.username when user.name is absent', () => {
      const user = { properties: { username: 'john.doe' } };
      expect(element._userDisplayName(user)).to.equal('john.doe');
    });

    test('should fall back to user.id when name and username are absent', () => {
      const user = { id: 'jdoe', properties: {} };
      expect(element._userDisplayName(user)).to.equal('jdoe');
    });

    test('should prefer user.name over properties.username', () => {
      const user = { name: 'jdoe', properties: { username: 'john.doe' } };
      expect(element._userDisplayName(user)).to.equal('jdoe');
    });

    test('should prefer properties.username over user.id', () => {
      const user = { id: 'uid-1234', properties: { username: 'john.doe' } };
      expect(element._userDisplayName(user)).to.equal('john.doe');
    });

    test('should return empty string when no identifiable properties are present', () => {
      const user = { properties: {} };
      expect(element._userDisplayName(user)).to.equal('');
    });

    test('should return empty string when properties is absent and no name or id', () => {
      const user = {};
      expect(element._userDisplayName(user)).to.equal('');
    });
  });

  suite('user heading', () => {
    function makeUser(overrides) {
      return {
        id: 'jdoe',
        extendedGroups: [],
        properties: { groups: [], ...overrides },
      };
    }

    test('should render user.name in the user heading', async () => {
      element.user = { ...makeUser({}), name: 'jdoe' };
      await flush();
      const heading = element.shadowRoot.querySelector('.user.heading');
      expect(heading.textContent.trim()).to.equal('jdoe');
    });

    test('should render properties.username in the heading when user.name is absent', async () => {
      element.user = makeUser({ username: 'john.doe' });
      await flush();
      const heading = element.shadowRoot.querySelector('.user.heading');
      expect(heading.textContent.trim()).to.equal('john.doe');
    });

    test('should render user.id in the heading as last resort', async () => {
      element.user = makeUser({});
      await flush();
      const heading = element.shadowRoot.querySelector('.user.heading');
      expect(heading.textContent.trim()).to.equal('jdoe');
    });
  });
});
