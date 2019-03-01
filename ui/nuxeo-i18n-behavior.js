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

/*
 * @license
 * (C) Copyright Nuxeo Corp. (http://nuxeo.com/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

window.nuxeo = window.nuxeo || {};
window.nuxeo.I18n = window.nuxeo.I18n || {};

/**
 * Translates the given key.
 * Also accepts a default value and multiple arguments which will be replaced on the value.
 */
window.nuxeo.I18n.translate = window.nuxeo.I18n.translate || function (...args) {
  const language = window.nuxeo.I18n.language || 'en';
  const key = args[0];
  let value = (window.nuxeo.I18n[language] && window.nuxeo.I18n[language][key]) || key;
  const params = Array.prototype.slice.call(args, 1);
  for (let i = 0; i < params.length; i++) {
    value = value.replace(`{${i}}`, params[i]);
  } // improve this to use both numbered and named parameters
  return value;
};

/**
 * loads a locale using a locale resolver
 */
window.nuxeo.I18n.loadLocale = function () {
  return window.nuxeo.I18n.localeResolver ? window.nuxeo.I18n.localeResolver().then(() => {
    // TODO we should refactor this later to use a factory function instead; it requires factoring the resolver as well.
    window.nuxeo.I18n.translate = window.nuxeo.I18n.translate.bind(null);
    document.dispatchEvent(new Event('i18n-locale-loaded'));
  }) : new Promise((() => {}));
};

/**
 * The default locale resolver that reads labels from JSON files in a folder, with format messages.<language>.json
 */
export function XHRLocaleResolver(msgFolder) {
  return function () {
    return new Promise(((resolve) => {
      // point all english based locales to the reference file
      if (window.nuxeo.I18n.language.startsWith('en-')) {
        window.nuxeo.I18n.language = 'en';
      }
      let language = window.nuxeo.I18n.language || 'en';
      function loadLang(url) {
        const referenceFile = `${msgFolder}/messages.json`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              window.nuxeo.I18n[language] = JSON.parse(this.response); // cache this locale
              window.nuxeo.I18n.language = language;
              resolve(this.response);
            } else if (xhr.status === 404 && url !== referenceFile) {
              console.log(`Could not find locale "${language}". Defaulting to "en".`);
              language = 'en';
              loadLang(referenceFile); // default to messages.json
            }
          }
        };
        xhr.onerror = function () {
          console.error(`Failed to load ${url}`);
        };
        xhr.send();
      }
      const url = `${msgFolder}/messages${language === 'en' ? '' : `-${language}`}.json`;
      loadLang(url);
    }));
  };
}

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
