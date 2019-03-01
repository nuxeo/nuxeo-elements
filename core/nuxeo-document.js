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
import './nuxeo-resource.js';

{
  /**
   * `nuxeo-document` allows managing Documents on a Nuxeo server.
   *
   *     <nuxeo-document auto doc-path="/default-domain"></nuxeo-document>
   *
   * With `auto` set to `true`, the GET method is executed whenever
   * its `docPath` or `docId` properties are changed.
   *
   * You can trigger a method explicitly by calling `get`, `post`, `put` or `delete` on the
   * element.
   *
   * @memberof Nuxeo
   */
  class DocumentElement extends Nuxeo.Element {
    static get template() {
      return html`
        <style>
          :host {
            display: none;
          }
        </style>
        <nuxeo-resource
          id="nxResource"
          connection-id="{{connectionId}}"
          method="{{method}}"
          auto="{{auto}}"
          path="{{path}}"
          data="{{data}}"
          enrichers="{{enrichers}}"
          params="{{params}}"
          headers="{{headers}}"
          type="{{type}}"
          response="{{response}}"
          schemas="[[schemas]]"
          sync-indexing\$="[[syncIndexing]]"
        >
        </nuxeo-resource>
      `;
    }

    static get is() {
      return 'nuxeo-document';
    }

    static get properties() {
      return {
        /** Inherited properties of nuxeo-resource: TODO -> USE EXTENDS WHEN AVAILABLE */

        /** The id of a nuxeo-connection to use. */
        connectionId: {
          type: String,
          value: '',
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

        /** The document id. Either 'docId' or 'docPath' must be defined. */
        docId: {
          type: String,
          value: '',
        },

        /** The document path. Either 'docId' or 'docPath' must be defined. */
        docPath: {
          type: String,
          value: '',
        },

        /** The path of the resource. */
        path: {
          type: String,
          computed: '_computePath(docId, docPath)',
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
          value: '',
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

    ready() {
      super.ready();
      this.$.nxResource.addEventListener('loading-changed', () => {
        this._setLoading(this.$.nxResource.loading);
      });
    }

    /* Fetch the document. */
    get() {
      this.method = 'get';
      return this.execute();
    }

    /* Create the document. */
    post() {
      this.method = 'post';
      return this.execute();
    }

    /* 'Update the document. */
    put() {
      this.method = 'put';
      return this.execute();
    }

    /* Delete the document. */
    remove() {
      this.method = 'delete';
      return this.execute();
    }

    /* Execute the request. */
    execute() {
      return this.$.nxResource.execute();
    }

    _computePath(docId, docPath) {
      let path = '';
      if (docId) {
        path = `/id/${docId}`;
      } else if (docPath) {
        path = `/path/${docPath}`;
      }
      return path;
    }
  }

  customElements.define(DocumentElement.is, DocumentElement);
  Nuxeo.Document = DocumentElement;
}
