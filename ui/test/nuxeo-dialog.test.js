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
      document.removeEventListener('keydown', dialog._boundTrapTab, true);
      dialog.removeAttribute('aria-modal');
    }
    // Force-clear all overlays from IronOverlayManager so the next test's
    // waitForOpen is not blocked by stale overlay state.
    while (IronOverlayManager._overlays && IronOverlayManager._overlays.length) {
      IronOverlayManager.removeOverlay(IronOverlayManager._overlays[0]);
    }
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

    test('should descend into plain focusable containers without shadow DOM', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <div id="container" tabindex="0">
            <button id="innerBtn">Inner</button>
            <input id="innerInput" type="text" />
          </div>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const focusables = dialog._getFocusableElements();
      const ids = focusables.map((el) => el.id);
      // The container itself AND its children should be found
      expect(ids).to.include('container');
      expect(ids).to.include('innerBtn');
      expect(ids).to.include('innerInput');
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

    test('should pull focus into the modal on first Tab when focus is outside the dialog', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="first">First</button>
          <button id="last">Last</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      // Simulate a deep-link / page reload where the modal opens with focus still on the body
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
      document.body.focus();
      await flush();
      expect(dialog._containsDeepFocus()).to.be.false;
      const first = dialog.querySelector('#first');
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      dialog._trapTab(event);
      expect(event.defaultPrevented).to.be.true;
      expect(dialog._getDeepActiveElement()).to.equal(first);
    });

    test('should pull focus to last element on first Shift+Tab when focus is outside the dialog', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="first">First</button>
          <button id="last">Last</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
      document.body.focus();
      await flush();
      expect(dialog._containsDeepFocus()).to.be.false;
      const last = dialog.querySelector('#last');
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
      dialog._trapTab(event);
      expect(event.defaultPrevented).to.be.true;
      expect(dialog._getDeepActiveElement()).to.equal(last);
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
      dialog._enableFocusTrap();
      expect(addSpy).to.have.been.calledWith('keydown', dialog._boundTrapTab, true);
      expect(dialog._focusTrapEnabled).to.be.true;
      addSpy.restore();
    });

    test('_disableFocusTrap should remove keydown listener', () => {
      dialog._enableFocusTrap();
      const removeSpy = sinon.spy(document, 'removeEventListener');
      dialog._disableFocusTrap();
      expect(removeSpy).to.have.been.calledWith('keydown', dialog._boundTrapTab, true);
      expect(dialog._focusTrapEnabled).to.be.false;
      removeSpy.restore();
    });

    test('_enableFocusTrap should prevent duplicate listeners', () => {
      const addSpy = sinon.spy(document, 'addEventListener');
      const removeSpy = sinon.spy(document, 'removeEventListener');
      dialog._enableFocusTrap();
      dialog._enableFocusTrap();
      // Should call removeEventListener before each addEventListener to prevent duplicates
      expect(removeSpy).to.have.been.calledWith('keydown', dialog._boundTrapTab, true);
      addSpy.restore();
      removeSpy.restore();
    });
  });

  suite('disconnectedCallback cleanup', () => {
    test('should remove keydown listener on disconnect', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button>OK</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      const removeSpy = sinon.spy(document, 'removeEventListener');
      dialog.parentNode.removeChild(dialog);
      expect(removeSpy.calledWith('keydown', dialog._boundTrapTab, true)).to.be.true;
      removeSpy.restore();
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

  suite('child overlay interaction', () => {
    test('should not disable focus trap when a child overlay fires iron-overlay-closed', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="first">First</button>
          <button id="last">Last</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      await flush();

      // Simulate a child overlay (e.g., paper-dropdown-menu) firing iron-overlay-closed
      const childClosedEvent = new CustomEvent('iron-overlay-closed', { bubbles: true, composed: true });
      const childElement = dialog.querySelector('#first');
      childElement.dispatchEvent(childClosedEvent);
      await flush();

      // Focus trap should still be active
      expect(dialog._focusTrapEnabled).to.be.true;
      const first = dialog.querySelector('#first');
      first.focus();
      const event = pressTab(true);
      // Shift+Tab at first element should still wrap to last
      expect(event.defaultPrevented).to.be.true;
    });

    test('should not re-stamp template when a child overlay fires iron-overlay-opened', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="first">First</button>
          <button id="last">Last</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      await flush();

      // Simulate a child overlay (e.g., paper-dropdown-menu) firing iron-overlay-opened
      const childOpenedEvent = new CustomEvent('iron-overlay-opened', { bubbles: true, composed: true });
      const childElement = dialog.querySelector('#first');
      childElement.dispatchEvent(childOpenedEvent);
      await flush();

      // Focus trap should still be active (not re-triggered by child event)
      expect(dialog._focusTrapEnabled).to.be.true;
    });

    test('should still disable focus trap when dialog itself closes', async () => {
      dialog = await fixture(html`
        <nuxeo-dialog modal>
          <button id="first">First</button>
          <button id="last">Last</button>
        </nuxeo-dialog>
      `);
      await waitForOpen(dialog);
      await flush();
      expect(dialog._focusTrapEnabled).to.be.true;

      await waitForClose(dialog);
      await flush();
      expect(dialog._focusTrapEnabled).to.be.false;
    });
  });
});

