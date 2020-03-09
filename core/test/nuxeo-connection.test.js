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
import { fixture, html } from './test-helpers';
import '../nuxeo-connection.js';

const responseHeaders = {
  json: { 'Content-Type': 'application/json' },
  plain: { 'Content-Type': 'text/plain' },
};

const loginResponse = [200, responseHeaders.json, '{"entity-type":"login","username":"Administrator"}'];

const userResponse = [200, responseHeaders.json, '{"entity-type":"user","username":"Administrator"}'];

const cmisResponse = [200, responseHeaders.json, '{}'];

suite('nuxeo-connection', () => {
  let server;

  setup(() => {
    server = sinon.fakeServer.create();
    server.autoRespond = true;
  });

  teardown(() => {
    server.restore();
  });

  suite('when login request succeed', () => {
    setup(() => {
      server.respondWith('GET', '/json/cmis', cmisResponse);
      server.respondWith('POST', '/api/v1/automation/login', loginResponse);
      server.respondWith('GET', '/api/v1/user/Administrator', userResponse);
    });

    test('should run the next', async () => {
      const connection = await fixture(
        html`
          <nuxeo-connection connection-id="nxc-ok"></nuxeo-connection>
        `,
      );

      try {
        // Return current connection
        await connection.connect();

        // Test if component succeeded to log in
        expect(connection.connected).to.be.equal(true);
      } catch (_) {
        // We shouldn't be there
        throw new Error('Expected to run something after a succeeded connection!');
      }
    });
  });

  suite('when login request fail', () => {
    setup(() => {
      server.respondWith('GET', '/json/cmis', [
        401,
        responseHeaders.json,
        '{"error":true,"message":"An error occurred"}',
      ]);
      server.respondWith('POST', '/api/v1/automation/login', [
        401,
        responseHeaders.json,
        '{"error":true,"message":"An error occurred"}',
      ]);
    });

    test('should not run the next', async () => {
      const connection = await fixture(
        html`
          <nuxeo-connection connection-id="nxc-ko"></nuxeo-connection>
        `,
      );

      // Test if component failed to log in
      expect(connection.connected).to.be.equal(false);

      try {
        // Return current connection
        await connection.connect();
      } catch (error) {
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.be.eq('Unauthorized');
        return;
      }
      // We shouldn't be there
      throw new Error('Expected to not run something after a failed connection!');
    });
  });

  suite('when using multiple connections', () => {
    setup(() => {
      server.respondWith('GET', '/json/cmis', cmisResponse);
      server.respondWith('POST', '/api/v1/automation/login', loginResponse);
      server.respondWith('GET', '/api/v1/user/Administrator', userResponse);
    });

    test('first connection should succeed', async () => {
      const connection = await fixture(
        html`
          <nuxeo-connection></nuxeo-connection>
        `,
      );

      await connection.connect();

      // Ensure two requests are done so far
      expect(server.requests.length).to.be.equal(3);
      // Test if component succeeded to log in
      expect(connection.connected).to.be.equal(true);
    });

    test('similar connections should not issue requests', async () => {
      const connection = await fixture(
        html`
          <nuxeo-connection></nuxeo-connection>
        `,
      );

      await connection.connect();

      // Ensure no requests were done
      expect(server.requests.length).to.be.equal(0);
      // Test if component succeeded to log in
      expect(connection.connected).to.be.equal(true);
    });
  });
});
