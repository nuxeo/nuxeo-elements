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
import moment from '@nuxeo/moment/min/moment-with-locales.js';

import { config } from '@nuxeo/nuxeo-elements';
import { I18nBehavior } from './nuxeo-i18n-behavior.js';

/**
 * `Nuxeo.FormatBehavior` provides a set of helpers to format values.
 *
 * @polymerBehavior
 */
export const FormatBehavior = [
  I18nBehavior,
  {
    /**
     * Formats a size given in bytes in MB, KB, or bytes.
     */
    formatSize(size) {
      if (!size || size < 0) {
        return '';
      }
      if (size > 1048576) {
        return `${parseFloat(size / 1048576).toFixed(2)} MB`;
      }
      if (size > 1024) {
        return `${parseFloat(size / 1024).toFixed(2)} KB`;
      }
      return `${size.toString()} Bytes`;
    },

    _formatDate(date, fmt, timezone) {
      if (!date) return;
      moment.locale(this._languageCode());
      const fn = timezone === 'Etc/UTC' ? moment.utc : moment;
      if (fmt && fmt === 'relative') {
        return fn().to(date);
      }
      return fn(date).format(fmt);
    },

    /**
     * Formats a date as a string. Default format is 'MMM D, YYYY'.
     * Use format "relative" to show date relative to current time
     *
     * @param {string} date the date
     * @param {string} format the format, falls back on Nuxeo.UI.config.dateFormat or 'MMM D, YYYY' if null.
     * @param {string} timezone the name of the timezone of the date, according to the IANA tz database.
     *     Currently valid values are:
     *     - empty: local time will be used, as read from the browser (this is the default)
     *     - Etc/UTC: time specified by the user is assumed to be in UTC
     */
    formatDate(date, format, timezone) {
      return this._formatDate(date, format || config.get('dateFormat', 'LL'), timezone || config.get('timezone'));
    },

    /**
     * Formats a date time as a string. Default format is 'MMMM D, YYYY HH:mm'.
     * Use format "relative" to show date relative to current time
     *
     * @param {string} date the date
     * @param {string} format the format, falls back on Nuxeo.UI.config.dateFormat or 'MMMM D, YYYY HH:mm' if null.
     * @param {string} timezone the name of the timezone of the date, according to the IANA tz database.
     *     Currently valid values are:
     *     - empty: local time will be used, as read from the browser (this is the default)
     *     - Etc/UTC: time specified by the user is assumed to be in UTC
     */
    formatDateTime(date, format, timezone) {
      return this._formatDate(date, format || config.get('dateTimeFormat', 'LLL'), timezone || config.get('timezone'));
    },

    /**
     * Returns the translated mimetype. Message key is 'mimetype.<value>'.
     */
    formatMimeType(value) {
      if (!value) return;
      return this.i18n(`mimetype.${value}`);
    },

    /**
     * Returns the translated rendition name.
     */
    formatRendition(value) {
      if (!value) return;
      return this.i18n(`exportButton.${value}`);
    },

    /**
     * Returns the version of a document as <major>.<minor>.
     */
    formatVersion(doc) {
      if (
        doc &&
        doc.properties &&
        doc.properties['uid:major_version'] != null &&
        doc.properties['uid:minor_version'] != null
      ) {
        return `${doc.properties['uid:major_version']}.${doc.properties['uid:minor_version']}`;
      }
      return '';
    },

    /**
     * Returns the label for the given directory entry.
     */
    formatDirectory(value, separator) {
      if (value && value['entity-type'] && value['entity-type'] === 'directoryEntry') {
        if (value.properties && value.properties.label) {
          return this._absoluteDirectoryPath(value, 'label', separator || '/');
        }
        const label = `label_${this._languageCode()}`;
        return this._absoluteDirectoryPath(value, label || 'label_en', separator || '/');
      }
      return value;
    },

    _absoluteDirectoryPath(entry, labelField, separator, subPath) {
      const { parent } = entry.properties;
      let tmp = entry.properties[labelField];
      if (subPath) {
        tmp += separator + subPath;
      }
      if (parent && parent['entity-type'] && parent['entity-type'] === 'directoryEntry') {
        return this._absoluteDirectoryPath(parent, labelField, separator, tmp);
      }
      return tmp;
    },

    /**
     * Returns the label for the given document type.
     */
    formatDocType(type) {
      if (!type) {
        return;
      }
      return this._getI18nWithPrefix('label.document.type', type.toLowerCase());
    },

    /**
     * Returns the label for the given document permission
     */
    formatPermission(permission) {
      if (!permission) {
        return;
      }

      const loweredKey = permission.substring(0, 1).toLowerCase() + permission.substring(1);
      return this._getI18nWithPrefix('label.security.permission', loweredKey);
    },

    /**
     * Returns the label for the given lifecycle state.
     */
    formatLifecycleState(state) {
      return this._getI18nWithPrefix('label.ui.state', state);
    },

    _getI18nWithPrefix(prefix, key, ...args) {
      const label = `${prefix}.${key}`;
      const res = this.i18n(label, ...args);

      return res === label ? key : res;
    },

    /**
     * Returns sanitized fulltext
     */
    formatFulltext(text) {
      return text.replace(/-/g, ' ');
    },

    _languageCode() {
      return window.nuxeo.I18n.language ? window.nuxeo.I18n.language.split('-')[0] : 'en';
    },

    /**
     * Formats a xpath string by doing replacements according to a given RegEx.
     * The default behaviour is to replace all '/' by '.'.
     *
     * @param {string} xpath the property xpath
     * @param {string} regex the RegEx to transform the xpath. If not provided it will fallback to the default
     * behaviour.
     */
    formatPropertyXpath(xpath, regex) {
      return xpath.replace(regex || /\//g, '.');
    },

    /**
     * Escapes a RegExp string by replacing expression's special characters.
     *
     * @param {string} text the RegExp to be escaped
     */
    escapeRegExp(text) {
      return text && text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    },

    /**
     * Escapes a NXQL strings by replacing expression's
     * special characters ' " and \ according to https://doc.nuxeo.com/nxdoc/nxql/
     *
     * @param {string} text the NXQL string literal to be escaped
     */
    escapeNxqlStringLiteral(text) {
      const replaceMap = {
        "'": "\\'",
        '\\': '\\\\',
        '"': '\\"',
      };

      return text && text.replace(/["'\\]/g, (match) => replaceMap[match]);
    },
  },
];
