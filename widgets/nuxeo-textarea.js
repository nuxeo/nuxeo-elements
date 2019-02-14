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

      paper-textarea {
        --paper-input-container: {
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
      rows\$="[[rows]]"
      required\$="[[required]]"
      disabled\$="[[disabled]]"
      readonly\$="[[readonly]]"
      error-message="[[errorMessage]]"
      validator\$="[[validator]]"
      invalid\$="[[invalid]]"
      no-label-float>
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
        label: String,

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
        placeholder: String,

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
  }

  customElements.define(Textarea.is, Textarea);
  Nuxeo.Textarea = Textarea;
}
