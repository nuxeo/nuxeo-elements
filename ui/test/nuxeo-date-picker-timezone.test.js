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
import { config } from '@nuxeo/nuxeo-elements';
import moment from '@nuxeo/moment/min/moment-with-locales.js';
import '../widgets/nuxeo-date-picker.js';

suite('nuxeo-date-picker configured timezone round-trip', () => {
  let previousTimezone;
  let previousLocale;

  setup(() => {
    previousTimezone = config.get('timezone');
    previousLocale = moment.locale();
  });

  teardown(() => {
    config.set('timezone', previousTimezone);
    moment.locale(previousLocale);
  });

  const cases = [
    ['America/New_York', '2026-01-20T05:00:00.000Z'],
    ['Europe/Paris', '2026-01-19T23:00:00.000Z'],
    ['Asia/Kolkata', '2026-01-19T18:30:00.000Z'],
    ['Asia/Kathmandu', '2026-01-19T18:15:00.000Z'],
    ['Asia/Tokyo', '2026-01-19T15:00:00.000Z'],
    ['Australia/Sydney', '2026-01-19T13:00:00.000Z'],
    ['Pacific/Pago_Pago', '2026-01-20T11:00:00.000Z'],
    ['Etc/UTC', '2026-01-20T00:00:00.000Z'],
  ];

  async function createPicker(zone) {
    config.set('timezone', zone);
    const el = await fixture(
      html`
        <nuxeo-date-picker format="MM/DD/YYYY"></nuxeo-date-picker>
      `,
    );
    await flush();
    return el;
  }

  async function typeDate(el, text) {
    const input = el.$.date.$.dateInput;
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('blur'));
    await flush();
  }

  cases.forEach(([zone, midnight]) => {
    test(`types, reopens and blurs January 20 without shifting it in ${zone}`, async () => {
      const el = await createPicker(zone);
      await typeDate(el, '01/20/2026');
      expect(el.value).to.equal(midnight);
      expect(el.$.date.$.dateInput.value).to.equal('01/20/2026');

      const reopened = await createPicker(zone);
      reopened.value = midnight;
      await flush();
      expect(reopened.$.date.$.dateInput.value).to.equal('01/20/2026');
      reopened.$.date.$.dateInput.dispatchEvent(new Event('blur'));
      await flush();
      expect(reopened.value).to.equal(midnight);
    });

    test(`calendar selection stores configured midnight in ${zone}`, async () => {
      const el = await createPicker(zone);
      el.$.date._selectDate(new Date(2026, 0, 20));
      await flush();
      expect(el.value).to.equal(midnight);
      expect(el.$.date.$.dateInput.value).to.equal('01/20/2026');
    });
  });

  test('keeps an existing non-midnight instant when the displayed day is not edited', async () => {
    const el = await createPicker('Asia/Tokyo');
    el.value = '2026-01-19T23:45:12.000Z';
    await flush();
    expect(el.$.date.$.dateInput.value).to.equal('01/20/2026');
    el.$.date.$.dateInput.dispatchEvent(new Event('blur'));
    await flush();
    expect(el.value).to.equal('2026-01-19T23:45:12.000Z');
  });

  test('uses browser midnight with unset or invalid timezone and can clear the value', async () => {
    for (const zone of [undefined, 'Invalid/PickerZone']) {
      const el = await createPicker(zone);
      await typeDate(el, '01/20/2026');
      expect(el.value).to.equal(moment('2026-01-20').toJSON());
      el.value = null;
      await flush();
      expect(el.$.date.$.dateInput.value).to.equal('');
    }
  });

  test('uses the correct midnight offset on both sides of a DST transition', async () => {
    const el = await createPicker('America/New_York');
    await typeDate(el, '03/08/2026');
    expect(el.value).to.equal('2026-03-08T05:00:00.000Z');
    await typeDate(el, '03/09/2026');
    expect(el.value).to.equal('2026-03-09T04:00:00.000Z');
  });

  test('resolves defaultTime after a daylight-saving offset change', async () => {
    const el = await createPicker('America/New_York');
    el.defaultTime = '12:30:45';
    await typeDate(el, '03/08/2026');
    expect(el.value).to.equal('2026-03-08T16:30:45.000Z');
    await typeDate(el, '11/01/2026');
    expect(el.value).to.equal('2026-11-01T17:30:45.000Z');
  });

  test('normalizes timestamp limits to the configured calendar day', async () => {
    const el = await createPicker('Asia/Tokyo');
    el.min = '2026-01-19T15:00:00Z';
    el.max = '2026-01-19T15:00:00Z';
    await flush();
    expect(el.$.date.min).to.equal('2026-01-20');
    expect(el.$.date.max).to.equal('2026-01-20');
    await typeDate(el, '01/20/2026');
    expect(el.validate()).to.be.true;
    await typeDate(el, '01/19/2026');
    expect(el.validate()).to.be.false;
    await typeDate(el, '01/21/2026');
    expect(el.validate()).to.be.false;
  });

  test('preserves date-only and empty limits and updates timestamp limits when the zone changes', async () => {
    const el = await createPicker('Asia/Tokyo');
    el.min = '2026-01-20';
    el.max = '';
    await flush();
    expect(el.$.date.min).to.equal('2026-01-20');
    expect(el.$.date.max).to.equal('');
    el.max = '2026-01-19T15:00:00Z';
    el.timezone = 'America/New_York';
    await flush();
    expect(el.$.date.min).to.equal('2026-01-20');
    expect(el.$.date.max).to.equal('2026-01-19');
    el.max = 'not-a-date';
    await flush();
    expect(el.$.date.max).to.equal('not-a-date');
  });

  test('opens and navigates the permitted month at a year boundary in any browser timezone', async () => {
    const el = await createPicker('America/Los_Angeles');
    el.min = '2026-01-01T08:00:00Z';
    el.max = el.min;
    await flush();
    const picker = el.$.date;
    picker._openCalendar();
    expect(picker._dateToISO(picker._viewDate)).to.equal('2026-01-01');
    expect(picker._yearOptions).to.deep.equal([2026]);
    picker._generateMonthYearOptions();
    expect(picker._monthYearOptions.map(({ value }) => value)).to.deep.equal(['2026-0']);
    picker._viewDate = new Date(2025, 11, 1);
    expect(picker._isNextMonthDisabled()).to.be.false;
    picker._viewDate = new Date(2026, 1, 1);
    expect(picker._isPreviousMonthDisabled()).to.be.false;
    picker._closeCalendar();
  });

  test('ignores invalid calendar bounds when opening and navigating months', async () => {
    const el = await createPicker('America/Los_Angeles');
    el.min = 'not-a-date';
    el.max = 'not-a-date';
    await flush();
    const picker = el.$.date;
    picker._openCalendar();
    expect(picker._viewDate.getTime()).to.equal(picker._today.getTime());
    expect(picker._yearOptions).to.have.length(200);
    expect(picker._isNextMonthDisabled()).to.be.false;
    expect(picker._isPreviousMonthDisabled()).to.be.false;
    picker._closeCalendar();
  });

  test('refreshes the selected day on a timezone change without changing its stored instant or dropping the next edit', async () => {
    const el = await createPicker('Asia/Tokyo');
    const instant = '2026-01-19T15:00:00Z';
    el.value = instant;
    el.min = instant;
    el.max = instant;
    await flush();
    expect(el.$.date.$.dateInput.value).to.equal('01/20/2026');
    el.timezone = 'Pacific/Pago_Pago';
    await flush();
    expect(el.$.date.$.dateInput.value).to.equal('01/19/2026');
    expect(el.validate()).to.be.true;
    expect(el.value).to.equal(instant);
    el.timezone = 'Pacific/Honolulu';
    await flush();
    expect(el.$.date.$.dateInput.value).to.equal('01/19/2026');
    expect(el.value).to.equal(instant);
    el.min = '';
    el.max = '';
    await flush();
    await typeDate(el, '01/20/2026');
    expect(el.value).to.equal('2026-01-20T10:00:00.000Z');
  });

  [
    ['2026-01-20', '2026-01-20', '2026-01-20'],
    ['', '2026-01-20', '2026-01-20'],
    ['2026-12-20', '', '2026-12-20'],
  ].forEach(([min, max, expected]) => {
    test(`keeps an open empty calendar within bounds ${min} to ${max} after changing timezone`, async () => {
      const el = await createPicker('Asia/Tokyo');
      el.min = min;
      el.max = max;
      await flush();
      const clock = sinon.useFakeTimers({ now: Date.parse('2026-11-11T06:00:00Z'), toFake: ['Date'] });
      try {
        el.$.date._openCalendar();
        el.timezone = 'Pacific/Pago_Pago';
        await flush();
        expect(el.$.date._dateToISO(el.$.date._viewDate)).to.equal(expected);
        const day = el.$.date._calendarDays.find((entry) => entry.dateISO === expected);
        expect(day.isDisabled).to.be.false;
        el.$.date._selectDate(day.date);
        await flush();
        expect(el.value).to.equal(`${expected}T11:00:00.000Z`);
        expect(el.validate()).to.be.true;
      } finally {
        el.$.date._closeCalendar();
        clock.restore();
      }
    });
  });

  test('preserves the complete ISO year in calendar bounds and year/month options', async () => {
    const el = await createPicker('America/Los_Angeles');
    el.min = '0021-11-07';
    el.max = '2026-01-20';
    await flush();
    const picker = el.$.date;
    picker._openCalendar();
    expect(picker._viewDate.getFullYear()).to.equal(21);
    expect(picker._yearOptions[0]).to.equal(1900);
    picker._generateMonthYearOptions();
    expect(picker._monthYearOptions[0].value).to.equal('1900-0');
    const leapDay = picker._parseBoundDate('0000-02-29');
    expect([leapDay.getFullYear(), leapDay.getMonth(), leapDay.getDate()]).to.deep.equal([0, 1, 29]);
    picker._closeCalendar();
  });

  test('Today follows the explicit picker timezone when it differs from the global setting', async () => {
    const el = await createPicker('Asia/Tokyo');
    el.timezone = 'Pacific/Pago_Pago';
    await flush();
    const clock = sinon.useFakeTimers({ now: Date.parse('2026-01-20T06:00:00Z'), toFake: ['Date'] });
    try {
      el.$.date._selectToday();
      expect(el.value).to.equal('2026-01-19T11:00:00.000Z');
      expect(el.$.date.$.dateInput.value).to.equal('01/19/2026');
    } finally {
      clock.restore();
    }
  });

  test('refreshes the Today marker and empty calendar view after a timezone change', async () => {
    const el = await createPicker('Asia/Tokyo');
    const clock = sinon.useFakeTimers({ now: Date.parse('2026-01-20T06:00:00Z'), toFake: ['Date'] });
    try {
      el.timezone = 'Pacific/Pago_Pago';
      await flush();
      expect(el.$.date._dateToISO(el.$.date._today)).to.equal('2026-01-19');
      expect(el.$.date._dateToISO(el.$.date._viewDate)).to.equal('2026-01-19');
      expect(el.$.date._calendarDays.find((day) => day.isToday).dateISO).to.equal('2026-01-19');
      el.$.date._selectDate(new Date(2026, 0, 25));
      const value = el.value;
      const viewDate = el.$.date._viewDate.getTime();
      el.timezone = 'Asia/Tokyo';
      await flush();
      expect(el.$.date._dateToISO(el.$.date._today)).to.equal('2026-01-20');
      expect(el.$.date._viewDate.getTime()).to.equal(viewDate);
      expect(el.value).to.equal(value);
    } finally {
      clock.restore();
    }
  });

  test('formats selected calendar Dates locally and stored timestamp strings in the configured zone', async () => {
    const el = await createPicker('Pacific/Pago_Pago');
    moment.locale('en');
    el.$.date._selectDate(new Date(2026, 0, 20));
    await flush();
    expect(el.$.date.formattedValue).to.equal('01/20/2026');
    expect(el.$.date.i18n.formatDate('2026-01-20T06:00:00.000Z')).to.equal('01/19/2026');
  });

  test('parses a localized visible date in the configured zone', async () => {
    const el = await createPicker('Europe/Paris');
    const locale = sinon.stub(el.$.date, '_getUserLocale').returns('fr');
    try {
      el.format = 'DD MMMM YYYY';
      await flush();
      await typeDate(el, '15 juillet 2026');
      expect(el.value).to.equal('2026-07-14T22:00:00.000Z');
      expect(el.$.date.$.dateInput.value).to.equal('15 juillet 2026');
    } finally {
      locale.restore();
    }
  });
});
