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
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../nuxeo-user-group-management/nuxeo-user-management.js';

suite('nuxeo-user-management', () => {
  suite('_userDisplayName', () => {
    let el;

    setup(async () => {
      el = await fixture(
        html`
          <nuxeo-user-management></nuxeo-user-management>
        `,
      );
    });

    test('returns empty string when user is null or undefined', () => {
      expect(el._userDisplayName(null)).to.equal('');
      expect(el._userDisplayName(undefined)).to.equal('');
    });

    test('prefers user.name over properties.username', () => {
      expect(
        el._userDisplayName({
          id: 'internal-uid',
          name: 'Directory display name',
          properties: { username: 'loginName' },
        }),
      ).to.equal('Directory display name');
    });

    test('falls back to properties.username when name is absent', () => {
      expect(
        el._userDisplayName({
          id: 'internal-uid',
          properties: { username: 'loginName' },
        }),
      ).to.equal('loginName');
    });

    test('does not use user.id as display name', () => {
      expect(
        el._userDisplayName({
          id: 'generated-uuid',
          properties: { username: 'jdoe' },
        }),
      ).to.equal('jdoe');
    });
  });

  suite('heading and local permissions bindings', () => {
    test('heading shows display name; permissions table uses id and label', async () => {
      const el = await fixture(
        html`
          <nuxeo-user-management></nuxeo-user-management>
        `,
      );
      el.user = {
        id: 'principal-uid-123',
        name: 'Jane Display',
        properties: {
          username: 'jane.login',
          firstName: 'Jane',
          lastName: 'Doe',
          groups: [],
        },
        extendedGroups: [],
      };
      await flush();

      const heading = dom(el.root).querySelector('.user.heading[name=userHeading]');
      expect(heading).to.not.be.null;
      expect(heading.textContent.trim()).to.equal('Jane Display');

      const permTable = dom(el.root).querySelector('nuxeo-user-group-permissions-table');
      expect(permTable).to.not.be.null;
      expect(permTable.entity).to.equal('principal-uid-123');
      expect(permTable.entityLabel).to.equal('Jane Display');
    });

    test('heading falls back to username when name is missing', async () => {
      const el = await fixture(
        html`
          <nuxeo-user-management></nuxeo-user-management>
        `,
      );
      el.user = {
        id: 'uid-only',
        properties: {
          username: 'fallback.user',
          groups: [],
        },
        extendedGroups: [],
      };
      await flush();

      const heading = dom(el.root).querySelector('.user.heading[name=userHeading]');
      expect(heading.textContent.trim()).to.equal('fallback.user');

      const permTable = dom(el.root).querySelector('nuxeo-user-group-permissions-table');
      expect(permTable.entity).to.equal('uid-only');
      expect(permTable.entityLabel).to.equal('fallback.user');
    });
  });
});
