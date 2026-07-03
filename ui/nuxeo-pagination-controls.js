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
import '@polymer/iron-icons/av-icons.js';

import '@polymer/iron-icons/iron-icons.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import './widgets/nuxeo-select.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { I18nBehavior } from './nuxeo-i18n-behavior.js';

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
  class PaginationControls extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            display: block;
          }

          .container {
            @apply --layout-horizontal;
            @apply --layout-center;
          }

          .controls {
            color: var(--nuxeo-text-default, #000);
            font-size: 1rem;
            @apply --layout-horizontal;
            @apply --layout-center;
          }

          nuxeo-select {
            max-width: 4rem;

            --paper-dropdown-menu-input: {
              padding: 0;
              min-width: 2rem;
              text-align: center;
            }

            --paper-input-container: {
              padding: 0 !important;
            }

            --paper-input-container-underline: {
              display: none;
            }

            --paper-input-container-underline-focus: {
              display: none;
            }

            --paper-input-container-shared-input-style: {
              width: inherit;
              max-width: 4rem;
            }
          }

          .total {
            margin-inline-start: 2rem;
            font-size: 1rem;
            width: 5rem;
            text-align: center;
          }

          .currentPage {
            font-size: 1rem;
            width: 4rem;
            text-align: center;
          }

          paper-icon-button {
            padding-top: 6px;
          }
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
        </style>

        <nav class="container">
          <paper-icon-button
            id="firstPage"
            icon="av:skip-previous"
            title="First Page"
            aria-label$="[[i18n('paginationControls.firstPage')]]"
            on-click="_first"
            disabled$="[[_isFirst(page)]]"
          >
          </paper-icon-button>
          <paper-icon-button
            id="previousPage"
            icon="icons:chevron-left"
            title="Previous Page"
            aria-label$="[[i18n('paginationControls.previousPage')]]"
            on-click="_previous"
            disabled$="[[_isFirst(page)]]"
          >
          </paper-icon-button>
          <div class="controls" aria-label$="[[i18n('paginationControls.pageInfo', page, numberOfPages)]]">
            <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
              [[i18n('paginationControls.pageInfo', page, numberOfPages)]]
            </div>
            <template is="dom-if" if="[[_computeLimitForOptions(numberOfPages)]]">
              <nuxeo-select
                options="[[_computePageOptions(numberOfPages)]]"
                selected="{{page}}"
                vertical-align
                aria-label$="[[i18n('paginationControls.pageInfo', page, numberOfPages)]]"
              >
              </nuxeo-select>
            </template>
            <span
              class="currentPage"
              hidden$="[[_computeLimitForOptions(numberOfPages)]]"
              aria-label$="[[i18n('paginationControls.pageInfo', page, numberOfPages)]]"
            >
              [[page]]
            </span>
            <span class="total">/ [[numberOfPages]]</span>
          </div>
          <paper-icon-button
            id="nextPage"
            icon="icons:chevron-right"
            title="Next Page"
            aria-label$="[[i18n('paginationControls.nextPage')]]"
            on-click="_next"
            disabled$="[[_isLast(page, numberOfPages)]]"
          >
          </paper-icon-button>
          <paper-icon-button
            id="lastPage"
            icon="av:skip-next"
            title="Last Page"
            aria-label$="[[i18n('paginationControls.lastPage')]]"
            on-click="_last"
            disabled$="[[_isLast(page, numberOfPages)]]"
          >
          </paper-icon-button>
        </nav>
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

    _computePageOptions(numberOfPages) {
      return Array.from({ length: numberOfPages }, (x, i) => i + 1);
    }

    _computeLimitForOptions(numberOfPages) {
      const maxItemsForNuxeoSelectPagination =
        Nuxeo &&
        Nuxeo.UI &&
        Nuxeo.UI.config &&
        Nuxeo.UI.config.pagination &&
        Nuxeo.UI.config.pagination.nuxeoSelectOptions &&
        Nuxeo.UI.config.pagination.nuxeoSelectOptions.listingMaxItems
          ? Nuxeo.UI.config.pagination.nuxeoSelectOptions.listingMaxItems
          : 1000;
      if (numberOfPages > maxItemsForNuxeoSelectPagination) {
        return false;
      }
      return true;
    }
  }

  customElements.define(PaginationControls.is, PaginationControls);
  Nuxeo.PaginationControls = PaginationControls;
}
