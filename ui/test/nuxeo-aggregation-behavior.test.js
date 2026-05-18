/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

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
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { AggregationBehavior } from '../nuxeo-aggregation/nuxeo-aggregation-behavior.js';

window.Polymer = Polymer;

Polymer({
  is: 'nuxeo-aggregation-behavior-host',
  behaviors: [AggregationBehavior],
  i18n(key) {
    const dict = (window.nuxeo.I18n.en = window.nuxeo.I18n.en || {});
    return dict[key] || key;
  },
});

suite('Nuxeo.AggregationBehavior', () => {
  let host;
  let originalLanguage;

  setup(async () => {
    host = await fixture(html`
      <nuxeo-aggregation-behavior-host></nuxeo-aggregation-behavior-host>
    `);
    originalLanguage = window.nuxeo.I18n.language;
    window.nuxeo.I18n.language = 'en';
    window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
  });

  teardown(() => {
    window.nuxeo.I18n.language = originalLanguage;
  });

  test('_isEmpty defaults to true and follows extendedBuckets length', () => {
    expect(host._isEmpty).to.be.true;
    host.data = { extendedBuckets: [], selection: [] };
    expect(host._isEmpty).to.be.true;
    host.data = { extendedBuckets: [{ key: 'a', docCount: 1 }], selection: [] };
    expect(host._isEmpty).to.be.false;
    host.data = null;
    expect(host._isEmpty).to.be.true;
  });

  test('_computeBuckets adds checked + label and respects sortByLabel', () => {
    window.nuxeo.I18n.en['label.ui.aggregate.b'] = 'Bee';
    window.nuxeo.I18n.en['label.ui.aggregate.a'] = 'Ant';
    host.sortByLabel = true;
    host.data = {
      extendedBuckets: [
        { key: 'b', docCount: 2 },
        { key: 'a', docCount: 5 },
      ],
      selection: ['a'],
    };
    expect(host.buckets.map((b) => b.key)).to.deep.equal(['a', 'b']);
    expect(host.buckets.map((b) => b.checked)).to.deep.equal([true, false]);
    expect(host.buckets.map((b) => b.label)).to.deep.equal(['Ant', 'Bee']);
  });

  test('_computeBuckets without sortByLabel preserves the input order', () => {
    host.sortByLabel = false;
    host.data = {
      extendedBuckets: [
        { key: 'b', docCount: 2 },
        { key: 'a', docCount: 5 },
      ],
      selection: [],
    };
    expect(host.buckets.map((b) => b.key)).to.deep.equal(['b', 'a']);
  });

  test('_computeValues collects only the checked bucket keys', () => {
    host.data = {
      extendedBuckets: [
        { key: 'a', docCount: 1 },
        { key: 'b', docCount: 2 },
        { key: 'c', docCount: 3 },
      ],
      selection: ['a', 'c'],
    };
    host._computeValues();
    expect(host.value).to.deep.equal(['a', 'c']);
  });

  suite('_computeLabel', () => {
    test('uses i18n key when no fetchedKey exists, falls back to raw key', () => {
      window.nuxeo.I18n.en['label.ui.aggregate.foo'] = 'Foo!';
      expect(host._computeLabel({ key: 'foo' })).to.equal('Foo!');
      expect(host._computeLabel({ key: 'bar' })).to.equal('bar');
    });

    test('handles directoryEntry fetchedKey', () => {
      const item = {
        key: 'd1',
        fetchedKey: {
          'entity-type': 'directoryEntry',
          properties: { id: 'd1', label_en: 'Dir One' },
        },
      };
      expect(host._computeLabel(item)).to.equal('Dir One');
    });

    test('handles user fetchedKey', () => {
      const item = {
        key: 'u1',
        fetchedKey: {
          'entity-type': 'user',
          properties: { firstName: 'Ada', lastName: 'Lovelace' },
        },
      };
      expect(host._computeLabel(item)).to.equal('Ada Lovelace');
    });

    test('handles document fetchedKey using dc:title and a fallback', () => {
      window.nuxeo.I18n.en['aggregation.format.document.field.unknown'] = 'unknown';
      const docItem = {
        key: 'doc',
        fetchedKey: { 'entity-type': 'document', properties: { 'dc:title': 'My Doc' } },
      };
      expect(host._computeLabel(docItem)).to.equal('My Doc');

      const docNoTitle = {
        key: 'doc',
        fetchedKey: { 'entity-type': 'document', properties: {} },
      };
      expect(host._computeLabel(docNoTitle)).to.equal('unknown');
    });

    test('falls back to translation key when fetched entity is unknown', () => {
      const item = {
        key: 'mystery',
        fetchedKey: { 'entity-type': 'whatever', properties: {} },
      };
      expect(host._computeLabel(item)).to.equal('mystery');
    });
  });

  suite('labelForDirectoryEntry', () => {
    test('walks the parent chain and joins labels with /', () => {
      window.nuxeo.I18n.language = 'en';
      const entry = {
        properties: {
          id: 'leaf',
          label_en: 'Leaf',
          parent: {
            properties: {
              id: 'mid',
              label_en: 'Middle',
              parent: { properties: { id: 'root', label_en: 'Root' } },
            },
          },
        },
      };
      expect(host.labelForDirectoryEntry(entry)).to.equal('Root/Middle/Leaf');
    });

    test('honours language with regional code (e.g. fr-FR)', () => {
      window.nuxeo.I18n.language = 'fr-FR';
      const entry = { properties: { id: 'a', label_fr: 'France', label_en: 'England' } };
      expect(host.labelForDirectoryEntry(entry)).to.equal('France');
    });

    test('falls back to label, label_en or id when localized label is missing', () => {
      window.nuxeo.I18n.language = 'fr';
      const entry1 = { properties: { id: 'x', label: 'Generic' } };
      expect(host.labelForDirectoryEntry(entry1)).to.equal('Generic');
      const entry2 = { properties: { id: 'x', label_en: 'English' } };
      expect(host.labelForDirectoryEntry(entry2)).to.equal('English');
      const entry3 = { properties: { id: 'just-id' } };
      expect(host.labelForDirectoryEntry(entry3)).to.equal('just-id');
    });
  });

  suite('labelForUserEntry', () => {
    test('returns id when no properties present', () => {
      expect(host.labelForUserEntry({ id: 'u1' })).to.equal('u1');
    });

    test('uses firstName/lastName when both are non-empty', () => {
      expect(
        host.labelForUserEntry({
          id: 'u1',
          properties: { firstName: 'Grace', lastName: 'Hopper', username: 'ghopper' },
        }),
      ).to.equal('Grace Hopper');
    });

    test('falls back to username when first/last name are missing', () => {
      expect(host.labelForUserEntry({ id: 'u1', properties: { username: 'ghopper' } })).to.equal('ghopper');
      expect(
        host.labelForUserEntry({
          id: 'u1',
          properties: { firstName: '', lastName: 'Hopper', username: 'ghopper' },
        }),
      ).to.equal('ghopper');
    });
  });
});
