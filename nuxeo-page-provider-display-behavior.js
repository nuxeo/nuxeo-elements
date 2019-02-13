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
import '@polymer/polymer/polymer-legacy.js';

import { dom, flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { I18nBehavior } from './nuxeo-i18n-behavior.js';

/**
 * @polymerBehavior Nuxeo.PageProviderDisplayBehavior
 */
export const PageProviderDisplayBehavior = [I18nBehavior, {

  properties: {

    nxProvider: {
      type: HTMLElement,
    },

    size: {
      type: Number,
      value: 0,
      notify: true,
    },

    emptyLabel: {
      type: String,
      value: 'No result',
      observer: '_observeEmptyLabel',
    },

    emptyLabelWhenFiltered: {
      type: String,
      value: 'No result',
    },

    _computedEmptyLabel: {
      type: String,
    },

    _isEmpty: {
      type: Boolean,
      value: true,
    },

    _isSelectAllChecked: {
      type: Boolean,
      value: false,
      notify: true,
    },

    _isSelectAllIndeterminate: {
      type: Boolean,
      value: false,
      notify: true,
    },

    _isSelectionEmpty: {
      type: Boolean,
      value: true,
      notify: true,
    },

    multiSelection: {
      type: Boolean,
      value: false,
    },

    /**
     * An array containing path/filter value pairs that are used to filter the items
     */
    filters: {
      type: Array,
      notify: true,
      value: [],
    },

    /**
     * An array with a path/sortorder ('asc' or 'desc') pairs that are used to sort the items.
     */
    sortOrder: {
      type: Array,
      notify: true,
      value() {
        return [];
      },
    },

    _ppSort: {
      type: Object,
      value: {},
      notify: true,
    },

    /**
     * `true` if the table is currently loading data from the data source.
     */
    loading: {
      type: Boolean,
      reflectToAttribute: true,
      notify: true,
      readOnly: true,
      value: false,
    },

    selectionEnabled: {
      type: Boolean,
      value: false,
    },

    selectedItems: {
      type: Object,
      notify: true,
    },

    selectedItem: {
      type: Object,
      notify: true,
    },

    items: {
      type: Array,
      value: [],
      notify: true,
    },

    /**
     * Use this property to limit the maximum number of items.
     */
    maxItems: {
      type: Number,
      value: 10000,
    },

    /**
     * Number of items to fetch ahead of current range limit.
     */
    _fetchAheadLimit: {
      type: Number,
      value: 10,
    },

    selectOnTap: {
      type: Boolean,
      value: false,
    },

    as: {
      type: String,
      value: 'item',
    },

    quickFilters: {
      type: Array,
      notify: true,
    },

    scrollThrottle: {
      type: Number,
      value: 60,
    },

    handlesSorting: {
      type: Boolean,
      value: false,
    },

    handlesFiltering: {
      type: Boolean,
      value: false,
    },

    _lastSelectedIndex: Number,
  },

  observers: [
    '_updateFlags(size, loading)',
    '_nxProviderChanged(nxProvider)',
    '_selectionEnabledChanged(selectionEnabled, selectOnTap)',
    '_itemsChanged(items.*)',
  ],

  listeners: {
    'column-filter-changed': '_onColumnFilterChanged',
    selected: '_selected',
  },

  detached() {
    this.unlisten(this.nxProvider, 'update', '_updateResults');
    this.unlisten(this.nxProvider, 'loading-changed', '_updateLoading');
    this.$.list.unlisten.call(this.$.list, this.$.list, 'selected', '_selectionHandler');
    this.$.list.unlisten.call(this.$.list, this.$.list, 'tap', '_selectionHandler');
  },

  _nxProviderChanged(nxProvider) {
    if (typeof nxProvider === 'string') {
      this.nxProvider = this.__dataHost ? this.__dataHost.$[nxProvider] :
        dom(this.ownerDocument).querySelector(`#${nxProvider}`);
      if (this.nxProvider === null) {
        this.nxProvider = dom(this).parentNode.querySelector(`#${nxProvider}`);
      }
    } else if (nxProvider) {
      this._pageSize = this.nxProvider.pageSize;
      this.listen(this.nxProvider, 'loading-changed', '_updateLoading');
      this.listen(this.nxProvider, 'update', '_updateResults');
    }
  },

  _updateLoading() {
    this._setLoading(this.nxProvider.loading);
  },

  _hasPageProvider() {
    return this.nxProvider && typeof this.nxProvider !== 'string';
  },

  _resetResults() {
    if (this._hasPageProvider()) {
      this._reset(0);
    }
  },

  _updateResults() {
    if (this._hasPageProvider()) {
      this.size = this.items.length;
    }
  },

  _itemsChanged() {
    this._isEmpty = !(this.items && this.items.length > 0);
  },

  _selected(e) {
    const index = e.detail.index;
    if (typeof index === 'number') {
      if (e.detail.shiftKey && typeof this._lastSelectedIndex === 'number') {

      // prevent selecting an item not loaded yet
        if (!this.items[index] || !this.items[index].uid) {
          this.deselectIndex(index);
        }

        const last = this._lastSelectedIndex;
        const start = index > last ? last : index;
        const end = index > last ? index : last;

        // check if all items in the range are loaded
        const valid = this.items.slice(start, end).every((item) => item && item.uid);

        // select items in range
        if (valid) {
          for (let i = start; i < end; i++) {
            const item = this.items[i];
            if (item && item.uid) {
              this.selectItem(item);
            }
          }
        }
      }
      this._lastSelectedIndex = e.detail.index;
    }
  },

  selectItem(item) {
    if (this.selectionEnabled) {
      this.$.list.selectItem(item);
      this._updateFlags();
    }
  },

  selectIndex(index) {
    if (this.selectionEnabled) {
      this.$.list.selectIndex(index);
      this._updateFlags();
    }
  },

  selectItems(items) {
    if (this.selectionEnabled && items && items.length > 0) {
      items.forEach(function (item) {
        this.selectItem(item);
      }.bind(this.$.list));
      this._updateFlags();
    }
  },

  deselectItem(item) {
    if (this.selectionEnabled) {
      this.$.list.deselectItem(item);
      this._updateFlags();
    }
  },

  deselectIndex(index) {
    if (this.selectionEnabled) {
      this.$.list.deselectIndex(index);
      this._updateFlags();
    }
  },

  selectAll() {
    this.items.forEach(function (item) {
      this.selectItem(item);
    }.bind(this.$.list));
    this._updateFlags();
  },

  clearSelection() {
    this.$.list.clearSelection();
    this._updateFlags();
  },

  _isSelected(item) {
    return !!(this.selectedItems && this.selectedItems.length && this.selectedItems.indexOf(item) > -1);
  },

  _toggleSelectAll() {
    if (this._isSelectAllChecked) {
      this.clearSelection();
    } else {
      this.selectAll();
    }
  },

  _selectionEnabledChanged() {
    this.$.list.selectionEnabled = this.selectionEnabled;
    this.$.list.multiSelection = this.multiSelection;
    this.$.list.unlisten.call(this.$.list, this.$.list, 'selected', '_selectionHandler');
    if (this.selectionEnabled && !this.selectOnTap) {
      this.$.list.unlisten.call(this.$.list, this.$.list, 'tap', '_selectionHandler');
      this.$.list.listen.call(this.$.list, this.$.list, 'selected', '_selectionHandler');
    }
  },

  _sortDirectionChanged(e) {
    if (this._hasPageProvider()) {
      let notFound = true;
      for (let i = 0; i < this.sortOrder.length; i++) {
        if (this.sortOrder[i].path === e.detail.path) {
          if (e.detail.direction) {
            this.set(`sortOrder.${i}.direction`, e.detail.direction);
          } else {
            this.splice('sortOrder', i, 1);
          }
          notFound = false;
          break;
        }
      }
      if (notFound) {
        this.push('sortOrder', {
          path: e.detail.path,
          direction: e.detail.direction,
        });
      }

      // TODO make it simpler
      const tmpSort = {};
      if (this.sortOrder && this.sortOrder.length > 0) {
        this.sortOrder.forEach((sortItem) => {
          tmpSort[sortItem.path] = sortItem.direction;
        });
      }
      if (JSON.stringify(this._ppSort) !== JSON.stringify(tmpSort)) {
        this._ppSort = tmpSort;
        this.nxProvider.sort = this._ppSort;
        if (!this.nxProvider.auto) {
          this.fetch();
        }
      }
    }
  },

  _onColumnFilterChanged(e) {
    if (this._hasPageProvider()) {
      let notFound = true;
      for (let i = 0; i < this.filters.length; i++) {
        if (this.filters[i].path === e.detail.filterBy) {
          if (e.detail.value.length === 0) {
            this.splice('filters', i, 1);
          } else {
            this.set(`filters.${i}.value`, e.detail.value);
          }
          notFound = false;
          break;
        }
      }

      if (notFound && e.detail.value.length !== 0) {
        this.push('filters', {
          path: e.detail.filterBy,
          value: e.detail.value,
          name: e.detail.name,
        });
      }

      if (this.paginable) {
        this.nxProvider.page = 1;
      }

      if (this.nxProvider.params[e.detail.filterBy] && e.detail.value.length === 0) {
        delete this.nxProvider.params[e.detail.filterBy];
        this.fetch();
      } else if (e.detail.value.length > 0) {
        if (e.detail.filterBy === 'title' || e.detail.filterBy === 'ecm_fulltext') {
          this.nxProvider.params[e.detail.filterBy] = `${e.detail.value}*`;
        } else {
          this.nxProvider.params[e.detail.filterBy] = e.detail.value;
        }
        this.fetch();
      }
    }
  },

  scrollToItem(item) {
    this.$.list.scrollToItem(item);
  },

  scrollToIndex(index) {
    this.$.list.scrollToIndex(Math.min(Math.max(index, 0), this.items.length - 1));
  },

  focusOnIndexIfNotVisible(index) {
    if (!this.$.list._isIndexVisible(index)) {
      this.$.list.scrollToIndex(index);
    }
  },

  _observeEmptyLabel() {
    this._computedEmptyLabel = this.emptyLabel;
  },

  _quickFilterChanged() {
    this.fetch();
  },

  _updateFlags() {
    if (!this.loading) {
      this.size = this.items && this.items.length > 0 ? this.items.length : 0;
      this._isSelectAllIndeterminate = this.selectedItems
      && this.selectedItems.length > 0
      && this.selectedItems.length < this.size;
      this._isSelectAllChecked = this.selectedItems
      && this.selectedItems.length > 0
      && this.selectedItems.length === this.size;
      this._isEmpty = this.size === 0;
      this._computedEmptyLabel = (this.filters && this.filters.length > 0) ?
        this.emptyLabelWhenFiltered : this.emptyLabel;
    } else {
      this._computedEmptyLabel = this.i18n('label.loading');
    }
  },

  /**
   * This function can be overridden by elements that includes this behavior.
   * That allows to use different items array initialization.
   */
  reset(size) {
    this._reset(size);
  },

  _reset(size) {
    if (this.maxItems && size && size > this.maxItems) {
      size = this.maxItems;
    }
    this.set('items', []);
    if (typeof size === 'number' && size > 0) {
      const arr = new Array(size);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = {};
      }
      this.set('items', arr);
    }
    flush();
    this.size = this.items.length;
    this.$.list.notifyResize();
  },

  /**
   * This function can be overridden by elements that includes this behavior.
   * That allows to use either range OR page based fetch APIs.
   * Default behavior is range base fetching.
   */
  fetch() {
    if (this._hasPageProvider()) {
      return this._fetchRange(0, this._pageSize - 1, true);
    }
    return Promise.resolve();
  },

  /**
   * Fetch a page and push the results to the items array.
   *
   * @param page Page index to fetch
   * @param pageSize Number of results per page
   */
  _fetchPage(page, pageSize) {
    if (this._hasPageProvider()) {
      const options = {
        skipAggregates: page && page > 1,
      };
      if (page) {
        this.nxProvider.page = page;
        if (page === 1) {
          this.reset();
        }
      }
      if (pageSize) {
        this.nxProvider.pageSize = pageSize;
      }
      this.nxProvider.offset = 0;
      return this.nxProvider.fetch(options).then((response) => {
        for (let i = 0; i < response.entries.length; i++) {
          this.push('items', response.entries[i]);
        }
        return response;
      });
    }
    return Promise.resolve();
  },

  /**
   * Fetch a range of items (and fill the items array accordingly)
   *
   * @param firstIndex First index to fetch
   * @param lastIndex Last index to fetch
   * @param clear Clear items array
   */
  _fetchRange(firstIndex, lastIndex, clear) {
    if (this._hasPageProvider()) {

      if (firstIndex === 0) {
        lastIndex = this._pageSize - 1;
      }

      if (this.maxItems && lastIndex > this.maxItems) {
        lastIndex = this.maxItems;
        clear = true;
      } else if (firstIndex > 0) {
        lastIndex += this._fetchAheadLimit;
        if (this.maxItems) {
          lastIndex = Math.min(lastIndex, this.maxItems - 1);
        }
      }

      if (!clear && this.items && this.items.length) {
        const shouldLoad = this.items.slice(firstIndex, lastIndex).some((el, idx) => {
          if (!el || (Object.keys(el).length === 0 && el.constructor === Object)) {
            firstIndex += idx;
            return true;
          }
          return false;
        });
        if (!shouldLoad) {
          return;
        }
      }

      // update items array based on first and last visible indexes
      this.nxProvider.offset = firstIndex;
      this.nxProvider.page = 1;
      this.nxProvider.pageSize = (lastIndex - firstIndex) + 1;
      const options = {
        skipAggregates: firstIndex !== 0,
      };
      return this.nxProvider.fetch(options).then((response) => {
        if (!response) {
          return;
        }

        // get results count, and reset the array if it differs from current array length
        let count;
        if (response.resultsCount < 0) {
          // negative resultCount means unknown value, fall back on currentPageSize
          count = response.resultsCountLimit > 0 ? response.resultsCountLimit : response.currentPageSize;
        } else if (response.resultsCountLimit > 0 && response.resultsCountLimit < response.resultsCount) {
          count = response.resultsCountLimit;
        } else {
          count = response.resultsCount;
        }
        if (this.maxItems) {
          if (count > this.maxItems) {
            count = this.maxItems;
          }
        }
        if (clear || this.items.length !== count) {
          this.reset(count);
        }

        // fill items range based on response
        let entryIndex = 0;
        for (let i = firstIndex; i <= lastIndex; i++) {
          if (entryIndex < response.entries.length) {
            const isSelected = this._isSelected(this.items[i]);

            this.set(`items.${i}`, response.entries[entryIndex++]);

            if (isSelected) {
              this.selectIndex(i);
            }
          }
        }

        // quick filters
        this.quickFilters = this.nxProvider.quickFilters;

        // check if there is any active quick filter
        const hasActiveQuickFilters = this.quickFilters ?
          Object.keys(this.quickFilters).some((k) => this.quickFilters[k].active) : false;

        // update buckets array based on provider's sort property
        let buckets = [];
        if (response.aggregations && !hasActiveQuickFilters) {
          const providerSort = this.nxProvider.sort;
          if (providerSort && Object.keys(providerSort).length === 1) {
            const providerField = Object.keys(providerSort)[0];
            const providerOrder = providerSort[providerField];
            Object.keys(response.aggregations).forEach((key) => {
              const aggregation = response.aggregations[key];
              if (aggregation.field === providerField && aggregation.buckets.length >= buckets.length &&
                  aggregation.properties && aggregation.properties.order) {
                const order = aggregation.properties.order.split(' ');
                if (order.length > 0 && order[0] === 'key') {
                  buckets = aggregation.buckets;
                }
                if (order.length > 1 && order[1] !== providerOrder) {
                  buckets.reverse();
                }
              }
            });
          }
          this.set('buckets', buckets);
        }

        this.fire('nuxeo-page-loaded');

      });
    }
    return Promise.resolve();
  },

  _scrollChanged() {
    this._debouncer = Debouncer.debounce(
      this._debouncer, timeOut.after(this.scrollThrottle > 0 ? this.scrollThrottle : 1),
      () => this._fetchRange(this.$.list.firstVisibleIndex, this.$.list.lastVisibleIndex),
    );
  },

  modelForElement(el) {
    return this.$.list.modelForElement(el);
  },

}];
