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
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../widgets/nuxeo-user-tag.js';

suite('nuxeo-user-tag', () => {
  suite("User's Display Name", () => {
    test('Should display first and last names concatenated when at least one is provided and defined', async () => {
      const userWithFirstAndLastNames = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'jdoe@nuxeo.com',
        },
      };

      const userWithFirstName = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: {
          firstName: 'John',
          email: 'jdoe@nuxeo.com',
        },
      };

      const userWithLastName = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: {
          lastName: 'Doe',
          email: 'jdoe@nuxeo.com',
        },
      };

      const tagWithFirstAndLastNames = await fixture(html`
        <nuxeo-user-tag id="first-last" disabled user="${JSON.stringify(userWithFirstAndLastNames)}"></nuxeo-user-tag>
      `);
      const tagWithFirstName = await fixture(html`
        <nuxeo-user-tag id="first" disabled user="${JSON.stringify(userWithFirstName)}"></nuxeo-user-tag>
      `);
      const tagWithLastName = await fixture(html`
        <nuxeo-user-tag id="last" disabled user="${JSON.stringify(userWithLastName)}"></nuxeo-user-tag>
      `);

      expect(dom(tagWithFirstAndLastNames.root).querySelector('nuxeo-tag').innerText).to.have.string('John Doe');
      expect(dom(tagWithFirstName.root).querySelector('nuxeo-tag').innerText).to.have.string('John');
      expect(dom(tagWithLastName.root).querySelector('nuxeo-tag').innerText).to.have.string('Doe');
    });

    test('Should display e-mail when no names are provided', async () => {
      const user = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: {
          email: 'jdoe@nuxeo.com',
        },
      };

      const tagWithEmail = await fixture(html`
        <nuxeo-user-tag id="email" disabled user="${JSON.stringify(user)}"></nuxeo-user-tag>
      `);

      expect(dom(tagWithEmail.root).querySelector('nuxeo-tag').innerText).to.have.string('jdoe@nuxeo.com');
    });

    test('Should display id when no names or e-mail are provided', async () => {
      const user = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: {},
      };

      const tagWithId = await fixture(html`
        <nuxeo-user-tag id="id" disabled user="${JSON.stringify(user)}"></nuxeo-user-tag>
      `);

      expect(dom(tagWithId.root).querySelector('nuxeo-tag').innerText).to.have.string('jdoe');
    });
  });
});

