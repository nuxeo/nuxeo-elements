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
 * @return {function(*=): object} a factory returning `moment` objects bound to the resolved timezone.
 */
export function momentTimezone(timezone) {
  if (!timezone) {
    return moment;
  }
  if (timezone === 'Etc/UTC') {
    return moment.utc;
  }
  if (!isValidTimezone(timezone)) {
    if (!_warnedZones.has(timezone)) {
      _warnedZones.add(timezone);
      console.warn(`nuxeo-timezone: unknown timezone "${timezone}", falling back to the browser's local time.`);
    }
    return moment;
  }
  const zone = momentTz.tz.zone(timezone);
  return (input) => {
    const m = moment(input);
    // `Zone#utcOffset` returns the offset in minutes to add to local time to get UTC (i.e. the negated offset),
    // computed at the given instant so DST and sub-hour offsets are taken into account.
    return m.utcOffset(-zone.utcOffset(m.valueOf()));
  };
}

export default momentTimezone;
