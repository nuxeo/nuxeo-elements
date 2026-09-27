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
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-pagination-controls.js';

suite('nuxeo-pagination-controls', () => {
  let element;
  let hadUI;
  let originalUIConfig;

  setup(async () => {
    hadUI = Boolean(Nuxeo.UI);
    originalUIConfig = Nuxeo.UI && Nuxeo.UI.config;
    element = await fixture(
      html`
        <nuxeo-pagination-controls page="1" number-of-pages="10"></nuxeo-pagination-controls>
      `,
    );
  });

  teardown(() => {
    if (!hadUI) {
      delete Nuxeo.UI;
      return;
    }
    Nuxeo.UI = Nuxeo.UI || {};
    if (typeof originalUIConfig === 'undefined') {
      delete Nuxeo.UI.config;
      return;
    }
    Nuxeo.UI.config = originalUIConfig;
  });

  test('should expose expected defaults', () => {
    expect(element.page).to.equal(1);
    expect(element.numberOfPages).to.equal(10);
  });

  test('should navigate to previous and next page', () => {
    element.page = 3;

    element._previous();
    expect(element.page).to.equal(2);

    element._next();
    expect(element.page).to.equal(3);
  });

  test('should navigate to first and last page', () => {
    element.page = 5;
    element.numberOfPages = 12;

    element._first();
    expect(element.page).to.equal(1);

    element._last();
    expect(element.page).to.equal(12);
  });

  test('should compute first and last page checks', () => {
    element.numberOfPages = 9;

    expect(element._isFirst(1)).to.be.true;
    expect(element._isFirst(2)).to.be.false;

    expect(element._isLast(9)).to.be.true;
    expect(element._isLast(8)).to.be.false;
  });

  test('should compute page options', () => {
    expect(element._computePageOptions(1)).to.deep.equal([1]);
    expect(element._computePageOptions(4)).to.deep.equal([1, 2, 3, 4]);
  });

  test('should use fallback max items when pagination config is missing', () => {
    Nuxeo.UI = Nuxeo.UI || {};
    delete Nuxeo.UI.config;

    expect(element._computeLimitForOptions(999)).to.be.true;
    expect(element._computeLimitForOptions(1001)).to.be.false;
  });

  test('should use configured max items when pagination config exists', () => {
    Nuxeo.UI = Nuxeo.UI || {};
    Nuxeo.UI.config = {
      pagination: {
        nuxeoSelectOptions: {
          listingMaxItems: 5,
        },
      },
    };

    expect(element._computeLimitForOptions(5)).to.be.true;
    expect(element._computeLimitForOptions(6)).to.be.false;
  });
});
