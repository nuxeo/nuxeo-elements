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
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import moment from '@nuxeo/moment/min/moment-with-locales.js';
import { config } from '@nuxeo/nuxeo-elements';

{
  class AccessibleDatePicker extends mixinBehaviors(
    [I18nBehavior, IronFormElementBehavior, IronValidatableBehavior],
    Nuxeo.Element,
  ) {
    static get is() {
      return 'nuxeo-accessible-date-picker';
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
         * The default time of the picked-up date. Format is HH:mm:ss e.g. 12:45:23. Default is 00:00:00 (midnight).
         */
        defaultTime: {
          type: String,
          observer: '_defaultTimeChanged'
        },

        errorMessage: {
          type: String,
          observer: '_errorMessageChanged'
        },

        /*
         * The maximum date-time input value (e.g. `"2000-01-01"`).
         */
        max: {
          type: String,
          observer: '_maxChanged'
        },

        /*
         * The minimum date-time input value (e.g. `"2000-01-01"`).
         */
        min: {
          type: String,
          observer: '_minChanged'
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
         * By default, it will be set according the locale.
         */
        firstDayOfWeek: {
          type: Number,
          observer: '_firstDayOfWeekChanged'
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
          observer: '_invalidChanged'
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

        _isCalendarOpen: {
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
        
        _dateFormatter: {
          type: Object,
          value: null,
        },
        
        _focusedDate: {
          type: Object,
          value: null,
        },
        
        _maskedInputValue: {
          type: String,
          value: '',
          observer: '_maskedInputValueChanged',
        },
        _inputMask: {
          type: String,
          value: '',
        },
        
        _maskTemplate: {
          type: String,
          value: '',
        },

        // i18n properties for compatibility with nuxeo-date-picker
        i18n: {
          type: Object,
          value: () => ({}),
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
            border-color: #2563eb;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
            outline: none;
          }

          /* Do not alter label color; only border indicates invalid */

          .input-field {
            flex: 1;
            border: none;
            outline: none;
            padding: 6px 48px 6px 8px; /* Right padding for both icons */
            font-size: 12px; /* Reduced font size */
            font-family: inherit;
            background: transparent;
            color: #111827;
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

          .calendar-popover {
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 1000;
            margin-top: 4px;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 0; /* Remove rounded corners for Nuxeo theme */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            width: 280px; /* Reduced from 320px to be proportional */
            display: none;
            animation: fadeIn 0.15s ease-out;
          }

          .calendar-popover.open {
            display: block;
          }

          .calendar-popover.open-up {
            top: auto;
            bottom: 100%;
            margin-top: 0;
            margin-bottom: 4px;
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
            z-index: 1001;
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
            transition: background-color 0.2s ease;
            border: none;
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
            outline: 2px solid #2563eb;
            outline-offset: 2px;
            background-color: #f3f4f6;
          }

          .year-option.selected:focus,
          .month-year-option.selected:focus {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
            background-color: #1d4ed8; /* Darker blue when focused and selected */
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
        </style>

        <div class="field-wrapper">
          <div class="input-wrapper">
            <input
              id="dateInput"
              class="input-field"
              type="text"
              value="{{_maskedInputValue::input}}"
              placeholder$="[[_getDatePlaceholder()]]"
              name$="[[name]]"
              disabled$="[[disabled]]"
              required$="[[required]]"
              aria-invalid$="[[invalid]]"
              aria-describedby$="[[_getAriaDescribedBy(invalid, errorMessage)]]"
              aria-labelledby$="[[ariaLabelledby]]"
              aria-expanded$="[[_isCalendarOpen]]"
              aria-haspopup="grid"
              autocomplete="off"
              maxlength="10"
              inputmode="numeric"
              pattern$="[[_getInputPattern(_inputMask)]]"
              on-focus="_onMaskedInputFocus"
              on-blur="_onMaskedInputBlur"
              on-keydown="_onMaskedInputKeydown"
              on-input="_onMaskedInputInput"
            />
            
            <div class="input-actions">
              <template is="dom-if" if="[[_shouldShowClearButton(_inputValue, hideClearDateButton)]]">
                <button
                  type="button"
              class="clear-button"
                  aria-label="Clear date"
                  tabindex="0"
                  on-click="_clearDate"
                >
                  <iron-icon icon="icons:clear"></iron-icon>
                </button>
              </template>
              
              <button
                type="button"
                class="calendar-icon"
                aria-label="Open calendar"
              disabled$="[[disabled]]"
                tabindex="0"
                on-click="_openCalendar"
                on-keydown="_handleCalendarIconKeydown"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

          <div class="calendar-popover" id="calendarPopover" role="dialog" aria-label="Calendar" aria-modal$="[[_isCalendarOpen]]">
            <div class="calendar-header">
                <div class="month-year-display">
                  <span class="month-text">[[_getMonthName(_viewDate)]]</span>
                  <div class="year-dropdown" on-click="_toggleYearDropdown" tabindex="0" role="button" aria-label="Select year" aria-haspopup="listbox" aria-expanded$="[[_isYearDropdownOpen]]" on-keydown="_handleYearDropdownKeydown">
                    <span class="year-text">[[_getYear(_viewDate)]]</span>
                    <button type="button" class="year-dropdown-button" aria-label="Select year" tabindex="-1">
                      <iron-icon icon$="[[_getDropdownIcon(_isYearDropdownOpen)]]"></iron-icon>
                    </button>
                    <div class="year-options" id="yearOptions" role="listbox" aria-label="Year options">
                      <template is="dom-repeat" items="[[_yearOptions]]">
                        <button type="button" class$="year-option [[_getYearOptionClass(item, _viewDate)]]"
                          data-year$="[[item]]"
                          on-click="_selectYear"
                          tabindex$="[[_getYearTabIndex(item, _viewDate)]]"
                          role="option"
                          aria-selected$="[[_isSelectedYear(item, _viewDate)]]">[[item]]</button>
                      </template>
                    </div>
                  </div>
                </div>
                
              <div class="navigation">
                <button type="button" class="nav-button" id="prevMonth" aria-label="Previous month" tabindex="0" on-keydown="_handleNavButtonKeydown" disabled$="[[_isPreviousMonthDisabled()]]">
                  <iron-icon icon="icons:chevron-left"></iron-icon>
                </button>
                
                <button type="button" class="nav-button" id="nextMonth" aria-label="Next month" tabindex="0" on-keydown="_handleNavButtonKeydown" disabled$="[[_isNextMonthDisabled()]]">
                  <iron-icon icon="icons:chevron-right"></iron-icon>
                </button>
              </div>
              </div>
              
            <div class="weekday-headers" role="row">
                <template is="dom-repeat" items="[[_weekdayNames]]">
                <div class="weekday-header" role="columnheader">[[item]]</div>
                </template>
              </div>

            <div class="calendar-grid" role="grid" aria-label="Calendar dates" aria-activedescendant$="[[_getActiveDescendant(_focusedDate)]]" on-keydown="_handleGridKeydown">
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
              Today
              </button>
              <button type="button" class="footer-button cancel-button" on-click="_closeCalendar" tabindex="0">
              Cancel
              </button>
            </div>
          </div>
        </div>
      `;
    }

    constructor() {
      super();
      this._locale = navigator.language || 'en-US';
      this._dateFormatter = new Intl.DateTimeFormat(this._locale);
      this._today = new Date();
      this._today.setHours(0, 0, 0, 0); // Normalize to start of day
      this._viewDate = new Date();
      this._focusedDate = null;
      this._maskedInputValue = 'dd/mm/yyyy';
      this._maskTemplate = 'dd/mm/yyyy';
    }

    ready() {
      super.ready();
      
      console.log('[nuxeo-accessible-date-picker] Initializing with properties:', {
        min: this.min,
        max: this.max,
        defaultTime: this.defaultTime,
        timezone: this.timezone,
        firstDayOfWeek: this.firstDayOfWeek,
        hideClearDateButton: this.hideClearDateButton
      });
      
      // Set up moment locale like nuxeo-date-picker does
      moment.locale(navigator.languages !== undefined ? navigator.languages[0] : navigator.language);
      
      this._locale = navigator.language || 'en-US';
      this._dateFormatter = new Intl.DateTimeFormat(this._locale);
      this._today = new Date();
      this._today.setHours(0, 0, 0, 0); // Normalize to start of day
      this._viewDate = new Date();
      this._focusedDate = null;
      this._maskedInputValue = 'dd/mm/yyyy';
      this._maskTemplate = 'dd/mm/yyyy';
      
      // Set up i18n properties for compatibility with nuxeo-date-picker
      // Store the i18n function reference before overwriting the property
      let i18nFn = null;
      try {
        // Check if this.i18n exists and is a function (from I18nBehavior)
        if (typeof this.i18n === 'function') {
          i18nFn = this.i18n.bind(this);
        }
      } catch (error) {
        console.warn('[nuxeo-accessible-date-picker] I18nBehavior not available:', error);
      }
      
      // Set up the i18n configuration object
      this.i18n = {
        formatDate: (date) => {
          try {
            return this._moment(date).format(moment.localeData().longDateFormat('L'));
          } catch (error) {
            console.warn('[nuxeo-accessible-date-picker] Error formatting date:', error);
            return date ? date.toLocaleDateString() : '';
          }
        },
        parseDate: (text) => {
          try {
            const date = this._moment(text, moment.localeData().longDateFormat('L'));
            return {
              day: date.get('D'),
              month: date.get('M'),
              year: date.get('Y'),
            };
          } catch (error) {
            console.warn('[nuxeo-accessible-date-picker] Error parsing date:', error);
            return { day: 1, month: 0, year: 2024 };
          }
        },
        monthNames: moment.months(),
        weekdays: moment.weekdays(),
        weekdaysShort: moment.weekdaysShort(),
        cancel: this._getI18nText(i18nFn, 'command.cancel', 'Cancel'),
        clear: this._getI18nText(i18nFn, 'command.clear', 'Clear'),
        today: this._getI18nText(i18nFn, 'today', 'Today'),
        firstDayOfWeek: this.firstDayOfWeek || config.get('firstDayOfWeek', moment.localeData().firstDayOfWeek() || 0),
      };
      
      this._initializeLocaleData();
      this._generateYearOptions();
      this._generateCalendar();
      this._setupEventListeners();
      this._setupFocusTrap();
      this._updateMaskedInputFromDate();

      // Diagnostics to verify locale vs mask vs placeholder and constraints
      try {
        const userLocale = navigator.languages !== undefined ? navigator.languages[0] : navigator.language;
        const momentLocale = moment.locale();
        const L = moment.localeData().longDateFormat('L');
        const tz = (new Intl.DateTimeFormat()).resolvedOptions().timeZone;
        console.log('[nuxeo-accessible-date-picker] Locale diagnostics:', {
          userLocale,
          momentLocale,
          L,
          inputMask: this._inputMask,
          placeholder: this._getDatePlaceholder(),
          pattern: this._getInputPattern(this._inputMask),
          timezone: tz,
          min: this.min,
          max: this.max,
        });
        if (this._selectedDate) {
          console.log('[nuxeo-accessible-date-picker] Sample selected formatted (L):', this._moment(this._selectedDate).format(L));
        } else {
          console.log('[nuxeo-accessible-date-picker] Sample today formatted (L):', this._moment(new Date()).format(L));
        }
      } catch (e) {
        // no-op
      }
    }

    // Helper method to safely get i18n text with fallbacks
    _getI18nText(i18nFn, key, fallback) {
      try {
        if (i18nFn) {
          const result = i18nFn(key);
          return result || fallback;
        }
      } catch (error) {
        console.warn(`[nuxeo-accessible-date-picker] Error getting i18n text for key '${key}':`, error);
      }
      return fallback;
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
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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
            return isNaN(d.getTime()) ? null : d;
          }
        }
        const d = new Date(value);
        if (isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        return d;
      } catch (_) {
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
      
      console.log('[nuxeo-accessible-date-picker] Initialized locale data with firstDayOfWeek:', firstDay, 'weekdays:', this._weekdayNames);

      // Initialize input mask and placeholder based on locale format
      try {
        const L = moment.localeData().longDateFormat('L');
        // Normalize to our three supported masks
        if (/D{1,2}\/M{1,2}\/Y{2,4}/i.test(L)) {
          this._inputMask = 'dd/mm/yyyy';
        } else if (/M{1,2}\/D{1,2}\/Y{2,4}/i.test(L)) {
          this._inputMask = 'mm/dd/yyyy';
        } else if (/Y{2,4}-M{1,2}-D{1,2}/i.test(L)) {
          this._inputMask = 'yyyy-mm-dd';
        } else {
          // Fallback to locale formatter-derived placeholder
          this._inputMask = this._getDatePlaceholder();
        }
        // Sync mask template and masked input to the resolved mask when no selection
        this._maskTemplate = this._inputMask;
        if (!this._selectedDate) {
          this._maskedInputValue = this._maskTemplate;
        }
      } catch (_) {
        this._inputMask = this._getDatePlaceholder();
        this._maskTemplate = this._inputMask;
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
        if (!isNaN(minDate.getTime())) {
          minYear = Math.max(startYear, minDate.getFullYear());
        }
      }
      
      if (this.max) {
        const maxDate = new Date(this.max);
        if (!isNaN(maxDate.getTime())) {
          maxYear = Math.min(endYear, maxDate.getFullYear());
        }
      }
      
      this._yearOptions = [];
      for (let year = minYear; year <= maxYear; year++) {
        this._yearOptions.push(year);
      }
    }

    _generateMonthYearOptions() {
      const currentYear = this._today.getFullYear();
      const selectedYear = this._selectedDate ? this._selectedDate.getFullYear() : currentYear;
      const viewYear = this._viewDate ? this._viewDate.getFullYear() : currentYear;
      
      // Use 1900-2099 range but respect min/max constraints
      let startYear = 1900;
      let endYear = 2099;
      
      // Apply min/max constraints if specified
      if (this.min) {
        const minDate = new Date(this.min);
        if (!isNaN(minDate.getTime())) {
          startYear = Math.max(startYear, minDate.getFullYear());
        }
      }
      
      if (this.max) {
        const maxDate = new Date(this.max);
        if (!isNaN(maxDate.getTime())) {
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
              year: 'numeric' 
            }).format(date);
            
            this._monthYearOptions.push({
              label: label,
              value: `${year}-${month}`,
              year: year,
              month: month
            });
          }
        }
      }
    }

    _generateCalendar() {
      if (!this._viewDate) return;
      
      console.log('[nuxeo-accessible-date-picker] Generating calendar with constraints - min:', this.min, 'max:', this.max);
      
      const year = this._viewDate.getFullYear();
      const month = this._viewDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Handle firstDayOfWeek properly
      const firstDayOfWeek = this.firstDayOfWeek || config.get('firstDayOfWeek', moment.localeData().firstDayOfWeek() || 0);
      const startDate = new Date(firstDay);
      const dayOffset = (firstDay.getDay() - firstDayOfWeek + 7) % 7;
      startDate.setDate(1 - dayOffset);
      
      const days = [];
      let disabledCount = 0;
      let enabledCount = 0;
      let currentMonthDisabledCount = 0;
      let currentMonthEnabledCount = 0;
      
      for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        currentDate.setHours(0, 0, 0, 0); // Normalize to start of day
        
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = this._isSameDay(currentDate, this._today) && isCurrentMonth;
        
        // ONLY highlight selected date if we actually have a selected date
        let isSelected = false;
        if (this._selectedDate && isCurrentMonth) {
          const selectedYear = this._selectedDate.getFullYear();
          const selectedMonth = this._selectedDate.getMonth();
          const selectedDay = this._selectedDate.getDate();
          
          // Only show selected if we're viewing the exact month/year AND exact date match
          if (year === selectedYear && month === selectedMonth) {
            isSelected = (currentDate.getFullYear() === selectedYear &&
                         currentDate.getMonth() === selectedMonth &&
                         currentDate.getDate() === selectedDay);
          }
        }
        
        const isDisabled = this._isDateDisabled(currentDate);
        
        // Count enabled/disabled dates
        if (isCurrentMonth) {
          if (isDisabled) {
            currentMonthDisabledCount++;
            console.log('[nuxeo-accessible-date-picker] Current month date disabled:', currentDate.toDateString());
          } else {
            currentMonthEnabledCount++;
            console.log('[nuxeo-accessible-date-picker] Current month date enabled:', currentDate.toDateString());
          }
        }
        
        if (isDisabled) {
          disabledCount++;
        } else {
          enabledCount++;
        }
        
        const isEmpty = !isCurrentMonth;
        
        // Use local date formatting to avoid timezone issues
        const dateYear = currentDate.getFullYear();
        const dateMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dateDay = String(currentDate.getDate()).padStart(2, '0');
        const dateISO = `${dateYear}-${dateMonth}-${dateDay}`;
        
        days.push({
          date: new Date(currentDate),
          day: isEmpty ? '' : currentDate.getDate(),
          dateISO: dateISO,
          isCurrentMonth,
          isToday,
          isSelected,
          isDisabled,
          isOtherMonth: !isCurrentMonth,
          isEmpty,
        });
      }
      
      console.log(`[nuxeo-accessible-date-picker] Calendar generated for ${year}-${String(month + 1).padStart(2, '0')}:`);
      console.log(`  - Current month: ${currentMonthEnabledCount} enabled, ${currentMonthDisabledCount} disabled`);
      console.log(`  - Total (including other months): ${enabledCount} enabled, ${disabledCount} disabled`);
      console.log(`  - First day of week: ${firstDayOfWeek}`);
      
      this.set('_calendarDays', days);
      
      // Force update of navigation button states after calendar generation
      this.async(() => {
        this._updateNavigationButtonStates();
      }, 10);
    }

    // Method to force update of navigation button states
    _updateNavigationButtonStates() {
      const prevButton = this.shadowRoot.querySelector('#prevMonth');
      const nextButton = this.shadowRoot.querySelector('#nextMonth');
      
      if (prevButton) {
        const isPrevDisabled = this._isPreviousMonthDisabled();
        prevButton.disabled = isPrevDisabled;
        console.log('[nuxeo-accessible-date-picker] Previous button disabled state updated:', isPrevDisabled);
      }
      
      if (nextButton) {
        const isNextDisabled = this._isNextMonthDisabled();
        nextButton.disabled = isNextDisabled;
        console.log('[nuxeo-accessible-date-picker] Next button disabled state updated:', isNextDisabled);
      }
    }

    _setupEventListeners() {
      // Additional setup for navigation buttons and year select
      const prevButton = this.shadowRoot.querySelector('#prevMonth');
      if (prevButton) {
        prevButton.addEventListener('click', (e) => {
          e.stopPropagation();
          this._previousMonth();
        });
      }
      
      const nextButton = this.shadowRoot.querySelector('#nextMonth');
      if (nextButton) {
        nextButton.addEventListener('click', (e) => {
          e.stopPropagation();
          this._nextMonth();
        });
      }
      
      // Input field events - only validation, no calendar opening
      const dateInput = this.shadowRoot.querySelector('#dateInput');
      if (dateInput) {
        dateInput.addEventListener('keydown', (e) => {
          // Allow opening calendar with specific keys when input is focused
          if (e.key === 'F4' || e.key === 'ArrowDown') {
            e.preventDefault();
            this._openCalendar();
          } else if (e.key === 'Enter') {
            // Enter validates input or opens calendar if input is empty
            if (!dateInput.value.trim() || dateInput.value.trim() === this._maskTemplate) {
              e.preventDefault();
              this._openCalendar();
            } else {
              this._validateAndParseInput();
            }
          }
        });
        
        // Blur is handled by _onMaskedInputBlur (template binding). Avoid duplicate validation here.
        dateInput.addEventListener('blur', (e) => {
          // No-op to prevent double validation and error flicker
        });
      }
      
      // Calendar grid keyboard navigation
      const calendarGrid = this.shadowRoot.querySelector('.calendar-grid');
      if (calendarGrid) {
        calendarGrid.addEventListener('keydown', (e) => this._handleGridKeydown(e));
      }

      // Close year-dropdown when clicking outside it but inside the component
      this.shadowRoot.addEventListener('click', (e) => {
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
      }, true);

      // Focus trap and global key handling inside the popover (Tab/Escape)
      const popover = this.shadowRoot.querySelector('#calendarPopover');
      if (popover) {
        popover.addEventListener('keydown', (e) => this._handlePopoverKeydown(e));
      }
      
      // Document events
      document.addEventListener('click', (e) => this._handleDocumentClick(e));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this._isCalendarOpen) {
          this._closeCalendar();
        }
      });
    }

    _setupFocusTrap() {
      this._focusableElements = [
        () => this.shadowRoot.querySelector('#yearSelect'),
        () => this.shadowRoot.querySelector('#prevMonth'),
        () => this.shadowRoot.querySelector('#nextMonth'),
        () => this.shadowRoot.querySelector('.calendar-day:not(.disabled):not(.empty)'),
      ];
    }

    _handlePopoverKeydown(e) {
      if (e.key !== 'Tab' && e.key !== 'Escape') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        this._closeCalendar();
        return;
      }
      // Trap focus within the popover when open
      if (!this._isCalendarOpen) return;
      const popover = this.shadowRoot.querySelector('#calendarPopover');
      if (!popover) return;
      const focusable = Array.from(popover.querySelectorAll('[tabindex], button, [href], input, select, textarea'))
        .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null);
      if (focusable.length === 0) return;
      const currentIndex = focusable.indexOf(this.shadowRoot.activeElement || this.shadowRoot.querySelector(':focus'));
      let nextIndex = currentIndex;
      if (e.shiftKey) {
        nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
      }
      e.preventDefault();
      focusable[nextIndex].focus();
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
        const scrollTop = buttonTop - (containerHeight / 2) + (buttonHeight / 2);
        
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
      return (item.year === viewDate.getFullYear() && item.month === viewDate.getMonth()) ? 'selected' : '';
    }

    _getDropdownIcon(isOpen) {
      return isOpen ? 'icons:arrow-drop-up' : 'icons:arrow-drop-down';
    }

    _getMonthName(date) {
      if (!date) return '';
      return new Intl.DateTimeFormat(this._locale, { month: 'long' }).format(date);
    }

    _getYear(date) {
      if (!date) return '';
      return date.getFullYear();
    }

    _handleDocumentClick(e) {
      if (!this._isCalendarOpen) return;
      
      if (!this.contains(e.target)) {
        this._closeCalendar();
        
        // Also close year dropdown if open
        const yearOptions = this.shadowRoot.querySelector('#yearOptions');
        if (yearOptions) {
          yearOptions.classList.remove('open');
          this._isYearDropdownOpen = false;
        }
      }
    }

    _clearDate(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      this._selectedDate = null;
      this._inputValue = '';
      this._focusedDate = null; // Clear focused date to remove any highlighting
      this._safeSetValue('');
      this.invalid = false;
      this.errorMessage = '';
      
      // Regenerate calendar to remove any date highlighting
      this._generateCalendar();
    }

    _selectDate(date) {
      if (!date) return;
      
      console.log('[nuxeo-accessible-date-picker] Selecting date:', date.toDateString());
      
      // Validate the date against constraints before selecting
      if (!this._isValidDate(date)) {
        console.log('[nuxeo-accessible-date-picker] Date selection blocked - violates constraints');
        this.invalid = true;
        
        let errorMsg = 'Selected date is outside the allowed range';
        if (this.min && this.max) {
          const minFormatted = this._moment(this.min).format('L');
          const maxFormatted = this._moment(this.max).format('L');
          errorMsg = `Date must be between ${minFormatted} and ${maxFormatted}`;
        } else if (this.min) {
          const minFormatted = this._moment(this.min).format('L');
          errorMsg = `Date must be on or after ${minFormatted}`;
        } else if (this.max) {
          const maxFormatted = this._moment(this.max).format('L');
          errorMsg = `Date must be on or before ${maxFormatted}`;
        }
        
        this.errorMessage = errorMsg;
        return;
      }
      
      this._selectedDate = new Date(date);
      this._selectedDate.setHours(0, 0, 0, 0); // Normalize to start of day
      
      // Use local date formatting to avoid timezone issues
      const year = this._selectedDate.getFullYear();
      const month = String(this._selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(this._selectedDate.getDate()).padStart(2, '0');
      const isoString = `${year}-${month}-${day}`;
      
      console.log('[nuxeo-accessible-date-picker] Date selected successfully:', isoString);
      this._safeSetValue(isoString);
      
      // Clear focused date when selecting to prevent any focus highlighting
      this._focusedDate = null;
      
      // Update the input field
      this._inputValue = this._formatDateForInput(this._selectedDate);
      // Ensure masked value reflects the locale mask (dd/mm, mm/dd, or yyyy-mm-dd)
      this._updateMaskedInputFromDate();
      this._generateCalendar(); // Regenerate to update selected state
      this._closeCalendar();
      this._announce(`Date selected ${this._formatAriaDate(this._selectedDate)}.`);
      
      // Clear any previous error state
      this.invalid = false;
      this.errorMessage = '';
    }

    _selectToday(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const today = new Date(this._today);
      this._selectDate(today);
    }

    _openCalendar(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (this.disabled || this._isCalendarOpen) return;
      
      console.log('[nuxeo-accessible-date-picker] Opening calendar with constraints - min:', this.min, 'max:', this.max);
      
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
          console.log('[nuxeo-accessible-date-picker] Setting initial view to min date:', initialDate.toDateString());
        } else if (this.max) {
          // Only use max date if no min date is specified and today is after max
          const maxDate = new Date(this.max);
          if (initialDate > maxDate) {
            initialDate = new Date(maxDate);
            console.log('[nuxeo-accessible-date-picker] Adjusted initial date to respect max constraint:', initialDate.toDateString());
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
          
          console.log('[nuxeo-accessible-date-picker] Final initial date within min-max range:', initialDate.toDateString());
        }
        
        this._viewDate = initialDate;
        this._focusedDate = null; // No focused date when no date is selected
      }
      
      this._generateYearOptions();
      this._generateCalendar();
      
      this._isCalendarOpen = true;
      const popover = this.shadowRoot.querySelector('#calendarPopover');
      if (popover) {
        popover.classList.add('open');
      }
      // Position popover based on available viewport space
      this._positionPopover();
      // Reposition on resize/scroll while open
      this._boundReposition = this._boundReposition || (() => this._positionPopover());
      window.addEventListener('resize', this._boundReposition, { passive: true });
      window.addEventListener('scroll', this._boundReposition, { passive: true });
      // Announce calendar opened
      this._announce('Calendar opened. Use arrow keys to navigate dates. Press Escape to close.');
      
      // Fire opened-changed event for compatibility with nuxeo-date-picker
      this.dispatchEvent(new CustomEvent('opened-changed', {
        detail: { value: true },
        bubbles: true,
        composed: true
      }));
      
      this.async(() => {
        this._focusFirstAvailableDate();
      }, 150);
    }

    _closeCalendar(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (!this._isCalendarOpen) return;
      
      this._isCalendarOpen = false;
      const popover = this.shadowRoot.querySelector('#calendarPopover');
      if (popover) {
        popover.classList.remove('open');
        popover.classList.remove('open-up');
        popover.style.left = '';
        popover.style.right = '';
      }
      // Announce calendar closed
      this._announce('Calendar closed.');
      // Remove reposition listeners
      if (this._boundReposition) {
        window.removeEventListener('resize', this._boundReposition);
        window.removeEventListener('scroll', this._boundReposition);
      }
      
      // Fire opened-changed event for compatibility with nuxeo-date-picker
      this.dispatchEvent(new CustomEvent('opened-changed', {
        detail: { value: false },
        bubbles: true,
        composed: true
      }));
      
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

    _previousMonth() {
      const newDate = new Date(this._viewDate);
      newDate.setMonth(newDate.getMonth() - 1);
      
      // Check if the previous month has any valid dates using the same logic as button disable check
      const prevMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      const hasValidDates = this._monthHasValidDates(prevMonth);
      
      if (!hasValidDates) {
        console.log('[nuxeo-accessible-date-picker] Previous month navigation blocked - no valid dates in target month:', prevMonth.toDateString());
        return; // Don't navigate if target month has no valid dates
      }
      
      console.log('[nuxeo-accessible-date-picker] Navigating to previous month:', newDate.toDateString());
      this._viewDate = newDate;
      
      // Clear focused date when changing months to prevent incorrect highlighting
      this._focusedDate = null;
      
      // Regenerate month-year options if we moved far from the current range
      this._generateMonthYearOptions();
      this._generateCalendar();
      this._announce(`Moved to ${this._getMonthName(this._viewDate)} ${this._getYear(this._viewDate)}.`);
    }

    _nextMonth() {
      const newDate = new Date(this._viewDate);
      newDate.setMonth(newDate.getMonth() + 1);
      
      // Check if the next month has any valid dates using the same logic as button disable check
      const nextMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      const hasValidDates = this._monthHasValidDates(nextMonth);
      
      if (!hasValidDates) {
        console.log('[nuxeo-accessible-date-picker] Next month navigation blocked - no valid dates in target month:', nextMonth.toDateString());
        return; // Don't navigate if target month has no valid dates
      }
      
      console.log('[nuxeo-accessible-date-picker] Navigating to next month:', newDate.toDateString());
      this._viewDate = newDate;
      
      // Clear focused date when changing months to prevent incorrect highlighting
      this._focusedDate = null;
      
      // Regenerate month-year options if we moved far from the current range
      this._generateMonthYearOptions();
      this._generateCalendar();
      this._announce(`Moved to ${this._getMonthName(this._viewDate)} ${this._getYear(this._viewDate)}.`);
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

    _handleDateClick(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const button = e.target.closest('.calendar-day');
      if (!button || button.disabled || button.classList.contains('empty')) return;
      
      // Enhanced validation for disabled dates
      if (button.classList.contains('disabled')) {
        console.log('[nuxeo-accessible-date-picker] Attempted to select disabled date - blocked by min/max constraint');
        const dateISO = button.dataset.date;
        const attemptedDate = new Date(dateISO);
        
        // Provide specific feedback about which constraint was violated
        let constraintMessage = '';
        if (this.min && attemptedDate < new Date(this.min)) {
          constraintMessage = `Date must be on or after ${new Date(this.min).toLocaleDateString()}`;
        } else if (this.max && attemptedDate > new Date(this.max)) {
          constraintMessage = `Date must be on or before ${new Date(this.max).toLocaleDateString()}`;
        } else {
          constraintMessage = 'Selected date is outside the allowed range';
        }
        
        // Mark as not selectable; do not show visually until submit
        this.invalid = true;
        this.errorReason = 'notSelectable';
        this.errorMessage = 'Date not selectable. ' + constraintMessage;
        console.log('[nuxeo-accessible-date-picker] Error message set:', constraintMessage);
        return;
      }
      
      const dateISO = button.dataset.date;
      if (dateISO) {
        const selectedDate = new Date(dateISO);
        console.log('[nuxeo-accessible-date-picker] Date clicked:', selectedDate.toDateString(), 'Valid:', this._isValidDate(selectedDate));
        // Clear any format errors on valid selection
        if (this._isValidDate(selectedDate)) {
          this.invalid = false;
          this.errorReason = '';
          this.errorMessage = '';
        }
        this._selectDate(selectedDate);
      }
    }

    _handleGridKeydown(e) {
      const currentButton = e.target;
      if (!currentButton.classList.contains('calendar-day')) return;
      
      const currentDate = new Date(currentButton.dataset.date);
      let targetDate = new Date(currentDate);
      
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          // Allow selection of any current month date, not just non-empty
          if (!currentButton.disabled && currentButton.classList.contains('calendar-day')) {
            // Check if it's a valid current month date
            const isCurrentMonth = currentDate.getMonth() === this._viewDate.getMonth() &&
                                  currentDate.getFullYear() === this._viewDate.getFullYear();
            if (isCurrentMonth) {
              this._selectDate(currentDate);
            }
          }
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          targetDate.setDate(currentDate.getDate() - 1);
          this._focusDate(targetDate, true);
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          targetDate.setDate(currentDate.getDate() + 1);
          this._focusDate(targetDate, true);
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          targetDate.setDate(currentDate.getDate() - 7);
          this._focusDate(targetDate, true);
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          targetDate.setDate(currentDate.getDate() + 7);
          this._focusDate(targetDate, true);
          break;
          
        case 'Home':
          e.preventDefault();
          const dayOfWeek = currentDate.getDay();
          targetDate.setDate(currentDate.getDate() - dayOfWeek);
          this._focusDate(targetDate, true);
          break;
          
        case 'End':
          e.preventDefault();
          const daysToEnd = 6 - currentDate.getDay();
          targetDate.setDate(currentDate.getDate() + daysToEnd);
          this._focusDate(targetDate, true);
          break;
          
        case 'PageUp':
          e.preventDefault();
          if (e.shiftKey) {
            targetDate.setFullYear(currentDate.getFullYear() - 1);
          } else {
            targetDate.setMonth(currentDate.getMonth() - 1);
          }
          this._focusDate(targetDate, true);
          break;
          
        case 'PageDown':
          e.preventDefault();
          if (e.shiftKey) {
            targetDate.setFullYear(currentDate.getFullYear() + 1);
          } else {
            targetDate.setMonth(currentDate.getMonth() + 1);
          }
          this._focusDate(targetDate, true);
          this._announce(`Focused ${this._formatAriaDate(targetDate)}.`);
          break;
      }
    }

    _focusDate(date, allowCrossMonth = false) {
      // Update focused date
      this._focusedDate = new Date(date);
      this._focusedDate.setHours(0, 0, 0, 0);
      
      // Update view if necessary
      if (date.getMonth() !== this._viewDate.getMonth() || 
          date.getFullYear() !== this._viewDate.getFullYear()) {
        this._viewDate = new Date(date);
      this._generateCalendar();
      }
      
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
      
      // Try the selected date first if it's in the current month
      if (this._selectedDate && 
          this._selectedDate.getMonth() === month && 
          this._selectedDate.getFullYear() === year) {
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
      let firstValidDate = new Date(year, month, 1);
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
      
      if (this._selectedDate && 
          this._selectedDate.getMonth() === this._viewDate.getMonth() &&
          this._selectedDate.getFullYear() === this._viewDate.getFullYear()) {
        targetDate = new Date(this._selectedDate);
      } else if (this._today.getMonth() === this._viewDate.getMonth() &&
                 this._today.getFullYear() === this._viewDate.getFullYear()) {
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

    _parseAndSetDate(inputValue) {
      // This method is now replaced by _validateAndParseInput
      this._validateAndParseInput();
    }

    _parseWithFormat(inputValue, format) {
      try {
        if (format === 'MM/DD/YYYY' || format === 'DD/MM/YYYY') {
          const match = inputValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (match) {
            let day, month, year;
            if (format === 'MM/DD/YYYY') {
              [, month, day, year] = match;
            } else {
              [, day, month, year] = match;
            }
            
            // Use local date construction to avoid timezone issues
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            parsedDate.setHours(0, 0, 0, 0);
            
            // Validate the date is what we expect (not shifted by timezone)
            if (parsedDate.getFullYear() === parseInt(year) &&
                parsedDate.getMonth() === parseInt(month) - 1 &&
                parsedDate.getDate() === parseInt(day)) {
              return parsedDate;
            }
          }
        } else if (format === 'YYYY-MM-DD') {
          const match = inputValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
          if (match) {
            const [, year, month, day] = match;
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            parsedDate.setHours(0, 0, 0, 0);
            
            // Validate the date
            if (parsedDate.getFullYear() === parseInt(year) &&
                parsedDate.getMonth() === parseInt(month) - 1 &&
                parsedDate.getDate() === parseInt(day)) {
              return parsedDate;
            }
          }
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
      if (!value || value === this._maskTemplate) {
        this._selectedDate = null;
        this._inputValue = '';
        this._safeSetValue('');
        this.invalid = false;
        this.errorReason = '';
        this.errorMessage = '';
        this._generateCalendar();
        return;
      }
      
      // Try to parse the date using the current input mask first (strict), then fallback to locale formats
      let parsedDate = null;
      try {
        parsedDate = this._parseWithFormat(value, this._inputMask === 'dd/mm/yyyy' ? 'DD/MM/YYYY'
          : this._inputMask === 'mm/dd/yyyy' ? 'MM/DD/YYYY'
          : this._inputMask === 'yyyy-mm-dd' ? 'YYYY-MM-DD' : '');
      } catch (_) {
        parsedDate = null;
      }
      if (!parsedDate) {
        const formats = this._getLocaleDateFormats();
        for (const format of formats) {
          parsedDate = this._parseWithFormat(value, format);
          if (parsedDate) break;
        }
      }
      
      if (parsedDate && this._isValidDate(parsedDate)) {
        // Valid date found
        this._selectedDate = parsedDate;
        this._selectedDate.setHours(0, 0, 0, 0);
        
        // Format as ISO string for value
        const year = this._selectedDate.getFullYear();
        const month = String(this._selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(this._selectedDate.getDate()).padStart(2, '0');
        const isoString = `${year}-${month}-${day}`;
        
        this._safeSetValue(isoString);
        
        // Update input with formatted date
        this._inputValue = this._formatDateForInput(this._selectedDate);
        
        // Navigate calendar to the selected date
        this._viewDate = new Date(this._selectedDate);
        this._generateCalendar();
        
        this.invalid = false;
        this.errorReason = '';
        this.errorMessage = '';
        console.log('Valid date parsed:', this._selectedDate);
      } else {
        // If parsed but out of range, show out-of-range not format
        if (parsedDate) {
          this.invalid = true;
          this.errorReason = 'outOfRange';
          this.errorMessage = this._buildOutOfRangeMessage(parsedDate);
        } else {
          // Distinguish invalid date vs incorrect format
          const formats = this._getLocaleDateFormats();
          let isInvalidDate = false;
          for (const fmt of formats) {
            const m = moment(value, fmt, false);
            if (!m.isValid()) {
              const pf = m.parsingFlags ? m.parsingFlags() : {};
              if (pf && typeof pf.overflow === 'number' && pf.overflow >= 4) {
                isInvalidDate = true;
                break;
              }
            }
          }
          this.invalid = true;
          if (isInvalidDate) {
            this.errorReason = 'invalidDate';
            this.errorMessage = 'Invalid date. Please check the day, month, and year.';
          } else {
            this.errorReason = 'format';
            this.errorMessage = `Incorrect date format. Expected: ${this._getDatePlaceholder()}`;
          }
          console.warn('Invalid date input:', value);
        }
      }
    }

    _safeSetValue(newValue) {
      try {
        // Try multiple approaches to safely set the value
        if (this.set && typeof this.set === 'function') {
          this.set('value', newValue);
        } else if (this.hasOwnProperty('value')) {
          this.value = newValue;
        } else {
          // Create the property if it doesn't exist
          Object.defineProperty(this, 'value', {
            value: newValue,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
        
        // Also notify any property observers
        if (this.notifyPath && typeof this.notifyPath === 'function') {
          this.notifyPath('value');
        }
      } catch (error) {
        console.warn('Error setting value safely:', error);
        // Last resort - try direct assignment
        try {
          this.value = newValue;
        } catch (fallbackError) {
          console.error('Failed to set value with fallback:', fallbackError);
        }
      }
    }

    _getLocaleDateFormats() {
      // Prefer the active input mask to define primary parsing order
      if (this._inputMask === 'dd/mm/yyyy') {
        return ['DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'];
      }
      if (this._inputMask === 'mm/dd/yyyy') {
        return ['MM/DD/YYYY', 'M/D/YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'];
      }
      if (this._inputMask === 'yyyy-mm-dd') {
        return ['YYYY-MM-DD', 'YYYY/MM/DD'];
      }
      // Fallback to locale
      const locale = (this._locale || '').toLowerCase();
      if (locale.startsWith('en-us')) return ['MM/DD/YYYY', 'M/D/YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'];
      if (locale.startsWith('en-gb') || locale.startsWith('en-au')) return ['DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'];
      if (locale.startsWith('de') || locale.startsWith('fr') || locale.startsWith('es')) return ['DD.MM.YYYY', 'DD/MM/YYYY', 'D.M.YYYY', 'YYYY-MM-DD'];
      return ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'];
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
      
      // Use i18n.formatDate if available for consistency with nuxeo-date-picker
      if (this.i18n && this.i18n.formatDate) {
        try {
          return this.i18n.formatDate(date);
        } catch (error) {
          console.warn('[nuxeo-accessible-date-picker] Error using i18n.formatDate:', error);
        }
      }
      
      // Fallback to standard formatting
      return this._dateFormatter ? this._dateFormatter.format(date) : date.toLocaleDateString();
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
      if (!date || isNaN(date.getTime())) {
        console.log('[nuxeo-accessible-date-picker] Invalid date (NaN or null):', date);
        return false;
      }
      
      // Normalize the input date to start of day for comparison
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      
      if (this.min) {
        const minDate = this._parseDateOnly(this.min);
        if (!minDate) {
          console.warn('[nuxeo-accessible-date-picker] Invalid min format, expected YYYY-MM-DD:', this.min);
        }
        // Normalize min date
        minDate && minDate.setHours(0, 0, 0, 0);
        
        const isAfterOrEqualMin = !minDate || normalizedDate >= minDate;
        console.log(`[nuxeo-accessible-date-picker] Min constraint check: ${normalizedDate.toDateString()} >= ${minDate.toDateString()} = ${isAfterOrEqualMin}`);
        
        if (!isAfterOrEqualMin) {
          console.log('[nuxeo-accessible-date-picker] Date violates min constraint:', normalizedDate.toDateString(), '<', minDate.toDateString());
          return false;
        }
      }
      
      if (this.max) {
        const maxDateBase = this._parseDateOnly(this.max);
        if (!maxDateBase) {
          console.warn('[nuxeo-accessible-date-picker] Invalid max format, expected YYYY-MM-DD:', this.max);
        }
        const maxDate = maxDateBase ? new Date(maxDateBase) : null;
        // Set to end of day for max comparison
        maxDate && maxDate.setHours(23, 59, 59, 999);
        
        const isBeforeOrEqualMax = !maxDate || normalizedDate <= maxDate;
        console.log(`[nuxeo-accessible-date-picker] Max constraint check: ${normalizedDate.toDateString()} <= ${new Date(this.max).toDateString()} = ${isBeforeOrEqualMax}`);
        
        if (!isBeforeOrEqualMax) {
          console.log('[nuxeo-accessible-date-picker] Date violates max constraint:', normalizedDate.toDateString(), '>', new Date(this.max).toDateString());
          return false;
        }
      }
      
      console.log('[nuxeo-accessible-date-picker] Date is valid:', normalizedDate.toDateString());
      return true;
    }

    _isDateDisabled(date) {
      return !this._isValidDate(date);
    }

    _getDatePlaceholder() {
      // Prefer mask decided by locale setup
      if (this._inputMask) return this._inputMask;
      if (!this._dateFormatter) return 'mm/dd/yyyy';
      try {
        const sample = new Date(2024, 11, 25);
        const formatted = this._dateFormatter.format(sample);
        return formatted.replace(/\d+/g, (match) => {
          if (match === '2024') return 'yyyy';
          if (match === '12') return 'mm';
          if (match === '25') return 'dd';
          return match;
        }).toLowerCase();
      } catch (e) {
        return 'mm/dd/yyyy';
      }
    }

    _getInputPattern(mask) {
      if (!mask) return '\\d{1,2}[/\\.-]\\d{1,2}[/\\.-]\\d{4}';
      if (mask === 'dd/mm/yyyy') return '\\d{2}/\\d{2}/\\d{4}';
      if (mask === 'mm/dd/yyyy') return '\\d{2}/\\d{2}/\\d{4}';
      if (mask === 'yyyy-mm-dd') return '\\d{4}-\\d{2}-\\d{2}';
      // fallback: accept digits with common separators
      return '\\d{1,2}[/\\.-]\\d{1,2}[/\\.-]\\d{4}';
    }

    _buildOutOfRangeMessage(date) {
      try {
        const hasMin = !!this.min;
        const hasMax = !!this.max;
        if (hasMin && hasMax) {
          return `Date out of range. Must be between ${this._moment(this.min).format('L')} and ${this._moment(this.max).format('L')}`;
        }
        if (hasMin) {
          return `Date out of range. Must be on or after ${this._moment(this.min).format('L')}`;
        }
        if (hasMax) {
          return `Date out of range. Must be on or before ${this._moment(this.max).format('L')}`;
        }
      } catch (_) {
        // no-op
      }
      return 'Date out of range.';
    }

    // Helper method to test different date formats (for debugging/testing purposes)
    _testDateFormat(inputStr) {
      console.log('\n=== DATE FORMAT TEST ===');
      console.log('Input string:', inputStr);
      console.log('Current locale:', navigator.language);
      console.log('Moment locale:', moment.locale());
      console.log('Current input mask:', this._inputMask);
      console.log('Current placeholder:', this._getDatePlaceholder());
      console.log('Min constraint:', this.min);
      console.log('Max constraint:', this.max);
      
      // Test parsing with current mask
      console.log('\n--- Parsing with current mask ---');
      const maskFormat = this._inputMask === 'dd/mm/yyyy' ? 'DD/MM/YYYY'
        : this._inputMask === 'mm/dd/yyyy' ? 'MM/DD/YYYY'
        : this._inputMask === 'yyyy-mm-dd' ? 'YYYY-MM-DD' : '';
      
      if (maskFormat) {
        const parsed = this._parseWithFormat(inputStr, maskFormat);
        if (parsed) {
          console.log('✓ Parsed successfully as:', parsed.toDateString());
          console.log('  ISO format:', parsed.toISOString().split('T')[0]);
          console.log('  In range?', this._isValidDate(parsed));
          if (!this._isValidDate(parsed)) {
            console.log('  Range violation:', this._buildOutOfRangeMessage(parsed));
          }
        } else {
          console.log('✗ Failed to parse with current mask');
        }
      }
      
      // Test with all locale formats
      console.log('\n--- Testing all locale formats ---');
      const formats = this._getLocaleDateFormats();
      formats.forEach(fmt => {
        const parsed = this._parseWithFormat(inputStr, fmt);
        if (parsed) {
          console.log(`✓ Format ${fmt}: ${parsed.toDateString()} (ISO: ${parsed.toISOString().split('T')[0]})`);
        } else {
          console.log(`✗ Format ${fmt}: failed`);
        }
      });
      
      // Test with moment.js
      console.log('\n--- Moment.js parsing ---');
      const momentParsed = this._moment(inputStr, moment.localeData().longDateFormat('L'));
      if (momentParsed.isValid()) {
        console.log('✓ Moment parsed:', momentParsed.format('YYYY-MM-DD'), momentParsed.format('L'));
      } else {
        console.log('✗ Moment parsing failed');
      }
      
      console.log('=== END TEST ===\n');
    }

    // Helper method to simulate different locales for testing
    _simulateLocale(locale) {
      console.log(`\n=== SIMULATING LOCALE: ${locale} ===`);
      const originalLocale = moment.locale();
      const originalInputMask = this._inputMask;
      
      try {
        // Temporarily change locale
        moment.locale(locale);
        this._locale = locale;
        
        // Reinitialize locale data
        this._initializeLocaleData();
        
        console.log('New input mask:', this._inputMask);
        console.log('New placeholder:', this._getDatePlaceholder());
        console.log('Moment locale format (L):', moment.localeData().longDateFormat('L'));
        console.log('Sample today formatted:', this._moment(new Date()).format('L'));
        
        // Test some sample dates
        const testDates = ['10/09/2010', '09/10/2010', '2010-10-09'];
        testDates.forEach(testDate => {
          console.log(`\nTesting "${testDate}" with ${locale}:`);
          const parsed = this._parseWithFormat(testDate, this._inputMask === 'dd/mm/yyyy' ? 'DD/MM/YYYY'
            : this._inputMask === 'mm/dd/yyyy' ? 'MM/DD/YYYY'
            : this._inputMask === 'yyyy-mm-dd' ? 'YYYY-MM-DD' : '');
          if (parsed) {
            console.log(`  ✓ Parsed as: ${parsed.toDateString()}`);
            console.log(`  ✓ Would format as: ${this._moment(parsed).format('L')}`);
          } else {
            console.log(`  ✗ Failed to parse`);
          }
        });
        
      } finally {
        // Restore original locale
        moment.locale(originalLocale);
        this._locale = navigator.language || 'en-US';
        this._inputMask = originalInputMask;
        this._initializeLocaleData();
      }
      
      console.log(`=== END LOCALE SIMULATION ===\n`);
    }

    _formatMonthYear(date) {
      if (!date) return '';
      return new Intl.DateTimeFormat(this._locale, { 
        month: 'long', 
        year: 'numeric' 
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
        if (focusedDate && 
            this._isSameDay(dayObj.date, focusedDate) && 
            !dayObj.isSelected && 
            !dayObj.isToday &&
            dayObj.isCurrentMonth &&
            focusedDate.getMonth() === this._viewDate.getMonth() &&
            focusedDate.getFullYear() === this._viewDate.getFullYear()) {
          classes.push('focused');
        }
      }
      
      return classes.join(' ');
    }

    _getDayTabIndex(dayObj, focusedDate, index) {
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
      return this._today.getMonth() === this._viewDate.getMonth() &&
             this._today.getFullYear() === this._viewDate.getFullYear();
    }

    _getDayAriaLabel(dayObj) {
      const date = dayObj.date;
      const formatter = new Intl.DateTimeFormat(this._locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
      return 'date-' + `${year}-${month}-${day}`;
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
      const isRequiredCase = this.errorReason === 'required';
      return invalid && !!errorMessage && (showErrors || !isRequiredCase);
    }

    _valueChanged() {
      try {
        console.log('[nuxeo-accessible-date-picker] Value changed to:', this.value, 'with constraints min:', this.min, 'max:', this.max);
        
        if (!this.value) {
          this._inputValue = null;
          this._selectedDate = null;
          this._maskedInputValue = this._maskTemplate;
          
          // Trigger validation for required fields when value is cleared
          if (this.required) {
            this.async(() => {
              this.validate();
            }, 10);
          }
          return;
        }
        
        const date = this._moment(this.value);
        if (this.value && date.isValid()) {
          this._preventInputUpdate = true;
          const year = `${date.get('Y')}`.padStart(4, '0');
          const month = `${date.get('M') + 1}`.padStart(2, '0');
          const day = `${date.get('D')}`.padStart(2, '0');
          this._inputValue = `${year}-${month}-${day}`;
          
          this._selectedDate = new Date(date.toDate());
          this._selectedDate.setHours(0, 0, 0, 0);
          this._updateMaskedInputFromDate();
          this._viewDate = new Date(this._selectedDate);
          
          // Clear any previous validation errors when a valid value is set
          if (this.invalid) {
            this.async(() => {
              this.validate();
            }, 10);
          }
        } else {
          this._inputValue = '';
          this._selectedDate = null;
          this._maskedInputValue = this._maskTemplate;
        }
        
        if (this._generateCalendar && typeof this._generateCalendar === 'function') {
          this._generateCalendar();
        }
      } catch (error) {
        console.warn('[nuxeo-accessible-date-picker] Error in _valueChanged:', error);
        this._selectedDate = null;
        this._maskedInputValue = this._maskTemplate;
        this._inputValue = '';
      }
    }

    // Override connectedCallback to ensure proper form integration
    connectedCallback() {
      super.connectedCallback();
      
      // Add form validation support
      if (this.form) {
        this.form.addEventListener('submit', (e) => {
          if (!this.reportValidity()) {
            e.preventDefault();
            e.stopPropagation();
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
        const msg = this.errorMessage || 'Invalid date.';
        this._announce(msg);
      }
      // Ensure error text visibility aligns with state
      const errorEl = this.shadowRoot && this.shadowRoot.querySelector('#errorText');
      if (errorEl) {
        const shouldShow = !!this._showErrors && !!newVal && !!this.errorMessage;
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
        errorEl.hidden = !(this._showErrors && this.invalid && !!newMsg);
      }
    }

    _positionPopover() {
      try {
        const popover = this.shadowRoot && this.shadowRoot.querySelector('#calendarPopover');
        const trigger = this.shadowRoot && this.shadowRoot.querySelector('.input-wrapper');
        if (!popover || !trigger || !this._isCalendarOpen) return;

        // Reset classes/styles
        popover.classList.remove('open-up');
        popover.style.left = '0px';
        popover.style.right = '';

        const rect = trigger.getBoundingClientRect();
        const popRect = popover.getBoundingClientRect();
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        const viewportW = window.innerWidth || document.documentElement.clientWidth;

        const spaceBelow = viewportH - rect.bottom;
        const spaceAbove = rect.top;
        const popHeight = popRect.height || 320;
        const popWidth = popRect.width || 280;

        // Flip vertically if not enough space below
        if (spaceBelow < popHeight && spaceAbove > spaceBelow) {
          popover.classList.add('open-up');
        } else {
          popover.classList.remove('open-up');
        }

        // Adjust horizontally if overflowing to the right
        const rightOverflow = rect.left + popWidth > viewportW - 8; // 8px padding
        if (rightOverflow) {
          popover.style.left = 'auto';
          popover.style.right = '0px';
        }
      } catch (_) {
        // no-op
      }
    }

    // Getter for form property to support form integration
    get form() {
      return this.closest('form');
    }

    _inputValueChanged() {
      console.log('[nuxeo-accessible-date-picker] Input value changed to:', this._inputValue);
      
      if (this._inputValue !== null && !this._preventInputUpdate) {
        const date = this._moment(this._inputValue);
        if (date.isValid()) {
          // Handle defaultTime like nuxeo-date-picker does
          if (this.defaultTime) {
            const time = moment(this.defaultTime, 'HH:mm:ss');
            if (time.isValid()) {
              date.add(time.hour(), 'hour');
              date.add(time.minute(), 'minute');
              date.add(time.second(), 'second');
              console.log('[nuxeo-accessible-date-picker] Applied default time:', this.defaultTime, 'to date:', date.toJSON());
            } else {
              console.error(`[nuxeo-accessible-date-picker] Invalid default time ${this.defaultTime}`);
              throw new Error(`Invalid default time ${this.defaultTime}`);
            }
          }
          
          const newValue = date.toJSON();
          console.log('[nuxeo-accessible-date-picker] Setting new value from input:', newValue);
          this.set('value', newValue);
        } else {
          console.log('[nuxeo-accessible-date-picker] Input value is invalid, clearing value');
          this.set('value', null);
        }
      }
      this._preventInputUpdate = false;
    }

    validate() {
      const isAccessibleValid = this._getValidity();
      // For required empty case, mark invalid but do not set message (border only)
      if (!isAccessibleValid && this.required && (!this.value || this.value.trim() === '')) {
        this.invalid = true;
        this.errorMessage = '';
        return false;
      }
      this.invalid = !isAccessibleValid;
      return isAccessibleValid;
    }

    _getValidity() {
      // Check required field first
      if (this.required && (!this.value || this.value.trim() === '')) {
        console.log('[nuxeo-accessible-date-picker] Required validation failed: field is required but empty');
        return false;
      }
      
      // If field is not required and empty, it's valid
      if (!this.required && (!this.value || this.value.trim() === '')) {
        console.log('[nuxeo-accessible-date-picker] Optional field is empty - valid');
        return true;
      }
      
      // Validate format strictly against locale-aware patterns
      const isFormatValid = this._validateDateFormat(this.value ? this._formatDateForInput(new Date(this.value)) : this.value);
      if (!isFormatValid && this.value) {
        this.errorReason = 'format';
      }
      
      let isMinMaxValid = true;
      
      if (this.value) {
        const currentDate = this._moment(this.value);
        
        if (this.min) {
          const minDate = this._moment(this._parseDateOnly(this.min));
          if (currentDate.isBefore(minDate, 'day')) {
            console.log('[nuxeo-accessible-date-picker] Value fails min validation:', this.value, '<', this.min);
            isMinMaxValid = false;
            this.errorReason = 'outOfRange';
            this.errorMessage = 'Date out of range. Must be on or after ' + this._moment(this.min).format('L');
          }
        }
        if (this.max) {
          const maxDate = this._moment(this._parseDateOnly(this.max));
          if (currentDate.isAfter(maxDate, 'day')) {
            console.log('[nuxeo-accessible-date-picker] Value fails max validation:', this.value, '>', this.max);
            isMinMaxValid = false;
            this.errorReason = 'outOfRange';
            this.errorMessage = 'Date out of range. Must be on or before ' + this._moment(this.max).format('L');
          }
        }
      }
      
      const isValid = isFormatValid && isMinMaxValid;
      if (!isFormatValid && this.value) {
        // Check if it's structurally a date but invalid day/month to distinguish "invalid date"
        const placeholder = this._getDatePlaceholder();
        this.errorMessage = 'Incorrect date format. Expected: ' + placeholder;
        if (typeof this._maskedInputValue === 'string' && /\d/.test(this._maskedInputValue)) {
          // Attempt parse against known formats non-strict to detect invalid date parts
          const formats = this._getLocaleDateFormats();
          for (const fmt of formats) {
            const m = moment(this._maskedInputValue, fmt, false);
            if (m.isValid()) {
              // Shouldn't happen if strict failed above; but if non-strict is valid, keep format error
              break;
            } else if (m.parsingFlags && m.parsingFlags()) {
              const pf = m.parsingFlags();
              if (pf.overflow === 4 || pf.overflow === 5 || pf.overflow === 6) {
                // 4=month, 5=day, 6=year overflow
                this.errorReason = 'invalidDate';
                this.errorMessage = 'Invalid date. Please check the day/month/year values.';
                break;
              }
            }
          }
        }
      }
      console.log('[nuxeo-accessible-date-picker] Validity check:', {
        format: isFormatValid,
        required: this.required ? !!this.value : true,
        minMax: isMinMaxValid,
        overall: isValid,
        value: this.value,
        hasValue: !!this.value
      });
      
      return isValid;
    }

    // Override checkValidity for better form integration
    checkValidity() {
      return this.validate();
    }

    // Override reportValidity for better form integration  
    reportValidity() {
      const isValid = this.validate();
      
      if (!isValid) {
        // Only now show visual errors
        this._showErrors = true;
        // Focus the input field to show validation error
        const input = this.shadowRoot.querySelector('#dateInput');
        if (input) {
          input.focus();
        }
        
        // Fire invalid event for form integration
        this.dispatchEvent(new CustomEvent('invalid', {
          bubbles: true,
          composed: true,
          detail: {
            message: this.errorMessage
          }
        }));
      }
      
      return isValid;
    }

    _validateDateFormat(dateString) {
      if (!dateString) return true;
      try {
        // Validate structure using locale-aware formats
        const formats = this._getLocaleDateFormats();
        for (const fmt of formats) {
          const m = moment(dateString, fmt, true);
          if (m.isValid()) {
            return true;
          }
        }
        return false;
      } catch (error) {
        return false;
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      
      // Clean up event listeners
      document.removeEventListener('click', this._handleDocumentClick);
      document.removeEventListener('keydown', this._handleEscapeKey);
      
      // Debug log on disconnect
      console.log('Date picker disconnected');
    }

    _handleMaskedInput(e) {
      const input = e.target;
      const inputValue = input.value;
      const cursorPosition = input.selectionStart;
      
      console.log('Input changed:', inputValue, 'cursor at:', cursorPosition);
      
      // Clean input - only allow digits and separators
      let cleanInput = inputValue.replace(/[^\d\/\-\.]/g, '');
      
      // Apply mask formatting
      const formattedInput = this._applyInputMask(cleanInput, cursorPosition);
      
      if (formattedInput !== inputValue) {
        this._currentInputValue = formattedInput;
        // Restore cursor position safely
        this.async(() => {
          if (input && typeof input.setSelectionRange === 'function') {
            const newPosition = this._calculateCursorPosition(inputValue, formattedInput, cursorPosition);
            try {
              input.setSelectionRange(newPosition, newPosition);
            } catch (error) {
              console.warn('Could not set cursor position:', error);
            }
          }
        }, 1);
      }
      
      // Parse partial date and update calendar
      this._parsePartialDate(formattedInput);
      this._updateCalendarFromPartialDate();
    }

    _applyInputMask(input, cursorPosition) {
      const separator = this._inputMask.includes('/') ? '/' : 
                      this._inputMask.includes('-') ? '-' : '.';
      
      // Remove all separators first to get clean digits
      const digitsOnly = input.replace(/[\/\-\.]/g, '');
      
      if (digitsOnly.length === 0) return '';
      
      let formatted = '';
      const mask = this._inputMask;
      
      // Apply formatting based on the specific mask
      if (mask === 'dd/mm/yyyy') {
        // Day (2 digits)
        if (digitsOnly.length >= 1) {
          formatted += digitsOnly.substring(0, 2);
        }
        if (digitsOnly.length >= 3) {
          formatted += '/' + digitsOnly.substring(2, 4);
        }
        if (digitsOnly.length >= 5) {
          formatted += '/' + digitsOnly.substring(4, 8);
        }
      } else if (mask === 'mm/dd/yyyy') {
        // Month (2 digits)
        if (digitsOnly.length >= 1) {
          formatted += digitsOnly.substring(0, 2);
        }
        if (digitsOnly.length >= 3) {
          formatted += '/' + digitsOnly.substring(2, 4);
        }
        if (digitsOnly.length >= 5) {
          formatted += '/' + digitsOnly.substring(4, 8);
        }
      } else { // yyyy-mm-dd
        // Year (4 digits)
        if (digitsOnly.length >= 1) {
          formatted += digitsOnly.substring(0, 4);
        }
        if (digitsOnly.length >= 5) {
          formatted += '-' + digitsOnly.substring(4, 6);
        }
        if (digitsOnly.length >= 7) {
          formatted += '-' + digitsOnly.substring(6, 8);
        }
      }
      
      return formatted;
    }

    _calculateCursorPosition(oldValue, newValue, oldPosition) {
      // Simple cursor position calculation
      // In a real implementation, this would be more sophisticated
      return Math.min(oldPosition, newValue.length);
    }

    _handleInputKeydown(e) {
      const input = e.target;
      const value = input.value;
      const cursorPosition = input.selectionStart;
      
      console.log('Key pressed:', e.key, 'at position:', cursorPosition);
      
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'F4') {
        e.preventDefault();
        this._openCalendar();
        return;
      }
      
      if (e.key === 'Tab') {
        // Move to next date part
        const nextPosition = this._getNextDatePartPosition(cursorPosition, true);
        if (nextPosition !== cursorPosition && input && typeof input.setSelectionRange === 'function') {
          e.preventDefault();
          try {
            input.setSelectionRange(nextPosition, nextPosition);
          } catch (error) {
            console.warn('Could not set cursor position on Tab:', error);
          }
        }
        return;
      }
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Allow natural cursor movement
        return;
      }
      
      if (e.key === 'Backspace' || e.key === 'Delete') {
        // Handle deletion within date parts
        return;
      }
      
      // Only allow digits
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    }

    _handleInputKeyup(e) {
      // Auto-advance cursor to next part when current part is complete
      const input = e.target;
      const value = input.value;
      const cursorPosition = input.selectionStart;
      
      if (/^\d$/.test(e.key)) {
        const currentPart = this._getCurrentDatePart(cursorPosition);
        if (this._isDatePartComplete(currentPart, value)) {
          const nextPosition = this._getNextDatePartPosition(cursorPosition, true);
          if (nextPosition !== cursorPosition && input && typeof input.setSelectionRange === 'function') {
            try {
              input.setSelectionRange(nextPosition, nextPosition);
            } catch (error) {
              console.warn('Could not set cursor position on keyup:', error);
            }
          }
        }
      }
    }

    _handleInputFocus(e) {
      // Position cursor at first incomplete part
      const input = e.target;
      const value = input.value;
      
      if (!input || typeof input.setSelectionRange !== 'function') {
        return;
      }
      
      if (!value) {
        try {
          input.setSelectionRange(0, 0);
        } catch (error) {
          console.warn('Could not set cursor position on focus:', error);
        }
        return;
      }
      
      const firstIncompletePosition = this._getFirstIncompletePartPosition(value);
      try {
        input.setSelectionRange(firstIncompletePosition, firstIncompletePosition);
      } catch (error) {
        console.warn('Could not set cursor position on focus:', error);
      }
    }

    _getCurrentDatePart(cursorPosition) {
      const mask = this._inputMask;
      
      // Determine which part (day, month, year) the cursor is in
      if (mask === 'dd/mm/yyyy') {
        if (cursorPosition <= 2) return 'day';
        if (cursorPosition <= 5) return 'month';
        return 'year';
      } else if (mask === 'mm/dd/yyyy') {
        if (cursorPosition <= 2) return 'month';
        if (cursorPosition <= 5) return 'day';
        return 'year';
      } else { // yyyy-mm-dd
        if (cursorPosition <= 4) return 'year';
        if (cursorPosition <= 7) return 'month';
        return 'day';
      }
    }

    _isDatePartComplete(part, value) {
      const partValue = this._getDatePartValue(part, value);
      
      if (part === 'day' || part === 'month') {
        return partValue.length === 2;
      } else if (part === 'year') {
        return partValue.length === 4;
      }
      
      return false;
    }

    _getDatePartValue(part, value) {
      const mask = this._inputMask;
      
      if (mask === 'dd/mm/yyyy') {
        if (part === 'day') return value.substring(0, 2);
        if (part === 'month') return value.substring(3, 5);
        if (part === 'year') return value.substring(6, 10);
      } else if (mask === 'mm/dd/yyyy') {
        if (part === 'month') return value.substring(0, 2);
        if (part === 'day') return value.substring(3, 5);
        if (part === 'year') return value.substring(6, 10);
      } else { // yyyy-mm-dd
        if (part === 'year') return value.substring(0, 4);
        if (part === 'month') return value.substring(5, 7);
        if (part === 'day') return value.substring(8, 10);
      }
      
      return '';
    }

    _getNextDatePartPosition(currentPosition, forward = true) {
      const mask = this._inputMask;
      
      if (mask === 'dd/mm/yyyy' || mask === 'mm/dd/yyyy') {
        if (forward) {
          if (currentPosition < 3) return 3;
          if (currentPosition < 6) return 6;
          return 10;
        } else {
          if (currentPosition > 6) return 6;
          if (currentPosition > 3) return 3;
          return 0;
        }
      } else { // yyyy-mm-dd
        if (forward) {
          if (currentPosition < 5) return 5;
          if (currentPosition < 8) return 8;
          return 11;
        } else {
          if (currentPosition > 8) return 8;
          if (currentPosition > 5) return 5;
          return 0;
        }
      }
    }

    _getFirstIncompletePartPosition(value) {
      const mask = this._inputMask;
      
      if (mask === 'dd/mm/yyyy') {
        if (value.length < 2) return 0;
        if (value.length < 5) return 3;
        if (value.length < 10) return 6;
        return 0;
      } else if (mask === 'mm/dd/yyyy') {
        if (value.length < 2) return 0;
        if (value.length < 5) return 3;
        if (value.length < 10) return 6;
        return 0;
      } else { // yyyy-mm-dd
        if (value.length < 4) return 0;
        if (value.length < 7) return 5;
        if (value.length < 10) return 8;
        return 0;
      }
    }

    _parsePartialDate(input) {
      const mask = this._inputMask;
      
      console.log('Parsing partial date:', input, 'with mask:', mask);
      
      this._partialDate = { day: '', month: '', year: '' };
      
      if (mask === 'dd/mm/yyyy') {
        this._partialDate.day = this._getDatePartValue('day', input);
        this._partialDate.month = this._getDatePartValue('month', input);
        this._partialDate.year = this._getDatePartValue('year', input);
      } else if (mask === 'mm/dd/yyyy') {
        this._partialDate.month = this._getDatePartValue('month', input);
        this._partialDate.day = this._getDatePartValue('day', input);
        this._partialDate.year = this._getDatePartValue('year', input);
      } else { // yyyy-mm-dd
        this._partialDate.year = this._getDatePartValue('year', input);
        this._partialDate.month = this._getDatePartValue('month', input);
        this._partialDate.day = this._getDatePartValue('day', input);
      }
      
      console.log('Parsed partial date:', this._partialDate);
    }

    _updateCalendarFromPartialDate() {
      let needsCalendarUpdate = false;
      let newViewDate = new Date(this._viewDate);
      
      // Update year if provided
      if (this._partialDate.year && this._partialDate.year.length === 4) {
        const year = parseInt(this._partialDate.year);
        if (year >= 1900 && year <= 2100) {
          newViewDate.setFullYear(year);
          needsCalendarUpdate = true;
        }
      }
      
      // Update month if provided
      if (this._partialDate.month && this._partialDate.month.length >= 1) {
        const month = parseInt(this._partialDate.month);
        if (month >= 1 && month <= 12) {
          newViewDate.setMonth(month - 1);
          needsCalendarUpdate = true;
        }
      }
      
      // If we have a complete date, select it
      if (this._partialDate.day && this._partialDate.day.length >= 1 &&
          this._partialDate.month && this._partialDate.month.length >= 1 &&
          this._partialDate.year && this._partialDate.year.length === 4) {
        
        const day = parseInt(this._partialDate.day);
        const month = parseInt(this._partialDate.month);
        const year = parseInt(this._partialDate.year);
        
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
          const testDate = new Date(year, month - 1, day);
          if (testDate.getDate() === day) { // Valid date
            this._selectedDate = testDate;
            this._selectedDate.setHours(0, 0, 0, 0);
            
            const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            this.set('value', isoString);
            
            console.log('Complete date selected:', this._selectedDate);
            needsCalendarUpdate = true;
          }
        }
      }
      
      if (needsCalendarUpdate) {
        this._viewDate = newViewDate;
        this._generateMonthYearOptions();
        this._generateCalendar();
      }
    }

    _finalizePartialDateInput() {
      // This method is called when the input field loses focus and the partial date is not empty.
      // It validates and finalizes the partial date input.
      const input = this.shadowRoot.querySelector('#dateInput');
      if (!input) return;
      
      const value = input.value;
      const mask = this._inputMask;

      // If the input is empty, clear selected date and partial date
      if (!value || !value.trim()) {
        this._selectedDate = null;
        this._currentInputValue = '';
        this._partialDate = { day: '', month: '', year: '' };
        this.set('value', '');
        this.invalid = false; // Clear invalid state if input is empty
        return;
      }

      // Apply mask to the input value to ensure consistent formatting
      const formattedInput = this._applyInputMask(value, input.selectionStart || 0);

      // Parse the formatted input using the current mask
      let parsedDate = null;
      for (const format of this._getLocaleDateFormats()) {
        parsedDate = this._parseWithFormat(formattedInput, format);
        if (parsedDate) break;
      }

      if (parsedDate && this._isValidDate(parsedDate)) {
        this._selectedDate = parsedDate;
        this._selectedDate.setHours(0, 0, 0, 0); // Normalize to start of day
        
        // Use local date formatting to avoid timezone issues
        const year = this._selectedDate.getFullYear();
        const month = String(this._selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(this._selectedDate.getDate()).padStart(2, '0');
        const isoString = `${year}-${month}-${day}`;
        
        this.set('value', isoString);
        this._updateMaskedInputFromDate();
        this.invalid = false; // Clear invalid state if input is valid
      } else {
        this._updateMaskedInputFromDate();
        this.invalid = true; // Set invalid state if input is not valid
      }
    }

    _toggleYearDropdown(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      console.log('[nuxeo-accessible-date-picker] _toggleYearDropdown called');
      const yearOptions = this.shadowRoot.querySelector('#yearOptions');
      if (yearOptions) {
        const isOpen = yearOptions.classList.contains('open');
        this._isYearDropdownOpen = !isOpen;
        yearOptions.classList.toggle('open');
        console.log('[nuxeo-accessible-date-picker] Year dropdown open:', !isOpen);
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
      console.log('[nuxeo-accessible-date-picker] _focusCurrentYear called, currentYear:', currentYear, 'yearButton:', !!yearButton);
      if (yearButton) {
        // Clear tabindex from all year options first
        const allYearButtons = Array.from(this.shadowRoot.querySelectorAll('.year-option'));
        allYearButtons.forEach(btn => btn.tabIndex = -1);
        // Set current year as tabbable and focus it
        yearButton.tabIndex = 0;
        yearButton.focus();
        console.log('[nuxeo-accessible-date-picker] Focused year button:', yearButton.dataset.year);
        // Set up keyboard navigation for year options
        this._setupYearKeyNavigation();
      } else {
        console.warn('[nuxeo-accessible-date-picker] No year button found for current year:', currentYear);
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
        const scrollTop = buttonTop - (containerHeight / 2) + (buttonHeight / 2);
        
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
        this._yearKeydownHandler = (e) => this._handleYearKeyDown(e);
        yearOptions.addEventListener('keydown', this._yearKeydownHandler);
        console.log('[nuxeo-accessible-date-picker] _setupYearKeyNavigation: keydown listener attached to yearOptions');
      }
    }

    _handleYearKeyDown(e) {
      // Derive the option receiving the event for cross-browser reliability
      let currentFocused = (e.target && e.target.closest && e.target.closest('.year-option'))
        || this.shadowRoot.activeElement
        || null;
      // Only consider visible year options inside the open panel
      let allYearButtons = Array.from(this.shadowRoot.querySelectorAll('#yearOptions.open .year-option'));
      if (!currentFocused || !currentFocused.classList || !currentFocused.classList.contains('year-option')) {
        // Fallback to the current tabbable option
        currentFocused = allYearButtons.find(btn => btn.tabIndex === 0) || allYearButtons[0] || null;
      }
      if (!currentFocused) return;
      if (!allYearButtons.length) {
        // As an extra fallback, include options even if open class wasn't applied yet
        allYearButtons = Array.from(this.shadowRoot.querySelectorAll('#yearOptions .year-option'));
      }
      const currentIndex = allYearButtons.indexOf(currentFocused);
      let nextIndex = currentIndex;
      console.log('[nuxeo-accessible-date-picker] _handleYearKeyDown:', e.key, 'currentIndex:', currentIndex);
      // Prevent this event from bubbling to parent handlers (avoids double processing)
      // Do this only for the keys we handle
      const handledKeys = ['ArrowUp','ArrowDown','Home','End','PageUp','PageDown','Enter',' ' ,'Escape'];
      if (handledKeys.includes(e.key)) {
        e.stopPropagation();
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = Math.min(allYearButtons.length - 1, currentIndex + 1);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = allYearButtons.length - 1;
          break;
        case 'PageUp':
          e.preventDefault();
          nextIndex = Math.max(0, currentIndex - 10);
          break;
        case 'PageDown':
          e.preventDefault();
          nextIndex = Math.min(allYearButtons.length - 1, currentIndex + 10);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          console.log('[nuxeo-accessible-date-picker] Enter/Space pressed on year option:', currentFocused.dataset.year);
          currentFocused.click();
          return;
        case 'Escape':
          e.preventDefault();
          this._closeYearDropdown();
          return;
      }
      if (nextIndex !== currentIndex && nextIndex >= 0) {
        // Update tabindex for roving tabindex pattern
        allYearButtons.forEach((btn, idx) => btn.tabIndex = (idx === nextIndex ? 0 : -1));
        const nextBtn = allYearButtons[nextIndex];
        nextBtn.focus();
        // Keep the focused option in view when navigating
        if (typeof nextBtn.scrollIntoView === 'function') {
          nextBtn.scrollIntoView({ block: 'nearest' });
        }
        console.log('[nuxeo-accessible-date-picker] Focus moved to year:', allYearButtons[nextIndex].dataset.year);
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
        const currentYear = this._viewDate ? this._viewDate.getFullYear() : (new Date()).getFullYear();
        const currentBtn = this.shadowRoot.querySelector(`#yearOptions .year-option[data-year="${currentYear}"]`);
        const buttons = Array.from(this.shadowRoot.querySelectorAll('#yearOptions .year-option'));
        buttons.forEach(btn => btn.tabIndex = (btn === currentBtn ? 0 : -1));
      }
    }

    _selectYear(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const button = e.target.closest('.year-option');
      const year = button ? parseInt(button.dataset.year) : null;
      console.log('[nuxeo-accessible-date-picker] _selectYear called, year:', year);
      if (year) {
        const newDate = new Date(this._viewDate);
        newDate.setFullYear(year);
        this._viewDate = newDate;
        // Clear focused date when changing year
        this._focusedDate = null;
        this._generateCalendar();
        this._announce(`Year changed to ${year}.`);
        // Close the dropdown
        this._closeYearDropdown();
        // After closing, focus the year dropdown button for accessibility
        this.async(() => {
          const yearDropdown = this.shadowRoot.querySelector('.year-dropdown');
          if (yearDropdown) {
            yearDropdown.focus();
            console.log('[nuxeo-accessible-date-picker] Focus returned to year dropdown after year select');
          }
        }, 100);
      }
    }

    _getYearOptionClass(year, viewDate) {
      if (!viewDate || !year) return '';
      return (year === viewDate.getFullYear()) ? 'selected' : '';
    }

    _getYearTabIndex(year, viewDate) {
      // Only the currently selected year should be tabbable
      return (viewDate && year === viewDate.getFullYear()) ? '0' : '-1';
    }

    _getDropdownIcon(isOpen) {
      return isOpen ? 'icons:arrow-drop-up' : 'icons:arrow-drop-down';
    }

    _handleCalendarIconKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._openCalendar();
      } else if (e.key === 'ArrowDown' || e.key === 'F4') {
        e.preventDefault();
        this._openCalendar();
      }
    }

    _handleYearDropdownKeydown(e) {
      const moveWithinOptions = (delta) => {
        const yearOptions = this.shadowRoot.querySelector('#yearOptions');
        if (!yearOptions || !yearOptions.classList.contains('open')) return;
        const buttons = Array.from(yearOptions.querySelectorAll('.year-option'));
        if (!buttons.length) return;
        let current = buttons.findIndex(b => b.tabIndex === 0);
        if (current < 0) current = 0;
        let next = current + delta;
        if (next < 0) next = 0;
        if (next > buttons.length - 1) next = buttons.length - 1;
        buttons.forEach((btn, idx) => btn.tabIndex = (idx === next ? 0 : -1));
        const btn = buttons[next];
        btn.focus();
        if (typeof btn.scrollIntoView === 'function') btn.scrollIntoView({ block: 'nearest' });
      };

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!this._isYearDropdownOpen) {
          this._toggleYearDropdown();
        } else {
          // Select currently focused option
          const focused = this.shadowRoot.activeElement && this.shadowRoot.activeElement.classList.contains('year-option')
            ? this.shadowRoot.activeElement
            : (this.shadowRoot.querySelector('#yearOptions .year-option[tabindex="0"]'));
          if (focused) {
            focused.click();
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this._isYearDropdownOpen) {
          moveWithinOptions(+1);
        } else {
          this._toggleYearDropdown();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this._isYearDropdownOpen) {
          moveWithinOptions(-1);
        } else {
          this._toggleYearDropdown();
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        moveWithinOptions(-9999);
      } else if (e.key === 'End') {
        e.preventDefault();
        moveWithinOptions(9999);
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        moveWithinOptions(-10);
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        moveWithinOptions(10);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this._closeYearDropdown();
      } else if (e.key === 'Tab') {
        const navButtons = Array.from(this.shadowRoot.querySelectorAll('.nav-button'));
        if (!e.shiftKey) {
          e.preventDefault();
          navButtons[0].focus();
        }
      }
    }

    _debugState() {
      console.log('Date Picker Debug State:', {
        value: this.value,
        _selectedDate: this._selectedDate,
        _inputValue: this._inputValue,
        _focusedDate: this._focusedDate,
        _isCalendarOpen: this._isCalendarOpen,
        _viewDate: this._viewDate,
        invalid: this.invalid,
        errorMessage: this.errorMessage
      });
    }

    _updateMaskedInputFromDate() {
      if (this._selectedDate) {
        const day = String(this._selectedDate.getDate()).padStart(2, '0');
        const month = String(this._selectedDate.getMonth() + 1).padStart(2, '0');
        const year = String(this._selectedDate.getFullYear());
        if (this._inputMask === 'dd/mm/yyyy') {
          this._maskedInputValue = `${day}/${month}/${year}`;
        } else if (this._inputMask === 'mm/dd/yyyy') {
          this._maskedInputValue = `${month}/${day}/${year}`;
        } else if (this._inputMask === 'yyyy-mm-dd') {
          this._maskedInputValue = `${year}-${month}-${day}`;
        } else {
          // fallback to locale formatter
          this._maskedInputValue = this._formatDateForInput(this._selectedDate);
        }
      } else {
        this._maskedInputValue = this._maskTemplate;
      }
    }

    _onMaskedInputFocus(e) {
      const input = e.target;
      if (!input.value || input.value === this._maskTemplate) {
        this._maskedInputValue = this._maskTemplate;
        this.async(() => input.setSelectionRange(0, 0), 1);
      } else {
        // Place cursor at first non-filled position
        const firstEmpty = input.value.indexOf('d') !== -1 ? input.value.indexOf('d') : input.value.indexOf('m') !== -1 ? input.value.indexOf('m') : input.value.indexOf('y');
        this.async(() => input.setSelectionRange(firstEmpty !== -1 ? firstEmpty : input.value.length, firstEmpty !== -1 ? firstEmpty : input.value.length), 1);
      }
    }

    _onMaskedInputBlur(e) {
      // On blur, validate and parse input
      this._validateAndParseMaskedInput();
    }

    _onMaskedInputKeydown(e) {
      const input = e.target;
      const pos = input.selectionStart;
      const key = e.key;
      // Allow navigation keys
      if (["Tab", "ArrowLeft", "ArrowRight", "Home", "End", "Shift", "Control", "Alt"].includes(key)) return;
      // Allow backspace/delete with custom logic
      if (key === "Backspace") {
        e.preventDefault();
        this._handleMaskedBackspace(input, pos);
        return;
      }
      if (key === "Delete") {
        e.preventDefault();
        this._handleMaskedDelete(input, pos);
        return;
      }
      // Only allow digits
      if (/\d/.test(key)) {
        e.preventDefault();
        // Only allow typing in editable positions (not /)
        if (pos >= 10) return;
        if (pos === 2 || pos === 5) {
          // If at /, move to next editable position
          input.setSelectionRange(pos + 1, pos + 1);
          return;
        }
        // Replace the mask character at the cursor with the digit
        let value = this._maskedInputValue.split('');
        value[pos] = key;
        this._maskedInputValue = value.join('');
        // Move cursor to next editable position
        let next = pos + 1;
        if (next === 2 || next === 5) next++;
        this.async(() => input.setSelectionRange(next, next), 1);
        return;
      }
      // Prevent typing any other character
      e.preventDefault();
    }

    _onMaskedInputInput(e) {
      // No-op: input is handled in keydown for full control
      // This prevents double updates and keeps the mask logic consistent
      e.preventDefault();
      return false;
    }

    _handleMaskedBackspace(input, pos) {
      if (pos === 0) return;
      let value = this._maskedInputValue;
      let arr = value.split('');
      let p = pos - 1;
      // Skip over /
      if (arr[p] === '/') p--;
      if (p < 0) return;
      arr[p] = this._maskTemplate[p];
      this._maskedInputValue = arr.join('');
      this.async(() => input.setSelectionRange(p, p), 1);
    }

    _handleMaskedDelete(input, pos) {
      if (pos >= this._maskTemplate.length) return;
      let value = this._maskedInputValue;
      let arr = value.split('');
      // Skip over /
      if (arr[pos] === '/') pos++;
      if (pos >= this._maskTemplate.length) return;
      arr[pos] = this._maskTemplate[pos];
      this._maskedInputValue = arr.join('');
      this.async(() => input.setSelectionRange(pos, pos), 1);
    }

    _validateAndParseMaskedInput() {
      const value = this._maskedInputValue;
      if (!value || value === this._maskTemplate) {
        this._selectedDate = null;
        this._safeSetValue('');
        this.invalid = false;
        this._generateCalendar();
        return;
      }
      
      console.log('[nuxeo-accessible-date-picker] Validating masked input:', value);
      
      // Parse strictly by current mask
      let parsed = null;
      try {
        parsed = this._parseWithFormat(value, this._inputMask === 'dd/mm/yyyy' ? 'DD/MM/YYYY'
          : this._inputMask === 'mm/dd/yyyy' ? 'MM/DD/YYYY'
          : this._inputMask === 'yyyy-mm-dd' ? 'YYYY-MM-DD' : '');
      } catch (_) {
        parsed = null;
      }
      if (parsed) {
        if (this._isValidDate(parsed)) {
          const yyyy = String(parsed.getFullYear());
          const mm = String(parsed.getMonth() + 1).padStart(2, '0');
          const dd = String(parsed.getDate()).padStart(2, '0');
          this._selectedDate = parsed;
          this._safeSetValue(`${yyyy}-${mm}-${dd}`);
          this.invalid = false;
          this.errorReason = '';
          this._generateCalendar();
          console.log('[nuxeo-accessible-date-picker] Masked input validated successfully');
          return;
        } else {
          this.invalid = true;
          this.errorReason = 'outOfRange';
          this.errorMessage = this._buildOutOfRangeMessage(parsed);
          return;
        }
      }

      // Fallback: generic format error that respects current placeholder and constraints
      this.invalid = true;
      let baseMessage = `Incorrect date format. Expected: ${this._getDatePlaceholder()}`;
      let constraintInfo = '';
      if (this.min && this.max) {
        constraintInfo = ` (must be between ${this._moment(this.min).format('L')} and ${this._moment(this.max).format('L')})`;
      } else if (this.min) {
        constraintInfo = ` (must be on or after ${this._moment(this.min).format('L')})`;
      } else if (this.max) {
        constraintInfo = ` (must be on or before ${this._moment(this.max).format('L')})`;
      }
      this.errorReason = 'format';
      this.errorMessage = baseMessage + constraintInfo;
      console.log('[nuxeo-accessible-date-picker] Masked input validation failed:', this.errorMessage);
    }

    _handleNavButtonKeydown(e) {
      // Allow Tab/Shift+Tab to move focus between controls
      if (e.key === 'Tab') {
        const navButtons = Array.from(this.shadowRoot.querySelectorAll('.nav-button'));
        const yearDropdown = this.shadowRoot.querySelector('.year-dropdown');
        if (e.shiftKey) {
          if (e.target === navButtons[0]) {
            e.preventDefault();
            yearDropdown.focus();
          }
        } else {
          if (e.target === navButtons[1]) {
            e.preventDefault();
            // Move to first focusable date in grid
            this._focusFirstAvailableDate();
          }
        }
      }
    }

    _handleGridTabKeydown(e) {
      if (e.key === 'Tab') {
        const footerToday = this.shadowRoot.querySelector('.today-button');
        const navButtons = Array.from(this.shadowRoot.querySelectorAll('.nav-button'));
        if (e.shiftKey) {
          // Move to nextMonth nav button
          e.preventDefault();
          navButtons[1].focus();
        } else {
          // Move to footer today button
          e.preventDefault();
          if (footerToday) footerToday.focus();
        }
      }
    }

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
      
      console.log(`[nuxeo-accessible-date-picker] Previous month disabled check: ${prevMonth.toDateString()} has valid dates = ${hasValidDatesInPrevMonth}, disabled = ${isDisabled}`);
      
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
      
      console.log(`[nuxeo-accessible-date-picker] Next month disabled check: ${nextMonth.toDateString()} has valid dates = ${hasValidDatesInNextMonth}, disabled = ${isDisabled}`);
      
      return isDisabled;
    }

    // Helper method to check if a given month contains any valid dates within min/max constraints
    _monthHasValidDates(monthDate) {
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
      let monthStart = new Date(firstDay);
      let monthEnd = new Date(lastDay);
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
      
      console.log(`[nuxeo-accessible-date-picker] Month ${year}-${String(month + 1).padStart(2, '0')} check:`, {
        monthStart: monthStart.toDateString(),
        monthEnd: monthEnd.toDateString(),
        minDate: minDate ? minDate.toDateString() : 'none',
        maxDate: maxDate ? maxDate.toDateString() : 'none',
        validStart: validStart.toDateString(),
        validEnd: validEnd.toDateString(),
        hasValidDates: hasValidDates
      });
      
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
        if (!this.i18n) {
          this.i18n = {};
        }
        this.i18n[i18nProperty] = value;
        console.log(`[nuxeo-accessible-date-picker] Set i18n property: ${i18nProperty}`, value);
        
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
      } else {
        // Use standard Polymer set method for other properties
        super.set && super.set(path, value);
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
      if (this._selectedDate && this.i18n && this.i18n.formatDate) {
        return this.i18n.formatDate(this._selectedDate);
      }
      return this.value;
    }

    // Add property observers for dynamic updates
    _minChanged(newMin) {
      console.log('[nuxeo-accessible-date-picker] Min constraint changed to:', newMin);
      if (this._generateCalendar) {
        this._generateCalendar();
      }
      if (this.value) {
        // Re-validate current value against new min constraint
        const currentDate = this._moment(this.value);
        if (newMin && currentDate.isBefore(this._moment(newMin), 'day')) {
          console.log('[nuxeo-accessible-date-picker] Current value violates new min constraint');
          this.invalid = true;
          this.errorMessage = `Date must be on or after ${this._moment(newMin).format('L')}`;
        }
      }
    }

    _maxChanged(newMax) {
      console.log('[nuxeo-accessible-date-picker] Max constraint changed to:', newMax);
      if (this._generateCalendar) {
        this._generateCalendar();
      }
      if (this.value) {
        // Re-validate current value against new max constraint
        const currentDate = this._moment(this.value);
        if (newMax && currentDate.isAfter(this._moment(newMax), 'day')) {
          console.log('[nuxeo-accessible-date-picker] Current value violates new max constraint');
          this.invalid = true;
          this.errorMessage = `Date must be on or before ${this._moment(newMax).format('L')}`;
        }
      }
    }

    _firstDayOfWeekChanged(newFirstDay) {
      console.log('[nuxeo-accessible-date-picker] First day of week changed to:', newFirstDay);
      this._initializeLocaleData();
      if (this._generateCalendar) {
        this._generateCalendar();
      }
    }

    _defaultTimeChanged(newDefaultTime) {
      console.log('[nuxeo-accessible-date-picker] Default time changed to:', newDefaultTime);
      // Re-process current value if it exists
      if (this._inputValue && !this._preventInputUpdate) {
        this._inputValueChanged();
      }
    }
  }

  customElements.define(AccessibleDatePicker.is, AccessibleDatePicker);
  Nuxeo.AccessibleDatePicker = AccessibleDatePicker;
}
