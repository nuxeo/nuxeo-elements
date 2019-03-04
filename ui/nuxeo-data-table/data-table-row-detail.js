/* Part of `nuxeo-data-table` */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import './data-table-templatizer-behavior.js';

const $_documentContainer = document.createElement('template'); // eslint-disable-line camelcase
$_documentContainer.innerHTML = `<dom-module id="data-table-row-detail">
  <template>
    <style>
      :host {
        padding: 0 24px 0 24px;
        display: flex;
        align-items: center;
      }
    </style>
    <slot></slot>
  </template>
  
</dom-module>`;

document.head.appendChild($_documentContainer.content);
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
