/* Part of `nuxeo-data-table` */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '@polymer/paper-input/paper-input.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

{
  class DataTableColumnFilter extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host([hidden]) {
        display: none;
      }
      paper-input {
        --paper-input-container-label: {
          font-size: inherit;
        }
      }
    </style>
    <paper-input no-label-float="" label="[[label]]" value="[[value]]" on-value-changed="_valueChanged"></paper-input>
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
      const value = e.detail.value;
      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
        this.value = value;
      });
    }
  }

  customElements.define(DataTableColumnFilter.is, DataTableColumnFilter);
  Nuxeo.DataTableColumnFilter = DataTableColumnFilter;
}
