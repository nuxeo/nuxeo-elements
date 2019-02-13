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
   * `nuxeo-page-provider` performs queries on the repository and provides paginated results.
   *
   *     <nuxeo-page-provider auto
   *                          query="select * from Document"
   *                          page-size="5"
   *                          sort="dc:modified">
   *     </nuxeo-page-provider>
   *
   *     <nuxeo-page-provider auto page="1"
   *                          provider="default_search"
   *                          page-size="25">
   *     </nuxeo-page-provider>
   *
   *     <nuxeo-page-provider auto offset="2"
   *                          provider="default_search"
   *                          page-size="25">
   *     </nuxeo-page-provider>
   *
   * With `auto` set to `true`, results are fetched whenever
   * the `provider`, `query`, `params`, `page` or `pageSize` properties are changed.
   *
   * When using current page `offset`, the `page` property is ignored.
   *
   * You can fetch results explicitly by calling `fetch` on the
   * element.
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-page-provider.html
   */
  class PageProvider extends Nuxeo.Element {
    static get template() {
      return html`
        <style>
          :host {
            display: none;
          }
        </style>

        <nuxeo-resource
          id="nxResource"
          connection-id="[[connectionId]]"
          path="{{path}}"
          enrichers="{{enrichers}}"
          schemas="[[schemas]]"
          headers="{{headers}}"
        >
        </nuxeo-resource>
      `;
    }

    static get is() {
      return 'nuxeo-page-provider';
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
         * The id of a page provider.
         */
        provider: {
          type: String,
          value: '',
        },

        /**
         * The query.
         */
        query: {
          type: String,
        },

        /**
         * Computed path of the query endpoint to use.
         */
        path: {
          type: String,
          computed: '_computePath(provider, query)',
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
          value: -1,
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
         * Map of properties and direction 'asc' / 'desc'
         */
        sort: {
          type: Object,
          value: {},
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
         * Quick filters state.
         */
        quickFilters: {
          type: Array,
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
         * Current page's size
         */
        currentPageSize: {
          type: Number,
          notify: true,
        },

        /**
         * The `content enricher` of the resource.
         * Can be an object with entity type as keys or list or string (which defaults to `document` entity type).
         */
        enrichers: {
          type: Object,
          value: {},
        },

        /**
         * List of comma separated values of the document schemas to be returned.
         * All document schemas are returned by default.
         */
        schemas: {
          type: String,
        },

        /**
         * The headers of the request.
         * 'Accept': 'text/plain,application/json' is already set by default.
         */
        headers: {
          type: Object,
          value: null,
        },

        /**
         * Fetch the aggregate bucket's key if it matches a user
         * or directory entry and translate directory label.
         */
        fetchAggregates: {
          type: Boolean,
          value: false,
          observer: '_fetchAggregatesChanged',
        },

        /**
         * True while requests are in flight.
         */
        loading: {
          type: Boolean,
          notify: true,
          readOnly: true,
        },

        /**
         * If `true`, aggregagtes from page provider definition will not be computed.
         */
        skipAggregates: Boolean,
      };
    }

    static get observers() {
      return [
        '_autoFetch(auto, provider, query, params.*, pageSize, page, sort)',
      ];
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
     * @param {Object} options
     *   The options of the fetch:
     *   - "skipAggregates" to do not compute aggregations (boolean)
     */
    fetch(options) {
      if (!this.headers) {
        this.headers = {};
      }
      if (this.skipAggregates || (options && options.skipAggregates)) {
        this.headers.skipAggregates = 'true';
      } else {
        delete this.headers.skipAggregates;
      }

      const params = this._params;
      // move named parameters
      if (params.namedParameters) {
        Object.assign(params, params.namedParameters);
        delete params.namedParameters;
      }
      this.$.nxResource.params = params;
      return this.$.nxResource.execute()
        .then((response) => {
          this.currentPage = response.entries.slice(0);
          this.numberOfPages = response.numberOfPages;
          this.resultsCount = response.resultsCount;
          if (!options || !options.skipAggregates) {
            this.aggregations = response.aggregations;
          }
          this.quickFilters = response.quickFilters;
          this.isNextPageAvailable = response.isNextPageAvailable;
          this.currentPageSize = response.currentPageSize;
          this.dispatchEvent(new CustomEvent('update', {
            bubbles: true,
            composed: true,
          }));
          return response;
        })
        .catch((error) => {
          this.dispatchEvent(new CustomEvent('error', {
            bubbles: true,
            composed: true,
            detail: {
              error,
            },
          }));
          throw error;
        });
    }

    get _params() {
      const params = {
        currentPageIndex: this.page - 1,
        offset: this.offset,
        pageSize: this.pageSize,
      };

      // do not add empty sort info, to be able to fallback to default sort defined in page providers
      const sortKeys = this._sortKeys;
      if (sortKeys.length > 0) {
        params.sortBy = this._sortKeys.join(',');
        params.sortOrder = this._sortValues.join(',');
      }

      if (this.query) {
        params.query = this.query;
      }

      if (this.params.queryParams) {
        // these should've simply been passed as an array instead
        params.queryParams = this.params.queryParams;
      } else if (Array.isArray(this.params)) {
        params.queryParams = this.params;
      } else {
        const namedParams = {};
        Object.keys(this.params).forEach((key) => {
          if (typeof this.params[key] === 'string') {
            namedParams[key] = this.params[key];
          } else if (this.params[key] != null) {
            namedParams[key] = JSON.stringify(this.params[key]);
          }
        }, this);
        params.namedParameters = namedParams;
      }

      // Append quick filters if any
      if (this.quickFilters) {
        const retainedFilters = [];
        for (let i = 0; i < this.quickFilters.length; i++) {
          if (this.quickFilters[i].active === true) {
            retainedFilters.push(this.quickFilters[i].name);
          }
        }
        params.quickFilters = retainedFilters.join(',');
      }
      return params;
    }

    get _sortKeys() {
      return Object.keys(this.sort);
    }

    get _sortValues() {
      return this._sortKeys.map((k) => this.sort[k]);
    }

    _autoFetch() {
      // Reset the page if the query changes
      if (this.$.nxResource.params
        && this.query && this.query.length === 0 && this.query !== this.$.nxResource.params.query) {
        this.page = 1;
      }
      if (this.auto && (this.query || this.provider)) {
        // debounce in case of multiple param changes

        this._debouncer = Debouncer.debounce(
          this._debouncer,
          timeOut.after(this.autoDelay), () => this.fetch(),
        );
      }
    }

    _computePath(provider, query) {
      let path = '';
      if (query) {
        path = '/search/lang/NXQL/execute';
      } else if (provider) {
        path = `/search/pp/${provider}/execute`;
      }
      return path;
    }

    _fetchAggregatesChanged() {
      if (this.headers === null) {
        this.headers = {};
      }
      if (this.fetchAggregates === true) {
        this.headers['X-NXfetch.aggregate'] = 'key';
      } else {
        delete this.headers['X-NXfetch.aggregate'];
      }
    }
  }

  customElements.define(PageProvider.is, PageProvider);
  Nuxeo.PageProvider = PageProvider;
}
