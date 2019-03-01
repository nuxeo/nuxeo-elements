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
import './nuxeo-operation.js';
import './nuxeo-resource.js';

{
  /**
   * `nuxeo-audit-page-provider` performs an audit query with the given parameters against audit logs.
   * If the property docId is set, the provider DOCUMENT_HISTORY_PROVIDER is used with docId as queryParameter.
   * If the property docId is not set, the EVENTS_VIEW provider is used instead.
   *
   *     <nuxeo-audit-page-provider
   *         current-page="{{entries}}" params="{...}" page-size="40'">
   *     </nuxeo-audit-page-provider>
   *
   *     <nuxeo-audit-page-provider
   *         current-page="{{entries}}" docId="..." page-size="40'">
   *     </nuxeo-audit-page-provider>
   *
   * @memberof Nuxeo
   */
  class AuditPageProvider extends Nuxeo.Element {
    static get template() {
      return html`
        <style>
          :host {
            display: none;
          }
        </style>

        <nuxeo-resource
          id="res"
          path="/id/[[docId]]/@audit"
          enrichers="{{enrichers}}"
          schemas="[[schemas]]"
          loading="{{loading}}"
          headers="{{headers}}"
        >
        </nuxeo-resource>

        <nuxeo-operation
          id="auditOp"
          op="Audit.QueryWithPageProvider"
          enrichers="{{enrichers}}"
          schemas="[[schemas]]"
          loading="{{loading}}"
          headers="{{headers}}"
        >
        </nuxeo-operation>
      `;
    }

    static get is() {
      return 'nuxeo-audit-page-provider';
    }

    static get properties() {
      return {
        /**
         * The id of a nuxeo-connection to use.
         */
        connectionId: {
          type: String,
          value: '',
        },

        /**
         * If true, automatically execute the operation when either `docId` or `params` change.
         */
        auto: {
          type: Boolean,
          value: false,
        },

        /**
         * The delay in milliseconds to debounce the auto fetch call when `docId`, `params`, etc. changes.
         */
        autoDelay: {
          type: Number,
          value: 300,
        },

        /**
         * The query parameters object.
         */
        params: {
          type: Object,
          value: {},
        },

        /**
         * The document id to retrieve the history from.
         * When set, the provider DOCUMENT_HISTORY_PROVIDER is used.
         */
        docId: {
          type: String,
        },

        /**
         * The number of results per page.
         */
        pageSize: {
          type: Number,
          value: -1,
        },

        /**
         * The current page.
         */
        page: {
          type: Number,
          value: 1,
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
      return [
        '_resetAndAutoFetch(params.*, docId, pageSize, sort)',
        '_autoFetch(page)',
      ];
    }

    /**
     * Fired when the current page is fetched.
     *
     * @event update
     */

    /**
     * Stringifies the elements of a given object
     */
    _stringifyJSONObject(input) {
      const result = input;
      if (input !== null) {
        Object.keys(input).forEach((key) => {
          if (typeof input[key] === 'string') {
            result[key] = input[key];
          } else {
            result[key] = JSON.stringify(input[key]);
          }
        });
      }
      return result;
    }

    /**
     * Fetch the currentPage.
     * @method fetch
     */
    fetch() {
      return this._isForDoc ? this._fetchRes() : this._fetchOp();
    }

    _fetchOp() {
      const params = {
        providerName: 'EVENTS_VIEW',
        namedQueryParams: this._stringifyJSONObject(this.params),
        currentPageIndex: this.page - 1,
        pageSize: this.pageSize,
      };
      return this._fetch(this.$.auditOp, params);
    }

    _fetchRes() {
      const params = {};
      if (this.params.startDate) {
        params.startEventDate = this.params.startDate;
      }
      if (this.params.endDate) {
        params.endEventDate = this.params.endDate;
      }
      params.currentPageIndex = this.page - 1;
      params.pageSize = this.pageSize;
      return this._fetch(this.$.res, params);
    }

    _fetch(exec, params) {
      if (this._sortKeys.length > 0) {
        params.sortBy = this._sortKeys.join(',');
        params.sortOrder = this._sortValues.join(',');
      }
      exec.params = params;
      return exec.execute().then((response) => {
        this.currentPage = response.entries.slice(0);
        this.numberOfPages = response.numberOfPages;
        this.resultsCount = response.resultsCount;
        this.isNextPageAvailable = response.isNextPageAvailable;
        this.currentPageSize = response.currentPageSize;
        this.dispatchEvent(new CustomEvent('update', {
          bubbles: true,
          composed: true,
        }));
        return response;
      });
    }

    get _sortKeys() {
      return Object.keys(this.sort);
    }

    get _sortValues() {
      return this._sortKeys.map((k) => this.sort[k]);
    }

    get _isForDoc() {
      return this.docId && this.docId.length > 0;
    }

    _resetAndAutoFetch() {
      this.page = 1;
      this._autoFetch();
    }

    _autoFetch() {
      if (this.auto) {
        // debounce in case of multiple param changes
        this._debouncer = Debouncer.debounce(
          this._debouncer,
          timeOut.after(this.autoDelay), () => this.fetch(),
        );
      }
    }
  }

  customElements.define(AuditPageProvider.is, AuditPageProvider);
  Nuxeo.AuditPageProvider = AuditPageProvider;
}
