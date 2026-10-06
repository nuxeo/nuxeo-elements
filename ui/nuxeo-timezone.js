/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved. 
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
import moment from '@nuxeo/moment/min/moment-with-locales.js';
import momentTz from '@nuxeo/moment-timezone';

// Keep track of timezones we already warned about, so an invalid configuration only logs once.
const _warnedZones = new Set();

function _warnUnknownZone(timezone) {
  if (!_warnedZones.has(timezone)) {
    _warnedZones.add(timezone);
    console.warn(`nuxeo-timezone: unknown timezone "${timezone}", falling back to the browser's local time.`);
  }
}

/**
 * Returns whether the given name is a timezone known to the IANA tz database.
 *
 * @param {string} timezone the name of the timezone, according to the IANA tz database (e.g. `Europe/Paris`).
 * @return {boolean} `true` if the timezone is known, `false` otherwise.
 */
export function isValidTimezone(timezone) {
  return Boolean(timezone) && Boolean(momentTz.tz.zone(timezone));
}

/**
 * Returns a `moment` factory bound to the given timezone.
 *
 * The returned function behaves like `moment` itself: call it with no argument to get the current time, or with a
 * date value to wrap it. Whatever the timezone, the underlying instant is preserved and only the wall-clock
 * representation changes, so relative formatting and date comparisons keep working as before. The locale currently
 * set on `moment` is preserved, so localized month and day names still render for every supported language.
 *
 * Resolution rules for the `timezone` argument:
 * - empty/undefined: the browser's local time is used (this is the default and the historical behavior).
 * - `Etc/UTC`: the date is displayed in UTC.
 * - any other valid IANA zone: the date is displayed using that zone's wall-clock time, honoring DST transitions
 *   and sub-hour offsets.
 * - an unknown zone: a warning is logged once and the factory falls back to the browser's local time.
 *
 * @param {string} [timezone] the name of the timezone, according to the IANA tz database.
 * @return {function(...*): object} a factory returning `moment` objects bound to the resolved timezone.
 */
export function momentTimezone(timezone) {
  if (!timezone) {
    return moment;
  }
  if (timezone === 'Etc/UTC') {
    return moment.utc;
  }
  const zone = momentTz.tz.zone(timezone);
  if (!zone) {
    _warnUnknownZone(timezone);
    return moment;
  }
  return (...args) => {
    const m = moment(...args);
    // `Zone#utcOffset` returns the offset in minutes to add to local time to get UTC (i.e. the negated offset),
    // computed at the given instant so DST and sub-hour offsets are taken into account.
    return m.utcOffset(-zone.utcOffset(m.valueOf()));
  };
}

/**
 * Returns a `moment` factory bound to the given timezone that *also reads its input* in that timezone.
 *
 * This differs from `momentTimezone()` in how input without an explicit offset is interpreted.
 * `momentTimezone()` is display-oriented: it assumes the input already identifies an instant, so
 * `2024-01-15` is read as browser-local midnight and only the rendering moves to the target zone.
 * Date pickers also parse what the user types, where that assumption is wrong: typing `15/01/2024`
 * while `Asia/Kolkata` is configured must store Kolkata midnight, not the browser's midnight.
 *
 * Input that does carry an offset (e.g. `2024-01-15T23:30:00Z`) still identifies an absolute instant
 * and is only re-rendered in the target zone, so round-tripping a stored value stays lossless.
 *
 * The returned function accepts the same arguments as `moment()` — no argument for the current time,
 * a value, a value and a format, or a value, a format and the strict-parsing flag.
 *
 * @param {string} [timezone] the name of the timezone, according to the IANA tz database.
 * @return {function(...*): object} a factory returning `moment` objects parsed and rendered in the resolved timezone.
 */
export function momentTimezoneParser(timezone) {
  if (!timezone) {
    return moment;
  }
  if (timezone === 'Etc/UTC') {
    return moment.utc;
  }
  if (!isValidTimezone(timezone)) {
    _warnUnknownZone(timezone);
    return moment;
  }
  return (...args) => {
    // `momentTz` resolves the zone (DST transitions, sub-hour offsets) for both parsing and display, but it
    // wraps a different `moment` build than the locale-aware one imported here, so its own locale is always
    // `en`. Only the resolved instant and offset are taken from it; the returned object is rebuilt on the
    // locale-aware instance so `format('L')` and friends keep honouring the language selected by the user.
    const zoned = momentTz.tz(...args, timezone);
    if (!zoned.isValid()) {
      // Unparseable input is invalid whichever zone it is read in; returning it from the locale-aware
      // instance keeps the type consistent for callers that inspect the result before `isValid()`.
      return moment(...args);
    }
    return moment(zoned.valueOf()).utcOffset(zoned.utcOffset());
  };
}

export default momentTimezone;
