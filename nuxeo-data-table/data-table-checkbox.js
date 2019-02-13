/* Part of `nuxeo-data-table` */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '../widgets/nuxeo-checkmark.js';

{
  class DataTableCheckbox extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host {
        min-height: 48px;
        flex-basis: 48px;
        flex-grow: 0;
        flex-shrink: 0;
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :host([hidden]) {
        display: none;
      }

      :host(:focus) {
        outline: none;
      }

      :host([header]) {
        visibility: hidden !important;
      }
    </style>

    <nuxeo-checkmark checked="{{checked}}"></nuxeo-checkmark>
`;
    }

    static get is() {
      return 'nuxeo-data-table-checkbox';
    }

    static get properties() {
      return {
        checked: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
        },
      };
    }
  }

  customElements.define(DataTableCheckbox.is, DataTableCheckbox);
  Nuxeo.DataTableChecbox = DataTableCheckbox;
}
