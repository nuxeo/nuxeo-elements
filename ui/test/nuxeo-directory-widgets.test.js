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
import { fixture, flush, focus, html, login, tap, waitForEvent } from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../widgets/nuxeo-directory-checkbox.js';
import '../widgets/nuxeo-directory-radio-group.js';
import '../widgets/nuxeo-directory-suggestion.js';

suite('nuxeo-directory-suggestion', () => {
  let server;
  let suggestionWidget;
  setup(async () => {
    server = await login();
    // non-balanced hierarchical vocabulary
    const response = [
      {
        absoluteLabel: 'Brittany',
        computedId: 'breizh',
        directoryName: 'l10ncoverage',
        displayLabel: 'Brittany',
        'entity-type': 'directoryEntry',
        id: 'breizh',
        label_en: 'Brittany',
        label_fr: 'Bretagne',
        obsolete: 0,
        ordering: 10000000,
        parent: '',
        properties: {
          id: 'breizh',
          label_en: 'Brittany',
          label_fr: 'Bretagne',
          obsolete: 0,
          ordering: 10000000,
          parent: '',
        },
      },
      {
        children: [
          {
            absoluteLabel: 'South-america/Brazil',
            computedId: 'south-america/Brazil',
            directoryName: 'l10ncoverage',
            displayLabel: 'Brazil',
            'entity-type': 'directoryEntry',
            id: 'Brazil',
            label_en: 'Brazil',
            label_fr: 'Br\u00e9sil',
            obsolete: 0,
            ordering: 10000000,
            parent: 'south-america',
            properties: {
              id: 'Brazil',
              label_en: 'Brazil',
              label_fr: 'Br\u00e9sil',
              obsolete: 0,
              ordering: 10000000,
              parent: 'south-america',
            },
          },
        ],
        displayLabel: 'South-america',
      },
    ];
    server.respondWith('POST', '/api/v1/automation/Directory.SuggestEntries', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(response),
    ]);
  });

  suite('When I have a suggestion widget', () => {
    setup(async () => {
      suggestionWidget = await fixture(html`
        <nuxeo-directory-suggestion directory-name="l10coverage" min-chars="0"></nuxeo-directory-suggestion>
      `);
    });

    test('Then it works', async () => {
      const s2 = dom(suggestionWidget.root).querySelector('#s2');
      const input = dom(s2.root).querySelector('#input');
      tap(input);
      dom(s2.root).querySelector('.selectivity-search-input').value = 'Brittany';
      const getSuggestedValue = function(timeout) {
        timeout = timeout || 2000;
        const start = Date.now();
        const waitForSuggestion = function(resolve, reject) {
          const result = dom(s2.root).querySelector('.selectivity-result-item.highlight');
          if (result) {
            resolve(result.textContent);
          } else if (timeout && Date.now() - start >= timeout) {
            reject(new Error('timeout'));
          } else {
            setTimeout(waitForSuggestion.bind(this, resolve, reject), 30);
          }
        };
        return new Promise(waitForSuggestion);
      };
      // await flush();
      const val = await getSuggestedValue();
      expect(val).to.be.equal('Brittany');
    });
  });
});

