/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-resource.js';
import '../widgets/nuxeo-tooltip.js';
// eslint-disable-next-line import/no-cycle
import './nuxeo-document-comment.js';
import './nuxeo-document-comments-styles.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { FormatBehavior } from '../nuxeo-format-behavior.js';

/**
 * Element to represent a thread of comments for a specific document (thread's root) on Nuxeo.
 * It can represent multiple levels of comments and replies.
 *
 * Example:
 *
 *     <nuxeo-document-comment-thread uid="[[document.uid]]"></nuxeo-document-comment-thread>
 *
 * @appliesMixin FormatBehavior
 * @memberof Nuxeo
 * @demo https://nuxeo.github.io/nuxeo-elements/?path=/story/ui-nuxeo-document-comments--nuxeo-document-comment-thread
 */
{
  class DocumentCommentThread extends mixinBehaviors([FormatBehavior], Nuxeo.Element) {
    static get template() {
      return html`
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

        <dom-if if="[[_allowReplies(level)]]">
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
                    name="submit"
                    class="main-option opaque"
                    icon="check"
                    on-tap="_submitComment"
                  ></iron-icon>
                  <nuxeo-tooltip for="submit">[[i18n('comments.submit.tooltip')]]</nuxeo-tooltip>
                  <iron-icon name="clear" class="main-option opaque" icon="clear" on-tap="_clearInput"></iron-icon>
                </template>
              </dom-if>
            </div>
          </template>
        </dom-if>
      `;
    }

    static get is() {
      return 'nuxeo-document-comment-thread';
    }

    static get properties() {
      return {
        /** Document Unique Identifier for comment's thread root. */
        uid: {
          type: String,
          observer: '_refresh',
        },

        /**
         * List of comments for a specific document (thread's root).
         *
         * @type {Array.<Comment>}
         */
        comments: {
          type: Array,
          value() {
            return [];
          },
        },

        /** Level of depth for the comment's thread. */
        level: {
          type: Number,
          value: 1,
        },

        /** The number of results per page. */
        pageSize: {
          type: Number,
          readOnly: true,
          value: 10,
        },

        /** Whether all available comments are loaded. */
        allCommentsLoaded: {
          type: Boolean,
          readOnly: true,
          reflectToAttribute: true,
          value: false,
        },

        /** The total number of comments available. */
        total: {
          type: Number,
          readOnly: true,
          value: 0,
        },
      };
    }

    /**
     * Fired when number of comments changes.
     *
     * @event number-of-replies
     * @param {number} total Number of comments thread contains.
     */

    /**
     * Fired when some error occurred and the user needs to be notified.
     *
     * @event notify
     * @param {string} message Informative message to be presented to the user.
     */

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener('delete-comment', this._handleDeleteEvent);
      this.addEventListener('edit-comment', this._handleEditEvent);
      this.addEventListener('comments-changed', this._handleCommentsChange);
    }

    disconnectedCallback() {
      this.removeEventListener('delete-comment', this._handleDeleteEvent);
      this.removeEventListener('edit-comment', this._handleEditEvent);
      this.removeEventListener('comments-changed', this._handleCommentsChange);
      super.disconnectedCallback();
    }

    /**
     * Applies focus on user input.
     */
    focusInput() {
      this.$$('#inputContainer').focus();
    }

    _checkForEnter(e) {
      if (e.keyCode === 13 && e.ctrlKey && !this._isBlank(this.text)) {
        this._submitComment();
      }
    }

    _clearInput() {
      this.text = '';
    }

    _clearRequest() {
      this.$.commentRequest.data = {};
      this.$.commentRequest.headers = {};
      this.$.commentRequest.params = {};
    }

    _fetchComments(loadAll) {
      this._clearRequest();
      this.$.commentRequest.params = {
        pageSize: loadAll ? 0 : this.pageSize,
        currentPageIndex: 0,
      };
      this.$.commentRequest.headers = {
        'fetch.comment': 'repliesSummary',
      };
      this.$.commentRequest
        .get()
        .then((response) => {
          /* Reconciliation of local and server comments */
          const olderComment = this.comments.length > 0 ? this.comments[0] : null;
          const newComments = response.entries;
          while (
            newComments.length > 0 &&
            !!olderComment &&
            (newComments[0].creationDate > olderComment.creationDate || newComments[0].id === olderComment.id)
          ) {
            newComments.shift();
          }
          response.entries.forEach((entry) => {
            this.unshift('comments', entry);
          });
          this._setTotal(response.totalSize);
          this._setAllCommentsLoaded(!!loadAll);
        })
        .catch((error) => {
          if (error.status === 404) {
            this.dispatchEvent(
              new CustomEvent('notify', {
                composed: true,
                bubbles: true,
                detail: { message: this._computeTextLabel(this.level, 'notFound') },
              }),
            );
          } else {
            this.dispatchEvent(
              new CustomEvent('notify', {
                composed: true,
                bubbles: true,
                detail: { message: this._computeTextLabel(this.level, 'fetch.error') },
              }),
            );
            throw error;
          }
        });
    }

    _getCommentIndexById(commentId) {
      return this.comments.findIndex((entry) => entry.id === commentId);
    }

    _handleCommentsChange(event) {
      if (event.detail.path === 'comments.length') {
        this.dispatchEvent(
          new CustomEvent('number-of-replies', {
            composed: true,
            bubbles: true,
            detail: { total: this.comments.length },
          }),
        );
      }
    }

    _handleDeleteEvent(event) {
      const index = this._getCommentIndexById(event.detail.commentId);
      if (index !== -1) {
        this.splice('comments', index, 1);
        this._setTotal(this.total - 1);
      }
      event.stopPropagation();
    }

    _handleEditEvent(event) {
      const index = this._getCommentIndexById(event.detail.commentId);
      if (index !== -1) {
        this.set(`comments.${index}.modificationDate`, event.detail.modificationDate);
        this.set(`comments.${index}.text`, event.detail.text);
      }
      event.stopPropagation();
    }

    _loadMore() {
      this._fetchComments(true);
    }

    _refresh() {
      this.set('comments', []);
      this._fetchComments(this.allCommentsLoaded);
    }

    _submitComment(e) {
      if (e) {
        e.preventDefault();
      }
      this._clearRequest();
      this.$.commentRequest.data = {
        'entity-type': 'comment',
        parentId: this.uid,
        text: this.text.trim(),
      };

      this.$.commentRequest
        .post()
        .then((response) => {
          this._clearInput();
          this.push('comments', response);
          this._setTotal(this.total + 1);
        })
        .catch((error) => {
          if (error.status === 404) {
            this.dispatchEvent(
              new CustomEvent('notify', {
                composed: true,
                bubbles: true,
                detail: { message: this._computeTextLabel(this.level, 'notFound') },
              }),
            );
          } else {
            this.dispatchEvent(
              new CustomEvent('notify', {
                composed: true,
                bubbles: true,
                detail: { message: this._computeTextLabel(this.level, 'creation.error') },
              }),
            );
            throw error;
          }
        });
    }

    _computeMaxRows() {
      const lineHeight = parseFloat(this.getComputedStyleValue('--nuxeo-comment-line-height'));
      const maxHeight = parseFloat(this.getComputedStyleValue('--nuxeo-comment-max-height'));
      return Math.round((Number.isNaN(maxHeight) ? 80 : maxHeight) / (Number.isNaN(lineHeight) ? 20 : lineHeight));
    }

    _computeTextLabel(level, option, placeholder) {
      return level === 1
        ? this.i18n(`comments.${option}.comment`, placeholder)
        : this.i18n(`comments.${option}.reply`, placeholder);
    }

    /** Visibility Methods * */
    _allowReplies(level) {
      return level <= 2;
    }

    _isBlank(text) {
      return !text || typeof text !== 'string' || text.trim().length === 0;
    }

    _moreAvailable(length, total, allCommentsLoaded) {
      return length < total && !allCommentsLoaded;
    }
  }

  customElements.define(DocumentCommentThread.is, DocumentCommentThread);
}
