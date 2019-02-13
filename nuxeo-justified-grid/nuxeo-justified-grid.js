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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';
import '@polymer/iron-list/iron-list.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/array-selector.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { PageProviderDisplayBehavior } from '../nuxeo-page-provider-display-behavior.js';
import { RoutingBehavior } from '../nuxeo-routing-behavior.js';

{
  /**
   * An element for displaying page provider results in a justified grid with infinite scrolling.
   *
   * @memberof Nuxeo
   * @appliesMixin Polymer.IronResizableBehavior
   * @appliesMixin Polymer.Templatizer
   * @appliesMixin Nuxeo.PageProviderDisplayBehavior
   * @appliesMixin Nuxeo.RoutingBehavior
   * @demo demo/nuxeo-justified-grid/index.html
   */
  class JustifiedGrid
    extends mixinBehaviors([IronResizableBehavior, Templatizer,
      PageProviderDisplayBehavior, RoutingBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
      }

      #container {
        position: relative;
        height: 100%;
        width: 100%;
      }

      #list {
        @apply --layout-fit;
      }

      #list::after {
        content: '';
        flex-grow: 999999999;
      }

      #list .row {
        display: flex;
        flex-direction: row;
      }

      #list .item {
        position: relative;
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.04);
        border: 2px solid transparent;
        cursor: pointer;
        outline: none;
      }

      #list .item[selected], #list .item:hover, #list .item:focus {
        border: 2px solid var(--nuxeo-grid-selected, transparent);
        background-color: var(--nuxeo-grid-selected, transparent);
        color: white;
      }

      #list .item paper-icon-button {
        position: absolute;
        left: 10px;
        top: 10px;
        background-color: rgba(255, 255, 255, 0.95);
        border: 2px solid var(--nuxeo-grid-selected);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        padding: 2px;
        color: var(--nuxeo-grid-selected);
        display: none;
      }

      #list .item[selected] paper-icon-button {
        border: 2px solid var(--nuxeo-grid-selected);
        background-color: var(--nuxeo-grid-selected);
        color: white;
        display: block;
      }

      #list .item:hover paper-icon-button,
      #list .item paper-icon-button[selection-mode] {
        display: block;
      }

      [hidden] {
        display: none !important;
      }

      .emptyResult {
        opacity: .5;
        display: block;
        font-weight: 300;
        padding: 1.5em .7em;
        text-align: center;
        font-size: 1.1rem;
      }
    </style>

    <dom-if if="[[_isEmpty]]">
      <template>
        <div class="emptyResult">[[_computedEmptyLabel]]</div>
      </template>
    </dom-if>

    <div id="container">
      <iron-list id="list" items="[[rows]]" as="row" on-iron-resize="_resize">
        <template>
          <div class="row">
            <dom-repeat items="[[row]]">
              <template>
                <div
                  class="item"
                  tabindex="0"
                  on-click="_click"
                  selected\$="[[_isSelected(item, selectedItems.*)]]"
                  style\$="height: [[item._view.height]]px; width: [[item._view.width]]px;">
                <div id="item-[[item._view.index]]"></div>[[_itemChanged(item, item._view.width, item._view.height)]]
                  <paper-icon-button
                    noink
                    icon="icons:check"
                    selection-mode\$="[[selectionMode]]"
                    hidden\$="[[!selectionEnabled]]"
                    on-click="_check">
                  </paper-icon-button>
                </div>
              </template>
            </dom-repeat>
          </div>
        </template>
      </iron-list>

      <iron-scroll-threshold id="scrollThreshold" scroll-target="list" on-lower-threshold="fetch">
      </iron-scroll-threshold>
      <array-selector id="selector" items="{{items}}" selected="{{selectedItems}}" multi=""></array-selector>
    </div>
