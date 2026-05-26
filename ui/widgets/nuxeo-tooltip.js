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
import { microTask } from '@polymer/polymer/lib/utils/async.js';

const CLONED_CONTENT_STYLES_ID = 'nuxeo-tooltip-cloned-content-styles';

/**
 * Slot content is cloned into `paper-tooltip` on `document.body`, so shadow-DOM styles do not apply.
 * Role-specific rules for cloned nodes live here; set `data-nx-tooltip-role` on `<nuxeo-tooltip>`.
 */
function ensureClonedContentStyles() {
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
   * @memberof Nuxeo
   * @demo demo/nuxeo-tooltip/index.html
   */
  class Tooltip extends Nuxeo.Element {
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
      this._keyListener = this.keydown.bind(this);
    }

    connectedCallback() {
      super.connectedCallback();
      this._target = this.target;
      if (this._target) {
        this._target.addEventListener('mouseenter', this._showListener);
        this._target.addEventListener('focus', this._showListener);
        this._target.addEventListener('mouseleave', this._hideListener);
        this._target.addEventListener('blur', this._hideListener);
        this._target.addEventListener('tap', this._hideListener);
        window.addEventListener('keydown', this._keyListener);
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._target) {
        this.hide();
        this._target.removeEventListener('mouseenter', this._showListener);
        this._target.removeEventListener('focus', this._showListener);
        this._target.removeEventListener('mouseleave', this._hideListener);
        this._target.removeEventListener('blur', this._hideListener);
        this._target.removeEventListener('tap', this._hideListener);
        window.removeEventListener('keydown', this._keyListener);
      }
      this._target = null;
    }

    show() {
      if (!this._tooltip && !this.hidden) {
        // create a paper tooltip and append to body
        this._tooltip = document.createElement('paper-tooltip');
        document.body.appendChild(this._tooltip);
        // clone content in <slot> and append to paper-tooltip body
        const tooltipRole = this.getAttribute('data-nx-tooltip-role');
        this.$.content.assignedNodes().forEach((node) => {
          const clone = node.cloneNode(true);
          if (tooltipRole && clone.nodeType === Node.ELEMENT_NODE && !clone.hasAttribute('data-nx-tooltip-role')) {
            clone.setAttribute('data-nx-tooltip-role', tooltipRole);
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
        microTask.run(() => {
          this._tooltip.show();
        });
      }
    }

    hide() {
      if (this._tooltip) {
        this._tooltip.hide();
        if (this._tooltip.parentNode) {
          this._tooltip.parentNode.removeChild(this._tooltip);
        }
        this._tooltip = null;
      }
    }

    keydown() {
      this.hide();
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
