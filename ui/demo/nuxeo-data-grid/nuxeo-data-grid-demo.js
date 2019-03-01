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
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@nuxeo/nuxeo-elements/nuxeo-page-provider.js';
import '../../nuxeo-data-grid/nuxeo-data-grid.js';

{
  class DataGridDemo extends PolymerElement {
    static get template() {
      return html`
    <style>
      nuxeo-data-grid {
        height: 800px;
      }
      img {
        width: 250px;
        height: 200px;
        border: 4px solid white;
      }
    </style>

    <nuxeo-connection url="http://localhost:8080/nuxeo"></nuxeo-connection>

    <nuxeo-page-provider
      id="provider"
      provider="default_search"
      page-size="40"
      enrichers="thumbnail"
      params="{&quot;ecm_path&quot;: [&quot;/default-domain/workspaces/demo&quot;]}">
    </nuxeo-page-provider>

    <nuxeo-data-grid id="grid" nx-provider="provider">
      <template>
        <img src="[[_url(item)]]">
      </template>
    </nuxeo-data-grid>
`;
    }

    static get is() {
      return 'nuxeo-data-grid-demo';
    }

    ready() {
      super.ready();
      this.$.grid.fetch();
    }

    _url(doc) {
      return doc && doc.contextParameters && doc.contextParameters.thumbnail && doc.contextParameters.thumbnail.url
        ? doc.contextParameters.thumbnail.url : '';
    }
  }
  customElements.define(DataGridDemo.is, DataGridDemo);
}
