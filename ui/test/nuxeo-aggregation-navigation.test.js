/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

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
import { fixture, html, waitForEvent } from '@nuxeo/testing-helpers';
import '../nuxeo-aggregation/nuxeo-aggregation-navigation.js';

const buckets = [
  { key: 'a', docCount: 5 },
  { key: 'b', docCount: 10 },
  { key: 'c', docCount: 15 },
];

suite('nuxeo-aggregation-navigation', () => {
  let nav;

  setup(async () => {
    nav = await fixture(html`
      <div style="height: 200px;">
        <nuxeo-aggregation-navigation></nuxeo-aggregation-navigation>
      </div>
    `).then((wrapper) => wrapper.querySelector('nuxeo-aggregation-navigation'));
  });

  test('starts with sensible defaults', () => {
    expect(nav.granularity).to.equal(30);
    expect(nav.opacity).to.equal(0.85);
    expect(nav._cursorIndex).to.equal(0);
    expect(nav._cursorLabel).to.equal('');
  });

  test('renders one key per bucket and aggregates the count', () => {
    nav.buckets = buckets;
    expect(nav._count).to.equal(30);
    expect(nav._keys).to.have.lengthOf(3);
    expect(nav._keys.map((k) => k.name)).to.deep.equal(['a', 'b', 'c']);
    expect(nav._keys.map((k) => k.size)).to.deep.equal([5, 10, 15]);
  });

  test('hides itself when the buckets are empty', () => {
    nav.buckets = [];
    expect(nav._count).to.equal(0);
    expect(nav.style.opacity).to.equal('0');
  });

  test('exposes opacity when the bucket count is positive', () => {
    nav.buckets = buckets;
    expect(parseFloat(nav.style.opacity)).to.equal(0.85);
  });

  test('_label uses the i18n function on the host', () => {
    nav.i18n = (key) => `t:${key}`;
    expect(nav._label({ name: 'foo' })).to.equal('t:foo');
  });

  test('_color returns black/transparent based on visibility', () => {
    expect(nav._color(true)).to.equal('black');
    expect(nav._color(false)).to.equal('transparent');
  });

  test('_visibility toggles the cursor container', () => {
    nav._visibility(true);
    expect(nav.$.keys.style.visibility).to.equal('visible');
    expect(nav.style.background).to.contain('rgba(255, 255, 255');
    nav._visibility(false);
    expect(nav.$.keys.style.visibility).to.equal('hidden');
    expect(nav.style.background).to.equal('transparent');
  });

  test('_mouseOut hides the cursor', () => {
    nav.$.cursor.style.display = 'block';
    nav._mouseOut();
    expect(nav.$.cursor.style.display).to.equal('none');
  });

  test('_mouseMove updates cursor index/label and shows the cursor', () => {
    nav.buckets = buckets;
    nav._rect = { top: 0, left: 0, right: 0, bottom: 100, height: 100 };
    nav._count = 30;
    nav.i18n = (key) => key;
    nav._mouseMove({ y: 50, model: { key: { name: 'b' } } });
    expect(nav._cursorIndex).to.equal(15);
    expect(nav._cursorLabel).to.equal('b');
    expect(nav.$.cursor.style.display).to.equal('block');
    expect(nav.$.cursor.style.top).to.equal('50px');
  });

  test('_tap fires a scroll-to event with the current cursor index', async () => {
    nav._cursorIndex = 7;
    setTimeout(() => nav._tap(), 0);
    const event = await waitForEvent(nav, 'scroll-to');
    expect(event.detail.index).to.equal(7);
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });
});