suite('nuxeo-dialog extras', () => {
  suite('disconnectedCallback', () => {
    test('calls detached() when _observer is truthy', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._observer = {};
      const detachedStub = sinon.stub(el, 'detached');
      const clearSpy = sinon.spy(el, '_clear');
      el.disconnectedCallback();
      expect(detachedStub).to.have.been.calledOnce;
      expect(clearSpy).to.have.been.calledOnce;
      clearSpy.restore();
    });

    test('skips detached() when _observer is falsy', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._observer = null;
      sinon.stub(el, 'detached');
      el.disconnectedCallback();
      expect(el.detached).to.not.have.been.called;
    });

    test('always calls _clear on disconnect', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._observer = null;
      sinon.stub(el, 'detached');
      const clearSpy = sinon.spy(el, '_clear');
      el.disconnectedCallback();
      expect(clearSpy).to.have.been.calledOnce;
      clearSpy.restore();
    });
  });

  suite('_opened', () => {
    test('does not reparent backdrop when reparent=true but withBackdrop=false', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog reparent></nuxeo-dialog>
        `,
      );
      const parent = el.parentNode;
      const insertSpy = sinon.spy(parent, 'insertBefore');
      const fakeEvent = { target: { withBackdrop: false, parentNode: parent, backdropElement: null } };
      el._opened(fakeEvent);
      expect(insertSpy).to.not.have.been.called;
      insertSpy.restore();
    });

    test('does not reparent backdrop when reparent=false and not iOS', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      const parent = el.parentNode;
      const fakeBackdrop = document.createElement('div');
      parent.appendChild(fakeBackdrop);
      const insertSpy = sinon.spy(parent, 'insertBefore');
      const fakeEvent = {
        target: {
          withBackdrop: false,
          parentNode: parent,
          backdropElement: fakeBackdrop,
        },
      };
      el._opened(fakeEvent);
      expect(insertSpy).to.not.have.been.called;
      insertSpy.restore();
    });

    test('stamps template on first open when template exists', async () => {
      const el = await fixture(html`
        <nuxeo-dialog>
          <template><div id="stamped-content">Hello</div></template>
        </nuxeo-dialog>
      `);
      expect(el._instance).to.not.be.ok;
      const fakeEvent = {
        target: el,
      };
      el._opened(fakeEvent);
      expect(el._instance).to.be.ok;
    });

    test('does not re-stamp when _instance already exists', async () => {
      const el = await fixture(html`
        <nuxeo-dialog>
          <template><div>Hello</div></template>
        </nuxeo-dialog>
      `);
      const parent = el.parentNode;
      const fakeEvent = {
        target: {
          withBackdrop: false,
          parentNode: parent,
          backdropElement: document.createElement('div'),
        },
      };
      el._opened(fakeEvent);
      const firstInstance = el._instance;
      el._opened(fakeEvent);
      expect(el._instance).to.equal(firstInstance);
    });

    test('does nothing when no template is present and _instance is null', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      const parent = el.parentNode;
      const fakeEvent = {
        target: {
          withBackdrop: false,
          parentNode: parent,
          backdropElement: document.createElement('div'),
        },
      };
      el._opened(fakeEvent);
      expect(el._instance).to.not.be.ok;
    });

    test('skips templatize when _templatizerTemplate already set', async () => {
      const el = await fixture(html`
        <nuxeo-dialog>
          <template><div>Content</div></template>
        </nuxeo-dialog>
      `);
      const fakeEvent = {
        target: el,
      };
      el._opened(fakeEvent);
      const inst = el._instance;
      el._instance = null;
      el._opened(fakeEvent);
      expect(el._instance).to.be.ok;
      expect(el._instance).to.not.equal(inst);
    });
  });

  suite('_clear', () => {
    test('removes instance children and nullifies _instance', async () => {
      const el = await fixture(html`
        <nuxeo-dialog>
          <template><div>Hello</div></template>
        </nuxeo-dialog>
      `);
      const fakeEvent = {
        target: el,
      };
      el._opened(fakeEvent);
      expect(el._instance).to.be.ok;
      el._clear();
      expect(el._instance).to.be.null;
    });

    test('is a no-op when _instance is null', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._instance = null;
      expect(() => el._clear()).to.not.throw();
      expect(el._instance).to.be.null;
    });

    test('handles _instance with empty children array', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._instance = { children: [] };
      el._clear();
      expect(el._instance).to.be.null;
    });
  });

  suite('_forwardHostPropV2', () => {
    test('forwards prop to instance when _instance exists', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      const fakeInstance = { forwardHostProp: sinon.stub() };
      el._instance = fakeInstance;
      el._forwardHostPropV2('testProp', 42);
      expect(fakeInstance.forwardHostProp).to.have.been.calledWith('testProp', 42);
    });

    test('is a no-op when _instance is null', async () => {
      const el = await fixture(
        html`
          <nuxeo-dialog></nuxeo-dialog>
        `,
      );
      el._instance = null;
      expect(() => el._forwardHostPropV2('testProp', 42)).to.not.throw();
    });
  });

  suite('coverage: extra branches', () => {
    let dialog;

    teardown(() => {
      if (dialog) {
        document.removeEventListener('keydown', dialog._boundTrapTab, true);
        dialog.removeAttribute('aria-modal');
      }
      while (IronOverlayManager._overlays && IronOverlayManager._overlays.length) {
        IronOverlayManager.removeOverlay(IronOverlayManager._overlays[0]);
      }
    });

    suite('_opened branches', () => {
      test('does not enable focus trap for non-modal dialog without backdrop', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog>
            <button>OK</button>
          </nuxeo-dialog>
        `);
        // Invoke _opened directly to bypass IronOverlayBehavior; modal/withBackdrop are both false.
        dialog.__data.opened = true;
        dialog._opened({ target: dialog });
        await flush();
        expect(dialog.hasAttribute('aria-modal')).to.be.false;
        expect(dialog._focusTrapEnabled).to.not.equal(true);
      });
    });

    suite('_enableFocusTrap lazy binding', () => {
      test('lazily creates handlers when missing', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog>
            <button>OK</button>
          </nuxeo-dialog>
        `);
        dialog._boundTrapTab = null;
        dialog._enableFocusTrap();
        expect(dialog._boundTrapTab).to.be.a('function');
        // cleanup
        dialog._disableFocusTrap();
      });
    });

    suite('_trapTab edge cases', () => {
      test('does not preventDefault when focus is outside the dialog', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog modal>
            <button>OK</button>
          </nuxeo-dialog>
        `);
        dialog.modal = true;
        dialog.__data.opened = true;
        // Force _containsDeepFocus() false
        sinon.stub(dialog, '_containsDeepFocus').returns(false);
        const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        dialog._trapTab(ev);
        expect(ev.defaultPrevented).to.be.false;
        dialog._containsDeepFocus.restore();
      });

      test('does not preventDefault when Tab is in the middle of focus list', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog modal>
            <button id="a">A</button>
            <button id="b">B</button>
            <button id="c">C</button>
          </nuxeo-dialog>
        `);
        dialog.modal = true;
        dialog.__data.opened = true;
        const b = dialog.querySelector('#b');
        sinon.stub(dialog, '_containsDeepFocus').returns(true);
        sinon.stub(dialog, '_getDeepActiveElement').returns(b);
        sinon.stub(dialog, '_isVisible').returns(true);
        const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        dialog._trapTab(ev);
        expect(ev.defaultPrevented).to.be.false;
        dialog._containsDeepFocus.restore();
        dialog._getDeepActiveElement.restore();
        dialog._isVisible.restore();
      });

      test('does not preventDefault when Shift+Tab is in the middle of focus list', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog modal>
            <button id="a">A</button>
            <button id="b">B</button>
            <button id="c">C</button>
          </nuxeo-dialog>
        `);
        dialog.modal = true;
        dialog.__data.opened = true;
        const b = dialog.querySelector('#b');
        sinon.stub(dialog, '_containsDeepFocus').returns(true);
        sinon.stub(dialog, '_getDeepActiveElement').returns(b);
        sinon.stub(dialog, '_isVisible').returns(true);
        const ev = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
        dialog._trapTab(ev);
        expect(ev.defaultPrevented).to.be.false;
        dialog._containsDeepFocus.restore();
        dialog._getDeepActiveElement.restore();
        dialog._isVisible.restore();
      });

      test('focuses dialog and preventsDefault when no focusables exist', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog modal>
            <span>nothing</span>
          </nuxeo-dialog>
        `);
        dialog.modal = true;
        dialog.__data.opened = true;
        sinon.stub(dialog, '_containsDeepFocus').returns(true);
        const focusSpy = sinon.spy(dialog, 'focus');
        const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        dialog._trapTab(ev);
        expect(ev.defaultPrevented).to.be.true;
        expect(focusSpy).to.have.been.called;
        focusSpy.restore();
        dialog._containsDeepFocus.restore();
      });
    });

    suite('_collectFocusables traversal', () => {
      test('is a no-op when root is already visited', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog>
            <button>OK</button>
          </nuxeo-dialog>
        `);
        const results = [];
        const visited = new Set([dialog]);
        expect(() => dialog._collectFocusables(dialog, 'button', results, visited)).to.not.throw();
        expect(results).to.be.empty;
      });

      test('skips non-Element children gracefully', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog>
            <button id="b">B</button>
          </nuxeo-dialog>
        `);
        dialog.insertBefore(document.createTextNode('text'), dialog.firstChild);
        sinon.stub(dialog, '_isVisible').returns(true);
        const list = dialog._getFocusableElements();
        expect(list).to.include(dialog.querySelector('#b'));
        dialog._isVisible.restore();
      });

      test('descends into a non-focusable element with a shadow root', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog>
            <div id="host"></div>
          </nuxeo-dialog>
        `);
        const host = dialog.querySelector('#host');
        const shadow = host.attachShadow({ mode: 'open' });
        const innerBtn = document.createElement('button');
        innerBtn.id = 'inner';
        shadow.appendChild(innerBtn);
        sinon.stub(dialog, '_isVisible').returns(true);
        const list = dialog._getFocusableElements();
        expect(list).to.include(innerBtn);
        dialog._isVisible.restore();
      });
    });

    suite('_findContainingFocusableIndex via shadow host', () => {
      test('walks up through ShadowRoot host to find containing focusable', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog>
            <div id="host" tabindex="0"></div>
          </nuxeo-dialog>
        `);
        const host = dialog.querySelector('#host');
        const shadow = host.attachShadow({ mode: 'open' });
        const inner = document.createElement('span');
        shadow.appendChild(inner);
        const focusables = dialog._getFocusableElements();
        const idx = dialog._findContainingFocusableIndex(inner, focusables);
        expect(idx).to.equal(focusables.indexOf(host));
      });
    });

    suite('_trapTab activeIndex fallback', () => {
      test('uses _findContainingFocusableIndex when active is not directly focusable', async () => {
        dialog = await fixture(html`
          <nuxeo-dialog modal>
            <div id="wrapper" tabindex="0"><span id="inner">inner</span></div>
          </nuxeo-dialog>
        `);
        dialog.modal = true;
        dialog.__data.opened = true;
        const wrapper = dialog.querySelector('#wrapper');
        const inner = dialog.querySelector('#inner');
        sinon.stub(dialog, '_containsDeepFocus').returns(true);
        sinon.stub(dialog, '_getDeepActiveElement').returns(inner);
        sinon.stub(dialog, '_isVisible').returns(true);
        const findSpy = sinon.spy(dialog, '_findContainingFocusableIndex');
        const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        dialog._trapTab(ev);
        expect(findSpy).to.have.been.called;
        expect(findSpy.firstCall.returnValue).to.equal(0); // wrapper is the only focusable
        findSpy.restore();
        dialog._containsDeepFocus.restore();
        dialog._getDeepActiveElement.restore();
        dialog._isVisible.restore();
        // Suppress further reference to wrapper to silence lint.
        void wrapper;
      });
    });
  });
});
