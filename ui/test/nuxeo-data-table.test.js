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
import { fixture, flush, html, login, waitForEvent } from '@nuxeo/testing-helpers';
import '@nuxeo/nuxeo-elements/nuxeo-page-provider.js';
import '../nuxeo-data-table/iron-data-table.js';

const simpleTableResp = {
  currentPageIndex: 0,
  currentPageSize: 40,
  'entity-type': 'documents',
  entries: [
    {
      changeToken: '1459425935768',
      contextParameters: {
        thumbnail: {
          url: 'http://webui.demo.nuxeo.com/nuxeo/api/v1/id/03820fea-d913-4505-87a5-92002fe8a19e/@rendition/thumbnail',
        },
      },
      'entity-type': 'document',
      facets: [
        'Versionable',
        'Publishable',
        'CollectionMember',
        'Commentable',
        'HasRelatedText',
        'Thumbnail',
        'Downloadable',
      ],
      isCheckedOut: true,
      lastModified: '2016-03-31T12:05:35.76Z',
      parentRef: '7dcccc54-023a-44ab-8cb6-a0f4835e70ca',
      path: '/default-domain/workspaces/Media/Rice Paddy.jpg',
      properties: {
        'collectionMember:collectionIds': ['9d1f90f4-54ee-4028-9e56-c63953fb8fe7'],
        'common:icon': '/icons/image.gif',
        'common:icon-expanded': null,
        'common:size': 22455727,
        'dc:contributors': ['Administrator'],
        'dc:coverage': null,
        'dc:created': '2016-03-31T12:05:35.76Z',
        'dc:creator': 'Administrator',
        'dc:description': null,
        'dc:expired': null,
        'dc:format': null,
        'dc:issued': null,
        'dc:language': null,
        'dc:lastContributor': 'Administrator',
        'dc:modified': '2016-03-31T12:05:35.76Z',
        'dc:nature': null,
        'dc:publisher': null,
        'dc:rights': null,
        'dc:source': null,
        'dc:subjects': [],
        'dc:title': 'Rice Paddy.jpg',
        'dc:valid': null,
        'file:content': {
          data:
            'http://webui.demo.nuxeo.com/nuxeo/nxfile/default/03820fea-d913-4505-87a5-92002fe8a19e/file:content/Rice%20Paddy.jpg',
          digest: '613a93967e8e92ce8e6c171b1c9e75ef',
          digestAlgorithm: 'MD5',
          encoding: null,
          length: '22455727',
          'mime-type': 'image/jpeg',
          name: 'Rice Paddy.jpg',
        },
        'file:filename': 'Rice Paddy.jpg',
        'files:files': [],
        'relatedtext:relatedtextresources': [],
        'thumb:thumbnail': {
          data:
            'http://webui.demo.nuxeo.com/nuxeo/nxfile/default/03820fea-d913-4505-87a5-92002fe8a19e/thumb:thumbnail/Rice%20Paddy.png',
          digest: 'ea8567272d77fa1bf903cc1299390732',
          digestAlgorithm: 'MD5',
          encoding: null,
          length: '164021',
          'mime-type': 'image/png',
          name: 'Rice Paddy.png',
        },
        'uid:major_version': 0,
        'uid:minor_version': 0,
        'uid:uid': null,
      },
      repository: 'default',
      state: 'project',
      title: 'Rice Paddy.jpg',
      type: 'File',
      uid: '03820fea-d913-4505-87a5-92002fe8a19e',
    },
    {
      changeToken: '1459425934764',
      contextParameters: {
        thumbnail: {
          url: 'http://webui.demo.nuxeo.com/nuxeo/api/v1/id/0ce60453-2668-482b-b113-f66a4848dae9/@rendition/thumbnail',
        },
      },
      'entity-type': 'document',
      facets: [
        'Versionable',
        'Publishable',
        'CollectionMember',
        'Commentable',
        'HasRelatedText',
        'Thumbnail',
        'Downloadable',
      ],
      isCheckedOut: true,
      lastModified: '2016-03-31T12:05:34.76Z',
      parentRef: '7dcccc54-023a-44ab-8cb6-a0f4835e70ca',
      path: '/default-domain/workspaces/Media/Mt. Fuji.jpg',
      properties: {
        'collectionMember:collectionIds': [],
        'common:icon': '/icons/image.gif',
        'common:icon-expanded': null,
        'common:size': 6858014,
        'dc:contributors': ['Administrator'],
        'dc:coverage': null,
        'dc:created': '2016-03-31T12:05:34.76Z',
        'dc:creator': 'Administrator',
        'dc:description': null,
        'dc:expired': null,
        'dc:format': null,
        'dc:issued': null,
        'dc:language': null,
        'dc:lastContributor': 'Administrator',
        'dc:modified': '2016-03-31T12:05:34.76Z',
        'dc:nature': null,
        'dc:publisher': null,
        'dc:rights': null,
        'dc:source': null,
        'dc:subjects': [],
        'dc:title': 'Mt. Fuji.jpg',
        'dc:valid': null,
        'file:content': {
          data:
            'http://webui.demo.nuxeo.com/nuxeo/nxfile/default/0ce60453-2668-482b-b113-f66a4848dae9/file:content/Mt.%20Fuji.jpg',
          digest: 'ed047d54bbd43bfe83c65f3954fa6e41',
          digestAlgorithm: 'MD5',
          encoding: null,
          length: '6858014',
          'mime-type': 'image/jpeg',
          name: 'Mt. Fuji.jpg',
        },
        'file:filename': 'Mt. Fuji.jpg',
        'files:files': [],
        'relatedtext:relatedtextresources': [],
        'thumb:thumbnail': {
          data:
            'http://webui.demo.nuxeo.com/nuxeo/nxfile/default/0ce60453-2668-482b-b113-f66a4848dae9/thumb:thumbnail/Mt.%20Fuji.png',
          digest: '718ffc4d240f8e8f6658b30aa3746e86',
          digestAlgorithm: 'MD5',
          encoding: null,
          length: '63546',
          'mime-type': 'image/png',
          name: 'Mt. Fuji.png',
        },
        'uid:major_version': 0,
        'uid:minor_version': 0,
        'uid:uid': null,
      },
      repository: 'default',
      state: 'project',
      title: 'Mt. Fuji.jpg',
      type: 'File',
      uid: '0ce60453-2668-482b-b113-f66a4848dae9',
    },
    {
      changeToken: '1468054472921',
      contextParameters: {
        thumbnail: {
          url: 'http://webui.demo.nuxeo.com/nuxeo/api/v1/id/146896f4-e005-4bc6-a940-54177fcee985/@rendition/thumbnail',
        },
      },
      'entity-type': 'document',
      facets: [
        'Versionable',
        'Publishable',
        'CollectionMember',
        'Commentable',
        'HasRelatedText',
        'Thumbnail',
        'Downloadable',
      ],
      isCheckedOut: true,
      lastModified: '2016-07-09T08:54:32.92Z',
      parentRef: '693c70b3-2bb5-456f-9611-884cc8e6c7a9',
      path: '/default-domain/workspaces/Test_Clipboard/Icon/512/enterprise-12-69854.png.1459504410133',
      properties: {
        'collectionMember:collectionIds': [
          '50110ba5-b129-40b2-9880-3d9783710404',
          'b8ffde44-afd3-45c1-98b1-424a3f90215e',
        ],
        'common:icon': '/icons/image.gif',
        'common:icon-expanded': null,
        'common:size': 11178,
        'dc:contributors': ['Administrator'],
        'dc:coverage': null,
        'dc:created': '2016-04-01T09:53:30.13Z',
        'dc:creator': 'Administrator',
        'dc:description': null,
        'dc:expired': null,
        'dc:format': null,
        'dc:issued': null,
        'dc:language': null,
        'dc:lastContributor': 'Administrator',
        'dc:modified': '2016-07-09T08:54:32.92Z',
        'dc:nature': null,
        'dc:publisher': null,
        'dc:rights': null,
        'dc:source': null,
        'dc:subjects': [],
        'dc:title': 'test ok',
        'dc:valid': null,
        'file:content': {
          data:
            'http://webui.demo.nuxeo.com/nuxeo/nxfile/default/146896f4-e005-4bc6-a940-54177fcee985/file:content/enterprise-12-69854.png',
          digest: 'da2af3cb560a610008040431dbab5272',
          digestAlgorithm: 'MD5',
          encoding: null,
          length: '11178',
          'mime-type': 'image/png',
          name: 'enterprise-12-69854.png',
        },
        'file:filename': 'enterprise-12-69854.png',
        'files:files': [],
        'relatedtext:relatedtextresources': [],
        'thumb:thumbnail': {
          data:
            'http://webui.demo.nuxeo.com/nuxeo/nxfile/default/146896f4-e005-4bc6-a940-54177fcee985/thumb:thumbnail/52e2b176a33d877795d6cc032e5b9e71',
          digest: '52e2b176a33d877795d6cc032e5b9e71',
          digestAlgorithm: 'MD5',
          encoding: null,
          length: '11993',
          'mime-type': 'image/png',
          name: '52e2b176a33d877795d6cc032e5b9e71',
        },
        'uid:major_version': 0,
        'uid:minor_version': 2,
        'uid:uid': null,
      },
      repository: 'default',
      state: 'project',
      title: 'test ok',
      type: 'File',
      uid: '146896f4-e005-4bc6-a940-54177fcee985',
    },
    {
      changeToken: '1465832239112',
      contextParameters: {
        thumbnail: {
          url: 'http://webui.demo.nuxeo.com/nuxeo/api/v1/id/1877604c-32b9-4126-a7bc-26f533e18cd8/@rendition/thumbnail',
        },
      },
      'entity-type': 'document',
      facets: [
        'Versionable',
        'Publishable',
        'CollectionMember',
        'Commentable',
        'HasRelatedText',
        'Thumbnail',
        'Downloadable',
      ],
      isCheckedOut: true,
      lastModified: '2016-06-13T15:37:19.11Z',
      parentRef: '7dcccc54-023a-44ab-8cb6-a0f4835e70ca',
      path: '/default-domain/workspaces/Media/Brushes.jpg',
      properties: {
        'collectionMember:collectionIds': ['9d1f90f4-54ee-4028-9e56-c63953fb8fe7'],
        'common:icon': '/icons/image.gif',
        'common:icon-expanded': null,
        'common:size': 14520231,
        'dc:contributors': ['Administrator'],
        'dc:coverage': null,
        'dc:created': '2016-03-31T12:05:32.82Z',
        'dc:creator': 'Administrator',
        'dc:description': null,
        'dc:expired': null,
        'dc:format': null,
        'dc:issued': null,
        'dc:language': null,
        'dc:lastContributor': 'Administrator',
        'dc:modified': '2016-06-13T15:37:19.11Z',
        'dc:nature': null,
        'dc:publisher': null,
        'dc:rights': null,
        'dc:source': null,
        'dc:subjects': [],
        'dc:title': 'Brushes.jpg',
        'dc:valid': null,
        'file:content': {
          data:
            'http://webui.demo.nuxeo.com/nuxeo/nxfile/default/1877604c-32b9-4126-a7bc-26f533e18cd8/file:content/Brushes.jpg',
          digest: '7738eafef3c6a5ba3d3cb6cde95ecdb3',
          digestAlgorithm: 'MD5',
          encoding: null,
          length: '14520231',
          'mime-type': 'image/jpeg',
          name: 'Brushes.jpg',
        },
        'file:filename': 'Brushes.jpg',
        'files:files': [],
        'relatedtext:relatedtextresources': [],
        'thumb:thumbnail': {
          data:
            'http://webui.demo.nuxeo.com/nuxeo/nxfile/default/1877604c-32b9-4126-a7bc-26f533e18cd8/thumb:thumbnail/Brushes.png',
          digest: '10be132c8f4c30b6f0560f2fb2ea5c45',
          digestAlgorithm: 'MD5',
          encoding: null,
          length: '141993',
          'mime-type': 'image/png',
          name: 'Brushes.png',
        },
        'uid:major_version': 0,
        'uid:minor_version': 0,
        'uid:uid': null,
      },
      repository: 'default',
      state: 'project',
      title: 'Brushes.jpg',
      type: 'File',
      uid: '1877604c-32b9-4126-a7bc-26f533e18cd8',
    },
  ],
  errorMessage: null,
  hasError: false,
  isLastPageAvailable: true,
  isNextPageAvailable: true,
  isPaginable: true,
  isPreviousPageAvailable: false,
  isSortable: true,
  maxPageSize: 1000,
  numberOfPages: 1,
  pageCount: 1,
  pageIndex: 0,
  pageSize: 40,
};