suite('nuxeo-user-tag extras', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-user-tag></nuxeo-user-tag>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.UserTag.is).to.equal('nuxeo-user-tag');
  });

  test('should have default property values', () => {
    expect(Nuxeo.UserTag.properties.disabled.value).to.be.false;
    expect(Nuxeo.UserTag.properties.fetchAvatar.value).to.be.false;
  });

  test('connectedCallback sets dir attribute when missing', () => {
    expect(el.hasAttribute('dir')).to.be.true;
  });

  suite('_isEntity', () => {
    test('returns truthy for user entity with properties', () => {
      expect(el._isEntity({ 'entity-type': 'user', properties: {} })).to.be.ok;
    });

    test('returns truthy for document entity with type=user', () => {
      expect(el._isEntity({ 'entity-type': 'document', type: 'user', properties: {} })).to.be.ok;
    });

    test('returns falsy for document with type!=user', () => {
      expect(el._isEntity({ 'entity-type': 'document', type: 'File', properties: {} })).to.not.be.ok;
    });

    test('returns falsy when properties is missing', () => {
      expect(el._isEntity({ 'entity-type': 'user' })).to.not.be.ok;
    });

    test('returns falsy for null and undefined', () => {
      expect(el._isEntity(null)).to.not.be.ok;
      expect(el._isEntity(undefined)).to.not.be.ok;
    });
  });

  suite('_id', () => {
    test('returns user.id when present', () => {
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

    test('returns properties.username over user.id', () => {
      expect(el._id({ id: 'jdoe', properties: { username: 'johndoe' } })).to.equal('johndoe');
    });

    test('returns properties[user:username] when username property is missing', () => {
      expect(el._id({ id: 'jdoe', properties: { 'user:username': 'johndoe2' } })).to.equal('johndoe2');
    });

    test('falls back to user.id when properties has no username', () => {
      expect(el._id({ id: 'jdoe', properties: {} })).to.equal('jdoe');
    });
  });

  suite('_name', () => {
    test('returns firstName lastName for entity', () => {
      const u = { 'entity-type': 'user', properties: { firstName: 'John', lastName: 'Doe' } };
      expect(el._name(u)).to.equal('John Doe');
    });

    test('falls back to user:firstName / user:lastName', () => {
      const u = { 'entity-type': 'user', properties: { 'user:firstName': 'A', 'user:lastName': 'B' } };
      expect(el._name(u)).to.equal('A B');
    });

    test('falls back to email when no name parts are present', () => {
      const u = { 'entity-type': 'user', id: 'j', properties: { email: 'j@d.com' } };
      expect(el._name(u)).to.equal('j@d.com');
    });

    test('falls back to id when entity has no name or email', () => {
      const u = { 'entity-type': 'user', id: 'fallback', properties: {} };
      expect(el._name(u)).to.equal('fallback');
    });

    test('falls back to username when entity has no name or email', () => {
      const u = { 'entity-type': 'user', id: 'fallback', properties: { username: 'johndoe' } };
      expect(el._name(u)).to.equal('johndoe');
    });

    test('falls back to user:username when entity has no name or email', () => {
      const u = { 'entity-type': 'user', id: 'fallback', properties: { 'user:username': 'johndoe2' } };
      expect(el._name(u)).to.equal('johndoe2');
    });

    test('returns _id for non-entity', () => {
      expect(el._name({ id: 'plain' })).to.equal('plain');
    });

    test('returns _id for string', () => {
      expect(el._name('user:joe')).to.equal('joe');
    });

    suite('maxCharacters truncation', () => {
      test('truncates name and appends ellipsis when name exceeds maxCharacters', () => {
        el.maxCharacters = 5;
        const u = { 'entity-type': 'user', properties: { firstName: 'Alexander', lastName: 'Smith' } };
        expect(el._name(u)).to.equal('Alexa...');
      });

      test('does not truncate when name equals maxCharacters exactly', () => {
        el.maxCharacters = 13;
        const u = { 'entity-type': 'user', properties: { firstName: 'Alexander', lastName: 'Sm' } };
        expect(el._name(u)).to.equal('Alexander Sm');
      });

      test('does not truncate when name is shorter than maxCharacters', () => {
        el.maxCharacters = 50;
        const u = { 'entity-type': 'user', properties: { firstName: 'John', lastName: 'Doe' } };
        expect(el._name(u)).to.equal('John Doe');
      });

      test('does not truncate when maxCharacters is null', () => {
        el.maxCharacters = null;
        const u = { 'entity-type': 'user', properties: { firstName: 'Alexander', lastName: 'Smith' } };
        expect(el._name(u)).to.equal('Alexander Smith');
      });

      test('truncates non-entity id when name exceeds maxCharacters', () => {
        el.maxCharacters = 4;
        expect(el._name({ id: 'verylongusername' })).to.equal('very...');
      });

      test('system user name is not affected by truncation for _hasLink check', () => {
        el.maxCharacters = 3;
        const currentUser = { 'entity-type': 'user', properties: { extendedGroups: [{ name: 'administrators' }] } };
        // _name would return 'sys...' but _hasLink must still detect system user via _id
        expect(el._hasLink(false, 'user:system', currentUser)).to.be.false;
      });
    });
  });

  suite('_email', () => {
    test('returns email when different from id', () => {
      const u = { 'entity-type': 'user', id: 'j', properties: { email: 'j@d.com' } };
      expect(el._email(u)).to.equal('j@d.com');
    });

    test('uses user:email when email is missing', () => {
      const u = { 'entity-type': 'user', id: 'j', properties: { 'user:email': 'x@y.com' } };
      expect(el._email(u)).to.equal('x@y.com');
    });

    test('returns empty when email equals id', () => {
      const u = { 'entity-type': 'user', id: 'j@d.com', properties: { email: 'j@d.com' } };
      expect(el._email(u)).to.equal('');
    });

    test('returns empty for non-entity', () => {
      expect(el._email({ id: 'j' })).to.equal('');
    });
  });

  suite('_href', () => {
    test('returns a URL based on user id', () => {
      const href = el._href({ id: 'jdoe' });
      expect(href).to.be.a('string');
    });
  });

  suite('_hasLink', () => {
    test('returns false when disabled is true', () => {
      const user = { 'entity-type': 'user', id: 'jdoe', properties: {} };
      const currentUser = { 'entity-type': 'user', properties: { extendedGroups: [{ name: 'administrators' }] } };
      expect(el._hasLink(true, user, currentUser)).to.be.false;
    });

    test('returns false when the user name is "system"', () => {
      const user = 'user:system';
      const currentUser = { 'entity-type': 'user', properties: { extendedGroups: [{ name: 'administrators' }] } };
      expect(el._hasLink(false, user, currentUser)).to.be.false;
    });

    test('returns false when current user has no admin permissions', () => {
      const user = { 'entity-type': 'user', id: 'jdoe', properties: {} };
      const currentUser = { 'entity-type': 'user', properties: { extendedGroups: [] } };
      expect(el._hasLink(false, user, currentUser)).to.be.false;
    });
  });

  suite('_preventPropagation', () => {
    test('calls stopPropagation on event', () => {
      const event = { stopPropagation: sinon.spy() };
      el._preventPropagation(event);
      expect(event.stopPropagation).to.have.been.called;
    });
  });

  suite('_getUserTagClass', () => {
    test('returns "user-tag-wrap" when name contains whitespace', () => {
      const u = { 'entity-type': 'user', properties: { firstName: 'John', lastName: 'Doe' } };
      expect(el._getUserTagClass(u)).to.equal('user-tag-wrap');
    });

    test('returns "user-tag-nowrap" when name has no whitespace', () => {
      const u = { 'entity-type': 'user', id: 'jdoe', properties: {} };
      expect(el._getUserTagClass(u)).to.equal('user-tag-nowrap');
    });
  });

  suite('rendered output', () => {
    test('shows the full name when first and last names are present', async () => {
      const user = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: { firstName: 'John', lastName: 'Doe', email: 'jdoe@nuxeo.com' },
      };
      const tag = await fixture(html`
        <nuxeo-user-tag disabled .user="${user}"></nuxeo-user-tag>
      `);
      expect(tag.shadowRoot.innerHTML).to.include('John Doe');
    });

    test('shows the id when no names are present', async () => {
      const user = { 'entity-type': 'user', id: 'jdoe', properties: {} };
      const tag = await fixture(html`
        <nuxeo-user-tag disabled .user="${user}"></nuxeo-user-tag>
      `);
      expect(tag.shadowRoot.innerHTML).to.include('jdoe');
    });

    test('shows username when no names or email are present', async () => {
      const user = { 'entity-type': 'user', id: 'jdoe', properties: { username: 'johndoe' } };
      const tag = await fixture(html`
        <nuxeo-user-tag disabled .user="${user}"></nuxeo-user-tag>
      `);
      expect(tag.shadowRoot.innerHTML).to.include('johndoe');
    });
  });
});
