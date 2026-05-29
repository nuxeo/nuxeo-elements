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
import '../widgets/nuxeo-user-avatar.js';

suite('nuxeo-user-avatar', () => {
  test('should get initial characters based on first and last name', async () => {
    const element = await fixture(html`<nuxeo-user-avatar></nuxeo-avatar>`);
    const character = dom(element.root).querySelector('#character');
    const icon = dom(element.root).querySelector('iron-icon');
    element.user = {
      'entity-type': 'user',
      id: 'jdoe',
      properties: {
        username: 'jdoe',
        firstName: 'John',
        lastName: 'Doe',
      },
    };
    expect(character.hidden).to.equal(false);
    expect(icon.hidden).to.equal(true);
    expect(character.innerText).to.equal('JD');
  });

  test('should get the user icon if non Latin characters exist on user information', async () => {
    const element = await fixture(html`<nuxeo-user-avatar></nuxeo-avatar>`);
    element.user = {
      'entity-type': 'user',
      id: 'はると',
      properties: {
        username: 'はると',
        firstName: 'はると',
        lastName: 'りく',
      },
    };
    await flush();
    const character = dom(element.root).querySelector('#character');
    const userIcon = dom(element.root).querySelector('iron-icon');
    expect(character.hidden).to.equal(true);
    expect(userIcon.hidden).to.equal(false);
  });
});

