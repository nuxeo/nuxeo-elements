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
            // background-color: red;
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
            display: block;
          }

          

          :host(.dragging) {
           // opacity: 0.6;
            outline: 1px dashed rgba(0, 0, 0, 0.2);
            background: rgba(0, 102, 255, 0.08);
            box-shadow: inset 0 -2px 0 var(--nuxeo-primary-color, #0066ff);
           cursor: grabbing;
  cursor: -webkit-grabbing;
          }
  
           :host([header].column-active) {
  background: dodgerblue;
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


/* DROP INDICATOR — centered on column edge */
:host([header].drop-before)::before,
:host([header].drop-after)::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--drop-indicator-width);
  background: var(--nuxeo-primary-color);
  pointer-events: none;
  z-index: 6;
}

/* LEFT edge */
:host([header].drop-before)::before {
  left: calc(var(--drop-indicator-width) / -2);
}

/* RIGHT edge */
:host([header].drop-after)::after {
  right: calc(var(--drop-indicator-width) / -2);
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
        '_overflowChanged(overflow)'
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
  this.draggable = true;
  this.addEventListener('dragstart', this._onDragStart.bind(this));
  
  this.addEventListener('dragend', this._onDragEnd.bind(this));

 
  

  
}




      
    }




_onDragEnd() {
  

  this._cleanupGhostMove?.();
  document.querySelector('.column-drag-ghost')?.remove();
  this.classList.remove('dragging');

  this.dispatchEvent(
    new CustomEvent('column-drag-end', {
      bubbles: true,
      composed: true,
      detail: { column: this.column },
    }),
  );
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
      //  console.log("this: " + this);
     //   console.log("in if :::::: " + "width: " + width + "  this.style.flex: " + this.style.flex + "  this.style.flexBasis: " + this.style.flexBasis);
        
      } else if (!width) {
       // console.log("in else if");
        // restore default CSS behavior (flex: 1 1 0 from iron-data-table)
        this.style.flex = '';
        this.style.flexBasis = '';
        // console.log("this: " + this);
        // console.log("this.style.flex: " + this.style.flex);
        // console.log("this.style.flexBasis: " + this.style.flexBasis);
      } else {
       // console.log("in else");
        // width present but not user-initiated: don't lock, let stylesheet/CSS handle stretching
        // this.style.flex = '';
        this.style.flexBasis = width;
        // console.log("this: " + this);
        // console.log("this.style.flex: " + this.style.flex);
        // console.log("this.style.flexBasis: " + this.style.flexBasis);
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
 // console.log('_onResizerDown');

  e.stopPropagation();
  e.preventDefault();

  // 🔑 temporarily disable drag
  this.draggable = false;

  const cellRect = this.getBoundingClientRect();

  const edgeX = Math.round(cellRect.right);
  const visualWidth = Math.round(cellRect.width);



  console.log('[RESIZE START]');
console.log('mousedown clientX:', e.clientX);
console.log('cellRect.right   :', Math.round(cellRect.right));
console.log('resizerRect.right:',
  Math.round(this.shadowRoot.querySelector('.resizer')
    .getBoundingClientRect().right)
);



  this.dispatchEvent(
    new CustomEvent('column-resize-start', {
      composed: true,
      bubbles: true,
      detail: {
        column: this.column,
        startX: edgeX,          // ✅ visual edge
        startWidth: visualWidth // ✅ visual width ONLY
      },
    }),
  );
}



 _onDragStart(e) {

  // 🔑 if resize is active, DO NOT start drag
  const table = this.closest('nuxeo-data-table');
  if (table && table._resizing) {
    e.preventDefault();
    return;
  }

  
  try {
    e.dataTransfer.setData('text/plain', '');
  } catch (_) {}

  e.dataTransfer.effectAllowed = 'move';
  const rect = this.getBoundingClientRect();
  this._dragOffsetX = e.clientX - rect.left;


  // ---- measure visible table height ----
 // const table = this.closest('nuxeo-data-table');
  const header = table?.shadowRoot?.querySelector('#header');
  const list = table?.shadowRoot?.querySelector('#list');

  const headerHeight = header ? header.getBoundingClientRect().height : rect.height;
  const bodyHeight = list ? list.getBoundingClientRect().height : 200;
  const totalHeight = headerHeight + bodyHeight;

  // ---- ghost container (full column) ----
  const ghost = document.createElement('div');
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${totalHeight}px`;
  ghost.style.display = 'flex';
  ghost.style.flexDirection = 'column';
  ghost.style.pointerEvents = 'none';
  ghost.style.position = 'fixed';
  
  ghost.style.opacity = '0.5';               // 🔑 more ghostly
  ghost.style.background = 'grey';
  ghost.style.border = '1px solid rgba(0, 0, 0, 0.26)';
  ghost.style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)';
  ghost.style.borderRadius = '4px';
  ghost.style.overflow = 'hidden';
  ghost.style.transform = 'translateZ(0)';

  ghost.classList.add('column-drag-ghost');


  const headerTop = header.getBoundingClientRect().top;

ghost.style.top = `${headerTop}px`;
ghost.style.left = `${rect.left}px`;


  // ---- header clone ----
  const headerClone = this.cloneNode(false); // 🔑 SHALLOW clone (no children)

// preserve size
headerClone.style.height = `${rect.height}px`;
headerClone.style.minHeight = `${rect.height}px`;
headerClone.style.flex = '0 0 auto';

// ghost look
headerClone.style.background = 'transparent';
headerClone.style.borderBottom = '1px solid rgba(0,0,0,0.08)';

// 🔑 REMOVE SLOT CONTENT COMPLETELY
const slot = document.createElement('slot');
slot.style.display = 'none';
headerClone.appendChild(slot);


  // ---- column body filler (no data, just shape) ----
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

  // kill native drag image (1x1 transparent)
const img = new Image();
img.src =
  'data:image/svg+xml;base64,' +
  btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>');

e.dataTransfer.setDragImage(img, 0, 0);



  this.classList.add('dragging');

  
  if (table) {
    table._dragOffsetX = this._dragOffsetX;
  }


  this.dispatchEvent(
    new CustomEvent('column-drag-start', {
      composed: true,
      bubbles: true,
      detail: { column: this.column },
    }),
  );

 
  const moveGhost = (ev) => {
  ev.preventDefault();

  const ghost = document.querySelector('.column-drag-ghost');
  if (!ghost) return;

  const ghostLeft = ev.clientX - this._dragOffsetX;
  ghost.style.left = `${ghostLeft}px`;

  const ghostWidth = ghost.offsetWidth;

  const table = this.closest('nuxeo-data-table');
  if (!table) return;

  // 🔑 determine drag direction
  // ---- STABLE drag direction detection ----

// initialize on first move
if (table._dragStartGhostX == null) {
  table._dragStartGhostX = ghostLeft;
  table._lastDragDirection = 'right'; // default
}

const delta = ghostLeft - table._dragStartGhostX;
const DIRECTION_THRESHOLD = 6; // px (tweakable)

// only flip direction when user *actually* reverses
if (delta > DIRECTION_THRESHOLD) {
  table._lastDragDirection = 'right';
} else if (delta < -DIRECTION_THRESHOLD) {
  table._lastDragDirection = 'left';
}

const draggingRight = table._lastDragDirection === 'right';

// intent edge is now STABLE
const intentX = draggingRight
  ? ghostLeft + ghostWidth
  : ghostLeft;

// console.log(
//   '[DRAG]',
//   'delta:', delta,
//   'dir:', table._lastDragDirection,
//   'intentX:', intentX
// );



table._onColumnDragMove(intentX);



};


// 🔥 THIS LINE WAS MISSING
document.addEventListener('dragover', moveGhost);

this._cleanupGhostMove = () => {
  document.removeEventListener('dragover', moveGhost);
};


}



  }

  customElements.define(DataTableCell.is, DataTableCell);
  Nuxeo.DataTableCell = DataTableCell;
}
