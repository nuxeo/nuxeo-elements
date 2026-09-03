import{m as d,h as a,N as E,D as _e,t as ye,b as c}from"./iframe-T5hUCbnt.js";import"./iron-icon-lX3uy4jx.js";import"./iron-icons-B0EFH-ea.js";import"./nuxeo-dialog-B7wOaaIF.js";import"./paper-dialog-scrollable-BWg20tOm.js";import"./paper-icon-button-BQJYUoC5.js";import{F as h}from"./nuxeo-filters-behavior-BwjeSQ5d.js";import{I as m}from"./nuxeo-i18n-behavior-DzdsuNZu.js";import"./nuxeo-icons-DihWRFWD.js";import{e as T}from"./nuxeo-selectivity-BuHqhYsn.js";import"./nuxeo-textarea-27fdnwZF.js";import"./nuxeo-tooltip-BrXDqAUB.js";import"./nuxeo-link-button-xMlD857F.js";import{F as M}from"./nuxeo-format-behavior-qyIFGuqE.js";import"./iron-iconset-svg-bEbhiue4.js";import"./iron-flex-layout-CQAobW0V.js";import"./paper-input-CgOMKcUj.js";import"./nuxeo-input-ALfz038W.js";import{D as fe}from"./documents.data-BM_UplYo.js";import{i as ke}from"./icons-CLzwxyzJ.js";import"./preload-helper-Dp1pzeXC.js";import"./paper-material-styles-B1vejkc1.js";import"./shadow-B1sjh-5Q.js";import"./paper-ripple-e9CBUXzz.js";import"./iron-a11y-keys-behavior-CQeU5Yru.js";import"./paper-inky-focus-behavior-BFu4CTGP.js";import"./neon-animation-runner-behavior-mf0Oh3zj.js";import"./iron-resizable-behavior-BJTBE6_U.js";import"./default-theme-RhyFn9QU.js";import"./typography-Bj6IP4r5.js";import"./roboto-AfkCeElV.js";import"./render-status-BJmzACxi.js";import"./templatizer-behavior-BRsvGg6D.js";import"./iron-validatable-behavior-DVOrdGp7.js";import"./paper-textarea-Cfq8k5ev.js";import"./paper-input-behavior-BtXc_mnC.js";import"./moment-with-locales-v-Wg38Ha.js";import"./v4-BT9YOjd5.js";/**
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
*/{class t extends d([m,h],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          /* Fix known stacking issue in iOS (NXP-24600)
         https://github.com/PolymerElements/paper-dialog-scrollable/issues/72 */
          paper-dialog-scrollable {
            --paper-dialog-scrollable: {
              -webkit-overflow-scrolling: auto;
              max-height: 150px;
              max-width: 500px;
            }
          }
        </style>

        <nuxeo-operation
          id="addToCollectionOp"
          op="Document.AddToCollection"
          input="[[document.uid]]"
        ></nuxeo-operation>
        <nuxeo-operation id="createCollectionOp" op="Collection.Create"></nuxeo-operation>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" on-click="_toggleDialog">
              <paper-icon-button icon="[[icon]]" noink aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>

        <nuxeo-dialog id="dialog" with-backdrop>
          <h2>[[i18n('addToCollectionButton.dialog.heading')]]</h2>
          <paper-dialog-scrollable>
            <nuxeo-selectivity
              id="nxSelect"
              label="[[i18n('addToCollectionButton.dialog.collections')]]"
              required
              operation="Collection.Suggestion"
              min-chars="0"
              placeholder="[[i18n('addToCollectionButton.dialog.select')]]"
              value="{{collection}}"
              tagging="true"
              query-results-filter="[[resultsFilter]]"
              result-formatter="[[resultFormatter]]"
              selection-formatter="[[selectionFormatter]]"
              new-entry-formatter="[[newEntryFormatter]]"
            >
            </nuxeo-selectivity>
            <nuxeo-textarea
              label="[[i18n('addToCollectionButton.dialog.description')]]"
              value="{{description::input}}"
              hidden$="[[!_isNew(collection)]]"
            >
            </nuxeo-textarea>
          </paper-dialog-scrollable>
          <div class="buttons">
            <paper-button dialog-dismiss on-click="_resetPopup" class="secondary"
              >[[i18n('addToCollectionButton.dialog.cancel')]]</paper-button
            >
            <paper-button
              dialog-confirm
              class="primary"
              name="add"
              on-click="_add"
              disabled$="[[!_isValid(collection)]]"
            >
              [[i18n('addToCollectionButton.dialog.add')]]
            </paper-button>
          </div>
        </nuxeo-dialog>
      `}static get is(){return"nuxeo-add-to-collection-button"}static get properties(){return{document:Object,icon:{type:String,value:"nuxeo:collections"},collection:{type:String,value:""},resultsFilter:{type:Function,value(){return this._resultsFilter.bind(this)}},resultFormatter:{type:Function,value(){return this._resultFormatter.bind(this)}},selectionFormatter:{type:Function,value(){return this._selectionFormatter.bind(this)}},newEntryFormatter:{type:Function,value(){return this._newEntryFormatter.bind(this)}},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(i18n)"}}}_isAvailable(e){return this.isCollectionMember(e)}_computeLabel(){return this.i18n("addToCollectionButton.tooltip")}_toggleDialog(){this.$.dialog.toggle()}_add(){if(this._isNew()){const e=this.$$("#createCollectionOp"),o=this.$.nxSelect.selectedItem.displayLabel;return e.params={name:o,description:this.description},e.execute().then(n=>{this.collection=n.uid,this._addToCollection()})}this._addToCollection()}_addToCollection(){const e=this.$$("#addToCollectionOp");return e.params={collection:this.collection},e.execute().then(()=>{this.dispatchEvent(new CustomEvent("added-to-collection",{composed:!0,bubbles:!0,detail:{docId:this.document.uid,collectionId:this.collection}})),this._resetPopup()})}_resultsFilter(e){return e.id&&e.id.indexOf("-999999")===-1}_resultFormatter(e){const o=e.displayLabel||e.title;return e.id===-1?`<iron-icon icon="nuxeo:add" item-icon></iron-icon>${o}`:T(o)}_selectionFormatter(e){const o=e.displayLabel||e.title;return e.id===-1?o:T(o)}_escapeHTML(e){const o={"\\":"&#92;","&":"&amp;","<":"&lt;",">":"&gt;","/":"&#47;"};return typeof e!="string"?e:String(e).replace(/[&<>"/\\]/g,n=>o[n])}_newEntryFormatter(e){return{id:-1,displayLabel:this._escapeHTML(e)}}_isValid(){return this.collection}_isNew(){return this.collection===-1}_resetPopup(){this.set("collection",null),this.description=""}}customElements.define(t.is,t),Nuxeo.AddToCollectionButton=t}/**
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
*/{class t extends d([m,h],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          :host([favorite]) paper-icon-button {
            color: var(--icon-toggle-pressed-color, var(--nuxeo-action-color-activated));
          }
        </style>

        <nuxeo-operation id="opAdd" op="Document.AddToFavorites" input="[[document.uid]]"></nuxeo-operation>
        <nuxeo-operation id="opRemove" op="Document.RemoveFromFavorites" input="[[document.uid]]"></nuxeo-operation>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" role="presentation">
              <paper-icon-button
                icon="[[_computeIcon(favorite, icon)]]"
                noink
                aria-label$="[[_computeHoverLabel(favorite, document, i18n)]]"
              ></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-favorites-toggle-button"}static get properties(){return{document:{type:Object,observer:"_documentChanged"},icon:{type:String,value:"nuxeo:favorites"},favorite:{type:Boolean,readOnly:!0,notify:!0,reflectToAttribute:!0},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(favorite, i18n)"}}}ready(){super.ready(),this.hasAttribute("role")||this.setAttribute("role","presentation"),this.removeFromFavoritesHandler=e=>{this.document&&e.detail.docUid&&e.detail.docUid===this.document.uid&&this._setFavorite(!1)},window.addEventListener("removed-from-favorites",this.removeFromFavoritesHandler),this.addEventListener("click",this._toggle),this.addEventListener("keydown",e=>{e.key==="Enter"&&e.stopPropagation()})}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("removed-from-favorites",this.removeFromFavoritesHandler),this.removeFromFavoritesHandler=null}_isAvailable(e){return this.isCollectionMember(e)}_toggle(){this.favorite?this.$.opRemove.execute().then(()=>{this.dispatchEvent(new CustomEvent("removed-from-favorites",{composed:!0,bubbles:!0,detail:{doc:this.document}})),this._setFavorite(!1)}):this.$.opAdd.execute().then(()=>{this.dispatchEvent(new CustomEvent("added-to-favorites",{composed:!0,bubbles:!0,detail:{doc:this.document}})),this._setFavorite(!0)})}_computeLabel(e){return this.i18n&&this.i18n(`favoritesToggleButton.tooltip.${e?"remove":"add"}`)}_computeHoverLabel(e,o){return this._computeLabel(e)}_computeIcon(e){return e?"icons:star":"icons:star-border"}_documentChanged(){this._setFavorite(this.isFavorite(this.document))}}customElements.define(t.is,t),Nuxeo.FavoritesToggleButton=t}/**
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
*/{class t extends d([m,h],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles"></style>

        <nuxeo-operation
          id="operation"
          op="Blob.RemoveFromDocument"
          input="[[document.uid]]"
          params="[[_params(xpath)]]"
        >
        </nuxeo-operation>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" on-click="_toggleDialog">
              <paper-icon-button icon="[[icon]]" noink aria-label$="[[_computeAriaLabel(i18n)]]"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>

        <nuxeo-dialog id="dialog" with-backdrop>
          <h2>[[i18n('deleteBlobButton.dialog.heading')]]</h2>
          <div>[[i18n('deleteBlobButton.dialog.message')]]</div>
          <div class="buttons">
            <paper-button dialog-dismiss class="secondary">[[i18n('deleteBlobButton.dialog.no')]]</paper-button>
            <paper-button dialog-confirm on-click="_remove" class="primary"
              >[[i18n('deleteBlobButton.dialog.yes')]]</paper-button
            >
          </div>
        </nuxeo-dialog>
        <nuxeo-connection id="nx" connection-id="[[connectionId]]"></nuxeo-connection>
        <nuxeo-resource id="blobRequest"></nuxeo-resource>
      `}static get is(){return"nuxeo-delete-blob-button"}static get properties(){return{connectionId:{type:String,value:"nx"},document:Object,xpath:{type:String,value:"file:content"},icon:{type:String,value:"nuxeo:remove"},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(i18n)"}}}_isAvailable(e){return e&&this.hasPermission(e,"WriteProperties")&&!this.isImmutable(e)&&!this.hasType(e,"Root")&&!this.isTrashed(e)&&!this._isPropUnderRetention(e)}_isPropUnderRetention(e){if(e&&e.isUnderRetentionOrLegalHold&&e.retainedProperties&&e.retainedProperties.length>0){const{retainedProperties:o}=e;return o.find(n=>this._transformXpathRegex(n,this.xpath)||n.startsWith(this.xpath)||n.includes(this.xpath.split("/")[0])&&!n.includes("/"))}return!1}_transformXpathRegex(e,o){const n=[];if(e.includes("*")){let u=o.split("/");for(let v=0;v<u.length;v++)Number.isNaN(parseInt(u[v],10))||(u[v]="*"),n.push(u[v]);u=n,o=u.join("/")}return e===o}_computeLabel(){return this.i18n("deleteBlobButton.tooltip")}_computeAriaLabel(){return this.i18n("deleteBlobButton.ariaLabel")}_toggleDialog(){this.$.dialog.toggle()}_params(e){return{xpath:e.startsWith("files:")?e.split("/file")[0]:e}}_remove(){const[e,o]=this.xpath.split("/");if(o&&e&&this.document.properties[e]&&this.document.properties[e][o]&&this.document.properties[e][o].fichier){const{"upload-batch":n,"upload-fileId":s}=this.document.properties[e][o].fichier;n&&s?(this.$.blobRequest.data={},this.$.blobRequest.path=`upload/${n}/${s}`,this.$.blobRequest.remove().then(l=>{this._dispatchEvent("file-deleted",l)}).catch(l=>{this._dispatchEvent("error",l)})):this._removeBlob()}else this._removeBlob()}_removeBlob(){this.$.operation.execute().then(e=>{this._dispatchEvent("file-deleted",e)})}_dispatchEvent(e,o){this.dispatchEvent(new CustomEvent(e,{composed:!0,bubbles:!0,detail:{response:o}}))}}customElements.define(t.is,t),Nuxeo.DeleteBlobButton=t}/**
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
*/{class t extends d([m,h],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles"></style>

        <nuxeo-operation id="deleteOp" op="Document.Delete" input="[[document.uid]]" sync-indexing></nuxeo-operation>

        <nuxeo-operation id="trashOp" op="Document.Trash" input="[[document.uid]]" sync-indexing></nuxeo-operation>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" on-click="_delete">
              <paper-icon-button icon="[[icon]]" noink id="deleteButton" aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-delete-document-button"}static get properties(){return{document:Object,icon:{type:String,value:"nuxeo:delete",computed:"_computeIcon(hard)"},hard:{type:Boolean,value:!1},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(hard, i18n)"},confirmationMessage:{type:String,value:""}}}_isAvailable(e){return!this.isVersion(e)&&this.hasPermission(e,"Remove")&&(!this.isTrashed(e)||this.hard)}_computeIcon(e){return e?"nuxeo:delete-permanently":"nuxeo:delete"}_computeLabel(e){return this.i18n(e?"deleteButton.tooltip.permanently":"deleteButton.tooltip")}_delete(){const e=this.confirmationMessage||this.i18n("deleteButton.confirm");if(!window.confirm(e))return;(this.hard?this.$.deleteOp:this.$.trashOp).execute().then(()=>{this.dispatchEvent(new CustomEvent("document-deleted",{composed:!0,bubbles:!0,detail:{doc:this.document,hard:this.hard}}))}).catch(n=>{this.dispatchEvent(new CustomEvent("document-deleted",{composed:!0,bubbles:!0,detail:{doc:this.document,error:n,hard:this.hard}}))})}}customElements.define(t.is,t),Nuxeo.DeleteDocumentButton=t}/**
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
*/{class t extends d([M,h],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles"></style>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" role="presentation" on-click="_download">
              <paper-icon-button
                icon="[[icon]]"
                noink
                aria-label$="[[_computeHoverLabel(document, i18n)]]"
              ></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-download-button"}static get properties(){return{document:Object,icon:{type:String,value:"nuxeo:download"},xpath:{type:String,value:"file:content"},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(i18n)"}}}ready(){super.ready(),this.hasAttribute("role")||this.setAttribute("role","presentation"),this.addEventListener("keydown",e=>{e.key==="Enter"&&e.stopPropagation()})}_isAvailable(e){return this.hasContent(e,this.formatPropertyXpath(this.xpath))}_computeLabel(){return this.i18n("downloadButton.tooltip")}_computeHoverLabel(e){return this.i18n("downloadButton.ariaLabel")}async _download(){const e=this.document&&this._deepFind(this.document.properties,this.xpath);e&&await new Promise(()=>{window.location.href=e.downloadUrl?e.downloadUrl:e.data})}_deepFind(e,o){for(let n=0,s=o.split("/"),l=s.length;n<l&&!(!e||Array.isArray(e)&&e.length===0);n++)e=e[s[n]];return e}}customElements.define(t.is,t),Nuxeo.DownloadButton=t}/**
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
*/{class t extends d([M],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          .item {
            @apply --layout-horizontal;
            @apply --layout-center;
            padding-top: 0.4em;
            padding-bottom: 0.4em;
          }

          .item iron-icon {
            margin-right: 1em;
          }

          a {
            color: var(--nuxeo-link-color, #3a3a54);
          }
          a:hover {
            color: var(--nuxeo-link-hover-color, #0066ff);
          }

          .container {
            overflow: auto;
          }
        </style>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" on-click="_toggleDialog">
              <paper-icon-button icon="[[icon]]" noink aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>

        <nuxeo-dialog id="dialog" with-backdrop class="container">
          <h2>[[i18n('exportButton.dialog.heading')]]</h2>

          <dom-repeat items="[[_filterRenditions(document, i18n)]]">
            <template>
              <div class="item">
                <iron-icon src="[[item.icon]]"></iron-icon><a href="[[item.url]]" download>[[item.label]]</a>
              </div>
            </template>
          </dom-repeat>

          <div class="buttons">
            <paper-button dialog-dismiss class="secondary">[[i18n('exportButton.dialog.cancel')]]</paper-button>
          </div>
        </nuxeo-dialog>
      `}static get is(){return"nuxeo-export-button"}static get properties(){return{document:Object,icon:{type:String,value:"nuxeo:export"},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(i18n)"}}}_isAvailable(e){return e}_computeLabel(){return this.i18n("exportButton.tooltip")}_toggleDialog(){this.$.dialog.toggle()}_filterRenditions(e){return e&&e.contextParameters&&e.contextParameters.renditions?e.contextParameters.renditions.filter(o=>o.kind!=="nuxeo:video:conversion"&&o.kind!=="nuxeo:picture:conversion").map(o=>Object.assign({label:this.formatRendition(o.name)},o)):[]}}customElements.define(t.is,t),Nuxeo.ExportButton=t}/**
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
*/{class t extends d([E,m,h,M],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          :host([locked]) paper-icon-button {
            color: var(--icon-toggle-outline-color, var(--nuxeo-action-color-activated));
          }
        </style>

        <nuxeo-connection id="nxcon"></nuxeo-connection>

        <nuxeo-operation id="opLock" op="Document.Lock" input="[[document.uid]]" headers='{"fetch-document": "lock"}'>
        </nuxeo-operation>
        <nuxeo-operation
          id="opUnlock"
          op="Document.Unlock"
          input="[[document.uid]]"
          headers='{"fetch-document": "lock"}'
        >
        </nuxeo-operation>

        <dom-if if="[[_isAvailable(document, locked)]]">
          <template>
            <div class="action">
              <paper-icon-button icon="[[icon]]" noink aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[tooltip]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-lock-toggle-button"}static get properties(){return{document:{type:Object,observer:"_documentChanged"},icon:{type:String,computed:"_computeIcon(locked)"},locked:{type:Boolean,notify:!0,reflectToAttribute:!0},tooltip:{type:String,notify:!0,computed:"_computeTooltip(locked, i18n, document)"},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(locked, i18n)"}}}ready(){super.ready(),this.addEventListener("click",this._toggle)}_isAvailable(e,o){return e&&!e.isVersion&&!this.isImmutable(e)&&e.type!=="Root"&&(this.hasPermission(e,"Write")||o&&this.hasPermission(e,"Read"))}_toggle(){!this.locked&&this._canLock()?this.$.opLock.execute().then(e=>{this.locked=!0,this.dispatchEvent(new CustomEvent("document-locked",{composed:!0,bubbles:!0,detail:{doc:e}}))}).catch(this._handleError.bind(this)):this._canUnlock()&&this.$.opUnlock.execute().then(e=>{this.locked=!1,this.dispatchEvent(new CustomEvent("document-unlocked",{composed:!0,bubbles:!0,detail:{doc:e}}))}).catch(this._handleError.bind(this))}_handleError(e){const o=`lockToggleButton.${this.locked?"unlock":"lock"}.error`;let n;switch(e.response.status){case 403:n=this.i18n(`${o}.noPermissions`);break;case 409:n=this.i18n(`${o}.${this.locked?"lockedByAnotherUser":"alreadyLocked"}`);break;default:n=this.i18n(`${o}.unexpectedError`)}this.notify({message:n})}_computeTooltip(e){return e&&this.document.lockOwner&&this.document.lockCreated?this.i18n("lockToggleButton.tooltip.lockedBy",this.document.lockOwner,this.formatDate(this.document.lockCreated)):this.i18n(`lockToggleButton.tooltip.${e?"unlock":"lock"}`)}_computeLabel(e){return this.i18n(`lockToggleButton.tooltip.${e?"unlock":"lock"}`)}_computeIcon(e){return e?"nuxeo:lock":"nuxeo:unlock"}_documentChanged(){this.locked=!!(this.document&&this.document.lockCreated)}_canLock(){return this.$.nxcon.connect().then(e=>this.document.isProxy||this.document.isVersion?!1:e.isAdministrator||this.document.contextParameters.permissions.indexOf("Everything")>-1||this.document.contextParameters.permissions.indexOf("Write")>-1)}_canUnlock(){return this.$.nxcon.connect().then(e=>this.document.isProxy?!1:(e.isAdministrator||this.document.contextParameters.permissions.indexOf("Everything")>-1?!0:e.id===this.document.lockOwner&&this.document.contextParameters.permissions.indexOf("Write")>-1)&&!document.isVersion)}}customElements.define(t.is,t),Nuxeo.LockToggleButton=t}/**
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
*/{class t extends d([E,m],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          iron-icon:hover {
            fill: var(--nuxeo-link-hover-color);
          }
        </style>

        <nuxeo-operation
          id="moveDownOp"
          op="Document.Order"
          params="[[_computeParams(_beforeUid)]]"
          input="[[_sortedDocuments]]"
          sync-indexing
        >
        </nuxeo-operation>

        <dom-if id="availability" if="[[_available]]">
          <template>
            <div class="action">
              <paper-icon-button noink icon="icons:arrow-downward" aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-move-documents-down-button"}static get properties(){return{documents:Array,selectedDocuments:Array,tooltipPosition:{type:String,value:"bottom"},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(i18n)"},_available:Boolean,_beforeUid:Document,_sortedDocuments:Array}}static get observers(){return["_isAvailable(selectedDocuments.splices)"]}ready(){super.ready(),this.addEventListener("click",this.move)}move(){this.$.moveDownOp.execute().then(()=>{for(let e=0;e<this._sortedDocuments.length;e++)this.documents.splice(this.documents.indexOf(this._sortedDocuments[e]),1),this.documents.splice(this._focusIndex,0,this._sortedDocuments[e]);this._sortedDocuments=[],this.dispatchEvent(new CustomEvent("refresh-display",{composed:!0,bubbles:!0,detail:{focusIndex:this._focusIndex+1}}))}).catch(()=>{this.notify({message:this.i18n("moveDocumentButton.error")})})}_isAvailable(){if(this._available=!1,this.selectedDocuments&&this.selectedDocuments.length>0){this._sortedDocuments=this.selectedDocuments.slice(0);try{this._sortedDocuments.sort((n,s)=>{const l=this.documents.indexOf(n),u=this.documents.indexOf(s);if(l<0||u<0)throw new Error("Document is not in the list.");return u-l})}catch{this.dispatchEvent(new CustomEvent("clear-selected-items",{composed:!0,bubbles:!0}));return}let e;const o=this._sortedDocuments.every((n,s)=>s>0?this._sortedDocuments[s-1].uid===this.documents[this.documents.indexOf(n)+1].uid?!0:(e=s,!1):!0);if(this._sortedDocuments[0].uid===this.documents[this.documents.length-1].uid){if(o)return;this._focusIndex=this.documents.indexOf(this._sortedDocuments[0])-e,this._sortedDocuments.splice(0,e),this._beforeUid=this.documents[this._focusIndex+1].uid}else{const n=this.documents.indexOf(this._sortedDocuments[0]);n<this.documents.length-2?(this._beforeUid=this.documents[n+2].uid,this._focusIndex=n+1):(this._beforeUid=null,this._focusIndex=this.documents.length-1)}this._sortedDocuments.sort((n,s)=>this.documents.indexOf(n)-this.documents.indexOf(s)),this._available=!0}}_computeLabel(){return this.i18n("moveDocumentButton.down.tooltip")}_computeParams(){return this._beforeUid?{before:this._beforeUid}:{}}}customElements.define(t.is,t),Nuxeo.MoveDocumentsDown=t}/**
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
*/{class t extends d([E,m],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          iron-icon:hover {
            fill: var(--nuxeo-link-hover-color);
          }
        </style>

        <nuxeo-operation
          id="moveUpOp"
          op="Document.Order"
          params='{"before": "[[_beforeUid]]"}'
          input="[[_sortedDocuments]]"
          sync-indexing
        >
        </nuxeo-operation>

        <dom-if id="availability" if="[[_available]]">
          <template>
            <div class="action">
              <paper-icon-button noink icon="icons:arrow-upward" aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-move-documents-up-button"}static get properties(){return{documents:Array,selectedDocuments:Array,tooltipPosition:{type:String,value:"bottom"},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(i18n)"},_available:Boolean,_beforeUid:Document,_sortedDocuments:Array}}static get observers(){return["_isAvailable(selectedDocuments.splices)"]}ready(){super.ready(),this.addEventListener("click",this.move)}move(){this.$.moveUpOp.execute().then(()=>{for(let e=this._sortedDocuments.length-1;e>=0;e--)this.documents.splice(this.documents.indexOf(this._sortedDocuments[e]),1),this.documents.splice(this._focusIndex,0,this._sortedDocuments[e]);this._sortedDocuments=[],this.dispatchEvent(new CustomEvent("refresh-display",{composed:!0,bubbles:!0,detail:{focusIndex:this._focusIndex}}))}).catch(()=>{this.notify({message:this.i18n("moveDocumentButton.error")})})}_isAvailable(){if(this._available=!1,this.selectedDocuments&&this.selectedDocuments.length>0){this._sortedDocuments=this.selectedDocuments.slice(0);try{this._sortedDocuments.sort((n,s)=>{const l=this.documents.indexOf(n),u=this.documents.indexOf(s);if(l<0||u<0)throw new Error("Document is not in the list.");return l-u})}catch{this.dispatchEvent(new CustomEvent("clear-selected-items",{composed:!0,bubbles:!0,detail:{}}));return}let e;const o=this._sortedDocuments.every((n,s)=>s>0?this._sortedDocuments[s-1].uid===this.documents[this.documents.indexOf(n)-1].uid?!0:(e=s,!1):!0);if(this._sortedDocuments[0].uid===this.documents[0].uid){if(o)return;this._focusIndex=this.documents.indexOf(this._sortedDocuments[e-1])+1,this._sortedDocuments.splice(0,e)}else this._focusIndex=this.documents.indexOf(this._sortedDocuments[0])-1;this._beforeUid=this.documents[this._focusIndex].uid,this._available=!0}}_computeLabel(){return this.i18n("moveDocumentButton.up.tooltip")}}customElements.define(t.is,t),Nuxeo.MoveDocumentsDown=t}/**
@license
Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const De=a`<iron-iconset-svg name="social" size="24">
<svg><defs>
<g id="cake"><path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z"></path></g>
<g id="domain"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"></path></g>
<g id="group"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></g>
<g id="group-add"><path d="M8 10H5V7H3v3H0v2h3v3h2v-3h3v-2zm10 1c1.66 0 2.99-1.34 2.99-3S19.66 5 18 5c-.32 0-.63.05-.91.14.57.81.9 1.79.9 2.86s-.34 2.04-.9 2.86c.28.09.59.14.91.14zm-5 0c1.66 0 2.99-1.34 2.99-3S14.66 5 13 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm6.62 2.16c.83.73 1.38 1.66 1.38 2.84v2h3v-2c0-1.54-2.37-2.49-4.38-2.84zM13 13c-2 0-6 1-6 3v2h12v-2c0-2-4-3-6-3z"></path></g>
<g id="location-city"><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"></path></g>
<g id="mood"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path></g>
<g id="mood-bad"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 3c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z"></path></g>
<g id="notifications"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path></g>
<g id="notifications-active"><path d="M7.58 4.08L6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2c.15-2.65 1.51-4.97 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43c2.02 1.45 3.39 3.77 3.54 6.42zM18 11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2v-5zm-6 11c.14 0 .27-.01.4-.04.65-.14 1.18-.58 1.44-1.18.1-.24.15-.5.15-.78h-4c.01 1.1.9 2 2.01 2z"></path></g>
<g id="notifications-none"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"></path></g>
<g id="notifications-off"><path d="M20 18.69L7.84 6.14 5.27 3.49 4 4.76l2.8 2.8v.01c-.52.99-.8 2.16-.8 3.42v5l-2 2v1h13.73l2 2L21 19.72l-1-1.03zM12 22c1.11 0 2-.89 2-2h-4c0 1.11.89 2 2 2zm6-7.32V11c0-3.08-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-.15.03-.29.08-.42.12-.1.03-.2.07-.3.11h-.01c-.01 0-.01 0-.02.01-.23.09-.46.2-.68.31 0 0-.01 0-.01.01L18 14.68z"></path></g>
<g id="notifications-paused"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.93 6 11v5l-2 2v1h16v-1l-2-2zm-3.5-6.2l-2.8 3.4h2.8V15h-5v-1.8l2.8-3.4H9.5V8h5v1.8z"></path></g>
<g id="pages"><path d="M3 5v6h5L7 7l4 1V3H5c-1.1 0-2 .9-2 2zm5 8H3v6c0 1.1.9 2 2 2h6v-5l-4 1 1-4zm9 4l-4-1v5h6c1.1 0 2-.9 2-2v-6h-5l1 4zm2-14h-6v5l4-1-1 4h5V5c0-1.1-.9-2-2-2z"></path></g>
<g id="party-mode"><path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 3c1.63 0 3.06.79 3.98 2H12c-1.66 0-3 1.34-3 3 0 .35.07.69.18 1H7.1c-.06-.32-.1-.66-.1-1 0-2.76 2.24-5 5-5zm0 10c-1.63 0-3.06-.79-3.98-2H12c1.66 0 3-1.34 3-3 0-.35-.07-.69-.18-1h2.08c.07.32.1.66.1 1 0 2.76-2.24 5-5 5z"></path></g>
<g id="people"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></g>
<g id="people-outline"><path d="M16.5 13c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 14.08 1 16.25V19h22v-2.75c0-2.17-4.33-3.25-6.5-3.25zm-4 4.5h-10v-1.25c0-.54 2.56-1.75 5-1.75s5 1.21 5 1.75v1.25zm9 0H14v-1.25c0-.46-.2-.86-.52-1.22.88-.3 1.96-.53 3.02-.53 2.44 0 5 1.21 5 1.75v1.25zM7.5 12c1.93 0 3.5-1.57 3.5-3.5S9.43 5 7.5 5 4 6.57 4 8.5 5.57 12 7.5 12zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 5.5c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5s1.57 3.5 3.5 3.5zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"></path></g>
<g id="person"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></g>
<g id="person-add"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></g>
<g id="person-outline"><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"></path></g>
<g id="plus-one"><path d="M10 8H8v4H4v2h4v4h2v-4h4v-2h-4zm4.5-1.92V7.9l2.5-.5V18h2V5z"></path></g>
<g id="poll"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"></path></g>
<g id="public"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></g>
<g id="school"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"></path></g>
<g id="sentiment-dissatisfied"><circle cx="15.5" cy="9.5" r="1.5"></circle><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-6c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5z"></path></g>
<g id="sentiment-neutral"><path d="M9 14h6v1.5H9z"></path><circle cx="15.5" cy="9.5" r="1.5"></circle><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></g>
<g id="sentiment-satisfied"><circle cx="15.5" cy="9.5" r="1.5"></circle><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-4c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.7 1.19-1.97 2-3.45 2z"></path></g>
<g id="sentiment-very-dissatisfied"><path d="M11.99 2C6.47 2 2 6.47 2 12s4.47 10 9.99 10S22 17.53 22 12 17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4.18-12.24l-1.06 1.06-1.06-1.06L13 8.82l1.06 1.06L13 10.94 14.06 12l1.06-1.06L16.18 12l1.06-1.06-1.06-1.06 1.06-1.06zM7.82 12l1.06-1.06L9.94 12 11 10.94 9.94 9.88 11 8.82 9.94 7.76 8.88 8.82 7.82 7.76 6.76 8.82l1.06 1.06-1.06 1.06zM12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z"></path></g>
<g id="sentiment-very-satisfied"><path d="M11.99 2C6.47 2 2 6.47 2 12s4.47 10 9.99 10S22 17.53 22 12 17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-10.06L14.06 11l1.06-1.06L16.18 11l1.06-1.06-2.12-2.12zm-4.12 0L9.94 11 11 9.94 8.88 7.82 6.76 9.94 7.82 11zM12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path></g>
<g id="share"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"></path></g>
<g id="whatshot"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"></path></g>
</defs></svg>
</iron-iconset-svg>`;document.head.appendChild(De.content);/**
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
*/{class t extends d([m,h],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          :host([subscribed]) paper-icon-button {
            color: var(--icon-toggle-outline-color, var(--nuxeo-action-color-activated));
          }
        </style>

        <nuxeo-operation id="opSubscribe" op="Document.Subscribe" input="[[document.uid]]"></nuxeo-operation>
        <nuxeo-operation id="opUnsubscribe" op="Document.Unsubscribe" input="[[document.uid]]"></nuxeo-operation>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action">
              <paper-icon-button icon="[[icon]]" noink aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-notifications-toggle-button"}static get properties(){return{document:{type:Object,observer:"_documentChanged"},icon:{type:String,value:"nuxeo:notify"},subscribed:{type:Boolean,notify:!0,reflectToAttribute:!0},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(subscribed, i18n)"}}}ready(){super.ready(),this.documentUnsubscribedHandler=e=>{this.document&&e.detail.docUid&&e.detail.docUid===this.document.uid&&(this.subscribed=!1)},window.addEventListener("document-unsubscribed",this.documentUnsubscribedHandler),this.addEventListener("click",this._toggle)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("document-unsubscribed",this.documentUnsubscribedHandler),this.documentUnsubscribedHandler=null}_isAvailable(e){return e&&!e.isVersion}_toggle(){this.subscribed?this.$.opUnsubscribe.execute().then(()=>{this.dispatchEvent(new CustomEvent("document-unsubscribed",{composed:!0,bubbles:!0,detail:{doc:this.document}})),this.subscribed=!1}):this.$.opSubscribe.execute().then(()=>{this.dispatchEvent(new CustomEvent("document-subscribed",{composed:!0,bubbles:!0,detail:{doc:this.document}})),this.subscribed=!0})}_computeLabel(e){return this.i18n(`notificationsToggleButton.tooltip.${e?"doNotNotify":"notify"}`)}_documentChanged(){this.subscribed=this.isSubscribed(this.document)}}customElements.define(t.is,t),Nuxeo.NotificationsToggleButton=t}/**
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
*/{class t extends d([E,m],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles">
          .horizontal {
            @apply --layout-horizontal;
            @apply --layout-center;
            @apply --layout-justified;
          }

          .selected {
            color: var(--nuxeo-primary-color, #0066ff);
            pointer-events: none;
          }

          iron-icon {
            cursor: pointer;
            margin: 20px 0 0 10px;
          }

          iron-icon:hover {
            color: var(--nuxeo-primary-color, #0066ff);
          }

          nuxeo-input {
            cursor: text;
            overflow: hidden;
            @apply --layout-flex;
          }
        </style>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" on-click="_toggleDialog">
              <paper-icon-button id="shareBtn" icon="[[icon]]" noink aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>

        <nuxeo-dialog id="dialog" with-backdrop>
          <div>
            <h2>[[i18n('shareButton.dialog.heading')]]</h2>
          </div>
          <div id="permanent" class="horizontal">
            <nuxeo-input
              id="permalink"
              label="[[i18n('shareButton.link.label', document.properties.dc:title)]]"
              value="[[_buildPermalink(document)]]"
              readonly
            >
            </nuxeo-input>
            <iron-icon id="permalinkIcon" name="permalinkIcon" icon="link" on-tap="_copyLink"></iron-icon>
            <nuxeo-tooltip id="tooltip" for="permalinkIcon">[[i18n('shareButton.operation.copy')]]</nuxeo-tooltip>
          </div>

          <div class="buttons">
            <paper-button dialog-dismiss class="primary">[[i18n('shareButton.dialog.close')]]</paper-button>
          </div>
        </nuxeo-dialog>
      `}static get is(){return"nuxeo-share-button"}static get properties(){return{document:Object,icon:{type:String,value:"nuxeo:share"},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(i18n)"}}}_isAvailable(e){return e}_computeLabel(){return this.i18n("shareButton.tooltip")}_toggleDialog(){this.$.dialog.toggle()}_buildPermalink(e){return e?`${window.location.origin+window.location.pathname}#!/doc/${e.uid}`:""}_copyLink(e){const o=e.currentTarget,n=o.previousElementSibling;n.$.paperInput.$.nativeInput.select(),window.document.execCommand("copy")&&(o._debouncer=_e.debounce(o._debouncer,ye.after(2e3),()=>{n.$.paperInput.$.nativeInput.setSelectionRange(0,0),n.$.paperInput.blur(),o.set("icon","link"),o.classList.remove("selected")}),o.set("icon","check"),o.classList.add("selected"),this.notify({message:this.i18n("shareButton.operation.copied"),duration:2e3}))}}customElements.define(t.is,t),Nuxeo.ShareButton=t}/**
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
*/{class t extends d([m,h],Nuxeo.Element){static get template(){return a`
        <style include="nuxeo-action-button-styles nuxeo-button-styles"></style>

        <nuxeo-operation id="operation" op="Document.Untrash" input="[[document.uid]]" sync-indexing> </nuxeo-operation>

        <dom-if if="[[_isAvailable(document)]]">
          <template>
            <div class="action" on-click="_untrash">
              <paper-icon-button icon="[[icon]]" noink id="untrashButton" aria-labelledby="label"></paper-icon-button>
              <span class="label" hidden$="[[!showLabel]]" id="label">[[_label]]</span>
              <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
            </div>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-untrash-document-button"}static get properties(){return{document:Object,icon:{type:String,value:"nuxeo:restore-deleted"},showLabel:{type:Boolean,value:!1},_label:{type:String,computed:"_computeLabel(i18n)"}}}_isAvailable(e){return e&&this.isTrashed(e)&&this.hasPermission(e,"Write")}_computeLabel(){return this.i18n("untrashButton.tooltip")}_untrash(){this.$.operation.execute().then(e=>{this.dispatchEvent(new CustomEvent("document-untrashed",{composed:!0,bubbles:!0,detail:{doc:e}}))}).catch(e=>{this.dispatchEvent(new CustomEvent("document-untrashed",{composed:!0,bubbles:!0,detail:{error:e}}))})}}customElements.define(t.is,t),Nuxeo.UntrashDocumentButton=t}const we=""+new URL("nuxeo-elements-catalog-36Bbx5oh.svg",import.meta.url).href,{action:r}=__STORYBOOK_MODULE_ACTIONS__,S=new fe().setFileContent("Nuxeo Logo",we).setPermissions(["Write","ManageWorkflows"]),i=[S.build(),S.build(),S.build()],Be=ke.nuxeo,b=window.nuxeo.mock;b.respondWith("POST","/api/v1/automation/Document.AddToFavorites",i[0]);b.respondWith("POST","/api/v1/automation/Document.RemoveFromFavorites",i[0]);b.respondWith("POST","/api/v1/automation/Blob.RemoveFromDocument",i[0]);b.respondWith("POST","/api/v1/automation/Document.Lock",i[0]);b.respondWith("POST","/api/v1/automation/Document.Unlock",i[0]);b.respondWith("POST","/api/v1/automation/Document.Subscribe",i[0]);b.respondWith("POST","/api/v1/automation/Document.Unsubscribe",i[0]);b.respondWith("POST","/api/v1/automation/Document.Untrash",i[0]);const ut={title:"UI/Actions"},g={render:()=>c`
    <nuxeo-add-to-collection-button
      @click=${r("clicked")}
      .document="${i[0]}"
    ></nuxeo-add-to-collection-button>
  `},x={render:()=>c`
    <nuxeo-delete-blob-button @click=${r("clicked")} .document="${i[0]}"> </nuxeo-delete-blob-button>
  `},f={render:()=>c`
    <nuxeo-delete-document-button @click=${r("clicked")} .document="${i[0]}">
    </nuxeo-delete-document-button>
  `},_={render:()=>c`
    <nuxeo-download-button @click=${r("clicked")} .document="${i[0]}"> </nuxeo-download-button>
  `},y={render:()=>c`
    <nuxeo-export-button @click=${r("clicked")} .document="${i[0]}"> </nuxeo-export-button>
  `},k={args:{favorite:!1,activatedColor:"#00aded"},argTypes:{activatedColor:{control:"color",name:"--nuxeo-action-color-activated"}},render:t=>c`
    <style>
      * {
        --nuxeo-action-color-activated: ${t.activatedColor};
      }
    </style>
    <nuxeo-favorites-toggle-button @click=${r("clicked")} .document="${i[0]}" ?favorite="${t.favorite}">
    </nuxeo-favorites-toggle-button>
  `},D={args:{href:"https://nuxeo.com",icon:"nuxeo:add",label:"Nuxeo",showLabel:!1},argTypes:{icon:{control:"select",options:Be}},render:t=>c`
    <nuxeo-link-button
      @click=${r("clicked")}
      href="${t.href}"
      icon="${t.icon}"
      label="${t.label}"
      ?show-label="${t.showLabel}"
    ></nuxeo-link-button>
  `},w={args:{locked:!1},render:t=>c`
    <nuxeo-lock-toggle-button @click=${r("clicked")} .document="${i[0]}" ?locked=${t.locked}>
    </nuxeo-lock-toggle-button>
  `},B={render:()=>c`
    <nuxeo-move-documents-down-button
      @click=${r("clicked")}
      .documents="${i}"
      .selectedDocuments="${[i[1]]}"
    >
    </nuxeo-move-documents-down-button>
  `},$={render:()=>c`
    <nuxeo-move-documents-up-button
      @click=${r("clicked")}
      .documents="${i}"
      .selectedDocuments="${[i[1]]}"
    >
    </nuxeo-move-documents-up-button>
  `},z={args:{subscribed:!1,activatedColor:"#00aded"},argTypes:{activatedColor:{control:"color",name:"--nuxeo-action-color-activated"}},render:t=>c`
    <style>
      * {
        --nuxeo-action-color-activated: ${t.activatedColor};
      }
    </style>
    <nuxeo-notifications-toggle-button
      @click=${r("clicked")}
      .document="${i[0]}"
      ?subscribed=${t.subscribed}
    >
    </nuxeo-notifications-toggle-button>
  `},L={render:()=>c`
    <nuxeo-share-button @click=${r("clicked")} .document="${i[0]}"> </nuxeo-share-button>
  `},C={render:()=>{const t=new fe().setSystemProperties({isTrashed:!0}).setPermissions(["Write","ManageWorkflows"]).build();return c`
      <nuxeo-untrash-document-button @click=${r("clicked")} .document="${t}">
      </nuxeo-untrash-document-button>
    `}};var N,O,U;g.parameters={...g.parameters,docs:{...(N=g.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-add-to-collection-button
      @click=\${action('clicked')}
      .document="\${DOCUMENTS[0]}"
    ></nuxeo-add-to-collection-button>
  \`
}`,...(U=(O=g.parameters)==null?void 0:O.docs)==null?void 0:U.source}}};var A,H,F;x.parameters={...x.parameters,docs:{...(A=x.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-delete-blob-button @click=\${action('clicked')} .document="\${DOCUMENTS[0]}"> </nuxeo-delete-blob-button>
  \`
}`,...(F=(H=x.parameters)==null?void 0:H.docs)==null?void 0:F.source}}};var P,V,I;f.parameters={...f.parameters,docs:{...(P=f.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-delete-document-button @click=\${action('clicked')} .document="\${DOCUMENTS[0]}">
    </nuxeo-delete-document-button>
  \`
}`,...(I=(V=f.parameters)==null?void 0:V.docs)==null?void 0:I.source}}};var R,W,q;_.parameters={..._.parameters,docs:{...(R=_.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-download-button @click=\${action('clicked')} .document="\${DOCUMENTS[0]}"> </nuxeo-download-button>
  \`
}`,...(q=(W=_.parameters)==null?void 0:W.docs)==null?void 0:q.source}}};var j,X,K;y.parameters={...y.parameters,docs:{...(j=y.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-export-button @click=\${action('clicked')} .document="\${DOCUMENTS[0]}"> </nuxeo-export-button>
  \`
}`,...(K=(X=y.parameters)==null?void 0:X.docs)==null?void 0:K.source}}};var Y,G,J;k.parameters={...k.parameters,docs:{...(Y=k.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  args: {
    favorite: false,
    activatedColor: '#00aded'
  },
  argTypes: {
    activatedColor: {
      control: 'color',
      name: '--nuxeo-action-color-activated'
    }
  },
  render: args => html\`
    <style>
      * {
        --nuxeo-action-color-activated: \${args.activatedColor};
      }
    </style>
    <nuxeo-favorites-toggle-button @click=\${action('clicked')} .document="\${DOCUMENTS[0]}" ?favorite="\${args.favorite}">
    </nuxeo-favorites-toggle-button>
  \`
}`,...(J=(G=k.parameters)==null?void 0:G.docs)==null?void 0:J.source}}};var Q,Z,ee;D.parameters={...D.parameters,docs:{...(Q=D.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    href: 'https://nuxeo.com',
    icon: 'nuxeo:add',
    label: 'Nuxeo',
    showLabel: false
  },
  argTypes: {
    icon: {
      control: 'select',
      options: listOfIcons
    }
  },
  render: args => html\`
    <nuxeo-link-button
      @click=\${action('clicked')}
      href="\${args.href}"
      icon="\${args.icon}"
      label="\${args.label}"
      ?show-label="\${args.showLabel}"
    ></nuxeo-link-button>
  \`
}`,...(ee=(Z=D.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var te,oe,ne;w.parameters={...w.parameters,docs:{...(te=w.parameters)==null?void 0:te.docs,source:{originalSource:`{
  args: {
    locked: false
  },
  render: args => html\`
    <nuxeo-lock-toggle-button @click=\${action('clicked')} .document="\${DOCUMENTS[0]}" ?locked=\${args.locked}>
    </nuxeo-lock-toggle-button>
  \`
}`,...(ne=(oe=w.parameters)==null?void 0:oe.docs)==null?void 0:ne.source}}};var ie,se,ae;B.parameters={...B.parameters,docs:{...(ie=B.parameters)==null?void 0:ie.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-move-documents-down-button
      @click=\${action('clicked')}
      .documents="\${DOCUMENTS}"
      .selectedDocuments="\${[DOCUMENTS[1]]}"
    >
    </nuxeo-move-documents-down-button>
  \`
}`,...(ae=(se=B.parameters)==null?void 0:se.docs)==null?void 0:ae.source}}};var ce,re,le;$.parameters={...$.parameters,docs:{...(ce=$.parameters)==null?void 0:ce.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-move-documents-up-button
      @click=\${action('clicked')}
      .documents="\${DOCUMENTS}"
      .selectedDocuments="\${[DOCUMENTS[1]]}"
    >
    </nuxeo-move-documents-up-button>
  \`
}`,...(le=(re=$.parameters)==null?void 0:re.docs)==null?void 0:le.source}}};var ue,de,pe;z.parameters={...z.parameters,docs:{...(ue=z.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  args: {
    subscribed: false,
    activatedColor: '#00aded'
  },
  argTypes: {
    activatedColor: {
      control: 'color',
      name: '--nuxeo-action-color-activated'
    }
  },
  render: args => html\`
    <style>
      * {
        --nuxeo-action-color-activated: \${args.activatedColor};
      }
    </style>
    <nuxeo-notifications-toggle-button
      @click=\${action('clicked')}
      .document="\${DOCUMENTS[0]}"
      ?subscribed=\${args.subscribed}
    >
    </nuxeo-notifications-toggle-button>
  \`
}`,...(pe=(de=z.parameters)==null?void 0:de.docs)==null?void 0:pe.source}}};var me,he,be;L.parameters={...L.parameters,docs:{...(me=L.parameters)==null?void 0:me.docs,source:{originalSource:`{
  render: () => html\`
    <nuxeo-share-button @click=\${action('clicked')} .document="\${DOCUMENTS[0]}"> </nuxeo-share-button>
  \`
}`,...(be=(he=L.parameters)==null?void 0:he.docs)==null?void 0:be.source}}};var ve,ge,xe;C.parameters={...C.parameters,docs:{...(ve=C.parameters)==null?void 0:ve.docs,source:{originalSource:`{
  render: () => {
    const DOCUMENT_TRASHED = new DocumentBuilder().setSystemProperties({
      isTrashed: true
    }).setPermissions(['Write', 'ManageWorkflows']).build();
    return html\`
      <nuxeo-untrash-document-button @click=\${action('clicked')} .document="\${DOCUMENT_TRASHED}">
      </nuxeo-untrash-document-button>
    \`;
  }
}`,...(xe=(ge=C.parameters)==null?void 0:ge.docs)==null?void 0:xe.source}}};const dt=["NuxeoAddToCollectionButton","NuxeoDeleteBlobButton","NuxeoDeleteDocumentButton","NuxeoDownloadButton","NuxeoExportButton","NuxeoFavoritesToggleButton","NuxeoLinkButton","NuxeoLockToggleButton","NuxeoMoveDocumentsDownButton","NuxeoMoveDocumentsUpButton","NuxeoNotificationsToggleButton","NuxeoShareButton","NuxeoUntrashDocumentButton"];export{g as NuxeoAddToCollectionButton,x as NuxeoDeleteBlobButton,f as NuxeoDeleteDocumentButton,_ as NuxeoDownloadButton,y as NuxeoExportButton,k as NuxeoFavoritesToggleButton,D as NuxeoLinkButton,w as NuxeoLockToggleButton,B as NuxeoMoveDocumentsDownButton,$ as NuxeoMoveDocumentsUpButton,z as NuxeoNotificationsToggleButton,L as NuxeoShareButton,C as NuxeoUntrashDocumentButton,dt as __namedExportsOrder,ut as default};
