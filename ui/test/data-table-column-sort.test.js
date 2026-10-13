/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-data-table/data-table-column-sort.js';

suite('nuxeo-data-table-column-sort', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-data-table-column-sort path="dc:title"></nuxeo-data-table-column-sort>
      `,
    );
  });

  const sortIcon = () => el.shadowRoot.getElementById('sortIcon');

  suite('_sortOrderChanged', () => {
    test('picks up the direction when this column is part of the sort order', () => {
      el.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      expect(el.direction).to.equal('asc');
    });

    test('follows the direction when it changes for this column', () => {
      el.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      el.sortOrder = [{ path: 'dc:title', direction: 'desc' }];
      expect(el.direction).to.equal('desc');
    });

    test('ignores directions belonging to other columns', () => {
      el.sortOrder = [{ path: 'dc:modified', direction: 'asc' }];
      expect(el.direction).to.be.null;
    });

    // ELEMENTS-2100
    test('clears the direction when this column is dropped from a replaced sort order', () => {
      el.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      expect(el.direction).to.equal('asc');

      // a saved content view being restored replaces sortOrder wholesale
      el.sortOrder = [{ path: 'dc:modified', direction: 'desc' }];
      expect(el.direction).to.be.null;
    });

    test('clears the direction when the sort order is emptied', () => {
      el.sortOrder = [{ path: 'dc:title', direction: 'desc' }];
      el.sortOrder = [];
      expect(el.direction).to.be.null;
    });

    test('clears the direction when this column is spliced out of the sort order', () => {
      el.sortOrder = [
        { path: 'dc:modified', direction: 'asc' },
        { path: 'dc:title', direction: 'asc' },
      ];
      expect(el.direction).to.equal('asc');

      el.splice('sortOrder', 1, 1);
      expect(el.direction).to.be.null;
    });

    test('keeps the direction when another column is spliced out', () => {
      el.sortOrder = [
        { path: 'dc:title', direction: 'desc' },
        { path: 'dc:modified', direction: 'asc' },
      ];
      el.splice('sortOrder', 1, 1);
      expect(el.direction).to.equal('desc');
    });

    test('clears the direction when the sort order is replaced with null', () => {
      el.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      el.sortOrder = null;
      expect(el.direction).to.be.null;
    });

    test('clears the direction when the sort order is replaced with undefined', () => {
      el.sortOrder = [{ path: 'dc:title', direction: 'desc' }];
      el.sortOrder = undefined;
      expect(el.direction).to.be.null;
    });

    test('clears the direction when the sort order is replaced with a non-array', () => {
      el.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      el.sortOrder = { 'dc:title': 'asc' };
      expect(el.direction).to.be.null;
    });

    test('does nothing when the change record carries no base', () => {
      el.direction = 'asc';
      el._sortOrderChanged({});
      expect(el.direction).to.equal('asc');
    });
  });

  suite('aria-label', () => {
    test('is dropped again once the direction is cleared', async () => {
      el.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      await flush();
      expect(sortIcon().getAttribute('aria-label')).to.equal('command.sort.ascend');

      el.sortOrder = [];
      await flush();
      expect(sortIcon().getAttribute('aria-label')).to.be.null;
    });

    test('is dropped along with the arrow when the sort order is cleared to null', async () => {
      el.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      await flush();
      expect(sortIcon().getAttribute('direction')).to.equal('asc');
      expect(sortIcon().getAttribute('aria-label')).to.equal('command.sort.ascend');

      el.sortOrder = null;
      await flush();
      expect(sortIcon().getAttribute('direction')).to.be.null;
      expect(sortIcon().getAttribute('aria-label')).to.be.null;
    });
  });

  suite('_order', () => {
    test('is empty while a single column is sorted', () => {
      el.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      expect(el.order).to.equal('');
    });

    test('is the 1-based position while several columns are sorted', () => {
      el.sortOrder = [
        { path: 'dc:modified', direction: 'asc' },
        { path: 'dc:title', direction: 'desc' },
      ];
      expect(el.order).to.equal('2');
    });

    test('is empty when this column is not part of a multi-column sort', () => {
      el.sortOrder = [
        { path: 'dc:modified', direction: 'asc' },
        { path: 'dc:created', direction: 'desc' },
      ];
      expect(el.order).to.equal('');
    });

    test('is empty when the sort order is not an array', () => {
      el.sortOrder = { 'dc:title': 'asc' };
      expect(el.order).to.equal('');
    });
  });
});
