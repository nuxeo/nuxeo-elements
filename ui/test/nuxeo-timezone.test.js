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
import moment from '@nuxeo/moment/min/moment-with-locales.js';
import { momentTimezone, momentTimezoneParser, isValidTimezone } from '../nuxeo-timezone.js';

suite('nuxeo-timezone', () => {
  // A fixed instant so results never depend on the machine running the tests.
  const instant = '2024-01-15T12:00:00.000Z';
  let originalLocale;

  setup(() => {
    originalLocale = moment.locale();
  });

  teardown(() => {
    moment.locale(originalLocale);
  });

  suite('isValidTimezone', () => {
    test('returns true for known IANA zones', () => {
      expect(isValidTimezone('Etc/UTC')).to.be.true;
      expect(isValidTimezone('Europe/Paris')).to.be.true;
      expect(isValidTimezone('Asia/Kolkata')).to.be.true;
      expect(isValidTimezone('Pacific/Chatham')).to.be.true;
    });

    test('returns false for empty or unknown zones', () => {
      expect(isValidTimezone('')).to.be.false;
      expect(isValidTimezone(undefined)).to.be.false;
      expect(isValidTimezone(null)).to.be.false;
      expect(isValidTimezone('Not/AZone')).to.be.false;
    });
  });

  suite('momentTimezone', () => {
    test('returns the local moment factory when no timezone is given', () => {
      const fn = momentTimezone();
      expect(fn(instant).format('YYYY-MM-DD HH:mm')).to.equal(moment(instant).format('YYYY-MM-DD HH:mm'));
    });

    test('displays the date in UTC for Etc/UTC', () => {
      const fn = momentTimezone('Etc/UTC');
      expect(fn(instant).format('YYYY-MM-DD HH:mm')).to.equal('2024-01-15 12:00');
    });

    test('displays the date in the configured named zone', () => {
      const fn = momentTimezone('Asia/Kolkata');
      // Asia/Kolkata is UTC+5:30 all year round.
      expect(fn(instant).format('YYYY-MM-DD HH:mm')).to.equal('2024-01-15 17:30');
    });

    test('honors DST in both directions', () => {
      const paris = momentTimezone('Europe/Paris');
      // Winter: CET (UTC+1).
      expect(paris('2024-01-15T12:00:00.000Z').format('YYYY-MM-DD HH:mm')).to.equal('2024-01-15 13:00');
      // Summer: CEST (UTC+2).
      expect(paris('2024-07-15T12:00:00.000Z').format('YYYY-MM-DD HH:mm')).to.equal('2024-07-15 14:00');
    });

    test('supports sub-hour offsets', () => {
      const chatham = momentTimezone('Pacific/Chatham');
      // Pacific/Chatham is UTC+13:45 in January (southern-hemisphere DST).
      expect(chatham(instant).format('YYYY-MM-DD HH:mm')).to.equal('2024-01-16 01:45');
    });

    test('resolves the ambiguous repeated wall-clock hour during a DST fall-back', () => {
      // On 2024-11-03 the US eastern zone falls back at 02:00 local, so 01:30 occurs twice.
      // Each distinct UTC instant must still resolve to the correct offset.
      const newYork = momentTimezone('America/New_York');
      // 05:30 UTC is still EDT (UTC-4) -> 01:30.
      expect(newYork('2024-11-03T05:30:00.000Z').format('YYYY-MM-DD HH:mm Z')).to.equal('2024-11-03 01:30 -04:00');
      // 06:30 UTC is already EST (UTC-5) -> 01:30 again, but with a different offset.
      expect(newYork('2024-11-03T06:30:00.000Z').format('YYYY-MM-DD HH:mm Z')).to.equal('2024-11-03 01:30 -05:00');
    });

    test('preserves the currently selected moment locale', () => {
      moment.locale('fr');
      const fn = momentTimezone('Europe/Paris');
      expect(fn(instant).format('LL')).to.equal('15 janvier 2024');
    });

    test('returns a valid moment for the current time when called with no argument', () => {
      expect(momentTimezone('Asia/Kolkata')().isValid()).to.be.true;
      expect(momentTimezone('Etc/UTC')().isValid()).to.be.true;
      expect(momentTimezone()().isValid()).to.be.true;
    });

    test('falls back to local time and warns once for an unknown zone', () => {
      const warn = sinon.stub(console, 'warn');
      try {
        const unknown = 'Made/UpZone';
        const fn = momentTimezone(unknown);
        expect(fn(instant).format('YYYY-MM-DD HH:mm')).to.equal(moment(instant).format('YYYY-MM-DD HH:mm'));
        // Calling again with the same unknown zone must not warn a second time.
        momentTimezone(unknown);
        expect(warn.calledOnce).to.be.true;
      } finally {
        warn.restore();
      }
    });
  });

  suite('momentTimezoneParser', () => {
    test('returns the local moment factory when no timezone is given', () => {
      const fn = momentTimezoneParser();
      expect(fn('2024-01-15').toJSON()).to.equal(moment('2024-01-15').toJSON());
    });

    test('reads offset-less input as UTC wall-clock time for Etc/UTC', () => {
      const fn = momentTimezoneParser('Etc/UTC');
      expect(fn('2024-01-15').toJSON()).to.equal('2024-01-15T00:00:00.000Z');
    });

    test('reads offset-less input as wall-clock time in the configured named zone', () => {
      // This is the behaviour `momentTimezone()` deliberately does not have: typing a date while
      // Asia/Kolkata (UTC+5:30) is configured must store that zone's midnight, not the browser's.
      const fn = momentTimezoneParser('Asia/Kolkata');
      expect(fn('2024-01-15').toJSON()).to.equal('2024-01-14T18:30:00.000Z');
    });

    test('reads input parsed with an explicit format in the configured zone', () => {
      const fn = momentTimezoneParser('Asia/Kolkata');
      expect(fn('15/01/2024', 'DD/MM/YYYY').toJSON()).to.equal('2024-01-14T18:30:00.000Z');
    });

    test('supports the strict parsing flag used by the date pickers', () => {
      const fn = momentTimezoneParser('Asia/Kolkata');
      expect(fn('15/01/2024', 'DD/MM/YYYY', true).toJSON()).to.equal('2024-01-14T18:30:00.000Z');
      expect(fn('nonsense', 'DD/MM/YYYY', true).isValid()).to.be.false;
    });

    test('keeps an absolute instant unchanged and only moves its rendering', () => {
      // Input carrying an offset already identifies an instant, so it must round-trip losslessly.
      const fn = momentTimezoneParser('Asia/Kolkata');
      expect(fn(instant).toJSON()).to.equal(instant);
      expect(fn(instant).format('YYYY-MM-DD HH:mm')).to.equal('2024-01-15 17:30');
    });

    test('honors DST and sub-hour offsets when reading wall-clock input', () => {
      const paris = momentTimezoneParser('Europe/Paris');
      // Winter CET (UTC+1) and summer CEST (UTC+2) for the same wall-clock hour.
      expect(paris('2024-01-15 12:00', 'YYYY-MM-DD HH:mm').toJSON()).to.equal('2024-01-15T11:00:00.000Z');
      expect(paris('2024-07-15 12:00', 'YYYY-MM-DD HH:mm').toJSON()).to.equal('2024-07-15T10:00:00.000Z');
      const chatham = momentTimezoneParser('Pacific/Chatham');
      expect(chatham('2024-01-15 12:00', 'YYYY-MM-DD HH:mm').toJSON()).to.equal('2024-01-14T22:15:00.000Z');
    });

    test('preserves the currently selected moment locale', () => {
      // The zone data comes from a different moment build whose locale is always `en`, so the result
      // has to be rebuilt on the locale-aware instance for localized formats to keep working.
      moment.locale('fr');
      expect(momentTimezoneParser('Europe/Paris')(instant).format('LL')).to.equal('15 janvier 2024');
    });

    test('returns a valid moment for the current time when called with no argument', () => {
      expect(momentTimezoneParser('Asia/Kolkata')().isValid()).to.be.true;
      expect(momentTimezoneParser('Etc/UTC')().isValid()).to.be.true;
      expect(momentTimezoneParser()().isValid()).to.be.true;
    });

    test('returns an invalid moment for unparseable input', () => {
      expect(momentTimezoneParser('Asia/Kolkata')('not a date').isValid()).to.be.false;
    });

    test('falls back to local time and warns once for an unknown zone', () => {
      const warn = sinon.stub(console, 'warn');
      try {
        // A zone name not used by any other test, so the module-scoped warn-once set is clean.
        const unknown = 'Parser/UnknownZone';
        expect(momentTimezoneParser(unknown)('2024-01-15').toJSON()).to.equal(moment('2024-01-15').toJSON());
        momentTimezoneParser(unknown);
        expect(warn.calledOnce).to.be.true;
      } finally {
        warn.restore();
      }
    });
  });
});
