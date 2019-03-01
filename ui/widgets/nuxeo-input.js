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
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-input/paper-input.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

{
  /**
   * An element for generic input in forms
   *
   * @appliesMixin Polymer.IronFormElementBehavior
   * @appliesMixin Polymer.IronValidatableBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-input/index.html
   */
  class Input
    extends mixinBehaviors([IronFormElementBehavior, IronValidatableBehavior], Nuxeo.Element) {
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
        color: var(--paper-input-container-invalid-color, red);
      }

      paper-input {
        --paper-input-container: {
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
      placeholder\$="[[placeholder]]"
      error-message="[[errorMessage]]"
      autofocus\$="[[autofocus]]"
      readonly\$="[[readonly]]"
      disabled\$="[[disabled]]"
      required\$="[[required]]"
      minlength\$="[[minlength]]"
      maxlength\$="[[maxlength]]"
      min\$="[[min]]"
      max\$="[[max]]"
      step\$="[[step]]"
      pattern\$="[[pattern]]"
      auto-validate\$="[[autoValidate]]"
      validator\$="[[validator]]"
      invalid\$="[[invalid]]"
      no-label-float>
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
        label: String,

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
        placeholder: String,

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

    /* Override method from Polymer.IronValidatableBehavior. */
    _getValidity() {
      return this.$.paperInput.validate();
    }
  }

  customElements.define(Input.is, Input);
  Nuxeo.Input = Input;
}
