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
                          <paper-checkbox noink checked="{{!column.hidden}}"></paper-checkbox>
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
              <paper-button noink on-click="_resetSettings" class="secondary"
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
        this._changedWhileEditing = false;
      }
      dialog.toggle();
    }

    _columnDisplayChanged(change) {
      if (change.path.endsWith('hidden')) {
        // While the dialog is open, changes show at once but are saved when it closes, with the scope chosen then
        if (this._editing) {
          this._changedWhileEditing = true;
          return;
        }
        this._fireSettingsChanged();
      }
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
        this._resetSettings();
      }
      this._editing = false;
      if (this._changedWhileEditing) {
        this._changedWhileEditing = false;
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
      this.dispatchEvent(
        new CustomEvent('settings-scope-selected', {
          composed: true,
          bubbles: true,
          detail: { scope },
        }),
      );
    }
  }

  customElements.define(DataTableSettings.is, DataTableSettings);
  Nuxeo.DataTableSettings = DataTableSettings;
}
