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
import { Connection, ConnectionMixin } from './nuxeo-connection.js';

export class Operation extends EventTarget {
  constructor(opts) {
    super();
    this.operation = opts && opts.operation;
    this.async = (opts && opts.async) || false;
    this.pollInterval = (opts && opts.pollInterval) || 1000;
    this.connection = (opts && opts.connection) || new Connection();
  }

  execute(opts) {
    let { input } = opts;
    const { params, schemas, headers, signal } = opts;

    // support page provider as input to operations
    // relies on parameters naming convention until provider marshaller is available
    if (Nuxeo.PageProvider && input instanceof Nuxeo.PageProvider) {
      params.providerName = input.provider;
      Object.assign(params, input._params);
      // ELEMENTS-1318 - commas would need to be escaped, as queryParams are mapped to stringlists by the server
      // But passing queryParams as an array will map directly to the server stringlist
      if (!Array.isArray(params.queryParams)) {
        params.queryParams = [params.queryParams];
      }
      input = undefined;
    }

    const options = { signal, schemas, headers };

    return this.connection
      .operation(this.operation)
      .then((operation) => this._doExecute(operation, input, params, options));
  }

  _doExecute(operation, input, params, options) {
    if (params.context) {
      operation = operation.context(params.context);
    }

    if (this.async) {
      options.url = `${operation._computeRequestURL()}/@async`;
      options.resolveWithFullResponse = true;
    }

    let promise = operation
      .params(params)
      .input(input)
      .execute(options);

    if (this.async) {
      promise = promise.then((res) => {
        if (res.status === 202) {
          this.dispatchEvent(
            new CustomEvent('poll-start', {
              bubbles: true,
              composed: true,
            }),
          );
          return this._poll(res.headers.get('location'));
        }
        return res;
      });
    }

    return promise;
  }

  _isRunning(status) {
    if (status['entity-type'] === 'bulkStatus') {
      const { state } = status.value;
      return state !== 'ABORTED' && state !== 'COMPLETED';
    }
    return status === 'RUNNING';
  }

  _poll(url) {
    return new Promise((resolve, reject) => {
      const fn = () => {
        this.connection
          .http(url)
          .then((res) => {
            if (this._isRunning(res)) {
              window.setTimeout(() => fn(), this.pollInterval, url);
            } else {
              resolve(res);
            }
          })
          .catch((error) => {
            reject(error);
          });
      };
      fn();
    });
  }
}

export const OperationMixin = (superClass) =>
  class extends ConnectionMixin(superClass) {
    static get properties() {
      return {
        /** The id the operation to call. */
        operation: {
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

        /** The headers of the request. */
        headers: {
          type: Object,
          value: null,
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
         * If true, documents changed by the call will be reindexed synchronously server side.
         */
        syncIndexing: Boolean,

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

        /** Indicates if the request behind this operation cannot be canceled.
         * By default a request is cancelable, which means that if on the same `nuxeo-operation`
         * we perform two sequential requests: Request A & Request B. The first one will be
         * aborted and we keep the last one (in our case request B). This is done to avoid
         * an obsolete responses.
         * */
        uncancelable: {
          type: Boolean,
        },
      };
    }

    execute(opts) {
      const options = Object.assign(
        {
          input: this.input,
          params: !this.params || typeof this.params === 'object' ? this.params : JSON.parse(this.params),
          schemas: this.schemas && this.schemas.length > 1 && this.schemas.trim().split(/[\s,]+/),
          headers: this.headers || {},
        },
        opts,
      );

      if (this.syncIndexing) {
        options.headers['nx-es-sync'] = true;
      }

      // Manage the way to abort the request
      if (!this.uncancelable) {
        if (this._controller) {
          this._controller.abort();
        }
        // For the next request
        this._controller = new AbortController();
        options.signal = this._controller.signal;
      }

      if (!this._operation || this.uncancelable) {
        this._operation = new Operation({ connection: this.connection });
        this._operation.addEventListener('poll-start', () =>
          this.dispatchEvent(
            new CustomEvent('poll-start', {
              bubbles: true,
              composed: true,
            }),
          ),
        );
      }

      this._operation.operation = this.operation;
      this._operation.async = this.async;
      this._operation.pollInterval = this.pollInterval;

      return this._operation
        .execute(options)
        .then((data) => {
          this.dispatchEvent(
            new CustomEvent('response', {
              bubbles: true,
              composed: true,
              detail: {
                response: data,
              },
            }),
          );
          return data;
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.dispatchEvent(
              new CustomEvent('unauthorized-request', {
                bubbles: true,
                composed: true,
                detail: error,
              }),
            );
          }
          throw error;
        });
    }
  };

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
  class OperationElement extends OperationMixin(Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            display: none;
          }
        </style>
      `;
    }

    static get is() {
      return 'nuxeo-operation';
    }

    static get properties() {
      return {
        /** The id the operation to call.
         *
         * @deprecated use `operation` instead-
         */
        op: {
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
         * Active request count.
         */
        activeRequests: {
          type: Number,
          value: 0,
          notify: true,
          readOnly: true,
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
      return ['_autoExecute(op, params, enrichers, enrichersEntity)', '_isLoading(activeRequests)'];
    }

    /**
     * Fired when the operation returns with no errors.
     *
     * @event response
     */
    async execute() {
      this._setActiveRequests(this.activeRequests + 1);

      const options = {};

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

      this.operation = this.op;

      return super
        .execute(options)
        .then((data) => {
          this.response = data;
          this.success = true;
          this._setActiveRequests(this.activeRequests - 1);
          return this.response;
        })
        .catch((error) => {
          this.success = false;
          this.error = error;
          console.warn(`Operation request failed: ${error}`);
          this._setActiveRequests(this.activeRequests - 1);
          throw this.error;
        });
    }

    _autoExecute() {
      if (this.auto) {
        this.execute();
      }
    }

    _isLoading() {
      this._setLoading(this.activeRequests > 0);
    }
  }

  customElements.define(OperationElement.is, OperationElement);
  Nuxeo.Operation = OperationElement;
}
