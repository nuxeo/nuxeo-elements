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
import { fixture, html, login } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
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

suite('<nuxeo-checkbox-aggregation>', () => {
  setup(async () => {
    await login();
  });

  suite('Given a nuxeo-checkbox-aggregation widget on document aggregations', () => {
    let documentAggs;

    setup(async () => {
      documentAggs = await fixture(html`
        <nuxeo-checkbox-aggregation .data=${data}></nuxeo-checkbox-aggregation>
      `);
    });

    test('It displays the title of the document', () => {
      const choices = dom(documentAggs.root).querySelectorAll('paper-checkbox');
      expect(choices.length).to.be.equal(2);
      expect(choices[0].textContent.trim()).to.be.equal('Tolkien (2)');
      expect(choices[1].textContent.trim()).to.be.equal('Asimov (1)');
    });

    test('Its value is undefined when none selected', () => {
      const choices = dom(documentAggs.root).querySelectorAll('paper-checkbox');
      const initialValue = documentAggs.value;
      expect(initialValue).to.be.equal(undefined);
      // select first
      choices[0].click();
      // unselect first
      choices[0].click();
      expect(documentAggs.value).to.be.equal(initialValue);
    });
  });

  suite('Given a nuxeo-checkbox-aggregation widget on document aggregations sorted by label', () => {
    let documentAggsSorted;

    setup(async () => {
      documentAggsSorted = await fixture(html`
        <nuxeo-checkbox-aggregation .data=${data} sort-by-label></nuxeo-checkbox-aggregation>
      `);
    });

    test('It displays the aggregations sorted by document title', () => {
      const choices = dom(documentAggsSorted.root).querySelectorAll('paper-checkbox');
      expect(choices.length).to.be.equal(2);
      expect(choices[0].textContent.trim()).to.be.equal('Asimov (1)');
      expect(choices[1].textContent.trim()).to.be.equal('Tolkien (2)');
    });
  });
});
