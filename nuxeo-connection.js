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

{

  // A global map of clients with connectionId as key.
  // This map is shared between all instances of nuxeo-connection.
  const nxClients = {};

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
   * Note: Elements that depend on a connectionId use `nx` as default.
   *
   * @memberof Nuxeo
   */
  class Connection extends Nuxeo.Element {
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
        /** A unique identifier for this connection. */
        connectionId: {
          type: String,
          value: 'nx',
        },

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
      };
    }

    /**
     * Fired when the client is connected.
     *
     * @event connected
     */

    ready() {
      super.ready();
      this.connect();
    }

    /**
     * Connects nuxeo client.
     */
    connect() {
      // Create the client if needed
      // If we already have a client with the same connection info just keep it
      const id = (this.connectionId) ? this.connectionId : Object.keys(nxClients)[0];
      this.client = nxClients[id];
      if (this.client) {
        // if this instance does not have any properties set properties from the client
        if (!this.url && !this.username && !this.password && !this.repositoryName) {
          this.set('url', this.client._baseURL);
          this.username = this.client._username;
          this.password = this.client._password;
          this.repositoryName = this.client._baseOptions.repositoryName;
        }
        // if properties match the existing client use it
        if (this.client._baseURL === this.url &&
          this.client._username === this.username &&
          this.client._password === this.password &&
          this.client._baseOptions.repositoryName === this.repositoryName) {
          // return the stored connection request promise and chain _handleConnected to update instance properties
          return this.client._promise.then(this._handleConnected.bind(this));
        } else {
          // otherwise override the client with the new properties
          this.client = null;
        }
      }
      const options = {
        baseURL: this.url,
        schemas: ['*'],
      };

      if (this.username) {
        options.auth = {
          method: 'basic',
          username: this.username,
          password: this.password,
        };
      }

      if (this.repositoryName) {
        options.repositoryName = this.repositoryName;
      }

      // eslint-disable-next-line no-undef
      nxClients[id] = this.client = this.client || new Nuxeo(options);

      // share the connect promise between all instances (one per client)
      this.client._promise = this.client.connect()
        .catch((error) => {
          console.log(`Nuxeo connection refused: ${error}`);
          throw error;
        });

      return this.client._promise.then(this._handleConnected.bind(this));
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

    _handleConnected(nuxeo) {
      if (this.client.connected) {
        this._setUser(nuxeo.user);
        this._setPlatformVersion(nuxeo.nuxeoVersion);
        this.dispatchEvent(new CustomEvent('connected', {bubbles: true, composed: true}));
      }
      return nuxeo.user;
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

  customElements.define(Connection.is, Connection);
  Nuxeo.Connection = Connection;
}
