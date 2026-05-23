/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { PageProviderDisplayBehavior } from '../nuxeo-page-provider-display-behavior.js';

const b = PageProviderDisplayBehavior[1];

suite('PageProviderDisplayBehavior extras', () => {
  suite('_hasPageProvider', () => {
    test('returns true when nxProvider is an object', () => {
      const ctx = { nxProvider: {} };
      expect(b._hasPageProvider.call(ctx)).to.be.ok;
    });

    test('returns false when nxProvider is string', () => {
      const ctx = { nxProvider: 'pp' };
      expect(b._hasPageProvider.call(ctx)).to.be.false;
    });

    test('returns falsy when nxProvider is null', () => {
      const ctx = { nxProvider: null };
      expect(b._hasPageProvider.call(ctx)).to.not.be.ok;
    });
  });

  suite('_itemsChanged', () => {
    test('sets _isEmpty true when items is empty', () => {
      const ctx = { items: [] };
      b._itemsChanged.call(ctx);
      expect(ctx._isEmpty).to.be.true;
    });

    test('sets _isEmpty false when items has entries', () => {
      const ctx = { items: [{}] };
      b._itemsChanged.call(ctx);
      expect(ctx._isEmpty).to.be.false;
    });

    test('sets _isEmpty true when items is null', () => {
      const ctx = { items: null };
      b._itemsChanged.call(ctx);
      expect(ctx._isEmpty).to.be.true;
    });
  });

  suite('_isSelected', () => {
    test('returns false for null item', () => {
      expect(b._isSelected.call({}, null)).to.be.false;
    });

    test('returns true when selectAll active and not excluded', () => {
      const ctx = {
        _isSelectAllActive: true,
        _excludedItems: [],
      };
      expect(b._isSelected.call(ctx, { uid: '1' })).to.be.true;
    });

    test('returns false when selectAll active and excluded', () => {
      const ctx = {
        _isSelectAllActive: true,
        _excludedItems: ['1'],
      };
      expect(b._isSelected.call(ctx, { uid: '1' })).to.be.false;
    });

    test('returns true for multiSelection with item in selectedItems', () => {
      const item = { uid: '1' };
      const ctx = {
        _isSelectAllActive: false,
        multiSelection: true,
        selectedItems: [item],
        _excludedItems: [],
      };
      expect(b._isSelected.call(ctx, item)).to.be.true;
    });

    test('returns false for multiSelection without item', () => {
      const ctx = {
        _isSelectAllActive: false,
        multiSelection: true,
        selectedItems: [],
        _excludedItems: [],
      };
      expect(b._isSelected.call(ctx, { uid: '1' })).to.be.false;
    });

    test('returns true for single selection match', () => {
      const item = { uid: '1' };
      const ctx = {
        _isSelectAllActive: false,
        multiSelection: false,
        selectedItem: item,
        _excludedItems: [],
      };
      expect(b._isSelected.call(ctx, item)).to.be.true;
    });

    test('returns false for single selection no match', () => {
      const ctx = {
        _isSelectAllActive: false,
        multiSelection: false,
        selectedItem: { uid: '2' },
        _excludedItems: [],
      };
      expect(b._isSelected.call(ctx, { uid: '1' })).to.be.false;
    });
  });

  suite('_computeSelectAllStatus', () => {
    test('returns true when both enabled and active', () => {
      const ctx = { selectAllEnabled: true, _isSelectAllActive: true };
      expect(b._computeSelectAllStatus.call(ctx)).to.be.true;
    });

    test('returns false when not enabled', () => {
      const ctx = { selectAllEnabled: false, _isSelectAllActive: true };
      expect(b._computeSelectAllStatus.call(ctx)).to.be.false;
    });

    test('returns false when not active', () => {
      const ctx = { selectAllEnabled: true, _isSelectAllActive: false };
      expect(b._computeSelectAllStatus.call(ctx)).to.be.false;
    });
  });

  suite('_updateFlags', () => {
    test('sets size from items length', () => {
      const ctx = {
        items: [{}, {}, {}],
        selectedItems: [{}],
        _isSelectAllActive: false,
      };
      b._updateFlags.call(ctx);
      expect(ctx.size).to.equal(3);
      expect(ctx._isEmpty).to.be.false;
    });

    test('sets size 0 for non-array', () => {
      const ctx = {
        items: null,
        selectedItems: null,
        _isSelectAllActive: false,
      };
      b._updateFlags.call(ctx);
      expect(ctx.size).to.equal(0);
      expect(ctx._isEmpty).to.be.true;
    });

    test('sets _isSelectAllIndeterminate properly', () => {
      const ctx = {
        items: [{}, {}],
        selectedItems: [{}],
        _isSelectAllActive: true,
      };
      b._updateFlags.call(ctx);
      expect(ctx._isSelectAllIndeterminate).to.be.true;
    });
  });

  suite('_reset', () => {
    test('creates array of given size', () => {
      const ctx = {
        items: [],
        maxItems: 100,
        set: function(k, v) {
          this[k] = v;
        },
        clearSelection: sinon.stub(),
        _resize: sinon.stub(),
      };
      b._reset.call(ctx, 5);
      expect(ctx.items).to.have.length(5);
      expect(ctx._currentPage).to.equal(1);
    });

    test('clamps to maxItems', () => {
      const ctx = {
        items: [],
        maxItems: 3,
        set: function(k, v) {
          this[k] = v;
        },
        clearSelection: sinon.stub(),
        _resize: sinon.stub(),
      };
      b._reset.call(ctx, 10);
      expect(ctx.items).to.have.length(3);
    });

    test('resets with 0 size', () => {
      const ctx = {
        items: [1, 2],
        maxItems: 100,
        set: function(k, v) {
          this[k] = v;
        },
        clearSelection: sinon.stub(),
        _resize: sinon.stub(),
      };
      b._reset.call(ctx, 0);
      expect(ctx.items).to.deep.equal([]);
    });

    test('resets with null size', () => {
      const ctx = {
        items: [1, 2],
        maxItems: 100,
        set: function(k, v) {
          this[k] = v;
        },
        clearSelection: sinon.stub(),
        _resize: sinon.stub(),
      };
      b._reset.call(ctx, null);
      expect(ctx.items).to.deep.equal([]);
    });
  });

  suite('fetch', () => {
    test('resolves when no page provider', () => {
      const ctx = {
        nxProvider: null,
        _hasPageProvider: b._hasPageProvider,
      };
      const result = b.fetch.call(ctx);
      expect(result).to.be.a('promise');
    });
  });

  suite('_updateQuickFiltersAndBuckets', () => {
    test('sets buckets from aggregations when sort matches', () => {
      const ctx = {
        nxProvider: {
          quickFilters: null,
          sort: { 'dc:title': 'asc' },
        },
        quickFilters: null,
        set: sinon.stub(),
      };
      const response = {
        aggregations: {
          agg1: {
            field: 'dc:title',
            buckets: [{ key: 'a' }],
            properties: { order: 'key asc' },
          },
        },
      };
      b._updateQuickFiltersAndBuckets.call(ctx, response);
      expect(ctx.set).to.have.been.calledWith('buckets');
    });

    test('reverses buckets when order differs', () => {
      const ctx = {
        nxProvider: {
          quickFilters: null,
          sort: { 'dc:title': 'desc' },
        },
        quickFilters: null,
        set: sinon.stub(),
      };
      const response = {
        aggregations: {
          agg1: {
            field: 'dc:title',
            buckets: [{ key: 'a' }, { key: 'b' }],
            properties: { order: 'key asc' },
          },
        },
      };
      b._updateQuickFiltersAndBuckets.call(ctx, response);
    });

    test('skips aggregations with active quick filters', () => {
      const ctx = {
        nxProvider: {
          quickFilters: { f1: { active: true } },
          sort: { 'dc:title': 'asc' },
        },
        quickFilters: null,
        set: sinon.stub(),
      };
      const response = {
        aggregations: {
          agg1: {
            field: 'dc:title',
            buckets: [{ key: 'a' }],
            properties: { order: 'key asc' },
          },
        },
      };
      b._updateQuickFiltersAndBuckets.call(ctx, response);
      const bucketsArg = ctx.set.lastCall.args[1];
      expect(bucketsArg).to.deep.equal([]);
    });

    test('sets empty buckets when no aggregations', () => {
      const ctx = {
        nxProvider: { quickFilters: null, sort: {} },
        quickFilters: null,
        set: sinon.stub(),
      };
      b._updateQuickFiltersAndBuckets.call(ctx, {});
      const bucketsArg = ctx.set.lastCall.args[1];
      expect(bucketsArg).to.deep.equal([]);
    });
  });

  suite('_quickFiltersChangedDeep', () => {
    test('does not call quickFilterChanged when snapshot is same', () => {
      const ctx = {
        quickFilters: { f1: { active: true } },
        _lastQuickFiltersSnapshot: '0:true',
        paginable: true,
        _quickFilterChanged: sinon.stub(),
      };
      b._quickFiltersChangedDeep.call(ctx);
    });

    test('calls quickFilterChanged when snapshot differs', () => {
      const ctx = {
        quickFilters: { f1: { active: true } },
        _lastQuickFiltersSnapshot: '',
        paginable: true,
        _quickFilterChanged: sinon.stub(),
      };
      b._quickFiltersChangedDeep.call(ctx);
    });

    test('handles null quickFilters', () => {
      const ctx = {
        quickFilters: null,
        _lastQuickFiltersSnapshot: null,
        paginable: true,
        _quickFilterChanged: sinon.stub(),
      };
      b._quickFiltersChangedDeep.call(ctx);
    });
  });

  suite('_isIndexSelected', () => {
    test('returns true for multi with item in selected and not excluded', () => {
      const item = { uid: '1' };
      const ctx = {
        multiSelection: true,
        selectedItems: [item],
        items: [item],
        _isSelectAllActive: false,
        _excludedItems: [],
      };
      expect(b._isIndexSelected.call(ctx, 0)).to.be.true;
    });

    test('returns false for multi when excluded', () => {
      const item = { uid: '1' };
      const ctx = {
        multiSelection: true,
        selectedItems: [item],
        items: [item],
        _isSelectAllActive: false,
        _excludedItems: ['1'],
      };
      expect(b._isIndexSelected.call(ctx, 0)).to.be.false;
    });

    test('returns true for selectAll active, not excluded', () => {
      const item = { uid: '1' };
      const ctx = {
        multiSelection: true,
        selectedItems: [],
        items: [item],
        _isSelectAllActive: true,
        _excludedItems: ['2'],
      };
      expect(b._isIndexSelected.call(ctx, 0)).to.be.true;
    });

    test('returns true for single selection match', () => {
      const item = { uid: '1' };
      const ctx = {
        multiSelection: false,
        selectedItem: item,
        items: [item],
        _isSelectAllActive: false,
        _excludedItems: [],
      };
      expect(b._isIndexSelected.call(ctx, 0)).to.be.true;
    });

    test('returns false for single selection no match', () => {
      const ctx = {
        multiSelection: false,
        selectedItem: { uid: '2' },
        items: [{ uid: '1' }],
        _isSelectAllActive: false,
        _excludedItems: [],
      };
      expect(b._isIndexSelected.call(ctx, 0)).to.be.false;
    });

    test('returns false when items empty', () => {
      const ctx = {
        multiSelection: true,
        selectedItems: [],
        items: [],
        _isSelectAllActive: false,
        _excludedItems: [],
      };
      expect(b._isIndexSelected.call(ctx, 0)).to.be.false;
    });
  });

  suite('_nxProviderChanged', () => {
    test('resolves string provider from __dataHost', () => {
      const pp = { pageSize: 10 };
      const ctx = {
        __dataHost: { $: { myPP: pp } },
        nxProvider: null,
        listen: sinon.stub(),
      };
      b._nxProviderChanged.call(ctx, 'myPP');
      expect(ctx.nxProvider).to.equal(pp);
    });

    test('sets up listeners for object provider', () => {
      const pp = { pageSize: 20 };
      const ctx = {
        nxProvider: pp,
        listen: sinon.stub(),
        _pageSize: null,
      };
      b._nxProviderChanged.call(ctx, pp);
      expect(ctx._pageSize).to.equal(20);
      expect(ctx.listen).to.have.been.calledTwice;
    });

    test('no-op for falsy', () => {
      const ctx = { listen: sinon.stub() };
      b._nxProviderChanged.call(ctx, null);
      expect(ctx.listen).to.not.have.been.called;
    });
  });

  suite('_selected', () => {
    test('handles numeric index', () => {
      const item = { uid: '1' };
      const ctx = {
        items: [item],
        selectAllActive: false,
        _excludedItems: [],
        deselectIndex: sinon.stub(),
        selectItem: sinon.stub(),
        _lastSelectedIndex: undefined,
      };
      b._selected.call(ctx, { detail: { index: 0 } });
      expect(ctx._lastSelectedIndex).to.equal(0);
    });

    test('handles shift selection', () => {
      const items = [{ uid: '1' }, { uid: '2' }, { uid: '3' }];
      const ctx = {
        items,
        selectAllActive: false,
        _excludedItems: [],
        _lastSelectedIndex: 0,
        deselectIndex: sinon.stub(),
        selectItem: sinon.stub(),
      };
      b._selected.call(ctx, { detail: { index: 2, shiftKey: true } });
      expect(ctx.selectItem).to.have.been.called;
    });

    test('adds to excludedItems when selectAllActive', () => {
      const item = { uid: '1' };
      const ctx = {
        items: [item],
        selectAllActive: true,
        _excludedItems: [],
        _lastSelectedIndex: undefined,
        push: sinon.stub(),
      };
      b._selected.call(ctx, { detail: { index: 0 } });
      expect(ctx.push).to.have.been.calledWith('_excludedItems', '1');
    });

    test('removes from excludedItems when already excluded', () => {
      const item = { uid: '1' };
      const ctx = {
        items: [item],
        selectAllActive: true,
        _excludedItems: ['1'],
        _lastSelectedIndex: undefined,
        push: sinon.stub(),
      };
      b._selected.call(ctx, { detail: { index: 0 } });
    });
  });

  suite('_toggleSelectAll', () => {
    test('calls clearSelection when active and no excluded', () => {
      const ctx = {
        _excludedItems: [],
        selectAllActive: true,
        clearSelection: sinon.stub(),
        selectAll: sinon.stub(),
      };
      b._toggleSelectAll.call(ctx);
      expect(ctx.clearSelection).to.have.been.called;
    });

    test('calls selectAll when not active', () => {
      const ctx = {
        _excludedItems: [],
        selectAllActive: false,
        clearSelection: sinon.stub(),
        selectAll: sinon.stub(),
      };
      b._toggleSelectAll.call(ctx);
      expect(ctx.selectAll).to.have.been.called;
    });

    test('calls selectAll when excluded items exist', () => {
      const ctx = {
        _excludedItems: ['1'],
        selectAllActive: true,
        clearSelection: sinon.stub(),
        selectAll: sinon.stub(),
      };
      b._toggleSelectAll.call(ctx);
      expect(ctx.selectAll).to.have.been.called;
    });
  });

  suite('selectItem / deselectItem / selectIndex / deselectIndex', () => {
    test('selectItem no-op when selection disabled', () => {
      const list = { selectItem: sinon.stub() };
      const ctx = { selectionEnabled: false, $: { list }, _updateFlags: sinon.stub() };
      b.selectItem.call(ctx, {});
      expect(list.selectItem).to.not.have.been.called;
    });

    test('deselectItem no-op when selection disabled', () => {
      const list = { deselectItem: sinon.stub() };
      const ctx = { selectionEnabled: false, $: { list }, _updateFlags: sinon.stub() };
      b.deselectItem.call(ctx, {});
      expect(list.deselectItem).to.not.have.been.called;
    });

    test('selectIndex delegates to list', () => {
      const list = { selectIndex: sinon.stub() };
      const ctx = { selectionEnabled: true, $: { list }, _updateFlags: sinon.stub() };
      b.selectIndex.call(ctx, 0);
      expect(list.selectIndex).to.have.been.calledWith(0);
    });

    test('deselectIndex delegates to list', () => {
      const list = { deselectIndex: sinon.stub() };
      const ctx = { selectionEnabled: true, $: { list }, _updateFlags: sinon.stub() };
      b.deselectIndex.call(ctx, 0);
      expect(list.deselectIndex).to.have.been.calledWith(0);
    });
  });

  suite('selectItems', () => {
    test('selects all items in array', () => {
      const list = { selectItem: sinon.stub() };
      const ctx = {
        selectionEnabled: true,
        $: { list },
        selectItem: sinon.stub(),
        _updateFlags: sinon.stub(),
      };
      b.selectItems.call(ctx, [{}, {}]);
    });

    test('no-op for empty array', () => {
      const ctx = { selectionEnabled: true, _updateFlags: sinon.stub() };
      b.selectItems.call(ctx, []);
    });

    test('no-op for null', () => {
      const ctx = { selectionEnabled: true, _updateFlags: sinon.stub() };
      b.selectItems.call(ctx, null);
    });

    test('no-op when not enabled', () => {
      const ctx = { selectionEnabled: false, _updateFlags: sinon.stub() };
      b.selectItems.call(ctx, [{}]);
    });
  });

  suite('_resetResults', () => {
    test('resets when has provider', () => {
      const ctx = {
        _hasPageProvider: () => true,
        _reset: sinon.stub(),
      };
      b._resetResults.call(ctx);
      expect(ctx._reset).to.have.been.calledWith(0);
    });

    test('no-op without provider', () => {
      const ctx = {
        _hasPageProvider: () => false,
        _reset: sinon.stub(),
      };
      b._resetResults.call(ctx);
      expect(ctx._reset).to.not.have.been.called;
    });
  });

  suite('_updateResults', () => {
    test('sets size from items when has provider', () => {
      const ctx = {
        _hasPageProvider: () => true,
        items: [1, 2, 3],
        size: 0,
      };
      b._updateResults.call(ctx);
      expect(ctx.size).to.equal(3);
    });

    test('no-op without provider', () => {
      const ctx = {
        _hasPageProvider: () => false,
        items: [1, 2, 3],
        size: 0,
      };
      b._updateResults.call(ctx);
      expect(ctx.size).to.equal(0);
    });
  });
});
