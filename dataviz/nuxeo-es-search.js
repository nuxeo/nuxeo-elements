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

import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

{
  /**
   * An element allowing querying the Nuxeo ES passthrough.
   *
   * Example:
   *
   *    <nuxeo-es-search></nuxeo-es-search>
   *
   * @memberof Nuxeo
   */
  class ESSearch extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host {
        display: none;
      }
    </style>
    <nuxeo-connection id="nx" connection-id="[[connectionId]]"></nuxeo-connection>
`;
    }

    static get is() {
      return 'nuxeo-es-search';
    }

    static get properties() {
      return {
        /**
         * The id of a nuxeo-connection to use.
         */
        connectionId: {
          type: String,
          value: 'nx',
        },

        /**
         * If true, automatically execute the operation when either `path` or `params` changes.
         */
        auto: {
          type: Boolean,
          value: false,
        },

        index: {
          type: String,
          value: 'nuxeo',
        },

        query: Object,

        aggregates: Object,

        type: String,

        aggregations: {
          type: Object,
          notify: true,
          readOnly: true,
        },

        hits: {
          type: Object,
          notify: true,
          readOnly: true,
        },
      };
    }

    static get observers() {
      return [
        '_auto(connectionId, auto, index, query, aggregates)',
      ];
    }

    /**
     * Fired if an error occurs while performing the query.
     *
     * @event error
     */

    /**
     * Fired when a query is performed.
     *
     * @event results
     */

    _auto() {
      if (this.auto && this.query && this.aggregates) {
        this.execute();
      }
    }

    execute() {
      return this.$.nx.connect().then(this._send.bind(this));
    }

    _send() {
      let url = [this.$.nx.client._baseURL, 'site/es', this.index, '_search'].join('/');
      url = url.replace(/(^\/+)|([^:])\/\/+/g, '$2/');

      if (this.type) {
        url += `?search_type=${this.type}`;
      }
      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: {
          query: this.query,
          aggs: this.aggregates,
        },
        url,
      };
      return this.$.nx.request().then((request) => request.execute(options)
        .then(this._handleResponse.bind(this))
        .catch(this._handleError.bind(this)));
    }

    _handleError(request, error) {
      console.error(error);
      this.dispatchEvent(new CustomEvent('error', {
        bubbles: true,
        composed: true,
        detail: {
          request,
          error,
        },
      }));
    }

    _handleResponse(response) {
      this._setHits(response.hits);
      this._setAggregations(response.aggregations);
      this.dispatchEvent(new CustomEvent('results', {
        bubbles: true,
        composed: true,
        detail: {
          response,
        },
      }));
      return response;
    }
  }

  customElements.define(ESSearch.is, ESSearch);
  Nuxeo.ESSearch = ESSearch;
}
