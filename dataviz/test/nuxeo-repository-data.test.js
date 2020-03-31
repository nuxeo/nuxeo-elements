/*
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
import { fixture, html, login } from '@nuxeo/testing-helpers';
import moment from '@nuxeo/moment';
import '../nuxeo-repository-data.js';

suite('nuxeo-repository-data', () => {
  let server;

  function fakeResponse(json) {
    server.respondWith('POST', '/site/es/nuxeo/_search', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(json),
    ]);
  }

  setup(async () => {
    server = await login();
  });

  test('ecm-terms', async () => {
    const search = await fixture(html`
      <nuxeo-repository-data ecm-primary-type="Note" ecm-lifecycle-state="project" ecm-mixin-type="Versionable">
      </nuxeo-repository-data>
    `);
    assert.deepEqual(search.query.bool.must, [
      { terms: { 'ecm:primaryType': ['Note'] } },
      { terms: { 'ecm:currentLifeCycleState': ['project'] } },
      { terms: { 'ecm:mixinType': ['Versionable'] } },
    ]);
  });

  test('ecm-multiple-terms', async () => {
    const search = await fixture(html`
      <nuxeo-repository-data
        ecm-primary-type="File,Note"
        ecm-lifecycle-state="project,approved"
        ecm-mixin-type="Versionable, Downloadable"
      >
      </nuxeo-repository-data>
    `);
    assert.deepEqual(search.query.bool.must, [
      { terms: { 'ecm:primaryType': ['File', 'Note'] } },
      { terms: { 'ecm:currentLifeCycleState': ['project', 'approved'] } },
      { terms: { 'ecm:mixinType': ['Versionable', 'Downloadable'] } },
    ]);
  });

  test('grouped-by', async () => {
    fakeResponse({
      aggregations: {
        by: {
          buckets: [
            {
              key: 'group1',
              doc_count: 1,
            },
            {
              key: 'group2',
              doc_count: 2,
            },
          ],
        },
      },
    });
    const search = await fixture(
      html`
        <nuxeo-repository-data grouped-by="schema:field"></nuxeo-repository-data>
      `,
    );
    assert.equal(search.aggregates.by.terms.field, 'schema:field');
    await search.fetch();
    assert.isArray(search.data);
    assert.equal(search.data.length, 2);
    assert.deepEqual(search.data[0], { key: 'group1', value: 1 });
    assert.deepEqual(search.data[1], { key: 'group2', value: 2 });
  });

  test('multiple-groups', async () => {
    fakeResponse({});
    const search = await fixture(html`
      <nuxeo-repository-data grouped-by="schema:field1,schema:field2" group-limit="5"></nuxeo-repository-data>
    `);
    const agg1 = search.aggregates.by;
    const agg2 = agg1.aggs.by;
    assert.equal(agg1.terms.field, 'schema:field1');
    assert.equal(agg1.terms.size, 5);
    assert.equal(agg2.terms.field, 'schema:field2');
    assert.isUndefined(agg2.terms.size);
  });

  test('metrics', async () => {
    fakeResponse({
      aggregations: {
        metrics: {
          value: 1,
        },
      },
    });
    const search = await fixture(
      html`
        <nuxeo-repository-data metrics="avg(schema:field)"></nuxeo-repository-data>
      `,
    );
    assert.equal(search.aggregates.metrics.avg.field, 'schema:field');
    await search.fetch();
    assert.equal(search.data, 1);
  });

  test('ranges', async () => {
    fakeResponse({
      aggregations: {
        by: {
          buckets: [
            {
              key: 'low',
              doc_count: 1,
            },
            {
              key: 'high',
              doc_count: 2,
            },
          ],
        },
      },
    });
    const search = await fixture(html`
      <nuxeo-repository-data with-ranges='{"schema:field":[{"key": "low", "to": 1500 },{"key": "high", "from": 1500}]}'>
      </nuxeo-repository-data>
    `);
    assert.equal(search.aggregates.by.range.field, 'schema:field');
    assert.deepEqual(search.aggregates.by.range.ranges, [
      { key: 'low', to: 1500 },
      { key: 'high', from: 1500 },
    ]);
    await search.fetch();
    assert.isArray(search.data);
    assert.equal(search.data.length, 2);
    assert.deepEqual(search.data[0], { key: 'low', value: 1 });
    assert.deepEqual(search.data[1], { key: 'high', value: 2 });
  });

  test('date-intervals', async () => {
    fakeResponse({
      aggregations: {
        by: {
          buckets: [
            { key_as_string: '1980-01-01', doc_count: 1 },
            { key_as_string: '1980-01-02', doc_count: 2 },
            { key_as_string: '1980-01-03', doc_count: 3 },
          ],
        },
      },
    });
    const search = await fixture(html`
      <nuxeo-repository-data
        with-date-intervals="day"
        date-field="schema:field"
        date-format="yyyy-MM-dd"
        start-date="1980-01-01"
        end-date="1980-01-03"
      >
      </nuxeo-repository-data>
    `);
    assert.deepEqual(search.aggregates.by.date_histogram, {
      field: 'schema:field',
      format: 'yyyy-MM-dd',
      interval: 'day',
      min_doc_count: 0,
      extended_bounds: {
        min: '1980-01-01',
        max: '1980-01-03',
      },
      time_zone: moment().format('Z'),
    });
    await search.fetch();
    assert.isArray(search.data);
    assert.equal(search.data.length, 3);
    assert.deepEqual(search.data, [
      { key: '1980-01-01', value: 1 },
      { key: '1980-01-02', value: 2 },
      { key: '1980-01-03', value: 3 },
    ]);
  });
});
