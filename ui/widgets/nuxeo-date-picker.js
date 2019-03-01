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
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-input/paper-input.js';
import '@vaadin/vaadin-date-picker/vaadin-date-picker.js';
import 'moment/src/moment.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

const $_documentContainer = document.createElement('template'); // eslint-disable-line camelcase

$_documentContainer.innerHTML = `<dom-module id="nuxeo-date-picker"
  theme-for="vaadin-date-picker vaadin-text-field vaadin-month-calendar vaadin-date-picker-overlay-content">
  <template>
    <style>
      :host {
        position: relative;
      }

      :host([hidden]) {
        display: none;
      }

      :host([required]) label::after {
        display: inline-block;
        content: '*';
        margin-left: 4px;
        color: var(--paper-input-container-invalid-color, red);
      }

      label {
        @apply --nuxeo-label;
      }

      :host([invalid]) label {
        color: var(--paper-input-container-invalid-color, red);
      }

      vaadin-date-picker {
        padding-bottom: 8px;
      }

      /* picker input */
      [part="input-field"] {
        background-color: var(--nuxeo-page-background) !important;
        border: 1px solid var(--nuxeo-border) !important;
        color: var(--nuxeo-text-default) !important;
      }

      /* buttons inside input (clear and open picker) */
      [part="text-field"] [part$="button"] {
        color: var(--nuxeo-text-default) !important;
      }

      [part="text-field"] [part$="button"]:hover {
        color: var(--nuxeo-primary-color) !important;
      }

      /* buttons inside the overlay (cancel and today), plus highlights for current year and today's date */
      [part="cancel-button"],
      [part="today-button"],
      [part="years"] [part="year-number"][current],
      [part="date"][today] {
        color: var(--nuxeo-primary-color) !important;
      }

      /* keyboard focus for buttons inside the overlay */
      [part="cancel-button"][focus-ring],
      [part="today-button"][focus-ring] {
        box-shadow: 0 0 0 2px var(--nuxeo-primary-color) !important;
      }

      /* date selected */
      [part="date"][selected]:before {
        background-color: var(--nuxeo-primary-color) !important;
        box-shadow: 0 0 0 2px var(--nuxeo-primary-color) !important;
      }

      [part="date"][selected][today] {
        color: var(--nuxeo-button-primary-text) !important;
      }

      /* hover any date that is not disabled or currently selected */
      [part="date"]:not([disabled]):not([selected]):hover::before {
        background-color: var(--nuxeo-primary-color) !important;
        opacity: .1 !important;
      }
    </style>

    <label>[[label]]</label>

    <vaadin-date-picker
      id="date"
      name="[[name]]"
      required$="[[required]]"
      invalid="[[invalid]]"
      value="{{_inputValue}}"
      disabled$="[[disabled]]"
      min="[[min]]"
      max="[[max]]"
      error-message="[[errorMessage]]">
    </vaadin-date-picker>

  </template>

  
</dom-module>`;

document.head.appendChild($_documentContainer.content);
{
  /**
   * An element for picking a W3C YYYY-MM-DDThh:mm:ss.sTZD based date (eg 1997-07-16T19:20:30.45+01:00).
   *
   * Example:
   *
   *     <nuxeo-date-picker value="{{value}}" label="My label"></nuxeo-date-picker>
   *
   * @appliesMixin Polymer.IronFormElementBehavior
   * @appliesMixin Polymer.IronValidatableBehavior
   * @memberof Nuxeo UI
   * @demo demo/nuxeo-date-picker/index.html
   */
  class DatePicker
    extends mixinBehaviors([I18nBehavior, IronFormElementBehavior,
      IronValidatableBehavior], Nuxeo.Element) {

    static get is() {
      return 'nuxeo-date-picker';
    }

    static get properties() {
      return {
        label: String,

        /*
         * The default time of the picked-up date. Format is HH:mm:ss e.g. 12:45:23. Default is 00:00:00 (midnight).
         */
        defaultTime: String,

        errorMessage: String,

        /*
         * The maximum date-time input value (e.g. `"2000-01-01"`).
         */
        max: String,

        /*
         * The minimum date-time input value (e.g. `"2000-01-01"`).
         */
        min: String,

        required: {
          type: Boolean,
          value: false,
        },

        value: {
          type: String,
          notify: true,
          observer: '_valueChanged',
        },

        disabled: {
          type: Boolean,
          value: false,
        },

        _inputValue: {
          type: String,
          observer: '_inputValueChanged',
        },

        _preventInputUpdate: {
          type: Boolean,
          value: false,
        },
      };
    }

    ready() {
      super.ready();
      moment.locale((window.nuxeo.I18n.language) ? window.nuxeo.I18n.language.split('-')[0] : 'en');
      // tell vaadin-date-picker how to display dates since default behavior is US locales (MM-DD-YYYY)
      // this way we can take advantage of moment locale and use the date format that is most suitable for the user
      this.$.date.set('i18n.formatDate', (date) => moment(date).format(moment.localeData().longDateFormat('L')));
      this.$.date.set('i18n.parseDate', (text) => {
        const date = moment(text, moment.localeData().longDateFormat('L'));
        return {
          day: date.format('D'),
          month: date.format('M') - 1,
          year: date.format('YYYY'),
        };
      });
      this.$.date.set('i18n.monthNames', moment.months());
      this.$.date.set('i18n.weekdays', moment.weekdays());
      this.$.date.set('i18n.weekdaysShort', moment.weekdaysShort());
      this.$.date.set('i18n.cancel', this.i18n('command.cancel'));
      this.$.date.set('i18n.clear', this.i18n('command.clear'));
      this.$.date.set('i18n.today', this.i18n('today'));
    }

    _getValidity() {
      if (!this.required) {
        return true;
      }
      return !!this.value;
    }

    _valueChanged() {
      if (!this.value) {
        this._inputValue = null;
        return;
      }
      const date = moment(this.value);
      if (this.value && date.isValid()) {
        this._preventInputUpdate = true;
        this._inputValue = date.format('YYYY-MM-DD');
      } else {
        this._inputValue = '';
      }
    }

    _inputValueChanged() {
      if (this._inputValue !== null && !this._preventInputUpdate) {
        const date = moment(this._inputValue);
        if (date.isValid()) {
          if (this.defaultTime) {
            const time = moment(this.defaultTime, 'HH:mm:ss');
            if (time.isValid()) {
              date.add(time.hour(), 'hour');
              date.add(time.minute(), 'minute');
              date.add(time.second(), 'second');
            } else {
              throw new Error(`Invalid default time ${this.defaultTime}`);
            }
          }
          this.set('value', date.toJSON());
        } else {
          this.set('value', null);
        }
      }
      this._preventInputUpdate = false;
    }

  }

  customElements.define(DatePicker.is, DatePicker);
  Nuxeo.DatePicker = DatePicker;
}
