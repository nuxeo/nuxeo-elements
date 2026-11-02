import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../widgets/nuxeo-dialog.js';
import '../nuxeo-button-styles.js';

/* Part of `nuxeo-data-table` */
{
  class DataTableSettings extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
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

          .scope {
            margin: 0 24px 16px;
          }

          .scope[hidden] {
            display: none;
          }

          .scope-label {
            font-weight: 600;
            margin-bottom: 4px;
          }

          .scope paper-radio-group {
            display: flex;
            flex-direction: column;
            --paper-radio-group-item-padding: 4px 0;
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
                          <paper-checkbox
                            noink
                            checked="{{!column.hidden}}"
                            on-change="_columnToggled"
                          ></paper-checkbox>
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
          <div class="scope" hidden$="[[!scopeEnabled]]">
            <div id="scopeLabel" class="scope-label">[[i18n('tableSettings.columnSettings.applyTo')]]</div>
            <paper-radio-group
              id="scope"
              selected="[[scope]]"
              aria-labelledby="scopeLabel"
              on-paper-radio-group-changed="_scopeSelected"
            >
              <paper-radio-button name="all" noink>
                [[i18n('tableSettings.columnSettings.applyTo.all')]]
              </paper-radio-button>
              <paper-radio-button name="document" noink>
                [[i18n('tableSettings.columnSettings.applyTo.document')]]
              </paper-radio-button>
            </paper-radio-group>
          </div>
          <div class="buttons horizontal end-justified layout">
            <div class="flex start-justified">
              <paper-button noink on-click="_resetClicked" class="secondary"
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
      `;
    }

    static get is() {
      return 'nuxeo-data-table-settings';
    }

    static get properties() {
      return {
        columns: {
          type: Array,
          notify: true,
        },
        /**
         * `true` to let the user choose where column changes apply (see `scope`).
         */
        scopeEnabled: {
          type: Boolean,
          value: false,
        },
        /**
         * Where column changes apply: `all` (every document of this type) or `document` (this document only).
         */
        scope: {
          type: String,
          value: 'all',
          notify: true,
        },
      };
    }

    static get observers() {
      return ['_columnDisplayChanged(columns.*)'];
    }

    toggleColsSettingsPopup() {
      const dialog = this.$$('#columnsSettingsPopup');
      if (!dialog.opened) {
        this._editing = true;
        this._userChanged = false;
        this._openedWith = this._visibility();
        this._savedWith = undefined;
      }
      dialog.toggle();
    }

    /**
     * `true` while the dialog is open with column changes made by the user that are still to be saved: changes undone
     * since, or columns restored by code before the user's first change, don't count. Changing back the columns that
     * "this document only" saved counts.
     */
    get pendingChanges() {
      if (!this._editing || !this._userChanged) {
        return false;
      }
      const visibility = this._visibility();
      return visibility !== this._openedWith || (this._savedWith !== undefined && visibility !== this._savedWith);
    }

    _visibility(toggled) {
      return JSON.stringify((this.columns || []).map((column) => Boolean(column.hidden) !== (column === toggled)));
    }

    _columnDisplayChanged(change) {
      // While the dialog is open, changes show at once but are saved when it closes, with the scope chosen then
      if (change.path.endsWith('hidden') && !this._editing) {
        this._fireSettingsChanged();
      }
    }

    _columnToggled(e) {
      if (!this._userChanged) {
        // compare with the columns shown just before this first change, which may have been restored by code
        this._openedWith = this._visibility(e.model.column);
      }
      this._userChanged = true;
    }

    _resetClicked() {
      if (!this._userChanged) {
        this._openedWith = this._visibility();
      }
      this._userChanged = true;
      this._resetSettings();
    }

    _fireSettingsChanged() {
      this.dispatchEvent(
        new CustomEvent('settings-changed', {
          composed: true,
          bubbles: true,
        }),
      );
    }

    _resetSettings() {
      this.columns.forEach((column, idx) => {
        this.set(`columns.${idx}.hidden`, column.hiddenBack);
      });
    }

    _onSettingsClosed() {
      if (this.columns.every((column) => column.hidden)) {
        // counted as a change, as the hidden columns may already be saved for this document
        this._resetClicked();
      }
      const changed = this.pendingChanges;
      this._editing = false;
      this._userChanged = false;
      this._savedWith = undefined;
      if (changed) {
        this._fireSettingsChanged();
      }
    }

    canChangeVisibility(column) {
      return !column.alwaysVisible;
    }

    // Runs only when the user picks an option, not when `scope` is set by code.
    _scopeSelected(e) {
      const scope = e.target.selected;
      if (!scope || scope === this.scope) {
        return;
      }
      this.scope = scope;
      const { pendingChanges } = this;
      if (!pendingChanges) {
        // the columns of the new scope may be restored next, so the user's next change starts from them
        this._userChanged = false;
        this._savedWith = undefined;
      } else if (scope === 'document') {
        // "this document only" saves the shown columns at once; the changes stay pending for all documents
        this._savedWith = this._visibility();
      }
      this.dispatchEvent(
        new CustomEvent('settings-scope-selected', {
          composed: true,
          bubbles: true,
          // tells whether column changes made in the open dialog are still to be saved
          detail: { scope, pendingChanges },
        }),
      );
    }
  }

  customElements.define(DataTableSettings.is, DataTableSettings);
  Nuxeo.DataTableSettings = DataTableSettings;
}
