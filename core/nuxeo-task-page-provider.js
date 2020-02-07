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
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import './nuxeo-element.js';
import './nuxeo-resource.js';

{
  /**
   * `nuxeo-task-page-provider` returns workflow tasks and provides paginated results.
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-task-page-provider.html
   */
  class TaskPageProvider extends Nuxeo.Element {
    static get template() {
      return html`
        <style>
          :host {
            display: none;
          }
        </style>

        <nuxeo-resource id="nxResource" connection-id="[[connectionId]]" path="/task" headers="{{headers}}">
        </nuxeo-resource>
      `;
    }

    static get is() {
      return 'nuxeo-task-page-provider';
    }

    static get properties() {
      return {
        /** The id of a nuxeo-connection to use. */
        connectionId: {
          type: String,
          value: '',
        },

        /**
         * If true, automatically execute the operation when either `provider` or `params` changes.
         */
        auto: {
          type: Boolean,
          value: false,
        },

        /**
         * The delay in milliseconds to debounce the auto fetch call when provider, params, etc. changes.
         */
        autoDelay: {
          type: Number,
          value: 300,
        },

        /**
         * The query parameters.
         */
        params: {
          type: Object,
          value: {},
        },

        /**
         * The number of results per page.
         */
        pageSize: {
          type: Number,
          value: 40,
        },

        /**
         * The current page. Ignored when current page offset is set.
         */
        page: {
          type: Number,
          value: 1,
        },

        /**
         * The current page offset.
         */
        offset: {
          type: Number,
          notify: true,
        },

        /**
         * The current page entries.
         */
        currentPage: {
          type: Array,
          value: [],
          notify: true,
        },

        /**
         * Total number of pages.
         */
        numberOfPages: {
          type: Number,
          notify: true,
        },

        /**
         * Total number of results.
         */
        resultsCount: {
          type: Number,
          notify: true,
        },

        /**
         * Aggregations returned.
         */
        aggregations: {
          type: Object,
          value: {},
          notify: true,
        },

        /**
         * Returns true if a next page is available.
         */
        isNextPageAvailable: {
          type: Boolean,
          value: false,
          notify: true,
        },

        /**
         * Returns true if a previous page is available.
         */
        isPreviousPageAvailable: {
          type: Boolean,
          value: false,
          notify: true,
        },

        /**
         * Current page's size
         */
        currentPageSize: {
          type: Number,
          notify: true,
        },

        /**
         * The headers of the request.
         * 'Accept': 'text/plain,application/json' is already set by default.
         */
        headers: {
          type: Function,
          value: () => {
            return { 'fetch-task': 'targetDocumentIds,actors' };
          },
        },

        /**
         * True while requests are in flight.
         */
        loading: {
          type: Boolean,
          notify: true,
          readOnly: true,
        },
      };
    }

    static get observers() {
      return ['_autoFetch(auto, params.*, pageSize, page)'];
    }

    /**
     * Fired when the current page is fetched.
     *
     * @event update
     */

    /**
     * Fired if an error occurs when fetching the current page.
     *
     * @event error
     */

    ready() {
      super.ready();
      this.$.nxResource.addEventListener('loading-changed', () => {
        this._setLoading(this.$.nxResource.loading);
      });
    }

    /**
     * Fetch the currentPage.
     *
     * @method fetch
     */
    fetch() {
      if (!this.headers) {
        this.headers = {};
      }
      this.$.nxResource.params = this._params;
      return this.$.nxResource
        .execute()
        .then((response) => {
          this.currentPage = response.entries.slice(0);
          this.numberOfPages = response.numberOfPages;
          this.resultsCount = response.resultsCount;
          this.isNextPageAvailable = response.isNextPageAvailable;
          this.offset = response.currentPageOffset;
          this.pageSize = response.pageSize;
          this.isPreviousPageAvailable = response.isPreviousPageAvailable;
          this.currentPageSize = response.currentPageSize;
          this.dispatchEvent(
            new CustomEvent('update', {
              bubbles: true,
              composed: true,
            }),
          );
          return response;
        })
        .catch((error) => {
          this.dispatchEvent(
            new CustomEvent('error', {
              bubbles: true,
              composed: true,
              detail: {
                error,
              },
            }),
          );
          throw error;
        });
    }

    get _params() {
      const params = {
        currentPageIndex: this.page - 1,
        offset: this.offset,
        pageSize: this.pageSize,
      };
      Object.keys(this.params).forEach((key) => {
        const value = this.params[key];
        if (value != null) {
          if (typeof value === 'string') {
            params[key] = value;
          } else if (Array.isArray(value)) {
            params[key] = JSON.stringify(value.map((item) => (item['entity-type'] ? item.uid || item.id : item)));
          } else {
            params[key] = value['entity-type'] ? value.uid || value.id : JSON.stringify(value);
          }
        }
      }, this);

      return params;
    }

    _autoFetch() {
      // Reset the page if the query changes
      if (this.$.nxResource.params) {
        this.page = 1;
      }
      if (this.auto) {
        // debounce in case of multiple param changes
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(this.autoDelay), () => this.fetch());
      }
    }
  }

  customElements.define(TaskPageProvider.is, TaskPageProvider);
}
