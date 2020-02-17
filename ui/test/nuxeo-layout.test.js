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
import { fixture, html, waitForEvent, waitChanged } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import '../nuxeo-layout.js';
import '../widgets/nuxeo-input.js';
/* eslint-disable no-unused-expressions */

// determine base module path (relies on @open-wc/webpack-import-meta-loader)
const { url } = import.meta;
const base = url.substring(0, url.lastIndexOf('/'));

// Export Polymer and PolymerElement for 1.x and 2.x compat
window.Polymer = Polymer;

suite.skip('<nuxeo-layout>', () => {
  test('layout not found', async () => {
    const layout = await fixture(
      html`
        <nuxeo-layout href="notfound.html"></nuxeo-layout>
      `,
    );
    await waitForEvent(layout, 'iron-resize');
    expect(layout.$$('nuxeo-error').hidden).to.be.false;
    expect(layout.element).to.be.undefined;
  });

  test('layout stamped with model', async () => {
    const layout = await fixture(html`
      <nuxeo-layout href="${base}/layouts/dummy-layout.html" model='{"text": "dummy"}'></nuxeo-layout>
    `);
    await waitChanged(layout, 'element');
    expect(layout.$$('nuxeo-error').hidden).to.be.true;
    expect(layout.element.localName).to.equal('dummy-layout');
    expect(layout.element.text).to.equal('dummy');
  });

  test('layout valid field invalid', async () => {
    const layout = await fixture(html`
      <nuxeo-layout href="${base}/dummy-layout.html" model='{"text": "valid"}'></nuxeo-layout>
    `);
    const validity = await layout.validate();
    expect(validity).to.equal(false);
  });

  test('layout valid field valid', async () => {
    const layout = await fixture(html`
      <nuxeo-layout href="${base}/dummy-layout.html" model='{"text": "valid", "required": "foo"}'></nuxeo-layout>
    `);
    const validity = await layout.validate();
    expect(validity).to.equal(true);
  });

  test('layout invalid field valid', async () => {
    const layout = await fixture(html`
      <nuxeo-layout href="${base}/dummy-layout.html" model='{"text": "invalid", "required": "foo"}'></nuxeo-layout>
    `);
    const validity = await layout.validate();
    expect(validity).to.equal(false);
  });

  test('layout invalid field invalid', async () => {
    const layout = await fixture(html`
      <nuxeo-layout href="${base}/dummy-layout.html" model='{"text": "invalid"}'></nuxeo-layout>
    `);
    const validity = await layout.validate();
    expect(validity).to.equal(false);
  });
});
