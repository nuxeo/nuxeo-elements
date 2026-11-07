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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { TooltipA11yBehavior } from './nuxeo-tooltip-a11y-behavior.js';

const CLONED_CONTENT_STYLES_ID = 'nuxeo-tooltip-cloned-content-styles';

/**
 * Slot content is cloned into `paper-tooltip` on `document.body`, so shadow-DOM styles do not apply.
 * Role-specific rules for cloned nodes live here; set `data-nx-tooltip-role` on `<nuxeo-tooltip>`.
 */
export function ensureClonedContentStyles() {
  if (document.getElementById(CLONED_CONTENT_STYLES_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = CLONED_CONTENT_STYLES_ID;
  style.textContent = `
    [data-nx-tooltip-role="resize-handle"].resize-handle-tooltip-label {
      display: block;
      max-width: 280px;
      white-space: normal;
      line-height: 1.4;
      text-align: start;
    }
  `;
  document.head.appendChild(style);
}

ensureClonedContentStyles();

{
  /**
   * Example:
   *
   *     <div>
   *       <span>Hover me!</span>
   *       <nuxeo-tooltip>Tooltip text</nuxeo-tooltip>
   *     </div>
   *
   *     <div>
   *       <span id="btn">Hover me!</span>
   *       <nuxeo-tooltip for="btn">Tooltip text</nuxeo-tooltip>
   *     </div>
   *
   * ### Cloned slot content
   *
   * On show, assigned slot nodes are cloned into a `paper-tooltip` attached to `document.body`.
   * Styles from the consumer shadow tree are not applied to the clone. For multi-line labels,
   * set `data-nx-tooltip-role` on this element (copied onto the cloned root) and add matching
   * rules in the cloned-content stylesheet above (see `ensureClonedContentStyles`).
   *
   * ### Accessibility
   *
   * The tooltip's private accessibility behavior provides the WCAG 2.1 AA 1.4.13 "Content on
   * Hover or Focus" behavior — Escape dismisses the tooltip, the pointer can move onto the tooltip
   * without it disappearing, and nothing else hides it — plus the `role="tooltip"` /
   * `aria-describedby` wiring that exposes the text to assistive technologies.
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-tooltip/index.html
   */
  class Tooltip extends mixinBehaviors([TooltipA11yBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            display: none;
          }
        </style>

        <slot id="content"></slot>
      `;
    }

    static get is() {
      return 'nuxeo-tooltip';
    }

    static get properties() {
      return {
        for: String,

        position: {
          type: String,
          value: 'bottom',
        },

        offset: {
          type: Number,
          value: 14,
        },

        animationDelay: {
          type: Number,
          value: 500,
        },
      };
    }

    constructor() {
      super();
      // since we are adding/removing listeners on the parent and not the tooltip itself
      // (and therefore we need to `bind(this)`), we must keep references to the listener to make sure the same
      // reference is used in addEventListener and removeEventListener (and prevent potential memory leaks)
      this._showListener = this.show.bind(this);
      this._hideListener = this.hide.bind(this);
      // WCAG 1.4.13: leaving the trigger with the pointer only *schedules* the teardown, so the
      // pointer can still reach the tooltip; leaving it with the keyboard tears down at once.
      this._pointerLeaveListener = this._onTriggerPointerLeave.bind(this);
      this._focusOutListener = this._onTriggerBlur.bind(this);
    }

    connectedCallback() {
      super.connectedCallback();
      this._target = this.target;
      if (this._target) {
        this._target.addEventListener('mouseenter', this._showListener);
        this._target.addEventListener('focusin', this._showListener);
        this._target.addEventListener('mouseleave', this._pointerLeaveListener);
        this._target.addEventListener('focusout', this._focusOutListener);
        this._target.addEventListener('tap', this._hideListener);
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._target) {
        this.hide();
        this._target.removeEventListener('mouseenter', this._showListener);
        this._target.removeEventListener('focusin', this._showListener);
        this._target.removeEventListener('mouseleave', this._pointerLeaveListener);
        this._target.removeEventListener('focusout', this._focusOutListener);
        this._target.removeEventListener('tap', this._hideListener);
      }
      this._target = null;
    }

    show() {
      // Re-entering the trigger during the pointer grace period keeps the existing tooltip.
      this._cancelTooltipHide();
      if (this.isTooltipDismissed()) {
        return;
      }
      this._syncTooltipDescription();
      if (!this._tooltip && !this.hidden) {
        // create a paper tooltip and append to body
        this._tooltip = document.createElement('paper-tooltip');
        document.body.appendChild(this._tooltip);
        // clone content in <slot> and append to paper-tooltip body
        const tooltipRole = this.dataset.nxTooltipRole;
        this.$.content.assignedNodes().forEach((node) => {
          const clone = node.cloneNode(true);
          if (tooltipRole && clone.nodeType === Node.ELEMENT_NODE && !clone.dataset.nxTooltipRole) {
            clone.dataset.nxTooltipRole = tooltipRole;
          }
          this._tooltip.appendChild(clone);
        });
        // set manual mode to avoid setting extra listeners in paper-tooltip
        this._tooltip.manualMode = true;
        // configure tooltip properties and show
        this._tooltip._target = this._target;
        this._tooltip.animationDelay = this.animationDelay;
        this._tooltip.offset = this.offset;
        this._tooltip.position = this.position;
        this._tooltip.fitToVisibleBounds = true;
        this._prepareRenderedTooltip(this._tooltip);
        microTask.run(() => {
          // hide() may have nulled this._tooltip between scheduling and execution
          // (e.g., focus + immediate disconnect during a pointer interaction).
          if (this._tooltip && typeof this._tooltip.show === 'function') {
            this._tooltip.show();
          }
        });
      }
    }

    hide() {
      this._onTooltipTornDown();
      if (this._tooltip) {
        this._tooltip.hide();
        this._tooltip.remove();
        this._tooltip = null;
      }
    }

    /** Whether this instance currently has a visible `paper-tooltip` on the document. */
    isShowing() {
      const activeTooltip = this._tooltip;
      if (activeTooltip == null) {
        return false;
      }
      return !!activeTooltip._showing;
    }

    /** Repositions the active tooltip after its anchor moved; no-op when hidden. */
    updatePositionIfShowing() {
      if (this.isShowing() && typeof this._tooltip.updatePosition === 'function') {
        this._tooltip.updatePosition();
      }
    }

    /**
     * Dismisses the tooltip for a keyboard event.
     *
     * Only the dismissal keys act on it: WCAG 1.4.13 requires hover/focus content to stay visible
     * until its trigger moves away or the user dismisses it, so an unrelated keystroke must not
     * destroy it. Called without an event it dismisses unconditionally.
     *
     * @param {KeyboardEvent} [event]
     */
    keydown(event) {
      if (!event) {
        this._dismissTooltip();
        return;
      }
      this._onTooltipDismissKey(event);
    }

    /**
     * Gets the anchor element specified in the `for` attribute, or, if that doesn't exist, the parent node containing
     * the tooltip.
     *
     * Code adapted from paper-tooltip.
     */
    get target() {
      const { parentNode } = dom(this);
      // If the parentNode is a document fragment, then we need to use the host.
      const ownerRoot = dom(this).getOwnerRoot();
      let target;
      if (this.for) {
        target = dom(ownerRoot).querySelector(`#${this.for}`);
      } else {
        target = parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? ownerRoot.host : parentNode;
      }
      return target;
    }
  }

  customElements.define(Tooltip.is, Tooltip);
  Nuxeo.Tooltip = Tooltip;
}
