/*
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
import moment from '@nuxeo/moment';
import '../nuxeo-workflow-data.js';

suite('nuxeo-workflow-data', () => {
  let server;

  function fakeResponse(json) {
    server.respondWith('POST', '/site/es/audit_wf/_search', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(json),
    ]);
  }

  setup(async () => {
    server = await login();
  });

  test('workflow-terms', async () => {
    const search = await fixture(html`
      <nuxeo-workflow-data workflow="wf" start-date="1980-01-01" end-date="1980-12-31"></nuxeo-workflow-data>
    `);
    assert.deepEqual(search.query.bool.must, [
      { term: { eventId: 'afterWorkflowFinish' } },
      { term: { 'extended.modelName': 'wf' } },
      { range: { eventDate: { gte: '1980-01-01', lte: '1980-12-31' } } },
    ]);
  });

  test('task-terms', async () => {
    const search = await fixture(html`
      <nuxeo-workflow-data workflow="wf" task="task"></nuxeo-workflow-data>
    `);
    assert.deepEqual(search.query.bool.must, [
      { term: { eventId: 'afterWorkflowTaskEnded' } },
      { term: { 'extended.modelName': 'wf' } },
      { term: { 'extended.taskName': 'task' } },
    ]);
  });

  test('metrics', async () => {
    fakeResponse({
      aggregations: {
        metrics: {
          value: 1,
        },
      },
    });
    const search = await fixture(html`
      <nuxeo-workflow-data metrics="avg(variable)"></nuxeo-workflow-data>
    `);
    assert.equal(search.aggregates.metrics.avg.field, 'extended.variable');
    await search.fetch();
    assert.equal(search.data, 1);
  });

  test('grouped-by', async () => {
    await fakeResponse({
      aggregations: {
        by: {
          buckets: [
            {
              key: 'bucket1',
              doc_count: 1,
            },
            {
              key: 'bucket2',
              doc_count: 2,
            },
          ],
        },
      },
    });
    const search = await fixture(html`
      <nuxeo-workflow-data grouped-by="variable"></nuxeo-workflow-data>
    `);
    assert.equal(search.aggregates.by.terms.field, 'extended.variable');
    await search.fetch();
    assert.isArray(search.data);
    assert.equal(search.data.length, 2);
    assert.deepEqual(search.data[0], { key: 'bucket1', value: 1 });
    assert.deepEqual(search.data[1], { key: 'bucket2', value: 2 });
  });

  test('multiple-groups', async () => {
    fakeResponse({});
    const search = await fixture(html`
      <nuxeo-workflow-data grouped-by="variable1,variable2" group-limit="5"></nuxeo-workflow-data>
    `);
    const agg1 = search.aggregates.by;
    const agg2 = agg1.aggs.by;
    assert.equal(agg1.terms.field, 'extended.variable1');
    assert.equal(agg1.terms.size, 5);
    assert.equal(agg2.terms.field, 'extended.variable2');
    assert.isUndefined(agg2.terms.size);
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
      <nuxeo-workflow-data with-ranges='{"variable":[{"key": "low", "to": 1500 },{"key": "high", "from": 1500}]}'>
      </nuxeo-workflow-data>
    `);
    assert.equal(search.aggregates.by.range.field, 'extended.variable');
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
      <nuxeo-workflow-data with-date-intervals="day" start-date="1980-01-01" end-date="1980-01-03">
      </nuxeo-workflow-data>
    `);
    assert.deepEqual(search.aggregates.by.date_histogram, {
      field: 'eventDate',
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
