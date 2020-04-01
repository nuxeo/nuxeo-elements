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
  });
});
