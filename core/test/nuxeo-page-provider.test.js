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
import '../nuxeo-page-provider.js';

/* eslint-disable no-unused-expressions */
suite('<nuxeo-page-provider>', () => {
  const responseHeaders = {
    json: { 'Content-Type': 'application/json' },
    plain: { 'Content-Type': 'text/plain' },
  };

  let server;
  setup(() => {
    server = sinon.fakeServer.create();
    server.autoRespond = true;
  });

  teardown(() => {
    server.restore();
  });

  suite('when page provider has a false boolean param', () => {
    setup(() => {
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

    test('it should be sent to the server', async () => {
      server.respondWith(
        'GET',
        '/api/v1/search/pp/test_provider/execute?currentPageIndex=0&pageSize=40&boolean=false',
        [200, responseHeaders.json, '{"entity-type":"documents", "entries": []}'],
      );
      const pp = await fixture(html`
        <nuxeo-page-provider provider="test_provider" params='{"boolean": false}' page-size="40"></nuxeo-page-provider>
      `);

      const res = await pp.fetch();
      expect(res['entity-type']).to.be.eq('documents');
    });
  });

  suite('when page provider returns an error response', () => {
    setup(() => {
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

    test('it should throw an error', async () => {
      /*
       * This workaround is needed on Firefox due to the 'error' event fired in component.
       * More Details: https://github.com/webcomponents/webcomponentsjs/issues/138
       */
      const eventHandler = (e) => e.stopPropagation();
      document.addEventListener('error', eventHandler);

      server.respondWith('GET', '/api/v1/search/pp/test_provider/execute?currentPageIndex=0&pageSize=40', [
        500,
        responseHeaders.json,
        '{"entity-type":"exception", "message":"Internal Server Error", "status": 500}',
      ]);
      const pp = await fixture(html`
        <nuxeo-page-provider provider="test_provider" page-size="40"></nuxeo-page-provider>
      `);

      try {
        await pp.fetch();
      } catch (error) {
        expect(error).to.exist; // eslint-disable-line no-unused-expressions
        expect(error.status).to.be.eq(500);
        expect(error.message).to.be.eq('Internal Server Error');
        document.removeEventListener('error', eventHandler); // Cleaning the workaround listener
        return;
      }
      throw new Error('Expected to have an error response!');
    });
  });
});
