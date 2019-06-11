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
import '../../nuxeo-aggregation/nuxeo-dropdown-aggregation.js';
import '../../nuxeo-data-table/iron-data-table.js';

{
  class DataTableDemo extends PolymerElement {
    static get template() {
      return html`
        <style>
          nuxeo-data-table {
            width: 100%;
            height: 800px;
          }

          nuxeo-dropdown-aggregation {
            width: 100%;
          }

          .thumbnail {
            height: 32px;
            width: 32px;
            border-radius: 20px;
            box-sizing: border-box;
            margin-right: 1em;
          }
          .title {
          }
          .ellipsis {
            width: 100%;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            display: block;
          }

          .tag {
            display: inline-block;
            text-transform: uppercase;
            background-color: #edf1f5;
            color: #6d7684;
            padding: 0.2rem 0.4rem;
            margin: 0 0.3em 0.1em 0;
            font-size: 0.8rem;
            border-radius: 2px;
            line-height: initial;
          }
          .tag.user {
            color: #213f7d;
            border-radius: 2.5em;
            text-transform: capitalize;
          }

          .tag.user:hover {
            color: #00adff;
          }
        </style>

        <div class="content-view">
          <nuxeo-connection url="http://localhost:8080/nuxeo"></nuxeo-connection>

          <nuxeo-page-provider
            id="cvProvider"
            provider="default_search"
            page-size="40"
            aggregations="{{aggregations}}"
            enrichers="thumbnail"
            params='{"ecm_path": ["/default-domain/workspaces"]}'
          >
          </nuxeo-page-provider>

          <nuxeo-data-table id="datatable" nx-provider="cvProvider" selection-enabled multi-selection>
            <nuxeo-data-table-column
              name="Full text search"
              flex="100"
              filter-by="ecm_fulltext"
              filter-expression="$term*"
              sort-by="dc:title"
            >
              <template>
                <img class="thumbnail" src="[[_thumbnail(item)]]" />
                <a class="title ellipsis">[[item.title]]</a>
              </template>
            </nuxeo-data-table-column>
            <nuxeo-data-table-column filter-by="dc_modified_agg" flex="50" sort-by="dc:modified">
              <template is="header">
                <nuxeo-dropdown-aggregation
                  placeholder="Modified"
                  data="[[aggregations.dc_modified_agg]]"
                  value="{{column.filterValue}}"
                  multiple
                >
                </nuxeo-dropdown-aggregation>
              </template>
              <template>
                [[_formatDate(item.properties.dc:modified)]]
              </template>
            </nuxeo-data-table-column>
            <nuxeo-data-table-column filter-by="dc_creator_agg" flex="50">
              <template is="header">
                <nuxeo-dropdown-aggregation
                  placeholder="Author"
                  data="[[aggregations.dc_creator_agg]]"
                  value="{{column.filterValue}}"
                  multiple
                >
                </nuxeo-dropdown-aggregation>
              </template>
              <template>
                <span class="tag user">[[item.properties.dc:creator]]</span>
              </template>
            </nuxeo-data-table-column>
            <nuxeo-data-table-column name="Version">
              <template
                >[[_displayVersion(item)]]</template
              >
            </nuxeo-data-table-column>
            <nuxeo-data-table-column name="State">
              <template
                >[[item.state]]</template
              >
            </nuxeo-data-table-column>
          </nuxeo-data-table>
        </div>
      `;
    }

    static get is() {
      return 'nuxeo-data-table-demo';
    }

    ready() {
      super.ready();
      this.$.datatable.fetch();
    }

    _formatDate(date) {
      return date;
    }

    _thumbnail(doc) {
      if (doc && doc.uid) {
        if (doc.contextParameters && doc.contextParameters.thumbnail.url) {
          return doc.contextParameters.thumbnail.url;
        }
        const baseUrl = document.querySelector('nuxeo-connection').url;
        return `${baseUrl}/nxthumb/default/${doc.uid}/blobholder:0/`;
      }
    }

    _displayVersion(doc) {
      if (doc.properties && doc.properties['uid:major_version'] !== undefined) {
        return `${doc.properties['uid:major_version']}.${doc.properties['uid:minor_version']}`;
      }
    }
  }
  customElements.define(DataTableDemo.is, DataTableDemo);
}
