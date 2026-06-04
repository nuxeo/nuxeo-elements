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
});
