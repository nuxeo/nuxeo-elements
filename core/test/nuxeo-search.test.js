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
import { fixture, flush, html, waitChanged } from '@nuxeo/testing-helpers';
import '../nuxeo-search.js';

suite('nuxeo-search', () => {
  const responseHeaders = {
    json: { 'Content-Type': 'application/json' },
  };

  let server;
  setup(() => {
    server = sinon.fakeServer.create();
    server.autoRespond = true;
    server.respondWith('GET', '/json/cmis', [200, responseHeaders.json, '{}']);
    server.respondWith('POST', '/api/v1/automation/login', [
      200,
      responseHeaders.json,
      '{"entity-type":"login","username":"Administrator"}',
    ]);
    server.respondWith('GET', '/api/v1/user/Administrator', [
      200,
      responseHeaders.json,
      '{"entity-type":"user","username":"Administrator"}',
    ]);
  });

  teardown(() => {
    server.restore();
  });

  test('get lists saved searches when search-id is empty', async () => {
    server.respondWith('GET', '/api/v1/search/saved', [
      200,
      responseHeaders.json,
      '{"entries":[{"id":"1","title":"One"}]}',
    ]);
    const el = await fixture(
      html`
        <nuxeo-search></nuxeo-search>
      `,
    );
    await el.get();
    expect(el.searches).to.deep.equal([{ id: '1', title: 'One' }]);
  });

  test('get loads a single saved search when search-id is set', async () => {
    server.respondWith('GET', '/api/v1/search/saved/foo', [
      200,
      responseHeaders.json,
      '{"id":"foo","title":"Foo search"}',
    ]);
    const el = await fixture(
      html`
        <nuxeo-search search-id="foo"></nuxeo-search>
      `,
    );
    const res = await el.get();
    expect(el.search).to.deep.equal({ id: 'foo', title: 'Foo search' });
    expect(res.id).to.equal('foo');
  });

  test('post saves a search', async () => {
    server.respondWith('POST', '/api/v1/search/saved', [
      201,
      responseHeaders.json,
      '{"entity-type":"savedSearch","id":"new-1"}',
    ]);
    const el = await fixture(
      html`
        <nuxeo-search></nuxeo-search>
      `,
    );
    const res = await el.post();
    expect(res.id).to.equal('new-1');
  });

  test('put updates a saved search', async () => {
    server.respondWith('PUT', '/api/v1/search/saved/foo', [
      200,
      responseHeaders.json,
      '{"id":"foo","title":"updated"}',
    ]);
    const el = await fixture(
      html`
        <nuxeo-search search-id="foo"></nuxeo-search>
      `,
    );
    const res = await el.put();
    expect(res.title).to.equal('updated');
  });

  test('remove deletes a saved search', async () => {
    server.respondWith('DELETE', '/api/v1/search/saved/foo', [200, responseHeaders.json, '{}']);
    const el = await fixture(
      html`
        <nuxeo-search search-id="foo"></nuxeo-search>
      `,
    );
    await el.remove();
  });

  test('execute loads results for a saved search id', async () => {
    server.respondWith('GET', '/api/v1/search/saved/bar', [200, responseHeaders.json, '{"id":"bar","title":"Bar"}']);
    server.respondWith('GET', '/api/v1/search/saved/bar/execute', [
      200,
      responseHeaders.json,
      '{"entries":[{"uid":"doc-1"}]}',
    ]);
    const el = await fixture(
      html`
        <nuxeo-search search-id="bar"></nuxeo-search>
      `,
    );
    await el.get();
    const resultsPromise = waitChanged(el, 'results');
    el.execute();
    await resultsPromise;
    expect(el.results).to.deep.equal([{ uid: 'doc-1' }]);
  });

  test('execute does nothing when search-id is missing', async () => {
    const el = await fixture(
      html`
        <nuxeo-search></nuxeo-search>
      `,
    );
    el.execute();
    await flush();
    expect(el.results).to.not.exist;
  });

  test('auto runs get then execute when search-id is set', async () => {
    server.respondWith('GET', '/api/v1/search/saved/baz', [200, responseHeaders.json, '{"id":"baz"}']);
    server.respondWith('GET', '/api/v1/search/saved/baz/execute', [
      200,
      responseHeaders.json,
      '{"entries":[{"uid":"from-auto"}]}',
    ]);
    const el = await fixture(
      html`
        <nuxeo-search search-id="baz" auto auto-delay="0"></nuxeo-search>
      `,
    );
    const resultsPromise = waitChanged(el, 'results');
    await flush();
    await resultsPromise;
    expect(el.results).to.deep.equal([{ uid: 'from-auto' }]);
  });
});
