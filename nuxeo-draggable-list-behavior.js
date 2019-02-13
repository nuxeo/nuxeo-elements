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
import '@polymer/polymer/polymer-legacy.js';

import '@nuxeo/nuxeo-elements/nuxeo-element.js';

const $_documentContainer = document.createElement('template'); // eslint-disable-line camelcase

$_documentContainer.innerHTML = `<dom-module id="nuxeo-drag-proxy">
  <template>
    <style include="nuxeo-styles">
      :host {
        display: inline-block;
        position: absolute;
      }

      :host([hidden]) {
        display: none !important;
      }

      span {
        background-color: var(--nuxeo-primary-color);
        border-radius: 50%;
        color: white;
        display: inline-block;
        font-size: 10px;
        margin: 7px;
        text-align: center;
        line-height: 16px;
        height: 16px;
        width: 16px;
      }
    </style>

    <span>[[counter]]</span>
  </template>

  
  
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/**
 * @polymerBehavior
 */
export const DraggableListBehavior = {

  properties: {
    draggable: {
      type: Boolean,
      value: false,
      reflectToAttribute: true,
    },

    /**
     * Function used to compute if an element is a drop target.
     */
    dropTargetFilter: {
      type: Function,
      value() {
        return this.dropTargetFilter.bind(this);
      },
    },

    /**
     * Function used to compute if an element is draggable.
     */
    draggableFilter: {
      type: Function,
      value() {
        return this.draggableFilter.bind(this);
      },
    },
  },

  attached() {
    let proxy;
    const bodyEl = document.querySelector('body');
    // mouse move handler
    const moveFn = (e) => {
      // ELEMENTS-723: prevent dragging from beginning too early, which can interfere with other mouse events
      if (((new Date()).getTime() - this._mouseDownStarted) <= 150) {
        return;
      }
      // block list pointer events while dragging and apply grabbing cursor
      this.style.pointerEvents = 'none';
      bodyEl.setAttribute('style', 'cursor: grabbing; cursor: -webkit-grabbing;');
      // create proxy with number of items that are being dragged
      if (!proxy) {
        proxy = document.createElement('nuxeo-drag-proxy');
        proxy.counter = this.selectedItems.length;
        bodyEl.appendChild(proxy);
      }
      proxy.setPosition(e.pageX, e.pageY);
      proxy.hidden = false;
      // scroll the list if mouse is hovering the bottom/top part of the list
      this._scrollList(e);
      // iterate drop targets and check if mouse is hovering any target
      this.target = null;
      this.droptargets.forEach((target) => {
        target.classList.remove('droptarget-hover');
        const boundingClientRect = target.getBoundingClientRect();
        if (e.clientX > boundingClientRect.left && e.clientX < boundingClientRect.right &&
        e.clientY > boundingClientRect.top && e.clientY < boundingClientRect.bottom) {
          this.target = target;
        }
      });
      if (this.target) {
      // block DnD if mouse target belongs to the selected items
        if (this.selectedItems.indexOf(this.modelForElement(this.target).item) > -1) {
          this.target = null;
          proxy.hidden = true;
          bodyEl.style.cursor = 'not-allowed';
        } else {
          this.target.classList.add('droptarget-hover');
        }
      }
    };

    // mouse up handler
    const upFn = () => {
      // restore list pointer events, restore cursor and remove proxy
      this._mouseDownStarted = null;
      this.style.pointerEvents = '';
      bodyEl.style.cursor = '';
      if (proxy) {
        bodyEl.removeChild(proxy);
        proxy = null;
      }
      // cleanup listeners
      document.removeEventListener('mousemove', moveFn);
      document.removeEventListener('mouseup', upFn);
      if (this.target) {
        this.target.classList.remove('droptarget-hover');
        this.fire('nuxeo-documents-dropped', {
          targetDocument: this.modelForElement(this.target).item,
          documents: this.selectedItems,
        });
        this.target = null;
      }
    };

    this.addEventListener('mousedown', (e) => {
      if (this.draggable && e.target && this.draggableFilter(e.target)) {
        // prevent default behavior to make sure cursors are applied across all browsers
        e.preventDefault();
        this._mouseDownStarted = this._mouseDownStarted || (new Date()).getTime();
        // setup listeners when drag starts
        document.addEventListener('mousemove', moveFn);
        document.addEventListener('mouseup', upFn);
      }
    });
  },

  get droptargets() {
    return Array.from(this.$.list.queryAllEffectiveChildren('*')).filter((el) => this.dropTargetFilter(
      el,
      this.modelForElement(el),
    ));
  },

  // override with custom logic
  dropTargetFilter(el, model) { // eslint-disable-line no-unused-vars
    return true;
  },

  // override with custom logic
  draggableFilter(el) { // eslint-disable-line no-unused-vars
    return true;
  },

  _scrollList(e) {
    const container = this.$.list;
    const threshold = 100;
    const boundingClientRect = container.getBoundingClientRect();
    const scrollRate = 30; // increase or decrease this to speed up or slow down scrolling
    if (boundingClientRect.bottom - e.pageY <= threshold) { // scroll down
      container.scrollTop += scrollRate;
    } else if (e.pageY >= boundingClientRect.top && e.pageY <= (boundingClientRect.top + threshold)) { // scroll up
      container.scrollTop -= scrollRate;
    }
  },
};

{
  class DragProxy extends Nuxeo.Element {

    static get is() {
      return 'nuxeo-drag-proxy';
    }

    static get properties() {
      return {
        counter: Number,
      };
    }

    setPosition(x, y) {
      this.style.left = `${x}px`;
      this.style.top = `${y}px`;
    }

  }

  customElements.define(DragProxy.is, DragProxy);
  Nuxeo.DragProxy = DragProxy;
}