suite('<nuxeo-directory-checkbox>', () => {
  let server;
  setup(async () => {
    server = await login();
    const response = [
      {
        absoluteLabel: 'Arabic',
        computedId: 'ar',
        directoryName: 'language',
        displayLabel: 'Arabic',
        'entity-type': 'directoryEntry',
        id: 'ar',
        label: 'Arabic',
        obsolete: 0,
        ordering: 10000000,
        properties: {
          id: 'ar',
          label: 'Arabic',
          obsolete: 0,
          ordering: 10000000,
        },
      },
      {
        absoluteLabel: 'Chinese',
        computedId: 'zh',
        directoryName: 'language',
        displayLabel: 'Chinese',
        'entity-type': 'directoryEntry',
        id: 'zh',
        label: 'Chinese',
        obsolete: 0,
        ordering: 10000000,
        properties: {
          id: 'zh',
          label: 'Chinese',
          obsolete: 0,
          ordering: 10000000,
        },
      },
      {
        absoluteLabel: 'English',
        computedId: 'en',
        directoryName: 'language',
        displayLabel: 'English',
        'entity-type': 'directoryEntry',
        id: 'en',
        label: 'English',
        obsolete: 0,
        ordering: 10000000,
        properties: {
          id: 'en',
          label: 'English',
          obsolete: 0,
          ordering: 10000000,
        },
      },
      {
        absoluteLabel: 'French',
        computedId: 'fr',
        directoryName: 'language',
        displayLabel: 'French',
        'entity-type': 'directoryEntry',
        id: 'fr',
        label: 'French',
        obsolete: 0,
        ordering: 10000000,
        properties: {
          id: 'fr',
          label: 'French',
          obsolete: 0,
          ordering: 10000000,
        },
      },
    ];
    server.respondWith('POST', '/api/v1/automation/Directory.SuggestEntries', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(response),
    ]);
  });

  suite('When I have a checkbox widget initialized with English', () => {
    test('Then I can deselect English and select French and Arabic instead', async () => {
      const checkboxes = await fixture(html`
        <nuxeo-directory-checkbox directory-name="language"></nuxeo-directory-checkbox>
      `);
      checkboxes.value = [
        {
          absoluteLabel: 'English',
          computedId: 'en',
          directoryName: 'language',
          displayLabel: 'English',
          'entity-type': 'directoryEntry',
          id: 'en',
          label: 'English',
          obsolete: 0,
          ordering: 3,
          properties: {
            id: 'en',
            label: 'English',
            obsolete: 0,
            ordering: 10000000,
          },
        },
      ];
      await waitForEvent(checkboxes, 'directory-entries-loaded');
      await flush();
      const choices = dom(checkboxes.root).querySelectorAll('paper-checkbox');
      expect(choices.length).to.be.equal(4);
      let selected = dom(checkboxes.root).querySelectorAll('paper-checkbox[checked]');
      expect(selected.length).to.be.equal(1);
      expect(selected[0].name).to.be.equal('en');

      tap(selected[0]);

      selected = dom(checkboxes.root).querySelectorAll('paper-checkbox[checked]');
      expect(selected.length).to.be.equal(0);

      tap(choices[3]);
      tap(choices[0]);
      selected = dom(checkboxes.root).querySelectorAll('paper-checkbox[checked]');
      expect(selected.length).to.be.equal(2);
      expect(selected[1].name).to.be.equal('fr');
      expect(selected[0].name).to.be.equal('ar');
      expect(checkboxes.value.length).to.be.equal(2);
      expect(checkboxes.value[0]).to.be.equal('fr');
      expect(checkboxes.value[1]).to.be.equal('ar');
      expect(checkboxes.selectedItems.length).to.be.equal(2);
      expect(checkboxes.selectedItems[0].id).to.be.equal('fr');
      expect(checkboxes.selectedItems[1].id).to.be.equal('ar');
    });
  });

  suite('When I have a radio group widget initialized with English', () => {
    test('Then I can select French and it deselects English', async () => {
      const radioGroup = await fixture(html`
        <nuxeo-directory-radio-group directory-name="language"></nuxeo-directory-radio-group>
      `);
      radioGroup.value = {
        absoluteLabel: 'English',
        computedId: 'en',
        directoryName: 'language',
        displayLabel: 'English',
        'entity-type': 'directoryEntry',
        id: 'en',
        label: 'English',
        obsolete: 0,
        ordering: 3,
        properties: {
          id: 'en',
          label: 'English',
          obsolete: 0,
          ordering: 10000000,
        },
      };
      await waitForEvent(radioGroup, 'directory-entries-loaded');
      await flush();
      const choices = dom(radioGroup.root).querySelectorAll('paper-radio-button');
      expect(choices.length).to.be.equal(4);
      let selected = dom(radioGroup.root).querySelectorAll('paper-radio-button[checked]');
      expect(selected.length).to.be.equal(1);
      expect(selected[0].name).to.be.equal('en');
      focus(radioGroup);
      tap(choices[3]);
      selected = dom(radioGroup.root).querySelectorAll('paper-radio-button[checked]');
      expect(selected.length).to.be.equal(1);
      expect(selected[0].name).to.be.equal('fr');
      expect(radioGroup.value).to.be.equal('fr');
      expect(radioGroup.selectedItem.id).to.be.equal('fr');
    });
  });
});
