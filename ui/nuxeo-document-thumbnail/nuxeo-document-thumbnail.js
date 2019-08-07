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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior';

{
  /**
   * An element to display a thumbnail of a document
   *
   * Example:
   *    <nuxeo-document-thumbnail document="[[document]]"></nuxeo-document-thumbnail>
   *
   * @group Nuxeo UI
   * @element nuxeo-document-thumbnail
   */
  class DocumentThumbnail extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            height: 32px;
            width: 32px;
            position: relative;
            flex: none;
          }

          img {
            height: auto;
            width: auto;
            max-height: 100%;
            max-width: 100%;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto 8px auto auto;
            box-sizing: border-box;
            border-radius: 3px;
            filter: brightness(1.2);
            -webkit-filter: brightness(1.2);
          }
        </style>

        <img id="img" src="[[_thumbnail(document)]]" alt="[[_title(document)]]" on-error="_error" />
      `;
    }

    static get is() {
      return 'nuxeo-document-thumbnail';
    }

    static get properties() {
      return {
        document: Object,
      };
    }

    _thumbnail(doc) {
      return doc &&
        doc.uid &&
        doc.contextParameters &&
        doc.contextParameters.thumbnail &&
        doc.contextParameters.thumbnail.url
        ? doc.contextParameters.thumbnail.url
        : '';
    }

    _error() {
      this.$.img.src =
        `${'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0l'}` +
        `${'EQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='}`;
    }

    _title(doc) {
      return doc && doc.title ? this.i18n('accessibility.thumbnail', doc.title) : '';
    }
  }
  customElements.define(DocumentThumbnail.is, DocumentThumbnail);
  Nuxeo.DocumentThumbnail = DocumentThumbnail;
}
