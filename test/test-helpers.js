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

/* eslint-disable no-unused-vars,no-param-reassign */

window.fetch = null;

function timePasses(ms) {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, ms || 1);
  });
}

const flushCb = window.flush;
window.flush = () => new Promise((resolve) => {
  flushCb(() => {
    resolve();
  });
});


function waitForEvent(el, event, times) {
  times = times || 1;
  return new Promise((resolve) => {
    const listener = (e) => {
      if (--times === 0) {
        el.removeEventListener(e, listener);
        resolve(e);
      }
    };
    el.addEventListener(event, listener);
  });
}

function waitChanged(el, prop, times) {
  return waitForEvent(el, `${prop}-changed`, times).then((e) => e.detail);
}

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

function login(server, loginFixture) {

  server.respondWith(
    'GET',
    '/dummy/json/cmis', [
      200,
      {'Content-Type': 'application/json'},
      '{}',
    ],
  );

  server.respondWith(
    'POST',
    '/dummy/api/v1/automation/login',
    [
      200,
      {'Content-Type': 'application/json'},
      '{"entity-type":"login","username":"Administrator"}',
    ],
  );

  server.respondWith(
    'GET',
    '/dummy/api/v1/user/Administrator',
    [
      200,
      {'Content-Type': 'application/json'},
      '{"entity-type":"user","username":"Administrator", "isAdministrator": true}',
    ],
  );

  return loginFixture.connect();
}

function isElementVisible(el) {
  if (!el) {
    return false;
  }
  const styles = window.getComputedStyle(el);
  return el.offsetWidth !== 0 && el.offsetHeight !== 0 && styles.opacity > 0 && styles.visibility !== 'hidden';
}
