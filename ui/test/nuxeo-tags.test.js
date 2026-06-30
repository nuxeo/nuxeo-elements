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
import '../widgets/nuxeo-tags.js';

suite('nuxeo-tags', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-tags></nuxeo-tags>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.Tags.is).to.equal('nuxeo-tags');
  });

  test('should default type to "tag"', () => {
    expect(Nuxeo.Tags.properties.type.value).to.equal('tag');
  });

  suite('_type', () => {
    test('returns true when type matches', () => {
      el.type = 'user';
      expect(el._type('user')).to.be.true;
    });

    test('returns false when type does not match', () => {
      el.type = 'group';
      expect(el._type('user')).to.be.false;
    });
  });

  test('renders one tag per item', async () => {
    el.items = ['a', 'b', 'c'];
    await flush();
    const tags = el.shadowRoot.querySelectorAll('nuxeo-tag');
    expect(tags.length).to.equal(3);
  });

  test('renders user-tags when type is user', async () => {
    el.type = 'user';
    el.items = [{ 'entity-type': 'user', id: 'jdoe', properties: {} }];
    await flush();
    const userTags = el.shadowRoot.querySelectorAll('nuxeo-user-tag');
    expect(userTags.length).to.equal(1);
  });

  test('renders plain-object users with their id', async () => {
    el.type = 'user';
    el.items = [{ id: 'plain-user' }];
    await flush();
    const userTag = el.shadowRoot.querySelector('nuxeo-user-tag');
    expect(userTag._name(userTag.user)).to.equal('plain-user');
  });

  test('renders truncated user names when maxCharacters is set on the child tag', async () => {
    el.type = 'user';
    el.items = [{ id: 'verylongusername' }];
    await flush();

    const userTag = el.shadowRoot.querySelector('nuxeo-user-tag');
    userTag.maxCharacters = 4;
    await flush();

    expect(userTag._name(userTag.user)).to.equal('very...');
  });

  test('renders group-tags when type is group', async () => {
    el.type = 'group';
    el.items = [{ 'entity-type': 'group', groupname: 'admins', grouplabel: 'Admins', properties: {} }];
    await flush();
    const groupTags = el.shadowRoot.querySelectorAll('nuxeo-group-tag');
    expect(groupTags.length).to.equal(1);
  });
});
