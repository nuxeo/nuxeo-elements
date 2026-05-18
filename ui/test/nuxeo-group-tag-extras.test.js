/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-group-tag.js';

suite('nuxeo-group-tag extras', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-group-tag></nuxeo-group-tag>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.GroupTag.is).to.equal('nuxeo-group-tag');
  });

  test('should have default property values', () => {
    expect(Nuxeo.GroupTag.properties.disabled.value).to.be.false;
  });

  suite('_isEntity', () => {
    test('returns truthy for group entity', () => {
      expect(el._isEntity({ 'entity-type': 'group' })).to.be.ok;
    });

    test('returns truthy for document entity with type=group', () => {
      expect(el._isEntity({ 'entity-type': 'document', type: 'group' })).to.be.ok;
    });

    test('returns falsy for unrelated entity types', () => {
      expect(el._isEntity({ 'entity-type': 'document', type: 'File' })).to.not.be.ok;
    });

    test('returns falsy when entity-type is missing', () => {
      expect(el._isEntity({})).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(el._isEntity(null)).to.not.be.ok;
    });
  });

  suite('_name', () => {
    test('returns groupname for entity with top-level groupname', () => {
      expect(el._name({ 'entity-type': 'group', groupname: 'admins' })).to.equal('admins');
    });

    test('returns groupname from properties for entity', () => {
      expect(el._name({ 'entity-type': 'group', properties: { 'group:groupname': 'g1' } })).to.equal('g1');
    });

    test('strips prefix when group object has .name', () => {
      expect(el._name({ name: 'group:editors' })).to.equal('editors');
    });

    test('strips prefix when group is a string', () => {
      expect(el._name('group:viewers')).to.equal('viewers');
    });
  });

  suite('_label', () => {
    test('returns top-level grouplabel for entity', () => {
      expect(el._label({ 'entity-type': 'group', grouplabel: 'Admins', groupname: 'admins' })).to.equal('Admins');
    });

    test('returns grouplabel from properties for entity', () => {
      expect(
        el._label({
          'entity-type': 'group',
          groupname: 'g',
          properties: { 'group:grouplabel': 'Group One' },
        }),
      ).to.equal('Group One');
    });

    test('falls back to _name when entity has no label', () => {
      expect(
        el._label({
          'entity-type': 'group',
          groupname: 'plainName',
          properties: {},
        }),
      ).to.equal('plainName');
    });

    test('strips prefix when group object has .label', () => {
      expect(el._label({ label: 'group:Editors' })).to.equal('Editors');
    });

    test('strips prefix when group is a string', () => {
      expect(el._label('group:Viewers')).to.equal('Viewers');
    });
  });

  suite('_href', () => {
    test('delegates to urlFor with group name', () => {
      const stub = sinon.stub().returns('/url/admins');
      Object.defineProperty(el, 'urlFor', { value: stub, writable: true, configurable: true });
      const href = el._href({ 'entity-type': 'group', groupname: 'admins' });
      expect(stub).to.have.been.calledWith('group', 'admins');
      expect(href).to.equal('/url/admins');
    });
  });

  suite('_preventPropagation', () => {
    test('calls stopPropagation on event', () => {
      const event = { stopPropagation: sinon.spy() };
      el._preventPropagation(event);
      expect(event.stopPropagation).to.have.been.called;
    });
  });

  test('renders label for entity group with link enabled', async () => {
    const group = { 'entity-type': 'group', groupname: 'admins', grouplabel: 'Administrators' };
    const tag = await fixture(html`
      <nuxeo-group-tag disabled .group="${group}"></nuxeo-group-tag>
    `);
    expect(tag.shadowRoot.innerHTML).to.include('Administrators');
  });

  test('renders disabled label without link', async () => {
    const group = { 'entity-type': 'group', groupname: 'admins', grouplabel: 'Administrators' };
    const tag = await fixture(html`
      <nuxeo-group-tag disabled .group="${group}"></nuxeo-group-tag>
    `);
    expect(tag.shadowRoot.innerHTML).to.include('Administrators');
  });
});
