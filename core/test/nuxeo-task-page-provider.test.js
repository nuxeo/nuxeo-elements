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
import '../nuxeo-task-page-provider.js';
import { fakeServer, fixture, html, waitForEvent } from '@nuxeo/testing-helpers';

suite('nuxeo-task-page-provider', () => {
  suite('REST Calls', () => {
    let server;
    setup(() => {
      server = fakeServer.create();
    });

    teardown(() => {
      server.restore();
    });

    suite('Responses and Events', () => {
      let pageProvider;
      setup(async () => {
        pageProvider = await fixture(html`
          <nuxeo-task-page-provider></nuxeo-task-page-provider>
        `);

        /*
         * This workaround is needed due to the 'error' event fired in component.
         * More Details: https://github.com/webcomponents/webcomponentsjs/issues/138
         */
        pageProvider.addEventListener('error', (event) => {
          event.stopPropagation(); // avoid browser to interpret it.
        });
      });

      test('Should fire "error" event when server returns fetch error', async () => {
        server.rejectWith('get', '/api/v1/task');

        pageProvider.fetch();
        const event = await waitForEvent(pageProvider, 'error');
        expect(event.detail)
          .to.exist.and.to.have.property('error')
          .that.is.an.instanceof(Error);
      });

      test('Should throw an error when server returns fetch error', async () => {
        server.rejectWith('get', '/api/v1/task');

        try {
          await pageProvider.fetch();
          expect.fail('An exception was expected');
        } catch (error) {
          expect(error).to.be.an.instanceof(Error);
        }
      });

      test('Should fire "update" event when server returns non erroneous response', async () => {
        const response = {
          entries: [{}],
          numberOfPages: 1,
          resultsCount: 1,
          isNextPageAvailable: false,
          currentPageOffset: 0,
          pageSize: 10,
          isPreviousPageAvailable: false,
          currentPageSize: 1,
        };
        server.respondWith('get', '/api/v1/task', response);

        pageProvider.fetch();
        await waitForEvent(pageProvider, 'update');
        expect(pageProvider.currentPage).to.deep.equal(response.entries);
        expect(pageProvider.numberOfPages).to.equal(response.numberOfPages);
        expect(pageProvider.resultsCount).to.equal(response.resultsCount);
        expect(pageProvider.isNextPageAvailable).to.be.false;
        expect(pageProvider.isPreviousPageAvailable).to.be.false;
        expect(pageProvider.pageSize).to.equal(response.pageSize);
        expect(pageProvider.currentPageSize).to.equal(response.currentPageSize);
        expect(pageProvider.offset).to.equal(response.currentPageOffset);
      });
    });

    suite('Parameters Transformation', () => {
      function assertBaseRequest(request) {
        expect(request).to.exist;
        expect(request.headers).to.have.property('fetch-task', 'targetDocumentIds,actors');
        expect(request.queryParams).to.have.property('pageSize', 40);
        expect(request.queryParams).to.have.property('currentPageIndex', 0);
      }

      setup(() => {
        server.respondWith('get', '/api/v1/task', {
          entries: [{}],
          numberOfPages: 1,
          resultsCount: 1,
          isNextPageAvailable: false,
          currentPageOffset: 0,
          pageSize: 10,
          isPreviousPageAvailable: false,
          currentPageSize: 1,
        });
      });

      test("Should not include parameters' entries when they are null or undefined", async () => {
        const params = {
          myNull: null,
          myUndefined: null,
          myNonNull: 'test',
        };

        const pageProvider = await fixture(html`
          <nuxeo-task-page-provider params="${JSON.stringify(params)}"></nuxeo-task-page-provider>
        `);
        await pageProvider.fetch();

        const request = server.getLastRequest('get', '/api/v1/task');
        assertBaseRequest(request);
        expect(request.queryParams).to.have.property('myNonNull', 'test');
        expect(request.queryParams).to.not.have.any.keys('myNull', 'myUndefined');
      });

      test('Should contain mandatory parameters when no parameters are passed as argument', async () => {
        const pageProvider = await fixture(html`
          <nuxeo-task-page-provider offset="5"></nuxeo-task-page-provider>
        `);
        await pageProvider.fetch();

        const request = server.getLastRequest('get', '/api/v1/task');
        assertBaseRequest(request);
        expect(request.queryParams).to.have.property('offset', 5);
      });

      test('Should convert non-default parameters to string when they have a different type', async () => {
        const params = {
          myNumber: 1,
          myArray: ['string 1', 'string 2'],
          myUnknownObject: {
            key: 'value',
            otherKey: 123,
          },
          myBoolean: false,
        };
        const pageProvider = await fixture(html`
          <nuxeo-task-page-provider params="${JSON.stringify(params)}"></nuxeo-task-page-provider>
        `);
        await pageProvider.fetch();

        const request = server.getLastRequest('get', '/api/v1/task');
        assertBaseRequest(request);
        expect(request.queryParams.myNumber).to.be.equal('1');
        expect(request.queryParams.myArray).to.be.equal('["string 1","string 2"]');
        expect(request.queryParams.myUnknownObject).to.be.equal('{"key":"value","otherKey":123}');
        expect(request.queryParams.myBoolean).to.be.equal('false');
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

        const pageProvider = await fixture(html`
          <nuxeo-task-page-provider params="${JSON.stringify(params)}"></nuxeo-task-page-provider>
        `);
        await pageProvider.fetch();

        const request = server.getLastRequest('get', '/api/v1/task');
        assertBaseRequest(request);
        expect(request.queryParams.user).to.be.equal('jdoe');
        expect(request.queryParams.document).to.be.equal('a-meaningless-uid');
      });
    });
  });
});
