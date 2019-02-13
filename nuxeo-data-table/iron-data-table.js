/**
@license
Copyright 2016 Sauli Tähkäpää

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
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/iron-list/iron-list.js';
import '@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/paper-styles/paper-styles-classes.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { microTask, timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '../widgets/nuxeo-dialog.js';
import './data-table-column.js';
import './data-table-column-sort.js';
import './data-table-column-filter.js';
import './data-table-cell.js';
import './data-table-row.js';
import './data-table-row-detail.js';
import './data-table-checkbox.js';
import './data-table-settings.js';
import './default-styles.js';
import './data-table-icons.js';
import './nuxeo-data-table-row-actions.js';
import './nuxeo-data-table-form.js';
import { PageProviderDisplayBehavior } from '../nuxeo-page-provider-display-behavior.js';
import { DraggableListBehavior } from '../nuxeo-draggable-list-behavior.js';

{
  /**
   * An element to display a page provider result within a table with infinite scrolling.
   *
   * Example:
   *
   *     <nuxeo-page-provider id="cvProvider" auto
   *       provider="default_search"
   *       page-size="40"
   *       aggregations="{{aggregations}}">
   *     </nuxeo-page-provider>
   *
   *     <nuxeo-data-table id="datatable"
   *       nx-provider="cvProvider">
   *       <nuxeo-data-table-column name="Full text search" flex="100" filter-by="ecm_fulltext" sort-by="dc:title">
   *         <template>
   *           <a class="title ellipsis">[[item.title]]</a>
   *         </template>
   *       </nuxeo-data-table-column>
   *       <nuxeo-data-table-column filter-by="dc_modified_agg" flex="50" sort-by="dc:modified">
   *         <template is="header">
   *             <nuxeo-dropdown-aggregation
   *                 placeholder="Modified"
   *                 data="[[aggregations.dc_modified_agg]]"
   *                 value="{{column.filterValue}}" multiple>
   *             </nuxeo-dropdown-aggregation>
   *         </template>
   *         <template>
   *           [[item.properties.dc:modified]]
   *         </template>
   *       </nuxeo-data-table-column>
   *       <nuxeo-data-table-column filter-by="dc_creator_agg" flex="50">
   *               <template is="header">
   *                 <nuxeo-dropdown-aggregation
   *                     placeholder="Author"
   *                     data="[[aggregations.dc_creator_agg]]"
   *                     value="{{column.filterValue}}" multiple>
   *                 </nuxeo-dropdown-aggregation>
   *             </template>
   *         <template>
   *           <span class="tag user">[[item.properties.dc:creator]]</span>
   *         </template>
   *       </nuxeo-data-table-column>
   *     </nuxeo-data-table>
   *
   * @appliesMixin Polymer.IronResizableBehavior
   * @appliesMixin Polymer.IronFormElementBehavior
   * @appliesMixin Polymer.IronValidatableBehavior
   * @appliesMixin Nuxeo.PageProviderDisplayBehavior
   * @appliesMixin Nuxeo.DraggableListBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-data-table/index.html
   */
  class DataTable
    extends mixinBehaviors([IronResizableBehavior, IronFormElementBehavior,
      IronValidatableBehavior, PageProviderDisplayBehavior,
      DraggableListBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
        position: relative;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        width: 100%;
        min-height: 300px;
        @apply --iron-data-table;
      }

      :host([draggable]) ::slotted(nuxeo-data-table-row[selected]) {
        cursor: -webkit-grab;
        cursor: grab;
      }

      :host .droptarget-hover ::slotted(nuxeo-data-table-row) {
        border: 2px dashed var(--nuxeo-primary-color, blue);
      }

      /* scrollbars */
      :host ::-webkit-scrollbar-track {
        width: 12px !important;
        height: 3px;
      }
      :host ::-webkit-scrollbar {
        background-color: rgba(0, 0, 0, 0.03);
        width: 12px !important;
        height: 3px;
      }
      :host ::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.15);
        border-radius: 1px !important;
      }

      :host([required]) label::after {
        display: inline-block;
        content: '*';
        margin-left: 4px;
        color: var(--paper-input-container-invalid-color, red);
      }

      [hidden] {
        display: none !important;
      }

      #container {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
      }

      #header {
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
        transition: box-shadow 200ms;
        -webkit-transition: box-shadow 200ms;
        @apply --iron-data-table-header;
        background: var(--nuxeo-table-header-background, #efefef);
      }

      #header.scrolled {
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06),
                    0 2px 0 rgba(0, 0, 0, 0.075),
                    0 3px 0 rgba(0, 0, 0, 0.05),
                    0 4px 0 rgba(0, 0, 0, 0.015);
      }

      #list {
        overflow-x: hidden !important;
        overflow-y: auto !important;
        flex: 1;
        transition: opacity 200ms;
        -webkit-transition: opacity 200ms;
      }

      #list .item {
        background: var(--nuxeo-table-items-background, #ffffff);
      }

      .emptyResult {
        opacity: .5;
        display: block;
        font-weight: 300;
        padding: 1.5em .7em;
        text-align: center;
        font-size: 1.1em;
      }

      .top-actions {
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-justified;
        margin-right: 8px;
      }

      .top-actions paper-button {
        padding: 0;
        margin-right: 6px;
      }

      .error {
        color: var(--paper-input-container-invalid-color, red);
      }

      label {
        display: block;
        @apply --nuxeo-label;
      }
    </style>

    <div id="container">

      <slot name="nuxeo-selection-toolbar"></slot>

      <div class="top-actions">
        <label>[[label]]</label>
        <dom-if if="[[editable]]">
          <template>
            <paper-button id="addEntry" noink="" class="primary" on-click="_createEntry">
              + [[i18n('command.add')]]
            </paper-button>
          </template>
        </dom-if>
      </div>

      <label class="error" hidden\$="[[!invalid]]">[[errorMessage]]</label>

      <div id="header">
        <nuxeo-data-table-row header="">
          <nuxeo-data-table-checkbox header="" hidden\$="[[!selectionEnabled]]"></nuxeo-data-table-checkbox>
          <dom-repeat items="[[columns]]" as="column">
            <template>
              <nuxeo-data-table-cell
                header=""
                align-right="[[column.alignRight]]"
                before-bind="[[beforeCellBind]]"
                column="[[column]]"
                flex="[[column.flex]]"
                hidden="[[column.hidden]]"
                order="[[column.order]]"
                table="[[_this]]"
                template="[[column.headerTemplate]]"
                width="[[column.width]]">
                <nuxeo-data-table-column-sort
                  sort-order="[[sortOrder]]"
                  path="[[column.sortBy]]"
                  on-sort-direction-changed="_sort"
                  hidden\$="[[!column.sortBy]]">
                </nuxeo-data-table-column-sort>
              </nuxeo-data-table-cell>
            </template>
          </dom-repeat>
          <nuxeo-data-table-cell flex="0" hidden\$="[[!editable]]"></nuxeo-data-table-cell>
          <nuxeo-data-table-settings columns="{{columns}}" hidden\$="[[!settingsEnabled]]"></nuxeo-data-table-settings>
        </nuxeo-data-table-row>
      </div>

      <dom-if if="[[_isEmpty]]">
        <template>
          <div class="emptyResult">[[_computedEmptyLabel]]</div>
        </template>
      </dom-if>

      <iron-list
        id="list"
        items="[[items]]"
        as="item"
        selected-items="{{selectedItems}}"
        selected-item="{{selectedItem}}"
        on-scroll="_scroll">

        <template>
          <div class="item">
            <nuxeo-data-table-row
              on-click="_onRowClick"
              before-bind="[[beforeRowBind]]"
              even\$="[[!_isEven(index)]]"
              expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]"
              index="[[index]]"
              item="[[item]]"
              tabindex="-1"
              selected="[[_isSelected(item, selectedItems, selectedItems.*)]]">
              <nuxeo-data-table-checkbox
                hidden\$="[[!selectionEnabled]]"
                tabindex="0"
                checked\$="[[selected]]"
                on-click="_onCheckBoxTap"></nuxeo-data-table-checkbox>
              <dom-repeat items="[[columns]]" as="column" index-as="colIndex">
                <template>
                  <nuxeo-data-table-cell
                    template="[[column.template]]"
                    table="[[_this]]"
                    align-right="[[column.alignRight]]"
                    column="[[column]]"
                    expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]"
                    flex="[[column.flex]]"
                    hidden="[[column.hidden]]"
                    index="[[index]]"
                    item="[[item]]"
                    order="[[column.order]]"
                    selected="[[_isSelected(item, selectedItems, selectedItems.*)]]"
                    width="[[column.width]]"
                    before-bind="[[beforeCellBind]]"></nuxeo-data-table-cell>
                </template>
              </dom-repeat>
              <dom-if if="[[_isExpanded(item, _expandedItems)]]" on-dom-change="_updateSizeForItem">
                <template>
                  <nuxeo-data-table-row-detail
                    index="[[index]]"
                    item="[[item]]"
                    expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]"
                    selected="[[_isSelected(item, selectedItems, selectedItems.*)]]"
                    before-bind="[[beforeDetailsBind]]"
                    table="[[_this]]"
                    template="[[rowDetail]]"></nuxeo-data-table-row-detail>
                </template>
              </dom-if>
                <nuxeo-data-table-row-actions
                  index="[[index]]"
                  editable="[[editable]]"
                  orderable="[[orderable]]"
                  template="[[rowForm]]"
                  item="[[item]]"
                  size="[[items.length]]"
                  table="[[_this]]">
                </nuxeo-data-table-row-actions>
            </nuxeo-data-table-row>
          </div>
        </template>
      </iron-list>

      <iron-scroll-threshold
        id="scrollThreshold"
        scroll-target="list"
        on-lower-threshold="_threshold"></iron-scroll-threshold>

    </div>

    <slot id="columns"></slot>

    <nuxeo-dialog id="dialog" with-backdrop="" on-opened-changed="_formDialogOpenedChanged">
      <h2>[[i18n('command.add')]]</h2>
      <paper-dialog-scrollable>
        <slot id="form" name="form"></slot>
      </paper-dialog-scrollable>
      <div class="buttons">
        <paper-button noink="" dialog-dismiss="">[[i18n('command.cancel')]]</paper-button>
        <paper-button id="save" noink="" on-click="_validateEntry" class="primary">[[i18n('command.ok')]]</paper-button>
      </div>
    </nuxeo-dialog>