/* eslint-disable max-len */
suite('nuxeo-data-table', () => {
  let server;

  suite('table results', () => {
    setup(async () => {
      server = await login();
      server.respondWith(
        'GET',
        '/api/v1/search/pp/default_search/execute?currentPageIndex=0&offset=0&pageSize=40&ecm_path=%5B%22%2Fdefault-domain%2Fworkspaces%22%5D',
        [200, { 'Content-Type': 'application/json' }, JSON.stringify(simpleTableResp)],
      );
    });

    test('simpleTable', async () => {
      const table = (
        await fixture(html`
          <div>
            <nuxeo-page-provider
              id="cvProvider"
              provider="default_search"
              page-size="40"
              aggregations="{{aggregations}}"
              enrichers="thumbnail"
              params='{"ecm_path": ["/default-domain/workspaces"]}'
            >
            </nuxeo-page-provider>

            <nuxeo-data-table nx-provider="cvProvider" selection-enabled multi-selection>
              <nuxeo-data-table-column name="Full text search" flex="100" filter-by="ecm_fulltext" sort-by="dc:title">
                <template>
                  <a class="title ellipsis">[[item.title]]</a>
                </template>
              </nuxeo-data-table-column>
            </nuxeo-data-table>
          </div>
        `)
      ).querySelector('nuxeo-data-table');

      table.fetch();

      await waitForEvent(table, 'nuxeo-page-loaded', 1);
      await flush();
      assert.equal(4, table.$.list.items.length);
    });
  });
});
