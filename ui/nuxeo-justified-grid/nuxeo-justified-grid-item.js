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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-image/iron-image.js';

{
  /**
   * An element for displaying an item in nuxeo-justified-grid.
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-justified-grid/index.html
   */
  class JustifiedGridItem extends Nuxeo.Element {
    static get template() {
      return html`
        <style>
          :host {
            display: block;
          }

          [hidden] {
            display: none !important;
          }

          .item {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
          }

          .item iron-image {
            width: 100%;
            height: 100%;
            --iron-image-placeholder: {
              background: #fafafa;
            }
          }

          .item .overlay {
            display: none;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 24px 10px 8px;
            background: rgba(0, 0, 0, 0.4);
            background: -webkit-linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
            background: -o-linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
            background: -moz-linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
            background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
            text-shadow: -1px 0 rgba(0, 0, 0, 0.4), 0 1px rgba(0, 0, 0, 0.4), 1px 0 rgba(0, 0, 0, 0.4),
              0 -1px rgba(0, 0, 0, 0.4);
          }

          .item:hover .overlay {
            display: block;
          }
        </style>

        <div class="item">
          <iron-image src="[[_url(document)]]" sizing="cover" preload fade></iron-image>
          <div class="overlay">[[document.title]]</div>
        </div>
      `;
    }

    static get is() {
      return 'nuxeo-justified-grid-item';
    }

    static get properties() {
      return {
        document: Object,
      };
    }

    _url(doc) {
      if (
        doc &&
        doc.uid &&
        doc.contextParameters &&
        doc.contextParameters.thumbnail &&
        doc.contextParameters.thumbnail.url
      ) {
        if (!this.isFollowRedirectEnabled()) {
          const splitter = doc.contextParameters.thumbnail.url.indexOf('?') > -1 ? '&' : '?';
          doc.contextParameters.thumbnail.url = `${doc.contextParameters.thumbnail.url}${splitter}clientReason=view`;
        }
        return doc.contextParameters.thumbnail.url;
      }
      return '';
    }

    isFollowRedirectEnabled() {
      const followRedirect =
        Nuxeo && Nuxeo.UI && Nuxeo.UI.config && Nuxeo.UI.config.url && Nuxeo.UI.config.url.followRedirect;
      return followRedirect ? String(followRedirect).toLowerCase() === 'true' : false;
    }
  }

  customElements.define(JustifiedGridItem.is, JustifiedGridItem);
  Nuxeo.JustifiedGridItem = JustifiedGridItem;
}
