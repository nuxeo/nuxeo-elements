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
import { fixture, html, waitChanged } from '@nuxeo/testing-helpers';
import '../nuxeo-operation.js';
import '../nuxeo-page-provider.js';

suite('nuxeo-operation', () => {
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

  suite('when executing an operation', () => {
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
        '{"entity-type":"user","username":"Administrator"}',
      ]);
    });

    test('should retrieve something valid', async () => {
      server.respondWith('POST', '/api/v1/automation/something', [
        200,
        responseHeaders.json,
        '{"success":true,"entity-type":"login"}',
      ]);

      const operation = await fixture(
        html`
          <nuxeo-operation op="something"></nuxeo-operation>
        `,
      );

      await operation.execute();
    });

    test('should tell it is loading', async () => {
      server.respondWith('POST', '/api/v1/automation/something', [
        200,
        responseHeaders.json,
        '{"success":true,"entity-type":"login"}',
      ]);

      const operation = await fixture(
        html`
          <nuxeo-operation op="something"></nuxeo-operation>
        `,
      );

      expect(operation.loading).to.be.false;

      operation.execute();

      expect(operation.loading).to.be.true;

      // wait for loading state to toggle on and off
      await waitChanged(operation, 'loading');

      expect(operation.loading).to.be.false;
    });

    // This test fails on firefox due to the 'error' event fired in component
    // https://github.com/webcomponents/webcomponentsjs/issues/138
    test("shouldn't retrieve something invalid", async () => {
      server.respondWith('POST', '/api/v1/automation/something', [
        500,
        responseHeaders.json,
        '{"message":"Internal Server Error"}',
      ]);

      const operation = await fixture(
        html`
          <nuxeo-operation op="something"></nuxeo-operation>
        `,
      );

      try {
        await operation.execute();
      } catch (error) {
        expect(error.message).to.be.eq('Internal Server Error');
        return;
      }

      throw new Error('Expected to an invalid response!');
    });
  });

  suite('when page provider is given as input', () => {
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
        '{"entity-type":"user","username":"Administrator"}',
      ]);
    });

    test('it should send provider as parameters', async () => {
      server.respondWith('POST', '/api/v1/automation/something', [
        200,
        responseHeaders.json,
        '{"entity-type":"documents", "entries": []}',
      ]);

      const provider = await fixture(html`
        <nuxeo-page-provider
          id="nx-pp"
          provider="test_provider"
          page="2"
          page-size="40"
          sort='{"field": "asc"}'
          params='{"boolean": false}'
        ></nuxeo-page-provider>
      `);

      const operation = await fixture(
        html`
          <nuxeo-operation op="something" .input=${provider}></nuxeo-operation>
        `,
      );

      await operation.execute();

      const last = server.requests.pop();
      const body = JSON.parse(last.requestBody);

      expect(body).to.deep.equal({
        params: {
          providerName: 'test_provider',
          currentPageIndex: 1,
          pageSize: 40,
          sortBy: 'field',
          sortOrder: 'asc',
          namedParameters: {
            boolean: 'false',
          },
          queryParams: [],
        },
        context: {},
      });
    });
  });

  suite('when a view is given as input', () => {
    let operation;
    let provider;
    let view;
    customElements.define(
      'custom-view-element',
      class extends Nuxeo.Element {
        static get is() {
          return 'custom-view-element';
        }

        static get properties() {
          return {
            nxProvider: {
              type: Object,
            },
            selectedItems: {
              type: Array,
              value: [],
            },
            selectAllEnabled: {
              type: Boolean,
              value: false,
            },
            selectAllActive: {
              type: Boolean,
              value: false,
            },
          };
        }
      },
    );

    function getBulkResponseFor(state) {
      return `{"entity-type":"bulkStatus", "value": { "commandId": "someCommand", "state": "${state}" }}`;
    }

    setup(async () => {
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
      server.respondWith('POST', '/api/v1/automation/something', [
        200,
        responseHeaders.json,
        '{"entity-type":"documents", "entries": []}',
      ]);
      server.respondWith('POST', '/api/v1/automation/Bulk.RunAction', [
        200,
        responseHeaders.json,
        getBulkResponseFor('RUNNING'),
      ]);
      server.respondWith('GET', '/api/v1/bulk/someCommand', [
        200,
        responseHeaders.json,
        getBulkResponseFor('COMPLETED'),
      ]);
      server.respondWith('PUT', '/api/v1/bulk/someCommand/abort', [
        200,
        responseHeaders.json,
        getBulkResponseFor('ABORTED'),
      ]);
      server.respondWith('POST', '/api/v1/automation/Elasticsearch.WaitForIndexing', [
        200,
        responseHeaders.plain,
        'true',
      ]);

      provider = await fixture(html`
        <nuxeo-page-provider
          id="nx-pp"
          provider="test_provider"
          page="2"
          page-size="40"
          sort='{"field": "asc"}'
          params='{"boolean": false}'
        ></nuxeo-page-provider>
      `);

      view = await fixture(html`
        <custom-view-element select-all-enabled></custom-view-element>
      `);
      view.nxProvider = provider;

      operation = await fixture(
        html`
          <nuxeo-operation op="something" .input=${view}></nuxeo-operation>
        `,
      );
    });

    teardown(() => {
      server.restore();
      view.selectAllActive = false;
    });

    test('without select all active it should send the view/provider as parameters', async () => {
      await operation.execute();
      const last = server.requests.pop();
      const body = JSON.parse(last.requestBody);
      expect(body).to.deep.equal({
        params: {
          providerName: 'test_provider',
          currentPageIndex: 1,
          pageSize: 40,
          sortBy: 'field',
          sortOrder: 'asc',
          namedParameters: {
            boolean: 'false',
          },
          queryParams: [],
        },
        context: {},
        input: 'docs:',
      });
    });

    test('with select all active response should be the bulk status update', async () => {
      view.selectAllActive = true;

      const response = await operation.execute();
      expect(response).to.deep.equal({
        'entity-type': 'bulkStatus',
        value: {
          commandId: 'someCommand',
          state: 'COMPLETED',
        },
      });
    });

    test('we can abort bulk actions', async () => {
      view.selectAllActive = true;

      const pollAborted = new Promise((resolve) => {
        operation.addEventListener('poll-aborted', (e) => resolve(e));
      });
      // keep the bulk request running until we abort it
      server.respondWith('GET', '/api/v1/bulk/someCommand', [200, responseHeaders.json, getBulkResponseFor('RUNNING')]);
      const response = operation.execute();

      operation._abort('someCommand');
      server.respondWith('GET', '/api/v1/bulk/someCommand', [200, responseHeaders.json, getBulkResponseFor('ABORTED')]);

      const result = await response;
      const abortResult = {
        'entity-type': 'bulkStatus',
        value: {
          commandId: 'someCommand',
          state: 'ABORTED',
        },
      };
      expect(result).to.deep.equal(abortResult);
      const evt = await pollAborted;
      expect(evt.detail).to.deep.equal(abortResult);
    });
  });
});
