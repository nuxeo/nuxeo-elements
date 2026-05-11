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
import { fixture, html, flush } from '@nuxeo/testing-helpers';
import { IronOverlayManager } from '@polymer/iron-overlay-behavior/iron-overlay-manager.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '../widgets/nuxeo-dialog.js';

function waitForOpen(dialog) {
  return new Promise((resolve) => {
    dialog.addEventListener('iron-overlay-opened', () => resolve(), { once: true });
    dialog.opened = true;
  });
}

function waitForClose(dialog) {
  return new Promise((resolve) => {
    dialog.addEventListener('iron-overlay-closed', () => resolve(), { once: true });
    dialog.opened = false;
  });
}

function pressTab(shiftKey = false) {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  document.dispatchEvent(event);
  return event;
}

suite('nuxeo-dialog', () => {
  let dialog;

  teardown(() => {
    if (dialog) {
      // Clean up custom focus-trap state synchronously while dialog is still in DOM.
      // Do NOT set dialog.opened = false here — that triggers Polymer's async observer
      // (_openedModalChanged), which can race with fixture() cleanup and leave
      // IronOverlayManager in a corrupt state where the next dialog's open is queued forever.
      if (dialog._inertApplied) {
        dialog._setBackgroundInert(false);
        dialog._inertApplied = false;
      }
      document.removeEventListener('keydown', dialog._boundTrapTab, true);
      dialog.removeAttribute('aria-modal');
    }
    // Force-clear all overlays from IronOverlayManager so the next test's
    // waitForOpen is not blocked by stale overlay state.
    while (IronOverlayManager._overlays && IronOverlayManager._overlays.length) {
      IronOverlayManager.removeOverlay(IronOverlayManager._overlays[0]);
    }
    // Safety net: clear any stale inert flags
    Array.from(document.body.children).forEach((child) => {
      if (child.__nuxeoDialogInertCount) {
        child.removeAttribute('inert');
        delete child.__nuxeoDialogInertCount;
        delete child.__nuxeoDialogWasInert;
      }
    });
  });

  suite('basic', () => {
    setup(async () => {
      dialog = await fixture(html`
        <nuxeo-dialog>
          <p>Dialog content</p>
        </nuxeo-dialog>
      `);
    });

    test('should be defined', () => {
      expect(dialog).to.exist;
      expect(dialog.tagName.toLowerCase()).to.equal('nuxeo-dialog');
    });

    test('should default opened to false', () => {
      expect(dialog.opened).to.be.false;
    });

    test('should default reparent to false', () => {
      expect(dialog.reparent).to.be.false;
    });
  });

  suite('aria-modal', () => {
    setup(async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <p>Modal content</p>
        </nuxeo-dialog>
      `);
    });

    test('should set aria-modal when opened as modal', async () => {
      await waitForOpen(dialog);
      expect(dialog.getAttribute('aria-modal')).to.equal('true');
    });

    test('should remove aria-modal when closed', async () => {
      await waitForOpen(dialog);
      expect(dialog.getAttribute('aria-modal')).to.equal('true');
      await waitForClose(dialog);
      expect(dialog.hasAttribute('aria-modal')).to.be.false;
    });

    test('should remove aria-modal when modal is toggled off while open', async () => {
      await waitForOpen(dialog);
      expect(dialog.getAttribute('aria-modal')).to.equal('true');
      dialog.modal = false;
      await flush();
      expect(dialog.hasAttribute('aria-modal')).to.be.false;
    });

    test('should set aria-modal for withBackdrop dialogs', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog with-backdrop>
          <p>Backdrop content</p>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      expect(dialog.getAttribute('aria-modal')).to.equal('true');
    });

    test('should remove aria-modal when withBackdrop dialog is closed', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog with-backdrop>
          <p>Backdrop content</p>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      expect(dialog.getAttribute('aria-modal')).to.equal('true');
      await waitForClose(dialog);
      expect(dialog.hasAttribute('aria-modal')).to.be.false;
    });
  });

  suite('_containsDeepFocus', () => {
    test('should return true when focus is inside the dialog', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="btn">OK</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      dialog.querySelector('#btn').focus();
      expect(dialog._containsDeepFocus()).to.be.true;
    });

    test('should return false when focus is outside the dialog', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog>
          <button id="btn">OK</button>
        </nuxeo-dialog>
      `);
      // Don't open as modal to avoid inert on siblings
      document.body.focus();
      expect(dialog._containsDeepFocus()).to.be.false;
    });
  });

  suite('_onCaptureTab', () => {
    setup(async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button>OK</button>
        </nuxeo-dialog>
      `);
    });

    test('should be a no-op', () => {
      // _onCaptureTab should not throw and should return undefined
      expect(dialog._onCaptureTab()).to.be.undefined;
    });
  });

  suite('_getDeepActiveElement', () => {
    setup(async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <input id="testInput" type="text" />
        </nuxeo-dialog>
      `);
    });

    test('should return the currently focused element', async () => {
      await waitForOpen(dialog);
      const input = dialog.querySelector('#testInput');
      input.focus();
      const active = dialog._getDeepActiveElement();
      expect(active).to.equal(input);
    });
  });

  suite('_getFocusableElements', () => {
    test('should find buttons, inputs, selects, textareas, and links', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="btn">Click</button>
          <input id="inp" type="text" />
          <select id="sel">
            <option>A</option>
          </select>
          <textarea id="ta"></textarea>
          <a id="lnk" href="#">Link</a>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const focusables = dialog._getFocusableElements();
      const ids = focusables.map((el) => el.id);
      expect(ids).to.include('btn');
      expect(ids).to.include('inp');
      expect(ids).to.include('sel');
      expect(ids).to.include('ta');
      expect(ids).to.include('lnk');
    });

    test('should exclude disabled elements', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="enabled">OK</button>
          <button id="disabled" disabled>No</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const focusables = dialog._getFocusableElements();
      const ids = focusables.map((el) => el.id);
      expect(ids).to.include('enabled');
      expect(ids).to.not.include('disabled');
    });

    test('should exclude elements with tabindex=-1', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="focusable">OK</button>
          <div id="notfocusable" tabindex="-1">Skip</div>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const focusables = dialog._getFocusableElements();
      const ids = focusables.map((el) => el.id);
      expect(ids).to.include('focusable');
      expect(ids).to.not.include('notfocusable');
    });

    test('should include elements with tabindex=0', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <div id="tabbable" tabindex="0">Focusable div</div>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const focusables = dialog._getFocusableElements();
      const ids = focusables.map((el) => el.id);
      expect(ids).to.include('tabbable');
    });

    test('should exclude hidden inputs', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <input id="visible" type="text" />
          <input id="hidden" type="hidden" />
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const focusables = dialog._getFocusableElements();
      const ids = focusables.map((el) => el.id);
      expect(ids).to.include('visible');
      expect(ids).to.not.include('hidden');
    });

    test('should exclude elements with visibility hidden', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="visibleBtn">Visible</button>
          <button id="hiddenBtn" style="visibility: hidden">Hidden</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const focusables = dialog._getFocusableElements();
      const ids = focusables.map((el) => el.id);
      expect(ids).to.include('visibleBtn');
      expect(ids).to.not.include('hiddenBtn');
    });

    test('should return empty array when no focusable elements exist', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <p>No focusable elements</p>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const focusables = dialog._getFocusableElements();
      expect(focusables).to.be.an('array').that.is.empty;
    });
  });

  suite('_trapTab', () => {
    test('should ignore non-Tab keys', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="btn1">A</button>
          <button id="btn2">B</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      dialog._trapTab(event);
      expect(event.defaultPrevented).to.be.false;
    });

    test('should ignore Tab when dialog is not opened', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button>A</button>
        </nuxeo-dialog>
      `);
      // dialog is not opened
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      dialog._trapTab(event);
      expect(event.defaultPrevented).to.be.false;
    });

    test('should ignore Tab when dialog is not modal and not withBackdrop', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog>
          <button>A</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      dialog._trapTab(event);
      expect(event.defaultPrevented).to.be.false;
    });

    test('should wrap focus to first element when Tab at last element', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="first">First</button>
          <button id="last">Last</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const last = dialog.querySelector('#last');
      const first = dialog.querySelector('#first');
      last.focus();
      await flush();
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      dialog._trapTab(event);
      expect(event.defaultPrevented).to.be.true;
      expect(dialog._getDeepActiveElement()).to.equal(first);
    });

    test('should wrap focus to last element when Shift+Tab at first element', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="first">First</button>
          <button id="last">Last</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const first = dialog.querySelector('#first');
      const last = dialog.querySelector('#last');
      first.focus();
      await flush();
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
      dialog._trapTab(event);
      expect(event.defaultPrevented).to.be.true;
      expect(dialog._getDeepActiveElement()).to.equal(last);
    });

    test('should focus dialog itself when no focusable elements', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <p>No focusables</p>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const spy = sinon.spy(dialog, 'focus');
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      dialog._trapTab(event);
      expect(event.defaultPrevented).to.be.true;
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });
  });

  suite('_findContainingFocusableIndex', () => {
    test('should return -1 when element is not within any focusable', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="btn">OK</button>
          <p id="outside">Text</p>
        </nuxeo-dialog>
      `);
      const p = dialog.querySelector('#outside');
      const focusables = [dialog.querySelector('#btn')];
      expect(dialog._findContainingFocusableIndex(p, focusables)).to.equal(-1);
    });

    test('should find parent focusable index', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <div id="container" tabindex="0">
            <span id="child">Inside</span>
          </div>
        </nuxeo-dialog>
      `);
      const container = dialog.querySelector('#container');
      const child = dialog.querySelector('#child');
      const focusables = [container];
      expect(dialog._findContainingFocusableIndex(child, focusables)).to.equal(0);
    });
  });

  suite('_setBackgroundInert', () => {
    let sibling;

    setup(async () => {
      sibling = document.createElement('div');
      sibling.id = 'bg-sibling';
      document.body.appendChild(sibling);
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button>OK</button>
        </nuxeo-dialog>
      `);
    });

    teardown(() => {
      if (sibling && sibling.parentNode) {
        sibling.removeAttribute('inert');
        delete sibling.__nuxeoDialogInertCount;
        delete sibling.__nuxeoDialogWasInert;
        sibling.parentNode.removeChild(sibling);
      }
    });

    test('should set inert on sibling elements', () => {
      dialog._setBackgroundInert(true);
      expect(sibling.hasAttribute('inert')).to.be.true;
      expect(sibling.__nuxeoDialogInertCount).to.equal(1);
    });

    test('should remove inert from sibling elements', () => {
      dialog._setBackgroundInert(true);
      expect(sibling.hasAttribute('inert')).to.be.true;
      dialog._setBackgroundInert(false);
      expect(sibling.hasAttribute('inert')).to.be.false;
      expect(sibling.__nuxeoDialogInertCount).to.be.undefined;
    });

    test('should not set inert on the dialog itself', () => {
      dialog._setBackgroundInert(true);
      expect(dialog.hasAttribute('inert')).to.be.false;
    });

    test('should not remove inert from elements that were already inert before the dialog', () => {
      const externalInert = document.createElement('div');
      externalInert.id = 'external-inert';
      externalInert.setAttribute('inert', '');
      document.body.appendChild(externalInert);

      dialog._setBackgroundInert(true);
      dialog._setBackgroundInert(false);

      // The externally-set inert should remain because the element was already inert
      expect(externalInert.hasAttribute('inert')).to.be.true;

      externalInert.parentNode.removeChild(externalInert);
    });

    test('should handle stacked dialogs with ref-counting', async () => {
      const dialog2 = await fixture(html`
        <nuxeo-dialog modal>
          <button>OK2</button>
        </nuxeo-dialog>
      `);

      // First dialog sets inert
      dialog._setBackgroundInert(true);
      expect(sibling.hasAttribute('inert')).to.be.true;
      expect(sibling.__nuxeoDialogInertCount).to.equal(1);

      // Second dialog also sets inert — ref count goes to 2
      dialog2._setBackgroundInert(true);
      expect(sibling.__nuxeoDialogInertCount).to.equal(2);

      // First dialog clears inert — ref count drops to 1, inert stays
      dialog._setBackgroundInert(false);
      expect(sibling.hasAttribute('inert')).to.be.true;
      expect(sibling.__nuxeoDialogInertCount).to.equal(1);

      // Second dialog clears inert — ref count drops to 0, inert removed
      dialog2._setBackgroundInert(false);
      expect(sibling.hasAttribute('inert')).to.be.false;
      expect(sibling.__nuxeoDialogInertCount).to.be.undefined;
    });
  });

  suite('focus management on open', () => {
    // These tests call _opened() directly instead of using waitForOpen to avoid
    // IronOverlayBehavior lifecycle issues where opening a modal dialog with autofocus
    // corrupts IronOverlayManager state, preventing subsequent overlays from opening.

    test('should focus element with autofocus attribute', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="btn1">First</button>
          <button id="btn2" autofocus>Focused</button>
        </nuxeo-dialog>
      `);
      // Make dialog visible and focusable without going through IronOverlayBehavior
      dialog.style.display = '';
      dialog.setAttribute('tabindex', '-1');
      // Set opened in Polymer's internal data store to satisfy the afterNextRender guard
      // without triggering IronOverlayBehavior's _openedChanged observer
      dialog.__data.opened = true;
      dialog._opened({ target: dialog });
      // Wait for afterNextRender to complete
      await new Promise((resolve) => afterNextRender(dialog, resolve));
      expect(dialog._getDeepActiveElement()).to.equal(dialog.querySelector('#btn2'));
    });

    test('should focus first focusable when no autofocus', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="btn1">First</button>
          <button id="btn2">Second</button>
        </nuxeo-dialog>
      `);
      dialog.style.display = '';
      dialog.setAttribute('tabindex', '-1');
      // Set opened in Polymer's internal data store to satisfy the afterNextRender guard
      // without triggering IronOverlayBehavior's _openedChanged observer
      dialog.__data.opened = true;
      dialog._opened({ target: dialog });
      // Wait for afterNextRender to complete
      await new Promise((resolve) => afterNextRender(dialog, resolve));
      expect(dialog._getDeepActiveElement()).to.equal(dialog.querySelector('#btn1'));
    });
  });

  suite('focus trap lifecycle', () => {
    test('should register keydown listener when opened as modal', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="btn1">A</button>
          <button id="btn2">B</button>
        </nuxeo-dialog>
      `);
      const addSpy = sinon.spy(document, 'addEventListener');
      await waitForOpen(dialog);
      expect(addSpy.calledWith('keydown', dialog._boundTrapTab, true)).to.be.true;
      addSpy.restore();
    });

    test('should remove keydown listener when closed', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button>OK</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const removeSpy = sinon.spy(document, 'removeEventListener');
      await waitForClose(dialog);
      expect(removeSpy.calledWith('keydown', dialog._boundTrapTab, true)).to.be.true;
      removeSpy.restore();
    });
  });

  suite('withBackdrop dialog', () => {
    test('should enable focus trapping for withBackdrop dialogs', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog with-backdrop>
          <button id="btn1">First</button>
          <button id="btn2">Last</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const last = dialog.querySelector('#btn2');
      const first = dialog.querySelector('#btn1');
      last.focus();
      await flush();
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      dialog._trapTab(event);
      expect(event.defaultPrevented).to.be.true;
      expect(dialog._getDeepActiveElement()).to.equal(first);
    });

    test('should disable focus trapping when closed', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog with-backdrop>
          <button>OK</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const removeSpy = sinon.spy(document, 'removeEventListener');
      await waitForClose(dialog);
      expect(removeSpy.calledWith('keydown', dialog._boundTrapTab, true)).to.be.true;
      removeSpy.restore();
    });
  });

  suite('_enableFocusTrap / _disableFocusTrap', () => {
    setup(async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button>OK</button>
        </nuxeo-dialog>
      `);
    });

    test('_enableFocusTrap should add keydown listener', () => {
      const addSpy = sinon.spy(document, 'addEventListener');
      dialog._enableFocusTrap(false);
      expect(addSpy).to.have.been.calledWith('keydown', dialog._boundTrapTab, true);
      addSpy.restore();
    });

    test('_enableFocusTrap should set inert when flag is true', () => {
      const inertSpy = sinon.spy(dialog, '_setBackgroundInert');
      dialog._enableFocusTrap(true);
      expect(inertSpy).to.have.been.calledWith(true);
      inertSpy.restore();
    });

    test('_enableFocusTrap should not apply inert twice (idempotent)', () => {
      dialog._enableFocusTrap(true);
      const inertSpy = sinon.spy(dialog, '_setBackgroundInert');
      dialog._enableFocusTrap(true);
      expect(inertSpy).to.not.have.been.called;
      inertSpy.restore();
    });

    test('_disableFocusTrap should remove keydown listener', () => {
      dialog._enableFocusTrap(false);
      const removeSpy = sinon.spy(document, 'removeEventListener');
      dialog._disableFocusTrap(false);
      expect(removeSpy).to.have.been.calledWith('keydown', dialog._boundTrapTab, true);
      removeSpy.restore();
    });

    test('_disableFocusTrap should clear inert when flag is true', () => {
      dialog._enableFocusTrap(true);
      const inertSpy = sinon.spy(dialog, '_setBackgroundInert');
      dialog._disableFocusTrap(true);
      expect(inertSpy).to.have.been.calledWith(false);
      inertSpy.restore();
    });

    test('_enableFocusTrap should prevent duplicate listeners', () => {
      const addSpy = sinon.spy(document, 'addEventListener');
      const removeSpy = sinon.spy(document, 'removeEventListener');
      dialog._enableFocusTrap(false);
      dialog._enableFocusTrap(false);
      // Should call removeEventListener before each addEventListener to prevent duplicates
      expect(removeSpy).to.have.been.calledWith('keydown', dialog._boundTrapTab, true);
      addSpy.restore();
      removeSpy.restore();
    });
  });

  suite('disconnectedCallback cleanup', () => {
    test('should remove keydown listener and clear inert on disconnect', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button>OK</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const removeSpy = sinon.spy(document, 'removeEventListener');
      const inertSpy = sinon.spy(dialog, '_setBackgroundInert');
      dialog.parentNode.removeChild(dialog);
      const keydownCalls = removeSpy.getCalls().filter((c) => c.args[0] === 'keydown');
      expect(keydownCalls.length).to.be.greaterThan(0);
      expect(inertSpy).to.have.been.calledWith(false);
      removeSpy.restore();
      inertSpy.restore();
    });
  });

  suite('Tab key integration via document dispatch', () => {
    test('should trap Tab key events dispatched on document', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="first">First</button>
          <button id="last">Last</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const last = dialog.querySelector('#last');
      last.focus();
      await flush();
      pressTab();
      // After pressing Tab at the last element, focus should wrap to first
      expect(dialog._getDeepActiveElement()).to.equal(dialog.querySelector('#first'));
    });

    test('should trap Shift+Tab key events dispatched on document', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="first">First</button>
          <button id="last">Last</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const first = dialog.querySelector('#first');
      first.focus();
      await flush();
      pressTab(true);
      // After pressing Shift+Tab at the first element, focus should wrap to last
      expect(dialog._getDeepActiveElement()).to.equal(dialog.querySelector('#last'));
    });
  });
});
