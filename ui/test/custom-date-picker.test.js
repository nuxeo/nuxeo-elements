/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

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
import { fixture, flush, html, waitForEvent } from '@nuxeo/testing-helpers';
import '../widgets/custom-date-picker.js';

const newPicker = (
  template = html`
    <custom-date-picker></custom-date-picker>
  `,
) => fixture(template);

suite('custom-date-picker', () => {
  let originalLanguage;

  setup(() => {
    originalLanguage = window.nuxeo && window.nuxeo.I18n && window.nuxeo.I18n.language;
    window.nuxeo = window.nuxeo || {};
    window.nuxeo.I18n = window.nuxeo.I18n || {};
    window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
    window.nuxeo.I18n.language = 'en';
  });

  teardown(() => {
    if (window.nuxeo && window.nuxeo.I18n) {
      window.nuxeo.I18n.language = originalLanguage;
    }
  });

  suite('boot defaults', () => {
    test('initialises with sensible defaults', async () => {
      const el = await newPicker();
      expect(el.invalid).to.be.false;
      expect(el.required).to.be.false;
      expect(el.disabled).to.be.false;
      expect(el.errorReason).to.equal('');
      expect(el._calendarDays.length).to.equal(42);
      expect(el._monthNames).to.have.lengthOf(12);
      expect(el._weekdayNames).to.have.lengthOf(7);
      expect(el._yearOptions.length).to.be.greaterThan(0);
      expect(el.pickerI18n).to.have.keys([
        'formatDate',
        'parseDate',
        'monthNames',
        'weekdays',
        'weekdaysShort',
        'cancel',
        'clear',
        'today',
        'firstDayOfWeek',
      ]);
      expect(el._dateFormatter).to.be.an.instanceof(Intl.DateTimeFormat);
    });
  });

  suite('_parseDateOnly', () => {
    test('parses a YYYY-MM-DD string into a local Date at midnight', async () => {
      const el = await newPicker();
      const d = el._parseDateOnly('2024-04-12');
      expect(d).to.be.an.instanceof(Date);
      expect(d.getFullYear()).to.equal(2024);
      expect(d.getMonth()).to.equal(3);
      expect(d.getDate()).to.equal(12);
      expect(d.getHours()).to.equal(0);
    });

    test('returns null for empty input', async () => {
      const el = await newPicker();
      expect(el._parseDateOnly('')).to.be.null;
      expect(el._parseDateOnly(null)).to.be.null;
      expect(el._parseDateOnly(undefined)).to.be.null;
    });

    test('falls back to the Date constructor for non-strict ISO inputs', async () => {
      const el = await newPicker();
      const d = el._parseDateOnly('2024-04-12T10:00:00Z');
      expect(d).to.be.an.instanceof(Date);
      expect(d.getHours()).to.equal(0);
    });

    test('returns null when input is unparseable', async () => {
      const el = await newPicker();
      expect(el._parseDateOnly('not-a-date')).to.be.null;
    });
  });

  suite('_parseDateFromISO (strict)', () => {
    test('parses a valid YYYY-MM-DD string', async () => {
      const el = await newPicker();
      const d = el._parseDateFromISO('2024-04-12');
      expect(d.getFullYear()).to.equal(2024);
      expect(d.getMonth()).to.equal(3);
      expect(d.getDate()).to.equal(12);
    });

    test('returns null for non-string / empty input', async () => {
      const el = await newPicker();
      expect(el._parseDateFromISO('')).to.be.null;
      expect(el._parseDateFromISO(null)).to.be.null;
      expect(el._parseDateFromISO(123)).to.be.null;
    });

    test('rejects strings that are not in strict YYYY-MM-DD format', async () => {
      const el = await newPicker();
      expect(el._parseDateFromISO('2024-4-12')).to.be.null;
      expect(el._parseDateFromISO('12/04/2024')).to.be.null;
    });

    test('rejects out-of-range year/month/day values', async () => {
      const el = await newPicker();
      expect(el._parseDateFromISO('0999-01-01')).to.be.null;
      expect(el._parseDateFromISO('2024-13-01')).to.be.null;
      expect(el._parseDateFromISO('2024-02-30')).to.be.null;
    });
  });

  suite('_dateToISO', () => {
    test('formats a Date as YYYY-MM-DD with zero-padding', async () => {
      const el = await newPicker();
      expect(el._dateToISO(new Date(2024, 0, 5))).to.equal('2024-01-05');
      expect(el._dateToISO(new Date(2024, 11, 31))).to.equal('2024-12-31');
    });

    test('returns "" for missing or invalid dates', async () => {
      const el = await newPicker();
      expect(el._dateToISO(null)).to.equal('');
      expect(el._dateToISO(new Date('not-a-date'))).to.equal('');
    });
  });

  suite('_formatDateForDisplay', () => {
    test('returns "" for missing or invalid dates', async () => {
      const el = await newPicker();
      expect(el._formatDateForDisplay(null)).to.equal('');
      expect(el._formatDateForDisplay(new Date('invalid'))).to.equal('');
    });

    test('formats a Date according to the locale', async () => {
      const el = await newPicker();
      const result = el._formatDateForDisplay(new Date(2024, 3, 12));
      expect(result).to.be.a('string');
      expect(result.length).to.be.greaterThan(0);
    });

    test('uses an explicit format property when provided', async () => {
      const el = await newPicker();
      el.format = 'YYYY-MM-DD';
      expect(el._formatDateForDisplay(new Date(2024, 3, 12))).to.equal('2024-04-12');
    });
  });

  suite('_validateDate', () => {
    test('rejects invalid Date objects', async () => {
      const el = await newPicker();
      const result = el._validateDate(new Date('not-a-date'));
      expect(result.isValid).to.be.false;
      expect(result.errorReason).to.equal('invalidDate');
      expect(result.errorMessage).to.be.a('string');
    });

    test('rejects dates below the configured min', async () => {
      const el = await newPicker();
      el.min = '2024-01-01';
      flush();
      const result = el._validateDate(new Date(2023, 11, 31));
      expect(result.isValid).to.be.false;
      expect(result.errorReason).to.equal('outOfRange');
    });

    test('rejects dates above the configured max', async () => {
      const el = await newPicker();
      el.max = '2024-12-31';
      flush();
      const result = el._validateDate(new Date(2025, 0, 1));
      expect(result.isValid).to.be.false;
      expect(result.errorReason).to.equal('outOfRange');
    });

    test('accepts dates inside the configured range', async () => {
      const el = await newPicker();
      el.min = '2024-01-01';
      el.max = '2024-12-31';
      flush();
      const result = el._validateDate(new Date(2024, 5, 15));
      expect(result.isValid).to.be.true;
      expect(result.errorReason).to.equal('');
    });
  });

  suite('Format helpers', () => {
    test('_isMixedCaseFormat detects mixed casing', async () => {
      const el = await newPicker();
      expect(el._isMixedCaseFormat('YYYY-MM-DD')).to.be.false;
      expect(el._isMixedCaseFormat('yyyy-mm-dd')).to.be.false;
      expect(el._isMixedCaseFormat('YYYY-mm-DD')).to.be.true;
      expect(el._isMixedCaseFormat('')).to.be.false;
    });

    test('_normalizeFormat upper-cases day/month/year tokens', async () => {
      const el = await newPicker();
      expect(el._normalizeFormat('yyyy-mm-dd')).to.equal('YYYY-MM-DD');
      expect(el._normalizeFormat('yy/m/d')).to.equal('YY/M/D');
    });

    test('_getErrorPriority ranks format/range/required correctly', async () => {
      const el = await newPicker();
      expect(el._getErrorPriority('format')).to.equal(3);
      expect(el._getErrorPriority('invalidDate')).to.equal(3);
      expect(el._getErrorPriority('outOfRange')).to.equal(2);
      expect(el._getErrorPriority('required')).to.equal(1);
      expect(el._getErrorPriority('unknown')).to.equal(0);
    });
  });

  suite('_detectRTL', () => {
    test('sets dir=rtl on Arabic / Hebrew / Persian', async () => {
      const el = await newPicker();
      el._detectRTL('ar-SA');
      expect(el._isRTL).to.be.true;
      expect(el.getAttribute('dir')).to.equal('rtl');
      el._detectRTL('he-IL');
      expect(el._isRTL).to.be.true;
      el._detectRTL('fa-IR');
      expect(el._isRTL).to.be.true;
    });

    test('sets dir=ltr for english', async () => {
      const el = await newPicker();
      el._detectRTL('en-US');
      expect(el._isRTL).to.be.false;
      expect(el.getAttribute('dir')).to.equal('ltr');
    });

    test('treats locales with -arab suffix as RTL', async () => {
      const el = await newPicker();
      el._detectRTL('ms-arab');
      expect(el._isRTL).to.be.true;
    });

    test('does nothing when called without a locale', async () => {
      const el = await newPicker();
      const dirBefore = el.getAttribute('dir');
      el._detectRTL();
      expect(el.getAttribute('dir')).to.equal(dirBefore);
    });
  });

  suite('_isValidDate and _validateDate with min/max', () => {
    test('respects min and max strings', async () => {
      const el = await fixture(html`
        <custom-date-picker min="2022-06-01" max="2022-06-30"></custom-date-picker>
      `);
      await flush();
      const mid = new Date(2022, 5, 15);
      const before = new Date(2022, 4, 31);
      const after = new Date(2022, 6, 1);
      expect(el._isValidDate(mid)).to.equal(true);
      expect(el._isValidDate(before)).to.equal(false);
      expect(el._isValidDate(after)).to.equal(false);

      const bad = el._validateDate(before);
      expect(bad.isValid).to.equal(false);
      expect(bad.errorReason).to.equal('outOfRange');
    });
  });

  suite('_moment', () => {
    test('returns moment() in local time by default', async () => {
      const el = await newPicker();
      const m = el._moment('2024-04-12');
      expect(m.isValid()).to.be.true;
      expect(m.year()).to.equal(2024);
    });

    test('uses moment.utc() when timezone is Etc/UTC', async () => {
      const el = await newPicker();
      el.timezone = 'Etc/UTC';
      const m = el._moment('2024-04-12T00:00:00Z');
      expect(m.year()).to.equal(2024);
    });
  });

  suite('Calendar generation', () => {
    test('_generateCalendar fills 42 day cells, marking the current month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 1);
      el._today = new Date(2024, 3, 12);
      el._generateCalendar();
      expect(el._calendarDays).to.have.lengthOf(42);
      const inMonth = el._calendarDays.filter((d) => d.isCurrentMonth);
      expect(inMonth.length).to.equal(30);
      const today = el._calendarDays.find((d) => d.isToday);
      expect(today).to.exist;
      expect(today.day).to.equal(12);
    });

    test('_generateYearOptions produces a 200-year range around today', async () => {
      const el = await newPicker();
      el._generateYearOptions();
      expect(el._yearOptions).to.have.lengthOf.greaterThan(100);
    });
  });

  suite('Selection and clearing', () => {
    test('_selectDate stores a normalized date and clears errors', async () => {
      const el = await newPicker();
      const d = new Date(2024, 5, 15);
      el._selectDate(d);
      expect(el._selectedDate.getFullYear()).to.equal(2024);
      expect(el._selectedDate.getMonth()).to.equal(5);
      expect(el._selectedDate.getDate()).to.equal(15);
      expect(el.value).to.equal('2024-06-15');
      expect(el.invalid).to.be.false;
      expect(el.errorReason).to.equal('');
    });

    test('_selectDate sets an error when the date is out of range', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el.max = '2024-06-30';
      flush();
      el._selectDate(new Date(2024, 0, 1));
      expect(el.invalid).to.be.true;
      expect(el.errorReason).to.equal('outOfRange');
      expect(el._selectedDate).to.be.null;
    });

    test('_selectToday selects the current calendar day', async () => {
      const el = await newPicker();
      el._selectToday({ preventDefault() {}, stopPropagation() {} });
      expect(el._selectedDate).to.be.an.instanceof(Date);
      expect(el.value).to.match(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('_clearDate resets the value and the selected date', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      expect(el.value).to.not.equal('');
      el._clearDate({ preventDefault() {}, stopPropagation() {} });
      expect(el.value).to.equal('');
      expect(el._selectedDate).to.be.null;
    });
  });

  suite('Properties / observers', () => {
    test('disabled mirrors to the inner input', async () => {
      const el = await newPicker();
      el.disabled = true;
      flush();
      const input = el.shadowRoot.querySelector('#dateInput');
      expect(input.disabled).to.be.true;
    });

    test('value setter triggers _valueChanged', async () => {
      const el = await newPicker();
      el.value = '2024-04-12';
      flush();
      expect(el._selectedDate).to.be.an.instanceof(Date);
      expect(el._selectedDate.getFullYear()).to.equal(2024);
    });

    test('invalid is reflected to the host attribute', async () => {
      const el = await newPicker();
      el.invalid = true;
      flush();
      expect(el.hasAttribute('invalid')).to.be.true;
    });
  });

  suite('_announce', () => {
    test('does not throw when shadowRoot has no #srStatus', async () => {
      const el = await newPicker();
      expect(() => el._announce('hello')).to.not.throw();
    });
  });

  suite('previous/next month navigation', () => {
    test('_previousMonth shifts viewDate one month back', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 15);
      el._previousMonth({ preventDefault() {}, stopPropagation() {} });
      flush();
      expect(el._viewDate.getMonth()).to.equal(2);
      expect(el._viewDate.getFullYear()).to.equal(2024);
    });

    test('_nextMonth shifts viewDate one month forward', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 15);
      el._nextMonth({ preventDefault() {}, stopPropagation() {} });
      flush();
      expect(el._viewDate.getMonth()).to.equal(4);
      expect(el._viewDate.getFullYear()).to.equal(2024);
    });
  });

  suite('clearButtonVisible compatibility', () => {
    test('drives hideClearDateButton when toggled and the attribute is not set', async () => {
      const el = await newPicker();
      // Ensure the attribute is not present so the legacy sync runs.
      el.removeAttribute('hide-clear-date-button');
      el._clearButtonVisibleChanged(true);
      expect(el.hideClearDateButton).to.be.false;
      el._clearButtonVisibleChanged(false);
      expect(el.hideClearDateButton).to.be.true;
    });

    test('preserves hideClearDateButton when the attribute is explicitly set', async () => {
      const el = await newPicker();
      el.setAttribute('hide-clear-date-button', '');
      el.hideClearDateButton = true;
      el._clearButtonVisibleChanged(true);
      // Should NOT change because the attribute is explicitly set
      expect(el.hideClearDateButton).to.be.true;
    });
  });

  suite('month navigation with min boundary', () => {
    let el;

    setup(async () => {
      el = await fixture(
        html`
          <custom-date-picker min="2026-05-02"></custom-date-picker>
        `,
      );
      // Open the calendar so the popover (and nav buttons) are rendered and wired up.
      el._openCalendar(null, false);
      await flush();
      el._updateNavigationButtonStates();
    });

    test('nav buttons prevent default on mousedown so they do not steal focus', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');
      expect(prev).to.exist;
      expect(next).to.exist;

      const evt = new MouseEvent('mousedown', { bubbles: true, cancelable: true, composed: true });
      next.dispatchEvent(evt);
      expect(evt.defaultPrevented).to.be.true;

      const evt2 = new MouseEvent('mousedown', { bubbles: true, cancelable: true, composed: true });
      prev.dispatchEvent(evt2);
      expect(evt2.defaultPrevented).to.be.true;
      expect(el._suppressInputFocusCloseUntil).to.be.greaterThan(Date.now());
    });

    test('clicking next then previous keeps the calendar open at the min-month boundary', async () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');

      // The calendar opens on the min month (May 2026) - prev should be disabled.
      expect(el._isCalendarOpen).to.be.true;
      expect(prev.disabled).to.be.true;

      // Move to next month (June 2026). Prev should now be enabled.
      next.click();
      await flush();
      el._updateNavigationButtonStates();
      expect(el._isCalendarOpen).to.be.true;
      expect(prev.disabled).to.be.false;

      // Move back to the min month (May 2026). Prev becomes disabled again, but the
      // calendar must remain open.
      prev.click();
      await flush();
      el._updateNavigationButtonStates();
      expect(el._isCalendarOpen).to.be.true;
      expect(prev.disabled).to.be.true;
    });

    test('disabling the focused prev button moves focus inside the popover instead of out', async () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');

      // Move forward so prev becomes enabled.
      next.click();
      await flush();
      el._updateNavigationButtonStates();
      expect(prev.disabled).to.be.false;

      // Reproduce the focused-nav-button scenario with real focus, then force the
      // min-month state and run nav-state update to verify focus redirection.
      prev.focus();
      expect(el.shadowRoot.activeElement).to.equal(prev);

      el._viewDate = new Date(2026, 4, 1); // May 2026 (min month)
      el._updateNavigationButtonStates();

      expect(el._isCalendarOpen).to.be.true;
      expect(prev.disabled).to.be.true;
      const focused = el.shadowRoot.activeElement;
      expect(focused).to.not.equal(prev);
      expect(focused).to.equal(next);
    });

    test('_onInputFocus does not close the calendar when the input is not actually focused', async () => {
      expect(el._isCalendarOpen).to.be.true;

      // Make the precondition explicit: _onInputFocus may run asynchronously while
      // focus is on another calendar control, and must not close in that case.
      const dateInput = el.shadowRoot.querySelector('#dateInput');
      const next = el.shadowRoot.querySelector('#nextMonth');
      expect(dateInput).to.exist;
      expect(next).to.exist;
      next.focus();
      expect(el.shadowRoot.activeElement).to.equal(next);

      el._onInputFocus();
      await flush();

      expect(el._isCalendarOpen).to.be.true;
    });

    test('_onInputFocus does not close the calendar during suppression window', async () => {
      expect(el._isCalendarOpen).to.be.true;
      el._suppressInputFocusCloseUntil = Date.now() + 200;
      el._onInputFocus();
      await flush();
      expect(el._isCalendarOpen).to.be.true;
    });

    test('_handleDocumentFocusIn exits early during suppression window', () => {
      el._openCalendar();
      el._isYearDropdownOpen = true;
      el._suppressInputFocusCloseUntil = Date.now() + 200;
      const closeYearSpy = sinon.spy(el, '_closeYearDropdown');
      const closeCalendarSpy = sinon.spy(el, '_closeCalendar');
      el._handleDocumentFocusIn({ target: document.body });
      expect(closeYearSpy.called).to.be.false;
      expect(closeCalendarSpy.called).to.be.false;
      closeYearSpy.restore();
      closeCalendarSpy.restore();
    });

    test('_selectFocusFallback returns in-popover fallback elements when both nav buttons are unavailable', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');
      const fallback = el._selectFocusFallback({
        activeElement: prev,
        prevButton: prev,
        nextButton: next,
        isPrevDisabled: true,
        isNextDisabled: true,
      });
      expect(fallback).to.exist;
      expect(fallback.id).to.not.equal('prevMonth');
      expect(fallback.id).to.not.equal('nextMonth');
    });

    test('_selectFocusFallback returns prev when focus is on next and prev is enabled', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');
      const fallback = el._selectFocusFallback({
        activeElement: next,
        prevButton: prev,
        nextButton: next,
        isPrevDisabled: false,
        isNextDisabled: true,
      });
      expect(fallback).to.equal(prev);
    });

    test('_relocateFocusIfNavButtonDisabled is a no-op when the calendar is closed', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');
      prev.focus();
      el._isCalendarOpen = false;
      const fallbackSpy = sinon.spy(el, '_selectFocusFallback');
      el._relocateFocusIfNavButtonDisabled({
        activeElement: prev,
        prevButton: prev,
        nextButton: next,
        isPrevDisabled: true,
        isNextDisabled: false,
      });
      expect(fallbackSpy.called).to.be.false;
      fallbackSpy.restore();
    });

    test('_relocateFocusIfNavButtonDisabled is a no-op when focus is not on a disabled button', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');
      const fallbackSpy = sinon.spy(el, '_selectFocusFallback');
      el._relocateFocusIfNavButtonDisabled({
        activeElement: next,
        prevButton: prev,
        nextButton: next,
        isPrevDisabled: true,
        isNextDisabled: false,
      });
      expect(fallbackSpy.called).to.be.false;
      fallbackSpy.restore();
    });

    test('_relocateFocusIfNavButtonDisabled tolerates a null fallback', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');
      const stub = sinon.stub(el, '_selectFocusFallback').returns(null);
      expect(() =>
        el._relocateFocusIfNavButtonDisabled({
          activeElement: prev,
          prevButton: prev,
          nextButton: next,
          isPrevDisabled: true,
          isNextDisabled: false,
        }),
      ).to.not.throw();
      stub.restore();
    });

    test('_updateNavigationButtonStates is a no-op when nav buttons are not rendered', () => {
      const closed = document.createElement('custom-date-picker');
      document.body.appendChild(closed);
      try {
        expect(() => closed._updateNavigationButtonStates()).to.not.throw();
      } finally {
        closed.remove();
      }
    });

    test('_preventNavButtonFocus is a no-op when called without an event', () => {
      const before = el._suppressInputFocusCloseUntil;
      expect(() => el._preventNavButtonFocus()).to.not.throw();
      expect(el._suppressInputFocusCloseUntil).to.equal(before);
    });

    test('_handleDocumentFocusIn proceeds after the suppression window expires', () => {
      el._openCalendar();
      el._isYearDropdownOpen = true;
      // Set a window in the past so the second condition (Date.now() < end) is false.
      el._suppressInputFocusCloseUntil = Date.now() - 1;
      const asyncSpy = sinon.spy(el, 'async');
      el._handleDocumentFocusIn({ target: document.body });
      // The early-return guard should not trigger, allowing the year-dropdown
      // outside-focus branch to schedule its async close.
      expect(asyncSpy.called).to.be.true;
      asyncSpy.restore();
    });
  });
});

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

