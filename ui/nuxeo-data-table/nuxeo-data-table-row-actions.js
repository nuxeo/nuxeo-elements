import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../widgets/nuxeo-tooltip.js';
import './data-table-templatizer-behavior.js';

/* Part of `nuxeo-data-table` */
{
  class DataTableRowActions extends mixinBehaviors([saulis.DataTableTemplatizerBehavior, I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            @apply --layout-horizontal;
            @apply --layout-center;
            @apply --layout-flex;
          }
          .actions {
            padding-right: 12px;
          }
          .actions,
          .orderable {
            @apply --layout-horizontal;
            @apply --layout-flex;
            @apply --layout-end-justified;
          }
        </style>

        <div class="actions">
          <dom-if if="[[orderable]]">
            <template>
              <div class="orderable">
                <dom-if if="[[isUpVisible(index)]]">
                  <template>
                    <paper-icon-button
                      noink
                      id="upButton"
                      icon="icons:arrow-upward"
                      on-click="moveUp"
                      aria-labelledby="upButtonTooltip"
                    ></paper-icon-button>
                    <nuxeo-tooltip for="upButton" position="left" id="upButtonTooltip"
                      >[[i18n('command.moveUpward')]]</nuxeo-tooltip
                    >
                  </template>
                </dom-if>
                <dom-if if="[[isDownVisible(index, size)]]">
                  <template>
                    <paper-icon-button
                      noink
                      id="downButton"
                      icon="icons:arrow-downward"
                      on-click="moveDown"
                      aria-labelledby="downButtonTooltip"
                    >
                    </paper-icon-button>
                    <nuxeo-tooltip for="downButton" position="left" id="downButtonTooltip"
                      >[[i18n('command.moveDownward')]]</nuxeo-tooltip
                    >
                  </template>
                </dom-if>
              </div>
            </template>
          </dom-if>
          <dom-if if="[[editable]]">
            <template>
              <paper-icon-button
                id="edit-button"
                icon="nuxeo:edit"
                on-click="_editEntry"
                noink
                aria-labelledby="editButtonTooltip"
              ></paper-icon-button>
              <nuxeo-tooltip for="edit-button" position="left" id="editButtonTooltip"
                >[[i18n('command.edit')]]</nuxeo-tooltip
              >
              <paper-icon-button
                id="delete-button"
                name="delete"
                icon="nuxeo:delete"
                on-click="_deleteEntry"
                noink
                aria-labelledby="deleteButtonTooltip"
              >
              </paper-icon-button>
              <nuxeo-tooltip for="delete-button" position="left" id="deleteButtonTooltip"
                >[[i18n('command.remove')]]</nuxeo-tooltip
              >
            </template>
          </dom-if>
        </div>
      `;
    }

    static get is() {
      return 'nuxeo-data-table-row-actions';
    }

    static get properties() {
      return {
        beforeBind: Object,
        size: Number,
        editable: Boolean,
        orderable: Boolean,
      };
    }

    static get observers() {
      return ['_beforeBind(beforeBind, item.*, index, size)'];
    }

    _beforeBind(beforeBind, item, index, size) {
      if (!beforeBind) {
        return;
      }
      const data = {
        index,
        item: item.base,
        size,
      };
      beforeBind(data, this);
    }

    _editEntry(e) {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent('edit-entry', {
          composed: true,
          bubbles: true,
          detail: { item: this.item, index: this.index },
        }),
      );
    }

    _deleteEntry(e) {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent('delete-entry', {
          composed: true,
          bubbles: true,
          detail: { item: this.item, index: this.index },
        }),
      );
    }

    moveUp(e) {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent('move-upward', {
          composed: true,
          bubbles: true,
          detail: { item: this.item, index: this.index },
        }),
      );
    }

    moveDown(e) {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent('move-downward', {
          composed: true,
          bubbles: true,
          detail: { item: this.item, index: this.index },
        }),
      );
    }

    isUpVisible(index) {
      return this.orderable && index > 0;
    }

    isDownVisible(index) {
      return this.orderable && index < this.size - 1;
    }
  }

  customElements.define(DataTableRowActions.is, DataTableRowActions);
  Nuxeo.DataTableRowActions = DataTableRowActions;
}
