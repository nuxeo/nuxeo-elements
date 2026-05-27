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
import { fixture, html, waitForEvent } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-sort-select.js';

suite('nuxeo-sort-select', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-sort-select></nuxeo-sort-select>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.SortSelect.is).to.equal('nuxeo-sort-select');
  });

  test('should default _sortOrder to asc', () => {
    expect(el._sortOrder).to.equal('asc');
  });

  suite('_sortOrderIcon', () => {
    test('returns up arrow icon for asc', () => {
      el._sortOrder = 'asc';
      expect(el._sortOrderIcon()).to.equal('icons:arrow-upward');
    });

    test('returns down arrow icon for desc', () => {
      el._sortOrder = 'desc';
      expect(el._sortOrderIcon()).to.equal('icons:arrow-downward');
    });
  });

  suite('_optionsChanged', () => {
    test('updates selected when an option is marked selected', () => {
      const selectedOption = { label: 'Date', order: 'desc', selected: true };
      el.options = [{ label: 'Title', order: 'asc' }, selectedOption];
      expect(el.selected).to.equal(selectedOption);
    });

    test('leaves selected unchanged when nothing is marked selected', () => {
      el.options = [{ label: 'Title', order: 'asc' }];
      expect(el.selected).to.be.undefined;
    });
  });

  suite('_selectedChanged', () => {
    test('updates _sortOrder when selected is set', () => {
      el.selected = { label: 'Date', order: 'desc' };
      expect(el._sortOrder).to.equal('desc');
    });

    test('keeps _sortOrder when selected becomes falsy', () => {
      el._sortOrder = 'asc';
      el.selected = null;
      expect(el._sortOrder).to.equal('asc');
    });
  });

  suite('_toggleSortOrder', () => {
    test('flips _sortOrder from asc to desc', () => {
      el._sortOrder = 'asc';
      el._toggleSortOrder();
      expect(el._sortOrder).to.equal('desc');
    });

    test('flips _sortOrder from desc to asc', () => {
      el._sortOrder = 'desc';
      el._toggleSortOrder();
      expect(el._sortOrder).to.equal('asc');
    });

    test('fires sort-order-changed when a selection is present', async () => {
      el.options = [{ label: 'Title', order: 'asc', selected: true }];
      const eventPromise = waitForEvent(el, 'sort-order-changed');
      el._toggleSortOrder();
      const event = await eventPromise;
      expect(event.detail.sort.order).to.equal('desc');
    });

    test('does not throw when there is no selection', () => {
      el.selected = null;
      el._toggleSortOrder();
      expect(el._sortOrder).to.equal('desc');
    });
  });
});
