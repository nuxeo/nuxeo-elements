/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-resize-handle.js';
import {
  resizeDeltaForKey,
  resizeDeltaFromPointer,
  RESIZE_HANDLE_KEY_STEP_PX,
  RESIZE_HANDLE_KEY_STEP_SHIFT_PX,
} from '../widgets/nuxeo-resize-handle.js';

suite('nuxeo-resize-handle extras', () => {
  let el;
  let originalTranslate;

  suiteSetup(() => {
    originalTranslate = window.nuxeo.I18n.translate;
  });

  teardown(() => {
    window.nuxeo.I18n.translate = originalTranslate;
  });

  setup(async () => {
    window.nuxeo = window.nuxeo || {};
    window.nuxeo.I18n = window.nuxeo.I18n || {};
    window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
    window.nuxeo.I18n.en['app.drawer.resize'] = 'Resize drawer';
    window.nuxeo.I18n.en['documentPage.resize.side'] = 'Resize side';
    window.nuxeo.I18n.language = 'en';

    el = await fixture(html`
      <div dir="ltr">
        <nuxeo-resize-handle
          label-key="app.drawer.resize"
          edge="end"
          aria-value-min="240"
          aria-value-max="700"
          aria-value-now="400"
        ></nuxeo-resize-handle>
      </div>
    `);
    el = el.querySelector('nuxeo-resize-handle');
  });

  test('should return the element name', () => {
    expect(Nuxeo.ResizeHandle.is).to.equal('nuxeo-resize-handle');
  });

  test('ready sets separator ARIA attributes', () => {
    expect(el.getAttribute('role')).to.equal('separator');
    expect(el.getAttribute('aria-orientation')).to.equal('vertical');
    expect(el.getAttribute('tabindex')).to.equal('0');
    expect(el.getAttribute('aria-label')).to.equal('Resize drawer');
    expect(el.getAttribute('aria-valuemin')).to.equal('240');
    expect(el.getAttribute('aria-valuemax')).to.equal('700');
    expect(el.getAttribute('aria-valuenow')).to.equal('400');
  });

  test('reflects edge, dir, and hidden attributes', async () => {
    const side = await fixture(html`
      <nuxeo-resize-handle edge="start" dir="rtl" label-key="documentPage.resize.side" hidden></nuxeo-resize-handle>
    `);
    expect(side.getAttribute('edge')).to.equal('start');
    expect(side.getAttribute('dir')).to.equal('rtl');
    expect(side.hasAttribute('hidden')).to.be.true;
  });

  test('end edge with dir=rtl places handle on the left (toward main content)', async () => {
    const rtlEnd = await fixture(html`
      <div style="position:relative;width:200px;height:100px;">
        <nuxeo-resize-handle edge="end" dir="rtl"></nuxeo-resize-handle>
      </div>
    `);
    const handle = rtlEnd.querySelector('nuxeo-resize-handle');
    expect(handle.offsetLeft).to.be.lessThan(10);
  });

  test('updates aria-valuenow when ariaValueNow changes', async () => {
    el.ariaValueNow = 500;
    await flush();
    expect(el.getAttribute('aria-valuenow')).to.equal('500');
  });

  suite('resizeDeltaForKey', () => {
    test('end edge LTR: ArrowRight grows, ArrowLeft shrinks', () => {
      expect(resizeDeltaForKey('ArrowRight', { edge: 'end', rtl: false })).to.equal(RESIZE_HANDLE_KEY_STEP_PX);
      expect(resizeDeltaForKey('ArrowLeft', { edge: 'end', rtl: false })).to.equal(-RESIZE_HANDLE_KEY_STEP_PX);
    });

    test('start edge LTR: ArrowLeft grows, ArrowRight shrinks', () => {
      expect(resizeDeltaForKey('ArrowLeft', { edge: 'start', rtl: false })).to.equal(RESIZE_HANDLE_KEY_STEP_PX);
      expect(resizeDeltaForKey('ArrowRight', { edge: 'start', rtl: false })).to.equal(-RESIZE_HANDLE_KEY_STEP_PX);
    });

    test('end edge RTL mirrors horizontal arrows', () => {
      expect(resizeDeltaForKey('ArrowRight', { edge: 'end', rtl: true })).to.equal(-RESIZE_HANDLE_KEY_STEP_PX);
      expect(resizeDeltaForKey('ArrowLeft', { edge: 'end', rtl: true })).to.equal(RESIZE_HANDLE_KEY_STEP_PX);
    });

    test('Shift uses the larger step', () => {
      expect(
        resizeDeltaForKey('ArrowRight', {
          edge: 'end',
          rtl: false,
          shiftKey: true,
        }),
      ).to.equal(RESIZE_HANDLE_KEY_STEP_SHIFT_PX);
    });

    test('returns null for unrelated keys', () => {
      expect(resizeDeltaForKey('Escape', { edge: 'end' })).to.be.null;
    });
  });

  suite('resizeDeltaFromPointer', () => {
    test('end edge LTR: moving right increases width', () => {
      expect(resizeDeltaFromPointer(100, 120, { edge: 'end', rtl: false })).to.equal(20);
    });

    test('start edge LTR: moving left increases width', () => {
      expect(resizeDeltaFromPointer(200, 180, { edge: 'start', rtl: false })).to.equal(20);
    });

    test('end edge RTL mirrors pointer delta', () => {
      expect(resizeDeltaFromPointer(100, 120, { edge: 'end', rtl: true })).to.equal(-20);
    });

    test('uses default options when none are passed', () => {
      expect(resizeDeltaForKey('ArrowRight')).to.equal(RESIZE_HANDLE_KEY_STEP_PX);
      expect(resizeDeltaFromPointer(0, 10)).to.equal(10);
    });
  });

  suite('keyboard events', () => {
    test('ArrowRight fires resize-step with signed delta', () => {
      const spy = sinon.spy();
      el.addEventListener('resize-step', spy);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.delta).to.equal(RESIZE_HANDLE_KEY_STEP_PX);
    });

    test('Home fires resize-bound min', () => {
      const spy = sinon.spy();
      el.addEventListener('resize-bound', spy);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }));
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.bound).to.equal('min');
    });

    test('Enter fires resize-reset', () => {
      const spy = sinon.spy();
      el.addEventListener('resize-reset', spy);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
      expect(spy).to.have.been.calledOnce;
    });

    test('does not fire when hidden', () => {
      el.hidden = true;
      const spy = sinon.spy();
      el.addEventListener('resize-step', spy);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      expect(spy).to.not.have.been.called;
    });

    test('End fires resize-bound max', () => {
      const spy = sinon.spy();
      el.addEventListener('resize-bound', spy);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true }));
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.bound).to.equal('max');
    });

    test('Space fires resize-reset', () => {
      const spy = sinon.spy();
      el.addEventListener('resize-reset', spy);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, composed: true }));
      expect(spy).to.have.been.calledOnce;
    });

    test('does not fire when disabled', () => {
      el.disabled = true;
      const spy = sinon.spy();
      el.addEventListener('resize-step', spy);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      expect(spy).to.not.have.been.called;
    });
  });

  suite('pointer drag', () => {
    test('mousedown, mousemove, and mouseup fire drag events', async () => {
      const dragStart = sinon.spy();
      const drag = sinon.spy();
      const dragEnd = sinon.spy();
      el.addEventListener('resize-drag-start', dragStart);
      el.addEventListener('resize-drag', drag);
      el.addEventListener('resize-drag-end', dragEnd);

      el.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true, composed: true }));
      globalThis.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, bubbles: true }));
      globalThis.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      await flush();

      expect(dragStart).to.have.been.calledOnce;
      expect(dragStart.firstCall.args[0].detail.clientX).to.equal(100);
      expect(drag).to.have.been.called;
      expect(drag.firstCall.args[0].detail.deltaFromStart).to.equal(20);
      expect(dragEnd).to.have.been.calledOnce;
      expect(el.active).to.be.false;
    });

    test('mousedown with a touches list uses the first touch clientX', async () => {
      const dragStart = sinon.spy();
      el.addEventListener('resize-drag-start', dragStart);

      const down = new MouseEvent('mousedown', { bubbles: true, composed: true, clientX: 999 });
      Object.defineProperty(down, 'touches', { value: [{ clientX: 70 }] });
      el.dispatchEvent(down);

      const move = new MouseEvent('mousemove', { bubbles: true, clientX: 999 });
      Object.defineProperty(move, 'touches', { value: [{ clientX: 90 }] });
      globalThis.dispatchEvent(move);

      globalThis.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      await flush();

      expect(dragStart.firstCall.args[0].detail.clientX).to.equal(70);
    });

    test('touchstart and touchend fire drag events', async () => {
      const dragEnd = sinon.spy();
      el.addEventListener('resize-drag-end', dragEnd);

      const startTouch = new Touch({ identifier: 0, target: el, clientX: 80, clientY: 0 });
      const moveTouch = new Touch({ identifier: 0, target: el, clientX: 100, clientY: 0 });

      el.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          composed: true,
          touches: [startTouch],
          targetTouches: [startTouch],
          changedTouches: [startTouch],
        }),
      );
      globalThis.dispatchEvent(
        new TouchEvent('touchmove', {
          bubbles: true,
          cancelable: true,
          touches: [moveTouch],
          targetTouches: [moveTouch],
          changedTouches: [moveTouch],
        }),
      );
      globalThis.dispatchEvent(
        new TouchEvent('touchend', {
          bubbles: true,
          changedTouches: [moveTouch],
        }),
      );
      await flush();

      expect(dragEnd).to.have.been.calledOnce;
      expect(el.active).to.be.false;
    });

    test('disconnect during drag cleans up listeners and fires resize-drag-end', async () => {
      const dragEnd = sinon.spy();
      el.addEventListener('resize-drag-end', dragEnd);

      el.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, bubbles: true, composed: true }));
      expect(el.active).to.be.true;
      el.remove();
      await flush();

      expect(dragEnd).to.have.been.calledOnce;
      expect(el.active).to.be.false;
    });

    test('does not start drag when hidden or disabled', () => {
      const dragStart = sinon.spy();
      el.addEventListener('resize-drag-start', dragStart);

      el.hidden = true;
      el.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, bubbles: true, composed: true }));
      expect(dragStart).to.not.have.been.called;

      el.hidden = false;
      el.disabled = true;
      el.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, bubbles: true, composed: true }));
      expect(dragStart).to.not.have.been.called;
    });
  });

  test('double-click fires resize-reset', () => {
    const spy = sinon.spy();
    el.addEventListener('resize-reset', spy);
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, composed: true }));
    expect(spy).to.have.been.calledOnce;
  });

  test('_isRtl reads document dir when handle dir is not ltr or rtl', () => {
    const previousDir = document.documentElement.getAttribute('dir');
    document.documentElement.setAttribute('dir', 'rtl');
    try {
      el.removeAttribute('dir');
      el.dir = '';
      expect(el._isRtl()).to.be.true;
    } finally {
      if (previousDir == null) {
        document.documentElement.removeAttribute('dir');
      } else {
        document.documentElement.setAttribute('dir', previousDir);
      }
    }
  });

  test('uses document dir for RTL when dir attribute is unset', async () => {
    const previousDir = document.documentElement.getAttribute('dir');
    document.documentElement.setAttribute('dir', 'rtl');
    try {
      const handle = await fixture(html`
        <nuxeo-resize-handle edge="end" dir="" label-key="app.drawer.resize"></nuxeo-resize-handle>
      `);
      const spy = sinon.spy();
      handle.addEventListener('resize-step', spy);
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.delta).to.equal(-RESIZE_HANDLE_KEY_STEP_PX);
    } finally {
      if (previousDir == null) {
        document.documentElement.removeAttribute('dir');
      } else {
        document.documentElement.setAttribute('dir', previousDir);
      }
    }
  });

  test('static delta helpers delegate to exported functions', () => {
    expect(Nuxeo.ResizeHandle.deltaForKey('ArrowLeft', { edge: 'end' })).to.equal(-RESIZE_HANDLE_KEY_STEP_PX);
    expect(Nuxeo.ResizeHandle.deltaFromPointer(10, 30, { edge: 'end' })).to.equal(20);
  });

  test('focus moves tooltip anchor to vertical center', async () => {
    const host = await fixture(html`
      <div style="position:relative;width:16px;height:200px;">
        <nuxeo-resize-handle label-key="app.drawer.resize"></nuxeo-resize-handle>
      </div>
    `);
    const handle = host.querySelector('nuxeo-resize-handle');
    const anchor = handle.shadowRoot.querySelector('#tooltipAnchor');
    handle.dispatchEvent(new FocusEvent('focus', { bubbles: true, composed: true }));
    await flush();
    expect(Number.parseFloat(anchor.style.top, 10)).to.be.closeTo(100, 2);
  });

  test('ignores unhandled keys without firing resize-step', () => {
    const spy = sinon.spy();
    el.addEventListener('resize-step', spy);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    expect(spy).to.not.have.been.called;
  });

  test('does not reset on double-click when hidden', () => {
    const spy = sinon.spy();
    el.hidden = true;
    el.addEventListener('resize-reset', spy);
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, composed: true }));
    expect(spy).to.not.have.been.called;
  });

  test('does not sync tooltip anchor when hidden', async () => {
    el.hidden = true;
    const anchor = el.shadowRoot.querySelector('#tooltipAnchor');
    const topBefore = anchor.style.top;
    el.dispatchEvent(new MouseEvent('mouseenter', { clientY: 40, bubbles: true, composed: true }));
    await flush();
    expect(anchor.style.top).to.equal(topBefore);
  });

  test('dir=rtl uses mirrored keyboard delta on the handle', () => {
    const rtl = document.createElement('nuxeo-resize-handle');
    rtl.setAttribute('edge', 'end');
    rtl.setAttribute('dir', 'rtl');
    document.body.appendChild(rtl);
    const spy = sinon.spy();
    rtl.addEventListener('resize-step', spy);
    rtl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    expect(spy.firstCall.args[0].detail.delta).to.equal(-RESIZE_HANDLE_KEY_STEP_PX);
    rtl.remove();
  });

  test('guards when tooltip anchor nodes are missing', () => {
    const original$ = el.$;
    el.$ = {};
    try {
      el._syncTooltipAnchor();
      el._forwardTooltipAnchorEvent('mouseenter');
    } finally {
      el.$ = original$;
    }
  });

  test('_finishDrag without active does not fire resize-drag-end', () => {
    const dragEnd = sinon.spy();
    el.addEventListener('resize-drag-end', dragEnd);
    el._dragAbortController = new AbortController();
    el.active = false;
    el._finishDrag();
    expect(dragEnd).to.not.have.been.called;
    expect(el._dragAbortController).to.be.null;
  });

  test('_computeLabel falls back to the key when i18n is not a function', () => {
    expect(el._computeLabel('app.drawer.resize', null)).to.equal('app.drawer.resize');
  });

  test('calls updatePositionIfShowing while tooltip is visible', async () => {
    const host = await fixture(html`
      <div style="position:relative;width:16px;height:200px;">
        <nuxeo-resize-handle label-key="app.drawer.resize"></nuxeo-resize-handle>
      </div>
    `);
    const handle = host.querySelector('nuxeo-resize-handle');
    const tooltip = handle.$.resizeHandleTooltip;
    const hostRect = host.getBoundingClientRect();

    handle.dispatchEvent(new MouseEvent('mouseenter', { clientY: hostRect.top + 40, bubbles: true, composed: true }));
    await flush();

    const updateSpy = sinon.spy(tooltip, 'updatePositionIfShowing');
    handle.dispatchEvent(new MouseEvent('mousemove', { clientY: hostRect.top + 60, bubbles: true, composed: true }));
    expect(updateSpy).to.have.been.called;
    updateSpy.restore();
    tooltip.hide();
    await flush();
  });

  test('skips updatePositionIfShowing when the child tooltip omits the API', async () => {
    const host = await fixture(html`
      <div style="position:relative;width:16px;height:200px;">
        <nuxeo-resize-handle label-key="app.drawer.resize"></nuxeo-resize-handle>
      </div>
    `);
    const handle = host.querySelector('nuxeo-resize-handle');
    const tooltip = handle.$.resizeHandleTooltip;
    const saved = tooltip.updatePositionIfShowing;
    delete tooltip.updatePositionIfShowing;

    handle.dispatchEvent(new MouseEvent('mousemove', { clientY: 40, bubbles: true, composed: true }));
    tooltip.updatePositionIfShowing = saved;
  });

  test('moves tooltip anchor with pointer on the handle', async () => {
    const host = await fixture(html`
      <div style="position:relative;width:16px;height:200px;">
        <nuxeo-resize-handle label-key="app.drawer.resize"></nuxeo-resize-handle>
      </div>
    `);
    const handle = host.querySelector('nuxeo-resize-handle');
    const anchor = handle.shadowRoot.querySelector('#tooltipAnchor');
    const hostRect = host.getBoundingClientRect();

    handle.dispatchEvent(
      new MouseEvent('mousemove', {
        clientY: hostRect.top + 40,
        bubbles: true,
        composed: true,
      }),
    );
    expect(Number.parseFloat(anchor.style.top, 10)).to.be.closeTo(40, 2);

    handle.dispatchEvent(
      new MouseEvent('mousemove', {
        clientY: hostRect.top + 120,
        bubbles: true,
        composed: true,
      }),
    );
    expect(Number.parseFloat(anchor.style.top, 10)).to.be.closeTo(120, 2);
  });

  test('tooltip aligns with the moving anchor, not the full handle height', async () => {
    const host = await fixture(html`
      <div style="position:relative;width:16px;height:200px;">
        <nuxeo-resize-handle label-key="app.drawer.resize" tooltip-position="right"></nuxeo-resize-handle>
      </div>
    `);
    const handle = host.querySelector('nuxeo-resize-handle');
    const anchor = handle.shadowRoot.querySelector('#tooltipAnchor');
    const hostRect = host.getBoundingClientRect();
    const pointerY = hostRect.top + 80;

    handle.dispatchEvent(new MouseEvent('mouseenter', { clientY: pointerY, bubbles: true, composed: true }));
    await flush();

    expect(Number.parseFloat(anchor.style.top, 10)).to.be.closeTo(80, 2);

    const paperTooltip = document.body.querySelector('paper-tooltip');
    expect(paperTooltip).to.exist;
    const anchorRect = anchor.getBoundingClientRect();
    const tipRect = paperTooltip.getBoundingClientRect();
    expect(tipRect.top + tipRect.height / 2).to.be.closeTo(anchorRect.top + anchorRect.height / 2, 24);

    handle.$.resizeHandleTooltip.hide();
    await flush();
  });

  test('recomputes _label when i18n is refreshed after mount', async () => {
    delete window.nuxeo.I18n.en['app.drawer.resize'];
    const early = await fixture(
      html`
        <nuxeo-resize-handle label-key="app.drawer.resize"></nuxeo-resize-handle>
      `,
    );
    expect(early._label).to.equal('app.drawer.resize');

    window.nuxeo.I18n.en['app.drawer.resize'] = 'Resize drawer';
    window.nuxeo.I18n.translate = (key) => window.nuxeo.I18n.en[key] || key;
    early.refreshI18n();
    await flush();

    expect(early._label).to.equal('Resize drawer');
    expect(early.getAttribute('aria-label')).to.equal('Resize drawer');
  });
});
