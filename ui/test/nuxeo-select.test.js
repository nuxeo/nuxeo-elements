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
import '../widgets/nuxeo-select.js';

suite('nuxeo-select', () => {
  let el;
  const waitForAriaSync = async () => {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  };

  setup(async () => {
    el = await fixture(html`
      <nuxeo-select label="Format" .options="${['HTML', 'Plain text', 'XML']}"></nuxeo-select>
    `);
    await flush();
    // Wait for the setTimeout(0) inside _syncAriaLabel to execute.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  suite('accessibility – outer label', () => {
    test('outer <label> has aria-hidden="true"', () => {
      const label = el.shadowRoot.querySelector('label');
      expect(label).to.not.be.null;
      expect(label.getAttribute('aria-hidden')).to.equal('true');
    });
  });

  suite('accessibility – aria-label on inner trigger', () => {
    function getPaperInput(element) {
      const pdm = element.$.paperDropdownMenu;
      return (pdm.$ && pdm.$.input) || (pdm.shadowRoot && pdm.shadowRoot.querySelector('paper-input'));
    }

    test('sets aria-label on paper-input from label property', () => {
      const paperInput = getPaperInput(el);
      expect(paperInput).to.not.be.null;
      expect(paperInput.getAttribute('aria-label')).to.equal('Format');
    });

    test('updates aria-label when label property changes', async () => {
      el.label = 'Updated Label';
      await new Promise((resolve) => setTimeout(resolve, 0));
      const paperInput = getPaperInput(el);
      expect(paperInput.getAttribute('aria-label')).to.equal('Updated Label');
    });

    test('host aria-label attribute takes precedence over label property', async () => {
      el.label = 'Label Property';
      el.setAttribute('aria-label', 'Host Aria Label');
      await waitForAriaSync();
      const paperInput = getPaperInput(el);
      expect(paperInput.getAttribute('aria-label')).to.equal('Host Aria Label');
    });

    test('updates aria-label when host aria-label attribute changes', async () => {
      el.setAttribute('aria-label', 'First Aria Label');
      await waitForAriaSync();

      let paperInput = getPaperInput(el);
      expect(paperInput.getAttribute('aria-label')).to.equal('First Aria Label');

      el.setAttribute('aria-label', 'Second Aria Label');
      await waitForAriaSync();

      paperInput = getPaperInput(el);
      expect(paperInput.getAttribute('aria-label')).to.equal('Second Aria Label');
    });

    test('ignores non aria-label attribute mutations', async () => {
      const syncSpy = sinon.spy(el, '_syncAriaLabel');

      el.setAttribute('data-test-attribute', 'x');
      await waitForAriaSync();

      expect(syncSpy).to.not.have.been.called;
      syncSpy.restore();
      el.removeAttribute('data-test-attribute');
    });

    test('removes aria-label when label is cleared', async () => {
      el.label = '';
      await new Promise((resolve) => setTimeout(resolve, 0));
      const paperInput = getPaperInput(el);
      expect(paperInput.hasAttribute('aria-label')).to.be.false;
    });

    test('sets aria-label on the native input element', () => {
      const pdm = el.$.paperDropdownMenu;
      const paperInput = (pdm.$ && pdm.$.input) || (pdm.shadowRoot && pdm.shadowRoot.querySelector('paper-input'));
      if (!paperInput) return; // skip if structure is unavailable in this env
      const nativeInput =
        (paperInput.shadowRoot && paperInput.shadowRoot.querySelector('input')) ||
        (paperInput.inputElement &&
          paperInput.inputElement.querySelector &&
          paperInput.inputElement.querySelector('input'));
      if (!nativeInput) return; // skip if structure is unavailable in this env
      expect(nativeInput.getAttribute('aria-label')).to.equal('Format');
    });
  });

  // WEBUI-482: the invalid/required state must be exposed on the focusable control, because
  // paper-dropdown-menu otherwise conveys it with colour and a thicker underline only.
  suite('accessibility – aria-invalid / aria-required on inner trigger', () => {
    test('mirrors the required flag onto the native input', async () => {
      const select = await fixture(html`
        <nuxeo-select label="Format" required .options="${['HTML', 'XML']}"></nuxeo-select>
      `);
      await flush();
      await waitForAriaSync();

      const nativeInput = select._getNativeInput();
      expect(nativeInput).to.not.be.null;
      expect(nativeInput.getAttribute('aria-required')).to.equal('true');
      expect(nativeInput.getAttribute('aria-invalid')).to.equal('false');
    });

    test('mirrors the invalid state and clears aria-required when optional', async () => {
      el.invalid = true;
      await waitForAriaSync();

      const nativeInput = el._getNativeInput();
      expect(nativeInput.getAttribute('aria-invalid')).to.equal('true');
      expect(nativeInput.hasAttribute('aria-required')).to.be.false;

      el.invalid = false;
      await waitForAriaSync();
      expect(nativeInput.getAttribute('aria-invalid')).to.equal('false');
    });

    test('returns silently when the trigger input cannot be found', () => {
      const saved = el.$.paperDropdownMenu;
      el.$.paperDropdownMenu = null;
      expect(() => el._applyAriaState()).to.not.throw();
      expect(() => el._applyAriaLabel()).to.not.throw();
      el.$.paperDropdownMenu = saved;
    });
  });

  suite('_computeAttrForSelected', () => {
    test('returns "option" when options array is provided', () => {
      expect(el._computeAttrForSelected(null, ['a', 'b'])).to.equal('option');
    });

    test('returns attrForSelected when no options array', () => {
      expect(el._computeAttrForSelected('myAttr', null)).to.equal('myAttr');
    });
  });

  suite('Tab closes open dropdown', () => {
    test('_attachDropdownTabHandler sets handler and _detachDropdownTabHandler removes it', () => {
      el._attachDropdownTabHandler();
      expect(el._dropdownTabHandler).to.be.a('function');
      el._detachDropdownTabHandler();
      expect(el._dropdownTabHandler).to.be.null;
      expect(el._dropdownTabOverlay).to.be.null;
    });

    test('uses document as fallback when the overlay is unavailable', () => {
      const pdm = el.$.paperDropdownMenu;
      const savedMenuButton = pdm.$.menuButton;
      pdm.$.menuButton = null;

      const addSpy = sinon.spy(document, 'addEventListener');
      const removeSpy = sinon.spy(document, 'removeEventListener');

      el._attachDropdownTabHandler();
      expect(el._dropdownTabHandler).to.be.a('function');
      expect(addSpy).to.have.been.calledWith('keydown', el._dropdownTabHandler, true);

      el._detachDropdownTabHandler();
      expect(el._dropdownTabHandler).to.be.null;
      expect(removeSpy).to.have.been.calledWith('keydown', sinon.match.func, true);

      pdm.$.menuButton = savedMenuButton;
      addSpy.restore();
      removeSpy.restore();
    });

    test('non-Tab key while dropdown is open does not close it', async () => {
      el.$.paperDropdownMenu.open();
      await flush();
      expect(el.$.paperDropdownMenu.opened).to.be.true;
      // A non-Tab key should cause the handler to return early, leaving the dropdown open.
      el._dropdownTabHandler(new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true }));
      await flush();
      expect(el.$.paperDropdownMenu.opened).to.be.true;
      el.$.paperDropdownMenu.close();
      await flush();
    });

    test('Tab key closes the dropdown and focuses the trigger', async () => {
      el.$.paperDropdownMenu.open();
      await flush();
      expect(el.$.paperDropdownMenu.opened).to.be.true;

      // Invoke the handler directly (it is set by paper-dropdown-open)
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      el._dropdownTabHandler(tabEvent);
      await flush();

      expect(el.$.paperDropdownMenu.opened).to.be.false;
      expect(tabEvent.defaultPrevented).to.be.true;
    });

    test('Shift+Tab also closes the dropdown', async () => {
      el.$.paperDropdownMenu.open();
      await flush();
      expect(el.$.paperDropdownMenu.opened).to.be.true;

      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      el._dropdownTabHandler(shiftTabEvent);
      await flush();

      expect(el.$.paperDropdownMenu.opened).to.be.false;
      expect(shiftTabEvent.defaultPrevented).to.be.true;
    });
  });

  suite('close()', () => {
    test('close() closes an open dropdown', async () => {
      el.$.paperDropdownMenu.open();
      await flush();
      expect(el.$.paperDropdownMenu.opened).to.be.true;
      el.close();
      await flush();
      expect(el.$.paperDropdownMenu.opened).to.be.false;
    });
  });

  suite('lifecycle – disconnectedCallback', () => {
    test('disconnectedCallback removes the Tab handler', async () => {
      const el2 = await fixture(
        html`
          <nuxeo-select label="Test" .options="${['A']}"></nuxeo-select>
        `,
      );
      await flush();
      // Arm the handler by opening the dropdown
      el2.$.paperDropdownMenu.open();
      await flush();
      expect(el2._dropdownTabHandler).to.be.a('function');
      // Disconnect el2 from the DOM (keeps the fixture wrapper intact for cleanup)
      el2.remove();
      expect(el2._dropdownTabHandler).to.be.null;
    });

    test('connectedCallback reuses existing observers when already present', () => {
      const resizeObserver = el._resizeObserver;
      const ariaObserver = el._ariaLabelObserver;

      const resizeObserveSpy = sinon.spy(resizeObserver, 'observe');
      const ariaObserveSpy = sinon.spy(ariaObserver, 'observe');

      el.connectedCallback();

      expect(el._resizeObserver).to.equal(resizeObserver);
      expect(el._ariaLabelObserver).to.equal(ariaObserver);
      expect(resizeObserveSpy).to.have.been.called;
      expect(ariaObserveSpy).to.have.been.called;

      resizeObserveSpy.restore();
      ariaObserveSpy.restore();
    });

    test('disconnectedCallback handles missing aria observer', () => {
      const disconnectSpy = sinon.spy(el, '_detachDropdownTabHandler');

      const savedObserver = el._ariaLabelObserver;
      el._ariaLabelObserver = null;
      el.disconnectedCallback();

      expect(disconnectSpy).to.have.been.calledOnce;

      // Keep element state valid for the fixture lifecycle.
      el._ariaLabelObserver = savedObserver;
      disconnectSpy.restore();
    });

    test('mutation callback ignores non aria-label attributes', async () => {
      const NativeMutationObserver = window.MutationObserver;
      let callback;

      try {
        window.MutationObserver = class {
          constructor(cb) {
            callback = cb;
          }

          observe() {}

          disconnect() {}

          takeRecords() {
            return [];
          }
        };

        const el2 = await fixture(html`
          <nuxeo-select label="Format" .options="${['HTML', 'Plain text', 'XML']}"></nuxeo-select>
        `);

        const syncSpy = sinon.spy(el2, '_syncAriaLabel');
        callback([{ attributeName: 'data-test-attribute' }]);

        expect(syncSpy).to.not.have.been.called;

        syncSpy.restore();
        el2.remove();
      } finally {
        window.MutationObserver = NativeMutationObserver;
      }
    });
  });

  // Defensive-fallback paths inside _applyAriaLabel() and _getValidity().
  suite('defensive paths', () => {
    test('_getValidity delegates to paper-dropdown-menu._getValidity()', () => {
      const stub = sinon.stub(el.$.paperDropdownMenu, '_getValidity').returns(true);
      expect(el._getValidity()).to.be.true;
      expect(stub).to.have.been.calledOnce;
      stub.restore();
    });

    test('_applyAriaLabel uses paper-input shadowRoot.querySelector fallback when other lookups fail', () => {
      const fakeNative = document.createElement('input');
      fakeNative.setAttribute('aria-labelledby', 'foo');
      const fakePaperInput = {
        setAttribute: () => {},
        removeAttribute: () => {},
        inputElement: null,
        $: { nativeInput: null },
        shadowRoot: { querySelector: (sel) => (sel === 'input' ? fakeNative : null) },
      };
      const savedPdm = el.$.paperDropdownMenu;
      el.$.paperDropdownMenu = {
        $: { input: fakePaperInput },
        shadowRoot: null,
      };
      el._applyAriaLabel();
      expect(fakeNative.getAttribute('aria-label')).to.equal('Format');
      expect(fakeNative.hasAttribute('aria-labelledby')).to.be.false;
      el.$.paperDropdownMenu = savedPdm;
    });

    test('_applyAriaLabel uses inputElement.querySelector fallback for native input', () => {
      const fakeNative = document.createElement('input');
      fakeNative.setAttribute('aria-labelledby', 'foo');
      const fakePaperInput = {
        setAttribute: () => {},
        removeAttribute: () => {},
        inputElement: {
          querySelector: (sel) => (sel === 'input' ? fakeNative : null),
        },
        $: { nativeInput: null },
        shadowRoot: null,
      };
      const savedPdm = el.$.paperDropdownMenu;
      el.$.paperDropdownMenu = {
        $: { input: fakePaperInput },
        shadowRoot: null,
      };
      el._applyAriaLabel();
      expect(fakeNative.getAttribute('aria-label')).to.equal('Format');
      expect(fakeNative.hasAttribute('aria-labelledby')).to.be.false;
      el.$.paperDropdownMenu = savedPdm;
    });
  });
});
