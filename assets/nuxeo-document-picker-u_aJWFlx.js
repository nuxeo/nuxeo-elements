import{m as r,N as d,h as n}from"./iframe-T5hUCbnt.js";import{a}from"./render-status-BJmzACxi.js";import{I as o}from"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./iron-flex-layout-CQAobW0V.js";import"./iron-collapse-Q03AhJj8.js";import"./nuxeo-search-form-layout-Cyg4McPd.js";import"./nuxeo-search-results-layout-Dser9wgW.js";import"./nuxeo-dialog-B7wOaaIF.js";import"./paper-icon-button-BQJYUoC5.js";/**
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
*/{class s extends r([d,o],Nuxeo.Element){static get template(){return n`
        <style include="nuxeo-styles iron-flex iron-flex-alignment">
          .ellipsis {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            display: block;
          }

          .capitalize {
            text-transform: capitalize;
          }

          .form {
            @apply --paper-card;
            padding: 0;
          }

          .header,
          #collapse {
            padding: 0 16px;
          }

          .buttons {
            @apply --buttons-bar;
          }

          .hidden {
            visibility: hidden;
          }

          .count {
            @apply --layout-horizontal;
            @apply --layout-center;
            @apply --layout-center-justified;
            background: var(--nuxeo-badge-background);
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            margin-left: 1em;
          }

          .buttons {
            @apply --layout-horizontal;
          }

          paper-spinner-lite {
            width: 22px;
            height: 22px;
            padding-left: 8px;
          }
        </style>

        <nuxeo-page-provider
          id="provider"
          provider="[[provider]]"
          page-size="[[pageSize]]"
          aggregations="{{aggregations}}"
          enrichers="[[enrichers]]"
          params="[[_params]]"
          quick-filters="{{quickFilters}}"
          schemas="[[schemas]]"
          loading="{{loading}}"
          headers="[[headers]]"
          fetch-aggregates
          skip-aggregates$="[[skipAggregates]]"
          on-error="_onError"
        >
        </nuxeo-page-provider>

        <template is="dom-if" if="[[showFilters]]">
          <div class="form">
            <div class="header horizontal layout center">
              <a href="javascript:undefined" class="horizontal layout center" on-tap="toggleExpand">
                <span><iron-icon icon="[[_expandIcon(opened)]]" toggle></iron-icon></span>
                <span class="filter">[[i18n('resultsView.filters.heading')]]</span>
              </a>
              <div class$="count [[_hideCounter]]">
                <span>[[_getFilterCount(_params.*)]]</span>
              </div>
              <div class="horizontal layout flex center end-justified">
                <paper-button noink on-tap="_clear" class$="[[_hideCounter]]">
                  [[i18n('command.clear')]]
                </paper-button>
              </div>
            </div>
            <iron-collapse id="collapse" opened="{{opened}}">
              <nuxeo-search-form-layout
                id="form"
                href-base="[[hrefBase]]"
                provider="[[provider]]"
                search-name="[[searchName]]"
                aggregations="[[aggregations]]"
                params="[[_params]]"
                on-search-form-layout-changed="_formChanged"
              ></nuxeo-search-form-layout>
            </iron-collapse>
            <div class="buttons" hidden$="[[!opened]]">
              <paper-button noink class="clear secondary" on-tap="_clear" disabled$="[[loading]]">
                [[i18n('command.clear')]]
              </paper-button>
              <div class="horizontal layout flex end-justified">
                <paper-button noink class="primary search" on-tap="search" hidden$="[[auto]]" disabled$="[[loading]]">
                  [[i18n('command.search')]]
                  <template is="dom-if" if="[[loading]]">
                    <paper-spinner-lite active></paper-spinner-lite>
                  </template>
                </paper-button>
              </div>
            </div>
          </div>
        </template>

        <template is="dom-if" if="[[visible]]">
          <nuxeo-search-results-layout
            id="results"
            href-base="[[hrefBase]]"
            search-name="[[searchName]]"
            nx-provider="[[_nxProvider]]"
            on-navigate="_navigateFromSearch"
            on-results-changed="_resultsChanged"
          ></nuxeo-search-results-layout>
        </template>
      `}static get is(){return"nuxeo-results-view"}static get properties(){return{provider:{type:String},pageSize:{type:Number,value:40},params:{type:Object,observer:"_paramsChanged",value:{}},enrichers:{type:String,value:"thumbnail, permissions, highlight"},headers:{type:Object,value:{"fetch-document":"properties","translate-directoryEntry":"label"}},schemas:{type:String},loading:{type:Boolean,reflectToAttribute:!0,value:!1},searchName:String,aggregations:{type:Object,observer:"_aggregationsChanged",notify:!0},quickFilters:{type:Array,notify:!0},visible:{type:Boolean,value:!1},auto:{type:Boolean,value:!1},showFilters:{type:Boolean,value:!1},deferInitialSearch:{type:Boolean,value:!1},opened:{type:Boolean,value:!1},searchForm:{type:Object,value:null,observer:"_searchFormChanged"},skipAggregates:Boolean,hrefBase:String,_params:Object,_paramsCount:Number,_nxProvider:HTMLElement,_hideCounter:{type:String,computed:"_computeHideCounter(opened, _params.*)"}}}static get observers(){return["_visibilityOrAutoChanged(visible, auto)"]}constructor(){super(),this._searched=!1,this._searchOnTrigger=()=>this.search()}ready(){super.ready(),this._nxProvider||(this._nxProvider=this.$.provider)}get form(){const e=this.$$("#form");return e&&e.element}get results(){return this.$$("#results")}toggleExpand(){this.$$("#collapse").toggle()}_visibilityOrAutoChanged(){this.visible&&this.auto&&this._search()}_expandIcon(e){return`hardware:keyboard-arrow-${e?"down":"right"}`}_countParams(e){return Object.keys(e).filter(t=>e[t]&&(!Array.isArray(e[t])||e[t].length>0)).length}_getFilterCount(){return this._params?this._countParams(this._params)-this._paramsCount-("highlight"in this._params?1:0):0}_computeHideCounter(e){const t=this._getFilterCount();return e||t===0?"hidden":""}_paramsChanged(){this.params?(this._params=JSON.parse(typeof this.params=="string"?this.params:JSON.stringify(this.params)),this._paramsCount=this._countParams(this._params)):(this._params={},this._paramsCount=0)}search(){this._searched=!0,this._search()}_search(){this.deferInitialSearch&&!this._searched&&!this.auto||this.results&&(this.results.reset(),this.results.fetch())}_aggregationsChanged(){this.form&&(this.form.aggregations=this.aggregations)}_onError(e){this.notify(e.detail.error),e.stopPropagation()}_clear(){if(this.form&&this.form.clear!==void 0&&typeof this.form.clear=="function"&&this.form.clear(),this._paramsChanged(),this.auto||(this.aggregations={}),this.deferInitialSearch&&!this.auto){this._searched=!1,this.results&&this.results.reset();return}!this.auto&&this.visible&&this._search()}_formChanged(e){this._clear();const t=e.detail.value;t.addEventListener("params-changed",i=>{(i.detail.path||"value"in i.detail)&&(this.notifyPath(i.detail.path?`_params.${i.detail.path.split(".")[1]}`:"_params",i.detail.value),this.visible&&this.auto&&this._search())}),this.skipAggregates=t.skipAggregates,t.addEventListener("skip-aggregates-changed",i=>{this.notifyPath("skipAggregates",i.detail.value)}),t.removeEventListener("trigger-search",this._searchOnTrigger),t.addEventListener("trigger-search",this._searchOnTrigger),this._search()}_resultsChanged(e){const{results:t}=this;this.searchForm&&t&&(this.searchForm.results=t.results),this.dispatchEvent(new CustomEvent("results-changed",{composed:!0,bubbles:!0,detail:e.detail}))}_searchFormChanged(e){if(e){this._nxProvider=e.nxProvider,this.provider=this._nxProvider.provider,this.searchName=e.searchName;const{results:t}=this;t&&(e.results=t.results)}}_navigateFromSearch(e){this.searchForm&&this.searchForm.displayQueue(e.detail.index)}}customElements.define(s.is,s)}/**
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
*/{class s extends r([o],Nuxeo.Element){static get template(){return n`
        <style include="nuxeo-styles">
          nuxeo-dialog {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            width: 100%;
            max-height: var(--nuxeo-document-picker-dialog-max-height, 84%);
            max-width: var(--nuxeo-document-picker-dialog-max-width, 768px);
            padding: 8px;
            overflow: auto;
          }
          #topContainer {
            display: flex;
            justify-content: flex-end;
          }
          paper-icon-button {
            width: 24px;
            height: 24px;
            opacity: 0.6;
          }
          paper-icon-button:hover {
            opacity: 1;
          }
          #mainContainer,
          #topContainer,
          nuxeo-results-view,
          paper-icon-button {
            margin: 0;
            padding: 0;
          }
          #mainContainer {
            /* take the all the remaining height of the dialog (between the top and button containers) */
            height: 100%;
            overflow: auto;
          }
          nuxeo-results-view {
            --nuxeo-results-view-height: var(
              --nuxeo-document-picker-results-view-height,
              calc(100vh - 520px - var(--nuxeo-app-top))
            );
          }
        </style>
        <nuxeo-dialog
          id="dialog"
          modal
          restore-focus-on-close
          aria-label$="[[_dialogLabel(dialogLabel, i18n)]]"
          on-iron-overlay-opened="_onDialogOpened"
        >
          <div id="topContainer">
            <paper-icon-button
              aria-label$="[[i18n('command.close')]]"
              icon="nuxeo:cross"
              id="closeButton"
              noink
              on-tap="close"
            ></paper-icon-button>
          </div>
          <div id="mainContainer">
            <nuxeo-results-view
              id="resultsView"
              provider="[[provider]]"
              page-size="[[pageSize]]"
              params="[[_params]]"
              quick-filters="{{_quickFilters}}"
              schemas="[[schemas]]"
              enrichers="[[enrichers]]"
              search-name="[[searchName]]"
              aggregations="{{_aggregations}}"
              href-base="[[hrefBase]]"
              visible
              show-filters
              opened
              on-navigate="_onNavigate"
              on-results-changed="_onResultsChanged"
              on-search-form-layout-changed="_onSearchFormLoaded"
            ></nuxeo-results-view>
          </div>
          <div class="buttons">
            <paper-button noink class="secondary" dialog-dismiss id="cancelButton">
              [[i18n('command.cancel')]]
            </paper-button>
            <paper-button
              noink
              class="primary"
              on-tap="_onSelect"
              id="selectButton"
              aria-keyshortcuts="Control+Enter Meta+Enter"
            >
              [[i18n('command.select')]]
            </paper-button>
          </div>
        </nuxeo-dialog>
      `}static get is(){return"nuxeo-document-picker"}static get properties(){return{dialogLabel:String,enrichers:String,hrefBase:String,pageSize:Number,provider:String,schemas:String,searchName:String,_aggregations:{type:Object,readOnly:!0},_params:{type:Object,readOnly:!0},_quickFilters:{type:Object,readOnly:!0}}}ready(){super.ready(),this._boundDialogKeydown=this._onDialogKeydown.bind(this),this._listenForShortcut()}connectedCallback(){super.connectedCallback(),this._listenForShortcut()}disconnectedCallback(){super.disconnectedCallback(),this._boundDialogKeydown&&this.$.dialog.removeEventListener("keydown",this._boundDialogKeydown,!0),this._listenedResults&&this._boundUpdateFn&&this._listenedResults.removeEventListener("selected-items-changed",this._boundUpdateFn)}open(){this.$.resultsView&&this.$.resultsView._clear(),this._updateSelectButton(),this.$.dialog.noCancelOnEscKey=!1,this._focusPending=!0,this.$.dialog.open()}close(){this.$.dialog.close()}_dialogLabel(e){return e||this.i18n("documentPicker.dialog")}_listenForShortcut(){this._boundDialogKeydown&&this.$.dialog.addEventListener("keydown",this._boundDialogKeydown,!0)}_onDialogKeydown(e){e.key!=="Enter"||!(e.ctrlKey||e.metaKey)||this.$.selectButton.disabled||!this.$.dialog.opened||(e.preventDefault(),e.stopPropagation(),this._onSelect())}_onDialogOpened(e){e.target===this.$.dialog&&a(this,()=>this._focusSearchField())}_onSearchFormLoaded(){a(this,()=>this._focusSearchField())}_focusSearchField(){if(!this._focusPending||!this.$.dialog.opened)return;const{form:e}=this.$.resultsView,t=e?e.shadowRoot:null,i=t?t.querySelector("[autofocus]"):null;i&&typeof i.focus=="function"&&(this._focusPending=!1,i.focus())}get _selectedItems(){return this.$.resultsView&&this.$.resultsView.results&&this.$.resultsView.results.results&&this.$.resultsView.results.results.selectedItems}_updateSelectButton(){const e=this._selectedItems;this.$.selectButton.disabled=!(e&&e.length)}_onSelect(){const e=this._selectedItems;e&&(this.dispatchEvent(new CustomEvent("picked",{composed:!0,bubbles:!0,detail:{selectedItems:e}})),this.close())}_onNavigate(e){this.$.resultsView.results.results.selectItems([e.detail.item])}_onResultsChanged(e){e.detail.value&&(this._listenedResults&&this._boundUpdateFn&&this._listenedResults.removeEventListener("selected-items-changed",this._boundUpdateFn),this._listenedResults=e.detail.value,this._boundUpdateFn=this._updateSelectButton.bind(this),this._listenedResults.addEventListener("selected-items-changed",this._boundUpdateFn))}}customElements.define(s.is,s)}
