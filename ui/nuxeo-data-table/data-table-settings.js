import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
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
      };
    }

    static get observers() {
      return ['_columnDisplayChanged(columns.*)'];
    }

    toggleColsSettingsPopup() {
      this.$$('#columnsSettingsPopup').toggle();
    }

    _columnDisplayChanged(change) {
      // A full reset emits a single `reset` event of its own once every column is back to its default.
      if (this._resetting) {
        return;
      }
      if (change.path.endsWith('hidden')) {
        this.dispatchEvent(
          new CustomEvent('settings-changed', {
            composed: true,
            bubbles: true,
          }),
        );
      }
    }

    /**
     * Restores visibility, width and order to the values declared in the layout, and signals the
     * reset so the host can drop any stored preferences for this table (WEBUI-2086).
     */
    _resetSettings() {
      this._resetting = true;
      try {
        this.columns.forEach((column, idx) => {
          this.set(`columns.${idx}.hidden`, column.hiddenBack);
          this.set(`columns.${idx}.order`, idx);
          this.set(`columns.${idx}.width`, this._declaredWidth(column));
          this.set(`columns.${idx}.resized`, false);
        });
      } finally {
        this._resetting = false;
      }
      this.dispatchEvent(
        new CustomEvent('settings-changed', {
          composed: true,
          bubbles: true,
          detail: { source: 'reset' },
        }),
      );
    }

    _resetVisibility() {
      this.columns.forEach((column, idx) => {
        this.set(`columns.${idx}.hidden`, column.hiddenBack);
      });
    }

    /**
     * The width declared in the layout markup, captured once. `width` is not reflected to the
     * attribute, so the attribute still holds the original value after a resize changed the property.
     */
    _declaredWidth(column) {
      if (column._declaredWidth === undefined) {
        column._declaredWidth = typeof column.getAttribute === 'function' ? column.getAttribute('width') : null;
      }
      return column._declaredWidth;
    }

    _onSettingsClosed() {
      if (this.columns.every((column) => column.hidden)) {
        this._resetVisibility();
      }
    }

    canChangeVisibility(column) {
      return !column.alwaysVisible;
    }
  }

  customElements.define(DataTableSettings.is, DataTableSettings);
  Nuxeo.DataTableSettings = DataTableSettings;
}
