import{m as g,h as _,F as f,i as w,D as y,a as x,b as l}from"./iframe-BOsZuRD5.js";import{I as v}from"./iron-resizable-behavior-nA0Hq9eJ.js";import"./paper-icon-button-D5khVTdX.js";import"./paper-menu-button-C47XMPFI.js";import{I as E}from"./nuxeo-i18n-behavior-rSe54NeH.js";import"./nuxeo-icons-DBuhqV_Q.js";import"./nuxeo-tooltip-BXc9-NfH.js";import"./nuxeo-link-button-CYzryHQe.js";import{i as D}from"./icons-DNX_B8Ax.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-icon-B9x3FBbS.js";import"./iron-flex-layout-DwvxVNwp.js";import"./default-theme-DSIY_Ouo.js";import"./paper-inky-focus-behavior-BAtTMzZe.js";import"./paper-ripple-BWj0X3eM.js";import"./iron-a11y-keys-behavior-Bowcpn4T.js";import"./iron-menu-behavior-DjRgJRGR.js";import"./neon-animation-runner-behavior-DwSgv3bY.js";import"./shadow-B2uLiFuq.js";import"./iron-iconset-svg-DhGL9Wod.js";import"./nuxeo-input-DmSsC08F.js";import"./iron-validatable-behavior-QGTu_0wa.js";import"./paper-input-BATGYxlC.js";import"./paper-input-behavior-DJZN1X1Z.js";import"./typography-D5Kg0VrV.js";import"./roboto-AfkCeElV.js";/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/{class s extends g([v,E],Nuxeo.Element){static get template(){return _`
        <style>
          :host {
            @apply --layout-horizontal;
            @apply --layout-center;
          }

          [hidden] {
            display: none !important;
          }

          #reparent,
          #reparent > * {
            width: 0;
            height: 0;
            overflow: hidden;
          }

          #slot::slotted(*) {
            @apply --nuxeo-actions-menu-main;
          }

          #dropdown::slotted(*) {
            outline: none;
            user-select: none;
            @apply --nuxeo-actions-menu-dropdown;
          }

          paper-menu-button {
            --paper-menu-button: {
              padding: 0;
            }
          }

          paper-listbox {
            @apply --layout-vertical;
          }
        </style>

        <slot id="slot"></slot>
        <div id="reparent"></div>
        <paper-menu-button
          id="dropdownButton"
          close-on-activate
          no-overlap
          horizontal-align="right"
          on-paper-dropdown-close="listnerRemove"
          on-paper-dropdown-open="_onDropdownOpen"
        >
          <paper-icon-button
            id="iconButton"
            icon="nuxeo:more-vert"
            slot="dropdown-trigger"
            aria-label$="[[i18n('actionsMenu.ariaLabel')]]"
            on-keydown="_onDropdownTriggerKeydown"
          ></paper-icon-button>
          <paper-listbox slot="dropdown-content" role="list">
            <slot id="dropdown" name="dropdown"></slot>
          </paper-listbox>
        </paper-menu-button>
        <nuxeo-tooltip for="iconButton" id="iconButtonTooltip">[[i18n('actionsMenu.more')]]</nuxeo-tooltip>
      `}static get is(){return"nuxeo-actions-menu"}connectedCallback(){super.connectedCallback(),this._observer=new f(this,({addedNodes:e,removedNodes:n})=>{const t=e.filter(o=>o.tagName&&o.tagName.includes("-")&&!customElements.get(o.tagName.toLowerCase()));t.forEach(o=>customElements.whenDefined(o.tagName.toLowerCase()).then(this._layout.bind(this))),(e.length>0&&t.length===0||n.length>0)&&this._layout()}),this.addEventListener("iron-resize",this._layout),this.addEventListener("dom-change",this._layout),this.addEventListener("iron-overlay-opened",this._reparent)}disconnectedCallback(){super.disconnectedCallback(),this._observer.disconnect(),this.removeEventListener("iron-resize",this._layout),this.removeEventListener("dom-change",this._layout),this.removeEventListener("iron-overlay-opened",this._reparent)}ready(){super.ready(),this.__openByKeyboard=!1}get contentWidth(){return this._getMenuElements().reduce((e,n)=>e+n.clientWidth,0)}_reparent(e){const n=e.composedPath()[0];if((n.tagName==="NUXEO-DIALOG"||n.tagName==="PAPER-DIALOG")&&e.target.slot==="dropdown"){const t=e.target.parentElement,o=e.target.nextElementSibling,i=e.target;w.run(()=>{this.$.reparent.appendChild(i),i._actionsMenuReparent=i._actionsMenuReparent||(b=>{let r=b.composedPath();r[0].tagName!=="NUXEO-DIALOG"&&r[0].tagName!=="PAPER-DIALOG"||(r=r.slice(0,r.findIndex(a=>a===i)),!(r.filter(a=>a.tagName==="NUXEO-DIALOG"||a.tagName==="PAPER-DIALOG").length>1)&&t.insertBefore(i,o))}),i.addEventListener("iron-overlay-closed",i._actionsMenuReparent)})}}_getMenuElements(){return this.$.slot.assignedNodes({flatten:!0}).filter(e=>e.nodeType===Node.ELEMENT_NODE&&e.tagName!=="NUXEO-SLOT")}_getDropdownElements(){return this.$.dropdown.assignedNodes({flatten:!0}).filter(e=>e.nodeType===Node.ELEMENT_NODE&&e.tagName!=="NUXEO-SLOT")}_moveToMenu(e){e.slot="",e.removeAttribute("show-label")}_removeTabIndex(e){if(e.shiftKey&&e.key==="Tab"){const n=this._getDropdownElements();setTimeout(()=>{n.map(t=>t.removeAttribute("tabindex"))},0)}}_getRemoveTabIndexHandler(){return this._boundRemoveTabIndex||(this._boundRemoveTabIndex=this._removeTabIndex.bind(this)),this._boundRemoveTabIndex}listnerRemove(){const e=this._getDropdownElements(),n=this._getRemoveTabIndexHandler();e.forEach(t=>{t.removeEventListener("keydown",n)})}_onDropdownTriggerKeydown(e){const{key:n}=e,t=n==="Enter",o=n===" "||n==="Spacebar";(t||o)&&(this.__openByKeyboard=!0,o&&e.preventDefault())}_onDropdownOpen(){this.__openByKeyboard&&(this.__openByKeyboard=!1,this._resetDropdownFocus())}_resetDropdownFocus(){const e=this.shadowRoot.querySelector("paper-listbox");if(e){const t=e.closest&&e.closest("paper-menu-button");if(t&&t.opened===!1)return;e.selected=0;const o=this._getDropdownElements();o&&o.length&&setTimeout(()=>{o[0].focus()},0)}const n=this._getDropdownElements();setTimeout(()=>{n.forEach(t=>t.removeAttribute("tabindex"))},0)}_moveToDropdown(e){e.slot="dropdown",e.addEventListener("keydown",this._removeTabIndex.bind(this)),setTimeout(()=>{e.setAttribute("show-label",""),e.removeAttribute("tabindex")},0)}_layout(e){const n=this._getDropdownElements();n&&setTimeout(()=>{n.map(t=>t.removeAttribute("tabindex"))},0),!(e&&e.type&&e.composedPath().find(t=>t.id==="reparent"||t.id==="dropdownButton"))&&(this.__layoutDebouncer=y.debounce(this.__layoutDebouncer,x,()=>{n.length||(this.$.dropdownButton.hidden=!0);const t=this._getMenuElements();for(;t.length&&this.contentWidth+(this.$.dropdownButton.hidden?0:this.$.dropdownButton.offsetWidth)>this.clientWidth;)this._moveToDropdown(t.pop()),this.$.dropdownButton.hidden&&(this.$.dropdownButton.hidden=!1);for(;t.length&&this.contentWidth<=this.clientWidth;)this._moveToMenu(t.shift())}))}}customElements.define(s.is,s),Nuxeo.ActionsMenu=s}const m=D.nuxeo,V={title:"UI/nuxeo-actions-menu"},d={args:{numberOfItems:5},argTypes:{numberOfItems:{control:{type:"range",min:1,max:m.length+1,step:1}}},render:s=>{const p=m.slice(0,s.numberOfItems);return l`
      <style>
        nuxeo-actions-menu {
          max-width: 300px;
        }
      </style>
      <nuxeo-actions-menu>
        ${p.map(e=>l`
              <nuxeo-link-button href="#" icon=${e} label=${e}> </nuxeo-link-button>
            `)}
      </nuxeo-actions-menu>
    `}};var u,c,h;d.parameters={...d.parameters,docs:{...(u=d.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    numberOfItems: 5
  },
  argTypes: {
    numberOfItems: {
      control: {
        type: 'range',
        min: 1,
        max: iconsList.length + 1,
        step: 1
      }
    }
  },
  render: args => {
    const list = iconsList.slice(0, args.numberOfItems);
    return html\`
      <style>
        nuxeo-actions-menu {
          max-width: 300px;
        }
      </style>
      <nuxeo-actions-menu>
        \${list.map(i => html\`
              <nuxeo-link-button href="#" icon=\${i} label=\${i}> </nuxeo-link-button>
            \`)}
      </nuxeo-actions-menu>
    \`;
  }
}`,...(h=(c=d.parameters)==null?void 0:c.docs)==null?void 0:h.source}}};const Y=["Default"];export{d as Default,Y as __namedExportsOrder,V as default};
