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
import { fixture, flush, html, waitForEvent } from '@nuxeo/testing-helpers';
import '../nuxeo-quick-filters/nuxeo-quick-filters.js';

suite('nuxeo-quick-filters', () => {
  test('Should toggle active state with a single click and notify using Polymer semantics', async () => {
    const element = await fixture(
      html`
        <nuxeo-quick-filters></nuxeo-quick-filters>
      `,
    );

    element.quickFilters = [
      { name: 'activeFilter', active: true },
      { name: 'otherFilter', active: false },
    ];
    await flush();

    const eventPromise = waitForEvent(element, 'quick-filters-changed');
    const button = element.shadowRoot.querySelector('paper-button.quick-filters');
    button.click();

    const event = await eventPromise;
    await flush();

    expect(element.quickFilters[0].active).to.be.false;
    expect(event.detail.path).to.equal('quickFilters.0.active');
    expect(event.detail.value).to.be.false;
  });
});
