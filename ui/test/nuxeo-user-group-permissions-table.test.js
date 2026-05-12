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
import '../nuxeo-user-group-management/nuxeo-user-group-permissions-table.js';

suite('nuxeo-user-group-permissions-table', () => {
  suite('_computeEntityDisplayName', () => {
    let el;

    setup(async () => {
      el = await fixture(
        html`
          <nuxeo-user-group-permissions-table></nuxeo-user-group-permissions-table>
        `,
      );
    });

    test('uses entityLabel when provided', () => {
      expect(el._computeEntityDisplayName('principal-id', 'Human readable')).to.equal('Human readable');
    });

    test('falls back to entity when entityLabel is missing', () => {
      expect(el._computeEntityDisplayName('members', undefined)).to.equal('members');
      expect(el._computeEntityDisplayName('members', null)).to.equal('members');
    });

    test('falls back to entity when entityLabel is empty string', () => {
      expect(el._computeEntityDisplayName('members', '')).to.equal('members');
    });

    test('returns empty string when both are missing', () => {
      expect(el._computeEntityDisplayName(undefined, undefined)).to.equal('');
      expect(el._computeEntityDisplayName(null, null)).to.equal('');
    });
  });

  suite('_entityDisplayName computed property', () => {
    test('reflects entity and entityLabel bindings', async () => {
      const el = await fixture(html`
        <nuxeo-user-group-permissions-table
          entity="uid-1"
          entity-label="Shown name"
        ></nuxeo-user-group-permissions-table>
      `);
      await flush();
      expect(el._entityDisplayName).to.equal('Shown name');
    });

    test('uses entity when entity-label is not set', async () => {
      const el = await fixture(html`
        <nuxeo-user-group-permissions-table entity="administrators"></nuxeo-user-group-permissions-table>
      `);
      await flush();
      expect(el._entityDisplayName).to.equal('administrators');
    });
  });
});
