/* Part of `nuxeo-data-table` */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';

{
  class DataTableRow extends Nuxeo.Element {
    static get template() {
      return html`
    <style>
      :host {
        display: flex;
        flex-direction: column;
        opacity: 1;
        cursor: pointer;
        border: 2px solid transparent;
        border-bottom: 1px solid var(--nuxeo-border, #e3e3e3);
        padding-bottom: 1px;
        @apply --iron-data-table-row;
        @apply --layout-horizontal;
        @apply --layout-center;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      :host([selected]) {
        border: 2px solid var(--nuxeo-primary-color, blue);
        padding-bottom: 0;
        background-color: var(--nuxeo-page-background, red);
      }

      :host([selected]) .cells {
        @apply --iron-data-table-row-selected;
      }

      :host(:not([header])[even]) {
        @apply --iron-data-table-row-even;
      }

      :host(:not([header]):not([even])) {
        @apply --iron-data-table-row-odd;
      }

      :host(:focus) {
        outline: none;
        @apply --iron-data-table-row-focused;
      }

      :host(:not([header]):hover) {
        @apply --iron-data-table-row-hover;
        @apply --nuxeo-block-hover;
      }

      :host(:focus):after {
        @apply --iron-data-table-row-focused-after;
      }

      :host:after {
        @apply --iron-data-table-row-after;
      }

      .cells {
        display: flex;
        flex-direction: row;
        width: 100%;
      }

    </style>

    <div class="cells">
      <slot name="checkbox"></slot>
      <slot></slot>
      <slot name="settings"></slot>
    </div>
    <div class="details">
      <slot name="detail"></slot>
    </div>
    <div class="actions">
      <slot name="action"></slot>
    </div>
`;
    }

    static get is() {
      return 'nuxeo-data-table-row';
    }

    static get properties() {
      return {
        beforeBind: Object,
        expanded: {
          type: Boolean,
          reflectToAttribute: true,
        },
        index: Number,
        item: Object,
        selected: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
        },
        _static: {
          type: Object,
          value: { id: 0 },
        },
      };
    }

    static get observers() {
      return [
        '_beforeBind(beforeBind, index, item.*, selected, expanded)',
      ];
    }

    connectedCallback() {
      super.connectedCallback();
      const host = dom(this).getOwnerRoot().host;
      if (host && host.tagName === 'NUXEO-DATA-TABLE') {
        const id = this._static.id++;
        const item = this.parentElement;
        if (!item._rowId) {
          this._contentElement = document.createElement('slot');
          this._contentElement.setAttribute('name', `item${id}`);
          dom(item).appendChild(this._contentElement);
          item._rowId = id;

          dom(host).appendChild(this);

          this.slot = `item${id}`;
          // reset the cached value for shady root owner to make this.domHost
          // return correct value.
          this._ownerShadyRoot = undefined;
        }
      }
    }

    _beforeBind(beforeBind, index, item, selected, expanded) {
      if (!beforeBind) {
        return;
      }

      const data = {
        index,
        item: item.base,
        expanded,
        selected,
      };

      beforeBind(data, this);
    }
  }

  customElements.define(DataTableRow.is, DataTableRow);
  Nuxeo.DataTableRow = DataTableRow;
}
