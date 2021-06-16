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
import 'nuxeo/nuxeo.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import './nuxeo-element.js';

// A global map of clients with connectionId as key.
// This map is shared between all instances of nuxeo-connection.
const connections = {};

export class Connection {
  constructor(opts) {
    this.id = (opts && opts.id) || 'nx';
    this.url = (opts && opts.url) || '';
    this.repositoryName = (opts && opts.repositoryName) || null;
    this.username = (opts && opts.username) || null;
    this.password = (opts && opts.password) || null;
    this.method = (opts && opts.method) || 'basic';
    this.token = (opts && opts.token) || null;
  }

  connect() {
    // Create the client if needed
    if (this.client) {
      // if this instance does not have any properties set properties from the client
      if (!this.url && !this.username && !this.password && !this.repositoryName) {
        this.url = this.client._baseURL;
        this.username = this.client._username;
        this.password = this.client._password;
        this.repositoryName = this.client._baseOptions.repositoryName;
      }
      // if properties match the existing client use it
      if (
        this.client._baseURL === this.url &&
        this.client._username === this.username &&
        this.client._password === this.password &&
        this.client._baseOptions.repositoryName === this.repositoryName
      ) {
        // return the stored connection request promise and chain _handleConnected to update instance properties
        return this.client._promise;
      }
      // otherwise override the client with the new properties
      this.client = null;
    }

    const options = {
      baseURL: this.url,
      schemas: ['*'],
    };

    if (this.method === 'basic') {
      if (this.username) {
        options.auth = {
          method: 'basic',
          username: this.username,
          password: this.password,
        };
      }
    } else {
      if (this.method === 'token' && this.token) {
        options.auth = {
          method: 'token',
          token: this.token,
        };
      }
      options.headers = { 'X-No-Basic-Header': true };
    }

    if (this.repositoryName) {
      options.repositoryName = this.repositoryName;
    }

    // eslint-disable-next-line no-undef
    this.client = this.client || new Nuxeo(options);

    // share the connect promise between all instances (one per client)
    this.client._promise = this.client.connect();

    return this.client._promise.catch((error) => {
      if (error.response.status === 401) {
        if (this.method === 'form') {
          // store url fragment in cookie
          document.cookie = `nuxeo.start.url.fragment=${window.location.hash.substring(1) || ''}; path=/`;
          const loginUrl = `${this.url}/login.jsp?requestedUrl=${window.location.href}`;
          window.location.replace(loginUrl);
          return;
        }
      }
      throw error;
    });
  }

  /**
   *  Returns true if client is connected.
   *  @type {Boolean}
   */
  get connected() {
    return this.client && this.client.connected;
  }

  /**
   * Returns true if there are active requests.
   * @type {Boolean}
   */
  get active() {
    return this.client && this.client._activeRequests > 0;
  }

  /**
   * Returns a request object that allows REST requests to be executed on a Nuxeo Platform instance.
   */
  request() {
    return this.connect().then(() => this.client.request());
  }

  /**
   * Returns an operation object that allows operations to be executed on a Nuxeo Platform instance.
   * @param {string} op The operation to be executed.
   */
  operation(op) {
    return this.connect().then(() => this.client.operation(op));
  }

  /**
   * Get the http resource.
   * @param {string} url The url to be loaded.
   */
  http(url) {
    return this.connect().then(() => this.client._http({ url }));
  }

  /**
   * Returns an object that allows blobs to be uploaded to a Nuxeo Platform instance using the Batch Upload API.
   */
  batchUpload() {
    return this.connect().then(() => this.client.batchUpload());
  }
}

/**
 * Injects a connection in `superClass`. The connection to be used is determined by `connectionId`. Only one instance
 * is used per id.
 * @polymer
 * @mixinFunction
 */
