import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../widgets/nuxeo-checkmark.js';

/* Part of `nuxeo-data-table` */
{
  class DataTableCheckbox extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            min-height: 48px;
            flex-basis: 48px;
            flex-grow: 0;
            flex-shrink: 0;
            padding: 0 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            @apply --iron-data-table-checkbox;
          }

          :host([hidden]) {
            display: none;
          }

          :host(:focus) {
            outline: none;
          }

          :host([header]) {
            visibility: hidden !important;
          }
        </style>

        <nuxeo-checkmark checked="{{checked}}" disabled="{{disabled}}" aria-label$="[[i18n('command.select')]]" tabindex="0"></nuxeo-checkmark>
      `;
    }

    static get is() {
      return 'nuxeo-data-table-checkbox';
    }

    static get properties() {
      return {
        checked: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
        },
        disabled: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
        },
      };
    }

    ready() {
      super.ready();
      this.setAttribute('role', 'cell');
    }
  }

  customElements.define(DataTableCheckbox.is, DataTableCheckbox);
  Nuxeo.DataTableCheckbox = DataTableCheckbox;
}
