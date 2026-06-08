import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-user-group-management/nuxeo-user-group-latest.js';

const mkUser = (first, last, email) => {
  return {
    type: 'user',
    uid: 'jdoe',
    properties: {
      'user:firstName': first || '',
      'user:lastName': last || '',
      'user:email': email || '',
    },
  };
};

const mkGroup = (label) => {
  return {
    type: 'group',
    uid: 'admins',
    properties: {
      'group:grouplabel': label || 'Administrators',
    },
  };
};

suite('nuxeo-user-group-latest', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-user-group-latest></nuxeo-user-group-latest>
      `,
    );
    sinon.stub(el.$.latestCreatedUsersGroups, 'execute').returns(Promise.resolve({}));
    await flush();
  });

  suite('_empty', () => {
    test('returns true for empty array', () => {
      expect(el._empty([])).to.be.true;
    });

    test('returns false for non-empty array', () => {
      expect(el._empty([1])).to.be.false;
    });

    test('returns false for null', () => {
      expect(el._empty(null)).to.not.be.ok;
    });

    test('returns false for undefined', () => {
      expect(el._empty(undefined)).to.not.be.ok;
    });
  });

  suite('_userHasName', () => {
    test('returns truthy when both names present', () => {
      expect(el._userHasName(mkUser('John', 'Doe'))).to.be.ok;
    });

    test('returns truthy when only firstName', () => {
      expect(el._userHasName(mkUser('John', ''))).to.be.ok;
    });

    test('returns truthy when only lastName', () => {
      expect(el._userHasName(mkUser('', 'Doe'))).to.be.ok;
    });

    test('returns falsy when neither name', () => {
      expect(el._userHasName(mkUser('', ''))).to.not.be.ok;
    });

    test('returns truthy when only user:username present', () => {
      const user = mkUser('', '');
      user.properties['user:username'] = 'johndoe';
      expect(el._userHasName(user)).to.be.ok;
    });
  });

  suite('_getEmail', () => {
    test('returns the email property', () => {
      expect(el._getEmail(mkUser('', '', 'a@b.com'))).to.equal('a@b.com');
    });

    test('returns empty string when no email', () => {
      expect(el._getEmail(mkUser())).to.equal('');
    });
  });

  suite('_isUser', () => {
    test('returns true for user type', () => {
      expect(el._isUser({ type: 'user' })).to.be.true;
    });

    test('returns false for group type', () => {
      expect(el._isUser({ type: 'group' })).to.be.false;
    });

    test('returns false for unknown type', () => {
      expect(el._isUser({ type: 'other' })).to.be.false;
    });
  });

  suite('_isGroup', () => {
    test('returns true for group type', () => {
      expect(el._isGroup({ type: 'group' })).to.be.true;
    });

    test('returns false for user type', () => {
      expect(el._isGroup({ type: 'user' })).to.be.false;
    });
  });

  suite('_displayLCUserGroup', () => {
    test('returns full name for user with both names', () => {
      expect(el._displayLCUserGroup(mkUser('John', 'Doe'))).to.equal('John Doe');
    });

    test('returns firstName only when no lastName', () => {
      expect(el._displayLCUserGroup(mkUser('John', ''))).to.equal('John');
    });

    test('returns lastName only when no firstName', () => {
      expect(el._displayLCUserGroup(mkUser('', 'Doe'))).to.equal('Doe');
    });

    test('returns empty string when user has neither name', () => {
      expect(el._displayLCUserGroup(mkUser('', ''))).to.equal('');
    });

    test('returns grouplabel for group', () => {
      expect(el._displayLCUserGroup(mkGroup('Admins'))).to.equal('Admins');
    });

    test('returns undefined for unknown type', () => {
      const unknown = { type: 'other', properties: {} };
      expect(el._displayLCUserGroup(unknown)).to.be.undefined;
    });
  });

  suite('_manageUserOrGroup', () => {
    test('dispatches manageUser for user items', (done) => {
      const user = mkUser('John', 'Doe');
      el.addEventListener('manageUser', (evt) => {
        expect(evt.detail.user).to.equal('jdoe');
        done();
      });
      el._manageUserOrGroup({ model: { item: user } });
    });

    test('dispatches manageGroup for group items', (done) => {
      const group = mkGroup();
      el.addEventListener('manageGroup', (evt) => {
        expect(evt.detail.group).to.equal('admins');
        done();
      });
      el._manageUserOrGroup({ model: { item: group } });
    });

    test('does nothing for unknown type', () => {
      const spy = sinon.spy(el, 'dispatchEvent');
      el._manageUserOrGroup({ model: { item: { type: 'other', uid: 'x' } } });
      const customCalls = spy
        .getCalls()
        .filter((c) => c.args[0].type === 'manageUser' || c.args[0].type === 'manageGroup');
      expect(customCalls).to.have.length(0);
      spy.restore();
    });
  });

  suite('_refreshLatest', () => {
    test('resets data and executes resource', () => {
      el.latestCreatedUsersGroups = { entries: [1] };
      el._refreshLatest();
      expect(el.latestCreatedUsersGroups).to.deep.equal({});
      expect(el.$.latestCreatedUsersGroups.execute).to.have.been.called;
    });
  });

  suite('_refreshLatestWithDelay', () => {
    let clock;

    setup(() => {
      clock = sinon.useFakeTimers();
    });

    teardown(() => {
      clock.restore();
    });

    test('calls _refreshLatest after 1 second', () => {
      const spy = sinon.spy(el, '_refreshLatest');
      el._refreshLatestWithDelay();
      expect(spy).to.not.have.been.called;
      clock.tick(1000);
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });
  });

  suite('window events', () => {
    test('refreshes with delay on nuxeo-user-created', () => {
      const spy = sinon.spy(el, '_refreshLatestWithDelay');
      window.dispatchEvent(new CustomEvent('nuxeo-user-created'));
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('refreshes with delay on nuxeo-group-created', () => {
      const spy = sinon.spy(el, '_refreshLatestWithDelay');
      window.dispatchEvent(new CustomEvent('nuxeo-group-created'));
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('refreshes immediately on nuxeo-user-deleted', () => {
      const spy = sinon.spy(el, '_refreshLatest');
      window.dispatchEvent(new CustomEvent('nuxeo-user-deleted'));
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('refreshes immediately on nuxeo-group-deleted', () => {
      const spy = sinon.spy(el, '_refreshLatest');
      window.dispatchEvent(new CustomEvent('nuxeo-group-deleted'));
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });
  });

  suite('_isLatestSortActive', () => {
    test('returns true when field is active', () => {
      expect(el._isLatestSortActive([{ field: 'name', order: 'asc' }], 'name')).to.be.true;
    });

    test('returns false when field is not active', () => {
      expect(el._isLatestSortActive([{ field: 'name', order: 'asc' }], 'uid')).to.be.false;
    });

    test('returns false for empty array', () => {
      expect(el._isLatestSortActive([], 'name')).to.be.false;
    });

    test('returns falsy for null cols', () => {
      expect(el._isLatestSortActive(null, 'name')).to.not.be.ok;
    });
  });

  suite('_sortDirection', () => {
    test('returns asc for ascending column', () => {
      expect(el._sortDirection([{ field: 'name', order: 'asc' }], 'name')).to.equal('asc');
    });

    test('returns desc for descending column', () => {
      expect(el._sortDirection([{ field: 'name', order: 'desc' }], 'name')).to.equal('desc');
    });

    test('returns null when field is not present', () => {
      expect(el._sortDirection([{ field: 'name', order: 'asc' }], 'uid')).to.be.null;
    });

    test('returns null for empty cols', () => {
      expect(el._sortDirection([], 'name')).to.be.null;
    });
  });

  suite('_sortIndex', () => {
    test('returns empty string for single-column sort', () => {
      expect(el._sortIndex([{ field: 'name', order: 'asc' }], 'name')).to.equal('');
    });

    test('returns "1" for first field in multi-column sort', () => {
      const cols = [
        { field: 'name', order: 'asc' },
        { field: 'uid', order: 'asc' },
      ];
      expect(el._sortIndex(cols, 'name')).to.equal('1');
    });

    test('returns "2" for second field in multi-column sort', () => {
      const cols = [
        { field: 'name', order: 'asc' },
        { field: 'uid', order: 'asc' },
      ];
      expect(el._sortIndex(cols, 'uid')).to.equal('2');
    });

    test('returns empty string for field not in multi-column sort', () => {
      const cols = [
        { field: 'name', order: 'asc' },
        { field: 'uid', order: 'asc' },
      ];
      expect(el._sortIndex(cols, 'email')).to.equal('');
    });

    test('returns empty string for empty array', () => {
      expect(el._sortIndex([], 'name')).to.equal('');
    });
  });

  suite('_ariaSort', () => {
    test('returns ascending for asc column', () => {
      expect(el._ariaSort([{ field: 'name', order: 'asc' }], 'name')).to.equal('ascending');
    });

    test('returns descending for desc column', () => {
      expect(el._ariaSort([{ field: 'name', order: 'desc' }], 'name')).to.equal('descending');
    });

    test('returns none when field is not present', () => {
      expect(el._ariaSort([], 'name')).to.equal('none');
    });
  });

  suite('_getLatestSortValue', () => {
    test('returns display name for user via "name" field', () => {
      const user = mkUser('John', 'Doe');
      expect(el._getLatestSortValue(user, 'name')).to.equal('John Doe');
    });

    test('returns uid as fallback for "name" when display name is empty', () => {
      const user = mkUser('', '');
      user.uid = 'jdoe-fallback';
      expect(el._getLatestSortValue(user, 'name')).to.equal('jdoe-fallback');
    });

    test('returns grouplabel as "name" for group', () => {
      const group = mkGroup('Admins');
      expect(el._getLatestSortValue(group, 'name')).to.equal('Admins');
    });

    test('returns uid for "uid" field', () => {
      const user = mkUser('John', 'Doe');
      user.uid = 'uid-123';
      expect(el._getLatestSortValue(user, 'uid')).to.equal('uid-123');
    });

    test('returns empty string when uid is absent for "uid" field', () => {
      const item = { type: 'user', properties: {} };
      expect(el._getLatestSortValue(item, 'uid')).to.equal('');
    });

    test('returns email for "email" field', () => {
      const user = mkUser('John', 'Doe', 'john@example.com');
      expect(el._getLatestSortValue(user, 'email')).to.equal('john@example.com');
    });

    test('returns empty string when email is absent', () => {
      const user = mkUser('John', 'Doe', '');
      expect(el._getLatestSortValue(user, 'email')).to.equal('');
    });

    test('returns empty string for unknown field', () => {
      expect(el._getLatestSortValue(mkUser('A', 'B'), 'unknown')).to.equal('');
    });
  });

  suite('_sortLatest', () => {
    test('adds column and applies sort', () => {
      el.latestCreatedUsersGroups = { entries: [mkUser('B', 'Beta'), mkUser('A', 'Alpha')] };
      el._applySort();
      el._sortLatest({ currentTarget: { dataset: { field: 'name' } } });
      expect(el._latestSortColumns).to.deep.equal([{ field: 'name', order: 'asc' }]);
      expect(el._sortedLatest[0]).to.equal(el.latestCreatedUsersGroups.entries[1]);
    });

    test('cycles to desc on second click', () => {
      el.latestCreatedUsersGroups = { entries: [mkUser('A', 'Alpha'), mkUser('B', 'Beta')] };
      el._sortLatest({ currentTarget: { dataset: { field: 'name' } } });
      el._sortLatest({ currentTarget: { dataset: { field: 'name' } } });
      expect(el._latestSortColumns).to.deep.equal([{ field: 'name', order: 'desc' }]);
      expect(el._sortedLatest[0]).to.equal(el.latestCreatedUsersGroups.entries[1]);
    });

    test('removes column on third click', () => {
      el.latestCreatedUsersGroups = { entries: [] };
      el._sortLatest({ currentTarget: { dataset: { field: 'name' } } });
      el._sortLatest({ currentTarget: { dataset: { field: 'name' } } });
      el._sortLatest({ currentTarget: { dataset: { field: 'name' } } });
      expect(el._latestSortColumns).to.deep.equal([]);
    });

    test('supports multi-column sort', () => {
      el.latestCreatedUsersGroups = { entries: [mkUser('A', 'Z'), mkUser('A', 'A'), mkUser('B', 'A')] };
      el._sortLatest({ currentTarget: { dataset: { field: 'name' } } });
      el._sortLatest({ currentTarget: { dataset: { field: 'uid' } } });
      expect(el._latestSortColumns.length).to.equal(2);
    });
  });

  suite('_applySort', () => {
    test('returns original order when no sort columns', () => {
      const entries = [mkUser('B', 'B'), mkUser('A', 'A')];
      el.latestCreatedUsersGroups = { entries };
      el._latestSortColumns = [];
      el._applySort();
      expect(el._sortedLatest).to.deep.equal(entries);
    });

    test('sorts by name ascending', () => {
      const alpha = mkUser('A', 'Alpha');
      const beta = mkUser('B', 'Beta');
      el.latestCreatedUsersGroups = { entries: [beta, alpha] };
      el._latestSortColumns = [{ field: 'name', order: 'asc' }];
      el._applySort();
      expect(el._sortedLatest[0]).to.equal(alpha);
      expect(el._sortedLatest[1]).to.equal(beta);
    });

    test('sorts by name descending', () => {
      const alpha = mkUser('A', 'Alpha');
      const beta = mkUser('B', 'Beta');
      el.latestCreatedUsersGroups = { entries: [alpha, beta] };
      el._latestSortColumns = [{ field: 'name', order: 'desc' }];
      el._applySort();
      expect(el._sortedLatest[0]).to.equal(beta);
      expect(el._sortedLatest[1]).to.equal(alpha);
    });

    test('does not mutate the original entries array', () => {
      const entries = [mkUser('B', 'Beta'), mkUser('A', 'Alpha')];
      el.latestCreatedUsersGroups = { entries };
      el._latestSortColumns = [{ field: 'name', order: 'asc' }];
      el._applySort();
      expect(el.latestCreatedUsersGroups.entries[0]).to.equal(entries[0]);
    });

    test('handles null latestCreatedUsersGroups gracefully', () => {
      el.latestCreatedUsersGroups = null;
      el._latestSortColumns = [{ field: 'name', order: 'asc' }];
      el._applySort();
      expect(el._sortedLatest).to.deep.equal([]);
    });

    test('handles missing entries gracefully', () => {
      el.latestCreatedUsersGroups = {};
      el._latestSortColumns = [{ field: 'name', order: 'asc' }];
      el._applySort();
      expect(el._sortedLatest).to.deep.equal([]);
    });

    test('sorts by uid field', () => {
      const u1 = mkUser('A', 'A');
      u1.uid = 'b-uid';
      const u2 = mkUser('B', 'B');
      u2.uid = 'a-uid';
      el.latestCreatedUsersGroups = { entries: [u1, u2] };
      el._latestSortColumns = [{ field: 'uid', order: 'asc' }];
      el._applySort();
      expect(el._sortedLatest[0]).to.equal(u2);
      expect(el._sortedLatest[1]).to.equal(u1);
    });
  });

  suite('_onEntriesChanged', () => {
    test('re-applies sort when entries change', () => {
      const spy = sinon.spy(el, '_applySort');
      el._onEntriesChanged();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });
  });
});
