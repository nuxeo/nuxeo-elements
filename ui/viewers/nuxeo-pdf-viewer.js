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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';

{
  /**
   * An element for viewing PDF files.
   *
   * Example:
   *
   *     <nuxeo-pdf-viewer src="sample.pdf"></nuxeo-pdf-viewer>
   *
   * ### Styling
   *
   * The following custom properties and mixins are available for styling:
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--nuxeo-pdf-viewer-layout` | Mixin applied to the viewer | `{}`
   * `--nuxeo-pdf-viewer-iframe` | Mixin applied to the iframe enclosing pdfjs | `{}`
   *
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-pdf-viewer/index.html
   */
  class PDFViewer extends Nuxeo.Element {
    static get template() {
      return html`
        <style>
          :host {
            display: block;
            @apply --nuxeo-pdf-viewer-layout;
          }

          iframe {
            width: 100%;
            height: 100%;
            min-height: var(--nuxeo-viewer-min-height, 60vh);
            border: 0;
            @apply --nuxeo-pdf-viewer-iframe;
          }
        </style>

        <iframe src$="[[_path(src)]]"></iframe>
      `;
    }

    static get is() {
      return 'nuxeo-pdf-viewer';
    }

    static get properties() {
      return {
        /**
         * The path to the pdf file to display.
         */
        src: {
          type: String,
        },
      };
    }

    static get importMeta() {
      return import.meta;
    }

    connectedCallback() {
      super.connectedCallback();
      this._iframeLoadHandler = () => {
        try {
          const iframe = this.shadowRoot && this.shadowRoot.querySelector('iframe');
          const iframeWindow = iframe && iframe.contentWindow;
          if (!iframeWindow) {
            return;
          }
          // Neutralize window.print so Ctrl/Cmd+P cannot trigger the print dialog,
          // even when PDF.js's own keydown handler (registered earlier inside the
          // iframe during DOMContentLoaded) runs first and calls window.print().
          iframeWindow.print = () => {};
          if (iframeWindow.parent && iframeWindow.parent !== iframeWindow) {
            try {
              iframeWindow.parent.print = () => {};
            } catch (_err) {
              // ignore — parent may be cross-origin in some embeds
            }
          }
          // Block Ctrl/Cmd+S (save) and act as a backup for Ctrl/Cmd+P.
          this._keydownBlocker = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) {
              e.preventDefault();
              e.stopImmediatePropagation();
            }
          };
          this._blockedIframeWindow = iframeWindow;
          iframeWindow.addEventListener('keydown', this._keydownBlocker, true);
          if (iframeWindow.document) {
            iframeWindow.document.addEventListener('keydown', this._keydownBlocker, true);
          }
        } catch (_e) {
          // cross-origin iframe — cannot inject keyboard blocker
        }
      };
      // Shadow DOM is ready synchronously after connectedCallback in custom elements v1
      const iframe = this.shadowRoot && this.shadowRoot.querySelector('iframe');
      if (iframe) {
        iframe.addEventListener('load', this._iframeLoadHandler);
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      const iframe = this.shadowRoot && this.shadowRoot.querySelector('iframe');
      if (iframe && this._iframeLoadHandler) {
        iframe.removeEventListener('load', this._iframeLoadHandler);
      }
      if (this._blockedIframeWindow && this._keydownBlocker) {
        try {
          this._blockedIframeWindow.removeEventListener('keydown', this._keydownBlocker, true);
          if (this._blockedIframeWindow.document) {
            this._blockedIframeWindow.document.removeEventListener('keydown', this._keydownBlocker, true);
          }
        } catch (_e) {
          // cross-origin iframe — removal may fail, nothing to do
        }
        this._blockedIframeWindow = null;
        this._keydownBlocker = null;
      }
    }

    _path(file) {
      // get an absolute href
      const el = document.createElement('a');
      el.href = file;
      return this.resolveUrl(`pdfjs/web/viewer.html?file=${encodeURIComponent(el.href)}`);
    }
  }

  customElements.define(PDFViewer.is, PDFViewer);
  Nuxeo.PDFViewer = PDFViewer;
}
