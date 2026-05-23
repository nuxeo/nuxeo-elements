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

  function getNuxeoPageProvider(hasExcludeDocs = false) {
    if (hasExcludeDocs) {
      return fixture(html`
        <nuxeo-page-provider
          id="nx-pp"
          provider="test_provider"
          page="2"
          page-size="40"
          sort='{"field": "asc"}'
          params='{
          "boolean": false,
          "excludeDocs": ["fabf0fa3-0f0a-4b26-8fde-9c4ac869cd5f","f17544e4-5945-4b5c-b4a9-d48d2468b75b"]
        }'
        ></nuxeo-page-provider>
      `);
    }
    return fixture(html`
      <nuxeo-page-provider
        id="nx-pp"
        provider="test_provider"
        page="2"
        page-size="40"
        sort='{"field": "asc"}'
        params='{"boolean": false}'
      ></nuxeo-page-provider>
    `);
  }

  function getNuxeoOperation(provider) {
    return fixture(
      html`
        <nuxeo-operation op="something" .input=${provider}></nuxeo-operation>
      `,
    );
  }

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

      const operation = await getNuxeoOperation();

      await operation.execute();
    });

    test('should tell it is loading', async () => {
      server.respondWith('POST', '/api/v1/automation/something', [
        200,
        responseHeaders.json,
        '{"success":true,"entity-type":"login"}',
      ]);

      const operation = await getNuxeoOperation();

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

      const operation = await getNuxeoOperation();

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

      const provider = await getNuxeoPageProvider();

      const operation = await getNuxeoOperation(provider);

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

      provider = await getNuxeoPageProvider();

      view = await fixture(html`
        <custom-view-element select-all-enabled></custom-view-element>
      `);
      view.nxProvider = provider;

      operation = await getNuxeoOperation(view);
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
        input: [],
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

  suite('when unselect some feature is enable', () => {
    test('excludedDocs parameters is sent in the payload for the nuxeo-operation', async () => {
      server.respondWith('POST', '/api/v1/automation/something', [
        200,
        responseHeaders.json,
        '{"entity-type":"documents", "entries": []}',
      ]);
      const provider = await getNuxeoPageProvider(true);
      const operation = await getNuxeoOperation(provider);
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
            excludeDocs: '["fabf0fa3-0f0a-4b26-8fde-9c4ac869cd5f","f17544e4-5945-4b5c-b4a9-d48d2468b75b"]',
          },
          queryParams: [],
        },
        context: {},
      });
    });
  });

  suite('request options', () => {
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
      server.respondWith('POST', '/api/v1/automation/something', [200, responseHeaders.json, '{"ok":true}']);
    });

    test('sends schemas, sync indexing and enricher headers (object map)', async () => {
      const op = await fixture(html`
        <nuxeo-operation op="something" sync-indexing schemas="dublincore, common"></nuxeo-operation>
      `);
      op.enrichers = { document: ['preview', 'permissions'], user: 'profile' };
      await op.execute();
      const last = server.requests.find((r) => r.url.endsWith('/automation/something'));
      expect(last.requestHeaders['nx-es-sync']).to.equal('true');
      expect(last.requestHeaders['enrichers-document']).to.contain('preview,permissions');
      expect(last.requestHeaders['enrichers-user']).to.contain('profile');
    });

    test('parses params from a JSON string', async () => {
      const op = await fixture(html`
        <nuxeo-operation op="something" params='{"foo":"bar"}'></nuxeo-operation>
      `);
      op.params = '{"foo":"bar"}';
      await op.execute();
      const last = server.requests.find((r) => r.url.endsWith('/automation/something'));
      expect(JSON.parse(last.requestBody).params).to.deep.equal({ foo: 'bar' });
    });

    test('aborts the previous request when a new one starts', async () => {
      const op = await fixture(
        html`
          <nuxeo-operation op="something"></nuxeo-operation>
        `,
      );
      const first = op.execute().catch(() => undefined);
      await op.execute();
      await first;
      expect(op._controller).to.exist;
    });

    test('dispatches "unauthorized-request" on 401 errors', async () => {
      server.respondWith('POST', '/api/v1/automation/forbidden', [
        401,
        responseHeaders.json,
        '{"message":"Unauthorized"}',
      ]);
      const op = await fixture(
        html`
          <nuxeo-operation op="forbidden"></nuxeo-operation>
        `,
      );
      const eventPromise = new Promise((resolve) => {
        op.addEventListener('unauthorized-request', resolve);
      });
      await op.execute().catch(() => undefined);
      const evt = await eventPromise;
      expect(evt).to.exist;
    });

    test('uncancelable=true does not abort previous request', async () => {
      const op = await fixture(
        html`
          <nuxeo-operation op="something" uncancelable></nuxeo-operation>
        `,
      );
      const first = op.execute();
      const second = op.execute();
      await Promise.all([first, second]);
      expect(op._controller).to.be.undefined;
    });

    test('forwards a string enricher to the configured entity type header', async () => {
      const op = await fixture(html`
        <nuxeo-operation op="something" enrichers="thumbnail" enrichers-entity="user"></nuxeo-operation>
      `);
      await op.execute();
      const last = server.requests.find((r) => r.url.endsWith('/automation/something'));
      expect(last.requestHeaders['enrichers-user']).to.contain('thumbnail');
    });

    test('passes context from params and clears params before execute', async () => {
      const op = await fixture(
        html`
          <nuxeo-operation op="something"></nuxeo-operation>
        `,
      );
      op.params = { context: { foo: 'bar' } };
      await op.execute();
      const last = server.requests.find((r) => r.url.endsWith('/automation/something'));
      expect(JSON.parse(last.requestBody).context).to.deep.equal({ foo: 'bar' });
    });

    test('skips enricher headers when enrichers is null', async () => {
      const op = await fixture(
        html`
          <nuxeo-operation op="something"></nuxeo-operation>
        `,
      );
      op.enrichers = null;
      await op.execute();
      const last = server.requests.find((r) => r.url.endsWith('/automation/something'));
      const enricherHeaders = Object.keys(last.requestHeaders).filter((h) => h.startsWith('enrichers-'));
      expect(enricherHeaders).to.be.empty;
    });

    test('wraps a single non-array queryParams from the page provider into an array', async () => {
      server.respondWith('POST', '/api/v1/automation/wrap-op', [
        200,
        responseHeaders.json,
        '{"entity-type":"documents","entries":[]}',
      ]);
      const provider = await fixture(html`
        <nuxeo-page-provider provider="wrap_pp" page-size="10" params='{"queryParams":"single"}'></nuxeo-page-provider>
      `);
      const op = await fixture(
        html`
          <nuxeo-operation op="wrap-op" .input=${provider}></nuxeo-operation>
        `,
      );
      await op.execute();
      const last = server.requests.find((r) => r.url.endsWith('/automation/wrap-op'));
      expect(JSON.parse(last.requestBody).params.queryParams).to.deep.equal(['single']);
    });
  });

  suite('async (non-bulk) polling', () => {
    let op;
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
      // Async start: the @async endpoint returns 202 with a Location header.
      server.respondWith('POST', '/api/v1/automation/longRunning/@async', (xhr) => {
        xhr.respond(202, { Location: '/api/v1/automation/longRunning/@async/job-1', ...responseHeaders.json }, '');
      });
    });

    test('emits poll-update then resolves when polling finishes', async () => {
      let calls = 0;
      server.respondWith('GET', '/api/v1/automation/longRunning/@async/job-1', (xhr) => {
        calls += 1;
        if (calls === 1) {
          xhr.respond(200, responseHeaders.json, '{"entity-type":"bulkStatus","value":{"state":"RUNNING"}}');
        } else {
          xhr.respond(200, responseHeaders.json, '{"entity-type":"bulkStatus","value":{"state":"COMPLETED"}}');
        }
      });

      op = await fixture(html`
        <nuxeo-operation op="longRunning" async poll-interval="5"></nuxeo-operation>
      `);
      const updates = [];
      op.addEventListener('poll-update', (e) => updates.push(e.detail));
      const res = await op.execute();
      expect(res['entity-type']).to.equal('bulkStatus');
      expect(res.value.state).to.equal('COMPLETED');
      expect(updates.length).to.be.greaterThan(0);
    });

    test('rejects via poll-error event when polling http call errors out', async () => {
      server.respondWith('GET', '/api/v1/automation/longRunning/@async/job-1', [
        500,
        responseHeaders.json,
        '{"message":"poll failed"}',
      ]);
      op = await fixture(html`
        <nuxeo-operation op="longRunning" async poll-interval="5"></nuxeo-operation>
      `);
      const errEvent = new Promise((resolve) => op.addEventListener('poll-error', resolve));
      try {
        await op.execute();
      } catch (_) {
        // expected
      }
      const evt = await errEvent;
      expect(evt).to.exist;
    });
  });

  suite('bulk poll edge cases', () => {
    let op;
    let view;
    let provider;

    function bulkResponse(state) {
      return `{"entity-type":"bulkStatus", "value": { "commandId": "cmd-1", "state": "${state}" }}`;
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
      server.respondWith('POST', '/api/v1/automation/something', [200, responseHeaders.json, bulkResponse('RUNNING')]);
      server.respondWith('POST', '/api/v1/automation/Bulk.RunAction', [
        200,
        responseHeaders.json,
        bulkResponse('RUNNING'),
      ]);
      provider = await getNuxeoPageProvider();
      view = await fixture(
        html`
          <custom-view-element select-all-enabled></custom-view-element>
        `,
      );
      view.nxProvider = provider;
      view.selectAllActive = true;
      op = await getNuxeoOperation(view);
    });

    test('emits poll-error and rejects when bulk abort fails', async () => {
      server.respondWith('PUT', '/api/v1/bulk/cmd-1/abort', [500, responseHeaders.json, '{"message":"abort failed"}']);
      const errEvt = new Promise((resolve) => op.addEventListener('poll-error', resolve));
      try {
        await op._abort('cmd-1');
      } catch (_) {
        // expected
      }
      const evt = await errEvt;
      expect(evt).to.exist;
    });

    test('logs warning when bulk abort returns non-aborted state', async () => {
      server.respondWith('PUT', '/api/v1/bulk/cmd-1/abort', [200, responseHeaders.json, bulkResponse('COMPLETED')]);
      const warn = sinon.stub(console, 'warn');
      await op._abort('cmd-1');
      warn.restore();
      expect(warn.called).to.be.true;
    });
  });

  suite('status helpers', () => {
    test('_isRunning works with bulkStatus and plain string', async () => {
      const op = await fixture(
        html`
          <nuxeo-operation op="x"></nuxeo-operation>
        `,
      );
      expect(op._isRunning({ 'entity-type': 'bulkStatus', value: { state: 'SCHEDULED' } })).to.be.true;
      expect(op._isRunning({ 'entity-type': 'bulkStatus', value: { state: 'COMPLETED' } })).to.be.false;
      expect(op._isRunning({ 'entity-type': 'bulkStatus', state: 'RUNNING' })).to.be.true;
      expect(op._isRunning('RUNNING')).to.be.true;
      expect(op._isRunning('STOPPED')).to.be.false;
    });

    test('_isAborted works with bulkStatus and falls back to running for non-bulk', async () => {
      const op = await fixture(
        html`
          <nuxeo-operation op="x"></nuxeo-operation>
        `,
      );
      expect(op._isAborted({ 'entity-type': 'bulkStatus', value: { state: 'ABORTED' } })).to.be.true;
      expect(op._isAborted({ 'entity-type': 'bulkStatus', value: { state: 'RUNNING' } })).to.be.false;
      expect(op._isAborted({ 'entity-type': 'bulkStatus', value: { state: 'COMPLETED' } })).to.be.false;
      expect(op._isAborted('RUNNING')).to.be.true;
      expect(op._isAborted('SOMETHING_ELSE')).to.be.false;
    });
  });

  suite('auto execution', () => {
    test('_autoExecute calls execute() when auto is true', async () => {
      const op = await fixture(
        html`
          <nuxeo-operation op="auto-op"></nuxeo-operation>
        `,
      );
      const stub = sinon.stub(op, 'execute');
      op.auto = true;
      op._autoExecute();
      expect(stub).to.have.been.called;
      stub.restore();
    });

    test('_autoExecute is a no-op when auto is false', async () => {
      const op = await fixture(
        html`
          <nuxeo-operation op="auto-op"></nuxeo-operation>
        `,
      );
      const stub = sinon.stub(op, 'execute');
      op.auto = false;
      op._autoExecute();
      expect(stub).to.not.have.been.called;
      stub.restore();
    });
  });
});
