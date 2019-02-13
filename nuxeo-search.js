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
   * `nuxeo-search` allows managing saved searches on a Nuxeo server.
   *
   *     <nuxeo-search></nuxeo-search>
   *
   * Example - Get all saved searches accessible by the current user:
   *
   *     <nuxeo-search auto searches="{{searches}}"></nuxeo-nuxeo-search>
   *
   * Example - Get a saved search by id:
   *
   *     <nuxeo-search auto search-id="[[id]]" search="{{search}}"></nuxeo-search>
   *
   * Example - Execute a saved search:
   *
   *     <nuxeo-search auto search-id="[[id]]" results="{{results}}"></nuxeo-search>
   *
   * You can trigger a method explicitly by calling `get`, `post`, `put`, `remove` or `execute` on the
   * element.
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-search.html
   */
  class Search extends Nuxeo.Element {
    static get template() {
      return html`
        <style>
          :host {
            display: none;
          }
        </style>

        <nuxeo-resource
          id="resource"
          connection-id="[[connectionId]]"
          method="[[method]]"
          path="[[path]]"
          data="[[data]]"
          headers="[[headers]]"
          params="[[params]]"
        >
        </nuxeo-resource>
      `;
    }

    static get is() {
      return 'nuxeo-search';
    }

    static get properties() {
      return {
        /**
         * Id of a saved search to be used on requests.
         */
        searchId: {
          type: String,
          value: '',
        },

        /**
         * Body to be used on POST/PUT requests.
         */
        data: {
          type: Object,
        },

        /**
         * A single saved search as a result of a GET request with a given id.
         */
        search: {
          type: Object,
          notify: true,
        },

        /**
         * Saved searches accessible by the current user.
         * Result of a GET request when an id is not specified.
         */
        searches: {
          type: Array,
          notify: true,
        },

        /**
         * Results when executing a given saved search.
         */
        results: {
          type: Array,
          notify: true,
        },

        /**
         * Computed path of the search endpoint to use.
         */
        path: {
          type: String,
          computed: '_computePath(auto, searchId)',
        },

        /**
         * Search parameters.
         */
        params: {
          type: Object,
        },

        /**
         * The id of a nuxeo-connection to use.
         */
        connectionId: {
          type: String,
        },

        /**
         * If true, automatically execute the search request.
         */
        auto: {
          type: Boolean,
          value: false,
          observer: '_autoChanged',
        },

        /**
         * The HTTP method to use ('GET', 'POST', 'PUT', or 'DELETE'). Default is 'GET'
         */
        method: {
          type: String,
          value: 'get',
        },

        /**
         * The headers of the request.
         */
        headers: {
          type: Object,
        },

        /**
         * The delay in milliseconds to debounce the auto fetch call.
         */
        autoDelay: {
          type: Number,
          value: 300,
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

    ready() {
      super.ready();
      this.$.resource.addEventListener('loading-changed', () => {
        this._setLoading(this.$.resource.loading);
      });
    }

    /**
     * Gets the list of saved searches or the current search search if `search-id` is set.
     */
    get() {
      this.method = 'get';
      return this.$.resource.execute().then((response) => {
        if (this.searchId) {
          this.search = response;
        } else {
          this.searches = response.entries;
        }
        return response;
      });
    }

    /**
     * Saves the search.
     */
    post() {
      this.method = 'post';
      return this.$.resource.execute();
    }

    /**
     * Updates the saved search.
     */
    put() {
      this.method = 'put';
      return this.$.resource.execute();
    }

    /**
     * Deletes the saved search.
     */
    remove() {
      this.method = 'delete';
      return this.$.resource.execute();
    }

    /**
     * Executes the saved search.
     */
    execute() {
      if (this.searchId) {
        this.method = 'get';
        this.$.resource.path += '/execute';
        this.$.resource.execute().then((response) => {
          this.results = response.entries;
        });
      }
    }

    _computePath() {
      let path = '/search/saved';
      if (this.searchId) {
        path += `/${this.searchId}`;
      }
      return path;
    }

    _autoChanged() {
      if (this.auto && this.path) {
        this._debouncer = Debouncer.debounce(
          this._debouncer,
          timeOut.after(this.autoDelay), () => this.get().then(() => this.execute()),
        );
      }
    }
  }

  customElements.define(Search.is, Search);
  Nuxeo.Search = Search;
}
