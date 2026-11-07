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

suite('nuxeo-tag', () => {
  test('should return the element name', () => {
    expect(Nuxeo.Tag.is).to.equal('nuxeo-tag');
  });

  test('should not uppercase its content by default', () => {
    expect(Nuxeo.Tag.properties.uppercase.value).to.be.false;
  });

  suite('accessible text spacing (WCAG 2.1 AA 1.4.12)', () => {
    test('should apply an inherited line height rather than resetting it', async () => {
      const container = await fixture(html`
        <div style="line-height: 3;">
          <nuxeo-tag>a tag</nuxeo-tag>
        </div>
      `);
      const tag = container.querySelector('nuxeo-tag');
      const { fontSize, lineHeight } = getComputedStyle(tag);
      expect(parseFloat(lineHeight)).to.be.closeTo(3 * parseFloat(fontSize), 1);
    });

    test('should size its padding relative to the text so it grows with it', async () => {
      const tag = await fixture(html`
        <nuxeo-tag>a tag</nuxeo-tag>
      `);
      const { fontSize, paddingTop, paddingBottom, paddingLeft, paddingRight } = getComputedStyle(tag);
      const em = parseFloat(fontSize);
      expect(parseFloat(paddingTop)).to.be.closeTo(0.4 * em, 0.5);
      expect(parseFloat(paddingBottom)).to.be.closeTo(0.4 * em, 0.5);
      expect(parseFloat(paddingLeft)).to.be.closeTo(0.6 * em, 0.5);
      expect(parseFloat(paddingRight)).to.be.closeTo(0.6 * em, 0.5);
    });

    test('should keep its pill shape when the inherited line height is small', async () => {
      const container = await fixture(html`
        <div style="line-height: 0.5;">
          <nuxeo-tag>a tag</nuxeo-tag>
        </div>
      `);
      const tag = container.querySelector('nuxeo-tag');
      const em = parseFloat(getComputedStyle(tag).fontSize);
      expect(tag.getBoundingClientRect().height).to.be.closeTo(1.55 * em, 0.5);
    });

    test('should grow taller when the line height is increased', async () => {
      const container = await fixture(html`
        <div>
          <nuxeo-tag>a tag</nuxeo-tag>
        </div>
      `);
      const tag = container.querySelector('nuxeo-tag');
      const height = tag.getBoundingClientRect().height;

      container.style.lineHeight = '2.5';
      expect(tag.getBoundingClientRect().height).to.be.above(height);
    });

    test('should include its padding in its own width', async () => {
      const tag = await fixture(html`
        <nuxeo-tag style="width: 100px;">a tag</nuxeo-tag>
      `);
      expect(tag.getBoundingClientRect().width).to.equal(100);
    });
  });
});
