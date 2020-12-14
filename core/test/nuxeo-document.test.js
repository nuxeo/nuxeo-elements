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
import { expect } from '@esm-bundle/chai';
import { waitChanged, fixture, html } from '@nuxeo/testing-helpers';
import { fakeServer } from 'sinon';
import '../nuxeo-document.js';

suite('nuxeo-document', () => {
  const responseHeaders = {
    json: { 'Content-Type': 'application/json' },
    plain: { 'Content-Type': 'text/plain' },
  };

  let server;
  setup(() => {
    server = fakeServer.create();
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
      '{"entity-type":"login","username":"Administrator"}',
    ]);
  });

  teardown(() => {
    server.restore();
  });

  suite('when retrieving documents', () => {
    test('should retrieve something valid', async () => {
      server.respondWith('GET', '/api/v1/path/something', [
        200,
        responseHeaders.json,
        '{"success":true,"entity-type":"document"}',
      ]);

      const document = await fixture(
        html`
          <nuxeo-document doc-path="something"></nuxeo-document>
        `,
      );
      try {
        await document.get();
      } catch (_) {
        throw new Error('Expected to a valid response!');
      }
    });

    // This test fails on firefox due to the 'error' event fired in component
    // https://github.com/webcomponents/webcomponentsjs/issues/138
    test("shouldn't retrieve something invalid", async () => {
      server.respondWith('GET', '/api/v1/path/something', [
        500,
        responseHeaders.json,
        '{"message":"Internal Server Error"}',
      ]);

      const document = await fixture(
        html`
          <nuxeo-document doc-path="something"></nuxeo-document>
        `,
      );
      try {
        await document.get();
      } catch (error) {
        expect(error.message).to.be.eq('Internal Server Error');
        return;
      }

      throw new Error('Expected to an invalid response!');
    });

    test('should tell it is loading', async () => {
      server.respondWith('GET', '/api/v1/id/something', [
        200,
        responseHeaders.json,
        '{"success":true,"entity-type":"document"}',
      ]);

      const document = await fixture(
        html`
          <nuxeo-document doc-id="something"></nuxeo-document>
        `,
      );

      expect(document.loading).to.be.false;

      document.get();

      expect(document.loading).to.be.true;

      // wait for loading state to toggle on and off
      await waitChanged(document, 'loading');

      expect(document.loading).to.be.false;
    });
  });

  suite('when generating the path', () => {
    test('should build a path from an id', async () => {
      const document = await fixture(
        html`
          <nuxeo-document doc-id="something"></nuxeo-document>
        `,
      );
      expect(document.path).to.be.eq('/id/something');
    });

    test('should build a path from a path', async () => {
      const document = await fixture('<nuxeo-document doc-path="something"></nuxeo-document>');
      expect(document.path).to.be.eq('/path/something');
    });
  });
});
