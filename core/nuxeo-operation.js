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
import './nuxeo-element.js';
import './nuxeo-connection.js';
import './nuxeo-page-provider.js';

{
  /**
   * `nuxeo-operation` allows calling an operation on a Nuxeo server.
   *
   *     <nuxeo-operation auto
   *                      op="Document.Query"
   *                      params='{"query": "select * from Document"}'
   *                      on-response="handleResponse"
   *                      enrichers="documentURL, preview"></nuxeo-operation>
   *
   * With `auto` set to `true`, the operation is executed whenever
   * its `url` or `params` properties are changed.
   *
   * Note: The `params` attribute must be double quoted JSON.
   *
   * You can trigger an operation explicitly by calling `execute` on the
   * element.
   *
   * @memberof Nuxeo
   */
  class Operation extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host {
        display: none;
      }
    </style>
    <nuxeo-connection id="nx" connection-id="{{connectionId}}"></nuxeo-connection>
`;
    }

    static get is() {
      return 'nuxeo-operation';
    }

    static get properties() {
      return {
        /** The id of a nuxeo-connection to use. */
        connectionId: {
          type: String,
          value: '',
        },

        /** The success response status */
        success: {
          type: Boolean,
          notify: true,
        },

        /** The error response status */
        error: {
          type: String,
          notify: true,
        },

        /** The id the operation to call. */
        op: {
          type: String,
          value: '',
        },

        /** The parameters to send. */
        params: {
          type: Object,
          value: {},
        },

        /** The operation input. */
        input: {
          type: Object,
        },

        /** If true, automatically execute the operation when either `op` or `params` changes. */
        auto: {
          type: Boolean,
          value: false,
        },

        /** The response from the server. */
        response: {
          type: Object,
          value: null,
          notify: true,
        },

        /** The headers of the request. */
        headers: {
          type: Object,
          value: null,
        },

        /**
         * The `content enricher` of the resource.
         * Can be an object with entity type as keys or list or string with the entity type defined by
         * `enrichers-entity`.
         */
        enrichers: {
          type: Object,
          value: {},
        },

        /** The `content enricher` entity-type of the resource. Default value for Nuxeo Document Model */
        enrichersEntity: {
          type: String,
          value: 'document',
        },

        /**
         * List of comma separated values of the document schemas to be returned.
         * All document schemas are returned by default.
         */
        schemas: {
          type: String,
          value: '',
        },

        /**
         * Active request count.
         */
        activeRequests: {
          type: Number,
          value: 0,
          notify: true,
          readOnly: true,
        },

        /**
         * If true, documents changed by the call will be reindexed synchronously server side.
         */
        syncIndexing: Boolean,

        /**
         * True while requests are in flight.
         */
        loading: {
          type: Boolean,
          notify: true,
          readOnly: true,
        },

        /**
         * If true, execute the operation asynchronously.
         */
        async: {
          type: Boolean,
          value: false,
        },

        /**
         * Poll interval in ms.
         */
        pollInterval: {
          type: Number,
          value: 1000,
        },
      };
    }

    static get observers() {
      return [
        '_autoExecute(op, params, enrichers, enrichersEntity)',
        '_isLoading(activeRequests)',
      ];
    }

    /**
     * Fired when the operation returns with no errors.
     *
     * @event response
     */
    execute() {
      this._setActiveRequests(this.activeRequests + 1);

      const params = (!this.params || (typeof this.params === 'object')) ? this.params : JSON.parse(this.params);

      let {input} = this;

      // support page provider as input to operations
      // relies on parameters naming convention until provider marshaller is available
      if (input instanceof Nuxeo.PageProvider) {
        params.providerName = input.provider;
        Object.assign(params, input._params);
        input = undefined;
      }

      const options = {};
      // Look up document schemas to be returned
      if (this.schemas && this.schemas.length > 1) {
        options.schemas = this.schemas.trim().split(/[\s,]+/);
      }
      options.headers = this.headers || {};
      // Force sync indexing
      if (this.syncIndexing) {
        options.headers.nx_es_sync = true;
      }
      // Look up content enrichers parameter
      if (this.enrichers) {
        let enrich = {};
        if (typeof this.enrichers === 'string') {
          enrich[this.enrichersEntity] = this.enrichers;
        } else {
          enrich = this.enrichers;
        }
        Object.entries(enrich).forEach(([type, value]) => {
          let v = value;
          if (Array.isArray(value)) {
            v = value.join(',');
          }
          options.headers[`enrichers-${type}`] = v;
        });
      }
      return this.$.nx.operation(this.op).then((operation) => {
        this._operation = operation;
        return this._doExecute(input, params, options);
      });
    }

    _autoExecute() {
      if (this.auto) {
        this.execute();
      }
    }

    _doExecute(input, params, options) {
      if (params.context) {
        this._operation = this._operation.context(params.context);
      }

      if (this.async) {
        options.url = `${this._operation._computeRequestURL()}/@async`;
        options.resolveWithFullResponse = true;
      }

      let promise = this._operation
        .params(params)
        .input(input)
        .execute(options);

      if (this.async) {
        promise = promise.then((res) => {
          if (res.status === 202) {
            this.dispatchEvent(new CustomEvent('poll-start', {
              bubbles: true,
              composed: true,
            }));
            return this._poll(res.headers.get('location'));
          }
          return res;
        });
      }

      return promise
        .then((data) => {
          this.dispatchEvent(new CustomEvent('response', {
            bubbles: true,
            composed: true,
            detail: {
              response: data,
            },
          }));
          this.response = data;
          this.success = true;
          this._setActiveRequests(this.activeRequests - 1);
          return this.response;
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.dispatchEvent(new CustomEvent('unauthorized-request', {
              bubbles: true,
              composed: true,
              detail: error,
            }));
          }
          this.success = false;
          this.error = error;
          console.log(`Operation request failed: ${error}`);
          this._setActiveRequests(this.activeRequests - 1);
          throw error;
        });
    }

    _poll(url) {
      return new Promise((resolve) => {
        const fn = () => {
          this.$.nx.http(url).then((res) => {
            // 303 - see other (for result)
            if (res.redirected) {
              resolve(res);
            } else {
              window.setTimeout(() => fn(), this.pollInterval, url);
            }
          });
        };
        fn();
      });
    }

    _isLoading() {
      this._setLoading(this.activeRequests > 0);
    }
  }

  customElements.define(Operation.is, Operation);
  Nuxeo.Operation = Operation;
}
