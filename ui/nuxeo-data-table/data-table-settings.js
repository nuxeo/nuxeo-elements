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
        <style include="nuxeo-button-styles nuxeo-styles">
          :host {
            position: relative;
          }

          .paper-content {
            min-width: 20vw;
            margin-bottom: 2em;
          }

          paper-icon-button {
            position: absolute;
            top: 1.5em;
            right: 8px;
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
                  <dom-repeat items="[[columns]]" as="column">
                    <template>
                      <tr>
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

        <paper-icon-button noink icon="nuxeo:settings" id="toggleColSettings" on-click="toggleColsSettingsPopup">
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
      if (change.path.endsWith('hidden')) {
        this.dispatchEvent(
          new CustomEvent('settings-changed', {
            composed: true,
            bubbles: true,
          }),
        );
      }
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
    }
  }

  customElements.define(DataTableSettings.is, DataTableSettings);
  Nuxeo.DataTableSettings = DataTableSettings;
}
