import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import './data-table-templatizer-behavior.js';

/* Part of `nuxeo-data-table` */

const TRANSPARENT_DRAG_IMAGE = (() => {
  const img = new Image();
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  return img;
})();

const RESIZE_ZONE = 8;

{
  // eslint-disable-next-line no-undef
  class DataTableCell extends mixinBehaviors([saulis.DataTableTemplatizerBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            --resizer-hit-width: 8px;
            --resizer-line-width: 2px;
            --drop-indicator-width: 6px;
            flex: 1 0 120px;
            padding: 0 24px;
            min-height: 48px;
            display: flex;
            align-items: center;
            overflow-x: hidden;
            overflow-y: hidden;
            box-sizing: border-box;
          }

          /* header cells need relative positioning for the resizer */
          :host([header]) {
            position: relative;
            overflow: visible;
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
            width: var(--resizer-hit-width);
            cursor: col-resize;
            z-index: 5;
          }

          .resizer:after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: var(--resizer-line-width);
            height: 28px;
            background: rgba(0, 0, 0, 0.15);
            border-radius: 2px;
          }

          :host([header]) .resizer {
            display: none;
          }

          :host-context(nuxeo-data-table[column-resize-enabled]) .resizer {
            display: block;
          }

          :host(.dragging) {
            outline: 1px dashed rgba(0, 0, 0, 0.2);
            background: rgba(0, 102, 255, 0.08);
            box-shadow: inset 0 -2px 0 var(--nuxeo-primary-color, #0066ff);
            cursor: grabbing;
            cursor: -webkit-grabbing;
          }

          :host([header].column-active) {
            background: #1e90ff;
            color: #fff;
            cursor: grab;
            cursor: -webkit-grab;
          }

          :host([header].column-active)::after {
            content: '';
            position: absolute;
            inset: 0;
            border-left: 1px solid rgba(0, 102, 255, 0.4);
            border-right: 1px solid rgba(0, 102, 255, 0.4);
            pointer-events: none;
          }

          :host([header].drop-right)::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            right: 1px;
            width: 4px;
            background: var(--nuxeo-primary-color);
            pointer-events: none;
            z-index: 6;
          }

          :host([header].drop-left)::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 1px;
            width: 4px;
            background: var(--nuxeo-primary-color);
            pointer-events: none;
            z-index: 6;
          }
        </style>

        <template is="dom-if" if="[[header]]">
          <div class="resizer" on-mousedown="_onResizerDown" on-touchstart="_onResizerDown"></div>
        </template>

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

      if (this.header) {
        this.addEventListener('dragstart', this._onDragStart.bind(this));
        this.addEventListener('dragend', this._onDragEnd.bind(this));
        this.addEventListener('mousemove', this._updateCursor.bind(this));
        this.addEventListener('mouseleave', this._resetCursor.bind(this));
        this.addEventListener('mousedown', this._handleMouseDown.bind(this));
      }
    }

    connectedCallback() {
      super.connectedCallback();

      if (!this.header) return;

      // Wait one microtask to ensure dom-repeat finished
      microTask.run(() => {
        const table = this.closest('nuxeo-data-table');

        if (!table) return;

        this.draggable = !!table.columnReorderEnabled;
      });
    }

    _handleMouseDown(e) {
      const table = this.closest('nuxeo-data-table');
      if (!table) return;

      const rect = this.getBoundingClientRect();
      const nearEdge = e.clientX >= rect.right - RESIZE_ZONE;
      // --- RESIZE INTENT ---
      if (table.columnResizeEnabled && nearEdge) {
        // Lock resize state immediately (prevents first-frame grab cursor)
        this.classList.add('resizing');
        this.style.cursor = 'col-resize';
        this.draggable = false;
        return;
      }

      // --- REORDER INTENT ---
      this.classList.remove('resizing');
      this.draggable = !!table.columnReorderEnabled;
    }

    _updateCursor(e) {
      const table = this.closest('nuxeo-data-table');
      if (!table) return;

      const rect = this.getBoundingClientRect();
      const nearEdge = e.clientX >= rect.right - RESIZE_ZONE;

      // If resizing → force state
      if (this.classList.contains('resizing')) {
        this.style.cursor = 'col-resize';
        this.draggable = false;
        return;
      }

      // Resize mode
      if (table.columnResizeEnabled && nearEdge) {
        this.style.cursor = 'col-resize';
        this.draggable = false; // ← KEY FIX
        return;
      }

      // Reorder mode
      if (table.columnReorderEnabled) {
        this.style.cursor = 'grab';
        this.draggable = true;
      } else {
        this.style.cursor = '';
        this.draggable = false;
      }
    }

    _resetCursor() {
      if (!this.classList.contains('resizing')) {
        this.style.cursor = '';
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
        this.style.flex = '';
        this.style.flexBasis = '';
      } else {
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

    // ------------------------------------------------------------
    // Resize & drag emitters (cell-level)
    // ------------------------------------------------------------

    /**
     * Emits resize start with visual edge and width.
     */
    _onResizerDown(e) {
      const table = this.closest('nuxeo-data-table');
      if (!table || !table.columnResizeEnabled) return;

      this._updateCursor(e);

      e.stopPropagation();
      e.preventDefault();

      this.draggable = false;
      this.classList.add('resizing');

      const rect = this.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;

      this.dispatchEvent(
        new CustomEvent('column-resize-start', {
          composed: true,
          bubbles: true,
          detail: {
            column: this.column,
            startX: clientX,
            startWidth: Math.round(rect.width),
          },
        }),
      );
    }

    /**
     * Cleans up drag ghost and emits drag end.
     */

    _onDragEnd() {
      if (this._cleanupGhostMove) {
        this._cleanupGhostMove();
      }

      const ghostEl = document.querySelector('.column-drag-ghost');
      if (ghostEl) {
        ghostEl.remove();
      }

      this.classList.remove('dragging');
      this.style.cursor = '';

      const table = this.closest('nuxeo-data-table');
      this.draggable = Boolean(table && table.columnReorderEnabled);

      this.dispatchEvent(
        new CustomEvent('column-drag-end', {
          bubbles: true,
          composed: true,
          detail: { column: this.column },
        }),
      );
    }

    _onDragStart(e) {
      this.classList.remove('resizing');

      const table = this.closest('nuxeo-data-table');
      if (!table || !table.columnReorderEnabled) {
        e.preventDefault();
        return;
      }
      if (table._resizing || this.classList.contains('resizing')) {
        e.preventDefault();
        return;
      }

      if (!this.draggable) {
        e.preventDefault();
        return;
      }

      const rect = this.getBoundingClientRect();
      const RESIZE_ZONE = 10;
      if (e.clientX >= rect.right - RESIZE_ZONE) {
        e.preventDefault();
        return;
      }

      // --- Start real drag ---

      try {
        e.dataTransfer.setData('text/plain', '');
      } catch (_) {
        // Firefox requirement
      }

      e.dataTransfer.effectAllowed = 'move';

      // IMPORTANT: calculate offset from pointer to column edge
      this._dragOffsetX = e.clientX - rect.left;

      // ---- measure visible table height ----
      let header = null;
      let list = null;

      if (table && table.shadowRoot) {
        header = table.shadowRoot.querySelector('#header');
        list = table.shadowRoot.querySelector('#list');
      }

      const headerHeight = header ? header.getBoundingClientRect().height : rect.height;
      const bodyHeight = list ? list.getBoundingClientRect().height : 200;
      const totalHeight = headerHeight + bodyHeight;

      // ---- ghost container ----
      const ghost = document.createElement('div');
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${totalHeight}px`;
      ghost.style.display = 'flex';
      ghost.style.flexDirection = 'column';
      ghost.style.pointerEvents = 'none';
      ghost.style.position = 'fixed';
      ghost.style.opacity = '0.5';
      ghost.style.background = 'grey';
      ghost.style.border = '1px solid rgba(0,0,0,0.26)';
      ghost.style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)';
      ghost.style.borderRadius = '4px';
      ghost.style.overflow = 'hidden';
      ghost.style.transform = 'translateZ(0)';
      ghost.classList.add('column-drag-ghost');

      const headerTop = header ? header.getBoundingClientRect().top : rect.top;
      ghost.style.top = `${headerTop}px`;
      ghost.style.left = `${rect.left}px`;

      // ---- header clone ----
      const headerClone = this.cloneNode(false);
      headerClone.style.height = `${rect.height}px`;
      headerClone.style.minHeight = `${rect.height}px`;
      headerClone.style.flex = '0 0 auto';
      headerClone.style.background = 'transparent';
      headerClone.style.borderBottom = '1px solid rgba(0,0,0,0.08)';

      const slot = document.createElement('slot');
      slot.style.display = 'none';
      headerClone.appendChild(slot);

      // ---- body filler ----
      const bodyFill = document.createElement('div');
      bodyFill.style.flex = '1';
      bodyFill.style.background =
        'repeating-linear-gradient(' +
        'to bottom,' +
        'rgba(0,0,0,0.03),' +
        'rgba(0,0,0,0.03) 1px,' +
        'transparent 1px,' +
        'transparent 48px' +
        ')';

      ghost.appendChild(headerClone);
      ghost.appendChild(bodyFill);
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(TRANSPARENT_DRAG_IMAGE, 0, 0);
      this.classList.add('dragging');
      this.style.cursor = 'grabbing';

      table._dragOffsetX = this._dragOffsetX;

      this.dispatchEvent(
        new CustomEvent('column-drag-start', {
          composed: true,
          bubbles: true,
          detail: { column: this.column },
        }),
      );

      // ---- ghost move ----
      const moveGhost = (ev) => {
        ev.preventDefault();

        const ghostEl = document.querySelector('.column-drag-ghost');
        if (!ghostEl) return;

        const ghostLeft = ev.clientX - this._dragOffsetX;
        ghostEl.style.left = `${ghostLeft}px`;

        const ghostWidth = ghostEl.offsetWidth;
        const dataTable = this.closest('nuxeo-data-table');
        if (!dataTable) return;

        // Initialize once
        if (dataTable._dragStartGhostX == null) {
          dataTable._dragStartGhostX = ghostLeft;
          dataTable._lastDragDirection = 'right';
        }

        const delta = ghostLeft - dataTable._dragStartGhostX;
        const DIRECTION_THRESHOLD = 6;

        if (delta > DIRECTION_THRESHOLD) {
          dataTable._lastDragDirection = 'right';
        } else if (delta < -DIRECTION_THRESHOLD) {
          dataTable._lastDragDirection = 'left';
        }

        const draggingRight = dataTable._lastDragDirection === 'right';
        const intentX = draggingRight ? ghostLeft + ghostWidth : ghostLeft;
        dataTable._onColumnDragMove(intentX);
      };

      document.addEventListener('dragover', moveGhost);

      this._cleanupGhostMove = () => {
        document.removeEventListener('dragover', moveGhost);
        this.style.cursor = '';
      };
    }
  }

  customElements.define(DataTableCell.is, DataTableCell);
  Nuxeo.DataTableCell = DataTableCell;
}
