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
import './nuxeo-connection.js';

{
  /**
   * `nuxeo-resource` allows managing REST on a Nuxeo server.
   *
   *     <nuxeo-resource auto
   *         path="Document.Query"
   *         on-response="handleResponse"></nuxeo-resource>
   *
   * With `auto` set to `true`, the GET method is executed whenever
   * its `path` properties are changed.
   *
   * Note: The `params` attribute must be double quoted JSON.
   *
   * You can trigger a method explicitly by calling `get`, `post`, `put` or `delete` on the
   * element.
   *
   * @memberof Nuxeo
   */
  class Resource extends Nuxeo.Element {
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
      return 'nuxeo-resource';
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

        /** The error response */
        error: {
          type: Object,
          notify: true,
        },

        /** If true, automatically execute the operation when either `path` or `params` changes. */
        auto: {
          type: Boolean,
          value: false,
        },

        /** The HTTP method to use ('GET', 'POST', 'PUT', or 'DELETE'). Default is 'GET' */
        method: {
          type: String,
          value: 'get',
        },

        /** The path of the resource. */
        path: {
          type: String,
        },

        /** The parameters to send. */
        params: {
          type: Object,
          value: null,
        },

        /** The data to pass to the server. */
        data: {
          type: Object,
          value: null,
        },

        /** The response from the server. */
        response: {
          type: Object,
          value: null,
          notify: true,
        },

        /** The `entity-type` of the resource. */
        type: {
          type: String,
          value: '',
        },

        /** The headers of the request.
         * 'Accept': 'text/plain,application/json' is already set by default.
         */
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

        /** The `content type` of the request */
        contentType: {
          type: String,
          value: 'application/json',
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
         * The delay in milliseconds to debounce the auto get call when path, params, etc. changes.
         */
        autoDelay: {
          type: Number,
          value: 300,
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
      };
    }

    static get observers() {
      return [
        '_autoGet(connectionId, auto, path, params, type, enrichers, enrichersEntity)',
        '_isLoading(activeRequests)',
      ];
    }

    /** Execute a 'GET' request */
    get() {
      this.method = 'get';
      return this.execute();
    }

    /** Execute a 'POST' request */
    post() {
      this.method = 'post';
      return this.execute();
    }

    /** Execute a 'PUT' request */
    put() {
      this.method = 'put';
      return this.execute();
    }

    /** Execute a 'DELETE' request */
    remove() {
      this.method = 'delete';
      return this.execute();
    }

    /** Execute the request */
    execute() {
      this._setActiveRequests(this.activeRequests + 1);
      const options = {method: this.method || 'get'};

      if (this.data && this.method !== 'get') {
        options.body = this.data;
      }

      // Look up document schemas to be returned
      if (this.schemas && this.schemas.length > 1) {
        options.schemas = this.schemas.trim().split(/[\s,]+/);
      }
      // Look up headers parameter
      options.headers = this.headers || {};
      // Force sync indexing
      if (this.syncIndexing) {
        options.headers.nx_es_sync = true;
      }
      // add support for plain text responses by default
      options.headers.accept = 'text/plain,application/json';
      // set default content-type
      options.headers['Content-Type'] = this.contentType;
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

      // resolve with full response to skip default unmarshallers
      options.resolveWithFullResponse = true;

      const params = this.params || {};
      return this.$.nx.request().then((request) => {
        this._request = request;
        return this._doExecute(params, options);
      });
    }

    _autoGet() {
      if (this.auto && this.path) {
        this._debouncer = Debouncer.debounce(
          this._debouncer,
          timeOut.after(this.autoDelay), () => this.get(),
        );
      }
    }

    _doExecute(params, options) {
      return this._request
        .path(this.path)
        .queryParams(params)
        .repositoryName(this._request._baseOptions.repositoryName === 'default' ?
          undefined : this._request._baseOptions.repositoryName)
        .execute(options)
        .then((response) => response.text().then((text) => {
          try {
            return text ? JSON.parse(text) : {};
          } catch (e) {
            return {error: 'Invalid json'};
          }
        }))
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
          this.success = false;
          this._setActiveRequests(this.activeRequests - 1);
          if (error.response) {
            if (error.response.status === 401) {
              this.dispatchEvent(new CustomEvent('unauthorized-request', {
                bubbles: true,
                composed: true,
                detail: error,
              }));
            }
            return error.response.text().then((text) => {
              if (text) {
                try {
                  this.error = JSON.parse(text);
                  this.error.status = error.response.status;
                  console.log(`Resource request failed: ${this.error.message}`);
                } catch (e) {
                  this.error = {message: 'Invalid json', status: error.response.status};
                }
              } else {
                this.error = {message: 'No message', status: error.response.status};
              }
              throw this.error;
            });
          } else {
            throw error;
          }
        });
    }

    _isLoading() {
      this._setLoading(this.activeRequests > 0);
    }
  }

  customElements.define(Resource.is, Resource);
  Nuxeo.Resource = Resource;
}
