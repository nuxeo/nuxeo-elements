import{I as b,a as x}from"./iron-validatable-behavior-DVOrdGp7.js";import{m as M,c as D,h as Y}from"./iframe-T5hUCbnt.js";import"./paper-input-CgOMKcUj.js";import"./paper-icon-button-BQJYUoC5.js";import"./iron-icons-B0EFH-ea.js";import"./nuxeo-icons-DihWRFWD.js";import{m as d}from"./moment-with-locales-v-Wg38Ha.js";import{I as k}from"./nuxeo-i18n-behavior-DzdsuNZu.js";/**
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
*/const w=200;{class y extends M([k,b,x],Nuxeo.Element){static get is(){return"custom-date-picker"}static get properties(){return{label:String,ariaLabelledby:{type:String},ariaLabel:{type:String},name:{type:String},autocomplete:{type:String,value:"off"},defaultTime:{type:String,observer:"_defaultTimeChanged"},errorMessage:{type:String,observer:"_errorMessageChanged"},max:{type:String,observer:"_maxChanged"},min:{type:String,observer:"_minChanged"},required:{type:Boolean,value:!1,reflectToAttribute:!0},value:{type:String,notify:!0,observer:"_valueChanged"},disabled:{type:Boolean,value:!1},firstDayOfWeek:{type:Number,observer:"_firstDayOfWeekChanged"},timezone:{type:String,value(){return D.get("timezone")}},hideClearDateButton:{type:Boolean,value:!1,reflectToAttribute:!0},hidePlaceholder:{type:Boolean,value:!1},clearButtonVisible:{type:Boolean,value:!1,reflectToAttribute:!0,observer:"_clearButtonVisibleChanged"},invalid:{type:Boolean,value:!1,reflectToAttribute:!0,observer:"_invalidChanged"},errorReason:{type:String,value:""},_inputValue:{type:String,observer:"_inputValueChanged"},_preventInputUpdate:{type:Boolean,value:!1},_userIsTyping:{type:Boolean,value:!1},_isCalendarOpen:{type:Boolean,value:!1},_justOpenedCalendar:{type:Boolean,value:!1},_interactingWithCalendar:{type:Boolean,value:!1},_showErrors:{type:Boolean,value:!1},_justCleared:{type:Boolean,value:!1},_errorPersists:{type:Boolean,value:!1},_isYearDropdownOpen:{type:Boolean,value:!1},_selectedDate:{type:Object,value:null},_viewDate:{type:Object,value:null},_today:{type:Object,value:null},_calendarDays:{type:Array,value:()=>[]},_monthNames:{type:Array,value:()=>[]},_weekdayNames:{type:Array,value:()=>[]},_yearOptions:{type:Array,value:()=>[]},_monthYearOptions:{type:Array,value:()=>[]},_locale:{type:String,value:""},_isRTL:{type:Boolean,value:!1,reflectToAttribute:!0},_dateFormatter:{type:Object,value:null},format:{type:String,value:""},_focusedDate:{type:Object,value:null},pickerI18n:{type:Object,value(){return{}}},_previousMonthAriaLabel:{type:String,computed:'_getLocalizedText("previousMonth")'},_nextMonthAriaLabel:{type:String,computed:'_getLocalizedText("nextMonth")'}}}static get template(){return Y`
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
            /* an input's automatic minimum size is its intrinsic width, which the
               wrapper would otherwise clip away with overflow: hidden */
            min-width: 0;
            border: none;
            outline: none;
            padding: 6px 48px 6px 8px;
            font-size: 13px;
            font-weight: 400;
            font-family: 'Inter', Arial, sans-serif;
            background: transparent;
            color: #666;
            /*
             * WCAG 2.1 SC 1.4.12: the UA stylesheet resets text spacing on form controls, and this
             * input lives in a shadow root a user text-spacing stylesheet cannot reach, so opt back in.
             */
            letter-spacing: inherit;
            word-spacing: inherit;
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
            /* Sized to its content rather than a fixed width so week names, dates and the
               month/year header stay inside the calendar when the user overrides text
               spacing (WCAG 2.1 SC 1.4.12). 280px remains the design floor, but a minimum
               larger than the maximum would win over it, so the floor itself yields to the
               viewport below 296px (reached at 400% zoom, SC 1.4.10). */
            width: max-content;
            min-width: min(280px, calc(100vw - 16px));
            max-width: calc(100vw - 16px);
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
            /* wrap instead of pushing the month/year out of the calendar when its text
               grows (WCAG 2.1 SC 1.4.12) */
            flex-wrap: wrap;
            gap: 8px;
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            background-color: #ffffff;
          }

          .month-year-display {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            min-width: 0;
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
            flex-shrink: 0;
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

          /* The week-name row and the date grid must declare identical tracks so the two
             always line up, and the tracks must be able to grow past 36px when text
             spacing is overridden (WCAG 2.1 SC 1.4.12). */
          .weekday-headers {
            display: grid;
            grid-template-columns: repeat(7, minmax(36px, 1fr));
            gap: 1px;
            padding: 8px 16px 0;
            background: #f9fafb;
          }

          .weekday-header {
            padding: 8px 2px;
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.025em;
          }

          .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, minmax(36px, 1fr));
            gap: 1px;
            padding: 8px 16px 8px;
            role: grid;
            background: #ffffff;
          }

          .calendar-day {
            display: flex;
            align-items: center;
            justify-content: center;
            /* minimums rather than fixed dimensions, so a date never gets clipped when
               letter/word/line spacing is increased (WCAG 2.1 SC 1.4.12) */
            min-width: 36px;
            min-height: 36px;
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
            flex-wrap: wrap;
            gap: 8px;
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
              placeholder$="[[_computePlaceholder(format, hidePlaceholder)]]"
              name$="[[name]]"
              disabled$="[[disabled]]"
              required$="[[required]]"
              aria-invalid$="[[invalid]]"
              aria-describedby$="[[_getAriaDescribedBy(invalid, errorMessage)]]"
              aria-labelledby$="[[ariaLabelledby]]"
              aria-label$="[[ariaLabel]]"
              aria-expanded$="[[_isCalendarOpen]]"
              aria-haspopup="grid"
              autocomplete$="[[autocomplete]]"
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
      `}constructor(){super();const e=navigator.languages!==void 0?navigator.languages[0]:navigator.language;this._locale=e||"en-US",this._dateFormatter=new Intl.DateTimeFormat(this._locale),this._today=new Date,this._today.setHours(0,0,0,0),this._viewDate=new Date,this._focusedDate=null}ready(){super.ready();const e=navigator.languages!==void 0?navigator.languages[0]:navigator.language;d.locale(e),this._locale=e||"en-US",this._dateFormatter=new Intl.DateTimeFormat(this._locale),this._today=new Date,this._today.setHours(0,0,0,0),this._viewDate=new Date,this._focusedDate=null;const a=d.localeData().longDateFormat("L");this._currentLocaleFormat=a,this._detectRTL(e),this._setupI18n(e),this.pickerI18n={formatDate:o=>{try{return this._formatDateForDisplay(o)}catch{return o?o.toLocaleDateString():""}},parseDate:o=>{try{const r=this.format?this.format:d.localeData().longDateFormat("L"),n=this._moment(o,r,!0);if(n.isValid())return{day:n.get("D"),month:n.get("M"),year:n.get("Y")};const s=this._moment();return{day:s.get("D"),month:s.get("M"),year:s.get("Y")}}catch{const n=this._moment();return{day:n.get("D"),month:n.get("M"),year:n.get("Y")}}},monthNames:d.months(),weekdays:d.weekdays(),weekdaysShort:d.weekdaysShort(),cancel:this.i18n("customDatePicker.cancel"),clear:this.i18n("customDatePicker.clear"),today:this.i18n("customDatePicker.today"),firstDayOfWeek:this.firstDayOfWeek||D.get("firstDayOfWeek",d.localeData().firstDayOfWeek()||0)},this._initializeLocaleData(),this._generateYearOptions(),this._generateCalendar(),this._setupEventListeners(),this._setupFocusTrap()}_detectRTL(e){if(!e)return;const t=["ar","he","fa","ur","ps","sd","ku","dv","ckb","az","ms-arab","uz-arab","pa-arab","ks-arab","bal","glk","lrc","mzn"],a=e.toLowerCase().split("-")[0],o=e.toLowerCase().includes("-arab")||e.toLowerCase().includes("arabic");if(this._isRTL=t.includes(a)||o,!this._isRTL){const r=document.documentElement.dir||document.body.dir;this._isRTL=r==="rtl"}this._isRTL?this.setAttribute("dir","rtl"):this.setAttribute("dir","ltr"),this._isCalendarOpen&&this._positionCalendar()}_setupI18n(e){this._locale=e||"en-US",this._detectRTL(e)}_getLocalizedText(e,t={}){let a=this.i18n(`customDatePicker.${e}`);return Object.keys(t).forEach(o=>{const r=t[o];a=a.replace(new RegExp(`\\{${o}\\}`,"g"),r)}),a}_hasTranslation(e,t){return!!t&&t!==`customDatePicker.${e}`&&t!==e}_buildIncorrectFormatError(){const e=this._getDatePlaceholder(this.format),t=this.i18n("customDatePicker.incorrectFormatExpected");if(this._hasTranslation("incorrectFormatExpected",t))return t.replace(/\{format\}/g,e);const a=this.i18n("customDatePicker.incorrectFormat");return`${this._hasTranslation("incorrectFormat",a)?a:"Incorrect date format."} ${e}`}_announce(e){try{const t=this.shadowRoot&&this.shadowRoot.querySelector("#srStatus");if(!t)return;t.textContent="",this.async(()=>{t.textContent=e},1)}catch{}}_formatAriaDate(e){try{return new Intl.DateTimeFormat(this._locale||navigator&&navigator.language||"en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(e)}catch{return e&&e.toDateString?e.toDateString():""}}_moment(...e){return(this.timezone==="Etc/UTC"?d.utc:d)(...e)}_parseDateOnly(e){if(!e)return null;try{if(typeof e=="string"){const a=e.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(a){const o=parseInt(a[1],10),r=parseInt(a[2],10)-1,n=parseInt(a[3],10),s=new Date(o,r,n);return s.setHours(0,0,0,0),Number.isNaN(s.getTime())?null:s}}const t=new Date(e);return Number.isNaN(t.getTime())?null:(t.setHours(0,0,0,0),t)}catch{return null}}_parseDateFromISO(e){if(!e||typeof e!="string")return null;try{const t=e.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!t)return null;const a=parseInt(t[1],10),o=parseInt(t[2],10),r=parseInt(t[3],10);if(a<1e3||a>9999||o<1||o>12||r<1||r>31)return null;const n=new Date(a,o-1,r);return n.setHours(0,0,0,0),n.getFullYear()!==a||n.getMonth()!==o-1||n.getDate()!==r?null:n}catch{return null}}_initializeLocaleData(){this._monthNames=[];for(let a=0;a<12;a++){const o=new Date(2024,a,1);this._monthNames.push(new Intl.DateTimeFormat(this._locale,{month:"long"}).format(o))}this._weekdayNames=[];const e=this.firstDayOfWeek||D.get("firstDayOfWeek",d.localeData().firstDayOfWeek()||0),t=new Date(2024,0,7);for(let a=0;a<7;a++){const o=new Date(t);o.setDate(t.getDate()+(e+a)%7),this._weekdayNames.push(new Intl.DateTimeFormat(this._locale,{weekday:"short"}).format(o))}}_generateYearOptions(){let a=1900,o=2099;if(this.min){const r=new Date(this.min);Number.isNaN(r.getTime())||(a=Math.max(1900,r.getFullYear()))}if(this.max){const r=new Date(this.max);Number.isNaN(r.getTime())||(o=Math.min(2099,r.getFullYear()))}this._yearOptions=[];for(let r=a;r<=o;r++)this._yearOptions.push(r)}_generateMonthYearOptions(){let e=1900,t=2099;if(this.min){const a=new Date(this.min);Number.isNaN(a.getTime())||(e=Math.max(e,a.getFullYear()))}if(this.max){const a=new Date(this.max);Number.isNaN(a.getTime())||(t=Math.min(t,a.getFullYear()))}this._monthYearOptions=[];for(let a=e;a<=t;a++)for(let o=0;o<12;o++){const r=new Date(a,o,1);let n=!0;if(this.min){const s=new Date(this.min);new Date(a,o+1,0)<s&&(n=!1)}if(this.max&&n){const s=new Date(this.max);r>s&&(n=!1)}if(n){const s=new Intl.DateTimeFormat(this._locale,{month:"long",year:"numeric"}).format(r);this._monthYearOptions.push({label:s,value:`${a}-${o}`,year:a,month:o})}}}_generateCalendar(){if(!this._viewDate)return;const e=this._viewDate.getFullYear(),t=this._viewDate.getMonth(),a=new Date(e,t,1),o=this.firstDayOfWeek||D.get("firstDayOfWeek",d.localeData().firstDayOfWeek()||0),r=new Date(a),n=(a.getDay()-o+7)%7;r.setDate(1-n);const s=[];for(let i=0;i<42;i++){const l=new Date(r);l.setDate(r.getDate()+i),l.setHours(0,0,0,0);const h=l.getMonth()===t&&l.getFullYear()===e,c=this._isSameDay(l,this._today)&&h;let p=!1;this._selectedDate&&h&&(p=l.getFullYear()===this._selectedDate.getFullYear()&&l.getMonth()===this._selectedDate.getMonth()&&l.getDate()===this._selectedDate.getDate());const f=this._isDateDisabled(l),u=!h,g=this._dateToISO(l);s.push({date:new Date(l),day:u?"":l.getDate(),dateISO:g,isCurrentMonth:h,isToday:c,isSelected:p,isDisabled:f,isOtherMonth:!h,isEmpty:u})}this.set("_calendarDays",s),this.async(()=>{this._updateNavigationButtonStates()},10)}_updateNavigationButtonStates(){const e=this.shadowRoot.querySelector("#prevMonth"),t=this.shadowRoot.querySelector("#nextMonth"),a=this.shadowRoot.activeElement,o=e?this._isPreviousMonthDisabled():!1,r=t?this._isNextMonthDisabled():!1;e&&(e.disabled=o),t&&(t.disabled=r),this._relocateFocusIfNavButtonDisabled({activeElement:a,prevButton:e,nextButton:t,isPrevDisabled:o,isNextDisabled:r})}_relocateFocusIfNavButtonDisabled({activeElement:e,prevButton:t,nextButton:a,isPrevDisabled:o,isNextDisabled:r}){if(!this._isCalendarOpen||!(e===t&&o||e===a&&r))return;const s=this._selectFocusFallback({activeElement:e,prevButton:t,nextButton:a,isPrevDisabled:o,isNextDisabled:r});s&&typeof s.focus=="function"&&s.focus()}_selectFocusFallback({activeElement:e,prevButton:t,nextButton:a,isPrevDisabled:o,isNextDisabled:r}){return e===t&&a&&!r?a:e===a&&t&&!o?t:this.shadowRoot.querySelector(".year-dropdown")||this.shadowRoot.querySelector('.calendar-day[tabindex="0"]')||this.shadowRoot.querySelector(".month-year-dropdown")||this.shadowRoot.querySelector("#calendarPopover")}_setupEventListeners(){this._boundEscapeCapture=o=>{this._isCalendarOpen&&o.key==="Escape"&&(o.stopPropagation(),o.preventDefault(),this._closeCalendar())};const e=this.shadowRoot.querySelector("#dateInput");e&&(e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation()}),e.addEventListener("keydown",o=>{o.key==="F4"||o.key==="ArrowDown"?(o.preventDefault(),o.stopPropagation(),this._openCalendar(o,!0)):o.key==="Enter"&&(this._errorPersists||this._validateAndParseInput())}));const t=this.shadowRoot.querySelector(".calendar-grid");t&&t.addEventListener("keydown",o=>this._handleGridKeydown(o)),this.shadowRoot.addEventListener("click",o=>{try{const r=this.shadowRoot.querySelector("#yearOptions"),n=this.shadowRoot.querySelector(".year-dropdown");if(!r||!r.classList.contains("open"))return;(!n||!o.composedPath().includes(n))&&this._closeYearDropdown()}catch{}},!0);const a=this.shadowRoot.querySelector("#calendarPopover");a&&(a.addEventListener("keydown",o=>this._handlePopoverKeydown(o)),a.addEventListener("click",o=>{this._interactingWithCalendar=!0,this.async(()=>{this._interactingWithCalendar=!1},50);const{target:r}=o;r.closest("button")||r.closest("select")||r.closest('[role="button"]')||r.closest('[role="option"]')||r.closest(".year-option")||r.closest(".year-dropdown")||r.closest(".nav-button")||r.closest(".calendar-day")||r.closest(".footer-button")||r.closest(".today-button")||r.closest(".cancel-button")||o.stopPropagation()},!0)),document.addEventListener("click",o=>this._handleDocumentClick(o)),document.addEventListener("keydown",o=>{o.key==="Escape"&&this._isCalendarOpen&&this._closeCalendar()}),document.addEventListener("focusin",o=>this._handleDocumentFocusIn(o)),document.addEventListener("focusout",o=>this._handleDocumentFocusOut(o))}_setupFocusTrap(){this._focusOrder=["year-dropdown","prevMonth","nextMonth","calendar-grid","today-button","cancel-button"]}_handlePopoverKeydown(e){if(e.key==="Escape"){e.preventDefault(),e.stopPropagation(),this._closeCalendar();return}if(e.key==="Tab"){e.preventDefault(),e.stopPropagation(),this._handleCalendarTabNavigation(e.shiftKey);return}this._isCalendarOpen&&new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Home","End","PageUp","PageDown","Enter"," "]).has(e.key)&&e.stopPropagation()}_handleCalendarTabNavigation(e){if(!this._isCalendarOpen)return;const t=this.shadowRoot.activeElement,a=this._identifyCurrentFocusElement(t);let o;const r=this._focusOrder.indexOf(a);e?o=r<=0?this._focusOrder.length-1:r-1:o=r>=this._focusOrder.length-1?0:r+1;const n=this._focusOrder[o];this._focusCalendarElement(n)}_identifyCurrentFocusElement(e){return e?e.classList.contains("year-dropdown")||e.closest(".year-dropdown")?"year-dropdown":e.id==="prevMonth"?"prevMonth":e.id==="nextMonth"?"nextMonth":e.classList.contains("calendar-day")||e.closest(".calendar-grid")?"calendar-grid":e.classList.contains("today-button")?"today-button":e.classList.contains("cancel-button")?"cancel-button":this._focusOrder[0]:this._focusOrder[0]}_focusCalendarElement(e){let t=null;switch(e){case"year-dropdown":t=this.shadowRoot.querySelector(".year-dropdown");break;case"prevMonth":if(t=this.shadowRoot.querySelector("#prevMonth"),t&&t.disabled){this._focusCalendarElement(this._focusOrder[this._focusOrder.indexOf("prevMonth")+1]);return}break;case"nextMonth":if(t=this.shadowRoot.querySelector("#nextMonth"),t&&t.disabled){this._focusCalendarElement(this._focusOrder[this._focusOrder.indexOf("nextMonth")+1]);return}break;case"calendar-grid":this._focusCalendarGrid();return;case"today-button":t=this.shadowRoot.querySelector(".today-button");break;case"cancel-button":t=this.shadowRoot.querySelector(".cancel-button");break;default:this._focusCalendarGrid();break}if(t&&!t.disabled)t.focus();else{const o=(this._focusOrder.indexOf(e)+1)%this._focusOrder.length;this._focusCalendarElement(this._focusOrder[o])}}_focusCalendarGrid(){(!this._calendarDays||this._calendarDays.length===0)&&this._generateCalendar();let e=null;this._focusedDate?e=this._focusedDate:this._selectedDate&&this._selectedDate.getMonth()===this._viewDate.getMonth()&&this._selectedDate.getFullYear()===this._viewDate.getFullYear()?e=this._selectedDate:this._today.getMonth()===this._viewDate.getMonth()&&this._today.getFullYear()===this._viewDate.getFullYear()?e=this._today:e=new Date(this._viewDate.getFullYear(),this._viewDate.getMonth(),1),e&&this._focusDate(e)}_toggleMonthYearDropdown(e){e&&(e.preventDefault(),e.stopPropagation());const t=this.shadowRoot.querySelector("#monthYearOptions");if(t){const a=t.classList.contains("open");this._isYearDropdownOpen=!a,t.classList.toggle("open"),a||this.async(()=>{this._focusCurrentMonthYear(),this._scrollToCurrentMonthYear()},100)}}_scrollToCurrentMonthYear(){const e=this._viewDate.getFullYear(),t=this._viewDate.getMonth(),a=`${e}-${t}`,o=this.shadowRoot.querySelector(`[data-month-year="${a}"]`),r=this.shadowRoot.querySelector("#monthYearOptions");if(o&&r){const n=r.clientHeight,s=o.offsetHeight,l=o.offsetTop-n/2+s/2;r.scrollTop=Math.max(0,l)}}_setupMonthYearKeyNavigation(){const e=this.shadowRoot.querySelector("#monthYearOptions");e&&e.addEventListener("keydown",t=>this._handleMonthYearKeyDown(t))}_focusCurrentMonthYear(){const e=this._viewDate.getFullYear(),t=this._viewDate.getMonth(),a=`${e}-${t}`,o=this.shadowRoot.querySelector(`[data-month-year="${a}"]`);o&&(o.tabIndex=0,o.focus(),this._setupMonthYearKeyNavigation())}_handleMonthYearKeyDown(e){const t=this.shadowRoot.activeElement;if(!t||!t.classList.contains("month-year-option"))return;const a=Array.from(this.shadowRoot.querySelectorAll(".month-year-option")),o=a.indexOf(t);let r=o;switch(e.key){case"ArrowUp":e.preventDefault(),r=Math.max(0,o-1);break;case"ArrowDown":e.preventDefault(),r=Math.min(a.length-1,o+1);break;case"Home":e.preventDefault(),r=0;break;case"End":e.preventDefault(),r=a.length-1;break;case"Enter":case" ":e.preventDefault(),t.click();return;case"Escape":e.preventDefault(),this._closeMonthYearDropdown();return}r!==o&&(t.tabIndex=-1,a[r].tabIndex=0,a[r].focus())}_closeMonthYearDropdown(){const e=this.shadowRoot.querySelector("#monthYearOptions");if(e){e.classList.remove("open"),this._isYearDropdownOpen=!1;const t=this.shadowRoot.querySelector(".month-year-dropdown");t&&t.focus()}}_selectMonthYear(e){e&&(e.preventDefault(),e.stopPropagation());const t=e.target.closest(".month-year-option"),a=t?t.dataset.monthYear:null;if(a){const[o,r]=a.split("-").map(Number),n=new Date(o,r,1);this._viewDate=n,this._focusedDate=null,this._generateCalendar(),this._closeMonthYearDropdown()}}_getMonthYearOptionClass(e,t){return!t||!e?"":e.year===t.getFullYear()&&e.month===t.getMonth()?"selected":""}_getDropdownIcon(e){return e?"icons:arrow-drop-up":"icons:arrow-drop-down"}_getMonthName(e){if(!e)return"";const t=(this._locale||navigator.language).replace("_","-");try{return new Intl.DateTimeFormat(t,{month:"long"}).format(e)}catch{const o=t.split("-")[0],r=e.getMonth();if(o==="en"){const n=["customDatePicker.january","customDatePicker.february","customDatePicker.march","customDatePicker.april","customDatePicker.may","customDatePicker.june","customDatePicker.july","customDatePicker.august","customDatePicker.september","customDatePicker.october","customDatePicker.november","customDatePicker.december"];return r>=0&&r<12?this.i18n(n[r]):""}return""}}_getYear(e){return e?e.getFullYear():""}_handleDocumentClick(e){if(!this._isCalendarOpen)return;const{target:t}=e;let a=!1;const o=this.shadowRoot.querySelector("#calendarPopover"),r=this.shadowRoot.querySelector(".input-wrapper"),n=this.shadowRoot.querySelector(".field-wrapper");if(o&&(t===o||o.contains(t))&&(a=!0),!a&&r&&(t===r||r.contains(t))&&(a=!0),!a&&n&&(t===n||n.contains(t))&&(a=!0),a||(e.composedPath?e.composedPath():[t]).forEach(i=>{(i===this||i.host&&i.host===this)&&(a=!0),(i===o||i===r||i===n)&&(a=!0)}),!a&&this.shadowRoot&&this.shadowRoot.contains(t)&&(a=!0),!a&&!this._interactingWithCalendar){this._closeCalendar();const s=this.shadowRoot.querySelector("#yearOptions");s&&(s.classList.remove("open"),this._isYearDropdownOpen=!1)}}_handleDocumentFocusIn(e){if(this._suppressInputFocusCloseUntil&&Date.now()<this._suppressInputFocusCloseUntil)return;if(this._isYearDropdownOpen){const a=e.target,o=this.shadowRoot.querySelector(".year-dropdown"),r=this.shadowRoot.querySelector("#yearOptions");o&&(o.contains(a)||r&&r.contains(a))||this.async(()=>{const s=document.activeElement;!(o&&o.contains(s))&&!(r&&r.contains(s))&&this._closeYearDropdown()},10)}if(!this._isCalendarOpen||this._justOpenedCalendar)return;const t=e.target;t&&t!==document.body&&t!==document.documentElement&&!this._isElementInsideComponent(t)&&this.async(()=>{if(this._justOpenedCalendar)return;const a=document.activeElement;if(this._isCalendarOpen&&a&&a!==document.body&&a!==document.documentElement&&!this._isElementInsideComponent(a)){this._closeCalendar();const o=this.shadowRoot.querySelector("#yearOptions");o&&o.classList.contains("open")&&(o.classList.remove("open"),this._isYearDropdownOpen=!1)}},50)}_handleDocumentFocusOut(){}_isElementInsideComponent(e){if(!e)return!1;if(e===this)return!0;let t=e;for(;t;){if(t.host===this)return!0;t=t.parentElement||t.host}return!!(this.shadowRoot&&this.shadowRoot.contains(e))}_clearDate(e){e&&(e.preventDefault(),e.stopPropagation()),this._selectedDate=null,this._focusedDate=null,this._userIsTyping=!1,this._justCleared=!0,this.invalid=!1,this.errorReason="",this.errorMessage="",this._preventInputUpdate=!0,this._inputValue="",this._safeSetValue(""),this._preventInputUpdate=!1,this.notifyPath("_justCleared"),this.notifyPath("invalid"),this.notifyPath("errorMessage"),this.notifyPath("errorReason"),this._generateCalendar(),this.async(()=>{const t=this.shadowRoot.querySelector("#dateInput");t&&t.focus()},10)}_onInputFocus(){if(this._isCalendarOpen&&!this._openedViaCalendarIcon){if(this._suppressInputFocusCloseUntil&&Date.now()<this._suppressInputFocusCloseUntil)return;this.async(()=>{if(this._suppressInputFocusCloseUntil&&Date.now()<this._suppressInputFocusCloseUntil)return;const e=this.shadowRoot.querySelector("#dateInput");e&&this.shadowRoot.activeElement!==e||this._closeCalendar()},1)}}_onInputClick(e){this._isCalendarOpen&&!this._openedViaCalendarIcon&&(e.stopPropagation(),this._closeCalendar())}_onInputBlur(){this._errorPersists||(this._userIsTyping=!1,this._validateAndParseInput())}_onCalendarIconFocus(e){this._openedViaCalendarIcon&&(e.preventDefault(),e.stopPropagation(),this.async(()=>{e.target&&e.target.blur()},1))}_onInputKeydown(e){!this._userIsTyping&&e.key.length===1&&(this._userIsTyping=!0),e.key==="ArrowDown"||e.key==="F4"?(e.preventDefault(),this._openCalendar(e,!0)):e.key==="Enter"&&(e.preventDefault(),this._errorPersists||(this._userIsTyping=!1,this._validateAndParseInput()))}_onInputChange(){this._userIsTyping||(this._userIsTyping=!0),this._errorPersists&&(this._errorPersists=!1,this.invalid=!1,this.errorReason="",this.errorMessage="",this._showErrors=!1,this.notifyPath("invalid"),this.notifyPath("errorMessage"),this.notifyPath("errorReason"),this.notifyPath("_showErrors"))}_selectDate(e){if(!e)return;const t=this._validateDate(e);if(!t.isValid){this.invalid=!0,this.errorReason=t.errorReason,this.errorMessage=t.errorMessage,this._showErrors=!0,this._errorPersists=!0,this._selectedDate=null,this._preventInputUpdate=!0,this._safeSetValue(""),this._preventInputUpdate=!1,this._generateCalendar();return}this._selectedDate=new Date(e.getFullYear(),e.getMonth(),e.getDate()),this._selectedDate.setHours(0,0,0,0);const a=this._dateToISO(this._selectedDate);this._userIsTyping=!1,this._preventInputUpdate=!0,this._safeSetValue(a),this._inputValue=this._formatDateForDisplay(this._selectedDate),this._preventInputUpdate=!1,this._focusedDate=null,this._generateCalendar(),this._closeCalendar(),this.invalid=!1,this.errorMessage="",this.errorReason="",this._showErrors=!1,this._justCleared=!1,this._errorPersists=!1}_selectToday(e){e&&(e.preventDefault(),e.stopPropagation());const t=new Date;t.setHours(0,0,0,0),this._selectDate(t)}_openCalendarViaMouse(e){e.preventDefault(),e.stopPropagation(),this._openedViaCalendarIcon=!0,this._openCalendar(e,!1);const t=this.shadowRoot.querySelector("#dateInput");if(t){const a=t.getAttribute("tabindex");t.setAttribute("tabindex","-1"),this.async(()=>{a!==null?t.setAttribute("tabindex",a):t.removeAttribute("tabindex"),this._openedViaCalendarIcon=!1},500)}else this.async(()=>{this._openedViaCalendarIcon=!1},500)}_openCalendar(e,t=!1){if(e&&(e.preventDefault(),e.stopPropagation()),this.disabled||this._isCalendarOpen)return;if(this._selectedDate)this._viewDate=new Date(this._selectedDate),this._focusedDate=new Date(this._selectedDate);else{let n=new Date(this._today);if(this.min){const s=new Date(this.min);n=new Date(s)}else if(this.max){const s=new Date(this.max);n>s&&(n=new Date(s))}if(this.min&&this.max){const s=new Date(this.min),i=new Date(this.max);n<s?n=new Date(s):n>i&&(n=new Date(i))}this._viewDate=n,this._focusedDate=null}this._generateYearOptions(),this._generateCalendar(),this._justOpenedCalendar=!0,this._isCalendarOpen=!0,window.addEventListener("keydown",this._boundEscapeCapture,!0);const a=this.shadowRoot.querySelector("#calendarPopover"),o=this.shadowRoot.querySelector("#calendarBackdrop"),r=this.shadowRoot.querySelector("#calendarOverlay");if(a&&a.classList.add("open"),o&&o.classList.add("open"),r&&typeof r.showPopover=="function")try{r.showPopover()}catch{}this.async(()=>{this._justOpenedCalendar=!1},200),this._positionPopover(),this._boundReposition=this._boundReposition||(()=>this._positionPopover()),window.addEventListener("resize",this._boundReposition,{passive:!0}),window.addEventListener("scroll",this._boundReposition,{passive:!0}),window.addEventListener("orientationchange",this._boundReposition,{passive:!0}),window.addEventListener("resize",this._boundReposition,{passive:!0}),this._announce(this._getLocalizedText("calendarOpened")),this.dispatchEvent(new CustomEvent("opened-changed",{detail:{value:!0},bubbles:!0,composed:!0})),this.async(()=>{if(t)this._focusCalendarElement(this._focusOrder[0]);else{const n=this.shadowRoot.querySelector(".year-dropdown"),s=this.shadowRoot.querySelector("#prevMonth"),i=this.shadowRoot.querySelector("#nextMonth"),l=this.shadowRoot.querySelector(".today-button"),h=this.shadowRoot.querySelector(".cancel-button"),c=new Map;[n,s,i,l,h].forEach(p=>{p&&(c.set(p,p.getAttribute("tabindex")||"0"),p.setAttribute("tabindex","-1"))}),this.shadowRoot.activeElement&&this.shadowRoot.activeElement.blur&&this.shadowRoot.activeElement.blur(),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._focusCalendarGrid(),requestAnimationFrame(()=>{const p=this.shadowRoot.activeElement;(!p||!p.classList.contains("calendar-day"))&&this._focusCalendarGrid(),c.forEach((f,u)=>{u&&u.setAttribute("tabindex",f)})})})})}},150)}_closeCalendar(e){if(e&&(e.preventDefault(),e.stopPropagation()),!this._isCalendarOpen)return;this._isCalendarOpen=!1,window.removeEventListener("keydown",this._boundEscapeCapture,!0),this._justOpenedCalendar=!1,this._interactingWithCalendar=!1;const t=this.shadowRoot.querySelector("#calendarPopover"),a=this.shadowRoot.querySelector("#calendarBackdrop"),o=this.shadowRoot.querySelector("#calendarOverlay");if(o&&typeof o.hidePopover=="function")try{o.hidePopover()}catch{}t&&(t.classList.remove("open"),t.classList.remove("open-up"),t.style.left="",t.style.right="",t.style.top="",t.style.bottom=""),a&&a.classList.remove("open"),this._announce(this._getLocalizedText("calendarClosed")),this._boundReposition&&(window.removeEventListener("resize",this._boundReposition),window.removeEventListener("scroll",this._boundReposition),window.removeEventListener("orientationchange",this._boundReposition)),this.dispatchEvent(new CustomEvent("opened-changed",{detail:{value:!1},bubbles:!0,composed:!0}));const r=this.shadowRoot.querySelector("#dateInput");r&&r.focus()}_toggleCalendar(){this._isCalendarOpen?this._closeCalendar():this._openCalendar()}_previousMonth(e){if(e&&(e.preventDefault(),e.stopPropagation()),!this._viewDate)return;const t=new Date(this._viewDate);t.setMonth(t.getMonth()-1),this._viewDate=t,this._focusedDate=null,this._generateMonthYearOptions(),this._generateCalendar(),this._announce(this._getLocalizedText("movedToMonth",{month:this._getMonthName(this._viewDate),year:this._getYear(this._viewDate)})),this._interactingWithCalendar=!1}_nextMonth(e){if(e&&(e.preventDefault(),e.stopPropagation()),!this._viewDate)return;const t=new Date(this._viewDate);t.setMonth(t.getMonth()+1),this._viewDate=t,this._focusedDate=null,this._generateMonthYearOptions(),this._generateCalendar(),this._announce(this._getLocalizedText("movedToMonth",{month:this._getMonthName(this._viewDate),year:this._getYear(this._viewDate)})),this._interactingWithCalendar=!1}_changeYear(e){const t=parseInt(e.target.value,10),a=new Date(this._viewDate);if(a.setFullYear(t),this._viewDate=a,this._generateCalendar(),this._focusedDate){const o=new Date(this._focusedDate);o.setFullYear(t),o.getMonth()===this._viewDate.getMonth()?this._focusedDate=o:this._focusedDate=new Date(this._viewDate.getFullYear(),this._viewDate.getMonth(),1),this._focusDate(this._focusedDate)}}_handleCalendarGridClick(e){e.target.closest(".calendar-day")||(e.preventDefault(),e.stopPropagation())}_handleDateClick(e){e&&(e.preventDefault(),e.stopPropagation());const t=e.target.closest(".calendar-day");if(!t||t.disabled||t.classList.contains("empty")||t.classList.contains("other-month"))return;const a=t.dataset.date;if(!a)return;const o=this._parseDateFromISO(a);if(!o)return;const r=this._validateDate(o);r.isValid?(this.invalid=!1,this.errorReason="",this.errorMessage="",this._selectDate(o)):(this.invalid=!0,this.errorReason=r.errorReason,this.errorMessage=r.errorMessage,this._showErrors=!0)}_handleGridKeydown(e){const t=e.target;if(!t.classList.contains("calendar-day"))return;const a=new Date(t.dataset.date),o=new Date(a);switch(e.key){case"Enter":case" ":e.preventDefault(),e.stopPropagation(),!t.disabled&&t.classList.contains("calendar-day")&&a.getMonth()===this._viewDate.getMonth()&&a.getFullYear()===this._viewDate.getFullYear()&&this._selectDate(a);break;case"ArrowLeft":e.preventDefault(),e.stopPropagation(),o.setDate(a.getDate()-1),o.getMonth()===this._viewDate.getMonth()&&o.getFullYear()===this._viewDate.getFullYear()&&this._focusDate(o,!1);break;case"ArrowRight":e.preventDefault(),e.stopPropagation(),o.setDate(a.getDate()+1),o.getMonth()===this._viewDate.getMonth()&&o.getFullYear()===this._viewDate.getFullYear()&&this._focusDate(o,!1);break;case"ArrowUp":e.preventDefault(),e.stopPropagation(),o.setDate(a.getDate()-7),o.getMonth()===this._viewDate.getMonth()&&o.getFullYear()===this._viewDate.getFullYear()&&this._focusDate(o,!1);break;case"ArrowDown":e.preventDefault(),e.stopPropagation(),o.setDate(a.getDate()+7),o.getMonth()===this._viewDate.getMonth()&&o.getFullYear()===this._viewDate.getFullYear()&&this._focusDate(o,!1);break;case"Home":{e.preventDefault(),e.stopPropagation();const r=a.getDay();o.setDate(a.getDate()-r),o.getMonth()===this._viewDate.getMonth()&&o.getFullYear()===this._viewDate.getFullYear()&&this._focusDate(o,!1);break}case"End":{e.preventDefault(),e.stopPropagation();const r=6-a.getDay();o.setDate(a.getDate()+r),o.getMonth()===this._viewDate.getMonth()&&o.getFullYear()===this._viewDate.getFullYear()&&this._focusDate(o,!1);break}case"PageUp":e.preventDefault(),e.stopPropagation(),o.setFullYear(a.getFullYear()-1),this._focusDateWithMonthTransition(o);break;case"PageDown":e.preventDefault(),e.stopPropagation(),o.setFullYear(a.getFullYear()+1),this._focusDateWithMonthTransition(o);break}}_focusDateWithMonthTransition(e){const t=this._viewDate.getMonth(),a=this._viewDate.getFullYear(),o=e.getMonth(),r=e.getFullYear();o!==t||r!==a?(this._viewDate=new Date(e),this._generateCalendar(),this._announce(this._getLocalizedText("movedToMonth",{month:this._getMonthName(this._viewDate),year:this._getYear(this._viewDate)})),this.async(()=>{this._focusDate(e,!1)},50)):this._focusDate(e,!1)}_focusDate(e,t=!1){this._focusedDate=new Date(e),this._focusedDate.setHours(0,0,0,0),this.async(()=>{const a=this._focusedDate.getFullYear(),o=String(this._focusedDate.getMonth()+1).padStart(2,"0"),r=String(this._focusedDate.getDate()).padStart(2,"0"),n=`${a}-${o}-${r}`,s=this.shadowRoot.querySelector(`[data-date="${n}"]`);if(s&&(t||!s.classList.contains("empty")&&!s.disabled)){s.focus();return}t||this._findAndFocusNearestValidDate(e)},50)}_findAndFocusNearestValidDate(e){const t=this._viewDate.getFullYear(),a=this._viewDate.getMonth();if(e&&e.getMonth()===a&&e.getFullYear()===t){const h=e.getFullYear(),c=String(e.getMonth()+1).padStart(2,"0"),p=String(e.getDate()).padStart(2,"0"),f=`${h}-${c}-${p}`,u=this.shadowRoot.querySelector(`[data-date="${f}"]`);if(u&&!u.disabled&&!u.classList.contains("empty")){this._focusedDate=new Date(e),u.focus();return}}if(this._selectedDate&&this._selectedDate.getMonth()===a&&this._selectedDate.getFullYear()===t){const h=this._selectedDate.getFullYear(),c=String(this._selectedDate.getMonth()+1).padStart(2,"0"),p=String(this._selectedDate.getDate()).padStart(2,"0"),f=`${h}-${c}-${p}`,u=this.shadowRoot.querySelector(`[data-date="${f}"]`);if(u&&!u.disabled&&!u.classList.contains("empty")){this._focusedDate=new Date(this._selectedDate),u.focus();return}}if(this._today.getMonth()===a&&this._today.getFullYear()===t){const h=this._today.getFullYear(),c=String(this._today.getMonth()+1).padStart(2,"0"),p=String(this._today.getDate()).padStart(2,"0"),f=`${h}-${c}-${p}`,u=this.shadowRoot.querySelector(`[data-date="${f}"]`);if(u&&!u.disabled&&!u.classList.contains("empty")){this._focusedDate=new Date(this._today),u.focus();return}}const o=new Date(t,a,1),r=o.getFullYear(),n=String(o.getMonth()+1).padStart(2,"0"),s=String(o.getDate()).padStart(2,"0");let i=`${r}-${n}-${s}`,l=this.shadowRoot.querySelector(`[data-date="${i}"]`);if(l&&!l.disabled&&!l.classList.contains("empty")){this._focusedDate=o,l.focus();return}for(let h=1;h<=31;h++){const c=new Date(t,a,h);if(c.getMonth()!==a)break;const p=c.getFullYear(),f=String(c.getMonth()+1).padStart(2,"0"),u=String(c.getDate()).padStart(2,"0");if(i=`${p}-${f}-${u}`,l=this.shadowRoot.querySelector(`[data-date="${i}"]`),l&&!l.disabled&&!l.classList.contains("empty")){this._focusedDate=c,l.focus();return}}}_focusFirstAvailableDate(){let e=null;this._selectedDate&&this._selectedDate.getMonth()===this._viewDate.getMonth()&&this._selectedDate.getFullYear()===this._viewDate.getFullYear()?e=new Date(this._selectedDate):this._today.getMonth()===this._viewDate.getMonth()&&this._today.getFullYear()===this._viewDate.getFullYear()?e=new Date(this._today):e=new Date(this._viewDate.getFullYear(),this._viewDate.getMonth(),1),e&&(this._focusedDate=e,this._generateCalendar(),this.async(()=>{const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),o=String(e.getDate()).padStart(2,"0"),r=`${t}-${a}-${o}`,n=this.shadowRoot.querySelector(`[data-date="${r}"]`);n&&!n.disabled&&!n.classList.contains("empty")&&n.focus()},50))}_parseAndSetDate(){this._validateAndParseInput()}_parseWithFormat(e,t){try{const a=t||this.format||d.localeData().longDateFormat("L"),o=this._moment(e,a,!0);if(o.isValid()){const r=o.toDate();return r.setHours(0,0,0,0),r}return null}catch{return null}}_validateAndParseInput(){const e=this.shadowRoot.querySelector("#dateInput");if(!e)return;const t=e.value?e.value.trim():"";if(!t){this._selectedDate=null,this._preventInputUpdate=!0,this._safeSetValue(""),this._preventInputUpdate=!1,this.invalid=!1,this.errorReason="",this.errorMessage="",this._justCleared=!0,this.notifyPath("_justCleared"),this.notifyPath("invalid"),this.notifyPath("errorMessage"),this.notifyPath("errorReason"),this._generateCalendar();return}const a=this._parseUserInput(t);if(!a){this.invalid=!0,this.errorReason="format",this.errorMessage=this._buildIncorrectFormatError(),this._showErrors=!0,this._errorPersists=!0,this._selectedDate=null,this._preventInputUpdate=!0,this._safeSetValue(""),this._preventInputUpdate=!1,this._generateCalendar();return}const{date:o,isExactFormat:r}=a,n=this._validateDate(o);if(!n.isValid){this.invalid=!0,this.errorReason=n.errorReason,this.errorMessage=n.errorMessage,this._showErrors=!0,this._errorPersists=!0,this._selectedDate=null,this._preventInputUpdate=!0,this._safeSetValue(""),this._preventInputUpdate=!1,this._generateCalendar();return}this._selectedDate=new Date(o);const s=this._dateToISO(this._selectedDate);this._preventInputUpdate=!0,this._safeSetValue(s),r||(this._inputValue=this._formatDateForDisplay(this._selectedDate)),this._preventInputUpdate=!1,this._viewDate=new Date(this._selectedDate),this._generateCalendar(),this.invalid=!1,this.errorReason="",this.errorMessage="",this._showErrors=!1,this._justCleared=!1,this._errorPersists=!1}_safeSetValue(e){try{if(this.invalid&&this._userIsTyping&&e!=="")return;this.set&&typeof this.set=="function"?this.set("value",e):Object.prototype.hasOwnProperty.call(this,"value")?this.value=e:Object.defineProperty(this,"value",{value:e,writable:!0,enumerable:!0,configurable:!0}),this.notifyPath&&typeof this.notifyPath=="function"&&this.notifyPath("value")}catch{try{this.value=e}catch{}}}_updateInputValue(){this._selectedDate?this._inputValue=this._formatDateForInput(this._selectedDate):this._inputValue=""}_formatDateForInput(e){return e?this._formatDateForDisplay(e):""}_isSameDay(e,t){if(!e||!t)return!1;const a=new Date(e),o=new Date(t);return a.setHours(0,0,0,0),o.setHours(0,0,0,0),a.getTime()===o.getTime()}_isValidDate(e){if(!e||Number.isNaN(e.getTime()))return!1;const t=new Date(e);if(t.setHours(0,0,0,0),this.min){const a=this._parseDateOnly(this.min);if(a&&(a.setHours(0,0,0,0),t<a))return!1}if(this.max){const a=this._parseDateOnly(this.max);if(a&&(a.setHours(0,0,0,0),t>a))return!1}return!0}_validateDate(e){const t={isValid:!0,errorReason:"",errorMessage:""};if(!e||Number.isNaN(e.getTime()))return t.isValid=!1,t.errorReason="invalidDate",t.errorMessage=this._getLocalizedText("invalidDate"),t;const a=new Date(e);if(a.setHours(0,0,0,0),this.min){const o=this._parseDateOnly(this.min);if(o&&(o.setHours(0,0,0,0),a<o))return t.isValid=!1,t.errorReason="outOfRange",t.errorMessage=this._buildOutOfRangeMessage(a),t}if(this.max){const o=this._parseDateOnly(this.max);if(o&&(o.setHours(0,0,0,0),a>o))return t.isValid=!1,t.errorReason="outOfRange",t.errorMessage=this._buildOutOfRangeMessage(a),t}return t}_isDateDisabled(e){return!this._isValidDate(e)}_getErrorPriority(e){return{format:3,invalidDate:3,outOfRange:2,required:1}[e]||0}_computePlaceholder(e,t){return t?"":this._getDatePlaceholder(e)}_getDatePlaceholder(e){try{if(e){if(this._isMixedCaseFormat(e)){const l=this._getUserLocale();return d.locale(l),d.localeData().longDateFormat("L").replace(/D{1,2}/g,"dd").replace(/M{1,2}/g,"mm").replace(/Y{2,4}/g,"yyyy").toLowerCase()}const i=this._normalizeFormat(e);if(this._isValidMomentFormat(i))return e}let a=this._getUserLocale().replace(/_/g,"-");try{const[i]=Intl.getCanonicalLocales(a);a=i}catch{a="en-US"}const o=a.split("-")[0],r=new Intl.DateTimeFormat(a).formatToParts(new Date(2e3,11,31)),s={en:{day:"dd",month:"mm",year:"yyyy"},fr:{day:"jj",month:"mm",year:"aaaa"},de:{day:"tt",month:"mm",year:"jjjj"},es:{day:"dd",month:"mm",year:"aaaa"},it:{day:"gg",month:"mm",year:"aaaa"},pt:{day:"dd",month:"mm",year:"aaaa"},nl:{day:"dd",month:"mm",year:"jjjj"},ru:{day:"дд",month:"мм",year:"гггг"},ja:{year:"年",month:"月",day:"日"},zh:{year:"年",month:"月",day:"日"}}[o]||{day:"dd",month:"mm",year:"yyyy"};return r.map(i=>i.type==="day"?s.day:i.type==="month"?s.month:i.type==="year"?s.year:i.value).join("")}catch{try{const a=navigator.language;return new Intl.DateTimeFormat(a).formatToParts(new Date(2e3,11,31)).map(o=>o.type==="day"?"dd":o.type==="month"?"mm":o.type==="year"?"yyyy":o.value).join("")}catch{return"dd/mm/yyyy"}}}_buildOutOfRangeMessage(){try{const e=!!this.min,t=!!this.max;if(e&&t){const a=this._parseDateOnly(this.min),o=this._parseDateOnly(this.max),r=a?this._formatDateForDisplay(a):this.min,n=o?this._formatDateForDisplay(o):this.max;return`${this.i18n("customDatePicker.dateOutOfRange")} Must be between ${r} and ${n}`}if(e){const a=this._parseDateOnly(this.min),o=a?this._formatDateForDisplay(a):this.min;return`${this.i18n("customDatePicker.dateOutOfRange")} Must be on or after ${o}`}if(t){const a=this._parseDateOnly(this.max),o=a?this._formatDateForDisplay(a):this.max;return`${this.i18n("customDatePicker.dateOutOfRange")} Must be on or before ${o}`}}catch{}return this.i18n("customDatePicker.dateOutOfRange")}_formatMonthYear(e){return e?new Intl.DateTimeFormat(this._locale,{month:"long",year:"numeric"}).format(e):""}_getDayClasses(e,t){const a=[];return e.isEmpty?a.push("empty"):(e.isOtherMonth&&a.push("other-month"),e.isToday&&a.push("today"),e.isSelected&&a.push("selected"),e.isDisabled&&a.push("disabled"),t&&this._isSameDay(e.date,t)&&!e.isSelected&&!e.isToday&&e.isCurrentMonth&&t.getMonth()===this._viewDate.getMonth()&&t.getFullYear()===this._viewDate.getFullYear()&&a.push("focused")),a.join(" ")}_getDayTabIndex(e,t){return e.isEmpty||!e.isCurrentMonth?"-1":(t?this._isSameDay(e.date,t):e.isSelected||!this._selectedDate&&e.isToday||!this._selectedDate&&!this._isTodayInCurrentMonth()&&e.date.getDate()===1)?"0":"-1"}_isTodayInCurrentMonth(){return!this._today||!this._viewDate?!1:this._today.getMonth()===this._viewDate.getMonth()&&this._today.getFullYear()===this._viewDate.getFullYear()}_getDayAriaLabel(e){const{date:t}=e;let o=new Intl.DateTimeFormat(this._locale,{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(t);return e.isToday&&(o+=", today"),e.isSelected&&(o+=", selected"),o}_getAriaCurrent(e){return e.isToday?"date":null}_getActiveDescendant(e){if(!e)return null;const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),o=String(e.getDate()).padStart(2,"0");return`date-${t}-${a}-${o}`}_isSelectedYear(e,t){return t&&e===t.getFullYear()}_getAriaDescribedBy(e,t){const a=this.errorReason==="required";return e&&!!t&&(this._showErrors||!a)?"errorText":null}_showError(e,t,a){return e&&t&&this.errorReason!=="required"?!0:e&&t&&this.errorReason==="required"?a===!0:!1}_valueChanged(){try{if(this._preventInputUpdate){this._preventInputUpdate=!1;return}if(this._preventInputUpdate=!0,!this.value){this._selectedDate=null,!this._userIsTyping&&!this._errorPersists&&(this._inputValue=""),this._preventInputUpdate=!1;return}const e=this._moment(this.value);this.value&&e.isValid()?(this._selectedDate=new Date(e.toDate()),this._selectedDate.setHours(0,0,0,0),this._viewDate=new Date(this._selectedDate),this._userIsTyping||(this._inputValue=this._formatDateForDisplay(this._selectedDate)),this.invalid&&!this._userIsTyping&&!this._showErrors&&!this._errorPersists&&this.async(()=>{this.validate()},10)):(this._selectedDate=null,!this._userIsTyping&&!this._errorPersists&&(this._inputValue="")),this._generateCalendar&&typeof this._generateCalendar=="function"&&this._generateCalendar(),this._preventInputUpdate=!1}catch{this._selectedDate=null,!this._userIsTyping&&!this._errorPersists&&(this._inputValue=""),this._preventInputUpdate=!1}}connectedCallback(){super.connectedCallback(),this.form&&this.form.addEventListener("submit",e=>{if(!this.reportValidity()){e.preventDefault(),e.stopPropagation();const a=this.shadowRoot.querySelector("#dateInput");a&&a.focus()}})}_invalidChanged(e){const t=this.shadowRoot&&this.shadowRoot.querySelector("#dateInput");if(t&&t.setAttribute("aria-invalid",String(!!e)),e&&this._showErrors){const o=this.errorMessage||this.i18n("customDatePicker.invalidDate");this._announce(o)}const a=this.shadowRoot&&this.shadowRoot.querySelector("#errorText");if(a){const o=this._showError(e,this.errorMessage,this._showErrors);a.hidden=!o}}_errorMessageChanged(e){this.invalid&&e&&this._showErrors&&this._announce(e);const t=this.shadowRoot&&this.shadowRoot.querySelector("#errorText");if(t){t.textContent=e||"";const a=this._showError(this.invalid,e,this._showErrors);t.hidden=!a}}_positionPopover(){try{const e=this.shadowRoot&&this.shadowRoot.querySelector("#calendarPopover"),t=this.shadowRoot&&this.shadowRoot.querySelector(".input-wrapper");if(!e||!t||!this._isCalendarOpen)return;e.classList.remove("open-up"),e.style.left="",e.style.right="",e.style.top="",e.style.bottom="";const a=t.getBoundingClientRect(),o=e.getBoundingClientRect(),r=window.innerHeight||document.documentElement.clientHeight,n=window.innerWidth||document.documentElement.clientWidth,s=r-a.bottom,i=a.top,l=o.height||320,h=o.width||280;let{left:c}=a,p=a.bottom+4;const f=8;s>=l+f?(p=a.bottom+4,e.classList.remove("open-up")):i>=l+f?(p=a.top-l-4,e.classList.add("open-up")):s>i?(p=r-l-f,e.classList.remove("open-up")):(p=f,e.classList.add("open-up"));const u=8,g=n-h-u,_=u;if(this._isRTL){const v=a.right-h;v<_?c=_:v>g?c=g:c=v,Math.abs(c-a.left)>h&&(c=Math.max(_,Math.min(g,a.left)))}else{const m=a.left;c=Math.max(_,Math.min(g,m))}if(c===_&&a.left<_){const m=(n-h)/2;m>=_&&m<=g&&(c=m)}else if(c===g&&a.right>n-u){const m=(n-h)/2;m>=_&&m<=g&&(c=m)}e.style.position="fixed",e.style.left=`${c}px`,e.style.top=`${p}px`}catch{}}get form(){return this.closest("form")}_inputValueChanged(){this._preventInputUpdate||this._userIsTyping}validate(){if(this._errorPersists&&this.invalid)return!1;if(this.value&&this.value.trim()!==""){const e=this._parseUserInput(this.value);if(!e)return this.invalid=!0,this.errorReason="format",this.errorMessage=this._buildIncorrectFormatError(),this._showErrors=!0,!1;const t=this._validateDate(e.date);if(!t.isValid)return this.invalid=!0,this.errorReason=t.errorReason,this.errorMessage=t.errorMessage,this._showErrors=!0,!1}return this.required&&(!this.value||this.value.trim()==="")?((!this.invalid||this.errorReason==="")&&(this.invalid=!0,this.errorReason="required",this.errorMessage=this._getLocalizedText("required")),!1):(this.invalid=!1,this.errorReason="",this.errorMessage="",this._showErrors=!1,!0)}reportValidity(){this._showErrors=!0,this._justCleared=!1;const e=this.errorReason,t=this.errorMessage,a=this.validate();return!a&&e&&e!==this.errorReason&&(this._getErrorPriority(this.errorReason)>this._getErrorPriority(e)||(this.errorReason=e,this.errorMessage=t)),this.notifyPath("_showErrors"),this.notifyPath("invalid"),this.notifyPath("errorMessage"),this.notifyPath("errorReason"),this.async(()=>{const o=this.shadowRoot.querySelector("#errorText");if(o){const r=this._showError(this.invalid,this.errorMessage,this._showErrors);o.hidden=!r,r&&this.errorMessage&&(o.textContent=this.errorMessage),r?this.setAttribute("invalid",""):this.removeAttribute("invalid")}},1),a}_updateErrorDisplay(e){const t=this.shadowRoot.querySelector("#errorText");!e&&this._showErrors&&t?this.required&&(!this.value||this.value.trim()==="")?(t.textContent=this._generateRequiredMessage(),t.hidden=!1,this.hasAttribute("invalid")||this.setAttribute("invalid","")):this.errorMessage&&(t.textContent=this.errorMessage,t.hidden=!1,this.hasAttribute("invalid")||this.setAttribute("invalid","")):(e||!this._showErrors)&&t&&(t.hidden=!0,this.hasAttribute("invalid")&&this.removeAttribute("invalid"))}resetErrorState(){this._showErrors=!1,this._justCleared=!1,this._errorPersists=!1,this.invalid=!1,this.errorMessage="",this.errorReason="",this.notifyPath("_showErrors"),this.notifyPath("_justCleared"),this.notifyPath("_errorPersists"),this.notifyPath("invalid"),this.notifyPath("errorMessage");const e=this.shadowRoot.querySelector("#errorText");e&&(e.hidden=!0,e.textContent=""),this.hasAttribute("invalid")&&this.removeAttribute("invalid")}_generateRequiredMessage(){return this._getLocalizedText("required")}_getValidity(){if(this.required&&(!this.value||this.value.trim()===""))return this.errorReason="required",this.errorMessage=this._generateRequiredMessage(),!1;if(!this.required&&(!this.value||this.value.trim()===""))return this.errorReason="",this.errorMessage="",!0;if(this.value){const e=this._moment(this.value);if(!e.isValid())return this.errorReason="invalidDate",this.errorMessage=this._getLocalizedText("invalidDate"),!1;const t=navigator.languages!==void 0?navigator.languages[0]:navigator.language;if(d.locale(t),this.min){const a=this._moment(this._parseDateOnly(this.min));if(e.isBefore(a,"day"))return this.errorReason="outOfRange",this.errorMessage=this._buildOutOfRangeMessage(e.toDate()),!1}if(this.max){const a=this._moment(this._parseDateOnly(this.max));if(e.isAfter(a,"day"))return this.errorReason="outOfRange",this.errorMessage=this._buildOutOfRangeMessage(e.toDate()),!1}}return this.errorReason="",this.errorMessage="",!0}checkValidity(){return this.validate()}isInputValid(){const e=this.shadowRoot.querySelector("#dateInput");if(!e)return!0;if(this._errorPersists&&this.invalid)return!1;const t=e.value?e.value.trim():"";if(!t)return!this.required;const a=this._parseUserInput(t);return a?this._validateDate(a.date).isValid:!1}disconnectedCallback(){super.disconnectedCallback();const e=this.shadowRoot&&this.shadowRoot.querySelector("#calendarOverlay");if(e&&typeof e.hidePopover=="function")try{e.hidePopover()}catch{}document.removeEventListener("click",this._handleDocumentClick),document.removeEventListener("keydown",this._handleEscapeKey),document.removeEventListener("focusin",this._handleDocumentFocusIn),document.removeEventListener("focusout",this._handleDocumentFocusOut),this._boundReposition&&(window.removeEventListener("resize",this._boundReposition),window.removeEventListener("scroll",this._boundReposition)),this._boundEscapeCapture&&window.removeEventListener("keydown",this._boundEscapeCapture,!0)}_toggleYearDropdown(e){e&&(e.preventDefault(),e.stopPropagation());const t=this.shadowRoot.querySelector("#yearOptions");if(t){const a=t.classList.contains("open");this._isYearDropdownOpen=!a,t.classList.toggle("open"),a||requestAnimationFrame(()=>{this._focusCurrentYear(),this._scrollToCurrentYear()})}}_focusCurrentYear(){const e=this._viewDate.getFullYear(),t=this.shadowRoot.querySelector(`[data-year="${e}"]`);t&&(Array.from(this.shadowRoot.querySelectorAll(".year-option")).forEach(o=>{o.tabIndex=-1}),t.tabIndex=0,t.focus(),this._setupYearKeyNavigation())}_scrollToCurrentYear(){const e=this._viewDate.getFullYear(),t=this.shadowRoot.querySelector(`[data-year="${e}"]`),a=this.shadowRoot.querySelector("#yearOptions");if(t&&a){const o=a.clientHeight,r=t.offsetHeight,s=t.offsetTop-o/2+r/2;a.scrollTop=Math.max(0,s)}}_setupYearKeyNavigation(){const e=this.shadowRoot.querySelector("#yearOptions");e&&(this._yearKeydownHandler&&e.removeEventListener("keydown",this._yearKeydownHandler),this._yearKeydownHandler=t=>{this._handleYearKeyDown(t)},e.addEventListener("keydown",this._yearKeydownHandler))}_handleYearKeyDown(e){let t=e.target&&e.target.closest&&e.target.closest(".year-option")||this.shadowRoot.activeElement||null,a=Array.from(this.shadowRoot.querySelectorAll("#yearOptions.open .year-option"));if((!t||!t.classList||!t.classList.contains("year-option"))&&(t=a.find(s=>s.tabIndex===0)||a[0]||null),!t)return;a.length||(a=Array.from(this.shadowRoot.querySelectorAll("#yearOptions .year-option")));const o=a.indexOf(t);let r=o;switch(["ArrowUp","ArrowDown","Home","End","PageUp","PageDown","Enter"," ","Escape"].includes(e.key)&&e.stopPropagation(),e.key){case"ArrowUp":{e.preventDefault(),r=Math.max(0,o-1);break}case"ArrowDown":{e.preventDefault(),r=Math.min(a.length-1,o+1);break}case"Home":{e.preventDefault(),r=0;break}case"End":{e.preventDefault(),r=a.length-1;break}case"PageUp":{e.preventDefault(),r=Math.max(0,o-10);break}case"PageDown":{e.preventDefault(),r=Math.min(a.length-1,o+10);break}case"Enter":case" ":e.preventDefault(),t.click();return;case"Escape":e.preventDefault(),this._closeYearDropdown();return}if(r!==o&&r>=0){a.forEach((i,l)=>{i.tabIndex=l===r?0:-1});const s=a[r];s.focus(),typeof s.scrollIntoView=="function"&&s.scrollIntoView({block:"nearest"})}}_closeYearDropdown(){const e=this.shadowRoot.querySelector("#yearOptions");if(e){e.classList.remove("open"),this._isYearDropdownOpen=!1;const t=this.shadowRoot.querySelector(".year-dropdown");t&&t.focus();const a=this._viewDate?this._viewDate.getFullYear():new Date().getFullYear(),o=this.shadowRoot.querySelector(`#yearOptions .year-option[data-year="${a}"]`);Array.from(this.shadowRoot.querySelectorAll("#yearOptions .year-option")).forEach(n=>{n.tabIndex=n===o?0:-1})}}_isValidMomentFormat(e){if(!e||typeof e!="string")return!1;const t=["D","DD","Do","M","MM","MMM","MMMM","YY","YYYY","H","HH","h","hh","m","mm","s","ss","A","a"];return(e.match(/[A-Za-z]+/g)||[]).every(o=>t.includes(o))}_selectYear(e){e&&(e.preventDefault(),e.stopPropagation());const t=e.target.closest(".year-option"),a=t?parseInt(t.dataset.year,10):null;if(a&&this._viewDate){const o=this._viewDate.getMonth(),r=this._viewDate.getDate();let n=r;o===1&&r===29&&(a%4===0&&a%100!==0||a%400===0||(n=28));const s=new Date(a,o,n);s.setHours(0,0,0,0),this._viewDate=s,this._focusedDate=null,this._generateCalendar(),this._announce(this._getLocalizedText("yearChanged",{year:a})),this._closeYearDropdown(),this.async(()=>{const i=this.shadowRoot.querySelector(".year-dropdown");i&&i.focus()},100)}}_getYearOptionClass(e,t){return!t||!e?"":e===t.getFullYear()?"selected":""}_getYearTabIndex(e,t){return t&&e===t.getFullYear()?"0":"-1"}_handleCalendarIconKeydown(e){e.key==="Enter"||e.key===" "?(e.preventDefault(),e.stopPropagation(),this._openCalendar(e,!0)):(e.key==="ArrowDown"||e.key==="F4")&&(e.preventDefault(),e.stopPropagation(),this._openCalendar(e,!0))}_handleYearDropdownKeydown(e){const t=a=>{const o=this.shadowRoot.querySelector("#yearOptions");if(!o||!o.classList.contains("open"))return;const r=Array.from(o.querySelectorAll(".year-option"));if(!r.length)return;let n=r.findIndex(l=>l.tabIndex===0);n<0&&(n=0);let s=n+a;s<0&&(s=0),s>r.length-1&&(s=r.length-1),r.forEach((l,h)=>{l.tabIndex=h===s?0:-1});const i=r[s];i.focus(),typeof i.scrollIntoView=="function"&&i.scrollIntoView({block:"nearest"})};if(e.key==="Enter"||e.key===" ")if(e.preventDefault(),e.stopPropagation(),!this._isYearDropdownOpen)this._toggleYearDropdown();else{const a=this.shadowRoot.activeElement&&this.shadowRoot.activeElement.classList.contains("year-option")?this.shadowRoot.activeElement:this.shadowRoot.querySelector('#yearOptions .year-option[tabindex="0"]');a&&a.click()}else e.key==="ArrowDown"?(e.preventDefault(),e.stopPropagation(),this._isYearDropdownOpen?t(1):this._toggleYearDropdown()):e.key==="ArrowUp"?(e.preventDefault(),e.stopPropagation(),this._isYearDropdownOpen?t(-1):this._toggleYearDropdown()):e.key==="Home"?(e.preventDefault(),e.stopPropagation(),t(-9999)):e.key==="End"?(e.preventDefault(),e.stopPropagation(),t(9999)):e.key==="PageUp"?(e.preventDefault(),e.stopPropagation(),t(-10)):e.key==="PageDown"?(e.preventDefault(),e.stopPropagation(),t(10)):e.key==="Escape"?this._isYearDropdownOpen&&(e.preventDefault(),e.stopPropagation(),this._closeYearDropdown()):e.key==="Tab"&&this._closeYearDropdown()}_getFocusableElement(e){switch(e){case"year-dropdown":return this.shadowRoot.querySelector(".year-dropdown");case"prevMonth":{const t=this.shadowRoot.querySelector("#prevMonth");return t&&!t.disabled?t:null}case"nextMonth":{const t=this.shadowRoot.querySelector("#nextMonth");return t&&!t.disabled?t:null}case"calendar-grid":return this.shadowRoot.querySelector('.calendar-day[tabindex="0"]');case"today-button":return this.shadowRoot.querySelector(".today-button");case"cancel-button":return this.shadowRoot.querySelector(".cancel-button");default:return null}}_updateInputFromDate(){this._selectedDate?this._inputValue=this._formatDateForDisplay(this._selectedDate):this._inputValue=""}_dateToISO(e){if(!e||Number.isNaN(e.getTime()))return"";const t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),o=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${o}`}_formatDateForDisplay(e){if(!e||Number.isNaN(e.getTime()))return"";try{const t=this._getUserLocale();d.locale(t);let a=d.localeData().longDateFormat("L");if(this.format)if(this._isMixedCaseFormat(this.format))a=d.localeData().longDateFormat("L");else{const o=this._normalizeFormat(this.format);this._isValidMomentFormat(o)?a=o:(this.invalid=!0,this.errorMessage=`Invalid date format "${this.format}". Using default format instead.`)}return this._moment(e).format(a)}catch{return new Intl.DateTimeFormat(navigator.language).format(e)}}_isMixedCaseFormat(e){if(!e)return!1;const t=/[a-z]/.test(e),a=/[A-Z]/.test(e);return t&&a}_normalizeFormat(e){return e&&e.replace(/yyyy/g,"YYYY").replace(/yy/g,"YY").replace(/dd/g,"DD").replace(/d(?![a-zA-Z])/g,"D").replace(/mm/g,"MM").replace(/m(?![a-zA-Z])/g,"M")}_parseUserInput(e){if(!e||typeof e!="string")return null;const t=e.trim();if(!t)return null;try{const a=this._getUserLocale();d.locale(a);let o=d.localeData().longDateFormat("L");if(this.format)if(this._isMixedCaseFormat(this.format))o=d.localeData().longDateFormat("L");else{const s=this._normalizeFormat(this.format);this._isValidMomentFormat(s)?o=s:(this.invalid=!0,this.errorMessage=`Invalid date format "${this.format}"`)}let r=this._moment(t,o,!0);if(r.isValid()){const s=r.toDate();return s.setHours(0,0,0,0),{date:s,isExactFormat:!0}}if(r=this._moment(t,o,!1),r.isValid()){const s=r.toDate();if(s.setHours(0,0,0,0),s.getFullYear()>=1900&&s.getFullYear()<=2200)return{date:s,isExactFormat:!1}}const n=["DD/MM/YYYY","DD-MM-YYYY","DD.MM.YYYY","DD/MM/YY","DD-MM-YY","DD.MM.YY","MM/DD/YYYY","MM-DD-YYYY","MM.DD.YYYY","MM/DD/YY","MM-DD-YY","MM.DD.YY","YYYY-MM-DD","YYYY/MM/DD","YYYY.MM.DD","DD MMM YYYY","DD MMMM YYYY","MMM DD, YYYY","MMMM DD, YYYY","DD/MM","MM/DD","DD-MM","MM-DD"];for(let s=0;s<n.length;s++)if(r=this._moment(t,n[s],!0),r.isValid()){const i=r.toDate();if(i.setHours(0,0,0,0),i.getFullYear()>=1900&&i.getFullYear()<=2200)return{date:i,isExactFormat:!1}}if(r=this._moment(t),r.isValid()){const s=r.toDate();if(s.setHours(0,0,0,0),s.getFullYear()>=1900&&s.getFullYear()<=2200)return{date:s,isExactFormat:!1}}return null}catch{return null}}_getUserLocale(){const e=[navigator.languages&&navigator.languages[0],navigator.language,this._locale,"en-US"];for(let t=0;t<e.length;t++){const a=e[t];if(a&&typeof a=="string")return a}return"en-US"}_testDateParsing(e){const t={input:e,userLocale:this._getUserLocale(),localeFormat:null,parsed:!1,error:null,suggestions:[]};try{const a=this._getUserLocale();if(d.locale(a),t.localeFormat=d.localeData().longDateFormat("L"),this._moment(e,t.localeFormat,!0).isValid())return t.parsed=!0,t;const r=["DD/MM/YYYY","DD-MM-YYYY","DD.MM.YYYY","MM/DD/YYYY","MM-DD-YYYY","MM.DD.YYYY","YYYY-MM-DD","YYYY/MM/DD","YYYY.MM.DD"];for(let n=0;n<r.length;n++){const s=r[n];if(this._moment(e,s,!0).isValid()){t.parsed=!0,t.suggestions.push(`Try format: ${s}`);break}}t.parsed||(t.error="Could not parse date with any known format",t.suggestions=["Use format: DD/MM/YYYY (e.g., 20/10/2020)","Use format: MM/DD/YYYY (e.g., 10/20/2020)","Use format: YYYY-MM-DD (e.g., 2020-10-20)"])}catch(a){t.error=a.message}return t}_ensureConsistentDateFormat(e){return this._formatDateForDisplay(e)}_handleNavButtonKeydown(e){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),e.stopPropagation(),this._suppressInputFocusCloseUntil=Date.now()+w,this._interactingWithCalendar=!0,e.target.id==="prevMonth"?this._previousMonth(e):e.target.id==="nextMonth"&&this._nextMonth(e))}_preventNavButtonFocus(e){e&&(this._suppressInputFocusCloseUntil=Date.now()+w,e.preventDefault())}_handleDateKeydown(e){this._handleGridKeydown(e)}_isPreviousMonthDisabled(){if(!this.min)return!1;const e=new Date(this._viewDate),t=new Date(e.getFullYear(),e.getMonth()-1,1);return!this._monthHasValidDates(t)}_isNextMonthDisabled(){if(!this.max)return!1;const e=new Date(this._viewDate),t=new Date(e.getFullYear(),e.getMonth()+1,1);return!this._monthHasValidDates(t)}_monthHasValidDates(e){if(!this.min&&!this.max)return!0;const t=e.getFullYear(),a=e.getMonth(),o=new Date(t,a,1),r=new Date(t,a+1,0);let n=null,s=null;this.min&&(n=new Date(this.min),n.setHours(0,0,0,0)),this.max&&(s=new Date(this.max),s.setHours(23,59,59,999));const i=new Date(o),l=new Date(r);i.setHours(0,0,0,0),l.setHours(23,59,59,999);let h=i;n&&n>i&&(h=n);let c=l;return s&&s<l&&(c=s),h<=c}_shouldShowClearButton(e,t){const a=this.hasAttribute("clear-button-visible")?this.clearButtonVisible:null;return e&&(a!==null?a:!t)}_clearButtonVisibleChanged(e){this.hasAttribute("hide-clear-date-button")||(this.hideClearDateButton=!e)}set(e,t){if(e.startsWith("i18n.")){const a=e.substring(5);this.pickerI18n||(this.pickerI18n={}),this.pickerI18n[a]=t,this.i18n&&(typeof this.i18n=="function"||typeof this.i18n=="object")&&(this.i18n[a]=t),a==="firstDayOfWeek"?(this.firstDayOfWeek=t,this._initializeLocaleData(),this._generateCalendar&&this._generateCalendar()):a==="monthNames"?this._monthNames=t:(a==="weekdays"||a==="weekdaysShort")&&(this._weekdayNames=t)}else super.set&&super.set(e,t)}focus(){const e=this.shadowRoot.querySelector("#dateInput");e&&e.focus()}clear(){this._clearDate()}get formattedValue(){return this._selectedDate&&this.pickerI18n&&this.pickerI18n.formatDate?this.pickerI18n.formatDate(this._selectedDate):this.value}_minChanged(e){if(this._generateCalendar&&this._generateCalendar(),this.value){const t=this._moment(this.value);e&&t.isBefore(this._moment(e),"day")&&(this.invalid=!0,this.errorMessage=`Date must be on or after ${this._moment(e).format("L")}`)}}_maxChanged(e){if(this._generateCalendar&&this._generateCalendar(),this.value){const t=this._moment(this.value);e&&t.isAfter(this._moment(e),"day")&&(this.invalid=!0,this.errorMessage=`Date must be on or before ${this._moment(e).format("L")}`)}}_firstDayOfWeekChanged(){this._initializeLocaleData(),this._generateCalendar&&this._generateCalendar()}_defaultTimeChanged(){this._inputValue&&!this._preventInputUpdate&&this._inputValueChanged()}}customElements.define(y.is,y),Nuxeo.CustomDatePicker=y}/**
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
*/{class y extends M([k,b,x],Nuxeo.Element){static get is(){return"nuxeo-date-picker"}static get properties(){return{label:String,defaultTime:String,errorMessage:String,autocomplete:{type:String,value:"off"},invalid:{type:Boolean,value:!1,reflectToAttribute:!0},max:String,min:String,required:{type:Boolean,value:!1,reflectToAttribute:!0},value:{type:String,notify:!0,observer:"_valueChanged"},disabled:{type:Boolean,value:!1},firstDayOfWeek:{type:Number},timezone:{type:String,value(){return D.get("timezone")}},_inputValue:{type:String,observer:"_inputValueChanged"},hideClearDateButton:{type:Boolean,value:!1,reflectToAttribute:!0},hidePlaceholder:{type:Boolean,value:!1},_preventInputUpdate:{type:Boolean,value:!1},format:{type:String,value:""}}}static get template(){return Y`
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

          /* Keep label color normal even when invalid; only the * is red */

          custom-date-picker {
            padding-bottom: 8px;
            --lumo-space-xs: 2px;
            --lumo-font-family: var(--nuxeo-app-font);
          }

          custom-date-picker::part(text-field) {
            --lumo-text-field-size: 29px;
          }
        </style>

        <label>[[label]]</label>
        <span id="date_label" hidden>[[label]], Date Picker</span>
        <custom-date-picker
          id="date"
          name="[[name]]"
          required$="[[required]]"
          invalid="[[invalid]]"
          value="{{_inputValue}}"
          disabled$="[[disabled]]"
          aria-label$="[[_computeDateAriaLabel(label)]]"
          autocomplete="[[autocomplete]]"
          min="[[min]]"
          max="[[max]]"
          error-message="[[errorMessage]]"
          clear-button-visible$="[[!hideClearDateButton]]"
          hide-placeholder="[[hidePlaceholder]]"
          format="[[format]]"
        >
        </custom-date-picker>
      `}ready(){super.ready(),d.locale(navigator.languages!==void 0?navigator.languages[0]:navigator.language);const e=this.shadowRoot.querySelector("custom-date-picker"),t=()=>{e.focus()};if(e.addEventListener("opened-changed",a=>{a.detail.value?e.addEventListener("focusout",t):e.removeEventListener("focusout",t)}),this.$.date.set("i18n.formatDate",a=>this._moment(a).format(d.localeData().longDateFormat("L"))),this.$.date.set("i18n.parseDate",a=>{const o=this._moment(a,d.localeData().longDateFormat("L"));return{day:o.get("D"),month:o.get("M"),year:o.get("Y")}}),this.$.date.set("i18n.monthNames",d.months()),this.$.date.set("i18n.weekdays",d.weekdays()),this.$.date.set("i18n.weekdaysShort",d.weekdaysShort()),this.$.date.set("i18n.cancel",this.i18n("command.cancel")),this.$.date.set("i18n.clear",this.i18n("command.clear")),this.$.date.set("i18n.today",this.i18n("today")),this.$.date.set("i18n.firstDayOfWeek",this.firstDayOfWeek||D.get("firstDayOfWeek",d.localeData().firstDayOfWeek()||0)),!this.hasAttribute("hide-placeholder")){const a=D.get("datePicker.hidePlaceholder");a!=null&&(this.hidePlaceholder=a===!0||a==="true")}}_moment(...e){return(this.timezone==="Etc/UTC"?d.utc:d)(...e)}_computeDateAriaLabel(e){return(e||"").trim()||null}_getValidity(){const e=this.$&&this.$.date,t=e&&e.i18n&&typeof e.i18n.formatDate=="function"&&e.i18n.formatDate.bind(e.i18n)||e&&e.pickerI18n&&typeof e.pickerI18n.formatDate=="function"&&e.pickerI18n.formatDate.bind(e.pickerI18n),a=this.value&&t?t(this.value):this.value;return e.validate(a)&&(this.required?!!this.value:!0)}_valueChanged(){if(!this.value){this._inputValue=null;return}const e=this._moment(this.value);if(this.value&&e.isValid()){this._preventInputUpdate=!0;const t=`${e.get("Y")}`.padStart(4,"0"),a=`${e.get("M")+1}`.padStart(2,"0"),o=`${e.get("D")}`.padStart(2,"0");this._inputValue=`${t}-${a}-${o}`}else this._inputValue=""}_inputValueChanged(){if(this._inputValue!==null&&!this._preventInputUpdate){const e=this._moment(this._inputValue);if(e.isValid()){if(this.defaultTime){const t=d(this.defaultTime,"HH:mm:ss");if(t.isValid())e.add(t.hour(),"hour"),e.add(t.minute(),"minute"),e.add(t.second(),"second");else throw new Error(`Invalid default time ${this.defaultTime}`)}this.set("value",e.toJSON())}else this.set("value",null)}this._preventInputUpdate=!1}}customElements.define(y.is,y),Nuxeo.DatePicker=y}
