/**
 @license
 ©2026 Hyland Software, Inc. and its affiliates. All rights reserved.
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

const settle = async (promise) => {
  try {
    await promise;
    return null;
  } catch (error) {
    return error;
  }
};

suite('@nuxeo/testing-helpers fixture()', () => {
  let restoreShadyDOM = null;

  // Restored from a teardown rather than inline, so a regression that leaves `fixture()` pending
  // (the very bug these tests pin) cannot leak the stub into the next test.
  teardown(() => {
    if (restoreShadyDOM) {
      restoreShadyDOM();
      restoreShadyDOM = null;
    }
  });

  // ELEMENTS-2117 / SonarCloud S9383: `fixture(template, true)` used to wrap the render and the
  // flush in a `new Promise(resolve => ...)` with no `reject` and no rejection handler on either
  // inner promise. A rejection from either step therefore left the returned promise pending
  // forever: the awaiting test died on a Mocha timeout instead of reporting the real failure.
  test('rejects with the render error instead of hanging', async () => {
    // @open-wc's `fixture()` awaits the element's `updateComplete` hook when it is a promise, so
    // binding a rejected one is the shortest faithful way to make the render step reject.
    const error = await settle(
      fixture(
        html`
          <div .updateComplete="${Promise.reject(new Error('render failed'))}"></div>
        `,
        true,
      ),
    );
    expect(error, 'fixture() must reject rather than stay pending').to.be.an('error');
    expect(error.message).to.equal('render failed');
  });

  test('rejects with the flush error instead of hanging', async () => {
    // Polymer's `flush()` delegates to `ShadyDOM.flush()`. Stub it to throw on the second call so
    // the failure comes from the flush `fixture()` performs itself, not from the one @open-wc's
    // `elementUpdated()` already does while rendering -- the assertion on `calls` below pins that
    // down, so the test cannot silently degrade into a repeat of the render case above.
    const originalShadyDOM = window.ShadyDOM;
    restoreShadyDOM = () => {
      window.ShadyDOM = originalShadyDOM;
    };
    let calls = 0;
    window.ShadyDOM = {
      flush() {
        calls += 1;
        if (calls > 1) {
          throw new Error('flush failed');
        }
        return false;
      },
    };

    const error = await settle(
      fixture(
        html`
          <div></div>
        `,
        true,
      ),
    );

    expect(calls, 'the error must come from the flush, not from the render').to.be.above(1);
    expect(error, 'fixture() must reject rather than stay pending').to.be.an('error');
    expect(error.message).to.equal('flush failed');
  });

  test('still resolves to the rendered element on the success path', async () => {
    const withFlush = await fixture(
      html`
        <div id="flushed"></div>
      `,
      true,
    );
    const withoutFlush = await fixture(
      html`
        <div id="plain"></div>
      `,
    );
    expect(withFlush.id).to.equal('flushed');
    expect(withoutFlush.id).to.equal('plain');
  });
});
