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
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
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
import '../nuxeo-button-styles.js';

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
  class DataTable extends mixinBehaviors(
    [
      IronResizableBehavior,
      IronFormElementBehavior,
      IronValidatableBehavior,
      PageProviderDisplayBehavior,
      DraggableListBehavior,
    ],
    Nuxeo.Element,
  ) {
    static get template() {
      return html`
        <style include="nuxeo-button-styles">
          :host {
            display: block;
            position: relative;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
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
            color: var(--paper-input-container-invalid-color, #de350b);
          }

          :host([settings-enabled]) ::slotted(nuxeo-data-table-row:not([header])) {
            padding-inline-end: 1.5em;
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
            padding-inline-start: 2px;
            transition: box-shadow 200ms;
            -webkit-transition: box-shadow 200ms;
            @apply --iron-data-table-header;
          }

          #header.scrolled {
            box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06), 0 2px 0 rgba(0, 0, 0, 0.075), 0 3px 0 rgba(0, 0, 0, 0.05),
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
            opacity: 0.8;
            display: block;
            font-weight: 300;
            padding: 1.5em 0.7em;
            text-align: center;
            font-size: 1.1em;
          }

          .error {
            color: var(--paper-input-container-invalid-color, #de350b);
          }

          label {
            display: block;
            @apply --nuxeo-label;
          }

          .table-wrapper {
            overflow-y: scroll;
            position: relative;
          }
        </style>

        <div id="container">
          <slot name="nuxeo-selection-toolbar"></slot>

          <label>[[label]]</label>
          <label class="error" hidden$="[[!invalid]]">[[errorMessage]]</label>

          <div id="header">
            <nuxeo-data-table-row header>
              <nuxeo-data-table-checkbox
                style$="[[_computeSelectAllVisibility(selectionEnabled, selectAllEnabled, multiSelection)]]"
                checked="[[_isChecked(selectAllActive, _excludedItems, _excludedItems.*)]]"
                on-click="_toggleSelectAll"
              ></nuxeo-data-table-checkbox>
              <dom-repeat items="[[columns]]" as="column">
                <template>
                  <nuxeo-data-table-cell
                    header
                    align-right="[[column.alignRight]]"
                    before-bind="[[beforeCellBind]]"
                    column="[[column]]"
                    flex="[[column.flex]]"
                    hidden="[[column.hidden]]"
                    order="[[column.order]]"
                    resized="[[column.resized]]"
                    table="[[_this]]"
                    template="[[column.headerTemplate]]"
                    width="[[column.width]]"
                    overflow="[[column.overflow]]"
                  >
                    <nuxeo-data-table-column-sort
                      sort-order="[[sortOrder]]"
                      path="[[column.sortBy]]"
                      on-sort-direction-changed="_sort"
                      hidden$="[[!column.sortBy]]"
                    >
                    </nuxeo-data-table-column-sort>
                  </nuxeo-data-table-cell>
                </template>
              </dom-repeat>
              <div style$="[[_computeActionsStyle(editable, orderable)]]">
                <nuxeo-data-table-cell></nuxeo-data-table-cell>
              </div>
              <nuxeo-data-table-settings
                columns="{{columns}}"
                hidden$="[[!settingsEnabled]]"
              ></nuxeo-data-table-settings>
            </nuxeo-data-table-row>
          </div>

          <dom-if if="[[_isEmpty]]">
            <template>
              <div class="emptyResult" aria-live="polite">[[_computedEmptyLabel]]</div>
            </template>
          </dom-if>

          <iron-list
            id="list"
            items="[[items]]"
            as="item"
            selected-items="{{selectedItems}}"
            selected-item="{{selectedItem}}"
            on-scroll="_scroll"
          >
            <template>
              <div class="item">
                <nuxeo-data-table-row
                  on-click="_onRowClick"
                  before-bind="[[beforeRowBind]]"
                  even$="[[!_isEven(index)]]"
                  expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]"
                  index="[[index]]"
                  item="[[item]]"
                  tabindex="-1"
                  selected="[[_isSelected(item, selectedItems, selectedItems.*, _excludedItems, _excludedItems.*)]]"
                >
                  <nuxeo-data-table-checkbox
                    hidden$="[[!selectionEnabled]]"
                    checked$="[[_isSelected(item, selectedItems, selectedItems.*, _excludedItems, _excludedItems.*)]]"
                    on-click="_onCheckBoxTap"
                    on-keydown="_onCheckBoxKeydown"
                  ></nuxeo-data-table-checkbox>
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
                        resized="[[column.resized]]"
                        selected="[[_isSelected(item, selectedItems, selectedItems.*)]]"
                        width="[[column.width]]"
                        before-bind="[[beforeCellBind]]"
                        overflow="[[column.overflow]]"
                      ></nuxeo-data-table-cell>
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
                        template="[[rowDetail]]"
                      ></nuxeo-data-table-row-detail>
                    </template>
                  </dom-if>
                  <div style$="[[_computeActionsStyle(editable, orderable)]]">
                    <nuxeo-data-table-row-actions
                      index="[[index]]"
                      editable="[[editable]]"
                      orderable="[[orderable]]"
                      template="[[rowForm]]"
                      item="[[item]]"
                      size="[[items.length]]"
                      table="[[_this]]"
                    >
                    </nuxeo-data-table-row-actions>
                  </div>
                </nuxeo-data-table-row>
              </div>
            </template>
          </iron-list>

          <dom-if if="[[editable]]">
            <template>
              <paper-button id="addEntry" class="secondary" noink on-click="_createEntry">
                + [[i18n('command.add')]]
              </paper-button>
            </template>
          </dom-if>

          <iron-scroll-threshold
            id="scrollThreshold"
            scroll-target="list"
            on-lower-threshold="_threshold"
          ></iron-scroll-threshold>
        </div>

        <slot id="columns"></slot>

        <nuxeo-dialog id="dialog" with-backdrop on-opened-changed="_formDialogOpenedChanged">
          <h2>[[i18n('command.add')]]</h2>
          <paper-dialog-scrollable>
            <slot id="form" name="form"></slot>
          </paper-dialog-scrollable>
          <div class="buttons">
            <paper-button noink dialog-dismiss class="secondary">[[i18n('command.cancel')]]</paper-button>
            <paper-button id="save" noink on-click="_validateEntry" class="primary"
              >[[i18n('command.ok')]]</paper-button
            >
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
          reflectToAttribute: true,
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
        /**
         * proper table name for assistive technologies to identify the table correctly
         */
        captionText: {
          type: String,
          value: '',
        },
        /**
         * Provides a fixed height of the wrapper div containing the iron-list, where there is a limit to
         * the number of items displayed at a time on the UI.
         */
        _wrapperHeight: {
          type: String,
          value: '',
        },

        columnResizeEnabled: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        columnReorderEnabled: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },
      };
    }

    _isChecked(selectAllActive, _excludedItems) {
      return selectAllActive && _excludedItems.length === 0;
    }

    static get observers() {
      return ['_alignHeaderRow(items.length)', '_invalidateFieldTypeCacheFromItems(items)'];
    }

    constructor() {
      super();
      this.handlesSorting = true;
      this.handlesSelectAll = true;
      this._fieldTypeStats = null;
      this._fieldTypeHints = null;
      this._observer = dom(this).observeNodes((info) => {
        const hasColumns = function(node) {
          return node.nodeType === Node.ELEMENT_NODE && node instanceof Nuxeo.DataTableColumn;
        };

        const hasDetails = function(node) {
          return (
            node.nodeType === Node.ELEMENT_NODE &&
            node.tagName === 'TEMPLATE' &&
            node.hasAttribute('is') &&
            node.getAttribute('is') === 'row-detail'
          );
        };

        if (this._reorderingColumns) {
          return;
        }

        if (info.addedNodes.filter(hasColumns).length > 0 || info.removedNodes.filter(hasColumns).length > 0) {
          this.set('columns', this.$.columns.assignedNodes().filter(hasColumns));
          this._backupColumnsState();
          this.notifyResize();
        }

        if (info.addedNodes.filter(hasDetails).length > 0) {
          this.set('rowDetail', this.getContentChildren('[select="template[is=row-detail]"]')[0]);

          // assuming parent element is always a Polymer element.
          // set dataHost to the same context the template was declared in
          const parent = dom(this.rowDetail).parentNode;
          this.rowDetail._rootDataHost = parent.dataHost ? parent.dataHost._rootDataHost || parent.dataHost : parent;
        }
      });
    }

    ready() {
      super.ready();

      // ------------------------------------------------------------
      // Interaction state (resize + reorder)
      // ------------------------------------------------------------

      // Resize state
      this._resizing = null;

      // Reorder state
      this._reorderingColumns = false;
      this._draggingColumn = null;
      this._dragOverColumn = null;
      this._dragInsertAfter = false;

      // Cached geometry during drag (for stable hit-testing)
      this._dragCellsMeta = null;
      this._dragHeaderLeft = null;

      // Visual state
      this._activeColumn = null;

      this.addEventListener('iron-resize', this._resizeCellContainers);
      this.addEventListener('item-changed', this._itemChanged);
      this.addEventListener('scroll', this._onHorizontalScroll);
      this.addEventListener('edit-entry', this._editEntry);
      this.addEventListener('delete-entry', this._deleteEntry);
      this.addEventListener('move-upward', this._moveItemUpward);
      this.addEventListener('move-downward', this._moveItemDownward);
      // column resize and reorder listeners
      this.addEventListener('column-resize-start', this._onColumnResizeStart.bind(this));
      this.addEventListener('column-drag-start', this._onColumnDragStart.bind(this));
      this.addEventListener('column-drag-end', this._onColumnDragEnd.bind(this));

      this.$.list._selectionHandler = function(e) {
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
        this._updateRequiredColumns();
      });

      this.setAttribute('role', 'table');
      this.setAttribute('aria-multiselectable', this.multiSelection);
      this.setAttribute('aria-label', this.captionText);
      const wrapperHeight = this.getAttribute('wrapper-height');
      if (wrapperHeight) {
        this._wrapperHeight = wrapperHeight;
        this._onWrapperHeightChanged();
      }

      // bound handlers for document-level mouse operations
      this._boundDocumentMouseMove = this._documentMouseMove.bind(this);
      this._boundDocumentMouseUp = this._documentMouseUp.bind(this);

      afterNextRender(this, () => {
        this._resizeCellContainers();
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      // Clean up any document-level listeners from resize
      document.removeEventListener('mousemove', this._boundDocumentMouseMove);
      document.removeEventListener('mouseup', this._boundDocumentMouseUp);
      document.removeEventListener('touchmove', this._boundDocumentMouseMove);
      document.removeEventListener('touchend', this._boundDocumentMouseUp);

      // Reset transient resize state
      this._resizing = null;
    }

    _getHeaderCells() {
      return this.querySelectorAll('nuxeo-data-table-cell[header]');
    }

    _onWrapperHeightChanged() {
      const list = this.shadowRoot.querySelector('iron-list');
      if (list && this._wrapperHeight && !list.parentElement.classList.contains('table-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('table-wrapper');
        wrapper.setAttribute('style', `height: ${this._wrapperHeight}`);
        list.parentElement.insertBefore(wrapper, list);
        wrapper.appendChild(list);
      }
    }

    _computeActionsStyle() {
      if (this.editable && this.orderable) {
        return 'flex: 0 0 172px;';
      }
      if (this.editable || this.orderable) {
        return 'flex: 0 0 92px;';
      }
      return 'display: none;';
    }

    _computeSelectAllVisibility() {
      if (this.selectionEnabled) {
        return !this.selectAllEnabled || !this.multiSelection ? 'visibility: hidden;' : '';
      }
      return 'display: none;';
    }

    _alignHeaderRow() {
      afterNextRender(this, () => {
        if (this.$.list.scrollHeight >= this.$.list.clientHeight) {
          // add scrollbar width as padding
          this.$.header.style.paddingRight = `${this.$.list.offsetWidth - this.$.list.clientWidth}px`;
        } else {
          this.$.header.style.paddingRight = '0';
        }
      });
    }

    _itemChanged(e) {
      if (this.items) {
        let { index } = e.target;
        if (index === undefined) {
          index = this.items.indexOf(e.detail.item);
        }
        if (index >= 0) {
          let path = `items.${index}`;
          if (e.detail.path) {
            path += `.${e.detail.path}`;
          }
          this.set(path, e.detail.value);
          this._invalidateFieldTypeCache();
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
      }
      return {
        column: item,
      };
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
        this._updateRequiredColumns();
      }
    }

    /**
     * Flags columns as required from the `required` widgets of the row form.
     *
     * Layouts generated for a multivalued property flag the entry widget inside
     * `nuxeo-data-table-form` as required, but not the table or its columns, so the required
     * indicator only showed up in the entry dialog and never on the layout itself (ELEMENTS-1891).
     * Columns are matched to entry widgets by name; a table with a single column always holds the
     * entries of a scalar multivalued property, where the column name is the field label.
     *
     * Re-runs whenever the columns or the form slot change, so it keeps track of the columns it
     * flagged and clears them once they no longer match. A `required` set explicitly on a column is
     * never cleared, since it was not derived here.
     */
    _updateRequiredColumns() {
      if (!this.columns || this.columns.length === 0) {
        return;
      }
      const form = this.getContentChildren('#form')[0];
      const requiredNames = form
        ? Array.from((form.shadowRoot || form).querySelectorAll('[required]'))
            .map((widget) => (widget.getAttribute('name') || '').toLowerCase())
            .filter(Boolean)
        : [];
      if (!this._derivedRequiredColumns) {
        this._derivedRequiredColumns = new Set();
      }
      const derived = this._derivedRequiredColumns;
      const singleColumn = this.columns.length === 1;
      this.columns.forEach((column) => {
        const name = (column.field || column.name || '').toLowerCase();
        if (singleColumn ? requiredNames.length > 0 : requiredNames.includes(name)) {
          derived.add(column);
          column.required = true;
        } else if (derived.has(column)) {
          derived.delete(column);
          column.required = false;
        }
      });
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
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(1000), () => {
          // long timeout here to prevent jerkiness with the rubberband effect on iOS especially.
          this.$.container.style.width = `${Math.min(this.scrollWidth, this.clientWidth + this.scrollLeft)}px`;
        });
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
      // eslint-disable-next-line no-constant-condition
      if (false) {
        // https://nemisj.com/focusable/
        // tabIndex is not reliable in IE.
        return target.tabIndex >= 0;
      }
      // unreliable with Shadow, document.activeElement doesn't go inside
      // the shadow root.
      return (
        target.contains(dom(document.activeElement).node) ||
        target instanceof Nuxeo.DataTableCheckbox ||
        target.tagName === 'A'
      );
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
        const fireEvent = function(eventName, item, defaultAction) {
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
          this.dispatchEvent(
            new CustomEvent('row-clicked', {
              composed: true,
              bubbles: true,
              detail: { item: ev.model.item, index: ev.model.index },
            }),
          );
        }
      }
    }

    get settings() {
      const sortOrder = Array.isArray(this.sortOrder)
        ? this.sortOrder.map((entry) => Object.assign({}, entry))
        : this.sortOrder || null;

      const tableSettings = {
        columns: {},
        sortOrder,
      };

      if (this.columns) {
        this.columns.forEach((column, idx) => {
          const key = column.field ? column.field : `col-${idx}`;
          tableSettings.columns[key] = {
            hidden: !!column.hidden,
            order: typeof column.order === 'number' ? column.order : idx,
            width: column.width || null,
            resized: !!column.resized,
          };
          // Persist filter state only when set, to keep saved settings compact (ELEMENTS-1966)
          if (column.filterValue) {
            tableSettings.columns[key].filterValue = column.filterValue;
          }
          if (column.filterExpression) {
            tableSettings.columns[key].filterExpression = column.filterExpression;
          }
        });
      }

      return tableSettings;
    }

    set settings(settings) {
      if (!settings) {
        return;
      }

      // ---- columns (hidden / order / width / filterValue) ----
      // Track whether a fetch is needed; deferred to a single call after all settings (filters + sort) are applied (ELEMENTS-1966)
      let needsFetch = false;
      if (this.columns && settings.columns) {
        // Suppress per-column filter event dispatch while restoring to
        // avoid firing many fetches that may abort each other (WEBUI-1885)
        this._suppressFilterEvents = true;
        const restoredFilters = [];
        this.columns.forEach(function(column, idx) {
          const key = column.field ? column.field : `col-${idx}`;
          const colSettings = settings.columns[key] || {};

          // hidden
          this.set(`columns.${idx}.hidden`, !!colSettings.hidden);

          // order (only if provided)
          if (typeof colSettings.order === 'number') {
            this.set(`columns.${idx}.order`, colSettings.order);
          }

          // width (only if provided; allow null to clear)
          if (Object.prototype.hasOwnProperty.call(colSettings, 'width')) {
            this.set(`columns.${idx}.width`, colSettings.width);
            // Backward-compatible restore: old persisted settings had width but no resized flag.
            // Any explicit persisted width should behave as fixed.
            this.set(
              `columns.${idx}.resized`,
              Object.prototype.hasOwnProperty.call(colSettings, 'resized') ? !!colSettings.resized : true,
            );
          }

          // filterValue (WEBUI-1885) - restore column filter values
          if (Object.prototype.hasOwnProperty.call(colSettings, 'filterValue') && colSettings.filterValue) {
            this.set(`columns.${idx}.filterValue`, colSettings.filterValue);
            if (colSettings.filterExpression) {
              this.set(`columns.${idx}.filterExpression`, colSettings.filterExpression);
            }
            restoredFilters.push({
              index: idx,
              value: colSettings.filterValue,
              expression: colSettings.filterExpression || null,
            });
          }
        }, this);

        // Re-enable per-column events and apply restored filters to the provider once
        this._suppressFilterEvents = false;
        if (restoredFilters.length > 0 && this._hasPageProvider && this._hasPageProvider() && this.nxProvider) {
          if (this.paginable) {
            this.nxProvider.page = 1;
          }
          // Apply restored filters to nxProvider.params AND to this.filters array
          restoredFilters.forEach((entry) => {
            const column = this.columns[entry.index];
            const effectiveFilterBy = column.filterBy || column.field || null;
            if (effectiveFilterBy && entry.value) {
              // Set provider param
              if (entry.expression) {
                // Use a function replacement to prevent $ in user values being treated as back-references (ELEMENTS-1966)
                this.nxProvider.params[effectiveFilterBy] = entry.expression.replace(/\$term/g, () => entry.value);
              } else {
                this.nxProvider.params[effectiveFilterBy] = entry.value;
              }
              // Also add to filters array so user can later clear it
              const existingIdx = this.filters.findIndex((f) => f.path === effectiveFilterBy);
              if (existingIdx === -1) {
                this.push('filters', {
                  path: effectiveFilterBy,
                  value: entry.value,
                  name: column.name,
                  expression: entry.expression,
                });
              } else {
                // Update all fields to avoid stale expression/name in the filters array (ELEMENTS-1966)
                this.set(`filters.${existingIdx}.value`, entry.value);
                this.set(`filters.${existingIdx}.expression`, entry.expression);
                this.set(`filters.${existingIdx}.name`, column.name);
              }
            }
          });
          needsFetch = true; // always needed: params were mutated in-place, Polymer's auto observer can't detect it
        }
      }

      let appliedSortOrder = null;
      if (Object.prototype.hasOwnProperty.call(settings, 'sortOrder')) {
        // keep sortOrder as an array (default to []) when applying settings
        appliedSortOrder = Array.isArray(settings.sortOrder) ? settings.sortOrder : [];
        this.sortOrder = appliedSortOrder;
      } else if (settings.columns && Object.prototype.hasOwnProperty.call(settings.columns, 'sortOrder')) {
        // backward compatibility if you ever saved it under columns
        appliedSortOrder = Array.isArray(settings.columns.sortOrder) ? settings.columns.sortOrder : [];
        this.sortOrder = appliedSortOrder;
      }
      // sync restored sort with page provider (if any)
      if (appliedSortOrder && this._hasPageProvider && this._hasPageProvider() && this.nxProvider) {
        // convert array sortOrder into { path: direction } map expected by the page provider
        const sortMap = appliedSortOrder.reduce((acc, entry) => {
          if (entry && entry.path && entry.direction) {
            acc[entry.path] = entry.direction;
          }
          return acc;
        }, {});

        // keep provider sort aligned with the table's sortOrder
        this._ppSort = sortMap;
        this.nxProvider.sort = sortMap;
        if (!this.nxProvider.auto) {
          needsFetch = true;
        }

        // ---- reflow ----
        this.notifyResize();
      }

      // Single consolidated fetch after all settings (filters + sort) are applied (ELEMENTS-1966)
      if (needsFetch && typeof this.fetch === 'function') {
        this.fetch();
      }
    }

    _onCheckBoxTap(e) {
      if (this.selectionEnabled) {
        // _selectionHandler isn't called if selectOnTap is true
        if (this.selectOnTap) {
          this.$.list.toggleSelectionForIndex(e.model.index);
        }
        const target = e.target || e.srcElement;
        target.dispatchEvent(
          new CustomEvent('selected', {
            composed: true,
            bubbles: true,
            detail: { index: e.model.index, shiftKey: e.shiftKey },
          }),
        );
        this._updateFlags();
      }
    }

    _onCheckBoxKeydown(e) {
      // Normalize keys across browsers
      const key = e.key || '';
      const code = e.code || '';
      if (key === 'Enter' || key === ' ' || code === 'Enter' || code === 'Space') {
        // prevent default browser behaviour (form submit / page scroll) and stop other handlers
        e.preventDefault();
        e.stopPropagation();
        // Do NOT toggle here — tap will be dispatched automatically
      }
    }

    _editEntry(e) {
      e.stopPropagation();
      this._toggleEditDialog(e.detail.index);
    }

    _isStrictNumberString(value) {
      if (typeof value !== 'string' || value.trim() === '') {
        return false;
      }
      const normalized = value.trim();
      const num = Number(normalized);
      // Keep integer-like strings with leading zeros as text (e.g. "00123", "+001").
      if (/^[+-]?0\d+$/.test(normalized)) {
        return false;
      }
      return Number.isFinite(num);
    }

    // Build per-field type hints from existing rows to keep user input consistent.
    _inferFieldTypes(existingItems) {
      const typeMap = {};
      if (!existingItems || existingItems.length === 0) {
        return typeMap;
      }
      existingItems.forEach((row) => {
        if (row === null || typeof row !== 'object' || Array.isArray(row)) {
          return;
        }
        Object.keys(row).forEach((key) => {
          const t = typeof row[key];
          if (t !== 'number' && t !== 'string') {
            return;
          }
          if (!(key in typeMap)) {
            typeMap[key] = t;
          } else if (typeMap[key] !== t) {
            typeMap[key] = null; // mixed — no inference
          }
        });
      });
      return typeMap;
    }

    _invalidateFieldTypeCache() {
      this._fieldTypeStats = null;
      this._fieldTypeHints = null;
    }

    _invalidateFieldTypeCacheFromItems() {
      this._invalidateFieldTypeCache();
    }

    _getScalarType(value) {
      const type = typeof value;
      return type === 'number' || type === 'string' ? type : null;
    }

    _buildFieldTypeStats(items) {
      const stats = {};
      (items || []).forEach((row) => {
        if (row === null || typeof row !== 'object' || Array.isArray(row)) {
          return;
        }
        Object.keys(row).forEach((key) => {
          const type = this._getScalarType(row[key]);
          if (!type) {
            return;
          }
          if (!stats[key]) {
            stats[key] = { number: 0, string: 0 };
          }
          stats[key][type] += 1;
        });
      });
      return stats;
    }

    _computeFieldTypeHintsFromStats(stats) {
      const hints = {};
      Object.keys(stats).forEach((key) => {
        if (stats[key].number > 0 && stats[key].string === 0) {
          hints[key] = 'number';
        } else if (stats[key].string > 0 && stats[key].number === 0) {
          hints[key] = 'string';
        } else {
          hints[key] = null;
        }
      });
      return hints;
    }

    _ensureFieldTypeCache() {
      if (!this._fieldTypeStats || !this._fieldTypeHints) {
        // Reuse existing inference semantics for compatibility.
        this._fieldTypeHints = this._inferFieldTypes(this.items || []);
        this._fieldTypeStats = this._buildFieldTypeStats(this.items || []);
      }
      return this._fieldTypeHints;
    }

    _adjustFieldTypeStatsForItem(item, delta) {
      if (!this._fieldTypeStats || item === null || typeof item !== 'object' || Array.isArray(item)) {
        return;
      }
      Object.keys(item).forEach((key) => {
        const type = this._getScalarType(item[key]);
        if (!type) {
          return;
        }
        if (!this._fieldTypeStats[key]) {
          this._fieldTypeStats[key] = { number: 0, string: 0 };
        }
        this._fieldTypeStats[key][type] = Math.max(0, this._fieldTypeStats[key][type] + delta);
        if (this._fieldTypeStats[key].number === 0 && this._fieldTypeStats[key].string === 0) {
          delete this._fieldTypeStats[key];
        }
      });
    }

    _updateFieldTypeCache(previousItem, nextItem) {
      if (!this._fieldTypeStats || !this._fieldTypeHints) {
        this._invalidateFieldTypeCache();
        return;
      }
      this._adjustFieldTypeStatsForItem(previousItem, -1);
      this._adjustFieldTypeStatsForItem(nextItem, 1);
      this._fieldTypeHints = this._computeFieldTypeHintsFromStats(this._fieldTypeStats);
    }

    _normalizeItem(item, typeHints) {
      if (Array.isArray(item)) {
        return item.map((v) => this._normalizeItem(v, typeHints));
      }

      if (item !== null && typeof item === 'object') {
        Object.keys(item).forEach((key) => {
          const hint = typeHints && typeHints[key];
          if (hint === 'number' && typeof item[key] === 'string' && item[key].trim() !== '') {
            // Keep numeric columns numeric.
            const num = Number(item[key]);
            item[key] = Number.isFinite(num) ? num : item[key];
          } else if (hint === 'string') {
            // Keep string columns as strings (for ID-like values such as "00123").
            item[key] = typeof item[key] === 'number' ? String(item[key]) : item[key];
          } else {
            item[key] = this._normalizeItem(item[key]);
          }
        });
        return item;
      }

      if (this.columns && this.columns.length === 1 && typeof item === 'string' && item.trim() !== '') {
        const num = Number(item.trim());
        if (Number.isFinite(num)) {
          return num;
        }
      }

      // No field hint: only coerce when numeric round-trip is stable.
      if (this._isStrictNumberString(item)) {
        return Number(item);
      }

      return item;
    }

    _validateEntry() {
      const dtform = this.getContentChildren('#form')[0];

      if (dtform.validateItem()) {
        const previousItem = dtform.index > -1 ? this._deepCopy(this.items[dtform.index]) : null;
        let item = this._deepCopy(dtform.item);

        // Use cached hints to avoid scanning all rows on every save.
        const typeHints = this._ensureFieldTypeCache();
        item = this._normalizeItem(item, typeHints);

        if (dtform.index > -1) {
          this.set(`items.${dtform.index}`, item);
          this._updateFieldTypeCache(previousItem, item);
        } else {
          this.push('items', item);
          this._updateFieldTypeCache(null, item);
        }
        this.__renderDebouncer = Debouncer.debounce(this.__renderDebouncer, timeOut.after(10), () => {
          this.notifyResize();
          this.$.dialog.close();
        });
      }
    }

    _deepCopy(obj) {
      let cache = [];
      const result = JSON.parse(
        JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
              // Circular reference found, discard key
              return;
            }
            // Store value in our collection
            cache.push(value);
          }
          return value;
        }),
      );
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
      const removedItem = this.items && this.items[e.detail.index];
      this.splice('items', e.detail.index, 1);
      this._updateFieldTypeCache(removedItem, null);
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
      if (this.items.length - 1 > e.detail.index) {
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
          const result = this._fetchPage(this.nxProvider.page, this.nxProvider.pageSize);
          if (result) {
            return result.then(() => {
              this.nxProvider.page += 1;
              this.$.scrollThreshold.clearTriggers();
              this.$.list.notifyResize();
            });
          }
          this.$.scrollThreshold.clearTriggers();
          this.$.list.notifyResize();
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

    /** ** Column Resizing and Reordering ******* */

    // ------------------------------------------------------------
    // Column resize lifecycle
    // ------------------------------------------------------------

    /**
     * Handles resize start emitted by header cell.
     * Initializes resize state and binds document listeners.
     */
    _onColumnResizeStart(e) {
      if (!this.columnResizeEnabled) return;
      const { column, startX, startWidth } = e.detail || {};
      if (!column || typeof startX !== 'number') return;

      this._resizeCellContainers();

      this._resizing = {
        column,
        startX: startX + this.scrollLeft,
        startWidth,
      };

      document.addEventListener('mousemove', this._boundDocumentMouseMove);
      document.addEventListener('mouseup', this._boundDocumentMouseUp);
      document.addEventListener('touchmove', this._boundDocumentMouseMove, { passive: false });
      document.addEventListener('touchend', this._boundDocumentMouseUp);
    }

    /**
     * Tracks pointer movement during resize and updates column width.
     */
    _documentMouseMove(e) {
      if (!this.columnResizeEnabled || !this._resizing) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      if (e.touches) e.preventDefault();

      const pointerX = clientX + this.scrollLeft;

      const { column, startX, startWidth } = this._resizing;

      let minWidth = 10;
      if (column && column.minWidth != null) {
        const parsed = parseInt(column.minWidth, 10);
        if (!Number.isNaN(parsed)) {
          minWidth = parsed;
        }
      }

      // Calculate new width with minimum constraint
      const dx = pointerX - startX;
      const newWidth = Math.max(minWidth, Math.round(startWidth + dx));

      const colIndex = this.columns.indexOf(column);
      if (colIndex > -1) {
        this.set(`columns.${colIndex}.width`, `${newWidth}px`);
        this.set(`columns.${colIndex}.resized`, true);
        // Throttle expensive resize work to at most once per animation frame
        if (!this._resizeRafId) {
          this._resizeRafId = window.requestAnimationFrame(() => {
            this._resizeRafId = null;
            this._resizeCellContainers();
          });
        }
      }
    }

    /**
     * Finalizes resize:
     * - removes document listeners
     * - restores header cell state
     * - clears resize state
     */

    _documentMouseUp() {
      if (!this.columnResizeEnabled || !this._resizing) return;
      document.removeEventListener('mousemove', this._boundDocumentMouseMove);
      document.removeEventListener('mouseup', this._boundDocumentMouseUp);
      document.removeEventListener('touchmove', this._boundDocumentMouseMove);
      document.removeEventListener('touchend', this._boundDocumentMouseUp);

      const { column } = this._resizing;

      const cells = this._getHeaderCells();
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (cell.column === column) {
          cell.classList.remove('resizing');
          cell.style.cursor = '';
          cell.draggable = !!this.columnReorderEnabled;
          break;
        }
      }

      this._resizing = null;

      this.notifyResize();
      // column resize finalized -> notify settings change so updated column width can be persisted
      this._fireSettingsChanged({ source: 'column-resize', column });
      if (this._resizeRafId) {
        cancelAnimationFrame(this._resizeRafId);
        this._resizeRafId = null;
      }
    }

    // ------------------------------------------------------------
    // COLUMN REORDER
    // Uses cached header geometry captured at drag start.
    // ------------------------------------------------------------

    /**
     * Initializes column drag:
     * - marks active column
     * - captures header offset
     * - caches visible column positions (prevents layout thrash)
     */

    _onColumnDragStart(e) {
      if (!this.columnReorderEnabled) return;

      this._reorderingColumns = true;
      this._draggingColumn = e.detail.column;
      this._dragOverColumn = null;
      this._dragInsertAfter = false;

      this._markActiveColumn(e.detail.column);
      const headerRect = this.getBoundingClientRect();
      this._dragHeaderLeft = headerRect.left;
      // Visible columns in current visual order (excluding dragged)

      const orderedColumns = [...this.columns]
        .filter((c) => !c.hidden && c !== this._draggingColumn)
        .sort((a, b) => a.order - b.order);

      const cells = this._getHeaderCells();

      this._dragCellsMeta = orderedColumns.map((col) => {
        const cell = Array.from(cells).find((c) => c.column === col);
        const rect = cell.getBoundingClientRect();

        return {
          column: col,
          left: rect.left,
          right: rect.right,
        };
      });
    }

    /**
     * Applies final column order based on drop target.
     */

    _onColumnDragEnd() {
      if (!this.columnReorderEnabled) return;
      const dragging = this._draggingColumn;
      const target = this._dragOverColumn;

      if (!dragging || !target || dragging === target) {
        this._resetDragState();
        return;
      }

      const ordered = [...this.columns].sort((a, b) => a.order - b.order);

      const from = ordered.indexOf(dragging);
      let to = ordered.indexOf(target);

      ordered.splice(from, 1);
      if (from < to) to--;

      const insertIndex = this._dragInsertAfter ? to + 1 : to;
      ordered.splice(insertIndex, 0, dragging);

      ordered.forEach((col, index) => {
        col.order = index;
      });

      // column reorder finalized -> persistable settings changed
      this._fireSettingsChanged({ source: 'column-reorder' });
      this.notifyResize();
      this._resetDragState();
    }

    /**
     * Clears transient drag state and visual indicators.
     */
    _resetDragState() {
      // Drag operation finished → re-enable column slot observer
      this._reorderingColumns = false;

      this._draggingColumn = null;
      this._dragOverColumn = null;
      this._dragInsertAfter = false;

      this._dragCellsMeta = null;
      this._dragHeaderLeft = null;

      this._clearDropIndicators();
      this._clearActiveColumn();
    }

    /**
     * Resolves drop target column from pointer X coordinate.
     */
    _onColumnDragMove(mouseX) {
      if (!this.columnReorderEnabled || !this._draggingColumn || typeof mouseX !== 'number') return;

      this._resolveDropTargetFromX(mouseX);
    }

    /**
     * Hit-tests pointer X against cached column geometry.
     * Determines:
     *  - target column
     *  - insert before/after
     */

    _resolveDropTargetFromX(x) {
      if (!this._dragCellsMeta) return;

      const localX = Math.round(x - this._dragHeaderLeft + this.scrollLeft);

      let targetIndex = -1;
      let insertAfter = false;

      for (let i = 0; i < this._dragCellsMeta.length; i++) {
        const meta = this._dragCellsMeta[i];

        const left = meta.left - this._dragHeaderLeft + this.scrollLeft;
        const right = meta.right - this._dragHeaderLeft + this.scrollLeft;
        const center = left + (right - left) / 2;

        if (localX >= left && localX <= right) {
          targetIndex = i;
          insertAfter = localX > center;
          break;
        }
      }

      if (targetIndex === -1 && localX < this._dragCellsMeta[0].left - this._dragHeaderLeft + this.scrollLeft) {
        this._dragOverColumn = this._dragCellsMeta[0].column;
        this._dragInsertAfter = false;
        this._setDropEdgeIndicator(this._dragCellsMeta[0].column);
        return;
      }

      if (targetIndex === -1) {
        this._dragOverColumn = null;
        this._clearDropIndicators();
        return;
      }

      const targetMeta = this._dragCellsMeta[targetIndex];

      this._dragOverColumn = targetMeta.column;
      this._dragInsertAfter = insertAfter;

      let indicatorColumn = targetMeta.column;

      if (!insertAfter && targetIndex > 0) {
        indicatorColumn = this._dragCellsMeta[targetIndex - 1].column;
      }

      this._setDropEdgeIndicator(indicatorColumn);
    }

    /**
     * Highlights the column currently being dragged.
     * Ensures only one header cell has the 'column-active' class at a time.
     * Used for visual feedback during column reorder.
     */

    _markActiveColumn(column) {
      if (this._activeColumn === column) {
        return;
      }
      const cells = this._getHeaderCells();
      cells.forEach((cell) => {
        if (cell.column === this._activeColumn) {
          cell.classList.remove('column-active');
        }
      });

      this._activeColumn = column;
      if (column) {
        cells.forEach((cell) => {
          if (cell.column === column) {
            cell.classList.add('column-active');
          }
        });
      }
    }

    /**
     * Removes active (dragged) visual state from all header cells.
     * Called when drag operation ends or is cancelled.
     */

    _clearActiveColumn() {
      if (!this._activeColumn) return;
      const cells = this._getHeaderCells();
      cells.forEach((cell) => cell.classList.remove('column-active'));

      this._activeColumn = null;
    }

    /**
     * Clears all drop position indicators from header cells.
     * Resets visual state before applying a new indicator.
     */

    _clearDropIndicators() {
      const cells = this._getHeaderCells();
      for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('drop-left', 'drop-right');
      }
    }

    /**
     * Shows the drop position indicator for column reorder.
     * Indicator is always rendered on the RIGHT edge of the target column.
     * (Insert-before is handled by choosing the previous column.)
     */

    _setDropEdgeIndicator(column) {
      if (!column) return;

      this._clearDropIndicators();

      const cells = this._getHeaderCells();
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].column === column) {
          cells[i].classList.add('drop-right');
          break;
        }
      }
    }

    _fireSettingsChanged(detail = {}) {
      this.dispatchEvent(
        new CustomEvent('settings-changed', {
          composed: true,
          bubbles: true,
          detail,
        }),
      );
    }
  }

  customElements.define(DataTable.is, DataTable);
  Nuxeo.DataTable = DataTable;
}
