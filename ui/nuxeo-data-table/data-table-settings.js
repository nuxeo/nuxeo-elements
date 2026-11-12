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
            margin: 0 0 16px;
            padding-top: 16px;
            border-top: 1px solid var(--nuxeo-border);
          }

          .scope[hidden] {
            display: none;
          }

          /* styled like the dialog title, but may wrap for long translations */
          .scope-label {
            @apply --paper-font-title;
            @apply --paper-dialog-title;
            white-space: normal;
            margin-bottom: 16px;
          }

          /* sized and spaced like the column checkboxes above */
          .scope paper-radio-group {
            display: flex;
            flex-direction: column;
            --paper-radio-group-item-padding: 2px 0;
            --paper-radio-button-size: 18px;
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
                            checked="[[!column.hidden]]"
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
      // with the choice of where they apply, column changes are saved when the dialog closes, with the choice made then;
      // otherwise they are saved at once
      if (!dialog.opened && this.scopeEnabled) {
        this._editing = true;
        this._userChanged = false;
        this._openedWith = this._visibility();
        this._keepPending = false;
      }
      dialog.toggle();
    }

    /**
     * `true` while the dialog is open with column changes made by the user that are still to be saved: changes undone
     * since, or columns restored by code while none are pending, don't count. Once a scope is picked with
     * changes pending, they stay pending, as what is saved then may differ from the opening columns.
     */
    get pendingChanges() {
      return Boolean(
        this._editing && this._userChanged && (this._keepPending || this._visibility() !== this._openedWith),
      );
    }

    _visibility(changedIdx) {
      return JSON.stringify((this.columns || []).map((column, idx) => Boolean(column.hidden) !== (idx === changedIdx)));
    }

    _columnDisplayChanged(change) {
      if (!change.path.endsWith('hidden')) {
        return;
      }
      if (!this._editing) {
        this._fireSettingsChanged();
      } else if (!this._byUser && !this._pendingBefore(change.path)) {
        // While the dialog is open, changes show at once but are saved when it closes, with the scope chosen then.
        // Columns restored by code while no change is pending become what the user's changes are compared with.
        this._openedWith = this._visibility();
        this._userChanged = false;
      }
    }

    // whether user changes were pending just before the column at `path` changed
    _pendingBefore(path) {
      const idx = Number(path.split('.')[1].replace('#', ''));
      return Boolean(this._userChanged && (this._keepPending || this._visibility(idx) !== this._openedWith));
    }

    _columnToggled(e) {
      const idx = this.columns.indexOf(e.model.column);
      this._userChange(() => this.set(`columns.${idx}.hidden`, !e.target.checked));
    }

    _resetClicked() {
      this._userChange(() => this._resetSettings());
    }

    _userChange(change) {
      this._byUser = true;
      try {
        change();
      } finally {
        this._byUser = false;
      }
      this._userChanged = true;
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
      this._keepPending = false;
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
      if (pendingChanges) {
        // what is shown is saved when the dialog closes, even if changed back meanwhile
        this._keepPending = true;
      } else {
        // the columns of the new scope may be restored next, so the user's next change starts from them
        this._userChanged = false;
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
