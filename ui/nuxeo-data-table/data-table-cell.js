import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import './data-table-templatizer-behavior.js';

/* Part of `nuxeo-data-table` */
{
  // eslint-disable-next-line no-undef
  class DataTableCell extends mixinBehaviors([saulis.DataTableTemplatizerBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            flex: 1 0 120px;
            padding: 0 24px;
            min-height: 48px;
            display: flex;
            align-items: center;
            overflow-x: hidden;
            overflow-y: hidden;
            transition: flex-basis 200ms, flex-grow 200ms;
            @apply --iron-data-table-cell;
          }

          /* header cells need relative positioning for the resizer */
          :host([header]) {
            position: relative;
            height: 48px;
          }

          :host([hidden]) {
            display: none;
          }

          :host([header]) ::slotted(*) {
            min-width: 0;
          }

          :host([header]) ::slotted(#columnHeader) {
            flex: 1 1 70px;
            min-width: 70px;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: start;
          }

          /* resizer handle (visible on header cells) */
          .resizer {
            display: none;
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 8px;
            cursor: col-resize;
            z-index: 5;
          }

          :host([header]) .resizer {
            display: block;
          }

          /* small interaction area to make grabbing easier */
          .resizer:after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 2px;
            height: 28px;
            background: rgba(0, 0, 0, 0.15);
            border-radius: 2px;
          }

          :host(.dragging) {
            opacity: 0.6;
            outline: 1px dashed rgba(0, 0, 0, 0.2);
          }
        </style>

        <div class="resizer" on-mousedown="_onResizerDown" on-touchstart="_onResizerDown"></div>
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
        overflow: String,

        beforeBind: {
          type: Object,
          value() {
            return function(data, cell) {}; // eslint-disable-line no-unused-vars
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
        '_overflowChanged(overflow)',
      ];
    }

    ready() {
      super.ready();
      if (this.header) {
        this.setAttribute('scope', 'col');
      } else {
        this.setAttribute('role', 'cell');
      }

      // make header cells draggable for reordering
      if (this.header) {
        // set draggable so native drag events fire
        this.draggable = true;
        this.addEventListener('dragstart', this._onDragStart.bind(this));
        this.addEventListener('dragover', this._onDragOver.bind(this));
        this.addEventListener('drop', this._onDrop.bind(this));
        this.addEventListener('dragend', this._onDragEnd.bind(this));
        // touch fallback: prevent text selection while touching resizer or dragging
        this.addEventListener('touchmove', () => {
          // noop: allow host app to handle gestures; we simply provide events on resizer
        });
      }
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

    _overflowChanged(overflow) {
      if (overflow === 'auto') {
        this.style.overflowX = 'auto';
      } else {
        this.style.overflowX = 'hidden';
      }
    }

    _widthChanged(width) {
      // Only lock the cell to an explicit width when the user is actively resizing.
      // This avoids frozen columns on initial load when columns come with configured width values.
      const isUserResize = this.table && this.table._resizing;
      if (width && isUserResize) {
        const val = typeof width === 'number' ? `${width}px` : width;
        this.style.flex = `0 0 ${val}`;
        this.style.flexBasis = val;
      } else if (!width) {
        // restore default CSS behavior (flex: 1 1 0 from iron-data-table)
        this.style.flex = '';
        this.style.flexBasis = '';
      } else {
        // width present but not user-initiated: don't lock, let stylesheet/CSS handle stretching
        // this.style.flex = '';
        this.style.flexBasis = width;
      }
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

    // --- resizing and dragging handlers (emit events, actual work done by the table) ---

    _onResizerDown(e) {
      // support both mouse and touch
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      e.stopPropagation();
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent('column-resize-start', {
          composed: true,
          bubbles: true,
          detail: {
            column: this.column,
            startX: clientX,
            startWidth: parseFloat(this.column.width) || this.getBoundingClientRect().width,
          },
        }),
      );
    }

    _onDragStart(e) {
      // some browsers require setData for drag to work
      try {
        e.dataTransfer.setData('text/plain', '');
      } catch (err) {
        // ignore
      }
      this.classList.add('dragging');
      this.dispatchEvent(
        new CustomEvent('column-drag-start', {
          composed: true,
          bubbles: true,
          detail: { column: this.column },
        }),
      );
    }

    _onDragOver(e) {
      e.preventDefault(); // allow drop
      this.dispatchEvent(
        new CustomEvent('column-drag-over', {
          composed: true,
          bubbles: true,
          detail: { column: this.column },
        }),
      );
    }

    _onDrop(e) {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent('column-drop', {
          composed: true,
          bubbles: true,
          detail: { column: this.column },
        }),
      );
      this.classList.remove('dragging');
    }

    _onDragEnd() {
      this.classList.remove('dragging');
    }
  }

  customElements.define(DataTableCell.is, DataTableCell);
  Nuxeo.DataTableCell = DataTableCell;
}
