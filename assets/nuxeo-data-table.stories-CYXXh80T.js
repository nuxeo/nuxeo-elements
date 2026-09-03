import{L as s}from"./lists.data-Cg1ey1re.js";import{h as U,m as F,R as z,b as D}from"./iframe-T5hUCbnt.js";import"./iron-data-table-Ckr-f-Eg.js";import"./nuxeo-document-thumbnail-BoTgWRTm.js";import"./nuxeo-date-D-ILCUln.js";import"./nuxeo-date-picker-SuZnc0dq.js";import{I as P}from"./iron-resizable-behavior-BJTBE6_U.js";import{F as H}from"./nuxeo-filters-behavior-BwjeSQ5d.js";import"./iron-icon-lX3uy4jx.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./nuxeo-user-avatar-Bs_vnqG5.js";import"./nuxeo-tooltip-BrXDqAUB.js";import"./documents.data-BM_UplYo.js";import"./v4-BT9YOjd5.js";import"./image01-_wyEfMQE.js";import"./preload-helper-Dp1pzeXC.js";import"./iron-validatable-behavior-DVOrdGp7.js";import"./nuxeo-page-provider-display-behavior-BXf2qcae.js";import"./templatizer-behavior-BRsvGg6D.js";import"./render-status-BJmzACxi.js";import"./nuxeo-dialog-B7wOaaIF.js";import"./iron-flex-layout-CQAobW0V.js";import"./paper-material-styles-B1vejkc1.js";import"./shadow-B1sjh-5Q.js";import"./paper-ripple-e9CBUXzz.js";import"./iron-a11y-keys-behavior-CQeU5Yru.js";import"./paper-inky-focus-behavior-BFu4CTGP.js";import"./neon-animation-runner-behavior-mf0Oh3zj.js";import"./default-theme-RhyFn9QU.js";import"./typography-Bj6IP4r5.js";import"./roboto-AfkCeElV.js";import"./paper-icon-button-BQJYUoC5.js";import"./iron-icons-B0EFH-ea.js";import"./iron-iconset-svg-bEbhiue4.js";import"./paper-input-CgOMKcUj.js";import"./paper-input-behavior-BtXc_mnC.js";import"./paper-checkbox-DJEpcUTk.js";import"./paper-checked-element-behavior-JkhbBuKO.js";import"./paper-dialog-scrollable-BWg20tOm.js";import"./shadow-BdVOAeUX.js";import"./nuxeo-checkmark-B2kpQSOl.js";import"./nuxeo-icons-DihWRFWD.js";import"./nuxeo-draggable-list-behavior-CNLYXsWu.js";import"./nuxeo-format-behavior-qyIFGuqE.js";import"./moment-with-locales-v-Wg38Ha.js";/**
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
*/{class e extends Nuxeo.Element{static get template(){return U`
        <style>
          /*
           * WCAG 2.1 AA 1.4.12: the pill must not pin the properties the user is allowed to
           * override. No line-height is declared here, so an inherited value (from a user
           * stylesheet, for instance) applies instead of being reset; the padding is expressed
           * in em so it grows with the text rather than tightening around it; and the minimum
           * height keeps the pill at its current size when the line height is small.
           */
          :host {
            display: inline-block;
            box-sizing: border-box;
            background-color: var(--nuxeo-tag-background, transparent);
            color: var(--nuxeo-default-text, #000);
            padding: 0.4em 0.6em;
            font-size: 0.8rem;
            margin-bottom: 0.3em;
            min-height: 1.55em;
            border-radius: 2em;
            text-decoration: none;

            @apply --nuxeo-tag;
          }

          :host([uppercase]) {
          }

          iron-icon {
            width: 14px;
            height: 14px;
            margin: 0;
            padding: 0;
          }
        </style>

        <dom-if if="[[icon]]">
          <template>
            <iron-icon icon="[[icon]]"></iron-icon>
          </template>
        </dom-if>
        <slot></slot>
      `}static get is(){return"nuxeo-tag"}static get properties(){return{icon:String,uppercase:{type:Boolean,value:!1,reflectToAttribute:!0}}}}customElements.define(e.is,e),Nuxeo.Tag=e}/**
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
*/{class e extends F([z,P,H],Nuxeo.Element){static get template(){return U`
        <style>
          nuxeo-user-avatar {
            margin: 0 0.5rem 0 0;
          }
          :host([dir='rtl']) nuxeo-user-avatar {
            margin: 0 0 0 0.5rem;
          }
          /* em rather than px so this override scales with the text like nuxeo-tag's own padding */
          nuxeo-tag {
            padding: 0 0.6em 0 0;
            max-width: 100%;
          }
          :host([dir='rtl']) nuxeo-tag {
            padding: 0 0 0 0.6em;
          }
          .tag {
            @apply --layout-horizontal;
            @apply --layout-center;
          }
          a {
            @apply --nuxeo-link;
          }

          a:hover {
            @apply --nuxeo-link-hover;
          }

          .user-tag {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .user-tag-nowrap {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
          }
          .user-tag-wrap {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-all;
          }
          .user-tag-link-disabled {
            cursor: default;
          }
        </style>

        <nuxeo-connection id="nxcon" user="{{_currentUser}}"></nuxeo-connection>
        <nuxeo-tag>
          <div class="tag" role="button">
            <nuxeo-user-avatar
              user="[[user]]"
              border-radius="50"
              height="22"
              width="22"
              font-size="10"
              font-weight="500"
              fetch-avatar$="[[fetchAvatar]]"
              class="user-avatar"
            >
            </nuxeo-user-avatar>
            <dom-if if="[[_hasLink(disabled, user, _currentUser)]]">
              <template>
                <a href$="[[_href(user)]]" class$="user-tag" on-click="_preventPropagation">
                  <span class$="username-container {{_getUserTagClass(user)}}">
                    [[_name(user)]]
                  </span>
                </a>
              </template>
            </dom-if>
            <dom-if if="[[!_hasLink(disabled, user, _currentUser)]]">
              <template>
                <span class$="user-tag user-tag-link-disabled" on-click="_preventPropagation">
                  <span class$="username-container {{_getUserTagClass(user)}}">
                    [[_name(user)]]
                  </span>
                </span>
              </template>
            </dom-if>
            <dom-if if="[[_isEntity(user)]]">
              <template>
                <nuxeo-tooltip position="top" offset="0" animation-delay="0">
                  [[_id(user)]]<br />[[_email(user)]]
                </nuxeo-tooltip>
              </template>
            </dom-if>
            <dom-if if="[[!_isEntity(user)]]">
              <template>
                <nuxeo-tooltip position="top" offset="0" animation-delay="0">
                  [[_id(user)]]<br />[[_email(user)]]
                </nuxeo-tooltip>
              </template>
            </dom-if>
          </div>
        </nuxeo-tag>
      `}static get is(){return"nuxeo-user-tag"}static get properties(){return{user:Object,disabled:{type:Boolean,value:!1},fetchAvatar:{type:Boolean,value:!1},_currentUser:{type:Object},maxCharacters:{type:Number,value:null}}}_isEntity(t){return t&&t["entity-type"]&&(t["entity-type"]==="user"||t["entity-type"]==="document"&&t.type==="user")&&t.properties}_id(t){if(t)return t.properties&&(t.properties.username||t.properties["user:username"])||t.id||t.uid||t.replace("user:","")}_name(t){let n;if(this._isEntity(t)){const a=t.properties.firstName||t.properties["user:firstName"],i=t.properties.lastName||t.properties["user:lastName"],r=t.properties.email||t.properties["user:email"],l=t.properties.username||t.properties["user:username"];n=[a,i].join(" ").trim()||r||l||this._id(t)}else n=this._id(t);return this.maxCharacters&&n&&n.length>this.maxCharacters?`${n.substring(0,this.maxCharacters)}...`:n}_email(t){if(this._isEntity(t)){const n=t.properties.email||t.properties["user:email"];return n!==this._id(t)?n:""}return""}_href(t){return this.urlFor("user",this._id(t))}_hasLink(t,n,a){const i=this._id(n)==="system",r=this.hasAdministrationPermissions(a);return!(t||i||!r)}_preventPropagation(t){t.stopPropagation()}_getUserTagClass(t){const n=this._name(t);return/\s/.test(n)?"user-tag-wrap":"user-tag-nowrap"}_calculateElementWidth(t){const n=getComputedStyle(t),a=parseFloat(n.paddingLeft)+parseFloat(n.paddingRight),i=parseFloat(n.borderLeftWidth)+parseFloat(n.borderRightWidth),r=t.offsetWidth-t.clientWidth;return t.offsetWidth-a-i-r}_getHTMLRootNode(t){let n=t;for(;n.parentNode instanceof DocumentFragment;)n=n.parentNode.host;return n.parentNode}connectedCallback(){if(super.connectedCallback(),!this.hasAttribute("dir")){const t=document.documentElement.getAttribute("dir");this.setAttribute("dir",t)}this.addEventListener("dom-change",this._layout),this.addEventListener("iron-resize",this._layout)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("dom-change",this._layout),this.removeEventListener("iron-resize",this._layout)}_layout(){if(this&&this.parentNode){const t=this,n=this._getHTMLRootNode(t);let a=this._calculateElementWidth(n);const i=Array.from(n.children),r=Array.from(t.shadowRoot.querySelectorAll(".user-avatar")),l=r[0].offsetWidth,q=r.length*l,B=i.reduce((f,g)=>(g!==this&&!g.shadowRoot&&(f+=this._calculateElementWidth(g)),f),0);a-=B+q;const h=this.shadowRoot.querySelector(".username-container");h&&a>0&&h.setAttribute("style",`max-width:${a}px`)}}}customElements.define(e.is,e),Nuxeo.UserTag=e}const o=e=>D`
    <nuxeo-data-table
      .items="${e.data}"
      ?editable="${e.editable}"
      ?orderable="${e.orderable}"
      ?settings-enabled="${e.settingsEnabled}"
      ?selection-enabled="${e.selectionEnabled}"
      ?select-all-enabled="${e.selectAllEnabled}"
      ?multi-selection="${e.multiSelection}"
      ?select-on-tap="${e.selectOnTap}"
      ?details-enabled="${e.detailsEnabled}"
      label="${e.label?e.label:""}"
      ?required="${e.required}"
    >
      <nuxeo-data-table-column name="Image">
        <template>
          <nuxeo-document-thumbnail document="[[item]]"></nuxeo-document-thumbnail>
        </template>
      </nuxeo-data-table-column>

      <nuxeo-data-table-column name="Company">
        <template>
          [[item.properties.company_name]]
        </template>
      </nuxeo-data-table-column>

      <nuxeo-data-table-column name="Date" ?hidden="${e.hidden}">
        <template>
          <nuxeo-date datetime="[[item.properties.date]]"></nuxeo-date>
        </template>
      </nuxeo-data-table-column>

      <nuxeo-data-table-column name="Department" order="${e.orderColumn}">
        <template>
          [[item.properties.department]]
        </template>
      </nuxeo-data-table-column>

      <nuxeo-data-table-column name="City" ?align-right="${e.alignRight}">
        <template>
          [[item.properties.city]]
        </template>
      </nuxeo-data-table-column>

      <nuxeo-data-table-column name="User" flex="${e.flex}">
        <template>
          <nuxeo-user-tag user="[[item.properties.user]]" disabled></nuxeo-user-tag>
        </template>
      </nuxeo-data-table-column>

      <nuxeo-data-table-form>
        <template>
          <nuxeo-input value="{{item.properties.company_name}}" label="Company" type="text"></nuxeo-input>
          <nuxeo-date-picker label="Date" value="{{item.properties.date}}"></nuxeo-date-picker>
          <nuxeo-input value="{{item.properties.department}}" label="Department" type="text"></nuxeo-input>
          <nuxeo-input value="{{item.properties.city}}" label="City" type="text"></nuxeo-input>
          <nuxeo-input value="{{item.properties.user}}" label="User" type="text"></nuxeo-input>
        </template>
      </nuxeo-data-table-form>
    </nuxeo-data-table>
  `,Ue={title:"UI/nuxeo-data-table"},d={render:()=>o(s(0))},m={args:{numberOfItems:50},render:e=>o(s(e.numberOfItems))},u={args:{orderable:!0,editable:!0,numberOfItems:50},render:e=>o(Object.assign({},s(e.numberOfItems),{orderable:e.orderable,editable:e.editable}))},p={args:{settingsEnabled:!0,numberOfItems:50},render:e=>o(Object.assign({},s(e.numberOfItems),{settingsEnabled:e.settingsEnabled}))},c={args:{selectionEnabled:!0,selectAllEnabled:!0,multiSelection:!0,numberOfItems:50},render:e=>o(Object.assign({},s(e.numberOfItems),{selectionEnabled:e.selectionEnabled,selectAllEnabled:e.selectAllEnabled,multiSelection:e.multiSelection}))},b={args:{orderable:!0,editable:!0,settingsEnabled:!0,selectionEnabled:!0,selectAllEnabled:!1,multiSelection:!0,selectOnTap:!1,label:"Label",required:!1,hidden:!1,alignRight:!1,orderColumn:0,numberOfItems:50},argTypes:{orderColumn:{control:{type:"number",min:0,max:1,step:1}}},render:e=>o(Object.assign({},s(e.numberOfItems),{orderable:e.orderable,editable:e.editable,settingsEnabled:e.settingsEnabled,selectionEnabled:e.selectionEnabled,selectAllEnabled:e.selectAllEnabled,multiSelection:e.multiSelection,selectOnTap:e.selectOnTap,label:e.label,required:e.required,hidden:e.hidden,alignRight:e.alignRight,orderColumn:e.orderColumn}))};var x,E,y;d.parameters={...d.parameters,docs:{...(x=d.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => tableTemplate(LIST(0))
}`,...(y=(E=d.parameters)==null?void 0:E.docs)==null?void 0:y.source}}};var v,_,O;m.parameters={...m.parameters,docs:{...(v=m.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    numberOfItems: 50
  },
  render: args => tableTemplate(LIST(args.numberOfItems))
}`,...(O=(_=m.parameters)==null?void 0:_.docs)==null?void 0:O.source}}};var S,T,w;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    orderable: true,
    editable: true,
    numberOfItems: 50
  },
  render: args => tableTemplate(Object.assign({}, LIST(args.numberOfItems), {
    orderable: args.orderable,
    editable: args.editable
  }))
}`,...(w=(T=u.parameters)==null?void 0:T.docs)==null?void 0:w.source}}};var A,I,C;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    settingsEnabled: true,
    numberOfItems: 50
  },
  render: args => tableTemplate(Object.assign({}, LIST(args.numberOfItems), {
    settingsEnabled: args.settingsEnabled
  }))
}`,...(C=(I=p.parameters)==null?void 0:I.docs)==null?void 0:C.source}}};var k,$,L;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    selectionEnabled: true,
    selectAllEnabled: true,
    multiSelection: true,
    numberOfItems: 50
  },
  render: args => tableTemplate(Object.assign({}, LIST(args.numberOfItems), {
    selectionEnabled: args.selectionEnabled,
    selectAllEnabled: args.selectAllEnabled,
    multiSelection: args.multiSelection
  }))
}`,...(L=($=c.parameters)==null?void 0:$.docs)==null?void 0:L.source}}};var N,W,R;b.parameters={...b.parameters,docs:{...(N=b.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    orderable: true,
    editable: true,
    settingsEnabled: true,
    selectionEnabled: true,
    selectAllEnabled: false,
    multiSelection: true,
    selectOnTap: false,
    label: 'Label',
    required: false,
    hidden: false,
    alignRight: false,
    orderColumn: 0,
    numberOfItems: 50
  },
  argTypes: {
    orderColumn: {
      control: {
        type: 'number',
        min: 0,
        max: 1,
        step: 1
      }
    }
  },
  render: args => tableTemplate(Object.assign({}, LIST(args.numberOfItems), {
    orderable: args.orderable,
    editable: args.editable,
    settingsEnabled: args.settingsEnabled,
    selectionEnabled: args.selectionEnabled,
    selectAllEnabled: args.selectAllEnabled,
    multiSelection: args.multiSelection,
    selectOnTap: args.selectOnTap,
    label: args.label,
    required: args.required,
    hidden: args.hidden,
    alignRight: args.alignRight,
    orderColumn: args.orderColumn
  }))
}`,...(R=(W=b.parameters)==null?void 0:W.docs)==null?void 0:R.source}}};const je=["Empty","Basic","EditableAndOrderable","Settings","Selectable","Complex"];export{m as Basic,b as Complex,u as EditableAndOrderable,d as Empty,c as Selectable,p as Settings,je as __namedExportsOrder,Ue as default};