`;
    }

    static get is() {
      return 'nuxeo-data-table';
    }

    static get properties() {
      return {
        /**
         * @ignore
         * A function that is called before data is bound to a row or header cell.
         * Can be used to customize the cell element depending on the data.
         * #### Example:
         * ```js
         * function(data, cell) {
         *   cell.toggleClass('custom', data.useCustomClass);
         * }
         * ```
         */
        beforeCellBind: Object,

        /**
         * @ignore
         * A function that is called before data is bound to a row details element.
         * Can be used to customize the element depending on the data.
         * #### Example:
         * ```js
         * function(data, details) {
         *   details.toggleClass('custom', data.useCustomClass);
         * }
         * ```
         */
        beforeDetailsBind: Object,

        /**
         * @ignore
         * A function that is called before data is bound to a row.
         * Can be used to customize the row element depending on the data.
         * #### Example:
         * ```js
         * function(data, row) {
         *   row.toggleClass('custom', data.useCustomClass);
         * }
         * ```
         */
        beforeRowBind: Object,

        /**
         * @ignore
         * If `true`, tapping a row will expand the item details, if available.
         */
        detailsEnabled: {
          type: Boolean,
          value: false,
        },

        /**
         * @ignore
         * An array of `data-table-column` elements which contain the templates
         * to be stamped with items.
         */
        columns: {
          type: Array,
          notify: true,
          value() {
            return [];
          },
          observer: '_columnsChanged',
        },

        _expandedItems: {
          type: Array,
          value() {
            return [];
          },
        },

        _this: {
          type: Object,
          value() {
            return this;
          },
        },

        label: {
          type: String,
        },

        required: {
          type: Boolean,
          value: false,
        },

        errorMessage: {
          type: String,
        },
        /**
         * If enabled, it allows user to select which result columns to display in the search results.
         */
        settingsEnabled: {
          type: Boolean,
          value: false,
        },
        /**
         * If enabled, it allows to select multiple documents and apply an action on them,
         * like moving them to trash, to favorites or to a collection.
         */
        multiSelection: {
          type: Boolean,
          value: true,
        },
        /**
         * @ignore
         */
        editable: {
          type: Boolean,
          value: false,
        },
        /**
         * In the context of multivalued fields, it displays icons to reorder the properties up or down.
         */
        orderable: {
          type: Boolean,
          value: false,
        },
        /**
         * If enabled, pagination will be used instead of lazy loading.
         */
        paginable: {
          type: Boolean,
          value: false,
        },
      };
    }

    constructor() {
      super();
      this.handlesSorting = true;
      this._observer = dom(this).observeNodes((info) => {
        const hasColumns = function (node) {
          return (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'NUXEO-DATA-TABLE-COLUMN');
        };

        const hasDetails = function (node) {
          return (node.nodeType === Node.ELEMENT_NODE &&
              node.tagName === 'TEMPLATE' && node.hasAttribute('is') &&
              node.getAttribute('is') === 'row-detail');
        };

        if (info.addedNodes.filter(hasColumns).length > 0 ||
            info.removedNodes.filter(hasColumns).length > 0) {
          this.set('columns', this.$.columns.assignedNodes().filter(hasColumns));
          this._backupColumnsState();
          this.notifyResize();
        }

        if (info.addedNodes.filter(hasDetails).length > 0) {
          this.set('rowDetail', this.getContentChildren('[select="template[is=row-detail]"]')[0]);

          // assuming parent element is always a Polymer element.
          // set dataHost to the same context the template was declared in
          const parent = dom(this.rowDetail).parentNode;
          this.rowDetail._rootDataHost = parent.dataHost ? (parent.dataHost._rootDataHost || parent.dataHost) : parent;
        }
      });
    }

    ready() {
      super.ready();
      this.addEventListener('iron-resize', this._resizeCellContainers);
      this.addEventListener('item-changed', this._itemChanged);
      this.addEventListener('scroll', this._onHorizontalScroll);
      this.addEventListener('edit-entry', this._editEntry);
      this.addEventListener('delete-entry', this._deleteEntry);
      this.addEventListener('move-upward', this._moveItemUpward);
      this.addEventListener('move-downward', this._moveItemDownward);
      this.$.list._selectionHandler = function (e) {
        const model = this.modelForElement(e.target);
        if (!model) {
          return;
        }
        this.toggleSelectionForItem(model[this.as]);
      };
      // listen for changes in form slot contents to make sure we disable the form when it is stamped.
      // the form will be enabled/disabled when the dialog is opened/closed.
      // this allow us to bypass the form validation when it's not visible.
      const slot = this.shadowRoot.querySelector('#form');
      slot.addEventListener('slotchange', () => {
        const form = this.getContentChildren('#form')[0];
        form.disabled = true;
      });
    }

    _itemChanged(e) {
      if (this.items) {
        let index = e.target.index;
        if (index === undefined) {
          index = this.items.indexOf(e.detail.item);
        }
        if (index >= 0) {
          let path = `items.${index}`;
          if (e.detail.path) {
            path += `.${e.detail.path}`;
          }
          this.set(path, e.detail.value);
        }
      }
    }

    _backupColumnsState() {
      this.columns.forEach((col) => {
        col.hiddenBack = col.hidden;
      });
    }

    _bind(item, index) {
      if (index !== undefined) {
        return {
          item,
          index,
        };
      } else {
        return {
          column: item,
        };
      }
    }

    _isEven(index) {
      return index % 2 === 0;
    }

    _columnsChanged(columns, oldColumns) {
      if (oldColumns) {
        oldColumns.forEach((column) => {
          this.unlisten(column, 'filter-value-changed');
        });
      }

      if (columns) {
        columns.forEach((column) => {
          column.table = this;
          this.listen(column, 'filter-value-changed', '_onColumnFilterChanged');
        });
      }
    }

    _resizeCellContainers() {
      // reset header width first to make the cells and scroll width to reset their widths.
      this.$.container.style.width = '';

      microTask.run(() => {
        this.$.container.style.width = `${Math.min(this.scrollWidth, this.clientWidth + this.scrollLeft)}px`;
        // add scrollbar width as padding
        this.$.header.style.paddingRight = `${this.$.list.offsetWidth - this.$.list.clientWidth}px`;
      });
    }

    _onHorizontalScroll() {
      if (!this.isDebouncerActive('scrolling')) {
        this.$.container.style.width = `${this.scrollWidth}px`;
        this._debouncer = Debouncer.debounce(
          this._debouncer,
          timeOut.after(1000), () => {
            // long timeout here to prevent jerkiness with the rubberband effect on iOS especially.
            this.$.container.style.width = `${Math.min(this.scrollWidth, this.clientWidth + this.scrollLeft)}px`;
          },
        );
      }
    }

    _updateSizeForItem(event) {
      if (event.model.get('item')) {
        // notifyResize() doesn't do anything on iOS if the viewport size hasn't changed
        // so calling updateSizeForItem(item) is more reliable.

        // TODO: However, since we're reusing the same items array in most cases,
        // the _collection item map inside <iron-list> gets out of sync and
        // that breaks things like selection and updateSizeForItem.
        // To mitigate the issue, we'll update height of every row element.
        // Can be optimized later if needed to update only the row that has
        // expanded or collapsed.
        const itemSet = [];
        for (let i = 0; i < this.$.list._physicalItems.length; i++) {
          itemSet.push(i);
        }

        // extracted from updateSizeFromItem(item) in <iron-list>
        this.$.list._updateMetrics(itemSet);
        this.$.list._positionItems();
      }
    }

    /**
     * Expands the row details for this item, if available.
     */
    expandItem(item) {
      if (this.rowDetail && this._expandedItems && !this._isExpanded(item, this._expandedItems)) {

        // replacing the whole array here to simplify the observers.
        this._expandedItems.push(item);
        this._expandedItems = this._expandedItems.slice(0);
      }
    }

    /**
     * Collapses the row details for this item, if expanded.
     */
    collapseItem(item) {
      if (this.rowDetail && this._expandedItems && this._isExpanded(item, this._expandedItems)) {
        const index = this._expandedItems.indexOf(item);

        // replacing the whole array here to simplify the obsevers.
        this._expandedItems.splice(index, 1);
        this._expandedItems = this._expandedItems.slice(0);
      }
    }

    _isExpanded(item, items) {
      return items && items.indexOf(item) > -1;
    }

    _isFocusable(target) {
      if (false) { // eslint-disable-line no-constant-condition
        // https://nemisj.com/focusable/
        // tabIndex is not reliable in IE.
        return target.tabIndex >= 0;
      } else {
        // unreliable with Shadow, document.activeElement doesn't go inside
        // the shadow root.
        return target.contains(dom(document.activeElement).node) ||
            target.tagName === 'NUXEO-DATA-TABLE-CHECKBOX' || target.tagName === 'A';
      }
    }

    /**
     * Fired when user clicks on a item to select it. Note that this event is
     * not fired when user clicks on a multi-selection checkbox.
     *
     * @event selecting-item
     * @param {Object} detail
     * @param {Object} detail.item item to be selected
     */

    /**
     * Fired when user clicks on a item to deselect it. Note that this event is
     * not fired when user clicks on a multi-selection checkbox.
     *
     * @event deselecting-item
     * @param {Object} detail
     * @param {Object} detail.item item to be deselected
     */

    /**
     * Fired when user clicks on a item to expand it.
     *
     * @event expanding-item
     * @param {Object} detail
     * @param {Object} detail.item item to be expanded
     */

    /**
     * Fired when user clicks on a item to collapse it.
     *
     * @event collapsing-item
     * @param {Object} detail
     * @param {Object} detail.item item to be collapsed
     */

    // we need to listen to click instead of tap because on mobile safari, the
    // document.activeElement has not been updated (focus has not been shifted)
    // yet at the point when tap event is being executed.
    _onRowClick(ev) {
      // Prevent item selection if row itself is not focused. This means that
      // an element inside the row has been focused.
      // Mobile devices don't move focus from body unless it's an input element that is focused, so this element
      // will never get focused.
      if (!this._isFocusable(dom(ev).localTarget)) {
        const fireEvent = function (eventName, item, defaultAction) {
          const e = new CustomEvent(eventName, {
            cancelable: true,
            composed: true,
            bubbles: true,
            detail: { item },
          });
          this.dispatchEvent(e);
          if (!e.defaultPrevented) {
            defaultAction.call(this, item);
          }
        }.bind(this);

        if (this.rowDetail && this.detailsEnabled) {
          if (this._isExpanded(ev.model.item, this._expandedItems)) {
            fireEvent('collapsing-item', ev.model.item, this.collapseItem);
          } else {
            fireEvent('expanding-item', ev.model.item, this.expandItem);
          }
        } else {
          this.dispatchEvent(new CustomEvent('row-clicked', {
            composed: true,
            bubbles: true,
            detail: { item: ev.model.item, index: ev.model.index },
          }));
        }
      }
    }

    get settings() {
      const tableSettings = {};
      tableSettings.columns = {};
      if (this.columns) {
        this.columns.forEach((column, idx) => {
          tableSettings.columns[column.field ? column.field : `col-${idx}`] = { hidden: column.hidden };
        });
      }
      return tableSettings;
    }

    set settings(settings) {
      if (settings) {
        if (this.columns && settings.columns) {
          this.columns.forEach(function (column, idx) {
            this.set(
              `columns.${idx}.hidden`,
              settings.columns[column.field ? column.field : `col-${idx}`].hidden,
            );
          }, this);
        }
      }
    }

    _onCheckBoxTap(e) {
      if (this.selectionEnabled) {
        this.$.list.toggleSelectionForIndex(e.model.index);
        const target = e.target || e.srcElement;
        target.dispatchEvent(new CustomEvent('selected', {
          composed: true,
          bubbles: true,
          detail: { index: e.model.index, shiftKey: e.shiftKey },
        }));
        this._updateFlags();
      }
    }

    _editEntry(e) {
      e.stopPropagation();
      this._toggleEditDialog(e.detail.index);
    }

    _validateEntry() {
      const dtform = this.getContentChildren('#form')[0];
      if (dtform.validateItem()) {
        const item = this._deepCopy(dtform.item);
        if (dtform.index > -1) {
          this.set(`items.${dtform.index}`, item);
        } else {
          this.push('items', item);
        }
        this.notifyResize();
        this.$.dialog.close();
      }
    }

    _deepCopy(obj) {
      let cache = [];
      const result = JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
            // Circular reference found, discard key
            return;
          }
          // Store value in our collection
          cache.push(value);
        }
        return value;
      }));
      // Allow GC
      cache = null;
      return result;
    }

    _toggleEditDialog(itemIndex) {
      const dtform = this.getContentChildren('#form')[0];
      if (typeof itemIndex !== 'undefined') {
        dtform.index = itemIndex;
        dtform.item = this._deepCopy(this.items[itemIndex]);
      } else {
        dtform.index = -1;
        if ((this.items.length > 1 && typeof this.items[0] !== 'object') || this.columns.length === 1) {
          // dirty but will work with primitive such as string, number, etc.
          dtform.item = '';
        } else {
          dtform.item = {};
        }
      }
      this.$.dialog.toggle();
    }

    _deleteEntry(e) {
      e.stopPropagation();
      this.splice('items', e.detail.index, 1);
      this.notifyResize();
    }

    _createEntry() {
      if (!this.items) {
        this.items = [];
      }
      this.notifyResize();
      this._toggleEditDialog();
    }

    _moveItemUpward(e) {
      e.stopPropagation();
      if (e.detail.index > 0) {
        const item = this.items[e.detail.index];
        this.splice('items', e.detail.index, 1);
        this.splice('items', e.detail.index - 1, 0, item);
        this.notifyResize();
      }
    }

    _moveItemDownward(e) {
      e.stopPropagation();
      if ((this.items.length - 1) > e.detail.index) {
        const item = this.items[e.detail.index];
        this.splice('items', e.detail.index, 1);
        this.splice('items', e.detail.index + 1, 0, item);
        this.notifyResize();
      }
    }

    _patchOverlay(e) {
      if (e.target.withBackdrop) {
        e.target.parentNode.insertBefore(e.target.backdropElement, e.target);
      }
    }

    fetch() {
      if (this._hasPageProvider()) {
        if (this.paginable) {
          if (this.nxProvider.page === 1) {
            this._reset(0);
            this.$.scrollThreshold.clearTriggers();
          }
          const result = this._fetchPage(this.nxProvider.page, this.nxProvider.pageSize);
          if (result) {
            return result.then(() => {
              this.nxProvider.page += 1;
              this.$.scrollThreshold.clearTriggers();
              this.$.list.notifyResize();
            });
          } else {
            this.$.scrollThreshold.clearTriggers();
            this.$.list.notifyResize();
          }
        } else {
          return this._fetchRange(0, this.nxProvider.pageSize, true);
        }
      }
    }

    _threshold() {
      if (this.paginable) {
        this.fetch();
      }
    }

    _scroll() {
      if (!this.paginable) {
        this._scrollChanged();
      }
    }

    _sort(e) {
      if (this.paginable) {
        this.nxProvider.page = 1;
      }
      this._sortDirectionChanged(e);
    }

    /* Override method from Polymer.IronValidatableBehavior. */
    _getValidity() {
      return this.required ? this.items && this.items.length > 0 : true;
    }

    draggableFilter(el) {
      const row = el.closest('nuxeo-data-table-row');
      return row && row.selected;
    }

    _formDialogOpenedChanged(e) {
      const form = this.getContentChildren('#form')[0];
      if (form) {
        // disable form when the dialog is closed, to make sure we bypass validation when the form is not visible
        form.disabled = !e.detail.value;
      }
    }
  }

  customElements.define(DataTable.is, DataTable);
  Nuxeo.DataTable = DataTable;
}
