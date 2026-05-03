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
import '../widgets/custom-date-picker.js';

function getDateInput(el) {
  return el.shadowRoot && el.shadowRoot.querySelector('#dateInput');
}

suite('custom-date-picker', () => {
  suite('initial state', () => {
    test('registers custom-date-picker', () => {
      expect(customElements.get('custom-date-picker')).to.be.ok;
    });

    test('defaults required to false and value empty', async () => {
      const el = await fixture(
        html`
          <custom-date-picker></custom-date-picker>
        `,
      );
      expect(el.required).to.equal(false);
      expect(el.value).to.not.be.ok;
    });
  });

  suite('_parseDateOnly', () => {
    let el;

    setup(async () => {
      el = await fixture(
        html`
          <custom-date-picker></custom-date-picker>
        `,
      );
    });

    test('parses YYYY-MM-DD to start of local day', () => {
      const d = el._parseDateOnly('2020-06-15');
      expect(d).to.be.instanceOf(Date);
      expect(d.getFullYear()).to.equal(2020);
      expect(d.getMonth()).to.equal(5);
      expect(d.getDate()).to.equal(15);
      expect(d.getHours()).to.equal(0);
    });

    test('returns null for empty or invalid input', () => {
      expect(el._parseDateOnly('')).to.equal(null);
      expect(el._parseDateOnly(null)).to.equal(null);
      expect(el._parseDateOnly('not-a-date')).to.equal(null);
    });
  });

  suite('_parseDateFromISO', () => {
    let el;

    setup(async () => {
      el = await fixture(
        html`
          <custom-date-picker></custom-date-picker>
        `,
      );
    });

    test('accepts valid calendar dates', () => {
      const d = el._parseDateFromISO('2020-01-31');
      expect(d).to.be.instanceOf(Date);
      expect(d.getFullYear()).to.equal(2020);
      expect(d.getMonth()).to.equal(0);
      expect(d.getDate()).to.equal(31);
    });

    test('rejects invalid day for month', () => {
      expect(el._parseDateFromISO('2021-02-30')).to.equal(null);
    });

    test('rejects non YYYY-MM-DD strings', () => {
      expect(el._parseDateFromISO('2020/01/01')).to.equal(null);
      expect(el._parseDateFromISO('20-01-01')).to.equal(null);
      expect(el._parseDateFromISO('')).to.equal(null);
    });
  });

  suite('_isSameDay', () => {
    let el;

    setup(async () => {
      el = await fixture(
        html`
          <custom-date-picker></custom-date-picker>
        `,
      );
    });

    test('returns true for same calendar day', () => {
      const a = new Date(2022, 3, 10, 14, 30);
      const b = new Date(2022, 3, 10, 8, 0);
      expect(el._isSameDay(a, b)).to.equal(true);
    });

    test('returns false for different days or missing date', () => {
      expect(el._isSameDay(new Date(2022, 3, 10), new Date(2022, 3, 11))).to.equal(false);
      expect(el._isSameDay(null, new Date())).to.equal(false);
    });
  });

  suite('_moment', () => {
    test('uses UTC when timezone is Etc/UTC', async () => {
      const el = await fixture(
        html`
          <custom-date-picker timezone="Etc/UTC"></custom-date-picker>
        `,
      );
      const m = el._moment('2022-01-15T00:00:00.000Z');
      expect(m.isUTC()).to.equal(true);
    });

    test('uses local when timezone is not Etc/UTC', async () => {
      const el = await fixture(
        html`
          <custom-date-picker timezone=""></custom-date-picker>
        `,
      );
      const m = el._moment('2022-01-15T12:00:00.000Z');
      expect(m.isUTC()).to.equal(false);
    });
  });

  suite('_getErrorPriority', () => {
    let el;

    setup(async () => {
      el = await fixture(
        html`
          <custom-date-picker></custom-date-picker>
        `,
      );
    });

    test('orders format-like errors above range and required', () => {
      expect(el._getErrorPriority('format')).to.be.greaterThan(el._getErrorPriority('outOfRange'));
      expect(el._getErrorPriority('invalidDate')).to.be.greaterThan(el._getErrorPriority('outOfRange'));
      expect(el._getErrorPriority('outOfRange')).to.be.greaterThan(el._getErrorPriority('required'));
    });

    test('returns 0 for unknown reason', () => {
      expect(el._getErrorPriority('')).to.equal(0);
    });
  });

  suite('_detectRTL', () => {
    test('sets dir rtl for Arabic locale', async () => {
      const el = await fixture(
        html`
          <custom-date-picker></custom-date-picker>
        `,
      );
      el._detectRTL('ar-SA');
      expect(el.getAttribute('dir')).to.equal('rtl');
      expect(el._isRTL).to.equal(true);
    });

    test('sets dir ltr for English locale', async () => {
      const el = await fixture(
        html`
          <custom-date-picker></custom-date-picker>
        `,
      );
      el._detectRTL('en-US');
      expect(el.getAttribute('dir')).to.equal('ltr');
      expect(el._isRTL).to.equal(false);
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

  suite('value binding', () => {
    test('updates internal selection from ISO value', async () => {
      const el = await fixture(
        html`
          <custom-date-picker></custom-date-picker>
        `,
      );
      el.value = '2022-03-15T00:00:00.000Z';
      await flush();
      expect(el._selectedDate).to.be.instanceOf(Date);
      expect(moment.utc(el.value).isValid()).to.equal(true);
      const input = getDateInput(el);
      expect(input).to.be.ok;
      expect(input.value.length).to.be.greaterThan(0);
    });

    test('clears input when value cleared', async () => {
      const el = await fixture(
        html`
          <custom-date-picker></custom-date-picker>
        `,
      );
      el.value = '2022-03-15T00:00:00.000Z';
      await flush();
      el.value = '';
      await flush();
      const input = getDateInput(el);
      expect(input.value).to.equal('');
      expect(el._selectedDate).to.equal(null);
    });
  });
});
