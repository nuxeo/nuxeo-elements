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
import { fixture, html, login } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../dataviz/nuxeo-document-distribution-chart.js';
import { flush } from '@polymer/polymer/lib/utils/render-status';

suite.skip('nuxeo-document-distribution-chart', () => {
  let server;

  const includeAllCountResp = {
    aggregations: {
      subLevel: {
        buckets: [
          {
            doc_count: 62,
            key: 'workspaces',
            size: {
              value: 28650901.0,
            },
            subLevel: {
              buckets: [
                {
                  doc_count: 35,
                  key: 'Media',
                  size: {
                    value: 19544488.0,
                  },
                },
                {
                  doc_count: 19,
                  key: 'Deep',
                  size: {
                    value: 6625895.0,
                  },
                },
                {
                  doc_count: 7,
                  key: 'Small',
                  size: {
                    value: 2480518.0,
                  },
                },
              ],
            },
          },
          {
            doc_count: 9,
            key: 'UserWorkspaces',
            size: {
              value: 0.0,
            },
            subLevel: {
              buckets: [
                {
                  doc_count: 5,
                  key: 'Administrator',
                  size: {
                    value: 0.0,
                  },
                },
                {
                  doc_count: 3,
                  key: 'jdoe',
                  size: {
                    value: 0.0,
                  },
                },
              ],
            },
          },
          {
            doc_count: 1,
            key: 'sections',
            size: {
              value: 0.0,
            },
            subLevel: {
              buckets: [],
            },
          },
          {
            doc_count: 1,
            key: 'templates',
            size: {
              value: 0.0,
            },
            subLevel: {
              buckets: [],
            },
          },
        ],
      },
    },
  };

  setup(async () => {
    server = await login();
  });

  test('includeAllCount', async () => {
    const distribution = await fixture(html`
      <nuxeo-document-distribution-chart
        index="nuxeo"
        path="/default-domain"
        mode="count"
        max-depth="2"
        chart-hue="blue"
        chart-lumonisity="light"
        include-version
        include-hidden
        include-deleted
      >
      </nuxeo-document-distribution-chart>
    `);

    server.respondWith('POST', '/site/es/nuxeo/doc/_search', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(includeAllCountResp),
    ]);

    await distribution.execute();
    await flush();

    // check data transformation
    assert.equal(4, distribution._chartData.children.length);
    assert.equal('root', distribution._chartData.name);
    assert.equal(3, distribution._chartData.children[0].children.length);
    assert.equal(62, distribution._chartData.children[0].size);
    assert.equal('workspaces', distribution._chartData.children[0].name);

    // check chart
    assert.equal(10, dom(distribution.root).querySelectorAll('path').length);
  });

  test('includeAllSize', async () => {
    const distribution = await fixture(html`
      <nuxeo-document-distribution-chart
        index="nuxeo"
        path="/default-domain"
        mode="size"
        max-depth="2"
        chart-hue="blue"
        chart-lumonisity="light"
        include-version
        include-hidden
        include-deleted
      >
      </nuxeo-document-distribution-chart>
    `);

    server.respondWith('POST', '/site/es/nuxeo/doc/_search', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(includeAllCountResp),
    ]);

    await distribution.execute();
    await flush();

    // check data transformation
    assert.equal(4, distribution._chartData.children.length);
    assert.equal('root', distribution._chartData.name);
    assert.equal(3, distribution._chartData.children[0].children.length);
    assert.equal(28650901, distribution._chartData.children[0].size);
    assert.equal('workspaces', distribution._chartData.children[0].name);

    // check chart
    assert.equal(5, dom(distribution.root).querySelectorAll('path').length);
  });
});
