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

        _userIsTyping: {
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
              value="{{_inputValue::input}}"
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
              on-focus="_onInputFocus"
              on-blur="_onInputBlur"
              on-keydown="_onInputKeydown"
              on-input="_onInputChange"
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
                <button type="button" class="nav-button" id="prevMonth" aria-label="Previous month" tabindex="0" on-click="_previousMonth" on-keydown="_handleNavButtonKeydown" disabled$="[[_isPreviousMonthDisabled()]]">
                  <iron-icon icon="icons:chevron-left"></iron-icon>
                </button>
                
                <button type="button" class="nav-button" id="nextMonth" aria-label="Next month" tabindex="0" on-click="_nextMonth" on-keydown="_handleNavButtonKeydown" disabled$="[[_isNextMonthDisabled()]]">
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
      
      console.log('[nuxeo-accessible-date-picker] Initializing with properties:', {
        min: this.min,
        max: this.max,
        defaultTime: this.defaultTime,
        timezone: this.timezone,
        firstDayOfWeek: this.firstDayOfWeek,
        hideClearDateButton: this.hideClearDateButton
      });
      
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
      
      console.log('[nuxeo-accessible-date-picker] Locale initialized:', {
        userLocale: this._locale,
        momentLocale: moment.locale(),
        localeFormat: localeFormat,
        sampleFormat: moment().format('L')
      });
      
      // Force update the locale format for consistency
      this._currentLocaleFormat = localeFormat;
      
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
            return this._formatDateForDisplay(date);
          } catch (error) {
            console.warn('[nuxeo-accessible-date-picker] Error in i18n.formatDate:', error);
            return date ? date.toLocaleDateString() : '';
          }
        },
        parseDate: (text) => {
          try {
            const localeFormat = moment.localeData().longDateFormat('L');
            const date = this._moment(text, localeFormat, true); // strict parsing with locale format
            if (date.isValid()) {
            return {
              day: date.get('D'),
              month: date.get('M'),
              year: date.get('Y'),
            };
            } else {
              console.warn('[nuxeo-accessible-date-picker] Could not parse date with locale format:', text, 'format:', localeFormat);
              // Return current date instead of hardcoded values
              const fallbackDate = this._moment();
              return {
                day: fallbackDate.get('D'),
                month: fallbackDate.get('M'),
                year: fallbackDate.get('Y'),
              };
            }
          } catch (error) {
            console.warn('[nuxeo-accessible-date-picker] Error parsing date:', error);
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
          placeholder: this._getDatePlaceholder(),
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
        if (date.getFullYear() !== year || 
            date.getMonth() !== (month - 1) || 
            date.getDate() !== day) {
          console.warn('[nuxeo-accessible-date-picker] Invalid date detected:', isoString);
          return null;
        }
        
        return date;
      } catch (error) {
        console.error('[nuxeo-accessible-date-picker] Error parsing ISO date:', isoString, error);
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
      
      const year = this._viewDate.getFullYear();
      const month = this._viewDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const firstDayOfWeek = this.firstDayOfWeek || config.get('firstDayOfWeek', moment.localeData().firstDayOfWeek() || 0);
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
          isSelected = (currentDate.getFullYear() === this._selectedDate.getFullYear() &&
                       currentDate.getMonth() === this._selectedDate.getMonth() &&
                       currentDate.getDate() === this._selectedDate.getDate());
        }
        
        const isDisabled = this._isDateDisabled(currentDate);
        const isEmpty = !isCurrentMonth;
        
        // Create ISO string for data attribute using professional method
        const dateISO = this._dateToISO(currentDate);
        
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
            this._openCalendar();
          } else if (e.key === 'Enter') {
            // Enter validates input
              this._validateAndParseInput();
          }
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
      // Define the proper focus order for calendar accessibility
      this._focusOrder = [
        'year-dropdown',     // Year selection
        'prevMonth',         // Previous month button  
        'nextMonth',         // Next month button
        'calendar-grid',     // Date grid (managed separately)
        'today-button',      // Today button
        'cancel-button'      // Cancel button
      ];
    }

    _handlePopoverKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this._closeCalendar();
        return;
      }
      
      if (e.key === 'Tab') {
        e.preventDefault();
        this._handleCalendarTabNavigation(e.shiftKey);
        return;
      }
    }
    
    // Professional focus management for calendar
    _handleCalendarTabNavigation(isShiftTab) {
      if (!this._isCalendarOpen) return;
      
      const currentFocused = this.shadowRoot.activeElement;
      const currentElement = this._identifyCurrentFocusElement(currentFocused);
      
      console.log('[nuxeo-accessible-date-picker] Tab navigation from:', currentElement, 'shift:', isShiftTab);
      
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
      
      console.log('[nuxeo-accessible-date-picker] Moved focus to:', nextElement);
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
      // Find the appropriate date to focus
      let targetDate = null;
      
      if (this._focusedDate) {
        targetDate = this._focusedDate;
      } else if (this._selectedDate && 
                 this._selectedDate.getMonth() === this._viewDate.getMonth() &&
                 this._selectedDate.getFullYear() === this._viewDate.getFullYear()) {
        targetDate = this._selectedDate;
      } else if (this._today.getMonth() === this._viewDate.getMonth() &&
                 this._today.getFullYear() === this._viewDate.getFullYear()) {
        targetDate = this._today;
      } else {
        // First day of current month
        targetDate = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth(), 1);
      }
      
      if (targetDate) {
        this._focusDate(targetDate);
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
      
      // Check if click target is within this element's shadow DOM
      let target = e.target;
      let isInsideComponent = false;
      
      // Walk up the composed path to check for our component
      const path = e.composedPath ? e.composedPath() : [target];
      for (let element of path) {
        if (element === this || (element.host && element.host === this)) {
          isInsideComponent = true;
          break;
        }
      }
      
      if (!isInsideComponent) {
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
      this._focusedDate = null; // Clear focused date to remove any highlighting
      this._userIsTyping = false; // Clear typing state
      this._preventInputUpdate = true;
      this._inputValue = '';
      this._safeSetValue('');
      this._preventInputUpdate = false; // Reset flag
      this.invalid = false;
      this.errorMessage = '';
      
      // Regenerate calendar to remove any date highlighting
      this._generateCalendar();
    }

    _selectDate(date) {
      if (!date || !this._isValidDate(date)) {
        console.warn('[nuxeo-accessible-date-picker] Cannot select invalid date:', date);
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
      
      console.log('[nuxeo-accessible-date-picker] Date selected:', {
        selectedDate: this._selectedDate.toDateString(),
        isoValue: isoString,
        displayValue: this._inputValue,
        components: {
          year: this._selectedDate.getFullYear(),
          month: this._selectedDate.getMonth() + 1,
          day: this._selectedDate.getDate()
        }
      });
      
      // Update UI
      this._focusedDate = null;
      this._generateCalendar();
      this._closeCalendar();
      
      // Clear errors
      this.invalid = false;
      this.errorMessage = '';
      this.errorReason = '';
    }

    _selectToday(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Create a fresh today date to ensure consistency
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      console.log('[nuxeo-accessible-date-picker] Selecting today from button:', today.toDateString());
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
      
      // Focus the first element in the proper focus order
      this.async(() => {
        this._focusCalendarElement(this._focusOrder[0]);
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

    _previousMonth(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      console.log('[nuxeo-accessible-date-picker] _previousMonth called');
      
      if (!this._viewDate) {
        console.warn('[nuxeo-accessible-date-picker] No view date set, cannot navigate');
        return;
      }
      
      const newDate = new Date(this._viewDate);
      newDate.setMonth(newDate.getMonth() - 1);
      
      // Temporarily disable the constraint check to allow navigation
      // const prevMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      // const hasValidDates = this._monthHasValidDates(prevMonth);
      
      // if (!hasValidDates) {
      //   console.log('[nuxeo-accessible-date-picker] Previous month navigation blocked - no valid dates in target month:', prevMonth.toDateString());
      //   return; // Don't navigate if target month has no valid dates
      // }
      
      console.log('[nuxeo-accessible-date-picker] Navigating to previous month:', newDate.toDateString());
      this._viewDate = newDate;
      
      // Clear focused date when changing months to prevent incorrect highlighting
      this._focusedDate = null;
      
      // Regenerate month-year options if we moved far from the current range
      this._generateMonthYearOptions();
      this._generateCalendar();
      this._announce(`Moved to ${this._getMonthName(this._viewDate)} ${this._getYear(this._viewDate)}.`);
    }

    _nextMonth(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      console.log('[nuxeo-accessible-date-picker] _nextMonth called');
      
      if (!this._viewDate) {
        console.warn('[nuxeo-accessible-date-picker] No view date set, cannot navigate');
        return;
      }
      
      const newDate = new Date(this._viewDate);
      newDate.setMonth(newDate.getMonth() + 1);
      
      // Temporarily disable the constraint check to allow navigation
      // const nextMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      // const hasValidDates = this._monthHasValidDates(nextMonth);
      
      // if (!hasValidDates) {
      //   console.log('[nuxeo-accessible-date-picker] Next month navigation blocked - no valid dates in target month:', nextMonth.toDateString());
      //   return; // Don't navigate if target month has no valid dates
      // }
      
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
      if (!button || button.disabled || button.classList.contains('empty') || button.classList.contains('other-month')) {
        return;
      }
      
      // Get the date from the button's data attribute
      const dateISO = button.dataset.date;
      if (!dateISO) {
        console.error('[nuxeo-accessible-date-picker] No date data found on button');
        return;
      }
      
      // Use the professional ISO parser
      const selectedDate = this._parseDateFromISO(dateISO);
      if (!selectedDate) {
        console.error('[nuxeo-accessible-date-picker] Failed to parse date from ISO:', dateISO);
        return;
      }
      
      console.log('[nuxeo-accessible-date-picker] Date clicked:', {
        dateISO,
        selectedDate: selectedDate.toDateString(),
        components: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate()
        }
      });
      
      // Validate and select
      if (this._isValidDate(selectedDate)) {
        this.invalid = false;
        this.errorReason = '';
        this.errorMessage = '';
        this._selectDate(selectedDate);
      } else {
        console.warn('[nuxeo-accessible-date-picker] Selected date is not valid:', selectedDate);
        this.invalid = true;
        this.errorReason = 'notSelectable';
        this.errorMessage = 'This date is not selectable.';
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
            // Shift+PageUp: Previous year
            targetDate.setFullYear(currentDate.getFullYear() - 1);
            this._focusDate(targetDate, true);
          } else {
            // PageUp: Previous month
            console.log('[nuxeo-accessible-date-picker] PageUp pressed - navigating to previous month');
            this._previousMonth();
            // Focus the same relative date in the new month
            this.async(() => {
              this._focusFirstAvailableDate();
            }, 50);
          }
          break;
          
        case 'PageDown':
          e.preventDefault();
          if (e.shiftKey) {
            // Shift+PageDown: Next year
            targetDate.setFullYear(currentDate.getFullYear() + 1);
            this._focusDate(targetDate, true);
          } else {
            // PageDown: Next month
            console.log('[nuxeo-accessible-date-picker] PageDown pressed - navigating to next month');
            this._nextMonth();
            // Focus the same relative date in the new month
            this.async(() => {
              this._focusFirstAvailableDate();
            }, 50);
          }
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
        // Use moment.js for reliable parsing based on locale format
        const momentDate = this._moment(inputValue, format, true); // strict parsing
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
        this.invalid = false;
        this.errorReason = '';
        this.errorMessage = '';
        this._generateCalendar();
        return;
      }
      
      console.log('[nuxeo-accessible-date-picker] Professional validation of input:', value);
      
      // Use professional parser
      const parseResult = this._parseUserInput(value);
      
      if (!parseResult) {
        // Could not parse the date at all
        this.invalid = true;
        this.errorReason = 'format';
        this.errorMessage = `Incorrect date format. Expected: ${this._getDatePlaceholder()}`;
        console.warn('[nuxeo-accessible-date-picker] Could not parse date:', value);
        return;
      }
      
      const { date: parsedDate, isExactFormat } = parseResult;
      
      // Check date constraints (min/max)
      if (!this._isValidDate(parsedDate)) {
        this.invalid = true;
        this.errorReason = 'outOfRange';
        this.errorMessage = this._buildOutOfRangeMessage(parsedDate);
        console.warn('[nuxeo-accessible-date-picker] Date violates constraints:', parsedDate);
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
        console.log('[nuxeo-accessible-date-picker] Reformatted input to correct format:', this._inputValue);
      } else {
        console.log('[nuxeo-accessible-date-picker] Keeping user input as-is (exact format):', value);
      }
      
      // Reset the flag after updating input value
      this._preventInputUpdate = false;
      
      // Navigate calendar to the selected date
      this._viewDate = new Date(this._selectedDate);
      this._generateCalendar();
      
      // Clear errors
      this.invalid = false;
      this.errorReason = '';
      this.errorMessage = '';
      
      console.log('[nuxeo-accessible-date-picker] Successfully validated and parsed:', {
        input: value,
        selectedDate: this._selectedDate.toDateString(),
        isoValue: isoString,
        displayValue: this._inputValue,
        exactFormat: isExactFormat
      });
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
      try {
        // Get the actual locale from browser and moment
        const userLocale = navigator.languages !== undefined ? navigator.languages[0] : navigator.language;
        console.log('[nuxeo-accessible-date-picker] Detecting locale for placeholder:', userLocale);
        
        // Ensure moment uses the correct locale
        moment.locale(userLocale);
        const localeFormat = moment.localeData().longDateFormat('L');
        console.log('[nuxeo-accessible-date-picker] Moment locale format (L):', localeFormat);
        
        // Convert moment format to a readable placeholder
        const placeholder = localeFormat
          .replace(/D{1,2}/g, 'dd')
          .replace(/M{1,2}/g, 'mm')
          .replace(/Y{2,4}/g, 'yyyy')
          .toLowerCase();
          
        console.log('[nuxeo-accessible-date-picker] Generated placeholder:', placeholder);
        return placeholder;
      } catch (e) {
        console.warn('[nuxeo-accessible-date-picker] Error generating placeholder:', e);
        return 'mm/dd/yyyy';
      }
    }



    _buildOutOfRangeMessage(date) {
      try {
        const hasMin = !!this.min;
        const hasMax = !!this.max;
        
        if (hasMin && hasMax) {
          const minDate = this._parseDateOnly(this.min);
          const maxDate = this._parseDateOnly(this.max);
          const minFormatted = minDate ? this._formatDateForDisplay(minDate) : this.min;
          const maxFormatted = maxDate ? this._formatDateForDisplay(maxDate) : this.max;
          return `Date out of range. Must be between ${minFormatted} and ${maxFormatted}`;
        }
        
        if (hasMin) {
          const minDate = this._parseDateOnly(this.min);
          const minFormatted = minDate ? this._formatDateForDisplay(minDate) : this.min;
          return `Date out of range. Must be on or after ${minFormatted}`;
        }
        
        if (hasMax) {
          const maxDate = this._parseDateOnly(this.max);
          const maxFormatted = maxDate ? this._formatDateForDisplay(maxDate) : this.max;
          return `Date out of range. Must be on or before ${maxFormatted}`;
        }
      } catch (error) {
        console.warn('[nuxeo-accessible-date-picker] Error building range message:', error);
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
        
        // Prevent circular updates
        if (this._preventInputUpdate) {
          this._preventInputUpdate = false;
          return;
        }
        
        // Set flag to prevent _inputValueChanged from triggering when we update _inputValue
        this._preventInputUpdate = true;
        
        if (!this.value) {
          this._selectedDate = null;
          
          // Only clear input if it wasn't cleared by user typing
          if (!this._userIsTyping) {
            this._inputValue = '';
          }
          
          // Trigger validation for required fields when value is cleared
          if (this.required) {
            this.async(() => {
              this.validate();
            }, 10);
          }
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
            console.log('[nuxeo-accessible-date-picker] Updated input from date in _valueChanged:', this._inputValue);
          }
          
          // Clear any previous validation errors when a valid value is set
          if (this.invalid) {
            this.async(() => {
              this.validate();
            }, 10);
          }
        } else {
          this._selectedDate = null;
          if (!this._userIsTyping) {
            this._inputValue = '';
          }
        }
        
        if (this._generateCalendar && typeof this._generateCalendar === 'function') {
          this._generateCalendar();
        }
        
        // Reset the flag after all updates are done
        this._preventInputUpdate = false;
        
      } catch (error) {
        console.warn('[nuxeo-accessible-date-picker] Error in _valueChanged:', error);
        this._selectedDate = null;
        if (!this._userIsTyping) {
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
      // This observer is only for logging/debugging purposes now
      // All actual validation happens in _validateAndParseInput() when user finishes typing
      console.log('[nuxeo-accessible-date-picker] Input value changed to:', this._inputValue);
      
      // Don't process automatic changes or when user is typing
      if (this._preventInputUpdate || this._userIsTyping) {
        console.log('[nuxeo-accessible-date-picker] Skipping input value processing - prevent update or user typing');
        return;
      }
      
      // Only handle legacy compatibility cases where external code sets _inputValue directly
      // Modern usage should go through _validateAndParseInput() or _selectDate()
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
        this.errorReason = 'required';
        this.errorMessage = 'This field is required.';
        return false;
      }
      
      // If field is not required and empty, it's valid
      if (!this.required && (!this.value || this.value.trim() === '')) {
        console.log('[nuxeo-accessible-date-picker] Optional field is empty - valid');
        return true;
      }
      
      // If we have a value, check if it's a valid date
      if (this.value) {
        const currentDate = this._moment(this.value);
        
        // Check if the date itself is valid
        if (!currentDate.isValid()) {
          this.errorReason = 'invalidDate';
          this.errorMessage = 'Invalid date. Please enter a valid date.';
          return false;
        }
        
        // Get current locale format for error messages
        const userLocale = navigator.languages !== undefined ? navigator.languages[0] : navigator.language;
        moment.locale(userLocale);
        const localeFormat = moment.localeData().longDateFormat('L');
        
        // Check min constraint
        if (this.min) {
          const minDate = this._moment(this._parseDateOnly(this.min));
          if (currentDate.isBefore(minDate, 'day')) {
            console.log('[nuxeo-accessible-date-picker] Value fails min validation:', this.value, '<', this.min);
            this.errorReason = 'outOfRange';
            this.errorMessage = this._buildOutOfRangeMessage(currentDate.toDate());
            return false;
          }
        }
        
        // Check max constraint
        if (this.max) {
          const maxDate = this._moment(this._parseDateOnly(this.max));
          if (currentDate.isAfter(maxDate, 'day')) {
            console.log('[nuxeo-accessible-date-picker] Value fails max validation:', this.value, '>', this.max);
            this.errorReason = 'outOfRange';
            this.errorMessage = this._buildOutOfRangeMessage(currentDate.toDate());
            return false;
          }
        }
      }
      
      // If we reach here, the date is valid
      console.log('[nuxeo-accessible-date-picker] Validity check passed for value:', this.value);
      return true;
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
      if (year && this._viewDate) {
        // Create new date with proper month/day preservation
        const currentMonth = this._viewDate.getMonth();
        const currentDay = this._viewDate.getDate();
        
        // Handle edge case of Feb 29 in non-leap years
        let newDay = currentDay;
        if (currentMonth === 1 && currentDay === 29) { // February 29
          const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
          if (!isLeapYear) {
            newDay = 28; // Set to Feb 28 in non-leap years
          }
        }
        
        const newDate = new Date(year, currentMonth, newDay);
        newDate.setHours(0, 0, 0, 0);
        
        console.log('[nuxeo-accessible-date-picker] Year change:', {
          oldDate: this._viewDate.toDateString(),
          newDate: newDate.toDateString(),
          year: year,
          month: currentMonth,
          day: newDay
        });
        
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
      }
      // Tab navigation is handled by central focus management
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
    
    // Debug method to test focus flow
    _debugFocusFlow() {
      if (!this._isCalendarOpen) {
        console.log('Calendar is not open - cannot test focus flow');
        return;
      }
      
      console.log('=== TESTING FOCUS FLOW ===');
      console.log('Focus order:', this._focusOrder);
      
      // Test each element in focus order
      this._focusOrder.forEach((elementName, index) => {
        console.log(`${index + 1}. Testing focus on: ${elementName}`);
        
        const element = this._getFocusableElement(elementName);
        if (element) {
          console.log(`   ✓ Element found: ${element.tagName}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className.split(' ')[0] : ''}`);
          console.log(`   ✓ Focusable: ${!element.disabled && element.tabIndex !== -1}`);
        } else {
          console.log(`   ✗ Element not found or not focusable`);
        }
      });
      
      console.log('=== END FOCUS FLOW TEST ===');
    }
    
    // Helper to get focusable element by name
    _getFocusableElement(elementName) {
      switch (elementName) {
        case 'year-dropdown':
          return this.shadowRoot.querySelector('.year-dropdown');
        case 'prevMonth':
          const prev = this.shadowRoot.querySelector('#prevMonth');
          return prev && !prev.disabled ? prev : null;
        case 'nextMonth':
          const next = this.shadowRoot.querySelector('#nextMonth');
          return next && !next.disabled ? next : null;
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
        console.log('[nuxeo-accessible-date-picker] _updateInputFromDate: formatted', this._selectedDate, 'as', this._inputValue);
      } else {
        this._inputValue = '';
      }
    }

    // Professional date-to-ISO converter
    _dateToISO(date) {
      if (!date || isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
    
    // Professional date formatter for display
    _formatDateForDisplay(date) {
      if (!date || isNaN(date.getTime())) return '';
      
      try {
        // Get user's locale and ensure moment uses it
        const userLocale = navigator.languages && navigator.languages[0] || navigator.language || 'en-US';
        moment.locale(userLocale);
        
        // Use moment's locale-specific format
        const localeFormat = moment.localeData().longDateFormat('L');
        const formatted = this._moment(date).format(localeFormat);
        
        console.log('[nuxeo-accessible-date-picker] Professional date formatting:', {
          inputDate: date.toDateString(),
          locale: userLocale,
          format: localeFormat,
          output: formatted
        });
        
        return formatted;
      } catch (error) {
        console.error('[nuxeo-accessible-date-picker] Error in professional formatting:', error);
        // Safe fallback using Intl.DateTimeFormat
        return new Intl.DateTimeFormat(navigator.language).format(date);
      }
    }
    
    // Professional date parser for user input
    _parseUserInput(inputString) {
      if (!inputString || typeof inputString !== 'string') return null;
      
      const trimmedInput = inputString.trim();
      if (!trimmedInput) return null;
      
      try {
        // Get user's locale
        const userLocale = navigator.languages && navigator.languages[0] || navigator.language || 'en-US';
        moment.locale(userLocale);
        const localeFormat = moment.localeData().longDateFormat('L');
        
        // Try strict parsing first (exact format match)
        let momentDate = this._moment(trimmedInput, localeFormat, true);
        
        if (momentDate.isValid()) {
          const date = momentDate.toDate();
          date.setHours(0, 0, 0, 0);
          return { date, isExactFormat: true };
        }
        
        // Try lenient parsing (more flexible)
        momentDate = this._moment(trimmedInput, localeFormat, false);
        
        if (momentDate.isValid()) {
          const date = momentDate.toDate();
          date.setHours(0, 0, 0, 0);
          
          // Verify it's a logical date
          if (date.getFullYear() < 1900 || date.getFullYear() > 2200) {
            return null;
          }
          
          return { date, isExactFormat: false };
        }
        
        return null;
      } catch (error) {
        console.error('[nuxeo-accessible-date-picker] Error parsing user input:', error);
        return null;
      }
    }
    
    // Helper method to ensure consistent date formatting across all operations (legacy compatibility)
    _ensureConsistentDateFormat(date) {
      return this._formatDateForDisplay(date);
    }

    _onInputFocus(e) {
      // Simple focus handler - don't modify input value
      const input = e.target;
      console.log('[nuxeo-accessible-date-picker] Input focused, current value:', input.value);
    }

    _onInputBlur(e) {
      // User finished typing, validate and parse input
      this._userIsTyping = false;
      console.log('[nuxeo-accessible-date-picker] Input blur, validating value:', e.target.value);
      this._validateAndParseInput();
    }

    _onInputKeydown(e) {
      // Set typing flag when user starts typing
      if (!this._userIsTyping && e.key.length === 1) {
        this._userIsTyping = true;
        console.log('[nuxeo-accessible-date-picker] User started typing');
      }
      
      // Allow opening calendar with specific keys when input is focused
      if (e.key === 'F4' || e.key === 'ArrowDown') {
        e.preventDefault();
        this._openCalendar();
      } else if (e.key === 'Enter') {
        // Enter validates input
        e.preventDefault();
        this._userIsTyping = false;
        this._validateAndParseInput();
      }
      // Allow all other keys (digits, letters, backspace, etc.) for free-form input
    }

    _onInputChange(e) {
      // Mark that user is actively typing when input content changes
      if (!this._userIsTyping) {
        this._userIsTyping = true;
        console.log('[nuxeo-accessible-date-picker] User is typing, input changed');
      }
    }



    _handleNavButtonKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        
        // Call the appropriate navigation method directly
        if (e.target.id === 'prevMonth') {
          this._previousMonth(e);
        } else if (e.target.id === 'nextMonth') {
          this._nextMonth(e);
        }
      }
      // Tab navigation is now handled by _handlePopoverKeydown
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
      // If no constraints, all months are valid
      if (!this.min && !this.max) {
        console.log('[nuxeo-accessible-date-picker] No constraints - month is valid');
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