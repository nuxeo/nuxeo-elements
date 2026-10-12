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
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { html as polymerHtml } from '@polymer/polymer/lib/utils/html-tag.js';
import { PageProviderDisplayBehavior } from '../nuxeo-page-provider-display-behavior.js';

window.Polymer = Polymer;

function mockList() {
  return {
    selectionEnabled: false,
    multiSelection: false,
    selectedItems: [],
    selectedItem: null,
    selectedAs: 'selected',
    firstVisibleIndex: 0,
    lastVisibleIndex: 9,
    selectItem: sinon.stub(),
    selectIndex: sinon.stub(),
    deselectItem: sinon.stub(),
    deselectIndex: sinon.stub(),
    clearSelection: sinon.stub(),
    toggleSelectionForItem: sinon.stub(),
    notifyResize: sinon.stub(),
    scrollToItem: sinon.stub(),
    scrollToIndex: sinon.stub(),
    _isIndexVisible: sinon.stub().returns(true),
    _isIndexRendered: sinon.stub().returns(false),
    _physicalItems: [],
    _getPhysicalIndex: sinon.stub().returns(0),
    listen: sinon.stub(),
    unlisten: sinon.stub(),
    $: {
      selector: {
        isSelected: sinon.stub().returns(false),
        __selectedMap: new Map(),
      },
    },
    modelForElement: sinon.stub().returns(null),
  };
}

const PPDHost = Polymer({
  is: 'nuxeo-ppd-behavior-host',
  _template: polymerHtml`
    <div id="list"></div>
  `,
  behaviors: [PageProviderDisplayBehavior],
  i18n(key) {
    return key;
  },
  listen() {},
  unlisten() {},
  fire(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
  },
  notifyResize() {},
});

PPDHost.prototype.__origSelectionEnabledChanged = PPDHost.prototype._selectionEnabledChanged;
PPDHost.prototype._selectionEnabledChanged = function _selectionEnabledChanged() {
  if (!this.$ || !this.$.list || !this.$.list.unlisten) {
    return;
  }
  this.__origSelectionEnabledChanged();
};

function installListMock(el) {
  const ml = mockList();
  el.$.list = ml;
}

function makeProvider(overrides) {
  return Object.assign(
    {
      loading: false,
      pageSize: 10,
      page: 1,
      offset: 0,
      resultsCount: 0,
      sort: {},
      params: {},
      auto: false,
      quickFilters: null,
      currentPageIndex: 0,
      fetch: sinon.stub().resolves({ entries: [], resultsCount: 0 }),
    },
    overrides,
  );
}

function items(n) {
  return Array.from({ length: n }, (_, i) => {
    return { uid: `uid-${i}`, title: `item-${i}` };
  });
}

