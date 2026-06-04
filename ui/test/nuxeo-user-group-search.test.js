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
});
