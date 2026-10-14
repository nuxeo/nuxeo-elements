import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

/* Part of `nuxeo-data-table` */
{
  class DataTableColumnSort extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
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
            transition: all 0.2s;
          }

          paper-icon-button:hover,
          paper-icon-button[focused] {
            color: var(--default-primary-color);
          }

          paper-icon-button:not([direction]) {
            opacity: 0.6;
          }

          paper-icon-button[direction='desc'] {
            transform: rotate(-180deg);
          }

          paper-icon-button[hidden] {
            display: none;
          }

          .order {
            font-size: 0.8rem;
            font-weight: bold;
            position: absolute;
            right: 4px;
            bottom: 8px;
          }

          #sortContainer {
            position: relative;
            width: 40px;
          }
        </style>

        <div id="sortContainer">
          <paper-icon-button
            id="sortIcon"
            on-click="_sort"
            icon="data-table:arrow-upward"
            direction$="[[direction]]"
            aria-label$="[[_computeAriaLabel(direction, i18n)]]"
          >
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
          type: String,
          computed: '_order(path, sortOrder, sortOrder.length)',
        },
        sortOrder: Array,
      };
    }

    static get observers() {
      return ['_sortOrderChanged(sortOrder.*)'];
    }

    _order(path, sortOrder, length) {
      // `sortOrder` is still unset during the initial property flush and `iron-data-table` also
      // accepts a null or non-array sort order, which means nothing is sorted. The sequence badge
      // is only meaningful while several columns are sorted at once.
      if (!Array.isArray(sortOrder) || length <= 1) {
        return '';
      }

      const index = sortOrder.findIndex((entry) => entry.path === path);
      return index === -1 ? '' : `${index + 1}`;
    }

    _sortOrderChanged(sortOrder) {
      // A Polymer wildcard change record always carries a `base` key, so a record without one
      // was not produced by the observer and says nothing about the current sort order.
      if (!sortOrder || !('base' in sortOrder)) {
        return;
      }

      // `sortOrder` may be replaced from outside the element, for instance when a saved content
      // view is restored, so the direction has to be cleared when this column is no longer part
      // of it. `iron-data-table` also accepts a null or non-array sort order, which means nothing
      // is sorted. Leaving the direction stale would keep both the arrow and the aria-label out
      // of sync.
      const entries = Array.isArray(sortOrder.base) ? sortOrder.base : [];
      const sort = entries.find((entry) => entry.path === this.path);
      this.direction = sort ? sort.direction : null;
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

      this.dispatchEvent(
        new CustomEvent('sort-direction-changed', {
          composed: true,
          bubbles: true,
          detail: {
            path: this.path,
            direction: this.direction,
          },
        }),
      );
    }

    _computeAriaLabel() {
      if (this.direction) {
        return this.i18n(`command.sort.${this.direction === 'desc' ? 'descend' : 'ascend'}`);
      }
    }
  }

  customElements.define(DataTableColumnSort.is, DataTableColumnSort);
  Nuxeo.DataTableColumnSort = DataTableColumnSort;
}
