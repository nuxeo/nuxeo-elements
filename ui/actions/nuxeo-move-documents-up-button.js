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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/nuxeo-elements/nuxeo-operation.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import '../widgets/nuxeo-tooltip.js';
import './nuxeo-action-button-styles.js';

{
  /**
   * A button element for moving documents up within an OrderedFolder.
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-move-documents-up-button/index.html
   */
  class MoveDocumentsUp extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style include="nuxeo-action-button-styles">
      iron-icon:hover {
        fill: var(--nuxeo-link-hover-color);
      }
    </style>

    <nuxeo-operation
      id="moveUpOp"
      op="Document.Order"
      params="{&quot;before&quot;: &quot;[[_beforeUid]]&quot;}"
      input="[[_sortedDocuments]]"
      sync-indexing>
    </nuxeo-operation>

    <dom-if id="availability" if="[[_available]]">
      <template>
        <div class="action">
          <paper-icon-button noink="" icon="icons:arrow-upward"></paper-icon-button>
          <span class="label" hidden\$="[[!showLabel]]">[[_label]]</span>
        </div>
        <nuxeo-tooltip>[[_label]]</nuxeo-tooltip>
      </template>
    </dom-if>
`;
    }

    static get is() {
      return 'nuxeo-move-documents-up-button';
    }

    static get properties() {
      return {
        /**
         * All sibling documents.
         */
        documents: Array,
        /**
         * Input documents to be moved down.
         */
        selectedDocuments: Array,
        /**
         * Possible positions are  top|bottom|left|right. The default position is bottom.
         */
        tooltipPosition: {
          type: String,
          value: 'bottom',
        },
        /**
         * `true` if the action should display the label, `false` otherwise.
         */
        showLabel: {
          type: Boolean,
          value: false,
        },
        _label: {
          type: String,
          computed: '_computeLabel(i18n)',
        },
        _available: Boolean,
        _beforeUid: Document,
        _sortedDocuments: Array,
      };
    }

    static get observers() {
      return [
        '_isAvailable(selectedDocuments.splices)',
      ];
    }

    ready() {
      super.ready();
      this.addEventListener('click', this.move);
    }

    move() {
      this.$.moveUpOp.execute().then(() => {
        for (let i = this._sortedDocuments.length - 1; i >= 0; i--) {
          this.documents.splice(this.documents.indexOf(this._sortedDocuments[i]), 1);
          this.documents.splice(this._focusIndex, 0, this._sortedDocuments[i]);
        }
        this._sortedDocuments = [];
        this.dispatchEvent(new CustomEvent('refresh-display', {
          composed: true,
          bubbles: true,
          detail: { focusIndex: this._focusIndex },
        }));
      }).catch(() => {
        this.dispatchEvent(new CustomEvent('notify', {
          composed: true,
          bubbles: true,
          detail: { message: this.i18n('moveDocumentButton.error')},
        }));
      });
    }

    _isAvailable() {
      this._available = false;
      if (this.selectedDocuments && this.selectedDocuments.length > 0) {
        // Let's sort
        this._sortedDocuments = this.selectedDocuments.slice(0);
        try {
          this._sortedDocuments.sort((a, b) => {
            const idxa = this.documents.indexOf(a);
            const idxb = this.documents.indexOf(b);
            if (idxa < 0 || idxb < 0) {
              throw new Error('Document is not in the list.');
            }
            return idxa - idxb;
          });
        } catch (e) {
          this.dispatchEvent(new CustomEvent('clear-selected-items', {
            composed: true,
            bubbles: true,
            detail: {},
          }));
          return;
        }
        let sequenceBreakIdx;
        const isSequence = this._sortedDocuments.every((doc, idx) => {
          if (idx > 0) {
            if (this._sortedDocuments[idx - 1].uid === this.documents[this.documents.indexOf(doc) - 1].uid) {
              return true;
            } else {
              sequenceBreakIdx = idx;
              return false;
            }
          }
          return true;
        });
        if (this._sortedDocuments[0].uid === this.documents[0].uid) {
          if (isSequence) {
            return;
          }
          this._focusIndex = this.documents.indexOf(this._sortedDocuments[sequenceBreakIdx - 1]) + 1;
          this._sortedDocuments.splice(0, sequenceBreakIdx);
        } else {
          this._focusIndex = this.documents.indexOf(this._sortedDocuments[0]) - 1;
        }
        this._beforeUid = this.documents[this._focusIndex].uid;
        this._available = true;
      }
    }

    _computeLabel() {
      return this.i18n('moveDocumentButton.up.tooltip');
    }
  }

  customElements.define(MoveDocumentsUp.is, MoveDocumentsUp);
  Nuxeo.MoveDocumentsDown = MoveDocumentsUp;
}
