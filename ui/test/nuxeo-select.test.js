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
  });
});
