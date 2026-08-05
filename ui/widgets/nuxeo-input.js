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
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-input/paper-input.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  /**
   * An element for generic input in forms
   *
   * @appliesMixin Polymer.IronFormElementBehavior
   * @appliesMixin Polymer.IronValidatableBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-input/index.html
   */
  class Input extends mixinBehaviors([I18nBehavior, IronFormElementBehavior, IronValidatableBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style>
          :host {
            display: block;
            position: relative;
            padding-bottom: 8px;
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

          paper-input {
            --paper-input-container: {
              margin-top: 5px;
              padding: 0;
            }
          }

          label {
            @apply --nuxeo-label;
          }
        </style>

        <label>[[label]]</label>

        <paper-input
          id="paperInput"
          type="[[type]]"
          name="[[name]]"
          value="{{value}}"
          placeholder$="[[placeholder]]"
          aria-label$="[[_computeAriaLabel(label, placeholder)]]"
          error-message="[[errorMessage]]"
          autofocus$="[[autofocus]]"
          readonly$="[[readonly]]"
          disabled$="[[disabled]]"
          required$="[[required]]"
          minlength$="[[minlength]]"
          maxlength$="[[maxlength]]"
          min$="[[min]]"
          max$="[[max]]"
          step$="[[step]]"
          pattern$="[[pattern]]"
          auto-validate$="[[autoValidate]]"
          validator$="[[validator]]"
          invalid$="[[invalid]]"
          no-label-float
        >
        </paper-input>
      `;
    }

    static get is() {
      return 'nuxeo-input';
    }

    static get properties() {
      return {
        /**
         * Label.
         */
        label: {
          type: String,
          observer: '_syncNativeInputAriaLabel',
        },

        /**
         * Type.
         */
        type: String,

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
         * Placeholder.
         */
        placeholder: {
          type: String,
          observer: '_syncNativeInputAriaLabel',
        },

        /**
         * Error message to show when `invalid` is true.
         */
        errorMessage: String,

        /**
         * Autofocus.
         */
        autofocus: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

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
         * The minimum (numeric or date-time) input value.
         */
        min: String,

        /**
         * The maximum (numeric or date-time) input value.
         */
        max: String,

        /**
         * The increment value.
         */
        step: Number,

        /**
         * The minimum length of the input value.
         */
        minlength: Number,

        /**
         * The maximum length of the input value.
         */
        maxlength: Number,

        /**
         * A pattern to validate.
         */
        pattern: String,

        /**
         * The name of the custom validator
         */
        validator: String,

        /**
         * Set to true to auto-validate the input value when it changes.
         */
        autoValidate: {
          type: Boolean,
          value: false,
        },
      };
    }

    focus() {
      this.$.paperInput.focus();
    }

    ready() {
      super.ready();
      // Re-sync once the inner native <input> is actually wired up by iron-input;
      // before that event the aria-labelledby we need to clear may not be present.
      if (this.$ && this.$.paperInput) {
        this.$.paperInput.addEventListener('iron-input-ready', () => this._syncNativeInputAriaLabel());
      }
      this._syncNativeInputAriaLabel();
    }

    /* Override method from Polymer.IronValidatableBehavior. */
    _getValidity() {
      const valid = this.$.paperInput.validate();
      this._applyDefaultRequiredError(valid);
      return valid;
    }

    // Surface a per-field reason for required inputs (string and number), consistent with the
    // multivalued and date widgets. Only default when the field is empty and the layout supplied
    // no message, so pattern/min/max errors and layout-supplied messages are never clobbered.
    _applyDefaultRequiredError(valid) {
      const isEmpty = this.value == null || this.value === '';
      if (this.required && !valid && isEmpty) {
        if (!this.errorMessage || this._defaultRequiredError) {
          this.errorMessage = this.i18n('widget.required');
          this._defaultRequiredError = true;
        }
      } else {
        this._clearDefaultRequiredError();
      }
    }

    // Clear only the message we defaulted, so a layout-supplied errorMessage is never lost.
    _clearDefaultRequiredError() {
      if (this._defaultRequiredError) {
        this.errorMessage = '';
        this._defaultRequiredError = false;
      }
    }

    _computeAriaLabel(label, placeholder) {
      const normalizedLabel = (label || '').trim();
      if (normalizedLabel) {
        return normalizedLabel;
      }
      const normalizedPlaceholder = (placeholder || '').trim();
      return normalizedPlaceholder || null;
    }

    _syncNativeInputAriaLabel() {
      // paper-input wraps a native input; keep both in sync for AT compatibility.
      setTimeout(() => this._applyNativeInputAriaLabel(), 0);
    }

    _applyNativeInputAriaLabel() {
      const paperInput = this.$ && this.$.paperInput;
      if (!paperInput) {
        return;
      }

      const ariaLabel = this._computeAriaLabel(this.label, this.placeholder);

      let nativeInput = (paperInput.inputElement && paperInput.inputElement._inputElement) || paperInput.$.nativeInput;
      if (!nativeInput && paperInput.inputElement) {
        // iron-input wraps the native input in its light DOM
        nativeInput = paperInput.inputElement.querySelector && paperInput.inputElement.querySelector('input');
      }
      if (!nativeInput && paperInput.shadowRoot) {
        nativeInput = paperInput.shadowRoot.querySelector('input');
      }
      if (nativeInput) {
        if (ariaLabel) {
          nativeInput.setAttribute('aria-label', ariaLabel);
        } else {
          nativeInput.removeAttribute('aria-label');
        }
        // paper-input binds aria-labelledby to its own internal (empty) <label>,
        // which would otherwise win over aria-label and leave the field unnamed
        // for assistive technologies. Drop it so our aria-label is announced.
        nativeInput.removeAttribute('aria-labelledby');
      }
    }
  }

  customElements.define(Input.is, Input);
  Nuxeo.Input = Input;
}
