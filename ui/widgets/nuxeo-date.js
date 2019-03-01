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
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { FormatBehavior } from '../nuxeo-format-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import './nuxeo-tooltip.js';

{
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
  class Date extends mixinBehaviors([I18nBehavior, FormatBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <span id="datetime" hidden\$="[[!datetime]]">[[formatDate(datetime, format)]]</span>
    <nuxeo-tooltip for="datetime">[[formatDateTime(datetime, tooltipFormat)]]</nuxeo-tooltip>
`;
    }

    static get is() {
      return 'nuxeo-date';
    }

    static get properties() {
      return {
        /*
         * A string with the date and time to be shown
         */
        datetime: {
          type: String,
        },

        /*
         * The format of datetime output text representation. Options are "relative" or the
         * [moment Format](http://momentjs.com/docs/#/displaying/format/).
         */
        format: String,

        /*
         * The format of datetime output text tooltip. Options are "relative" or the
         * [moment Format](http://momentjs.com/docs/#/displaying/format/).
         */
        tooltipFormat: String,
      };
    }
  }

  customElements.define(Date.is, Date);
  Nuxeo.Date = Date;
}
