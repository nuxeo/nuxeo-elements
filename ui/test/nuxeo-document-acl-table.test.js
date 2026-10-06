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
import moment from '@nuxeo/moment';
import { config } from '@nuxeo/nuxeo-elements';
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

  suite('formatTimeFrame', () => {
    test('returns "Permanent" when begin and end are both null', () => {
      expect(el.formatTimeFrame({ begin: null, end: null })).to.equal(el.i18n('documentAclTable.permanent'));
    });

    test('returns "From <date>" when only begin is set in the future', () => {
      const begin = moment()
        .add(1, 'day')
        .toISOString();
      expect(el.formatTimeFrame({ begin, end: null })).to.equal(
        `${el.i18n('documentAclTable.from')} ${moment(begin).format('D MMM YYYY')}`,
      );
    });

    test('returns "Since <date>" when only begin is set in the past', () => {
      const begin = moment()
        .subtract(1, 'day')
        .toISOString();
      expect(el.formatTimeFrame({ begin, end: null })).to.equal(
        `${el.i18n('documentAclTable.since')} ${moment(begin).format('D MMM YYYY')}`,
      );
    });

    test('returns "Until <date>" when only end is set', () => {
      const end = moment()
        .add(1, 'day')
        .toISOString();
      expect(el.formatTimeFrame({ begin: null, end })).to.equal(
        `${el.i18n('documentAclTable.until')} ${moment(end).format('D MMM YYYY')}`,
      );
    });

    test('returns "Since <date> until <date>" when both begin and end are set', () => {
      const begin = moment()
        .subtract(1, 'day')
        .toISOString();
      const end = moment()
        .add(1, 'day')
        .toISOString();
      expect(el.formatTimeFrame({ begin, end })).to.equal(
        `${el.i18n('documentAclTable.since')} ${moment(begin).format('D MMM YYYY')}` +
          ` ${el.i18n('documentAclTable.untilMiddle')} ${moment(end).format('D MMM YYYY')}`,
      );
    });

    test('formats the date using the configured timezone', () => {
      // A fixed instant so the assertion never depends on the machine running the tests.
      const begin = '2024-01-15T23:30:00.000Z';
      const previousTimezone = config.get('timezone');
      try {
        config.set('timezone', 'Asia/Kolkata');
        // Asia/Kolkata is UTC+5:30 all year round, so 23:30 UTC on the 15th becomes the 16th locally.
        expect(el.formatTimeFrame({ begin, end: null })).to.equal(`${el.i18n('documentAclTable.since')} 16 Jan 2024`);
      } finally {
        config.set('timezone', previousTimezone);
      }
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
});
