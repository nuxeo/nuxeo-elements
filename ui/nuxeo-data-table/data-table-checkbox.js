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
          /**
            @deprecated since 3.0.6 we no longer use the header property to control the checkbox visibility 
           */
          :host([header]) {
            visibility: hidden !important;
          }
        </style>

        <nuxeo-checkmark
          checked="{{checked}}"
          disabled="{{disabled}}"
          aria-label$="[[i18n('command.select')]]"
          tabindex="0"
        >
        </nuxeo-checkmark>
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
        _lastFocused: {
          type: Object,
          value: null,
        },
      };
    }

    ready() {
      super.ready();
      if (!this.header) {
        this.setAttribute('scope', 'col');
      } else {
        this.setAttribute('role', 'cell');
      }
      const checkmark = this.shadowRoot.querySelector('nuxeo-checkmark');
      if (checkmark) {
        checkmark.setAttribute('tabindex', '0');

        checkmark.addEventListener('focus', (e) => {
          this._lastFocused = e.currentTarget;
        });

        checkmark.addEventListener('keydown', this._onCheckBoxKeydown.bind(this));
      }
    }

    _onCheckBoxKeydown(e) {
      const key = e.key || e.code || '';
      if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Space') {
        e.preventDefault();
        e.stopPropagation();

        const checkmark = this.shadowRoot.querySelector('nuxeo-checkmark');
        if (checkmark && !checkmark.disabled) {
          checkmark.checked = !checkmark.checked;
          checkmark.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true }));
          requestAnimationFrame(() => checkmark.focus());
          this._lastFocused = checkmark;
        }
      }
    }
  }

  customElements.define(DataTableCheckbox.is, DataTableCheckbox);
  Nuxeo.DataTableCheckbox = DataTableCheckbox;
}
