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
              margin: 12px 2px 0 2px;
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
              color: #999;
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
        },
        hidden: Boolean,
      };
    }

    _valueChanged(e) {
      // store value in a variable, referring to e.detail.value inside the debounce
      // function results in weird outcomes. event object might be reused by Polymer?
      const { value } = e.detail;
      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
        this.value = value;
      });
    }
  }

  customElements.define(DataTableColumnFilter.is, DataTableColumnFilter);
  Nuxeo.DataTableColumnFilter = DataTableColumnFilter;
}
