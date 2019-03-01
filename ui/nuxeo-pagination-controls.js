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
import '@polymer/iron-icons/av-icons.js';

import '@polymer/iron-icons/iron-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

{
  /**
   * An element to handle pagination.
   *
   * Example:
   *
   *     <nuxeo-pagination-controls page="{{currentePage}}"
   *                                number-of-pages="[[numberOfPages]]">
   *     </nuxeo-pagination-controls>
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-pagination-controls/index.html
   */
  class PaginationControls extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
      }

      .controls {
        color: var(--nuxeo-text-default, #000);
        font-size: 1rem;
        padding: 0 4px;
      }

      paper-icon-button {
        padding: 8px;
      }
    </style>

    <div class="horizontal layout end-justified center">
      <paper-icon-button
        icon="av:skip-previous"
        title="First Page"
        on-click="_first"
        disabled\$="[[_isFirst(page)]]">
      </paper-icon-button>
      <paper-icon-button
        icon="icons:chevron-left"
        title="Previous Page"
        on-click="_previous"
        disabled\$="[[_isFirst(page)]]">
      </paper-icon-button>
      <span class="controls">[[page]]/[[numberOfPages]]</span>
      <paper-icon-button
        icon="icons:chevron-right"
        title="Next Page"
        on-click="_next"
        disabled\$="[[_isLast(page, numberOfPages)]]">
      </paper-icon-button>
      <paper-icon-button
        icon="av:skip-next"
        title="Last Page"
        on-click="_last"
        disabled\$="[[_isLast(page, numberOfPages)]]">
      </paper-icon-button>
    </div>
`;
    }

    static get is() {
      return 'nuxeo-pagination-controls';
    }

    static get properties() {
      return {
        /**
         * The current page.
         */
        page: {
          type: Number,
          value: 1,
          notify: true,
        },

        /**
         * The current number of pages.
         */
        numberOfPages: Number,
      };
    }

    _previous() {
      this.page--;
    }

    _next() {
      this.page++;
    }

    _first() {
      this.page = 1;
    }

    _last() {
      this.page = this.numberOfPages;
    }

    _isFirst(page) {
      return page === 1;
    }

    _isLast(page) {
      return page === this.numberOfPages;
    }
  }

  customElements.define(PaginationControls.is, PaginationControls);
  Nuxeo.PaginationControls = PaginationControls;
}
