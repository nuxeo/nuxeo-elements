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
import { html, fixture, flush, isElementVisible, tap, timePasses } from '@nuxeo/testing-helpers';
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

const checkElementsVisibility = (elements, lengthExpected, value) => {
  expect(elements.length).to.equal(lengthExpected);
  elements.forEach((element) => {
    expect(isElementVisible(element)).to.equal(value);
  });
};

// Wait for iron-collapsible animation to end
const waitForAnimationToEnd = async (ms = 300) => {
  await timePasses(ms);
};

suite('nuxeo-checkbox-aggregation', () => {
  suite('Non-collapsible', () => {
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
      const results = [
        'Tolkien (2)',
        'Asimov (1)',
        'Hemingway (3)',
        'Dostoevsky (4)',
        'Tolstoy (5)',
        'Pessoa (6)',
        'Balzac (7)',
        'Cervantes (8)',
        'Shakespeare (9)',
      ];
      checkboxes.forEach((element, i) => {
        expect(isElementVisible(element)).to.be.true;
        expect(element.innerText).to.equal(results[i]);
      });
    });

    test('Should sort checkboxes alphabetically when "sort-by-label" is set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} sort-by-label></nuxeo-checkbox-aggregation>
        `,
      );

      const checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      expect(checkboxes.length).to.equal(9);
      expect(Array.from(checkboxes).map((c) => c.innerText)).to.deep.equal([
        'Asimov (1)',
        'Balzac (7)',
        'Cervantes (8)',
        'Dostoevsky (4)',
        'Hemingway (3)',
        'Pessoa (6)',
        'Shakespeare (9)',
        'Tolkien (2)',
        'Tolstoy (5)',
      ]);
    });
  });

  suite('Collapsible', () => {
    test('Should display a button when "collapsible" is set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible label="Some label"> </nuxeo-checkbox-aggregation>
        `,
      );

      const button = nuxeoCheckboxAggregation.shadowRoot.querySelector('button');
      expect(isElementVisible(button)).to.be.true;
    });

    test('Should display a label when "label" is set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible label="Some label"> </nuxeo-checkbox-aggregation>
        `,
      );

      const label = nuxeoCheckboxAggregation.shadowRoot.querySelector('button').querySelector('label');
      expect(label.innerHTML).to.equal('Some label');
      expect(isElementVisible(label)).to.be.true;
    });

    test('Should display an arrow when "collapsible" is set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible label="Some label"> </nuxeo-checkbox-aggregation>
        `,
      );

      const icon = nuxeoCheckboxAggregation.shadowRoot.querySelector('button').querySelector('iron-icon');
      expect(isElementVisible(icon)).to.be.true;
    });

    test('Should display no results message when buckets are empty', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation collapsible></nuxeo-checkbox-aggregation>
        `,
      );

      tap(nuxeoCheckboxAggregation.shadowRoot.querySelector('button'));
      await waitForAnimationToEnd();

      const message = nuxeoCheckboxAggregation.shadowRoot.querySelector('span');
      expect(isElementVisible(message)).to.be.true;
      expect(message.innerHTML).to.equal('checkboxAggregation.noResults');
    });

    test('Should hide checkboxes when "collapsible" is set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible></nuxeo-checkbox-aggregation>
        `,
      );

      const checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      checkboxes.forEach((element) => {
        expect(isElementVisible(element)).to.be.false;
      });
    });

    test('Should display 8 checkboxes when "collapsible" and "opened" are set', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible opened></nuxeo-checkbox-aggregation>
        `,
      );

      const checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      checkboxes.forEach((element) => {
        expect(isElementVisible(element)).to.be.true;
      });
    });

    test('Should display checkboxes when "collapsible" is set and it is tapped', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible></nuxeo-checkbox-aggregation>
        `,
      );

      const checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      expect(checkboxes.length).to.equal(8);
      checkElementsVisibility(checkboxes, 8, false);

      tap(nuxeoCheckboxAggregation.shadowRoot.querySelector('button'));
      await waitForAnimationToEnd();
      expect(checkboxes.length).to.equal(8);
      checkElementsVisibility(checkboxes, 8, true);
    });

    test('Should display 4 checkboxes when "visibleItems" is set to 4', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible visible-items="4"></nuxeo-checkbox-aggregation>
        `,
      );

      const checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      expect(checkboxes.length).to.equal(4);
      checkElementsVisibility(checkboxes, 4, false);

      tap(nuxeoCheckboxAggregation.shadowRoot.querySelector('button'));
      await waitForAnimationToEnd();
      checkElementsVisibility(checkboxes, 4, true);
    });

    test('Should show 9 checkboxes when "show all" button is tapped', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible></nuxeo-checkbox-aggregation>
        `,
      );

      let checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      expect(checkboxes.length).to.equal(8);
      checkElementsVisibility(checkboxes, 8, false);

      tap(nuxeoCheckboxAggregation.shadowRoot.querySelector('button'));
      await waitForAnimationToEnd();
      expect(checkboxes.length).to.equal(8);
      checkElementsVisibility(checkboxes, 8, true);

      const showAllButton = nuxeoCheckboxAggregation.shadowRoot.querySelector('iron-collapse').querySelector('a');
      expect(showAllButton.innerText).to.equal('checkboxAggregation.showAll');
      expect(isElementVisible(showAllButton)).to.be.true;

      tap(showAllButton);
      await flush();
      expect(showAllButton.innerText).to.equal('checkboxAggregation.showLess');
      checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      expect(checkboxes.length).to.equal(9);
      checkElementsVisibility(checkboxes, 9, true);
    });

    test('Should hide 1 checkbox when "show all" button is tapped again', async () => {
      const nuxeoCheckboxAggregation = await fixture(
        html`
          <nuxeo-checkbox-aggregation .data=${data} collapsible></nuxeo-checkbox-aggregation>
        `,
      );

      let checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      expect(checkboxes.length).to.equal(8);
      checkElementsVisibility(checkboxes, 8, false);

      tap(nuxeoCheckboxAggregation.shadowRoot.querySelector('button'));
      await waitForAnimationToEnd();
      expect(checkboxes.length).to.equal(8);
      checkElementsVisibility(checkboxes, 8, true);

      const showAllButton = nuxeoCheckboxAggregation.shadowRoot.querySelector('iron-collapse').querySelector('a');
      expect(isElementVisible(showAllButton)).to.be.true;
      expect(showAllButton.innerText).to.equal('checkboxAggregation.showAll');
      tap(showAllButton);
      await flush();
      checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      expect(showAllButton.innerText).to.equal('checkboxAggregation.showLess');
      expect(checkboxes.length).to.equal(9);
      checkElementsVisibility(checkboxes, 9, true);

      tap(showAllButton);
      await flush();
      checkboxes = nuxeoCheckboxAggregation.shadowRoot.querySelectorAll('paper-checkbox');
      expect(showAllButton.innerText).to.equal('checkboxAggregation.showAll');
      checkElementsVisibility(checkboxes, 8, true);
    });
  });
});
