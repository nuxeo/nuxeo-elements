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

import {
  fixture,
  flush,
  html,
  pressAndReleaseKeyOn,
  waitForAttrMutation,
  waitForChildListMutation,
} from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../widgets/nuxeo-selectivity.js';

suite('nuxeo-selectivity', () => {
  let selectivityWidget;
  const data = ['Berlin', 'Lisbon', 'London', 'Rennes', 'Rome'];

  suite('single value', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity placeholder="No city selected" .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Its value can be set programmatically multiple times', () => {
      let i;
      const getSelectedItem = () => dom(selectivityWidget.root).querySelector('.selectivity-single-selected-item');
      const resetValue = () =>
        dom(selectivityWidget.root).querySelector('a.selectivity-single-selected-item-remove').click();
      for (i = 0; i < data.length; i++) {
        selectivityWidget.value = data[i];
        const item = getSelectedItem();
        expect(item).not.to.be.equal(null);
        expect(item.textContent).to.be.equal(data[i]);
        resetValue();
        expect(getSelectedItem()).to.be.equal(null);
      }
    });
  });

  suite('multiple value', () => {
    const getSelectedItems = () => dom(selectivityWidget.root).querySelectorAll('.selectivity-multiple-selected-item');

    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity placeholder="No city selected" .data=${data} multiple></nuxeo-selectivity>
      `);
    });

    test('Backspace higlights and then deletes a single value', async () => {
      const hitBackspace = () =>
        pressAndReleaseKeyOn(dom(selectivityWidget.root).querySelector('input.selectivity-multiple-input'), 8);

      // set initial value with two entries
      selectivityWidget.value = ['Berlin', 'Lisbon'];
      await flush();

      // ensure that both are present and none are highlighted, then hit backspace
      let items = getSelectedItems();
      expect(items.length).to.be.equal(2);
      expect(items[0].textContent).to.be.equal('Berlin');
      expect(items[1].textContent).to.be.equal('Lisbon');
      expect(items[1].classList.contains('highlighted')).to.be.false;
      dom(selectivityWidget.root).querySelector('input.selectivity-multiple-input').focus();
      hitBackspace();
      await flush();

      // assert that there's still two entries but the last one is highlighted, then hit backspace again
      items = getSelectedItems();
      expect(items.length).to.be.equal(2);
      expect(items[0].textContent).to.be.equal('Berlin');
      expect(items[1].textContent).to.be.equal('Lisbon');
      if (!items[1].classList.contains('highlighted')) {
        // we might have to wait for the attribute to be changed on slower browsers
        await waitForAttrMutation(items[1], 'class');
      }
      expect(items[1].classList.contains('highlighted')).to.be.true;
      dom(selectivityWidget.root).querySelector('input.selectivity-multiple-input').focus();
      hitBackspace();
      await flush();

      // check there's only one entry left
      items = getSelectedItems();
      if (items.length !== 1) {
        // we might have to wait for the entries to be removed on slower browsers
        await waitForChildListMutation(
          dom(selectivityWidget.root).querySelector('.selectivity-multiple-input-container'),
        );
        items = getSelectedItems();
      }
      expect(items.length).to.be.equal(1);
      expect(items[0].textContent).to.be.equal('Berlin');
    });

    test('Value is not duplicated after reparent', async () => {
      // reparent the element
      const parent = selectivityWidget.parentElement;
      const div = document.createElement('div');
      parent.appendChild(div);
      div.appendChild(selectivityWidget);

      // trigger the dropdown for input: "Ber"
      const input = dom(selectivityWidget.root).querySelector('input.selectivity-multiple-input');
      input.value = 'Ber';
      await flush();
      input.click();

      // assert we only have one dropdown, which will fail if we do not destroy the Input object on disconnect
      let dropdown = dom(selectivityWidget.root).querySelectorAll('.selectivity-dropdown');
      expect(dropdown.length).to.be.equal(1);
      [dropdown] = dropdown;

      // wait for the dropdown results to be updated
      const resultsContainer = dropdown.querySelector('.selectivity-results-container');
      expect(resultsContainer).to.not.be.null;
      let results = resultsContainer.querySelectorAll('.selectivity-result-item.highlight');
      if (results.length === 0) {
        await waitForChildListMutation(dropdown);
        results = resultsContainer.querySelectorAll('.selectivity-result-item.highlight');
      }

      // check we have "Berlin" as the highlighted result and select it
      expect(results.length).to.be.equal(1);
      expect(results[0].textContent).to.be.equal('Berlin');
      results[0].click();
      await flush();

      // check the value is correct (and not dupplicated, see ELEMENTS-1090)
      const items = getSelectedItems();
      expect(items.length).to.be.equal(1);
      expect(items[0].textContent).to.be.equal('Berlin');
    });
  });

  suite('ID Function', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity placeholder="No city selected" .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should return the whole object when no known identifiers are present', () => {
      const item = {
        unknown: 'id',
        keyOne: 'valueOne',
        keyTwo: 'valueTwo',
      };
      expect(selectivityWidget.idFunction(item)).to.be.equal(item);
    });

    test('Should return empty when a known identifier is present and contains empty string', () => {
      const item = {
        uid: '',
      };
      expect(selectivityWidget.idFunction(item)).to.be.equal('');
    });

    test('Should return null when a known identifier is present and contains null value', () => {
      const item = {
        id: null,
      };
      expect(selectivityWidget.idFunction(item)).to.be.equal(null);
    });

    test('Should return undefined when a known identifier is present and contains undefined value', () => {
      const item = {
        computeId: undefined,
      };
      expect(selectivityWidget.idFunction(item)).to.be.equal(undefined);
    });

    test('Should return computeId value when all known identifiers are present', () => {
      const item = {
        uid: 'two',
        id: 'three',
        computeId: 'one',
      };
      expect(selectivityWidget.idFunction(item)).to.be.equal('one');
    });

    test('Should return uid value when only uid and id are are present', () => {
      const item = {
        id: 'three',
        uid: 'two',
      };
      expect(selectivityWidget.idFunction(item)).to.be.equal('two');
    });
  });

  suite('Accessibility - Screen Reader Announcements (ELEMENTS-1936)', () => {
    const collectionData = [
      { text: 'Collection A', id: 'col-a' },
      { text: 'Collection B', id: 'col-b' },
      { text: 'Collection C', id: 'col-c' },
    ];

    suite('Dropdown open with auto-highlight', () => {
      setup(async () => {
        selectivityWidget = await fixture(html`
          <nuxeo-selectivity placeholder="Select a collection" .data=${collectionData}></nuxeo-selectivity>
        `);
      });

      test('First item should be announced when dropdown opens', async () => {
        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        // Wait for dropdown to be rendered
        let dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        if (!dropdown) {
          await waitForChildListMutation(selectivityWidget.root);
          dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        }

        // Verify first item is highlighted
        const highlightedItem = dropdown.querySelector('.selectivity-result-item.highlight');
        expect(highlightedItem).to.not.be.null;
        expect(highlightedItem.textContent).to.include('Collection A');

        // Verify aria-selected is set to true
        expect(highlightedItem.getAttribute('aria-selected')).to.equal('true');

        // Verify live region exists and contains the announcement
        const liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).to.not.be.null;
        expect(liveRegion.textContent).to.equal('Collection A');
      });

      test('Live region should have proper ARIA attributes', async () => {
        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        const liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).to.not.be.null;
        expect(liveRegion.getAttribute('aria-atomic')).to.equal('true');
        expect(liveRegion.style.position).to.equal('absolute');
        expect(liveRegion.style.left).to.equal('-10000px');
        expect(liveRegion.style.overflow).to.equal('hidden');
      });

      test('aria-selected should be correctly updated when highlighting items', async () => {
        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        let dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        if (!dropdown) {
          await waitForChildListMutation(selectivityWidget.root);
          dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        }

        const items = dropdown.querySelectorAll('.selectivity-result-item');
        expect(items.length).to.be.greaterThan(0);

        // First item should be aria-selected
        expect(items[0].getAttribute('aria-selected')).to.equal('true');

        // Other items should not be aria-selected
        for (let i = 1; i < items.length; i++) {
          expect(items[i].getAttribute('aria-selected')).to.equal('false');
        }
      });
    });

    suite('Keyboard navigation announcements', () => {
      setup(async () => {
        selectivityWidget = await fixture(html`
          <nuxeo-selectivity placeholder="Select a collection" .data=${collectionData}></nuxeo-selectivity>
        `);
      });

      test('Pressing arrow down should announce next item', async () => {
        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        let dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        if (!dropdown) {
          await waitForChildListMutation(selectivityWidget.root);
          dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        }

        // Initial state: Collection A is highlighted
        let liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion.textContent).to.equal('Collection A');

        // Press down arrow
        input.focus();
        pressAndReleaseKeyOn(input, 40); // KEY_DOWN_ARROW
        await flush();

        // Verify Collection B is now announced
        liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion.textContent).to.equal('Collection B');

        // Verify aria-selected is updated
        const items = dropdown.querySelectorAll('.selectivity-result-item');
        expect(items[0].getAttribute('aria-selected')).to.equal('false');
        if (items[1].getAttribute('aria-selected') !== 'true') {
          // Wait for attribute to be updated on slower browsers
          await waitForAttrMutation(items[1], 'aria-selected');
        }
        expect(items[1].getAttribute('aria-selected')).to.equal('true');
      });

      test('Pressing arrow up should announce previous item', async () => {
        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        let dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        if (!dropdown) {
          await waitForChildListMutation(selectivityWidget.root);
          dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        }

        // Move to Collection B first
        input.focus();
        pressAndReleaseKeyOn(input, 40); // KEY_DOWN_ARROW
        await flush();

        // Press up arrow to go back to Collection A
        pressAndReleaseKeyOn(input, 38); // KEY_UP_ARROW
        await flush();

        // Verify Collection A is announced again
        const liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion.textContent).to.equal('Collection A');

        // Verify aria-selected is updated
        const items = dropdown.querySelectorAll('.selectivity-result-item');
        if (items[0].getAttribute('aria-selected') !== 'true') {
          await waitForAttrMutation(items[0], 'aria-selected');
        }
        expect(items[0].getAttribute('aria-selected')).to.equal('true');
        expect(items[1].getAttribute('aria-selected')).to.equal('false');
      });

      test('Input should expose aria-activedescendant when navigating', async () => {
        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        input.focus();
        pressAndReleaseKeyOn(input, 40);
        await flush();

        const activeId = input.getAttribute('aria-activedescendant');
        expect(activeId).to.not.be.null;
        expect(activeId).to.not.equal('');
        const activeItem = dom(selectivityWidget.root).querySelector(`#${activeId}`);
        expect(activeItem).to.exist;
      });
    });

    suite('Item label extraction for announcements', () => {
      test('Should announce item with displayLabel property', async () => {
        const itemsWithDisplayLabel = [
          { displayLabel: 'My Collection 1', id: 'col-1' },
          { displayLabel: 'My Collection 2', id: 'col-2' },
        ];
        selectivityWidget = await fixture(html`
          <nuxeo-selectivity placeholder="Select" .data=${itemsWithDisplayLabel}></nuxeo-selectivity>
        `);

        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        const liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion.textContent).to.equal('My Collection 1');
      });

      test('Should announce item with title property', async () => {
        const itemsWithTitle = [
          { title: 'Title Collection 1', id: 'col-1' },
          { title: 'Title Collection 2', id: 'col-2' },
        ];
        selectivityWidget = await fixture(html`
          <nuxeo-selectivity placeholder="Select" .data=${itemsWithTitle}></nuxeo-selectivity>
        `);

        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        const liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion.textContent).to.equal('Title Collection 1');
      });

      test('Should announce item with text property', async () => {
        const itemsWithText = [
          { text: 'Text Collection 1', id: 'col-1' },
          { text: 'Text Collection 2', id: 'col-2' },
        ];
        selectivityWidget = await fixture(html`
          <nuxeo-selectivity placeholder="Select" .data=${itemsWithText}></nuxeo-selectivity>
        `);

        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        const liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion.textContent).to.equal('Text Collection 1');
      });

      test('Should announce item with id when no text property exists', async () => {
        const itemsWithIdOnly = [{ id: 'collection-1' }, { id: 'collection-2' }];
        selectivityWidget = await fixture(html`
          <nuxeo-selectivity placeholder="Select" .data=${itemsWithIdOnly}></nuxeo-selectivity>
        `);

        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        const liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion.textContent).to.equal('collection-1');
      });

      test('Should handle nested item objects with item property', async () => {
        const itemsWithNestedStructure = [
          { item: { displayLabel: 'Nested Collection 1', id: 'col-1' } },
          { item: { displayLabel: 'Nested Collection 2', id: 'col-2' } },
        ];
        selectivityWidget = await fixture(html`
          <nuxeo-selectivity placeholder="Select" .data=${itemsWithNestedStructure}></nuxeo-selectivity>
        `);

        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        input.click();
        await flush();

        const liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion.textContent).to.equal('Nested Collection 1');
      });
    });

    suite('Multiple selections with announcements', () => {
      setup(async () => {
        selectivityWidget = await fixture(html`
          <nuxeo-selectivity placeholder="Select collections" .data=${collectionData} multiple></nuxeo-selectivity>
        `);
      });

      test('First item should be announced when dropdown opens in multiple mode', async () => {
        const input = dom(selectivityWidget.root).querySelector('input.selectivity-multiple-input');
        input.click();
        await flush();

        let dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        if (!dropdown) {
          await waitForChildListMutation(selectivityWidget.root);
          dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        }

        // Verify first item is highlighted and announced
        const highlightedItem = dropdown.querySelector('.selectivity-result-item.highlight');
        expect(highlightedItem).to.not.be.null;

        const liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).to.not.be.null;
        expect(liveRegion.textContent).to.equal('Collection A');
      });

      test('Navigation announcements work in multiple selection mode', async () => {
        const input = dom(selectivityWidget.root).querySelector('input.selectivity-multiple-input');
        input.click();
        await flush();

        let dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        if (!dropdown) {
          await waitForChildListMutation(selectivityWidget.root);
          dropdown = dom(selectivityWidget.root).querySelector('.selectivity-dropdown');
        }

        input.focus();
        pressAndReleaseKeyOn(input, 40); // Move to next item
        await flush();

        const liveRegion = dom(selectivityWidget.root).querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion.textContent).to.equal('Collection B');
      });
    });

    suite('Input accessible name', () => {
      test('Should include both label and placeholder in aria-label', async () => {
        selectivityWidget = await fixture(html`
          <nuxeo-selectivity label="Authors" placeholder="Select authors" .data=${collectionData}></nuxeo-selectivity>
        `);

        const input = dom(selectivityWidget.root).querySelector('.selectivity-single-select-input');
        expect(input).to.not.be.null;
        expect(input.getAttribute('aria-label')).to.equal('Authors, Select authors');
      });
    });
  });
});
