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
import '../widgets/nuxeo-input.js';

// Wait one task so the setTimeout(..., 0) used inside _syncNativeInputAriaLabel
// has fired and the inner native input has been updated.
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

function getPaperInput(el) {
  return el.$.paperInput;
}

function getNativeInput(el) {
  const paperInput = getPaperInput(el);
  return (
    (paperInput.inputElement && paperInput.inputElement._inputElement) ||
    (paperInput.inputElement &&
      paperInput.inputElement.querySelector &&
      paperInput.inputElement.querySelector('input')) ||
    (paperInput.shadowRoot && paperInput.shadowRoot.querySelector('input'))
  );
}

// Covers the staged accessible-name work in ui/widgets/nuxeo-input.js:
//   - new _computeAriaLabel(label, placeholder) helper
//   - aria-label binding on the wrapping paper-input
//   - _syncNativeInputAriaLabel() also setting aria-label on the native <input>
//     and stripping the paper-input-supplied aria-labelledby that would
//     otherwise override our aria-label.
//   - label/placeholder observers re-sync the aria-label when they change.
suite('nuxeo-input accessibility', () => {
  suite('_computeAriaLabel', () => {
    let el;

    setup(async () => {
      el = await fixture(html`
        <nuxeo-input></nuxeo-input>
      `);
    });

    test('returns the label when present', () => {
      expect(el._computeAriaLabel('First name', '')).to.equal('First name');
    });

    test('falls back to the placeholder when the label is empty', () => {
      expect(el._computeAriaLabel('', 'Enter your name')).to.equal('Enter your name');
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
    test('sets aria-label on the paper-input and the native input from label', async () => {
      const el = await fixture(html`
        <nuxeo-input label="Subject"></nuxeo-input>
      `);
      await flush();
      await tick();

      expect(getPaperInput(el).getAttribute('aria-label')).to.equal('Subject');
      const nativeInput = getNativeInput(el);
      expect(nativeInput).to.not.be.null;
      expect(nativeInput.getAttribute('aria-label')).to.equal('Subject');
    });

    test('falls back to placeholder when label is missing', async () => {
      const el = await fixture(html`
        <nuxeo-input placeholder="Type here"></nuxeo-input>
      `);
      await flush();
      await tick();

      expect(getPaperInput(el).getAttribute('aria-label')).to.equal('Type here');
      expect(getNativeInput(el).getAttribute('aria-label')).to.equal('Type here');
    });

    test('removes the paper-input-injected aria-labelledby from the native input so aria-label wins', async () => {
      const el = await fixture(html`
        <nuxeo-input label="Subject"></nuxeo-input>
      `);
      await flush();
      await tick();

      // paper-input would otherwise bind aria-labelledby to its own internal
      // (empty) label, masking our aria-label for assistive technologies.
      expect(getNativeInput(el).hasAttribute('aria-labelledby')).to.be.false;
    });
  });

  suite('observers re-sync the aria-label', () => {
    test('changing the label updates aria-label', async () => {
      const el = await fixture(html`
        <nuxeo-input label="Initial"></nuxeo-input>
      `);
      await flush();
      await tick();
      expect(getNativeInput(el).getAttribute('aria-label')).to.equal('Initial');

      el.label = 'Updated';
      await flush();
      await tick();

      expect(getPaperInput(el).getAttribute('aria-label')).to.equal('Updated');
      expect(getNativeInput(el).getAttribute('aria-label')).to.equal('Updated');
    });

    test('clearing both label and placeholder removes aria-label', async () => {
      const el = await fixture(html`
        <nuxeo-input label="Initial"></nuxeo-input>
      `);
      await flush();
      await tick();

      el.label = '';
      el.placeholder = '';
      await flush();
      await tick();

      expect(getPaperInput(el).hasAttribute('aria-label')).to.be.false;
      expect(getNativeInput(el).hasAttribute('aria-label')).to.be.false;
    });

    test('changing the placeholder updates aria-label when label is empty', async () => {
      const el = await fixture(html`
        <nuxeo-input placeholder="First"></nuxeo-input>
      `);
      await flush();
      await tick();
      expect(getNativeInput(el).getAttribute('aria-label')).to.equal('First');

      el.placeholder = 'Second';
      await flush();
      await tick();

      expect(getNativeInput(el).getAttribute('aria-label')).to.equal('Second');
    });
  });

  // Defensive-fallback paths inside _applyNativeInputAriaLabel(). These exercise
  // the early-return when paper-input is missing and the shadowRoot.querySelector
  // fallback used when iron-input's wrapped native input cannot be discovered
  // via inputElement._inputElement / paperInput.$.nativeInput / light-DOM query.
  suite('_applyNativeInputAriaLabel defensive paths', () => {
    test('returns silently when paper-input is not present', async () => {
      const el = await fixture(html`
        <nuxeo-input label="X"></nuxeo-input>
      `);
      await flush();
      await tick();
      const saved = el.$.paperInput;
      el.$.paperInput = null;
      expect(() => el._applyNativeInputAriaLabel()).to.not.throw();
      el.$.paperInput = saved;
    });

    test('uses paper-input shadowRoot.querySelector fallback when other lookups fail', async () => {
      const el = await fixture(html`
        <nuxeo-input label="Subject"></nuxeo-input>
      `);
      await flush();
      await tick();
      const saved = el.$.paperInput;
      const fakeNative = document.createElement('input');
      fakeNative.setAttribute('aria-labelledby', 'foo');
      el.$.paperInput = {
        setAttribute: () => {},
        removeAttribute: () => {},
        inputElement: null,
        $: { nativeInput: null },
        shadowRoot: { querySelector: (sel) => (sel === 'input' ? fakeNative : null) },
      };
      el._applyNativeInputAriaLabel();
      expect(fakeNative.getAttribute('aria-label')).to.equal('Subject');
      expect(fakeNative.hasAttribute('aria-labelledby')).to.be.false;
      el.$.paperInput = saved;
    });
  });
});

// Covers the per-field required message parity added in ui/widgets/nuxeo-input.js:
//   a required, empty input surfaces a default "required" message (like multivalued
//   widgets and dc:title), without ever clobbering a layout-supplied errorMessage.
suite('nuxeo-input _getValidity required message', () => {
  test('defaults a required error message when empty and clears it once a value is set', async () => {
    const el = await fixture(
      html`
        <nuxeo-input required></nuxeo-input>
      `,
    );
    el.value = '';
    expect(el._getValidity()).to.be.false;
    expect(el.errorMessage).to.be.ok;
    // providing a value clears the message we defaulted
    el.value = 'hello';
    expect(el._getValidity()).to.be.true;
    expect(el.errorMessage).to.equal('');
  });

  test('applies to numeric inputs as well', async () => {
    const el = await fixture(
      html`
        <nuxeo-input type="number" required></nuxeo-input>
      `,
    );
    el.value = '';
    expect(el._getValidity()).to.be.false;
    expect(el.errorMessage).to.be.ok;
  });

  test('never clobbers or clears a layout-supplied error message', async () => {
    const el = await fixture(
      html`
        <nuxeo-input required error-message="Custom error"></nuxeo-input>
      `,
    );
    el.value = '';
    expect(el._getValidity()).to.be.false;
    expect(el.errorMessage).to.equal('Custom error');
    // and it survives becoming valid again (only the defaulted message is cleared)
    el.value = 'hello';
    expect(el._getValidity()).to.be.true;
    expect(el.errorMessage).to.equal('Custom error');
  });

  test('does not set a required message when the field is not required', async () => {
    const el = await fixture(
      html`
        <nuxeo-input></nuxeo-input>
      `,
    );
    el.value = '';
    expect(el._getValidity()).to.be.true;
    expect(el.errorMessage || '').to.equal('');
  });
});

// Covers WEBUI-493: the `autocomplete` property declared in ui/widgets/nuxeo-input.js is
// forwarded to the rendered native <input> so a layout can identify the purpose of the field
// (WCAG 2.1 SC 1.3.5, technique H98).
suite('nuxeo-input autocomplete', () => {
  test('declares the property and defaults it to off', async () => {
    const el = await fixture(html`
      <nuxeo-input label="Email"></nuxeo-input>
    `);
    await flush();
    expect(el.autocomplete).to.equal('off');
    expect(getPaperInput(el).autocomplete).to.equal('off');
    expect(getNativeInput(el).getAttribute('autocomplete')).to.equal('off');
  });

  test('forwards a token configured on the element to the native input', async () => {
    const el = await fixture(html`
      <nuxeo-input label="Email" autocomplete="email"></nuxeo-input>
    `);
    await flush();
    expect(el.autocomplete).to.equal('email');
    expect(getNativeInput(el).getAttribute('autocomplete')).to.equal('email');
  });

  test('forwards a token set at runtime to the native input', async () => {
    const el = await fixture(html`
      <nuxeo-input label="Password" type="password"></nuxeo-input>
    `);
    await flush();
    el.autocomplete = 'current-password';
    await flush();
    expect(getNativeInput(el).getAttribute('autocomplete')).to.equal('current-password');
  });
});
