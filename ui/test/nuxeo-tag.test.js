/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.
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
import '../widgets/nuxeo-tag.js';

/** WCAG 2.1 AA 1.4.12 text spacing overrides. */
const TEXT_SPACING = 'line-height: 1.5; letter-spacing: 0.12em; word-spacing: 0.16em;';

suite('nuxeo-tag', () => {
  test('should return the element name', () => {
    expect(Nuxeo.Tag.is).to.equal('nuxeo-tag');
  });

  test('should not uppercase its content by default', () => {
    expect(Nuxeo.Tag.properties.uppercase.value).to.be.false;
  });

  suite('accessible text spacing', () => {
    test('inherits the line height so user overrides apply', async () => {
      const container = await fixture(html`
        <div style="line-height: 3;">
          <nuxeo-tag>a tag</nuxeo-tag>
        </div>
      `);
      const tag = container.querySelector('nuxeo-tag');
      const { fontSize, lineHeight } = getComputedStyle(tag);
      expect(lineHeight).to.not.equal('normal');
      expect(parseFloat(lineHeight)).to.be.closeTo(3 * parseFloat(fontSize), 1);
    });

    test('grows instead of clipping its label when text spacing is overridden', async () => {
      const container = await fixture(html`
        <div style="width: 120px;">
          <nuxeo-tag>a tag with a fairly long label</nuxeo-tag>
        </div>
      `);
      const tag = container.querySelector('nuxeo-tag');
      const height = tag.getBoundingClientRect().height;

      container.setAttribute('style', `width: 120px; ${TEXT_SPACING}`);
      expect(tag.getBoundingClientRect().height).to.be.above(height);
      expect(tag.scrollWidth).to.be.at.most(tag.clientWidth);
      expect(tag.scrollHeight).to.be.at.most(tag.clientHeight);
    });

    test('stays inside a container narrower than its label', async () => {
      const container = await fixture(html`
        <div style="width: 60px;">
          <nuxeo-tag>averylongunbreakabletaglabel</nuxeo-tag>
        </div>
      `);
      const tag = container.querySelector('nuxeo-tag');
      expect(tag.getBoundingClientRect().width).to.be.at.most(container.getBoundingClientRect().width);
      expect(tag.scrollWidth).to.be.at.most(tag.clientWidth);
    });
  });
});
