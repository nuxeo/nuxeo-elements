import 'nuxeo/nuxeo.js';
import sinon from 'sinon';

class MockClient {
  constructor({ user = 'Administrator', nuxeoVersion = '11.1' }) {
    this._responses = {};
    this._sandbox = sinon.createSandbox();

    this.mock('connect', function() {
      this.connected = true;
      return Promise.resolve({ user, nuxeoVersion });
    });

    this.mock('http', ({ method, url }) => {
      const responses = this._responses[url];
      return Promise.resolve(responses[method]);
    });
  }

  mock(method, fn) {
    this._sandbox.stub(Nuxeo.prototype, method).callsFake(fn);
  }

  respondWith(method, path, response) {
    this._responses[path] = this._responses[path] || {};
    this._responses[path][method] = response;
  }

  restore() {
    this._sandbox.restore();
  }
}

export default {
  create: (opts) => new MockClient(opts || {}),
};
