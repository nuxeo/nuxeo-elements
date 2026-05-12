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
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import moment from '@nuxeo/moment/min/moment-with-locales.js';
import '../widgets/nuxeo-date-picker.js';

function getInput(element) {
  return element.shadowRoot.querySelector('#date');
}

function getInputDisplay(element) {
  return element.shadowRoot.querySelector('#date').querySelector('input');
}

function testValue(element, value, isUTC) {
  element.value = value;
  expect(element.value).to.be.equal(value);
  const inputValue = getInput(element).value;
  const val = (isUTC ? moment.utc(value) : moment(value).local()).format('YYYY-MM-DD');
  expect(inputValue).to.be.equal(val);
  // ELEMENTS-599: assertion temporarily disabled owing to third party picker issues
  // expect(element._pickerValue).to.be.equal(local);
}

function testValueWithLocale(element, value, locale, isUTC) {
  element.value = value;
  expect(element.value).to.be.equal(value);
  const inputValue = getInputDisplay(element).value;
  let val = isUTC ? moment.utc(value) : moment(value).local();
  // use the i18n functions we set in nuxeo-date-picker, since the displayed date is not the value
  val = getInput(element).i18n.formatDate(getInput(element).i18n.parseDate(val));
  expect(inputValue).to.be.equal(val);
}

function testInput(element, input, isUTC) {
  const i = getInput(element);
  i.value = input;
  expect(i.value).to.be.equal(input);
  expect(element.value).to.be.equal((isUTC ? moment.utc(input) : moment(input)).toJSON());
  // ELEMENTS-599: assertion temporarily disabled owing to third party picker issues
  // expect(element._pickerValue).to.be.equal(input);
}

async function makeDatePicker(timezone) {
  const picker = !timezone
    ? await fixture(
        html`
          <nuxeo-date-picker></nuxeo-date-picker>
        `,
      )
    : await fixture(
        html`
          <nuxeo-date-picker timezone=${timezone}></nuxeo-date-picker>
        `,
      );
  return picker;
}

