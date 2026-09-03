/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

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
import { fixture, html, login } from '@nuxeo/testing-helpers';
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

// The suite above has been skipped since ELEMENTS-908 (the move to karma/open-wc) because its
// assertions depend on a full d3 render. `_transformSubBuckets` is a pure data transform, so it can
// be covered directly without rendering the sunburst or standing up a server.
suite('nuxeo-document-distribution-chart data transformation', () => {
  let chart;

  setup(async () => {
    chart = await fixture(html`
      <nuxeo-document-distribution-chart index="nuxeo" path="/default-domain" chart-hue="blue" chart-luminosity="light">
      </nuxeo-document-distribution-chart>
    `);
  });

  test('_transformSubBuckets renames key to name and doc_count to size in count mode', () => {
    chart.mode = 'count';
    const bucket = { key: 'workspaces', doc_count: 62, size: { value: 28650901 } };

    chart._transformSubBuckets(bucket);

    expect(bucket.name).to.equal('workspaces');
    expect(bucket.size).to.equal(62);
    expect(bucket).to.not.have.property('key');
    expect(bucket).to.not.have.property('doc_count');
  });

  test('_transformSubBuckets uses the size value in size mode', () => {
    chart.mode = 'size';
    const bucket = { key: 'workspaces', doc_count: 62, size: { value: 28650901 } };

    chart._transformSubBuckets(bucket);

    expect(bucket.size).to.equal(28650901);
  });

  test('_transformSubBuckets recurses into subLevel buckets, transforming every descendant', () => {
    chart.mode = 'count';
    const bucket = {
      key: 'workspaces',
      doc_count: 62,
      subLevel: {
        buckets: [
          { key: 'Media', doc_count: 35 },
          {
            key: 'Deep',
            doc_count: 19,
            subLevel: { buckets: [{ key: 'Nested', doc_count: 4 }] },
          },
        ],
      },
    };

    chart._transformSubBuckets(bucket);

    // subLevel is promoted to children at every level
    expect(bucket).to.not.have.property('subLevel');
    expect(bucket.children).to.have.lengthOf(2);

    // each child was transformed by the recursive call
    expect(bucket.children[0].name).to.equal('Media');
    expect(bucket.children[0].size).to.equal(35);
    expect(bucket.children[1].name).to.equal('Deep');
    expect(bucket.children[1].size).to.equal(19);

    // and the recursion reaches grandchildren
    expect(bucket.children[1].children).to.have.lengthOf(1);
    expect(bucket.children[1].children[0].name).to.equal('Nested');
    expect(bucket.children[1].children[0].size).to.equal(4);
  });

  test('_transformSubBuckets stops at an empty subLevel without adding children entries', () => {
    chart.mode = 'count';
    const bucket = { key: 'sections', doc_count: 1, subLevel: { buckets: [] } };

    chart._transformSubBuckets(bucket);

    expect(bucket.children).to.deep.equal([]);
    expect(bucket.name).to.equal('sections');
  });
});
