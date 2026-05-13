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
import '../nuxeo-user-group-management/nuxeo-group-management.js';

suite('nuxeo-group-management', () => {
  suite('_userDisplayName', () => {
    let el;

    setup(async () => {
      el = await fixture(
        html`
          <nuxeo-group-management></nuxeo-group-management>
        `,
      );
    });

    test('returns empty string when user is null or undefined', () => {
      expect(el._userDisplayName(null)).to.equal('');
      expect(el._userDisplayName(undefined)).to.equal('');
    });

    test('prefers user.name over properties.username and id', () => {
      expect(
        el._userDisplayName({
          id: 'internal-uid',
          name: 'Directory name',
          properties: { username: 'login', firstName: 'A', lastName: 'B' },
        }),
      ).to.equal('Directory name');
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
  });
});