suite('nuxeo-user-avatar extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-user-avatar></nuxeo-user-avatar>
      `,
    );
  });

  suite('_isEntity', () => {
    test('returns truthy for user entity with properties', () => {
      const u = { 'entity-type': 'user', properties: { username: 'j' } };
      expect(el._isEntity(u)).to.be.ok;
    });

    test('returns truthy for document entity with type=user', () => {
      const u = { 'entity-type': 'document', type: 'user', properties: {} };
      expect(el._isEntity(u)).to.be.ok;
    });

    test('returns falsy for document with type!=user', () => {
      expect(el._isEntity({ 'entity-type': 'document', type: 'File', properties: {} })).to.not.be.ok;
    });

    test('returns falsy when properties is missing', () => {
      expect(el._isEntity({ 'entity-type': 'user' })).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(el._isEntity(null)).to.not.be.ok;
    });

    test('returns falsy for undefined', () => {
      expect(el._isEntity(undefined)).to.not.be.ok;
    });
  });

  suite('_id', () => {
    test('returns user.id', () => {
      expect(el._id({ id: 'jdoe' })).to.equal('jdoe');
    });

    test('returns user.uid when id is missing', () => {
      expect(el._id({ uid: 'u1' })).to.equal('u1');
    });

    test('strips user: prefix from string', () => {
      expect(el._id('user:admin')).to.equal('admin');
    });

    test('returns undefined for null', () => {
      expect(el._id(null)).to.be.undefined;
    });

    test('returns undefined for undefined', () => {
      expect(el._id(undefined)).to.be.undefined;
    });
  });

  suite('_name', () => {
    test('returns firstName lastName for entity', () => {
      const u = {
        'entity-type': 'user',
        properties: { firstName: 'John', lastName: 'Doe' },
      };
      expect(el._name(u)).to.equal('John Doe');
    });

    test('falls back to user:firstName / user:lastName', () => {
      const u = {
        'entity-type': 'user',
        properties: { 'user:firstName': 'A', 'user:lastName': 'B' },
      };
      expect(el._name(u)).to.equal('A B');
    });

    test('falls back to _id when name is empty', () => {
      const u = { 'entity-type': 'user', id: 'fallback', properties: {} };
      expect(el._name(u)).to.equal('fallback');
    });

    test('returns _id for non-entity', () => {
      expect(el._name({ id: 'plain' })).to.equal('plain');
    });

    test('returns _id for string', () => {
      expect(el._name('user:joe')).to.equal('joe');
    });
  });

  suite('_email', () => {
    test('returns email when different from id', () => {
      const u = { 'entity-type': 'user', id: 'j', properties: { email: 'j@d.com' } };
      expect(el._email(u)).to.equal('j@d.com');
    });

    test('returns empty when email equals id', () => {
      const u = { 'entity-type': 'user', id: 'j@d.com', properties: { email: 'j@d.com' } };
      expect(el._email(u)).to.equal('');
    });

    test('uses user:email when email is missing', () => {
      const u = { 'entity-type': 'user', id: 'j', properties: { 'user:email': 'x@y.com' } };
      expect(el._email(u)).to.equal('x@y.com');
    });

    test('returns empty for non-entity', () => {
      expect(el._email({ id: 'j' })).to.equal('');
    });

    test('returns empty for string', () => {
      expect(el._email('user:j')).to.equal('');
    });
  });

  suite('_username', () => {
    test('returns user.id from entity', () => {
      const u = { 'entity-type': 'user', id: 'jdoe-id', properties: { username: 'jdoe' } };
      expect(el._username(u)).to.equal('jdoe-id');
    });

    test('uses user.id when entity has both id and user:username', () => {
      const u = { 'entity-type': 'user', id: 'alt-id', properties: { 'user:username': 'alt' } };
      expect(el._username(u)).to.equal('alt-id');
    });

    test('falls back to _id for non-entity', () => {
      expect(el._username({ id: 'fallback' })).to.equal('fallback');
    });
  });

  suite('observer methods', () => {
    test('__obsHeight sets container height', () => {
      el.height = 64;
      el.__obsHeight();
      expect(el.$.container.style.height).to.equal('64px');
    });

    test('__obsWidth sets container width', () => {
      el.width = 64;
      el.__obsWidth();
      expect(el.$.container.style.width).to.equal('64px');
    });

    test('__obsTextColor sets character color', () => {
      el.textColor = '#FF0000';
      el.__obsTextColor();
      expect(el.$.character.style.color).to.equal('rgb(255, 0, 0)');
    });

    test('__obsFontSize sets character fontSize', () => {
      el.fontSize = 30;
      el.__obsFontSize();
      expect(el.$.character.style.fontSize).to.equal('30px');
    });

    test('__obsFontWeight sets character fontWeight', () => {
      el.fontWeight = 700;
      el.__obsFontWeight();
      expect(el.$.character.style.fontWeight).to.equal('700');
    });

    test('__obsBorderRadius defaults to 0 when empty', () => {
      el.borderRadius = '';
      el.__obsBorderRadius();
      expect(el.borderRadius).to.equal(0);
      expect(el.$.container.style.borderRadius).to.equal('0%');
    });

    test('__obsBorderRadius defaults to 0 when null', () => {
      el.borderRadius = null;
      el.__obsBorderRadius();
      expect(el.borderRadius).to.equal(0);
    });

    test('__obsBorderRadius sets value when numeric', () => {
      el.borderRadius = 50;
      el.__obsBorderRadius();
      expect(el.$.container.style.borderRadius).to.equal('50%');
    });

    test('__obsBoxShadow sets box shadow styles', () => {
      el.boxShadow = '2px 2px 4px rgba(0,0,0,0.5)';
      el.__obsBoxShadow();
      expect(el.$.container.style.boxShadow).to.equal('2px 2px 4px rgba(0,0,0,0.5)');
    });

    test('__obsTextShadow sets text shadow styles', () => {
      el.textShadow = '1px 1px 2px rgba(0,0,0,0.3)';
      el.__obsTextShadow();
      expect(el.$.character.style.textShadow).to.equal('1px 1px 2px rgba(0,0,0,0.3)');
    });
  });

  suite('__generateHue', () => {
    test('returns a number between 0 and 359', () => {
      el.user = { id: 'jdoe' };
      const hue = el.__generateHue();
      expect(hue).to.be.a('number');
      expect(hue).to.be.at.least(0);
      expect(hue).to.be.at.most(359);
    });

    test('produces same hue for same user', () => {
      el.user = { id: 'testuser' };
      const h1 = el.__generateHue();
      const h2 = el.__generateHue();
      expect(h1).to.equal(h2);
    });
  });

  suite('__makeAvatar', () => {
    test('does nothing when user is null', () => {
      el.user = null;
      el.__makeAvatar();
    });

    test('uses avatar data URL when context parameters exist', () => {
      el.user = {
        id: 'j',
        'entity-type': 'user',
        properties: { firstName: 'J', lastName: 'D' },
        contextParameters: {
          userprofile: {
            avatar: { data: 'data:image/png;base64,abc' },
          },
        },
      };
      el.__makeAvatar();
      expect(el._output).to.equal('');
      expect(el.$.container.style.background).to.include('data:image/png');
    });

    test('generates initials when no avatar and name is alphabetic', () => {
      el.user = {
        id: 'jdoe',
        'entity-type': 'user',
        properties: { firstName: 'John', lastName: 'Doe' },
      };
      el.__makeAvatar();
      expect(el._output).to.equal('JD');
      expect(el._isInTheAlphabet).to.be.true;
    });

    test('handles non-alphabetic first character', () => {
      el.user = { id: '!!special' };
      el.__makeAvatar();
      expect(el._isInTheAlphabet).to.be.false;
    });

    test('fetches avatar when fetchAvatar is true and updates user when avatar returned', async () => {
      const avatarUser = {
        id: 'jdoe-id',
        'entity-type': 'user',
        properties: { firstName: 'John', lastName: 'Doe' },
        contextParameters: {
          userprofile: {
            avatar: { data: 'data:image/png;base64,fetched' },
          },
        },
      };
      el.user = {
        id: 'jdoe-id',
        'entity-type': 'user',
        properties: { firstName: 'John', lastName: 'Doe' },
      };
      el.fetchAvatar = true;
      sinon.stub(el.$.getUserProfile, 'get').returns(Promise.resolve(avatarUser));
      el.__makeAvatar();
      await flush();
      await Promise.resolve();
      expect(el.$.getUserProfile.path).to.equal('user/jdoe-id');
      expect(el.user).to.equal(avatarUser);
      el.$.getUserProfile.get.restore();
    });

    test('does not update user when fetched response has no avatar', async () => {
      const originalUser = {
        id: 'jdoe-id',
        'entity-type': 'user',
        properties: { firstName: 'John', lastName: 'Doe' },
      };
      el.user = originalUser;
      el.fetchAvatar = true;
      sinon.stub(el.$.getUserProfile, 'get').returns(Promise.resolve({ id: 'jdoe-id', contextParameters: {} }));
      el.__makeAvatar();
      await flush();
      await Promise.resolve();
      expect(el.user).to.equal(originalUser);
      el.$.getUserProfile.get.restore();
    });

    test('logs warning when avatar fetch fails', async () => {
      el.user = {
        id: 'jdoe-id',
        'entity-type': 'user',
        properties: { firstName: 'John', lastName: 'Doe' },
      };
      el.fetchAvatar = true;
      sinon.stub(el.$.getUserProfile, 'get').returns(Promise.reject(new Error('network error')));
      const warnSpy = sinon.stub(console, 'warn');
      el.__makeAvatar();
      await flush();
      await Promise.resolve();
      expect(warnSpy).to.have.been.called;
      warnSpy.restore();
      el.$.getUserProfile.get.restore();
    });
  });
});
