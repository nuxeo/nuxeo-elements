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
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';

import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '../widgets/nuxeo-input.js';
import { FormatBehavior } from '../nuxeo-format-behavior.js';

{
  /**
   * Used by `nuxeo-user-management` and `nuxeo-create-user
   * @appliesMixin Polymer.IronFormElementBehavior
   * @appliesMixin Polymer.IronValidatableBehavior
   * @appliesMixin Nuxeo.FormatBehavior
   * @memberof Nuxeo
   */
  class EditPassword
    extends mixinBehaviors([IronFormElementBehavior, IronValidatableBehavior,
      FormatBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
        width: 100%;
      }
    </style>

    <nuxeo-input id="password" type="password" label="[[i18n('editPassword.password')]]" value="{{password}}" required>
    </nuxeo-input>

    <nuxeo-input
      id="passwordConfirmation"
      type="password"
      label="[[i18n('editPassword.verify')]]"
      value="{{_confirmationPassword}}"
      required
      auto-validate
      pattern="[[escapeRegExp(password)]]"
      error-message="[[_computeErrorMessage(password, i18n)]]">
    </nuxeo-input>
`;
    }

    static get is() {
      return 'nuxeo-edit-password';
    }

    static get properties() {
      return {
        password: {
          type: String,
          notify: true,
        },
        _confirmationPassword: {
          type: String,
        },
      };
    }

    _computeErrorMessage(password) {
      if (!password) {
        return this.i18n('editPassword.required');
      } else {
        return this.i18n('editPassword.noMatch');
      }
    }

    _getValidity() {
      return this.$.passwordConfirmation.validate();
    }

    resetFields() {
      this.set('password', '');
      this.set('_confirmationPassword', '');
    }
  }

  customElements.define(EditPassword.is, EditPassword);
  Nuxeo.EditPassword = EditPassword;
}
