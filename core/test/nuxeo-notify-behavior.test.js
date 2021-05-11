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
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '@polymer/polymer/lib/elements/dom-if.js';
import * as polymer from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '../nuxeo-element.js';
import { NotifyBehavior, setFallbackNotificationTarget } from '../nuxeo-notify-behavior.js';

suite('nuxeo-notify-behavior', () => {
  customElements.define(
    'inner-element',
    class extends mixinBehaviors([NotifyBehavior], Nuxeo.Element) {
      static get is() {
        return 'inner-element';
      }
    },
  );

  customElements.define(
    'outer-element',
    class extends mixinBehaviors([NotifyBehavior], Nuxeo.Element) {
      static get is() {
        return 'outer-element';
      }

      static get template() {
        return polymer.html`
          <slot></slot>
        `;
      }
    },
  );

  suite('When notify is called', async () => {
    test('Should fire "notify" event', async () => {
      const message = 'message';
      const outer = await fixture(html`
        <outer-element>
          <inner-element></inner-element>
        </outer-element>
      `);

      // wait for the notify event to be fired
      const inner = outer.querySelector('inner-element');
      const notifyReceived = new Promise((resolve) => {
        document.addEventListener('notify', (e) => resolve(e));
      });
      inner.notify({ message });

      // make sure the message was the expected and that the target was the inner element
      const evt = await notifyReceived;
      expect(evt.detail.message).to.equal('message');
      expect(evt.target).to.equal(inner);
    });

    test('Should fire "notify" event from fallback target when element is not connected', async () => {
      const message = 'message';
      const outer = await fixture(html`
        <outer-element>
          <inner-element></inner-element>
        </outer-element>
      `);
      setFallbackNotificationTarget(outer);

      // disconnect inner element
      const inner = outer.querySelector('inner-element');
      outer.removeChild(inner);
      await flush();
      expect(inner.isConnected).to.be.false;

      // wait for the notify event to be fired
      const notifyReceived = new Promise((resolve) => {
        document.addEventListener('notify', (e) => resolve(e));
      });
      inner.notify({ message });

      // make sure the message was the expected and that the target was the outer element
      const evt = await notifyReceived;
      expect(evt.detail.message).to.equal(message);
      expect(evt.target).to.equal(outer);
    });
  });
});
