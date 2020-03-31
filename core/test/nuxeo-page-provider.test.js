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
import '../nuxeo-page-provider.js';

/* eslint-disable no-unused-expressions */
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
        expect(error).to.exist; // eslint-disable-line no-unused-expressions
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
  });
});
