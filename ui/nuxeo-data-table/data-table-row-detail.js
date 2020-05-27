import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import './data-table-templatizer-behavior.js';

/* Part of `nuxeo-data-table` */
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
      return ['_beforeBind(beforeBind, item.*, index, selected, expanded)'];
    }

    static get template() {
      return html`
        <style>
          :host {
            padding: 0 24px 0 24px;
            display: block;
            align-items: center;
            flex: 10 10 100%;
            flex-grow: 100;
            flex-basis: 1000px;
          }
        </style>
        <slot></slot>
      `;
    }

    _beforeBind(beforeBind, item, index, selected, expanded) {
      if (!beforeBind) {
        return;
      }

      beforeBind(
        {
          index,
          item: item.base,
          expanded,
          selected,
        },
        this,
      );
    }
  }

  customElements.define(DataTableRowDetail.is, DataTableRowDetail);
  Nuxeo.DataTableRowDetail = DataTableRowDetail;
}
