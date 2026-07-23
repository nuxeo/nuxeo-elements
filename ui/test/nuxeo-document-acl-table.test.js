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
import { fetchUserEntities } from '../nuxeo-user-group-management/nuxeo-user-display.js';

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

  suite('_resolvedCreator', () => {
    test('returns entity when present in map', () => {
      const entity = { 'entity-type': 'user', id: 'jdoe', properties: { firstName: 'Jane', lastName: 'Doe' } };
      expect(el._resolvedCreator('jdoe', { jdoe: entity })).to.equal(entity);
    });

    test('falls back to raw creator string when not resolved', () => {
      expect(el._resolvedCreator('system', {})).to.equal('system');
    });

    test('falls back to raw creator string when entities is null', () => {
      expect(el._resolvedCreator('system', null)).to.equal('system');
    });
  });

  suite('_fetchCreators', () => {
    test('should skip and reset loading when aces is empty', async () => {
      const getSpy = sinon.spy(el.$.userResource, 'get');
      el._creatorsLoading = true;
      await el._fetchCreators([]);
      expect(getSpy).to.not.have.been.called;
      expect(el._creatorsLoading).to.be.false;
      getSpy.restore();
    });

    test('should skip and reset loading when no creators are present', async () => {
      const getSpy = sinon.spy(el.$.userResource, 'get');
      el._creatorsLoading = true;
      await el._fetchCreators([{ username: 'Admin', permission: 'Read' }]);
      expect(getSpy).to.not.have.been.called;
      expect(el._creatorsLoading).to.be.false;
      getSpy.restore();
    });

    test('should fetch user entity for each unique creator', async () => {
      const entity = { 'entity-type': 'user', id: 'jdoe', properties: { firstName: 'Jane', lastName: 'Doe' } };
      sinon.stub(el.$.userResource, 'get').resolves(entity);
      await el._fetchCreators([
        { creator: 'jdoe', username: 'Admin', permission: 'Everything' },
        { creator: 'jdoe', username: 'user1', permission: 'Read' },
      ]);
      expect(el.$.userResource.get).to.have.been.calledOnce;
      expect(el._creatorEntities).to.have.property('jdoe', entity);
      el.$.userResource.get.restore();
    });

    test('should handle fetch failure gracefully', async () => {
      sinon.stub(el.$.userResource, 'get').rejects(new Error('not found'));
      const warnSpy = sinon.stub(console, 'warn');
      await el._fetchCreators([{ creator: 'unknown', username: 'Admin', permission: 'Read' }]);
      expect(el._creatorEntities).to.have.property('unknown', 'unknown');
      // A statusless (e.g. network/transport) error is unexpected and should be logged.
      expect(warnSpy).to.have.been.calledOnce;
      warnSpy.restore();
      el.$.userResource.get.restore();
    });

    test('should warn on unexpected non-404 errors', async () => {
      const error = new Error('internal error');
      error.status = 500;
      sinon.stub(el.$.userResource, 'get').rejects(error);
      const warnSpy = sinon.stub(console, 'warn');
      await el._fetchCreators([{ creator: 'baduser', username: 'Admin', permission: 'Read' }]);
      expect(el._creatorEntities).to.have.property('baduser', 'baduser');
      expect(warnSpy).to.have.been.calledOnce;
      warnSpy.restore();
      el.$.userResource.get.restore();
    });

    test('should not warn on 404 errors', async () => {
      const error = new Error('not found');
      error.status = 404;
      sinon.stub(el.$.userResource, 'get').rejects(error);
      const warnSpy = sinon.stub(console, 'warn');
      await el._fetchCreators([{ creator: 'deleted', username: 'Admin', permission: 'Read' }]);
      expect(el._creatorEntities).to.have.property('deleted', 'deleted');
      expect(warnSpy).to.not.have.been.called;
      warnSpy.restore();
      el.$.userResource.get.restore();
    });
  });

  suite('fetchUserEntities serialization', () => {
    test('serializes concurrent calls sharing the same resource element', async () => {
      const order = [];
      const fakeResource = {
        path: '',
        get() {
          const requestedPath = this.path;
          order.push(requestedPath);
          const username = requestedPath.split('/').pop();
          return Promise.resolve({ 'entity-type': 'user', properties: { username } });
        },
      };

      // Fire two overlapping calls on the SAME resource element.
      const callA = fetchUserEntities(['a1', 'a2'], fakeResource);
      const callB = fetchUserEntities(['b1'], fakeResource);
      const [resultA, resultB] = await Promise.all([callA, callB]);

      // With serialization, all of call A's requests complete before call B's,
      // so the order is deterministic (never interleaved).
      expect(order).to.deep.equal(['/user/a1', '/user/a2', '/user/b1']);
      expect(resultA).to.have.all.keys('a1', 'a2');
      expect(resultB).to.have.all.keys('b1');
    });
  });
});
