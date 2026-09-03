import{h as c,D as y,t as T,d as u,m as b,a as v,P as S,B as D}from"./iframe-T5hUCbnt.js";import{I as q,a as P}from"./iron-validatable-behavior-DVOrdGp7.js";import{P as $}from"./nuxeo-page-provider-display-behavior-BXf2qcae.js";import{I as j}from"./iron-resizable-behavior-BJTBE6_U.js";import"./nuxeo-dialog-B7wOaaIF.js";import"./paper-icon-button-BQJYUoC5.js";import"./iron-icons-B0EFH-ea.js";import"./paper-input-CgOMKcUj.js";import"./paper-checkbox-DJEpcUTk.js";import"./paper-dialog-scrollable-BWg20tOm.js";import"./shadow-BdVOAeUX.js";import{a as A}from"./render-status-BJmzACxi.js";import{I as _}from"./nuxeo-i18n-behavior-DzdsuNZu.js";import{T as I}from"./templatizer-behavior-BRsvGg6D.js";import"./nuxeo-checkmark-B2kpQSOl.js";import"./iron-iconset-svg-bEbhiue4.js";import"./nuxeo-tooltip-BrXDqAUB.js";import{D as N}from"./nuxeo-draggable-list-behavior-CNLYXsWu.js";{class i extends Nuxeo.Element{static get template(){return c`
        <style>
          :host {
            height: 100%;
            display: flex;
            align-items: center;
          }
          :host([hidden]) {
            display: none;
          }
          /* ELEMENTS-1214: Align this element appearance with nuxeo-selectivity */
          paper-input {
            --paper-input-container: {
              font-size: inherit;
              margin: 12px 2px 9px 2px;
              margin-top: 3px;
            }

            --paper-input-container-input: {
              min-height: 2em;
              padding: 0;
              font-size: inherit;
              font-weight: 600;
            }

            --paper-input-container-color: {
              color: var(--nuxeo-text-default, #3a3a54);
            }

            --paper-input-container-label: {
              font-size: inherit;
              color: #606978;
              font-weight: 600;
              padding: 0;
            }
          }
          .required-indicator {
            margin-inline-start: 4px;
            color: var(--paper-input-container-invalid-color, #de350b);
          }
          .required-indicator[hidden] {
            display: none;
          }
        </style>
        <paper-input no-label-float label="[[label]]" value="[[value]]" on-value-changed="_valueChanged"></paper-input>
        <span class="required-indicator" aria-hidden="true" hidden$="[[!required]]">*</span>
      `}static get is(){return"nuxeo-data-table-column-filter"}static get properties(){return{label:String,value:{type:String,notify:!0,observer:"_valuePropertyChanged"},hidden:Boolean,required:{type:Boolean,value:!1}}}_valuePropertyChanged(e){this._debouncer&&this._debouncer.cancel&&this._debouncer.cancel();const t=this.shadowRoot&&this.shadowRoot.querySelector("paper-input");t&&t.value!==e&&(t.value=e||"")}_valueChanged(e){const{value:t}=e.detail,s=r=>r==null||r==="";s(t)&&s(this.value)||t!==this.value&&(this._debouncer=y.debounce(this._debouncer,T.after(250),()=>{this.value=t}))}}customElements.define(i.is,i),Nuxeo.DataTableColumnFilter=i}{class i extends Nuxeo.Element{static get template(){return c`
        <template id="header">
          <nuxeo-data-table-column-filter
            label="[[column.name]]"
            value="{{column.filterValue}}"
            required="[[column.required]]"
            hidden$="[[!column.filterBy]]"
          >
          </nuxeo-data-table-column-filter>
          <div id="columnHeader" title="[[column.name]]" hidden$="[[column.filterBy]]">
            <!-- this template is stamped into nuxeo-data-table-cell, outside this element's style
                 scope, so the indicator is styled inline rather than from a stylesheet rule -->
            [[column.name]]<span
              class="required-indicator"
              style="margin-inline-start: 4px; color: var(--paper-input-container-invalid-color, #de350b)"
              aria-hidden="true"
              hidden$="[[!column.required]]"
              >*</span
            >
          </div>
        </template>
      `}static get is(){return"nuxeo-data-table-column"}static get properties(){return{alignRight:{type:Boolean,value:!1},name:{type:String,value:""},required:{type:Boolean,value:!1},filterBy:String,filterValue:String,filterExpression:String,width:{type:String,value:"150px"},resized:{type:Boolean,value:!1},flex:{type:Number,value:1},hidden:{type:Boolean,value:!1},alwaysVisible:{type:Boolean,value:!1},order:{type:Number,notify:!0},sortBy:{type:String},field:{type:String},table:Object,headerTemplate:{type:Object,readOnly:!0},template:{type:Object,readOnly:!0},overflow:{type:String,value:"hidden"}}}static get observers(){return["_alignRightChanged(table, alignRight)","_filterValueChanged(table, filterValue, filterBy, filterExpression)","_filterByChanged(table, filterBy)","_flexChanged(table, flex)","_overflowChanged(table, overflow)","_headerTemplateChanged(table, headerTemplate)","_hiddenChanged(table, hidden)","_alwaysVisibleChanged(table, alwaysVisible)","_nameChanged(table, name)","_orderChanged(table, order)","_requiredChanged(table, required)","_resizedChanged(table, resized)","_sortByChanged(table, sortBy)","_templateChanged(table, template)","_widthChanged(table, width)"]}ready(){super.ready(),this._setTemplate(u(this).querySelector("template:not([is=header])"));const e=u(this).querySelector("template[is=header]");e?this._setHeaderTemplate(e):this._setHeaderTemplate(u(this.root).querySelector("#header"))}_notifyTable(e,t,s){if(e&&e.columns){const r=e.columns.indexOf(this);e.notifyPath(`columns.${r}.${t}`,s)}}_alignRightChanged(e,t){this._notifyTable(e,"alignRight",t)}_nameChanged(e,t){this._notifyTable(e,"name",t)}_sortByChanged(e,t){this._notifyTable(e,"sortBy",t)}_flexChanged(e,t){this._notifyTable(e,"flex",t)}_overflowChanged(e,t){this._notifyTable(e,"overflow",t)}_headerTemplateChanged(e,t){this._notifyTable(e,"headerTemplate",t)}_hiddenChanged(e,t){this._notifyTable(e,"hidden",t)}_alwaysVisibleChanged(e,t){this._notifyTable(e,"alwaysVisible",t)}_orderChanged(e,t){this._notifyTable(e,"order",t)}_requiredChanged(e,t){this._notifyTable(e,"required",t)}_resizedChanged(e,t){this._notifyTable(e,"resized",t)}_templateChanged(e,t){this._notifyTable(e,"template",t)}_widthChanged(e,t){this._notifyTable(e,"width",t)}_filterByChanged(e,t){this._notifyTable(e,"filterBy",t)}_filterValueChanged(e,t,s,r){const o=s||this.field||null;if(e&&t!==void 0){if(this._notifyTable(e,"filterValue",t),e._suppressFilterEvents)return;this.dispatchEvent(new CustomEvent("column-filter-changed",{composed:!0,bubbles:!0,detail:{value:t,filterBy:o,filterExpression:r,name:this.name}}))}}}customElements.define(i.is,i),Nuxeo.DataTableColumn=i}{class i extends b([_],Nuxeo.Element){static get template(){return c`
        <style>
          :host {
            display: block;
            margin: 4px;
          }

          :host([hidden]) {
            display: none;
          }

          paper-icon-button {
            position: relative;
            transition: all 0.2s;
          }

          paper-icon-button:hover,
          paper-icon-button[focused] {
            color: var(--default-primary-color);
          }

          paper-icon-button:not([direction]) {
            opacity: 0.6;
          }

          paper-icon-button[direction='desc'] {
            transform: rotate(-180deg);
          }

          paper-icon-button[hidden] {
            display: none;
          }

          .order {
            font-size: 0.8rem;
            font-weight: bold;
            position: absolute;
            right: 4px;
            bottom: 8px;
          }

          #sortContainer {
            position: relative;
            width: 40px;
          }
        </style>

        <div id="sortContainer">
          <paper-icon-button
            id="sortIcon"
            on-click="_sort"
            icon="data-table:arrow-upward"
            direction$="[[direction]]"
            aria-label$="[[_computeAriaLabel(direction, i18n)]]"
          >
          </paper-icon-button>
          <div class="order">[[order]]</div>
        </div>
      `}static get is(){return"nuxeo-data-table-column-sort"}static get properties(){return{direction:{type:String,notify:!0},path:String,order:{type:Number,computed:"_order(path, sortOrder, sortOrder.length)"},sortOrder:Array}}static get observers(){return["_sortOrderChanged(sortOrder.*)"]}_order(e,t,s){if(s<=1)return"";for(let r=0;r<s;r++)if(t[r].path===e)return r+1}_sortOrderChanged(e){e.base&&e.base.forEach(t=>{t.path===this.path&&(this.direction=t.direction)})}_sort(){switch(this.direction){case"asc":this.direction="desc";break;case"desc":this.direction=null;break;default:this.direction="asc";break}this.dispatchEvent(new CustomEvent("sort-direction-changed",{composed:!0,bubbles:!0,detail:{path:this.path,direction:this.direction}}))}_computeAriaLabel(){if(this.direction)return this.i18n(`command.sort.${this.direction==="desc"?"descend":"ascend"}`)}}customElements.define(i.is,i),Nuxeo.DataTableColumnSort=i}window.saulis=window.saulis||{};saulis.DataTableTemplatizerBehaviorImpl={properties:{expanded:Boolean,index:Number,item:Object,selected:Boolean,table:Object,template:Object,_forwardedParentProps:{type:Object,value:{}},_instance:{type:Object,computed:"_templatize(template)"}},observers:["_expandedChanged(_instance, expanded)","_indexChanged(_instance, index)","_itemChanged(_instance, item)","_itemPathChanged(_instance, item.*)","_selectedChanged(_instance, selected)"],created(){this._instanceProps={column:!0,expanded:!0,index:!0,item:!0,selected:!0}},detached(){this.table=null,this._instance=null},_templatize(i){if(!i)return;delete i.__templatizeOwner,this.templatize(i),i._rootDataHost&&(this._getRootDataHost=function(){return i._rootDataHost});const n=this.stamp({});return Object.keys(this._forwardedParentProps).forEach(e=>{n[e]=this._forwardedParentProps[e]}),u(this).insertBefore(n.root,u(this).firstElementChild),n},_expandedChanged(i,n){this._expanded=n,i&&(i.expanded=n)},_indexChanged(i,n){i&&(i.index=n)},_itemChanged(i,n){i&&(i.item=n)},_itemPathChanged(i,n){this._parentProps=this._parentProps||{},i&&i.notifyPath(n.path,n.value)},_selectedChanged(i,n){this._selected=n,i&&(i.selected=n)},_forwardHostPropV2(i,n){this._forwardedParentProps[i]=n,this._instance&&(this._instance[i]=n)},_notifyInstancePropV2(i,n,e){n==="expanded"&&i.item&&this._expanded!==e&&(e?this.table.expandItem(i.item):this.table.collapseItem(i.item)),n==="selected"&&i.item&&this._selected!==e&&(e?this.table.selectItem(i.item):this.table.deselectItem(i.item))},_forwardInstancePath(i,n,e){n.indexOf("item")===0&&(this.table._debouncer=y.debounce(this.table._debouncer,v,()=>{this.table.dispatchEvent(new CustomEvent("item-changed",{composed:!0,bubbles:!0,detail:{item:i.item,path:n.substring(5),value:e}}))}))}};saulis.DataTableTemplatizerBehavior=[I,saulis.DataTableTemplatizerBehaviorImpl];const F=(()=>{const i=new Image;return i.src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",i})(),E=8;{class i extends b([saulis.DataTableTemplatizerBehavior],Nuxeo.Element){static get template(){return c`
        <style>
          :host {
            /* Must match RESIZE_ZONE */
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
            overflow-x: auto;
            overflow-y: hidden;
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

          .resizer {
            display: none;
          }
          :host([header][resize-enabled]) .resizer {
            display: block;
          }
        </style>

        <template is="dom-if" if="[[header]]">
          <div class="resizer" on-mousedown="_onResizerDown" on-touchstart="_onResizerDown"></div>
        </template>

        <slot></slot>
      `}static get is(){return"nuxeo-data-table-cell"}static get properties(){return{alignRight:Boolean,column:Object,flex:Number,header:Boolean,hidden:Boolean,order:Number,resized:Boolean,template:Object,width:String,overflow:String,beforeBind:{type:Object,value(){return function(e,t){}}}}}static get observers(){return["_beforeBind(beforeBind, column.*, index, item.*, expanded, selected)","_beforeBindHeader(beforeBind, column.*)","_alignRightChanged(alignRight)","_columnChanged(_instance, column)","_columnPathChanged(_instance, column.*)","_flexChanged(flex)","_hiddenChanged(hidden)","_orderChanged(order)","_widthChanged(width, resized)","_overflowChanged(overflow)"]}ready(){super.ready(),this.header?this.setAttribute("role","columnheader"):this.setAttribute("role","cell"),this.header&&(this.addEventListener("dragstart",this._onDragStart.bind(this)),this.addEventListener("dragend",this._onDragEnd.bind(this)),this.addEventListener("mousemove",this._updateCursor.bind(this)),this.addEventListener("mouseleave",this._resetCursor.bind(this)),this.addEventListener("mousedown",this._handleMouseDown.bind(this)))}connectedCallback(){super.connectedCallback(),this.header&&v.run(()=>{const e=this.closest("nuxeo-data-table");e&&(this.draggable=!!e.columnReorderEnabled,e.hasAttribute("column-resize-enabled")?this.setAttribute("resize-enabled",""):this.removeAttribute("resize-enabled"))})}_handleMouseDown(e){const t=this.closest("nuxeo-data-table");if(!t)return;const s=this.getBoundingClientRect(),r=e.clientX>=s.right-E;if(t.columnResizeEnabled&&r){this.classList.add("resizing"),this.style.cursor="col-resize",this.draggable=!1;return}this.classList.remove("resizing"),this.draggable=!!t.columnReorderEnabled}_updateCursor(e){const t=this.closest("nuxeo-data-table");if(!t)return;const s=this.getBoundingClientRect(),r=e.clientX>=s.right-E;if(this.classList.contains("resizing")){this.style.cursor="col-resize",this.draggable=!1;return}if(t.columnResizeEnabled&&r){this.style.cursor="col-resize",this.draggable=!1;return}t.columnReorderEnabled?(this.style.cursor="grab",this.draggable=!0):(this.style.cursor="",this.draggable=!1)}_resetCursor(){this.classList.contains("resizing")||(this.style.cursor="")}_alignRightChanged(e){this.style.flexDirection=e?"row-reverse":"row"}_beforeBind(e,t,s,r,o,a){const h={column:t.base,index:s,item:r.base,expanded:o,selected:a};e(h,this)}_beforeBindHeader(e,t){if(this.header){const s={column:t.base};e(s,this)}}_hiddenChanged(e){this.toggleAttribute("hidden",e)}_orderChanged(e){this.style.order=e}_flexChanged(e){if(this._shouldLockWidth(this.width,this.resized)){this.style.flexGrow="0",this.style.flexShrink="0";return}this.style.flexGrow=e}_overflowChanged(e){e==="auto"?this.style.overflowX="auto":this.style.overflowX="hidden"}_widthChanged(e,t){if(this._shouldLockWidth(e,t)){const r=typeof e=="number"?`${e}px`:e;this.style.flex=`0 0 ${r}`,this.style.flexBasis=r,this.style.flexGrow="0",this.style.flexShrink="0"}else e?(this.style.flex="",this.style.flexBasis=e,this.style.flexGrow=this.flex,this.style.flexShrink=""):(this.style.flex="",this.style.flexBasis="",this.style.flexGrow=this.flex,this.style.flexShrink="")}_shouldLockWidth(e,t){if(!e)return!1;const s=this.table&&this.table._resizing;return!!(s&&s.column&&this.column===s.column)||!!t}_columnChanged(e,t){e&&(e.column=t)}_columnPathChanged(e,t){e&&v.run(()=>{this._parentProps=this._parentProps||{},e.notifyPath(t.path,t.value)})}_onResizerDown(e){const t=this.closest("nuxeo-data-table");if(!t||!t.columnResizeEnabled)return;this._updateCursor(e),e.stopPropagation(),e.preventDefault(),this.draggable=!1,this.classList.add("resizing");const s=this.getBoundingClientRect(),r=e.touches?e.touches[0].clientX:e.clientX;this.dispatchEvent(new CustomEvent("column-resize-start",{composed:!0,bubbles:!0,detail:{column:this.column,startX:r,startWidth:Math.round(s.width)}}))}_onDragEnd(){this._cleanupGhostMove&&this._cleanupGhostMove();const e=document.querySelector(".column-drag-ghost");e&&e.remove(),this.classList.remove("dragging"),this.style.cursor="";const t=this.closest("nuxeo-data-table");this.draggable=!!(t&&t.columnReorderEnabled),this.dispatchEvent(new CustomEvent("column-drag-end",{bubbles:!0,composed:!0,detail:{column:this.column}}))}_onDragStart(e){this.classList.remove("resizing");const t=this.closest("nuxeo-data-table");if(!t||!t.columnReorderEnabled){e.preventDefault();return}if(t._resizing||this.classList.contains("resizing")){e.preventDefault();return}if(!this.draggable){e.preventDefault();return}const s=this.getBoundingClientRect();if(e.clientX>=s.right-E){e.preventDefault();return}try{e.dataTransfer.setData("text/plain","")}catch{}e.dataTransfer.effectAllowed="move",this._dragOffsetX=e.clientX-s.left;let r=null,o=null;t&&t.shadowRoot&&(r=t.shadowRoot.querySelector("#header"),o=t.shadowRoot.querySelector("#list"));const a=r?r.getBoundingClientRect().height:s.height,h=o?o.getBoundingClientRect().height:200,l=a+h,d=document.createElement("div");d.style.width=`${s.width}px`,d.style.height=`${l}px`,d.style.display="flex",d.style.flexDirection="column",d.style.pointerEvents="none",d.style.position="fixed",d.style.opacity="0.5",d.style.background="grey",d.style.border="1px solid rgba(0,0,0,0.26)",d.style.boxShadow="0 16px 40px rgba(0,0,0,0.25)",d.style.borderRadius="4px",d.style.overflow="hidden",d.style.transform="translateZ(0)",d.classList.add("column-drag-ghost");const f=r?r.getBoundingClientRect().top:s.top;d.style.top=`${f}px`,d.style.left=`${s.left}px`;const p=this.cloneNode(!1);p.style.height=`${s.height}px`,p.style.minHeight=`${s.height}px`,p.style.flex="0 0 auto",p.style.background="transparent",p.style.borderBottom="1px solid rgba(0,0,0,0.08)";const R=document.createElement("slot");R.style.display="none",p.appendChild(R);const x=document.createElement("div");x.style.flex="1",x.style.background="repeating-linear-gradient(to bottom, rgba(0,0,0,0.03),rgba(0,0,0,0.03) 1px,transparent 1px,transparent 48px)",d.appendChild(p),d.appendChild(x),document.body.appendChild(d),e.dataTransfer.setDragImage(F,0,0),this.classList.add("dragging"),this.style.cursor="grabbing",t._dragOffsetX=this._dragOffsetX,this.dispatchEvent(new CustomEvent("column-drag-start",{composed:!0,bubbles:!0,detail:{column:this.column}}));const z=w=>{w.preventDefault();const C=document.querySelector(".column-drag-ghost");if(!C)return;const g=w.clientX-this._dragOffsetX;C.style.left=`${g}px`;const k=C.offsetWidth,m=this.closest("nuxeo-data-table");if(!m)return;m._dragStartGhostX==null&&(m._dragStartGhostX=g,m._lastDragDirection="right");const O=g-m._dragStartGhostX,B=6;O>B?m._lastDragDirection="right":O<-B&&(m._lastDragDirection="left");const L=m._lastDragDirection==="right"?g+k:g;m._onColumnDragMove(L)};document.addEventListener("dragover",z),this._cleanupGhostMove=()=>{document.removeEventListener("dragover",z),this.style.cursor=""}}}customElements.define(i.is,i),Nuxeo.DataTableCell=i}{class i extends Nuxeo.Element{static get template(){return c`
        <style>
          :host {
            display: flex;
            flex-direction: column;
            opacity: 1;
            cursor: pointer;
            border: 2px solid transparent;
            border-bottom: var(--hyland-data-table-row-border, 1px solid var(--nuxeo-border, #e3e3e3));
            padding-bottom: 1px;
            @apply --layout-horizontal;
            @apply --layout-center;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }

          :host([header]) {
            border: initial;
            padding-bottom: 0;
          }

          :host([selected]) {
            border: 2px solid var(--nuxeo-primary-color, #0066ff);
            padding-bottom: 0;
            background-color: var(--nuxeo-page-background, #f5f5f5);
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

          :host(:not([header]):focus) {
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

          :host([header]) .cells ::slotted(nuxeo-data-table-settings) {
            order: 9999;
          }
        </style>

        <div class="cells" role="presentation">
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
      `}static get is(){return"nuxeo-data-table-row"}static get properties(){return{beforeBind:Object,expanded:{type:Boolean,reflectToAttribute:!0},index:{type:Number,reflectToAttribute:!0},item:Object,selected:{type:Boolean,reflectToAttribute:!0,value:!1},_static:{type:Object,value:{id:0}}}}static get observers(){return["_beforeBind(beforeBind, index, item.*, selected, expanded)"]}connectedCallback(){super.connectedCallback();const{host:e}=u(this).getOwnerRoot();if(e&&e instanceof Nuxeo.DataTable){const t=this._static.id++,s=this.parentElement;s._rowId||(this._contentElement=document.createElement("slot"),this._contentElement.setAttribute("name",`item${t}`),u(s).appendChild(this._contentElement),s._rowId=t,u(e).appendChild(this),this.slot=`item${t}`,this._ownerShadyRoot=void 0)}this.setAttribute("tabindex",0),this.setAttribute("role","row")}_beforeBind(e,t,s,r,o){if(!e)return;const a={index:t,item:s.base,expanded:o,selected:r};e(a,this)}}customElements.define(i.is,i),Nuxeo.DataTableRow=i}{class i extends b([saulis.DataTableTemplatizerBehavior],Nuxeo.Element){static get is(){return"nuxeo-data-table-row-detail"}static get properties(){return{beforeBind:Object}}static get observers(){return["_beforeBind(beforeBind, item.*, index, selected, expanded)"]}static get template(){return c`
        <style>
          :host {
            padding: 0 24px 0 24px;
            display: flex;
            align-items: center;
          }
        </style>
        <slot></slot>
      `}_beforeBind(e,t,s,r,o){e({index:s,item:t.base,expanded:o,selected:r},this)}}customElements.define(i.is,i),Nuxeo.DataTableRowDetail=i}{class i extends b([_],Nuxeo.Element){static get template(){return c`
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
            @apply --iron-data-table-checkbox;
          }

          :host([hidden]) {
            display: none;
          }

          :host(:focus) {
            outline: none;
          }
        </style>

        <nuxeo-checkmark
          checked="{{checked}}"
          disabled="{{disabled}}"
          aria-label$="[[i18n('command.select')]]"
          tabindex="0"
        >
        </nuxeo-checkmark>
      `}static get is(){return"nuxeo-data-table-checkbox"}static get properties(){return{checked:{type:Boolean,reflectToAttribute:!0,value:!1},disabled:{type:Boolean,reflectToAttribute:!0,value:!1},header:{type:Boolean,reflectToAttribute:!0,value:!1}}}ready(){super.ready(),this.header?this.setAttribute("role","columnheader"):this.setAttribute("role","cell")}}customElements.define(i.is,i),Nuxeo.DataTableCheckbox=i}{class i extends b([_],Nuxeo.Element){static get template(){return c`
        <style include="nuxeo-button-styles">
          :host {
            display: flex;
            align-items: center;
          }
          .paper-content {
            min-width: 20vw;
            margin-bottom: 2em;
          }

          paper-icon-button {
            width: 1.5em;
            height: 1.5em;
            padding: 0;
          }

          paper-button {
            margin: 0;
            padding: 8px 16px;
          }

          .buttons {
            @apply --buttons-bar;
            margin-top: 0px;
          }
        </style>

        <nuxeo-connection id="nxcon"></nuxeo-connection>

        <nuxeo-dialog id="columnsSettingsPopup" with-backdrop on-iron-overlay-closed="_onSettingsClosed">
          <h2>[[i18n('tableSettings.columnSettings')]]</h2>
          <paper-dialog-scrollable>
            <div class="paper-content layout horizontal">
              <div class="layout vertical">
                <div class="row layout horizontal">
                  <dom-repeat items="[[columns]]" as="column" filter="canChangeVisibility">
                    <template>
                      <tr aria-label$="[[column.name]]">
                        <td>
                          <paper-checkbox noink checked="{{!column.hidden}}"></paper-checkbox>
                        </td>
                        <td>
                          [[column.name]]
                        </td>
                      </tr>
                    </template>
                  </dom-repeat>
                  <table></table>
                </div>
              </div>
            </div>
          </paper-dialog-scrollable>
          <div class="buttons horizontal end-justified layout">
            <div class="flex start-justified">
              <paper-button noink on-click="_resetSettings" class="secondary"
                >[[i18n('tableSettings.columnSettings.reset')]]</paper-button
              >
            </div>
            <paper-button noink class="primary" dialog-dismiss
              >[[i18n('tableSettings.columnSettings.done')]]</paper-button
            >
          </div>
        </nuxeo-dialog>

        <paper-icon-button
          noink
          icon="nuxeo:settings"
          id="toggleColSettings"
          on-click="toggleColsSettingsPopup"
          aria-label$="[[i18n('tableSettings.columnSettings')]]"
        >
        </paper-icon-button>
      `}static get is(){return"nuxeo-data-table-settings"}static get properties(){return{columns:{type:Array,notify:!0}}}static get observers(){return["_columnDisplayChanged(columns.*)"]}toggleColsSettingsPopup(){this.$$("#columnsSettingsPopup").toggle()}_columnDisplayChanged(e){e.path.endsWith("hidden")&&this.dispatchEvent(new CustomEvent("settings-changed",{composed:!0,bubbles:!0}))}_resetSettings(){this.columns.forEach((e,t)=>{this.set(`columns.${t}.hidden`,e.hiddenBack)})}_onSettingsClosed(){this.columns.every(e=>e.hidden)&&this._resetSettings()}canChangeVisibility(e){return!e.alwaysVisible}}customElements.define(i.is,i),Nuxeo.DataTableSettings=i}const M=c`
  <custom-style>
    <style>
      html {
        --iron-data-table: {
          border: 1px solid var(--nuxeo-tag-background, rgba(0, 0, 0, 0.05));
          box-shadow: var(
            --nuxeo-app-header-box-shadow,
            1px 0 0 rgba(0, 0, 0, 0.1) inset,
            0 3px 5px rgba(0, 0, 0, 0.1)
          );
          background-color: #f7f8fa;
          font-weight: 400;
          line-height: 1.1;
          font-family: var(--nuxeo-app-font, 'Open Sans', Arial, sans-serif);
          color: var(--nuxeo-text-default, rgba(0, 0, 0, 0.87));
        }

        --iron-data-table-header: {
          background-color: var(--nuxeo-table-header-background, #fafafa);
          color: #606978;
          font-weight: 600;
          font-size: 1rem;
          height: 50px;
          border-bottom: 1px solid var(--nuxeo-border, #e3e3e3);
          min-height: 50px;
          padding-bottom: 0;
        }

        --iron-data-table-row-hover: {
          background-color: var(--nuxeo-container-hover, #eee);
        }

        --iron-data-table-row-selected: {
          color: var(--default-primary-color, #03a9fa);
        }

        --iron-data-table-row-after: {
          bottom: 0;
          content: '';
          height: 2px;
          left: 0;
          pointer-events: none;
          position: absolute;
          right: 0;
          transition: all 0.16s ease-in-out;

          -webkit-transform: scaleX(0);
          transform: scaleX(0);
          z-index: 1;
        }

        --iron-data-table-row-focused: {
          background-color: var(--nuxeo-container-hover, #eee);
        }

        --iron-data-table-row-focused-after: {
          -webkit-transform: scaleX(1);
          transform: scaleX(1);
        }
      }
    </style>
  </custom-style>
`;document.head.appendChild(M.content);const H=c`
  <iron-iconset-svg size="24" name="data-table">
    <svg>
      <defs>
        <g id="arrow-upward"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path></g>
      </defs>
    </svg>
  </iron-iconset-svg>
`;document.head.appendChild(H.content);{class i extends b([saulis.DataTableTemplatizerBehavior,_],Nuxeo.Element){static get template(){return c`
        <style>
          :host {
            @apply --layout-horizontal;
            @apply --layout-center;
            @apply --layout-flex;
          }
          .actions {
            padding-right: 12px;
          }
          .actions,
          .orderable {
            @apply --layout-horizontal;
            @apply --layout-flex;
            @apply --layout-end-justified;
          }
        </style>

        <div class="actions">
          <dom-if if="[[orderable]]">
            <template>
              <div class="orderable">
                <dom-if if="[[isUpVisible(index)]]">
                  <template>
                    <paper-icon-button
                      noink
                      id="upButton"
                      icon="icons:arrow-upward"
                      on-click="moveUp"
                      aria-labelledby="upButtonTooltip"
                    ></paper-icon-button>
                    <nuxeo-tooltip for="upButton" position="left" id="upButtonTooltip"
                      >[[i18n('command.moveUpward')]]</nuxeo-tooltip
                    >
                  </template>
                </dom-if>
                <dom-if if="[[isDownVisible(index, size)]]">
                  <template>
                    <paper-icon-button
                      noink
                      id="downButton"
                      icon="icons:arrow-downward"
                      on-click="moveDown"
                      aria-labelledby="downButtonTooltip"
                    >
                    </paper-icon-button>
                    <nuxeo-tooltip for="downButton" position="left" id="downButtonTooltip"
                      >[[i18n('command.moveDownward')]]</nuxeo-tooltip
                    >
                  </template>
                </dom-if>
              </div>
            </template>
          </dom-if>
          <dom-if if="[[editable]]">
            <template>
              <paper-icon-button
                id="edit-button"
                icon="nuxeo:edit"
                on-click="_editEntry"
                noink
                aria-labelledby="editButtonTooltip"
              ></paper-icon-button>
              <nuxeo-tooltip for="edit-button" position="left" id="editButtonTooltip"
                >[[i18n('command.edit')]]</nuxeo-tooltip
              >
              <paper-icon-button
                id="delete-button"
                name="delete"
                icon="nuxeo:delete"
                on-click="_deleteEntry"
                noink
                aria-labelledby="deleteButtonTooltip"
              >
              </paper-icon-button>
              <nuxeo-tooltip for="delete-button" position="left" id="deleteButtonTooltip"
                >[[i18n('command.remove')]]</nuxeo-tooltip
              >
            </template>
          </dom-if>
        </div>
      `}static get is(){return"nuxeo-data-table-row-actions"}static get properties(){return{beforeBind:Object,size:Number,editable:Boolean,orderable:Boolean}}static get observers(){return["_beforeBind(beforeBind, item.*, index, size)"]}_beforeBind(e,t,s,r){if(!e)return;const o={index:s,item:t.base,size:r};e(o,this)}_editEntry(e){e.stopPropagation(),this.dispatchEvent(new CustomEvent("edit-entry",{composed:!0,bubbles:!0,detail:{item:this.item,index:this.index}}))}_deleteEntry(e){e.stopPropagation(),this.dispatchEvent(new CustomEvent("delete-entry",{composed:!0,bubbles:!0,detail:{item:this.item,index:this.index}}))}moveUp(e){e.stopPropagation(),this.dispatchEvent(new CustomEvent("move-upward",{composed:!0,bubbles:!0,detail:{item:this.item,index:this.index}}))}moveDown(e){e.stopPropagation(),this.dispatchEvent(new CustomEvent("move-downward",{composed:!0,bubbles:!0,detail:{item:this.item,index:this.index}}))}isUpVisible(e){return this.orderable&&e>0}isDownVisible(e){return this.orderable&&e<this.size-1}}customElements.define(i.is,i),Nuxeo.DataTableRowActions=i}/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/S({is:"iron-request",hostAttributes:{hidden:!0},properties:{xhr:{type:Object,notify:!0,readOnly:!0,value:function(){return new XMLHttpRequest}},response:{type:Object,notify:!0,readOnly:!0,value:function(){return null}},status:{type:Number,notify:!0,readOnly:!0,value:0},statusText:{type:String,notify:!0,readOnly:!0,value:""},completes:{type:Object,readOnly:!0,notify:!0,value:function(){return new Promise((function(i,n){this.resolveCompletes=i,this.rejectCompletes=n}).bind(this))}},progress:{type:Object,notify:!0,readOnly:!0,value:function(){return{}}},aborted:{type:Boolean,notify:!0,readOnly:!0,value:!1},errored:{type:Boolean,notify:!0,readOnly:!0,value:!1},timedOut:{type:Boolean,notify:!0,readOnly:!0,value:!1}},get succeeded(){if(this.errored||this.aborted||this.timedOut)return!1;var i=this.xhr.status||0;return i===0||i>=200&&i<300},send:function(i){var n=this.xhr;if(n.readyState>0)return null;n.addEventListener("progress",(function(l){this._setProgress({lengthComputable:l.lengthComputable,loaded:l.loaded,total:l.total}),this.fire("iron-request-progress-changed",{value:this.progress})}).bind(this)),n.addEventListener("error",(function(l){this._setErrored(!0),this._updateStatus();var d=i.rejectWithRequest?{error:l,request:this}:l;this.rejectCompletes(d)}).bind(this)),n.addEventListener("timeout",(function(l){this._setTimedOut(!0),this._updateStatus();var d=i.rejectWithRequest?{error:l,request:this}:l;this.rejectCompletes(d)}).bind(this)),n.addEventListener("abort",(function(){this._setAborted(!0),this._updateStatus();var l=new Error("Request aborted."),d=i.rejectWithRequest?{error:l,request:this}:l;this.rejectCompletes(d)}).bind(this)),n.addEventListener("loadend",(function(){if(this._updateStatus(),this._setResponse(this.parseResponse()),!this.succeeded){var l=new Error("The request failed with status code: "+this.xhr.status),d=i.rejectWithRequest?{error:l,request:this}:l;this.rejectCompletes(d);return}this.resolveCompletes(this)}).bind(this)),this.url=i.url;var e=i.async!==!1;n.open(i.method||"GET",i.url,e);var t={json:"application/json",text:"text/plain",html:"text/html",xml:"application/xml",arraybuffer:"application/octet-stream"}[i.handleAs],s=i.headers||Object.create(null),r=Object.create(null);for(var o in s)r[o.toLowerCase()]=s[o];if(s=r,t&&!s.accept&&(s.accept=t),Object.keys(s).forEach(function(l){/[A-Z]/.test(l)&&D._error("Headers must be lower case, got",l),n.setRequestHeader(l,s[l])},this),e){n.timeout=i.timeout;var a=i.handleAs;(i.jsonPrefix||!a)&&(a="text"),n.responseType=n._responseType=a,i.jsonPrefix&&(n._jsonPrefix=i.jsonPrefix)}n.withCredentials=!!i.withCredentials;var h=this._encodeBodyObject(i.body,s["content-type"]);return n.send(h),this.completes},parseResponse:function(){var i=this.xhr,n=i.responseType||i._responseType,e=!this.xhr.responseType,t=i._jsonPrefix&&i._jsonPrefix.length||0;try{switch(n){case"json":if(e||i.response===void 0)try{return JSON.parse(i.responseText)}catch{return console.warn("Failed to parse JSON sent from "+i.responseURL),null}return i.response;case"xml":return i.responseXML;case"blob":case"document":case"arraybuffer":return i.response;case"text":default:{if(t)try{return JSON.parse(i.responseText.substring(t))}catch{return console.warn("Failed to parse JSON sent from "+i.responseURL),null}return i.responseText}}}catch(s){this.rejectCompletes(new Error("Could not parse response. "+s.message))}},abort:function(){this._setAborted(!0),this.xhr.abort()},_encodeBodyObject:function(i,n){if(typeof i=="string")return i;var e=i;switch(n){case"application/json":return JSON.stringify(e);case"application/x-www-form-urlencoded":return this._wwwFormUrlEncode(e)}return i},_wwwFormUrlEncode:function(i){if(!i)return"";var n=[];return Object.keys(i).forEach(function(e){n.push(this._wwwFormUrlEncodePiece(e)+"="+this._wwwFormUrlEncodePiece(i[e]))},this),n.join("&")},_wwwFormUrlEncodePiece:function(i){return i==null||!i.toString?"":encodeURIComponent(i.toString().replace(/\r?\n/g,`\r
`)).replace(/%20/g,"+")},_updateStatus:function(){this._setStatus(this.xhr.status),this._setStatusText(this.xhr.statusText===void 0?"":this.xhr.statusText)}});/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/S({is:"iron-ajax",hostAttributes:{hidden:!0},properties:{url:{type:String},params:{type:Object,value:function(){return{}}},method:{type:String,value:"GET"},headers:{type:Object,value:function(){return{}}},contentType:{type:String,value:null},body:{type:Object,value:null},sync:{type:Boolean,value:!1},handleAs:{type:String,value:"json"},withCredentials:{type:Boolean,value:!1},timeout:{type:Number,value:0},auto:{type:Boolean,value:!1},verbose:{type:Boolean,value:!1},lastRequest:{type:Object,notify:!0,readOnly:!0},lastProgress:{type:Object,notify:!0,readOnly:!0},loading:{type:Boolean,notify:!0,readOnly:!0},lastResponse:{type:Object,notify:!0,readOnly:!0},lastError:{type:Object,notify:!0,readOnly:!0},activeRequests:{type:Array,notify:!0,readOnly:!0,value:function(){return[]}},debounceDuration:{type:Number,value:0,notify:!0},jsonPrefix:{type:String,value:""},bubbles:{type:Boolean,value:!1},rejectWithRequest:{type:Boolean,value:!1},_boundHandleResponse:{type:Function,value:function(){return this._handleResponse.bind(this)}}},observers:["_requestOptionsChanged(url, method, params.*, headers, contentType, body, sync, handleAs, jsonPrefix, withCredentials, timeout, auto)"],created:function(){this._boundOnProgressChanged=this._onProgressChanged.bind(this)},get queryString(){var i=[],n,e;for(n in this.params)if(e=this.params[n],n=window.encodeURIComponent(n),Array.isArray(e))for(var t=0;t<e.length;t++)i.push(n+"="+window.encodeURIComponent(e[t]));else e!==null?i.push(n+"="+window.encodeURIComponent(e)):i.push(n);return i.join("&")},get requestUrl(){var i=this.queryString,n=this.url||"";if(i){var e=n.indexOf("?")>=0?"&":"?";return n+e+i}return n},get requestHeaders(){var i={},n=this.contentType;n==null&&typeof this.body=="string"&&(n="application/x-www-form-urlencoded"),n&&(i["content-type"]=n);var e;if(typeof this.headers=="object")for(e in this.headers)i[e]=this.headers[e].toString();return i},_onProgressChanged:function(i){this._setLastProgress(i.detail.value)},toRequestOptions:function(){return{url:this.requestUrl||"",method:this.method,headers:this.requestHeaders,body:this.body,async:!this.sync,handleAs:this.handleAs,jsonPrefix:this.jsonPrefix,withCredentials:this.withCredentials,timeout:this.timeout,rejectWithRequest:this.rejectWithRequest}},generateRequest:function(){var i=document.createElement("iron-request"),n=this.toRequestOptions();this.push("activeRequests",i),i.completes.then(this._boundHandleResponse).catch(this._handleError.bind(this,i)).then(this._discardRequest.bind(this,i));var e=this.fire("iron-ajax-presend",{request:i,options:n},{bubbles:this.bubbles,cancelable:!0});return e.defaultPrevented?(i.abort(),i.rejectCompletes(i),i):(this.lastRequest&&this.lastRequest.removeEventListener("iron-request-progress-changed",this._boundOnProgressChanged),i.addEventListener("iron-request-progress-changed",this._boundOnProgressChanged),i.send(n),this._setLastProgress(null),this._setLastRequest(i),this._setLoading(!0),this.fire("request",{request:i,options:n},{bubbles:this.bubbles,composed:!0}),this.fire("iron-ajax-request",{request:i,options:n},{bubbles:this.bubbles,composed:!0}),i)},_handleResponse:function(i){i===this.lastRequest&&(this._setLastResponse(i.response),this._setLastError(null),this._setLoading(!1)),this.fire("response",i,{bubbles:this.bubbles,composed:!0}),this.fire("iron-ajax-response",i,{bubbles:this.bubbles,composed:!0})},_handleError:function(i,n){this.verbose&&D._error(n),i===this.lastRequest&&(this._setLastError({request:i,error:n,status:i.xhr.status,statusText:i.xhr.statusText,response:i.xhr.response}),this._setLastResponse(null),this._setLoading(!1)),this.fire("iron-ajax-error",{request:i,error:n},{bubbles:this.bubbles,composed:!0}),this.fire("error",{request:i,error:n},{bubbles:this.bubbles,composed:!0})},_discardRequest:function(i){var n=this.activeRequests.indexOf(i);n>-1&&this.splice("activeRequests",n,1)},_requestOptionsChanged:function(){this.debounce("generate-request",function(){this.url!=null&&this.auto&&this.generateRequest()},this.debounceDuration)}});/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/S({_template:c`
    <style>
      :host {
        display: block;
      }
    </style>

    <!-- This form is used to collect the elements that should be submitted -->
    <slot></slot>

    <!-- This form is used for submission -->
    <form id="helper" action\$="[[action]]" method\$="[[method]]" enctype\$="[[enctype]]"></form>
`,is:"iron-form",properties:{allowRedirect:{type:Boolean,value:!1},headers:{type:Object,value:function(){return{}}},withCredentials:{type:Boolean,value:!1}},attached:function(){this._form||(this._form=u(this).querySelector("form"),this._form?(this._init(),this.async(this._saveInitialValues.bind(this),1)):this._nodeObserver=u(this).observeNodes((function(i){for(var n=0;n<i.addedNodes.length;n++)i.addedNodes[n].tagName==="FORM"&&(this._form=i.addedNodes[n],this._init(),u(this).unobserveNodes(this._nodeObserver),this._nodeObserver=null)}).bind(this)))},detached:function(){this._nodeObserver&&(u(this).unobserveNodes(this._nodeObserver),this._nodeObserver=null)},_init:function(){this._form.addEventListener("submit",this.submit.bind(this)),this._form.addEventListener("reset",this.reset.bind(this)),this._defaults=this._defaults||new WeakMap,this._saveInitialValues()},saveResetValues:function(){this._saveInitialValues(!0)},_saveInitialValues:function(i){for(var n=this._getValidatableElements(),e=0;e<n.length;e++){var t=n[e];if(!this._defaults.has(t)||i){var s={value:t.value};"checked"in t&&(s.checked=t.checked),"invalid"in t&&(s.invalid=t.invalid),this._defaults.set(t,s)}}},validate:function(){if(!this._form)return!1;if(this._form.getAttribute("novalidate")==="")return!0;for(var i=this._form.checkValidity(),n=this._getValidatableElements(),e,t=0;e=n[t],t<n.length;t++){var s=e;s.validate&&(i=!!s.validate()&&i)}return i},submit:function(i){if(i&&i.preventDefault(),!!this._form){if(!this.validate()){this.fire("iron-form-invalid");return}this.$.helper.textContent="";var n=this.serializeForm();if(this.allowRedirect){for(var e in n)this.$.helper.appendChild(this._createHiddenElement(e,n[e]));this.$.helper.action=this._form.getAttribute("action"),this.$.helper.method=this._form.getAttribute("method")||"GET",this.$.helper.contentType=this._form.getAttribute("enctype")||"application/x-www-form-urlencoded",this.$.helper.submit(),this.fire("iron-form-submit")}else this._makeAjaxRequest(n)}},reset:function(i){if(i&&i.preventDefault(),!!this._form){if(!i||i.type!=="reset"||i.target!==this._form){this._form.reset();return}for(var n=this._getValidatableElements(),e=0;e<n.length;e++){var t=n[e];if(this._defaults.has(t)){var s=this._defaults.get(t);for(var r in s)t[r]=s[r]}}this.fire("iron-form-reset")}},serializeForm:function(){for(var i=this._getSubmittableElements(),n={},e=0;e<i.length;e++)for(var t=this._serializeElementValues(i[e]),s=0;s<t.length;s++)this._addSerializedElement(n,i[e].name,t[s]);return n},_handleFormResponse:function(i){this.fire("iron-form-response",i.detail)},_handleFormError:function(i){this.fire("iron-form-error",i.detail)},_makeAjaxRequest:function(i){this.request||(this.request=document.createElement("iron-ajax"),this.request.addEventListener("response",this._handleFormResponse.bind(this)),this.request.addEventListener("error",this._handleFormError.bind(this))),this.request.url=this._form.getAttribute("action"),this.request.method=this._form.getAttribute("method")||"GET",this.request.contentType=this._form.getAttribute("enctype")||"application/x-www-form-urlencoded",this.request.withCredentials=this.withCredentials,this.request.headers=this.headers,this._form.method.toUpperCase()==="POST"?this.request.body=i:this.request.params=i;var n=this.fire("iron-form-presubmit",{},{cancelable:!0});n.defaultPrevented||(this.request.generateRequest(),this.fire("iron-form-submit",i))},_getValidatableElements:function(){return this._findElements(this._form,!0,!1)},_getSubmittableElements:function(){return this._findElements(this._form,!1,!1)},_findElements:function(i,n,e,t){t=t||[];for(var s=u(i).querySelectorAll("*"),r=0;r<s.length;r++)!e&&(s[r].localName==="slot"||s[r].localName==="content")?this._searchSubmittableInSlot(t,s[r],n):this._searchSubmittable(t,s[r],n);return t},_searchSubmittableInSlot:function(i,n,e){for(var t=u(n).getDistributedNodes(),s=0;s<t.length;s++)if(t[s].nodeType!==Node.TEXT_NODE){this._searchSubmittable(i,t[s],e);for(var r=u(t[s]).querySelectorAll("*"),o=0;o<r.length;o++)this._searchSubmittable(i,r[o],e)}},_searchSubmittable:function(i,n,e){this._isSubmittable(n,e)?i.push(n):n.root&&this._findElements(n.root,e,!0,i)},_isSubmittable:function(i,n){return!i.disabled&&(n?i.name||typeof i.validate=="function":i.name)},_serializeElementValues:function(i){var n=i.tagName.toLowerCase();return n==="button"||n==="input"&&(i.type==="submit"||i.type==="reset")?[]:n==="select"?this._serializeSelectValues(i):n==="input"?this._serializeInputValues(i):i._hasIronCheckedElementBehavior&&!i.checked?[]:[i.value]},_serializeSelectValues:function(i){for(var n=[],e=0;e<i.options.length;e++)i.options[e].selected&&n.push(i.options[e].value);return n},_serializeInputValues:function(i){var n=i.type.toLowerCase();return(n==="checkbox"||n==="radio")&&!i.checked||n==="file"?[]:[i.value]},_createHiddenElement:function(i,n){var e=document.createElement("input");return e.setAttribute("type","hidden"),e.setAttribute("name",i),e.setAttribute("value",n),e},_addSerializedElement:function(i,n,e){i[n]===void 0?i[n]=e:(Array.isArray(i[n])||(i[n]=[i[n]]),i[n].push(e))}});{class i extends b([I,_],Nuxeo.Element){static get template(){return c`
        <style>
          #container {
            margin: 24px;
          }
        </style>
        <iron-form id="editForm">
          <form>
            <div id="container"></div>
          </form>
        </iron-form>
      `}static get is(){return"nuxeo-data-table-form"}static get properties(){return{item:{type:Object,notify:!0,observer:"_itemChanged"},slot:{value:"form",type:String,reflectToAttribute:!0,readonly:!0},index:Number}}ready(){super.ready();const e=this.queryEffectiveChildren("template");this._instanceProps={item:!0},this.templatize(e),this.instance=this.stamp({item:this.item}),this.instance.dispatchEvent=function(){},u(this.$.container).appendChild(this.instance.root)}validateItem(){return this.$.editForm.validate()}_itemChanged(){this.instance&&(this.instance.item=this.item,this.instance.i18n=this.i18n)}_notifyInstancePropV2(e,t,s){this.notifyPath(t,s)}}customElements.define(i.is,i),Nuxeo.DataTableForm=i}/**
@license
Copyright 2016 Sauli Tähkäpää

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/{class i extends b([j,q,P,$,N],Nuxeo.Element){static get template(){return c`
        <style include="nuxeo-button-styles">
          :host {
            display: block;
            position: relative;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            min-height: 300px;
            @apply --iron-data-table;
          }

          :host([draggable]) ::slotted(nuxeo-data-table-row[selected]) {
            cursor: -webkit-grab;
            cursor: grab;
          }

          :host .droptarget-hover ::slotted(nuxeo-data-table-row) {
            border: 2px dashed var(--nuxeo-primary-color, blue);
          }

          /* scrollbars */
          :host ::-webkit-scrollbar-track {
            width: 12px !important;
            height: 3px;
          }
          :host ::-webkit-scrollbar {
            background-color: rgba(0, 0, 0, 0.03);
            width: 12px !important;
            height: 3px;
          }
          :host ::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.15);
            border-radius: 1px !important;
          }

          :host([required]) label::after {
            display: inline-block;
            content: '*';
            margin-left: 4px;
            color: var(--paper-input-container-invalid-color, #de350b);
          }

          :host([settings-enabled]) ::slotted(nuxeo-data-table-row:not([header])) {
            padding-inline-end: 1.5em;
          }

          [hidden] {
            display: none !important;
          }

          #container {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
          }

          #table {
            display: flex;
            flex: 1;
            flex-direction: column;
            min-height: 0;
          }

          #header {
            box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
            padding-inline-start: 2px;
            transition: box-shadow 200ms;
            -webkit-transition: box-shadow 200ms;
            @apply --iron-data-table-header;
          }

          #header.scrolled {
            box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06), 0 2px 0 rgba(0, 0, 0, 0.075), 0 3px 0 rgba(0, 0, 0, 0.05),
              0 4px 0 rgba(0, 0, 0, 0.015);
          }

          #list {
            overflow-x: hidden !important;
            overflow-y: auto !important;
            flex: 1;
            transition: opacity 200ms;
            -webkit-transition: opacity 200ms;
          }

          #list .item {
            background: var(--nuxeo-table-items-background, #ffffff);
          }

          .emptyResult {
            opacity: 0.8;
            display: block;
            font-weight: 300;
            padding: 1.5em 0.7em;
            text-align: center;
            font-size: 1.1em;
          }

          .error {
            color: var(--paper-input-container-invalid-color, #de350b);
          }

          label {
            display: block;
            @apply --nuxeo-label;
          }

          .table-wrapper {
            overflow-y: scroll;
            position: relative;
          }
        </style>

        <div id="container">
          <slot name="nuxeo-selection-toolbar"></slot>

          <label>[[label]]</label>
          <label class="error" hidden$="[[!invalid]]">[[errorMessage]]</label>

          <div
            id="table"
            role="table"
            aria-multiselectable$="[[_computeAriaMultiselectable(multiSelection)]]"
            aria-label$="[[captionText]]"
          >
            <div id="header" role="rowgroup">
              <nuxeo-data-table-row header>
                <nuxeo-data-table-checkbox
                  header
                  style$="[[_computeSelectAllVisibility(selectionEnabled, selectAllEnabled, multiSelection)]]"
                  checked="[[_isChecked(selectAllActive, _excludedItems, _excludedItems.*)]]"
                  on-click="_toggleSelectAll"
                ></nuxeo-data-table-checkbox>
                <dom-repeat items="[[columns]]" as="column" role="presentation">
                  <template>
                    <nuxeo-data-table-cell
                      header
                      align-right="[[column.alignRight]]"
                      before-bind="[[beforeCellBind]]"
                      column="[[column]]"
                      flex="[[column.flex]]"
                      hidden="[[column.hidden]]"
                      order="[[column.order]]"
                      resized="[[column.resized]]"
                      table="[[_this]]"
                      template="[[column.headerTemplate]]"
                      width="[[column.width]]"
                      overflow="[[column.overflow]]"
                    >
                      <nuxeo-data-table-column-sort
                        sort-order="[[sortOrder]]"
                        path="[[column.sortBy]]"
                        on-sort-direction-changed="_sort"
                        hidden$="[[!column.sortBy]]"
                      >
                      </nuxeo-data-table-column-sort>
                    </nuxeo-data-table-cell>
                  </template>
                </dom-repeat>
                <div role="columnheader" style$="[[_computeActionsStyle(editable, orderable)]]"></div>
                <nuxeo-data-table-settings
                  role="columnheader"
                  columns="{{columns}}"
                  hidden$="[[!settingsEnabled]]"
                ></nuxeo-data-table-settings>
              </nuxeo-data-table-row>
            </div>

            <dom-if if="[[_isEmpty]]">
              <template>
                <div class="emptyResult" role="rowgroup">
                  <div role="row">
                    <div role="cell" aria-live="polite">[[_computedEmptyLabel]]</div>
                  </div>
                </div>
              </template>
            </dom-if>

            <iron-list
              id="list"
              role$="[[_computeListRole(items)]]"
              items="[[items]]"
              as="item"
              selected-items="{{selectedItems}}"
              selected-item="{{selectedItem}}"
              on-scroll="_scroll"
            >
              <template>
                <div class="item" role="presentation">
                  <nuxeo-data-table-row
                    on-click="_onRowClick"
                    before-bind="[[beforeRowBind]]"
                    even$="[[!_isEven(index)]]"
                    expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]"
                    index="[[index]]"
                    item="[[item]]"
                    tabindex="-1"
                    selected="[[_isSelected(item, selectedItems, selectedItems.*, _excludedItems, _excludedItems.*)]]"
                  >
                    <nuxeo-data-table-checkbox
                      hidden$="[[!selectionEnabled]]"
                      checked$="[[_isSelected(item, selectedItems, selectedItems.*, _excludedItems, _excludedItems.*)]]"
                      on-click="_onCheckBoxTap"
                      on-keydown="_onCheckBoxKeydown"
                    ></nuxeo-data-table-checkbox>
                    <dom-repeat items="[[columns]]" as="column" index-as="colIndex">
                      <template>
                        <nuxeo-data-table-cell
                          template="[[column.template]]"
                          table="[[_this]]"
                          align-right="[[column.alignRight]]"
                          column="[[column]]"
                          expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]"
                          flex="[[column.flex]]"
                          hidden="[[column.hidden]]"
                          index="[[index]]"
                          item="[[item]]"
                          order="[[column.order]]"
                          resized="[[column.resized]]"
                          selected="[[_isSelected(item, selectedItems, selectedItems.*)]]"
                          width="[[column.width]]"
                          before-bind="[[beforeCellBind]]"
                          overflow="[[column.overflow]]"
                        ></nuxeo-data-table-cell>
                      </template>
                    </dom-repeat>
                    <dom-if if="[[_isExpanded(item, _expandedItems)]]" on-dom-change="_updateSizeForItem">
                      <template>
                        <nuxeo-data-table-row-detail
                          index="[[index]]"
                          item="[[item]]"
                          expanded="[[_isExpanded(item, _expandedItems, _expandedItems.*)]]"
                          selected="[[_isSelected(item, selectedItems, selectedItems.*)]]"
                          before-bind="[[beforeDetailsBind]]"
                          table="[[_this]]"
                          template="[[rowDetail]]"
                        ></nuxeo-data-table-row-detail>
                      </template>
                    </dom-if>
                    <div style$="[[_computeActionsStyle(editable, orderable)]]">
                      <nuxeo-data-table-row-actions
                        index="[[index]]"
                        editable="[[editable]]"
                        orderable="[[orderable]]"
                        template="[[rowForm]]"
                        item="[[item]]"
                        size="[[items.length]]"
                        table="[[_this]]"
                      >
                      </nuxeo-data-table-row-actions>
                    </div>
                  </nuxeo-data-table-row>
                </div>
              </template>
            </iron-list>
          </div>

          <dom-if if="[[editable]]">
            <template>
              <paper-button id="addEntry" class="secondary" noink on-click="_createEntry">
                + [[i18n('command.add')]]
              </paper-button>
            </template>
          </dom-if>

          <iron-scroll-threshold
            id="scrollThreshold"
            scroll-target="list"
            on-lower-threshold="_threshold"
          ></iron-scroll-threshold>
        </div>

        <slot id="columns"></slot>

        <nuxeo-dialog id="dialog" with-backdrop on-opened-changed="_formDialogOpenedChanged">
          <h2>[[i18n('command.add')]]</h2>
          <paper-dialog-scrollable>
            <slot id="form" name="form"></slot>
          </paper-dialog-scrollable>
          <div class="buttons">
            <paper-button noink dialog-dismiss class="secondary">[[i18n('command.cancel')]]</paper-button>
            <paper-button id="save" noink on-click="_validateEntry" class="primary"
              >[[i18n('command.ok')]]</paper-button
            >
          </div>
        </nuxeo-dialog>
      `}static get is(){return"nuxeo-data-table"}static get properties(){return{beforeCellBind:Object,beforeDetailsBind:Object,beforeRowBind:Object,detailsEnabled:{type:Boolean,value:!1},columns:{type:Array,notify:!0,value(){return[]},observer:"_columnsChanged"},_expandedItems:{type:Array,value(){return[]}},_this:{type:Object,value(){return this}},label:{type:String},required:{type:Boolean,value:!1},errorMessage:{type:String},settingsEnabled:{type:Boolean,reflectToAttribute:!0,value:!1},multiSelection:{type:Boolean,value:!0},editable:{type:Boolean,value:!1},orderable:{type:Boolean,value:!1},paginable:{type:Boolean,value:!1},captionText:{type:String,value:""},_wrapperHeight:{type:String,value:""},columnResizeEnabled:{type:Boolean,value:!1,reflectToAttribute:!0},columnReorderEnabled:{type:Boolean,value:!1,reflectToAttribute:!0}}}_isChecked(e,t){return e&&t.length===0}static get observers(){return["_alignHeaderRow(items.length)","_invalidateFieldTypeCacheFromItems(items)"]}constructor(){super(),this.handlesSorting=!0,this.handlesSelectAll=!0,this._fieldTypeStats=null,this._fieldTypeHints=null,this._observer=u(this).observeNodes(e=>{const t=function(r){return r.nodeType===Node.ELEMENT_NODE&&r instanceof Nuxeo.DataTableColumn},s=function(r){return r.nodeType===Node.ELEMENT_NODE&&r.tagName==="TEMPLATE"&&r.hasAttribute("is")&&r.getAttribute("is")==="row-detail"};if(!this._reorderingColumns&&((e.addedNodes.filter(t).length>0||e.removedNodes.filter(t).length>0)&&(this.set("columns",this.$.columns.assignedNodes().filter(t)),this._backupColumnsState(),this.notifyResize()),e.addedNodes.filter(s).length>0)){this.set("rowDetail",this.getContentChildren('[select="template[is=row-detail]"]')[0]);const r=u(this.rowDetail).parentNode;this.rowDetail._rootDataHost=r.dataHost?r.dataHost._rootDataHost||r.dataHost:r}})}ready(){super.ready(),this._resizing=null,this._reorderingColumns=!1,this._draggingColumn=null,this._dragOverColumn=null,this._dragInsertAfter=!1,this._dragCellsMeta=null,this._dragHeaderLeft=null,this._activeColumn=null,this.addEventListener("iron-resize",this._resizeCellContainers),this.addEventListener("item-changed",this._itemChanged),this.addEventListener("scroll",this._onHorizontalScroll),this.addEventListener("edit-entry",this._editEntry),this.addEventListener("delete-entry",this._deleteEntry),this.addEventListener("move-upward",this._moveItemUpward),this.addEventListener("move-downward",this._moveItemDownward),this.addEventListener("column-resize-start",this._onColumnResizeStart.bind(this)),this.addEventListener("column-drag-start",this._onColumnDragStart.bind(this)),this.addEventListener("column-drag-end",this._onColumnDragEnd.bind(this)),this.$.list._selectionHandler=function(s){const r=this.modelForElement(s.target);r&&this.toggleSelectionForItem(r[this.as])},this.shadowRoot.querySelector("#form").addEventListener("slotchange",()=>{const s=this.getContentChildren("#form")[0];s.disabled=!0,this._updateRequiredColumns()}),this._hideListItemsWrapperFromA11yTree();const t=this.getAttribute("wrapper-height");t&&(this._wrapperHeight=t,this._onWrapperHeightChanged()),this._boundDocumentMouseMove=this._documentMouseMove.bind(this),this._boundDocumentMouseUp=this._documentMouseUp.bind(this),A(this,()=>{this._hideListItemsWrapperFromA11yTree(),this._resizeCellContainers()})}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mousemove",this._boundDocumentMouseMove),document.removeEventListener("mouseup",this._boundDocumentMouseUp),document.removeEventListener("touchmove",this._boundDocumentMouseMove),document.removeEventListener("touchend",this._boundDocumentMouseUp),this._resizing=null}_computeListRole(e){return(e||[]).length>0?"rowgroup":"presentation"}_computeAriaMultiselectable(e){return e?"true":"false"}_hideListItemsWrapperFromA11yTree(){const e=this.$.list.shadowRoot;if(!e)return;const t=e.querySelector("#items");t&&t.setAttribute("role","presentation")}_getHeaderCells(){return this.querySelectorAll("nuxeo-data-table-cell[header]")}_onWrapperHeightChanged(){const e=this.shadowRoot.querySelector("iron-list");if(e&&this._wrapperHeight&&!e.parentElement.classList.contains("table-wrapper")){const t=document.createElement("div");t.classList.add("table-wrapper"),t.setAttribute("role","presentation"),t.setAttribute("style",`height: ${this._wrapperHeight}`),e.parentElement.insertBefore(t,e),t.appendChild(e)}}_computeActionsStyle(){return this.editable&&this.orderable?"flex: 0 0 172px;":this.editable||this.orderable?"flex: 0 0 92px;":"display: none;"}_computeSelectAllVisibility(){return this.selectionEnabled?!this.selectAllEnabled||!this.multiSelection?"visibility: hidden;":"":"display: none;"}_alignHeaderRow(){A(this,()=>{this.$.list.scrollHeight>=this.$.list.clientHeight?this.$.header.style.paddingRight=`${this.$.list.offsetWidth-this.$.list.clientWidth}px`:this.$.header.style.paddingRight="0"})}_itemChanged(e){if(this.items){let{index:t}=e.target;if(t===void 0&&(t=this.items.indexOf(e.detail.item)),t>=0){let s=`items.${t}`;e.detail.path&&(s+=`.${e.detail.path}`),this.set(s,e.detail.value),this._invalidateFieldTypeCache()}}}_backupColumnsState(){this.columns.forEach(e=>{e.hiddenBack=e.hidden})}_bind(e,t){return t!==void 0?{item:e,index:t}:{column:e}}_isEven(e){return e%2===0}_columnsChanged(e,t){t&&t.forEach(s=>{this.unlisten(s,"filter-value-changed")}),e&&(e.forEach(s=>{s.table=this,this.listen(s,"filter-value-changed","_onColumnFilterChanged")}),this._updateRequiredColumns())}_updateRequiredColumns(){if(!this.columns||this.columns.length===0)return;const e=this.getContentChildren("#form")[0],t=e?Array.from((e.shadowRoot||e).querySelectorAll("[required]")).map(o=>(o.getAttribute("name")||"").toLowerCase()).filter(Boolean):[];this._derivedRequiredColumns||(this._derivedRequiredColumns=new Set);const s=this._derivedRequiredColumns,r=this.columns.length===1;this.columns.forEach(o=>{const a=(o.field||o.name||"").toLowerCase();(r?t.length>0:t.includes(a))?o.required||(s.add(o),o.required=!0):s.has(o)&&(s.delete(o),o.required=!1)})}_resizeCellContainers(){this.$.container.style.width="",v.run(()=>{this.$.container.style.width=`${Math.min(this.scrollWidth,this.clientWidth+this.scrollLeft)}px`,this.$.header.style.paddingRight=`${this.$.list.offsetWidth-this.$.list.clientWidth}px`})}_onHorizontalScroll(){this.isDebouncerActive("scrolling")||(this.$.container.style.width=`${this.scrollWidth}px`,this._debouncer=y.debounce(this._debouncer,T.after(1e3),()=>{this.$.container.style.width=`${Math.min(this.scrollWidth,this.clientWidth+this.scrollLeft)}px`}))}_updateSizeForItem(e){if(e.model.get("item")){const t=[];for(let s=0;s<this.$.list._physicalItems.length;s++)t.push(s);this.$.list._updateMetrics(t),this.$.list._positionItems()}}expandItem(e){this.rowDetail&&this._expandedItems&&!this._isExpanded(e,this._expandedItems)&&(this._expandedItems.push(e),this._expandedItems=this._expandedItems.slice(0))}collapseItem(e){if(this.rowDetail&&this._expandedItems&&this._isExpanded(e,this._expandedItems)){const t=this._expandedItems.indexOf(e);this._expandedItems.splice(t,1),this._expandedItems=this._expandedItems.slice(0)}}_isExpanded(e,t){return t&&t.indexOf(e)>-1}_isFocusable(e){return e.contains(u(document.activeElement).node)||e instanceof Nuxeo.DataTableCheckbox||e.tagName==="A"}_onRowClick(e){if(!this._isFocusable(u(e).localTarget)){const t=(function(s,r,o){const a=new CustomEvent(s,{cancelable:!0,composed:!0,bubbles:!0,detail:{item:r}});this.dispatchEvent(a),a.defaultPrevented||o.call(this,r)}).bind(this);this.rowDetail&&this.detailsEnabled?this._isExpanded(e.model.item,this._expandedItems)?t("collapsing-item",e.model.item,this.collapseItem):t("expanding-item",e.model.item,this.expandItem):this.dispatchEvent(new CustomEvent("row-clicked",{composed:!0,bubbles:!0,detail:{item:e.model.item,index:e.model.index}}))}}get settings(){const e=Array.isArray(this.sortOrder)?this.sortOrder.map(s=>Object.assign({},s)):this.sortOrder||null,t={columns:{},sortOrder:e};return this.columns&&this.columns.forEach((s,r)=>{const o=s.field?s.field:`col-${r}`;t.columns[o]={hidden:!!s.hidden,order:typeof s.order=="number"?s.order:r,width:s.width||null,resized:!!s.resized},s.filterValue&&(t.columns[o].filterValue=s.filterValue),s.filterExpression&&(t.columns[o].filterExpression=s.filterExpression)}),t}set settings(e){if(!e)return;let t=!1;if(this.columns&&e.columns){this._suppressFilterEvents=!0;const r=[];this.columns.forEach(function(o,a){const h=o.field?o.field:`col-${a}`,l=e.columns[h]||{};this.set(`columns.${a}.hidden`,!!l.hidden),typeof l.order=="number"&&this.set(`columns.${a}.order`,l.order),Object.prototype.hasOwnProperty.call(l,"width")&&(this.set(`columns.${a}.width`,l.width),this.set(`columns.${a}.resized`,Object.prototype.hasOwnProperty.call(l,"resized")?!!l.resized:!0)),Object.prototype.hasOwnProperty.call(l,"filterValue")&&l.filterValue&&(this.set(`columns.${a}.filterValue`,l.filterValue),l.filterExpression&&this.set(`columns.${a}.filterExpression`,l.filterExpression),r.push({index:a,value:l.filterValue,expression:l.filterExpression||null}))},this),this._suppressFilterEvents=!1,r.length>0&&this._hasPageProvider&&this._hasPageProvider()&&this.nxProvider&&(this.paginable&&(this.nxProvider.page=1),r.forEach(o=>{const a=this.columns[o.index],h=a.filterBy||a.field||null;if(h&&o.value){o.expression?this.nxProvider.params[h]=o.expression.replace(/\$term/g,()=>o.value):this.nxProvider.params[h]=o.value;const l=this.filters.findIndex(d=>d.path===h);l===-1?this.push("filters",{path:h,value:o.value,name:a.name,expression:o.expression}):(this.set(`filters.${l}.value`,o.value),this.set(`filters.${l}.expression`,o.expression),this.set(`filters.${l}.name`,a.name))}}),t=!0)}let s=null;if(Object.prototype.hasOwnProperty.call(e,"sortOrder")?(s=Array.isArray(e.sortOrder)?e.sortOrder:[],this.sortOrder=s):e.columns&&Object.prototype.hasOwnProperty.call(e.columns,"sortOrder")&&(s=Array.isArray(e.columns.sortOrder)?e.columns.sortOrder:[],this.sortOrder=s),s&&this._hasPageProvider&&this._hasPageProvider()&&this.nxProvider){const r=s.reduce((o,a)=>(a&&a.path&&a.direction&&(o[a.path]=a.direction),o),{});this._ppSort=r,this.nxProvider.sort=r,this.nxProvider.auto||(t=!0),this.notifyResize()}t&&typeof this.fetch=="function"&&this.fetch()}_onCheckBoxTap(e){this.selectionEnabled&&(this.selectOnTap&&this.$.list.toggleSelectionForIndex(e.model.index),(e.target||e.srcElement).dispatchEvent(new CustomEvent("selected",{composed:!0,bubbles:!0,detail:{index:e.model.index,shiftKey:e.shiftKey}})),this._updateFlags())}_onCheckBoxKeydown(e){const t=e.key||"",s=e.code||"";(t==="Enter"||t===" "||s==="Enter"||s==="Space")&&(e.preventDefault(),e.stopPropagation())}_editEntry(e){e.stopPropagation(),this._toggleEditDialog(e.detail.index)}_isStrictNumberString(e){if(typeof e!="string"||e.trim()==="")return!1;const t=e.trim(),s=Number(t);return/^[+-]?0\d+$/.test(t)?!1:Number.isFinite(s)}_inferFieldTypes(e){const t={};return!e||e.length===0||e.forEach(s=>{s===null||typeof s!="object"||Array.isArray(s)||Object.keys(s).forEach(r=>{const o=typeof s[r];o!=="number"&&o!=="string"||(r in t?t[r]!==o&&(t[r]=null):t[r]=o)})}),t}_invalidateFieldTypeCache(){this._fieldTypeStats=null,this._fieldTypeHints=null}_invalidateFieldTypeCacheFromItems(){this._invalidateFieldTypeCache()}_getScalarType(e){const t=typeof e;return t==="number"||t==="string"?t:null}_buildFieldTypeStats(e){const t={};return(e||[]).forEach(s=>{s===null||typeof s!="object"||Array.isArray(s)||Object.keys(s).forEach(r=>{const o=this._getScalarType(s[r]);o&&(t[r]||(t[r]={number:0,string:0}),t[r][o]+=1)})}),t}_computeFieldTypeHintsFromStats(e){const t={};return Object.keys(e).forEach(s=>{e[s].number>0&&e[s].string===0?t[s]="number":e[s].string>0&&e[s].number===0?t[s]="string":t[s]=null}),t}_ensureFieldTypeCache(){return(!this._fieldTypeStats||!this._fieldTypeHints)&&(this._fieldTypeHints=this._inferFieldTypes(this.items||[]),this._fieldTypeStats=this._buildFieldTypeStats(this.items||[])),this._fieldTypeHints}_adjustFieldTypeStatsForItem(e,t){!this._fieldTypeStats||e===null||typeof e!="object"||Array.isArray(e)||Object.keys(e).forEach(s=>{const r=this._getScalarType(e[s]);r&&(this._fieldTypeStats[s]||(this._fieldTypeStats[s]={number:0,string:0}),this._fieldTypeStats[s][r]=Math.max(0,this._fieldTypeStats[s][r]+t),this._fieldTypeStats[s].number===0&&this._fieldTypeStats[s].string===0&&delete this._fieldTypeStats[s])})}_updateFieldTypeCache(e,t){if(!this._fieldTypeStats||!this._fieldTypeHints){this._invalidateFieldTypeCache();return}this._adjustFieldTypeStatsForItem(e,-1),this._adjustFieldTypeStatsForItem(t,1),this._fieldTypeHints=this._computeFieldTypeHintsFromStats(this._fieldTypeStats)}_normalizeItem(e,t,s=!0){if(Array.isArray(e))return e.map(r=>this._normalizeItem(r,t,s));if(e!==null&&typeof e=="object")return Object.keys(e).forEach(r=>{const o=t&&t[r];if(o==="number"&&typeof e[r]=="string"&&e[r].trim()!==""){const a=Number(e[r]);e[r]=Number.isFinite(a)?a:e[r]}else o==="string"?e[r]=typeof e[r]=="number"?String(e[r]):e[r]:e[r]=this._normalizeItem(e[r],void 0,!1)}),e;if(s&&(this.columns||[]).length===1&&typeof e=="string"&&e.trim()!==""){const r=Number(e.trim());if(Number.isFinite(r))return r}return this._isStrictNumberString(e)?Number(e):e}_validateEntry(){const e=this.getContentChildren("#form")[0];if(e.validateItem()){const t=e.index>-1?this._deepCopy(this.items[e.index]):null;let s=this._deepCopy(e.item);const r=this._ensureFieldTypeCache();s=this._normalizeItem(s,r),e.index>-1?(this.set(`items.${e.index}`,s),this._updateFieldTypeCache(t,s)):(this.push("items",s),this._updateFieldTypeCache(null,s)),this.__renderDebouncer=y.debounce(this.__renderDebouncer,T.after(10),()=>{this.notifyResize(),this.$.dialog.close()})}}_deepCopy(e){let t=[];const s=JSON.parse(JSON.stringify(e,(r,o)=>{if(typeof o=="object"&&o!==null){if(t.indexOf(o)!==-1)return;t.push(o)}return o}));return t=null,s}_getFormTemplate(e){return!e||typeof e.queryEffectiveChildren!="function"?null:e.queryEffectiveChildren("template")}_getTemplateBindingSources(e){const t=e&&(e._templateInfo||e.__templateInfo)||{};return this._collectBindingSources(t)}_collectBindingSources(e){const{nodeInfoList:t}=e||{};if(!t)return[];const s=[];return t.forEach(r=>{(r.bindings||[]).forEach(o=>{(o.parts||[]).forEach(a=>{!a||a.hostProp||(typeof a.source=="string"&&s.push(a.source),(a.dependencies||[]).forEach(h=>{h&&typeof h.name=="string"&&s.push(h.name)}))})}),r.templateInfo&&this._collectBindingSources(r.templateInfo).forEach(o=>s.push(o))}),s}_isComplexEntry(e){const t=this._getFormTemplate(e);if(t){const r=this._getTemplateBindingSources(t);if(r.some(a=>a.startsWith("item.")))return!0;if(r.includes("item"))return!1;const o=t.innerHTML||"";if(/\bitem\s*\./.test(o))return!0;if(/(?:\[\[|\{\{)[\s!]*item\s*(?:::[^\]}]*)?(?:\]\]|\}\})/.test(o))return!1}const s=(this.items||[]).find(r=>r!=null);return s!==void 0?typeof s=="object":(this.columns||[]).length>1}_toggleEditDialog(e){const t=this.getContentChildren("#form")[0];typeof e<"u"?(t.index=e,t.item=this._deepCopy(this.items[e])):(t.index=-1,t.item=this._isComplexEntry(t)?{}:""),this.$.dialog.toggle()}_deleteEntry(e){e.stopPropagation();const t=this.items&&this.items[e.detail.index];this.splice("items",e.detail.index,1),this._updateFieldTypeCache(t,null),this.notifyResize()}_createEntry(){this.items||(this.items=[]),this.notifyResize(),this._toggleEditDialog()}_moveItemUpward(e){if(e.stopPropagation(),e.detail.index>0){const t=this.items[e.detail.index];this.splice("items",e.detail.index,1),this.splice("items",e.detail.index-1,0,t),this.notifyResize()}}_moveItemDownward(e){if(e.stopPropagation(),this.items.length-1>e.detail.index){const t=this.items[e.detail.index];this.splice("items",e.detail.index,1),this.splice("items",e.detail.index+1,0,t),this.notifyResize()}}_patchOverlay(e){e.target.withBackdrop&&e.target.parentNode.insertBefore(e.target.backdropElement,e.target)}fetch(){if(this._hasPageProvider())if(this.paginable){const e=this._fetchPage(this.nxProvider.page,this.nxProvider.pageSize);if(e)return e.then(()=>{this.nxProvider.page+=1,this.$.scrollThreshold.clearTriggers(),this.$.list.notifyResize()});this.$.scrollThreshold.clearTriggers(),this.$.list.notifyResize()}else return this._fetchRange(0,this.nxProvider.pageSize,!0)}_threshold(){this.paginable&&this.fetch()}_scroll(){this.paginable||this._scrollChanged()}_sort(e){this.paginable&&(this.nxProvider.page=1),this._sortDirectionChanged(e)}_getValidity(){return this.required?this.items&&this.items.length>0:!0}draggableFilter(e){const t=e.closest("nuxeo-data-table-row");return t&&t.selected}_formDialogOpenedChanged(e){const t=this.getContentChildren("#form")[0];t&&(t.disabled=!e.detail.value)}_onColumnResizeStart(e){if(!this.columnResizeEnabled)return;const{column:t,startX:s,startWidth:r}=e.detail||{};!t||typeof s!="number"||(this._resizeCellContainers(),this._resizing={column:t,startX:s+this.scrollLeft,startWidth:r},document.addEventListener("mousemove",this._boundDocumentMouseMove),document.addEventListener("mouseup",this._boundDocumentMouseUp),document.addEventListener("touchmove",this._boundDocumentMouseMove,{passive:!1}),document.addEventListener("touchend",this._boundDocumentMouseUp))}_documentMouseMove(e){if(!this.columnResizeEnabled||!this._resizing)return;const t=e.touches?e.touches[0].clientX:e.clientX;e.touches&&e.preventDefault();const s=t+this.scrollLeft,{column:r,startX:o,startWidth:a}=this._resizing;let h=10;if(r&&r.minWidth!=null){const p=parseInt(r.minWidth,10);Number.isNaN(p)||(h=p)}const l=s-o,d=Math.max(h,Math.round(a+l)),f=this.columns.indexOf(r);f>-1&&(this.set(`columns.${f}.width`,`${d}px`),this.set(`columns.${f}.resized`,!0),this._resizeRafId||(this._resizeRafId=window.requestAnimationFrame(()=>{this._resizeRafId=null,this._resizeCellContainers()})))}_documentMouseUp(){if(!this.columnResizeEnabled||!this._resizing)return;document.removeEventListener("mousemove",this._boundDocumentMouseMove),document.removeEventListener("mouseup",this._boundDocumentMouseUp),document.removeEventListener("touchmove",this._boundDocumentMouseMove),document.removeEventListener("touchend",this._boundDocumentMouseUp);const{column:e}=this._resizing,t=this._getHeaderCells();for(let s=0;s<t.length;s++){const r=t[s];if(r.column===e){r.classList.remove("resizing"),r.style.cursor="",r.draggable=!!this.columnReorderEnabled;break}}this._resizing=null,this.notifyResize(),this._fireSettingsChanged({source:"column-resize",column:e}),this._resizeRafId&&(cancelAnimationFrame(this._resizeRafId),this._resizeRafId=null)}_onColumnDragStart(e){if(!this.columnReorderEnabled)return;this._reorderingColumns=!0,this._draggingColumn=e.detail.column,this._dragOverColumn=null,this._dragInsertAfter=!1,this._markActiveColumn(e.detail.column);const t=this.getBoundingClientRect();this._dragHeaderLeft=t.left;const s=[...this.columns].filter(o=>!o.hidden&&o!==this._draggingColumn).sort((o,a)=>o.order-a.order),r=this._getHeaderCells();this._dragCellsMeta=s.map(o=>{const h=Array.from(r).find(l=>l.column===o).getBoundingClientRect();return{column:o,left:h.left,right:h.right}})}_onColumnDragEnd(){if(!this.columnReorderEnabled)return;const e=this._draggingColumn,t=this._dragOverColumn;if(!e||!t||e===t){this._resetDragState();return}const s=[...this.columns].sort((h,l)=>h.order-l.order),r=s.indexOf(e);let o=s.indexOf(t);s.splice(r,1),r<o&&o--;const a=this._dragInsertAfter?o+1:o;s.splice(a,0,e),s.forEach((h,l)=>{h.order=l}),this._fireSettingsChanged({source:"column-reorder"}),this.notifyResize(),this._resetDragState()}_resetDragState(){this._reorderingColumns=!1,this._draggingColumn=null,this._dragOverColumn=null,this._dragInsertAfter=!1,this._dragCellsMeta=null,this._dragHeaderLeft=null,this._clearDropIndicators(),this._clearActiveColumn()}_onColumnDragMove(e){!this.columnReorderEnabled||!this._draggingColumn||typeof e!="number"||this._resolveDropTargetFromX(e)}_resolveDropTargetFromX(e){if(!this._dragCellsMeta)return;const t=Math.round(e-this._dragHeaderLeft+this.scrollLeft);let s=-1,r=!1;for(let h=0;h<this._dragCellsMeta.length;h++){const l=this._dragCellsMeta[h],d=l.left-this._dragHeaderLeft+this.scrollLeft,f=l.right-this._dragHeaderLeft+this.scrollLeft,p=d+(f-d)/2;if(t>=d&&t<=f){s=h,r=t>p;break}}if(s===-1&&t<this._dragCellsMeta[0].left-this._dragHeaderLeft+this.scrollLeft){this._dragOverColumn=this._dragCellsMeta[0].column,this._dragInsertAfter=!1,this._setDropEdgeIndicator(this._dragCellsMeta[0].column);return}if(s===-1){this._dragOverColumn=null,this._clearDropIndicators();return}const o=this._dragCellsMeta[s];this._dragOverColumn=o.column,this._dragInsertAfter=r;let a=o.column;!r&&s>0&&(a=this._dragCellsMeta[s-1].column),this._setDropEdgeIndicator(a)}_markActiveColumn(e){if(this._activeColumn===e)return;const t=this._getHeaderCells();t.forEach(s=>{s.column===this._activeColumn&&s.classList.remove("column-active")}),this._activeColumn=e,e&&t.forEach(s=>{s.column===e&&s.classList.add("column-active")})}_clearActiveColumn(){if(!this._activeColumn)return;this._getHeaderCells().forEach(t=>t.classList.remove("column-active")),this._activeColumn=null}_clearDropIndicators(){const e=this._getHeaderCells();for(let t=0;t<e.length;t++)e[t].classList.remove("drop-left","drop-right")}_setDropEdgeIndicator(e){if(!e)return;this._clearDropIndicators();const t=this._getHeaderCells();for(let s=0;s<t.length;s++)if(t[s].column===e){t[s].classList.add("drop-right");break}}_fireSettingsChanged(e={}){this.dispatchEvent(new CustomEvent("settings-changed",{composed:!0,bubbles:!0,detail:e}))}}customElements.define(i.is,i),Nuxeo.DataTable=i}
