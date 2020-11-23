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
import { expect } from '@esm-bundle/chai';
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
  });

  const getSuggestedValue = (s2, timeout) => {
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

  const assertSelectedValue = async (widget, input, value) => {
    const s2 = dom(widget.root).querySelector('#s2');
    const el = dom(s2.root).querySelector('#input');
    tap(el);
    dom(s2.root).querySelector(
      widget.multiple ? '.selectivity-multiple-input' : '.selectivity-search-input',
    ).value = input;
    const val = await getSuggestedValue(s2);
    expect(val).to.be.equal(value);
  };

  suite('When I have a sigle-valued suggestion widget', () => {
    setup(async () => {
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

      suggestionWidget = await fixture(html`
        <nuxeo-directory-suggestion directory-name="l10coverage" min-chars="0"></nuxeo-directory-suggestion>
      `);
    });

    test('Then I can select an entry', async () => {
      await assertSelectedValue(suggestionWidget, 'Brittany', 'Brittany');
    });
  });

  suite('When I have a multi-valued suggestion widget', () => {
    const response = [
      {
        displayLabel: 'Art',
        children: [
          {
            parent: 'art',
            ordering: 10000000,
            obsolete: 0,
            id: 'architecture',
            displayLabel: 'Architecture',
            label_en: 'Architecture',
            label_fr: 'Architecture',
            directoryName: 'l10nsubjects',
            properties: {
              parent: 'art',
              ordering: 10000000,
              obsolete: 0,
              id: 'architecture',
              label_en: 'Architecture',
              label_fr: 'Architecture',
            },
            'entity-type': 'directoryEntry',
            computedId: 'art/architecture',
            absoluteLabel: 'Art/Architecture',
          },
          {
            parent: 'art',
            ordering: 10000000,
            obsolete: 0,
            id: 'art history',
            displayLabel: 'Art history',
            label_en: 'Art history',
            label_fr: "Histoire de l'art",
            directoryName: 'l10nsubjects',
            properties: {
              parent: 'art',
              ordering: 10000000,
              obsolete: 0,
              id: 'art history',
              label_en: 'Art history',
              label_fr: "Histoire de l'art",
            },
            'entity-type': 'directoryEntry',
            computedId: 'art/art history',
            absoluteLabel: 'Art/Art history',
          },
        ],
      },
    ];
    setup(async () => {
      server.respondWith('POST', '/api/v1/automation/Directory.SuggestEntries', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(response),
      ]);
    });

    test('Then I can select an entry', async () => {
      suggestionWidget = await fixture(html`
        <nuxeo-directory-suggestion directory-name="l10nsubjects" multiple min-chars="0"></nuxeo-directory-suggestion>
      `);
      await assertSelectedValue(suggestionWidget, 'ar', 'Architecture');
    });

    test('Then I can select and re-select an entry', async () => {
      suggestionWidget = await fixture(html`
        <nuxeo-directory-suggestion directory-name="l10nsubjects" multiple min-chars="0"></nuxeo-directory-suggestion>
      `);
      await assertSelectedValue(suggestionWidget, 'ar', 'Architecture');

      // click on the result
      const s2 = dom(suggestionWidget.root).querySelector('#s2');
      const results = s2.shadowRoot.querySelectorAll('.selectivity-result-item');
      expect(results.length).to.equal(2);
      tap(results[0]);

      // assert it the label is propery presented
      let selectedValues = s2.shadowRoot.querySelectorAll('.selectivity-multiple-selected-item');
      expect(selectedValues.length).to.equal(1);
      expect(selectedValues[0].innerText).to.equal('Art/Architecture');

      // reset selection
      const val = suggestionWidget.value;
      suggestionWidget.value = [];
      await flush();
      selectedValues = s2.shadowRoot.querySelectorAll('.selectivity-multiple-selected-item');
      expect(selectedValues.length).to.equal(0);

      // re-set the value programatically and check that the label is properly displayed (tests entry caching)
      suggestionWidget.value = val;
      await flush();
      selectedValues = s2.shadowRoot.querySelectorAll('.selectivity-multiple-selected-item');
      expect(selectedValues.length).to.equal(1);
      expect(selectedValues[0].innerText).to.equal('Art/Architecture');
    });

    test('Then I can select a second entry', async () => {
      // this is how you get data from Directory.SuggestEntries
      const selected = [response[0].children[0]];
      suggestionWidget = await fixture(html`
        <nuxeo-directory-suggestion
          directory-name="l10nsubjects"
          .value="${selected}"
          multiple
          min-chars="0"
        ></nuxeo-directory-suggestion>
      `);
      await assertSelectedValue(suggestionWidget, 'ar', 'Art history');
    });

    test("Then I can select a second entry if the first doesn't have a computedId", async () => {
      // this is how you get data from a document, without the computedId
      const selected = [
        {
          id: 'architecture',
          directoryName: 'l10nsubjects',
          properties: {
            parent: 'art',
            ordering: 10000000,
            obsolete: 0,
            id: 'architecture',
            label_en: 'Architecture',
            label_fr: 'Architecture',
          },
          'entity-type': 'directoryEntry',
        },
      ];
      suggestionWidget = await fixture(html`
        <nuxeo-directory-suggestion
          directory-name="l10nsubjects"
          .value="${selected}"
          multiple
          min-chars="0"
        ></nuxeo-directory-suggestion>
      `);
      await assertSelectedValue(suggestionWidget, 'ar', 'Art history');
    });
  });
});

suite('nuxeo-directory-checkbox', () => {
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
      const options = [
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
      const checkboxes = await fixture(html`
        <nuxeo-directory-checkbox directory-name="language" .selectedItems="${options}"></nuxeo-directory-checkbox>
      `);
      if (!checkboxes._entries || checkboxes._entries.length === 0) {
        await waitForEvent(checkboxes, 'directory-entries-loaded');
      }
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
      const option = {
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
      const radioGroup = await fixture(html`
        <nuxeo-directory-radio-group directory-name="language" .selectedItem="${option}"></nuxeo-directory-radio-group>
      `);
      if (!radioGroup._entries || radioGroup._entries.length === 0) {
        await waitForEvent(radioGroup, 'directory-entries-loaded');
      }
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
