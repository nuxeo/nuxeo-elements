/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

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
import { LitElement, html } from 'lit';
import { config } from '@nuxeo/nuxeo-elements';
import { formatDate, formatDateTime } from '../nuxeo-format.js';
import { I18nController } from '../controllers/nuxeo-i18n-controller.js';
import './nuxeo-tooltip.js';

/**
 * An element to show a datetime formatted with a tooltip. Format maybe relative to now
 * or [moment Format](http://momentjs.com/docs/#/displaying/format/).
 *
 * Example:
 *
 *     <nuxeo-date datetime="2016-01-06T00:00:00.000Z"></nuxeo-date>
 *     <nuxeo-date datetime="2016-01-06T00:00:00.000Z" format="relative"></nuxeo-date>
 *
 * @appliesMixin Nuxeo.I18nBehavior
 * @appliesMixin Nuxeo.FormatBehavior
 * @memberof Nuxeo
 * @demo demo/nuxeo-date/index.html
 */
class Date extends LitElement {
  static get properties() {
    return {
      /*
       * A string with the date and time to be shown
       */
      datetime: { type: String },
      /*
       * The format of datetime output text representation. Options are "relative" or the
       * [moment Format](http://momentjs.com/docs/#/displaying/format/).
       */
      format: { type: String },
      /*
       * The format of datetime output text tooltip. Options are "relative" or the
       * [moment Format](http://momentjs.com/docs/#/displaying/format/).
       */
      tooltipFormat: { type: String },
      /**
       * The name of the timezone where the user is considered to be, according to the IANA tz database.
       * Currently valid values are:
       * - empty: local time will be used, as read from the browser (this is the default)
       * - Etc/UTC: time specified by the user is assumed to be in UTC
       */
      timezone: { type: String },
    };
  }

  constructor() {
    super();
    this.i18nController = new I18nController(this);
    this.timezone = config.get('timezone');
  }

  render() {
    return html`
      <span id="datetime" ?hidden=${!this.datetime}
        >${formatDate(this.datetime, this.format, this.timezone, this.i18n)}</span
      >
      <nuxeo-tooltip
        for="datetime"
        ?hidden=${this._producesSameDateFormat(this.datetime, this.format, this.tooltipFormat, this.timezone)}
      >
        ${formatDateTime(this.datetime, this.tooltipFormat, this.timezone)}
      </nuxeo-tooltip>
    `;
  }

  _producesSameDateFormat(datetime, format, tooltipFormat, timezone) {
    return formatDate(datetime, format, timezone) === formatDateTime(datetime, tooltipFormat, timezone);
  }
}

customElements.define('nuxeo-date', Date);
Nuxeo.Date = Date;
