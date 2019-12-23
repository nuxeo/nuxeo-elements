import 'nuxeo/nuxeo.js';
import sinon from 'sinon';

class MockClient {
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
      let response = responses.get(url) && responses.get(url)[method];
      if (!response) {
        const exp = Array.from(responses.keys()).find(
          (e) => e instanceof RegExp && e.test(url) && responses.get(e)[method],
        );
        if (exp) {
          matches = url.match(exp);
          if (matches && matches.length > 1) {
            response = responses.get(exp)[method];
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
      return Promise.resolve({
        text: () => Promise.resolve(JSON.stringify(response)),
      });
    });
  }

  getRequests(method, path) {
    const stub = this._sandbox.getFakes().find((fake) => fake.propName === 'http');
    return stub
      .getCalls()
      .filter((call) => (method ? call.lastArg.method === method : true) && (path ? call.lastArg.url === path : true))
      .map((call) => call.lastArg);
  }

  getLastRequest(method, path) {
    return this.getRequests(method, path).pop();
  }

  mock(method, fn) {
    this._sandbox.stub(Nuxeo.prototype, method).callsFake(fn);
  }

  respondWith(method, path, response = {}) {
    this._responses.set(path, Object.assign(this._responses.get(path) || {}, { [method]: response }));
  }

  rejectWith(method, path, errorPayload = {}) {
    this._responses.set(
      path,
      Object.assign(this._responses.get(path) || {}, {
        [method]: Object.assign(new Error('This is a generated fake error'), errorPayload),
      }),
    );
  }

  restore() {
    this._sandbox.restore();
  }
}

export default {
  create: (user, nuxeoVersion) => new MockClient(user, nuxeoVersion),
};
