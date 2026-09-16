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
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-input.js';

suite('nuxeo-input', () => {
  let element;

  setup(async () => {
    element = await fixture(
      html`
        <nuxeo-input label="Title"></nuxeo-input>
      `,
    );
  });

  suite('invalid state error highlighting (ELEMENTS-1887)', () => {
    const invalidColor = 'rgb(222, 53, 11)';

    test('reflects the invalid property to the host attribute', async () => {
      expect(element.hasAttribute('invalid')).to.be.false;
      element.invalid = true;
      await flush();
      expect(element.hasAttribute('invalid')).to.be.true;
    });

    test('propagates invalid to the inner paper-input', async () => {
      element.invalid = true;
      await flush();
      const paperInput = element.shadowRoot.querySelector('#paperInput');
      expect(paperInput.invalid).to.be.true;
    });

    test('highlights the label in red when invalid', async () => {
      const label = element.shadowRoot.querySelector('label');
      element.invalid = true;
      await flush();
      expect(getComputedStyle(label).color).to.equal(invalidColor);
    });

    test('does not highlight the label when valid', async () => {
      const label = element.shadowRoot.querySelector('label');
      expect(getComputedStyle(label).color).to.not.equal(invalidColor);
    });

    test('shows a red asterisk after the label when required', async () => {
      element.required = true;
      await flush();
      const label = element.shadowRoot.querySelector('label');
      const after = getComputedStyle(label, '::after');
      expect(after.content.replace(/"/g, '')).to.equal('*');
      expect(after.color).to.equal(invalidColor);
    });
  });
});
