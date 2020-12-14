/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

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
import { expect } from '@esm-bundle/chai';
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
