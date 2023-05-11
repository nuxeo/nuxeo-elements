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

import { html, fixture, fakeServer, waitForEvent } from '@nuxeo/testing-helpers';
import '../nuxeo-audit-page-provider.js';
import moment from '@nuxeo/moment';

const documentId = 'myDocumentId';
const documentHistoryPath = `/api/v1/id/${documentId}/@audit`;
const adminAuditPath = '/api/v1/automation/Audit.QueryWithPageProvider';
const events = ['documentCreated', 'documentModified'];
const eventDocumentCategory = 'eventDocumentCategory';
const user = 'Administrator';
const from = moment().format('YYYY-MM-DD');
const to = moment()
  .add(5, 'days')
  .format('YYYY-MM-DD');
const requestParameters = {
  startEventDate: from,
  endEventDate: to,
  category: eventDocumentCategory,
  eventId: events,
  principalName: user,
};
const providerParameters = {
  startDate: from,
  endDate: to,
  eventCategory: eventDocumentCategory,
  eventIds: events,
  principalName: user,
};
const providerSort = {
  eventDate: 'asc',
  category: 'desc',
  eventId: 'desc',
  principalName: 'asc',
};
let server;
async function getProvider(params = {}, docId = documentId, sort = {}) {
  const provider = await fixture(
    html`
      <nuxeo-audit-page-provider
        id="provider"
        doc-Id="${docId}"
        params="${JSON.stringify(params)}"
        sort="${JSON.stringify(sort)}"
        page-size="40"
      ></nuxeo-audit-page-provider>
    `,
  );
  return provider;
}

function assertRequestQueryParams(qParams = {}) {
  const expectedQueryParam = { currentPageIndex: 0, pageSize: 40, ...qParams };
  const { queryParams } = server.getLastRequest('GET', documentHistoryPath);
  expect(expectedQueryParam).to.eql(queryParams);
}

function mockDocHistoryResponse(response = { 'entity-type': 'logEntries', entries: [] }) {
  server.respondWith('GET', documentHistoryPath, response);
}

function mockAuditResponse(response = { 'entity-type': 'logEntries', entries: [] }) {
  server.respondWith('POST', adminAuditPath, response);
}

function assertRequestBodyParams(requestParams = {}) {
  // build request parameters and sort (optional) from the body
  const { currentPageIndex, pageSize, providerName, namedQueryParams, sortBy, sortOrder } = server.getLastRequest(
    'POST',
    adminAuditPath,
  ).body.params;
  const flatedQueryParams = Object.assign({}, namedQueryParams);
  // eventIds is a stringified array, it should be parse to a JS array
  if ('eventIds' in flatedQueryParams) {
    flatedQueryParams.eventIds = JSON.parse(flatedQueryParams.eventIds);
  }
  const bodyParams = {
    currentPageIndex,
    pageSize,
    providerName,
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
    ...flatedQueryParams,
  };

  // build the expected parameters (add the commons properties)
  const expectedRequestParam = { currentPageIndex: 0, pageSize: 40, providerName: 'EVENTS_VIEW', ...requestParams };

  expect(expectedRequestParam).to.eql(bodyParams);
}

function checkResponse(response) {
  expect(response).to.be.an('object');
  expect(response).to.have.property('entity-type');
  expect(response).to.have.property('entries');
  expect(response.entries).to.be.an('array').that.is.empty;
}

suite('nuxeo-audit-page-provider', () => {
  setup(() => {
    server = fakeServer.create();
  });

  teardown(() => {
    server.restore();
  });

  suite('Fetch Document History', () => {
    test('Should use Rest call when document identifier is provided', async () => {
      mockDocHistoryResponse();
      const provider = await getProvider(providerParameters);
      checkResponse(await provider.fetch());
      assertRequestQueryParams(requestParameters);
    });

    test('Should fire a success event using Rest call when document identifier is provided', async () => {
      mockDocHistoryResponse();
      const provider = await getProvider(providerParameters);
      provider.fetch();
      const event = await waitForEvent(provider, 'update');
      expect(event).to.have.property('detail');
      expect(event.detail).to.be.null;
    });

    test('Should fire an event when an error occurs in the Rest call', async () => {
      const error = new Error('Error occurs during your Rest call');
      mockDocHistoryResponse(error);
      const provider = await getProvider(providerParameters);
      provider.fetch();
      const event = await waitForEvent(provider, 'notify');
      expect(event).to.have.property('detail');
      expect(event.detail).to.have.property('error', error);
    });

    test('Should return an error when occurs in the Rest call', async () => {
      const error = new Error('Error occurs during your Rest call');
      mockDocHistoryResponse(error);
      const provider = await getProvider(providerParameters);
      try {
        await provider.fetch();
        return Promise.reject(new Error('Should have thrown an error'));
      } catch (err) {
        expect(err).to.be.an('Error');
        expect(err).to.have.property('message', error.message);
      }
    });

    test('Should use Rest call with sorting when document identifier is provided', async () => {
      mockDocHistoryResponse();
      const provider = await getProvider(providerParameters, documentId, providerSort);
      const qParams = {
        sortBy: 'eventDate,category,eventId,principalName',
        sortOrder: 'asc,desc,desc,asc',
        ...requestParameters,
      };
      checkResponse(await provider.fetch());
      assertRequestQueryParams(qParams);
    });
  });

  suite('Fetch Audit', () => {
    test('Should use Operation call when document identifier is not provided', async () => {
      mockAuditResponse();
      const provider = await getProvider(providerParameters, '');
      checkResponse(await provider.fetch());
      assertRequestBodyParams(providerParameters);
    });

    test('Should fire a success event using Operation call when document identifier is not provided', async () => {
      mockAuditResponse();
      const provider = await getProvider(providerParameters, '');
      provider.fetch();
      const event = await waitForEvent(provider, 'update');
      expect(event).to.have.property('detail');
      expect(event.detail).to.be.null;
    });

    test('Should fire an event when an error occurs in the Operation call', async () => {
      const error = new Error('Error occurs during your Operation call');
      error.response = {};
      mockAuditResponse(error);
      const provider = await getProvider(providerParameters, '');
      provider.fetch();
      const event = await waitForEvent(provider, 'notify');
      expect(event).to.have.property('detail');
      expect(event.detail).to.have.property('error', error);
    });

    test('Should return an error when occurs in the Operation call', async () => {
      const error = new Error('Error occurs during your Operation call');
      error.response = {};
      mockAuditResponse(error);
      const provider = await getProvider(providerParameters, '');
      try {
        await provider.fetch();
        return Promise.reject(new Error('Should have thrown an error'));
      } catch (err) {
        expect(err).to.be.an('Error');
        expect(err).to.have.property('message', error.message);
      }
    });

    test('Should use Operation call with sorting when document identifier is not provided', async () => {
      mockAuditResponse();
      const provider = await getProvider(providerParameters, '', providerSort);
      checkResponse(await provider.fetch());
      assertRequestBodyParams({
        sortBy: Object.keys(providerSort).join(','),
        sortOrder: Object.values(providerSort).join(','),
        ...providerParameters,
      });
    });
  });
});
