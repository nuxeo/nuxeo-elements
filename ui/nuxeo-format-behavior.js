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
import 'moment/src/moment.js';

import { I18nBehavior } from './nuxeo-i18n-behavior.js';

/**
 * `Nuxeo.FormatBehavior` provides a set of helpers to format values.
 *
 * @polymerBehavior
 */
export const FormatBehavior = [I18nBehavior, {

  /**
   * Formats a size given in bytes in MB, KB, or bytes.
   */
  formatSize(size) {
    if (!size || size < 0) {
      return '';
    } else if (size > 1048576) {
      return `${parseFloat(size / 1048576).toFixed(2)} MB`;
    } else if (size > 1024) {
      return `${parseFloat(size / 1024).toFixed(2)} KB`;
    } else {
      return `${size.toString()} Bytes`;
    }
  },

  _formatDate(date, fmt) {
    if (!date) return;
    moment.locale(this._languageCode());
    if (fmt && fmt === 'relative') {
      return moment().to(date);
    }
    return moment(date).format(fmt);
  },

  /**
   * Formats a date as a string. Default format is 'MMM D, YYYY'.
   * Use format "relative" to show date relative to current time
   *
   * @param {string} date the date
   * @param {string} format the format, falls back on Nuxeo.UI.config.dateFormat or 'MMM D, YYYY' if null.
   */
  formatDate(date, format) {
    return this._formatDate(date, format ||
      (Nuxeo.UI && Nuxeo.UI.config && Nuxeo.UI.config.dateFormat) ||
      'LL');
  },

  /**
   * Formats a date time as a string. Default format is 'MMMM D, YYYY HH:mm'.
   * Use format "relative" to show date relative to current time
   *
   * @param {string} date the date
   * @param {string} format the format, falls back on Nuxeo.UI.config.dateFormat or 'MMMM D, YYYY HH:mm' if null.
   */
  formatDateTime(date, format) {
    return this._formatDate(date, format ||
      (Nuxeo.UI && Nuxeo.UI.config && Nuxeo.UI.config.dateTimeFormat) ||
      'LLL');
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
    if (doc && doc.properties
        && doc.properties['uid:major_version'] !== undefined && doc.properties['uid:minor_version'] !== undefined) {
      return `${doc.properties['uid:major_version']}.${doc.properties['uid:minor_version']}`;
    } else {
      return '';
    }
  },

  /**
   * Returns the label for the given directory entry.
   */
  formatDirectory(value, separator) {
    if (value && value['entity-type'] && value['entity-type'] === 'directoryEntry') {
      if (value.properties && value.properties.label) {
        return this._absoluteDirectoryPath(value, 'label', separator || '/');
      } else {
        const label = `label_${this._languageCode()}`;
        return this._absoluteDirectoryPath(value, label || 'label_en', separator || '/');
      }
    } else {
      return value;
    }
  },

  _absoluteDirectoryPath(entry, labelField, separator, subPath) {
    const parent = entry.properties.parent;
    let tmp = entry.properties[labelField];
    if (subPath) {
      tmp += separator + subPath;
    }
    if (parent && parent['entity-type'] && parent['entity-type'] === 'directoryEntry') {
      return this._absoluteDirectoryPath(parent, labelField, separator, tmp);
    } else {
      return tmp;
    }
  },

  /**
   * Returns the label for the given document type.
   */
  formatDocType(type) {
    if (!type) {
      return;
    }
    const key = `label.document.type.${type.toLowerCase()}`;
    const value = this.i18n(key);
    return value === key ? type : value;
  },

  /**
   * Returns the label for the given lifecycle state.
   */
  formatLifecycleState(state) {
    const t = this.i18n(`label.ui.state.${state}`);
    return t === `label.ui.state.${state}` ? state : t;
  },

  /**
   * Returns sanitized fulltext
   */
  formatFulltext(text) {
    return text.replace(/-/g, ' ');
  },

  _languageCode() {
    return ((window.nuxeo.I18n.language) ? window.nuxeo.I18n.language.split('-')[0] : 'en');
  },

  /**
   * Formats a xpath string by doing replacements according to a given RegEx.
   * The default behaviour is to replace all '/' by '.'.
   *
   * @param {string} xpath the property xpath
   * @param {string} regex the RegEx to transform the xpath. If not provided it will fallback to the default behaviour.
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

}];
