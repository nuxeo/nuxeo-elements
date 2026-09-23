import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-user-group-management/nuxeo-user-group-permissions-table.js';

const mkAce = (overrides) =>
  Object.assign(
    {
      id: 'ace-1',
      username: 'Administrator',
      permission: 'Everything',
      creator: 'system',
      begin: null,
      end: null,
    },
    overrides,
  );

const mkEntry = (aces, aclName, useAceKey) => {
  const acl = { name: aclName || 'local' };
  if (useAceKey) {
    acl.ace = aces;
  } else {
    acl.aces = aces;
  }
  return {
    uid: 'doc-1',
    title: 'My Doc',
    path: '/default-domain/my-doc',
    contextParameters: { acls: [acl] },
  };
};

suite('nuxeo-user-group-permissions-table', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-user-group-permissions-table entity="Administrator"> </nuxeo-user-group-permissions-table>
      `,
    );
    sinon.stub(el.$.permissions, 'execute').returns(Promise.resolve({ numberOfPages: 0, entries: [] }));
    sinon.stub(el.$.rmPermission, 'execute').returns(Promise.resolve());
    await flush();
  });

  suite('_aceBelongsToEntity', () => {
    test('returns true when username matches entity', () => {
      expect(el._aceBelongsToEntity({ username: 'Administrator' })).to.be.true;
    });

    test('returns false when username does not match', () => {
      expect(el._aceBelongsToEntity({ username: 'other' })).to.be.false;
    });
  });

  suite('_isInherited', () => {
    test('returns true for inherited acl', () => {
      expect(el._isInherited({ name: 'inherited' })).to.be.true;
    });

    test('returns false for local acl', () => {
      expect(el._isInherited({ name: 'local' })).to.be.false;
    });
  });

  suite('_canDelete', () => {
    test('returns true when ace has id', () => {
      expect(el._canDelete({ id: 'abc' })).to.be.true;
    });

    test('returns false when ace has no id', () => {
      expect(el._canDelete({ id: '' })).to.be.false;
    });

    test('returns false when ace id is null', () => {
      expect(el._canDelete({ id: null })).to.be.false;
    });

    test('returns false when ace id is undefined', () => {
      expect(el._canDelete({})).to.be.false;
    });
  });

  suite('_formatTimeFrame', () => {
    test('returns permanent when no begin and no end', () => {
      const result = el._formatTimeFrame(mkAce());
      expect(result).to.be.a('string');
    });

    test('returns since+date when begin in past, no end', () => {
      const result = el._formatTimeFrame(mkAce({ begin: '2020-01-01', end: null }));
      expect(result).to.be.a('string');
      expect(result).to.include('2020');
    });

    test('returns from+date when begin in future, no end', () => {
      const result = el._formatTimeFrame(mkAce({ begin: '2099-01-01', end: null }));
      expect(result).to.be.a('string');
      expect(result).to.include('2099');
    });

    test('returns until+date when no begin, has end', () => {
      const result = el._formatTimeFrame(mkAce({ begin: null, end: '2099-12-31' }));
      expect(result).to.be.a('string');
      expect(result).to.include('2099');
    });

    test('returns since+begin until+end when begin in past and has end', () => {
      const result = el._formatTimeFrame(mkAce({ begin: '2020-01-01', end: '2099-12-31' }));
      expect(result).to.be.a('string');
      expect(result).to.include('2020');
      expect(result).to.include('2099');
    });

    test('returns from+begin until+end when begin in future and has end', () => {
      const result = el._formatTimeFrame(mkAce({ begin: '2099-06-01', end: '2099-12-31' }));
      expect(result).to.be.a('string');
      expect(result).to.include('2099');
    });
  });

  suite('_computePermissions', () => {
    test('processes entries with local aces matching entity', () => {
      const ace = mkAce();
      const entry = mkEntry([ace], 'local');
      el._computePermissions([entry]);
      expect(el.documents).to.have.length(1);
      expect(el.documents[0].aces).to.have.length(1);
      expect(el.documents[0].aces[0].docId).to.equal('doc-1');
      expect(el.documents[0].aces[0].docTitle).to.equal('My Doc');
      expect(el.documents[0].aces[0].docPath).to.equal('/default-domain/my-doc');
      expect(el.documents[0].aces[0].timeFrame).to.be.a('string');
    });

    test('skips inherited aces when displayInherited is false', () => {
      el.displayInherited = false;
      const ace = mkAce();
      const entry = mkEntry([ace], 'inherited');
      el._computePermissions([entry]);
      expect(el.documents[0].aces).to.have.length(0);
    });

    test('includes inherited aces when displayInherited is true', () => {
      el.displayInherited = true;
      const ace = mkAce();
      const entry = mkEntry([ace], 'inherited');
      el._computePermissions([entry]);
      expect(el.documents[0].aces).to.have.length(1);
    });

    test('skips aces not belonging to entity', () => {
      const ace = mkAce({ username: 'other-user' });
      const entry = mkEntry([ace], 'local');
      el._computePermissions([entry]);
      expect(el.documents[0].aces).to.have.length(0);
    });

    test('handles legacy ace key instead of aces', () => {
      const ace = mkAce();
      const entry = mkEntry([ace], 'local', true);
      el._computePermissions([entry]);
      expect(el.documents[0].aces).to.have.length(1);
    });

    test('sets empty to true when no entries', () => {
      el._computePermissions([]);
      expect(el.empty).to.be.true;
    });

    test('sets empty to false when entries exist', () => {
      const ace = mkAce();
      const entry = mkEntry([ace], 'local');
      el._computePermissions([entry]);
      expect(el.empty).to.be.false;
    });
  });

  suite('_fetchPermissions', () => {
    test('returns early when entity is empty', () => {
      el.entity = '';
      el.$.permissions.execute.resetHistory();
      el._fetchPermissions();
      expect(el.$.permissions.execute).to.not.have.been.called;
    });

    test('sets params and executes when entity exists', (done) => {
      el.entity = 'Administrator';
      el.$.permissions.execute.returns(Promise.resolve({ numberOfPages: 1, entries: [] }));
      el._fetchPermissions();
      requestAnimationFrame(() => {
        expect(el.$.permissions.params).to.exist;
        expect(el.$.permissions.params.query).to.include('Administrator');
        expect(el.$.permissions.execute).to.have.been.called;
        done();
      });
    });

    test('aborts previous controller before new fetch', (done) => {
      el.entity = 'Administrator';
      el._abortController = new AbortController();
      const abortSpy = sinon.spy(el._abortController, 'abort');
      el.$.permissions.execute.returns(Promise.resolve({ numberOfPages: 0, entries: [] }));
      el._fetchPermissions();
      requestAnimationFrame(() => {
        expect(abortSpy).to.have.been.calledOnce;
        done();
      });
    });

    test('handles execute rejection gracefully', (done) => {
      el.entity = 'Administrator';
      el.$.permissions.execute.returns(Promise.reject(new Error('fail')));
      el._fetchPermissions();
      requestAnimationFrame(() => {
        setTimeout(() => {
          done();
        }, 50);
      });
    });

    test('warns when permissions element not ready', (done) => {
      el.entity = 'Administrator';
      const origPermissions = el.$.permissions;
      Object.defineProperty(el.$, 'permissions', { value: undefined, configurable: true });
      const warnSpy = sinon.stub(console, 'warn');
      el._fetchPermissions();
      requestAnimationFrame(() => {
        expect(warnSpy).to.have.been.calledWith('Permissions operation not ready');
        warnSpy.restore();
        Object.defineProperty(el.$, 'permissions', { value: origPermissions, configurable: true });
        done();
      });
    });
  });

  suite('_deleteAce', () => {
    test('sets input/params on rmPermission and executes', async () => {
      el._deletedAce = { docId: 'doc-1', id: 'ace-1' };
      el.$.rmPermission.execute.returns(Promise.resolve());
      el.$.permissions.execute.returns(Promise.resolve({ numberOfPages: 0, entries: [] }));
      await el._deleteAce();
      expect(el.$.rmPermission.input).to.equal('doc-1');
      expect(el.$.rmPermission.params.id).to.equal('ace-1');
      expect(el.$.rmPermission.execute).to.have.been.called;
    });
  });

  suite('_toggleDialog', () => {
    test('sets _deletedAce and toggles dialog', () => {
      const ace = mkAce();
      const toggleSpy = sinon.spy(el.$.dialog, 'toggle');
      el._toggleDialog({ model: { ace } });
      expect(el._deletedAce).to.deep.equal(ace);
      expect(toggleSpy).to.have.been.calledOnce;
      toggleSpy.restore();
    });
  });

  suite('connectedCallback', () => {
    test('sets up IntersectionObserver', () => {
      expect(el._intersectionObserver).to.exist;
    });
  });

  suite('disconnectedCallback', () => {
    test('disconnects observer and aborts controller', () => {
      el._abortController = new AbortController();
      const abortSpy = sinon.spy(el._abortController, 'abort');
      const disconnectSpy = sinon.spy(el._intersectionObserver, 'disconnect');
      el.disconnectedCallback();
      expect(abortSpy).to.have.been.calledOnce;
      expect(disconnectSpy).to.have.been.calledOnce;
    });

    test('works when no controller exists', () => {
      el._abortController = null;
      const disconnectSpy = sinon.spy(el._intersectionObserver, 'disconnect');
      el.disconnectedCallback();
      expect(disconnectSpy).to.have.been.calledOnce;
    });

    test('works when no observer exists', () => {
      el._abortController = null;
      el._intersectionObserver = null;
      el.disconnectedCallback();
    });
  });

  suite('_computeEntityDisplayName', () => {
    let localEl;

    setup(async () => {
      localEl = await fixture(
        html`
          <nuxeo-user-group-permissions-table></nuxeo-user-group-permissions-table>
        `,
      );
    });

    test('uses entityLabel when provided', () => {
      expect(localEl._computeEntityDisplayName('principal-id', 'Human readable')).to.equal('Human readable');
    });

    test('falls back to entity when entityLabel is missing', () => {
      expect(localEl._computeEntityDisplayName('members', undefined)).to.equal('members');
      expect(localEl._computeEntityDisplayName('members', null)).to.equal('members');
    });

    test('falls back to entity when entityLabel is empty string', () => {
      expect(localEl._computeEntityDisplayName('members', '')).to.equal('members');
    });

    test('returns empty string when both are missing', () => {
      expect(localEl._computeEntityDisplayName(undefined, undefined)).to.equal('');
      expect(localEl._computeEntityDisplayName(null, null)).to.equal('');
    });
  });

  suite('_entityDisplayName computed property', () => {
    test('reflects entity and entityLabel bindings', async () => {
      const elLocal = await fixture(html`
        <nuxeo-user-group-permissions-table
          entity="uid-1"
          entity-label="Shown name"
        ></nuxeo-user-group-permissions-table>
      `);
      await flush();
      expect(elLocal._entityDisplayName).to.equal('Shown name');
    });

    test('uses entity when entity-label is not set', async () => {
      const elLocal = await fixture(html`
        <nuxeo-user-group-permissions-table entity="administrators"></nuxeo-user-group-permissions-table>
      `);
      await flush();
      expect(elLocal._entityDisplayName).to.equal('administrators');
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
    test('should skip and reset loading when entries have no aces with creators', async () => {
      const getSpy = sinon.spy(el.$.userResource, 'get');
      el._creatorsLoading = true;
      await el._fetchCreators([{ aces: [] }]);
      expect(getSpy).to.not.have.been.called;
      expect(el._creatorsLoading).to.be.false;
      getSpy.restore();
    });

    test('should skip and reset loading when called with no entries', async () => {
      const getSpy = sinon.spy(el.$.userResource, 'get');
      el._creatorsLoading = true;
      await el._fetchCreators();
      expect(getSpy).to.not.have.been.called;
      expect(el._creatorsLoading).to.be.false;
      getSpy.restore();
    });

    test('should fetch user entity for each unique creator', async () => {
      const entity = { 'entity-type': 'user', id: 'jdoe', properties: { firstName: 'Jane', lastName: 'Doe' } };
      sinon.stub(el.$.userResource, 'get').resolves(entity);
      await el._fetchCreators([{ aces: [mkAce({ creator: 'jdoe' }), mkAce({ creator: 'jdoe' })] }]);
      expect(el.$.userResource.get).to.have.been.calledOnce;
      expect(el._creatorEntities).to.have.property('jdoe', entity);
      el.$.userResource.get.restore();
    });

    test('should handle fetch failure gracefully', async () => {
      sinon.stub(el.$.userResource, 'get').rejects(new Error('not found'));
      const warnSpy = sinon.stub(console, 'warn');
      await el._fetchCreators([{ aces: [mkAce({ creator: 'unknown' })] }]);
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
      await el._fetchCreators([{ aces: [mkAce({ creator: 'baduser' })] }]);
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
      await el._fetchCreators([{ aces: [mkAce({ creator: 'deleted' })] }]);
      expect(el._creatorEntities).to.have.property('deleted', 'deleted');
      expect(warnSpy).to.not.have.been.called;
      warnSpy.restore();
      el.$.userResource.get.restore();
    });
  });
});
