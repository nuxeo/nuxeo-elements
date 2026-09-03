import"./iron-flex-layout-CQAobW0V.js";import"./iron-icon-lX3uy4jx.js";import"./nuxeo-dialog-B7wOaaIF.js";import"./paper-icon-button-BQJYUoC5.js";import{P as q,h as p,m as _,N as C,b as D}from"./iframe-T5hUCbnt.js";import"./typography-Bj6IP4r5.js";import{P as E}from"./paper-item-behavior-BIRtwU7m.js";import"./paper-textarea-Cfq8k5ev.js";import"./paper-menu-button-Sy7r6r-j.js";import"./nuxeo-tooltip-BrXDqAUB.js";import{F as R}from"./nuxeo-format-behavior-qyIFGuqE.js";import{a as h}from"./render-status-BJmzACxi.js";import{v as a}from"./v4-BT9YOjd5.js";import{a as w}from"./analysis-BiUYXUaq.js";import"./paper-material-styles-B1vejkc1.js";import"./shadow-B1sjh-5Q.js";import"./paper-ripple-e9CBUXzz.js";import"./iron-a11y-keys-behavior-CQeU5Yru.js";import"./paper-inky-focus-behavior-BFu4CTGP.js";import"./neon-animation-runner-behavior-mf0Oh3zj.js";import"./iron-resizable-behavior-BJTBE6_U.js";import"./default-theme-RhyFn9QU.js";import"./templatizer-behavior-BRsvGg6D.js";import"./preload-helper-Dp1pzeXC.js";import"./roboto-AfkCeElV.js";import"./iron-validatable-behavior-DVOrdGp7.js";import"./paper-input-behavior-BtXc_mnC.js";import"./iron-menu-behavior-BQTarcVj.js";import"./moment-with-locales-v-Wg38Ha.js";import"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/q({_template:p`
    <style include="paper-item-shared-styles"></style>
    <style>
      :host {
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --paper-font-subhead;

        @apply --paper-item;
        @apply --paper-icon-item;
      }

      .content-icon {
        @apply --layout-horizontal;
        @apply --layout-center;

        width: var(--paper-item-icon-width, 56px);
        @apply --paper-item-icon;
      }
    </style>

    <div id="contentIcon" class="content-icon">
      <slot name="item-icon"></slot>
    </div>
    <slot></slot>
