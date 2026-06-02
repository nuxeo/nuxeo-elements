/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

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
import '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-input/paper-textarea.js';

{
  /**
   * An element for generic textarea input in forms
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-textarea/index.html
   */
  class Textarea extends Nuxeo.Element {
    static get template() {
      return html`
        <style>
          :host {
            display: block;
            position: relative;
            padding-bottom: 8px;
            word-break: break-all;
          }

          :host([hidden]) {
            display: none;
          }

          :host([required]) label::after {
            display: inline-block;
            content: '*';
            margin-left: 4px;
            color: var(--paper-input-container-invalid-color, #de350b);
          }

          paper-textarea {
            --paper-input-container: {
              margin-top: 5px;
              padding: 0;
            }
            --iron-autogrow-textarea: {
              padding: 0;
            }
          }

          label {
            @apply --nuxeo-label;
          }
        </style>

        <label>[[label]]</label>

        <paper-textarea
          id="paperTextarea"
          name="[[name]]"
          value="{{value}}"
          rows$="[[rows]]"
          aria-label$="[[_computeAriaLabel(label, placeholder)]]"
          required$="[[required]]"
          disabled$="[[disabled]]"
          readonly$="[[readonly]]"
          error-message="[[errorMessage]]"
          validator$="[[validator]]"
          placeholder$="[[placeholder]]"
          invalid$="[[invalid]]"
          no-label-float
        >
        </paper-textarea>
      `;
    }

    static get is() {
      return 'nuxeo-textarea';
    }

    static get properties() {
      return {
        /**
         * Label.
         */
        label: {
          type: String,
          observer: '_syncNativeTextareaAriaLabel',
        },

        /**
         * Name.
         */
        name: String,

        /**
         * Value.
         */
        value: {
          type: String,
          notify: true,
        },

        /**
         * Initial number of rows.
         */
        rows: Number,

        /**
         * Placeholder.
         */
        placeholder: {
          type: String,
          observer: '_syncNativeTextareaAriaLabel',
        },

        /**
         * Error message to show when `invalid` is true.
         */
        errorMessage: String,

        /**
         * Read only.
         */
        readonly: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        /**
         * Disabled.
         */
        disabled: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        /**
         * Required.
         */
        required: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        /**
         * Invalid.
         */
        invalid: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },
      };
    }

    /* Override method from Polymer.IronValidatableBehavior. */
    _getValidity() {
      return this.$.paperTextarea.validate();
    }

    ready() {
      super.ready();
      // Re-sync once iron-autogrow-textarea reports its inner native <textarea>
      // is wired up; before that the aria-labelledby we need to clear may not exist.
      if (this.$ && this.$.paperTextarea) {
        this.$.paperTextarea.addEventListener('iron-input-ready', () => this._syncNativeTextareaAriaLabel());
      }
      this._syncNativeTextareaAriaLabel();
    }

    connectedCallback() {
      super.connectedCallback();
      this._syncNativeTextareaAriaLabel();
    }

    _computeAriaLabel(label, placeholder) {
      const normalizedLabel = (label || '').trim();
      if (normalizedLabel) {
        return normalizedLabel;
      }
      const normalizedPlaceholder = (placeholder || '').trim();
      return normalizedPlaceholder || null;
    }

    _syncNativeTextareaAriaLabel() {
      // paper-textarea wraps a native textarea; keep both in sync for AT compatibility.
      setTimeout(() => this._applyNativeTextareaAriaLabel(), 0);
    }

    _applyNativeTextareaAriaLabel() {
      const paperTextarea = this.$ && this.$.paperTextarea;
      if (!paperTextarea) {
        return;
      }

      const ariaLabel = this._computeAriaLabel(this.label, this.placeholder);
      if (ariaLabel) {
        paperTextarea.setAttribute('aria-label', ariaLabel);
      } else {
        paperTextarea.removeAttribute('aria-label');
      }

      let nativeTextarea = paperTextarea.shadowRoot && paperTextarea.shadowRoot.querySelector('textarea');
      if (!nativeTextarea && paperTextarea.$ && paperTextarea.$.input && paperTextarea.$.input.textarea) {
        nativeTextarea = paperTextarea.$.input.textarea;
      }
      if (nativeTextarea) {
        if (ariaLabel) {
          nativeTextarea.setAttribute('aria-label', ariaLabel);
        } else {
          nativeTextarea.removeAttribute('aria-label');
        }
        // paper-textarea binds aria-labelledby on the inner textarea to its own
        // internal (empty) <label>, which would otherwise win over aria-label
        // and leave the field unnamed for assistive technologies.
        nativeTextarea.removeAttribute('aria-labelledby');
      }
    }
  }

  customElements.define(Textarea.is, Textarea);
  Nuxeo.Textarea = Textarea;
}
