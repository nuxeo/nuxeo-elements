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
import '../nuxeo-document-permissions/nuxeo-document-acl-table.js';

suite('nuxeo-document-acl-table', () => {
  test('should return the element name', () => {
    expect(Nuxeo.DocumentACLTable.is).to.equal('nuxeo-document-acl-table');
  });

  test('should have default property values', () => {
    expect(Nuxeo.DocumentACLTable.properties.showActions.value).to.be.false;
    expect(Nuxeo.DocumentACLTable.properties.shareWithExternal.value).to.be.false;
  });
});

suite('nuxeo-document-acl-table extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-document-acl-table></nuxeo-document-acl-table>
      `,
    );
  });

  suite('entityDisplay', () => {
    test('returns empty string for null entity', () => {
      expect(el.entityDisplay(null)).to.equal('');
    });

    test('returns string entity as-is', () => {
      expect(el.entityDisplay('someuser')).to.equal('someuser');
    });

    test('returns firstName lastName for user with both names', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { firstName: 'John', lastName: 'Doe', username: 'jdoe' },
      };
      expect(el.entityDisplay(entity)).to.equal('John Doe');
    });

    test('returns firstName only when lastName is empty', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { firstName: 'John', lastName: '', username: 'jdoe' },
      };
      expect(el.entityDisplay(entity)).to.equal('John');
    });

    test('returns lastName only when firstName is empty', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { firstName: '', lastName: 'Doe', username: 'jdoe' },
      };
      expect(el.entityDisplay(entity)).to.equal('Doe');
    });

    test('returns username when both firstName and lastName are empty', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { firstName: '', lastName: '', username: 'jdoe' },
      };
      expect(el.entityDisplay(entity)).to.equal('jdoe');
    });

    test('falls back to id when firstName, lastName and username are all empty', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { firstName: '', lastName: '', username: '' },
      };
      expect(el.entityDisplay(entity)).to.equal('uid-123');
    });

    test('falls back to id when firstName, lastName are null and username is absent', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { firstName: null, lastName: null },
      };
      expect(el.entityDisplay(entity)).to.equal('uid-123');
    });

    test('returns grouplabel for group when grouplabel is set', () => {
      const entity = { 'entity-type': 'group', groupname: 'admins', grouplabel: 'Administrators' };
      expect(el.entityDisplay(entity)).to.equal('Administrators');
    });

    test('returns groupname for group when grouplabel is empty', () => {
      const entity = { 'entity-type': 'group', groupname: 'admins', grouplabel: '' };
      expect(el.entityDisplay(entity)).to.equal('admins');
    });
  });

  suite('entityTooltip', () => {
    test('returns empty string for null entity', () => {
      expect(el.entityTooltip(null)).to.equal('');
    });

    test('returns string entity as-is', () => {
      expect(el.entityTooltip('someuser')).to.equal('someuser');
    });

    test('uses username as display id when available', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { username: 'jdoe', email: 'jdoe@example.com' },
      };
      expect(el.entityTooltip(entity)).to.equal('jdoe - jdoe@example.com');
    });

    test('falls back to entity.id when username is absent', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { email: 'jdoe@example.com' },
      };
      expect(el.entityTooltip(entity)).to.equal('uid-123 - jdoe@example.com');
    });

    test('omits email suffix when email is empty', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { username: 'jdoe', email: '' },
      };
      expect(el.entityTooltip(entity)).to.equal('jdoe');
    });

    test('omits email suffix when email is null', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { username: 'jdoe', email: null },
      };
      expect(el.entityTooltip(entity)).to.equal('jdoe');
    });

    test('falls back to entity.id when username absent and no email', () => {
      const entity = {
        'entity-type': 'user',
        id: 'uid-123',
        properties: { email: '' },
      };
      expect(el.entityTooltip(entity)).to.equal('uid-123');
    });

    test('returns groupname for group entity', () => {
      const entity = { 'entity-type': 'group', groupname: 'admins', grouplabel: 'Administrators' };
      expect(el.entityTooltip(entity)).to.equal('admins');
    });
  });

  suite('_updateAces', () => {
    const ace = (id, begin, extra) => Object.assign({ id, begin, granted: true, status: 'effective' }, extra);

    test('leaves aces untouched when the document carries no acls', () => {
      el.aces = ['untouched'];
      el.doc = { contextParameters: {} };
      el._updateAces();
      expect(el.aces).to.deep.equal(['untouched']);
    });

    test('collects granted aces from non-inherited acls, sorted by begin date', () => {
      el.doc = {
        contextParameters: {
          acls: [
            {
              name: 'local',
              aces: [ace('later', '2024-06-01'), ace('earlier', '2024-01-01')],
            },
            {
              name: 'inherited',
              aces: [ace('from-inherited-acl', '2023-01-01')],
            },
          ],
        },
      };

      el._updateAces();

      expect(el.aces.map((a) => a.id)).to.deep.equal(['earlier', 'later']);
      expect(el.aces.every((a) => a.aclName === 'local')).to.be.true;
    });

    test('drops aces that are denied or neither pending nor effective', () => {
      el.doc = {
        contextParameters: {
          acls: [
            {
              name: 'local',
              aces: [
                ace('kept-effective', '2024-01-01'),
                ace('kept-pending', '2024-02-01', { status: 'pending' }),
                ace('denied', '2024-03-01', { granted: false }),
                ace('archived', '2024-04-01', { status: 'archived' }),
              ],
            },
          ],
        },
      };

      el._updateAces();

      expect(el.aces.map((a) => a.id)).to.deep.equal(['kept-effective', 'kept-pending']);
    });

    test('sorts open-ended aces (begin === null) ahead of dated ones', () => {
      el.doc = {
        contextParameters: {
          acls: [{ name: 'local', aces: [ace('dated', '2024-01-01'), ace('open-ended', null)] }],
        },
      };

      el._updateAces();

      expect(el.aces[0].id).to.equal('open-ended');
    });
  });
});