`,is:"paper-icon-item",behaviors:[E]});/**
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
*/const I=p`
  <dom-module id="nuxeo-document-comments-styles">
    <template>
      <style>
        :host {
          display: block;
        }

        .horizontal {
          @apply --layout-horizontal;
        }

        .main-option {
          height: 1.5em;
          width: 1.5em;
          cursor: pointer;
        }

        .more-content {
          color: var(--nuxeo-comment-more-content-color, #1f28bf);
        }

        .no-selection {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .comment-iron-icon {
          margin: 0;
          padding: 0;
          background-color: transparent;
          border: none;
          color: inherit;
        }

        .opaque {
          opacity: 0.5;
        }

        .pointer {
          cursor: pointer;
        }

        .input-area {
          margin: 5px 0;

          @apply --layout-horizontal;
          @apply --layout-end;
        }

        .smaller {
          font-size: 0.86em;
        }

        paper-textarea {
          width: 100%;
          --paper-input-container-input: {
            font-size: 1em;
            line-height: var(--nuxeo-comment-line-height, 20px);
          }

          --iron-autogrow-textarea-placeholder: {
            color: var(--nuxeo-comment-placeholder-color, #939caa);
            font-size: 0.86em;
          }
        }
      </style>
    </template>
  </dom-module>
`;document.head.appendChild(I.content);/**
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
*/{class o extends _([C,R],Nuxeo.Element){static get template(){return p`
        <style include="nuxeo-document-comments-styles"></style>

        <nuxeo-resource id="commentRequest" path="/id/[[uid]]/@comment/"></nuxeo-resource>

        <dom-if if="[[_moreAvailable(comments.length, total, allCommentsLoaded)]]">
          <template>
            <span class="more-content no-selection pointer smaller" on-tap="_loadMore"
              >[[_computeTextLabel(level, 'loadAll', total, i18n)]]</span
            >
          </template>
        </dom-if>
        <dom-repeat id="commentList" items="[[comments]]" as="comment">
          <template>
            <nuxeo-document-comment comment="{{comment}}" level="[[level]]"></nuxeo-document-comment>
          </template>
        </dom-repeat>

        <dom-if if="[[_allowReplies(level)]]" on-dom-change="_syncInputAccessibleName">
          <template>
            <div class="input-area">
              <paper-textarea
                id="inputContainer"
                label="[[_computeTextLabel(level, 'label', null, i18n)]]"
                always-float-label
                placeholder="[[_computeTextLabel(level, 'writePlaceholder', null, i18n)]]"
                value="{{text}}"
                max-rows="[[_computeMaxRows()]]"
                on-keydown="_checkForEnter"
              >
              </paper-textarea>
              <dom-if if="[[!_isBlank(text)]]">
                <template>
                  <button
                    class="comment-iron-icon"
                    on-tap="_submitComment"
                    aria-label$="[[i18n('command.selectComment')]]"
                    disabled$="[[_isSubmitting]]"
                  >
                    <iron-icon
                      id="submit"
                      name="submit"
                      class="main-option opaque"
                      icon="check"
                      aria-hidden="true"
                    ></iron-icon>
                  </button>
                  <nuxeo-tooltip for="submit">[[i18n('comments.submit.tooltip')]]</nuxeo-tooltip>
                  <button
                    class="comment-iron-icon"
                    on-tap="_clearInput"
                    aria-label$="[[i18n('command.removeComment')]]"
                  >
                    <iron-icon name="clear" class="main-option opaque" icon="clear" aria-hidden="true"></iron-icon>
                  </button>
                </template>
              </dom-if>
            </div>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-document-comment-thread"}static get observers(){return["_syncInputAccessibleName(level, i18n)"]}static get properties(){return{uid:{type:String,observer:"_refresh"},_isSubmitting:{type:Boolean,value:!1},comments:{type:Array,value(){return[]}},level:{type:Number,value:1},pageSize:{type:Number,readOnly:!0,value:10},allCommentsLoaded:{type:Boolean,readOnly:!0,reflectToAttribute:!0,value:!1},total:{type:Number,readOnly:!0,value:0}}}connectedCallback(){super.connectedCallback(),this.addEventListener("delete-comment",this._handleDeleteEvent),this.addEventListener("edit-comment",this._handleEditEvent),this.addEventListener("comments-changed",this._handleCommentsChange)}disconnectedCallback(){this.removeEventListener("delete-comment",this._handleDeleteEvent),this.removeEventListener("edit-comment",this._handleEditEvent),this.removeEventListener("comments-changed",this._handleCommentsChange),super.disconnectedCallback()}focusInput(){this.$$("#inputContainer").focus()}_syncInputAccessibleName(){const e=this.$$("#inputContainer");e&&e.inputElement&&(e.inputElement.label=this._computeTextLabel(this.level,"label"))}_checkForEnter(e){e.keyCode===13&&e.ctrlKey&&!this._isBlank(this.text)&&this._submitComment()}_clearInput(){this.text=""}_clearRequest(){this.$.commentRequest.data={},this.$.commentRequest.headers={},this.$.commentRequest.params={}}_fetchComments(e){this._clearRequest(),this.$.commentRequest.params={pageSize:e?0:this.pageSize,currentPageIndex:0},this.$.commentRequest.headers={"fetch-comment":"repliesSummary,author"},this.$.commentRequest.get().then(t=>{const n=this.comments.length>0?this.comments[0]:null,i=t.entries;for(;i.length>0&&n&&(i[0].creationDate>n.creationDate||i[0].id===n.id);)i.shift();t.entries.forEach(r=>{this.unshift("comments",r)}),this._setTotal(t.totalSize),this._setAllCommentsLoaded(!!e)}).catch(t=>{if(t.status===404)this.notify({message:this._computeTextLabel(this.level,"notFound")});else throw this.notify({message:this._computeTextLabel(this.level,"fetch.error")}),t})}_getCommentIndexById(e){return this.comments.findIndex(t=>t.id===e)}_handleCommentsChange(e){e.detail.path==="comments.length"&&this.dispatchEvent(new CustomEvent("number-of-replies",{composed:!0,bubbles:!0,detail:{total:this.comments.length}}))}_handleDeleteEvent(e){const t=this._getCommentIndexById(e.detail.commentId);t!==-1&&(this.splice("comments",t,1),this._setTotal(this.total-1)),e.stopPropagation()}_handleEditEvent(e){const t=this._getCommentIndexById(e.detail.commentId);t!==-1&&(this.set(`comments.${t}.modificationDate`,e.detail.modificationDate),this.set(`comments.${t}.text`,e.detail.text)),e.stopPropagation()}_loadMore(){this._fetchComments(!0)}_refresh(){this.set("comments",[]),this._fetchComments(this.allCommentsLoaded)}_submitComment(e){e&&e.preventDefault(),!this._isSubmitting&&(this._isSubmitting=!0,this._clearRequest(),this.$.commentRequest.headers={"fetch-comment":"author"},this.$.commentRequest.data={"entity-type":"comment",parentId:this.uid,text:this.text.trim()},this.$.commentRequest.post().then(t=>{this._clearInput(),this.push("comments",t),this._setTotal(this.total+1)}).catch(t=>{if(t.status===404)this.notify({message:this._computeTextLabel(this.level,"notFound")});else throw this.notify({message:this._computeTextLabel(this.level,"creation.error")}),t}).finally(()=>{this._isSubmitting=!1}))}_computeMaxRows(){const e=parseFloat(this.getComputedStyleValue("--nuxeo-comment-line-height")),t=parseFloat(this.getComputedStyleValue("--nuxeo-comment-max-height"));return Math.round((Number.isNaN(t)?80:t)/(Number.isNaN(e)?20:e))}_computeTextLabel(e,t,n){return e===1?this.i18n(`comments.${t}.comment`,n):this.i18n(`comments.${t}.reply`,n)}_allowReplies(e){return e<=2}_isBlank(e){return!e||typeof e!="string"||e.trim().length===0}_moreAvailable(e,t,n){return e<t&&!n}}customElements.define(o.is,o)}/**
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
*/{class o extends _([C,R],Nuxeo.Element){static get template(){return p`
        <style include="nuxeo-document-comments-styles nuxeo-button-styles">
          :host {
            margin-top: 5px;
          }

          .author {
            font-weight: bold;
            margin-right: 5px;
          }

          :host([dir='rtl']) .author {
            margin-left: 5px;
          }

          .info {
            margin-left: 10px;
            @apply --layout-vertical;
            @apply --layout-flex;
          }

          .separator {
            margin: 0 5px;
          }

          .text {
            display: inline;
          }

          .text span {
            white-space: pre-wrap;
          }

          iron-icon.disabled {
            pointer-events: none;
            opacity: 0.4;
          }

          paper-menu-button {
            --paper-menu-button: {
              padding: 0;
            }
          }

          paper-listbox {
            --paper-listbox: {
              padding: 0;
            }
          }

          paper-icon-button {
            opacity: 0.5;
            --paper-icon-button: {
              padding: 0;
            }
          }

          paper-icon-item {
            --paper-icon-item: {
              padding: 5px 5px;
              display: flex;
              cursor: pointer;
            }

            --paper-item-min-height: 24px;

            --paper-item-icon: {
              width: 1.75em;
              margin-right: 10px;
            }

            --paper-item-selected-weight: normal;

            --paper-item-focused-before: {
              background-color: transparent;
            }

            &[name='edit']:focus,
            &[name='delete']:focus {
              outline: auto;
            }

            .replybtn {
              height: 1em;
              width: 0.2em;
              border: none;
            }
          }
        </style>

        <nuxeo-connection id="nxcon" user="{{currentUser}}"></nuxeo-connection>
        <nuxeo-resource id="commentRequest" path="/id/[[comment.parentId]]/@comment/[[comment.id]]"></nuxeo-resource>

        <nuxeo-dialog id="dialog" with-backdrop>
          <h2>[[i18n('comments.deletion.dialog.heading')]]</h2>
          <div>[[_computeConfirmationLabel(comment.numberOfReplies)]]</div>
          <div class="buttons">
            <paper-button name="dismiss" dialog-dismiss class="secondary"
              >[[i18n('comments.deletion.dialog.buttons.cancel')]]</paper-button
            >
            <paper-button name="confirm" dialog-confirm on-click="_deleteComment" class="primary"
              >[[i18n('comments.deletion.dialog.buttons.delete')]]</paper-button
            >
          </div>
        </nuxeo-dialog>

        <dom-if if="[[comment]]">
          <template>
            <div id="content" class="horizontal">
              <nuxeo-user-avatar
                user="[[comment.author]]"
                height="[[_computeAvatarDimensions(level)]]"
                width="[[_computeAvatarDimensions(level)]]"
                border-radius="50"
                font-size="[[_computeAvatarFontSize(level)]]"
              >
              </nuxeo-user-avatar>
              <div class="info">
                <div id="body">
                  <div id="header" class="horizontal">
                    <span class="author">[[_authorLabel(comment.author)]]</span>
                    <span class="smaller opaque"
                      >[[_computeDateLabel(comment, comment.creationDate, comment.modificationDate, i18n)]]</span
                    >
                    <dom-if if="[[_areExtendedOptionsAvailable(comment.author, currentUser)]]">
                      <template>
                        <paper-menu-button
                          id="options"
                          vertical-align="top"
                          horizontal-align="right"
                          no-animations
                          close-on-activate
                        >
                          <paper-icon-button
                            class="main-option"
                            icon="more-vert"
                            slot="dropdown-trigger"
                            aria-label$="[[i18n('command.menu')]]"
                          >
                          </paper-icon-button>
                          <paper-listbox slot="dropdown-content">
                            <paper-icon-item name="edit" class="smaller no-selection" on-tap="_editComment">
                              <iron-icon icon="nuxeo:edit" slot="item-icon"></iron-icon>
                              <span>[[i18n('comments.options.edit')]]</span>
                            </paper-icon-item>
                            <paper-icon-item
                              name="delete"
                              class="smaller no-selection"
                              on-tap="_toggleDeletionConfirmation"
                            >
                              <iron-icon icon="nuxeo:delete" slot="item-icon"></iron-icon>
                              <span>[[i18n('comments.options.delete')]]</span>
                            </paper-icon-item>
                          </paper-listbox>
                        </paper-menu-button>
                      </template>
                    </dom-if>
                  </div>
                  <dom-if if="[[!editing]]">
                    <template>
                      <div id="view-area" class="text">
                        <span
                          id="view-comment"
                          inner-h-t-m-l="[[_computeTextToDisplay(comment.text, maxChars, truncated)]]"
                        ></span>
                        <dom-if if="[[truncated]]">
                          <template>
                            <span class="smaller opaque pointer" on-tap="_showFullComment"
                              >[[i18n('comments.showAll')]]</span
                            >
                          </template>
                        </dom-if>
                        <dom-if if="[[!truncated]]">
                          <template>
                            <paper-icon-button
                              tabindex="0"
                              name="reply"
                              class="main-option opaque"
                              icon="reply"
                              aria-hidden="true"
                              on-tap="_reply"
                              on-keydown="_handleKey"
                              hidden$="[[!_isRootElement(level)]]"
                              tabindex="0"
                              role="button"
                              aria-label="[[i18n('command.replyComment')]]"
                            >
                            </paper-icon-button>
                          </template>
                        </dom-if>
                      </div>
                    </template>
                  </dom-if>
                  <dom-if if="[[editing]]">
                    <template>
                      <div class="input-area">
                        <paper-textarea
                          id="inputContainer"
                          placeholder="[[_computeTextLabel(level, 'writePlaceholder', null, i18n)]]"
                          value="{{text}}"
                          max-rows="[[_computeMaxRows()]]"
                          no-label-float
                          on-keydown="_checkForEnter"
                        >
                        </paper-textarea>
                        <dom-if if="[[!_isBlank(text)]]">
                          <template>
                            <iron-icon
                              id="submit"
                              role="button"
                              aria-label="[[i18n('command.selectComment')]]"
                              name="submit"
                              class$="main-option opaque [[_computeDisabledClass(_isSubmitting)]]"
                              icon="check"
                              on-tap="_submitComment"
                              on-keydown="_submitOnEnter"
                              tabindex="0"
                            ></iron-icon>
                            <nuxeo-tooltip for="submit">[[i18n('comments.submit.tooltip')]]</nuxeo-tooltip>
                            <iron-icon
                              name="clear"
                              role="button"
                              aria-label="[[i18n('command.removeComment')]]"
                              class="main-option opaque"
                              icon="clear"
                              role="button"
                              on-tap="_clearInput"
                              on-keydown="_cancelOnEnter"
                              tabindex="0"
                            ></iron-icon>
                          </template>
                        </dom-if>
                      </div>
                    </template>
                  </dom-if>
                  <dom-if if="[[_isSummaryVisible(comment.expanded, comment.numberOfReplies)]]">
                    <template>
                      <div id="summary" class="horizontal smaller">
                        <span class="more-content pointer no-selection" on-tap="_expand"
                          >[[i18n('comments.numberOfReplies', comment.numberOfReplies)]]</span
                        >
                        <span class="separator opaque">•</span>
                        <span class="opaque"
                          >[[_computeDateLabel(comment, 'lastReplyDate', comment.lastReplyDate, i18n)]]</span
                        >
                      </div>
                    </template>
                  </dom-if>
                </div>

                <dom-if if="[[comment.expanded]]">
                  <template>
                    <nuxeo-document-comment-thread id="thread" uid="[[comment.id]]" level="[[_computeSubLevel(level)]]">
                    </nuxeo-document-comment-thread>
                  </template>
                </dom-if>
              </div>
            </div>
          </template>
        </dom-if>
      `}static get is(){return"nuxeo-document-comment"}static get properties(){return{comment:{type:Object},level:{type:Number,value:1},truncated:{type:Boolean,computed:"_computeTruncatedFlag(comment.showFull, comment.text,  maxChars)"},maxChars:{type:Number,readOnly:!0,value:256},editing:{type:Boolean,readOnly:!0,reflectToAttribute:!0,value:!1}}}connectedCallback(){if(super.connectedCallback(),!this.hasAttribute("dir")){const e=document.documentElement.getAttribute("dir");this.setAttribute("dir",e)}this.addEventListener("number-of-replies",this._handleRepliesChange),this.text=this.comment&&this.comment.text}disconnectedCallback(){this.removeEventListener("number-of-replies",this._handleRepliesChange),super.disconnectedCallback()}_checkForEnter(e){e.keyCode===13&&e.ctrlKey&&!this._isBlank(this.comment.text)&&this._submitComment()}_clearInput(){this._setEditing(!1),this.text=this.comment.text}_deleteComment(){this.$.commentRequest.data={},this.$.commentRequest.remove().then(()=>{this.dispatchEvent(new CustomEvent("delete-comment",{composed:!0,bubbles:!0,detail:{commentId:this.comment.id}}))}).catch(e=>{if(e.status===404)this.notify({message:this._computeTextLabel(this.level,"notFound")});else throw this.notify({message:this._computeTextLabel(this.level,"deletion.error")}),e})}_submitOnEnter(e){e.key==="Enter"&&this._submitComment()}_cancelOnEnter(e){e.key==="Enter"&&this._clearInput()}_editComment(){this._setEditing(!0),this.set("comment.text",this.$$("#view-comment").innerHTML),this.text=this.get("comment.text"),h(this,function(){this.$$("#inputContainer").focus()})}_expand(){this.set("comment.expanded",!0)}_handleRepliesChange(e){const t=e.detail.total;t===0&&this.set("comment.expanded",!1),this.set("comment.numberOfReplies",t),e.stopPropagation()}_reply(){this.comment.expanded||this._expand(),h(this,function(){this.$$("#thread").focusInput()})}_handleKey(e){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),this._reply())}_showFullComment(){this.set("comment.showFull",!0)}_computeDisabledClass(e){return e?"disabled":""}_submitComment(e){if(e&&e.preventDefault(),this._isSubmitting)return;this._isSubmitting=!0;const t=this.$$("#inputContainer");if(!t||this._isBlank(t.value)){this._isSubmitting=!1;return}this.$.commentRequest.data={"entity-type":"comment",parentId:this.comment.parentId,text:this.$$("#inputContainer").value.trim()},this.$.commentRequest.put().then(n=>{this.dispatchEvent(new CustomEvent("edit-comment",{composed:!0,bubbles:!0,detail:{commentId:this.comment.id,modificationDate:n.modificationDate,text:n.text}})),this.text=n.text,this.set("comment.modificationDate",n.modificationDate),this.set("comment.text",n.text),this._clearInput()}).catch(n=>{if(n.status===404)this.notify({message:this._computeTextLabel(this.level,"notFound")});else throw this.notify({message:this._computeTextLabel(this.level,"edition.error")}),n}).finally(()=>{this._isSubmitting=!1})}_toggleDeletionConfirmation(){this.$.dialog.toggle()}_computeAvatarDimensions(e){return this._isRootElement(e)?24:20}_computeAvatarFontSize(e){return this._isRootElement(e)?13:11}_computeConfirmationLabel(e){return this.i18n(`comments.deletion.dialog.message.${e>0?"withReplies":"withoutReplies"}`)}_computeDateLabel(e,t){if(e){let n=this.formatDate(e.creationDate,"relative");return t==="lastReplyDate"?(n=this.formatDate(e.lastReplyDate,"relative"),this.i18n("comments.lastReply",n)):e.modificationDate?this.i18n("comments.edited",n):n}}_computeMaxRows(){const e=parseFloat(this.getComputedStyleValue("--nuxeo-comment-line-height")),t=parseFloat(this.getComputedStyleValue("--nuxeo-comment-max-height"));return Math.round((Number.isNaN(t)?80:t)/(Number.isNaN(e)?20:e))}_computeSubLevel(e){return e+1}_computeTextLabel(e,t,n){return e===1?this.i18n(`comments.${t}.comment`,n):this.i18n(`comments.${t}.reply`,n)}_computeTextToDisplay(e,t,n){let i=e;return n&&(i=`${e.substring(0,t-1)}…`),i}_computeTruncatedFlag(e,t,n){return!e&&typeof t=="string"&&t.length>n}_areExtendedOptionsAvailable(e,t){const n=this._authorUsername(e);return t&&(t.properties&&t.properties.username===n||t.isAdministrator)}_isAuthorEntity(e){return e==null||typeof e!="object"?!1:e["entity-type"]==="user"||e["entity-type"]==="document"&&e.type==="user"}_authorStringFallback(e){return typeof e=="string"?e:e&&typeof e=="object"&&(e.id||e.uid)||""}_authorLabel(e){if(!e)return"";if(this._isAuthorEntity(e)){const t=e.properties||{},n=t.firstName||t["user:firstName"],i=t.lastName||t["user:lastName"],r=t.username||t["user:username"];return[n,i].filter(Boolean).join(" ").trim()||r||e.id||e.uid||""}return this._authorStringFallback(e)}_authorUsername(e){if(this._isAuthorEntity(e)){const t=e.properties||{};return t.username||t["user:username"]||e.id||e.uid||""}return this._authorStringFallback(e)}_isBlank(e){return!e||typeof e!="string"||e.trim().length===0}_isRootElement(e){return e===1}_isSummaryVisible(e,t){return!e&&t>0}}customElements.define(o.is,o)}const s=(o=new Date(new Date().getFullYear(),0,1),m=new Date)=>new Date(o.getTime()+Math.random()*(m.getTime()-o.getTime())),S=[{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:0,author:"John Doe",creationDate:s(),modificationDate:"2019-12-24T10:45:00.206Z",text:"This is a cool element!"},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:0,author:"Administrator",creationDate:s(),text:"I am here to keep this ordered..."},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:0,author:"Mary Poppins",creationDate:s(),text:`A comment containing a lots of characters:
Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum  sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut,`},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:0,author:"Arnold Schwarzenegger",creationDate:s(),modificationDate:void 0,text:"What the hell?"},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:0,author:"Mary Poppins",creationDate:s(),text:"Not sure if I got what you said last time."},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:5,lastReplyDate:new Date,author:"John Doe",creationDate:s(),text:`Let me create a big testing comment:

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum  sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut,`},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:0,author:"Administrator",creationDate:s(),text:"Everything seems fine."},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:2,lastReplyDate:new Date,author:"Cristiano Ronaldo",creationDate:s(),text:"Best! Top!"},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:0,author:"Arnold Schwarzenegger",creationDate:s(),modificationDate:void 0,text:"Strong!"},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:0,author:"Cristiano Ronaldo",creationDate:s(),text:"So, lets talk about soccer?"},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:0,author:"Mary Poppins",creationDate:s(),modificationDate:void 0,text:"What about music? Lets start a thread here."},{"entity-type":"comment",parentId:"doc-id",id:a(),numberOfReplies:0,author:"Chuck Norris",creationDate:s(),text:'Some of my jokes: "Chuck Norris can kill two stones with one bird."'}],N=S.sort((o,m)=>o.creationDate>m.creationDate?-1:1),l=N,d=window.nuxeo.mock;d.respondWith("delete",new RegExp(/\/api\/v1\/id\/(\S+)\/@comment\/(\S+)/));d.respondWith("get",new RegExp(/\/api\/v1\/id\/(\S+)\/@comment\//),({queryParams:o},m)=>{const e=m[0];if(e==="doc-id")return{entries:l.slice(0,o.pageSize===0?l.length:10),totalSize:l.length};const t=l.find(r=>r.id===e);if(!t)return{entries:[],totalSize:0};const n=[],i=l.filter(r=>r.numberOfReplies===0);for(let r=0;r<t.numberOfReplies;r++)n.push(i[Math.floor(Math.random()*i.length)]);return{entries:n,totalSize:t?t.numberOfReplies:l.length}});d.respondWith("post",new RegExp(/\/api\/v1\/id\/(\S+)\/@comment\//),({body:o})=>({"entity-type":"comment",parentId:o.parentId,id:a(),numberOfReplies:0,author:"Administrator",creationDate:new Date,text:o.text}));d.respondWith("put",new RegExp(/\/api\/v1\/id\/(\S+)\/@comment\/(\S+)/),({body:o},m)=>{const e=m[0],t=m[1];let n=l.find(i=>i.id===e&&i.parentId===t);return n||(n={"entity-type":"comment",parentId:e,id:t,numberOfReplies:0,author:"Administrator",creationDate:new Date}),n.modificationDate=new Date,n.text=o.text,n});const $=w("nuxeo-document-comment"),k=w("nuxeo-document-comment-thread"),le={title:"UI/Comments"},c={parameters:{docs:{description:{story:$.notes}}},args:{level:"1",hasReplies:!1,isTruncated:!1,moreContentColor:"#1f28bf",placeholderColor:"#939caa"},argTypes:{level:{control:"radio",options:["1","2"],name:"Comment Type"},moreContentColor:{control:"color",name:"--nuxeo-comment-more-content-color"},placeholderColor:{control:"color",name:"--nuxeo-comment-placeholder-color"}},render:o=>{const m=Object.assign({},l.find(e=>(o.hasReplies?e.numberOfReplies>0:e.numberOfReplies===0)&&(o.isTruncated?e.text.length>=256:e.text.length<256)));return D`
      <style>
        nuxeo-document-comment {
          --nuxeo-comment-more-content-color: ${o.moreContentColor};
          --nuxeo-comment-placeholder-color: ${o.placeholderColor};
        }
      </style>
      <nuxeo-document-comment .comment="${m}" .level="${Number(o.level)}"></nuxeo-document-comment>
    `}},u={parameters:{docs:{description:{story:k.notes}}},args:{moreContentColor:"#1f28bf",placeholderColor:"#939caa"},argTypes:{moreContentColor:{control:"color",name:"--nuxeo-comment-more-content-color"},placeholderColor:{control:"color",name:"--nuxeo-comment-placeholder-color"}},render:o=>D`
    <style>
      nuxeo-document-comment-thread {
        --nuxeo-comment-more-content-color: ${o.moreContentColor};
        --nuxeo-comment-placeholder-color: ${o.placeholderColor};
      }
    </style>
    <nuxeo-document-comment-thread uid="doc-id"></nuxeo-document-comment-thread>
  `};var f,b,g;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: commentAnalysis.notes
      }
    }
  },
  args: {
    level: '1',
    hasReplies: false,
    isTruncated: false,
    moreContentColor: '#1f28bf',
    placeholderColor: '#939caa'
  },
  argTypes: {
    level: {
      control: 'radio',
      options: ['1', '2'],
      name: 'Comment Type'
    },
    moreContentColor: {
      control: 'color',
      name: '--nuxeo-comment-more-content-color'
    },
    placeholderColor: {
      control: 'color',
      name: '--nuxeo-comment-placeholder-color'
    }
  },
  render: args => {
    const comment = Object.assign({}, commentsSample.find(entry => (args.hasReplies ? entry.numberOfReplies > 0 : entry.numberOfReplies === 0) && (args.isTruncated ? entry.text.length >= 256 : entry.text.length < 256)));
    return html\`
      <style>
        nuxeo-document-comment {
          --nuxeo-comment-more-content-color: \${args.moreContentColor};
          --nuxeo-comment-placeholder-color: \${args.placeholderColor};
        }
      </style>
      <nuxeo-document-comment .comment="\${comment}" .level="\${Number(args.level)}"></nuxeo-document-comment>
    \`;
  }
}`,...(g=(b=c.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var x,y,v;u.parameters={...u.parameters,docs:{...(x=u.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: threadAnalysis.notes
      }
    }
  },
  args: {
    moreContentColor: '#1f28bf',
    placeholderColor: '#939caa'
  },
  argTypes: {
    moreContentColor: {
      control: 'color',
      name: '--nuxeo-comment-more-content-color'
    },
    placeholderColor: {
      control: 'color',
      name: '--nuxeo-comment-placeholder-color'
    }
  },
  render: args => html\`
    <style>
      nuxeo-document-comment-thread {
        --nuxeo-comment-more-content-color: \${args.moreContentColor};
        --nuxeo-comment-placeholder-color: \${args.placeholderColor};
      }
    </style>
    <nuxeo-document-comment-thread uid="doc-id"></nuxeo-document-comment-thread>
  \`
}`,...(v=(y=u.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};const ce=["NuxeoDocumentComment","NuxeoDocumentCommentThread"];export{c as NuxeoDocumentComment,u as NuxeoDocumentCommentThread,ce as __namedExportsOrder,le as default};
