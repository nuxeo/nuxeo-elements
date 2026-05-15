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
import '../nuxeo-page-provider.js';

suite('nuxeo-page-provider', () => {
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
        expect(error).to.exist;
        expect(error.status).to.be.eq(500);
        expect(error.message).to.be.eq('Internal Server Error');
        document.removeEventListener('error', eventHandler); // Cleaning the workaround listener
        return;
      }
      throw new Error('Expected to have an error response!');
    });
  });

  suite('Parameters Transformation', () => {
    function checkDefaultParameters(params, shouldIncludeKeys = [], expectedNumberOfNamedParameters = 0) {
      const expectedKeys = ['currentPageIndex', 'namedParameters', 'offset', 'pageSize'];
      const unexpectedKeys = ['query', 'queryParams', 'quickFilters', 'sortBy', 'sortOrder'];

      shouldIncludeKeys.forEach((key) => {
        if (unexpectedKeys.includes(key)) {
          expectedKeys.push(key);
          unexpectedKeys.splice(key, 1);
        }
      });

      expect(params)
        .to.exist.and.to.be.an('object')
        .that.has.all.keys(expectedKeys)
        .and.not.have.keys(unexpectedKeys);

      expect(params.currentPageIndex).to.be.equal(0);
      expect(Object.keys(params.namedParameters)).to.have.lengthOf(expectedNumberOfNamedParameters);
      expect(params.offset).to.be.undefined;
      expect(params.pageSize).to.be.equal(-1);
    }

    test('Should include query when it is defined and not empty', async () => {
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" query="select * from Document"></nuxeo-page-provider>
      `);

      const transformedParams = provider._params;
      checkDefaultParameters(transformedParams, ['query']);
      expect(transformedParams.query).to.be.equal('select * from Document');
    });

    test('Should not include query when it has an empty string', async () => {
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" query=""></nuxeo-page-provider>
      `);

      checkDefaultParameters(provider._params);
    });

    test('Should not include query when it is not provided as a parameter', async () => {
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp"></nuxeo-page-provider>
      `);

      checkDefaultParameters(provider._params);
    });

    test('Should not include sort info when sort parameter is empty', async () => {
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" sort="{}"></nuxeo-page-provider>
      `);

      checkDefaultParameters(provider._params);
    });

    test('Should include sort info when sort parameter is not empty', async () => {
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" sort='{"dc:title": "desc", "uid:major_version": "desc"}'></nuxeo-page-provider>
      `);

      const transformedParams = provider._params;
      checkDefaultParameters(transformedParams, ['sortBy', 'sortOrder']);
      expect(transformedParams.sortBy.split(','))
        .to.have.lengthOf(2)
        .and.to.include.ordered.members(['dc:title', 'uid:major_version']);
      expect(transformedParams.sortOrder.split(','))
        .to.have.lengthOf(2)
        .and.to.include.ordered.members(['desc', 'desc']);
    });

    test('Should include quick filters info when they are provided', async () => {
      const quickFilters = [
        { active: true, name: 'firstActiveFilter' },
        { active: false, name: 'inactiveFilter' },
        { active: true, name: 'secondActiveFilter' },
      ];
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" quick-filters="${JSON.stringify(quickFilters)}"></nuxeo-page-provider>
      `);

      const transformedParams = provider._params;
      checkDefaultParameters(transformedParams, ['quickFilters']);
      expect(transformedParams.quickFilters)
        .to.be.a('string')
        .and.to.be.equal('firstActiveFilter,secondActiveFilter');
    });

    test('Should include quick filters info when there is no active filter', async () => {
      const quickFilters = [
        { active: false, name: 'firstInactiveFilter' },
        { active: false, name: 'secondInactiveFilter' },
      ];
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" quick-filters="${JSON.stringify(quickFilters)}"></nuxeo-page-provider>
      `);

      const transformedParams = provider._params;
      checkDefaultParameters(transformedParams, ['quickFilters']);
    });

    test('Should convert parameters to string when they are from a different type', async () => {
      const params = {
        myNumber: 1,
        myArray: ['string 1', 'string 2'],
        myUnknownObject: {
          key: 'value',
          otherKey: 123,
        },
        myBoolean: false,
      };
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" params="${JSON.stringify(params)}"></nuxeo-page-provider>
      `);

      const transformedParams = provider._params;
      checkDefaultParameters(transformedParams, [], 4);
      expect(transformedParams.namedParameters)
        .to.be.an('object')
        .that.has.all.keys('myNumber', 'myArray', 'myUnknownObject', 'myBoolean');

      expect(transformedParams.namedParameters.myNumber).to.be.a('string');
      expect(transformedParams.namedParameters.myNumber).to.be.equal('1');

      expect(transformedParams.namedParameters.myArray).to.be.a('string');
      expect(transformedParams.namedParameters.myArray).to.be.equal('["string 1","string 2"]');

      expect(transformedParams.namedParameters.myUnknownObject).to.be.a('string');
      expect(transformedParams.namedParameters.myUnknownObject).to.be.equal('{"key":"value","otherKey":123}');

      expect(transformedParams.namedParameters.myBoolean).to.be.a('string');
      expect(transformedParams.namedParameters.myBoolean).to.be.equal('false');
    });

    test('Should convert parameters of type array to queryParams', async () => {
      const params = ['one', 'two', 'three'];
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" params="${JSON.stringify(params)}"></nuxeo-page-provider>
      `);
      const transformedParams = provider._params;
      expect(transformedParams).to.exist.and.to.be.an('object');
      expect(Object.keys(transformedParams)).to.have.lengthOf(4);
      expect(transformedParams).to.have.all.keys('currentPageIndex', 'offset', 'pageSize', 'queryParams');
      expect(transformedParams.queryParams).to.deep.equal(params);
    });

    test('Should include the ID when a parameter is an object with "entity-type"', async () => {
      const params = {
        user: {
          'entity-type': 'user',
          name: 'John',
          id: 'jdoe',
        },
        document: {
          'entity-type': 'document',
          'dc:title': 'my title',
          'dc:creator': 'Administrator',
          uid: 'a-meaningless-uid',
        },
      };

      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" params="${JSON.stringify(params)}"></nuxeo-page-provider>
      `);

      const transformedParams = provider._params;
      checkDefaultParameters(transformedParams, [], 2);
      expect(transformedParams.namedParameters)
        .to.be.an('object')
        .that.has.all.keys('user', 'document');

      expect(transformedParams.namedParameters.user).to.be.equal('jdoe');
      expect(transformedParams.namedParameters.document).to.be.equal('a-meaningless-uid');
    });

    test('Should pass queryParams from params object through', async () => {
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" params='{"queryParams": ["one", "two"]}'></nuxeo-page-provider>
      `);
      const transformedParams = provider._params;
      expect(transformedParams.queryParams).to.deep.equal(['one', 'two']);
    });

    test('Should drop null/undefined named parameters', async () => {
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" params='{"keep":"yes","drop":null}'></nuxeo-page-provider>
      `);
      const transformedParams = provider._params;
      expect(transformedParams.namedParameters.keep).to.equal('yes');
      expect(transformedParams.namedParameters).to.not.have.property('drop');
    });

    test('Should serialise an array of strings into a JSON string', async () => {
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" params='{"plainArray":["a","b","c"]}'></nuxeo-page-provider>
      `);
      expect(provider._params.namedParameters.plainArray).to.equal('["a","b","c"]');
    });

    test('Should keep string parameters as-is', async () => {
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" params='{"plain":"hello"}'></nuxeo-page-provider>
      `);
      expect(provider._params.namedParameters.plain).to.equal('hello');
    });

    test('Should map an array of entity-typed items by uid or id', async () => {
      const params = {
        docs: [
          { 'entity-type': 'document', uid: 'with-uid' },
          { 'entity-type': 'document', id: 'with-id' },
          'leftAlone',
        ],
      };
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" params="${JSON.stringify(params)}"></nuxeo-page-provider>
      `);
      expect(provider._params.namedParameters.docs).to.equal('["with-uid","with-id","leftAlone"]');
    });

    test('Should fall back to id when an entity-typed object has no uid', async () => {
      const params = {
        record: { 'entity-type': 'document', id: 'only-id' },
      };
      const provider = await fixture(html`
        <nuxeo-page-provider id="nx-pp" params="${JSON.stringify(params)}"></nuxeo-page-provider>
      `);
      expect(provider._params.namedParameters.record).to.equal('only-id');
    });

    test('Should fetch via GET path when params is an array (no namedParameters branch)', async () => {
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
      server.respondWith('GET', /\/api\/v1\/search\/pp\/array_pp\/execute.*/, [
        200,
        responseHeaders.json,
        '{"entity-type":"documents","entries":[]}',
      ]);
      const provider = await fixture(html`
        <nuxeo-page-provider provider="array_pp" params='["x","y"]' page-size="10"></nuxeo-page-provider>
      `);
      const res = await provider.fetch();
      expect(res['entity-type']).to.equal('documents');
    });
  });

  suite('headers and aggregates', () => {
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
      server.respondWith('GET', /\/api\/v1\/search\/pp\/headers_pp\/execute.*/, [
        200,
        responseHeaders.json,
        '{"entity-type":"documents","entries":[]}',
      ]);
    });

    test('skipAggregates=true sets the skipAggregates header', async () => {
      const pp = await fixture(html`
        <nuxeo-page-provider provider="headers_pp" skip-aggregates></nuxeo-page-provider>
      `);
      await pp.fetch();
      const last = server.requests.find((r) => r.url.indexOf('/headers_pp/') >= 0);
      expect(last.requestHeaders.skipAggregates).to.equal('true');
    });

    test('skipAggregates option overrides default and is removed when false', async () => {
      const pp = await fixture(html`
        <nuxeo-page-provider provider="headers_pp"></nuxeo-page-provider>
      `);
      await pp.fetch({ skipAggregates: true });
      let last = server.requests.find((r) => r.url.indexOf('/headers_pp/') >= 0);
      expect(last.requestHeaders.skipAggregates).to.equal('true');
      // Reset and call again without skipAggregates - header should not be present
      server.requests.length = 0;
      await pp.fetch();
      last = server.requests.find((r) => r.url.indexOf('/headers_pp/') >= 0);
      expect(last.requestHeaders.skipAggregates).to.be.undefined;
    });

    test('fetchAggregates true sets the fetch-aggregate header and removes it when toggled off', async () => {
      const pp = await fixture(html`
        <nuxeo-page-provider provider="headers_pp" fetch-aggregates></nuxeo-page-provider>
      `);
      expect(pp.headers['fetch-aggregate']).to.equal('key');
      pp.fetchAggregates = false;
      expect(pp.headers['fetch-aggregate']).to.be.undefined;
    });

    test('fetch initialises headers when null', async () => {
      const pp = await fixture(html`
        <nuxeo-page-provider provider="headers_pp"></nuxeo-page-provider>
      `);
      pp.headers = null;
      await pp.fetch();
      expect(pp.headers).to.be.an('object');
    });
  });

  suite('POST method via Repository operations', () => {
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
      server.respondWith('POST', '/api/v1/automation/Repository.PageProvider', [
        200,
        responseHeaders.json,
        '{"entity-type":"documents","entries":[]}',
      ]);
      server.respondWith('POST', '/api/v1/automation/Repository.Query', [
        200,
        responseHeaders.json,
        '{"entity-type":"documents","entries":[]}',
      ]);
    });

    test('uses Repository.PageProvider when method is POST and provider is set', async () => {
      const pp = await fixture(html`
        <nuxeo-page-provider provider="post_provider" method="post"></nuxeo-page-provider>
      `);
      await pp.fetch();
      const last = server.requests.find((r) => r.url.endsWith('/automation/Repository.PageProvider'));
      expect(last).to.exist;
      const body = JSON.parse(last.requestBody);
      expect(body.params.providerName).to.equal('post_provider');
    });

    test('uses Repository.Query when method is POST and query is set', async () => {
      const pp = await fixture(html`
        <nuxeo-page-provider query="select * from Document" method="post"></nuxeo-page-provider>
      `);
      await pp.fetch();
      const last = server.requests.find((r) => r.url.endsWith('/automation/Repository.Query'));
      expect(last).to.exist;
    });
  });

  suite('auto fetch', () => {
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
      server.respondWith('GET', /\/api\/v1\/search\/pp\/auto_provider\/execute.*/, [
        200,
        responseHeaders.json,
        '{"entity-type":"documents","entries":[]}',
      ]);
    });

    test('auto flag triggers a fetch when provider is set', async () => {
      await fixture(html`
        <nuxeo-page-provider provider="auto_provider" auto auto-delay="0"></nuxeo-page-provider>
      `);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(server.requests.some((r) => r.url.indexOf('/auto_provider/') >= 0)).to.be.true;
    });
  });
});
