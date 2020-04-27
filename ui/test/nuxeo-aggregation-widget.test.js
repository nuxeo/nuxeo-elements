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
import { html, fixture, flush, isElementVisible, tap } from '@nuxeo/testing-helpers';
import '../nuxeo-aggregation/nuxeo-checkbox-aggregation.js';

const data = {
  'entity-type': 'aggregate',
  extendedBuckets: [
    {
      docCount: 2,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Tolkien',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2292',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2292',
    },
    {
      docCount: 1,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Asimov',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 3,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Hemingway',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 4,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Dostoevsky',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 5,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Tolstoy',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 6,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Pessoa',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 7,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Balzac',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 8,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Cervantes',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
    {
      docCount: 9,
      fetchedKey: {
        'entity-type': 'document',
        properties: {
          'dc:title': 'Shakespeare',
        },
        uid: '59cf794f-6875-45ca-a837-053c196b2291',
      },
      key: '59cf794f-6875-45ca-a837-053c196b2291',
    },
  ],
  field: 'book:author',
  id: 'book_author_agg',
  properties: {
    order: 'count desc',
    size: '20',
  },
  ranges: [],
  selection: [],
  type: 'terms',
};

const selectElementInSlot = (slot, name) => {
  const filteredSlot = slot.assignedNodes().filter((el) => el.nodeName === name.toUpperCase());
  return filteredSlot;
};

const checkElementsVisibility = (elements, lengthExpected, value) => {
  expect(elements.length).to.equal(lengthExpected);
  elements.forEach((element) => {
    expect(isElementVisible(element)).to.equal(value);
  });
};

suite('nuxeo-checkbox-aggregation', () => {
  suite('Empty', () => {
    test('Should display no results message when buckets are empty', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation></nuxeo-checkbox-aggregation>
        `,
      );

      const message = nuxeoCheckboxAggregation.shadowRoot.querySelector('span');
      expect(isElementVisible(message)).to.be.true;
      expect(message.innerHTML).to.equal('checkboxAggregation.noResults');
    });
  });

  suite('Non-collapsible', () => {
    test('Should display a label when "label" is set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} label="Some label"> </nuxeo-checkbox-aggregation>
        `,
      );

      const label = nuxeoCheckboxAggregation.shadowRoot.querySelector('label');
      expect(label.innerHTML).to.equal('Some label');
    });

    test('Should display the title of the document when "data" is set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data}></nuxeo-checkbox-aggregation>
        `,
      );

      const checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      expect(checkboxes.length).to.equal(9);
      checkboxes.forEach((element) => {
        expect(isElementVisible(element)).to.be.true;
      });
      expect(checkboxes[0].innerHTML.trim()).to.equal('Tolkien (2)');
      expect(checkboxes[1].innerHTML.trim()).to.equal('Asimov (1)');
      expect(checkboxes[2].innerHTML.trim()).to.equal('Hemingway (3)');
      expect(checkboxes[3].innerHTML.trim()).to.equal('Dostoevsky (4)');
      expect(checkboxes[4].innerHTML.trim()).to.equal('Tolstoy (5)');
      expect(checkboxes[5].innerHTML.trim()).to.equal('Pessoa (6)');
      expect(checkboxes[6].innerHTML.trim()).to.equal('Balzac (7)');
      expect(checkboxes[7].innerHTML.trim()).to.equal('Cervantes (8)');
      expect(checkboxes[8].innerHTML.trim()).to.equal('Shakespeare (9)');
    });

    test('Should sort checkboxes alphabetically when "sort-by-label" is set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} sort-by-label></nuxeo-checkbox-aggregation>
        `,
      );

      const checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      expect(checkboxes.length).to.equal(9);
      expect(checkboxes[0].textContent.trim()).to.equal('Asimov (1)');
      expect(checkboxes[1].textContent.trim()).to.equal('Balzac (7)');
      expect(checkboxes[2].textContent.trim()).to.equal('Cervantes (8)');
    });
  });

  suite('Collapsible', () => {
    test('Should display a label in a button when "label" is set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible label="Some label"> </nuxeo-checkbox-aggregation>
        `,
      );

      const nuxeoCollapsible = nuxeoCheckboxAggregation.shadowRoot.querySelector('nuxeo-collapsible');
      const label = nuxeoCollapsible.shadowRoot.querySelectorAll('slot')[0].assignedNodes()[0];
      expect(label.innerHTML).to.equal('Some label');
    });

    test('Should display a collapsible element and hide checkboxes when "collapsible" is set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible></nuxeo-checkbox-aggregation>
        `,
      );

      const nuxeoCollapsible = nuxeoCheckboxAggregation.shadowRoot.querySelector('nuxeo-collapsible');
      expect(isElementVisible(nuxeoCollapsible)).to.be.true;

      const checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      checkboxes.forEach((element) => {
        expect(isElementVisible(element)).to.be.false;
      });
    });

    test('Should display checkboxes when "collapsible" is set and it is tapped', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible></nuxeo-checkbox-aggregation>
        `,
      );

      const nuxeoCollapsible = nuxeoCheckboxAggregation.shadowRoot.querySelector('nuxeo-collapsible');
      const nuxeoCollapsibleButton = nuxeoCollapsible.shadowRoot.querySelector('button');
      const slotContent = nuxeoCollapsible.shadowRoot.querySelectorAll('slot')[1];
      const paperCheckboxes = selectElementInSlot(slotContent, 'paper-checkbox');
      expect(paperCheckboxes.length).to.equal(8);
      checkElementsVisibility(paperCheckboxes, 8, false);

      tap(nuxeoCollapsibleButton);
      expect(paperCheckboxes.length).to.equal(8);
      checkElementsVisibility(paperCheckboxes, 8, true);
    });

    test('Should display 4 checkboxes in a collapsible element when "visibleItems" is set to 4', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible visible-items="4"></nuxeo-checkbox-aggregation>
        `,
      );

      const nuxeoCollapsible = nuxeoCheckboxAggregation.shadowRoot.querySelector('nuxeo-collapsible');
      const nuxeoCollapsibleButton = nuxeoCollapsible.shadowRoot.querySelector('button');
      const slotContent = nuxeoCollapsible.shadowRoot.querySelectorAll('slot')[1];
      const paperCheckboxes = selectElementInSlot(slotContent, 'paper-checkbox');
      expect(paperCheckboxes.length).to.equal(4);
      checkElementsVisibility(paperCheckboxes, 4, false);

      tap(nuxeoCollapsibleButton);
      checkElementsVisibility(paperCheckboxes, 4, true);
    });

    test('Should show 9 checkboxes when "visibleItems" is set to 4 and "show all" button is toggled', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible visible-items="4"></nuxeo-checkbox-aggregation>
        `,
      );

      const nuxeoCollapsible = nuxeoCheckboxAggregation.shadowRoot.querySelector('nuxeo-collapsible');
      const nuxeoCollapsibleButton = nuxeoCollapsible.shadowRoot.querySelector('button');
      const slotContent = nuxeoCollapsible.shadowRoot.querySelectorAll('slot')[1];
      let paperCheckboxes = selectElementInSlot(slotContent, 'paper-checkbox');
      expect(paperCheckboxes.length).to.equal(4);
      checkElementsVisibility(paperCheckboxes, 4, false);

      tap(nuxeoCollapsibleButton);
      expect(paperCheckboxes.length).to.equal(4);
      checkElementsVisibility(paperCheckboxes, 4, true);

      const showAllButton = selectElementInSlot(slotContent, 'span')[0].firstElementChild;
      expect(isElementVisible(showAllButton)).to.be.true;
      expect(showAllButton.innerText).to.equal('checkboxAggregation.showAll');
      tap(showAllButton);
      await flush();
      paperCheckboxes = selectElementInSlot(slotContent, 'paper-checkbox');
      expect(showAllButton.innerText).to.equal('checkboxAggregation.showLess');
      expect(paperCheckboxes.length).to.equal(9);
      checkElementsVisibility(paperCheckboxes, 9, true);
    });

    test('Should hide 5 checkboxes when "show all" button is toggled again', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible visible-items="4"></nuxeo-checkbox-aggregation>
        `,
      );

      const nuxeoCollapsible = nuxeoCheckboxAggregation.shadowRoot.querySelector('nuxeo-collapsible');
      const nuxeoCollapsibleButton = nuxeoCollapsible.shadowRoot.querySelector('button');
      const slotContent = nuxeoCollapsible.shadowRoot.querySelectorAll('slot')[1];
      let paperCheckboxes = selectElementInSlot(slotContent, 'paper-checkbox');
      expect(paperCheckboxes.length).to.equal(4);
      checkElementsVisibility(paperCheckboxes, 4, false);

      tap(nuxeoCollapsibleButton);
      expect(paperCheckboxes.length).to.equal(4);
      checkElementsVisibility(paperCheckboxes, 4, true);

      const showAllButton = selectElementInSlot(slotContent, 'span')[0].firstElementChild;
      expect(isElementVisible(showAllButton)).to.be.true;
      expect(showAllButton.innerText).to.equal('checkboxAggregation.showAll');
      tap(showAllButton);
      await flush();
      paperCheckboxes = selectElementInSlot(slotContent, 'paper-checkbox');
      expect(showAllButton.innerText).to.equal('checkboxAggregation.showLess');
      expect(paperCheckboxes.length).to.equal(9);
      checkElementsVisibility(paperCheckboxes, 9, true);

      tap(showAllButton);
      await flush();
      paperCheckboxes = selectElementInSlot(slotContent, 'paper-checkbox');
      expect(showAllButton.innerText).to.equal('checkboxAggregation.showAll');
      checkElementsVisibility(paperCheckboxes, 4, true);
    });
  });
});
