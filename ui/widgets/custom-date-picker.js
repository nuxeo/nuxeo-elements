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
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '../nuxeo-icons.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import moment from '@nuxeo/moment/min/moment-with-locales.js';
import { config } from '@nuxeo/nuxeo-elements';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

// A short grace period prevents transient focus reroutes from immediately
// collapsing the popover during month navigation.
const FOCUS_SUPPRESSION_MS = 200;

{
  class CustomDatePicker extends mixinBehaviors(
    [I18nBehavior, IronFormElementBehavior, IronValidatableBehavior],
    Nuxeo.Element,
  ) {
    static get is() {
      return 'custom-date-picker';
    }

    static get properties() {
      return {
        label: String,
        // Forwarded aria-labelledby to internal input for SRs
        ariaLabelledby: {
          type: String,
        },
        // Optional name forwarding to internal input (helps with form autofill/AT)
        name: {
          type: String,
        },

        /*
         * The default time of the selected date. Format is HH:mm:ss e.g. 12:45:23. Default is 00:00:00 (midnight).
         */
        defaultTime: {
          type: String,
          observer: '_defaultTimeChanged',
        },

        errorMessage: {
          type: String,
          observer: '_errorMessageChanged',
        },

        /*
         * The maximum date-time input value (e.g. `"2000-01-01"`).
         */
        max: {
          type: String,
          observer: '_maxChanged',
        },

        /*
         * The minimum date-time input value (e.g. `"2000-01-01"`).
         */
        min: {
          type: String,
          observer: '_minChanged',
        },

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
         * By default, it will be set according to the locale.
         */
        firstDayOfWeek: {
          type: Number,
          observer: '_firstDayOfWeekChanged',
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

        /**
         * Enable this property to remove the button allowing a user to clear the date currently set.
         * Button is present by default.
         */
        hideClearDateButton: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },
        // Compatibility with vaadin's clear-button-visible attribute
        clearButtonVisible: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
          observer: '_clearButtonVisibleChanged',
        },

        invalid: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
          observer: '_invalidChanged',
        },

        // Reason for current invalid state: 'required' | 'format' | 'invalidDate' | 'outOfRange' | 'notSelectable' | ''
        errorReason: {
          type: String,
          value: '',
        },

        _inputValue: {
          type: String,
          observer: '_inputValueChanged',
        },

        _preventInputUpdate: {
          type: Boolean,
          value: false,
        },

        _userIsTyping: {
          type: Boolean,
          value: false,
        },

        _isCalendarOpen: {
          type: Boolean,
          value: false,
        },

        _justOpenedCalendar: {
          type: Boolean,
          value: false,
        },

        _interactingWithCalendar: {
          type: Boolean,
          value: false,
        },

        _showErrors: {
          type: Boolean,
          value: false,
        },

        _justCleared: {
          type: Boolean,
          value: false,
        },

        _errorPersists: {
          type: Boolean,
          value: false,
        },

        _isYearDropdownOpen: {
          type: Boolean,
          value: false,
        },

        _selectedDate: {
          type: Object,
          value: null,
        },

        _viewDate: {
          type: Object,
          value: null,
        },

        _today: {
          type: Object,
          value: null,
        },

        _calendarDays: {
          type: Array,
          value: () => [],
        },

        _monthNames: {
          type: Array,
          value: () => [],
        },

        _weekdayNames: {
          type: Array,
          value: () => [],
        },

        _yearOptions: {
          type: Array,
          value: () => [],
        },

        _monthYearOptions: {
          type: Array,
          value: () => [],
        },

        _locale: {
          type: String,
          value: '',
        },

        _isRTL: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        _dateFormatter: {
          type: Object,
          value: null,
        },
        format: {
          type: String,
          value: '',
        },

        _focusedDate: {
          type: Object,
          value: null,
        },

        // Date picker i18n config for compatibility with nuxeo-date-picker
        pickerI18n: {
          type: Object,
          value() {
            return {};
          },
        },

        // Computed properties for aria-labels
        _previousMonthAriaLabel: {
          type: String,
          computed: '_getLocalizedText("previousMonth")',
        },

        _nextMonthAriaLabel: {
          type: String,
          computed: '_getLocalizedText("nextMonth")',
        },
      };
    }

    static get template() {
      return html`
        <style>
          :host {
            position: relative;
            display: inline-block;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px; /* Reduced font size for compact design */
            line-height: 1.3;
            width: auto;
            max-width: 156px; /* Exact width requirement */
          }

          :host([hidden]) {
            display: none;
          }

          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            border: 1px solid #6b7280;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
            background: #ffffff;
            min-height: 32px; /* Reduced height for compact design */
            width: 156px; /* Exact width requirement */
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            overflow: hidden; /* Ensure icons stay inside */
          }

          .input-wrapper:hover {
            border-color: #374151;
          }

          :host([invalid]) .input-wrapper {
            border-color: var(--paper-input-container-invalid-color, #de350b);
          }

          .error-message {
            color: var(--paper-input-container-invalid-color, #de350b);
            font-size: 0.8em;
            margin-top: 4px;
            min-height: 1em;
            display: none;
          }

          :host([invalid]) .error-message {
            display: block;
          }

          .input-wrapper:focus-within {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
            outline: none;
          }

          /* Ensure focus always shows blue border, even for required fields */
          :host([required]) .input-wrapper:focus-within {
            border-color: #2563eb !important;
          }

          .input-field {
            flex: 1;
            border: none;
            outline: none;
            padding: 6px 48px 6px 8px;
            font-size: 13px;
            font-weight: 400;
            font-family: 'Inter', Arial, sans-serif;
            background: transparent;
            color: #666;
          }

          .input-field::placeholder {
            color: #6b7280;
            font-size: 12px; /* Consistent font size */
          }

          .input-field:disabled {
            color: #9ca3af;
            cursor: not-allowed;
          }

          .input-actions {
            position: absolute;
            right: 4px; /* Position inside the input wrapper */
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            gap: 2px; /* Reduced gap for compact design */
            flex-shrink: 0;
            z-index: 1; /* Ensure icons are above input */
          }

          .clear-button {
            padding: 2px; /* Reduced padding */
            color: #374151;
            cursor: pointer;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
            transition: color 0.2s ease, background-color 0.2s ease;
            border: none;
            background: transparent;
            width: 20px; /* Reduced size */
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .clear-button:disabled {
            color: #d1d5db;
            cursor: not-allowed;
            background: transparent;
          }

          .clear-button:disabled:hover {
            color: #d1d5db;
            background: transparent;
          }

          .calendar-icon:disabled {
            color: #d1d5db;
            cursor: not-allowed;
            background: transparent;
          }

          .calendar-icon:disabled:hover {
            color: #d1d5db;
            background: transparent;
          }

          .calendar-icon {
            padding: 2px; /* Reduced padding */
            color: #374151;
            cursor: pointer;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
            transition: color 0.2s ease, background-color 0.2s ease;
            border: none;
            background: transparent;
            width: 20px; /* Reduced size */
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .clear-button:hover {
            color: #dc2626;
            background-color: #fef2f2;
          }

          .calendar-icon:hover {
            color: #374151;
            background-color: #f3f4f6;
          }

          .clear-button:focus,
          .calendar-icon:focus {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
          }

          .clear-button[hidden] {
            display: none;
          }

          /* Ensure icons are always visible */
          .clear-button iron-icon {
            width: 14px; /* Reduced icon size */
            height: 14px;
            fill: currentColor;
            color: inherit;
          }

          .calendar-icon svg {
            width: 14px; /* Reduced icon size */
            height: 14px;
            stroke: currentColor;
            color: inherit;
          }

          /* Remove fallback CSS since we're using SVG */

          .field-label {
            display: block;
            margin-bottom: 4px; /* Reduced margin */
            font-weight: 500;
            color: #374151;
            font-size: 12px; /* Reduced font size */
          }

          :host([required]) .field-label::after {
            content: ' *';
            color: #dc2626;
          }

          .error-message {
            margin-top: 3px; /* Reduced margin */
            font-size: 11px; /* Reduced font size */
            color: #dc2626;
          }

          /*
           * Host for backdrop + calendar in the document top layer (Popover API).
           * When the picker is inside a transformed ancestor (e.g. iron-list rows), plain
           * position:fixed overlays are trapped in that stacking context; top layer escapes it.
           */
          .calendar-overlay-container {
            position: fixed;
            inset: 0;
            max-width: none;
            max-height: none;
            border: none;
            padding: 0;
            margin: 0;
            background: transparent;
            pointer-events: none;
          }

          .calendar-popover {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 999999; /* Very high z-index to appear above all dialogs */
            margin-top: 0;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            width: 280px; /* Reduced from 320px to be proportional */
            display: none;
            animation: fadeIn 0.15s ease-out;
            pointer-events: auto;
          }

          .calendar-popover.open {
            display: block;
          }

          .calendar-popover.open-up {
            top: auto;
            margin-top: 0;
            margin-bottom: 4px;
          }

          .calendar-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: transparent;
            z-index: 999998; /* Just below the popover */
            display: none;
            pointer-events: auto;
          }

          .calendar-backdrop.open {
            display: block;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .calendar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            background-color: #ffffff;
          }

          .month-year-display {
            display: flex;
            align-items: center;
            gap: 1px;
            font-weight: 600;
            color: #111827;
            font-size: 16px;
          }

          .month-text {
            font-weight: 600;
            color: #111827;
            font-size: 16px;
            margin-right: 5px;
          }

          .year-text {
            font-weight: 600;
            color: #111827;
            font-size: 16px;
          }

          .navigation {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .nav-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .nav-button:hover {
            background: #f3f4f6;
            color: #374151;
          }

          .nav-button:focus {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
          }

          .nav-button:disabled {
            color: #d1d5db;
            cursor: not-allowed;
          }

          .nav-button:disabled:hover {
            background: transparent;
          }

          .year-dropdown {
            position: relative;
            display: flex;
            align-items: center;
            gap: 2px;
            cursor: pointer;
            padding: 4px 3px;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
            transition: background-color 0.2s ease;
            outline: none;
            z-index: 1000000 !important;
          }

          .year-dropdown:hover {
            background-color: #f3f4f6;
          }

          .year-dropdown:focus {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
            background-color: #f3f4f6;
          }

          .month-year-dropdown {
            position: relative;
            display: flex;
            align-items: center;
            gap: 2px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }

          .month-year-dropdown:hover {
            background-color: #f3f4f6;
          }

          .year-select {
            position: absolute;
            opacity: 0;
            pointer-events: none;
            width: 1px;
            height: 1px;
          }

          .month-year-display-text {
            font-weight: 600;
            color: #111827;
            font-size: 16px;
            padding: 0;
            border-radius: 4px;
            pointer-events: none;
          }

          .year-dropdown-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border: none;
            background: transparent;
            border-radius: 2px;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
            pointer-events: none;
          }

          .year-dropdown-button:hover {
            background: #f3f4f6;
            color: #374151;
          }

          .year-dropdown-button:focus {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
          }

          .year-dropdown-button iron-icon {
            width: 24px;
            height: 24px;
          }

          .year-options,
          .month-year-options {
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 1000000; /* Higher than popover to appear above it */
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            max-height: 200px;
            overflow-y: auto;
            min-width: 160px;
            display: none;
          }

          .year-options.open,
          .month-year-options.open {
            display: block;
          }

          .year-option,
          .month-year-option {
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
            border: 2px solid transparent;
            transition: background-color 0.2s ease, border-color 0.2s ease;
            background: transparent;
            width: 100%;
            text-align: left;
            display: block;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
          }

          .year-option:hover,
          .month-year-option:hover {
            background-color: #f3f4f6;
          }

          .year-option.selected,
          .month-year-option.selected {
            background-color: #2563eb;
            color: #ffffff;
            font-weight: 600;
          }

          .year-option:focus,
          .month-year-option:focus {
            outline: none;
            border: 2px solid #2563eb;
            background-color: #f3f4f6;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
          }

          .year-option.selected:focus,
          .month-year-option.selected:focus {
            outline: none;
            border: 2px solid #ffffff;
            background-color: #1d4ed8; /* Darker blue when focused and selected */
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
          }

          .year-option.selected:hover {
            background-color: #1d4ed8; /* Darker blue on hover when selected */
            color: #ffffff;
          }

          .weekday-headers {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            padding: 8px 16px 0;
            background: #f9fafb;
          }

          .weekday-header {
            padding: 8px 4px;
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.025em;
          }

          .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            padding: 8px 16px 8px;
            role: grid;
            background: #ffffff;
          }

          .calendar-day {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border: none;
            background: transparent;
            color: #111827;
            font-size: 14px;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
            cursor: pointer;
            transition: all 0.15s ease;
            position: relative;
            margin: 0 auto;
          }

          .calendar-day:hover {
            background: #f3f4f6;
          }

          .calendar-day:focus {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
            z-index: 1;
          }

          .calendar-day.other-month {
            color: #d1d5db;
            cursor: default;
          }

          .calendar-day.other-month:hover {
            background: transparent;
          }

          .calendar-day.today {
            background: #dbeafe;
            color: #1d4ed8;
            font-weight: 600;
          }

          .calendar-day.selected {
            border: 2px solid #2563eb;
            color: #111827;
            font-weight: 600;
          }

          .calendar-day.selected:hover {
            border-color: #1d4ed8;
          }

          .calendar-day.focused {
            outline: 2px solid #9ca3af;
            outline-offset: 1px;
            z-index: 1;
          }

          .calendar-day.selected:focus {
            outline: none !important;
          }

          .calendar-day.today:focus {
            outline: 2px solid #9ca3af;
            outline-offset: 1px;
          }

          .calendar-day.disabled {
            color: #d1d5db;
            cursor: not-allowed;
            background-color: #f9fafb;
            text-decoration: line-through;
            opacity: 0.6;
            font-style: italic;
          }

          .calendar-day.disabled:hover {
            background: #f9fafb;
            color: #d1d5db;
            cursor: not-allowed;
          }

          .calendar-day.disabled:focus {
            outline: 2px solid #d1d5db;
            background: #f9fafb;
          }

          .calendar-day.empty {
            visibility: hidden;
            cursor: default;
          }

          .calendar-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-top: 1px solid #e5e7eb;
            background: #f9fafb;
          }

          .footer-button {
            border: none;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .today-button {
            background: #2563eb;
            color: #ffffff;
          }

          .today-button:hover {
            background: #1d4ed8;
          }

          .today-button:focus {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
          }

          .cancel-button {
            background: #ffffff;
            color: #6b7280;
            border: 1px solid #d1d5db;
          }

          .cancel-button:hover {
            background: #f3f4f6;
            color: #374151;
          }

          .cancel-button:focus {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
          }

          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }

          @media (prefers-contrast: high) {
            .input-wrapper {
              border-width: 2px;
            }

            .calendar-day.today {
              border-width: 3px;
            }

            .calendar-day.selected {
              border: 3px solid;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .calendar-popover {
              animation: none;
            }

            .input-wrapper,
            .calendar-day,
            .nav-button {
              transition: none;
            }
          }

          /* Focus styles for accessibility */
          .year-dropdown:focus,
          .nav-button:focus,
          .calendar-day:focus,
          .footer-button:focus {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
            z-index: 10;
          }

          /* Ensure focus order visibility */
          .calendar-day:focus {
            background-color: #e0e7ff;
            color: #1e40af;
          }

          .nav-button:focus {
            background-color: #e0e7ff;
          }

          .footer-button:focus {
            box-shadow: 0 0 0 2px #2563eb;
          }

          /* RTL (Right-to-Left) Support */
          :host([_is-r-t-l]) {
            direction: rtl;
          }

          :host([_is-r-t-l]) .input-field {
            text-align: right;
            padding: 6px 8px 6px 48px; /* Reverse padding for RTL */
          }

          :host([_is-r-t-l]) .input-actions {
            right: auto;
            left: 4px; /* Move actions to left side for RTL */
          }

          :host([_is-r-t-l]) .calendar-popover {
            left: auto;
            right: auto; /* Let JavaScript handle positioning */
            transform: none; /* Reset any transforms */
          }

          :host([_is-r-t-l]) .calendar-header {
            flex-direction: row-reverse; /* Reverse header layout */
          }

          :host([_is-r-t-l]) .navigation {
            flex-direction: row-reverse; /* Reverse navigation buttons */
          }

          :host([_is-r-t-l]) .month-year-display {
            flex-direction: row-reverse; /* Reverse month-year display */
          }

          :host([_is-r-t-l]) .calendar-footer {
            flex-direction: row-reverse; /* Reverse footer buttons */
          }

          :host([_is-r-t-l]) .weekday-headers {
            direction: rtl;
          }

          :host([_is-r-t-l]) .calendar-grid {
            direction: rtl;
          }

          /* RTL-specific positioning for dropdown */
          :host([_is-r-t-l]) .year-options,
          :host([_is-r-t-l]) .month-year-options {
            left: auto;
            right: 0;
          }

          /* RTL calendar positioning logic */
          :host([_is-r-t-l]) .calendar-popover.open-up {
            right: auto;
            left: auto; /* Let JavaScript handle positioning */
          }
        </style>

        <div class="field-wrapper">
          <div class="input-wrapper">
            <input
              id="dateInput"
              class="input-field"
              type="text"
              value="{{_inputValue::input}}"
              placeholder$="[[_getDatePlaceholder(format)]]"
              name$="[[name]]"
              disabled$="[[disabled]]"
              required$="[[required]]"
              aria-invalid$="[[invalid]]"
              aria-describedby$="[[_getAriaDescribedBy(invalid, errorMessage)]]"
              aria-labelledby$="[[ariaLabelledby]]"
              aria-expanded$="[[_isCalendarOpen]]"
              aria-haspopup="grid"
              autocomplete="off"
              on-focus="_onInputFocus"
              on-click="_onInputClick"
              on-blur="_onInputBlur"
              on-keydown="_onInputKeydown"
              on-input="_onInputChange"
            />

            <div class="input-actions">
              <template is="dom-if" if="[[_shouldShowClearButton(_inputValue, hideClearDateButton)]]">
                <button
                  type="button"
                  class="clear-button"
                  aria-label="[[i18n('customDatePicker.clearDate')]]"
                  disabled$="[[disabled]]"
                  aria-disabled$="[[disabled]]"
                  tabindex="0"
                  on-click="_clearDate"
                >
                  <iron-icon icon="icons:clear"></iron-icon>
                </button>
              </template>

              <button
                type="button"
                class="calendar-icon"
                aria-label="[[i18n('customDatePicker.openCalendar')]]"
                disabled$="[[disabled]]"
                tabindex="0"
                on-click="_openCalendarViaMouse"
                on-keydown="_handleCalendarIconKeydown"
                on-focus="_onCalendarIconFocus"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="error-message" id="errorText" hidden$="[[!_showError(invalid, errorMessage, _showErrors)]]">
            [[errorMessage]]
          </div>
          <!-- Screen reader live status region -->
          <div id="srStatus" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>

          <!-- Modal backdrop + calendar: wrapped for Popover API top layer (WEBUI-1986 / iron-list transform) -->
          <div id="calendarOverlay" class="calendar-overlay-container" popover="manual">
            <!-- Modal backdrop for calendar popover -->
            <div class="calendar-backdrop" id="calendarBackdrop" on-click="_closeCalendar"></div>

            <div
              class="calendar-popover"
              id="calendarPopover"
              role="dialog"
              tabindex="-1"
              aria-label="[[i18n('customDatePicker.calendar')]]"
              aria-modal$="[[_isCalendarOpen]]"
            >
              <div class="calendar-header">
                <div class="month-year-display">
                  <span class="month-text">[[_getMonthName(_viewDate)]]</span>
                  <div
                    class="year-dropdown"
                    on-click="_toggleYearDropdown"
                    tabindex="0"
                    role="button"
                    aria-label="[[i18n('customDatePicker.selectYear')]]"
                    aria-haspopup="listbox"
                    aria-expanded$="[[_isYearDropdownOpen]]"
                    on-keydown="_handleYearDropdownKeydown"
                  >
                    <span class="year-text">[[_getYear(_viewDate)]]</span>
                    <button
                      type="button"
                      class="year-dropdown-button"
                      aria-label="[[i18n('customDatePicker.selectYear')]]"
                      tabindex="-1"
                    >
                      <iron-icon icon$="[[_getDropdownIcon(_isYearDropdownOpen)]]"></iron-icon>
                    </button>
                    <div
                      class="year-options"
                      id="yearOptions"
                      role="listbox"
                      aria-label="[[i18n('customDatePicker.yearOptions')]]"
                    >
                      <template is="dom-repeat" items="[[_yearOptions]]">
                        <button
                          type="button"
                          class$="year-option [[_getYearOptionClass(item, _viewDate)]]"
                          data-year$="[[item]]"
                          on-click="_selectYear"
                          tabindex$="[[_getYearTabIndex(item, _viewDate)]]"
                          role="option"
                          aria-selected$="[[_isSelectedYear(item, _viewDate)]]"
                        >
                          [[item]]
                        </button>
                      </template>
                    </div>
                  </div>
                </div>

                <div class="navigation">
                  <button
                    type="button"
                    class="nav-button"
                    id="prevMonth"
                    aria-label$="[[_previousMonthAriaLabel]]"
                    title$="[[_previousMonthAriaLabel]]"
                    tabindex="0"
                    on-mousedown="_preventNavButtonFocus"
                    on-click="_previousMonth"
                    on-keydown="_handleNavButtonKeydown"
                    disabled$="[[_isPreviousMonthDisabled()]]"
                  >
                    <iron-icon icon="icons:chevron-left"></iron-icon>
                  </button>

                  <button
                    type="button"
                    class="nav-button"
                    id="nextMonth"
                    aria-label$="[[_nextMonthAriaLabel]]"
                    title$="[[_nextMonthAriaLabel]]"
                    tabindex="0"
                    on-mousedown="_preventNavButtonFocus"
                    on-click="_nextMonth"
                    on-keydown="_handleNavButtonKeydown"
                    disabled$="[[_isNextMonthDisabled()]]"
                  >
                    <iron-icon icon="icons:chevron-right"></iron-icon>
                  </button>
                </div>
              </div>

              <div class="weekday-headers" role="row">
                <template is="dom-repeat" items="[[_weekdayNames]]">
                  <div class="weekday-header" role="columnheader">[[item]]</div>
                </template>
              </div>

              <div
                class="calendar-grid"
                role="grid"
                aria-label="[[i18n('customDatePicker.calendarDates')]]"
                aria-activedescendant$="[[_getActiveDescendant(_focusedDate)]]"
                on-keydown="_handleGridKeydown"
                on-click="_handleCalendarGridClick"
              >
                <template is="dom-repeat" items="[[_calendarDays]]">
                  <button
                    type="button"
                    class$="calendar-day [[_getDayClasses(item, _focusedDate)]]"
                    role="gridcell"
                    tabindex$="[[_getDayTabIndex(item, _focusedDate, index)]]"
                    aria-label$="[[_getDayAriaLabel(item)]]"
                    aria-selected$="[[item.isSelected]]"
                    aria-current$="[[_getAriaCurrent(item)]]"
                    disabled$="[[item.isDisabled]]"
                    data-date$="[[item.dateISO]]"
                    id$="date-[[item.dateISO]]"
                    on-click="_handleDateClick"
                    on-keydown="_handleDateKeydown"
                  >
                    [[item.day]]
                  </button>
                </template>
              </div>

              <div class="calendar-footer">
                <button type="button" class="footer-button today-button" on-click="_selectToday" tabindex="0">
                  [[i18n('customDatePicker.today')]]
                </button>
                <button type="button" class="footer-button cancel-button" on-click="_closeCalendar" tabindex="0">
                  [[i18n('customDatePicker.cancel')]]
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    constructor() {
      super();
      // Initialize with user's locale from browser
      const userLocale = navigator.languages !== undefined ? navigator.languages[0] : navigator.language;
      this._locale = userLocale || 'en-US';
      this._dateFormatter = new Intl.DateTimeFormat(this._locale);
      this._today = new Date();
      this._today.setHours(0, 0, 0, 0); // Normalize to start of day
      this._viewDate = new Date();
      this._focusedDate = null;
    }

    ready() {
      super.ready();

      // Set up moment locale like nuxeo-date-picker does for consistency
      const userLocale = navigator.languages !== undefined ? navigator.languages[0] : navigator.language;

      // Force moment to use the detected locale
      moment.locale(userLocale);

      this._locale = userLocale || 'en-US';
      this._dateFormatter = new Intl.DateTimeFormat(this._locale);
      this._today = new Date();
      this._today.setHours(0, 0, 0, 0); // Normalize to start of day
      this._viewDate = new Date();
      this._focusedDate = null;

      // Verify the locale is properly set
      const momentLocaleData = moment.localeData();
      const localeFormat = momentLocaleData.longDateFormat('L');

      // Force update the locale format for consistency
      this._currentLocaleFormat = localeFormat;

      // Detect RTL languages
      this._detectRTL(userLocale);

      // Set up internationalization
      this._setupI18n(userLocale);

      // Set up i18n configuration for compatibility with nuxeo-date-picker
      this.pickerI18n = {
        formatDate: (date) => {
          try {
            return this._formatDateForDisplay(date);
          } catch (error) {
            return date ? date.toLocaleDateString() : '';
          }
        },
        parseDate: (text) => {
          try {
            const formatToUse = this.format ? this.format : moment.localeData().longDateFormat('L');

            const date = this._moment(text, formatToUse, true); // strict parsing

            if (date.isValid()) {
              return {
                day: date.get('D'),
                month: date.get('M'),
                year: date.get('Y'),
              };
            }

            const fallbackDate = this._moment();
            return {
              day: fallbackDate.get('D'),
              month: fallbackDate.get('M'),
              year: fallbackDate.get('Y'),
            };
          } catch (error) {
            // Return current date instead of hardcoded values
            const fallbackDate = this._moment();
            return {
              day: fallbackDate.get('D'),
              month: fallbackDate.get('M'),
              year: fallbackDate.get('Y'),
            };
          }
        },
        monthNames: moment.months(),
        weekdays: moment.weekdays(),
        weekdaysShort: moment.weekdaysShort(),
        cancel: this.i18n('customDatePicker.cancel'),
        clear: this.i18n('customDatePicker.clear'),
        today: this.i18n('customDatePicker.today'),
        firstDayOfWeek: this.firstDayOfWeek || config.get('firstDayOfWeek', moment.localeData().firstDayOfWeek() || 0),
      };

      this._initializeLocaleData();
      this._generateYearOptions();
      this._generateCalendar();
      this._setupEventListeners();
      this._setupFocusTrap();
    }

    // Detect RTL languages
    _detectRTL(locale) {
      if (!locale) return;

      // Common RTL language codes
      const rtlLanguages = [
        'ar', // Arabic
        'he', // Hebrew
        'fa', // Persian/Farsi
        'ur', // Urdu
        'ps', // Pashto
        'sd', // Sindhi
        'ku', // Kurdish
        'dv', // Divehi/Maldivian
        'ckb', // Central Kurdish (Sorani)
        'az', // Azerbaijani (sometimes RTL)
        'ms-arab', // Malay Arabic script
        'uz-arab', // Uzbek Arabic script
        'pa-arab', // Punjabi Arabic script
        'ks-arab', // Kashmiri Arabic script
        'bal', // Balochi
        'glk', // Gilaki
        'lrc', // Northern Luri
        'mzn', // Mazandarani
      ];

      // Extract language code from locale (e.g., 'ar-SA' -> 'ar')
      const languageCode = locale.toLowerCase().split('-')[0];

      // Also check for Arabic script indicators
      const isRTLScript = locale.toLowerCase().includes('-arab') || locale.toLowerCase().includes('arabic');

      // Set RTL if language or script indicates RTL
      this._isRTL = rtlLanguages.includes(languageCode) || isRTLScript;

      // Also check document direction as fallback
      if (!this._isRTL) {
        const documentDir = document.documentElement.dir || document.body.dir;
        this._isRTL = documentDir === 'rtl';
      }

      // Set dir attribute on host element for proper styling
      if (this._isRTL) {
        this.setAttribute('dir', 'rtl');
      } else {
        this.setAttribute('dir', 'ltr');
      }

      // Reposition calendar if it's open when RTL state changes
      if (this._isCalendarOpen) {
        this._positionCalendar();
      }
    }

    // Set up internationalization support (simplified - uses I18nBehavior)
    _setupI18n(locale) {
      this._locale = locale || 'en-US';
      this._detectRTL(locale);
    }

    // Get localized text with placeholder replacement
    _getLocalizedText(key, placeholders = {}) {
      let text = this.i18n(`customDatePicker.${key}`);

      // Replace placeholders
      Object.keys(placeholders).forEach((placeholder) => {
        const value = placeholders[placeholder];
        text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
      });

      return text;
    }

    // Screen reader announcement utility
    _announce(message) {
      try {
        const region = this.shadowRoot && this.shadowRoot.querySelector('#srStatus');
        if (!region) return;
        // Clear first to force announcement even if same text
        region.textContent = '';
        // Short delay ensures AT picks it up
        this.async(() => {
          region.textContent = message;
        }, 1);
      } catch (_) {
        // no-op
      }
    }

    _formatAriaDate(date) {
      try {
        return new Intl.DateTimeFormat(this._locale || (navigator && navigator.language) || 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date);
      } catch (_) {
        return date && date.toDateString ? date.toDateString() : '';
      }
    }

    // Add _moment method for timezone handling like nuxeo-date-picker
    _moment(...args) {
      const fn = this.timezone === 'Etc/UTC' ? moment.utc : moment;
      return fn(...args);
    }

    // Robust parser for date-only strings (YYYY-MM-DD) to local Date at start of day
    _parseDateOnly(value) {
      if (!value) return null;
      try {
        if (typeof value === 'string') {
          const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (m) {
            const year = parseInt(m[1], 10);
            const month = parseInt(m[2], 10) - 1;
            const day = parseInt(m[3], 10);
            const d = new Date(year, month, day);
            d.setHours(0, 0, 0, 0);
            return Number.isNaN(d.getTime()) ? null : d;
          }
        }
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        return d;
      } catch (_) {
        return null;
      }
    }

    // Professional date parser - handles ISO strings with validation
    _parseDateFromISO(isoString) {
      if (!isoString || typeof isoString !== 'string') return null;

      try {
        // Strict ISO format validation: YYYY-MM-DD
        const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return null;

        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);

        // Validate ranges
        if (year < 1000 || year > 9999) return null;
        if (month < 1 || month > 12) return null;
        if (day < 1 || day > 31) return null;

        // Create date using 0-based month for JS Date constructor
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);

        // Validate that the date components match (catches invalid dates like Feb 30)
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
          return null;
        }

        return date;
      } catch (error) {
        return null;
      }
    }

    _initializeLocaleData() {
      this._monthNames = [];
      for (let i = 0; i < 12; i++) {
        const date = new Date(2024, i, 1);
        this._monthNames.push(new Intl.DateTimeFormat(this._locale, { month: 'long' }).format(date));
      }

      this._weekdayNames = [];
      // Handle firstDayOfWeek for proper week display
      const firstDay = this.firstDayOfWeek || config.get('firstDayOfWeek', moment.localeData().firstDayOfWeek() || 0);
      const baseDate = new Date(2024, 0, 7); // Start with a Sunday
      for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + ((firstDay + i) % 7));
        this._weekdayNames.push(new Intl.DateTimeFormat(this._locale, { weekday: 'short' }).format(date));
      }
    }

    _generateYearOptions() {
      // Fixed year range from 1900 to 2099
      const startYear = 1900;
      const endYear = 2099;

      // Apply min/max constraints if specified
      let minYear = startYear;
      let maxYear = endYear;

      if (this.min) {
        const minDate = new Date(this.min);
        if (!Number.isNaN(minDate.getTime())) {
          minYear = Math.max(startYear, minDate.getFullYear());
        }
      }

      if (this.max) {
        const maxDate = new Date(this.max);
        if (!Number.isNaN(maxDate.getTime())) {
          maxYear = Math.min(endYear, maxDate.getFullYear());
        }
      }

      this._yearOptions = [];
      for (let year = minYear; year <= maxYear; year++) {
        this._yearOptions.push(year);
      }
    }

    _generateMonthYearOptions() {
      // Use 1900-2099 range but respect min/max constraints
      let startYear = 1900;
      let endYear = 2099;

      // Apply min/max constraints if specified
      if (this.min) {
        const minDate = new Date(this.min);
        if (!Number.isNaN(minDate.getTime())) {
          startYear = Math.max(startYear, minDate.getFullYear());
        }
      }

      if (this.max) {
        const maxDate = new Date(this.max);
        if (!Number.isNaN(maxDate.getTime())) {
          endYear = Math.min(endYear, maxDate.getFullYear());
        }
      }

      this._monthYearOptions = [];
      for (let year = startYear; year <= endYear; year++) {
        for (let month = 0; month < 12; month++) {
          const date = new Date(year, month, 1);

          // Check if this month-year combination is within min/max range
          let isValidMonthYear = true;

          if (this.min) {
            const minDate = new Date(this.min);
            const endOfMonth = new Date(year, month + 1, 0); // Last day of the month
            if (endOfMonth < minDate) {
              isValidMonthYear = false;
            }
          }

          if (this.max && isValidMonthYear) {
            const maxDate = new Date(this.max);
            if (date > maxDate) {
              isValidMonthYear = false;
            }
          }

          if (isValidMonthYear) {
            const label = new Intl.DateTimeFormat(this._locale, {
              month: 'long',
              year: 'numeric',
            }).format(date);

            this._monthYearOptions.push({
              label,
              value: `${year}-${month}`,
              year,
              month,
            });
          }
        }
      }
    }

    /**
     * Generates the calendar days for the current view month, including days from previous and next months
     * to fill a 6x7 grid (42 days). This ensures the calendar always displays 6 weeks, which covers all possible
     * month layouts (some months span 6 weeks depending on the starting weekday).
     */
    _generateCalendar() {
      if (!this._viewDate) return;

      const year = this._viewDate.getFullYear();
      const month = this._viewDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const firstDayOfWeek =
        this.firstDayOfWeek || config.get('firstDayOfWeek', moment.localeData().firstDayOfWeek() || 0);
      const startDate = new Date(firstDay);
      const dayOffset = (firstDay.getDay() - firstDayOfWeek + 7) % 7;
      startDate.setDate(1 - dayOffset);

      const days = [];

      for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);

        const isCurrentMonth = currentDate.getMonth() === month && currentDate.getFullYear() === year;
        const isToday = this._isSameDay(currentDate, this._today) && isCurrentMonth;

        // Check if this date is selected
        let isSelected = false;
        if (this._selectedDate && isCurrentMonth) {
          isSelected =
            currentDate.getFullYear() === this._selectedDate.getFullYear() &&
            currentDate.getMonth() === this._selectedDate.getMonth() &&
            currentDate.getDate() === this._selectedDate.getDate();
        }

        const isDisabled = this._isDateDisabled(currentDate);
        const isEmpty = !isCurrentMonth;

        // Create ISO string for data attribute using professional method
        const dateISO = this._dateToISO(currentDate);

        days.push({
          date: new Date(currentDate),
          day: isEmpty ? '' : currentDate.getDate(),
          dateISO,
          isCurrentMonth,
          isToday,
          isSelected,
          isDisabled,
          isOtherMonth: !isCurrentMonth,
          isEmpty,
        });
      }

      this.set('_calendarDays', days);

      // Update navigation buttons
      this.async(() => {
        this._updateNavigationButtonStates();
      }, 10);
    }

    // Method to force update of navigation button states
    _updateNavigationButtonStates() {
      const prevButton = this.shadowRoot.querySelector('#prevMonth');
      const nextButton = this.shadowRoot.querySelector('#nextMonth');

      // Track the currently focused nav button before updating disabled state, so that
      // we can move focus to a safe element if the focused button is about to be disabled.
      // Without this, the browser blurs the disabled button to <body>, which can trigger
      // outer focusout listeners (e.g. in nuxeo-date-picker) that end up closing the calendar.
      const activeElement = this.shadowRoot.activeElement;

      const isPrevDisabled = prevButton ? this._isPreviousMonthDisabled() : false;
      const isNextDisabled = nextButton ? this._isNextMonthDisabled() : false;

      if (prevButton) {
        prevButton.disabled = isPrevDisabled;
      }

      if (nextButton) {
        nextButton.disabled = isNextDisabled;
      }

      // If the currently focused nav button just became disabled, move focus to a
      // sibling element inside the calendar to keep focus within the popover.
      if (this._isCalendarOpen && this._isFocusedNavButtonNowDisabled(activeElement, prevButton, nextButton)) {
        const fallback = this._getNavButtonFallbackFocusTarget(
          activeElement,
          prevButton,
          nextButton,
          isPrevDisabled,
          isNextDisabled,
        );
        if (fallback && typeof fallback.focus === 'function') {
          fallback.focus();
        }
      }
    }

    _isFocusedNavButtonNowDisabled(activeElement, prevButton, nextButton) {
      return (
        (activeElement === prevButton && this._isPreviousMonthDisabled()) ||
        (activeElement === nextButton && this._isNextMonthDisabled())
      );
    }

    _getNavButtonFallbackFocusTarget(activeElement, prevButton, nextButton, isPrevDisabled, isNextDisabled) {
      if (activeElement === prevButton && nextButton && !isNextDisabled) {
        return nextButton;
      }

      if (activeElement === nextButton && prevButton && !isPrevDisabled) {
        return prevButton;
      }

      return (
        this.shadowRoot.querySelector('.year-dropdown') ||
        this.shadowRoot.querySelector('.calendar-day[tabindex="0"]') ||
        this.shadowRoot.querySelector('.month-year-dropdown') ||
        this.shadowRoot.querySelector('#calendarPopover')
      );
    }

    _setupEventListeners() {
      // Navigation buttons are now handled by template bindings (on-click)

      // Input field events - only validation, no calendar opening on click or focus
      const dateInput = this.shadowRoot.querySelector('#dateInput');
      if (dateInput) {
        // Prevent calendar opening on input click or focus
        dateInput.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          // Just focus the input, don't open calendar
        });

        dateInput.addEventListener('keydown', (e) => {
          // Allow opening calendar with specific keys when input is focused
          if (e.key === 'F4' || e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            this._openCalendar(e, true); // Opened via keyboard
          } else if (e.key === 'Enter') {
            // Enter validates input
            // Don't validate if there are persistent errors - let user correct the input
            if (!this._errorPersists) {
              this._validateAndParseInput();
            }
          }
        });
      }

      // Calendar grid keyboard navigation
      const calendarGrid = this.shadowRoot.querySelector('.calendar-grid');
      if (calendarGrid) {
        calendarGrid.addEventListener('keydown', (e) => this._handleGridKeydown(e));
      }

      // Close year-dropdown when clicking outside it but inside the component
      this.shadowRoot.addEventListener(
        'click',
        (e) => {
          try {
            const yearOptions = this.shadowRoot.querySelector('#yearOptions');
            const yearDropdown = this.shadowRoot.querySelector('.year-dropdown');
            if (!yearOptions || !yearOptions.classList.contains('open')) return;
            if (!yearDropdown || !e.composedPath().includes(yearDropdown)) {
              this._closeYearDropdown();
            }
          } catch (_) {
            // no-op
          }
        },
        true,
      );

      // Focus trap and global key handling inside the popover (Tab/Escape)
      const popover = this.shadowRoot.querySelector('#calendarPopover');
      if (popover) {
        popover.addEventListener('keydown', (e) => this._handlePopoverKeydown(e));

        // Add click handler to popover to handle internal clicks appropriately
        popover.addEventListener(
          'click',
          (e) => {
            // Mark that we're interacting with the calendar
            this._interactingWithCalendar = true;

            // Clear the flag after a short delay
            this.async(() => {
              this._interactingWithCalendar = false;
            }, 50);

            // Only stop propagation for clicks on non-interactive elements
            const { target } = e;
            const isInteractiveElement =
              target.closest('button') ||
              target.closest('select') ||
              target.closest('[role="button"]') ||
              target.closest('[role="option"]') ||
              target.closest('.year-option') ||
              target.closest('.year-dropdown') ||
              target.closest('.nav-button') ||
              target.closest('.calendar-day') ||
              target.closest('.footer-button') ||
              target.closest('.today-button') ||
              target.closest('.cancel-button');

            // Only stop propagation for empty area clicks, not interactive elements
            if (!isInteractiveElement) {
              e.stopPropagation();
            }
          },
          true,
        );
      }

      // Document events
      document.addEventListener('click', (e) => this._handleDocumentClick(e));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this._isCalendarOpen) {
          this._closeCalendar();
        }
      });

      // Bug fix: Close calendar when focus moves outside the component
      // Enable focus-based closing for better UX when focus moves outside
      document.addEventListener('focusin', (e) => this._handleDocumentFocusIn(e));
      document.addEventListener('focusout', (e) => this._handleDocumentFocusOut(e));
    }

    _setupFocusTrap() {
      // Define the proper focus order for calendar accessibility
      this._focusOrder = [
        'year-dropdown', // Year selection
        'prevMonth', // Previous month button
        'nextMonth', // Next month button
        'calendar-grid', // Date grid (managed separately)
        'today-button', // Today button
        'cancel-button', // Cancel button
      ];
    }

    _handlePopoverKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this._closeCalendar();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        this._handleCalendarTabNavigation(e.shiftKey);
        return;
      }

      // Focus may be on month/year, prev/next, Today, or Cancel — not on a .calendar-day.
      // Those targets do not stopPropagation; keys then bubble to ancestor iron-list
      // (nuxeo-data-table): arrows move row focus; Enter runs selection / _focusPhysicalItem
      // and prevents footer buttons from receiving activation (WEBUI-1986 follow-up).
      if (this._isCalendarOpen) {
        const blockAncestors = new Set([
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Home',
          'End',
          'PageUp',
          'PageDown',
          'Enter',
          ' ',
        ]);
        if (blockAncestors.has(e.key)) {
          e.stopPropagation();
        }
      }
    }

    // Professional focus management for calendar
    _handleCalendarTabNavigation(isShiftTab) {
      if (!this._isCalendarOpen) return;

      const currentFocused = this.shadowRoot.activeElement;
      const currentElement = this._identifyCurrentFocusElement(currentFocused);

      let nextIndex;
      const currentIndex = this._focusOrder.indexOf(currentElement);

      if (isShiftTab) {
        // Shift+Tab: Move backward
        nextIndex = currentIndex <= 0 ? this._focusOrder.length - 1 : currentIndex - 1;
      } else {
        // Tab: Move forward
        nextIndex = currentIndex >= this._focusOrder.length - 1 ? 0 : currentIndex + 1;
      }

      const nextElement = this._focusOrder[nextIndex];
      this._focusCalendarElement(nextElement);
    }

    // Identify which focus element is currently active
    _identifyCurrentFocusElement(element) {
      if (!element) return this._focusOrder[0];

      if (element.classList.contains('year-dropdown') || element.closest('.year-dropdown')) {
        return 'year-dropdown';
      }
      if (element.id === 'prevMonth') {
        return 'prevMonth';
      }
      if (element.id === 'nextMonth') {
        return 'nextMonth';
      }
      if (element.classList.contains('calendar-day') || element.closest('.calendar-grid')) {
        return 'calendar-grid';
      }
      if (element.classList.contains('today-button')) {
        return 'today-button';
      }
      if (element.classList.contains('cancel-button')) {
        return 'cancel-button';
      }

      // Default to first element
      return this._focusOrder[0];
    }

    // Focus a specific calendar element by name
    _focusCalendarElement(elementName) {
      let targetElement = null;

      switch (elementName) {
        case 'year-dropdown':
          targetElement = this.shadowRoot.querySelector('.year-dropdown');
          break;
        case 'prevMonth':
          targetElement = this.shadowRoot.querySelector('#prevMonth');
          if (targetElement && targetElement.disabled) {
            // Skip disabled prev button
            this._focusCalendarElement(this._focusOrder[this._focusOrder.indexOf('prevMonth') + 1]);
            return;
          }
          break;
        case 'nextMonth':
          targetElement = this.shadowRoot.querySelector('#nextMonth');
          if (targetElement && targetElement.disabled) {
            // Skip disabled next button
            this._focusCalendarElement(this._focusOrder[this._focusOrder.indexOf('nextMonth') + 1]);
            return;
          }
          break;
        case 'calendar-grid':
          // Focus the appropriate date in the grid
          this._focusCalendarGrid();
          return;
        case 'today-button':
          targetElement = this.shadowRoot.querySelector('.today-button');
          break;
        case 'cancel-button':
          targetElement = this.shadowRoot.querySelector('.cancel-button');
          break;
        default:
          // Fallback: focus the first available date in the grid
          this._focusCalendarGrid();
          break;
      }

      if (targetElement && !targetElement.disabled) {
        targetElement.focus();
      } else {
        // If target is disabled, skip to next element
        const currentIndex = this._focusOrder.indexOf(elementName);
        const nextIndex = (currentIndex + 1) % this._focusOrder.length;
        this._focusCalendarElement(this._focusOrder[nextIndex]);
      }
    }

    // Focus management for calendar grid
    _focusCalendarGrid() {
      // Ensure calendar is generated first
      if (!this._calendarDays || this._calendarDays.length === 0) {
        this._generateCalendar();
      }

      // Find the appropriate date to focus
      let targetDate = null;

      if (this._focusedDate) {
        targetDate = this._focusedDate;
      } else if (
        this._selectedDate &&
        this._selectedDate.getMonth() === this._viewDate.getMonth() &&
        this._selectedDate.getFullYear() === this._viewDate.getFullYear()
      ) {
        targetDate = this._selectedDate;
      } else if (
        this._today.getMonth() === this._viewDate.getMonth() &&
        this._today.getFullYear() === this._viewDate.getFullYear()
      ) {
        targetDate = this._today;
      } else {
        // First day of current month
        targetDate = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth(), 1);
      }

      if (targetDate) {
        this._focusDate(targetDate);
      } else {
        // Continue execution without special focus handling
      }
    }

    _toggleMonthYearDropdown(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const monthYearOptions = this.shadowRoot.querySelector('#monthYearOptions');
      if (monthYearOptions) {
        const isOpen = monthYearOptions.classList.contains('open');
        this._isYearDropdownOpen = !isOpen;
        monthYearOptions.classList.toggle('open');

        if (!isOpen) {
          // When opening, focus and scroll to current month-year
          this.async(() => {
            this._focusCurrentMonthYear();
            this._scrollToCurrentMonthYear();
          }, 100);
        }
      }
    }

    _scrollToCurrentMonthYear() {
      const currentYear = this._viewDate.getFullYear();
      const currentMonth = this._viewDate.getMonth();
      const monthYearValue = `${currentYear}-${currentMonth}`;
      const monthYearButton = this.shadowRoot.querySelector(`[data-month-year="${monthYearValue}"]`);
      const monthYearOptions = this.shadowRoot.querySelector('#monthYearOptions');

      if (monthYearButton && monthYearOptions) {
        const containerHeight = monthYearOptions.clientHeight;
        const buttonHeight = monthYearButton.offsetHeight;
        const buttonTop = monthYearButton.offsetTop;
        const scrollTop = buttonTop - containerHeight / 2 + buttonHeight / 2;

        monthYearOptions.scrollTop = Math.max(0, scrollTop);
      }
    }

    _setupMonthYearKeyNavigation() {
      const monthYearOptions = this.shadowRoot.querySelector('#monthYearOptions');
      if (monthYearOptions) {
        monthYearOptions.addEventListener('keydown', (e) => this._handleMonthYearKeyDown(e));
      }
    }

    _focusCurrentMonthYear() {
      const currentYear = this._viewDate.getFullYear();
      const currentMonth = this._viewDate.getMonth();
      const monthYearValue = `${currentYear}-${currentMonth}`;
      const monthYearButton = this.shadowRoot.querySelector(`[data-month-year="${monthYearValue}"]`);

      if (monthYearButton) {
        monthYearButton.tabIndex = 0;
        monthYearButton.focus();

        // Set up keyboard navigation for month-year options
        this._setupMonthYearKeyNavigation();
      }
    }

    _handleMonthYearKeyDown(e) {
      const currentFocused = this.shadowRoot.activeElement;
      if (!currentFocused || !currentFocused.classList.contains('month-year-option')) return;

      const allMonthYearButtons = Array.from(this.shadowRoot.querySelectorAll('.month-year-option'));
      const currentIndex = allMonthYearButtons.indexOf(currentFocused);
      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = Math.min(allMonthYearButtons.length - 1, currentIndex + 1);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = allMonthYearButtons.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          currentFocused.click();
          return;
        case 'Escape':
          e.preventDefault();
          this._closeMonthYearDropdown();
          return;
        default:
          break;
      }

      if (nextIndex !== currentIndex) {
        currentFocused.tabIndex = -1;
        allMonthYearButtons[nextIndex].tabIndex = 0;
        allMonthYearButtons[nextIndex].focus();
      }
    }

    _closeMonthYearDropdown() {
      const monthYearOptions = this.shadowRoot.querySelector('#monthYearOptions');
      if (monthYearOptions) {
        monthYearOptions.classList.remove('open');
        this._isYearDropdownOpen = false;

        // Return focus to month-year dropdown button
        const monthYearDropdown = this.shadowRoot.querySelector('.month-year-dropdown');
        if (monthYearDropdown) {
          monthYearDropdown.focus();
        }
      }
    }

    _selectMonthYear(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const button = e.target.closest('.month-year-option');
      const monthYearValue = button ? button.dataset.monthYear : null;

      if (monthYearValue) {
        const [year, month] = monthYearValue.split('-').map(Number);
        const newDate = new Date(year, month, 1);
        this._viewDate = newDate;

        // Clear focused date when changing month/year
        this._focusedDate = null;

        this._generateCalendar();

        // Close the dropdown
        this._closeMonthYearDropdown();
      }
    }

    _getMonthYearOptionClass(item, viewDate) {
      if (!viewDate || !item) return '';
      return item.year === viewDate.getFullYear() && item.month === viewDate.getMonth() ? 'selected' : '';
    }

    _getDropdownIcon(isOpen) {
      return isOpen ? 'icons:arrow-drop-up' : 'icons:arrow-drop-down';
    }

    _getMonthName(date) {
      if (!date) return '';

      const locale = (this._locale || navigator.language).replace('_', '-');

      try {
        // ✅ Primary: Intl
        return new Intl.DateTimeFormat(locale, {
          month: 'long',
        }).format(date);
      } catch (e) {
        // ⚠️ Fallback: Use i18n for English months
        const lang = locale.split('-')[0];
        const monthIndex = date.getMonth();

        // Use i18n for English months from messages.json
        if (lang === 'en') {
          const monthNames = [
            'customDatePicker.january',
            'customDatePicker.february',
            'customDatePicker.march',
            'customDatePicker.april',
            'customDatePicker.may',
            'customDatePicker.june',
            'customDatePicker.july',
            'customDatePicker.august',
            'customDatePicker.september',
            'customDatePicker.october',
            'customDatePicker.november',
            'customDatePicker.december',
          ];
          return monthIndex >= 0 && monthIndex < 12 ? this.i18n(monthNames[monthIndex]) : '';
        }

        // For other languages, return empty (Intl should handle them)
        return '';
      }
    }

    _getYear(date) {
      if (!date) return '';
      return date.getFullYear();
    }

    _handleDocumentClick(e) {
      if (!this._isCalendarOpen) return;

      // Check if click target is within this element's shadow DOM or calendar popover
      const { target } = e;
      let isInsideComponent = false;

      // Get all relevant elements
      const calendarPopover = this.shadowRoot.querySelector('#calendarPopover');
      const inputWrapper = this.shadowRoot.querySelector('.input-wrapper');
      const fieldWrapper = this.shadowRoot.querySelector('.field-wrapper');

      // First check: Is it within the calendar popover specifically?
      if (calendarPopover && (target === calendarPopover || calendarPopover.contains(target))) {
        isInsideComponent = true;
      }

      // Second check: Is it within the input wrapper area?
      if (!isInsideComponent && inputWrapper && (target === inputWrapper || inputWrapper.contains(target))) {
        isInsideComponent = true;
      }

      // Third check: Is it within the field wrapper?
      if (!isInsideComponent && fieldWrapper && (target === fieldWrapper || fieldWrapper.contains(target))) {
        isInsideComponent = true;
      }

      // Fourth check: Walk up the composed path to check for our component
      if (!isInsideComponent) {
        const path = e.composedPath ? e.composedPath() : [target];
        path.forEach((element) => {
          if (element === this || (element.host && element.host === this)) {
            isInsideComponent = true;
          }
          // Also check specific elements
          if (element === calendarPopover || element === inputWrapper || element === fieldWrapper) {
            isInsideComponent = true;
          }
        });
      }

      // Fifth check: Is it within our shadow root?
      if (!isInsideComponent && this.shadowRoot && this.shadowRoot.contains(target)) {
        isInsideComponent = true;
      }

      // Only close if we're absolutely sure it's outside and not during active interaction
      if (!isInsideComponent && !this._interactingWithCalendar) {
        this._closeCalendar();

        // Also close year dropdown if open
        const yearOptions = this.shadowRoot.querySelector('#yearOptions');
        if (yearOptions) {
          yearOptions.classList.remove('open');
          this._isYearDropdownOpen = false;
        }
      }
    }

    // Bug fix: Handle focus moving outside the component
    _handleDocumentFocusIn(e) {
      // Ignore transient focus changes right after calendar navigation interactions.
      if (this._isInputFocusCloseSuppressed()) {
        return;
      }

      // Handle year dropdown focus outside
      if (this._isYearDropdownOpen) {
        const focusedElement = e.target;
        const yearDropdown = this.shadowRoot.querySelector('.year-dropdown');
        const yearOptions = this.shadowRoot.querySelector('#yearOptions');

        // Check if focus moved outside the year dropdown area
        const isInsideYearDropdown =
          yearDropdown &&
          (yearDropdown.contains(focusedElement) || (yearOptions && yearOptions.contains(focusedElement)));

        if (!isInsideYearDropdown) {
          // Close year dropdown when focus moves outside
          this.async(() => {
            const currentFocus = document.activeElement;
            const stillOutside =
              !(yearDropdown && yearDropdown.contains(currentFocus)) &&
              !(yearOptions && yearOptions.contains(currentFocus));
            if (stillOutside) {
              this._closeYearDropdown();
            }
          }, 10);
        }
      }

      // Handle calendar focus outside - but be more conservative
      if (!this._isCalendarOpen) return;

      // Skip focus handling immediately after calendar opens to prevent auto-close
      if (this._justOpenedCalendar) {
        return;
      }

      // Check if the newly focused element is outside our component
      const focusedElement = e.target;

      // Only close calendar on focus change if the target is clearly outside and not body/html
      // This prevents closing when clicking on empty areas inside the calendar
      if (
        focusedElement &&
        focusedElement !== document.body &&
        focusedElement !== document.documentElement &&
        !this._isElementInsideComponent(focusedElement)
      ) {
        // Shorter delay for more responsive closing when focus moves outside
        this.async(() => {
          // Don't close if calendar was just opened
          if (this._justOpenedCalendar) {
            return;
          }

          // Double-check that focus is still outside and calendar is still open
          const currentFocus = document.activeElement;
          if (
            this._isCalendarOpen &&
            currentFocus &&
            currentFocus !== document.body &&
            currentFocus !== document.documentElement &&
            !this._isElementInsideComponent(currentFocus)
          ) {
            this._closeCalendar();

            // Also close year dropdown if open
            const yearOptions = this.shadowRoot.querySelector('#yearOptions');
            if (yearOptions && yearOptions.classList.contains('open')) {
              yearOptions.classList.remove('open');
              this._isYearDropdownOpen = false;
            }
          }
        }, 50); // Shorter delay for more responsive closing
      }
    }

    _handleDocumentFocusOut() {
      // This can be used for additional focus tracking if needed
    }

    // Helper method to check if an element is inside this component
    _isElementInsideComponent(element) {
      if (!element) return false;

      // Check if it's the component itself
      if (element === this) return true;

      // Check if it's inside the shadow DOM
      let current = element;
      while (current) {
        if (current.host === this) return true;
        current = current.parentElement || current.host;
      }

      // Check shadow root
      if (this.shadowRoot && this.shadowRoot.contains(element)) {
        return true;
      }

      return false;
    }

    _clearDate(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      this._selectedDate = null;
      this._focusedDate = null; // Clear focused date to remove any highlighting
      this._userIsTyping = false; // Clear typing state

      // Set flag to prevent error display BEFORE calling _safeSetValue
      // This ensures _valueChanged sees the flag when it runs
      this._justCleared = true;

      // Clear error state when user clears the date
      // Don't show error until next save button click
      this.invalid = false;
      this.errorReason = '';
      this.errorMessage = '';

      this._preventInputUpdate = true;
      this._inputValue = '';
      this._safeSetValue('');
      this._preventInputUpdate = false; // Reset flag

      // Notify Polymer of property changes to trigger template re-evaluation
      this.notifyPath('_justCleared');
      this.notifyPath('invalid');
      this.notifyPath('errorMessage');
      this.notifyPath('errorReason');

      // Regenerate calendar to remove any date highlighting
      this._generateCalendar();

      // Bug fix: Focus the input after clearing for better UX
      this.async(() => {
        const dateInput = this.shadowRoot.querySelector('#dateInput');
        if (dateInput) {
          dateInput.focus();
        }
      }, 10);
    }

    _onInputFocus() {
      // Close calendar when user focuses on input to type
      // But not if calendar was just opened via calendar icon
      if (this._isCalendarOpen && !this._openedViaCalendarIcon) {
        // Ignore transient input refocus that can occur right after calendar
        // navigation interactions (e.g. when a nav button becomes disabled at
        // min/max boundaries and outer wrappers momentarily re-route focus).
        if (this._isInputFocusCloseSuppressed()) {
          return;
        }

        // Use async to ensure this happens after any other click handlers
        this.async(() => {
          if (this._isInputFocusCloseSuppressed()) {
            return;
          }

          // Only close if the input is still the focused element. The wrapper element
          // (nuxeo-date-picker) re-focuses the host on focusout, which can transiently
          // route focus through the input even though the user is interacting with the
          // calendar (e.g. clicking month navigation buttons that become disabled).
          const dateInput = this.shadowRoot.querySelector('#dateInput');
          if (dateInput && this.shadowRoot.activeElement !== dateInput) {
            return;
          }
          this._closeCalendar();
        }, 1);
      }
    }

    _isInputFocusCloseSuppressed() {
      return this._suppressInputFocusCloseUntil && Date.now() < this._suppressInputFocusCloseUntil;
    }

    _onInputClick(e) {
      // Also handle click events to close calendar when user wants to type
      // But not if calendar was just opened via calendar icon
      if (this._isCalendarOpen && !this._openedViaCalendarIcon) {
        // Stop this click from bubbling to document handlers
        e.stopPropagation();

        // Close calendar immediately
        this._closeCalendar();
      }
    }

    _onInputBlur() {
      // User finished typing, validate and parse input
      // Keep userIsTyping true if there are persistent errors to preserve input
      if (!this._errorPersists) {
        this._userIsTyping = false;
        this._validateAndParseInput();
      }
      // If there are persistent errors, keep _userIsTyping true to prevent input clearing
    }

    _onCalendarIconFocus(e) {
      // Prevent the calendar icon from getting focused when clicked
      // This helps prevent focus conflicts that close the calendar
      if (this._openedViaCalendarIcon) {
        e.preventDefault();
        e.stopPropagation();
        // Blur the calendar icon to prevent focus issues
        this.async(() => {
          if (e.target) {
            e.target.blur();
          }
        }, 1);
      }
    }

    _onInputKeydown(e) {
      // Set typing flag when user starts typing
      if (!this._userIsTyping && e.key.length === 1) {
        this._userIsTyping = true;
      }

      if (e.key === 'ArrowDown' || e.key === 'F4') {
        e.preventDefault();
        this._openCalendar(e, true); // Opened via keyboard
      } else if (e.key === 'Enter') {
        // Enter validates input
        e.preventDefault();
        // Don't set userIsTyping to false if there are persistent errors - preserve input
        if (!this._errorPersists) {
          this._userIsTyping = false;
          this._validateAndParseInput();
        }
        // If there are persistent errors, keep _userIsTyping true to prevent input clearing
      }
    }

    _onInputChange() {
      // Mark that user is actively typing when input content changes
      if (!this._userIsTyping) {
        this._userIsTyping = true;
      }

      // Clear error persistence when user starts typing again
      if (this._errorPersists) {
        this._errorPersists = false;
        // Clear the error state when user starts correcting
        this.invalid = false;
        this.errorReason = '';
        this.errorMessage = '';
        this._showErrors = false;

        // Notify Polymer of property changes
        this.notifyPath('invalid');
        this.notifyPath('errorMessage');
        this.notifyPath('errorReason');
        this.notifyPath('_showErrors');
      }
    }

    _selectDate(date) {
      if (!date) {
        return;
      }

      // Use professional validation
      const validation = this._validateDate(date);
      if (!validation.isValid) {
        // Set error state (range error - medium priority)
        this.invalid = true;
        this.errorReason = validation.errorReason;
        this.errorMessage = validation.errorMessage;
        this._showErrors = true;
        this._errorPersists = true; // Error should persist until resolved

        // Keep the user's input but clear the internal selected date
        // Don't clear the input value - let user correct it manually
        this._selectedDate = null;

        // Clear the internal value to prevent it from being saved
        this._preventInputUpdate = true;
        this._safeSetValue('');
        this._preventInputUpdate = false;

        // Update calendar to reflect no selected date
        this._generateCalendar();
        return;
      }

      // Create a clean date object to avoid any reference issues
      this._selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      this._selectedDate.setHours(0, 0, 0, 0);

      // Generate ISO string for internal value (YYYY-MM-DD format)
      const isoString = this._dateToISO(this._selectedDate);

      // Set component value
      this._userIsTyping = false;
      this._preventInputUpdate = true;
      this._safeSetValue(isoString);

      // Format input display using professional locale formatting
      this._inputValue = this._formatDateForDisplay(this._selectedDate);

      // Reset the flag after updating input value
      this._preventInputUpdate = false;

      // Update UI
      this._focusedDate = null;
      this._generateCalendar();
      this._closeCalendar();

      // Clear all errors when valid date is selected (including required errors)
      this.invalid = false;
      this.errorMessage = '';
      this.errorReason = '';

      // Clear flags when user provides valid input
      this._showErrors = false;
      this._justCleared = false;
      this._errorPersists = false; // Clear error persistence flag
    }

    _selectToday(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Create a fresh today date to ensure consistency
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this._selectDate(today);
    }

    // Separate method for mouse clicks to ensure proper detection
    _openCalendarViaMouse(e) {
      // Prevent the input from getting focused
      e.preventDefault();
      e.stopPropagation();

      // Set flag to prevent input focus from closing calendar
      this._openedViaCalendarIcon = true;

      // Open calendar
      this._openCalendar(e, false); // Explicitly false for mouse

      // Prevent input from getting focused by temporarily removing its tabindex
      const input = this.shadowRoot.querySelector('#dateInput');
      if (input) {
        const originalTabIndex = input.getAttribute('tabindex');
        input.setAttribute('tabindex', '-1');

        // Restore tabindex after calendar is fully opened
        this.async(() => {
          if (originalTabIndex !== null) {
            input.setAttribute('tabindex', originalTabIndex);
          } else {
            input.removeAttribute('tabindex');
          }
          this._openedViaCalendarIcon = false;
        }, 500);
      } else {
        // Fallback: just clear the flag after delay
        this.async(() => {
          this._openedViaCalendarIcon = false;
        }, 500);
      }
    }

    _openCalendar(e, openedViaKeyboard = false) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (this.disabled || this._isCalendarOpen) return;

      // No auto-detection needed - explicitly handled by separate methods

      if (this._selectedDate) {
        this._viewDate = new Date(this._selectedDate);
        this._focusedDate = new Date(this._selectedDate);
      } else {
        let initialDate = new Date(this._today);

        // Prioritize min date for initial view when constraints exist
        // This ensures users see the valid range starting from the minimum date
        if (this.min) {
          const minDate = new Date(this.min);
          // Always start with min date when it exists, regardless of today's date
          initialDate = new Date(minDate);
        } else if (this.max) {
          // Only use max date if no min date is specified and today is after max
          const maxDate = new Date(this.max);
          if (initialDate > maxDate) {
            initialDate = new Date(maxDate);
          }
        }

        // Final validation: ensure initial date is within valid range
        if (this.min && this.max) {
          const minDate = new Date(this.min);
          const maxDate = new Date(this.max);

          if (initialDate < minDate) {
            initialDate = new Date(minDate);
          } else if (initialDate > maxDate) {
            initialDate = new Date(maxDate);
          }
        }

        this._viewDate = initialDate;
        this._focusedDate = null; // No focused date when no date is selected
      }

      this._generateYearOptions();
      this._generateCalendar();

      // Set flag to prevent immediate auto-close
      this._justOpenedCalendar = true;
      this._isCalendarOpen = true;

      const popover = this.shadowRoot.querySelector('#calendarPopover');
      const backdrop = this.shadowRoot.querySelector('#calendarBackdrop');
      const overlay = this.shadowRoot.querySelector('#calendarOverlay');
      if (popover) {
        popover.classList.add('open');
      }
      if (backdrop) {
        backdrop.classList.add('open');
      }
      if (overlay && typeof overlay.showPopover === 'function') {
        try {
          overlay.showPopover();
        } catch (_) {
          /* already open or unsupported environment */
        }
      }

      // Clear the flag after calendar has had time to settle
      this.async(() => {
        this._justOpenedCalendar = false;
      }, 200);
      // Position popover based on available viewport space
      this._positionPopover();
      // Reposition on resize/scroll while open
      this._boundReposition = this._boundReposition || (() => this._positionPopover());
      window.addEventListener('resize', this._boundReposition, {
        passive: true,
      });
      window.addEventListener('scroll', this._boundReposition, {
        passive: true,
      });
      // Also listen for orientation changes on mobile
      window.addEventListener('orientationchange', this._boundReposition, {
        passive: true,
      });

      // Listen for window resize to reposition calendar in RTL
      window.addEventListener('resize', this._boundReposition, {
        passive: true,
      });
      // Announce calendar opened
      this._announce(this._getLocalizedText('calendarOpened'));

      // Fire opened-changed event for compatibility with nuxeo-date-picker
      this.dispatchEvent(
        new CustomEvent('opened-changed', {
          detail: { value: true },
          bubbles: true,
          composed: true,
        }),
      );

      // Professional a11y: Focus behavior depends on interaction method
      this.async(() => {
        if (openedViaKeyboard) {
          // Keyboard opening: Start with year selection for full navigation control

          this._focusCalendarElement(this._focusOrder[0]); // year-dropdown
        } else {
          // Mouse opening: Aggressive focus management to prevent year dropdown focus

          // Immediately disable all potential auto-focus targets except date buttons
          const yearDropdown = this.shadowRoot.querySelector('.year-dropdown');
          const prevButton = this.shadowRoot.querySelector('#prevMonth');
          const nextButton = this.shadowRoot.querySelector('#nextMonth');
          const todayButton = this.shadowRoot.querySelector('.today-button');
          const cancelButton = this.shadowRoot.querySelector('.cancel-button');

          // Store original tabindex values
          const originalTabIndexes = new Map();
          [yearDropdown, prevButton, nextButton, todayButton, cancelButton].forEach((el) => {
            if (el) {
              originalTabIndexes.set(el, el.getAttribute('tabindex') || '0');
              el.setAttribute('tabindex', '-1');
            }
          });

          // Clear any existing focus
          if (this.shadowRoot.activeElement && this.shadowRoot.activeElement.blur) {
            this.shadowRoot.activeElement.blur();
          }

          // Use requestAnimationFrame to ensure our focus happens after any browser auto-focus
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this._focusCalendarGrid();

              // Force focus again if needed
              requestAnimationFrame(() => {
                const currentFocus = this.shadowRoot.activeElement;
                if (!currentFocus || !currentFocus.classList.contains('calendar-day')) {
                  this._focusCalendarGrid();
                }

                // Restore tabindex values
                originalTabIndexes.forEach((tabindex, element) => {
                  if (element) {
                    element.setAttribute('tabindex', tabindex);
                  }
                });

                // Final debug check
                // const finalFocus = this.shadowRoot.activeElement;
              });
            });
          });
        }
      }, 150);
    }

    _closeCalendar(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!this._isCalendarOpen) return;

      this._isCalendarOpen = false;
      this._justOpenedCalendar = false; // Clear flag when closing
      this._interactingWithCalendar = false; // Clear interaction flag

      const popover = this.shadowRoot.querySelector('#calendarPopover');
      const backdrop = this.shadowRoot.querySelector('#calendarBackdrop');
      const overlay = this.shadowRoot.querySelector('#calendarOverlay');
      if (overlay && typeof overlay.hidePopover === 'function') {
        try {
          overlay.hidePopover();
        } catch (_) {
          /* not open */
        }
      }
      if (popover) {
        popover.classList.remove('open');
        popover.classList.remove('open-up');
        popover.style.left = '';
        popover.style.right = '';
        popover.style.top = '';
        popover.style.bottom = '';
      }
      if (backdrop) {
        backdrop.classList.remove('open');
      }
      // Announce calendar closed
      this._announce(this._getLocalizedText('calendarClosed'));
      // Remove reposition listeners
      if (this._boundReposition) {
        window.removeEventListener('resize', this._boundReposition);
        window.removeEventListener('scroll', this._boundReposition);
        window.removeEventListener('orientationchange', this._boundReposition);
      }

      // Fire opened-changed event for compatibility with nuxeo-date-picker
      this.dispatchEvent(
        new CustomEvent('opened-changed', {
          detail: { value: false },
          bubbles: true,
          composed: true,
        }),
      );

      const dateInput = this.shadowRoot.querySelector('#dateInput');
      if (dateInput) {
        dateInput.focus();
      }
    }

    _toggleCalendar() {
      if (this._isCalendarOpen) {
        this._closeCalendar();
      } else {
        this._openCalendar();
      }
    }

    _previousMonth(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!this._viewDate) {
        return;
      }

      const newDate = new Date(this._viewDate);
      newDate.setMonth(newDate.getMonth() - 1);

      this._viewDate = newDate;

      // Clear focused date when changing months to prevent incorrect highlighting
      this._focusedDate = null;

      // Regenerate month-year options if we moved far from the current range
      this._generateMonthYearOptions();
      this._generateCalendar();
      this._announce(
        this._getLocalizedText('movedToMonth', {
          month: this._getMonthName(this._viewDate),
          year: this._getYear(this._viewDate),
        }),
      );

      // End nav-key interaction in the same lifecycle as month update.
      this._interactingWithCalendar = false;
    }

    _nextMonth(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!this._viewDate) {
        return;
      }

      const newDate = new Date(this._viewDate);
      newDate.setMonth(newDate.getMonth() + 1);

      this._viewDate = newDate;

      // Clear focused date when changing months to prevent incorrect highlighting
      this._focusedDate = null;

      // Regenerate month-year options if we moved far from the current range
      this._generateMonthYearOptions();
      this._generateCalendar();
      this._announce(
        this._getLocalizedText('movedToMonth', {
          month: this._getMonthName(this._viewDate),
          year: this._getYear(this._viewDate),
        }),
      );

      // End nav-key interaction in the same lifecycle as month update.
      this._interactingWithCalendar = false;
    }

    _changeYear(e) {
      const newYear = parseInt(e.target.value, 10);
      const newDate = new Date(this._viewDate);
      newDate.setFullYear(newYear);
      this._viewDate = newDate;
      this._generateCalendar();

      // Don't change focused date to today when changing year
      // Keep focused date in the same relative position
      if (this._focusedDate) {
        const newFocusDate = new Date(this._focusedDate);
        newFocusDate.setFullYear(newYear);
        // Check if this date exists in the new year/month
        if (newFocusDate.getMonth() === this._viewDate.getMonth()) {
          this._focusedDate = newFocusDate;
        } else {
          // If month changed due to date not existing, use first day of month
          this._focusedDate = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth(), 1);
        }
        this._focusDate(this._focusedDate);
      }
    }

    // Bug fix: Handle clicks on calendar grid to prevent unwanted behavior on empty areas
    _handleCalendarGridClick(e) {
      // Only allow clicks that are specifically on calendar day buttons
      const button = e.target.closest('.calendar-day');
      if (!button) {
        // Click was on empty area - prevent any default behavior
        e.preventDefault();
        e.stopPropagation();
      }
      // Let the button's own click handler deal with it
    }

    _handleDateClick(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const button = e.target.closest('.calendar-day');
      if (
        !button ||
        button.disabled ||
        button.classList.contains('empty') ||
        button.classList.contains('other-month')
      ) {
        return;
      }

      // Get the date from the button's data attribute
      const dateISO = button.dataset.date;
      if (!dateISO) {
        return;
      }

      // Use the professional ISO parser
      const selectedDate = this._parseDateFromISO(dateISO);
      if (!selectedDate) {
        return;
      }

      // Use professional validation
      const validation = this._validateDate(selectedDate);
      if (validation.isValid) {
        // Clear validation errors when valid date is selected
        this.invalid = false;
        this.errorReason = '';
        this.errorMessage = '';
        this._selectDate(selectedDate);
      } else {
        // Date is invalid - show appropriate error
        this.invalid = true;
        this.errorReason = validation.errorReason;
        this.errorMessage = validation.errorMessage;
        this._showErrors = true;
      }
    }

    _handleGridKeydown(e) {
      const currentButton = e.target;
      if (!currentButton.classList.contains('calendar-day')) return;

      const currentDate = new Date(currentButton.dataset.date);
      const targetDate = new Date(currentDate);

      // Stop bubbling so parent lists (e.g. iron-list in nuxeo-data-table) do not handle
      // Arrow keys / Enter and steal focus while the calendar is open (WEBUI-1986 follow-up).
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          // Allow selection of any current month date, not just non-empty
          if (!currentButton.disabled && currentButton.classList.contains('calendar-day')) {
            // Check if it's a valid current month date
            const isCurrentMonth =
              currentDate.getMonth() === this._viewDate.getMonth() &&
              currentDate.getFullYear() === this._viewDate.getFullYear();
            if (isCurrentMonth) {
              this._selectDate(currentDate);
            }
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          targetDate.setDate(currentDate.getDate() - 1);
          // Only navigate within current month - don't allow month transitions
          if (
            targetDate.getMonth() === this._viewDate.getMonth() &&
            targetDate.getFullYear() === this._viewDate.getFullYear()
          ) {
            this._focusDate(targetDate, false);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          targetDate.setDate(currentDate.getDate() + 1);
          // Only navigate within current month - don't allow month transitions
          if (
            targetDate.getMonth() === this._viewDate.getMonth() &&
            targetDate.getFullYear() === this._viewDate.getFullYear()
          ) {
            this._focusDate(targetDate, false);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          targetDate.setDate(currentDate.getDate() - 7);
          // Only navigate within current month - don't allow month transitions
          if (
            targetDate.getMonth() === this._viewDate.getMonth() &&
            targetDate.getFullYear() === this._viewDate.getFullYear()
          ) {
            this._focusDate(targetDate, false);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          targetDate.setDate(currentDate.getDate() + 7);
          // Only navigate within current month - don't allow month transitions
          if (
            targetDate.getMonth() === this._viewDate.getMonth() &&
            targetDate.getFullYear() === this._viewDate.getFullYear()
          ) {
            this._focusDate(targetDate, false);
          }
          break;

        case 'Home': {
          e.preventDefault();
          e.stopPropagation();
          const dayOfWeek = currentDate.getDay();
          targetDate.setDate(currentDate.getDate() - dayOfWeek);
          // Only navigate within current month - don't allow month transitions
          if (
            targetDate.getMonth() === this._viewDate.getMonth() &&
            targetDate.getFullYear() === this._viewDate.getFullYear()
          ) {
            this._focusDate(targetDate, false);
          }
          break;
        }

        case 'End': {
          e.preventDefault();
          e.stopPropagation();
          const daysToEnd = 6 - currentDate.getDay();
          targetDate.setDate(currentDate.getDate() + daysToEnd);
          // Only navigate within current month - don't allow month transitions
          if (
            targetDate.getMonth() === this._viewDate.getMonth() &&
            targetDate.getFullYear() === this._viewDate.getFullYear()
          ) {
            this._focusDate(targetDate, false);
          }
          break;
        }

        case 'PageUp':
          e.preventDefault();
          e.stopPropagation();
          // PageUp: Previous year only - no month navigation via keyboard
          targetDate.setFullYear(currentDate.getFullYear() - 1);
          this._focusDateWithMonthTransition(targetDate);
          break;

        case 'PageDown':
          e.preventDefault();
          e.stopPropagation();
          // PageDown: Next year only - no month navigation via keyboard
          targetDate.setFullYear(currentDate.getFullYear() + 1);
          this._focusDateWithMonthTransition(targetDate);
          break;
        default:
          break;
      }
    }

    _focusDateWithMonthTransition(targetDate) {
      // Check if the target date is in a different month/year
      const currentMonth = this._viewDate.getMonth();
      const currentYear = this._viewDate.getFullYear();
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();

      if (targetMonth !== currentMonth || targetYear !== currentYear) {
        // We need to change the view to the target month
        this._viewDate = new Date(targetDate);
        this._generateCalendar();

        // Announce the month change
        this._announce(
          this._getLocalizedText('movedToMonth', {
            month: this._getMonthName(this._viewDate),
            year: this._getYear(this._viewDate),
          }),
        );

        // Focus the target date after the calendar is regenerated
        this.async(() => {
          this._focusDate(targetDate, false);
        }, 50);
      } else {
        // Same month, just focus the date
        this._focusDate(targetDate, false);
      }
    }

    _focusDate(date, allowCrossMonth = false) {
      // Update focused date
      this._focusedDate = new Date(date);
      this._focusedDate.setHours(0, 0, 0, 0);

      // Focus the date element
      this.async(() => {
        // Use local date formatting to avoid timezone issues
        const year = this._focusedDate.getFullYear();
        const month = String(this._focusedDate.getMonth() + 1).padStart(2, '0');
        const day = String(this._focusedDate.getDate()).padStart(2, '0');
        const dateISO = `${year}-${month}-${day}`;

        const button = this.shadowRoot.querySelector(`[data-date="${dateISO}"]`);
        if (button) {
          // For keyboard navigation, allow focusing any date including empty ones
          if (allowCrossMonth || (!button.classList.contains('empty') && !button.disabled)) {
            button.focus();
            return;
          }
        }

        // If we can't focus the target date, find a valid one in current month
        if (!allowCrossMonth) {
          this._findAndFocusNearestValidDate(date);
        }
      }, 50);
    }

    _findAndFocusNearestValidDate(targetDate) {
      // Find the first valid date in the current month
      const year = this._viewDate.getFullYear();
      const month = this._viewDate.getMonth();

      // If targetDate is provided and it's in the current month, try to use it
      if (targetDate && targetDate.getMonth() === month && targetDate.getFullYear() === year) {
        const targetYear = targetDate.getFullYear();
        const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
        const targetDay = String(targetDate.getDate()).padStart(2, '0');
        const dateISO = `${targetYear}-${targetMonth}-${targetDay}`;

        const button = this.shadowRoot.querySelector(`[data-date="${dateISO}"]`);
        if (button && !button.disabled && !button.classList.contains('empty')) {
          this._focusedDate = new Date(targetDate);
          button.focus();
          return;
        }
      }

      // Try the selected date first if it's in the current month
      if (this._selectedDate && this._selectedDate.getMonth() === month && this._selectedDate.getFullYear() === year) {
        // Use local date formatting to avoid timezone issues
        const selYear = this._selectedDate.getFullYear();
        const selMonth = String(this._selectedDate.getMonth() + 1).padStart(2, '0');
        const selDay = String(this._selectedDate.getDate()).padStart(2, '0');
        const dateISO = `${selYear}-${selMonth}-${selDay}`;

        const button = this.shadowRoot.querySelector(`[data-date="${dateISO}"]`);
        if (button && !button.disabled && !button.classList.contains('empty')) {
          this._focusedDate = new Date(this._selectedDate);
          button.focus();
          return;
        }
      }

      // Try today if it's in the current month
      if (this._today.getMonth() === month && this._today.getFullYear() === year) {
        // Use local date formatting to avoid timezone issues
        const todayYear = this._today.getFullYear();
        const todayMonth = String(this._today.getMonth() + 1).padStart(2, '0');
        const todayDay = String(this._today.getDate()).padStart(2, '0');
        const dateISO = `${todayYear}-${todayMonth}-${todayDay}`;

        const button = this.shadowRoot.querySelector(`[data-date="${dateISO}"]`);
        if (button && !button.disabled && !button.classList.contains('empty')) {
          this._focusedDate = new Date(this._today);
          button.focus();
          return;
        }
      }

      // Try the first day of the month
      const firstValidDate = new Date(year, month, 1);
      // Use local date formatting to avoid timezone issues
      const firstYear = firstValidDate.getFullYear();
      const firstMonth = String(firstValidDate.getMonth() + 1).padStart(2, '0');
      const firstDay = String(firstValidDate.getDate()).padStart(2, '0');
      let dateISO = `${firstYear}-${firstMonth}-${firstDay}`;

      let button = this.shadowRoot.querySelector(`[data-date="${dateISO}"]`);

      if (button && !button.disabled && !button.classList.contains('empty')) {
        this._focusedDate = firstValidDate;
        button.focus();
        return;
      }

      // Otherwise, find any valid date in the current month
      for (let day = 1; day <= 31; day++) {
        const testDate = new Date(year, month, day);
        if (testDate.getMonth() !== month) break; // Gone past the end of the month

        // Use local date formatting to avoid timezone issues
        const testYear = testDate.getFullYear();
        const testMonth = String(testDate.getMonth() + 1).padStart(2, '0');
        const testDay = String(testDate.getDate()).padStart(2, '0');
        dateISO = `${testYear}-${testMonth}-${testDay}`;

        button = this.shadowRoot.querySelector(`[data-date="${dateISO}"]`);
        if (button && !button.disabled && !button.classList.contains('empty')) {
          this._focusedDate = testDate;
          button.focus();
          return;
        }
      }
    }

    _focusFirstAvailableDate() {
      // Only set focus if we have a selected date or if explicitly needed
      let targetDate = null;

      if (
        this._selectedDate &&
        this._selectedDate.getMonth() === this._viewDate.getMonth() &&
        this._selectedDate.getFullYear() === this._viewDate.getFullYear()
      ) {
        targetDate = new Date(this._selectedDate);
      } else if (
        this._today.getMonth() === this._viewDate.getMonth() &&
        this._today.getFullYear() === this._viewDate.getFullYear()
      ) {
        targetDate = new Date(this._today);
      } else {
        // If no selected date and today is not in current month, focus first day of month
        targetDate = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth(), 1);
      }

      if (targetDate) {
        this._focusedDate = targetDate;
        this._generateCalendar(); // Regenerate to update tabindex
        this.async(() => {
          const year = targetDate.getFullYear();
          const month = String(targetDate.getMonth() + 1).padStart(2, '0');
          const day = String(targetDate.getDate()).padStart(2, '0');
          const dateISO = `${year}-${month}-${day}`;
          const button = this.shadowRoot.querySelector(`[data-date="${dateISO}"]`);
          if (button && !button.disabled && !button.classList.contains('empty')) {
            button.focus();
          }
        }, 50);
      }
    }

    _parseAndSetDate() {
      // This method is now replaced by _validateAndParseInput
      this._validateAndParseInput();
    }

    _parseWithFormat(inputValue, format) {
      try {
        // Use moment.js for reliable parsing
        const effectiveFormat = format || this.format || moment.localeData().longDateFormat('L');

        const momentDate = this._moment(inputValue, effectiveFormat, true); // strict parsing

        if (momentDate.isValid()) {
          const jsDate = momentDate.toDate();
          jsDate.setHours(0, 0, 0, 0); // Normalize to start of day
          return jsDate;
        }

        return null;
      } catch (e) {
        return null;
      }
    }

    _validateAndParseInput() {
      const input = this.shadowRoot.querySelector('#dateInput');
      if (!input) return;

      const value = input.value ? input.value.trim() : '';

      // If empty, clear everything
      if (!value) {
        this._selectedDate = null;
        this._preventInputUpdate = true;
        this._safeSetValue('');
        this._preventInputUpdate = false; // Reset flag
        // Clear error state when input is empty
        // Don't show error until next save button click
        this.invalid = false;
        this.errorReason = '';
        this.errorMessage = '';

        // Set flag to prevent error display
        this._justCleared = true;

        // Notify Polymer of property changes to trigger template re-evaluation
        this.notifyPath('_justCleared');
        this.notifyPath('invalid');
        this.notifyPath('errorMessage');
        this.notifyPath('errorReason');
        this._generateCalendar();
        return;
      }

      // Use professional parser
      const parseResult = this._parseUserInput(value);

      if (!parseResult) {
        // Could not parse the date at all - format error (highest priority)
        this.invalid = true;
        this.errorReason = 'format';
        const expectedFormat = this._getDatePlaceholder(this.format);
        this.errorMessage = `${this._getLocalizedText('incorrectFormat')} Expected format: ${expectedFormat}`;
        this._showErrors = true;
        this._errorPersists = true; // Error should persist until resolved

        // Keep the user's input but clear the internal selected date
        // Don't clear the input value - let user correct it manually
        this._selectedDate = null;

        // Clear the internal value to prevent it from being saved
        this._preventInputUpdate = true;
        this._safeSetValue('');
        this._preventInputUpdate = false;

        // Update calendar to reflect no selected date
        this._generateCalendar();
        return;
      }

      const { date: parsedDate, isExactFormat } = parseResult;

      // Use professional validation
      const validation = this._validateDate(parsedDate);
      if (!validation.isValid) {
        this.invalid = true;
        this.errorReason = validation.errorReason;
        this.errorMessage = validation.errorMessage;
        this._showErrors = true;
        this._errorPersists = true; // Error should persist until resolved

        // Keep the user's input but clear the internal selected date
        // Don't clear the input value - let user correct it manually
        this._selectedDate = null;

        // Clear the internal value to prevent it from being saved
        this._preventInputUpdate = true;
        this._safeSetValue('');
        this._preventInputUpdate = false;

        // Update calendar to reflect no selected date
        this._generateCalendar();
        return;
      }

      // Valid date - store it
      this._selectedDate = new Date(parsedDate);

      // Generate ISO string for internal value
      const isoString = this._dateToISO(this._selectedDate);
      this._preventInputUpdate = true;
      this._safeSetValue(isoString);

      // Keep user input as-is if it was in exact format, otherwise reformat
      if (!isExactFormat) {
        this._inputValue = this._formatDateForDisplay(this._selectedDate);
      }

      // Reset the flag after updating input value
      this._preventInputUpdate = false;

      // Navigate calendar to the selected date
      this._viewDate = new Date(this._selectedDate);
      this._generateCalendar();

      // Clear all errors when valid date is parsed (including required errors)
      this.invalid = false;
      this.errorReason = '';
      this.errorMessage = '';

      // Clear flags when user provides valid input
      this._showErrors = false;
      this._justCleared = false;
      this._errorPersists = false; // Clear error persistence flag
    }

    _safeSetValue(newValue) {
      try {
        // Don't set value if there are validation errors and user is typing
        // But allow clearing the value when there are validation errors
        if (this.invalid && this._userIsTyping && newValue !== '') {
          return; // Preserve user input when there are errors, but allow clearing
        }

        // Try multiple approaches to safely set the value
        if (this.set && typeof this.set === 'function') {
          this.set('value', newValue);
        } else if (Object.prototype.hasOwnProperty.call(this, 'value')) {
          this.value = newValue;
        } else {
          // Create the property if it doesn't exist
          Object.defineProperty(this, 'value', {
            value: newValue,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }

        // Also notify any property observers
        if (this.notifyPath && typeof this.notifyPath === 'function') {
          this.notifyPath('value');
        }
      } catch (error) {
        // Error setting value safely - using fallback
        // Last resort - try direct assignment
        try {
          this.value = newValue;
        } catch (fallbackError) {
          // Failed to set value with fallback - silent error
        }
      }
    }

    _updateInputValue() {
      if (this._selectedDate) {
        this._inputValue = this._formatDateForInput(this._selectedDate);
      } else {
        this._inputValue = '';
      }
    }

    _formatDateForInput(date) {
      if (!date) return '';

      // Use professional formatting
      return this._formatDateForDisplay(date);
    }

    _isSameDay(date1, date2) {
      if (!date1 || !date2) return false;

      // Normalize both dates to start of day for comparison
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);

      return d1.getTime() === d2.getTime();
    }

    _isValidDate(date) {
      // Basic date validation
      if (!date || Number.isNaN(date.getTime())) {
        return false;
      }

      // Normalize the input date to start of day for comparison
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Check min date constraint
      if (this.min) {
        const minDate = this._parseDateOnly(this.min);
        if (minDate) {
          minDate.setHours(0, 0, 0, 0);
          if (normalizedDate < minDate) {
            return false;
          }
        }
      }

      // Check max date constraint
      if (this.max) {
        const maxDate = this._parseDateOnly(this.max);
        if (maxDate) {
          maxDate.setHours(0, 0, 0, 0);
          if (normalizedDate > maxDate) {
            return false;
          }
        }
      }

      return true;
    }

    // Professional validation method like Vaadin
    _validateDate(date) {
      const result = {
        isValid: true,
        errorReason: '',
        errorMessage: '',
      };

      // Basic date validation
      if (!date || Number.isNaN(date.getTime())) {
        result.isValid = false;
        result.errorReason = 'invalidDate';
        result.errorMessage = this._getLocalizedText('invalidDate');
        return result;
      }

      // Normalize the input date to start of day for comparison
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Check min date constraint
      if (this.min) {
        const minDate = this._parseDateOnly(this.min);
        if (minDate) {
          minDate.setHours(0, 0, 0, 0);
          if (normalizedDate < minDate) {
            result.isValid = false;
            result.errorReason = 'outOfRange';
            result.errorMessage = this._buildOutOfRangeMessage(normalizedDate);
            return result;
          }
        }
      }

      // Check max date constraint
      if (this.max) {
        const maxDate = this._parseDateOnly(this.max);
        if (maxDate) {
          maxDate.setHours(0, 0, 0, 0);
          if (normalizedDate > maxDate) {
            result.isValid = false;
            result.errorReason = 'outOfRange';
            result.errorMessage = this._buildOutOfRangeMessage(normalizedDate);
            return result;
          }
        }
      }

      return result;
    }

    _isDateDisabled(date) {
      return !this._isValidDate(date);
    }

    // Error priority system: Format > Range > Required
    _getErrorPriority(errorReason) {
      const priorities = {
        format: 3, // Highest priority
        invalidDate: 3, // Highest priority
        outOfRange: 2, // Medium priority
        required: 1, // Lowest priority
      };
      return priorities[errorReason] || 0;
    }

    _getDatePlaceholder(format) {
      try {
        if (format) {
          // Check for mixed case format and fallback to locale format if detected
          if (this._isMixedCaseFormat(format)) {
            // Mixed format detected, use locale format as fallback
            const userLocale = this._getUserLocale();
            moment.locale(userLocale);
            const localeFormat = moment.localeData().longDateFormat('L');
            const placeholder = localeFormat
              .replace(/D{1,2}/g, 'dd')
              .replace(/M{1,2}/g, 'mm')
              .replace(/Y{2,4}/g, 'yyyy')
              .toLowerCase();
            return placeholder;
          }

          const normalizedFormat = this._normalizeFormat(format);

          if (this._isValidMomentFormat(normalizedFormat)) {
            return format; // return original format to preserve user's case (lowercase/uppercase)
          }
        }
        // Get the actual locale from browser and moment
        const rawLocale = this._getUserLocale();

        // Normalize: replace underscore with hyphen
        let normalizedLocale = rawLocale.replace(/_/g, '-');

        try {
          // Canonicalize locale (handles casing, region format, etc.)
          const [canonicalLocale] = Intl.getCanonicalLocales(normalizedLocale);
          normalizedLocale = canonicalLocale;
        } catch (e) {
          // Fallback safely
          normalizedLocale = 'en-US';
        }

        // Extract language
        const lang = normalizedLocale.split('-')[0];

        // Use normalized locale consistently
        const parts = new Intl.DateTimeFormat(normalizedLocale).formatToParts(new Date(2000, 11, 31));

        // Specifier mapping ONLY for supported languages
        const specifierMap = {
          en: { day: 'dd', month: 'mm', year: 'yyyy' },
          fr: { day: 'jj', month: 'mm', year: 'aaaa' },
          de: { day: 'tt', month: 'mm', year: 'jjjj' },
          es: { day: 'dd', month: 'mm', year: 'aaaa' },
          it: { day: 'gg', month: 'mm', year: 'aaaa' },
          pt: { day: 'dd', month: 'mm', year: 'aaaa' },
          nl: { day: 'dd', month: 'mm', year: 'jjjj' },
          ru: { day: 'дд', month: 'мм', year: 'гггг' },
          ja: { year: '年', month: '月', day: '日' },
          zh: { year: '年', month: '月', day: '日' },
        };

        // Use mapped specifiers or fallback
        const spec = specifierMap[lang] || {
          day: 'dd',
          month: 'mm',
          year: 'yyyy',
        };

        // Build placeholder respecting locale order
        return parts
          .map((part) => {
            if (part.type === 'day') return spec.day;
            if (part.type === 'month') return spec.month;
            if (part.type === 'year') return spec.year;
            return part.value; // keep separators like "/", "-", "."
          })
          .join('');
      } catch (e) {
        // Safe fallback (still respects locale order)
        try {
          const locale = navigator.language;

          return new Intl.DateTimeFormat(locale)
            .formatToParts(new Date(2000, 11, 31))
            .map((part) => {
              if (part.type === 'day') return 'dd';
              if (part.type === 'month') return 'mm';
              if (part.type === 'year') return 'yyyy';
              return part.value;
            })
            .join('');
        } catch (error) {
          return 'dd/mm/yyyy';
        }
      }
    }

    _buildOutOfRangeMessage() {
      try {
        const hasMin = !!this.min;
        const hasMax = !!this.max;

        if (hasMin && hasMax) {
          const minDate = this._parseDateOnly(this.min);
          const maxDate = this._parseDateOnly(this.max);
          const minFormatted = minDate ? this._formatDateForDisplay(minDate) : this.min;
          const maxFormatted = maxDate ? this._formatDateForDisplay(maxDate) : this.max;
          return `${this.i18n('customDatePicker.dateOutOfRange')} Must be between ${minFormatted} and ${maxFormatted}`;
        }

        if (hasMin) {
          const minDate = this._parseDateOnly(this.min);
          const minFormatted = minDate ? this._formatDateForDisplay(minDate) : this.min;
          return `${this.i18n('customDatePicker.dateOutOfRange')} Must be on or after ${minFormatted}`;
        }

        if (hasMax) {
          const maxDate = this._parseDateOnly(this.max);
          const maxFormatted = maxDate ? this._formatDateForDisplay(maxDate) : this.max;
          return `${this.i18n('customDatePicker.dateOutOfRange')} Must be on or before ${maxFormatted}`;
        }
      } catch (error) {
        // Error building range message - using fallback
      }
      return this.i18n('customDatePicker.dateOutOfRange');
    }

    _formatMonthYear(date) {
      if (!date) return '';
      return new Intl.DateTimeFormat(this._locale, {
        month: 'long',
        year: 'numeric',
      }).format(date);
    }

    _getDayClasses(dayObj, focusedDate) {
      const classes = [];

      if (dayObj.isEmpty) {
        classes.push('empty');
      } else {
        if (dayObj.isOtherMonth) classes.push('other-month');
        if (dayObj.isToday) classes.push('today');
        if (dayObj.isSelected) classes.push('selected');
        if (dayObj.isDisabled) classes.push('disabled');

        // ONLY add focused class if we have a focused date AND it matches AND it's not selected AND not today
        // AND we're in the current month AND the focused date is in the currently viewed month
        if (
          focusedDate &&
          this._isSameDay(dayObj.date, focusedDate) &&
          !dayObj.isSelected &&
          !dayObj.isToday &&
          dayObj.isCurrentMonth &&
          focusedDate.getMonth() === this._viewDate.getMonth() &&
          focusedDate.getFullYear() === this._viewDate.getFullYear()
        ) {
          classes.push('focused');
        }
      }

      return classes.join(' ');
    }

    _getDayTabIndex(dayObj, focusedDate) {
      // ARIA Grid pattern: Only one cell should be tabbable, others use arrow keys
      if (dayObj.isEmpty || !dayObj.isCurrentMonth) return '-1';

      // Determine which date should be tabbable (tab stop)
      let shouldBeTabbable = false;

      if (focusedDate && this._isSameDay(dayObj.date, focusedDate)) {
        // Currently focused date
        shouldBeTabbable = true;
      } else if (!focusedDate && dayObj.isSelected) {
        // Selected date when no focus is set
        shouldBeTabbable = true;
      } else if (!focusedDate && !this._selectedDate && dayObj.isToday) {
        // Today when no selection and no focus
        shouldBeTabbable = true;
      } else if (!focusedDate && !this._selectedDate && !this._isTodayInCurrentMonth() && dayObj.date.getDate() === 1) {
        // First day of month as fallback
        shouldBeTabbable = true;
      }

      return shouldBeTabbable ? '0' : '-1';
    }

    _isTodayInCurrentMonth() {
      if (!this._today || !this._viewDate) return false;
      return (
        this._today.getMonth() === this._viewDate.getMonth() &&
        this._today.getFullYear() === this._viewDate.getFullYear()
      );
    }

    _getDayAriaLabel(dayObj) {
      const { date } = dayObj;
      const formatter = new Intl.DateTimeFormat(this._locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      let label = formatter.format(date);

      if (dayObj.isToday) {
        label += ', today';
      }

      if (dayObj.isSelected) {
        label += ', selected';
      }

      return label;
    }

    _getAriaCurrent(dayObj) {
      return dayObj.isToday ? 'date' : null;
    }

    _getActiveDescendant(focusedDate) {
      if (!focusedDate) return null;
      // Use local date formatting to avoid timezone issues
      const year = focusedDate.getFullYear();
      const month = String(focusedDate.getMonth() + 1).padStart(2, '0');
      const day = String(focusedDate.getDate()).padStart(2, '0');
      return `date-${year}-${month}-${day}`;
    }

    _isSelectedYear(year, viewDate) {
      return viewDate && year === viewDate.getFullYear();
    }

    _getAriaDescribedBy(invalid, errorMessage) {
      const isRequiredCase = this.errorReason === 'required';
      const shouldShow = invalid && !!errorMessage && (this._showErrors || !isRequiredCase);
      return shouldShow ? 'errorText' : null;
    }

    _showError(invalid, errorMessage, showErrors) {
      // Always show non-required errors immediately
      if (invalid && !!errorMessage && this.errorReason !== 'required') {
        return true;
      }

      // For required field errors, only show if showErrors is true (after form submit)
      if (invalid && !!errorMessage && this.errorReason === 'required') {
        return showErrors === true;
      }

      return false;
    }

    _valueChanged() {
      try {
        // Prevent circular updates
        if (this._preventInputUpdate) {
          this._preventInputUpdate = false;
          return;
        }

        // Set flag to prevent _inputValueChanged from triggering when we update _inputValue
        this._preventInputUpdate = true;

        if (!this.value) {
          this._selectedDate = null;

          // Only clear input if it wasn't cleared by user typing and there are no persistent errors
          if (!this._userIsTyping && !this._errorPersists) {
            this._inputValue = '';
          }

          // Don't trigger validation for required fields when value is cleared
          // Required field errors should only show on form submission
          // This prevents showing "This field is required" by default when form opens
          this._preventInputUpdate = false;
          return;
        }

        const date = this._moment(this.value);
        if (this.value && date.isValid()) {
          this._selectedDate = new Date(date.toDate());
          this._selectedDate.setHours(0, 0, 0, 0);
          this._viewDate = new Date(this._selectedDate);

          // Only update input display if this is from calendar selection, not user typing
          if (!this._userIsTyping) {
            // Use professional formatting for programmatic updates
            this._inputValue = this._formatDateForDisplay(this._selectedDate);
          }

          // Only clear validation errors if this is a programmatic update (not user typing)
          // and there are no current validation errors from user input
          // and errors are not set to persist
          if (this.invalid && !this._userIsTyping && !this._showErrors && !this._errorPersists) {
            this.async(() => {
              this.validate();
            }, 10);
          }
        } else {
          this._selectedDate = null;
          // Don't clear input if there are persistent errors - preserve user input
          if (!this._userIsTyping && !this._errorPersists) {
            this._inputValue = '';
          }
        }

        if (this._generateCalendar && typeof this._generateCalendar === 'function') {
          this._generateCalendar();
        }

        // Reset the flag after all updates are done
        this._preventInputUpdate = false;
      } catch (error) {
        this._selectedDate = null;
        // Don't clear input if there are persistent errors - preserve user input
        if (!this._userIsTyping && !this._errorPersists) {
          this._inputValue = '';
        }
        this._preventInputUpdate = false;
      }
    }

    // Override connectedCallback to ensure proper form integration
    connectedCallback() {
      super.connectedCallback();

      // Add form validation support
      if (this.form) {
        this.form.addEventListener('submit', (e) => {
          // Force validation before form submission
          const isValid = this.reportValidity();
          if (!isValid) {
            e.preventDefault();
            e.stopPropagation();

            // Focus the input to show the error
            const input = this.shadowRoot.querySelector('#dateInput');
            if (input) {
              input.focus();
            }
          }
        });
      }
    }

    _invalidChanged(newVal) {
      // Reflect invalid state to input ARIA and announce for SR
      const input = this.shadowRoot && this.shadowRoot.querySelector('#dateInput');
      if (input) {
        input.setAttribute('aria-invalid', String(!!newVal));
      }
      if (newVal && this._showErrors) {
        const msg = this.errorMessage || this.i18n('customDatePicker.invalidDate');
        this._announce(msg);
      }
      // Ensure error text visibility aligns with state
      const errorEl = this.shadowRoot && this.shadowRoot.querySelector('#errorText');
      if (errorEl) {
        // Use the same logic as template binding
        const shouldShow = this._showError(newVal, this.errorMessage, this._showErrors);
        errorEl.hidden = !shouldShow;
      }
    }

    _errorMessageChanged(newMsg) {
      // Announce error changes politely
      if (this.invalid && newMsg && this._showErrors) {
        this._announce(newMsg);
      }
      // Sync UI content and visibility immediately
      const errorEl = this.shadowRoot && this.shadowRoot.querySelector('#errorText');
      if (errorEl) {
        errorEl.textContent = newMsg || '';
        // Use the same logic as template binding
        const shouldShow = this._showError(this.invalid, newMsg, this._showErrors);
        errorEl.hidden = !shouldShow;
      }
    }

    _positionPopover() {
      try {
        const popover = this.shadowRoot && this.shadowRoot.querySelector('#calendarPopover');
        const trigger = this.shadowRoot && this.shadowRoot.querySelector('.input-wrapper');
        if (!popover || !trigger || !this._isCalendarOpen) return;

        // Reset classes/styles
        popover.classList.remove('open-up');
        popover.style.left = '';
        popover.style.right = '';
        popover.style.top = '';
        popover.style.bottom = '';

        const rect = trigger.getBoundingClientRect();
        const popRect = popover.getBoundingClientRect();
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        const viewportW = window.innerWidth || document.documentElement.clientWidth;

        const spaceBelow = viewportH - rect.bottom;
        const spaceAbove = rect.top;
        const popHeight = popRect.height || 320;
        const popWidth = popRect.width || 280;

        // Position using fixed positioning for modal-like behavior
        let { left } = rect;
        let top = rect.bottom + 4; // 4px margin
        const minVerticalPadding = 8; // Minimum padding from viewport edges

        // Smart vertical positioning with better edge handling
        if (spaceBelow >= popHeight + minVerticalPadding) {
          // Enough space below, position normally
          top = rect.bottom + 4;
          popover.classList.remove('open-up');
        } else if (spaceAbove >= popHeight + minVerticalPadding) {
          // Not enough space below but enough above, flip up
          top = rect.top - popHeight - 4;
          popover.classList.add('open-up');
        } else if (spaceBelow > spaceAbove) {
          // More space below, position at bottom with padding
          top = viewportH - popHeight - minVerticalPadding;
          popover.classList.remove('open-up');
        } else {
          // More space above, position at top with padding
          top = minVerticalPadding;
          popover.classList.add('open-up');
        }

        // Adjust horizontally based on RTL and overflow with better edge handling
        const minPadding = 8; // Minimum padding from viewport edges
        const maxLeft = viewportW - popWidth - minPadding;
        const minLeft = minPadding;

        if (this._isRTL) {
          // For RTL, position calendar to align with input field
          // Calculate position to align right edge of calendar with right edge of input
          const inputRight = rect.right;
          const preferredLeft = inputRight - popWidth;

          // Ensure calendar doesn't go off-screen
          if (preferredLeft < minLeft) {
            left = minLeft;
          } else if (preferredLeft > maxLeft) {
            left = maxLeft;
          } else {
            left = preferredLeft;
          }

          // Additional check: if calendar would be too far from input, center it
          const distanceFromInput = Math.abs(left - rect.left);
          if (distanceFromInput > popWidth) {
            left = Math.max(minLeft, Math.min(maxLeft, rect.left));
          }
        } else {
          // For LTR, position relative to left edge of trigger
          const preferredLeft = rect.left;
          left = Math.max(minLeft, Math.min(maxLeft, preferredLeft));
        }

        // Additional adjustment for extreme edge cases
        if (left === minLeft && rect.left < minLeft) {
          // If we're at minimum left and trigger is also at edge, try to center
          const centerLeft = (viewportW - popWidth) / 2;
          if (centerLeft >= minLeft && centerLeft <= maxLeft) {
            left = centerLeft;
          }
        } else if (left === maxLeft && rect.right > viewportW - minPadding) {
          // If we're at maximum right and trigger is also at edge, try to center
          const centerLeft = (viewportW - popWidth) / 2;
          if (centerLeft >= minLeft && centerLeft <= maxLeft) {
            left = centerLeft;
          }
        }

        // Apply fixed positioning
        popover.style.position = 'fixed';
        popover.style.left = `${left}px`;
        popover.style.top = `${top}px`;
      } catch (_) {
        // no-op
      }
    }

    // Getter for form property to support form integration
    get form() {
      return this.closest('form');
    }

    _inputValueChanged() {
      // This observer is only for logging/debugging purposes now
      // All actual validation happens in _validateAndParseInput() when user finishes typing

      // Don't process automatic changes or when user is typing
      if (this._preventInputUpdate || this._userIsTyping) {
        // no-empty: do nothing
      }

      // Only handle legacy compatibility cases where external code sets _inputValue directly
      // Modern usage should go through _validateAndParseInput() or _selectDate()
    }

    validate() {
      // Professional validation with proper error priority: Format > Range > Required

      // If there are persistent errors, always fail validation
      if (this._errorPersists && this.invalid) {
        return false;
      }

      // If there's a value, check format and range first
      if (this.value && this.value.trim() !== '') {
        // Parse the current value
        const parseResult = this._parseUserInput(this.value);
        if (!parseResult) {
          this.invalid = true;
          this.errorReason = 'format';
          const expectedFormat = this._getDatePlaceholder(this.format);
          this.errorMessage = `${this._getLocalizedText('incorrectFormat')} Expected format: ${expectedFormat}`;
          this._showErrors = true;
          return false;
        }

        // Validate the parsed date (range validation)
        const validation = this._validateDate(parseResult.date);
        if (!validation.isValid) {
          this.invalid = true;
          this.errorReason = validation.errorReason;
          this.errorMessage = validation.errorMessage;
          this._showErrors = true;
          return false;
        }
      }

      // Only check required if there's no value AND no existing errors
      if (this.required && (!this.value || this.value.trim() === '')) {
        // Only show required error if there are no existing format/range errors
        if (!this.invalid || this.errorReason === '') {
          this.invalid = true;
          this.errorReason = 'required';
          this.errorMessage = this._getLocalizedText('required');
          // Don't show required errors until form submission - don't set _showErrors to true
          // _showErrors will be set to true by reportValidity() when form is submitted
          return false;
        }
        // If there are existing errors, don't override them
        return false;
      }

      // Clear error state if validation passes
      this.invalid = false;
      this.errorReason = '';
      this.errorMessage = '';
      this._showErrors = false;
      return true;
    }

    /**
     * Report validity (typically called by form on submit)
     * This enables error display for required fields
     */
    reportValidity() {
      // Always enable error display when reportValidity is called (form submit)
      this._showErrors = true;

      // Clear the just cleared flag since we're now validating
      this._justCleared = false;

      // Store current error state before validation
      const currentErrorReason = this.errorReason;
      const currentErrorMessage = this.errorMessage;

      // Force validation which will set error state if needed
      const isValid = this.validate();

      // If validation didn't change the error (because of priority), restore the original error
      if (!isValid && currentErrorReason && currentErrorReason !== this.errorReason) {
        // Only override if the new error is higher priority
        if (this._getErrorPriority(this.errorReason) > this._getErrorPriority(currentErrorReason)) {
          // Keep the higher priority error
        } else {
          // Restore the original error
          this.errorReason = currentErrorReason;
          this.errorMessage = currentErrorMessage;
        }
      }

      // Force update of all relevant properties for template binding
      this.notifyPath('_showErrors');
      this.notifyPath('invalid');
      this.notifyPath('errorMessage');
      this.notifyPath('errorReason');

      // Force template re-evaluation by updating the error element directly
      this.async(() => {
        const errorEl = this.shadowRoot.querySelector('#errorText');
        if (errorEl) {
          const shouldShow = this._showError(this.invalid, this.errorMessage, this._showErrors);

          errorEl.hidden = !shouldShow;
          if (shouldShow && this.errorMessage) {
            errorEl.textContent = this.errorMessage;
          }

          // Also update the host invalid attribute for CSS styling
          if (shouldShow) {
            this.setAttribute('invalid', '');
          } else {
            this.removeAttribute('invalid');
          }
        }
      }, 1);

      return isValid;
    }

    /**
     * Update error display in DOM
     */
    _updateErrorDisplay(isValid) {
      const errorEl = this.shadowRoot.querySelector('#errorText');

      if (!isValid && this._showErrors && errorEl) {
        // Show error message only if _showErrors is true (after form submit)
        if (this.required && (!this.value || this.value.trim() === '')) {
          // Use dynamic error message for required fields
          errorEl.textContent = this._generateRequiredMessage();
          errorEl.hidden = false;

          // Ensure invalid attribute is set on host
          if (!this.hasAttribute('invalid')) {
            this.setAttribute('invalid', '');
          }
        } else if (this.errorMessage) {
          // Use the current error message for other validation errors
          errorEl.textContent = this.errorMessage;
          errorEl.hidden = false;

          // Ensure invalid attribute is set on host
          if (!this.hasAttribute('invalid')) {
            this.setAttribute('invalid', '');
          }
        }
      } else if ((isValid || !this._showErrors) && errorEl) {
        // Clear errors when valid OR when _showErrors is false
        errorEl.hidden = true;
        if (this.hasAttribute('invalid')) {
          this.removeAttribute('invalid');
        }
      }
    }

    /**
     * Template helper to determine if error should be shown
     */

    /**
     * Reset error display state (typically called when form is reset)
     */
    resetErrorState() {
      this._showErrors = false;
      this._justCleared = false;
      this._errorPersists = false;
      this.invalid = false;
      this.errorMessage = '';
      this.errorReason = '';
      this.notifyPath('_showErrors');
      this.notifyPath('_justCleared');
      this.notifyPath('_errorPersists');
      this.notifyPath('invalid');
      this.notifyPath('errorMessage');

      // Also clear DOM immediately
      const errorEl = this.shadowRoot.querySelector('#errorText');
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = '';
      }

      // Remove invalid attribute
      if (this.hasAttribute('invalid')) {
        this.removeAttribute('invalid');
      }
    }

    /**
     * Generate dynamic required error message using field label
     */
    _generateRequiredMessage() {
      // Always return the simple required message
      return this._getLocalizedText('required');
    }

    _getValidity() {
      // Check required field first
      if (this.required && (!this.value || this.value.trim() === '')) {
        this.errorReason = 'required';
        // Generate dynamic error message using field label
        this.errorMessage = this._generateRequiredMessage();
        return false;
      }

      // If field is not required and empty, it's valid
      if (!this.required && (!this.value || this.value.trim() === '')) {
        this.errorReason = '';
        this.errorMessage = '';
        return true;
      }

      // If we have a value, check if it's a valid date
      if (this.value) {
        const currentDate = this._moment(this.value);

        // Check if the date itself is valid
        if (!currentDate.isValid()) {
          this.errorReason = 'invalidDate';
          this.errorMessage = this._getLocalizedText('invalidDate');
          return false;
        }

        // Get current locale format for error messages
        const userLocale = navigator.languages !== undefined ? navigator.languages[0] : navigator.language;
        moment.locale(userLocale);
        // Check min constraint
        if (this.min) {
          const minDate = this._moment(this._parseDateOnly(this.min));
          if (currentDate.isBefore(minDate, 'day')) {
            this.errorReason = 'outOfRange';
            this.errorMessage = this._buildOutOfRangeMessage(currentDate.toDate());
            return false;
          }
        }

        // Check max constraint
        if (this.max) {
          const maxDate = this._moment(this._parseDateOnly(this.max));
          if (currentDate.isAfter(maxDate, 'day')) {
            this.errorReason = 'outOfRange';
            this.errorMessage = this._buildOutOfRangeMessage(currentDate.toDate());
            return false;
          }
        }
      }

      // If we reach here, the date is valid - clear any error state
      this.errorReason = '';
      this.errorMessage = '';
      return true;
    }

    // Override checkValidity for better form integration
    checkValidity() {
      return this.validate();
    }

    // Method to check if current input is valid without modifying state
    isInputValid() {
      const input = this.shadowRoot.querySelector('#dateInput');
      if (!input) return true;

      // If there are persistent errors, input is not valid
      if (this._errorPersists && this.invalid) {
        return false;
      }

      const value = input.value ? input.value.trim() : '';

      // If empty and not required, it's valid
      if (!value) {
        return !this.required;
      }

      // Try to parse the input
      const parseResult = this._parseUserInput(value);
      if (!parseResult) {
        return false;
      }

      // Validate the parsed date
      const validation = this._validateDate(parseResult.date);
      return validation.isValid;
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      const overlay = this.shadowRoot && this.shadowRoot.querySelector('#calendarOverlay');
      if (overlay && typeof overlay.hidePopover === 'function') {
        try {
          overlay.hidePopover();
        } catch (_) {
          /* not open or already hidden */
        }
      }

      // Clean up event listeners
      document.removeEventListener('click', this._handleDocumentClick);
      document.removeEventListener('keydown', this._handleEscapeKey);
      // Clean up focus event listeners
      document.removeEventListener('focusin', this._handleDocumentFocusIn);
      document.removeEventListener('focusout', this._handleDocumentFocusOut);

      // Clean up reposition listeners if they exist
      if (this._boundReposition) {
        window.removeEventListener('resize', this._boundReposition);
        window.removeEventListener('scroll', this._boundReposition);
      }
    }

    _toggleYearDropdown(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const yearOptions = this.shadowRoot.querySelector('#yearOptions');
      if (yearOptions) {
        const isOpen = yearOptions.classList.contains('open');
        this._isYearDropdownOpen = !isOpen;
        yearOptions.classList.toggle('open');
        if (!isOpen) {
          // When opening, focus and scroll to current year (use RAF for faster response)
          requestAnimationFrame(() => {
            this._focusCurrentYear();
            this._scrollToCurrentYear();
          });
        }
      }
    }

    _focusCurrentYear() {
      const currentYear = this._viewDate.getFullYear();
      const yearButton = this.shadowRoot.querySelector(`[data-year="${currentYear}"]`);
      if (yearButton) {
        // Clear tabindex from all year options first
        const allYearButtons = Array.from(this.shadowRoot.querySelectorAll('.year-option'));
        allYearButtons.forEach((btn) => {
          btn.tabIndex = -1;
        });
        // Set current year as tabbable and focus it
        yearButton.tabIndex = 0;
        yearButton.focus();
        // Set up keyboard navigation for year options
        this._setupYearKeyNavigation();
      }
    }

    _scrollToCurrentYear() {
      const currentYear = this._viewDate.getFullYear();
      const yearButton = this.shadowRoot.querySelector(`[data-year="${currentYear}"]`);
      const yearOptions = this.shadowRoot.querySelector('#yearOptions');

      if (yearButton && yearOptions) {
        const containerHeight = yearOptions.clientHeight;
        const buttonHeight = yearButton.offsetHeight;
        const buttonTop = yearButton.offsetTop;
        const scrollTop = buttonTop - containerHeight / 2 + buttonHeight / 2;

        yearOptions.scrollTop = Math.max(0, scrollTop);
      }
    }

    _setupYearKeyNavigation() {
      const yearOptions = this.shadowRoot.querySelector('#yearOptions');
      if (yearOptions) {
        // Attach ONE delegated keydown handler on the container only
        if (this._yearKeydownHandler) {
          yearOptions.removeEventListener('keydown', this._yearKeydownHandler);
        }
        this._yearKeydownHandler = (e) => {
          this._handleYearKeyDown(e);
        };
        yearOptions.addEventListener('keydown', this._yearKeydownHandler);
      }
    }

    _handleYearKeyDown(e) {
      // Derive the option receiving the event for cross-browser reliability
      let currentFocused =
        (e.target && e.target.closest && e.target.closest('.year-option')) || this.shadowRoot.activeElement || null;
      // Only consider visible year options inside the open panel
      let allYearButtons = Array.from(this.shadowRoot.querySelectorAll('#yearOptions.open .year-option'));
      if (!currentFocused || !currentFocused.classList || !currentFocused.classList.contains('year-option')) {
        // Fallback to the current tabbable option
        currentFocused = allYearButtons.find((btn) => btn.tabIndex === 0) || allYearButtons[0] || null;
      }
      if (!currentFocused) return;
      if (!allYearButtons.length) {
        // As an extra fallback, include options even if open class wasn't applied yet
        allYearButtons = Array.from(this.shadowRoot.querySelectorAll('#yearOptions .year-option'));
      }
      const currentIndex = allYearButtons.indexOf(currentFocused);
      let nextIndex = currentIndex;
      // Prevent this event from bubbling to parent handlers (avoids double processing)
      // Do this only for the keys we handle
      const handledKeys = ['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', ' ', 'Escape'];
      if (handledKeys.includes(e.key)) {
        e.stopPropagation();
      }

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          nextIndex = Math.max(0, currentIndex - 1);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          nextIndex = Math.min(allYearButtons.length - 1, currentIndex + 1);
          break;
        }
        case 'Home': {
          e.preventDefault();
          nextIndex = 0;
          break;
        }
        case 'End': {
          e.preventDefault();
          nextIndex = allYearButtons.length - 1;
          break;
        }
        case 'PageUp': {
          e.preventDefault();
          nextIndex = Math.max(0, currentIndex - 10);
          break;
        }
        case 'PageDown': {
          e.preventDefault();
          nextIndex = Math.min(allYearButtons.length - 1, currentIndex + 10);
          break;
        }
        case 'Enter':
        case ' ':
          e.preventDefault();
          currentFocused.click();
          return;
        case 'Escape':
          e.preventDefault();
          this._closeYearDropdown();
          return;
        default:
          // default-case: do nothing
          break;
      }
      if (nextIndex !== currentIndex && nextIndex >= 0) {
        // Update tabindex for roving tabindex pattern
        allYearButtons.forEach((btn, idx) => {
          btn.tabIndex = idx === nextIndex ? 0 : -1;
        });
        const nextBtn = allYearButtons[nextIndex];
        nextBtn.focus();
        // Keep the focused option in view when navigating
        if (typeof nextBtn.scrollIntoView === 'function') {
          nextBtn.scrollIntoView({ block: 'nearest' });
        }
      }
    }

    _closeYearDropdown() {
      const yearOptions = this.shadowRoot.querySelector('#yearOptions');
      if (yearOptions) {
        yearOptions.classList.remove('open');
        this._isYearDropdownOpen = false;

        // Return focus to year dropdown button
        const yearDropdown = this.shadowRoot.querySelector('.year-dropdown');
        if (yearDropdown) {
          yearDropdown.focus();
        }
        // Clean roving tabindex state to a safe default (current view year)
        const currentYear = this._viewDate ? this._viewDate.getFullYear() : new Date().getFullYear();
        const currentBtn = this.shadowRoot.querySelector(`#yearOptions .year-option[data-year="${currentYear}"]`);
        const buttons = Array.from(this.shadowRoot.querySelectorAll('#yearOptions .year-option'));
        buttons.forEach((btn) => {
          btn.tabIndex = btn === currentBtn ? 0 : -1;
        });
      }
    }

    _isValidMomentFormat(format) {
      if (!format || typeof format !== 'string') return false;

      // Allowed moment tokens (extend if needed)
      const validTokens = [
        'D',
        'DD',
        'Do',
        'M',
        'MM',
        'MMM',
        'MMMM',
        'YY',
        'YYYY',
        'H',
        'HH',
        'h',
        'hh',
        'm',
        'mm',
        's',
        'ss',
        'A',
        'a',
      ];

      // Extract tokens from format string
      const tokens = format.match(/[A-Za-z]+/g) || [];

      // Check if every token is valid
      return tokens.every((token) => validTokens.includes(token));
    }

    _selectYear(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const button = e.target.closest('.year-option');
      const year = button ? parseInt(button.dataset.year, 10) : null;
      if (year && this._viewDate) {
        // Create new date with proper month/day preservation
        const currentMonth = this._viewDate.getMonth();
        const currentDay = this._viewDate.getDate();

        // Handle edge case of Feb 29 in non-leap years
        let newDay = currentDay;
        if (currentMonth === 1 && currentDay === 29) {
          // February 29
          const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
          if (!isLeapYear) {
            newDay = 28; // Set to Feb 28 in non-leap years
          }
        }

        const newDate = new Date(year, currentMonth, newDay);
        newDate.setHours(0, 0, 0, 0);

        this._viewDate = newDate;
        // Clear focused date when changing year
        this._focusedDate = null;
        this._generateCalendar();
        this._announce(this._getLocalizedText('yearChanged', { year }));
        // Close the dropdown
        this._closeYearDropdown();
        // After closing, focus the year dropdown button for accessibility
        this.async(() => {
          const yearDropdown = this.shadowRoot.querySelector('.year-dropdown');
          if (yearDropdown) {
            yearDropdown.focus();
          }
        }, 100);
      }
    }

    _getYearOptionClass(year, viewDate) {
      if (!viewDate || !year) return '';
      return year === viewDate.getFullYear() ? 'selected' : '';
    }

    _getYearTabIndex(year, viewDate) {
      // Only the currently selected year should be tabbable
      return viewDate && year === viewDate.getFullYear() ? '0' : '-1';
    }

    _handleCalendarIconKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this._openCalendar(e, true); // Opened via keyboard
      } else if (e.key === 'ArrowDown' || e.key === 'F4') {
        e.preventDefault();
        e.stopPropagation();
        this._openCalendar(e, true); // Opened via keyboard
      }
    }

    _handleYearDropdownKeydown(e) {
      const moveWithinOptions = (delta) => {
        const yearOptions = this.shadowRoot.querySelector('#yearOptions');
        if (!yearOptions || !yearOptions.classList.contains('open')) return;
        const buttons = Array.from(yearOptions.querySelectorAll('.year-option'));
        if (!buttons.length) return;
        let current = buttons.findIndex((b) => b.tabIndex === 0);
        if (current < 0) current = 0;
        let next = current + delta;
        if (next < 0) next = 0;
        if (next > buttons.length - 1) next = buttons.length - 1;
        buttons.forEach((btn, idx) => {
          btn.tabIndex = idx === next ? 0 : -1;
        });
        const btn = buttons[next];
        btn.focus();
        if (typeof btn.scrollIntoView === 'function') {
          btn.scrollIntoView({ block: 'nearest' });
        }
      };

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        if (!this._isYearDropdownOpen) {
          this._toggleYearDropdown();
        } else {
          // Select currently focused option
          // max-len: break into multiple lines
          const focused =
            this.shadowRoot.activeElement && this.shadowRoot.activeElement.classList.contains('year-option')
              ? this.shadowRoot.activeElement
              : this.shadowRoot.querySelector('#yearOptions .year-option[tabindex="0"]');
          if (focused) {
            focused.click();
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        if (this._isYearDropdownOpen) {
          moveWithinOptions(+1);
        } else {
          this._toggleYearDropdown();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        if (this._isYearDropdownOpen) {
          moveWithinOptions(-1);
        } else {
          this._toggleYearDropdown();
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        e.stopPropagation();
        moveWithinOptions(-9999);
      } else if (e.key === 'End') {
        e.preventDefault();
        e.stopPropagation();
        moveWithinOptions(9999);
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        e.stopPropagation();
        moveWithinOptions(-10);
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        e.stopPropagation();
        moveWithinOptions(10);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this._closeYearDropdown();
      } else if (e.key === 'Tab') {
        // Close dropdown when user tabs away
        this._closeYearDropdown();
        // Don't prevent default - allow normal tab navigation
      }
      // Tab navigation is handled by central focus management
    }

    // Helper to get focusable element by name
    _getFocusableElement(elementName) {
      switch (elementName) {
        case 'year-dropdown':
          return this.shadowRoot.querySelector('.year-dropdown');
        case 'prevMonth': {
          const prev = this.shadowRoot.querySelector('#prevMonth');
          return prev && !prev.disabled ? prev : null;
        }
        case 'nextMonth': {
          const next = this.shadowRoot.querySelector('#nextMonth');
          return next && !next.disabled ? next : null;
        }
        case 'calendar-grid':
          return this.shadowRoot.querySelector('.calendar-day[tabindex="0"]');
        case 'today-button':
          return this.shadowRoot.querySelector('.today-button');
        case 'cancel-button':
          return this.shadowRoot.querySelector('.cancel-button');
        default:
          return null;
      }
    }

    _updateInputFromDate() {
      if (this._selectedDate) {
        // Use professional formatting for display
        this._inputValue = this._formatDateForDisplay(this._selectedDate);
      } else {
        this._inputValue = '';
      }
    }

    // Professional date-to-ISO converter
    _dateToISO(date) {
      if (!date || Number.isNaN(date.getTime())) return '';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    }

    // Professional date formatter for display
    _formatDateForDisplay(date) {
      if (!date || Number.isNaN(date.getTime())) return '';

      try {
        // Get User's locale and ensure moment uses it
        const userLocale = this._getUserLocale();
        moment.locale(userLocale);
        // Use format property or moment's locale format for display
        let format = moment.localeData().longDateFormat('L');

        if (this.format) {
          // Check for mixed case format and fallback to locale format if detected
          if (this._isMixedCaseFormat(this.format)) {
            // Mixed format detected, use locale format for display
            format = moment.localeData().longDateFormat('L');
          } else {
            const normalizedFormat = this._normalizeFormat(this.format);

            if (this._isValidMomentFormat(normalizedFormat)) {
              format = normalizedFormat;
            } else {
              this.invalid = true;
              this.errorMessage = `Invalid date format "${this.format}". Using default format instead.`;
            }
          }
        }
        return this._moment(date).format(format);
      } catch (error) {
        // Safe fallback using Intl.DateTimeFormat
        return new Intl.DateTimeFormat(navigator.language).format(date);
      }
    }

    _isMixedCaseFormat(format) {
      if (!format) return false;
      // Check if format contains both uppercase and lowercase letters (excluding separators)
      const hasLowercase = /[a-z]/.test(format);
      const hasUppercase = /[A-Z]/.test(format);
      return hasLowercase && hasUppercase;
    }

    _normalizeFormat(format) {
      if (!format) return format;

      return format
        .replace(/yyyy/g, 'YYYY')
        .replace(/yy/g, 'YY')
        .replace(/dd/g, 'DD')
        .replace(/d(?![a-zA-Z])/g, 'D')
        .replace(/mm/g, 'MM') // ⚠ careful: mm = minutes, MM = month
        .replace(/m(?![a-zA-Z])/g, 'M');
    }

    // Professional date parser for user input with comprehensive format support
    _parseUserInput(inputString) {
      if (!inputString || typeof inputString !== 'string') return null;

      const trimmedInput = inputString.trim();
      if (!trimmedInput) return null;

      try {
        // Get user's locale with better fallback
        const userLocale = this._getUserLocale();
        moment.locale(userLocale);

        let primaryFormat = moment.localeData().longDateFormat('L');

        if (this.format) {
          // Check for mixed case format and fallback to locale format if detected
          if (this._isMixedCaseFormat(this.format)) {
            // Mixed format detected, use locale format as fallback
            primaryFormat = moment.localeData().longDateFormat('L');
          } else {
            const normalizedFormat = this._normalizeFormat(this.format);

            if (this._isValidMomentFormat(normalizedFormat)) {
              primaryFormat = normalizedFormat;
            } else {
              this.invalid = true;
              this.errorMessage = `Invalid date format "${this.format}"`;
            }
          }
        }

        // Strict parsing with primary format
        let momentDate = this._moment(trimmedInput, primaryFormat, true);

        if (momentDate.isValid()) {
          const date = momentDate.toDate();
          date.setHours(0, 0, 0, 0);
          return { date, isExactFormat: true };
        }

        // Lenient parsing with primary format
        momentDate = this._moment(trimmedInput, primaryFormat, false);

        if (momentDate.isValid()) {
          const date = momentDate.toDate();
          date.setHours(0, 0, 0, 0);
          // Verify it's a logical date
          if (date.getFullYear() >= 1900 && date.getFullYear() <= 2200) {
            return { date, isExactFormat: false };
          }
        }

        // Fallback: Try common date formats if locale parsing fails
        const commonFormats = [
          'DD/MM/YYYY',
          'DD-MM-YYYY',
          'DD.MM.YYYY',
          'DD/MM/YY',
          'DD-MM-YY',
          'DD.MM.YY',
          'MM/DD/YYYY',
          'MM-DD-YYYY',
          'MM.DD.YYYY',
          'MM/DD/YY',
          'MM-DD-YY',
          'MM.DD.YY',
          'YYYY-MM-DD',
          'YYYY/MM/DD',
          'YYYY.MM.DD',
          'DD MMM YYYY',
          'DD MMMM YYYY',
          'MMM DD, YYYY',
          'MMMM DD, YYYY',
          'DD/MM',
          'MM/DD',
          'DD-MM',
          'MM-DD',
        ];

        for (let i = 0; i < commonFormats.length; i++) {
          momentDate = this._moment(trimmedInput, commonFormats[i], true);
          if (momentDate.isValid()) {
            const date = momentDate.toDate();
            date.setHours(0, 0, 0, 0);

            if (date.getFullYear() >= 1900 && date.getFullYear() <= 2200) {
              return { date, isExactFormat: false };
            }
          }
        }

        // Last resort: Try moment's natural language parsing
        momentDate = this._moment(trimmedInput);
        if (momentDate.isValid()) {
          const date = momentDate.toDate();
          date.setHours(0, 0, 0, 0);
          // Verify it's a logical date
          if (date.getFullYear() >= 1900 && date.getFullYear() <= 2200) {
            return { date, isExactFormat: false };
          }
        }

        return null;
      } catch (error) {
        return null;
      }
    }

    // Helper method to get user locale with better fallback
    _getUserLocale() {
      // Try multiple sources for locale detection
      const sources = [navigator.languages && navigator.languages[0], navigator.language, this._locale, 'en-US'];

      for (let i = 0; i < sources.length; i++) {
        const locale = sources[i];
        if (locale && typeof locale === 'string') {
          return locale;
        }
      }

      return 'en-US';
    }

    // Helper method to test date parsing with detailed error information
    _testDateParsing(inputString) {
      const results = {
        input: inputString,
        userLocale: this._getUserLocale(),
        localeFormat: null,
        parsed: false,
        error: null,
        suggestions: [],
      };

      try {
        const userLocale = this._getUserLocale();
        moment.locale(userLocale);
        results.localeFormat = moment.localeData().longDateFormat('L');

        // Test with locale format
        const momentDate = this._moment(inputString, results.localeFormat, true);
        if (momentDate.isValid()) {
          results.parsed = true;
          return results;
        }

        // Test with common formats
        const commonFormats = [
          'DD/MM/YYYY',
          'DD-MM-YYYY',
          'DD.MM.YYYY',
          'MM/DD/YYYY',
          'MM-DD-YYYY',
          'MM.DD.YYYY',
          'YYYY-MM-DD',
          'YYYY/MM/DD',
          'YYYY.MM.DD',
        ];

        for (let i = 0; i < commonFormats.length; i++) {
          const format = commonFormats[i];
          const testDate = this._moment(inputString, format, true);
          if (testDate.isValid()) {
            results.parsed = true;
            results.suggestions.push(`Try format: ${format}`);
            break;
          }
        }

        if (!results.parsed) {
          results.error = 'Could not parse date with any known format';
          results.suggestions = [
            'Use format: DD/MM/YYYY (e.g., 20/10/2020)',
            'Use format: MM/DD/YYYY (e.g., 10/20/2020)',
            'Use format: YYYY-MM-DD (e.g., 2020-10-20)',
          ];
        }
      } catch (error) {
        results.error = error.message;
      }

      return results;
    }

    // Helper method to ensure consistent date formatting across all operations (legacy compatibility)
    _ensureConsistentDateFormat(date) {
      return this._formatDateForDisplay(date);
    }

    _handleNavButtonKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();

        // Mirror mouse behavior: suppress transient wrapper-driven input refocus
        // while keyboard month navigation is being processed.
        this._suppressInputFocusCloseUntil = Date.now() + FOCUS_SUPPRESSION_MS;

        // Mark that we're interacting with the calendar to prevent it from closing
        this._interactingWithCalendar = true;

        // Call the appropriate navigation method directly
        if (e.target.id === 'prevMonth') {
          this._previousMonth(e);
        } else if (e.target.id === 'nextMonth') {
          this._nextMonth(e);
        }
      }
      // Tab navigation is now handled by _handlePopoverKeydown
    }

    // Prevent the nav buttons from acquiring focus on mouse interaction.
    // If a nav button gets focused and then becomes disabled (e.g. clicking previous
    // month at the min-month boundary), the browser blurs it which bubbles a focusout
    // up to the wrapping nuxeo-date-picker. The wrapper re-focuses the host, which in
    // turn focuses the inner input and triggers the calendar to close. By preventing
    // mousedown's default action, focus stays on whatever element previously held it.
    _preventNavButtonFocus(e) {
      if (e) {
        // Keep this short: enough to cover focus hand-off caused by nav updates
        // without masking legitimate later input focus events.
        this._suppressInputFocusCloseUntil = Date.now() + FOCUS_SUPPRESSION_MS;
        e.preventDefault();
      }
    }

    // Grid tab navigation is now handled by central focus management

    _handleDateKeydown(e) {
      // Individual date button keydown handler
      this._handleGridKeydown(e);
    }

    _isPreviousMonthDisabled() {
      if (!this.min) return false;

      // Calculate the previous month
      const currentDate = new Date(this._viewDate);
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

      // Check if the previous month contains ANY valid dates
      const hasValidDatesInPrevMonth = this._monthHasValidDates(prevMonth);

      const isDisabled = !hasValidDatesInPrevMonth;

      return isDisabled;
    }

    _isNextMonthDisabled() {
      if (!this.max) return false;

      // Calculate the next month
      const currentDate = new Date(this._viewDate);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

      // Check if the next month contains ANY valid dates
      const hasValidDatesInNextMonth = this._monthHasValidDates(nextMonth);

      const isDisabled = !hasValidDatesInNextMonth;

      return isDisabled;
    }

    // Helper method to check if a given month contains any valid dates within min/max constraints
    _monthHasValidDates(monthDate) {
      // If no constraints, all months are valid
      if (!this.min && !this.max) {
        return true;
      }

      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();

      // Get the first and last day of the month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // Normalize min and max dates
      let minDate = null;
      let maxDate = null;

      if (this.min) {
        minDate = new Date(this.min);
        minDate.setHours(0, 0, 0, 0);
      }

      if (this.max) {
        maxDate = new Date(this.max);
        maxDate.setHours(23, 59, 59, 999);
      }

      // Check if there's any overlap between the month and the valid date range
      const monthStart = new Date(firstDay);
      const monthEnd = new Date(lastDay);
      monthStart.setHours(0, 0, 0, 0);
      monthEnd.setHours(23, 59, 59, 999);

      // If we have a min constraint, the valid start date is the later of month start or min date
      let validStart = monthStart;
      if (minDate && minDate > monthStart) {
        validStart = minDate;
      }

      // If we have a max constraint, the valid end date is the earlier of month end or max date
      let validEnd = monthEnd;
      if (maxDate && maxDate < monthEnd) {
        validEnd = maxDate;
      }

      // Check if there's a valid range (start <= end)
      const hasValidDates = validStart <= validEnd;
      return hasValidDates;
    }

    _shouldShowClearButton(inputValue, hideClearDateButton) {
      // If clear-button-visible attribute/property is explicitly set, it overrides hideClearDateButton
      const explicitClearVisible = this.hasAttribute('clear-button-visible') ? this.clearButtonVisible : null;
      const shouldShow = explicitClearVisible !== null ? explicitClearVisible : !hideClearDateButton;
      return inputValue && shouldShow;
    }

    _clearButtonVisibleChanged(newVal) {
      // Keep legacy hideClearDateButton in sync unless user explicitly set it too
      if (!this.hasAttribute('hide-clear-date-button')) {
        this.hideClearDateButton = !newVal;
      }
    }

    // Add set method for i18n compatibility with nuxeo-date-picker
    set(path, value) {
      if (path.startsWith('i18n.')) {
        const i18nProperty = path.substring(5); // Remove 'i18n.' prefix
        if (!this.pickerI18n) {
          this.pickerI18n = {};
        }
        this.pickerI18n[i18nProperty] = value;

        // Backward compatibility: expose i18n.* values on the legacy i18n holder.
        // In this component, i18n may be a function (I18nBehavior), and functions can carry properties.
        if (this.i18n && (typeof this.i18n === 'function' || typeof this.i18n === 'object')) {
          this.i18n[i18nProperty] = value;
        }

        // Handle specific i18n properties that affect calendar display
        if (i18nProperty === 'firstDayOfWeek') {
          this.firstDayOfWeek = value;
          this._initializeLocaleData();
          if (this._generateCalendar) {
            this._generateCalendar();
          }
        } else if (i18nProperty === 'monthNames') {
          this._monthNames = value;
        } else if (i18nProperty === 'weekdays' || i18nProperty === 'weekdaysShort') {
          this._weekdayNames = value;
        }
      } else if (super.set) {
        // Use standard Polymer set method for other properties
        super.set(path, value);
      }
    }

    // Add focus method for compatibility
    focus() {
      const dateInput = this.shadowRoot.querySelector('#dateInput');
      if (dateInput) {
        dateInput.focus();
      }
    }

    // Add clear method for external API compatibility
    clear() {
      this._clearDate();
    }

    // Add getter for external access to the formatted date value like nuxeo-date-picker
    get formattedValue() {
      if (this._selectedDate && this.pickerI18n && this.pickerI18n.formatDate) {
        return this.pickerI18n.formatDate(this._selectedDate);
      }
      return this.value;
    }

    // Add property observers for dynamic updates
    _minChanged(newMin) {
      if (this._generateCalendar) {
        this._generateCalendar();
      }
      if (this.value) {
        // Re-validate current value against new min constraint
        const currentDate = this._moment(this.value);
        if (newMin && currentDate.isBefore(this._moment(newMin), 'day')) {
          this.invalid = true;
          this.errorMessage = `Date must be on or after ${this._moment(newMin).format('L')}`;
        }
      }
    }

    _maxChanged(newMax) {
      if (this._generateCalendar) {
        this._generateCalendar();
      }
      if (this.value) {
        // Re-validate current value against new max constraint
        const currentDate = this._moment(this.value);
        if (newMax && currentDate.isAfter(this._moment(newMax), 'day')) {
          this.invalid = true;
          this.errorMessage = `Date must be on or before ${this._moment(newMax).format('L')}`;
        }
      }
    }

    _firstDayOfWeekChanged() {
      this._initializeLocaleData();
      if (this._generateCalendar) {
        this._generateCalendar();
      }
    }

    _defaultTimeChanged() {
      // Re-process current value if it exists
      if (this._inputValue && !this._preventInputUpdate) {
        this._inputValueChanged();
      }
    }
  }

  customElements.define(CustomDatePicker.is, CustomDatePicker);
  Nuxeo.CustomDatePicker = CustomDatePicker;
}