suite('nuxeo-date-picker', () => {
  let element;
  let currentLocale;

  [{ timezone: undefined }, { timezone: 'Etc/UTC' }].forEach((conf) => {
    suite(!conf.timezone ? 'with no timezone' : `with ${conf.timezone} timezone`, () => {
      setup(async () => {
        currentLocale = moment.locale();
        element = await makeDatePicker(conf.timezone);
      });

      teardown(() => {
        moment.locale(currentLocale);
      });

      test('the value can be changed', () => {
        expect(element.value).to.be.null;
        testValue(element, '2022-03-12T00:00:00.000Z', conf.timezone);
        testValue(element, '1800-12-28T00:00:00.000Z', conf.timezone);
        testValue(element, '0021-11-07T00:00:00.000Z', conf.timezone);
        testValue(element, '0002-01-01T00:00:00.000Z', conf.timezone);
      });

      test('the value set in UCT is correctly converted to local time', () => {
        testValue(element, '2003-06-12T22:00:00.000Z', conf.timezone);
        testValue(element, '2003-06-12T23:00:00.000Z', conf.timezone);
        testValue(element, '2003-06-13T00:00:00.000Z', conf.timezone);
      });

      test('the input changes reflect on the value', () => {
        testInput(element, '2003-02-20', conf.timezone);
        testInput(element, '2004-06-12', conf.timezone);
      });

      test('the value can be cleared', () => {
        expect(element.value).to.be.null;
        testInput(element, '2003-02-20', conf.timezone);
        // now clear the value
        element.value = null;
        expect(element.value).to.be.equal(null);
        expect(getInput(element).value).to.be.equal('');
      });

      test('the input changes takes default time into account', () => {
        element.defaultTime = '14:35:19';
        getInput(element).value = '2003-02-20';
        const localEltValue = moment(element.value).local();
        expect(localEltValue.hour()).to.be.equal(14);
        expect(localEltValue.minute()).to.be.equal(35);
        expect(localEltValue.second()).to.be.equal(19);
      });

      test('the input changes with locale', () => {
        // using the arabic locale
        moment.locale('ar');
        expect(element.value).to.be.null;
        testValueWithLocale(element, '2003-06-13T00:00:00.000Z', 'ar', conf.timezone);
      });
    });
  });

  // Regression tests: when `min` is set, navigating Next then Previous back to the
  // boundary month must NOT collapse the calendar. The fixes live in
  // ui/widgets/custom-date-picker.js (`_preventNavButtonFocus`,
  // `_updateNavigationButtonStates` focus redirection, and `_onInputFocus` activeElement
  // guard).
  suite('month navigation with min boundary', () => {
    let picker;
    let inner;

    setup(async () => {
      picker = await fixture(
        html`
          <nuxeo-date-picker min="2026-05-02"></nuxeo-date-picker>
        `,
      );
      inner = picker.shadowRoot.querySelector('#date');
      // Open the calendar so the popover (and nav buttons) are rendered and wired up.
      inner._openCalendar(null, false);
      await flush();
      inner._updateNavigationButtonStates();
    });

    test('nav buttons prevent default on mousedown so they do not steal focus', () => {
      const prev = inner.shadowRoot.querySelector('#prevMonth');
      const next = inner.shadowRoot.querySelector('#nextMonth');
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
      const prev = inner.shadowRoot.querySelector('#prevMonth');
      const next = inner.shadowRoot.querySelector('#nextMonth');

      // The calendar opens on the min month (May 2026) — prev should be disabled.
      expect(inner._isCalendarOpen).to.be.true;
      expect(prev.disabled).to.be.true;

      // Move to next month (June 2026). Prev should now be enabled.
      next.click();
      await flush();
      inner._updateNavigationButtonStates();
      expect(inner._isCalendarOpen).to.be.true;
      expect(prev.disabled).to.be.false;

      // Move back to the min month (May 2026). Prev becomes disabled again, but the
      // calendar must remain open.
      prev.click();
      await flush();
      inner._updateNavigationButtonStates();
      expect(inner._isCalendarOpen).to.be.true;
      expect(prev.disabled).to.be.true;
    });

    test('disabling the focused prev button moves focus inside the popover instead of out', async () => {
      const prev = inner.shadowRoot.querySelector('#prevMonth');
      const next = inner.shadowRoot.querySelector('#nextMonth');

      // Move forward so prev becomes enabled.
      next.click();
      await flush();
      inner._updateNavigationButtonStates();
      expect(prev.disabled).to.be.false;

      // Reproduce the focused-nav-button scenario with real focus, then force the
      // min-month state and run nav-state update to verify focus redirection.
      prev.focus();
      expect(inner.shadowRoot.activeElement).to.equal(prev);

      inner._viewDate = new Date(2026, 4, 1); // May 2026 (min month)
      inner._updateNavigationButtonStates();

      expect(inner._isCalendarOpen).to.be.true;
      expect(prev.disabled).to.be.true;
      const yearDropdown = inner.shadowRoot.querySelector('.year-dropdown');
      const focused = inner.shadowRoot.activeElement;
      expect(focused).to.not.equal(prev);
      expect([next, yearDropdown, inner.shadowRoot.querySelector('#calendarPopover')]).to.include(focused);
    });

    test('_onInputFocus does not close the calendar when the input is not actually focused', async () => {
      expect(inner._isCalendarOpen).to.be.true;

      // Make the precondition explicit: _onInputFocus may run asynchronously while
      // focus is on another calendar control, and must not close in that case.
      const dateInput = inner.shadowRoot.querySelector('#dateInput');
      const next = inner.shadowRoot.querySelector('#nextMonth');
      expect(dateInput).to.exist;
      expect(next).to.exist;
      next.focus();
      expect(inner.shadowRoot.activeElement).to.equal(next);

      inner._onInputFocus();
      await flush();

      expect(inner._isCalendarOpen).to.be.true;
    });
  });
});
