/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-quick-filters/nuxeo-quick-filters.js';

suite('nuxeo-quick-filters extras', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-quick-filters></nuxeo-quick-filters>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.QuickFilters.is).to.equal('nuxeo-quick-filters');
  });

  suite('_computeFilterLabel', () => {
    test('returns an i18n key string for filter name', () => {
      const label = el._computeFilterLabel({ name: 'recent' });
      expect(label).to.be.a('string');
      expect(label).to.include('quickFilters');
    });
  });

  suite('_selectFilter', () => {
    setup(() => {
      el.quickFilters = [
        { name: 'recent', active: false },
        { name: 'starred', active: true },
        { name: 'shared', active: false },
      ];
    });

    test('toggles active flag on matching filter', () => {
      const event = { model: { filter: { name: 'recent' } } };
      el._selectFilter(event);
      expect(el.quickFilters[0].active).to.be.true;
      expect(el.quickFilters[1].active).to.be.true;
      expect(el.quickFilters[2].active).to.be.false;
    });

    test('toggles already-active filter off', () => {
      const event = { model: { filter: { name: 'starred' } } };
      el._selectFilter(event);
      expect(el.quickFilters[1].active).to.be.false;
    });

    test('does not change anything when filter is not found', () => {
      const event = { model: { filter: { name: 'missing' } } };
      el._selectFilter(event);
      expect(el.quickFilters[0].active).to.be.false;
      expect(el.quickFilters[1].active).to.be.true;
      expect(el.quickFilters[2].active).to.be.false;
    });
  });

  test('renders one button per quickFilter', async () => {
    el.quickFilters = [
      { name: 'recent', active: false },
      { name: 'starred', active: true },
    ];
    await flush();
    const buttons = el.shadowRoot.querySelectorAll('paper-button');
    expect(buttons.length).to.equal(2);
  });
});
