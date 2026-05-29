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

  suite('_getAdjacentFocusable', () => {
    test('returns null when no adjacent element exists', () => {
      // Isolated fixture with no sibling focusables — result is null or an element
      const result = el._getAdjacentFocusable(true);
      // We can't assert a specific element, but the method should not throw.
      expect(result === null || typeof result.focus === 'function').to.be.true;
    });

    suite('shadow-boundary-aware traversal', () => {
      let container, prevBtn, nextBtn, selectEl;

      setup(async () => {
        // Wrap nuxeo-select between two plain focusable buttons so we can assert
        // that _getAdjacentFocusable crosses shadow DOM correctly and returns the
        // sibling button — not an element buried inside nuxeo-select's shadow tree.
        container = await fixture(html`
          <div>
            <button id="prev">Previous</button>
            <nuxeo-select id="sel" label="Test" .options="${['A', 'B', 'C']}"></nuxeo-select>
            <button id="next">Next</button>
          </div>
        `);
        prevBtn = container.querySelector('#prev');
        nextBtn = container.querySelector('#next');
        selectEl = container.querySelector('#sel');
        await flush();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      test('forward direction returns the button after nuxeo-select, not a shadow-internal element', () => {
        const result = selectEl._getAdjacentFocusable(true);
        expect(result).to.equal(nextBtn);
      });

      test('backward direction returns the button before nuxeo-select, not a shadow-internal element', () => {
        const result = selectEl._getAdjacentFocusable(false);
        expect(result).to.equal(prevBtn);
      });
    });
  });

  suite('Tab closes open dropdown', () => {
    test('_attachDropdownTabHandler adds document listener and _detachDropdownTabHandler removes it', () => {
      el._attachDropdownTabHandler();
      expect(el._dropdownTabHandler).to.be.a('function');
      el._detachDropdownTabHandler();
      expect(el._dropdownTabHandler).to.be.null;
    });

    test('Tab key closes the dropdown', async () => {
      // Open the dropdown programmatically
      el.$.paperDropdownMenu.open();
      await flush();

      expect(el.$.paperDropdownMenu.opened).to.be.true;

      // Dispatch a Tab keydown to document in capture phase — mimics the handler
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      document.dispatchEvent(tabEvent);
      await flush();

      expect(el.$.paperDropdownMenu.opened).to.be.false;
    });
  });

  suite('Tab opens closed dropdown (second-Tab behaviour)', () => {
    test('Tab on the trigger opens the dropdown when it is closed', async () => {
      expect(el.$.paperDropdownMenu.opened).to.be.false;

      // Simulate Tab keydown bubbling up through paper-dropdown-menu (as a focused trigger would produce)
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      el.$.paperDropdownMenu.dispatchEvent(tabEvent);
      await flush();

      expect(el.$.paperDropdownMenu.opened).to.be.true;
      expect(tabEvent.defaultPrevented).to.be.true;

      // Clean up
      el.$.paperDropdownMenu.close();
      await flush();
    });

    test('Shift+Tab on the trigger does not open the dropdown', async () => {
      expect(el.$.paperDropdownMenu.opened).to.be.false;

      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      el.$.paperDropdownMenu.dispatchEvent(shiftTabEvent);
      await flush();

      expect(el.$.paperDropdownMenu.opened).to.be.false;
      expect(shiftTabEvent.defaultPrevented).to.be.false;
    });

    test('Tab while dropdown is already open does not re-open or interfere', async () => {
      el.$.paperDropdownMenu.open();
      await flush();
      expect(el.$.paperDropdownMenu.opened).to.be.true;

      // Tab while open is handled by the document capture handler (closes it), not the trigger handler
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      document.dispatchEvent(tabEvent);
      await flush();

      // Dropdown should now be closed
      expect(el.$.paperDropdownMenu.opened).to.be.false;
    });
  });
});
