/*
 * @license
 * (C) Copyright Nuxeo Corp. (http://nuxeo.com/)
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
import { fixture, fixtureCleanup, html } from '@open-wc/testing-helpers';
import * as utils from '@polymer/polymer/lib/utils/flush.js';
import sinon from 'sinon';

window.fetch = null;

/**
 * Sets a timeout and waits for its completion.
 * @param {number} ms - Number of milliseconds to wait for
 * @returns {Promise}
 */
function timePasses(ms = 1) {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, ms);
  });
}

const flush = async () => {
  utils.flush();
  await timePasses(0);
};

/**
 * Waits for an event to trigger in a DOM element.
 * @param {Object} el - DOM element expecting event
 * @param {string} event - The expected event type
 * @param {number} times - The number of expected event occurrences
 * @returns {Promise<Event>} Promise object represents the listened event
 */
function waitForEvent(el, event, times = 1) {
  return new Promise((resolve) => {
    const listener = (e) => {
      if (--times === 0) {
        el.removeEventListener(event, listener);
        resolve(e);
      }
    };
    el.addEventListener(event, listener);
  });
}

/**
 * Waits for a property change ('property'-changed) event to trigger in a DOM element.
 * @param {Object} el - DOM element expecting event
 * @param {string} prop - The property expected to change
 * @param {number} times - The number of expected event occurrences
 * @returns {Promise<Event>} Promise object represents the listened event
 */
function waitChanged(el, prop, times = 1) {
  return waitForEvent(el, `${prop}-changed`, times).then((e) => e.detail);
}

/**
 * Waits for an attribute to change to a specific value in a DOM element.
 * @param {Object} el - DOM element expecting attribute mutation
 * @param {string} attr - The element's attribute
 * @param {string} value - The expected attribute value
 * @returns {Promise<MutationRecord>} Promise object represents the occurred mutation
 */
function waitForAttrMutation(el, attr, value) {
  return new Promise((resolve) => {
    if (value == null || el.getAttribute(attr) !== value) {
      const observer = new MutationObserver((mutationsList) => {
        const mutation = mutationsList.find(
          (m) =>
            m.type === 'attributes' &&
            (attr ? m.attributeName === attr : true) &&
            (value != null ? el.getAttribute(attr) === value : true),
        );
        if (mutation) {
          observer.disconnect();
          resolve(mutation);
        }
      });
      observer.observe(el, { attributes: true });
    } else {
      resolve();
    }
  });
}

/**
 * Waits for a child list change to occur in a DOM element.
 * @param {Object} el - DOM element expecting child list mutation
 * @returns {Promise<MutationRecord>} Promise object represents the occurred mutation
 */
function waitForChildListMutation(el) {
  return new Promise((resolve) => {
    const observer = new MutationObserver((mutationsList) => {
      const mutation = mutationsList.find((m) => m.type === 'childList');
      if (mutation) {
        observer.disconnect();
        resolve(mutation);
      }
    });
    observer.observe(el, { childList: true });
  });
}

/**
 * Checks if a DOM element is visible.
 * @param {Object} el - DOM element to be checked
 * @returns {boolean} Whether the DOM element is visible
 */
function isElementVisible(el) {
  if (!el) {
    return false;
  }
  const styles = window.getComputedStyle(el);
  return el.offsetWidth !== 0 && el.offsetHeight !== 0 && styles.opacity > 0 && styles.visibility !== 'hidden';
}

let server;

/**
 * @deprecated since 3.0.0
 * @see {MockClient}
 */
async function login() {
  server = sinon.fakeServer.create();
  server.autoRespond = true;

  server.respondWith('GET', '/json/cmis', [200, { 'Content-Type': 'application/json' }, '{}']);

  server.respondWith('POST', '/api/v1/automation/login', [
    200,
    { 'Content-Type': 'application/json' },
    '{"entity-type":"login","username":"Administrator"}',
  ]);

  server.respondWith('GET', '/api/v1/user/Administrator', [
    200,
    { 'Content-Type': 'application/json' },
    '{"entity-type":"user","username":"Administrator", "isAdministrator": true}',
  ]);

  const nx = await fixture(
    html`
      <nuxeo-connection url="/"></nuxeo-connection>
    `,
  );

  await nx.connect();

  return server;
}

/**
 * This registers the fixture cleanup for Mocha's TDD interface
 */
teardown(() => {
  if (server) {
    server.restore();
  }
  fixtureCleanup();
});

export {
  flush,
  isElementVisible,
  login,
  timePasses,
  waitChanged,
  waitForAttrMutation,
  waitForChildListMutation,
  waitForEvent,
};
