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
import { expect } from '@esm-bundle/chai';
import { html, fixture, flush, isElementVisible } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-tooltip.js';

suite('nuxeo-tooltip', async () => {
  test('Should not add paper-tooltip to the dom when hidden attribute is set', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip hidden>Hello</nuxeo-tooltip>
      `,
    );

    tooltip.show();
    await flush();
    const paperTooltip = document.body.querySelector('paper-tooltip');
    expect(paperTooltip).to.be.null;
  });

  test('Should show a paper-tooltip with content when the element is declared', async () => {
    const tooltip = await fixture(
      html`
        <nuxeo-tooltip>Hello</nuxeo-tooltip>
      `,
    );

    tooltip.show();
    await flush();
    const paperTooltip = document.body.querySelector('paper-tooltip');
    expect(paperTooltip.innerHTML).to.equal('Hello');
    expect(isElementVisible(paperTooltip));
  });
});