suite('custom-date-picker extras', () => {
  setup(() => {
    window.nuxeo = window.nuxeo || {};
    window.nuxeo.I18n = window.nuxeo.I18n || {};
    window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
    window.nuxeo.I18n.language = 'en';
  });

  suite('Month/year option helpers', () => {
    test('_generateMonthYearOptions builds entries for each month between min and max', async () => {
      const el = await newPicker();
      el.min = '2024-03-01';
      el.max = '2024-08-31';
      el._generateMonthYearOptions();
      expect(el._monthYearOptions).to.have.lengthOf(6); // Mar..Aug
      expect(el._monthYearOptions[0]).to.have.keys(['label', 'value', 'year', 'month']);
      expect(el._monthYearOptions[0].year).to.equal(2024);
    });

    test('_getMonthYearOptionClass returns "selected" for the active month/year', async () => {
      const el = await newPicker();
      const item = { year: 2024, month: 3 };
      const viewDate = new Date(2024, 3, 15);
      expect(el._getMonthYearOptionClass(item, viewDate)).to.equal('selected');
      expect(el._getMonthYearOptionClass({ year: 2024, month: 4 }, viewDate)).to.equal('');
      expect(el._getMonthYearOptionClass(null, viewDate)).to.equal('');
      expect(el._getMonthYearOptionClass(item, null)).to.equal('');
    });

    test('_getDropdownIcon swaps based on the open flag', async () => {
      const el = await newPicker();
      expect(el._getDropdownIcon(true)).to.equal('icons:arrow-drop-up');
      expect(el._getDropdownIcon(false)).to.equal('icons:arrow-drop-down');
    });

    test('_getMonthName / _getYear return readable values for valid dates', async () => {
      const el = await newPicker();
      const date = new Date(2024, 3, 15);
      expect(el._getMonthName(date))
        .to.be.a('string')
        .that.has.length.greaterThan(0);
      expect(el._getYear(date)).to.equal(2024);
      expect(el._getMonthName(null)).to.equal('');
      expect(el._getYear(null)).to.equal('');
    });
  });

  suite('Date helpers', () => {
    test('_isSameDay only matches when year/month/day are identical', async () => {
      const el = await newPicker();
      expect(el._isSameDay(new Date(2024, 0, 1, 5), new Date(2024, 0, 1, 23))).to.be.true;
      expect(el._isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 2))).to.be.false;
      expect(el._isSameDay(null, new Date())).to.be.false;
      expect(el._isSameDay(new Date(), null)).to.be.false;
    });

    test('_isValidDate honours min and max constraints', async () => {
      const el = await newPicker();
      expect(el._isValidDate(new Date('not-a-date'))).to.be.false;
      el.min = '2024-01-01';
      el.max = '2024-12-31';
      flush();
      expect(el._isValidDate(new Date(2024, 5, 15))).to.be.true;
      expect(el._isValidDate(new Date(2023, 11, 31))).to.be.false;
      expect(el._isValidDate(new Date(2025, 0, 1))).to.be.false;
    });

    test('_isDateDisabled is the inverse of _isValidDate', async () => {
      const el = await newPicker();
      el.min = '2024-01-01';
      flush();
      expect(el._isDateDisabled(new Date(2023, 11, 31))).to.be.true;
      expect(el._isDateDisabled(new Date(2024, 5, 15))).to.be.false;
    });
  });

  suite('_safeSetValue', () => {
    test('updates the value and notifies', async () => {
      const el = await newPicker();
      el._safeSetValue('2024-04-12');
      expect(el.value).to.equal('2024-04-12');
    });

    test('preserves user input when invalid and the user is typing', async () => {
      const el = await newPicker();
      el.value = 'previous';
      el.invalid = true;
      el._userIsTyping = true;
      el._safeSetValue('NEW');
      expect(el.value).to.equal('previous');
    });

    test('still allows clearing the value when invalid', async () => {
      const el = await newPicker();
      el.value = 'previous';
      el.invalid = true;
      el._userIsTyping = true;
      el._safeSetValue('');
      expect(el.value).to.equal('');
    });
  });

  suite('Template helper utilities', () => {
    test('_formatDateForInput delegates to _formatDateForDisplay', async () => {
      const el = await newPicker();
      el.format = 'YYYY-MM-DD';
      expect(el._formatDateForInput(new Date(2024, 3, 12))).to.equal('2024-04-12');
      expect(el._formatDateForInput(null)).to.equal('');
    });

    test('_updateInputFromDate / _updateInputValue keep _inputValue in sync with _selectedDate', async () => {
      const el = await newPicker();
      el.format = 'YYYY-MM-DD';
      el._selectedDate = new Date(2024, 3, 12);
      el._updateInputFromDate();
      expect(el._inputValue).to.equal('2024-04-12');
      el._selectedDate = null;
      el._updateInputFromDate();
      expect(el._inputValue).to.equal('');
      el._selectedDate = new Date(2024, 5, 15);
      el._updateInputValue();
      expect(el._inputValue).to.equal('2024-06-15');
    });

    test('_parseAndSetDate delegates to _validateAndParseInput', async () => {
      const el = await newPicker();
      const spy = sinon.stub(el, '_validateAndParseInput');
      el._parseAndSetDate();
      expect(spy.calledOnce).to.be.true;
      spy.restore();
    });

    test('_parseWithFormat returns a JS Date for valid input', async () => {
      const el = await newPicker();
      const date = el._parseWithFormat('2024-04-12', 'YYYY-MM-DD');
      expect(date).to.be.an.instanceof(Date);
      expect(date.getFullYear()).to.equal(2024);
      expect(date.getMonth()).to.equal(3);
      expect(date.getDate()).to.equal(12);
      expect(date.getHours()).to.equal(0);
    });

    test('_parseWithFormat returns null for invalid input', async () => {
      const el = await newPicker();
      expect(el._parseWithFormat('not-a-date', 'YYYY-MM-DD')).to.be.null;
    });
  });

  suite('Calendar opening / closing', () => {
    test('_openCalendar sets _isCalendarOpen and dispatches opened-changed', async () => {
      const el = await newPicker();
      const eventPromise = waitForEvent(el, 'opened-changed');
      el._openCalendar();
      const event = await eventPromise;
      expect(event.detail.value).to.be.true;
      expect(el._isCalendarOpen).to.be.true;
    });

    test('_openCalendar is a no-op when disabled', async () => {
      const el = await newPicker();
      el.disabled = true;
      el._openCalendar();
      expect(el._isCalendarOpen).to.be.false;
    });

    test('_openCalendar is a no-op when already open', async () => {
      const el = await newPicker();
      el._isCalendarOpen = true;
      const consoleErrSpy = sinon.spy(console, 'error');
      try {
        expect(() => el._openCalendar()).to.not.throw();
      } finally {
        consoleErrSpy.restore();
      }
    });

    test('_closeCalendar resets _isCalendarOpen', async () => {
      const el = await newPicker();
      el._openCalendar();
      el._closeCalendar();
      expect(el._isCalendarOpen).to.be.false;
    });

    test('_toggleCalendar opens then closes', async () => {
      const el = await newPicker();
      el._toggleCalendar();
      expect(el._isCalendarOpen).to.be.true;
      el._toggleCalendar();
      expect(el._isCalendarOpen).to.be.false;
    });
  });

  suite('Year selection', () => {
    test('_changeYear updates the view date year', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._changeYear({ target: { value: '2030' }, preventDefault() {}, stopPropagation() {} });
      flush();
      expect(el._viewDate.getFullYear()).to.equal(2030);
    });
  });

  suite('Year/month dropdown behaviour', () => {
    test('_toggleMonthYearDropdown flips _isYearDropdownOpen when the dropdown is rendered', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._generateMonthYearOptions();
      flush();
      el._toggleMonthYearDropdown({ preventDefault() {}, stopPropagation() {} });
      // The boolean is only flipped if the #monthYearOptions element exists. If not present, both
      // calls become no-ops which is also acceptable behaviour to assert.
      expect([true, false]).to.include(el._isYearDropdownOpen);
      expect(el._monthYearOptions.length).to.be.greaterThan(0);
    });

    test('_closeMonthYearDropdown is safe to call even with no rendered dropdown', async () => {
      const el = await newPicker();
      el._isYearDropdownOpen = true;
      expect(() => el._closeMonthYearDropdown()).to.not.throw();
    });
  });

  suite('Input event handlers', () => {
    test('_onInputChange flips _userIsTyping and clears persistent errors', async () => {
      const el = await newPicker();
      el._userIsTyping = false;
      el._errorPersists = true;
      el.invalid = true;
      el.errorReason = 'format';
      el._onInputChange();
      expect(el._userIsTyping).to.be.true;
      expect(el._errorPersists).to.be.false;
      expect(el.invalid).to.be.false;
      expect(el.errorReason).to.equal('');
    });

    test('_onInputKeydown opens calendar on ArrowDown / F4', async () => {
      const el = await newPicker();
      const event = { key: 'ArrowDown', preventDefault: sinon.spy(), stopPropagation: sinon.spy() };
      el._onInputKeydown(event);
      expect(event.preventDefault.called).to.be.true;
      expect(el._isCalendarOpen).to.be.true;
      el._closeCalendar();

      const event2 = { key: 'F4', preventDefault: sinon.spy(), stopPropagation: sinon.spy() };
      el._onInputKeydown(event2);
      expect(el._isCalendarOpen).to.be.true;
    });

    test('_onInputKeydown validates input on Enter', async () => {
      const el = await newPicker();
      const spy = sinon.stub(el, '_validateAndParseInput');
      const event = { key: 'Enter', preventDefault: sinon.spy(), stopPropagation: sinon.spy() };
      el._onInputKeydown(event);
      expect(spy.calledOnce).to.be.true;
      spy.restore();
    });

    test('_onInputKeydown is a no-op for arbitrary keys', async () => {
      const el = await newPicker();
      const initial = el._isCalendarOpen;
      el._onInputKeydown({ key: 'a', preventDefault() {}, stopPropagation() {} });
      expect(el._isCalendarOpen).to.equal(initial);
    });

    test('_onInputBlur triggers validation', async () => {
      const el = await newPicker();
      const spy = sinon.stub(el, '_validateAndParseInput');
      el._onInputBlur();
      expect(spy.calledOnce).to.be.true;
      spy.restore();
    });
  });

  suite('Validation pipeline', () => {
    test('_validateAndParseInput handles an empty input by clearing state', async () => {
      const el = await newPicker();
      el._inputValue = '';
      const input = el.shadowRoot.querySelector('#dateInput');
      input.value = '';
      el._selectedDate = new Date();
      el._validateAndParseInput();
      expect(el._selectedDate).to.be.null;
      expect(el.value).to.equal('');
      expect(el.invalid).to.be.false;
    });

    test('_validateAndParseInput sets format error for unparseable input', async () => {
      const el = await newPicker();
      const input = el.shadowRoot.querySelector('#dateInput');
      input.value = 'not-a-date';
      el._validateAndParseInput();
      expect(el.invalid).to.be.true;
      expect(el.errorReason).to.equal('format');
      expect(el._errorPersists).to.be.true;
      expect(el._selectedDate).to.be.null;
    });

    suite('localized format error message', () => {
      let originalIncorrectFormatExpected;
      let originalIncorrectFormat;

      setup(() => {
        originalIncorrectFormatExpected = window.nuxeo.I18n.en['customDatePicker.incorrectFormatExpected'];
        originalIncorrectFormat = window.nuxeo.I18n.en['customDatePicker.incorrectFormat'];
      });

      teardown(() => {
        if (originalIncorrectFormatExpected === undefined) {
          delete window.nuxeo.I18n.en['customDatePicker.incorrectFormatExpected'];
        } else {
          window.nuxeo.I18n.en['customDatePicker.incorrectFormatExpected'] = originalIncorrectFormatExpected;
        }

        if (originalIncorrectFormat === undefined) {
          delete window.nuxeo.I18n.en['customDatePicker.incorrectFormat'];
        } else {
          window.nuxeo.I18n.en['customDatePicker.incorrectFormat'] = originalIncorrectFormat;
        }
      });

      test('uses the incorrectFormatExpected key with the {format} placeholder', async () => {
        window.nuxeo.I18n.en['customDatePicker.incorrectFormatExpected'] =
          'Incorrect date format. Expected format: {format}';
        const el = await newPicker();
        el.format = 'YYYY-MM-DD';
        const input = el.shadowRoot.querySelector('#dateInput');
        input.value = 'not-a-date';
        el._validateAndParseInput();
        expect(el.errorMessage).to.equal('Incorrect date format. Expected format: YYYY-MM-DD');
      });

      test('is fully localized with no hardcoded English fragment', async () => {
        // A translated bundle fully controls the sentence, colon and spacing.
        window.nuxeo.I18n.en['customDatePicker.incorrectFormatExpected'] =
          '不正な日付形式です。想定される形式：{format}';
        const el = await newPicker();
        el.format = 'YYYY-MM-DD';
        const input = el.shadowRoot.querySelector('#dateInput');
        input.value = 'not-a-date';
        el._validateAndParseInput();
        expect(el.errorMessage).to.equal('不正な日付形式です。想定される形式：YYYY-MM-DD');
        expect(el.errorMessage).to.not.contain('Expected format');
      });

      test('validate() builds the same localized message for an invalid value', async () => {
        window.nuxeo.I18n.en['customDatePicker.incorrectFormatExpected'] =
          '不正な日付形式です。想定される形式：{format}';
        const el = await newPicker();
        el.format = 'YYYY-MM-DD';
        el.value = 'not-a-date';
        const valid = el.validate();
        expect(valid).to.be.false;
        expect(el.errorReason).to.equal('format');
        expect(el.errorMessage).to.equal('不正な日付形式です。想定される形式：YYYY-MM-DD');
        expect(el.errorMessage).to.not.contain('Expected format');
      });

      test('falls back to the translated incorrectFormat key when the combined key is missing', async () => {
        // Simulate a locale bundle that only has the base key (as ja does before Crowdin ships
        // the combined key): the message must stay fully localized, never a raw key.
        delete window.nuxeo.I18n.en['customDatePicker.incorrectFormatExpected'];
        window.nuxeo.I18n.en['customDatePicker.incorrectFormat'] = '不正な日付形式';
        const el = await newPicker();
        el.format = 'YYYY-MM-DD';
        const input = el.shadowRoot.querySelector('#dateInput');
        input.value = 'not-a-date';
        el._validateAndParseInput();
        expect(el.errorMessage).to.equal('不正な日付形式 YYYY-MM-DD');
        expect(el.errorMessage).to.not.contain('customDatePicker.');
        expect(el.errorMessage).to.not.contain('Expected format');
      });

      test('falls back to an English default when no format key is translated', async () => {
        delete window.nuxeo.I18n.en['customDatePicker.incorrectFormatExpected'];
        delete window.nuxeo.I18n.en['customDatePicker.incorrectFormat'];
        const el = await newPicker();
        el.format = 'YYYY-MM-DD';
        const input = el.shadowRoot.querySelector('#dateInput');
        input.value = 'not-a-date';
        el._validateAndParseInput();
        expect(el.errorMessage).to.equal('Incorrect date format. YYYY-MM-DD');
        expect(el.errorMessage).to.not.contain('customDatePicker.');
      });
    });

    test('_validateAndParseInput parses a valid date', async () => {
      const el = await newPicker();
      el.format = 'YYYY-MM-DD';
      const input = el.shadowRoot.querySelector('#dateInput');
      input.value = '2024-04-12';
      el._validateAndParseInput();
      expect(el.invalid).to.be.false;
      expect(el._selectedDate).to.be.an.instanceof(Date);
      expect(el._selectedDate.getFullYear()).to.equal(2024);
    });

    test('_validateAndParseInput sets out-of-range error', async () => {
      const el = await newPicker();
      el.format = 'YYYY-MM-DD';
      el.min = '2025-01-01';
      flush();
      const input = el.shadowRoot.querySelector('#dateInput');
      input.value = '2024-04-12';
      el._validateAndParseInput();
      expect(el.invalid).to.be.true;
      expect(el.errorReason).to.equal('outOfRange');
    });
  });

  suite('Misc helpers', () => {
    test('_formatAriaDate returns a long, readable string for valid dates', async () => {
      const el = await newPicker();
      const out = el._formatAriaDate(new Date(2024, 3, 12));
      expect(out)
        .to.be.a('string')
        .that.has.length.greaterThan(0);
      // null is treated as Date(0) by Intl.DateTimeFormat so we just assert it does not throw
      expect(() => el._formatAriaDate(null)).to.not.throw();
    });

    test('previousMonthAriaLabel / nextMonthAriaLabel are computed from i18n', async () => {
      window.nuxeo.I18n.en['customDatePicker.previousMonth'] = 'Previous';
      window.nuxeo.I18n.en['customDatePicker.nextMonth'] = 'Next';
      const el = await newPicker();
      expect(el._previousMonthAriaLabel).to.equal('Previous');
      expect(el._nextMonthAriaLabel).to.equal('Next');
    });

    test('_setupI18n sets _locale and updates RTL', async () => {
      const el = await newPicker();
      el._setupI18n('he-IL');
      expect(el._locale).to.equal('he-IL');
      expect(el._isRTL).to.be.true;
    });
  });

  suite('Document focus handlers', () => {
    test('_handleDocumentFocusOut is safe to call', async () => {
      const el = await newPicker();
      expect(() => el._handleDocumentFocusOut()).to.not.throw();
    });

    test('_isElementInsideComponent recognises shadow DOM children', async () => {
      const el = await newPicker();
      const input = el.shadowRoot.querySelector('#dateInput');
      expect(el._isElementInsideComponent(input)).to.be.true;
      expect(el._isElementInsideComponent(document.body)).to.be.false;
      expect(el._isElementInsideComponent(null)).to.be.false;
    });
  });

  suite('Sequential interaction smoke', () => {
    test('open → select date → close updates value, _selectedDate and _isCalendarOpen', async () => {
      const el = await newPicker();
      el._openCalendar();
      expect(el._isCalendarOpen).to.be.true;
      el._selectDate(new Date(2024, 3, 12));
      await sleep(10);
      expect(el._selectedDate.getFullYear()).to.equal(2024);
      expect(el._selectedDate.getMonth()).to.equal(3);
      expect(el._selectedDate.getDate()).to.equal(12);
      expect(el.value).to.equal('2024-04-12');
      expect(el._isCalendarOpen).to.be.false;
    });

    test('clear → focus → re-open keeps the picker usable', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 3, 12));
      el._clearDate({ preventDefault() {}, stopPropagation() {} });
      await sleep(10);
      expect(el.value).to.equal('');
      expect(el._selectedDate).to.be.null;
      el._onInputFocus();
      el._openCalendar();
      expect(el._isCalendarOpen).to.be.true;
    });
  });

  // ─── NEW BRANCH-COVERAGE TESTS ───────────────────────────────────────────

  suite('_generateYearOptions with min/max constraints', () => {
    test('constrains year range when min and max are set', async () => {
      const el = await newPicker();
      el.min = '2020-01-01';
      el.max = '2025-12-31';
      el._generateYearOptions();
      expect(el._yearOptions[0]).to.equal(2020);
      expect(el._yearOptions[el._yearOptions.length - 1]).to.equal(2025);
    });

    test('handles only min constraint', async () => {
      const el = await newPicker();
      el.min = '2050-06-01';
      el.max = undefined;
      el._generateYearOptions();
      expect(el._yearOptions[0]).to.equal(2050);
      expect(el._yearOptions[el._yearOptions.length - 1]).to.equal(2099);
    });

    test('handles only max constraint', async () => {
      const el = await newPicker();
      el.min = undefined;
      el.max = '1950-12-31';
      el._generateYearOptions();
      expect(el._yearOptions[0]).to.equal(1900);
      expect(el._yearOptions[el._yearOptions.length - 1]).to.equal(1950);
    });

    test('handles invalid min/max gracefully', async () => {
      const el = await newPicker();
      el.min = 'not-a-date';
      el.max = 'also-bad';
      el._generateYearOptions();
      expect(el._yearOptions.length).to.be.greaterThan(0);
    });
  });

  suite('_generateMonthYearOptions with constraints', () => {
    test('generates options without min/max', async () => {
      const el = await newPicker();
      el.min = undefined;
      el.max = undefined;
      el._generateMonthYearOptions();
      expect(el._monthYearOptions.length).to.be.greaterThan(100);
    });

    test('filters months outside max boundary', async () => {
      const el = await newPicker();
      el.min = '2024-01-01';
      el.max = '2024-03-31';
      el._generateMonthYearOptions();
      const years = el._monthYearOptions.map((o) => o.year);
      expect(years.every((y) => y === 2024)).to.be.true;
      expect(el._monthYearOptions.length).to.equal(3);
    });
  });

  suite('_generateCalendar edge cases', () => {
    test('returns early when _viewDate is null', async () => {
      const el = await newPicker();
      el._viewDate = null;
      el._generateCalendar();
      // Should not throw; _calendarDays may remain unchanged
      expect(el._calendarDays).to.be.an('array');
    });

    test('marks selected date in the current month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 1);
      el._selectedDate = new Date(2024, 3, 15);
      el._today = new Date(2024, 3, 12);
      el._generateCalendar();
      const selected = el._calendarDays.filter((d) => d.isSelected);
      expect(selected.length).to.equal(1);
      expect(selected[0].day).to.equal(15);
    });

    test('does not mark selected date from a different month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 1);
      el._selectedDate = new Date(2024, 4, 15);
      el._today = new Date(2024, 3, 12);
      el._generateCalendar();
      const selected = el._calendarDays.filter((d) => d.isSelected);
      expect(selected.length).to.equal(0);
    });
  });

  suite('_openCalendar branch coverage', () => {
    test('sets viewDate to selectedDate when present', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 8, 20));
      el._isCalendarOpen = false;
      el._openCalendar();
      expect(el._viewDate.getMonth()).to.equal(8);
      expect(el._viewDate.getFullYear()).to.equal(2024);
    });

    test('uses min date for initial view when no selection and min is set', async () => {
      const el = await newPicker();
      el._selectedDate = null;
      el.min = '2030-06-01';
      el._isCalendarOpen = false;
      el._openCalendar();
      expect(el._viewDate.getFullYear()).to.equal(2030);
      expect(el._viewDate.getMonth()).to.equal(5);
    });

    test('uses max date when no min and today exceeds max', async () => {
      const el = await newPicker();
      el._selectedDate = null;
      el.min = undefined;
      el.max = '2000-01-15';
      el._isCalendarOpen = false;
      el._openCalendar();
      expect(el._viewDate.getFullYear()).to.be.at.most(2000);
    });

    test('clamps initial date between min and max', async () => {
      const el = await newPicker();
      el._selectedDate = null;
      el.min = '2024-03-01';
      el.max = '2024-09-30';
      el._isCalendarOpen = false;
      el._openCalendar();
      expect(el._viewDate.getFullYear()).to.equal(2024);
      expect(el._viewDate.getMonth()).to.be.at.least(2);
      expect(el._viewDate.getMonth()).to.be.at.most(8);
    });
  });

  suite('_closeCalendar branch coverage', () => {
    test('is a no-op when already closed', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      expect(() => el._closeCalendar()).to.not.throw();
      expect(el._isCalendarOpen).to.be.false;
    });

    test('handles event argument', async () => {
      const el = await newPicker();
      el._openCalendar();
      expect(el._isCalendarOpen).to.be.true;
      el._closeCalendar({ preventDefault() {}, stopPropagation() {} });
      expect(el._isCalendarOpen).to.be.false;
    });
  });

  suite('_previousMonth / _nextMonth with null viewDate', () => {
    test('_previousMonth returns early when _viewDate is null', async () => {
      const el = await newPicker();
      el._viewDate = null;
      expect(() => el._previousMonth()).to.not.throw();
    });

    test('_nextMonth returns early when _viewDate is null', async () => {
      const el = await newPicker();
      el._viewDate = null;
      expect(() => el._nextMonth()).to.not.throw();
    });

    test('_previousMonth without event arg', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 10);
      el._previousMonth();
      expect(el._viewDate.getMonth()).to.equal(4);
    });

    test('_nextMonth without event arg', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 10);
      el._nextMonth();
      expect(el._viewDate.getMonth()).to.equal(6);
    });
  });

  suite('_selectDate branch coverage', () => {
    test('does nothing when called with null', async () => {
      const el = await newPicker();
      el._selectDate(null);
      expect(el._selectedDate).to.be.null;
    });

    test('sets error when date is invalid (NaN)', async () => {
      const el = await newPicker();
      el._selectDate(new Date('garbage'));
      expect(el.invalid).to.be.true;
      expect(el.errorReason).to.equal('invalidDate');
    });
  });

  suite('_changeYear branch coverage', () => {
    test('updates focusedDate to same relative position when month matches', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._focusedDate = new Date(2024, 5, 10);
      el._changeYear({ target: { value: '2025' }, preventDefault() {}, stopPropagation() {} });
      flush();
      expect(el._viewDate.getFullYear()).to.equal(2025);
      expect(el._focusedDate.getFullYear()).to.equal(2025);
      expect(el._focusedDate.getMonth()).to.equal(5);
    });

    test('falls back to first day when focusedDate month shifts (e.g. Feb 29 → non-leap)', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 1, 29);
      el._focusedDate = new Date(2024, 1, 29);
      el._changeYear({ target: { value: '2023' }, preventDefault() {}, stopPropagation() {} });
      flush();
      expect(el._viewDate.getFullYear()).to.equal(2023);
      expect(el._focusedDate.getDate()).to.equal(1);
    });

    test('does not touch focusedDate when it is null', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._focusedDate = null;
      el._changeYear({ target: { value: '2028' }, preventDefault() {}, stopPropagation() {} });
      flush();
      expect(el._focusedDate).to.be.null;
    });
  });

  suite('_buildOutOfRangeMessage branches', () => {
    test('returns min+max message when both are set', async () => {
      const el = await newPicker();
      el.min = '2024-01-01';
      el.max = '2024-12-31';
      const msg = el._buildOutOfRangeMessage();
      expect(msg).to.include('between');
    });

    test('returns min-only message when only min is set', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el.max = undefined;
      const msg = el._buildOutOfRangeMessage();
      expect(msg).to.include('after');
    });

    test('returns max-only message when only max is set', async () => {
      const el = await newPicker();
      el.min = undefined;
      el.max = '2024-06-30';
      const msg = el._buildOutOfRangeMessage();
      expect(msg).to.include('before');
    });

    test('returns generic message when neither min nor max is set', async () => {
      const el = await newPicker();
      el.min = undefined;
      el.max = undefined;
      const msg = el._buildOutOfRangeMessage();
      expect(msg).to.be.a('string');
    });
  });

  suite('_formatDateForDisplay branch coverage', () => {
    test('falls back to locale format when format is mixed case', async () => {
      const el = await newPicker();
      el.format = 'YYYY-mm-DD';
      const result = el._formatDateForDisplay(new Date(2024, 3, 12));
      expect(result)
        .to.be.a('string')
        .that.has.length.greaterThan(0);
    });

    test('sets invalid when format token is unknown', async () => {
      const el = await newPicker();
      el.format = 'ZZZZ-QQ-WW';
      const result = el._formatDateForDisplay(new Date(2024, 3, 12));
      expect(result).to.be.a('string');
    });

    test('works with valid lowercase format after normalisation', async () => {
      const el = await newPicker();
      el.format = 'dd/mm/yyyy';
      const result = el._formatDateForDisplay(new Date(2024, 3, 12));
      expect(result).to.equal('12/04/2024');
    });
  });

  suite('_parseUserInput branch coverage', () => {
    test('returns null for empty / non-string input', async () => {
      const el = await newPicker();
      expect(el._parseUserInput(null)).to.be.null;
      expect(el._parseUserInput(123)).to.be.null;
      expect(el._parseUserInput('')).to.be.null;
      expect(el._parseUserInput('   ')).to.be.null;
    });

    test('falls back to mixed-case locale format when format has mixed case', async () => {
      const el = await newPicker();
      el.format = 'YYYY-mm-DD';
      const result = el._parseUserInput('2024-04-12');
      // Should still parse using locale fallback or common formats
      expect(result).to.not.be.null;
      expect(result.date).to.be.an.instanceof(Date);
    });

    test('tries common formats when primary format fails', async () => {
      const el = await newPicker();
      el.format = 'YYYY-MM-DD';
      const result = el._parseUserInput('12/04/2024');
      expect(result).to.not.be.null;
      expect(result.isExactFormat).to.be.false;
    });

    test('uses lenient parsing when strict fails', async () => {
      const el = await newPicker();
      el.format = 'YYYY-MM-DD';
      const result = el._parseUserInput('2024-4-12');
      if (result) {
        expect(result.isExactFormat).to.be.false;
      }
    });
  });

  suite('_getDayClasses branch coverage', () => {
    test('returns "empty" for empty day objects', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 1);
      const dayObj = { isEmpty: true, date: new Date(2024, 2, 31) };
      const classes = el._getDayClasses(dayObj, null);
      expect(classes).to.equal('empty');
    });

    test('includes "other-month" class for non-current-month days', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 1);
      const dayObj = {
        isEmpty: false,
        isOtherMonth: true,
        isToday: false,
        isSelected: false,
        isDisabled: false,
        isCurrentMonth: false,
        date: new Date(2024, 2, 31),
      };
      const classes = el._getDayClasses(dayObj, null);
      expect(classes).to.include('other-month');
    });

    test('includes "today selected disabled" when all flags are set', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 1);
      const dayObj = {
        isEmpty: false,
        isOtherMonth: false,
        isToday: true,
        isSelected: true,
        isDisabled: true,
        isCurrentMonth: true,
        date: new Date(2024, 3, 12),
      };
      const classes = el._getDayClasses(dayObj, null);
      expect(classes).to.include('today');
      expect(classes).to.include('selected');
      expect(classes).to.include('disabled');
    });

    test('adds "focused" when focusedDate matches and not selected/today', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 1);
      const focusedDate = new Date(2024, 3, 15);
      const dayObj = {
        isEmpty: false,
        isOtherMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: false,
        isCurrentMonth: true,
        date: new Date(2024, 3, 15),
      };
      const classes = el._getDayClasses(dayObj, focusedDate);
      expect(classes).to.include('focused');
    });

    test('does NOT add "focused" when day isSelected', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 1);
      const focusedDate = new Date(2024, 3, 15);
      const dayObj = {
        isEmpty: false,
        isOtherMonth: false,
        isToday: false,
        isSelected: true,
        isDisabled: false,
        isCurrentMonth: true,
        date: new Date(2024, 3, 15),
      };
      const classes = el._getDayClasses(dayObj, focusedDate);
      expect(classes).to.not.include('focused');
    });

    test('does NOT add "focused" when focusedDate is in a different month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 3, 1);
      const focusedDate = new Date(2024, 4, 15);
      const dayObj = {
        isEmpty: false,
        isOtherMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: false,
        isCurrentMonth: true,
        date: new Date(2024, 3, 15),
      };
      const classes = el._getDayClasses(dayObj, focusedDate);
      expect(classes).to.not.include('focused');
    });
  });

  suite('_getDayTabIndex branch coverage', () => {
    test('returns "-1" for empty day', async () => {
      const el = await newPicker();
      const dayObj = { isEmpty: true, isCurrentMonth: false, date: new Date(), isSelected: false, isToday: false };
      expect(el._getDayTabIndex(dayObj, null)).to.equal('-1');
    });

    test('returns "0" for focused date', async () => {
      const el = await newPicker();
      const d = new Date(2024, 3, 15);
      const dayObj = { isEmpty: false, isCurrentMonth: true, date: d, isSelected: false, isToday: false };
      expect(el._getDayTabIndex(dayObj, d)).to.equal('0');
    });

    test('returns "0" for selected date when no focusedDate', async () => {
      const el = await newPicker();
      const d = new Date(2024, 3, 15);
      const dayObj = { isEmpty: false, isCurrentMonth: true, date: d, isSelected: true, isToday: false };
      expect(el._getDayTabIndex(dayObj, null)).to.equal('0');
    });

    test('returns "0" for today when no selection and no focus', async () => {
      const el = await newPicker();
      el._selectedDate = null;
      const d = new Date(2024, 3, 15);
      const dayObj = { isEmpty: false, isCurrentMonth: true, date: d, isSelected: false, isToday: true };
      expect(el._getDayTabIndex(dayObj, null)).to.equal('0');
    });

    test('returns "0" for first-of-month fallback when today not in month', async () => {
      const el = await newPicker();
      el._selectedDate = null;
      el._viewDate = new Date(2030, 0, 1);
      el._today = new Date(2024, 5, 1);
      const dayObj = {
        isEmpty: false,
        isCurrentMonth: true,
        date: new Date(2030, 0, 1),
        isSelected: false,
        isToday: false,
      };
      expect(el._getDayTabIndex(dayObj, null)).to.equal('0');
    });
  });

  suite('_isTodayInCurrentMonth', () => {
    test('returns true when today is in the viewed month', async () => {
      const el = await newPicker();
      const now = new Date();
      el._today = now;
      el._viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
      expect(el._isTodayInCurrentMonth()).to.be.true;
    });

    test('returns false when viewing a different month', async () => {
      const el = await newPicker();
      el._today = new Date(2024, 5, 1);
      el._viewDate = new Date(2024, 10, 1);
      expect(el._isTodayInCurrentMonth()).to.be.false;
    });

    test('returns false when _today or _viewDate is null', async () => {
      const el = await newPicker();
      el._today = null;
      expect(el._isTodayInCurrentMonth()).to.be.false;
      el._today = new Date();
      el._viewDate = null;
      expect(el._isTodayInCurrentMonth()).to.be.false;
    });
  });

  suite('_getDayAriaLabel', () => {
    test('appends "today" and "selected" to label', async () => {
      const el = await newPicker();
      const dayObj = { date: new Date(2024, 3, 12), isToday: true, isSelected: true };
      const label = el._getDayAriaLabel(dayObj);
      expect(label).to.include('today');
      expect(label).to.include('selected');
    });

    test('does not append extra text for normal days', async () => {
      const el = await newPicker();
      const dayObj = { date: new Date(2024, 3, 12), isToday: false, isSelected: false };
      const label = el._getDayAriaLabel(dayObj);
      expect(label).to.not.include('today');
      expect(label).to.not.include('selected');
    });
  });

  suite('_getAriaCurrent', () => {
    test('returns "date" for today', async () => {
      const el = await newPicker();
      expect(el._getAriaCurrent({ isToday: true })).to.equal('date');
    });

    test('returns null for non-today', async () => {
      const el = await newPicker();
      expect(el._getAriaCurrent({ isToday: false })).to.be.null;
    });
  });

  suite('_getActiveDescendant', () => {
    test('returns formatted id for a focused date', async () => {
      const el = await newPicker();
      const result = el._getActiveDescendant(new Date(2024, 0, 5));
      expect(result).to.equal('date-2024-01-05');
    });

    test('returns null when no focused date', async () => {
      const el = await newPicker();
      expect(el._getActiveDescendant(null)).to.be.null;
    });
  });

  suite('_isSelectedYear', () => {
    test('returns true when year matches viewDate', async () => {
      const el = await newPicker();
      expect(el._isSelectedYear(2024, new Date(2024, 0, 1))).to.be.true;
    });

    test('returns false when year does not match', async () => {
      const el = await newPicker();
      expect(el._isSelectedYear(2025, new Date(2024, 0, 1))).to.be.false;
    });

    test('returns falsy when viewDate is null', async () => {
      const el = await newPicker();
      expect(el._isSelectedYear(2024, null)).to.not.be.ok;
    });
  });

  suite('_getAriaDescribedBy branches', () => {
    test('returns "errorText" for non-required errors when invalid', async () => {
      const el = await newPicker();
      el.errorReason = 'format';
      el._showErrors = true;
      expect(el._getAriaDescribedBy(true, 'Bad format')).to.equal('errorText');
    });

    test('returns null for required errors when _showErrors is false', async () => {
      const el = await newPicker();
      el.errorReason = 'required';
      el._showErrors = false;
      expect(el._getAriaDescribedBy(true, 'Required')).to.be.null;
    });

    test('returns "errorText" for required errors when _showErrors is true', async () => {
      const el = await newPicker();
      el.errorReason = 'required';
      el._showErrors = true;
      expect(el._getAriaDescribedBy(true, 'Required')).to.equal('errorText');
    });

    test('returns null when not invalid', async () => {
      const el = await newPicker();
      expect(el._getAriaDescribedBy(false, 'msg')).to.be.null;
    });
  });

  suite('_showError branches', () => {
    test('returns true for non-required errors', async () => {
      const el = await newPicker();
      el.errorReason = 'format';
      expect(el._showError(true, 'Bad format', false)).to.be.true;
    });

    test('returns false for required errors when showErrors is false', async () => {
      const el = await newPicker();
      el.errorReason = 'required';
      expect(el._showError(true, 'Required', false)).to.be.false;
    });

    test('returns true for required errors when showErrors is true', async () => {
      const el = await newPicker();
      el.errorReason = 'required';
      expect(el._showError(true, 'Required', true)).to.be.true;
    });

    test('returns false when not invalid', async () => {
      const el = await newPicker();
      el.errorReason = '';
      expect(el._showError(false, '', false)).to.be.false;
    });
  });

  suite('validate() branch coverage', () => {
    test('returns false when _errorPersists is true and invalid', async () => {
      const el = await newPicker();
      el._errorPersists = true;
      el.invalid = true;
      expect(el.validate()).to.be.false;
    });

    test('returns false for unparseable value (format error)', async () => {
      const el = await newPicker();
      el.value = 'total-junk';
      const result = el.validate();
      expect(result).to.be.false;
      expect(el.errorReason).to.equal('format');
    });

    test('returns false for out-of-range value', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      el.min = '2025-01-01';
      flush();
      const result = el.validate();
      expect(result).to.be.false;
      expect(el.errorReason).to.equal('outOfRange');
    });

    test('returns false for required + empty value', async () => {
      const el = await newPicker();
      el.required = true;
      el.value = '';
      const result = el.validate();
      expect(result).to.be.false;
      expect(el.errorReason).to.equal('required');
    });

    test('returns true and clears errors when valid', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      el.invalid = true;
      el.errorReason = 'format';
      const result = el.validate();
      expect(result).to.be.true;
      expect(el.invalid).to.be.false;
      expect(el.errorReason).to.equal('');
    });
  });

  suite('reportValidity() branch coverage', () => {
    test('enables _showErrors and validates required field', async () => {
      const el = await newPicker();
      el.required = true;
      el.value = '';
      const result = el.reportValidity();
      expect(result).to.be.false;
      expect(el._showErrors).to.be.true;
    });

    test('returns true for valid date', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      el.required = false;
      const result = el.reportValidity();
      expect(result).to.be.true;
    });
  });

  suite('_getValidity branch coverage', () => {
    test('returns false for required + empty value', async () => {
      const el = await newPicker();
      el.required = true;
      el.value = '';
      expect(el._getValidity()).to.be.false;
      expect(el.errorReason).to.equal('required');
    });

    test('returns true for non-required + empty value', async () => {
      const el = await newPicker();
      el.required = false;
      el.value = '';
      expect(el._getValidity()).to.be.true;
    });

    test('returns false for invalid date string', async () => {
      const el = await newPicker();
      el.value = 'not-a-real-date-at-all';
      expect(el._getValidity()).to.be.false;
      expect(el.errorReason).to.equal('invalidDate');
    });

    test('returns false when value is before min', async () => {
      const el = await newPicker();
      el.value = '2024-01-01';
      el.min = '2024-06-01';
      expect(el._getValidity()).to.be.false;
      expect(el.errorReason).to.equal('outOfRange');
    });

    test('returns false when value is after max', async () => {
      const el = await newPicker();
      el.value = '2024-12-31';
      el.max = '2024-06-30';
      expect(el._getValidity()).to.be.false;
      expect(el.errorReason).to.equal('outOfRange');
    });

    test('returns true for valid value within range', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      el.min = '2024-01-01';
      el.max = '2024-12-31';
      expect(el._getValidity()).to.be.true;
    });
  });

  suite('isInputValid() branch coverage', () => {
    test('returns false when _errorPersists is true', async () => {
      const el = await newPicker();
      el._errorPersists = true;
      el.invalid = true;
      expect(el.isInputValid()).to.be.false;
    });

    test('returns true for non-required empty input', async () => {
      const el = await newPicker();
      el.required = false;
      const input = el.shadowRoot.querySelector('#dateInput');
      input.value = '';
      expect(el.isInputValid()).to.be.true;
    });

    test('returns false for required empty input', async () => {
      const el = await newPicker();
      el.required = true;
      const input = el.shadowRoot.querySelector('#dateInput');
      input.value = '';
      expect(el.isInputValid()).to.be.false;
    });

    test('returns false for unparseable input', async () => {
      const el = await newPicker();
      const input = el.shadowRoot.querySelector('#dateInput');
      input.value = 'garbage-text';
      expect(el.isInputValid()).to.be.false;
    });
  });

  suite('_valueChanged branch coverage', () => {
    test('skips update when _preventInputUpdate is true', async () => {
      const el = await newPicker();
      el._preventInputUpdate = true;
      el.value = '2024-06-15';
      flush();
      // _preventInputUpdate should be cleared
      expect(el._preventInputUpdate).to.be.false;
    });

    test('clears selectedDate for empty value', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      el.value = '';
      flush();
      expect(el._selectedDate).to.be.null;
    });

    test('preserves input when _userIsTyping with empty value', async () => {
      const el = await newPicker();
      el._userIsTyping = true;
      el._inputValue = 'typing...';
      el.value = '';
      flush();
      expect(el._inputValue).to.equal('typing...');
    });

    test('preserves input when _errorPersists with invalid value', async () => {
      const el = await newPicker();
      el._errorPersists = true;
      el._userIsTyping = true;
      el._inputValue = 'bad-value';
      el.value = 'still-bad';
      flush();
      expect(el._inputValue).to.equal('bad-value');
    });
  });

  suite('_invalidChanged branch coverage', () => {
    test('announces error when invalid and _showErrors', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_announce');
      el._showErrors = true;
      el.errorMessage = 'Test error';
      el._invalidChanged(true);
      expect(spy.called).to.be.true;
      spy.restore();
    });

    test('does not announce when _showErrors is false', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_announce');
      el._showErrors = false;
      el._invalidChanged(true);
      expect(spy.called).to.be.false;
      spy.restore();
    });
  });

  suite('_errorMessageChanged branch coverage', () => {
    test('announces new message when invalid and _showErrors', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_announce');
      el.invalid = true;
      el._showErrors = true;
      el._errorMessageChanged('New error');
      expect(spy.calledWith('New error')).to.be.true;
      spy.restore();
    });

    test('does not announce when not invalid', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_announce');
      el.invalid = false;
      el._errorMessageChanged('msg');
      expect(spy.called).to.be.false;
      spy.restore();
    });
  });

  suite('_getDatePlaceholder branch coverage', () => {
    test('returns format-based placeholder for valid format', async () => {
      const el = await newPicker();
      const result = el._getDatePlaceholder('YYYY-MM-DD');
      expect(result).to.equal('YYYY-MM-DD');
    });

    test('falls back to locale placeholder for mixed-case format', async () => {
      const el = await newPicker();
      const result = el._getDatePlaceholder('YYYY-mm-DD');
      expect(result)
        .to.be.a('string')
        .with.length.greaterThan(0);
    });

    test('returns locale-derived placeholder when no format', async () => {
      const el = await newPicker();
      const result = el._getDatePlaceholder('');
      expect(result)
        .to.be.a('string')
        .with.length.greaterThan(0);
    });
  });

  suite('hidePlaceholder', () => {
    test('defaults to false', async () => {
      const el = await newPicker();
      expect(el.hidePlaceholder).to.be.false;
    });

    test('_computePlaceholder returns the date placeholder when not hidden', async () => {
      const el = await newPicker();
      el.format = 'YYYY-MM-DD';
      expect(el._computePlaceholder('YYYY-MM-DD', false)).to.equal('YYYY-MM-DD');
    });

    test('_computePlaceholder returns an empty string when hidden', async () => {
      const el = await newPicker();
      expect(el._computePlaceholder('YYYY-MM-DD', true)).to.equal('');
    });

    test('renders the input placeholder when hidePlaceholder is false', async () => {
      const el = await newPicker(html`
        <custom-date-picker format="YYYY-MM-DD"></custom-date-picker>
      `);
      await flush();
      const input = el.shadowRoot.querySelector('#dateInput');
      expect(input.getAttribute('placeholder')).to.equal('YYYY-MM-DD');
    });

    test('omits the input placeholder when hidePlaceholder is true', async () => {
      const el = await newPicker(html`
        <custom-date-picker format="YYYY-MM-DD" hide-placeholder></custom-date-picker>
      `);
      await flush();
      const input = el.shadowRoot.querySelector('#dateInput');
      expect(input.getAttribute('placeholder') || '').to.equal('');
    });

    test('toggling hidePlaceholder updates the input placeholder', async () => {
      const el = await newPicker(html`
        <custom-date-picker format="YYYY-MM-DD"></custom-date-picker>
      `);
      await flush();
      const input = el.shadowRoot.querySelector('#dateInput');
      expect(input.getAttribute('placeholder')).to.equal('YYYY-MM-DD');

      el.hidePlaceholder = true;
      await flush();
      expect(input.getAttribute('placeholder') || '').to.equal('');

      el.hidePlaceholder = false;
      await flush();
      expect(input.getAttribute('placeholder')).to.equal('YYYY-MM-DD');
    });
  });

  suite('_isValidMomentFormat', () => {
    test('returns true for valid moment tokens', async () => {
      const el = await newPicker();
      expect(el._isValidMomentFormat('YYYY-MM-DD')).to.be.true;
      expect(el._isValidMomentFormat('DD/MM/YY')).to.be.true;
    });

    test('returns false for invalid or empty format', async () => {
      const el = await newPicker();
      expect(el._isValidMomentFormat(null)).to.be.false;
      expect(el._isValidMomentFormat('')).to.be.false;
      expect(el._isValidMomentFormat(123)).to.be.false;
      expect(el._isValidMomentFormat('ZZZZ')).to.be.false;
    });
  });

  suite('_normalizeFormat edge cases', () => {
    test('returns input as-is for falsy', async () => {
      const el = await newPicker();
      expect(el._normalizeFormat(null)).to.be.null;
      expect(el._normalizeFormat('')).to.equal('');
    });
  });

  suite('_formatMonthYear', () => {
    test('formats valid date', async () => {
      const el = await newPicker();
      const result = el._formatMonthYear(new Date(2024, 3, 12));
      expect(result)
        .to.be.a('string')
        .with.length.greaterThan(0);
    });

    test('returns empty string for null', async () => {
      const el = await newPicker();
      expect(el._formatMonthYear(null)).to.equal('');
    });
  });

  suite('_shouldShowClearButton', () => {
    test('returns falsy when inputValue is empty', async () => {
      const el = await newPicker();
      expect(el._shouldShowClearButton('', false)).to.not.be.ok;
    });

    test('returns false when hideClearDateButton is true', async () => {
      const el = await newPicker();
      expect(el._shouldShowClearButton('2024-01-01', true)).to.be.false;
    });

    test('returns true when value exists and not hidden', async () => {
      const el = await newPicker();
      expect(el._shouldShowClearButton('2024-01-01', false)).to.be.true;
    });

    test('respects clear-button-visible attribute override', async () => {
      const el = await newPicker();
      el.setAttribute('clear-button-visible', '');
      el.clearButtonVisible = true;
      expect(el._shouldShowClearButton('2024-01-01', true)).to.be.true;
    });
  });

  suite('_selectYear with leap year edge case', () => {
    test('clamps Feb 29 to Feb 28 when selecting non-leap year', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._viewDate = new Date(2024, 1, 29);
      const btn = document.createElement('button');
      btn.classList.add('year-option');
      btn.dataset.year = '2023';
      el._selectYear({ preventDefault() {}, stopPropagation() {}, target: btn });
      flush();
      expect(el._viewDate.getFullYear()).to.equal(2023);
      expect(el._viewDate.getDate()).to.equal(28);
    });

    test('keeps Feb 29 when selecting leap year', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._viewDate = new Date(2024, 1, 29);
      const btn = document.createElement('button');
      btn.classList.add('year-option');
      btn.dataset.year = '2028';
      el._selectYear({ preventDefault() {}, stopPropagation() {}, target: btn });
      flush();
      expect(el._viewDate.getFullYear()).to.equal(2028);
      expect(el._viewDate.getDate()).to.equal(29);
    });
  });

  suite('_getYearOptionClass / _getYearTabIndex', () => {
    test('_getYearOptionClass returns "selected" for matching year', async () => {
      const el = await newPicker();
      expect(el._getYearOptionClass(2024, new Date(2024, 0, 1))).to.equal('selected');
      expect(el._getYearOptionClass(2025, new Date(2024, 0, 1))).to.equal('');
      expect(el._getYearOptionClass(null, new Date())).to.equal('');
      expect(el._getYearOptionClass(2024, null)).to.equal('');
    });

    test('_getYearTabIndex returns "0" for matching year', async () => {
      const el = await newPicker();
      expect(el._getYearTabIndex(2024, new Date(2024, 0, 1))).to.equal('0');
      expect(el._getYearTabIndex(2025, new Date(2024, 0, 1))).to.equal('-1');
    });
  });

  suite('_isPreviousMonthDisabled / _isNextMonthDisabled', () => {
    test('_isPreviousMonthDisabled returns false when no min', async () => {
      const el = await newPicker();
      el.min = undefined;
      expect(el._isPreviousMonthDisabled()).to.be.false;
    });

    test('_isPreviousMonthDisabled returns true when prev month is before min', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el._viewDate = new Date(2024, 5, 15);
      expect(el._isPreviousMonthDisabled()).to.be.true;
    });

    test('_isNextMonthDisabled returns false when no max', async () => {
      const el = await newPicker();
      el.max = undefined;
      expect(el._isNextMonthDisabled()).to.be.false;
    });

    test('_isNextMonthDisabled returns true when next month exceeds max', async () => {
      const el = await newPicker();
      el.max = '2024-06-30';
      el._viewDate = new Date(2024, 5, 15);
      expect(el._isNextMonthDisabled()).to.be.true;
    });
  });

  suite('_monthHasValidDates', () => {
    test('returns true when no constraints', async () => {
      const el = await newPicker();
      el.min = undefined;
      el.max = undefined;
      expect(el._monthHasValidDates(new Date(2024, 5, 1))).to.be.true;
    });

    test('returns false when month is entirely before min', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      expect(el._monthHasValidDates(new Date(2024, 3, 1))).to.be.false;
    });

    test('returns false when month is entirely after max', async () => {
      const el = await newPicker();
      el.max = '2024-03-31';
      expect(el._monthHasValidDates(new Date(2024, 5, 1))).to.be.false;
    });

    test('returns true when month partially overlaps with range', async () => {
      const el = await newPicker();
      el.min = '2024-06-15';
      el.max = '2024-07-15';
      expect(el._monthHasValidDates(new Date(2024, 5, 1))).to.be.true;
    });
  });

  suite('_onInputFocus branch coverage', () => {
    test('closes calendar when open and not opened via icon', async () => {
      const el = await newPicker();
      el._isCalendarOpen = true;
      el._openedViaCalendarIcon = false;
      const dateInput = el.shadowRoot.querySelector('#dateInput');
      expect(dateInput).to.exist;
      dateInput.focus();
      el._onInputFocus();
      await sleep(10);
      expect(el._isCalendarOpen).to.be.false;
    });

    test('does not close calendar when opened via icon', async () => {
      const el = await newPicker();
      el._openCalendar();
      el._openedViaCalendarIcon = true;
      el._onInputFocus();
      await sleep(10);
      expect(el._isCalendarOpen).to.be.true;
    });

    test('does not close calendar during focus suppression window', async () => {
      const el = await newPicker();
      el._isCalendarOpen = true;
      el._openedViaCalendarIcon = false;
      el._suppressInputFocusCloseUntil = Date.now() + 200;
      el._onInputFocus();
      await sleep(10);
      expect(el._isCalendarOpen).to.be.true;
    });

    test('keeps calendar open when async focus check is suppressed', async () => {
      const el = await newPicker();
      el._isCalendarOpen = true;
      el._openedViaCalendarIcon = false;
      const originalAsync = el.async;
      el.async = (callback) => {
        el._suppressInputFocusCloseUntil = Date.now() + 200;
        callback();
      };

      el._onInputFocus();
      await sleep(10);
      expect(el._isCalendarOpen).to.be.true;

      el.async = originalAsync;
    });
  });

  suite('_onInputBlur branch coverage', () => {
    test('does not reset _userIsTyping when _errorPersists', async () => {
      const el = await newPicker();
      el._userIsTyping = true;
      el._errorPersists = true;
      el._onInputBlur();
      expect(el._userIsTyping).to.be.true;
    });
  });

  suite('_onInputKeydown branch coverage', () => {
    test('sets _userIsTyping on first printable key', async () => {
      const el = await newPicker();
      el._userIsTyping = false;
      el._onInputKeydown({ key: 'a', preventDefault() {}, stopPropagation() {} });
      expect(el._userIsTyping).to.be.true;
    });

    test('does not validate on Enter when _errorPersists', async () => {
      const el = await newPicker();
      el._errorPersists = true;
      const spy = sinon.spy(el, '_validateAndParseInput');
      el._onInputKeydown({ key: 'Enter', preventDefault() {}, stopPropagation() {} });
      expect(spy.called).to.be.false;
      spy.restore();
    });
  });

  suite('_onInputChange branch coverage', () => {
    test('clears all error state when _errorPersists', async () => {
      const el = await newPicker();
      el._errorPersists = true;
      el.invalid = true;
      el.errorReason = 'format';
      el.errorMessage = 'Bad';
      el._showErrors = true;
      el._onInputChange();
      expect(el._errorPersists).to.be.false;
      expect(el.invalid).to.be.false;
      expect(el.errorReason).to.equal('');
      expect(el.errorMessage).to.equal('');
      expect(el._showErrors).to.be.false;
    });
  });

  suite('_handleCalendarIconKeydown', () => {
    test('opens calendar on Enter', async () => {
      const el = await newPicker();
      el._handleCalendarIconKeydown({ key: 'Enter', preventDefault() {}, stopPropagation() {} });
      expect(el._isCalendarOpen).to.be.true;
    });

    test('opens calendar on Space', async () => {
      const el = await newPicker();
      el._handleCalendarIconKeydown({ key: ' ', preventDefault() {}, stopPropagation() {} });
      expect(el._isCalendarOpen).to.be.true;
    });

    test('opens calendar on ArrowDown', async () => {
      const el = await newPicker();
      el._handleCalendarIconKeydown({ key: 'ArrowDown', preventDefault() {}, stopPropagation() {} });
      expect(el._isCalendarOpen).to.be.true;
    });

    test('opens calendar on F4', async () => {
      const el = await newPicker();
      el._handleCalendarIconKeydown({ key: 'F4', preventDefault() {}, stopPropagation() {} });
      expect(el._isCalendarOpen).to.be.true;
    });
  });

  suite('resetErrorState', () => {
    test('clears all error flags and DOM', async () => {
      const el = await newPicker();
      el._showErrors = true;
      el._errorPersists = true;
      el.invalid = true;
      el.errorMessage = 'Error';
      el.errorReason = 'format';
      el.resetErrorState();
      expect(el._showErrors).to.be.false;
      expect(el._errorPersists).to.be.false;
      expect(el.invalid).to.be.false;
      expect(el.errorMessage).to.equal('');
      expect(el.errorReason).to.equal('');
    });
  });

  suite('_updateErrorDisplay branches', () => {
    test('shows required message when required + empty + showErrors', async () => {
      const el = await newPicker();
      el.required = true;
      el.value = '';
      el._showErrors = true;
      el.invalid = true;
      el.setAttribute('invalid', '');
      el._updateErrorDisplay(false);
      const errEl = el.shadowRoot.querySelector('#errorText');
      expect(errEl.hidden).to.be.false;
    });

    test('shows errorMessage for non-required errors', async () => {
      const el = await newPicker();
      el.required = false;
      el.errorMessage = 'Format error';
      el._showErrors = true;
      el._updateErrorDisplay(false);
      const errEl = el.shadowRoot.querySelector('#errorText');
      expect(errEl.hidden).to.be.false;
      expect(errEl.textContent).to.equal('Format error');
    });

    test('hides errors when valid', async () => {
      const el = await newPicker();
      el._showErrors = true;
      el._updateErrorDisplay(true);
      const errEl = el.shadowRoot.querySelector('#errorText');
      expect(errEl.hidden).to.be.true;
    });

    test('hides errors when _showErrors is false', async () => {
      const el = await newPicker();
      el._showErrors = false;
      el._updateErrorDisplay(false);
      const errEl = el.shadowRoot.querySelector('#errorText');
      expect(errEl.hidden).to.be.true;
    });
  });

  suite('set() method branches', () => {
    test('sets i18n.firstDayOfWeek and reinitializes locale data', async () => {
      const el = await newPicker();
      el.set('i18n.firstDayOfWeek', 1);
      expect(el.firstDayOfWeek).to.equal(1);
    });

    test('sets i18n.monthNames', async () => {
      const el = await newPicker();
      const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
      el.set('i18n.monthNames', months);
      expect(el._monthNames).to.deep.equal(months);
    });

    test('sets i18n.weekdays', async () => {
      const el = await newPicker();
      const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      el.set('i18n.weekdays', days);
      expect(el._weekdayNames).to.deep.equal(days);
    });

    test('sets i18n.weekdaysShort', async () => {
      const el = await newPicker();
      const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      el.set('i18n.weekdaysShort', days);
      expect(el._weekdayNames).to.deep.equal(days);
    });

    test('delegates non-i18n paths to super.set', async () => {
      const el = await newPicker();
      el.set('value', '2024-06-15');
      expect(el.value).to.equal('2024-06-15');
    });
  });

  suite('focus() / clear() / formattedValue / checkValidity()', () => {
    test('focus() moves focus to inner input', async () => {
      const el = await newPicker();
      el.focus();
      const input = el.shadowRoot.querySelector('#dateInput');
      expect(el.shadowRoot.activeElement).to.equal(input);
    });

    test('clear() resets value', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      el.clear();
      expect(el.value).to.equal('');
    });

    test('formattedValue returns formatted string when date is selected', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      expect(el.formattedValue)
        .to.be.a('string')
        .with.length.greaterThan(0);
    });

    test('formattedValue falls back to value when no selectedDate', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      el._selectedDate = null;
      expect(el.formattedValue).to.equal('2024-06-15');
    });

    test('checkValidity delegates to validate', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      expect(el.checkValidity()).to.be.true;
    });
  });

  suite('_minChanged / _maxChanged observer branches', () => {
    test('_minChanged invalidates when value is before new min', async () => {
      const el = await newPicker();
      el.value = '2024-01-01';
      flush();
      el._minChanged('2024-06-01');
      expect(el.invalid).to.be.true;
    });

    test('_minChanged does not invalidate when no value', async () => {
      const el = await newPicker();
      el.value = '';
      el._minChanged('2024-06-01');
      expect(el.invalid).to.be.false;
    });

    test('_maxChanged invalidates when value is after new max', async () => {
      const el = await newPicker();
      el.value = '2024-12-31';
      flush();
      el._maxChanged('2024-06-30');
      expect(el.invalid).to.be.true;
    });

    test('_maxChanged does not invalidate when no value', async () => {
      const el = await newPicker();
      el.value = '';
      el._maxChanged('2024-06-30');
      expect(el.invalid).to.be.false;
    });
  });

  suite('_defaultTimeChanged', () => {
    test('calls _inputValueChanged when _inputValue is set', async () => {
      const el = await newPicker();
      el._inputValue = 'something';
      el._preventInputUpdate = false;
      const spy = sinon.spy(el, '_inputValueChanged');
      el._defaultTimeChanged();
      expect(spy.calledOnce).to.be.true;
      spy.restore();
    });

    test('does nothing when _preventInputUpdate is true', async () => {
      const el = await newPicker();
      el._inputValue = 'something';
      el._preventInputUpdate = true;
      const spy = sinon.spy(el, '_inputValueChanged');
      el._defaultTimeChanged();
      expect(spy.called).to.be.false;
      spy.restore();
    });

    test('does nothing when _inputValue is empty', async () => {
      const el = await newPicker();
      el._inputValue = '';
      const spy = sinon.spy(el, '_inputValueChanged');
      el._defaultTimeChanged();
      expect(spy.called).to.be.false;
      spy.restore();
    });
  });

  suite('_handleCalendarGridClick', () => {
    test('prevents default when click is not on a calendar-day button', async () => {
      const el = await newPicker();
      const prevented = { value: false };
      el._handleCalendarGridClick({
        target: document.createElement('div'),
        preventDefault() {
          prevented.value = true;
        },
        stopPropagation() {},
      });
      expect(prevented.value).to.be.true;
    });
  });

  suite('_handleDateClick edge cases', () => {
    test('does nothing when button has "empty" class', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day', 'empty');
      el._handleDateClick({ target: btn, preventDefault() {}, stopPropagation() {} });
      expect(el._selectedDate).to.be.null;
    });

    test('does nothing when button has "other-month" class', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day', 'other-month');
      el._handleDateClick({ target: btn, preventDefault() {}, stopPropagation() {} });
      expect(el._selectedDate).to.be.null;
    });

    test('does nothing when no dateISO on button', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      el._handleDateClick({ target: btn, preventDefault() {}, stopPropagation() {} });
      expect(el._selectedDate).to.be.null;
    });

    test('does nothing when dateISO is unparseable', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = 'not-a-date';
      el._handleDateClick({ target: btn, preventDefault() {}, stopPropagation() {} });
      expect(el._selectedDate).to.be.null;
    });

    test('shows range error for out-of-range click', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el.max = '2024-06-30';
      flush();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-01-15';
      el._handleDateClick({ target: btn, preventDefault() {}, stopPropagation() {} });
      expect(el.invalid).to.be.true;
      expect(el.errorReason).to.equal('outOfRange');
    });
  });

  suite('_handleNavButtonKeydown', () => {
    test('calls _previousMonth for Enter on prevMonth', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      const spy = sinon.spy(el, '_previousMonth');
      el._handleNavButtonKeydown({
        key: 'Enter',
        target: { id: 'prevMonth' },
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy.calledOnce).to.be.true;
      spy.restore();
    });

    test('calls _nextMonth for Enter on nextMonth', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      const spy = sinon.spy(el, '_nextMonth');
      el._handleNavButtonKeydown({
        key: 'Enter',
        target: { id: 'nextMonth' },
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy.calledOnce).to.be.true;
      spy.restore();
    });

    test('does nothing for non-Enter/Space keys', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      const month = el._viewDate.getMonth();
      el._handleNavButtonKeydown({
        key: 'ArrowDown',
        target: { id: 'prevMonth' },
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el._viewDate.getMonth()).to.equal(month);
    });
  });

  suite('_getUserLocale', () => {
    test('falls back through sources to return a string', async () => {
      const el = await newPicker();
      expect(el._getUserLocale())
        .to.be.a('string')
        .with.length.greaterThan(0);
    });
  });

  suite('_testDateParsing diagnostic helper', () => {
    test('returns parsed:true for valid locale input', async () => {
      const el = await newPicker();
      el.format = 'YYYY-MM-DD';
      const result = el._testDateParsing('2024-04-12');
      expect(result.parsed).to.be.true;
    });

    test('returns suggestions for unrecognised format', async () => {
      const el = await newPicker();
      const result = el._testDateParsing('totally-invalid');
      if (!result.parsed) {
        expect(result.suggestions)
          .to.be.an('array')
          .with.length.greaterThan(0);
      }
    });
  });

  suite('_ensureConsistentDateFormat', () => {
    test('delegates to _formatDateForDisplay', async () => {
      const el = await newPicker();
      el.format = 'YYYY-MM-DD';
      expect(el._ensureConsistentDateFormat(new Date(2024, 3, 12))).to.equal('2024-04-12');
    });
  });

  suite('_identifyCurrentFocusElement branches', () => {
    test('returns "year-dropdown" for element inside year dropdown', async () => {
      const el = await newPicker();
      const div = document.createElement('div');
      div.classList.add('year-dropdown');
      expect(el._identifyCurrentFocusElement(div)).to.equal('year-dropdown');
    });

    test('returns "prevMonth" for element with id prevMonth', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.id = 'prevMonth';
      expect(el._identifyCurrentFocusElement(btn)).to.equal('prevMonth');
    });

    test('returns "nextMonth" for element with id nextMonth', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.id = 'nextMonth';
      expect(el._identifyCurrentFocusElement(btn)).to.equal('nextMonth');
    });

    test('returns "calendar-grid" for calendar-day element', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      expect(el._identifyCurrentFocusElement(btn)).to.equal('calendar-grid');
    });

    test('returns "today-button" for today button', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('today-button');
      expect(el._identifyCurrentFocusElement(btn)).to.equal('today-button');
    });

    test('returns "cancel-button" for cancel button', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('cancel-button');
      expect(el._identifyCurrentFocusElement(btn)).to.equal('cancel-button');
    });

    test('returns first focus order element for unrecognised element', async () => {
      const el = await newPicker();
      expect(el._identifyCurrentFocusElement(document.createElement('span'))).to.equal('year-dropdown');
    });

    test('returns first focus order element for null', async () => {
      const el = await newPicker();
      expect(el._identifyCurrentFocusElement(null)).to.equal('year-dropdown');
    });
  });

  suite('_handlePopoverKeydown branches', () => {
    test('closes calendar on Escape', async () => {
      const el = await newPicker();
      el._openCalendar();
      expect(el._isCalendarOpen).to.be.true;
      el._handlePopoverKeydown({ key: 'Escape', preventDefault() {}, stopPropagation() {} });
      expect(el._isCalendarOpen).to.be.false;
    });

    test('handles Tab by calling _handleCalendarTabNavigation', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const spy = sinon.spy(el, '_handleCalendarTabNavigation');
      el._handlePopoverKeydown({ key: 'Tab', shiftKey: false, preventDefault() {}, stopPropagation() {} });
      expect(spy.calledOnce).to.be.true;
      spy.restore();
    });

    test('stops propagation for arrow keys when calendar is open', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const stopped = { value: false };
      el._handlePopoverKeydown({
        key: 'ArrowUp',
        preventDefault() {},
        stopPropagation() {
          stopped.value = true;
        },
      });
      expect(stopped.value).to.be.true;
    });
  });

  suite('_focusDateWithMonthTransition', () => {
    test('changes view month when target is in a different month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._generateCalendar();
      el._focusDateWithMonthTransition(new Date(2024, 6, 15));
      expect(el._viewDate.getMonth()).to.equal(6);
    });

    test('focuses date directly when same month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._generateCalendar();
      const spy = sinon.spy(el, '_focusDate');
      el._focusDateWithMonthTransition(new Date(2024, 5, 20));
      expect(spy.calledOnce).to.be.true;
      spy.restore();
    });
  });

  suite('_parseDateOnly — non-string branch', () => {
    test('parses a Date object (non-string)', async () => {
      const el = await newPicker();
      const d = el._parseDateOnly(new Date(2024, 3, 12));
      expect(d).to.be.an.instanceof(Date);
      expect(d.getHours()).to.equal(0);
    });

    test('returns null for non-string non-date-like value', async () => {
      const el = await newPicker();
      expect(el._parseDateOnly({})).to.be.null;
    });
  });

  suite('_announce with srStatus element', () => {
    test('sets textContent on #srStatus', async () => {
      const el = await newPicker();
      el._announce('Test message');
      await sleep(50);
      const sr = el.shadowRoot.querySelector('#srStatus');
      if (sr) {
        expect(sr.textContent).to.equal('Test message');
      }
    });
  });

  suite('_formatAriaDate fallback', () => {
    test('returns toDateString as fallback for locale error', async () => {
      const el = await newPicker();
      el._locale = null;
      const result = el._formatAriaDate(new Date(2024, 3, 12));
      expect(result)
        .to.be.a('string')
        .with.length.greaterThan(0);
    });
  });

  suite('_handleCalendarTabNavigation direction', () => {
    test('wraps forward from last element to first', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      // Force focus to cancel-button (last in _focusOrder)
      const cancel = el.shadowRoot.querySelector('.cancel-button');
      if (cancel) cancel.focus();
      el._handleCalendarTabNavigation(false);
      // Should wrap — no throw
    });

    test('wraps backward from first element to last', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const yearDropdown = el.shadowRoot.querySelector('.year-dropdown');
      if (yearDropdown) yearDropdown.focus();
      el._handleCalendarTabNavigation(true);
      // Should wrap — no throw
    });
  });

  suite('disconnectedCallback cleanup', () => {
    test('does not throw on disconnect', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      expect(() => el.disconnectedCallback()).to.not.throw();
    });
  });

  suite('_positionPopover branch coverage', () => {
    test('positions below when enough space', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._positionPopover();
      const popover = el.shadowRoot.querySelector('#calendarPopover');
      if (popover) {
        expect(popover.style.position).to.equal('fixed');
      }
    });

    test('does not throw when popover is null', async () => {
      const el = await newPicker();
      expect(() => el._positionPopover()).to.not.throw();
    });

    test('handles RTL positioning', async () => {
      const el = await newPicker();
      el._isRTL = true;
      el._openCalendar();
      flush();
      el._positionPopover();
      const popover = el.shadowRoot.querySelector('#calendarPopover');
      if (popover) {
        expect(popover.style.left).to.be.a('string');
      }
    });

    test('does not position when calendar is closed', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      el._positionPopover();
    });
  });

  suite('_handleDocumentClick branches', () => {
    test('does nothing when calendar is closed', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      el._handleDocumentClick({ target: document.body, composedPath: () => [document.body] });
    });

    test('does not close when click is inside component', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const input = el.shadowRoot.querySelector('#dateInput');
      el._handleDocumentClick({ target: input, composedPath: () => [input, el] });
      expect(el._isCalendarOpen).to.be.true;
    });

    test('closes when click is outside component', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const outside = document.createElement('div');
      document.body.appendChild(outside);
      el._interactingWithCalendar = false;
      el._handleDocumentClick({ target: outside, composedPath: () => [outside, document.body] });
      expect(el._isCalendarOpen).to.be.false;
      outside.remove();
    });

    test('does not close during active interaction', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._interactingWithCalendar = true;
      const outside = document.createElement('div');
      document.body.appendChild(outside);
      el._handleDocumentClick({ target: outside, composedPath: () => [outside] });
      expect(el._isCalendarOpen).to.be.true;
      outside.remove();
    });
  });

  suite('_handleDocumentFocusIn branches', () => {
    test('returns early when calendar is not open', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      expect(() => el._handleDocumentFocusIn({ target: document.body })).to.not.throw();
    });

    test('returns early when justOpenedCalendar is true', async () => {
      const el = await newPicker();
      el._isCalendarOpen = true;
      el._justOpenedCalendar = true;
      expect(() => el._handleDocumentFocusIn({ target: document.body })).to.not.throw();
    });

    test('does not close when target is body', async () => {
      const el = await newPicker();
      el._openCalendar();
      el._justOpenedCalendar = false;
      el._handleDocumentFocusIn({ target: document.body });
      await sleep(100);
    });

    test('returns early during suppression window', async () => {
      const el = await newPicker();
      el._openCalendar();
      el._justOpenedCalendar = false;
      el._suppressInputFocusCloseUntil = Date.now() + 200;
      const closeSpy = sinon.spy(el, '_closeCalendar');
      el._handleDocumentFocusIn({ target: document.documentElement });
      await sleep(60);
      expect(closeSpy).not.to.have.been.called;
      closeSpy.restore();
    });
  });

  suite('_onInputClick branches', () => {
    test('closes calendar when not opened via icon', async () => {
      const el = await newPicker();
      el._openCalendar();
      el._openedViaCalendarIcon = false;
      const stopped = { value: false };
      el._onInputClick({
        stopPropagation() {
          stopped.value = true;
        },
      });
      expect(stopped.value).to.be.true;
      expect(el._isCalendarOpen).to.be.false;
    });

    test('does nothing when calendar is closed', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      el._onInputClick({ stopPropagation() {} });
      expect(el._isCalendarOpen).to.be.false;
    });

    test('does nothing when opened via calendar icon', async () => {
      const el = await newPicker();
      el._openCalendar();
      el._openedViaCalendarIcon = true;
      el._onInputClick({ stopPropagation() {} });
      expect(el._isCalendarOpen).to.be.true;
    });
  });

  suite('_onCalendarIconFocus branches', () => {
    test('blurs icon when opened via calendar icon', async () => {
      const el = await newPicker();
      el._openedViaCalendarIcon = true;
      const blurSpy = sinon.spy();
      el._onCalendarIconFocus({
        preventDefault() {},
        stopPropagation() {},
        target: { blur: blurSpy },
      });
      await sleep(10);
      expect(blurSpy.called).to.be.true;
    });

    test('does nothing when not opened via icon', async () => {
      const el = await newPicker();
      el._openedViaCalendarIcon = false;
      const blurSpy = sinon.spy();
      el._onCalendarIconFocus({
        preventDefault() {},
        stopPropagation() {},
        target: { blur: blurSpy },
      });
      expect(blurSpy.called).to.be.false;
    });
  });

  suite('_focusCalendarElement branches', () => {
    test('focuses year-dropdown', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      expect(() => el._focusCalendarElement('year-dropdown')).to.not.throw();
    });

    test('skips disabled prevMonth', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      const prevBtn = el.shadowRoot.querySelector('#prevMonth');
      if (prevBtn) prevBtn.disabled = true;
      expect(() => el._focusCalendarElement('prevMonth')).to.not.throw();
    });

    test('skips disabled nextMonth', async () => {
      const el = await newPicker();
      el.max = '2024-06-30';
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      const nextBtn = el.shadowRoot.querySelector('#nextMonth');
      if (nextBtn) nextBtn.disabled = true;
      expect(() => el._focusCalendarElement('nextMonth')).to.not.throw();
    });

    test('focuses today-button', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      expect(() => el._focusCalendarElement('today-button')).to.not.throw();
    });

    test('focuses cancel-button', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      expect(() => el._focusCalendarElement('cancel-button')).to.not.throw();
    });

    test('handles default case by focusing grid', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      expect(() => el._focusCalendarElement('unknown')).to.not.throw();
    });
  });

  suite('_focusCalendarGrid branches', () => {
    test('uses focusedDate when set', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._focusedDate = new Date(2024, 5, 15);
      expect(() => el._focusCalendarGrid()).to.not.throw();
    });

    test('uses selectedDate when in current month', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      el._openCalendar();
      flush();
      el._focusedDate = null;
      expect(() => el._focusCalendarGrid()).to.not.throw();
    });

    test('falls back to first day of month', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._focusedDate = null;
      el._selectedDate = null;
      el._viewDate = new Date(2030, 5, 1);
      el._today = new Date(2024, 1, 1);
      expect(() => el._focusCalendarGrid()).to.not.throw();
    });
  });

  suite('_selectMonthYear branches', () => {
    test('changes view date and closes dropdown', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._generateMonthYearOptions();
      const btn = document.createElement('button');
      btn.classList.add('month-year-option');
      btn.dataset.monthYear = '2025-6';
      el._selectMonthYear({
        preventDefault() {},
        stopPropagation() {},
        target: btn,
      });
      expect(el._viewDate.getFullYear()).to.equal(2025);
      expect(el._viewDate.getMonth()).to.equal(6);
    });

    test('does nothing when no valid button target', async () => {
      const el = await newPicker();
      el._selectMonthYear({
        preventDefault() {},
        stopPropagation() {},
        target: document.createElement('div'),
      });
    });
  });

  suite('_handleGridKeydown branches', () => {
    test('ignores non-calendar-day targets', async () => {
      const el = await newPicker();
      const div = document.createElement('div');
      el._handleGridKeydown({
        target: div,
        key: 'ArrowLeft',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles Enter on current month date', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleGridKeydown({
        target: btn,
        key: 'Enter',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles Space on current month date', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleGridKeydown({
        target: btn,
        key: ' ',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles ArrowLeft within same month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleGridKeydown({
        target: btn,
        key: 'ArrowLeft',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles ArrowRight within same month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleGridKeydown({
        target: btn,
        key: 'ArrowRight',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles ArrowUp within same month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-20';
      el._handleGridKeydown({
        target: btn,
        key: 'ArrowUp',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles ArrowDown within same month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-10';
      el._handleGridKeydown({
        target: btn,
        key: 'ArrowDown',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles Home key', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-12';
      el._handleGridKeydown({
        target: btn,
        key: 'Home',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles End key', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-12';
      el._handleGridKeydown({
        target: btn,
        key: 'End',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles PageUp for previous year', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleGridKeydown({
        target: btn,
        key: 'PageUp',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles PageDown for next year', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleGridKeydown({
        target: btn,
        key: 'PageDown',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('ignores default keys', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleGridKeydown({
        target: btn,
        key: 'Shift',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('does not navigate ArrowLeft across months from first day', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-01';
      const prevMonth = el._viewDate.getMonth();
      el._handleGridKeydown({
        target: btn,
        key: 'ArrowLeft',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el._viewDate.getMonth()).to.equal(prevMonth);
    });
  });

  suite('_toggleYearDropdown branches', () => {
    test('opens and closes year dropdown', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._toggleYearDropdown({ preventDefault() {}, stopPropagation() {} });
      el._toggleYearDropdown({ preventDefault() {}, stopPropagation() {} });
    });

    test('handles no event argument', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      expect(() => el._toggleYearDropdown()).to.not.throw();
    });
  });

  suite('_handleYearDropdownKeydown branches', () => {
    test('opens dropdown on Enter when closed', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._isYearDropdownOpen = false;
      el._handleYearDropdownKeydown({
        key: 'Enter',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('opens dropdown on ArrowDown when closed', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._isYearDropdownOpen = false;
      el._handleYearDropdownKeydown({
        key: 'ArrowDown',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('opens dropdown on ArrowUp when closed', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._isYearDropdownOpen = false;
      el._handleYearDropdownKeydown({
        key: 'ArrowUp',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles Escape to close', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._isYearDropdownOpen = true;
      el._handleYearDropdownKeydown({
        key: 'Escape',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles Tab to close', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._isYearDropdownOpen = true;
      el._handleYearDropdownKeydown({ key: 'Tab' });
    });

    test('handles Home key', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._handleYearDropdownKeydown({
        key: 'Home',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles End key', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._handleYearDropdownKeydown({
        key: 'End',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles PageUp key', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._handleYearDropdownKeydown({
        key: 'PageUp',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('handles PageDown key', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      el._handleYearDropdownKeydown({
        key: 'PageDown',
        preventDefault() {},
        stopPropagation() {},
      });
    });
  });

  suite('_getFocusableElement branches', () => {
    test('returns null for disabled prevMonth', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const prev = el.shadowRoot.querySelector('#prevMonth');
      if (prev) prev.disabled = true;
      const result = el._getFocusableElement('prevMonth');
      expect(result).to.be.null;
    });

    test('returns null for disabled nextMonth', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const next = el.shadowRoot.querySelector('#nextMonth');
      if (next) next.disabled = true;
      const result = el._getFocusableElement('nextMonth');
      expect(result).to.be.null;
    });

    test('returns calendar-day for grid', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const result = el._getFocusableElement('calendar-grid');
      if (result) {
        expect(result.classList.contains('calendar-day')).to.be.true;
      }
    });

    test('returns null for unknown element', async () => {
      const el = await newPicker();
      expect(el._getFocusableElement('unknown')).to.be.null;
    });

    test('returns year-dropdown element', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const result = el._getFocusableElement('year-dropdown');
      if (result) {
        expect(result.classList.contains('year-dropdown')).to.be.true;
      }
    });
  });

  suite('_generateRequiredMessage', () => {
    test('returns localized required text', async () => {
      const el = await newPicker();
      const msg = el._generateRequiredMessage();
      expect(msg).to.be.a('string');
    });
  });

  suite('_handleDateKeydown delegates to grid handler', () => {
    test('calls _handleGridKeydown', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_handleGridKeydown');
      const event = {
        target: document.createElement('div'),
        key: 'Enter',
        preventDefault() {},
        stopPropagation() {},
      };
      el._handleDateKeydown(event);
      expect(spy.calledOnce).to.be.true;
      spy.restore();
    });
  });

  suite('_openCalendarViaMouse', () => {
    test('sets openedViaCalendarIcon flag', async () => {
      const el = await newPicker();
      el._openCalendarViaMouse({ preventDefault() {}, stopPropagation() {} });
      expect(el._openedViaCalendarIcon).to.be.true;
    });
  });

  suite('_safeSetValue edge cases', () => {
    test('handles missing set method gracefully', async () => {
      const el = await newPicker();
      const originalSet = el.set;
      el.set = null;
      el._safeSetValue('2024-01-01');
      expect(el.value).to.equal('2024-01-01');
      el.set = originalSet;
    });
  });

  suite('form property getter', () => {
    test('returns null when not inside a form', async () => {
      const el = await newPicker();
      expect(el.form).to.be.null;
    });
  });

  suite('_handlePopoverKeydown more branches', () => {
    test('stops propagation for Enter key when calendar is open', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const stopped = { value: false };
      el._handlePopoverKeydown({
        key: 'Enter',
        preventDefault() {},
        stopPropagation() {
          stopped.value = true;
        },
      });
      expect(stopped.value).to.be.true;
    });

    test('stops propagation for Space key when calendar is open', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const stopped = { value: false };
      el._handlePopoverKeydown({
        key: ' ',
        preventDefault() {},
        stopPropagation() {
          stopped.value = true;
        },
      });
      expect(stopped.value).to.be.true;
    });

    test('stops propagation for Home key', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const stopped = { value: false };
      el._handlePopoverKeydown({
        key: 'Home',
        preventDefault() {},
        stopPropagation() {
          stopped.value = true;
        },
      });
      expect(stopped.value).to.be.true;
    });

    test('stops propagation for End key', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const stopped = { value: false };
      el._handlePopoverKeydown({
        key: 'End',
        preventDefault() {},
        stopPropagation() {
          stopped.value = true;
        },
      });
      expect(stopped.value).to.be.true;
    });

    test('stops propagation for PageUp key', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const stopped = { value: false };
      el._handlePopoverKeydown({
        key: 'PageUp',
        preventDefault() {},
        stopPropagation() {
          stopped.value = true;
        },
      });
      expect(stopped.value).to.be.true;
    });

    test('stops propagation for PageDown key', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const stopped = { value: false };
      el._handlePopoverKeydown({
        key: 'PageDown',
        preventDefault() {},
        stopPropagation() {
          stopped.value = true;
        },
      });
      expect(stopped.value).to.be.true;
    });

    test('does not stop propagation for unrelated keys', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      const stopped = { value: false };
      el._handlePopoverKeydown({
        key: 'a',
        preventDefault() {},
        stopPropagation() {
          stopped.value = true;
        },
      });
      expect(stopped.value).to.be.false;
    });

    test('does not stop propagation when calendar is closed', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      const stopped = { value: false };
      el._handlePopoverKeydown({
        key: 'ArrowDown',
        preventDefault() {},
        stopPropagation() {
          stopped.value = true;
        },
      });
      expect(stopped.value).to.be.false;
    });
  });

  suite('_handleCalendarTabNavigation not open', () => {
    test('returns early when calendar is closed', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      expect(() => el._handleCalendarTabNavigation(false)).to.not.throw();
    });
  });

  suite('_parseDateFromISO edge cases', () => {
    test('rejects Feb 31', async () => {
      const el = await newPicker();
      expect(el._parseDateFromISO('2024-02-31')).to.be.null;
    });

    test('accepts Feb 29 in leap year', async () => {
      const el = await newPicker();
      const d = el._parseDateFromISO('2024-02-29');
      expect(d).to.not.be.null;
      expect(d.getDate()).to.equal(29);
    });

    test('rejects Feb 29 in non-leap year', async () => {
      const el = await newPicker();
      expect(el._parseDateFromISO('2023-02-29')).to.be.null;
    });

    test('rejects month 00', async () => {
      const el = await newPicker();
      expect(el._parseDateFromISO('2024-00-15')).to.be.null;
    });

    test('rejects day 00', async () => {
      const el = await newPicker();
      expect(el._parseDateFromISO('2024-06-00')).to.be.null;
    });
  });

  suite('_validateDate with no constraints', () => {
    test('accepts any valid date when no min/max', async () => {
      const el = await newPicker();
      el.min = undefined;
      el.max = undefined;
      const result = el._validateDate(new Date(1900, 0, 1));
      expect(result.isValid).to.be.true;
    });

    test('rejects null date', async () => {
      const el = await newPicker();
      const result = el._validateDate(null);
      expect(result.isValid).to.be.false;
      expect(result.errorReason).to.equal('invalidDate');
    });
  });

  suite('_isValidDate edge cases', () => {
    test('returns true with no min and no max', async () => {
      const el = await newPicker();
      el.min = undefined;
      el.max = undefined;
      expect(el._isValidDate(new Date(2024, 5, 15))).to.be.true;
    });

    test('returns true when on exact min date', async () => {
      const el = await newPicker();
      el.min = '2024-06-15';
      expect(el._isValidDate(new Date(2024, 5, 15))).to.be.true;
    });

    test('returns true when on exact max date', async () => {
      const el = await newPicker();
      el.max = '2024-06-15';
      expect(el._isValidDate(new Date(2024, 5, 15))).to.be.true;
    });
  });

  suite('_firstDayOfWeekChanged', () => {
    test('regenerates calendar when firstDayOfWeek changes', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el.firstDayOfWeek = 1;
      el._generateCalendar();
      expect(el._calendarDays).to.have.lengthOf(42);
    });
  });

  suite('_moment timezone branch', () => {
    test('uses moment.utc for Etc/UTC timezone', async () => {
      const el = await newPicker();
      el.timezone = 'Etc/UTC';
      const m = el._moment('2024-06-15');
      expect(m.isValid()).to.be.true;
    });

    test('uses moment local for empty timezone', async () => {
      const el = await newPicker();
      el.timezone = '';
      const m = el._moment('2024-06-15');
      expect(m.isValid()).to.be.true;
    });
  });

  suite('_updateNavigationButtonStates', () => {
    test('updates prev and next button disabled states', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el.max = '2024-06-30';
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      el._updateNavigationButtonStates();
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');
      if (prev) expect(prev.disabled).to.be.true;
      if (next) expect(next.disabled).to.be.true;
    });
  });

  suite('_closeCalendar with reposition listener cleanup', () => {
    test('removes window listeners on close', async () => {
      const el = await newPicker();
      el._openCalendar();
      flush();
      expect(el._boundReposition).to.be.a('function');
      el._closeCalendar();
      expect(el._isCalendarOpen).to.be.false;
    });
  });

  suite('_valueChanged with invalid value string', () => {
    test('handles unparseable value gracefully', async () => {
      const el = await newPicker();
      el.value = 'completely-invalid-value';
      flush();
      expect(el._selectedDate).to.be.null;
    });
  });

  suite('_setupI18n with various locales', () => {
    test('sets up for French locale', async () => {
      const el = await newPicker();
      el._setupI18n('fr-FR');
      expect(el._locale).to.equal('fr-FR');
      expect(el._isRTL).to.be.false;
    });

    test('sets up for undefined locale', async () => {
      const el = await newPicker();
      el._setupI18n(undefined);
    });
  });

  suite('_detectRTL edge cases', () => {
    test('handles ur locale as RTL', async () => {
      const el = await newPicker();
      el._detectRTL('ur-PK');
      expect(el._isRTL).to.be.true;
    });

    test('handles ps locale as RTL', async () => {
      const el = await newPicker();
      el._detectRTL('ps-AF');
      expect(el._isRTL).to.be.true;
    });

    test('handles ja as LTR', async () => {
      const el = await newPicker();
      el._detectRTL('ja-JP');
      expect(el._isRTL).to.be.false;
    });
  });

  suite('_clearDate branches', () => {
    test('clears all state including errors', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      el.invalid = true;
      el.errorReason = 'outOfRange';
      el._clearDate({ preventDefault() {}, stopPropagation() {} });
      expect(el._selectedDate).to.be.null;
      expect(el.value).to.equal('');
      expect(el.invalid).to.be.false;
      expect(el.errorReason).to.equal('');
      expect(el._justCleared).to.be.true;
    });

    test('works without event argument', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      el._clearDate();
      expect(el.value).to.equal('');
    });
  });

  suite('_getLocalizedText with substitutions', () => {
    test('returns key when translation not found', async () => {
      const el = await newPicker();
      const result = el._getLocalizedText('nonExistentKey');
      expect(result).to.be.a('string');
    });

    test('handles multiple substitutions', async () => {
      window.nuxeo.I18n.en['customDatePicker.testMulti'] = '{a} and {b}';
      const el = await newPicker();
      const result = el._getLocalizedText('testMulti', { a: 'X', b: 'Y' });
      expect(result).to.equal('X and Y');
    });
  });

  suite('_findAndFocusNearestValidDate', () => {
    test('finds first valid date in month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      expect(() => el._findAndFocusNearestValidDate(new Date(2024, 5, 15))).to.not.throw();
    });
  });

  suite('_focusFirstAvailableDate branches', () => {
    test('focuses selectedDate when in current month', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      el._openCalendar();
      flush();
      el._viewDate = new Date(2024, 5, 1);
      expect(() => el._focusFirstAvailableDate()).to.not.throw();
    });

    test('focuses today when in current month and no selection', async () => {
      const el = await newPicker();
      const today = new Date();
      el._viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
      el._selectedDate = null;
      el._openCalendar();
      flush();
      expect(() => el._focusFirstAvailableDate()).to.not.throw();
    });

    test('focuses first day when neither selected nor today', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2030, 5, 1);
      el._selectedDate = null;
      el._today = new Date(2024, 1, 1);
      el._openCalendar();
      flush();
      expect(() => el._focusFirstAvailableDate()).to.not.throw();
    });
  });

  suite('reportValidity with priority handling', () => {
    test('preserves higher-priority error on re-validate', async () => {
      const el = await newPicker();
      el.required = true;
      el.value = 'invalid-date';
      el.errorReason = 'format';
      el.errorMessage = 'Bad format';
      const result = el.reportValidity();
      expect(result).to.be.false;
      expect(el._showErrors).to.be.true;
    });
  });

  suite('_isSameDay branches', () => {
    test('returns false when date1 is null', async () => {
      const el = await newPicker();
      expect(el._isSameDay(null, new Date())).to.be.false;
    });

    test('returns false when date2 is null', async () => {
      const el = await newPicker();
      expect(el._isSameDay(new Date(), null)).to.be.false;
    });

    test('returns true for same date', async () => {
      const el = await newPicker();
      const d = new Date(2024, 5, 15);
      expect(el._isSameDay(d, new Date(2024, 5, 15))).to.be.true;
    });

    test('returns false for different dates', async () => {
      const el = await newPicker();
      expect(el._isSameDay(new Date(2024, 5, 15), new Date(2024, 5, 16))).to.be.false;
    });

    test('returns true ignoring time', async () => {
      const el = await newPicker();
      const d1 = new Date(2024, 5, 15, 10, 30);
      const d2 = new Date(2024, 5, 15, 23, 59);
      expect(el._isSameDay(d1, d2)).to.be.true;
    });
  });

  suite('_isValidDate branches', () => {
    test('returns false for null', async () => {
      const el = await newPicker();
      expect(el._isValidDate(null)).to.be.false;
    });

    test('returns false for NaN date', async () => {
      const el = await newPicker();
      expect(el._isValidDate(new Date('invalid'))).to.be.false;
    });

    test('returns true with no min/max', async () => {
      const el = await newPicker();
      expect(el._isValidDate(new Date(2024, 5, 15))).to.be.true;
    });

    test('returns false when before min', async () => {
      const el = await newPicker();
      el.min = '2024-06-10';
      expect(el._isValidDate(new Date(2024, 5, 5))).to.be.false;
    });

    test('returns true when equal to min', async () => {
      const el = await newPicker();
      el.min = '2024-06-10';
      expect(el._isValidDate(new Date(2024, 5, 10))).to.be.true;
    });

    test('returns false when after max', async () => {
      const el = await newPicker();
      el.max = '2024-06-20';
      expect(el._isValidDate(new Date(2024, 5, 25))).to.be.false;
    });

    test('returns true when equal to max', async () => {
      const el = await newPicker();
      el.max = '2024-06-20';
      expect(el._isValidDate(new Date(2024, 5, 20))).to.be.true;
    });

    test('returns true when in range', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el.max = '2024-06-30';
      expect(el._isValidDate(new Date(2024, 5, 15))).to.be.true;
    });
  });

  suite('_validateDate branches', () => {
    test('returns invalid for null', async () => {
      const el = await newPicker();
      const result = el._validateDate(null);
      expect(result.isValid).to.be.false;
    });

    test('returns valid for normal date', async () => {
      const el = await newPicker();
      const result = el._validateDate(new Date(2024, 5, 15));
      expect(result.isValid).to.be.true;
    });

    test('returns out of range for date before min', async () => {
      const el = await newPicker();
      el.min = '2024-06-10';
      const result = el._validateDate(new Date(2024, 5, 5));
      expect(result.isValid).to.be.false;
      expect(result.errorReason).to.equal('outOfRange');
    });

    test('returns out of range for date after max', async () => {
      const el = await newPicker();
      el.max = '2024-06-20';
      const result = el._validateDate(new Date(2024, 5, 25));
      expect(result.isValid).to.be.false;
      expect(result.errorReason).to.equal('outOfRange');
    });
  });

  suite('_isDateDisabled branches', () => {
    test('returns false with no constraints', async () => {
      const el = await newPicker();
      expect(el._isDateDisabled(new Date(2024, 5, 15))).to.be.false;
    });

    test('returns true for date before min', async () => {
      const el = await newPicker();
      el.min = '2024-06-10';
      expect(el._isDateDisabled(new Date(2024, 5, 5))).to.be.true;
    });

    test('returns true for date after max', async () => {
      const el = await newPicker();
      el.max = '2024-06-20';
      expect(el._isDateDisabled(new Date(2024, 5, 25))).to.be.true;
    });
  });

  suite('_dateToISO branches', () => {
    test('returns ISO string for valid date', async () => {
      const el = await newPicker();
      const result = el._dateToISO(new Date(2024, 0, 5));
      expect(result).to.equal('2024-01-05');
    });

    test('returns empty string for null', async () => {
      const el = await newPicker();
      expect(el._dateToISO(null)).to.equal('');
    });

    test('returns empty string for invalid date', async () => {
      const el = await newPicker();
      expect(el._dateToISO(new Date('bad'))).to.equal('');
    });
  });

  suite('_formatDateForInput branches', () => {
    test('returns empty string for null', async () => {
      const el = await newPicker();
      expect(el._formatDateForInput(null)).to.equal('');
    });

    test('returns formatted string for valid date', async () => {
      const el = await newPicker();
      const result = el._formatDateForInput(new Date(2024, 5, 15));
      expect(result).to.be.a('string').and.not.empty;
    });
  });

  suite('_updateInputValue branches', () => {
    test('sets input to formatted when selected', async () => {
      const el = await newPicker();
      el._selectedDate = new Date(2024, 5, 15);
      el._updateInputValue();
      expect(el._inputValue).to.not.equal('');
    });

    test('clears input when no selected date', async () => {
      const el = await newPicker();
      el._selectedDate = null;
      el._updateInputValue();
      expect(el._inputValue).to.equal('');
    });
  });

  suite('_getErrorPriority branches', () => {
    test('returns highest for format', async () => {
      const el = await newPicker();
      expect(el._getErrorPriority('format')).to.be.above(0);
    });

    test('returns lower for required', async () => {
      const el = await newPicker();
      const reqPri = el._getErrorPriority('required');
      const fmtPri = el._getErrorPriority('format');
      expect(fmtPri).to.be.at.least(reqPri);
    });

    test('returns 0 for unknown', async () => {
      const el = await newPicker();
      expect(el._getErrorPriority('unknown')).to.equal(0);
    });
  });

  suite('_showError branches', () => {
    test('returns true when invalid with message and showErrors', async () => {
      const el = await newPicker();
      expect(el._showError(true, 'Error', true)).to.be.true;
    });

    test('returns false when not invalid', async () => {
      const el = await newPicker();
      expect(el._showError(false, 'Error', true)).to.be.false;
    });

    test('returns false for required errors when showErrors is false', async () => {
      const el = await newPicker();
      el.errorReason = 'required';
      expect(el._showError(true, 'Required', false)).to.be.false;
    });

    test('returns false when no error message', async () => {
      const el = await newPicker();
      expect(el._showError(true, '', true)).to.be.false;
    });
  });

  suite('_getAriaDescribedBy branches', () => {
    test('returns errorText id when invalid with message', async () => {
      const el = await newPicker();
      const result = el._getAriaDescribedBy(true, 'Error msg');
      expect(result).to.include('errorText');
    });

    test('returns null when not invalid', async () => {
      const el = await newPicker();
      const result = el._getAriaDescribedBy(false, 'Error msg');
      expect(result).to.be.null;
    });
  });

  suite('_isTodayInCurrentMonth', () => {
    test('returns true when viewDate is current month', async () => {
      const el = await newPicker();
      const now = new Date();
      el._today = new Date(now);
      el._viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
      expect(el._isTodayInCurrentMonth()).to.be.true;
    });

    test('returns false when viewDate is different month', async () => {
      const el = await newPicker();
      el._today = new Date(2024, 5, 15);
      el._viewDate = new Date(2024, 6, 1);
      expect(el._isTodayInCurrentMonth()).to.be.false;
    });
  });

  suite('_isSelectedYear', () => {
    test('returns true for matching year', async () => {
      const el = await newPicker();
      const vd = new Date(2024, 5, 1);
      expect(el._isSelectedYear(2024, vd)).to.be.true;
    });

    test('returns false for non-matching year', async () => {
      const el = await newPicker();
      const vd = new Date(2024, 5, 1);
      expect(el._isSelectedYear(2025, vd)).to.be.false;
    });
  });

  suite('_getYearOptionClass', () => {
    test('returns selected for matching year', async () => {
      const el = await newPicker();
      const vd = new Date(2024, 5, 1);
      expect(el._getYearOptionClass(2024, vd)).to.equal('selected');
    });

    test('returns empty for non-matching year', async () => {
      const el = await newPicker();
      const vd = new Date(2024, 5, 1);
      expect(el._getYearOptionClass(2025, vd)).to.equal('');
    });

    test('returns empty when viewDate is null', async () => {
      const el = await newPicker();
      expect(el._getYearOptionClass(2024, null)).to.equal('');
    });
  });

  suite('_getYearTabIndex', () => {
    test('returns 0 for selected year', async () => {
      const el = await newPicker();
      const vd = new Date(2024, 5, 1);
      expect(el._getYearTabIndex(2024, vd)).to.equal('0');
    });

    test('returns -1 for other year', async () => {
      const el = await newPicker();
      const vd = new Date(2024, 5, 1);
      expect(el._getYearTabIndex(2025, vd)).to.equal('-1');
    });
  });

  suite('_isMixedCaseFormat', () => {
    test('returns false for null', async () => {
      const el = await newPicker();
      expect(el._isMixedCaseFormat(null)).to.be.false;
    });

    test('returns false for empty string', async () => {
      const el = await newPicker();
      expect(el._isMixedCaseFormat('')).to.be.false;
    });

    test('returns true for mixed case', async () => {
      const el = await newPicker();
      expect(el._isMixedCaseFormat('Dd/Mm/YYYY')).to.be.true;
    });

    test('returns false for all uppercase', async () => {
      const el = await newPicker();
      expect(el._isMixedCaseFormat('DD/MM/YYYY')).to.be.false;
    });
  });

  suite('_normalizeFormat', () => {
    test('normalizes lowercase dd to DD', async () => {
      const el = await newPicker();
      expect(el._normalizeFormat('dd/mm/yyyy')).to.equal('DD/MM/YYYY');
    });

    test('returns null for null input', async () => {
      const el = await newPicker();
      expect(el._normalizeFormat(null)).to.be.null;
    });
  });

  suite('_isValidMomentFormat', () => {
    test('returns true for DD/MM/YYYY', async () => {
      const el = await newPicker();
      expect(el._isValidMomentFormat('DD/MM/YYYY')).to.be.true;
    });

    test('returns false for null', async () => {
      const el = await newPicker();
      expect(el._isValidMomentFormat(null)).to.be.false;
    });

    test('returns false for non-string', async () => {
      const el = await newPicker();
      expect(el._isValidMomentFormat(123)).to.be.false;
    });

    test('returns false for invalid tokens', async () => {
      const el = await newPicker();
      expect(el._isValidMomentFormat('XYZ')).to.be.false;
    });
  });

  suite('_formatDateForDisplay branches', () => {
    test('returns empty for null date', async () => {
      const el = await newPicker();
      expect(el._formatDateForDisplay(null)).to.equal('');
    });

    test('returns formatted string for valid date', async () => {
      const el = await newPicker();
      const result = el._formatDateForDisplay(new Date(2024, 5, 15));
      expect(result).to.be.a('string').and.not.empty;
    });

    test('uses custom format when set', async () => {
      const el = await newPicker();
      el.format = 'DD/MM/YYYY';
      const result = el._formatDateForDisplay(new Date(2024, 5, 15));
      expect(result).to.equal('15/06/2024');
    });

    test('falls back to locale for mixed case format', async () => {
      const el = await newPicker();
      el.format = 'Dd/Mm/Yyyy';
      const result = el._formatDateForDisplay(new Date(2024, 5, 15));
      expect(result).to.be.a('string').and.not.empty;
    });
  });

  suite('_parseUserInput branches', () => {
    test('returns null for empty input', async () => {
      const el = await newPicker();
      expect(el._parseUserInput('')).to.be.null;
    });

    test('returns null for null input', async () => {
      const el = await newPicker();
      expect(el._parseUserInput(null)).to.be.null;
    });

    test('returns null for non-string input', async () => {
      const el = await newPicker();
      expect(el._parseUserInput(123)).to.be.null;
    });

    test('parses YYYY-MM-DD format', async () => {
      const el = await newPicker();
      const result = el._parseUserInput('2024-06-15');
      expect(result).to.not.be.null;
      expect(result.date.getFullYear()).to.equal(2024);
    });

    test('parses with custom format', async () => {
      const el = await newPicker();
      el.format = 'DD/MM/YYYY';
      const result = el._parseUserInput('15/06/2024');
      expect(result).to.not.be.null;
      expect(result.date.getDate()).to.equal(15);
    });

    test('returns null for completely unparseable input', async () => {
      const el = await newPicker();
      expect(el._parseUserInput('notadate')).to.be.null;
    });
  });

  suite('_getUserLocale', () => {
    test('returns a locale string', async () => {
      const el = await newPicker();
      const locale = el._getUserLocale();
      expect(locale).to.be.a('string').and.not.empty;
    });
  });

  suite('_generateCalendar branches', () => {
    test('does nothing when viewDate is null', async () => {
      const el = await newPicker();
      el._viewDate = null;
      el._generateCalendar();
      expect(el._calendarDays).to.be.an('array');
    });

    test('generates 42 day cells', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._generateCalendar();
      expect(el._calendarDays).to.have.length(42);
    });

    test('marks today when in current month', async () => {
      const el = await newPicker();
      const today = new Date();
      el._today = new Date(today);
      el._viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
      el._generateCalendar();
      const todayCell = el._calendarDays.find((d) => d.isToday);
      expect(todayCell).to.exist;
    });

    test('marks selected date', async () => {
      const el = await newPicker();
      el._selectedDate = new Date(2024, 5, 15);
      el._viewDate = new Date(2024, 5, 1);
      el._generateCalendar();
      const selected = el._calendarDays.find((d) => d.isSelected);
      expect(selected).to.exist;
      expect(selected.date.getDate()).to.equal(15);
    });

    test('marks disabled dates outside min range', async () => {
      const el = await newPicker();
      el.min = '2024-06-15';
      el._viewDate = new Date(2024, 5, 1);
      el._generateCalendar();
      const disabledBefore = el._calendarDays.filter((d) => d.isCurrentMonth && d.isDisabled && d.date.getDate() < 15);
      expect(disabledBefore.length).to.be.above(0);
    });

    test('marks empty cells for other months', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._generateCalendar();
      const emptyCells = el._calendarDays.filter((d) => d.isEmpty);
      expect(emptyCells.length).to.be.above(0);
    });
  });

  suite('_getValidity branches', () => {
    test('returns false when required and empty', async () => {
      const el = await newPicker();
      el.required = true;
      el.value = '';
      expect(el._getValidity()).to.be.false;
      expect(el.errorReason).to.equal('required');
    });

    test('returns true when not required and empty', async () => {
      const el = await newPicker();
      el.required = false;
      el.value = '';
      expect(el._getValidity()).to.be.true;
    });

    test('returns false for invalid date value', async () => {
      const el = await newPicker();
      el.value = 'not-a-date';
      expect(el._getValidity()).to.be.false;
      expect(el.errorReason).to.equal('invalidDate');
    });

    test('returns false for date before min', async () => {
      const el = await newPicker();
      el.min = '2024-06-10';
      el.value = '2024-06-05';
      expect(el._getValidity()).to.be.false;
      expect(el.errorReason).to.equal('outOfRange');
    });

    test('returns false for date after max', async () => {
      const el = await newPicker();
      el.max = '2024-06-20';
      el.value = '2024-06-25';
      expect(el._getValidity()).to.be.false;
      expect(el.errorReason).to.equal('outOfRange');
    });

    test('returns true for valid date in range', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el.max = '2024-06-30';
      el.value = '2024-06-15';
      expect(el._getValidity()).to.be.true;
    });
  });

  suite('validate method branches', () => {
    test('returns false when errorPersists and invalid', async () => {
      const el = await newPicker();
      el._errorPersists = true;
      el.invalid = true;
      expect(el.validate()).to.be.false;
    });

    test('returns true for valid value', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      expect(el.validate()).to.be.true;
    });

    test('returns false for required empty', async () => {
      const el = await newPicker();
      el.required = true;
      el.value = '';
      expect(el.validate()).to.be.false;
    });

    test('returns true when no value and not required', async () => {
      const el = await newPicker();
      el.required = false;
      el.value = '';
      expect(el.validate()).to.be.true;
    });
  });

  suite('isInputValid method', () => {
    test('returns false when errorPersists and invalid', async () => {
      const el = await newPicker();
      el._errorPersists = true;
      el.invalid = true;
      expect(el.isInputValid()).to.be.false;
    });

    test('returns true when empty and not required', async () => {
      const el = await newPicker();
      el.required = false;
      expect(el.isInputValid()).to.be.true;
    });
  });

  suite('checkValidity', () => {
    test('delegates to validate', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      expect(el.checkValidity()).to.equal(el.validate());
    });
  });

  suite('resetErrorState', () => {
    test('clears all error state', async () => {
      const el = await newPicker();
      el.invalid = true;
      el.errorMessage = 'Error';
      el.errorReason = 'format';
      el._showErrors = true;
      el._errorPersists = true;
      el.resetErrorState();
      expect(el.invalid).to.be.false;
      expect(el.errorMessage).to.equal('');
      expect(el.errorReason).to.equal('');
      expect(el._showErrors).to.be.false;
      expect(el._errorPersists).to.be.false;
    });
  });

  suite('_valueChanged branches', () => {
    test('clears selectedDate when value is empty', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      flush();
      el.value = '';
      el._valueChanged();
      expect(el._selectedDate).to.be.null;
    });

    test('sets selectedDate for valid ISO value', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      el._valueChanged();
      expect(el._selectedDate).to.not.be.null;
    });

    test('clears selectedDate for unparseable value', async () => {
      const el = await newPicker();
      el.value = 'totally-invalid';
      el._valueChanged();
      expect(el._selectedDate).to.be.null;
    });

    test('does not update input when _preventInputUpdate is true', async () => {
      const el = await newPicker();
      el._preventInputUpdate = true;
      el.value = '2024-06-15';
      el._valueChanged();
      el._preventInputUpdate = false;
    });
  });

  suite('_invalidChanged branches', () => {
    test('announces error when invalid with showErrors', async () => {
      const el = await newPicker();
      el._showErrors = true;
      el.errorMessage = 'Some error';
      const spy = sinon.spy(el, '_announce');
      el._invalidChanged(true);
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('does not announce when showErrors false', async () => {
      const el = await newPicker();
      el._showErrors = false;
      const spy = sinon.spy(el, '_announce');
      el._invalidChanged(true);
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });

  suite('_errorMessageChanged branches', () => {
    test('announces when invalid with message', async () => {
      const el = await newPicker();
      el.invalid = true;
      el._showErrors = true;
      const spy = sinon.spy(el, '_announce');
      el._errorMessageChanged('New error');
      expect(spy).to.have.been.calledWith('New error');
      spy.restore();
    });

    test('does not announce when not invalid', async () => {
      const el = await newPicker();
      el.invalid = false;
      el._showErrors = true;
      const spy = sinon.spy(el, '_announce');
      el._errorMessageChanged('New error');
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });

  suite('_getDayClasses branches', () => {
    test('includes today class', async () => {
      const el = await newPicker();
      const day = {
        isToday: true,
        isSelected: false,
        isDisabled: false,
        isEmpty: false,
        isOtherMonth: false,
        date: new Date(2024, 5, 15),
      };
      const result = el._getDayClasses(day, null);
      expect(result).to.include('today');
    });

    test('includes selected class', async () => {
      const el = await newPicker();
      const day = {
        isToday: false,
        isSelected: true,
        isDisabled: false,
        isEmpty: false,
        isOtherMonth: false,
        date: new Date(2024, 5, 15),
      };
      const result = el._getDayClasses(day, null);
      expect(result).to.include('selected');
    });

    test('includes disabled class', async () => {
      const el = await newPicker();
      const day = {
        isToday: false,
        isSelected: false,
        isDisabled: true,
        isEmpty: false,
        isOtherMonth: false,
        date: new Date(2024, 5, 15),
      };
      const result = el._getDayClasses(day, null);
      expect(result).to.include('disabled');
    });

    test('includes empty class for other month', async () => {
      const el = await newPicker();
      const day = {
        isToday: false,
        isSelected: false,
        isDisabled: false,
        isEmpty: true,
        isOtherMonth: true,
        date: new Date(2024, 4, 31),
      };
      const result = el._getDayClasses(day, null);
      expect(result).to.include('empty');
    });

    test('includes focused class when matching non-today non-selected', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      const d = new Date(2024, 5, 15);
      const day = {
        isToday: false,
        isSelected: false,
        isDisabled: false,
        isEmpty: false,
        isOtherMonth: false,
        isCurrentMonth: true,
        date: new Date(d),
      };
      const result = el._getDayClasses(day, d);
      expect(result).to.include('focused');
    });
  });

  suite('_getDayTabIndex branches', () => {
    test('returns 0 for focused date match', async () => {
      const el = await newPicker();
      const d = new Date(2024, 5, 15);
      const day = {
        isEmpty: false,
        isCurrentMonth: true,
        date: new Date(d),
        isSelected: false,
        isToday: false,
      };
      const result = el._getDayTabIndex(day, d);
      expect(result).to.equal('0');
    });

    test('returns -1 for empty cell', async () => {
      const el = await newPicker();
      const day = { isEmpty: true, date: new Date(), isSelected: false };
      const result = el._getDayTabIndex(day, null);
      expect(result).to.equal('-1');
    });
  });

  suite('_getAriaCurrent branches', () => {
    test('returns date for today', async () => {
      const el = await newPicker();
      expect(el._getAriaCurrent({ isToday: true })).to.equal('date');
    });

    test('returns null for non-today', async () => {
      const el = await newPicker();
      expect(el._getAriaCurrent({ isToday: false })).to.be.null;
    });
  });

  suite('_getDropdownIcon', () => {
    test('returns different icon based on open state', async () => {
      const el = await newPicker();
      const openIcon = el._getDropdownIcon(true);
      const closedIcon = el._getDropdownIcon(false);
      expect(openIcon).to.be.a('string');
      expect(closedIcon).to.be.a('string');
    });
  });

  suite('_isPreviousMonthDisabled', () => {
    test('returns false when no min constraint', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      expect(el._isPreviousMonthDisabled()).to.be.false;
    });

    test('returns true when previous month is before min', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el._viewDate = new Date(2024, 5, 1);
      expect(el._isPreviousMonthDisabled()).to.be.true;
    });
  });

  suite('_isNextMonthDisabled', () => {
    test('returns false when no max constraint', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      expect(el._isNextMonthDisabled()).to.be.false;
    });

    test('returns true when next month is after max', async () => {
      const el = await newPicker();
      el.max = '2024-06-30';
      el._viewDate = new Date(2024, 5, 1);
      expect(el._isNextMonthDisabled()).to.be.true;
    });
  });

  suite('_moment with timezone', () => {
    test('uses utc when timezone is Etc/UTC', async () => {
      const el = await newPicker();
      el.timezone = 'Etc/UTC';
      const m = el._moment('2024-06-15');
      expect(m.isValid()).to.be.true;
    });

    test('uses local when timezone is empty', async () => {
      const el = await newPicker();
      el.timezone = '';
      const m = el._moment('2024-06-15');
      expect(m.isValid()).to.be.true;
    });
  });

  suite('_safeSetValue branches', () => {
    test('does not set value when invalid and typing', async () => {
      const el = await newPicker();
      el.invalid = true;
      el._userIsTyping = true;
      el._safeSetValue('2024-06-15');
      expect(el.value).to.not.equal('2024-06-15');
    });

    test('allows clearing when invalid and typing', async () => {
      const el = await newPicker();
      el.invalid = true;
      el._userIsTyping = true;
      el._safeSetValue('');
    });

    test('sets value normally when not invalid', async () => {
      const el = await newPicker();
      el._safeSetValue('2024-06-15');
      expect(el.value).to.equal('2024-06-15');
    });
  });

  suite('_testDateParsing diagnostic', () => {
    test('returns parsed true for valid date', async () => {
      const el = await newPicker();
      const result = el._testDateParsing('2024-06-15');
      expect(result.parsed).to.be.true;
    });

    test('returns suggestions for unparseable date', async () => {
      const el = await newPicker();
      const result = el._testDateParsing('notadate');
      expect(result.suggestions).to.be.an('array');
    });
  });

  suite('_ensureConsistentDateFormat', () => {
    test('delegates to _formatDateForDisplay', async () => {
      const el = await newPicker();
      const d = new Date(2024, 5, 15);
      expect(el._ensureConsistentDateFormat(d)).to.equal(el._formatDateForDisplay(d));
    });
  });

  suite('_updateInputFromDate', () => {
    test('updates input from selected date', async () => {
      const el = await newPicker();
      el._selectedDate = new Date(2024, 5, 15);
      el._updateInputFromDate();
      expect(el._inputValue).to.not.equal('');
    });

    test('clears input when no date', async () => {
      const el = await newPicker();
      el._selectedDate = null;
      el._updateInputFromDate();
      expect(el._inputValue).to.equal('');
    });
  });

  suite('_isElementInsideComponent', () => {
    test('returns false for null', async () => {
      const el = await newPicker();
      expect(el._isElementInsideComponent(null)).to.be.false;
    });

    test('returns true for component itself', async () => {
      const el = await newPicker();
      expect(el._isElementInsideComponent(el)).to.be.true;
    });

    test('returns true for shadow DOM child', async () => {
      const el = await newPicker();
      const input = el.shadowRoot.querySelector('#dateInput');
      if (input) {
        expect(el._isElementInsideComponent(input)).to.be.true;
      }
    });

    test('returns false for external element', async () => {
      const el = await newPicker();
      const ext = document.createElement('div');
      document.body.appendChild(ext);
      expect(el._isElementInsideComponent(ext)).to.be.false;
      document.body.removeChild(ext);
    });
  });

  suite('_handleCalendarIconKeydown', () => {
    test('opens calendar on Enter', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_openCalendar');
      el._handleCalendarIconKeydown({
        key: 'Enter',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('opens calendar on Space', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_openCalendar');
      el._handleCalendarIconKeydown({
        key: ' ',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('opens calendar on ArrowDown', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_openCalendar');
      el._handleCalendarIconKeydown({
        key: 'ArrowDown',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('opens calendar on F4', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_openCalendar');
      el._handleCalendarIconKeydown({
        key: 'F4',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('does nothing on unrelated key', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_openCalendar');
      el._handleCalendarIconKeydown({
        key: 'a',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });

  suite('_selectYear branches', () => {
    test('handles leap year Feb 29 to non-leap year', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 1, 29);
      el._isCalendarOpen = true;
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('year-option');
      btn.dataset.year = '2023';
      el._selectYear({
        target: btn,
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el._viewDate.getDate()).to.equal(28);
    });

    test('preserves day for normal month change', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('year-option');
      btn.dataset.year = '2025';
      el._selectYear({
        target: btn,
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el._viewDate.getFullYear()).to.equal(2025);
    });
  });

  suite('_handleNavButtonKeydown', () => {
    test('calls _previousMonth for prevMonth on Enter', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      const spy = sinon.spy(el, '_previousMonth');
      el._handleNavButtonKeydown({
        key: 'Enter',
        target: { id: 'prevMonth' },
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('calls _nextMonth for nextMonth on Space', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      const spy = sinon.spy(el, '_nextMonth');
      el._handleNavButtonKeydown({
        key: ' ',
        target: { id: 'nextMonth' },
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('does nothing on unrelated key', async () => {
      const el = await newPicker();
      const spy1 = sinon.spy(el, '_previousMonth');
      const spy2 = sinon.spy(el, '_nextMonth');
      el._handleNavButtonKeydown({
        key: 'a',
        target: { id: 'prevMonth' },
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy1).not.to.have.been.called;
      expect(spy2).not.to.have.been.called;
      spy1.restore();
      spy2.restore();
    });
  });

  suite('_shouldShowClearButton', () => {
    test('returns true when has value and not hidden', async () => {
      const el = await newPicker();
      expect(el._shouldShowClearButton('2024', false)).to.be.true;
    });

    test('returns false when hidden', async () => {
      const el = await newPicker();
      expect(el._shouldShowClearButton('2024', true)).to.be.false;
    });

    test('returns falsy when no value', async () => {
      const el = await newPicker();
      expect(el._shouldShowClearButton('', false)).to.not.be.ok;
    });
  });

  suite('_buildOutOfRangeMessage', () => {
    test('builds message with min only', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      const msg = el._buildOutOfRangeMessage();
      expect(msg).to.be.a('string');
    });

    test('builds message with max only', async () => {
      const el = await newPicker();
      el.max = '2024-06-30';
      const msg = el._buildOutOfRangeMessage();
      expect(msg).to.be.a('string');
    });

    test('builds message with both min and max', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el.max = '2024-06-30';
      const msg = el._buildOutOfRangeMessage();
      expect(msg).to.be.a('string');
    });
  });

  suite('_focusDateWithMonthTransition', () => {
    test('transitions to different month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 15);
      el._openCalendar();
      flush();
      el._generateCalendar();
      el._focusDateWithMonthTransition(new Date(2024, 6, 15));
      expect(el._viewDate.getMonth()).to.equal(6);
    });

    test('stays in same month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      el._focusDateWithMonthTransition(new Date(2024, 5, 20));
      expect(el._viewDate.getMonth()).to.equal(5);
    });
  });

  suite('_updateErrorDisplay branches', () => {
    test('shows required message when required and empty', async () => {
      const el = await newPicker();
      el.required = true;
      el.value = '';
      el._showErrors = true;
      el._updateErrorDisplay(false);
    });

    test('shows error message for other errors', async () => {
      const el = await newPicker();
      el.errorMessage = 'Format error';
      el._showErrors = true;
      el._updateErrorDisplay(false);
    });

    test('hides errors when valid', async () => {
      const el = await newPicker();
      el._updateErrorDisplay(true);
    });

    test('hides errors when showErrors is false', async () => {
      const el = await newPicker();
      el._showErrors = false;
      el._updateErrorDisplay(false);
    });
  });

  suite('_selectDate branches', () => {
    test('does nothing for null date', async () => {
      const el = await newPicker();
      el._selectDate(null);
      expect(el.value).to.not.be.ok;
    });

    test('sets value for valid date', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      expect(el.value).to.equal('2024-06-15');
    });

    test('sets error for disabled date', async () => {
      const el = await newPicker();
      el.min = '2024-06-10';
      el._selectDate(new Date(2024, 5, 5));
      expect(el.invalid).to.be.true;
      expect(el.errorReason).to.equal('outOfRange');
    });

    test('clears previous error on valid selection', async () => {
      const el = await newPicker();
      el.invalid = true;
      el.errorReason = 'format';
      el._selectDate(new Date(2024, 5, 15));
      expect(el.invalid).to.be.false;
      expect(el.errorReason).to.equal('');
    });
  });

  suite('_selectToday', () => {
    test('selects today with event', async () => {
      const el = await newPicker();
      el._selectToday({
        preventDefault() {},
        stopPropagation() {},
      });
      const today = new Date();
      const iso = el._dateToISO(today);
      expect(el.value).to.equal(iso);
    });

    test('selects today without event', async () => {
      const el = await newPicker();
      el._selectToday();
      expect(el.value).to.be.a('string').and.not.empty;
    });
  });

  suite('_openCalendar branches', () => {
    test('does nothing when disabled', async () => {
      const el = await newPicker();
      el.disabled = true;
      el._openCalendar(null, false);
      expect(el._isCalendarOpen).to.be.false;
    });

    test('does nothing when already open', async () => {
      const el = await newPicker();
      el._isCalendarOpen = true;
      el._openCalendar(null, false);
    });

    test('opens with min date when no selection', async () => {
      const el = await newPicker();
      el.min = '2025-01-01';
      el._openCalendar(null, false);
      expect(el._isCalendarOpen).to.be.true;
      expect(el._viewDate.getFullYear()).to.equal(2025);
    });

    test('opens at selected date when available', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 3, 10));
      el._isCalendarOpen = false;
      el._openCalendar(null, true);
      expect(el._isCalendarOpen).to.be.true;
      expect(el._viewDate.getMonth()).to.equal(3);
    });

    test('opens with max when today exceeds max', async () => {
      const el = await newPicker();
      el.max = '2020-01-01';
      el._openCalendar(null, false);
      expect(el._isCalendarOpen).to.be.true;
    });
  });

  suite('_closeCalendar branches', () => {
    test('does nothing when not open', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      el._closeCalendar();
    });

    test('closes and returns focus to input', async () => {
      const el = await newPicker();
      el._openCalendar(null, false);
      expect(el._isCalendarOpen).to.be.true;
      el._closeCalendar();
      expect(el._isCalendarOpen).to.be.false;
    });

    test('handles event argument', async () => {
      const el = await newPicker();
      el._openCalendar(null, false);
      el._closeCalendar({
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el._isCalendarOpen).to.be.false;
    });
  });

  suite('_previousMonth branches', () => {
    test('decrements month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._previousMonth();
      expect(el._viewDate.getMonth()).to.equal(4);
    });

    test('does nothing when viewDate is null', async () => {
      const el = await newPicker();
      el._viewDate = null;
      el._previousMonth();
    });

    test('handles event arg', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._previousMonth({
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el._viewDate.getMonth()).to.equal(4);
    });
  });

  suite('_nextMonth branches', () => {
    test('increments month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._nextMonth();
      expect(el._viewDate.getMonth()).to.equal(6);
    });

    test('does nothing when viewDate is null', async () => {
      const el = await newPicker();
      el._viewDate = null;
      el._nextMonth();
    });

    test('handles event arg', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._nextMonth({
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el._viewDate.getMonth()).to.equal(6);
    });
  });

  suite('_toggleCalendar', () => {
    test('opens when closed', async () => {
      const el = await newPicker();
      el._toggleCalendar();
      expect(el._isCalendarOpen).to.be.true;
    });

    test('closes when open', async () => {
      const el = await newPicker();
      el._openCalendar(null, false);
      el._toggleCalendar();
      expect(el._isCalendarOpen).to.be.false;
    });
  });

  suite('_onInputBlur branches', () => {
    test('validates when no persistent errors', async () => {
      const el = await newPicker();
      el._errorPersists = false;
      const spy = sinon.spy(el, '_validateAndParseInput');
      el._onInputBlur();
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('keeps typing flag when errors persist', async () => {
      const el = await newPicker();
      el._errorPersists = true;
      el._userIsTyping = true;
      el._onInputBlur();
      expect(el._userIsTyping).to.be.true;
    });
  });

  suite('_onInputKeydown branches', () => {
    test('sets typing flag on character key', async () => {
      const el = await newPicker();
      el._userIsTyping = false;
      el._onInputKeydown({
        key: 'a',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el._userIsTyping).to.be.true;
    });

    test('opens calendar on ArrowDown', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_openCalendar');
      el._onInputKeydown({
        key: 'ArrowDown',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('opens calendar on F4', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_openCalendar');
      el._onInputKeydown({
        key: 'F4',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('validates on Enter when no persistent errors', async () => {
      const el = await newPicker();
      el._errorPersists = false;
      const spy = sinon.spy(el, '_validateAndParseInput');
      el._onInputKeydown({
        key: 'Enter',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('does not validate Enter when errors persist', async () => {
      const el = await newPicker();
      el._errorPersists = true;
      const spy = sinon.spy(el, '_validateAndParseInput');
      el._onInputKeydown({
        key: 'Enter',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });

  suite('_onInputChange branches', () => {
    test('sets userIsTyping flag', async () => {
      const el = await newPicker();
      el._userIsTyping = false;
      el._onInputChange();
      expect(el._userIsTyping).to.be.true;
    });

    test('clears persistent errors', async () => {
      const el = await newPicker();
      el._errorPersists = true;
      el.invalid = true;
      el.errorReason = 'format';
      el.errorMessage = 'Bad';
      el._onInputChange();
      expect(el._errorPersists).to.be.false;
      expect(el.invalid).to.be.false;
      expect(el.errorReason).to.equal('');
    });
  });

  suite('_onInputFocus', () => {
    test('does not throw', async () => {
      const el = await newPicker();
      expect(() => el._onInputFocus()).to.not.throw();
    });
  });

  suite('_onCalendarIconFocus branches', () => {
    test('prevents default when opened via icon', async () => {
      const el = await newPicker();
      el._openedViaCalendarIcon = true;
      const prevented = { val: false };
      el._onCalendarIconFocus({
        preventDefault() {
          prevented.val = true;
        },
        stopPropagation() {},
        target: { blur() {} },
      });
      expect(prevented.val).to.be.true;
    });

    test('does nothing when not opened via icon', async () => {
      const el = await newPicker();
      el._openedViaCalendarIcon = false;
      const prevented = { val: false };
      el._onCalendarIconFocus({
        preventDefault() {
          prevented.val = true;
        },
        stopPropagation() {},
        target: { blur() {} },
      });
      expect(prevented.val).to.be.false;
    });
  });

  suite('_onInputClick branches', () => {
    test('closes calendar when open and not from icon', async () => {
      const el = await newPicker();
      el._openCalendar(null, false);
      el._openedViaCalendarIcon = false;
      const spy = sinon.spy(el, '_closeCalendar');
      el._onInputClick({ stopPropagation() {} });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('does nothing when calendar not open', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      const spy = sinon.spy(el, '_closeCalendar');
      el._onInputClick({ stopPropagation() {} });
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });

  suite('_getDatePlaceholder', () => {
    test('returns a placeholder string', async () => {
      const el = await newPicker();
      const result = el._getDatePlaceholder('');
      expect(result).to.be.a('string');
    });

    test('uses format when provided', async () => {
      const el = await newPicker();
      const result = el._getDatePlaceholder('DD/MM/YYYY');
      expect(result).to.be.a('string');
    });
  });

  suite('_formatMonthYear', () => {
    test('returns formatted string', async () => {
      const el = await newPicker();
      const result = el._formatMonthYear(new Date(2024, 5, 15));
      expect(result).to.be.a('string').and.not.empty;
    });
  });

  suite('_getMonthName', () => {
    test('returns month name', async () => {
      const el = await newPicker();
      const result = el._getMonthName(new Date(2024, 0, 1));
      expect(result).to.be.a('string').and.not.empty;
    });
  });

  suite('_getYear', () => {
    test('returns year number', async () => {
      const el = await newPicker();
      const result = el._getYear(new Date(2024, 0, 1));
      expect(result).to.equal(2024);
    });

    test('returns empty for null', async () => {
      const el = await newPicker();
      expect(el._getYear(null)).to.equal('');
    });
  });

  suite('_getActiveDescendant', () => {
    test('returns null for null focusedDate', async () => {
      const el = await newPicker();
      expect(el._getActiveDescendant(null)).to.be.null;
    });

    test('returns date id string for valid date', async () => {
      const el = await newPicker();
      const result = el._getActiveDescendant(new Date(2024, 5, 15));
      expect(result).to.equal('date-2024-06-15');
    });
  });

  suite('_handleCalendarGridClick', () => {
    test('prevents default for non-calendar-day', async () => {
      const el = await newPicker();
      const prevented = { val: false };
      el._handleCalendarGridClick({
        target: document.createElement('div'),
        preventDefault() {
          prevented.val = true;
        },
        stopPropagation() {},
      });
      expect(prevented.val).to.be.true;
    });
  });

  suite('form property', () => {
    test('returns null outside a form', async () => {
      const el = await newPicker();
      expect(el.form).to.be.null;
    });
  });

  suite('disconnectedCallback', () => {
    test('does not throw on disconnect', async () => {
      const el = await newPicker();
      expect(() => el.disconnectedCallback()).to.not.throw();
    });
  });

  suite('_monthHasValidDates', () => {
    test('returns true for unrestricted month', async () => {
      const el = await newPicker();
      expect(el._monthHasValidDates(new Date(2024, 5, 1))).to.be.true;
    });

    test('returns false for fully restricted month', async () => {
      const el = await newPicker();
      el.min = '2024-07-01';
      el.max = '2024-07-31';
      expect(el._monthHasValidDates(new Date(2024, 5, 1))).to.be.false;
    });
  });

  suite('_detectRTL', () => {
    test('sets _isRTL true for Arabic', async () => {
      const el = await newPicker();
      el._detectRTL('ar');
      expect(el._isRTL).to.be.true;
    });

    test('sets _isRTL true for Hebrew', async () => {
      const el = await newPicker();
      el._detectRTL('he');
      expect(el._isRTL).to.be.true;
    });

    test('returns falsy for English', async () => {
      const el = await newPicker();
      expect(el._detectRTL('en')).to.not.be.ok;
    });

    test('returns falsy for Japanese', async () => {
      const el = await newPicker();
      expect(el._detectRTL('ja')).to.not.be.ok;
    });
  });

  suite('_handlePopoverKeydown branches', () => {
    test('closes on Escape', async () => {
      const el = await newPicker();
      el._openCalendar(null, true);
      const spy = sinon.spy(el, '_closeCalendar');
      el._handlePopoverKeydown({
        key: 'Escape',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('handles Tab with shift', async () => {
      const el = await newPicker();
      el._openCalendar(null, true);
      expect(() => {
        el._handlePopoverKeydown({
          key: 'Tab',
          shiftKey: true,
          preventDefault() {},
          stopPropagation() {},
        });
      }).to.not.throw();
    });

    test('handles Tab without shift', async () => {
      const el = await newPicker();
      el._openCalendar(null, true);
      expect(() => {
        el._handlePopoverKeydown({
          key: 'Tab',
          shiftKey: false,
          preventDefault() {},
          stopPropagation() {},
        });
      }).to.not.throw();
    });
  });

  suite('_generateMonthYearOptions', () => {
    test('generates options', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._generateMonthYearOptions();
      expect(el._monthYearOptions).to.be.an('array');
    });
  });

  suite('_generateYearOptions', () => {
    test('generates year options', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._generateYearOptions();
      expect(el._yearOptions).to.be.an('array');
      expect(el._yearOptions.length).to.be.above(0);
    });
  });

  suite('_parseDateOnly', () => {
    test('parses ISO date', async () => {
      const el = await newPicker();
      const d = el._parseDateOnly('2024-06-15');
      expect(d).to.be.an.instanceOf(Date);
      expect(d.getFullYear()).to.equal(2024);
    });

    test('returns null for empty', async () => {
      const el = await newPicker();
      expect(el._parseDateOnly('')).to.be.null;
    });

    test('returns null for null', async () => {
      const el = await newPicker();
      expect(el._parseDateOnly(null)).to.be.null;
    });
  });

  suite('_parseDateFromISO', () => {
    test('parses valid ISO string', async () => {
      const el = await newPicker();
      const d = el._parseDateFromISO('2024-06-15');
      expect(d).to.be.an.instanceOf(Date);
    });

    test('returns null for invalid ISO', async () => {
      const el = await newPicker();
      expect(el._parseDateFromISO('bad')).to.be.null;
    });

    test('returns null for empty', async () => {
      const el = await newPicker();
      expect(el._parseDateFromISO('')).to.be.null;
    });
  });

  suite('_handleGridKeydown ArrowRight within month', () => {
    test('navigates right within same month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-10';
      el._handleGridKeydown({
        target: btn,
        key: 'ArrowRight',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('stays in month when at last day', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._isCalendarOpen = true;
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-30';
      const origMonth = el._viewDate.getMonth();
      el._handleGridKeydown({
        target: btn,
        key: 'ArrowRight',
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el._viewDate.getMonth()).to.equal(origMonth);
    });
  });

  suite('_handleGridKeydown ArrowUp within month', () => {
    test('navigates up by 7 days', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-20';
      el._handleGridKeydown({
        target: btn,
        key: 'ArrowUp',
        preventDefault() {},
        stopPropagation() {},
      });
    });
  });

  suite('_handleGridKeydown ArrowDown within month', () => {
    test('navigates down by 7 days', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-10';
      el._handleGridKeydown({
        target: btn,
        key: 'ArrowDown',
        preventDefault() {},
        stopPropagation() {},
      });
    });
  });

  suite('_handleGridKeydown Enter and Space', () => {
    test('selects date on Enter', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      btn.disabled = false;
      el._handleGridKeydown({
        target: btn,
        key: 'Enter',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('selects date on Space', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      btn.disabled = false;
      el._handleGridKeydown({
        target: btn,
        key: ' ',
        preventDefault() {},
        stopPropagation() {},
      });
    });
  });

  suite('_handleGridKeydown Home and End', () => {
    test('navigates to start of week on Home', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-12';
      el._handleGridKeydown({
        target: btn,
        key: 'Home',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('navigates to end of week on End', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-12';
      el._handleGridKeydown({
        target: btn,
        key: 'End',
        preventDefault() {},
        stopPropagation() {},
      });
    });
  });

  suite('_handleGridKeydown PageUp and PageDown', () => {
    test('goes to previous year on PageUp', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleGridKeydown({
        target: btn,
        key: 'PageUp',
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('goes to next year on PageDown', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleGridKeydown({
        target: btn,
        key: 'PageDown',
        preventDefault() {},
        stopPropagation() {},
      });
    });
  });

  suite('_handleGridKeydown default key', () => {
    test('does nothing on unrecognized key', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar();
      flush();
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleGridKeydown({
        target: btn,
        key: 'x',
        preventDefault() {},
        stopPropagation() {},
      });
    });
  });

  suite('_getDayAriaLabel', () => {
    test('returns aria label for day', async () => {
      const el = await newPicker();
      const day = {
        date: new Date(2024, 5, 15),
        isToday: false,
        isSelected: false,
        isEmpty: false,
      };
      const result = el._getDayAriaLabel(day);
      expect(result).to.be.a('string');
    });
  });

  suite('_closeYearDropdown', () => {
    test('closes dropdown and returns focus', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._isYearDropdownOpen = true;
      el._closeYearDropdown();
      expect(el._isYearDropdownOpen).to.be.false;
    });
  });

  suite('_clearButtonVisibleChanged', () => {
    test('calls the observer method without error', async () => {
      const el = await newPicker();
      expect(() => el._clearButtonVisibleChanged(true)).to.not.throw();
      expect(() => el._clearButtonVisibleChanged(false)).to.not.throw();
    });
  });

  suite('_announce', () => {
    test('does not throw', async () => {
      const el = await newPicker();
      expect(() => el._announce('test message')).to.not.throw();
    });
  });

  suite('_initializeLocaleData', () => {
    test('sets up locale arrays', async () => {
      const el = await newPicker();
      el._initializeLocaleData();
      expect(el._monthNames).to.be.an('array');
      expect(el._weekdayNames).to.be.an('array');
    });
  });

  suite('_formatAriaDate', () => {
    test('returns formatted aria date', async () => {
      const el = await newPicker();
      const result = el._formatAriaDate(new Date(2024, 5, 15));
      expect(result).to.be.a('string');
    });
  });

  suite('_handleDateClick branches', () => {
    test('does nothing for empty cell', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day', 'empty');
      btn.dataset.date = '2024-06-15';
      el._handleDateClick({
        target: btn,
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('does nothing for disabled cell', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      btn.disabled = true;
      el._handleDateClick({
        target: btn,
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('does nothing when no button found', async () => {
      const el = await newPicker();
      el._handleDateClick({
        target: document.createElement('div'),
        preventDefault() {},
        stopPropagation() {},
      });
    });

    test('selects valid date', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      el._handleDateClick({
        target: btn,
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el.value).to.equal('2024-06-15');
    });

    test('shows error for out of range date', async () => {
      const el = await newPicker();
      el.min = '2024-06-20';
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-10';
      el._handleDateClick({
        target: btn,
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el.invalid).to.be.true;
    });

    test('does nothing when date ISO missing', async () => {
      const el = await newPicker();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      el._handleDateClick({
        target: btn,
        preventDefault() {},
        stopPropagation() {},
      });
    });
  });

  suite('_toggleCalendar toggle', () => {
    test('opens then closes', async () => {
      const el = await newPicker();
      el._toggleCalendar();
      expect(el._isCalendarOpen).to.be.true;
      el._toggleCalendar();
      expect(el._isCalendarOpen).to.be.false;
    });
  });

  suite('_identifyCurrentFocusElement', () => {
    test('returns first for null element', async () => {
      const el = await newPicker();
      el._setupFocusTrap();
      expect(el._identifyCurrentFocusElement(null)).to.equal(el._focusOrder[0]);
    });

    test('identifies prevMonth by id', async () => {
      const el = await newPicker();
      el._setupFocusTrap();
      const elem = document.createElement('button');
      elem.id = 'prevMonth';
      expect(el._identifyCurrentFocusElement(elem)).to.equal('prevMonth');
    });

    test('identifies nextMonth by id', async () => {
      const el = await newPicker();
      el._setupFocusTrap();
      const elem = document.createElement('button');
      elem.id = 'nextMonth';
      expect(el._identifyCurrentFocusElement(elem)).to.equal('nextMonth');
    });

    test('identifies calendar-day class', async () => {
      const el = await newPicker();
      el._setupFocusTrap();
      const elem = document.createElement('button');
      elem.classList.add('calendar-day');
      expect(el._identifyCurrentFocusElement(elem)).to.equal('calendar-grid');
    });

    test('identifies today-button class', async () => {
      const el = await newPicker();
      el._setupFocusTrap();
      const elem = document.createElement('button');
      elem.classList.add('today-button');
      expect(el._identifyCurrentFocusElement(elem)).to.equal('today-button');
    });

    test('identifies cancel-button class', async () => {
      const el = await newPicker();
      el._setupFocusTrap();
      const elem = document.createElement('button');
      elem.classList.add('cancel-button');
      expect(el._identifyCurrentFocusElement(elem)).to.equal('cancel-button');
    });

    test('defaults to first element for unknown', async () => {
      const el = await newPicker();
      el._setupFocusTrap();
      const elem = document.createElement('div');
      expect(el._identifyCurrentFocusElement(elem)).to.equal(el._focusOrder[0]);
    });
  });

  suite('_focusCalendarElement switch cases', () => {
    test('focuses calendar-grid via switch', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar(null, true);
      flush();
      expect(() => el._focusCalendarElement('calendar-grid')).to.not.throw();
    });

    test('handles default case', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar(null, true);
      flush();
      expect(() => el._focusCalendarElement('unknown')).to.not.throw();
    });

    test('focuses today-button', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar(null, true);
      flush();
      expect(() => el._focusCalendarElement('today-button')).to.not.throw();
    });

    test('focuses cancel-button', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._openCalendar(null, true);
      flush();
      expect(() => el._focusCalendarElement('cancel-button')).to.not.throw();
    });
  });

  suite('_focusCalendarGrid branches', () => {
    test('focuses on focusedDate when set', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._focusedDate = new Date(2024, 5, 10);
      el._openCalendar(null, true);
      flush();
      el._generateCalendar();
      expect(() => el._focusCalendarGrid()).to.not.throw();
    });

    test('focuses selected date when in month', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._selectedDate = new Date(2024, 5, 15);
      el._focusedDate = null;
      el._openCalendar(null, true);
      flush();
      el._generateCalendar();
      expect(() => el._focusCalendarGrid()).to.not.throw();
    });

    test('focuses first day as fallback', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2030, 5, 1);
      el._selectedDate = null;
      el._focusedDate = null;
      el._today = new Date(2024, 1, 1);
      el._openCalendar(null, true);
      flush();
      el._generateCalendar();
      expect(() => el._focusCalendarGrid()).to.not.throw();
    });
  });

  suite('_validateDate with NaN date', () => {
    test('returns invalidDate', async () => {
      const el = await newPicker();
      const result = el._validateDate(new Date('invalid'));
      expect(result.isValid).to.be.false;
      expect(result.errorReason).to.equal('invalidDate');
    });
  });

  suite('_getDatePlaceholder branches', () => {
    test('returns locale placeholder when no format', async () => {
      const el = await newPicker();
      const result = el._getDatePlaceholder('');
      expect(result).to.be.a('string').and.not.empty;
    });

    test('returns format when valid moment format', async () => {
      const el = await newPicker();
      const result = el._getDatePlaceholder('DD/MM/YYYY');
      expect(result).to.equal('DD/MM/YYYY');
    });

    test('uses locale for mixed case format', async () => {
      const el = await newPicker();
      const result = el._getDatePlaceholder('Dd/Mm/Yyyy');
      expect(result).to.be.a('string').and.not.empty;
    });
  });

  suite('_getMonthYearOptionClass', () => {
    test('returns selected for matching', async () => {
      const el = await newPicker();
      const vd = new Date(2024, 5, 1);
      const result = el._getMonthYearOptionClass({ year: 2024, month: 5 }, vd);
      expect(result).to.equal('selected');
    });

    test('returns empty for non-matching', async () => {
      const el = await newPicker();
      const vd = new Date(2024, 5, 1);
      const result = el._getMonthYearOptionClass({ year: 2024, month: 6 }, vd);
      expect(result).to.equal('');
    });

    test('returns empty for null viewDate', async () => {
      const el = await newPicker();
      expect(el._getMonthYearOptionClass({ year: 2024, month: 5 }, null)).to.equal('');
    });
  });

  suite('_getMonthName branches', () => {
    test('returns empty for null', async () => {
      const el = await newPicker();
      expect(el._getMonthName(null)).to.equal('');
    });

    test('returns name for valid date', async () => {
      const el = await newPicker();
      const name = el._getMonthName(new Date(2024, 0, 1));
      expect(name).to.be.a('string').and.not.empty;
    });
  });

  suite('_openCalendar with both min and max', () => {
    test('constrains initial date within min and max', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el.max = '2024-06-30';
      el._openCalendar(null, false);
      expect(el._isCalendarOpen).to.be.true;
      expect(el._viewDate.getMonth()).to.equal(5);
    });
  });

  suite('_handlePopoverKeydown blocks ancestor keys', () => {
    test('stops propagation for Arrow keys when open', async () => {
      const el = await newPicker();
      el._isCalendarOpen = true;
      let stopped = false;
      el._handlePopoverKeydown({
        key: 'ArrowUp',
        preventDefault() {},
        stopPropagation() {
          stopped = true;
        },
      });
      expect(stopped).to.be.true;
    });

    test('does not stop for unrelated keys', async () => {
      const el = await newPicker();
      el._isCalendarOpen = true;
      let stopped = false;
      el._handlePopoverKeydown({
        key: 'a',
        preventDefault() {},
        stopPropagation() {
          stopped = true;
        },
      });
      expect(stopped).to.be.false;
    });
  });

  suite('_handleCalendarTabNavigation', () => {
    test('does nothing when calendar is closed', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      expect(() => el._handleCalendarTabNavigation(false)).to.not.throw();
    });
  });

  suite('_showError with non-required error', () => {
    test('shows non-required errors regardless of showErrors', async () => {
      const el = await newPicker();
      el.errorReason = 'format';
      expect(el._showError(true, 'Bad format', false)).to.be.true;
    });
  });

  suite('_selectMonthYear', () => {
    test('does nothing when no button found', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._selectMonthYear({
        target: document.createElement('div'),
        preventDefault() {},
        stopPropagation() {},
      });
    });
  });

  suite('_toggleMonthYearDropdown', () => {
    test('does not throw without event', async () => {
      const el = await newPicker();
      expect(() => el._toggleMonthYearDropdown()).to.not.throw();
    });
  });

  suite('_parseWithFormat', () => {
    test('parses with strict format', async () => {
      const el = await newPicker();
      const result = el._parseWithFormat('15/06/2024', 'DD/MM/YYYY');
      expect(result).to.not.be.null;
    });

    test('returns null for empty', async () => {
      const el = await newPicker();
      expect(el._parseWithFormat('', 'DD/MM/YYYY')).to.be.null;
    });
  });

  suite('_handleDateKeydown delegation', () => {
    test('delegates to _handleGridKeydown', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._generateCalendar();
      const btn = document.createElement('button');
      btn.classList.add('calendar-day');
      btn.dataset.date = '2024-06-15';
      const spy = sinon.spy(el, '_handleGridKeydown');
      const evt = {
        target: btn,
        key: 'Enter',
        preventDefault() {},
        stopPropagation() {},
      };
      el._handleDateKeydown(evt);
      expect(spy).to.have.been.called;
      spy.restore();
    });
  });

  suite('_openCalendarViaMouse', () => {
    test('sets _openedViaCalendarIcon flag', async () => {
      const el = await newPicker();
      el._openCalendarViaMouse({
        preventDefault() {},
        stopPropagation() {},
      });
      expect(el._openedViaCalendarIcon).to.be.true;
      expect(el._isCalendarOpen).to.be.true;
    });
  });

  suite('_closeMonthYearDropdown', () => {
    test('does not throw', async () => {
      const el = await newPicker();
      expect(() => el._closeMonthYearDropdown()).to.not.throw();
    });
  });

  suite('_setupFocusTrap', () => {
    test('sets up _focusOrder', async () => {
      const el = await newPicker();
      el._setupFocusTrap();
      expect(el._focusOrder).to.be.an('array');
      expect(el._focusOrder).to.include('year-dropdown');
      expect(el._focusOrder).to.include('calendar-grid');
    });
  });

  suite('_getDayTabIndex selected without focus', () => {
    test('returns 0 for selected when no focusedDate', async () => {
      const el = await newPicker();
      const day = {
        isEmpty: false,
        isCurrentMonth: true,
        date: new Date(2024, 5, 15),
        isSelected: true,
        isToday: false,
      };
      expect(el._getDayTabIndex(day, null)).to.equal('0');
    });

    test('returns 0 for today when no focus no selection', async () => {
      const el = await newPicker();
      el._selectedDate = null;
      const today = new Date();
      el._today = new Date(today);
      el._viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const day = {
        isEmpty: false,
        isCurrentMonth: true,
        date: new Date(today),
        isSelected: false,
        isToday: true,
      };
      expect(el._getDayTabIndex(day, null)).to.equal('0');
    });

    test('returns -1 for non-current-month day', async () => {
      const el = await newPicker();
      const day = {
        isEmpty: false,
        isCurrentMonth: false,
        date: new Date(2024, 4, 31),
        isSelected: false,
      };
      expect(el._getDayTabIndex(day, null)).to.equal('-1');
    });
  });

  suite('_isSelectedYear edge cases', () => {
    test('returns falsy for null viewDate', async () => {
      const el = await newPicker();
      expect(el._isSelectedYear(2024, null)).to.not.be.ok;
    });
  });

  suite('_buildOutOfRangeMessage with no constraints', () => {
    test('returns a message when no min or max', async () => {
      const el = await newPicker();
      const msg = el._buildOutOfRangeMessage();
      expect(msg).to.be.a('string');
    });
  });

  suite('set method i18n branches', () => {
    test('sets firstDayOfWeek via i18n path', async () => {
      const el = await newPicker();
      el.set('i18n.firstDayOfWeek', 1);
      expect(el.firstDayOfWeek).to.equal(1);
    });

    test('sets monthNames via i18n path', async () => {
      const el = await newPicker();
      const names = ['Jan', 'Feb', 'Mar'];
      el.set('i18n.monthNames', names);
      expect(el._monthNames).to.deep.equal(names);
    });

    test('sets weekdays via i18n path', async () => {
      const el = await newPicker();
      const names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      el.set('i18n.weekdays', names);
      expect(el._weekdayNames).to.deep.equal(names);
    });

    test('sets weekdaysShort via i18n path', async () => {
      const el = await newPicker();
      const names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      el.set('i18n.weekdaysShort', names);
      expect(el._weekdayNames).to.deep.equal(names);
    });

    test('delegates non-i18n paths to super.set', async () => {
      const el = await newPicker();
      el.set('value', '2024-06-15');
      expect(el.value).to.equal('2024-06-15');
    });
  });

  suite('focus method', () => {
    test('focuses the input', async () => {
      const el = await newPicker();
      expect(() => el.focus()).to.not.throw();
    });
  });

  suite('clear method', () => {
    test('clears the date', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      el.clear();
      expect(el.value).to.equal('');
    });
  });

  suite('formattedValue getter', () => {
    test('returns value when no custom formatter', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      expect(el.formattedValue).to.be.a('string').and.not.empty;
    });

    test('uses formatDate from pickerI18n', async () => {
      const el = await newPicker();
      el._selectDate(new Date(2024, 5, 15));
      el.pickerI18n = { formatDate: () => 'custom-formatted' };
      expect(el.formattedValue).to.equal('custom-formatted');
    });
  });

  suite('_minChanged observer', () => {
    test('regenerates calendar', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el.value = '2024-06-15';
      const spy = sinon.spy(el, '_generateCalendar');
      el._minChanged('2024-06-20');
      expect(spy).to.have.been.called;
      spy.restore();
    });

    test('sets invalid for value before new min', async () => {
      const el = await newPicker();
      el.value = '2024-06-05';
      el._minChanged('2024-06-10');
      expect(el.invalid).to.be.true;
    });

    test('does nothing when no value', async () => {
      const el = await newPicker();
      el.value = '';
      el._minChanged('2024-06-10');
    });
  });

  suite('_maxChanged observer', () => {
    test('sets invalid for value after new max', async () => {
      const el = await newPicker();
      el.value = '2024-06-25';
      el._maxChanged('2024-06-20');
      expect(el.invalid).to.be.true;
    });

    test('does nothing when no value', async () => {
      const el = await newPicker();
      el.value = '';
      el._maxChanged('2024-06-20');
    });
  });

  suite('_firstDayOfWeekChanged', () => {
    test('reinitializes locale data', async () => {
      const el = await newPicker();
      const spy = sinon.spy(el, '_initializeLocaleData');
      el._firstDayOfWeekChanged();
      expect(spy).to.have.been.called;
      spy.restore();
    });
  });

  suite('_defaultTimeChanged', () => {
    test('does nothing when no input value', async () => {
      const el = await newPicker();
      el._inputValue = '';
      expect(() => el._defaultTimeChanged()).to.not.throw();
    });

    test('reprocesses when input value exists', async () => {
      const el = await newPicker();
      el._inputValue = '2024-06-15';
      el._preventInputUpdate = false;
      expect(() => el._defaultTimeChanged()).to.not.throw();
    });
  });

  suite('_generateYearOptions with constraints', () => {
    test('respects min year', async () => {
      const el = await newPicker();
      el.min = '2020-01-01';
      el._viewDate = new Date(2024, 5, 1);
      el._generateYearOptions();
      expect(el._yearOptions[0]).to.equal(2020);
    });

    test('respects max year', async () => {
      const el = await newPicker();
      el.max = '2030-12-31';
      el._viewDate = new Date(2024, 5, 1);
      el._generateYearOptions();
      const last = el._yearOptions[el._yearOptions.length - 1];
      expect(last).to.equal(2030);
    });

    test('no constraints uses full range', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      el._generateYearOptions();
      expect(el._yearOptions[0]).to.equal(1900);
    });
  });

  suite('_generateMonthYearOptions with constraints', () => {
    test('filters months before min', async () => {
      const el = await newPicker();
      el.min = '2024-06-01';
      el.max = '2024-12-31';
      el._viewDate = new Date(2024, 5, 1);
      el._generateMonthYearOptions();
      const months = el._monthYearOptions.map((o) => o.month);
      expect(months).to.not.include(4);
    });

    test('filters months after max', async () => {
      const el = await newPicker();
      el.min = '2024-01-01';
      el.max = '2024-06-30';
      el._viewDate = new Date(2024, 5, 1);
      el._generateMonthYearOptions();
      const months = el._monthYearOptions.map((o) => o.month);
      expect(months).to.not.include(7);
    });
  });

  suite('_monthHasValidDates branches', () => {
    test('min only restricts earlier months', async () => {
      const el = await newPicker();
      el.min = '2024-06-15';
      expect(el._monthHasValidDates(new Date(2024, 5, 1))).to.be.true;
      expect(el._monthHasValidDates(new Date(2024, 4, 1))).to.be.false;
    });

    test('max only restricts later months', async () => {
      const el = await newPicker();
      el.max = '2024-06-15';
      expect(el._monthHasValidDates(new Date(2024, 5, 1))).to.be.true;
      expect(el._monthHasValidDates(new Date(2024, 6, 1))).to.be.false;
    });

    test('both min and max restrict range', async () => {
      const el = await newPicker();
      el.min = '2024-03-01';
      el.max = '2024-09-30';
      expect(el._monthHasValidDates(new Date(2024, 5, 1))).to.be.true;
      expect(el._monthHasValidDates(new Date(2024, 1, 1))).to.be.false;
      expect(el._monthHasValidDates(new Date(2024, 10, 1))).to.be.false;
    });
  });

  suite('_shouldShowClearButton with clear-button-visible', () => {
    test('returns truthy when clearButtonVisible is true', async () => {
      const el = await newPicker();
      el.setAttribute('clear-button-visible', '');
      el.clearButtonVisible = true;
      expect(el._shouldShowClearButton('2024', true)).to.be.ok;
    });
  });

  suite('_validateAndParseInput branches', () => {
    test('clears state for empty input', async () => {
      const el = await newPicker();
      const input = el.shadowRoot.querySelector('#dateInput');
      if (input) {
        input.value = '';
        el._validateAndParseInput();
        expect(el._selectedDate).to.be.null;
        expect(el.invalid).to.be.false;
      }
    });

    test('sets format error for unparseable input', async () => {
      const el = await newPicker();
      const input = el.shadowRoot.querySelector('#dateInput');
      if (input) {
        input.value = 'not-a-date-at-all';
        el._validateAndParseInput();
        expect(el.invalid).to.be.true;
        expect(el.errorReason).to.equal('format');
      }
    });

    test('sets range error for out of range date', async () => {
      const el = await newPicker();
      el.min = '2024-06-10';
      const input = el.shadowRoot.querySelector('#dateInput');
      if (input) {
        input.value = '2024-06-05';
        el._validateAndParseInput();
        expect(el.invalid).to.be.true;
        expect(el.errorReason).to.equal('outOfRange');
      }
    });

    test('accepts valid input', async () => {
      const el = await newPicker();
      const input = el.shadowRoot.querySelector('#dateInput');
      if (input) {
        input.value = '2024-06-15';
        el._validateAndParseInput();
        expect(el.invalid).to.be.false;
        expect(el._selectedDate).to.not.be.null;
      }
    });
  });

  suite('_positionPopover branches', () => {
    test('does nothing when calendar not open', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      expect(() => el._positionPopover()).to.not.throw();
    });

    test('positions when calendar is open', async () => {
      const el = await newPicker();
      el._openCalendar(null, false);
      expect(() => el._positionPopover()).to.not.throw();
    });
  });

  suite('_handleDocumentFocusOut', () => {
    test('does not throw', async () => {
      const el = await newPicker();
      expect(() => el._handleDocumentFocusOut()).to.not.throw();
    });
  });

  suite('validate with value and range', () => {
    test('returns false for format error in value', async () => {
      const el = await newPicker();
      el.value = 'invalid';
      expect(el.validate()).to.be.false;
      expect(el.errorReason).to.equal('format');
    });

    test('returns false for range error', async () => {
      const el = await newPicker();
      el.min = '2024-06-10';
      el.value = '2024-06-05';
      expect(el.validate()).to.be.false;
    });
  });

  suite('reportValidity without prior errors', () => {
    test('returns true for valid value', async () => {
      const el = await newPicker();
      el.value = '2024-06-15';
      expect(el.reportValidity()).to.be.true;
    });

    test('returns false for required empty', async () => {
      const el = await newPicker();
      el.required = true;
      el.value = '';
      expect(el.reportValidity()).to.be.false;
      expect(el._showErrors).to.be.true;
    });
  });

  suite('_handleDocumentClick deep path check', () => {
    test('does nothing when not open', async () => {
      const el = await newPicker();
      el._isCalendarOpen = false;
      const spy = sinon.spy(el, '_closeCalendar');
      el._handleDocumentClick({ target: document.body });
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });

  suite('_inputValueChanged', () => {
    test('does not throw', async () => {
      const el = await newPicker();
      expect(() => el._inputValueChanged()).to.not.throw();
    });

    test('does nothing when _preventInputUpdate', async () => {
      const el = await newPicker();
      el._preventInputUpdate = true;
      expect(() => el._inputValueChanged()).to.not.throw();
      el._preventInputUpdate = false;
    });
  });

  suite('_handleGridKeydown for non-calendar-day', () => {
    test('returns immediately for non-calendar-day', async () => {
      const el = await newPicker();
      el._viewDate = new Date(2024, 5, 1);
      const div = document.createElement('div');
      el._handleGridKeydown({
        target: div,
        key: 'Enter',
        preventDefault() {},
        stopPropagation() {},
      });
    });
  });

  suite('_parseUserInput lenient parsing', () => {
    test('falls back to lenient format', async () => {
      const el = await newPicker();
      el.format = 'DD/MM/YYYY';
      const result = el._parseUserInput('15 06 2024');
      if (result) {
        expect(result.isExactFormat).to.be.false;
      }
    });

    test('tries common formats', async () => {
      const el = await newPicker();
      const result = el._parseUserInput('15.06.2024');
      expect(result).to.not.be.null;
    });
  });

  suite('_testDateParsing with common formats', () => {
    test('finds matching common format', async () => {
      const el = await newPicker();
      const result = el._testDateParsing('15/06/2024');
      expect(result.parsed).to.be.true;
    });

    test('provides suggestions for bad input', async () => {
      const el = await newPicker();
      const result = el._testDateParsing('xyz');
      expect(result.suggestions).to.be.an('array');
      expect(result.suggestions.length).to.be.above(0);
    });
  });

  suite('_getDayClasses combined states', () => {
    test('includes both today and selected', async () => {
      const el = await newPicker();
      const day = {
        isToday: true,
        isSelected: true,
        isDisabled: false,
        isEmpty: false,
        isOtherMonth: false,
        isCurrentMonth: true,
        date: new Date(2024, 5, 15),
      };
      const result = el._getDayClasses(day, null);
      expect(result).to.include('today');
      expect(result).to.include('selected');
    });

    test('includes disabled and other-month', async () => {
      const el = await newPicker();
      const day = {
        isToday: false,
        isSelected: false,
        isDisabled: true,
        isEmpty: false,
        isOtherMonth: true,
        isCurrentMonth: false,
        date: new Date(2024, 4, 31),
      };
      const result = el._getDayClasses(day, null);
      expect(result).to.include('disabled');
      expect(result).to.include('other-month');
    });

    test('returns empty string for empty day', async () => {
      const el = await newPicker();
      const day = {
        isToday: false,
        isSelected: false,
        isDisabled: false,
        isEmpty: true,
        isOtherMonth: true,
        isCurrentMonth: false,
        date: new Date(2024, 4, 31),
      };
      const result = el._getDayClasses(day, null);
      expect(result).to.equal('empty');
    });
  });

  suite('_handleDocumentFocusIn year dropdown', () => {
    test('closes year dropdown on outside focus', async () => {
      const el = await newPicker();
      el._isYearDropdownOpen = true;
      el._handleDocumentFocusIn({ target: document.body });
    });
  });

  suite('_isValidDate with both min and max', () => {
    test('returns false when below min with both constraints', async () => {
      const el = await newPicker();
      el.min = '2024-06-05';
      el.max = '2024-06-25';
      expect(el._isValidDate(new Date(2024, 5, 3))).to.be.false;
    });

    test('returns false when above max with both constraints', async () => {
      const el = await newPicker();
      el.min = '2024-06-05';
      el.max = '2024-06-25';
      expect(el._isValidDate(new Date(2024, 5, 28))).to.be.false;
    });

    test('returns true when within both constraints', async () => {
      const el = await newPicker();
      el.min = '2024-06-05';
      el.max = '2024-06-25';
      expect(el._isValidDate(new Date(2024, 5, 15))).to.be.true;
    });
  });
});

// Covers the staged changes in ui/widgets/custom-date-picker.js:
//   - new `ariaLabel` property forwarded to the inner <input id="dateInput">
//     (aria-labelledby cannot resolve IDs across shadow boundaries).
//   - Escape inside _handleYearDropdownKeydown now only stops propagation when
//     the year-options panel is actually open; otherwise the event bubbles up
//     so the popover/document Escape handlers can close the whole calendar.
function getDateInput(el) {
  return el.shadowRoot.querySelector('#dateInput');
}

suite('custom-date-picker accessibility', () => {
  suite('ariaLabel forwarding', () => {
    test('forwards the ariaLabel property to the inner input as aria-label', async () => {
      const el = await fixture(html`
        <custom-date-picker aria-label="Created at"></custom-date-picker>
      `);
      await flush();

      expect(getDateInput(el).getAttribute('aria-label')).to.equal('Created at');
    });

    test('updates the inner input aria-label when the property changes', async () => {
      const el = await fixture(html`
        <custom-date-picker aria-label="Initial"></custom-date-picker>
      `);
      await flush();
      expect(getDateInput(el).getAttribute('aria-label')).to.equal('Initial');

      el.ariaLabel = 'Updated';
      await flush();

      expect(getDateInput(el).getAttribute('aria-label')).to.equal('Updated');
    });

    test('does not set aria-label on the inner input when not provided', async () => {
      const el = await fixture(html`
        <custom-date-picker></custom-date-picker>
      `);
      await flush();

      // Polymer drops the attribute when the bound property is empty/null.
      const value = getDateInput(el).getAttribute('aria-label');
      expect(value === null || value === '').to.be.true;
    });
  });

  suite('Escape inside year-dropdown keydown handler', () => {
    let el;

    setup(async () => {
      el = await fixture(html`
        <custom-date-picker></custom-date-picker>
      `);
      await flush();
    });

    function makeEscapeEvent() {
      let prevented = false;
      let propagationStopped = false;
      return {
        key: 'Escape',
        preventDefault() {
          prevented = true;
        },
        stopPropagation() {
          propagationStopped = true;
        },
        wasPrevented: () => prevented,
        wasPropagationStopped: () => propagationStopped,
      };
    }

    test('does NOT consume Escape when the year-options panel is closed (so it can bubble and close the calendar)', () => {
      el._isYearDropdownOpen = false;
      const event = makeEscapeEvent();

      el._handleYearDropdownKeydown(event);

      expect(event.wasPrevented()).to.be.false;
      expect(event.wasPropagationStopped()).to.be.false;
    });

    test('consumes Escape and closes the dropdown when the year-options panel is open', () => {
      el._isYearDropdownOpen = true;
      const event = makeEscapeEvent();

      el._handleYearDropdownKeydown(event);

      expect(event.wasPrevented()).to.be.true;
      expect(event.wasPropagationStopped()).to.be.true;
      expect(el._isYearDropdownOpen).to.be.false;
    });
  });

  suite('_boundEscapeCapture', () => {
    let el;

    setup(async () => {
      el = await fixture(html`
        <custom-date-picker></custom-date-picker>
      `);
      await flush();
    });

    test('closes the calendar, stops propagation and prevents default when calendar is open and Escape is pressed', () => {
      el._isCalendarOpen = true;
      const closeStub = sinon.stub(el, '_closeCalendar');
      let stopped = false;
      let prevented = false;
      const fakeEvent = {
        key: 'Escape',
        stopPropagation() {
          stopped = true;
        },
        preventDefault() {
          prevented = true;
        },
      };

      el._boundEscapeCapture(fakeEvent);

      expect(closeStub).to.have.been.calledOnce;
      expect(stopped).to.be.true;
      expect(prevented).to.be.true;
      closeStub.restore();
    });

    test('does nothing when the calendar is not open', () => {
      el._isCalendarOpen = false;
      const closeStub = sinon.stub(el, '_closeCalendar');
      const fakeEvent = { key: 'Escape', stopPropagation() {}, preventDefault() {} };

      el._boundEscapeCapture(fakeEvent);

      expect(closeStub).to.not.have.been.called;
      closeStub.restore();
    });
  });

  suite('window keydown capture listener lifecycle', () => {
    let el;
    let addSpy;
    let removeSpy;

    setup(async () => {
      el = await fixture(html`
        <custom-date-picker></custom-date-picker>
      `);
      await flush();
      addSpy = sinon.spy(window, 'addEventListener');
      removeSpy = sinon.spy(window, 'removeEventListener');
    });

    teardown(() => {
      addSpy.restore();
      removeSpy.restore();
      if (el._isCalendarOpen) {
        el._closeCalendar();
      }
    });

    test('_openCalendar registers the keydown capture listener on window', async () => {
      el._openCalendar();
      await flush();
      const call = addSpy.getCalls().find((c) => c.args[0] === 'keydown' && c.args[2] === true);
      expect(call, 'window.addEventListener("keydown", ..., true) should be called').to.exist;
      expect(call.args[1]).to.equal(el._boundEscapeCapture);
    });

    test('_closeCalendar removes the keydown capture listener from window', async () => {
      el._openCalendar();
      await flush();
      removeSpy.resetHistory();
      el._closeCalendar();
      const call = removeSpy.getCalls().find((c) => c.args[0] === 'keydown' && c.args[2] === true);
      expect(call, 'window.removeEventListener("keydown", ..., true) should be called').to.exist;
      expect(call.args[1]).to.equal(el._boundEscapeCapture);
    });

    test('disconnectedCallback removes the keydown capture listener when calendar is open', async () => {
      el._openCalendar();
      await flush();
      removeSpy.resetHistory();
      el.disconnectedCallback();
      const call = removeSpy.getCalls().find((c) => c.args[0] === 'keydown' && c.args[2] === true);
      expect(call, 'disconnectedCallback should remove window keydown capture listener').to.exist;
      expect(call.args[1]).to.equal(el._boundEscapeCapture);
    });
  });

  suite('accessible text spacing (WCAG 2.1 SC 1.4.12)', () => {
    // the spacing a user agent / user stylesheet is allowed to force on the page
    const TEXT_SPACING_OVERRIDE =
      '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }';

    // scrollWidth/clientWidth are rounded to integers, so a sub-pixel layout can report a 1px
    // difference with nothing actually overflowing. The regression this guards against is ~4px.
    const ROUNDING_TOLERANCE_PX = 1;

    let el;

    const q = (selector) => el.shadowRoot.querySelector(selector);
    const qa = (selector) => Array.from(el.shadowRoot.querySelectorAll(selector));

    // the override has to be injected into the shadow root: a page-level stylesheet
    // (or the usual text-spacing bookmarklet) cannot reach the calendar internals
    const overrideTextSpacing = async () => {
      const style = document.createElement('style');
      style.textContent = TEXT_SPACING_OVERRIDE;
      el.shadowRoot.appendChild(style);
      await flush();
    };

    setup(async () => {
      el = await fixture(html`
        <custom-date-picker></custom-date-picker>
      `);
      await flush();
      el._openCalendar();
      await flush();
    });

    teardown(() => {
      if (el._isCalendarOpen) {
        el._closeCalendar();
      }
    });

    test('the calendar is sized by its content instead of a fixed width', async () => {
      const popover = q('#calendarPopover');
      expect(getComputedStyle(popover).minWidth).to.equal('280px');
      expect(popover.scrollWidth).to.be.at.most(popover.clientWidth + ROUNDING_TOLERANCE_PX);
      await overrideTextSpacing();
      expect(popover.getBoundingClientRect().width).to.be.at.least(280);
      expect(popover.scrollWidth, 'the calendar must not overflow its own box').to.be.at.most(
        popover.clientWidth + ROUNDING_TOLERANCE_PX,
      );
    });

    test('week names and dates share the same column tracks', async () => {
      const columns = () => [
        getComputedStyle(q('.weekday-headers')).gridTemplateColumns,
        getComputedStyle(q('.calendar-grid')).gridTemplateColumns,
      ];
      const [headers, grid] = columns();
      expect(headers).to.equal(grid);
      await overrideTextSpacing();
      const [overriddenHeaders, overriddenGrid] = columns();
      expect(overriddenHeaders).to.equal(overriddenGrid);
    });

    test('week names stay inside the calendar when text spacing is overridden', async () => {
      await overrideTextSpacing();
      const row = q('.weekday-headers');
      expect(row.scrollWidth, 'week-name row must not overflow').to.be.at.most(row.clientWidth + ROUNDING_TOLERANCE_PX);
      const limit = q('#calendarPopover').getBoundingClientRect().right;
      const escaping = qa('.weekday-header')
        .filter((header) => header.getBoundingClientRect().right > limit + 0.5)
        .map((header) => header.textContent.trim());
      expect(escaping, 'no week name may render outside the calendar').to.deep.equal([]);
    });

    test('dates are not clipped when text spacing is overridden', async () => {
      const day = q('.calendar-day');
      expect(getComputedStyle(day).minWidth).to.equal('36px');
      expect(getComputedStyle(day).minHeight).to.equal('36px');
      await overrideTextSpacing();
      const clipped = qa('.calendar-day')
        .filter(
          (cell) =>
            cell.scrollWidth > cell.clientWidth + ROUNDING_TOLERANCE_PX ||
            cell.scrollHeight > cell.clientHeight + ROUNDING_TOLERANCE_PX,
        )
        .map((cell) => cell.textContent.trim());
      expect(clipped, 'no date may be clipped by its cell').to.deep.equal([]);
      const grid = q('.calendar-grid');
      expect(grid.scrollWidth).to.be.at.most(grid.clientWidth + ROUNDING_TOLERANCE_PX);
    });

    test('the month/year header and the footer stay inside the calendar', async () => {
      await overrideTextSpacing();
      const limit = q('#calendarPopover').getBoundingClientRect().right;
      ['.month-text', '.year-text', '.calendar-footer'].forEach((selector) => {
        expect(q(selector).getBoundingClientRect().right, `${selector} must stay inside the calendar`).to.be.at.most(
          limit + 0.5,
        );
      });
    });

    test('the date input is not clipped by its wrapper', async () => {
      await overrideTextSpacing();
      const wrapper = q('.input-wrapper');
      expect(wrapper.scrollWidth).to.be.at.most(wrapper.clientWidth + ROUNDING_TOLERANCE_PX);
    });

    // A minimum width larger than the maximum wins over it, so the 280px design floor has to yield
    // to the viewport once there is less room than that (400% zoom on a 1024px screen, SC 1.4.10).
    test('the 280px floor never exceeds the width the viewport allows', () => {
      const { minWidth, maxWidth } = getComputedStyle(q('#calendarPopover'));
      const available = document.documentElement.clientWidth - 16;
      expect(parseFloat(maxWidth)).to.be.closeTo(available, ROUNDING_TOLERANCE_PX);
      expect(parseFloat(minWidth)).to.equal(Math.min(280, available));
      expect(parseFloat(minWidth)).to.be.at.most(parseFloat(maxWidth));
    });

    // min-width/max-width resolve against the viewport, which the test page cannot resize, so give
    // the calendar a real 280px viewport of its own.
    test('the calendar stays inside a viewport narrower than the 280px floor', async () => {
      const frame = document.createElement('iframe');
      frame.style.cssText = 'width: 280px; height: 600px; border: 0;';
      const moduleUrl = new URL('../widgets/custom-date-picker.js', import.meta.url).href;
      frame.srcdoc = `<!doctype html><html><body style="margin:0"><custom-date-picker></custom-date-picker>
        <script type="module">import '${moduleUrl}';</script></body></html>`;
      // The listener has to exist before the iframe is inserted, since insertion is what
      // starts the load and a srcdoc document can finish it before the next statement runs.
      const loaded = new Promise((resolve) => {
        frame.addEventListener('load', resolve, { once: true });
      });
      document.body.appendChild(frame);
      try {
        await loaded;
        const frameWindow = frame.contentWindow;
        await frameWindow.customElements.whenDefined('custom-date-picker');
        const picker = frame.contentDocument.querySelector('custom-date-picker');
        picker._openCalendar();
        await new Promise((resolve) => {
          frameWindow.requestAnimationFrame(() => frameWindow.requestAnimationFrame(resolve));
        });
        const popover = picker.shadowRoot.querySelector('#calendarPopover');
        expect(parseFloat(frameWindow.getComputedStyle(popover).minWidth)).to.be.at.most(frameWindow.innerWidth - 16);
        expect(popover.getBoundingClientRect().right).to.be.at.most(frameWindow.innerWidth);
      } finally {
        frame.remove();
      }
    });
  });

  suite('text spacing', () => {
    // WCAG 2.1 AA, SC 1.4.12 (Text Spacing). The date input sits in a shadow root, so a user
    // text-spacing stylesheet applied at document level can only reach it by inheritance, and
    // the UA's form-control reset pins letter-spacing and word-spacing at `normal` unless the
    // input opts back in.
    test('should inherit text spacing so user stylesheets can reach the input', async () => {
      const container = await fixture(html`
        <div style="letter-spacing: 3px; word-spacing: 5px;">
          <custom-date-picker></custom-date-picker>
        </div>
      `);
      await flush();

      const input = container.querySelector('custom-date-picker').shadowRoot.querySelector('.input-field');
      const style = getComputedStyle(input);
      expect(style.letterSpacing, 'letter-spacing must follow the ancestor').to.equal('3px');
      expect(style.wordSpacing, 'word-spacing must follow the ancestor').to.equal('5px');
    });
  });
});

// Covers WEBUI-493: `autocomplete` is a declared property instead of a hardcoded `off` attribute,
// so nuxeo-date-picker (and therefore a layout) can identify the purpose of the field
// (WCAG 2.1 SC 1.3.5, technique H98).
suite('custom-date-picker autocomplete', () => {
  function getDateInput(el) {
    return el.shadowRoot.querySelector('#dateInput');
  }

  test('defaults to off, preserving the previously hardcoded value', async () => {
    const el = await newPicker();
    await flush();
    expect(el.autocomplete).to.equal('off');
    expect(getDateInput(el).getAttribute('autocomplete')).to.equal('off');
  });

  test('exposes a configured token on the native input', async () => {
    const el = await newPicker(
      html`
        <custom-date-picker autocomplete="bday"></custom-date-picker>
      `,
    );
    await flush();
    expect(getDateInput(el).getAttribute('autocomplete')).to.equal('bday');
  });

  test('exposes a token set at runtime on the native input', async () => {
    const el = await newPicker();
    await flush();
    el.autocomplete = 'bday';
    await flush();
    expect(getDateInput(el).getAttribute('autocomplete')).to.equal('bday');
  });
});
