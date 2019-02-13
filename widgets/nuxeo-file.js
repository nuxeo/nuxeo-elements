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
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/iron-icons/iron-icons.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';
import '../nuxeo-icons.js';
import { UploaderBehavior } from './nuxeo-uploader-behavior.js';

{
  /**
   * An element for uploading blobs using the batch upload API.
   *
   *     <nuxeo-file value="{{document.properties.file:content}}"></nuxeo-file>
   *
   * @appliesMixin Nuxeo.UploaderBehavior
   * @memberof Nuxeo
   * @demo demo/nuxeo-file/index.html
   */
  class File extends mixinBehaviors([UploaderBehavior, I18nBehavior,
    IronFormElementBehavior, IronValidatableBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
    :host {
      @apply --layout-flex;
    }

    [hidden] {
      display: none;
    }

    #dropZone.hover {
      @apply --nuxeo-drop-zone-hover;
    }

    a {
      @apply --nuxeo-link;
    }

    a:hover {
      @apply --nuxeo-link-hover;
    }

    :host([required]) #button::after {
      display: inline-block;
      content: '*';
      margin-left: 4px;
      color: var(--paper-input-container-invalid-color, red);
    }

    :host([invalid]) paper-button {
      color: var(--paper-input-container-invalid-color, red);
      margin-bottom: 5px;
    }

    :host([invalid]) .error {
      color: var(--paper-input-container-invalid-color, red);
    }

    #button {
      margin-bottom: 5px;
    }

    iron-icon {
      cursor: pointer;
    }
    </style>

    <nuxeo-connection id="nx"></nuxeo-connection>

    <input
      hidden
      id="input"
      type="file"
      multiple\$="[[multiple]]"
      accept\$="[[accept]]"
      on-change="_filesChanged"
      required\$="[[required]]">

    <div id="dropZone" hidden\$="[[readonly]]">
      <dom-if if="[[!uploading]]">
        <template>
          <paper-button id="button" raised="" on-click="_pick">
            <iron-icon icon="nuxeo:upload"></iron-icon>
            <span>[[i18n('file.upload')]]</span>
          </paper-button>
        </template>
      </dom-if>
    </div>

    <label class="error" hidden\$="[[!invalid]]">[[errorMessage]]</label>

    <dom-if if="[[_hasSingleValue(multiple, value)]]">
      <template>
        <div class="file">
          <div class="layout horizontal">
            <a href\$="[[_data(value)]]" download="[[_fileName(value)]]">[[_fileName(value)]]</a>
            <iron-icon
              icon="nuxeo:remove"
              title="[[i18n('command.remove')]]"
              on-click="remove"
              hidden\$="[[readonly]]">
            </iron-icon>
          </div>
        </div>
      </template>
    </dom-if>

    <dom-if if="[[multiple]]">
      <template>
        <dom-repeat items="[[value]]" as="file">
          <template>
            <div class="file">
              <div class="layout horizontal">
                <a href\$="[[_data(file)]]" download="[[_fileName(file)]]">[[_fileName(file)]]</a>
                <iron-icon
                  icon="nuxeo:remove"
                  title="[[i18n('command.remove')]]"
                  on-click="remove"
                  hidden\$="[[readonly]]">
                </iron-icon>
              </div>
            </div>
          </template>
        </dom-repeat>
      </template>
    </dom-if>

    <dom-if if="[[readonly]]">
      <template>
        <label class="empty" hidden\$="[[!_hasValue(value)]]">[[emptyLabel]]</label>
      </template>
    </dom-if>
`;
    }

    static get is() {
      return 'nuxeo-file';
    }

    static get properties() {
      return {
        /**
         * Blob reference (`upload-batch` and `upload-fileId).
         */
        value: {
          type: Object,
          notify: true,
        },

        /**
         * Set to `true` to allow uploading multiple files.
         */
        multiple: {
          type: Boolean,
          value: false,
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
         * Required.
         */
        required: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        /**
         * Empty message to show when no uploaded files in readonly mode.
         */
        emptyLabel: String,

        /**
         * Error message to show when `invalid` is true.
         */
        errorMessage: String,
      };
    }

    ready() {
      super.ready();
      this.connection = this.$.nx;
      this.setupDropZone(this.$.dropZone);
      this.addEventListener('batchFinished', this._updateValue);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.teardownDropZone();
    }

    _filesChanged(e) {
      this.uploadFiles(e.target.files);
    }

    _pick() {
      this.$.input.click();
    }

    _updateValue() {
      if (this.multiple) {
        if (!this.value || !Array.isArray(this.value)) {
          this.value = [];
        }
        for (let i = 0; i < this.files.length; i++) {
          this.push('value', {
            'upload-batch': this.batchId,
            'upload-fileId': i.toString(),
          });
        }

      } else {
        this.value = {
          'upload-batch': this.batchId,
          'upload-fileId': (this.files.length - 1).toString(),
        };
      }
    }

    remove(e) {
      if (this.multiple) {
        this.splice('value', e.model.__data.index, 1);
      } else {
        this.value = null;
        this.files = null;
      }
    }

    _fileName(file) {
      return file.name || ('upload-fileId' in file && this.files[Number(file['upload-fileId'])].name);
    }

    _data(file) {
      return file.data || ('upload-fileId' in file && URL.createObjectURL(this.files[Number(file['upload-fileId'])]));
    }

    _getValidity() {
      return !this.required || this._hasValue();
    }

    _hasSingleValue() {
      return !this.multiple && this._hasValue();
    }

    _hasValue() {
      return this.multiple ? !!this.value && this.value.length > 0 : !!this.value;
    }
  }

  customElements.define(File.is, File);
  Nuxeo.File = File;
}
