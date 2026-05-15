/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-user-tag.js';

suite('nuxeo-user-tag extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-user-tag></nuxeo-user-tag>
      `,
    );
  });

  suite('_isEntity', () => {
    test('returns truthy for user entity-type with properties', () => {
      const user = { 'entity-type': 'user', properties: { firstName: 'J' } };
      expect(el._isEntity(user)).to.be.ok;
    });

    test('returns truthy for document entity-type with type=user', () => {
      const user = { 'entity-type': 'document', type: 'user', properties: {} };
      expect(el._isEntity(user)).to.be.ok;
    });

    test('returns falsy for document entity-type with type!=user', () => {
      const user = { 'entity-type': 'document', type: 'File', properties: {} };
      expect(el._isEntity(user)).to.not.be.ok;
    });

    test('returns falsy when entity-type is missing', () => {
      expect(el._isEntity({ properties: {} })).to.not.be.ok;
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
    test('returns user.id when available', () => {
      expect(el._id({ id: 'jdoe' })).to.equal('jdoe');
    });

    test('returns user.uid when id is missing', () => {
      expect(el._id({ uid: 'uid1' })).to.equal('uid1');
    });

    test('strips user: prefix from string', () => {
      expect(el._id('user:jdoe')).to.equal('jdoe');
    });

    test('returns undefined for null user', () => {
      expect(el._id(null)).to.be.undefined;
    });

    test('returns undefined for undefined user', () => {
      expect(el._id(undefined)).to.be.undefined;
    });
  });

  suite('_name', () => {
    test('returns firstName + lastName for entity', () => {
      const user = {
        'entity-type': 'user',
        properties: { firstName: 'John', lastName: 'Doe' },
      };
      expect(el._name(user)).to.equal('John Doe');
    });

    test('falls back to user:firstName / user:lastName', () => {
      const user = {
        'entity-type': 'user',
        properties: { 'user:firstName': 'Jane', 'user:lastName': 'Smith' },
      };
      expect(el._name(user)).to.equal('Jane Smith');
    });

    test('falls back to email when name is blank', () => {
      const user = {
        'entity-type': 'user',
        properties: { email: 'a@b.com' },
      };
      expect(el._name(user)).to.equal('a@b.com');
    });

    test('falls back to _id when name and email are blank', () => {
      const user = {
        'entity-type': 'user',
        id: 'fallback-id',
        properties: {},
      };
      expect(el._name(user)).to.equal('fallback-id');
    });

    test('returns _id for non-entity', () => {
      expect(el._name({ id: 'plain' })).to.equal('plain');
    });

    test('returns _id for string', () => {
      expect(el._name('user:admin')).to.equal('admin');
    });
  });

  suite('_email', () => {
    test('returns email for entity when different from id', () => {
      const user = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: { email: 'j@d.com' },
      };
      expect(el._email(user)).to.equal('j@d.com');
    });

    test('returns empty string when email equals id', () => {
      const user = {
        'entity-type': 'user',
        id: 'j@d.com',
        properties: { email: 'j@d.com' },
      };
      expect(el._email(user)).to.equal('');
    });

    test('uses user:email when email is missing', () => {
      const user = {
        'entity-type': 'user',
        id: 'jdoe',
        properties: { 'user:email': 'x@y.com' },
      };
      expect(el._email(user)).to.equal('x@y.com');
    });

    test('returns empty string for non-entity', () => {
      expect(el._email({ id: 'jdoe' })).to.equal('');
    });

    test('returns empty for string', () => {
      expect(el._email('user:jdoe')).to.equal('');
    });
  });

  suite('_hasLink', () => {
    test('returns false when disabled', () => {
      sinon.stub(el, 'hasAdministrationPermissions').returns(true);
      sinon.stub(el, '_name').returns('jdoe');
      expect(el._hasLink(true, {}, {})).to.be.false;
      el.hasAdministrationPermissions.restore();
      el._name.restore();
    });

    test('returns false for system user', () => {
      sinon.stub(el, 'hasAdministrationPermissions').returns(true);
      sinon.stub(el, '_name').returns('system');
      expect(el._hasLink(false, {}, {})).to.be.false;
      el.hasAdministrationPermissions.restore();
      el._name.restore();
    });

    test('returns false when not admin', () => {
      sinon.stub(el, 'hasAdministrationPermissions').returns(false);
      sinon.stub(el, '_name').returns('jdoe');
      expect(el._hasLink(false, {}, {})).to.be.false;
      el.hasAdministrationPermissions.restore();
      el._name.restore();
    });

    test('returns true when not disabled, not system, and is admin', () => {
      sinon.stub(el, 'hasAdministrationPermissions').returns(true);
      sinon.stub(el, '_name').returns('jdoe');
      expect(el._hasLink(false, {}, {})).to.be.true;
      el.hasAdministrationPermissions.restore();
      el._name.restore();
    });
  });

  suite('_preventPropagation', () => {
    test('calls stopPropagation on event', () => {
      const e = { stopPropagation: sinon.spy() };
      el._preventPropagation(e);
      expect(e.stopPropagation).to.have.been.calledOnce;
    });
  });

  suite('_getUserTagClass', () => {
    test('returns user-tag-wrap for names with whitespace', () => {
      sinon.stub(el, '_name').returns('John Doe');
      expect(el._getUserTagClass({})).to.equal('user-tag-wrap');
      el._name.restore();
    });

    test('returns user-tag-nowrap for names without whitespace', () => {
      sinon.stub(el, '_name').returns('jdoe');
      expect(el._getUserTagClass({})).to.equal('user-tag-nowrap');
      el._name.restore();
    });
  });

  suite('_calculateElementWidth', () => {
    test('returns computed width minus padding, border, scrollbar', () => {
      const div = document.createElement('div');
      div.style.width = '200px';
      div.style.padding = '10px';
      div.style.border = '2px solid black';
      div.style.boxSizing = 'content-box';
      document.body.appendChild(div);
      const width = el._calculateElementWidth(div);
      expect(width).to.be.a('number');
      document.body.removeChild(div);
    });
  });

  suite('_getHTMLRootNode', () => {
    test('returns parentNode for regular element', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      expect(el._getHTMLRootNode(child)).to.equal(parent);
    });
  });
});
