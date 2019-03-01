/* Part of `nuxeo-data-table` */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

{
  class DataTableColumnSort extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
        margin: 4px;
      }

      :host([hidden]) {
        display: none;
      }

      paper-icon-button {
        position: relative;
        opacity: .84;
        transition: all .2s;
      }

      paper-icon-button:hover,
      paper-icon-button[focused] {
        color: var(--default-primary-color);
      }

      paper-icon-button:not([direction]) {
        opacity: .16;
      }

      paper-icon-button[direction='desc'] {
        transform: rotate(-180deg);
      }

      paper-icon-button[hidden] {
        display: none;
      }

      .order {
        font-size: .8rem;
        font-weight: bold;
        position: absolute;
        right: 4px;
        bottom: 8px;
      }
    </style>

    <div style="position: relative">
      <paper-icon-button id="sortIcon" on-click="_sort" icon="data-table:arrow-upward" direction\$="[[direction]]">
      </paper-icon-button>
      <div class="order">[[order]]</div>
    </div>
`;
    }

    static get is() {
      return 'nuxeo-data-table-column-sort';
    }

    static get properties() {
      return {
        direction: {
          type: String,
          notify: true,
        },
        path: String,
        order: {
          type: Number,
          computed: '_order(path, sortOrder, sortOrder.length)',
        },
        sortOrder: Array,
      };
    }

    static get observers() {
      return [
        '_sortOrderChanged(sortOrder.*)',
      ];
    }

    _order(path, sortOrder, length) {
      if (length <= 1) {
        return '';
      }

      for (let i = 0; i < length; i++) {
        if (sortOrder[i].path === path) {
          return i + 1;
        }
      }
    }

    _sortOrderChanged(sortOrder) {
      // TODO: if sortOrder for this column has been removed from outside, direction is not updated.
      if (sortOrder.base) {
        sortOrder.base.forEach((sort) => {
          if (sort.path === this.path) {
            this.direction = sort.direction;
          }
        });
      }
    }

    _sort() {
      switch (this.direction) {
        case 'asc':
          this.direction = 'desc';
          break;

        case 'desc':
          this.direction = null;
          break;

        default:
          this.direction = 'asc';
          break;
      }

      this.dispatchEvent(new CustomEvent('sort-direction-changed', {
        composed: true,
        bubbles: true,
        detail: {
          path: this.path,
          direction: this.direction,
        },
      }));
    }
  }

  customElements.define(DataTableColumnSort.is, DataTableColumnSort);
  Nuxeo.DataTableColumnSort = DataTableColumnSort;
}
