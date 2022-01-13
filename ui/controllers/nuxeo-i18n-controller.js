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
import '../nuxeo-i18n.js';

/**
 * Ideally, `I18nController` would implement the `ReactiveController` interface.
 */
export class I18nController {
  constructor(host) {
    (this.host = host).addController(this);
    this.refreshI18n();
  }

  refreshI18n() {
    const oldValue = this.host.i18n;
    this.host.i18n = window.nuxeo.I18n.translate;
    this.host.requestUpdate('i18n', oldValue);
  }

  hostConnected() {
    this.localeLoadedHandler = this.refreshI18n.bind(this);
    document.addEventListener('i18n-locale-loaded', this.localeLoadedHandler);
  }

  hostDisconnected() {
    document.removeEventListener('i18n-locale-loaded', this.localeLoadedHandler);
    this.localeLoadedHandler = null;
  }
}
