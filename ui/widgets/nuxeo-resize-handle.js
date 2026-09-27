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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import './nuxeo-tooltip.js';

/** Default keyboard step (px) for arrow keys. */
export const RESIZE_HANDLE_KEY_STEP_PX = 16;
/** Default keyboard step (px) when Shift is held. */
export const RESIZE_HANDLE_KEY_STEP_SHIFT_PX = 64;

/**
 * Returns the first touch point for touch events, or the event itself for mouse/pointer events.
 * @param {MouseEvent|TouchEvent} event
 * @returns {Touch|MouseEvent|TouchEvent}
 */
function primaryPointerSource(event) {
  const { touches } = event;
  if (touches == null) {
    return event;
  }
  return touches[0] || event;
}

/**
 * Width delta (px) for an arrow key, given pane edge and text direction.
 *
 * @param {string} key
 * @param {{ edge?: string, rtl?: boolean, step?: number, stepShift?: number, shiftKey?: boolean }} options
 * @returns {number|null} Signed delta, or null if the key is not handled.
 */
export function resizeDeltaForKey(
  key,
  {
    edge = 'end',
    rtl = false,
    step = RESIZE_HANDLE_KEY_STEP_PX,
    stepShift = RESIZE_HANDLE_KEY_STEP_SHIFT_PX,
    shiftKey = false,
  } = {},
) {
  const stepPx = shiftKey ? stepShift : step;
  const growOnArrowRight = edge === 'end' ? !rtl : rtl;

  switch (key) {
    case 'ArrowRight':
      return growOnArrowRight ? stepPx : -stepPx;
    case 'ArrowLeft':
      return growOnArrowRight ? -stepPx : stepPx;
    default:
      return null;
  }
}

/**
 * Cumulative width delta (px) from a pointer position, given pane edge and text direction.
 *
 * @param {number} startX
 * @param {number} clientX
 * @param {{ edge?: string, rtl?: boolean }} options
 * @returns {number}
 */
export function resizeDeltaFromPointer(startX, clientX, { edge = 'end', rtl = false } = {}) {
  const raw = edge === 'end' ? clientX - startX : startX - clientX;
  return raw * (rtl ? -1 : 1);
}

