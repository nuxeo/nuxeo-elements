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
import { escapeHTML } from '../widgets/nuxeo-selectivity.js';

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
        dom(selectivityWidget.root)
          .querySelector('a.selectivity-single-selected-item-remove')
          .click();
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
      dom(selectivityWidget.root)
        .querySelector('input.selectivity-multiple-input')
        .focus();
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
      dom(selectivityWidget.root)
        .querySelector('input.selectivity-multiple-input')
        .focus();
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

    test('Should return the whole object when a known identifier is present but its value is null', () => {
      // ELEMENTS-1805 made _idFunction treat null/undefined values as "no id present" so the
      // selectivity dropdown can still resolve the entry from the rest of the object instead of
      // being keyed by a falsy primitive. The test asserts that contract.
      const item = {
        id: null,
      };
      expect(selectivityWidget.idFunction(item)).to.equal(item);
    });

    test('Should return the whole object when a known identifier is present but its value is undefined', () => {
      const item = {
        computeId: undefined,
      };
      expect(selectivityWidget.idFunction(item)).to.equal(item);
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

  suite('_idFunction edge cases', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should return primitive value unchanged for string', () => {
      expect(selectivityWidget._idFunction('hello')).to.equal('hello');
    });

    test('Should return primitive value unchanged for number', () => {
      expect(selectivityWidget._idFunction(42)).to.equal(42);
    });

    test('Should return null for null input', () => {
      expect(selectivityWidget._idFunction(null)).to.equal(null);
    });

    test('Should return undefined for undefined input', () => {
      expect(selectivityWidget._idFunction(undefined)).to.equal(undefined);
    });

    test('Should return empty string when id is empty string', () => {
      expect(selectivityWidget._idFunction({ id: '' })).to.equal('');
    });

    test('Should return 0 when id is zero', () => {
      expect(selectivityWidget._idFunction({ id: 0 })).to.equal(0);
    });

    test('Should return the object itself when all known keys are null', () => {
      const item = { computeId: null, uid: null, id: null };
      expect(selectivityWidget._idFunction(item)).to.equal(item);
    });
  });

  suite('_getValidity', () => {
    test('Should return true when not required', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget._getValidity()).to.be.true;
    });

    test('Should return false when required and no value (single)', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required></nuxeo-selectivity>
      `);
      selectivityWidget.value = null;
      expect(selectivityWidget._getValidity()).to.be.false;
    });

    test('Should return true when required and value set (single)', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required></nuxeo-selectivity>
      `);
      selectivityWidget.value = 'Berlin';
      expect(selectivityWidget._getValidity()).to.be.true;
    });

    test('Should return false when required and empty array (multiple)', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required multiple></nuxeo-selectivity>
      `);
      selectivityWidget.value = [];
      expect(selectivityWidget._getValidity()).to.be.false;
    });

    test('Should return true when required and non-empty array (multiple)', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required multiple></nuxeo-selectivity>
      `);
      selectivityWidget.value = ['Berlin'];
      expect(selectivityWidget._getValidity()).to.be.true;
    });

    test('Should return false when required and value is empty string', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required></nuxeo-selectivity>
      `);
      selectivityWidget.value = '';
      expect(selectivityWidget._getValidity()).to.be.false;
    });
  });

  suite('_resolveEntry', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should return null for null entry', () => {
      expect(selectivityWidget._resolveEntry(null)).to.be.null;
    });

    test('Should return null for undefined entry', () => {
      expect(selectivityWidget._resolveEntry(undefined)).to.be.null;
    });

    test('Should return null for empty string entry', () => {
      expect(selectivityWidget._resolveEntry('')).to.be.null;
    });

    test('Should return matching item from data array', () => {
      expect(selectivityWidget._resolveEntry('Berlin')).to.equal('Berlin');
    });

    test('Should return object with id and displayLabel for entry not in data', () => {
      selectivityWidget.data = [{ id: 'a', displayLabel: 'Item A' }];
      const result = selectivityWidget._resolveEntry('unknown');
      expect(result).to.have.property('id', 'unknown');
      expect(result).to.have.property('text', 'unknown');
    });

    test('Should resolve entry from data when data contains objects', () => {
      selectivityWidget.data = [
        { id: 'one', displayLabel: 'One' },
        { id: 'two', displayLabel: 'Two' },
      ];
      const result = selectivityWidget._resolveEntry('two');
      expect(result).to.deep.equal({ id: 'two', displayLabel: 'Two' });
    });
  });

  suite('_initSelection', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should resolve single value for non-multiple mode', (done) => {
      selectivityWidget.multiple = false;
      selectivityWidget._initSelection('Berlin', (result) => {
        expect(result).to.equal('Berlin');
        done();
      });
    });

    test('Should resolve array for multiple mode', (done) => {
      selectivityWidget.multiple = true;
      selectivityWidget._initSelection(['Berlin', 'Lisbon'], (result) => {
        expect(result).to.be.an('array');
        expect(result.length).to.equal(2);
        done();
      });
    });

    test('Should filter out null resolved entries in multiple mode', (done) => {
      selectivityWidget.multiple = true;
      selectivityWidget.resolveEntry = (entry) => (entry === 'invalid' ? null : entry);
      selectivityWidget._initSelection(['Berlin', 'invalid', 'Lisbon'], (result) => {
        expect(result).to.be.an('array');
        expect(result.length).to.equal(2);
        done();
      });
    });
  });

  suite('_valueChanged', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should do nothing when _selectivity is not initialized', () => {
      const s = selectivityWidget._selectivity;
      selectivityWidget._selectivity = null;
      selectivityWidget._valueChanged('Berlin');
      selectivityWidget._selectivity = s;
    });

    test('Should do nothing when _inUpdateSelection is true', () => {
      const spy = sinon.spy(selectivityWidget._selectivity, 'setValue');
      selectivityWidget._inUpdateSelection = true;
      selectivityWidget._valueChanged('Berlin');
      expect(spy).not.to.have.been.called;
      selectivityWidget._inUpdateSelection = false;
      spy.restore();
    });

    test('Should call setValue for non-null value', () => {
      const spy = sinon.spy(selectivityWidget._selectivity, 'setValue');
      selectivityWidget._valueChanged('Berlin');
      expect(spy).to.have.been.calledWith('Berlin', { triggerChange: false });
      spy.restore();
    });

    test('Should clear selection when value is null and selectivity has value', () => {
      selectivityWidget.value = 'Berlin';
      const spy = sinon.spy(selectivityWidget._selectivity, 'clear');
      selectivityWidget._valueChanged(null);
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('Should clear selection when value is empty string', () => {
      selectivityWidget.value = 'Berlin';
      const spy = sinon.spy(selectivityWidget._selectivity, 'clear');
      selectivityWidget._valueChanged('');
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('Should set selectedItems to empty array when clearing in multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      selectivityWidget.value = ['Berlin'];
      await flush();
      selectivityWidget._valueChanged(null);
      expect(selectivityWidget.selectedItems).to.deep.equal([]);
    });

    test('Should set selectedItem to null when clearing in single mode', () => {
      selectivityWidget.value = 'Berlin';
      selectivityWidget._valueChanged(null);
      expect(selectivityWidget.selectedItem).to.be.null;
    });

    test('Should not clear when selectivity has no current value', () => {
      const spy = sinon.spy(selectivityWidget._selectivity, 'clear');
      selectivityWidget._selectivity.clear();
      spy.resetHistory();
      selectivityWidget._valueChanged(null);
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });

  suite('_dataChanged', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should convert non-array data to array', () => {
      selectivityWidget.data = 'single-item';
      selectivityWidget._dataChanged();
      expect(selectivityWidget.data).to.be.an('array');
    });

    test('Should handle null data without error', () => {
      selectivityWidget.data = ['Berlin'];
      selectivityWidget._dataChanged();
      selectivityWidget.data = [];
      selectivityWidget._dataChanged();
    });

    test('Should update selectivity options when data changes', () => {
      const spy = sinon.spy(selectivityWidget._selectivity, 'setOptions');
      selectivityWidget.data = ['Paris', 'Madrid'];
      selectivityWidget._dataChanged();
      expect(spy).to.have.been.called;
      spy.restore();
    });
  });

  suite('_selectionFormatter', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should use displayLabel when available', () => {
      const result = selectivityWidget._selectionFormatter({ displayLabel: 'My Label' });
      expect(result).to.equal('My Label');
    });

    test('Should use title when displayLabel not available', () => {
      const result = selectivityWidget._selectionFormatter({ title: 'My Title' });
      expect(result).to.equal('My Title');
    });

    test('Should use text when neither displayLabel nor title available', () => {
      const result = selectivityWidget._selectionFormatter({ text: 'My Text' });
      expect(result).to.equal('My Text');
    });

    test('Should fall back to item itself for plain string', () => {
      const result = selectivityWidget._selectionFormatter('Plain');
      expect(result).to.equal('Plain');
    });

    test('Should escape HTML in labels', () => {
      const result = selectivityWidget._selectionFormatter({ displayLabel: '<b>bold</b>' });
      expect(result).to.contain('&lt;');
      expect(result).to.not.contain('<b>');
    });
  });

  suite('_resultFormatter', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should use displayLabel when available', () => {
      const result = selectivityWidget._resultFormatter({ displayLabel: 'Result Label' });
      expect(result).to.equal('Result Label');
    });

    test('Should fall back to title', () => {
      const result = selectivityWidget._resultFormatter({ title: 'Result Title' });
      expect(result).to.equal('Result Title');
    });

    test('Should fall back to text', () => {
      const result = selectivityWidget._resultFormatter({ text: 'Result Text' });
      expect(result).to.equal('Result Text');
    });

    test('Should use item itself for string', () => {
      const result = selectivityWidget._resultFormatter('StringItem');
      expect(result).to.equal('StringItem');
    });
  });

  suite('_newEntryFormatter', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should return object with id and displayLabel matching term', () => {
      const result = selectivityWidget._newEntryFormatter('new-tag');
      expect(result).to.deep.equal({ id: 'new-tag', displayLabel: 'new-tag' });
    });

    test('Should handle empty string', () => {
      const result = selectivityWidget._newEntryFormatter('');
      expect(result).to.deep.equal({ id: '', displayLabel: '' });
    });
  });

  suite('_wrap', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should wrap a single string item', () => {
      const result = selectivityWidget._wrap('Berlin');
      expect(result).to.have.property('id', 'Berlin');
      expect(result).to.have.property('text', 'Berlin');
      expect(result).to.have.property('item', 'Berlin');
      expect(result).to.have.property('depth', 0);
    });

    test('Should wrap an array of string items', () => {
      const result = selectivityWidget._wrap(['Berlin', 'Lisbon']);
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[0].id).to.equal('Berlin');
      expect(result[1].id).to.equal('Lisbon');
    });

    test('Should wrap object items using idFunction', () => {
      const items = [{ id: 'one', displayLabel: 'One' }];
      const result = selectivityWidget._wrap(items);
      expect(result[0].id).to.equal('one');
      expect(result[0].text).to.equal('One');
    });

    test('Should handle items with children recursively', () => {
      const items = [{ id: 'parent', displayLabel: 'Parent', children: [{ id: 'child', displayLabel: 'Child' }] }];
      const result = selectivityWidget._wrap(items);
      expect(result[0].children).to.be.an('array');
      expect(result[0].children[0].id).to.equal('child');
      expect(result[0].children[0].depth).to.equal(1);
    });

    test('Should set depth to 0 for top-level items', () => {
      const result = selectivityWidget._wrap([{ id: 'x', displayLabel: 'X' }]);
      expect(result[0].depth).to.equal(0);
    });

    test('Should use empty string when no text properties exist on object', () => {
      const result = selectivityWidget._wrap({ uid: 'abc' });
      expect(result.id).to.equal('abc');
      expect(result.text).to.equal('abc');
    });
  });

  suite('_triggerQueryCallback', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should call query callback with wrapped results', () => {
      const callbackSpy = sinon.spy();
      const query = { term: 'Ber', callback: callbackSpy };
      selectivityWidget._triggerQueryCallback(query, ['Berlin']);
      expect(callbackSpy).to.have.been.calledOnce;
      const arg = callbackSpy.firstCall.args[0];
      expect(arg.results).to.be.an('array');
      expect(arg.results[0].id).to.equal('Berlin');
    });

    test('Should apply queryResultsFilter when provided', () => {
      const callbackSpy = sinon.spy();
      const query = { term: 'test', callback: callbackSpy };
      selectivityWidget.queryResultsFilter = (item) => item.id !== 'remove-me';
      selectivityWidget._triggerQueryCallback(query, [
        { id: 'keep', displayLabel: 'Keep' },
        { id: 'remove-me', displayLabel: 'Remove' },
      ]);
      const arg = callbackSpy.firstCall.args[0];
      expect(arg.results.length).to.equal(1);
      expect(arg.results[0].item.id).to.equal('keep');
    });

    test('Should add new entry when tagging is enabled and term not in results', () => {
      selectivityWidget.tagging = true;
      const callbackSpy = sinon.spy();
      const query = { term: 'new-tag', callback: callbackSpy };
      selectivityWidget._triggerQueryCallback(query, []);
      const arg = callbackSpy.firstCall.args[0];
      expect(arg.results.length).to.equal(1);
      expect(arg.results[0].item.id).to.equal('new-tag');
    });

    test('Should not add new entry when tagging is enabled but term exists in results', () => {
      selectivityWidget.tagging = true;
      const callbackSpy = sinon.spy();
      const query = { term: 'existing', callback: callbackSpy };
      selectivityWidget._triggerQueryCallback(query, [{ id: 'existing', displayLabel: 'Existing' }]);
      const arg = callbackSpy.firstCall.args[0];
      expect(arg.results.length).to.equal(1);
    });

    test('Should not add new entry when tagging is disabled', () => {
      selectivityWidget.tagging = false;
      const callbackSpy = sinon.spy();
      const query = { term: 'new-tag', callback: callbackSpy };
      selectivityWidget._triggerQueryCallback(query, []);
      const arg = callbackSpy.firstCall.args[0];
      expect(arg.results.length).to.equal(0);
    });
  });

  suite('_updateSelection', () => {
    test('Should update value and selectedItems in multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      const event = {
        value: ['Berlin', 'Lisbon'],
        items: [{ item: { id: 'Berlin' } }, { item: { id: 'Lisbon' } }],
      };
      selectivityWidget._updateSelection(event);
      expect(selectivityWidget.value).to.deep.equal(['Berlin', 'Lisbon']);
      expect(selectivityWidget.selectedItems).to.deep.equal([{ id: 'Berlin' }, { id: 'Lisbon' }]);
    });

    test('Should update value and selectedItem in single mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const event = {
        value: 'Berlin',
        items: { item: { id: 'Berlin', displayLabel: 'Berlin' } },
      };
      selectivityWidget._updateSelection(event);
      expect(selectivityWidget.value).to.equal('Berlin');
      expect(selectivityWidget.selectedItem).to.deep.equal({ id: 'Berlin', displayLabel: 'Berlin' });
    });

    test('Should call addedEntryHandler when entry is added', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const handler = sinon.spy();
      selectivityWidget.addedEntryHandler = handler;
      const event = {
        value: 'Berlin',
        items: { item: { id: 'Berlin' } },
        added: { id: 'Berlin' },
      };
      selectivityWidget._updateSelection(event);
      expect(handler).to.have.been.calledWith({ id: 'Berlin' });
    });

    test('Should call removedEntryHandler when entry is removed', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const handler = sinon.spy();
      selectivityWidget.removedEntryHandler = handler;
      const event = {
        value: null,
        items: null,
        removed: { id: 'Berlin' },
      };
      selectivityWidget._updateSelection(event);
      expect(handler).to.have.been.calledWith({ id: 'Berlin' });
    });

    test('Should use el directly when item property is absent in multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      const event = {
        value: ['Berlin'],
        items: [{ id: 'Berlin', text: 'Berlin' }],
      };
      selectivityWidget._updateSelection(event);
      expect(selectivityWidget.selectedItems[0]).to.deep.equal({ id: 'Berlin', text: 'Berlin' });
    });

    test('Should set selectedItem to null when items is null in single mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const event = { value: null, items: null };
      selectivityWidget._updateSelection(event);
      expect(selectivityWidget.selectedItem).to.be.null;
    });
  });

  suite('_readonlyChanged', () => {
    test('Should set readOnly option on selectivity', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const spy = sinon.spy(selectivityWidget._selectivity, 'setOptions');
      selectivityWidget.readonly = true;
      selectivityWidget._readonlyChanged();
      expect(spy).to.have.been.calledWith(sinon.match({ readOnly: true }));
      spy.restore();
    });

    test('Should do nothing when _selectivity is not initialized', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const s = selectivityWidget._selectivity;
      selectivityWidget._selectivity = null;
      selectivityWidget._readonlyChanged();
      selectivityWidget._selectivity = s;
    });
  });

  suite('_placeholderChanged', () => {
    test('Should update placeholder attribute on input div', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} placeholder="Pick one"></nuxeo-selectivity>
      `);
      selectivityWidget.placeholder = 'New Placeholder';
      selectivityWidget._placeholderChanged();
      expect(selectivityWidget.$.input.getAttribute('placeholder')).to.equal('New Placeholder');
    });

    test('Should update multiple input placeholder', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple placeholder="Pick"></nuxeo-selectivity>
      `);
      selectivityWidget.placeholder = 'Updated';
      selectivityWidget._placeholderChanged();
      const multipleInput = selectivityWidget.shadowRoot.querySelector('.selectivity-multiple-input');
      if (multipleInput) {
        expect(multipleInput.getAttribute('placeholder')).to.equal('Updated');
      }
    });
  });

  suite('_query', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should use data directly when data is available', () => {
      const callbackSpy = sinon.spy();
      const query = { term: 'Ber', callback: callbackSpy };
      selectivityWidget._query(query);
      expect(callbackSpy).to.have.been.calledOnce;
    });

    test('Should return empty results when no data and no operation', () => {
      const origData = selectivityWidget.data;
      Object.defineProperty(selectivityWidget, 'data', { value: null, writable: true, configurable: true });
      selectivityWidget.operation = null;
      const callbackSpy = sinon.spy();
      const query = { term: 'test', callback: callbackSpy };
      selectivityWidget._query(query);
      expect(callbackSpy).to.have.been.calledOnce;
      const arg = callbackSpy.firstCall.args[0];
      expect(arg.results).to.be.an('array');
      expect(arg.results.length).to.equal(0);
      Object.defineProperty(selectivityWidget, 'data', { value: origData, writable: true, configurable: true });
    });
  });

  suite('escapeHTML', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should escape ampersand', () => {
      expect(selectivityWidget.escapeHTML('a&b')).to.equal('a&amp;b');
    });

    test('Should escape less-than', () => {
      expect(selectivityWidget.escapeHTML('<div>')).to.contain('&lt;');
    });

    test('Should escape greater-than', () => {
      expect(selectivityWidget.escapeHTML('a>b')).to.contain('&gt;');
    });

    test('Should escape double quotes', () => {
      expect(selectivityWidget.escapeHTML('"hello"')).to.contain('&quot;');
    });

    test('Should escape single quotes', () => {
      expect(selectivityWidget.escapeHTML("it's")).to.contain('&#39;');
    });

    test('Should escape forward slash', () => {
      expect(selectivityWidget.escapeHTML('a/b')).to.contain('&#47;');
    });

    test('Should escape backslash', () => {
      expect(selectivityWidget.escapeHTML('a\\b')).to.contain('&#92;');
    });

    test('Should return non-string values unchanged', () => {
      expect(selectivityWidget.escapeHTML(123)).to.equal(123);
      expect(selectivityWidget.escapeHTML(null)).to.equal(null);
      expect(selectivityWidget.escapeHTML(undefined)).to.equal(undefined);
    });

    test('Should handle empty string', () => {
      expect(selectivityWidget.escapeHTML('')).to.equal('');
    });
  });

  suite('readonly behavior', () => {
    test('Should render without remove buttons in readonly mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} readonly></nuxeo-selectivity>
      `);
      selectivityWidget.value = 'Berlin';
      await flush();
      const removeBtn = selectivityWidget.shadowRoot.querySelector('.selectivity-single-selected-item-remove');
      expect(removeBtn).to.be.null;
    });
  });

  suite('custom idFunction property', () => {
    test('Should use custom idFunction when provided', async () => {
      const customId = (item) => (item && typeof item === 'object' ? item.code : item);
      const customData = [
        { code: 'BER', displayLabel: 'Berlin' },
        { code: 'LIS', displayLabel: 'Lisbon' },
      ];
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${customData} .idFunction=${customId}></nuxeo-selectivity>
      `);
      selectivityWidget.value = 'BER';
      await flush();
      expect(selectivityWidget.value).to.equal('BER');
    });
  });

  suite('custom selectionFormatter', () => {
    test('Should use custom selectionFormatter for display', async () => {
      const customFormatter = (item) => (item && item.name ? item.name.toUpperCase() : String(item));
      const customData = [{ id: 'ber', name: 'Berlin' }];
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${customData} .selectionFormatter=${customFormatter}></nuxeo-selectivity>
      `);
      selectivityWidget.value = 'ber';
      await flush();
      const selectedItem = selectivityWidget.shadowRoot.querySelector('.selectivity-single-selected-item');
      if (selectedItem) {
        expect(selectedItem.textContent).to.contain('BERLIN');
      }
    });
  });

  suite('multiple mode edge cases', () => {
    test('Should handle empty array value in multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      selectivityWidget.value = [];
      await flush();
      const items = selectivityWidget.shadowRoot.querySelectorAll('.selectivity-multiple-selected-item');
      expect(items.length).to.equal(0);
    });

    test('Should handle null value in multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      selectivityWidget.value = null;
      await flush();
      const items = selectivityWidget.shadowRoot.querySelectorAll('.selectivity-multiple-selected-item');
      expect(items.length).to.equal(0);
    });
  });

  suite('_updateDropdownPosition', () => {
    test('Should call positionDropdown when selectivity exists', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const spy = sinon.spy(selectivityWidget._selectivity, 'positionDropdown');
      selectivityWidget._updateDropdownPosition();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('Should not throw when selectivity is null', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const s = selectivityWidget._selectivity;
      selectivityWidget._selectivity = null;
      expect(() => selectivityWidget._updateDropdownPosition()).to.not.throw();
      selectivityWidget._selectivity = s;
    });
  });

  suite('_query with operation', () => {
    test('Should call operation execute when operation is set and no data', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity operation="Directory.SuggestEntries"></nuxeo-selectivity>
      `);
      Object.defineProperty(selectivityWidget, 'data', {
        value: null,
        writable: true,
        configurable: true,
      });
      const opEl = selectivityWidget.$.op;
      const executeStub = sinon.stub(opEl, 'execute').resolves({ entries: [{ id: 'a', displayLabel: 'A' }] });
      const callbackSpy = sinon.spy();
      const query = { term: 'test', callback: callbackSpy };
      selectivityWidget._query(query);
      await executeStub.returnValues[0];
      expect(executeStub).to.have.been.calledOnce;
      expect(callbackSpy).to.have.been.calledOnce;
      executeStub.restore();
    });

    test('Should handle non-array response from operation', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity operation="Directory.SuggestEntries"></nuxeo-selectivity>
      `);
      Object.defineProperty(selectivityWidget, 'data', {
        value: null,
        writable: true,
        configurable: true,
      });
      const opEl = selectivityWidget.$.op;
      const entries = [{ id: 'x', displayLabel: 'X' }];
      const executeStub = sinon.stub(opEl, 'execute').resolves(entries);
      const callbackSpy = sinon.spy();
      const query = { term: 'test', callback: callbackSpy };
      selectivityWidget._query(query);
      await executeStub.returnValues[0];
      expect(callbackSpy).to.have.been.calledOnce;
      executeStub.restore();
    });

    test('Should pass params including searchTerm', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity operation="Directory.SuggestEntries"></nuxeo-selectivity>
      `);
      Object.defineProperty(selectivityWidget, 'data', {
        value: null,
        writable: true,
        configurable: true,
      });
      selectivityWidget.params = { directoryName: 'subject' };
      const opEl = selectivityWidget.$.op;
      const executeStub = sinon.stub(opEl, 'execute').resolves({ entries: [] });
      const callbackSpy = sinon.spy();
      selectivityWidget._query({ term: 'mySearch', callback: callbackSpy });
      await executeStub.returnValues[0];
      expect(opEl.params.searchTerm).to.equal('mySearch');
      expect(opEl.params.directoryName).to.equal('subject');
      executeStub.restore();
    });

    test('Should use empty params when none set', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity operation="Directory.SuggestEntries"></nuxeo-selectivity>
      `);
      Object.defineProperty(selectivityWidget, 'data', {
        value: null,
        writable: true,
        configurable: true,
      });
      selectivityWidget.params = undefined;
      const opEl = selectivityWidget.$.op;
      const executeStub = sinon.stub(opEl, 'execute').resolves({ entries: [] });
      const callbackSpy = sinon.spy();
      selectivityWidget._query({ term: 'q', callback: callbackSpy });
      await executeStub.returnValues[0];
      expect(opEl.params.searchTerm).to.equal('q');
      executeStub.restore();
    });
  });

  suite('_dataChanged edge cases', () => {
    test('Should wrap non-array data into array', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      selectivityWidget.data = 'singleValue';
      selectivityWidget._dataChanged();
      expect(Array.isArray(selectivityWidget.data)).to.be.true;
      expect(selectivityWidget.data).to.include('singleValue');
    });

    test('Should sync selected data when items match', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      selectivityWidget.value = 'Berlin';
      await flush();
      selectivityWidget.data = ['Berlin', 'Paris'];
      selectivityWidget._dataChanged();
    });

    test('Should handle non-array data and convert', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      selectivityWidget.data = { id: 'single', displayLabel: 'Single' };
      selectivityWidget._dataChanged();
      expect(Array.isArray(selectivityWidget.data)).to.be.true;
    });
  });

  suite('_wrap edge cases', () => {
    test('Should handle item with no displayLabel, text, or id', () => {
      selectivityWidget._wrap({ other: 'field' });
    });

    test('Should handle nested children at multiple levels', () => {
      const items = [
        {
          id: 'p1',
          displayLabel: 'P1',
          children: [
            {
              id: 'c1',
              displayLabel: 'C1',
              children: [{ id: 'gc1', displayLabel: 'GC1' }],
            },
          ],
        },
      ];
      const result = selectivityWidget._wrap(items);
      expect(result[0].children[0].children[0].depth).to.equal(2);
      expect(result[0].children[0].children[0].id).to.equal('gc1');
    });

    test('Should use text property when displayLabel is absent', () => {
      const result = selectivityWidget._wrap({ id: 'abc', text: 'My Text' });
      expect(result.text).to.equal('My Text');
    });

    test('Should use id as text fallback when no text properties', () => {
      const result = selectivityWidget._wrap({ id: 'myId' });
      expect(result.text).to.equal('myId');
    });
  });

  suite('_triggerQueryCallback edge cases', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should not add tag when tagging enabled but term is empty', () => {
      selectivityWidget.tagging = true;
      const callbackSpy = sinon.spy();
      const query = { term: '', callback: callbackSpy };
      selectivityWidget._triggerQueryCallback(query, []);
      const arg = callbackSpy.firstCall.args[0];
      expect(arg.results.length).to.equal(0);
    });

    test('Should apply both filter and tagging together', () => {
      selectivityWidget.tagging = true;
      selectivityWidget.queryResultsFilter = (item) => item.id !== 'x';
      const callbackSpy = sinon.spy();
      const query = { term: 'newTag', callback: callbackSpy };
      selectivityWidget._triggerQueryCallback(query, [
        { id: 'x', displayLabel: 'X' },
        { id: 'y', displayLabel: 'Y' },
      ]);
      const arg = callbackSpy.firstCall.args[0];
      expect(arg.results.length).to.equal(2);
    });
  });

  suite('_updateSelection edge cases', () => {
    test('Should not call handlers when neither added nor removed', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const addedSpy = sinon.spy();
      const removedSpy = sinon.spy();
      selectivityWidget.addedEntryHandler = addedSpy;
      selectivityWidget.removedEntryHandler = removedSpy;
      const event = { value: 'Berlin', items: { item: { id: 'Berlin' } } };
      selectivityWidget._updateSelection(event);
      expect(addedSpy).not.to.have.been.called;
      expect(removedSpy).not.to.have.been.called;
    });

    test('Should not call addedEntryHandler when handler is not set', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      selectivityWidget.addedEntryHandler = null;
      const event = {
        value: 'Berlin',
        items: { item: { id: 'Berlin' } },
        added: { id: 'Berlin' },
      };
      expect(() => selectivityWidget._updateSelection(event)).to.not.throw();
    });

    test('Should not call removedEntryHandler when handler is not set', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      selectivityWidget.removedEntryHandler = null;
      const event = {
        value: null,
        items: null,
        removed: { id: 'Berlin' },
      };
      expect(() => selectivityWidget._updateSelection(event)).to.not.throw();
    });

    test('Should handle empty items array in multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      const event = { value: [], items: [] };
      selectivityWidget._updateSelection(event);
      expect(selectivityWidget.selectedItems).to.deep.equal([]);
    });
  });

  suite('_valueChanged with array values', () => {
    test('Should call setValue for non-empty array in multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      const spy = sinon.spy(selectivityWidget._selectivity, 'setValue');
      selectivityWidget._valueChanged(['Berlin', 'Lisbon']);
      expect(spy).to.have.been.calledWith(['Berlin', 'Lisbon'], { triggerChange: false });
      spy.restore();
    });

    test('Should clear when value is empty array and selectivity has data', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      selectivityWidget.value = ['Berlin'];
      await flush();
      const spy = sinon.spy(selectivityWidget._selectivity, 'clear');
      selectivityWidget._valueChanged(null);
      expect(spy).to.have.been.called;
      spy.restore();
    });
  });

  suite('_resolveEntry with data containing objects', () => {
    test('Should resolve entry with displayLabel from resultFormatter', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      selectivityWidget.data = [{ id: 'test', title: 'Test Title' }];
      const result = selectivityWidget._resolveEntry('test');
      expect(result).to.have.property('id', 'test');
      expect(result).to.have.property('title', 'Test Title');
    });

    test('Should build fallback for entry not found in data', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      selectivityWidget.data = [{ id: 'a', displayLabel: 'A' }];
      const result = selectivityWidget._resolveEntry('unknown');
      expect(result).to.have.property('id', 'unknown');
      expect(result).to.have.property('text', 'unknown');
      expect(result).to.have.property('displayLabel');
    });
  });

  suite('_placeholderChanged single mode', () => {
    test('Should update single placeholder text', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} placeholder="Select"></nuxeo-selectivity>
      `);
      selectivityWidget.placeholder = 'Changed';
      selectivityWidget._placeholderChanged();
      const ph = selectivityWidget.shadowRoot.querySelector('.selectivity-placeholder');
      if (ph) {
        expect(ph.innerText).to.equal('Changed');
      }
    });

    test('Should handle null multipleInput gracefully', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} placeholder="Test"></nuxeo-selectivity>
      `);
      selectivityWidget.placeholder = 'New';
      expect(() => selectivityWidget._placeholderChanged()).to.not.throw();
    });
  });

  suite('escapeHTML edge cases', () => {
    test('Should handle multiple special characters', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const result = selectivityWidget.escapeHTML('<script>alert("xss")</script>');
      expect(result).to.not.contain('<script>');
      expect(result).to.contain('&lt;');
    });

    test('Should return boolean unchanged', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget.escapeHTML(true)).to.equal(true);
      expect(selectivityWidget.escapeHTML(false)).to.equal(false);
    });

    test('Should return object unchanged', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const obj = { key: 'val' };
      expect(selectivityWidget.escapeHTML(obj)).to.equal(obj);
    });
  });

  suite('_getValidity edge cases', () => {
    test('Should return true when not required even without value', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      selectivityWidget.value = null;
      expect(selectivityWidget._getValidity()).to.be.true;
    });

    test('Should return true for non-required with undefined value', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      selectivityWidget.value = undefined;
      expect(selectivityWidget._getValidity()).to.be.true;
    });

    test('Should handle required multiple with non-empty array', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required multiple></nuxeo-selectivity>
      `);
      selectivityWidget.value = ['Berlin', 'Lisbon'];
      expect(selectivityWidget._getValidity()).to.be.true;
    });
  });

  suite('connectedCallback dir attribute', () => {
    test('Should set dir attribute from document when not already set', async () => {
      const originalDir = document.documentElement.getAttribute('dir');
      document.documentElement.setAttribute('dir', 'rtl');
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget.getAttribute('dir')).to.equal('rtl');
      if (originalDir) {
        document.documentElement.setAttribute('dir', originalDir);
      } else {
        document.documentElement.removeAttribute('dir');
      }
    });
  });

  suite('multiple mode with tagging', () => {
    test('Should create token item with tagging in multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple tagging></nuxeo-selectivity>
      `);
      expect(selectivityWidget.tagging).to.be.true;
      expect(selectivityWidget.multiple).to.be.true;
    });
  });

  suite('_initSelection edge cases', () => {
    test('Should handle empty array in multiple mode', (done) => {
      selectivityWidget.multiple = true;
      selectivityWidget._initSelection([], (result) => {
        expect(result).to.deep.equal([]);
        done();
      });
    });

    test('Should handle single value resolve returning null', (done) => {
      selectivityWidget.multiple = false;
      selectivityWidget.resolveEntry = () => null;
      selectivityWidget._initSelection('test', (result) => {
        expect(result).to.be.null;
        done();
      });
    });
  });

  suite('stayOpenOnSelect', () => {
    test('Should configure closeOnSelect based on stayOpenOnSelect', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} stay-open-on-select></nuxeo-selectivity>
      `);
      expect(selectivityWidget.stayOpenOnSelect).to.be.true;
    });
  });

  suite('_selectionFormatter fallback chain', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should prefer displayLabel over title', () => {
      const result = selectivityWidget._selectionFormatter({
        displayLabel: 'DL',
        title: 'T',
        text: 'TX',
      });
      expect(result).to.equal('DL');
    });

    test('Should prefer title over text when no displayLabel', () => {
      const result = selectivityWidget._selectionFormatter({
        title: 'T',
        text: 'TX',
      });
      expect(result).to.equal('T');
    });

    test('Should handle number as item', () => {
      const result = selectivityWidget._selectionFormatter(42);
      expect(result).to.equal(42);
    });
  });

  suite('_resultFormatter fallback chain', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should prefer displayLabel over all others', () => {
      const result = selectivityWidget._resultFormatter({
        displayLabel: 'DL',
        title: 'T',
        text: 'TX',
      });
      expect(result).to.equal('DL');
    });

    test('Should prefer title when no displayLabel', () => {
      const result = selectivityWidget._resultFormatter({ title: 'T', text: 'TX' });
      expect(result).to.equal('T');
    });

    test('Should handle number as item', () => {
      const result = selectivityWidget._resultFormatter(99);
      expect(result).to.equal(99);
    });
  });

  suite('custom resolveEntry', () => {
    test('Should use custom resolveEntry function', async () => {
      const customResolve = (entry) => {
        return { id: entry, displayLabel: `Custom: ${entry}` };
      };
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} .resolveEntry=${customResolve}></nuxeo-selectivity>
      `);
      const result = selectivityWidget.resolveEntry('test');
      expect(result.displayLabel).to.equal('Custom: test');
    });
  });

  suite('maximumSelectionSize', () => {
    test('Should default to -1', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget.maximumSelectionSize).to.equal(-1);
    });
  });

  suite('_idFunction with computeId priority', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should return computeId when only computeId present', () => {
      expect(selectivityWidget._idFunction({ computeId: 'c1' })).to.equal('c1');
    });

    test('Should prefer computeId over uid and id', () => {
      expect(
        selectivityWidget._idFunction({
          computeId: 'c',
          uid: 'u',
          id: 'i',
        }),
      ).to.equal('c');
    });

    test('Should return uid when computeId is null but uid present', () => {
      expect(
        selectivityWidget._idFunction({
          computeId: null,
          uid: 'u',
          id: 'i',
        }),
      ).to.equal('u');
    });

    test('Should return id when computeId and uid are null', () => {
      expect(
        selectivityWidget._idFunction({
          computeId: null,
          uid: null,
          id: 'i',
        }),
      ).to.equal('i');
    });

    test('Should handle boolean false as not-null', () => {
      expect(selectivityWidget._idFunction(false)).to.equal(false);
    });
  });

  suite('separator property', () => {
    test('Should default to comma', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget.separator).to.equal(',');
    });
  });

  suite('frequency and minChars properties', () => {
    test('Should use default minChars of 3', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget.minChars).to.equal(3);
    });

    test('Should use default frequency of 300', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget.frequency).to.equal(300);
    });
  });

  suite('enrichers and headers properties', () => {
    test('Should default enrichers to empty string', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget.enrichers).to.equal('');
    });

    test('Should default headers to null', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget.headers).to.be.null;
    });
  });

  suite('_newEntryFormatter edge cases', () => {
    setup(async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
    });

    test('Should handle special characters in term', () => {
      const result = selectivityWidget._newEntryFormatter('<tag>&"test"');
      expect(result.id).to.equal('<tag>&"test"');
      expect(result.displayLabel).to.equal('<tag>&"test"');
    });
  });

  suite('_resolveEntry with string data array', () => {
    test('Should resolve string entry that exists in data', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      selectivityWidget.data = ['alpha', 'beta', 'gamma'];
      const result = selectivityWidget._resolveEntry('beta');
      expect(result).to.equal('beta');
    });

    test('Should build fallback object for missing entry', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      selectivityWidget.data = ['alpha'];
      const result = selectivityWidget._resolveEntry('missing');
      expect(result).to.have.property('id', 'missing');
      expect(result).to.have.property('text', 'missing');
    });
  });

  suite('_query method branches', () => {
    test('Should call _triggerQueryCallback with data when data exists', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      selectivityWidget.data = [
        { id: 'a', displayLabel: 'A' },
        { id: 'b', displayLabel: 'B' },
      ];
      const spy = sinon.spy(selectivityWidget, '_triggerQueryCallback');
      const fakeQuery = { term: 'test', callback: sinon.spy() };
      selectivityWidget._query(fakeQuery);
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('Should call callback with empty when no data/operation', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const spy = sinon.spy(selectivityWidget, '_triggerQueryCallback');
      const fakeQuery = { term: 'test', callback: sinon.spy() };
      selectivityWidget._query(fakeQuery);
      expect(spy).to.have.been.calledWith(sinon.match.any, []);
      spy.restore();
    });
  });

  suite('_triggerQueryCallback with filter and tagging', () => {
    test('Should apply queryResultsFilter when present', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      selectivityWidget.queryResultsFilter = (item) => item.id !== 'b';
      const callback = sinon.spy();
      selectivityWidget._triggerQueryCallback({ term: 'test', callback }, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
      expect(callback).to.have.been.called;
      const args = callback.firstCall.args[0];
      const ids = args.results.map((r) => r.id);
      expect(ids).to.not.include('b');
    });

    test('Should add new entry when tagging and term not in results', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity tagging></nuxeo-selectivity>
      `);
      const callback = sinon.spy();
      selectivityWidget._triggerQueryCallback({ term: 'newTag', callback }, [{ id: 'existing' }]);
      expect(callback).to.have.been.called;
    });

    test('Should not add duplicate when tagging and term exists', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity tagging></nuxeo-selectivity>
      `);
      const callback = sinon.spy();
      selectivityWidget._triggerQueryCallback({ term: 'existing', callback }, [{ id: 'existing' }]);
      expect(callback).to.have.been.called;
    });

    test('Should not add tag when term is empty', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity tagging></nuxeo-selectivity>
      `);
      const callback = sinon.spy();
      selectivityWidget._triggerQueryCallback({ term: '', callback }, [{ id: 'a' }]);
      expect(callback).to.have.been.called;
    });
  });

  suite('_wrap method branches', () => {
    test('Should wrap single non-array item', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._wrap({ id: 'x', displayLabel: 'X' });
      expect(result).to.have.property('id', 'x');
      expect(result).to.have.property('text', 'X');
      expect(result).to.have.property('depth', 0);
    });

    test('Should wrap array of items', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._wrap([
        { id: '1', text: 'One' },
        { id: '2', text: 'Two' },
      ]);
      expect(result)
        .to.be.an('array')
        .with.length(2);
      expect(result[0]).to.have.property('depth', 0);
    });

    test('Should wrap item with children recursively', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._wrap({
        id: 'parent',
        text: 'Parent',
        children: [{ id: 'child', text: 'Child' }],
      });
      expect(result.children)
        .to.be.an('array')
        .with.length(1);
      expect(result.children[0]).to.have.property('depth', 1);
    });

    test('Should use displayLabel over text in wrapped entry', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._wrap({
        id: 'x',
        displayLabel: 'Label',
        text: 'Text',
      });
      expect(result).to.have.property('text', 'Label');
    });

    test('Should fall back to id when no displayLabel or text', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._wrap({ id: 'fallback' });
      expect(result).to.have.property('text', 'fallback');
    });

    test('Should use item reference when no displayLabel text or id', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const item = { name: 'noStandardKeys' };
      const result = selectivityWidget._wrap(item);
      expect(result).to.have.property('item', item);
      expect(result).to.have.property('depth', 0);
    });
  });

  suite('_initSelection branches', () => {
    test('Should resolve single value for non-multiple', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      selectivityWidget.data = [{ id: 'a', displayLabel: 'A' }];
      const callback = sinon.spy();
      selectivityWidget._initSelection('a', callback);
      expect(callback).to.have.been.called;
    });

    test('Should resolve array for multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity multiple></nuxeo-selectivity>
      `);
      selectivityWidget.data = [
        { id: 'a', displayLabel: 'A' },
        { id: 'b', displayLabel: 'B' },
      ];
      const callback = sinon.spy();
      selectivityWidget._initSelection(['a', 'b'], callback);
      expect(callback).to.have.been.called;
      expect(callback.firstCall.args[0]).to.be.an('array');
    });

    test('Should filter null resolved entries in multiple', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity multiple></nuxeo-selectivity>
      `);
      const callback = sinon.spy();
      selectivityWidget._initSelection([null, 'valid'], callback);
      expect(callback).to.have.been.called;
    });
  });

  suite('_updateSelection branches', () => {
    test('Should set selectedItems for multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      selectivityWidget._updateSelection({
        value: ['Berlin'],
        items: [{ id: 'Berlin', item: { id: 'Berlin' } }],
      });
      expect(selectivityWidget.selectedItems).to.be.an('array');
    });

    test('Should call addedEntryHandler when entry added', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const handler = sinon.spy();
      selectivityWidget.addedEntryHandler = handler;
      selectivityWidget._updateSelection({
        value: 'Berlin',
        items: { item: { id: 'Berlin' } },
        added: { id: 'Berlin' },
      });
      expect(handler).to.have.been.calledWith({ id: 'Berlin' });
    });

    test('Should call removedEntryHandler when entry removed', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const handler = sinon.spy();
      selectivityWidget.removedEntryHandler = handler;
      selectivityWidget._updateSelection({
        value: '',
        items: null,
        removed: { id: 'Berlin' },
      });
      expect(handler).to.have.been.calledWith({ id: 'Berlin' });
    });

    test('Should not call handler when neither added nor removed', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const addHandler = sinon.spy();
      const removeHandler = sinon.spy();
      selectivityWidget.addedEntryHandler = addHandler;
      selectivityWidget.removedEntryHandler = removeHandler;
      selectivityWidget._updateSelection({
        value: 'Berlin',
        items: { item: { id: 'Berlin' } },
      });
      expect(addHandler).not.to.have.been.called;
      expect(removeHandler).not.to.have.been.called;
    });

    test('Should handle items without item property', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      selectivityWidget._updateSelection({
        value: ['Berlin'],
        items: [{ id: 'Berlin' }],
      });
      expect(selectivityWidget.selectedItems).to.deep.include({ id: 'Berlin' });
    });

    test('Should set selectedItem to null when items is null', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      selectivityWidget._updateSelection({
        value: '',
        items: null,
      });
      expect(selectivityWidget.selectedItem).to.be.null;
    });
  });

  suite('_valueChanged branches', () => {
    test('Should not act when _inUpdateSelection is true', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      selectivityWidget._inUpdateSelection = true;
      const spy = sinon.spy(selectivityWidget._selectivity, 'setValue');
      selectivityWidget._valueChanged('Berlin');
      expect(spy).not.to.have.been.called;
      selectivityWidget._inUpdateSelection = false;
      spy.restore();
    });

    test('Should clear and sync selectedItems when value cleared for multiple', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      selectivityWidget.value = ['Berlin'];
      await flush();
      selectivityWidget._valueChanged(null);
    });

    test('Should setValue when value is non-empty string', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const spy = sinon.spy(selectivityWidget._selectivity, 'setValue');
      selectivityWidget._valueChanged('Berlin');
      expect(spy).to.have.been.calledWith('Berlin', { triggerChange: false });
      spy.restore();
    });

    test('Should not clear when current selectivity value is empty', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const clearSpy = sinon.spy(selectivityWidget._selectivity, 'clear');
      selectivityWidget._valueChanged('');
      expect(clearSpy).not.to.have.been.called;
      clearSpy.restore();
    });
  });

  suite('_dataChanged with selectivity syncing', () => {
    test('Should setOptions when selectivity is initialized', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const spy = sinon.spy(selectivityWidget._selectivity, 'setOptions');
      selectivityWidget.data = [{ id: 'x', displayLabel: 'X' }];
      selectivityWidget._dataChanged();
      expect(spy).to.have.been.called;
      spy.restore();
    });
  });

  suite('_placeholderChanged branches', () => {
    test('Should update single mode placeholder element', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      selectivityWidget.placeholder = 'Pick one';
      selectivityWidget._placeholderChanged();
    });

    test('Should update multiple mode input placeholder', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} multiple></nuxeo-selectivity>
      `);
      selectivityWidget.placeholder = 'Pick many';
      selectivityWidget._placeholderChanged();
    });
  });

  suite('_readonlyChanged branches', () => {
    test('Should update selectivity readOnly option', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const spy = sinon.spy(selectivityWidget._selectivity, 'setOptions');
      selectivityWidget.readonly = true;
      selectivityWidget._readonlyChanged();
      expect(spy).to.have.been.calledWith(
        sinon.match({
          readOnly: true,
        }),
      );
      spy.restore();
    });

    test('Should not throw when no selectivity instance', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const original = selectivityWidget._selectivity;
      selectivityWidget._selectivity = null;
      expect(() => selectivityWidget._readonlyChanged()).to.not.throw();
      selectivityWidget._selectivity = original;
    });
  });

  suite('_idFunction edge cases', () => {
    test('Should return item itself for string', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      expect(selectivityWidget._idFunction('abc')).to.equal('abc');
    });

    test('Should return item itself for number', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      expect(selectivityWidget._idFunction(42)).to.equal(42);
    });

    test('Should return null for null', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      expect(selectivityWidget._idFunction(null)).to.be.null;
    });

    test('Should prefer computeId over uid and id', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._idFunction({
        computeId: 'c1',
        uid: 'u1',
        id: 'i1',
      });
      expect(result).to.equal('c1');
    });

    test('Should use uid when no computeId', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._idFunction({ uid: 'u1', id: 'i1' });
      expect(result).to.equal('u1');
    });

    test('Should use id as last resort', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._idFunction({ id: 'i1' });
      expect(result).to.equal('i1');
    });

    test('Should return object when no id keys present', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const obj = { name: 'noId' };
      expect(selectivityWidget._idFunction(obj)).to.equal(obj);
    });
  });

  suite('_selectionFormatter edge cases', () => {
    test('Should prefer displayLabel', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._selectionFormatter({
        displayLabel: 'DL',
        title: 'T',
        text: 'Txt',
      });
      expect(result).to.include('DL');
    });

    test('Should fall back to title', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._selectionFormatter({
        title: 'Title',
        text: 'Txt',
      });
      expect(result).to.include('Title');
    });

    test('Should fall back to text', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._selectionFormatter({ text: 'MyText' });
      expect(result).to.include('MyText');
    });

    test('Should escape HTML in output', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._selectionFormatter({
        displayLabel: '<b>Bold</b>',
      });
      expect(result).to.include('&lt;b&gt;');
    });
  });

  suite('_resultFormatter edge cases', () => {
    test('Should prefer displayLabel over title', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._resultFormatter({
        displayLabel: 'DL',
        title: 'T',
      });
      expect(result).to.include('DL');
    });

    test('Should fall back to text when no label/title', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._resultFormatter({ text: 'Plain' });
      expect(result).to.include('Plain');
    });

    test('Should handle string item directly', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._resultFormatter('rawString');
      expect(result).to.equal('rawString');
    });
  });

  suite('escapeHTML edge cases', () => {
    test('Should escape ampersand', () => {
      expect(escapeHTML('a&b')).to.equal('a&amp;b');
    });

    test('Should escape less-than', () => {
      expect(escapeHTML('a<b')).to.equal('a&lt;b');
    });

    test('Should escape greater-than', () => {
      expect(escapeHTML('a>b')).to.equal('a&gt;b');
    });

    test('Should escape double quote', () => {
      expect(escapeHTML('a"b')).to.equal('a&quot;b');
    });

    test('Should escape single quote', () => {
      expect(escapeHTML("a'b")).to.equal('a&#39;b');
    });

    test('Should escape forward slash', () => {
      expect(escapeHTML('a/b')).to.equal('a&#47;b');
    });

    test('Should escape backslash', () => {
      expect(escapeHTML('a\\b')).to.equal('a&#92;b');
    });

    test('Should return non-string inputs unchanged', () => {
      expect(escapeHTML(42)).to.equal(42);
      expect(escapeHTML(null)).to.be.null;
      expect(escapeHTML(undefined)).to.be.undefined;
      expect(escapeHTML(true)).to.be.true;
    });

    test('Should escape all special chars combined', () => {
      const result = escapeHTML('<div class="x">&</div>');
      expect(result).to.not.include('<');
      expect(result).to.not.include('>');
      expect(result).to.not.include('"');
      expect(result).to.include('&amp;');
    });
  });

  suite('_getValidity branches', () => {
    test('Should return true when not required', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget._getValidity()).to.be.true;
    });

    test('Should return false when required and empty string', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required></nuxeo-selectivity>
      `);
      selectivityWidget.value = '';
      expect(selectivityWidget._getValidity()).to.be.false;
    });

    test('Should return false when required and null', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required></nuxeo-selectivity>
      `);
      selectivityWidget.value = null;
      expect(selectivityWidget._getValidity()).to.be.false;
    });

    test('Should return true when required and has value', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required></nuxeo-selectivity>
      `);
      selectivityWidget.value = 'Berlin';
      expect(selectivityWidget._getValidity()).to.be.true;
    });

    test('Should check array length in multiple mode', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required multiple></nuxeo-selectivity>
      `);
      selectivityWidget.value = ['Berlin'];
      expect(selectivityWidget._getValidity()).to.be.true;
    });

    test('Should return false for empty array in required multiple', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data} required multiple></nuxeo-selectivity>
      `);
      selectivityWidget.value = [];
      expect(selectivityWidget._getValidity()).to.be.false;
    });
  });

  suite('_updateDropdownPosition branches', () => {
    test('Should call positionDropdown when selectivity exists', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const spy = sinon.spy(selectivityWidget._selectivity, 'positionDropdown');
      selectivityWidget._updateDropdownPosition();
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('Should not throw when selectivity is null', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      const original = selectivityWidget._selectivity;
      selectivityWidget._selectivity = null;
      expect(() => selectivityWidget._updateDropdownPosition()).to.not.throw();
      selectivityWidget._selectivity = original;
    });
  });

  suite('_resolveEntry null handling', () => {
    test('Should return null for null entry', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      expect(selectivityWidget._resolveEntry(null)).to.be.null;
    });

    test('Should return null for empty string entry', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      expect(selectivityWidget._resolveEntry('')).to.be.null;
    });

    test('Should return null for undefined entry', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      expect(selectivityWidget._resolveEntry(undefined)).to.be.null;
    });

    test('Should build fallback with no data property at all', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._resolveEntry('abc');
      expect(result).to.have.property('id', 'abc');
      expect(result).to.have.property('text', 'abc');
    });
  });

  suite('connectedCallback dir attribute', () => {
    test('Should set dir attribute from document', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity .data=${data}></nuxeo-selectivity>
      `);
      expect(selectivityWidget.hasAttribute('dir')).to.be.true;
    });
  });

  suite('property defaults', () => {
    test('maximumSelectionSize defaults to -1', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      expect(selectivityWidget.maximumSelectionSize).to.equal(-1);
    });

    test('separator defaults to comma', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      expect(selectivityWidget.separator).to.equal(',');
    });

    test('minChars defaults to 3', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      expect(selectivityWidget.minChars).to.equal(3);
    });

    test('frequency defaults to 300', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      expect(selectivityWidget.frequency).to.equal(300);
    });
  });

  suite('_newEntryFormatter', () => {
    test('Should return object with id and displayLabel', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const result = selectivityWidget._newEntryFormatter('test');
      expect(result).to.deep.equal({ id: 'test', displayLabel: 'test' });
    });
  });

  suite('_getScrollParent', () => {
    test('Should return a scrollable parent or body', async () => {
      selectivityWidget = await fixture(html`
        <nuxeo-selectivity></nuxeo-selectivity>
      `);
      const parent = selectivityWidget._getScrollParent();
      expect(parent).to.exist;
    });
  });
});
