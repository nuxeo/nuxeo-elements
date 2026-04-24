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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-icons/image-icons.js';
import '@polymer/iron-icons/iron-icons.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import Cropper from 'cropperjs/dist/cropper.esm.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
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
  class ImageViewer extends mixinBehaviors([IronResizableBehavior, I18nBehavior], Nuxeo.Element) {
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
         * A short text alternative for the image.
         */
        alt: {
          type: String,
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
        <link rel="stylesheet" href="/node_modules/cropperjs/dist/cropper.css" />
        <style>
          :host {
            display: block;
            position: relative;
            width: 100%;
            height: 100%;
            --nuxeo-image-viewer-toolbar-color: #fff;
            --nuxeo-image-viewer-toolbar-bg: rgba(0, 0, 0, 0.88);
            --nuxeo-image-viewer-toolbar-ink-color: #fff;
            --nuxeo-image-viewer-toolbar-icon-shadow: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
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
            color: var(--nuxeo-image-viewer-toolbar-color);
            z-index: 25;
            text-align: center;
            padding: 4px;
            border-radius: 6px;
            background: var(--nuxeo-image-viewer-toolbar-bg);
            backdrop-filter: blur(6px);
          }

          paper-icon-button {
            width: 34px;
            height: 34px;
            color: var(--nuxeo-image-viewer-toolbar-color) !important;
            --paper-icon-button-ink-color: var(--nuxeo-image-viewer-toolbar-ink-color);
            filter: var(--nuxeo-image-viewer-toolbar-icon-shadow);
          }

          #image {
            display: none;
            max-width: 100%;
            max-height: 100%;
          }
        </style>

        <div id="canvas">
          <img id="image" src$="[[src]]" on-load="_init" alt$="[[alt]]" />
          <dom-if if="[[_isToolbarVisible(controls, src, _el)]]">
            <template>
              <div id="toolbar">
                <paper-icon-button
                  on-click="_click"
                  icon="zoom-out"
                  alt=""
                  data-action="zoom-out"
                  aria-label$="[[i18n('imagePreviewer.zoom.out')]]"
                  title$="[[i18n('imagePreviewer.zoom.out')]]"
                ></paper-icon-button>
                <dom-if if="[[!_fitToRealSize]]">
                  <template>
                    <paper-icon-button
                      on-click="_click"
                      icon="nuxeo:fit-to-real-size"
                      alt=""
                      data-action="fit-to-real-size"
                      aria-label$="[[i18n('imagePreviewer.fitToRealSize')]]"
                      title$="[[i18n('imagePreviewer.fitToRealSize')]]"
                    >
                    </paper-icon-button>
                  </template>
                </dom-if>
                <dom-if if="[[_fitToRealSize]]">
                  <template>
                    <paper-icon-button
                      on-click="_click"
                      icon="nuxeo:fit-to-viewer"
                      alt=""
                      data-action="fit-to-viewer"
                      aria-label$="[[i18n('imagePreviewer.fitToViewer')]]"
                      title$="[[i18n('imagePreviewer.fitToViewer')]]"
                    >
                    </paper-icon-button>
                  </template>
                </dom-if>
                <paper-icon-button
                  on-click="_click"
                  icon="zoom-in"
                  alt=""
                  data-action="zoom-in"
                  aria-label$="[[i18n('imagePreviewer.zoom.in')]]"
                  title$="[[i18n('imagePreviewer.zoom.in')]]"
                ></paper-icon-button>
                <paper-icon-button
                  on-click="_click"
                  icon="image:rotate-left"
                  alt=""
                  data-action="rotate-left"
                  aria-label$="[[i18n('imagePreviewer.rotate.left')]]"
                  title$="[[i18n('imagePreviewer.rotate.left')]]"
                >
                </paper-icon-button>
                <paper-icon-button
                  on-click="_click"
                  icon="image:rotate-right"
                  alt=""
                  data-action="rotate-right"
                  aria-label$="[[i18n('imagePreviewer.rotate.right')]]"
                  title$="[[i18n('imagePreviewer.rotate.right')]]"
                >
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
      this._applyToolbarTheme(this._getThemeByName('dark'));
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
          ready: () => this._scheduleToolbarContrastUpdate(),
          cropend: () => this._scheduleToolbarContrastUpdate(),
          zoom: (data) => {
            this._verifyZoomRatio(data);
            this._scheduleToolbarContrastUpdate();
          },
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
      this._scheduleToolbarContrastUpdate();
    }

    _getOriginalZoomRatio() {
      if (this._el) {
        const canvasData = this._el.initialCanvasData;
        return canvasData.width / canvasData.naturalWidth;
      }
    }

    _resize() {
      if (this._el && this._isCanvasVisible()) {
        this._el.resize();
        this._el.zoomTo(this._getOriginalZoomRatio());
        this._fitToRealSize = false;
        this._scheduleToolbarContrastUpdate();
      }
    }

    _verifyZoomRatio(data) {
      if (this._el && data && data.detail && data.detail.ratio) {
        // Cropper.js does not return always the same number of decimal places when rounding.
        // In order to ensure our calculations, we will use 5 decimal places.
        const decimalPlaces = 5;
        this._fitToRealSize =
          this._getOriginalZoomRatio().toFixed(decimalPlaces) !== data.detail.ratio.toFixed(decimalPlaces);
      }
    }

    _isCanvasVisible() {
      const { canvas } = this.$;
      return canvas && canvas.offsetWidth !== 0 && canvas.offsetHeight !== 0;
    }

    _isToolbarVisible(controls, src, el) {
      return controls && src && el;
    }

    _scheduleToolbarContrastUpdate() {
      if (this.__toolbarContrastFrame) {
        cancelAnimationFrame(this.__toolbarContrastFrame);
      }
      this.__toolbarContrastFrame = requestAnimationFrame(() => {
        this.__toolbarContrastFrame = null;
        this._updateToolbarContrast();
      });
    }

    _updateToolbarContrast() {
      if (!this.controls || !this._el) {
        return;
      }

      const sampleLuminance = this._getToolbarBackgroundLuminance();
      if (sampleLuminance === null) {
        this._applyToolbarTheme(this._getThemeByName('dark'));
        return;
      }

      const themes = [this._getThemeByName('dark'), this._getThemeByName('light')];
      const rankedThemes = themes
        .map((theme) => {
          const mixedLuminance = this._mixLuminance(theme.surfaceLuminance, sampleLuminance, theme.surfaceAlpha);
          const iconContrast = this._contrastRatio(theme.iconLuminance, mixedLuminance);
          const surfaceContrast = this._contrastRatio(mixedLuminance, sampleLuminance);
          return {
            theme,
            iconContrast,
            surfaceContrast,
            passes: iconContrast >= 3 && surfaceContrast >= 3,
          };
        })
        .sort((a, b) => {
          if (a.passes && !b.passes) {
            return -1;
          }
          if (!a.passes && b.passes) {
            return 1;
          }
          const aScore = Math.min(a.iconContrast, a.surfaceContrast);
          const bScore = Math.min(b.iconContrast, b.surfaceContrast);
          return bScore - aScore;
        });

      this._applyToolbarTheme(rankedThemes[0].theme);
    }

    _getToolbarBackgroundLuminance() {
      const toolbar = this.shadowRoot && this.shadowRoot.querySelector('#toolbar');
      if (!toolbar || !this.$.image || !this.$.image.naturalWidth || !this.$.image.naturalHeight) {
        return null;
      }

      const canvasData = this._el.getCanvasData && this._el.getCanvasData();
      if (!canvasData || !canvasData.width || !canvasData.height) {
        return null;
      }

      const viewerRect = this.$.canvas.getBoundingClientRect();
      const toolbarRect = toolbar.getBoundingClientRect();
      const toolbarLeft = toolbarRect.left - viewerRect.left;
      const toolbarTop = toolbarRect.top - viewerRect.top;
      const toolbarWidth = toolbarRect.width;
      const toolbarHeight = toolbarRect.height;

      const areaLeft = Math.max(toolbarLeft, canvasData.left);
      const areaTop = Math.max(toolbarTop, canvasData.top);
      const areaRight = Math.min(toolbarLeft + toolbarWidth, canvasData.left + canvasData.width);
      const areaBottom = Math.min(toolbarTop + toolbarHeight, canvasData.top + canvasData.height);

      const areaWidth = areaRight - areaLeft;
      const areaHeight = areaBottom - areaTop;
      if (areaWidth <= 1 || areaHeight <= 1) {
        return null;
      }

      const { naturalWidth, naturalHeight } = this.$.image;
      const sx = Math.max(0, ((areaLeft - canvasData.left) / canvasData.width) * naturalWidth);
      const sy = Math.max(0, ((areaTop - canvasData.top) / canvasData.height) * naturalHeight);
      const sw = Math.min(naturalWidth - sx, (areaWidth / canvasData.width) * naturalWidth);
      const sh = Math.min(naturalHeight - sy, (areaHeight / canvasData.height) * naturalHeight);
      if (sw <= 1 || sh <= 1) {
        return null;
      }

      try {
        if (!this.__contrastCanvas) {
          this.__contrastCanvas = document.createElement('canvas');
          this.__contrastCanvas.width = 24;
          this.__contrastCanvas.height = 24;
        }
        const context = this.__contrastCanvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          return null;
        }
        context.clearRect(0, 0, this.__contrastCanvas.width, this.__contrastCanvas.height);
        context.drawImage(
          this.$.image,
          sx,
          sy,
          sw,
          sh,
          0,
          0,
          this.__contrastCanvas.width,
          this.__contrastCanvas.height,
        );
        const imageData = context.getImageData(0, 0, this.__contrastCanvas.width, this.__contrastCanvas.height).data;
        let total = 0;
        const pixels = imageData.length / 4;
        for (let index = 0; index < imageData.length; index += 4) {
          total += this._relativeLuminanceFromRgb(imageData[index], imageData[index + 1], imageData[index + 2]);
        }
        return pixels > 0 ? total / pixels : null;
      } catch (_) {
        return null;
      }
    }

    _applyToolbarTheme(theme) {
      if (!theme) {
        return;
      }
      this.updateStyles({
        '--nuxeo-image-viewer-toolbar-color': theme.iconColor,
        '--nuxeo-image-viewer-toolbar-ink-color': theme.iconColor,
        '--nuxeo-image-viewer-toolbar-bg': `rgba(${theme.surfaceRgb.r},
        ${theme.surfaceRgb.g}, ${theme.surfaceRgb.b}, ${theme.surfaceAlpha})`,
        '--nuxeo-image-viewer-toolbar-icon-shadow': theme.iconShadow,
      });
    }

    _getThemeByName(name) {
      if (name === 'light') {
        return {
          iconColor: '#111111',
          iconLuminance: this._relativeLuminanceFromRgb(17, 17, 17),
          surfaceRgb: { r: 255, g: 255, b: 255 },
          surfaceLuminance: 1,
          surfaceAlpha: 0.82,
          iconShadow: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.9))',
        };
      }
      return {
        iconColor: '#ffffff',
        iconLuminance: 1,
        surfaceRgb: { r: 0, g: 0, b: 0 },
        surfaceLuminance: 0,
        surfaceAlpha: 0.82,
        iconShadow: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))',
      };
    }

    _mixLuminance(foreground, background, alpha) {
      return foreground * alpha + background * (1 - alpha);
    }

    _contrastRatio(firstLuminance, secondLuminance) {
      const light = Math.max(firstLuminance, secondLuminance);
      const dark = Math.min(firstLuminance, secondLuminance);
      return (light + 0.05) / (dark + 0.05);
    }

    _relativeLuminanceFromRgb(red, green, blue) {
      const r = this._linearizeSrgb(red / 255);
      const g = this._linearizeSrgb(green / 255);
      const b = this._linearizeSrgb(blue / 255);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    _linearizeSrgb(value) {
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }
  }

  customElements.define(ImageViewer.is, ImageViewer);
  Nuxeo.ImageViewer = ImageViewer;
}
