import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-user-group-management/nuxeo-user-group-search.js';

suite('nuxeo-user-group-search', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-user-group-search></nuxeo-user-group-search>
      `,
    );
    sinon.stub(el.$.userSearch, 'execute').returns(Promise.resolve({}));
    sinon.stub(el.$.groupSearch, 'execute').returns(Promise.resolve({}));
    await flush();
  });

  suite('_empty', () => {
    test('returns true for empty array', () => {
      expect(el._empty([])).to.be.true;
    });

    test('returns false for non-empty array', () => {
      expect(el._empty([1])).to.be.false;
    });

    test('returns falsy for null', () => {
      expect(el._empty(null)).to.not.be.ok;
    });

    test('returns falsy for undefined', () => {
      expect(el._empty(undefined)).to.not.be.ok;
    });
  });

  suite('_userHasName', () => {
    test('returns truthy when both names present', () => {
      const user = { properties: { firstName: 'John', lastName: 'Doe' } };
      expect(el._userHasName(user)).to.be.ok;
    });

    test('returns truthy when only firstName', () => {
      const user = { properties: { firstName: 'John', lastName: '' } };
      expect(el._userHasName(user)).to.be.ok;
    });

    test('returns truthy when only lastName', () => {
      const user = { properties: { firstName: '', lastName: 'Doe' } };
      expect(el._userHasName(user)).to.be.ok;
    });

    test('returns falsy when neither name', () => {
      const user = { properties: { firstName: '', lastName: '' } };
      expect(el._userHasName(user)).to.not.be.ok;
    });
  });

  suite('_showResults', () => {
    test('returns true when searchTerm is empty', () => {
      el.searchTerm = '';
      expect(el._showResults()).to.be.true;
    });

    test('returns false when searchTerm is not empty', () => {
      el.searchTerm = 'admin';
      expect(el._showResults()).to.be.false;
    });
  });

  suite('_countUsers', () => {
    test('returns singular label for one user', () => {
      const result = el._countUsers(['u1']);
      expect(result).to.include('1');
    });

    test('returns plural label for multiple users', () => {
      const result = el._countUsers(['u1', 'u2']);
      expect(result).to.include('2');
    });
  });

  suite('_countGroups', () => {
    test('returns label for one group', () => {
      const result = el._countGroups(['g1']);
      expect(result).to.include('1');
    });

    test('returns plural label for multiple groups', () => {
      const result = el._countGroups(['g1', 'g2']);
      expect(result).to.include('2');
    });

    test('returns undefined for empty groups', () => {
      expect(el._countGroups([])).to.be.undefined;
    });
  });

  suite('_searchTermChanged', () => {
    test('sets page to 1 and searches when searchTerm is non-empty', () => {
      el.searchTerm = 'admin';
      el._searchTermChanged();
      expect(el.groupsCurrentPage).to.equal(1);
      expect(el.usersCurrentPage).to.equal(1);
      expect(el.$.groupSearch.params.q).to.equal('admin');
      expect(el.$.userSearch.params.q).to.equal('admin');
    });

    test('clears results when searchTerm is empty', () => {
      el.searchTerm = '';
      el._searchTermChanged();
      expect(el.users).to.deep.equal({});
      expect(el.groups).to.deep.equal({});
    });
  });

  suite('_searchGroups', () => {
    test('sets params on groupSearch resource', () => {
      el.searchTerm = 'admins';
      el.groupsCurrentPage = 1;
      el._searchGroups();
      expect(el.$.groupSearch.params.q).to.equal('admins');
      expect(el.$.groupSearch.params.currentPageIndex).to.equal(0);
    });
  });

  suite('_searchUsers', () => {
    test('sets params on userSearch resource', () => {
      el.searchTerm = 'john';
      el.usersCurrentPage = 2;
      el._searchUsers();
      expect(el.$.userSearch.params.q).to.equal('john');
      expect(el.$.userSearch.params.currentPageIndex).to.equal(1);
    });
  });

  suite('_manageUser', () => {
    test('dispatches manageUser event with user id', (done) => {
      el.addEventListener('manageUser', (evt) => {
        expect(evt.detail.user).to.equal('jdoe');
        done();
      });
      el._manageUser({ model: { item: { id: 'jdoe' } } });
    });
  });

  suite('_manageGroup', () => {
    test('dispatches manageGroup event with group name', (done) => {
      el.addEventListener('manageGroup', (evt) => {
        expect(evt.detail.group).to.equal('admins');
        done();
      });
      el._manageGroup({ model: { item: { groupname: 'admins' } } });
    });

    test('prefers group id over groupname', (done) => {
      el.addEventListener('manageGroup', (evt) => {
        expect(evt.detail.group).to.equal('admins-uuid');
        done();
      });
      el._manageGroup({ model: { item: { id: 'admins-uuid', groupname: 'admins' } } });
    });
  });

  suite('_groupIdentifier', () => {
    test('returns empty string for null or undefined', () => {
      expect(el._groupIdentifier(null)).to.equal('');
      expect(el._groupIdentifier(undefined)).to.equal('');
    });

    test('returns group.name when present', () => {
      expect(el._groupIdentifier({ name: 'administrators', properties: {} })).to.equal('administrators');
    });

    test('falls back to properties.groupname when name is absent', () => {
      expect(el._groupIdentifier({ properties: { groupname: 'managers' } })).to.equal('managers');
    });

    test('returns empty string when neither name nor properties.groupname', () => {
      expect(el._groupIdentifier({ properties: {} })).to.equal('');
    });
  });

  suite('_userIdentifier', () => {
    test('returns empty string for null or undefined', () => {
      expect(el._userIdentifier(null)).to.equal('');
      expect(el._userIdentifier(undefined)).to.equal('');
    });

    test('returns properties.username when present', () => {
      expect(el._userIdentifier({ properties: { username: 'jdoe' } })).to.equal('jdoe');
    });

    test('falls back to user.name when properties.username is absent', () => {
      expect(el._userIdentifier({ name: 'jdoe', properties: {} })).to.equal('jdoe');
    });

    test('falls back to user.id when name is absent', () => {
      expect(el._userIdentifier({ id: 'jdoe-uuid', properties: {} })).to.equal('jdoe-uuid');
    });

    test('falls back to user.uid when id is absent', () => {
      expect(el._userIdentifier({ uid: 'jdoe-uid', properties: {} })).to.equal('jdoe-uid');
    });

    test('returns empty string when all fields are absent', () => {
      expect(el._userIdentifier({ properties: {} })).to.equal('');
    });
  });

  suite('_toggleSortColumn', () => {
    test('adds field with asc order when not present', () => {
      const result = el._toggleSortColumn([], 'grouplabel');
      expect(result).to.deep.equal([{ field: 'grouplabel', order: 'asc' }]);
    });

    test('cycles to desc when already asc', () => {
      const result = el._toggleSortColumn([{ field: 'grouplabel', order: 'asc' }], 'grouplabel');
      expect(result).to.deep.equal([{ field: 'grouplabel', order: 'desc' }]);
    });

    test('removes field when already desc', () => {
      const result = el._toggleSortColumn([{ field: 'grouplabel', order: 'desc' }], 'grouplabel');
      expect(result).to.deep.equal([]);
    });

    test('appends new field without affecting existing ones', () => {
      const result = el._toggleSortColumn([{ field: 'grouplabel', order: 'asc' }], 'groupname');
      expect(result).to.deep.equal([
        { field: 'grouplabel', order: 'asc' },
        { field: 'groupname', order: 'asc' },
      ]);
    });

    test('removes only the toggled field from multi-column array', () => {
      const cols = [
        { field: 'grouplabel', order: 'asc' },
        { field: 'groupname', order: 'desc' },
      ];
      const result = el._toggleSortColumn(cols, 'groupname');
      expect(result).to.deep.equal([{ field: 'grouplabel', order: 'asc' }]);
    });

    test('does not mutate the original array', () => {
      const cols = [{ field: 'grouplabel', order: 'asc' }];
      el._toggleSortColumn(cols, 'grouplabel');
      expect(cols).to.deep.equal([{ field: 'grouplabel', order: 'asc' }]);
    });
  });

  suite('_isGroupSortActive', () => {
    test('returns true when field is active', () => {
      expect(el._isGroupSortActive([{ field: 'grouplabel', order: 'asc' }], 'grouplabel')).to.be.true;
    });

    test('returns false when field is not active', () => {
      expect(el._isGroupSortActive([{ field: 'grouplabel', order: 'asc' }], 'groupname')).to.be.false;
    });

    test('returns false for empty array', () => {
      expect(el._isGroupSortActive([], 'grouplabel')).to.be.false;
    });

    test('returns falsy for null cols', () => {
      expect(el._isGroupSortActive(null, 'grouplabel')).to.not.be.ok;
    });
  });

  suite('_isUserSortActive', () => {
    test('returns true when field is active', () => {
      expect(el._isUserSortActive([{ field: 'lastName', order: 'asc' }], 'lastName')).to.be.true;
    });

    test('returns false when field is not active', () => {
      expect(el._isUserSortActive([{ field: 'lastName', order: 'asc' }], 'email')).to.be.false;
    });

    test('returns false for empty array', () => {
      expect(el._isUserSortActive([], 'lastName')).to.be.false;
    });

    test('returns falsy for null cols', () => {
      expect(el._isUserSortActive(null, 'lastName')).to.not.be.ok;
    });
  });

  suite('_sortDirection', () => {
    test('returns asc for ascending column', () => {
      expect(el._sortDirection([{ field: 'grouplabel', order: 'asc' }], 'grouplabel')).to.equal('asc');
    });

    test('returns desc for descending column', () => {
      expect(el._sortDirection([{ field: 'grouplabel', order: 'desc' }], 'grouplabel')).to.equal('desc');
    });

    test('returns null when field is not present', () => {
      expect(el._sortDirection([{ field: 'grouplabel', order: 'asc' }], 'groupname')).to.be.null;
    });

    test('returns null for empty cols', () => {
      expect(el._sortDirection([], 'grouplabel')).to.be.null;
    });
  });

  suite('_sortIndex', () => {
    test('returns empty string for single-column sort', () => {
      expect(el._sortIndex([{ field: 'grouplabel', order: 'asc' }], 'grouplabel')).to.equal('');
    });

    test('returns "1" for first field in multi-column sort', () => {
      const cols = [
        { field: 'grouplabel', order: 'asc' },
        { field: 'groupname', order: 'asc' },
      ];
      expect(el._sortIndex(cols, 'grouplabel')).to.equal('1');
    });

    test('returns "2" for second field in multi-column sort', () => {
      const cols = [
        { field: 'grouplabel', order: 'asc' },
        { field: 'groupname', order: 'asc' },
      ];
      expect(el._sortIndex(cols, 'groupname')).to.equal('2');
    });

    test('returns empty string for field not in multi-column sort', () => {
      const cols = [
        { field: 'grouplabel', order: 'asc' },
        { field: 'groupname', order: 'asc' },
      ];
      expect(el._sortIndex(cols, 'email')).to.equal('');
    });

    test('returns empty string for empty array', () => {
      expect(el._sortIndex([], 'grouplabel')).to.equal('');
    });
  });

  suite('_ariaSort', () => {
    test('returns ascending for asc column', () => {
      expect(el._ariaSort([{ field: 'grouplabel', order: 'asc' }], 'grouplabel')).to.equal('ascending');
    });

    test('returns descending for desc column', () => {
      expect(el._ariaSort([{ field: 'grouplabel', order: 'desc' }], 'grouplabel')).to.equal('descending');
    });

    test('returns none when field is not present', () => {
      expect(el._ariaSort([], 'grouplabel')).to.equal('none');
    });
  });

  suite('_sortGroups', () => {
    test('adds column, resets page to 1, and re-searches', () => {
      el.searchTerm = 'test';
      el.groupsCurrentPage = 3;
      sinon.spy(el, '_searchGroups');
      el._sortGroups({ currentTarget: { dataset: { field: 'grouplabel' } } });
      expect(el._groupSortColumns).to.deep.equal([{ field: 'grouplabel', order: 'asc' }]);
      expect(el.groupsCurrentPage).to.equal(1);
      expect(el._searchGroups).to.have.been.calledOnce;
      el._searchGroups.restore();
    });

    test('cycles sort direction on repeated clicks', () => {
      el.searchTerm = 'test';
      sinon.stub(el, '_searchGroups');
      el._sortGroups({ currentTarget: { dataset: { field: 'grouplabel' } } });
      el._sortGroups({ currentTarget: { dataset: { field: 'grouplabel' } } });
      expect(el._groupSortColumns).to.deep.equal([{ field: 'grouplabel', order: 'desc' }]);
      el._searchGroups.restore();
    });

    test('removes column on third click', () => {
      el.searchTerm = 'test';
      sinon.stub(el, '_searchGroups');
      el._sortGroups({ currentTarget: { dataset: { field: 'grouplabel' } } });
      el._sortGroups({ currentTarget: { dataset: { field: 'grouplabel' } } });
      el._sortGroups({ currentTarget: { dataset: { field: 'grouplabel' } } });
      expect(el._groupSortColumns).to.deep.equal([]);
      el._searchGroups.restore();
    });
  });

  suite('_sortUsers', () => {
    test('adds column, resets page to 1, and re-searches', () => {
      el.searchTerm = 'test';
      el.usersCurrentPage = 5;
      sinon.spy(el, '_searchUsers');
      el._sortUsers({ currentTarget: { dataset: { field: 'lastName' } } });
      expect(el._userSortColumns).to.deep.equal([{ field: 'lastName', order: 'asc' }]);
      expect(el.usersCurrentPage).to.equal(1);
      expect(el._searchUsers).to.have.been.calledOnce;
      el._searchUsers.restore();
    });

    test('cycles sort direction on repeated clicks', () => {
      el.searchTerm = 'test';
      sinon.stub(el, '_searchUsers');
      el._sortUsers({ currentTarget: { dataset: { field: 'email' } } });
      el._sortUsers({ currentTarget: { dataset: { field: 'email' } } });
      expect(el._userSortColumns).to.deep.equal([{ field: 'email', order: 'desc' }]);
      el._searchUsers.restore();
    });

    test('removes column on third click', () => {
      el.searchTerm = 'test';
      sinon.stub(el, '_searchUsers');
      el._sortUsers({ currentTarget: { dataset: { field: 'username' } } });
      el._sortUsers({ currentTarget: { dataset: { field: 'username' } } });
      el._sortUsers({ currentTarget: { dataset: { field: 'username' } } });
      expect(el._userSortColumns).to.deep.equal([]);
      el._searchUsers.restore();
    });
  });

  suite('_searchGroups with sort', () => {
    test('includes sortBy and sortOrder when sort columns are set', () => {
      el.searchTerm = 'test';
      el.groupsCurrentPage = 1;
      el._groupSortColumns = [
        { field: 'grouplabel', order: 'asc' },
        { field: 'groupname', order: 'desc' },
      ];
      el._searchGroups();
      expect(el.$.groupSearch.params.sortBy).to.equal('grouplabel,groupname');
      expect(el.$.groupSearch.params.sortOrder).to.equal('asc,desc');
    });

    test('omits sortBy and sortOrder when no sort columns', () => {
      el.searchTerm = 'test';
      el.groupsCurrentPage = 1;
      el._groupSortColumns = [];
      el._searchGroups();
      expect(el.$.groupSearch.params.sortBy).to.be.undefined;
      expect(el.$.groupSearch.params.sortOrder).to.be.undefined;
    });

    test('applies single-column sort correctly', () => {
      el.searchTerm = 'test';
      el._groupSortColumns = [{ field: 'grouplabel', order: 'desc' }];
      el._searchGroups();
      expect(el.$.groupSearch.params.sortBy).to.equal('grouplabel');
      expect(el.$.groupSearch.params.sortOrder).to.equal('desc');
    });
  });

  suite('_searchUsers with sort', () => {
    test('includes sortBy and sortOrder when sort columns are set', () => {
      el.searchTerm = 'test';
      el.usersCurrentPage = 1;
      el._userSortColumns = [
        { field: 'lastName', order: 'asc' },
        { field: 'email', order: 'desc' },
      ];
      el._searchUsers();
      expect(el.$.userSearch.params.sortBy).to.equal('lastName,email');
      expect(el.$.userSearch.params.sortOrder).to.equal('asc,desc');
    });

    test('omits sortBy and sortOrder when no sort columns', () => {
      el.searchTerm = 'test';
      el._userSortColumns = [];
      el._searchUsers();
      expect(el.$.userSearch.params.sortBy).to.be.undefined;
      expect(el.$.userSearch.params.sortOrder).to.be.undefined;
    });

    test('applies single-column sort correctly', () => {
      el.searchTerm = 'test';
      el._userSortColumns = [{ field: 'username', order: 'asc' }];
      el._searchUsers();
      expect(el.$.userSearch.params.sortBy).to.equal('username');
      expect(el.$.userSearch.params.sortOrder).to.equal('asc');
    });
  });
});
