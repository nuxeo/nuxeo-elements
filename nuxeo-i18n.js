/*
 * (C) Copyright 2016 Nuxeo SA (http://nuxeo.com/) and contributors.
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
 *
 * Contributors:
 *    Gabriel Barata <gbarata@nuxeo.com>
 */

window.nuxeo = window.nuxeo || {};
window.nuxeo.I18n = window.nuxeo.I18n || {};

window.nuxeo.I18n.loadLocale = function() {
  return window.nuxeo.I18n.localeResolver ? window.nuxeo.I18n.localeResolver().then(function() {
    document.dispatchEvent(new Event('i18n-locale-loaded'));
  }) : new Promise(function() {});
};

function XHRLocaleResolver(msgFolder) {
  return function() {
    return new Promise(function(resolve,reject) {
      var language = window.nuxeo.I18n.language || 'en';
      var url = msgFolder +  '/messages.' + language + '.json';
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
          window.nuxeo.I18n[language] = JSON.parse(this.response); // cache this locale.
          resolve(this.response);
        }
      };
      xhr.onerror = function() {
        console.error("Failed to load " + url);
        reject(this.statusText);
      };
      xhr.send();
    });
  }
}
