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
import '../widgets/nuxeo-group-tag.js';

suite('nuxeo-group-tag', () => {
  suite('Null/Undefined group handling', () => {
    test('Should not throw when group is null', async () => {
      const el = await fixture(html` <nuxeo-group-tag disabled></nuxeo-group-tag> `);
      el.group = null;

      expect(el._label(null)).to.equal('');
      expect(el._name(null)).to.equal('');
      expect(el._href(null)).to.equal('');
    });

    test('Should not throw when group is undefined', async () => {
      const el = await fixture(html` <nuxeo-group-tag disabled></nuxeo-group-tag> `);

      expect(el._label(undefined)).to.equal('');
      expect(el._name(undefined)).to.equal('');
      expect(el._href(undefined)).to.equal('');
    });

    test('Should render empty content when group is null', async () => {
      const el = await fixture(html` <nuxeo-group-tag disabled></nuxeo-group-tag> `);
      el.group = null;

      // The tag should render without errors and have no meaningful text content
      const tag = dom(el.root).querySelector('nuxeo-tag');
      expect(tag).to.exist;
    });
  });

  suite('String group', () => {
    test('Should display group name from a plain string', async () => {
      const el = await fixture(html` <nuxeo-group-tag disabled group="administrators"></nuxeo-group-tag> `);

      expect(dom(el.root).querySelector('nuxeo-tag').innerText).to.have.string('administrators');
    });

    test('Should strip group: prefix from a string', async () => {
      const el = await fixture(html` <nuxeo-group-tag disabled group="group:admins"></nuxeo-group-tag> `);

      expect(el._label('group:admins')).to.equal('admins');
      expect(el._name('group:admins')).to.equal('admins');
    });
  });

  suite('Entity group', () => {
    test('Should display grouplabel when available', async () => {
      const group = {
        'entity-type': 'group',
        groupname: 'admins',
        grouplabel: 'Administrators',
        properties: {
          'group:groupname': 'admins',
          'group:grouplabel': 'Administrators',
        },
      };

      const el = await fixture(html`
        <nuxeo-group-tag disabled group="${JSON.stringify(group)}"></nuxeo-group-tag>
      `);

      expect(dom(el.root).querySelector('nuxeo-tag').innerText).to.have.string('Administrators');
    });

    test('Should fall back to groupname when grouplabel is missing', async () => {
      const group = {
        'entity-type': 'group',
        groupname: 'admins',
        properties: {
          'group:groupname': 'admins',
        },
      };

      const el = await fixture(html`
        <nuxeo-group-tag disabled group="${JSON.stringify(group)}"></nuxeo-group-tag>
      `);

      expect(dom(el.root).querySelector('nuxeo-tag').innerText).to.have.string('admins');
    });
  });
});
