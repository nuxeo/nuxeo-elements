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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../widgets/nuxeo-dialog.js';

{
  /**
   * Element providing a confirmation popup.
   *
   * @memberof Nuxeo
   */
  class PopupConfirm extends Nuxeo.Element {
    static get template() {
      return html`
    <nuxeo-dialog id="dialog" with-backdrop="">
      <paper-dialog-scrollable>
        <slot></slot>
      </paper-dialog-scrollable>
      <div class="buttons">
        <paper-button dialog-dismissive="" on-click="_onCancel">{{cancelLabel}}</paper-button>
        <paper-button dialog-affirmative="" class="colorful" on-click="_onConfirm">{{deleteLabel}}</paper-button>
      </div>
    </nuxeo-dialog>
`;
    }

    static get is() {
      return 'nuxeo-popup-confirm';
    }

    static get properties() {
      return {
        /**
         * Cancel handler.
         */
        onCancel: Function,

        /**
         * Confirm handler.
         */
        onConfirm: Function,

        deleteLabel: {
          type: String,
          value: 'Delete',
        },
        cancelLabel: {
          type: String,
          value: 'Cancel',
        },
      };
    }

    /**
     * Toggle the popup. Optionally you can specific the comfirm handler as parameter.
     */
    toggle(func) {
      if (typeof func === 'function') {
        this.onConfirm = func;
      }
      this.$.dialog.toggle();
    }

    _onCancel() {
      if (this.onCancel) {
        this.onCancel();
      }
      this.toggle();
    }

    _onConfirm() {
      if (this.onConfirm) {
        this.onConfirm();
      }
      this.toggle();
    }
  }

  customElements.define(PopupConfirm.is, PopupConfirm);
  Nuxeo.PopupConfirm = PopupConfirm;
}
