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
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-justified-grid/nuxeo-justified-grid.js';

suite('nuxeo-justified-grid', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-justified-grid style="height: 400px; width: 800px;">
        <template>
          <span>[[document.title]]</span>
        </template>
      </nuxeo-justified-grid>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.JustifiedGrid.is).to.equal('nuxeo-justified-grid');
  });

  test('should have default property values', () => {
    expect(Nuxeo.JustifiedGrid.properties.rowHeight.value).to.equal(196);
    expect(Nuxeo.JustifiedGrid.properties.page.value).to.equal(1);
    expect(Nuxeo.JustifiedGrid.properties.pageSize.value).to.equal(50);
  });

  suite('_fitItemsToWidth', () => {
    test('scales item dimensions to fit the grid width', () => {
      const item = { _view: { width: 100, height: 100 } };
      const row = el._fitItemsToWidth([item], 100, 200);
      expect(row[0]._view.width).to.equal(200);
      expect(row[0]._view.height).to.equal((200 * el.rowHeight) / 100);
    });
  });

  suite('_computeRows', () => {
    setup(() => {
      Object.defineProperty(el.$.list, 'offsetWidth', { value: 600, configurable: true });
    });

    test('returns no rows when items array is empty', () => {
      el.items = [];
      const rows = el._computeRows([]);
      expect(rows).to.have.lengthOf(0);
    });

    test('packs items into rows', () => {
      const item1 = { properties: { 'picture:info': { width: 200, height: 100 } } };
      const item2 = { properties: { 'picture:info': { width: 200, height: 100 } } };
      el.items = [item1, item2];
      const rows = el._computeRows([item1, item2]);
      expect(rows.length).to.be.at.least(1);
    });

    test('uses square fallback when picture info is missing', () => {
      const item = { properties: {} };
      el.items = [item];
      const rows = el._computeRows([item]);
      expect(rows.length).to.equal(1);
      expect(rows[0][0].size.width).to.equal(1);
      expect(rows[0][0].size.height).to.equal(1);
    });

    test('skips empty items', () => {
      const rows = el._computeRows([{}, {}, {}]);
      expect(rows).to.have.lengthOf(0);
    });
  });

  suite('selection helpers', () => {
    test('_check stops propagation when selection is disabled', () => {
      const event = { preventDefault: sinon.spy(), stopPropagation: sinon.spy() };
      el.selectionEnabled = false;
      el._check(event);
      expect(event.preventDefault).to.have.been.called;
      expect(event.stopPropagation).to.have.been.called;
    });

    test('_isIndexSelected returns false when item not selected', () => {
      el.items = [{ uid: 'a' }, { uid: 'b' }];
      el.selectedItems = [];
      expect(el._isIndexSelected(0)).to.be.false;
    });

    test('_isIndexSelected returns true for selected item', () => {
      const items = [{ uid: 'a' }, { uid: 'b' }];
      el.items = items;
      el.selectedItems = [items[1]];
      expect(el._isIndexSelected(1)).to.be.true;
    });

    test('_isSelected delegates to _isIndexSelected', () => {
      const items = [{ uid: 'a', _view: { index: 0 } }];
      el.items = items;
      el.selectedItems = [];
      expect(el._isSelected(items[0])).to.be.false;
    });

    test('_selectedItemsChanged sets selectionMode to true when items selected', () => {
      el.selectedItems = [{ uid: 'a' }];
      el._selectedItemsChanged();
      expect(el.selectionMode).to.be.true;
    });

    test('_selectedItemsChanged sets selectionMode to false when no items', () => {
      el.selectedItems = [];
      el._selectedItemsChanged();
      expect(el.selectionMode).to.be.false;
    });

    test('selectIndex is a no-op when selectionEnabled is false', () => {
      el.selectionEnabled = false;
      const spy = sinon.spy(el.$.selector, 'selectIndex');
      el.selectIndex(0);
      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('deselectItem is a no-op when selection is disabled', () => {
      el.selectionEnabled = false;
      const spy = sinon.spy(el.$.selector, 'deselect');
      el.deselectItem({ uid: 'a' });
      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('selectItems handles empty arrays', () => {
      el.selectionEnabled = true;
      const spy = sinon.spy(el.$.selector, 'select');
      el.selectItems([]);
      expect(spy).to.not.have.been.called;
      spy.restore();
    });
  });

  suite('reset and fetch', () => {
    test('reset clears items, rows, and page', () => {
      el.items = [{ uid: 'a' }];
      el.rows = [[{ uid: 'a' }]];
      el.page = 5;
      el.reset();
      expect(el.items).to.deep.equal([]);
      expect(el.rows).to.deep.equal([]);
      expect(el.page).to.equal(1);
    });
  });
});
