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
            border: 0;
            @apply --nuxeo-pdf-viewer-iframe;
          }
        </style>

        <iframe src\$="[[_path(src)]]"></iframe>
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

    _path(file) {
      // get an absolute href
      const el = document.createElement('a');
      el.href = file;
      return this.resolveUrl(`pdfjs/web/viewer.html?file=${encodeURI(el.href)}`);
    }
  }

  customElements.define(PDFViewer.is, PDFViewer);
  Nuxeo.PDFViewer = PDFViewer;
}
