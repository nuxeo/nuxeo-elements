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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-icons/image-icons.js';
import '@polymer/iron-icons/iron-icons.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import 'cropperjs/dist/cropper.esm.js';
import '../nuxeo-icons.js';

{
  /**
   * An element for viewing images.
   *
   * Example:
   *
   *     <nuxeo-image-viewer src="[[document.properties.file:content.data]]"
   *                         controls
   *                         responsive>
   *     </nuxeo-image-viewer>
   *
   * @appliesMixin Polymer.IronResizableBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-image-viewer/index.html
   */
  class ImageViewer extends mixinBehaviors([IronResizableBehavior], Nuxeo.Element) {

    static get is() {
      return 'nuxeo-image-viewer';
    }

    static get properties() {
      return {
        /**
         * The URL of an image.
         */
        src: {
          type: String,
        },

        /**
         * If true, controls for the user to interact with are displayed.
         */
        controls: {
          type: Boolean,
          value: false,
        },

        /**
         * If true, allows to zoom the image by wheeling mouse.
         */
        zoomOnWheel: {
          type: Boolean,
          value: false,
        },

        /**
         * If true, the element exhibits responsive resize behavior.
         */
        responsive: {
          type: Boolean,
          value: false,
        },

        /**
         * If false, the element will show the image in order to fit the viewer.
         * If true, the element will show the image in real size.
         */
        _fitToRealSize: {
          type: Boolean,
          value: false,
        },
      };
    }

    static get importMeta() {
      return import.meta;
    }

    static get template() {
      return html`
        <link rel="stylesheet" href="/node_modules/cropperjs/dist/cropper.css">
        <style>
          :host {
            display: block;
            position: relative;
          }

          #canvas {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }

          #toolbar {
            position: absolute;
            bottom: 16px;
            max-width: 300px;
            left: 50%;
            transform: translateX(-50%);
            color: #fff;
            z-index: 25;
            text-align: center;
            padding: 2px;
            border-radius: 4px;
            background-color: rgba(0, 0, 0, 0.5);
          }

          paper-icon-button {
            width: 34px;
            height: 34px;
            color: white !important;
            --paper-icon-button-ink-color: white;
          }

          #image {
            display: none;
            max-width: 100%;
            max-height: 100%;
          }
        </style>

        <div id="canvas">
          <img id="image" src$="[[src]]" on-load="_init">
          <dom-if if="[[controls]]">
            <template>
              <div id="toolbar">
                <paper-icon-button on-click="_click" icon="zoom-out" data-action="zoom-out"></paper-icon-button>
                <paper-icon-button
                  on-click="_click"
                  icon="[[_getFitIcon(_fitToRealSize)]]"
                  data-action$="[[_computeFitAction(_fitToRealSize)]]">
                </paper-icon-button>
                <paper-icon-button on-click="_click" icon="zoom-in" data-action="zoom-in"></paper-icon-button>
                <paper-icon-button on-click="_click" icon="image:rotate-left" data-action="rotate-left">
                </paper-icon-button>
                <paper-icon-button on-click="_click" icon="image:rotate-right" data-action="rotate-right">
                </paper-icon-button>
              </div>
            </template>
          </dom-if>
        </div>
      `;
    }

    ready() {
      super.ready();
      this.addEventListener('iron-resize', this._resize);
    }

    _init() {
      if (this._el) {
        this._el.destroy();
      }

      if (this.src) {
        const options = {
          autoCrop: false,
          background: false,
          checkCrossOrigin: false,
          checkOrientation: false,
          dragMode: 'move',
          responsive: false,
          restore: false,
          toggleDragModeOnDblclick: false,
          viewMode: 1,
          zoomOnWheel: this.zoomOnWheel,
          zoom: (data) => this._verifyZoomRatio(data),
        };
        this._el = new Cropper(this.$.image, options);
      }
    }

    _click(event) {
      const action = event.target.dataset.action || event.target.parentNode.dataset.action;
      switch (action) {
        case 'zoom-in':
          this._el.zoom(0.1);
          break;
        case 'zoom-out':
          this._el.zoom(-0.1);
          break;
        case 'fit-to-viewer':
          this._el.zoomTo(this._getOriginalZoomRatio());
          break;
        case 'fit-to-real-size':
          this._el.zoomTo(1);
          break;
        case 'rotate-left':
          this._el.rotate(-90);
          break;
        case 'rotate-right':
          this._el.rotate(90);
          break;
        default:
          // do nothing
      }
    }

    _computeFitAction(fitToRealSize) {
      return fitToRealSize ? 'fit-to-viewer' : 'fit-to-real-size';
    }

    _getFitIcon(fitToRealSize) {
      return `nuxeo:${this._computeFitAction(fitToRealSize)}`;
    }

    _getOriginalZoomRatio() {
      if (this._el) {
        const canvasData = this._el.initialCanvasData;
        return canvasData.width / canvasData.naturalWidth;
      }
    }

    _resize() {
      if (this._el) {
        this._el.resize();
        this._fitToRealSize = false;
      }
    }

    _verifyZoomRatio(data) {
      if (this._el) {
        // Cropper.js not always return the same number of decimal places and rounding.
        // In order to ensure our calculations, we will use 5 decimal places.
        const decimalPlaces = 5;
        this._fitToRealSize = this._getOriginalZoomRatio().toFixed(decimalPlaces) !== data.ratio.toFixed(decimalPlaces);
      }
    }
  }

  customElements.define(ImageViewer.is, ImageViewer);
  Nuxeo.ImageViewer = ImageViewer;
}
