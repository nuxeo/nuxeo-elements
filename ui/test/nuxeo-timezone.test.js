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
import { momentTimezone, isValidTimezone } from '../nuxeo-timezone.js';

suite('nuxeo-timezone', () => {
  // A fixed instant so results never depend on the machine running the tests.
  const instant = '2024-01-15T12:00:00.000Z';

  teardown(() => {
    moment.locale('en');
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
});
