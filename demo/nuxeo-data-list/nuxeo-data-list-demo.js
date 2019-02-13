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
import '../../nuxeo-data-list/nuxeo-data-list.js';

{
  class DataListDemo extends PolymerElement {
    static get template() {
      return html`
    <style>
      .item {
        cursor: pointer;
        padding: 16px 22px;
        border-bottom: 1px solid #DDD;
      }
      .item:focus,
      .item.selected:focus {
        outline: 0;
        background-color: #ddd;
      }
      .item.selected {
        color: var(--paper-blue-600);
      }
      .item.selected {
        background-color: var(--google-grey-300);
        border-bottom: 1px solid #ccc;
      }

      .list-item {
        cursor: pointer;
        padding: 1em;
        border-bottom: 1px solid #DDD;
      }
      .list-item:focus,
      .list-item.selected:focus {
        outline: 0;
        background-color: #ddd;
      }
      .list-item.selected {
        color: var(--paper-blue-600);
        background-color: var(--google-grey-300);
        border-bottom: 1px solid #ccc;
      }

      .list-item-box {
        @apply --layout-vertical;
      }

      .list-item-info {
        @apply --layout-horizontal;
        @apply --layout-center;
      }

      .list-item-detail {
        margin-left: 40px;
      }

      .list-item-property {
        color: gray;
        margin-right: .2em;
      }

      .nxicon {
        height: 32px;
        width: 32px;
        border-radius: 20px;
        box-sizing: border-box;
        margin-right: 8px;
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
        params="{&quot;ecm_path&quot;: [&quot;/default-domain/workspaces&quot;]}">
      </nuxeo-page-provider>

      <nuxeo-data-list id="dataList" nx-provider="cvProvider" selection-enabled="" select-on-tap="">
        <template>
          <div tabindex\$="[[tabIndex]]" class\$="[[_computedClass(selected)]]">
            <div class="list-item-box">
              <div class="list-item-info">
                <div>
                  <img class="nxicon" src="[[_thumbnail(item)]]">
                </div>
                <span class="list-item-title">[[item.title]]</span>
              </div>
              <div class="list-item-detail">
                <div class="layout center">
                  <span class="list-item-property">
                    [[item.type]]
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="border"></div>
        </template>
      </nuxeo-data-list>

    </div>
`;
    }

    static get is() {
      return 'nuxeo-data-list-demo';
    }

    ready() {
      super.ready();
      this.$.dataList.fetch();
    }

    _computedClass(isSelected) {
      let classes = 'item';
      if (isSelected) {
        classes += ' selected';
      }
      return classes;
    }

    _thumbnail(doc) {
      if (doc && doc.uid) {
        if (doc.contextParameters && doc.contextParameters.thumbnail.url) {
          return doc.contextParameters.thumbnail.url;
        } else {
          const baseUrl = document.querySelector('nuxeo-connection').url;
          return `${baseUrl}/nxthumb/default/${doc.uid}/blobholder:0/`;
        }
      }
    }
  }

  customElements.define(DataListDemo.is, DataListDemo);
}
