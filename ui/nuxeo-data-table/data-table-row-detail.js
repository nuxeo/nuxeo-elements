/* Part of `nuxeo-data-table` */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import './data-table-templatizer-behavior.js';

{
  class DataTableRowDetail extends mixinBehaviors([saulis.DataTableTemplatizerBehavior], Nuxeo.Element) {

    static get is() {
      return 'nuxeo-data-table-row-detail';
    }

    static get properties() {
      return {
        beforeBind: Object,
      };
    }

    static get observers() {
      return [
        '_beforeBind(beforeBind, item.*, index, selected, expanded)',
      ];
    }

    static get template() {
      return html`
        <style>
          :host {
            padding: 0 24px 0 24px;
            display: flex;
            align-items: center;
          }
        </style>
        <slot></slot>
      `;
    }

    _beforeBind(beforeBind, item, index, selected, expanded) {
      beforeBind({
        index,
        item: item.base,
        expanded,
        selected,
      }, this);
    }

  }

  customElements.define(DataTableRowDetail.is, DataTableRowDetail);
  Nuxeo.DataTableRowDetail = DataTableRowDetail;
}