suite('PageProviderDisplayBehavior', () => {
  let host;

  setup(async () => {
    host = await fixture(
      html`
        <nuxeo-ppd-behavior-host></nuxeo-ppd-behavior-host>
      `,
    );
    installListMock(host);
    host.selectionEnabled = true;
    host.multiSelection = true;
    host.items = [];
    host.selectedItems = [];
    host.selectedItem = null;
    host._excludedItems = [];
    host._isSelectAllActive = false;
    host.filters = [];
    host.sortOrder = [];
    host._ppSort = {};
  });

  suite('_nxProviderChanged', () => {
    test('resolves string provider via querySelector on parent', () => {
      const fakeProvider = makeProvider();
      const parent = host.parentNode;
      const stub = sinon.stub(parent, 'querySelector').returns(fakeProvider);
      host._nxProviderChanged('myProvider');
      expect(stub).to.have.been.calledOnce;
      stub.restore();
    });

    test('listens on provider when given an object', () => {
      const prov = makeProvider();
      const listenSpy = sinon.spy(host, 'listen');
      host.nxProvider = prov;
      host._nxProviderChanged(prov);
      expect(host._pageSize).to.equal(10);
      expect(listenSpy).to.have.been.calledWith(prov, 'loading-changed', '_updateLoading');
      expect(listenSpy).to.have.been.calledWith(prov, 'update', '_updateResults');
      listenSpy.restore();
    });

    test('does nothing when nxProvider is falsy', () => {
      const listenSpy = sinon.spy(host, 'listen');
      host._nxProviderChanged(null);
      expect(listenSpy).not.to.have.been.called;
      listenSpy.restore();
    });
  });

  suite('_updateLoading', () => {
    test('sets loading from provider', () => {
      host.nxProvider = makeProvider({ loading: true });
      host._updateLoading();
      expect(host.loading).to.be.true;
      host.nxProvider.loading = false;
      host._updateLoading();
      expect(host.loading).to.be.false;
    });
  });

  suite('_hasPageProvider', () => {
    test('returns true when nxProvider is an object', () => {
      host.nxProvider = makeProvider();
      expect(host._hasPageProvider()).to.be.true;
    });

    test('returns falsy when nxProvider is a string', () => {
      host.nxProvider = 'someId';
      expect(host._hasPageProvider()).to.not.be.ok;
    });

    test('returns falsy when nxProvider is null', () => {
      host.nxProvider = null;
      expect(host._hasPageProvider()).to.not.be.ok;
    });
  });

  suite('_resetResults', () => {
    test('calls _reset(0) when provider is present', () => {
      host.nxProvider = makeProvider();
      const spy = sinon.spy(host, '_reset');
      host._resetResults();
      expect(spy).to.have.been.calledWith(0);
      spy.restore();
    });

    test('does nothing without provider', () => {
      host.nxProvider = null;
      const spy = sinon.spy(host, '_reset');
      host._resetResults();
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });

  suite('_updateResults', () => {
    // Table-driven fetch: items are populated by the fetch handler, so _updateResults only syncs size.
    test('sets size to items length for a table-initiated fetch', () => {
      host.nxProvider = makeProvider();
      host.items = items(5);
      host._pendingTableFetches = 1;
      host._updateResults();
      expect(host.size).to.equal(5);
    });

    // Provider-driven fetch (e.g. `auto`): results must be synced from the provider into the table. (WEBUI-2121)
    test('loads results from the provider for a provider-initiated fetch (auto)', () => {
      host.nxProvider = makeProvider({ auto: true, currentPage: items(3), resultsCount: 3 });
      host.items = [];
      host._pendingTableFetches = 0;
      const spy = sinon.spy(host, '_displayProviderResults');
      host._updateResults();
      expect(spy).to.have.been.calledOnce;
      expect(host.items).to.have.lengthOf(3);
      expect(host._isEmpty).to.be.false;
      spy.restore();
    });

    // Guards against a superseded fetch: an earlier aborted fetch decrements the counter, but while a
    // newer table-initiated fetch is still in flight (counter > 0) its update must NOT be treated as
    // provider-initiated. A single boolean would be wrongly cleared here. (WEBUI-2121 review)
    test('keeps a provider update table-initiated while another table fetch is still pending', () => {
      host.nxProvider = makeProvider({ currentPage: items(3), resultsCount: 3 });
      host.items = items(3);
      host._pendingTableFetches = 1;
      const spy = sinon.spy(host, '_displayProviderResults');
      host._updateResults();
      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('does nothing without provider', () => {
      host.size = 99;
      host.nxProvider = null;
      host._updateResults();
      expect(host.size).not.to.equal(5);
    });
  });

  suite('_displayProviderResults', () => {
    test('fills items from the provider currentPage (non-paginable)', () => {
      host.nxProvider = makeProvider({ currentPage: items(3), resultsCount: 3 });
      host.paginable = false;
      host.items = [];
      host._displayProviderResults();
      expect(host.items).to.have.lengthOf(3);
      expect(host.size).to.equal(3);
    });

    test('fills items from the provider currentPage (paginable)', () => {
      host.nxProvider = makeProvider({ currentPage: items(2), resultsCount: 2 });
      host.paginable = true;
      host.items = [];
      host._displayProviderResults();
      expect(host.items).to.have.lengthOf(2);
      expect(host._last).to.equal(1);
    });

    test('reuses the items array when the count is unchanged', () => {
      host.nxProvider = makeProvider({ currentPage: items(3), resultsCount: 3 });
      host.paginable = false;
      host.items = items(3);
      const resetSpy = sinon.spy(host, 'reset');
      host._displayProviderResults();
      expect(resetSpy).to.not.have.been.called;
      expect(host.items).to.have.lengthOf(3);
      resetSpy.restore();
    });

    test('handles an empty provider currentPage', () => {
      host.nxProvider = makeProvider({ resultsCount: 0 });
      host.paginable = false;
      host.items = items(2);
      host._displayProviderResults();
      expect(host.items).to.have.lengthOf(0);
      expect(host._isEmpty).to.be.true;
    });
  });

  suite('_itemsChanged', () => {
    test('sets _isEmpty true when items is empty', () => {
      host.items = [];
      host._itemsChanged();
      expect(host._isEmpty).to.be.true;
    });

    test('sets _isEmpty false when items has entries', () => {
      host.items = items(3);
      host._itemsChanged();
      expect(host._isEmpty).to.be.false;
    });

    test('sets _isEmpty true when items is null', () => {
      host.items = null;
      host._itemsChanged();
      expect(host._isEmpty).to.be.true;
    });
  });

  suite('_selected', () => {
    test('records _lastSelectedIndex for numeric index', () => {
      host.items = items(5);
      host._selected({ detail: { index: 2 } });
      expect(host._lastSelectedIndex).to.equal(2);
    });

    test('shift-select range selects items between last and current', () => {
      host.items = items(5);
      host._lastSelectedIndex = 1;
      const spy = sinon.spy(host, 'selectItem');
      host._selected({ detail: { index: 3, shiftKey: true } });
      expect(spy).to.have.been.calledWith(host.items[1]);
      expect(spy).to.have.been.calledWith(host.items[2]);
      spy.restore();
    });

    test('shift-select deselects index if item has no uid', () => {
      host.items = [{ uid: 'a' }, { uid: 'b' }, {}, { uid: 'd' }];
      host._lastSelectedIndex = 0;
      const spy = sinon.spy(host, 'deselectIndex');
      host._selected({ detail: { index: 2, shiftKey: true } });
      expect(spy).to.have.been.calledWith(2);
      spy.restore();
    });

    test('shift-select with reverse range (index < last)', () => {
      host.items = items(5);
      host._lastSelectedIndex = 3;
      const spy = sinon.spy(host, 'selectItem');
      host._selected({ detail: { index: 1, shiftKey: true } });
      expect(spy).to.have.been.calledWith(host.items[1]);
      expect(spy).to.have.been.calledWith(host.items[2]);
      spy.restore();
    });

    test('adds to excludedItems when selectAllActive and item not excluded', () => {
      host.items = items(5);
      host._isSelectAllActive = true;
      host.selectAllEnabled = true;
      host._excludedItems = [];
      host._selected({ detail: { index: 2 } });
      expect(host._excludedItems).to.include('uid-2');
    });

    test('removes from excludedItems when selectAllActive and item already excluded', () => {
      host.items = items(5);
      host._isSelectAllActive = true;
      host.selectAllEnabled = true;
      host._excludedItems = ['uid-2'];
      host._selected({ detail: { index: 2 } });
      expect(host._excludedItems).not.to.include('uid-2');
    });

    test('does nothing for non-numeric index', () => {
      const prev = host._lastSelectedIndex;
      host._selected({ detail: { index: 'abc' } });
      expect(host._lastSelectedIndex).to.equal(prev);
    });
  });

  suite('selectItem / selectIndex / selectItems', () => {
    test('selectItem delegates to list when selectionEnabled', () => {
      host.selectionEnabled = true;
      const item = { uid: 'x' };
      host.selectItem(item);
      expect(host.$.list.selectItem).to.have.been.calledWith(item);
    });

    test('selectItem is a no-op when selectionEnabled is false', () => {
      host.selectionEnabled = false;
      host.selectItem({ uid: 'x' });
      expect(host.$.list.selectItem).not.to.have.been.called;
    });

    test('selectIndex delegates to list when selectionEnabled', () => {
      host.selectionEnabled = true;
      host.selectIndex(3);
      expect(host.$.list.selectIndex).to.have.been.calledWith(3);
    });

    test('selectIndex is a no-op when selectionEnabled is false', () => {
      host.selectionEnabled = false;
      host.selectIndex(3);
      expect(host.$.list.selectIndex).not.to.have.been.called;
    });

    test('selectItems delegates each item to list.selectItem', () => {
      host.selectionEnabled = true;
      const list = items(3);
      host.selectItems(list);
      expect(host.$.list.selectItem.callCount).to.equal(3);
    });

    test('selectItems is a no-op with empty array', () => {
      host.selectionEnabled = true;
      host.$.list.selectItem.resetHistory();
      host.selectItems([]);
      expect(host.$.list.selectItem).not.to.have.been.called;
    });

    test('selectItems is a no-op when selectionEnabled is false', () => {
      host.selectionEnabled = false;
      host.$.list.selectItem.resetHistory();
      host.selectItems(items(2));
      expect(host.$.list.selectItem).not.to.have.been.called;
    });
  });

  suite('deselectItem / deselectIndex', () => {
    test('deselectItem delegates to list when selectionEnabled', () => {
      host.selectionEnabled = true;
      const item = { uid: 'x' };
      host.deselectItem(item);
      expect(host.$.list.deselectItem).to.have.been.calledWith(item);
    });

    test('deselectItem is a no-op when selectionEnabled is false', () => {
      host.selectionEnabled = false;
      host.deselectItem({ uid: 'x' });
      expect(host.$.list.deselectItem).not.to.have.been.called;
    });

    test('deselectIndex delegates to list when selectionEnabled', () => {
      host.selectionEnabled = true;
      host.deselectIndex(1);
      expect(host.$.list.deselectIndex).to.have.been.calledWith(1);
    });

    test('deselectIndex is a no-op when selectionEnabled is false', () => {
      host.selectionEnabled = false;
      host.deselectIndex(1);
      expect(host.$.list.deselectIndex).not.to.have.been.called;
    });
  });

  suite('selectAll', () => {
    test('selects all when selectionEnabled and selectAllEnabled', () => {
      host.selectionEnabled = true;
      host.selectAllEnabled = true;
      host.items = items(3);
      host.$.list.firstVisibleIndex = 0;
      host.$.list.lastVisibleIndex = 2;
      host.selectAll();
      expect(host._isSelectAllActive).to.be.true;
      expect(host._excludedItems).to.deep.equal([]);
    });

    test('does nothing when selectionEnabled is false', () => {
      host.selectionEnabled = false;
      host.selectAllEnabled = true;
      host.selectAll();
      expect(host._isSelectAllActive).to.be.false;
    });

    test('does nothing when selectAllEnabled is false', () => {
      host.selectionEnabled = true;
      host.selectAllEnabled = false;
      host.selectAll();
      expect(host._isSelectAllActive).to.be.false;
    });
  });

  suite('clearSelection', () => {
    test('clears all selection state', () => {
      host._isSelectAllActive = true;
      host._excludedItems = ['uid-1'];
      host.clearSelection();
      expect(host._isSelectAllActive).to.be.false;
      expect(host._excludedItems).to.deep.equal([]);
      expect(host.$.list.clearSelection).to.have.been.called;
    });
  });

  suite('_computeSelectAllStatus', () => {
    test('returns true when selectAllEnabled and _isSelectAllActive', () => {
      host.selectAllEnabled = true;
      host._isSelectAllActive = true;
      expect(host._computeSelectAllStatus()).to.be.true;
    });

    test('returns false when selectAllEnabled is false', () => {
      host.selectAllEnabled = false;
      host._isSelectAllActive = true;
      expect(host._computeSelectAllStatus()).to.be.false;
    });

    test('returns false when _isSelectAllActive is false', () => {
      host.selectAllEnabled = true;
      host._isSelectAllActive = false;
      expect(host._computeSelectAllStatus()).to.be.false;
    });
  });

  suite('_isSelected', () => {
    test('returns false for null item', () => {
      expect(host._isSelected(null)).to.be.false;
    });

    test('returns true when selectAllActive and item not excluded', () => {
      host._isSelectAllActive = true;
      host._excludedItems = [];
      expect(host._isSelected({ uid: 'uid-0' })).to.be.true;
    });

    test('returns false when selectAllActive and item is excluded', () => {
      host._isSelectAllActive = true;
      host._excludedItems = ['uid-0'];
      expect(host._isSelected({ uid: 'uid-0' })).to.be.false;
    });

    test('returns true in multiSelection when item is in selectedItems', () => {
      host._isSelectAllActive = false;
      host.multiSelection = true;
      const item = { uid: 'uid-0' };
      host.selectedItems = [item];
      expect(host._isSelected(item)).to.be.true;
    });

    test('returns false in multiSelection when item is not in selectedItems', () => {
      host._isSelectAllActive = false;
      host.multiSelection = true;
      host.selectedItems = [{ uid: 'other' }];
      expect(host._isSelected({ uid: 'uid-0' })).to.be.false;
    });

    test('returns true in single selection when item matches selectedItem', () => {
      host._isSelectAllActive = false;
      host.multiSelection = false;
      const item = { uid: 'uid-0' };
      host.selectedItem = item;
      expect(host._isSelected(item)).to.be.true;
    });

    test('returns false in single selection when item does not match', () => {
      host._isSelectAllActive = false;
      host.multiSelection = false;
      host.selectedItem = { uid: 'other' };
      expect(host._isSelected({ uid: 'uid-0' })).to.be.false;
    });

    test('returns false when selectedItems is empty in multiSelection', () => {
      host._isSelectAllActive = false;
      host.multiSelection = true;
      host.selectedItems = [];
      expect(host._isSelected({ uid: 'uid-0' })).to.be.false;
    });

    test('returns false when selectedItem is null in single selection', () => {
      host._isSelectAllActive = false;
      host.multiSelection = false;
      host.selectedItem = null;
      expect(host._isSelected({ uid: 'uid-0' })).to.be.false;
    });
  });

  suite('_isIndexSelected', () => {
    test('returns true in multiSelection when index item is in selectedItems', () => {
      host.multiSelection = true;
      const list = items(3);
      host.items = list;
      host.selectedItems = [list[1]];
      host._excludedItems = [];
      expect(host._isIndexSelected(1)).to.be.true;
    });

    test('returns false when index is out of bounds', () => {
      host.multiSelection = true;
      host.items = items(2);
      host.selectedItems = [];
      host._excludedItems = [];
      expect(host._isIndexSelected(5)).to.be.false;
    });

    test('returns false when item at index is excluded', () => {
      host.multiSelection = true;
      const list = items(3);
      host.items = list;
      host.selectedItems = [list[1]];
      host._excludedItems = ['uid-1'];
      expect(host._isIndexSelected(1)).to.be.false;
    });

    test('returns true via selectAllActive path with non-excluded item', () => {
      host.multiSelection = true;
      host._isSelectAllActive = true;
      host.items = items(3);
      host.selectedItems = [];
      host._excludedItems = ['uid-0'];
      expect(host._isIndexSelected(1)).to.be.true;
    });

    test('returns false via selectAllActive when item is excluded', () => {
      host.multiSelection = true;
      host._isSelectAllActive = true;
      host.items = items(3);
      host.selectedItems = [];
      host._excludedItems = ['uid-1'];
      expect(host._isIndexSelected(1)).to.be.false;
    });

    test('single selection: returns true when selectedItem matches', () => {
      host.multiSelection = false;
      const list = items(3);
      host.items = list;
      host.selectedItem = list[2];
      expect(host._isIndexSelected(2)).to.be.true;
    });

    test('single selection: returns false when selectedItem does not match', () => {
      host.multiSelection = false;
      const list = items(3);
      host.items = list;
      host.selectedItem = list[0];
      expect(host._isIndexSelected(2)).to.be.false;
    });

    test('single selection: returns false when selectedItem is null', () => {
      host.multiSelection = false;
      host.items = items(3);
      host.selectedItem = null;
      expect(host._isIndexSelected(0)).to.be.false;
    });
  });

  suite('_toggleSelectAll', () => {
    test('calls clearSelection when selectAllActive and no exclusions', () => {
      host.selectAllEnabled = true;
      host._isSelectAllActive = true;
      host._excludedItems = [];
      const spy = sinon.spy(host, 'clearSelection');
      host._toggleSelectAll();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('calls selectAll when not fully selected', () => {
      host.selectionEnabled = true;
      host.selectAllEnabled = true;
      host._isSelectAllActive = false;
      host._excludedItems = [];
      host.items = items(3);
      host.$.list.firstVisibleIndex = 0;
      host.$.list.lastVisibleIndex = 2;
      const spy = sinon.spy(host, 'selectAll');
      host._toggleSelectAll();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('calls selectAll when there are exclusions', () => {
      host.selectionEnabled = true;
      host.selectAllEnabled = true;
      host._isSelectAllActive = true;
      host._excludedItems = ['uid-1'];
      host.items = items(3);
      host.$.list.firstVisibleIndex = 0;
      host.$.list.lastVisibleIndex = 2;
      const spy = sinon.spy(host, 'selectAll');
      host._toggleSelectAll();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });
  });

  suite('_selectionEnabledChanged', () => {
    test('sets selectionEnabled and multiSelection on list', () => {
      host.selectionEnabled = true;
      host.multiSelection = true;
      host._selectionEnabledChanged();
      expect(host.$.list.selectionEnabled).to.be.true;
      expect(host.$.list.multiSelection).to.be.true;
    });

    test('unlisten selected and listen when selectionEnabled and !selectOnTap', () => {
      host.selectionEnabled = true;
      host.selectOnTap = false;
      host._selectionEnabledChanged();
      expect(host.$.list.unlisten).to.have.been.called;
      expect(host.$.list.listen).to.have.been.called;
    });

    test('only unlisten when selectOnTap is true', () => {
      host.selectionEnabled = true;
      host.selectOnTap = true;
      host.$.list.unlisten.resetHistory();
      host.$.list.listen.resetHistory();
      host._selectionEnabledChanged();
      expect(host.$.list.unlisten).to.have.been.called;
      expect(host.$.list.listen).not.to.have.been.called;
    });

    test('only unlisten when selectionEnabled is false', () => {
      host.selectionEnabled = false;
      host.selectOnTap = false;
      host.$.list.unlisten.resetHistory();
      host.$.list.listen.resetHistory();
      host._selectionEnabledChanged();
      expect(host.$.list.unlisten).to.have.been.called;
      expect(host.$.list.listen).not.to.have.been.called;
    });
  });

  suite('_sortDirectionChanged', () => {
    setup(() => {
      host.nxProvider = makeProvider();
      host.sortOrder = [];
      host._ppSort = {};
      host._fireSettingsChanged = sinon.stub();
    });

    test('adds a new sort entry and triggers fetch', () => {
      const spy = sinon.spy(host, 'fetch');
      host._sortDirectionChanged({ detail: { path: 'dc:title', direction: 'asc' } });
      expect(host.sortOrder).to.have.lengthOf(1);
      expect(host.sortOrder[0]).to.deep.equal({ path: 'dc:title', direction: 'asc' });
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('updates existing sort entry direction', () => {
      host.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      host._ppSort = { 'dc:title': 'asc' };
      host._sortDirectionChanged({ detail: { path: 'dc:title', direction: 'desc' } });
      expect(host._ppSort).to.deep.equal({ 'dc:title': 'desc' });
    });

    test('removes sort entry when direction is falsy', () => {
      host.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      host._ppSort = { 'dc:title': 'asc' };
      host._sortDirectionChanged({ detail: { path: 'dc:title', direction: '' } });
      expect(host.sortOrder).to.have.lengthOf(0);
    });

    test('does not fetch when sort has not changed', () => {
      host.sortOrder = [{ path: 'dc:title', direction: 'asc' }];
      host._ppSort = { 'dc:title': 'asc' };
      const spy = sinon.spy(host, 'fetch');
      host._sortDirectionChanged({ detail: { path: 'dc:title', direction: 'asc' } });
      expect(spy).not.to.have.been.called;
      spy.restore();
    });

    test('does not fetch when provider has auto=true', () => {
      host.nxProvider.auto = true;
      const spy = sinon.spy(host, 'fetch');
      host._sortDirectionChanged({ detail: { path: 'dc:title', direction: 'asc' } });
      expect(spy).not.to.have.been.called;
      spy.restore();
    });

    test('does nothing without a page provider', () => {
      host.nxProvider = null;
      const spy = sinon.spy(host, 'fetch');
      host._sortDirectionChanged({ detail: { path: 'dc:title', direction: 'asc' } });
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });

  suite('_onColumnFilterChanged', () => {
    setup(() => {
      host.nxProvider = makeProvider();
      host.filters = [];
    });

    test('adds a new filter and fetches', () => {
      const spy = sinon.spy(host, 'fetch');
      host._onColumnFilterChanged({
        detail: { filterBy: 'dc:title', value: 'test', name: 'title' },
      });
      expect(host.filters).to.have.lengthOf(1);
      expect(host.filters[0].path).to.equal('dc:title');
      expect(host.nxProvider.params['dc:title']).to.equal('test');
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('updates existing filter value', () => {
      host.filters = [{ path: 'dc:title', value: 'old', name: 'title' }];
      host._onColumnFilterChanged({
        detail: { filterBy: 'dc:title', value: 'new', name: 'title' },
      });
      expect(host.filters[0].value).to.equal('new');
    });

    test('removes existing filter when value is empty', () => {
      host.filters = [{ path: 'dc:title', value: 'test', name: 'title' }];
      host.nxProvider.params['dc:title'] = 'test';
      const spy = sinon.spy(host, 'fetch');
      host._onColumnFilterChanged({
        detail: { filterBy: 'dc:title', value: '', name: 'title' },
      });
      expect(host.filters).to.have.lengthOf(0);
      expect(host.nxProvider.params['dc:title']).to.be.undefined;
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('applies filterExpression substitution', () => {
      host._onColumnFilterChanged({
        detail: {
          filterBy: 'dc:title',
          value: 'hello',
          name: 'title',
          filterExpression: '$term%',
        },
      });
      expect(host.nxProvider.params['dc:title']).to.equal('hello%');
    });

    test('stores filterExpression in the filter entry', () => {
      host._onColumnFilterChanged({
        detail: {
          filterBy: 'dc:title',
          value: 'hello',
          name: 'title',
          filterExpression: '%$term%',
        },
      });
      expect(host.filters[0].expression).to.equal('%$term%');
    });

    test('does not add filter when value is empty and filter is new', () => {
      host._onColumnFilterChanged({
        detail: { filterBy: 'dc:title', value: '', name: 'title' },
      });
      expect(host.filters).to.have.lengthOf(0);
    });

    test('sets page to 1 when paginable', () => {
      host.paginable = true;
      host._onColumnFilterChanged({
        detail: { filterBy: 'dc:title', value: 'v', name: 'title' },
      });
      expect(host.nxProvider.page).to.equal(1);
    });

    test('does nothing without a page provider', () => {
      host.nxProvider = null;
      const origFilters = host.filters.slice();
      host._onColumnFilterChanged({
        detail: { filterBy: 'dc:title', value: 'test', name: 'title' },
      });
      expect(host.filters).to.deep.equal(origFilters);
    });

    test('returns early when filterBy is missing (e.g. action column) (ELEMENTS-1966)', () => {
      const spy = sinon.spy(host, 'fetch');
      host._onColumnFilterChanged({
        detail: { filterBy: null, value: 'test', name: 'actions' },
      });
      expect(host.filters).to.have.lengthOf(0);
      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('returns early when filterBy is undefined (ELEMENTS-1966)', () => {
      const spy = sinon.spy(host, 'fetch');
      host._onColumnFilterChanged({
        detail: { value: 'test' },
      });
      expect(host.filters).to.have.lengthOf(0);
      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('fires settings-changed with source=column-filter on handled events (ELEMENTS-1966)', () => {
      const spy = sinon.spy();
      host._fireSettingsChanged = spy;
      host._onColumnFilterChanged({
        detail: { filterBy: 'dc:title', value: 'test', name: 'title' },
      });
      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0]).to.deep.equal({ source: 'column-filter' });
      delete host._fireSettingsChanged;
    });

    test('does not fire settings-changed when filterBy is missing', () => {
      const spy = sinon.spy();
      host._fireSettingsChanged = spy;
      host._onColumnFilterChanged({
        detail: { filterBy: null, value: 'test' },
      });
      expect(spy).to.not.have.been.called;
      delete host._fireSettingsChanged;
    });

    test('does not throw when _fireSettingsChanged is not defined on host', () => {
      delete host._fireSettingsChanged;
      expect(() =>
        host._onColumnFilterChanged({
          detail: { filterBy: 'dc:title', value: 'test', name: 'title' },
        }),
      ).to.not.throw();
    });
  });

  suite('_computeLabel', () => {
    test('sets loading label when loading is true', () => {
      host.loading = true;
      host._setLoading(true);
      host._computeLabel();
      expect(host._computedEmptyLabel).to.equal('label.loading');
    });

    test('sets filtered label after debounce when filters present', (done) => {
      host._setLoading(false);
      host.filters = [{ path: 'dc:title', value: 'x' }];
      host._computeLabel();
      setTimeout(() => {
        expect(host._computedEmptyLabel).to.equal('label.noResultsWhenFiltered');
        done();
      }, 600);
    });

    test('sets noResults label when provider resultsCount is 0', (done) => {
      host._setLoading(false);
      host.nxProvider = makeProvider({ resultsCount: 0 });
      host.filters = [];
      host._computeLabel();
      setTimeout(() => {
        expect(host._computedEmptyLabel).to.equal('label.noResults');
        done();
      }, 600);
    });

    test('uses custom emptyLabel when provided', (done) => {
      host._setLoading(false);
      host.nxProvider = makeProvider({ resultsCount: 0 });
      host.filters = [];
      host.emptyLabel = 'custom empty';
      host._computeLabel();
      setTimeout(() => {
        expect(host._computedEmptyLabel).to.equal('custom empty');
        done();
      }, 600);
    });

    test('uses custom emptyLabelWhenFiltered when provided', (done) => {
      host._setLoading(false);
      host.filters = [{ path: 'dc:title', value: 'x' }];
      host.emptyLabelWhenFiltered = 'custom filtered';
      host._computeLabel();
      setTimeout(() => {
        expect(host._computedEmptyLabel).to.equal('custom filtered');
        done();
      }, 600);
    });

    test('sets noResults label when nxProvider is null', (done) => {
      host._setLoading(false);
      host.nxProvider = null;
      host.filters = [];
      host._computeLabel();
      setTimeout(() => {
        expect(host._computedEmptyLabel).to.equal('label.noResults');
        done();
      }, 600);
    });
  });

  suite('_quickFiltersChangedDeep', () => {
    test('does nothing when quickFilters is null', () => {
      host.quickFilters = null;
      host._lastQuickFiltersSnapshot = '';
      host._quickFiltersChangedDeep();
      expect(host._lastQuickFiltersSnapshot).to.equal('');
    });

    test('updates snapshot and calls _quickFilterChanged when changed and paginable', () => {
      host.paginable = true;
      const prov = makeProvider();
      host.nxProvider = prov;
      host._nxProviderChanged(prov);
      const stub = sinon.stub(host, '_quickFilterChanged');
      host._lastQuickFiltersSnapshot = '';
      host.quickFilters = { 0: { active: true }, 1: { active: false } };
      host._quickFiltersChangedDeep();
      expect(stub).to.have.been.calledOnce;
      expect(host._lastQuickFiltersSnapshot).to.not.equal('');
      stub.restore();
    });

    test('does not call _quickFilterChanged when snapshot unchanged', () => {
      host.paginable = true;
      host.quickFilters = { 0: { active: true } };
      host._lastQuickFiltersSnapshot = '0:true';
      const spy = sinon.spy(host, '_quickFilterChanged');
      host._quickFiltersChangedDeep();
      expect(spy).not.to.have.been.called;
      spy.restore();
    });

    test('does not call _quickFilterChanged when not paginable', () => {
      host.paginable = false;
      host.quickFilters = { 0: { active: true } };
      host._lastQuickFiltersSnapshot = '';
      const spy = sinon.spy(host, '_quickFilterChanged');
      host._quickFiltersChangedDeep();
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });

  suite('_updateFlags', () => {
    test('sets size from items length', () => {
      host.items = items(4);
      host._updateFlags();
      expect(host.size).to.equal(4);
    });

    test('sets size to 0 when items is not an array', () => {
      host.items = null;
      host._updateFlags();
      expect(host.size).to.equal(0);
    });

    test('sets _isEmpty based on size', () => {
      host.items = [];
      host._updateFlags();
      expect(host._isEmpty).to.be.true;
      host.items = items(1);
      host._updateFlags();
      expect(host._isEmpty).to.be.false;
    });

    test('sets _isSelectAllIndeterminate when selectedItems < size', () => {
      host.items = items(5);
      host.selectedItems = items(2);
      host._isSelectAllActive = true;
      host._updateFlags();
      expect(host._isSelectAllIndeterminate).to.be.true;
    });

    test('_isSelectAllIndeterminate is true when selectAll is not active', () => {
      host.items = items(5);
      host.selectedItems = items(5);
      host._isSelectAllActive = false;
      host._updateFlags();
      expect(host._isSelectAllIndeterminate).to.be.true;
    });
  });

  suite('reset / _reset', () => {
    test('reset delegates to _reset', () => {
      const spy = sinon.spy(host, '_reset');
      host.reset(5);
      expect(spy).to.have.been.calledWith(5);
      spy.restore();
    });

    test('_reset(0) clears items and sets size to 0', () => {
      host.items = items(5);
      host._reset(0);
      expect(host.items).to.have.lengthOf(0);
      expect(host.size).to.equal(0);
      expect(host._currentPage).to.equal(1);
    });

    test('_reset with positive size creates empty object array', () => {
      host._reset(3);
      expect(host.items).to.have.lengthOf(3);
      host.items.forEach((item) => {
        expect(item).to.deep.equal({});
      });
    });

    test('_reset caps size at maxItems', () => {
      host.maxItems = 5;
      host._reset(100);
      expect(host.items).to.have.lengthOf(5);
    });

    test('_reset clears selection', () => {
      const spy = sinon.spy(host, 'clearSelection');
      host._reset(3);
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('_reset calls notifyResize on list', () => {
      host._reset(3);
      expect(host.$.list.notifyResize).to.have.been.called;
    });

    test('_reset with non-number size produces empty items', () => {
      host._reset(null);
      expect(host.items).to.have.lengthOf(0);
    });
  });

  suite('_updateQuickFiltersAndBuckets', () => {
    setup(() => {
      host.nxProvider = makeProvider();
    });

    test('sets quickFilters from provider', () => {
      host.nxProvider.quickFilters = { 0: { active: false } };
      host._updateQuickFiltersAndBuckets({ aggregations: null });
      expect(host.quickFilters).to.deep.equal({ 0: { active: false } });
    });

    test('sets empty buckets when no aggregations', () => {
      host._updateQuickFiltersAndBuckets({});
      expect(host.buckets).to.deep.equal([]);
    });

    test('sets empty buckets when active quick filters exist', () => {
      host.nxProvider.quickFilters = { 0: { active: true } };
      host._updateQuickFiltersAndBuckets({
        aggregations: { agg1: { field: 'dc:title', buckets: [{ key: 'a' }] } },
      });
      expect(host.buckets).to.deep.equal([]);
    });

    test('extracts buckets from matching aggregation with key order', () => {
      host.nxProvider.sort = { 'dc:title': 'asc' };
      host.nxProvider.quickFilters = null;
      const bucketList = [{ key: 'a' }, { key: 'b' }];
      host._updateQuickFiltersAndBuckets({
        aggregations: {
          agg1: {
            field: 'dc:title',
            buckets: bucketList,
            properties: { order: 'key asc' },
          },
        },
      });
      expect(host.buckets).to.deep.equal(bucketList);
    });

    test('reverses buckets when aggregation order differs from provider', () => {
      host.nxProvider.sort = { 'dc:title': 'asc' };
      host.nxProvider.quickFilters = null;
      const bucketList = [{ key: 'a' }, { key: 'b' }];
      host._updateQuickFiltersAndBuckets({
        aggregations: {
          agg1: {
            field: 'dc:title',
            buckets: bucketList,
            properties: { order: 'key desc' },
          },
        },
      });
      expect(host.buckets).to.deep.equal([{ key: 'b' }, { key: 'a' }]);
    });

    test('ignores aggregation whose order key is not "key"', () => {
      host.nxProvider.sort = { 'dc:title': 'asc' };
      host.nxProvider.quickFilters = null;
      host._updateQuickFiltersAndBuckets({
        aggregations: {
          agg1: {
            field: 'dc:title',
            buckets: [{ key: 'a' }],
            properties: { order: 'count asc' },
          },
        },
      });
      expect(host.buckets).to.deep.equal([]);
    });

    test('ignores aggregation when sort has multiple fields', () => {
      host.nxProvider.sort = { 'dc:title': 'asc', 'dc:created': 'desc' };
      host.nxProvider.quickFilters = null;
      host._updateQuickFiltersAndBuckets({
        aggregations: {
          agg1: {
            field: 'dc:title',
            buckets: [{ key: 'a' }],
            properties: { order: 'key asc' },
          },
        },
      });
      expect(host.buckets).to.deep.equal([]);
    });

    test('ignores aggregation when field does not match sort', () => {
      host.nxProvider.sort = { 'dc:title': 'asc' };
      host.nxProvider.quickFilters = null;
      host._updateQuickFiltersAndBuckets({
        aggregations: {
          agg1: {
            field: 'dc:created',
            buckets: [{ key: 'a' }],
            properties: { order: 'key asc' },
          },
        },
      });
      expect(host.buckets).to.deep.equal([]);
    });
  });

  suite('fetch', () => {
    test('resolves immediately without a provider', async () => {
      host.nxProvider = null;
      const result = await host.fetch();
      expect(result).to.be.undefined;
    });

    test('calls _fetchPage when paginable', () => {
      host.nxProvider = makeProvider();
      host.paginable = true;
      const spy = sinon.spy(host, '_fetchPage');
      host.fetch();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('calls _fetchRange when not paginable', () => {
      host.nxProvider = makeProvider();
      host.paginable = false;
      const spy = sinon.spy(host, '_fetchRange');
      host.fetch();
      expect(spy).to.have.been.calledWith(0, host._pageSize - 1, true);
      spy.restore();
    });
  });

  suite('_fetchPage', () => {
    let prov;

    setup(() => {
      prov = makeProvider();
      host.nxProvider = prov;
      host._nxProviderChanged(prov);
    });

    test('first page replaces items', async () => {
      const entries = items(3);
      prov.fetch.resolves({
        entries,
        resultsCount: 3,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchPage(1, 10);
      expect(host.items).to.deep.equal(entries);
    });

    test('subsequent page appends entries', async () => {
      host.items = items(3);
      const newEntries = items(2);
      prov.fetch.resolves({
        entries: newEntries,
        resultsCount: 5,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchPage(2, 10);
      expect(host.items).to.have.lengthOf(5);
    });

    test('does nothing when response is falsy', async () => {
      prov.fetch.resolves(null);
      const result = await host._fetchPage(1, 10);
      expect(result).to.be.null;
    });

    test('sets skipAggregates true for non-first pages', async () => {
      prov.fetch.resolves({ entries: [], aggregations: null });
      prov.quickFilters = null;
      await host._fetchPage(2, 10);
      expect(prov.fetch).to.have.been.calledWith({ skipAggregates: true });
    });

    test('sets skipAggregates false for first page', async () => {
      prov.fetch.resolves({ entries: [], aggregations: null });
      prov.quickFilters = null;
      await host._fetchPage(1, 10);
      expect(prov.fetch).to.have.been.calledWith({ skipAggregates: false });
    });

    test('fires nuxeo-page-loaded event', async () => {
      prov.fetch.resolves({ entries: [], aggregations: null });
      prov.quickFilters = null;
      const spy = sinon.spy(host, 'fire');
      await host._fetchPage(1, 10);
      expect(spy).to.have.been.calledWith('nuxeo-page-loaded');
      spy.restore();
    });

    test('swallows AbortError', async () => {
      const err = new DOMException('Aborted', 'AbortError');
      prov.fetch.rejects(err);
      const result = await host._fetchPage(1, 10);
      expect(result).to.be.undefined;
    });

    test('re-throws non-AbortError', async () => {
      prov.fetch.rejects(new Error('network'));
      try {
        await host._fetchPage(1, 10);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.message).to.equal('network');
      }
    });

    test('does nothing without provider', () => {
      host.nxProvider = null;
      const result = host._fetchPage(1, 10);
      expect(result).to.be.undefined;
    });
  });

  suite('_fetchRange', () => {
    let prov;

    setup(() => {
      prov = makeProvider({ pageSize: 10 });
      host.nxProvider = prov;
      host._nxProviderChanged(prov);
      host._pageSize = 10;
    });

    test('resets lastIndex to _pageSize - 1 when firstIndex is 0', async () => {
      prov.fetch.resolves({
        entries: items(10),
        resultsCount: 10,
        resultsCountLimit: 0,
        currentPageSize: 10,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchRange(0, 100, true);
      expect(prov.pageSize).to.equal(10);
    });

    test('caps lastIndex at maxItems', async () => {
      host.maxItems = 5;
      prov.fetch.resolves({
        entries: items(5),
        resultsCount: 5,
        resultsCountLimit: 0,
        currentPageSize: 5,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchRange(0, 100, true);
      expect(prov.pageSize).to.equal(host.maxItems + 1);
    });

    test('adds fetchAheadLimit when firstIndex > 0', async () => {
      host._fetchAheadLimit = 10;
      host.maxItems = null;
      prov.fetch.resolves({
        entries: items(5),
        resultsCount: 25,
        resultsCountLimit: 0,
        currentPageSize: 5,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchRange(5, 10, true);
      expect(prov.pageSize).to.equal(16);
    });

    test('handles negative resultsCount', async () => {
      const resetSpy = sinon.spy(host, 'reset');
      prov.fetch.resolves({
        entries: [],
        resultsCount: -1,
        resultsCountLimit: 50,
        currentPageSize: 10,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchRange(0, 9, true);
      expect(resetSpy).to.have.been.called;
      resetSpy.restore();
    });

    test('uses currentPageSize when resultsCount < 0 and limit is 0', async () => {
      const resetSpy = sinon.spy(host, 'reset');
      prov.fetch.resolves({
        entries: items(5),
        resultsCount: -1,
        resultsCountLimit: 0,
        currentPageSize: 5,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchRange(0, 9, true);
      expect(resetSpy).to.have.been.calledWith(5);
      resetSpy.restore();
    });

    test('uses resultsCountLimit when it is less than resultsCount', async () => {
      const resetSpy = sinon.spy(host, 'reset');
      prov.fetch.resolves({
        entries: items(5),
        resultsCount: 1000,
        resultsCountLimit: 100,
        currentPageSize: 5,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchRange(0, 9, true);
      expect(resetSpy).to.have.been.calledWith(100);
      resetSpy.restore();
    });

    test('uses resultsCount when limit is 0 and count is positive', async () => {
      const resetSpy = sinon.spy(host, 'reset');
      prov.fetch.resolves({
        entries: items(5),
        resultsCount: 42,
        resultsCountLimit: 0,
        currentPageSize: 5,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchRange(0, 9, true);
      expect(resetSpy).to.have.been.calledWith(42);
      resetSpy.restore();
    });

    test('caps count at maxItems', async () => {
      host.maxItems = 5;
      const resetSpy = sinon.spy(host, 'reset');
      prov.fetch.resolves({
        entries: items(5),
        resultsCount: 100,
        resultsCountLimit: 0,
        currentPageSize: 5,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchRange(0, 9, true);
      expect(resetSpy).to.have.been.calledWith(5);
      resetSpy.restore();
    });

    test('does not reset when count equals current items length and not clearing', async () => {
      host.items = new Array(10).fill({});
      const resetSpy = sinon.spy(host, 'reset');
      prov.fetch.resolves({
        entries: items(10),
        resultsCount: 10,
        resultsCountLimit: 0,
        currentPageSize: 10,
        aggregations: null,
      });
      prov.quickFilters = null;
      await host._fetchRange(0, 9, false);
      expect(resetSpy).not.to.have.been.called;
      resetSpy.restore();
    });

    test('does nothing when response is falsy', async () => {
      prov.fetch.resolves(null);
      const resetSpy = sinon.spy(host, 'reset');
      await host._fetchRange(0, 9, true);
      expect(resetSpy).not.to.have.been.called;
      resetSpy.restore();
    });

    test('fires nuxeo-page-loaded', async () => {
      prov.fetch.resolves({
        entries: items(2),
        resultsCount: 2,
        resultsCountLimit: 0,
        currentPageSize: 2,
        aggregations: null,
      });
      prov.quickFilters = null;
      const spy = sinon.spy(host, 'fire');
      await host._fetchRange(0, 9, true);
      expect(spy).to.have.been.calledWith('nuxeo-page-loaded');
      spy.restore();
    });

    test('skips loading when existing items in range are already loaded', () => {
      host.items = items(10);
      const result = host._fetchRange(0, 9, false);
      expect(result).to.be.undefined;
      expect(prov.fetch).not.to.have.been.called;
    });

    test('swallows AbortError', async () => {
      const err = new DOMException('Aborted', 'AbortError');
      prov.fetch.rejects(err);
      const result = await host._fetchRange(0, 9, true);
      expect(result).to.be.undefined;
    });

    test('re-throws non-AbortError', async () => {
      prov.fetch.rejects(new Error('network'));
      try {
        await host._fetchRange(0, 9, true);
        expect.fail('should have thrown');
      } catch (e) {
        expect(e.message).to.equal('network');
      }
    });

    test('does nothing without a provider', () => {
      host.nxProvider = null;
      const result = host._fetchRange(0, 9, true);
      expect(result).to.be.undefined;
    });
  });

  suite('scrollToItem / scrollToIndex / focusOnIndexIfNotVisible', () => {
    test('scrollToItem delegates to list', () => {
      const item = { uid: 'x' };
      host.scrollToItem(item);
      expect(host.$.list.scrollToItem).to.have.been.calledWith(item);
    });

    test('scrollToIndex clamps to valid range', () => {
      host.items = items(10);
      host.scrollToIndex(5);
      expect(host.$.list.scrollToIndex).to.have.been.calledWith(5);
    });

    test('scrollToIndex clamps negative to 0', () => {
      host.items = items(10);
      host.scrollToIndex(-5);
      expect(host.$.list.scrollToIndex).to.have.been.calledWith(0);
    });

    test('scrollToIndex clamps above max to last index', () => {
      host.items = items(10);
      host.scrollToIndex(100);
      expect(host.$.list.scrollToIndex).to.have.been.calledWith(9);
    });

    test('focusOnIndexIfNotVisible scrolls when index not visible', () => {
      host.$.list._isIndexVisible.returns(false);
      host.focusOnIndexIfNotVisible(5);
      expect(host.$.list.scrollToIndex).to.have.been.calledWith(5);
    });

    test('focusOnIndexIfNotVisible does not scroll when visible', () => {
      host.$.list._isIndexVisible.returns(true);
      host.$.list.scrollToIndex.resetHistory();
      host.focusOnIndexIfNotVisible(5);
      expect(host.$.list.scrollToIndex).not.to.have.been.called;
    });
  });

  suite('_pushSelectedItems', () => {
    test('pushes non-selected, non-excluded items to selectedItems', () => {
      host.items = items(5);
      host.selectedItems = [];
      host._excludedItems = [];
      host.multiSelection = true;
      host._isSelectAllActive = false;
      host.notifySplices = sinon.stub();
      host._pushSelectedItems(0, 3);
      expect(host.selectedItems).to.have.lengthOf(3);
      expect(host.notifySplices).to.have.been.calledWith('selectedItems');
    });

    test('skips excluded items', () => {
      host.items = items(5);
      host.selectedItems = [];
      host._excludedItems = ['uid-1'];
      host.multiSelection = true;
      host._isSelectAllActive = true;
      host.notifySplices = sinon.stub();
      host._pushSelectedItems(0, 3);
      expect(host.selectedItems.map((i) => i.uid)).not.to.include('uid-1');
    });
  });

  suite('_selectItemModel', () => {
    test('does nothing when index is not rendered', () => {
      host.$.list._isIndexRendered.returns(false);
      host._selectItemModel(0);
      expect(host.$.list._getPhysicalIndex).not.to.have.been.called;
    });

    test('sets selected=true on model when rendered and not excluded', () => {
      host.$.list._isIndexRendered.returns(true);
      host.$.list._physicalItems = [{}];
      host.$.list._getPhysicalIndex.returns(0);
      const model = { selected: false };
      host.modelForElement = sinon.stub().returns(model);
      host.items = items(1);
      host._excludedItems = [];
      host._selectItemModel(0);
      expect(model[host.$.list.selectedAs]).to.be.true;
    });

    test('sets selected=false on model when item is excluded', () => {
      host.$.list._isIndexRendered.returns(true);
      host.$.list._physicalItems = [{}];
      host.$.list._getPhysicalIndex.returns(0);
      const model = { selected: true };
      host.modelForElement = sinon.stub().returns(model);
      host.items = items(1);
      host._excludedItems = ['uid-0'];
      host._selectItemModel(0);
      expect(model[host.$.list.selectedAs]).to.be.false;
    });

    test('does nothing when item at index is null', () => {
      host.$.list._isIndexRendered.returns(true);
      host.$.list._physicalItems = [{}];
      host.$.list._getPhysicalIndex.returns(0);
      host.modelForElement = sinon.stub().returns({});
      host.items = [null];
      host._selectItemModel(0);
    });

    test('does nothing when modelForElement returns null', () => {
      host.$.list._isIndexRendered.returns(true);
      host.$.list._physicalItems = [{}];
      host.$.list._getPhysicalIndex.returns(0);
      host.modelForElement = sinon.stub().returns(null);
      host.items = items(1);
      host._excludedItems = [];
      host._selectItemModel(0);
    });
  });

  suite('_syncArraySelectorSelection', () => {
    test('syncs selection when item is selected but not in selector', () => {
      const item = { uid: 'uid-0' };
      host.items = [item];
      host._isSelectAllActive = true;
      host._excludedItems = [];
      host.$.list.$.selector.isSelected.returns(false);
      host._syncArraySelectorSelection(0);
      expect(host.$.list.$.selector.__selectedMap.has(item)).to.be.true;
    });

    test('syncs deselection when item is not selected but in selector', () => {
      const item = { uid: 'uid-0' };
      host.items = [item];
      host._isSelectAllActive = false;
      host.multiSelection = true;
      host.selectedItems = [];
      host.$.list.$.selector.isSelected.returns(true);
      host.$.list.$.selector.__selectedMap.set(item, 0);
      host._syncArraySelectorSelection(0);
      expect(host.$.list.$.selector.__selectedMap.has(item)).to.be.false;
    });
  });

  suite('_getSelectionBoundaries', () => {
    test('computes start, end, n from list visible indexes', () => {
      host.$.list.firstVisibleIndex = 2;
      host.$.list.lastVisibleIndex = 7;
      host.items = items(20);
      const { start, end, n } = host._getSelectionBoundaries();
      expect(n).to.equal(5);
      expect(start).to.equal(0);
      expect(end).to.equal(12);
    });

    test('clamps start to 0 and end to items length', () => {
      host.$.list.firstVisibleIndex = 0;
      host.$.list.lastVisibleIndex = 3;
      host.items = items(5);
      const { start, end } = host._getSelectionBoundaries();
      expect(start).to.equal(0);
      expect(end).to.equal(5);
    });
  });

  suite('_quickFilterChanged', () => {
    test('calls _fetchPage when paginable', () => {
      host.paginable = true;
      host.nxProvider = makeProvider();
      host._nxProviderChanged(host.nxProvider);
      const spy = sinon.spy(host, '_fetchPage');
      host._quickFilterChanged();
      expect(spy).to.have.been.calledWith(1, host._pageSize, true);
      expect(host._currentPage).to.equal(1);
      spy.restore();
    });

    test('calls _fetchRange when not paginable', () => {
      host.paginable = false;
      host.nxProvider = makeProvider();
      host._nxProviderChanged(host.nxProvider);
      const spy = sinon.spy(host, '_fetchRange');
      host._quickFilterChanged();
      expect(spy).to.have.been.calledWith(0, host._pageSize - 1, true);
      spy.restore();
    });
  });
});

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

    const snapshotOf = (quickFilters) => {
      const ctx = {
        quickFilters,
        _lastQuickFiltersSnapshot: null,
        paginable: false,
        _quickFilterChanged: sinon.stub(),
      };
      b._quickFiltersChangedDeep.call(ctx);
      return ctx._lastQuickFiltersSnapshot;
    };

    // 'É' (U+00C9) sorts after 'z' by code unit but next to 'e' under locale collation, so these
    // suites fail if the comparator is ever swapped for a locale aware one.
    const accentedKey = 'É';

    test('orders the snapshot by code unit, whatever the ambient locale', () => {
      const snapshot = snapshotOf({
        b: { active: true },
        [accentedKey]: { active: false },
        A: { active: true },
        a: { active: false },
      });
      expect(snapshot).to.equal('A:true|a:false|b:true|É:false');
    });

    test('produces the same snapshot whatever the key order', () => {
      const first = snapshotOf({ a: { active: true }, [accentedKey]: { active: false }, b: { active: true } });
      const second = snapshotOf({ b: { active: true }, a: { active: true }, [accentedKey]: { active: false } });
      expect(first).to.equal(second);
    });

    test('does not call _quickFilterChanged when the same quick filters are re-evaluated', () => {
      const ctx = {
        quickFilters: { a: { active: true }, [accentedKey]: { active: false } },
        _lastQuickFiltersSnapshot: null,
        paginable: true,
        _quickFilterChanged: sinon.stub(),
      };
      b._quickFiltersChangedDeep.call(ctx);
      expect(ctx._quickFilterChanged).to.have.been.calledOnce;
      b._quickFiltersChangedDeep.call(ctx);
      b._quickFiltersChangedDeep.call(ctx);
      expect(ctx._quickFilterChanged).to.have.been.calledOnce;
    });

    test('calls _quickFilterChanged when an active state flips', () => {
      const ctx = {
        quickFilters: { a: { active: true }, [accentedKey]: { active: false } },
        _lastQuickFiltersSnapshot: null,
        paginable: true,
        _quickFilterChanged: sinon.stub(),
      };
      b._quickFiltersChangedDeep.call(ctx);
      ctx.quickFilters[accentedKey].active = true;
      b._quickFiltersChangedDeep.call(ctx);
      expect(ctx._quickFilterChanged).to.have.been.calledTwice;
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
    test('sets size from items for a table-initiated fetch', () => {
      const ctx = {
        _hasPageProvider: () => true,
        _pendingTableFetches: 1,
        items: [1, 2, 3],
        size: 0,
      };
      b._updateResults.call(ctx);
      expect(ctx.size).to.equal(3);
    });

    test('delegates to _displayProviderResults for a provider-initiated fetch', () => {
      const ctx = {
        _hasPageProvider: () => true,
        _pendingTableFetches: 0,
        _displayProviderResults: sinon.stub(),
        items: [1, 2, 3],
        size: 0,
      };
      b._updateResults.call(ctx);
      expect(ctx._displayProviderResults).to.have.been.calledOnce;
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
