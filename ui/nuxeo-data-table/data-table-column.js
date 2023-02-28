import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import './data-table-column-filter.js';

/* Part of `nuxeo-data-table` */
{
  class DataTableColumn extends Nuxeo.Element {
    static get template() {
      return html`
        <template id="header">
          <nuxeo-data-table-column-filter
            label="[[column.name]]"
            value="{{column.filterValue}}"
            hidden$="[[!column.filterBy]]"
            role="columnheader"
          >
          </nuxeo-data-table-column-filter>
          <div hidden$="[[column.filterBy]]" role="columnheader">[[column.name]]</div>
        </template>
      `;
    }

    static get is() {
      return 'nuxeo-data-table-column';
    }

    static get properties() {
      return {
        /**
         * If `true`, cell contents will be aligned on the right
         */
        alignRight: {
          type: Boolean,
          value: false,
        },

        /**
         * Name of the column. This value is displayed in the header cell of the column
         */
        name: {
          type: String,
          value: '',
        },

        /**
         * Path to a property that will be filtered by this column. If set, a filter input
         * will be automaticelly placed on the header cell of the column.
         */
        filterBy: String,

        /**
         * Filter value that will be used to filter the items using the property defined
         * in `filterBy` property.
         */
        filterValue: String,

        /**
         * Filter expression that will be applied to full-text queries.
         * The syntax for the search term is $term and the wildcards defined for full-text queries can be used (https://doc.nuxeo.com/nxdoc/full-text-queries/)
         * As an example this filterExpression could be something like: $term*
         */
        filterExpression: String,

        /**
         * Minimum width of the column
         */
        width: {
          type: String,
          value: '100px',
        },

        /**
         * Ratio of how the extra space between columns is distributed. If every cell
         * has the same `flex` value, the space will be distributed evenly.
         */
        flex: {
          type: Number,
          value: 1,
        },

        /**
         * If `true`, the cells of this column will be hidden.
         */
        hidden: {
          type: Boolean,
          value: false,
        },

        /**
         * If `true`, the column cannot be hidden from the settings dialog.
         */
        alwaysVisible: {
          type: Boolean,
          value: false,
        },

        /**
         * Display order of the column in relation with the other columns.
         */
        order: {
          type: Number,
          notify: true,
        },

        /**
         * Path to a property that will be sorted by this column. If set, a sorting
         * indicator will be automatically placed in the header cell of this column.
         */
        sortBy: {
          type: String,
        },

        /**
         * Path to a field property
         */
        field: {
          type: String,
        },

        /*
         * Reference to the parent <iron-data-table> element.
         */
        table: Object,

        /**
         * Template for the header cell
         */
        headerTemplate: {
          type: Object,
          readOnly: true,
        },

        /**
         * Template for the row item cell
         */
        template: {
          type: Object,
          readOnly: true,
        },

        /**
         * Controls how cells content is displayed when larger than their column. Applies to this column only.
         * Authorized values are auto (display an horizontal scrollbar inside the cells when necessary, recommended
         * for multivalued properties) or hidden (hide overflowing content, recommended for finer control over display).
         * Defaults to hidden.
         */
        overflow: {
          type: String,
          value: 'hidden',
        },
      };
    }

    static get observers() {
      return [
        '_alignRightChanged(table, alignRight)',
        '_filterValueChanged(table, filterValue, filterBy, filterExpression)',
        '_filterByChanged(table, filterBy)',
        '_flexChanged(table, flex)',
        '_overflowChanged(table, overflow)',
        '_headerTemplateChanged(table, headerTemplate)',
        '_hiddenChanged(table, hidden)',
        '_alwaysVisibleChanged(table, alwaysVisible)',
        '_nameChanged(table, name)',
        '_orderChanged(table, order)',
        '_sortByChanged(table, sortBy)',
        '_templateChanged(table, template)',
        '_widthChanged(table, width)',
      ];
    }

    ready() {
      super.ready();
      this._setTemplate(dom(this).querySelector('template:not([is=header])'));
      const customHeader = dom(this).querySelector('template[is=header]');
      if (customHeader) {
        this._setHeaderTemplate(customHeader);
      } else {
        this._setHeaderTemplate(dom(this.root).querySelector('#header'));
      }
    }

    _notifyTable(table, path, value) {
      if (table && table.columns) {
        const index = table.columns.indexOf(this);
        table.notifyPath(`columns.${index}.${path}`, value);
      }
    }

    _alignRightChanged(table, alignRight) {
      this._notifyTable(table, 'alignRight', alignRight);
    }

    _nameChanged(table, name) {
      this._notifyTable(table, 'name', name);
    }

    _sortByChanged(table, sortBy) {
      this._notifyTable(table, 'sortBy', sortBy);
    }

    _flexChanged(table, flex) {
      this._notifyTable(table, 'flex', flex);
    }

    _overflowChanged(table, overflow) {
      this._notifyTable(table, 'overflow', overflow);
    }

    _headerTemplateChanged(table, headerTemplate) {
      this._notifyTable(table, 'headerTemplate', headerTemplate);
    }

    _hiddenChanged(table, hidden) {
      this._notifyTable(table, 'hidden', hidden);
    }

    _alwaysVisibleChanged(table, alwaysVisible) {
      this._notifyTable(table, 'alwaysVisible', alwaysVisible);
    }

    _orderChanged(table, order) {
      this._notifyTable(table, 'order', order);
    }

    _templateChanged(table, template) {
      this._notifyTable(table, 'template', template);
    }

    _widthChanged(table, width) {
      this._notifyTable(table, 'width', width);
    }

    _filterByChanged(table, filterBy) {
      this._notifyTable(table, 'filterBy', filterBy);
    }

    _filterValueChanged(table, filterValue, filterBy, filterExpression) {
      if (table && filterBy && filterValue !== undefined) {
        this._notifyTable(table, 'filterValue', filterValue);
        this.dispatchEvent(
          new CustomEvent('column-filter-changed', {
            composed: true,
            bubbles: true,
            detail: { value: filterValue, filterBy, filterExpression },
          }),
        );
      }
    }
  }

  customElements.define(DataTableColumn.is, DataTableColumn);
  Nuxeo.DataTableColumn = DataTableColumn;
}
