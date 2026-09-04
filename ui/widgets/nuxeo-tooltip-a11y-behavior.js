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

/** Keys that dismiss hover/focus content, per the WAI-ARIA tooltip pattern. */
export const TOOLTIP_DISMISS_KEYS = ['Escape', 'Esc'];

/**
 * Grace period (ms) between the pointer leaving the trigger and the tooltip being torn down.
 * It has to outlast the pointer crossing the `offset` gap between trigger and bubble.
 */
export const TOOLTIP_POINTER_LEAVE_DELAY_MS = 300;

let idSequence = 0;

/** Collapses whitespace so a tooltip label can be compared with an accessible name. */
function normalizeText(value) {
  return (value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * The tooltips that currently have something rendered, and the single `keydown` listener that
 * dismisses them. A screen can hold a hundred `nuxeo-tooltip` instances, so they share one
 * listener, and it is only on the window while there is actually something to dismiss.
 */
const renderedTooltips = new Set();
let dismissKeyListener = null;

function onDismissKey(event) {
  if (!TOOLTIP_DISMISS_KEYS.includes(event.key)) {
    return;
  }
  // The event is neither cancelled nor stopped: dialogs and dropdowns keep their own Escape
  // handling, the tooltips simply get out of the way first.
  Array.from(renderedTooltips).forEach((tooltip) => tooltip._dismissTooltip());
}

function registerRenderedTooltip(tooltip) {
  renderedTooltips.add(tooltip);
  if (!dismissKeyListener) {
    dismissKeyListener = onDismissKey;
    // Capture phase on `window`: the earliest point in the propagation path, so a consumer that
    // stops keydown propagation cannot silently disable the only way to dismiss the tooltip.
    window.addEventListener('keydown', dismissKeyListener, true);
  }
}

function unregisterRenderedTooltip(tooltip) {
  renderedTooltips.delete(tooltip);
  if (dismissKeyListener && renderedTooltips.size === 0) {
    window.removeEventListener('keydown', dismissKeyListener, true);
    dismissKeyListener = null;
  }
}

/**
 * WCAG 2.1 AA 1.4.13 "Content on Hover or Focus" support for a tooltip host, plus the ARIA
 * wiring assistive technologies need. Designed for `nuxeo-tooltip`, which renders its content
 * in a `paper-tooltip` clone attached to `document.body`. This behavior is private to
 * `nuxeo-tooltip`; it is exported only for that component's module import.
 *
 * The host must provide `show()`, `hide()` and a `target` getter; this behavior owns:
 *
 * - **Dismissible** — a shared `window` **capture** phase keydown listener hides the tooltip on
 *   Escape. Capture is required: ancestors routinely stop keydown propagation before it bubbles back
 *   up to `window` (`IronMenuBehavior._onKeydown` does it for every key in the `paper-listbox` that
 *   holds the Web UI navigation menu, and `custom-date-picker` does it while its calendar is open).
 *   Dismissal is latched so the tooltip cannot re-appear until hover or focus really moves away.
 * - **Hoverable** — the pointer leaving the trigger schedules the teardown instead of performing it,
 *   and the rendered bubble keeps itself alive while the pointer is over it.
 * - **Persistent** — only Escape dismisses; unrelated keystrokes leave the tooltip alone and no
 *   timer ever hides it on its own.
 * - **Accessible description** — the host gets `role="tooltip"` and an id, the trigger gets
 *   `aria-describedby`, and the rendered clone is hidden from assistive technologies so the text is
 *   announced once, from the trigger.
 *
 * @polymerBehavior
 */
export const TooltipA11yBehavior = {
  properties: {
    /**
     * How long (ms) the tooltip survives after the pointer leaves the trigger, so the pointer can
     * travel across the `offset` gap and onto the tooltip itself (WCAG 1.4.13 hoverable).
     */
    pointerLeaveDelay: {
      type: Number,
      value: TOOLTIP_POINTER_LEAVE_DELAY_MS,
    },
  },

  attached() {
    this._armTooltipA11y();
  },

  detached() {
    this._disarmTooltipA11y();
  },

  /** Gives the tooltip its ARIA identity and starts describing the trigger. */
  _armTooltipA11y() {
    if (this._tooltipA11yArmed) {
      return;
    }
    this._tooltipA11yArmed = true;
    this._tooltipDismissed = false;
    this._pointerOverTooltip = false;
    this.setAttribute('role', 'tooltip');
    if (!this.id) {
      idSequence += 1;
      this.id = `nuxeo-tooltip-${idSequence}`;
    }
    // A tooltip bound with `hidden$="..."` (`nuxeo-date` does this) can become relevant long after
    // it was attached, and a screen reader user may never hover or focus the trigger, so the
    // description has to follow `hidden` on its own rather than waiting for `show()`.
    this._tooltipHiddenObserver = new MutationObserver(() => this._syncTooltipDescription());
    this._tooltipHiddenObserver.observe(this, { attributes: true, attributeFilter: ['hidden'] });
    this._syncTooltipDescription();
  },

  /** Undoes everything `_armTooltipA11y` set up. */
  _disarmTooltipA11y() {
    if (!this._tooltipA11yArmed) {
      return;
    }
    this._tooltipA11yArmed = false;
    this._onTooltipTornDown();
    if (this._tooltipHiddenObserver) {
      this._tooltipHiddenObserver.disconnect();
      this._tooltipHiddenObserver = null;
    }
    this._removeTooltipDescription();
    this._tooltipDismissed = false;
  },

  /**
   * Points the trigger's `aria-describedby` at this tooltip.
   *
   * The host stays `display: none`; the accessible name and description computation deliberately
   * includes hidden nodes that are directly referenced by `aria-describedby`, so the text is
   * available to assistive technologies without ever being rendered or read out of context.
   */
  _syncTooltipDescription() {
    const target = this.target;
    // Whatever the outcome, a trigger this tooltip no longer describes must not keep a dangling
    // reference to its id — the target changes whenever `for` changes or the tooltip is moved.
    if (!this._canDescribe(target)) {
      this._removeTooltipDescription();
      return;
    }
    if (this._describedTarget === target) {
      return;
    }
    this._removeTooltipDescription();
    const tokens = (target.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!tokens.includes(this.id)) {
      this._previousDescribedBy = target.getAttribute('aria-describedby');
      tokens.push(this.id);
      target.setAttribute('aria-describedby', tokens.join(' '));
      this._describedTarget = target;
    }
  },

  /** Whether `target` should carry an `aria-describedby` pointing at this tooltip. */
  _canDescribe(target) {
    if (!target) {
      return false;
    }
    if (!target.setAttribute) {
      return false;
    }
    // A hidden tooltip has nothing to say, so it must not describe its trigger either.
    if (this.hidden) {
      return false;
    }
    // aria-describedby cannot cross a shadow boundary: the id has to resolve in the trigger's tree.
    if (target.getRootNode() !== this.getRootNode()) {
      return false;
    }
    return !this._isDescriptionRedundant(target);
  },

  /** Restores the trigger's original `aria-describedby`. */
  _removeTooltipDescription() {
    const target = this._describedTarget;
    this._describedTarget = null;
    if (!target) {
      return;
    }
    if (!target.setAttribute) {
      return;
    }
    if (this._previousDescribedBy !== null) {
      target.setAttribute('aria-describedby', this._previousDescribedBy);
    } else {
      target.removeAttribute('aria-describedby');
    }
    this._previousDescribedBy = null;
  },

  /**
   * True when the trigger already conveys the tooltip text through its own accessible name, in
   * which case describing it again only makes screen readers repeat themselves. Web UI commonly
   * labels icon buttons with `aria-labelledby` pointing straight at their `nuxeo-tooltip`.
   */
  _isDescriptionRedundant(target) {
    const text = normalizeText(this.textContent);
    if (!text) {
      return true;
    }
    const root = target.getRootNode();
    const labelledBy = (target.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
    if (labelledBy.includes(this.id)) {
      return true;
    }
    const names = [target.getAttribute('aria-label'), target.getAttribute('title')];
    labelledBy.forEach((id) => {
      const labelNode = root.getElementById ? root.getElementById(id) : null;
      if (labelNode) {
        names.push(labelNode.textContent);
      }
    });
    return names.some((name) => normalizeText(name) === text);
  },

  /** Whether the tooltip was dismissed and must stay hidden until hover or focus moves away. */
  isTooltipDismissed() {
    return !!this._tooltipDismissed;
  },

  /** Clears the dismissal latch, called when hover or focus actually leaves the trigger. */
  _resetTooltipDismissal() {
    this._tooltipDismissed = false;
  },

  /** Hides the tooltip and latches it dismissed (WCAG 1.4.13 dismissible). */
  _dismissTooltip() {
    if (!this._tooltip) {
      return;
    }
    this._tooltipDismissed = true;
    this.hide();
  },

  _onTooltipDismissKey(event) {
    if (!event || !TOOLTIP_DISMISS_KEYS.includes(event.key)) {
      return;
    }
    this._dismissTooltip();
  },

  _cancelTooltipHide() {
    if (this._tooltipHideTimer) {
      clearTimeout(this._tooltipHideTimer);
      this._tooltipHideTimer = null;
    }
  },

  /**
   * Defers the teardown so the pointer can reach the bubble (WCAG 1.4.13 hoverable). Nothing here
   * hides a tooltip the pointer is still over — that is the bubble's own `mouseleave`.
   */
  _scheduleTooltipHide() {
    this._cancelTooltipHide();
    const delay = this.pointerLeaveDelay;
    if (!delay || delay <= 0) {
      this.hide();
      return;
    }
    this._tooltipHideTimer = setTimeout(() => {
      this._tooltipHideTimer = null;
      if (!this._pointerOverTooltip) {
        this.hide();
      }
    }, delay);
  },

  /** Pointer left the trigger: keep the tooltip briefly and allow it to be shown again. */
  _onTriggerPointerLeave() {
    this._resetTooltipDismissal();
    this._scheduleTooltipHide();
  },

  /** Focus left the trigger: tear down unless it only moved between trigger descendants. */
  _onTriggerBlur(event) {
    if (event?.relatedTarget && this._target?.contains(event.relatedTarget)) {
      return;
    }
    this._resetTooltipDismissal();
    this.hide();
  },

  /**
   * Makes a freshly rendered `paper-tooltip` clone hoverable and invisible to assistive
   * technologies (the trigger's `aria-describedby` already carries the text), and opts this
   * tooltip into the shared dismissal listener for as long as the clone lives.
   */
  _prepareRenderedTooltip(renderedTooltip) {
    renderedTooltip.setAttribute('aria-hidden', 'true');
    this._pointerOverTooltip = false;
    registerRenderedTooltip(this);
    renderedTooltip.addEventListener('mouseenter', () => {
      this._pointerOverTooltip = true;
      this._cancelTooltipHide();
    });
    renderedTooltip.addEventListener('mouseleave', () => {
      this._pointerOverTooltip = false;
      this._scheduleTooltipHide();
    });
    // Do not let a hoverable bubble swallow a click meant for the content underneath.
    renderedTooltip.addEventListener('mousedown', () => {
      this._pointerOverTooltip = false;
      this.hide();
    });
  },

  /** Counterpart of `_prepareRenderedTooltip`, to be called whenever the clone goes away. */
  _onTooltipTornDown() {
    this._cancelTooltipHide();
    this._pointerOverTooltip = false;
    unregisterRenderedTooltip(this);
  },
};
