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

import {
  fixture,
  flush,
  html,
  waitForAttrMutation,
  waitForChildListMutation,
} from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import { pressAndReleaseKeyOn } from '@polymer/iron-test-helpers/mock-interactions.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../widgets/nuxeo-selectivity.js';

/* eslint-disable no-unused-expressions */
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
        await waitForChildListMutation(resultsContainer);
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
});
