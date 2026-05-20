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
import { fixture, flush, html } from '@nuxeo/testing-helpers';
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
      const yearDropdown = el.shadowRoot.querySelector('.year-dropdown');
      const focused = el.shadowRoot.activeElement;
      expect(focused).to.not.equal(prev);
      expect([next, yearDropdown, el.shadowRoot.querySelector('#calendarPopover')]).to.include(focused);
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

    test('_isInputFocusCloseSuppressed returns true while suppression is active and false after it expires', () => {
      expect(el._isInputFocusCloseSuppressed()).to.be.false;

      el._suppressInputFocusCloseUntil = Date.now() + 5000;
      expect(el._isInputFocusCloseSuppressed()).to.be.true;

      el._suppressInputFocusCloseUntil = 0;
      expect(el._isInputFocusCloseSuppressed()).to.be.false;
    });

    test('_onInputFocus does not close the calendar when suppression is active at call time', async () => {
      expect(el._isCalendarOpen).to.be.true;

      // Activate suppression before calling _onInputFocus so the outer early return fires.
      el._suppressInputFocusCloseUntil = Date.now() + 5000;
      el._onInputFocus();
      await flush();

      expect(el._isCalendarOpen).to.be.true;
      el._suppressInputFocusCloseUntil = 0;
    });

    test('_onInputFocus async callback respects suppression set after the call', async () => {
      expect(el._isCalendarOpen).to.be.true;

      // Focus the date input so that the activeElement check inside the async callback
      // would normally allow the calendar to close.
      const dateInput = el.shadowRoot.querySelector('#dateInput');
      dateInput.focus();

      // Call _onInputFocus without suppression so the outer check passes and the async
      // callback is scheduled. Then immediately activate suppression so the inner check
      // inside the callback returns early instead of closing the calendar.
      el._onInputFocus();
      el._suppressInputFocusCloseUntil = Date.now() + 5000;
      await flush();

      expect(el._isCalendarOpen).to.be.true;
      el._suppressInputFocusCloseUntil = 0;
    });

    test('_handleDocumentFocusIn returns early when suppression is active', () => {
      expect(el._isCalendarOpen).to.be.true;

      el._suppressInputFocusCloseUntil = Date.now() + 5000;
      // Dispatch a focusin to document body; the handler should return early without side-effects.
      expect(() => el._handleDocumentFocusIn({ target: document.body })).to.not.throw();
      expect(el._isCalendarOpen).to.be.true;

      el._suppressInputFocusCloseUntil = 0;
    });

    test('focus moves to prev button when focused next button becomes disabled at max boundary', async () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');

      // Navigate to June 2026 so both nav buttons are enabled.
      next.click();
      await flush();
      el._updateNavigationButtonStates();
      expect(prev.disabled).to.be.false;
      expect(next.disabled).to.be.false;

      // Set max so that July (the next month after June) is beyond the boundary,
      // meaning the next button should now be disabled.
      el.max = '2026-06-30';

      // Focus the next button before it becomes disabled.
      next.focus();
      expect(el.shadowRoot.activeElement).to.equal(next);

      // Trigger navigation state update — next becomes disabled and focus should move to prev.
      el._updateNavigationButtonStates();

      expect(el._isCalendarOpen).to.be.true;
      expect(next.disabled).to.be.true;
      expect(prev.disabled).to.be.false;
      const focused = el.shadowRoot.activeElement;
      expect(focused).to.not.equal(next);
      expect(focused).to.equal(prev);
    });

    test('_getNavButtonFallbackFocusTarget falls back to calendarPopover when both nav buttons are disabled', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');
      const calendarPopover = el.shadowRoot.querySelector('#calendarPopover');

      // Directly exercise the fallback path: active element is prev, but next is also
      // disabled (e.g. picker constrained to a single month).
      const result = el._getNavButtonFallbackFocusTarget(prev, prev, next, true, true);
      expect(result).to.be.oneOf([
        el.shadowRoot.querySelector('.year-dropdown'),
        el.shadowRoot.querySelector('.calendar-day[tabindex="0"]'),
        el.shadowRoot.querySelector('.month-year-dropdown'),
        calendarPopover,
      ]);
      expect(result).to.not.be.null;
    });

    test('disabled-active-nav detection reflects each disabled button state', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');

      expect(el._isActiveNavButtonDisabled(prev, prev, next, true, false)).to.be.true;
      expect(el._isActiveNavButtonDisabled(next, prev, next, false, true)).to.be.true;
      expect(el._isActiveNavButtonDisabled(next, prev, next, false, false)).to.be.false;
    });

    test('keyboard month navigation sets and clears interaction state', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      expect(prev).to.exist;

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });

      prev.dispatchEvent(event);

      expect(event.defaultPrevented).to.be.true;
      expect(el._suppressInputFocusCloseUntil).to.be.greaterThan(Date.now());
      expect(el._interactingWithCalendar).to.be.false;
    });

    test('_getNavButtonFallbackFocusTarget returns nextButton when prevButton is focused and next is enabled', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      const next = el.shadowRoot.querySelector('#nextMonth');
      const result = el._getNavButtonFallbackFocusTarget(prev, prev, next, true, false);
      expect(result).to.equal(next);
    });

    test('_updateNavigationButtonStates does not relocate focus when calendar is closed', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      el._isCalendarOpen = false;
      prev.focus();
      const focusSpy = sinon.spy(prev, 'focus');
      el._updateNavigationButtonStates();
      expect(focusSpy.called).to.be.false;
      focusSpy.restore();
    });

    test('_updateNavigationButtonStates does not relocate focus when no focused nav button is disabled', () => {
      const next = el.shadowRoot.querySelector('#nextMonth');
      next.focus();
      // Navigate so neither button is at a boundary and neither becomes disabled.
      el._viewDate = new Date(2026, 5, 1); // June 2026 — well within bounds
      const focusSpy = sinon.spy(next, 'focus');
      el._updateNavigationButtonStates();
      expect(focusSpy.called).to.be.false;
      focusSpy.restore();
    });

    test('_updateNavigationButtonStates tolerates a null fallback from _getNavButtonFallbackFocusTarget', () => {
      const prev = el.shadowRoot.querySelector('#prevMonth');
      prev.focus();
      const stub = sinon.stub(el, '_getNavButtonFallbackFocusTarget').returns(null);
      el._viewDate = new Date(2026, 4, 1); // min month — prev becomes disabled
      expect(() => el._updateNavigationButtonStates()).to.not.throw();
      stub.restore();
    });

    test('_updateNavigationButtonStates is a no-op when nav buttons are not rendered', () => {
      const detached = document.createElement('custom-date-picker');
      document.body.appendChild(detached);
      try {
        expect(() => detached._updateNavigationButtonStates()).to.not.throw();
      } finally {
        detached.remove();
      }
    });

    test('_isInputFocusCloseSuppressed returns false after the suppression window has expired', () => {
      el._suppressInputFocusCloseUntil = Date.now() - 1;
      expect(el._isInputFocusCloseSuppressed()).to.be.false;
    });

    test('_handleDocumentFocusIn proceeds when suppression window has expired', () => {
      el._openCalendar();
      el._isYearDropdownOpen = true;
      el._suppressInputFocusCloseUntil = Date.now() - 1;
      const asyncSpy = sinon.spy(el, 'async');
      el._handleDocumentFocusIn({ target: document.body });
      expect(asyncSpy.called).to.be.true;
      asyncSpy.restore();
    });
  });
});
