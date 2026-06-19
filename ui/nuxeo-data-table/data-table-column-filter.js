import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '@polymer/paper-input/paper-input.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

/* Part of `nuxeo-data-table` */
{
  class DataTableColumnFilter extends Nuxeo.Element {
    static get template() {
      return html`
        <style>
          :host {
            height: 100%;
            display: flex;
            align-items: center;
          }
          :host([hidden]) {
            display: none;
          }
          /* ELEMENTS-1214: Align this element appearance with nuxeo-selectivity */
          paper-input {
            --paper-input-container: {
              font-size: inherit;
              margin: 12px 2px 9px 2px;
              margin-top: 3px;
            }

            --paper-input-container-input: {
              min-height: 2em;
              padding: 0;
              font-size: inherit;
              font-weight: 600;
            }

            --paper-input-container-color: {
              color: var(--nuxeo-text-default, #3a3a54);
            }

            --paper-input-container-label: {
              font-size: inherit;
              color: #606978;
              font-weight: 600;
              padding: 0;
            }
          }
        </style>
        <paper-input no-label-float label="[[label]]" value="[[value]]" on-value-changed="_valueChanged"></paper-input>
      `;
    }

    static get is() {
      return 'nuxeo-data-table-column-filter';
    }

    static get properties() {
      return {
        label: String,
        value: {
          type: String,
          notify: true,
          observer: '_valuePropertyChanged',
        },
        hidden: Boolean,
      };
    }

    // Observer for external value changes (e.g., from settings restore) (WEBUI-1885)
    _valuePropertyChanged(newValue) {
      // Cancel any pending debounced propagation from paper-input init events,
      // so an externally-set value can't be clobbered by a stale '' from init (WEBUI-1885)
      if (this._debouncer && this._debouncer.cancel) {
        this._debouncer.cancel();
      }
      // Ensure the paper-input reflects the new value
      const input = this.shadowRoot && this.shadowRoot.querySelector('paper-input');
      if (input && input.value !== newValue) {
        input.value = newValue || '';
      }
    }

    _valueChanged(e) {
      // store value in a variable, referring to e.detail.value inside the debounce
      // function results in weird outcomes. event object might be reused by Polymer?
      const { value } = e.detail;

      // Ignore paper-input's initial empty value event when our own value is also
      // empty/unset. paper-input fires value-changed='' on first stamp; without
      // this guard, a freshly-stamped column-filter would propagate '' upward and
      // clobber an externally-restored column.filterValue (WEBUI-1885)
      const empty = (v) => v == null || v === '';
      if (empty(value) && empty(this.value)) {
        return;
      }
      // Skip echoes where the incoming value already matches our current value
      if (value === this.value) {
        return;
      }

      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
        this.value = value;
      });
    }
  }

  customElements.define(DataTableColumnFilter.is, DataTableColumnFilter);
  Nuxeo.DataTableColumnFilter = DataTableColumnFilter;
}
