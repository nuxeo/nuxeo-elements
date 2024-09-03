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
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-input/paper-input.js';
import '@vaadin/date-picker';
import moment from '@nuxeo/moment/min/moment-with-locales.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { config } from '@nuxeo/nuxeo-elements';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

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
  class DatePicker extends mixinBehaviors(
    [I18nBehavior, IronFormElementBehavior, IronValidatableBehavior],
    Nuxeo.Element,
  ) {
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
          reflectToAttribute: true,
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

        /*
         * The first day of week to be displayed (e.g. `"Sunday -> 0"`, ... `"Saturday -> 6"`).
         * By default, it will be set according the locale.
         */
        firstDayOfWeek: {
          type: Number,
        },

        /**
         * The name of the timezone where the user is considered to be, according to the IANA tz database.
         * Currently valid values are:
         * - empty: local time will be used, as read from the browser (this is the default)
         * - Etc/UTC: time specified by the user is assumed to be in UTC
         */
        timezone: {
          type: String,
          value() {
            return config.get('timezone');
          },
        },

        _inputValue: {
          type: String,
          observer: '_inputValueChanged',
        },

        /**
         * Enable this property to remove the button allowing a user to clear the date currently set.
         * Button is present by default.
         */
        hideClearDateButton: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        _preventInputUpdate: {
          type: Boolean,
          value: false,
        },

        /**
         * Use this property to provide custom date format 
         * 
         */
        dateFormat: {
          type: String,
          value: ""
        }
      };
    }

    static get template() {
      return html`
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
            color: var(--paper-input-container-invalid-color, #de350b);
          }

          label {
            @apply --nuxeo-label;
          }

          :host([invalid]) label {
            color: var(--paper-input-container-invalid-color, #de350b);
          }

          vaadin-date-picker {
            padding-bottom: 8px;
            --lumo-space-xs: 2px;
            --lumo-font-family: var(--nuxeo-app-font);
          }

          vaadin-date-picker::part(text-field) {
            --lumo-text-field-size: 29px;
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
          error-message="[[errorMessage]]"
          clear-button-visible$="[[!hideClearDateButton]]"
        >
        </vaadin-date-picker>
      `;
    }

    ready() {
      super.ready();
      moment.locale(window.nuxeo.I18n.language ? window.nuxeo.I18n.language.split('-')[0] : 'en');
      // tell vaadin-date-picker how to display dates since default behavior is US locales (MM-DD-YYYY)
      // this way we can take advantage of moment locale and use the date format that is most suitable for the user
      const convertedFormat = this.dateFormat ? this.dateFormat : moment.localeData().longDateFormat('L');
      this.$.date.set('i18n.formatDate', (date) => this._moment(date).format(convertedFormat));
      this.$.date.set('i18n.parseDate', (text) => {
        const date = this._moment(text, convertedFormat);
        return {
          day: date.get('D'),
          month: date.get('M'),
          year: date.get('Y'),
        };
      });
      this.$.date.set('i18n.monthNames', moment.months());
      this.$.date.set('i18n.weekdays', moment.weekdays());
      this.$.date.set('i18n.weekdaysShort', moment.weekdaysShort());
      this.$.date.set('i18n.cancel', this.i18n('command.cancel'));
      this.$.date.set('i18n.clear', this.i18n('command.clear'));
      this.$.date.set('i18n.today', this.i18n('today'));
      this.$.date.set(
        'i18n.firstDayOfWeek',
        this.firstDayOfWeek || config.get('firstDayOfWeek', moment.localeData().firstDayOfWeek() || 0),
      );
    }

    _moment(...args) {
      const fn = this.timezone === 'Etc/UTC' ? moment.utc : moment;
      return fn(...args);
    }

    _getValidity() {
      return (
        this.$.date.validate(this.value ? this.$.date.i18n.formatDate(this.value) : this.value) &&
        (this.required ? !!this.value : true)
      );
    }

    _valueChanged() {
      if (!this.value) {
        this._inputValue = null;
        return;
      }
      const date = this._moment(this.value);
      if (this.value && date.isValid()) {
        this._preventInputUpdate = true;
        const year = `${date.get('Y')}`.padStart(4, '0');
        const month = `${date.get('M') + 1}`.padStart(2, '0');
        const day = `${date.get('D')}`.padStart(2, '0');
        this._inputValue = `${year}-${month}-${day}`;
      } else {
        this._inputValue = '';
      }
    }

    _inputValueChanged() {
      if (this._inputValue !== null && !this._preventInputUpdate) {
        const date = this._moment(this._inputValue);
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
