/**
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
*/
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '../search/nuxeo-results-view.js';
import '../widgets/nuxeo-dialog.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

{
  /**
   * `nuxeo-document-picker`
   * @group Nuxeo UI
   * @element nuxeo-document-picker
   */
  class DocumentPicker extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
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
      `;
    }

    static get is() {
      return 'nuxeo-document-picker';
    }

    static get properties() {
      return {
        /**
         * Accessible name of the picker dialog. The same picker is opened for different purposes,
         * so the name follows the caller; it falls back to a generic one.
         */
        dialogLabel: String,
        /**
         * List of content enrichers passed on to `provider`.
         */
        enrichers: String,
        /**
         * The base url for the hrefs of the search layouts to be loaded.
         */
        hrefBase: String,
        /**
         * The number of results per page.
         */
        pageSize: Number,
        /**
         * The id of the `nuxeo-page-provider` instance used to perform the search.
         */
        provider: String,
        /**
         * List of comma separated values of the document schemas to be returned.
         * All document schemas are returned by default.
         */
        schemas: String,
        /**
         * The name of the search layout.
         */
        searchName: String,
        /**
         * The aggregations returned by `provider`.
         */
        _aggregations: {
          type: Object,
          readOnly: true,
        },
        /**
         * The query parameters passed on to `provider`.
         */
        _params: {
          type: Object,
          readOnly: true,
        },
        /**
         * Name of the quick filters to be displayed in case you don't want to display all of them.
         * Expected format : ['quickfilter1','quickfilter2'].
         */
        _quickFilters: {
          type: Object,
          readOnly: true,
        },
      };
    }

    ready() {
      super.ready();
      this._boundDialogKeydown = this._onDialogKeydown.bind(this);
      this._listenForShortcut();
    }

    connectedCallback() {
      super.connectedCallback();
      // Runs before ready() on the first connection, when there is nothing to listen on yet.
      this._listenForShortcut();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._boundDialogKeydown) {
        this.$.dialog.removeEventListener('keydown', this._boundDialogKeydown, true);
      }
      if (this._listenedResults && this._boundUpdateFn) {
        this._listenedResults.removeEventListener('selected-items-changed', this._boundUpdateFn);
      }
    }

    open() {
      if (this.$.resultsView) {
        // XXX could make sense to consider having this as a public method on nuxeo-results-view
        this.$.resultsView._clear();
      }
      this._updateSelectButton();
      // `modal` is what enables nuxeo-dialog's focus trap, but paper-dialog-behavior also derives
      // noCancelOnEscKey from it, so Escape is swallowed and a keyboard user has no way out of the
      // picker other than tabbing through every result. Cancelling still goes through close(), so
      // restore-focus-on-close hands focus back to whatever opened the picker.
      this.$.dialog.noCancelOnEscKey = false;
      this._focusPending = true;
      this.$.dialog.open();
    }

    close() {
      this.$.dialog.close();
    }

    _dialogLabel(dialogLabel) {
      return dialogLabel || this.i18n('documentPicker.dialog');
    }

    _listenForShortcut() {
      if (!this._boundDialogKeydown) {
        return;
      }
      // Capture phase, so the search field does not run a search for the same key press.
      this.$.dialog.addEventListener('keydown', this._boundDialogKeydown, true);
    }

    /**
     * Confirms the selection with Ctrl/Cmd+Enter, the same shortcut the comment editor uses to
     * submit. The Select button is the last thing in the dialog's tab sequence, behind every
     * result and each of its actions, so without a shortcut confirming a pick can take dozens of
     * Tab presses on a full page of results.
     */
    _onDialogKeydown(e) {
      if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey) || this.$.selectButton.disabled || !this.$.dialog.opened) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this._onSelect();
    }

    _onDialogOpened(e) {
      // Overlays nested in the search form bubble the same event.
      if (e.target === this.$.dialog) {
        afterNextRender(this, () => this._focusSearchField());
      }
    }

    _onSearchFormLoaded() {
      // The search layout is fetched lazily, so on the first open it is stamped after the dialog.
      afterNextRender(this, () => this._focusSearchField());
    }

    /**
     * Moves focus to the search field once the picker is up. Without this focus stays on the dialog
     * container, which draws no focus ring, so a keyboard user is given no starting point.
     */
    _focusSearchField() {
      if (!this._focusPending || !this.$.dialog.opened) {
        return;
      }
      const { form } = this.$.resultsView;
      const shadowRoot = form ? form.shadowRoot : null;
      const field = shadowRoot ? shadowRoot.querySelector('[autofocus]') : null;
      if (field && typeof field.focus === 'function') {
        this._focusPending = false;
        field.focus();
      }
    }

    get _selectedItems() {
      return (
        this.$.resultsView &&
        this.$.resultsView.results &&
        this.$.resultsView.results.results &&
        this.$.resultsView.results.results.selectedItems
      );
    }

    _updateSelectButton() {
      const selectedItems = this._selectedItems;
      this.$.selectButton.disabled = !(selectedItems && selectedItems.length);
    }

    _onSelect() {
      const selectedItems = this._selectedItems;
      if (selectedItems) {
        this.dispatchEvent(
          new CustomEvent('picked', {
            composed: true,
            bubbles: true,
            detail: { selectedItems },
          }),
        );
        this.close();
      }
    }

    _onNavigate(e) {
      // a grid thumbnail was clicked, so we want to select that result
      this.$.resultsView.results.results.selectItems([e.detail.item]);
      // XXX check how we can achieve a similar result for tables and the justified grid (not the default use case)
    }

    _onResultsChanged(e) {
      if (e.detail.value) {
        if (this._listenedResults && this._boundUpdateFn) {
          // there's already a listener set so we need to remove it
          this._listenedResults.removeEventListener('selected-items-changed', this._boundUpdateFn);
        }
        // set a listener to update the select button whenever the selectedItems changes
        this._listenedResults = e.detail.value;
        this._boundUpdateFn = this._updateSelectButton.bind(this);
        this._listenedResults.addEventListener('selected-items-changed', this._boundUpdateFn);
      }
    }
  }
  customElements.define(DocumentPicker.is, DocumentPicker);
}
