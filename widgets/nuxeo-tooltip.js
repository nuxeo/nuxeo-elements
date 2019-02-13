/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

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
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._target) {
        this._target.removeEventListener('mouseenter', this._showListener);
        this._target.removeEventListener('focus', this._showListener);
        this._target.removeEventListener('mouseleave', this._hideListener);
        this._target.removeEventListener('blur', this._hideListener);
        this._target.removeEventListener('tap', this._hideListener);
      }
      this._target = null;
    }

    show() {
      if (!this._tooltip) {
        // create a paper tooltip and append to body
        this._tooltip = document.createElement('paper-tooltip');
        document.body.appendChild(this._tooltip);
        // clone content in <slot> and append to paper-tooltip body
        this.$.content.assignedNodes().forEach((node) => {
          this._tooltip.appendChild(node.cloneNode(true));
        });
        // set manual mode to avoid setting extra listeners in paper-tooltip
        this._tooltip.manualMode = true;
        // configure tooltip properties and show
        this._tooltip._target = this._target;
        this._tooltip.animationDelay = this.animationDelay;
        this._tooltip.offset = this.offset;
        this._tooltip.position = this.position;
        this._tooltip.fitToVisibleBounds = true;
        this._tooltip.show();
      }
    }

    hide() {
      if (this._tooltip) {
        document.body.removeChild(this._tooltip);
        this._tooltip = null;
      }
    }

    /**
     * Gets the anchor element specified in the `for` attribute, or, if that doesn't exist, the parent node containing
     * the tooltip.
     *
     * Code adapted from paper-tooltip.
     */
    get target() {
      const parentNode = dom(this).parentNode;
      // If the parentNode is a document fragment, then we need to use the host.
      const ownerRoot = dom(this).getOwnerRoot();
      let target;
      if (this.for) {
        target = dom(ownerRoot).querySelector(`#${this.for}`);
      } else {
        target = parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE ?
          ownerRoot.host : parentNode;
      }
      return target;
    }
  }

  customElements.define(Tooltip.is, Tooltip);
  Nuxeo.Tooltip = Tooltip;
}
