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
import '@polymer/polymer/polymer-legacy.js';
import './nuxeo-i18n.js';

export * from './nuxeo-i18n.js';

/**
 * `Nuxeo.I18nBehavior` provides a `i18n` helper function for translations.
 *
 * @polymerBehavior
 */
export const I18nBehavior = {
  properties: {
    /**
     * Returns the translation for the given key.
     */
    i18n: {
      type: Function,
      notify: true,
      value() {
        return window.nuxeo.I18n.translate;
      },
    },
  },

  created() {
    this.localeLoadedHandler = this.refreshI18n.bind(this);
    document.addEventListener('i18n-locale-loaded', this.localeLoadedHandler);
  },

  detached() {
    document.removeEventListener('i18n-locale-loaded', this.localeLoadedHandler);
    this.localeLoadedHandler = null;
  },

  refreshI18n() {
    // this.i18n = null;
    this.set('i18n', window.nuxeo.I18n.translate);
  },
};
