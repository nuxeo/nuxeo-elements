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
import { i18n } from './nuxeo-i18n';

const _getI18nWithPrefix = (prefix, key, ...args) => {
  const label = `${prefix}.${key}`;
  const res = i18n(label, ...args);

  return res === label ? key : res;
};

const _languageCode = () => (window.nuxeo.I18n.language ? window.nuxeo.I18n.language.split('-')[0] : 'en');

const _formatDate = (date, fmt, timezone) => {
  if (!date) return;
  moment.locale(_languageCode());
  const fn = timezone === 'Etc/UTC' ? moment.utc : moment;
  if (fmt && fmt === 'relative') {
    return fn().to(date);
  }
  return fn(date).format(fmt);
};

const _absoluteDirectoryPath = (entry, labelField, separator, subPath) => {
  const { parent } = entry.properties;
  let tmp = entry.properties[labelField];
  if (subPath) {
    tmp += separator + subPath;
  }
  if (parent && parent['entity-type'] && parent['entity-type'] === 'directoryEntry') {
    return _absoluteDirectoryPath(parent, labelField, separator, tmp);
  }
  return tmp;
};

/**
 * Formats a size given in bytes in MB, KB, or bytes.
 */
export const formatSize = (size) => {
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
};

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
export const formatDate = (date, format, timezone) =>
  _formatDate(date, format || config.get('dateFormat', 'LL'), timezone || config.get('timezone'));

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
export const formatDateTime = (date, format, timezone) =>
  _formatDate(date, format || config.get('dateTimeFormat', 'LLL'), timezone || config.get('timezone'));

/**
 * Returns the translated mimetype. Message key is 'mimetype.<value>'.
 */
export const formatMimeType = (value) => {
  if (!value) return;
  return i18n(`mimetype.${value}`);
};

/**
 * Returns the translated rendition name.
 */
export const formatRendition = (value) => {
  if (!value) return;
  return i18n(`exportButton.${value}`);
};

/**
 * Returns the version of a document as <major>.<minor>.
 */
export const formatVersion = (doc) => {
  if (
    doc &&
    doc.properties &&
    doc.properties['uid:major_version'] != null &&
    doc.properties['uid:minor_version'] != null
  ) {
    return `${doc.properties['uid:major_version']}.${doc.properties['uid:minor_version']}`;
  }
  return '';
};

/**
 * Returns the label for the given directory entry.
 */
export const formatDirectory = (value, separator) => {
  if (value && value['entity-type'] && value['entity-type'] === 'directoryEntry') {
    if (value.properties && value.properties.label) {
      return _absoluteDirectoryPath(value, 'label', separator || '/');
    }
    const label = `label_${_languageCode()}`;
    return _absoluteDirectoryPath(value, label || 'label_en', separator || '/');
  }
  return value;
};

/**
 * Returns the label for the given document type.
 */
export const formatDocType = (type) => {
  if (!type) {
    return;
  }
  return _getI18nWithPrefix('label.document.type', type.toLowerCase());
};

/**
 * Returns the label for the given document permission
 */
export const formatPermission = (permission) => {
  if (!permission) {
    return;
  }

  const loweredKey = permission.substring(0, 1).toLowerCase() + permission.substring(1);
  return _getI18nWithPrefix('label.security.permission', loweredKey);
};

/**
 * Returns the label for the given lifecycle state.
 */
export const formatLifecycleState = (state) => _getI18nWithPrefix('label.ui.state', state);

/**
 * Returns sanitized fulltext
 */
export const formatFulltext = (text) => text.replace(/-/g, ' ');

/**
 * Formats a xpath string by doing replacements according to a given RegEx.
 * The default behaviour is to replace all '/' by '.'.
 *
 * @param {string} xpath the property xpath
 * @param {string} regex the RegEx to transform the xpath. If not provided it will fallback to the default
 * behaviour.
 */
export const formatPropertyXpath = (xpath, regex) => xpath.replace(regex || /\//g, '.');

/**
 * Escapes a RegExp string by replacing expression's special characters.
 *
 * @param {string} text the RegExp to be escaped
 */
export const escapeRegExp = (text) => text && text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

/**
 * Escapes a NXQL strings by replacing expression's
 * special characters ' " and \ according to https://doc.nuxeo.com/nxdoc/nxql/
 *
 * @param {string} text the NXQL string literal to be escaped
 */
export const escapeNxqlStringLiteral = (text) => {
  const replaceMap = {
    "'": "\\'",
    '\\': '\\\\',
    '"': '\\"',
  };

  return text && text.replace(/["'\\]/g, (match) => replaceMap[match]);
};