export const ConnectionMixin = (superClass) =>
  class extends superClass {
    static get properties() {
      return {
        /** A unique identifier for this connection. */
        connectionId: {
          type: String,
          value: 'nx',
        },
      };
    }

    /**
     * Returns the `Connection` instance corresponding to `connectionId`.
     */
    get connection() {
      const id = this.connectionId || Object.keys(connections)[0] || 'nx';
      return connections[id] || this._init(id);
    }

    get client() {
      return this.connection.client;
    }

    _init(id) {
      if (!id) {
        throw new Error('no id was specified');
      }
      const connection = new Connection({ id });
      connections[id] = connection;
      return connection;
    }
  };

{
  /**
   * `nuxeo-connection` wraps a `nuxeo.Client`.
   *
   *     <nuxeo-connection
   *       id="nx_connection"
   *       url="http://demo.nuxeo.com"
   *       username="Administrator"
   *       password="Administrator">
   *     </nuxeo-connection>
   *
   * Note:
   * - Elements that depend on a connectionId use `nx` as default.
   * - a 'token' property can be set for Token Authentication (set method="token")
   *
   *
   * @memberof Nuxeo
   */
  class ConnectionElement extends ConnectionMixin(Nuxeo.Element) {
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
      return 'nuxeo-connection';
    }

    static get properties() {
      return {
        /** The base URL of the Nuxeo server. */
        url: {
          type: String,
          value: '',
          notify: true,
        },

        /** The repository name. */
        repositoryName: {
          type: String,
          value: null,
        },

        /** The username. */
        username: {
          type: String,
          value: null,
        },

        /** The password. */
        password: {
          type: String,
          value: null,
        },

        /** The authentication method to use. */
        method: {
          type: String,
          value: 'basic',
        },

        /** The current user entity */
        user: {
          type: Object,
          readOnly: true,
          notify: true,
        },

        /** The platform version */
        platformVersion: {
          type: String,
          readOnly: true,
          notify: true,
        },

        /** Authentication Token */
        token: {
          type: String,
          value: null,
        },
      };
    }

    /**
     * Fired when the client is connected.
     *
     * @event connected
     */

    ready() {
      super.ready();
      this.connect().catch((error) => {
        console.warn(`Nuxeo connection refused: ${error}`);
      });
    }

    /**
     * Connects nuxeo client.
     */
    connect() {
      this.connection.connectionId = this.connectionId;
      this.connection.url = this.url;
      this.connection.repositoryName = this.repositoryName;
      this.connection.username = this.username;
      this.connection.password = this.password;
      this.connection.method = this.method;
      this.connection.token = this.token;

      return this.connection
        .connect()
        .then(this._handleConnected.bind(this))
        .finally(() => {
          if (this.url !== this.connection.url) {
            this.url = this.connection.url;
          }
        });
    }

    /**
     *  Returns true if client is connected.
     *  @type {Boolean}
     */
    get connected() {
      return this.connection && this.connection.connected;
    }

    /**
     * Returns true if there are active requests.
     * @type {Boolean}
     */
    get active() {
      return this.connection && this.connection.active;
    }

    _handleConnected(nuxeo) {
      if (this.connection.connected) {
        this._setUser(nuxeo.user);
        this._setPlatformVersion(nuxeo.nuxeoVersion);
        this.dispatchEvent(new CustomEvent('connected', { bubbles: true, composed: true }));
      }
      return nuxeo.user;
    }

    /**
     * Returns a request object that allows REST requests to be executed on a Nuxeo Platform instance.
     */
    request() {
      return this.connection && this.connection.request();
    }

    /**
     * Returns an operation object that allows operations to be executed on a Nuxeo Platform instance.
     * @param {string} op The operation to be executed.
     */
    operation(op) {
      return this.connection && this.connection.operation(op);
    }

    /**
     * Get the http resource.
     * @param {string} url The url to be loaded.
     */
    http(url) {
      return this.connection && this.connection.http(url);
    }

    /**
     * Returns an object that allows blobs to be uploaded to a Nuxeo Platform instance using the Batch Upload API.
     */
    batchUpload() {
      return this.connection && this.connection.batchUpload();
    }
  }

  customElements.define(ConnectionElement.is, ConnectionElement);
  Nuxeo.Connection = ConnectionElement;
}
