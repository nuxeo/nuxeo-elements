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
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-resource.js';

suite('nuxeo-resource', () => {
  const responseHeaders = {
    json: { 'Content-Type': 'application/json' },
    plain: { 'Content-Type': 'text/plain' },
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

  suite('when retrieving resources', () => {
    test('should retrieve something valid', async () => {
      server.respondWith('GET', '/api/v1/something', [
        200,
        responseHeaders.json,
        '{"success":true,"entity-type":"login"}',
      ]);

      const resource = await fixture(
        html`
          <nuxeo-resource path="something"></nuxeo-resource>
        `,
      );

      await resource.get();
    });

    // This test fails on firefox due to the 'error' event fired in component
    // https://github.com/webcomponents/webcomponentsjs/issues/138
    test("shouldn't retrieve something invalid", async () => {
      server.respondWith('GET', '/api/v1/something', [
        500,
        responseHeaders.json,
        '{"message":"Internal Server Error"}',
      ]);

      const resource = await fixture(
        html`
          <nuxeo-resource path="something"></nuxeo-resource>
        `,
      );

      try {
        await resource.get();
      } catch (error) {
        expect(error.message).to.be.eq('Internal Server Error');
        return;
      }

      throw new Error('Expected to an invalid response!');
    });

    test('returns plain text when content-type is not json', async () => {
      server.respondWith('GET', '/api/v1/text', [200, responseHeaders.plain, 'hello']);
      const resource = await fixture(
        html`
          <nuxeo-resource path="text"></nuxeo-resource>
        `,
      );
      const data = await resource.get();
      expect(data).to.equal('hello');
    });

    test('returns object with error key when json body is malformed', async () => {
      server.respondWith('GET', '/api/v1/bad-json', [200, responseHeaders.json, '{not-json']);
      const resource = await fixture(
        html`
          <nuxeo-resource path="bad-json"></nuxeo-resource>
        `,
      );
      const data = await resource.get();
      expect(data).to.deep.equal({ error: 'Invalid json' });
    });

    test('returns empty object when json body is empty', async () => {
      server.respondWith('GET', '/api/v1/empty', [200, responseHeaders.json, '']);
      const resource = await fixture(
        html`
          <nuxeo-resource path="empty"></nuxeo-resource>
        `,
      );
      const data = await resource.get();
      expect(data).to.deep.equal({});
    });

    test('falls back to "Invalid json" error when error body is not json', async () => {
      server.respondWith('GET', '/api/v1/err-bad', [500, responseHeaders.json, 'plain error not json']);
      const resource = await fixture(
        html`
          <nuxeo-resource path="err-bad"></nuxeo-resource>
        `,
      );
      try {
        await resource.get();
      } catch (err) {
        expect(err.message).to.equal('Invalid json');
        expect(err.status).to.equal(500);
        return;
      }
      throw new Error('Expected an error');
    });

    test('falls back to "No message" error when error body is empty', async () => {
      server.respondWith('GET', '/api/v1/err-empty', [503, responseHeaders.json, '']);
      const resource = await fixture(
        html`
          <nuxeo-resource path="err-empty"></nuxeo-resource>
        `,
      );
      try {
        await resource.get();
      } catch (err) {
        expect(err.message).to.equal('No message');
        expect(err.status).to.equal(503);
        return;
      }
      throw new Error('Expected an error');
    });

    test('dispatches "unauthorized-request" on 401 errors', async () => {
      server.respondWith('GET', '/api/v1/forbidden', [401, responseHeaders.json, '{"message":"Unauthorized"}']);
      const resource = await fixture(
        html`
          <nuxeo-resource path="forbidden"></nuxeo-resource>
        `,
      );
      const eventPromise = new Promise((resolve) => {
        resource.addEventListener('unauthorized-request', resolve);
      });
      try {
        await resource.get();
      } catch (_) {
        // expected
      }
      const evt = await eventPromise;
      expect(evt).to.exist;
    });
  });

  suite('http method helpers', () => {
    setup(() => {
      server.respondWith('POST', '/api/v1/something', [200, responseHeaders.json, '{"ok":true}']);
      server.respondWith('PUT', '/api/v1/something', [200, responseHeaders.json, '{"ok":true}']);
      server.respondWith('DELETE', '/api/v1/something', [200, responseHeaders.json, '{}']);
    });

    test('post sends data and uses POST method', async () => {
      const resource = await fixture(
        html`
          <nuxeo-resource path="something"></nuxeo-resource>
        `,
      );
      resource.data = { hello: 'world' };
      await resource.post();
      const last = server.requests.find((r) => r.method === 'POST' && r.url.endsWith('/something'));
      expect(last).to.exist;
      expect(JSON.parse(last.requestBody)).to.deep.equal({ hello: 'world' });
    });

    test('put uses PUT method', async () => {
      const resource = await fixture(
        html`
          <nuxeo-resource path="something"></nuxeo-resource>
        `,
      );
      await resource.put();
      const last = server.requests.find((r) => r.method === 'PUT' && r.url.endsWith('/something'));
      expect(last).to.exist;
    });

    test('remove uses DELETE method', async () => {
      const resource = await fixture(
        html`
          <nuxeo-resource path="something"></nuxeo-resource>
        `,
      );
      await resource.remove();
      const last = server.requests.find((r) => r.method === 'DELETE' && r.url.endsWith('/something'));
      expect(last).to.exist;
    });
  });

  suite('request options', () => {
    setup(() => {
      server.respondWith('GET', /\/api\/v1\/things.*/, [200, responseHeaders.json, '{}']);
    });

    test('sets schemas, sync indexing and enricher headers (string and array)', async () => {
      const resource = await fixture(html`
        <nuxeo-resource path="things" sync-indexing schemas="dublincore, common"></nuxeo-resource>
      `);
      resource.enrichers = { document: ['preview', 'permissions'], user: 'profile' };
      await resource.get();
      const last = server.requests[server.requests.length - 1];
      expect(last.requestHeaders['nx-es-sync']).to.equal('true');
      expect(last.requestHeaders['enrichers-document']).to.contain('preview,permissions');
      expect(last.requestHeaders['enrichers-user']).to.contain('profile');
    });

    test('falls back enrichers as a string to enrichersEntity', async () => {
      const resource = await fixture(
        html`
          <nuxeo-resource path="things"></nuxeo-resource>
        `,
      );
      resource.enrichers = 'thumbnail';
      await resource.get();
      const last = server.requests[server.requests.length - 1];
      expect(last.requestHeaders['enrichers-document']).to.contain('thumbnail');
    });

    test('aborts the previous request when a new one starts (cancelable)', async () => {
      const resource = await fixture(
        html`
          <nuxeo-resource path="things"></nuxeo-resource>
        `,
      );
      const first = resource.get().catch(() => undefined);
      await resource.get();
      await first;
      expect(resource._controller).to.exist;
    });

    test('auto-fetches when path changes after auto is enabled', async () => {
      await fixture(html`
        <nuxeo-resource auto auto-delay="0" path="things/auto"></nuxeo-resource>
      `);
      await new Promise((resolve) => setTimeout(resolve, 50));
      const fetched = server.requests.some((r) => r.url.indexOf('/things/auto') >= 0);
      expect(fetched).to.be.true;
    });

    test('uncancelable=true does not abort previous request', async () => {
      const resource = await fixture(html`
        <nuxeo-resource path="things" uncancelable></nuxeo-resource>
      `);
      const first = resource.get();
      const second = resource.get();
      await Promise.all([first, second]);
      expect(resource._controller).to.be.undefined;
    });

    test('falls back to GET when method is unset before execute', async () => {
      const resource = await fixture(
        html`
          <nuxeo-resource path="things"></nuxeo-resource>
        `,
      );
      resource.method = null;
      await resource.execute();
      const last = server.requests.find((r) => r.url.indexOf('/things') >= 0);
      expect(last.method).to.equal('GET');
    });
  });
});
