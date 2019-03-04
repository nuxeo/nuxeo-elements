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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { I18nBehavior } from './nuxeo-i18n-behavior.js';

{
  /**
   * An element to display errors.
   *
   * Example:
   *
   *     <nuxeo-error code="404"></nuxeo-error>
   *
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-error/index.html
   */
  class Error extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
        padding: 24px;
        background: rgba(0, 0, 0, 0.025);
        border-radius: 4px;
        border: 1px dashed rgba(0, 0, 0, 0.1);
      }

      :host([hidden]) {
        display: none !important;
      }

      .code {
        @apply --layout-flex;
        text-transform: uppercase;
        color: var(--nuxeo-text-default, rgba(0,0,0,0.3));
        text-align: center;
        font-size: 1.4rem;
        font-weight: 700;
      }

      .description {
        @apply --layout-flex;
        text-transform: uppercase;
        color: var(--nuxeo-text-default, rgba(0,0,0,0.3));
        text-align: center;
        font-size: 1.2rem;
        font-weight: 500;
        padding: 8px;
      }

      .url {
        @apply --layout-flex;
        color: var(--nuxeo-text-default, rgba(0,0,0,0.3));
        text-align: center;
        padding: 16px 0;
        font-size: .8rem;
      }

      .message {
        @apply --layout-flex;
        color: var(--nuxeo-text-default, rgba(0,0,0,0.3));
        text-align: center;
        padding: 8px 0;
        font-size: 1rem;
        font-weight: 500;
      }
    </style>

    <div class="code" hidden\$="[[!code]]">[[code]]</div>
    <div class="description" hidden\$="[[!code]]">[[_label(code)]]</div>
    <div class="url" hidden\$="[[!url]]">[[url]]</div>
    <div class="message" hidden\$="[[!message]]">[[message]]</div>
`;
    }

    static get is() {
      return 'nuxeo-error';
    }

    static get properties() {
      return {
        /**
         * The error code. Description will rely on a label with key 'error.<code>'.
         * */
        code: String,

        /**
         * Error message to display.
         * */
        message: String,

        url: String,

        hidden: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },
      };
    }

    show(code, url, message) {
      if (arguments.length) {
        this.code = code;
        this.url = url;
        this.message = message;
      }
      this.hidden = false;
    }

    hide() {
      this.hidden = true;
    }

    _label() {
      return this.i18n(`error.${this.code}`);
    }
  }

  customElements.define(Error.is, Error);
  Nuxeo.Error = Error;
}