{
  /**
   * Vertical resize strip for pane width adjustment (drawer, information pane, etc.).
   *
   * Owns pointer/keyboard input, RTL-aware deltas, hover/focus styling, tooltip, and separator ARIA.
   * Hosts listen for `resize-step`, `resize-bound`, `resize-reset`, `resize-drag`, and
   * `resize-drag-end` to apply clamp math, persistence, and layout coordination.
   *
   * ### Events
   *
   * | Event | detail | When |
   * |-------|--------|------|
   * | `resize-step` | `{ delta }` | Arrow key (incl. Shift) |
   * | `resize-bound` | `{ bound: 'min' \| 'max' }` | Home / End |
   * | `resize-reset` | — | Enter, Space, or double-click |
   * | `resize-drag-start` | `{ clientX }` | Pointer drag begins |
   * | `resize-drag` | `{ deltaFromStart }` | Pointer moved |
   * | `resize-drag-end` | — | Pointer released |
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   */
  class ResizeHandle extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get is() {
      return 'nuxeo-resize-handle';
    }

    static get template() {
      return html`
        <style>
          :host {
            display: block;
            position: absolute;
            top: 0;
            height: 100%;
            cursor: ew-resize;
            z-index: 20;
            user-select: none;
            touch-action: none;
            box-sizing: border-box;
            /* Wider hit target; visible strip is the ::after pseudo (6px). */
            width: 16px;
            background-color: transparent;
          }

          :host::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            width: 6px;
            background-color: transparent;
            transition: background-color 0.2s ease;
            pointer-events: none;
          }

          :host([hidden]),
          :host([disabled]) {
            display: none !important;
          }

          /* Use explicit dir (not :host-context): drawer handle lives under app-drawer shadow. */
          :host([edge='end']:not([dir='rtl'])) {
            right: var(--nuxeo-resize-handle-inset, -3px);
            left: auto;
          }

          :host([edge='end'][dir='rtl']) {
            left: var(--nuxeo-resize-handle-inset, -3px);
            right: auto;
          }

          :host([edge='start']:not([dir='rtl'])) {
            left: var(--nuxeo-resize-handle-inset, -6px);
            right: auto;
          }

          :host([edge='start'][dir='rtl']) {
            right: var(--nuxeo-resize-handle-inset, -6px);
            left: auto;
          }

          :host([edge='end']:not([dir='rtl']))::after {
            right: 0;
            left: auto;
          }

          :host([edge='end'][dir='rtl'])::after {
            left: 0;
            right: auto;
          }

          :host([edge='start']:not([dir='rtl']))::after {
            left: 0;
            right: auto;
          }

          :host([edge='start'][dir='rtl'])::after {
            right: 0;
            left: auto;
          }

          /* Light up only the handle the user is interacting with.
             :host([active]) is set in _onPointerDown / cleared in _finishDrag.*/
          :host(:hover)::after,
          :host(:focus-visible)::after,
          :host([active])::after {
            background-color: var(--nuxeo-resize-handle-color, #989898);
            opacity: 1;
          }

          :host(:focus) {
            outline: none;
          }

          :host(:focus-visible)::after {
            outline: 2px solid var(--nuxeo-resize-handle-color, #989898);
            outline-offset: -2px;
          }

          #tooltipAnchor {
            position: absolute;
            left: 0;
            width: 100%;
            height: 1px;
            margin: 0;
            padding: 0;
            border: 0;
            opacity: 0;
            pointer-events: auto;
            z-index: 1;
          }
        </style>

        <div id="tooltipAnchor" aria-hidden="true"></div>
        <nuxeo-tooltip
          id="resizeHandleTooltip"
          for="tooltipAnchor"
          data-nx-tooltip-role="resize-handle"
          position="[[tooltipPosition]]"
          offset="8"
          animation-delay="0"
        >
          <span class="resize-handle-tooltip-label">[[_label]]</span>
        </nuxeo-tooltip>
      `;
    }

    static get properties() {
      return {
        /**
         * Which edge of the parent pane the handle sits on (`start` = leading, `end` = trailing in LTR).
         */
        edge: {
          type: String,
          reflectToAttribute: true,
          value: 'end',
        },

        /** Text direction for placement and keyboard (`ltr` or `rtl`). Prefer binding from the host. */
        dir: {
          type: String,
          reflectToAttribute: true,
          value: 'ltr',
        },

        hidden: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
        },

        /**
         * When true, the handle is hidden and ignores pointer and keyboard input
         * (same as `hidden` for visibility; use `hidden` when the host removes the control from layout).
         */
        disabled: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
        },

        /** i18n key for aria-label and tooltip text. */
        labelKey: {
          type: String,
          value: 'app.drawer.resize',
        },

        tooltipPosition: {
          type: String,
          value: 'right',
        },

        step: {
          type: Number,
          value: RESIZE_HANDLE_KEY_STEP_PX,
        },

        stepShift: {
          type: Number,
          value: RESIZE_HANDLE_KEY_STEP_SHIFT_PX,
        },

        ariaValueMin: {
          type: Number,
          value: 0,
        },

        ariaValueMax: {
          type: Number,
          value: 0,
        },

        ariaValueNow: {
          type: Number,
          value: 0,
        },

        active: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
        },

        _label: {
          type: String,
          computed: '_computeLabel(labelKey, i18n)',
        },
      };
    }

    static get observers() {
      return ['_syncAria(labelKey, ariaValueMin, ariaValueMax, ariaValueNow, _label)'];
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._finishDrag();
    }

    ready() {
      super.ready();
      this.setAttribute('role', 'separator');
      this.setAttribute('aria-orientation', 'vertical');
      this.setAttribute('tabindex', '0');
      this._syncAria();
      this._onTooltipAnchorPointer = (e) => this._onTooltipAnchorEvent(e);
      this._onTooltipAnchorFocus = () => this._onTooltipAnchorEvent(null, 'focus');
      this._onTooltipAnchorBlur = () => this._forwardTooltipAnchorEvent('blur');
      this._onTooltipAnchorLeave = () => this._forwardTooltipAnchorEvent('mouseleave');
      this.addEventListener('mouseenter', this._onTooltipAnchorPointer);
      this.addEventListener('mousemove', this._onTooltipAnchorPointer);
      this.addEventListener('mouseleave', this._onTooltipAnchorLeave);
      this.addEventListener('focus', this._onTooltipAnchorFocus);
      this.addEventListener('blur', this._onTooltipAnchorBlur);
      this.addEventListener('keydown', (e) => this._onKeyDown(e));
      this.addEventListener('mousedown', (e) => this._onPointerDown(e));
      this.addEventListener('touchstart', (e) => this._onPointerDown(e));
      this.addEventListener('dblclick', (e) => this._onDoubleClick(e));
    }

    /**
     * Moves the tooltip anchor to the pointer (or vertical center on focus) so `paper-tooltip`
     * does not center on the full-height handle.
     * @param {MouseEvent|FocusEvent} [e]
     */
    _syncTooltipAnchor(e) {
      const anchor = this.$.tooltipAnchor;
      if (!anchor) {
        return;
      }
      const hostRect = this.getBoundingClientRect();
      const anchorHeight = anchor.offsetHeight || 1;
      const clientY = e && typeof e.clientY === 'number' ? e.clientY : hostRect.top + hostRect.height / 2;
      let top = clientY - hostRect.top - anchorHeight / 2;
      top = Math.max(0, Math.min(hostRect.height - anchorHeight, top));
      anchor.style.top = `${top}px`;

      const resizeHandleTooltip = this.$.resizeHandleTooltip;
      if (resizeHandleTooltip) {
        resizeHandleTooltip.updatePositionIfShowing();
      }
    }

    _forwardTooltipAnchorEvent(type) {
      const anchor = this.$.tooltipAnchor;
      if (!anchor) {
        return;
      }
      if (type === 'focus' || type === 'blur') {
        anchor.dispatchEvent(new FocusEvent(type, { bubbles: false }));
      } else {
        anchor.dispatchEvent(new MouseEvent(type, { bubbles: false }));
      }
    }

    /**
     * Repositions the anchor under the pointer, then forwards hover/focus to the anchor target.
     * @param {MouseEvent|FocusEvent} [e]
     * @param {'mouseenter'|'focus'} [eventType]
     */
    _onTooltipAnchorEvent(e, eventType) {
      if (!this._isInteractive()) {
        return;
      }
      // Skip the focus tooltip path when focus was set programmatically by
      // _finishDrag (so the tooltip does not flash after every mouse drag).
      // Keyboard focus from Tab still shows the tooltip via the same path.
      if (eventType === 'focus' && this._suppressNextFocusTooltip) {
        this._suppressNextFocusTooltip = false;
        return;
      }
      this._syncTooltipAnchor(e);
      const type = eventType || 'mouseenter';
      this._forwardTooltipAnchorEvent(type);
    }

    _computeLabel(labelKey, i18n) {
      return typeof i18n === 'function' ? i18n(labelKey) : labelKey;
    }

    _syncAria() {
      this.setAttribute('aria-label', this._label || '');
      this.setAttribute('aria-valuemin', String(this.ariaValueMin));
      this.setAttribute('aria-valuemax', String(this.ariaValueMax));
      this.setAttribute('aria-valuenow', String(this.ariaValueNow));
    }

    _isInteractive() {
      return !this.hidden && !this.disabled;
    }

    _isRtl() {
      if (this.dir === 'rtl') {
        return true;
      }
      if (this.dir === 'ltr') {
        return false;
      }
      return document.documentElement.getAttribute('dir') === 'rtl';
    }

    _fire(name, detail) {
      this.dispatchEvent(
        new CustomEvent(name, {
          bubbles: true,
          composed: true,
          detail,
        }),
      );
    }

    _onKeyDown(e) {
      if (!this._isInteractive()) {
        return;
      }

      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        this._fire('resize-bound', { bound: e.key === 'Home' ? 'min' : 'max' });
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._fire('resize-reset');
        return;
      }

      const delta = resizeDeltaForKey(e.key, {
        edge: this.edge,
        rtl: this._isRtl(),
        step: this.step,
        stepShift: this.stepShift,
        shiftKey: e.shiftKey,
      });
      if (delta == null) {
        return;
      }
      e.preventDefault();
      this._fire('resize-step', { delta });
    }

    _onDoubleClick(e) {
      if (!this._isInteractive()) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this._fire('resize-reset');
    }

    _finishDrag() {
      if (!this._dragAbortController) {
        return;
      }
      const wasDragging = this.active;
      const controller = this._dragAbortController;
      this._dragAbortController = null;
      this.active = false;
      controller.abort();
      if (wasDragging) {
        // preventDefault() on mousedown/touchstart suppresses the browser's
        // default focus transfer; without an explicit focus on pointer release
        // the handle would not receive subsequent keydown events after a
        // mouse interaction, breaking arrow-key width adjustment after a click.
        // We mark this focus as pointer-driven so the tooltip path skips it.
        if (this.isConnected && document.activeElement !== this) {
          this._suppressNextFocusTooltip = true;
          try {
            this.focus({ preventScroll: true });
          } catch (_) {
            this.focus();
          }
        }
        this._fire('resize-drag-end');
      }
    }

    _onPointerDown(e) {
      if (!this._isInteractive()) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const point = primaryPointerSource(e);
      const startX = point.clientX;
      this._finishDrag();
      this.active = true;
      this._fire('resize-drag-start', { clientX: startX });

      const rtl = this._isRtl();
      const edge = this.edge;
      const controller = new AbortController();
      this._dragAbortController = controller;
      const { signal } = controller;

      const onMove = (ev) => {
        if (ev.cancelable) {
          ev.preventDefault();
        }
        const p = primaryPointerSource(ev);
        const deltaFromStart = resizeDeltaFromPointer(startX, p.clientX, { edge, rtl });
        this._fire('resize-drag', { deltaFromStart });
      };

      globalThis.addEventListener('mousemove', onMove, { signal });
      globalThis.addEventListener('mouseup', () => this._finishDrag(), { signal, once: true });
      globalThis.addEventListener('touchmove', onMove, { passive: false, signal });
      globalThis.addEventListener('touchend', () => this._finishDrag(), { signal, once: true });
    }

    /** @see resizeDeltaForKey */
    static deltaForKey(key, options) {
      return resizeDeltaForKey(key, options);
    }

    /** @see resizeDeltaFromPointer */
    static deltaFromPointer(startX, clientX, options) {
      return resizeDeltaFromPointer(startX, clientX, options);
    }
  }

  customElements.define(ResizeHandle.is, ResizeHandle);
  Nuxeo.ResizeHandle = ResizeHandle;
}
