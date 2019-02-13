/* Part of `nuxeo-data-table` */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import './data-table-templatizer-behavior.js';

{
  // eslint-disable-next-line no-undef
  class DataTableCell extends mixinBehaviors([saulis.DataTableTemplatizerBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        flex: 1 0 100px;
        padding: 0 24px;
        min-height: 48px;
        display: flex;
        align-items: center;
        overflow: hidden;
        transition: flex-basis 200ms, flex-grow 200ms;
      }

      :host([header]) {
        height: 56px;
      }

      :host([hidden]) {
        display: none;
      }
    </style>
    <slot></slot>
`;
    }

    static get is() {
      return 'nuxeo-data-table-cell';
    }

    static get properties() {
      return {
        alignRight: Boolean,
        column: Object,
        flex: Number,
        header: Boolean,
        hidden: Boolean,
        order: Number,
        template: Object,
        width: String,

        beforeBind: {
          type: Object,
          value() {
            return function (data, cell) { }; // eslint-disable-line no-unused-vars
          },
        },
      };
    }

    static get observers() {
      return [
        '_beforeBind(beforeBind, column.*, index, item.*, expanded, selected)',
        '_beforeBindHeader(beforeBind, column.*)',
        '_alignRightChanged(alignRight)',
        '_columnChanged(_instance, column)',
        '_columnPathChanged(_instance, column.*)',
        '_flexChanged(flex)',
        '_hiddenChanged(hidden)',
        '_orderChanged(order)',
        '_widthChanged(width)',
      ];
    }

    _alignRightChanged(alignRight) {
      this.style.flexDirection = alignRight ? 'row-reverse' : 'row';
    }

    _beforeBind(beforeBind, column, index, item, expanded, selected) {
      const data = {
        column: column.base,
        index,
        item: item.base,
        expanded,
        selected,
      };
      beforeBind(data, this);
    }

    // header cells aren't bound with item, index etc. so _beforeBind is never
    // called for them so we need a separate observer.
    _beforeBindHeader(beforeBind, column) {
      if (this.header) {
        const data = {
          column: column.base,
        };

        beforeBind(data, this);
      }
    }

    _hiddenChanged(hidden) {
      this.toggleAttribute('hidden', hidden);
    }

    _orderChanged(order) {
      this.style.order = order;
    }

    _flexChanged(flex) {
      this.style.flexGrow = flex;
    }

    _widthChanged(width) {
      this.style.flexBasis = width;
    }

    _columnChanged(instance, column) {
      if (instance) {
        instance.column = column;
      }
    }

    _columnPathChanged(instance, column) {
      if (!instance) {
        return;
      }
      // sometimes instance isn't ready to be notified yet and throws an error.
      microTask.run(() => {
        // TODO: hack to avoid: https://github.com/Polymer/polymer/issues/3307
        this._parentProps = this._parentProps || {};
        instance.notifyPath(column.path, column.value);
      });
    }
  }

  customElements.define(DataTableCell.is, DataTableCell);
  Nuxeo.DataTableCell = DataTableCell;
}
