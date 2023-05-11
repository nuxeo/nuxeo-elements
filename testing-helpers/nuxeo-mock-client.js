/*
 * @license
 * ©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import './test-helpers.js';
import 'nuxeo/nuxeo.js';
import sinon from 'sinon';

/**
 * Helper class to mock and stub Nuxeo Client behaviors.
 *
 * @class MockClient
 */
class MockClient {
  /**
   * Constructs a new instance of MockClient.
   * @param {Object} user - The logged in user object with its properties
   * @param {string} nuxeoVersion - The expected Nuxeo Platform version
   */
  constructor(user = { isAdministrator: true, properties: { username: 'Administrator' } }, nuxeoVersion = '11.1') {
    this._responses = new Map();
    this._sandbox = sinon.createSandbox();

    this.mock('connect', function() {
      this.connected = true;
      return Promise.resolve({ user, nuxeoVersion });
    });

    this.mock('http', ({ method, url, queryParams, body }) => {
      const responses = this._responses;
      let matches;
      let response = responses.get(url) && responses.get(url)[method.toLowerCase()];
      if (!response) {
        const exp = Array.from(responses.keys()).find(
          (e) => e instanceof RegExp && e.test(url) && responses.get(e)[method.toLowerCase()],
        );
        if (exp) {
          matches = url.match(exp);
          if (matches && matches.length > 1) {
            response = responses.get(exp)[method.toLowerCase()];
            matches = matches.slice(1);
          }
        }
      }

      if (response == null || response instanceof Error) {
        return Promise.reject(response);
      }
      if (typeof response === 'function') {
        response = response({ method, url, queryParams, body }, matches);
      }
      if (url.startsWith('/api/v1/automation')) {
        return Promise.resolve(response);
      }

      const isOperation = url.startsWith('/api/v1/automation');
      return Promise.resolve(
        isOperation
          ? response
          : {
              text: () => Promise.resolve(JSON.stringify(response)),
            },
      );
    });
  }

  /**
   * Gets all the http calls registered by the Mock Client that match the parameters.
   * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param {string} path - REST API path
   * @returns {Array<Object>} List of objects representing the http call
   */
  getRequests(method, path) {
    const stub = this._sandbox.getFakes().find((fake) => fake.propName === 'http');
    return stub
      .getCalls()
      .filter(
        (call) =>
          (method ? call.lastArg.method.toLowerCase() === method.toLowerCase() : true) &&
          (path ? call.lastArg.url === path : true),
      )
      .map((call) => call.lastArg);
  }

  /**
   * Gets the last http call registered by the Mock Client that match the parameters.
   * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param {string} path - REST API path
   * @returns {Object} Object representing the http call
   */
  getLastRequest(method, path) {
    return this.getRequests(method, path).pop();
  }

  /**
   * Mocks Nuxeo Client specific methods.
   * @param {string} method - Nuxeo Client method name
   * @param {Function} fn - Stub function to replace original behavior
   */
  mock(method, fn) {
    this._sandbox.stub(Nuxeo.prototype, method).callsFake(fn);
  }

  /**
   * Defines the expected response for a specific REST call.
   * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param {string|RegExp} path - REST API path or path pattern
   * @param {Object} response - REST call response
   */
  respondWith(method, path, response = {}) {
    this._responses.set(path, Object.assign(this._responses.get(path) || {}, { [method.toLowerCase()]: response }));
  }

  /**
   * Defines the expected error response for a specific REST call.
   * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param {string|RegExp} path - REST API path or path pattern
   * @param {Object} errorPayload - - REST call error response
   */
  rejectWith(method, path, errorPayload = {}) {
    this._responses.set(
      path,
      Object.assign(this._responses.get(path) || {}, {
        [method.toLowerCase()]: Object.assign(new Error('This is a generated fake error'), errorPayload),
      }),
    );
  }

  /**
   * Resets mock defined expectations.
   */
  restore() {
    this._sandbox.restore();
  }
}

export default {
  create: (user, nuxeoVersion) => new MockClient(user, nuxeoVersion),
};
