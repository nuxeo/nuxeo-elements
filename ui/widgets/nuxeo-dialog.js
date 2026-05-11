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
import { NeonAnimationRunnerBehavior } from '@polymer/neon-animation/neon-animation-runner-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { PaperDialogBehavior } from '@polymer/paper-dialog-behavior/paper-dialog-behavior.js';
import '@polymer/paper-dialog-behavior/paper-dialog-shared-styles.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';
import { IronOverlayManager } from '@polymer/iron-overlay-behavior/iron-overlay-manager.js';

// ELEMENTS-884 - fix backdrops
// revert https://github.com/PolymerElements/iron-overlay-behavior/commit/ac1cb
IronOverlayManager._overlayWithBackdrop = function() {
  for (let i = 0; i < this._overlays.length; i++) {
    if (this._overlays[i].withBackdrop) {
      return this._overlays[i];
    }
  }
};

{
  /**
   * A dialog element.
   *
   * If a `<template>` is passed as the dialog's content, that `<template>` will be stamped when dialog is opened.
   *
   * @appliesMixin Polymer.NeonAnimationRunnerBehavior
   * @appliesMixin Polymer.Templatizer
   * @memberof Nuxeo
   * @demo demo/nuxeo-dialog/index.html
   */
  class Dialog extends mixinBehaviors([PaperDialogBehavior, NeonAnimationRunnerBehavior, Templatizer], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="paper-dialog-shared-styles">
          :host {
            @apply --nuxeo-dialog;
            visibility: visible;
          }

          :host > ::slotted(h2),
          :host > ::slotted(*) {
            margin-top: 16px;
          }

          :host > ::slotted(.buttons) {
            @apply --layout-horizontal;
            @apply --layout-justified;
            margin-top: 16px;
          }
        </style>

        <slot></slot>
      `;
    }

    static get is() {
      return 'nuxeo-dialog';
    }

    static get properties() {
      return {
        /**
         * Make sure dialog is positioned after the backdrop element.
         * Should only be used when the dialog appears behind the backdrop because of stacking context issues.
         */
        reparent: {
          type: Boolean,
          value: false,
        },
      };
    }

    static get observers() {
      return ['_openedModalChanged(opened, modal)'];
    }

    ready() {
      super.ready();
      this.addEventListener('iron-overlay-opened', this._opened);
      this.addEventListener('iron-overlay-closed', this._onDialogClosed);
      this._boundTrapTab = this._trapTab.bind(this);
      this._inertApplied = false;
    }

    /**
     * Override IronOverlayBehavior's tab-trapping methods. IronOverlayManager registers
     * its own document-level keydown listener that calls _onCaptureTab on the current overlay.
     * That handler uses a shallow focusable-node list that doesn't traverse shadow DOM deeply,
     * causing focus to escape in complex components like nuxeo-document-create-popup.
     *
     * Our _trapTab handles focus trapping correctly via a deep shadow DOM traversal for
     * both modal and withBackdrop dialogs, so both hooks are suppressed.
     */
    _onCaptureTab() {
      // No-op: focus trapping handled by _trapTab
    }

    disconnectedCallback() {
      // workaround to prevent IronOverlayBehavior.detached() from being called when unattached
      if (this._observer) {
        this.detached();
      }
      document.removeEventListener('keydown', this._boundTrapTab, true);
      // Only clear inert if this instance previously applied it
      if (this._inertApplied) {
        this._setBackgroundInert(false);
        this._inertApplied = false;
      }
      this._clear();
    }

    _opened(e) {
      const isIOS = /iPhone|iPad|iPod/.test(window.navigator.userAgent);
      if ((this.reparent && e.target.withBackdrop) || isIOS) {
        e.target.parentNode.insertBefore(e.target.backdropElement, e.target);
      }

      if (!this._instance) {
        const template = dom(this).querySelector('nuxeo-dialog > template');
        if (template) {
          // prevent "A <template> can only be templatized once" error
          if (!this._templatizerTemplate) {
            this.templatize(template);
          }
          this._instance = this.stamp();
          this.appendChild(this._instance.root);
        }
      }

      // Enable focus trapping for modal or withBackdrop dialogs
      if (this.modal || this.withBackdrop) {
        this._enableFocusTrap(true);
        // Wait for nested templates and custom elements to fully render before focusing
        afterNextRender(this, () => {
          if (!this._containsDeepFocus()) {
            const focusTarget = this.querySelector('[autofocus]');
            if (focusTarget) {
              focusTarget.focus();
            } else {
              const focusables = this._getFocusableElements();
              if (focusables.length > 0) {
                focusables[0].focus();
              } else {
                this.focus();
              }
            }
          }
        });
      }
    }

    /**
     * Observes opened + modal to apply aria-modal and inert.
     * Focus trap is enabled in _opened handler (iron-overlay-opened event)
     * to avoid timing issues with withBackdrop which may be undefined initially.
     */
    _openedModalChanged(opened, modal) {
      if (opened && modal) {
        this.setAttribute('aria-modal', 'true');
        this._enableFocusTrap(true);
      } else if (opened && !modal) {
        // modal was toggled off while dialog is open
        this.removeAttribute('aria-modal');
        // Disable focus trap and clear inert unless withBackdrop still requires it
        if (!this.withBackdrop) {
          this._disableFocusTrap(true);
        }
      } else if (!opened && modal) {
        this.removeAttribute('aria-modal');
        this._disableFocusTrap(true);
      }
    }

    _onDialogClosed() {
      if (this.modal || this.withBackdrop) {
        if (this.modal) {
          this.removeAttribute('aria-modal');
        }
        this._disableFocusTrap(true);
      }
    }

    _enableFocusTrap(setInert) {
      if (setInert && !this._inertApplied) {
        this._setBackgroundInert(true);
        this._inertApplied = true;
      }
      // Remove first to prevent duplicate registrations
      document.removeEventListener('keydown', this._boundTrapTab, true);
      document.addEventListener('keydown', this._boundTrapTab, true);
    }

    _disableFocusTrap(clearInert) {
      document.removeEventListener('keydown', this._boundTrapTab, true);
      if (clearInert && this._inertApplied) {
        this._setBackgroundInert(false);
        this._inertApplied = false;
      }
    }

    /**
     * Traps Tab/Shift+Tab within the dialog by wrapping focus at the boundaries.
     * Only intercepts Tab when focus would escape the dialog (at the first or last
     * focusable element). For all other positions, the browser's native Tab behavior
     * is preserved — this ensures that components with their own Tab key handling
     * (e.g., nuxeo-selectivity dropdowns) continue to work correctly.
     */
    _trapTab(e) {
      if (e.key !== 'Tab' || !this.opened || !(this.modal || this.withBackdrop)) {
        return;
      }

      // Only trap if the focused element is within this dialog (composed tree).
      // This prevents stealing focus from other overlays when multiple dialogs are open.
      if (!this._containsDeepFocus()) {
        return;
      }

      const focusables = this._getFocusableElements();
      if (focusables.length === 0) {
        e.preventDefault();
        this.focus();
        return;
      }

      const active = this._getDeepActiveElement();
      let activeIndex = focusables.indexOf(active);

      // If not found directly, the active element may be inside a focusable (e.g., inside
      // a paper-tab's shadow DOM). Find the closest ancestor/host that's in the list.
      if (activeIndex === -1) {
        activeIndex = this._findContainingFocusableIndex(active, focusables);
      }

      if (e.shiftKey) {
        // Shift+Tab at or before first focusable: wrap to last
        if (activeIndex <= 0) {
          e.preventDefault();
          focusables[focusables.length - 1].focus();
        }
        // Otherwise let the browser handle Tab naturally
      } else if (activeIndex === -1 || activeIndex >= focusables.length - 1) {
        // Tab at or past last focusable, or not found: wrap to first
        e.preventDefault();
        focusables[0].focus();
      }
      // Otherwise let the browser handle Tab naturally
    }

    /**
     * Gets all focusable elements within the dialog, traversing shadow roots.
     * Uses a Set to avoid collecting duplicates when the same element is reachable
     * through multiple paths (light DOM children + slot assignments + shadow roots).
     * When an element is itself focusable, we do NOT descend into its shadow root —
     * the element manages its own internal focus (e.g., paper-tabs uses arrow keys).
     */
    _getFocusableElements() {
      const selectors = [
        'a[href]:not([disabled]):not([inert])',
        'button:not([disabled]):not([inert])',
        'input:not([disabled]):not([inert]):not([type="hidden"])',
        'select:not([disabled]):not([inert])',
        'textarea:not([disabled]):not([inert])',
        '[tabindex]:not([tabindex="-1"]):not([disabled]):not([inert])',
      ].join(',');

      const results = [];
      const visited = new Set();
      this._collectFocusables(this, selectors, results, visited);
      return results;
    }

    _collectFocusables(root, selectors, results, visited) {
      // Avoid traversing the same root multiple times
      if (visited.has(root)) {
        return;
      }
      visited.add(root);

      const children = Array.from(root.children);
      children.forEach((el) => {
        // Skip non-Element nodes (e.g. document fragments, text nodes)
        if (!el.matches) {
          return;
        }
        // Traverse into slotted content (assigned nodes of <slot> elements)
        if (el.localName === 'slot') {
          const assigned = el.assignedElements({ flatten: true });
          assigned.forEach((slotted) => {
            if (!visited.has(slotted)) {
              if (slotted.matches && slotted.matches(selectors) && this._isVisible(slotted)) {
                // Element is focusable — add it and skip its subtree
                results.push(slotted);
                visited.add(slotted);
              } else {
                // Not focusable — descend into it
                this._collectFocusables(slotted, selectors, results, visited);
                if (slotted.shadowRoot) {
                  this._collectFocusables(slotted.shadowRoot, selectors, results, visited);
                }
              }
            }
          });
          return;
        }
        if (!visited.has(el)) {
          if (el.matches(selectors) && this._isVisible(el)) {
            // Element is focusable — add it and skip its subtree (including shadow root)
            results.push(el);
            visited.add(el);
          } else {
            // Not focusable — recurse into children and shadow root.
            // _collectFocusables will add el to visited as it processes it.
            this._collectFocusables(el, selectors, results, visited);
            if (el.shadowRoot) {
              this._collectFocusables(el.shadowRoot, selectors, results, visited);
            }
          }
        }
      });
    }

    _isVisible(el) {
      return el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0;
    }

    /**
     * Returns the deepest active element, traversing shadow roots.
     */
    _getDeepActiveElement() {
      let active = document.activeElement;
      while (active && active.shadowRoot && active.shadowRoot.activeElement) {
        active = active.shadowRoot.activeElement;
      }
      return active;
    }

    /**
     * Checks whether the currently focused element is within this dialog,
     * traversing through shadow DOM boundaries (composed tree).
     */
    _containsDeepFocus() {
      let current = this._getDeepActiveElement();
      while (current) {
        if (current === this) {
          return true;
        }
        if (current.parentNode instanceof ShadowRoot) {
          current = current.parentNode.host;
        } else {
          current = current.parentElement;
        }
      }
      return false;
    }

    /**
     * Finds the index of the focusable element that contains the given active element,
     * walking up through parents and shadow DOM hosts. This handles cases where focus
     * is on a child inside a focusable (e.g., inside paper-tab's shadow DOM).
     */
    _findContainingFocusableIndex(active, focusables) {
      let current = active;
      while (current && current !== this) {
        const idx = focusables.indexOf(current);
        if (idx !== -1) {
          return idx;
        }
        // Walk up: if inside a shadow root, go to the host; otherwise go to parentElement
        if (current.parentNode instanceof ShadowRoot) {
          current = current.parentNode.host;
        } else {
          current = current.parentElement;
        }
      }
      return -1;
    }

    /**
     * Sets the `inert` attribute on sibling elements at every ancestor level from the dialog
     * up to document.body, including siblings within shadow roots. This prevents keyboard
     * focus and screen readers from accessing background content behind the dialog.
     *
     * Uses a ref-counting approach via `__nuxeoDialogInertCount` to safely handle:
     * - Multiple stacked dialogs (each dialog increments/decrements the counter)
     * - Pre-existing inert attributes (only removes inert when all dialog references are cleared)
     */
    _setBackgroundInert(inert) {
      let current = this;
      let parent = this.parentNode;

      while (parent) {
        Array.from(parent.children).forEach((sibling) => {
          if (sibling === current || sibling.localName === 'style' || sibling.localName === 'script') {
            return;
          }
          if (inert) {
            if (!sibling.__nuxeoDialogInertCount) {
              sibling.__nuxeoDialogInertCount = 0;
              // Track whether the element was already inert before we touched it
              sibling.__nuxeoDialogWasInert = sibling.hasAttribute('inert');
            }
            sibling.__nuxeoDialogInertCount++;
            sibling.setAttribute('inert', '');
          } else if (sibling.__nuxeoDialogInertCount > 0) {
            sibling.__nuxeoDialogInertCount--;
            if (sibling.__nuxeoDialogInertCount === 0) {
              // Only remove inert if the element wasn't already inert before
              if (!sibling.__nuxeoDialogWasInert) {
                sibling.removeAttribute('inert');
              }
              delete sibling.__nuxeoDialogInertCount;
              delete sibling.__nuxeoDialogWasInert;
            }
          }
        });

        if (parent instanceof ShadowRoot) {
          current = parent.host;
          parent = current.parentNode;
        } else {
          current = parent;
          parent = parent.parentNode;
        }
      }
    }

    _clear() {
      if (this._instance) {
        const c$ = this._instance.children;
        if (c$ && c$.length) {
          // use first child parent, for case when dom-if may have been detached
          const parent = dom(dom(c$[0]).parentNode);

          for (let i = 0, n; i < c$.length && (n = c$[i]); i++) {
            parent.removeChild(n);
          }
        }
        this._instance = null;
      }
    }

    _forwardHostPropV2(prop, value) {
      if (this._instance) {
        this._instance.forwardHostProp(prop, value);
      }
    }
  }

  customElements.define(Dialog.is, Dialog);
  Nuxeo.Dialog = Dialog;
}
