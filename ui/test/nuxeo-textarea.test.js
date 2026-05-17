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

import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-textarea.js';

// Wait one task so the setTimeout(..., 0) used inside _syncNativeTextareaAriaLabel
// has fired and the inner native <textarea> has been updated.
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

function getPaperTextarea(el) {
  return el.$.paperTextarea;
}

function getNativeTextarea(el) {
  const paperTextarea = getPaperTextarea(el);
  return (
    (paperTextarea.shadowRoot && paperTextarea.shadowRoot.querySelector('textarea')) ||
    (paperTextarea.$ && paperTextarea.$.input && paperTextarea.$.input.textarea)
  );
}

// Covers the staged accessible-name work in ui/widgets/nuxeo-textarea.js:
//   - new _computeAriaLabel(label, placeholder) helper
//   - aria-label binding on the wrapping paper-textarea
//   - _syncNativeTextareaAriaLabel() also setting aria-label on the inner
//     <textarea> and stripping the paper-textarea-supplied aria-labelledby that
//     would otherwise override our aria-label.
//   - label/placeholder observers re-sync the aria-label when they change.
suite('nuxeo-textarea accessibility', () => {
  suite('_computeAriaLabel', () => {
    let el;

    setup(async () => {
      el = await fixture(html`
        <nuxeo-textarea></nuxeo-textarea>
      `);
    });

    test('returns the label when present', () => {
      expect(el._computeAriaLabel('Description', '')).to.equal('Description');
    });

    test('falls back to the placeholder when the label is empty', () => {
      expect(el._computeAriaLabel('', 'Type here')).to.equal('Type here');
    });

    test('returns null when both label and placeholder are empty', () => {
      expect(el._computeAriaLabel('', '')).to.be.null;
      expect(el._computeAriaLabel(null, null)).to.be.null;
      expect(el._computeAriaLabel(undefined, undefined)).to.be.null;
    });

    test('trims whitespace from label and placeholder', () => {
      expect(el._computeAriaLabel('  Label  ', '')).to.equal('Label');
      expect(el._computeAriaLabel('   ', '  Placeholder  ')).to.equal('Placeholder');
      expect(el._computeAriaLabel('   ', '   ')).to.be.null;
    });
  });

  suite('aria-label binding', () => {
    test('sets aria-label on the paper-textarea and the native textarea from label', async () => {
      const el = await fixture(html`
        <nuxeo-textarea label="Description"></nuxeo-textarea>
      `);
      await flush();
      await tick();

      expect(getPaperTextarea(el).getAttribute('aria-label')).to.equal('Description');
      const nativeTextarea = getNativeTextarea(el);
      expect(nativeTextarea).to.not.be.null;
      expect(nativeTextarea.getAttribute('aria-label')).to.equal('Description');
    });

    test('falls back to placeholder when label is missing', async () => {
      const el = await fixture(html`
        <nuxeo-textarea placeholder="Type here"></nuxeo-textarea>
      `);
      await flush();
      await tick();

      expect(getPaperTextarea(el).getAttribute('aria-label')).to.equal('Type here');
      expect(getNativeTextarea(el).getAttribute('aria-label')).to.equal('Type here');
    });

    test('removes the paper-textarea-injected aria-labelledby from the native textarea so aria-label wins', async () => {
      const el = await fixture(html`
        <nuxeo-textarea label="Description"></nuxeo-textarea>
      `);
      await flush();
      await tick();

      expect(getNativeTextarea(el).hasAttribute('aria-labelledby')).to.be.false;
    });
  });

  suite('observers re-sync the aria-label', () => {
    test('changing the label updates aria-label', async () => {
      const el = await fixture(html`
        <nuxeo-textarea label="Initial"></nuxeo-textarea>
      `);
      await flush();
      await tick();
      expect(getNativeTextarea(el).getAttribute('aria-label')).to.equal('Initial');

      el.label = 'Updated';
      await flush();
      await tick();

      expect(getPaperTextarea(el).getAttribute('aria-label')).to.equal('Updated');
      expect(getNativeTextarea(el).getAttribute('aria-label')).to.equal('Updated');
    });

    test('clearing both label and placeholder removes aria-label', async () => {
      const el = await fixture(html`
        <nuxeo-textarea label="Initial"></nuxeo-textarea>
      `);
      await flush();
      await tick();

      el.label = '';
      el.placeholder = '';
      await flush();
      await tick();

      expect(getPaperTextarea(el).hasAttribute('aria-label')).to.be.false;
      expect(getNativeTextarea(el).hasAttribute('aria-label')).to.be.false;
    });

    test('changing the placeholder updates aria-label when label is empty', async () => {
      const el = await fixture(html`
        <nuxeo-textarea placeholder="First"></nuxeo-textarea>
      `);
      await flush();
      await tick();
      expect(getNativeTextarea(el).getAttribute('aria-label')).to.equal('First');

      el.placeholder = 'Second';
      await flush();
      await tick();

      expect(getNativeTextarea(el).getAttribute('aria-label')).to.equal('Second');
    });
  });
});