`;
    }

    static get is() {
      return 'nuxeo-justified-grid';
    }

    static get properties() {
      return {
        /**
         * Height of each result line in pixels.
         */
        rowHeight: {
          type: Number,
          value: 196,
        },
        /**
         * Page number the search result starts from.
         */
        page: {
          type: Number,
          value: 1,
        },
        /**
         * Number of results per page. The maximum number recommended is 200 if results display thumbnails.
         */
        pageSize: {
          type: Number,
          value: 50,
        },

        rows: {
          type: Array,
          value: [],
        },

        _isFetching: {
          type: Boolean,
          value: false,
        },

        _templateElement: {
          type: Object,
        },
      };
    }

    static get observers() {
      return [
        '_selectedItemsChanged(selectedItems.splices)',
      ];
    }

    ready() {
      super.ready();
      const template = dom(this).querySelector('template');
      if (template) {
        this.templatize(template);
        this._templateElement = this.stamp().root.firstElementChild;
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._templateElement = null;
    }

    _itemChanged(item) {
      if (this._templateElement && item && item._view) {
        afterNextRender(this, () => {
          const el = this.$$(`#item-${item._view.index}`);
          if (el) {
            if (el.childNodes.length > 0) {
              el.childNodes[0].set('document', item);
            } else {
              const clone = this._templateElement.cloneNode(true);
              clone.set('document', item);
              el.appendChild(clone);
            }
          }
        });
      }
    }

    // overridden from Nuxeo.PageProviderDisplayBehavior
    reset() {
      this.set('items', []);
      this.set('rows', []);
      this.page = 1;
      this.$.scrollThreshold.clearTriggers();
    }

    // overridden from Nuxeo.PageProviderDisplayBehavior
    fetch() {
      if (this._isFetching || !this._hasPageProvider() || this.page > this.nxProvider.numberOfPages) {
        this.$.scrollThreshold.clearTriggers();
        this._isFetching = false;
        return Promise.resolve();
      }
      this._isFetching = true;
      return this._fetchPage(this.page, this.pageSize).then((response) => {
        this._addItems(response.entries);
        this.page += 1;
        this.$.scrollThreshold.clearTriggers();
        this._isFetching = false;
      });
    }

    // overridden from Nuxeo.PageProviderDisplayBehavior
    getSelectedItems() {
      return this.$.selector.selected;
    }

    // overridden from Nuxeo.PageProviderDisplayBehavior
    selectItem(item) {
      if (this.selectionEnabled) {
        this.$.selector.select(item);
        this._updateFlags();
      }
    }

    // overridden from Nuxeo.PageProviderDisplayBehavior
    selectIndex(index) {
      if (this.selectionEnabled) {
        this.$.selector.selectIndex(index);
        this._updateFlags();
      }
    }

    // overridden from Nuxeo.PageProviderDisplayBehavior
    selectItems(items) {
      if (this.selectionEnabled && items && items.length > 0) {
        items.forEach((item) => this.$.selector.select(item));
        this._updateFlags();
      }
    }

    // overridden from Nuxeo.PageProviderDisplayBehavior
    deselectItem(item) {
      if (this.selectionEnabled) {
        this.$.selector.deselect(item);
        this._updateFlags();
      }
    }

    // overridden from Nuxeo.PageProviderDisplayBehavior
    deselectIndex(index) {
      if (this.selectionEnabled) {
        this.$.selector.deselectIndex(index);
        this._updateFlags();
      }
    }

    // overridden from Nuxeo.PageProviderDisplayBehavior
    selectAll() {
      this.items.forEach((item) => this.$.selector.select(item));
      this._updateFlags();
    }

    // overridden from Nuxeo.PageProviderDisplayBehavior
    clearSelection() {
      this.$.selector.clearSelection();
      this._updateFlags();
    }

    _check(e) {
      if (this.selectionEnabled) {
        this.selectionMode = true;
        this._click(e);
      }
    }

    _click(e) {
      const index = e.model.item._view.index;
      if (this.selectionEnabled && this.selectionMode) {
        // since we are using Object.assign() when creating items for the grid, we cannot really use
        // selector.selectItem()/deselectItem() because it relies on indexOf and since the e.model.item is not a
        // reference of the original item, it doesn't work.
        if (this._isIndexSelected(index)) {
          this.deselectIndex(index);
        } else {
          this.selectIndex(index);
        }
      } else {
        this.dispatchEvent(new CustomEvent('navigate', {
          composed: true,
          bubbles: true,
          detail: { doc: this.items[index], index },
        }));
      }
      e.stopPropagation();
    }

    _selectedItemsChanged() {
      this.selectionMode = this.selectedItems && this.selectedItems.length > 0;
    }

    _isSelected(item) {
      return this._isIndexSelected(item._view.index);
    }

    _isIndexSelected(index) {
      return this.selectedItems.indexOf(this.items[index]) > -1;
    }

    /**
     * Adds a list of items to the grid. The `items` are computed and transformed into rows.
     * This is the ideal way to add new items to the grid (e.g. when loading more items with infinite scroll behavior).
     */
    _addItems(newItems) {
      let items = newItems;
      // recompute last row before adding new items
      if (this.rows.length > 0) {
        // get last row items
        const lastRowItems = this.rows[this.rows.length - 1].map((item) => this.items[item._view.index]);
        // append last row items to `newItems` param
        items = lastRowItems.concat(items);
        // drop last row
        this.pop('rows');
      }
      this._computeRows(items).forEach((row) => this.push('rows', row));
      this.$.scrollThreshold.clearTriggers();
    }

    /**
     * Given a set of items, computes a list of rows. The goal is to compute each row by trying to add items until
     * they fit. When a row doesn't have space to fit another item, we increase the height of the current row to take
     * advantage of the remaining width space to avoid cropping images.
     * Currently relies on `picture:info` to get the dimensions of a video/image. Fallbacks to square dimensions if the
     * document doesn't have the `picture` schema.
     */
    _computeRows(items) {
      const gridWidth = this.$.list.offsetWidth;
      const rows = [];
      let currentRowWidth = 0;
      let currentRow = [];
      items.forEach((item, idx) => {
        const clone = Object.assign({}, item);
        // fallback to square dimensions if item doesn't have a size object in it's model
        clone.size = clone.properties['picture:info'] || { width: 1, height: 1 };
        clone.size.width = clone.size.width || 1;
        clone.size.height = clone.size.height || 1;
        clone._view = {};
        clone._view.index = this.items.indexOf(item);

        // compute item width to fit a row with `rowHeight`
        // new width = original width * rowHeight / original height
        clone._view.width = clone.size.width * this.rowHeight / clone.size.height;
        clone._view.height = this.rowHeight;

        // if item fits, add it to current row
        if (currentRowWidth + clone._view.width <= gridWidth) {
          currentRow.push(clone);
          currentRowWidth += clone._view.width;
        } else {
          // current item doesn't fit in current row
          // fit items do width and push current row to rows
          rows.push(this._fitItemsToWidth(currentRow, currentRowWidth, gridWidth));
          // append current item (that didn't fit in current row) to a new row
          currentRow = [clone];
          currentRowWidth = clone._view.width;
        }

        if (idx === (items.length - 1)) {
          // fit items do width and push current row to rows
          rows.push(this._fitItemsToWidth(currentRow, currentRowWidth, gridWidth));
        }
      });
      return rows;
    }

    /**
     * Computes the ideal height of current row in order to increase the width of items and take advantage of the
     * remaining width space.
     */
    _fitItemsToWidth(currentRow, currentRowWidth, gridWidth) {
      const computedHeight = gridWidth * this.rowHeight / currentRowWidth;
      currentRow.forEach((item) => {
        item._view.height = computedHeight;
        item._view.width = item._view.width / currentRowWidth * gridWidth;
      });
      return currentRow;
    }

    /**
     * Recomputes rows when the browser window is resized.
     */
    _resize() {
      if (this.$.list.offsetWidth || this.$.list.offsetHeight) {
        this._debouncer = Debouncer.debounce(
          this._debouncer,
          timeOut.after(150), () => {
            this.rows = this._computeRows(this.items);
          },
        );
      }
    }
  }

  customElements.define(JustifiedGrid.is, JustifiedGrid);
  Nuxeo.JustifiedGrid = JustifiedGrid;
}
