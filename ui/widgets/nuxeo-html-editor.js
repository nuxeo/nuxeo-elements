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
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/quill/dist/quill.js';
import '../nuxeo-document-picker/nuxeo-document-picker.js';
import './quill/quill-snow.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  /**
   * `nuxeo-html-editor`
   * @memberof Nuxeo
   */
  class HTMLEditor extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
        <style include="quill-snow">
          #editor {
            outline: none;
            height: 100%;
            min-height: 30em;
          }

          div#editor > * {
            margin-top: 0;
          }

          iron-icon {
            height: 18px;
            color: #444;
          }
        </style>

        <nuxeo-document-picker
          id="picker"
          provider="document_picker"
          page-size="40"
          schemas="dublincore,file"
          enrichers="thumbnail,permissions,highlight"
          search-name="document_picker"
          on-picked="_onPickerSelected"
        ></nuxeo-document-picker>

        <div id="toolbar">
          <span class="ql-formats">
            <select class="ql-header" title$="[[i18n('htmlEditor.header')]]">
              <option value="1"></option>
              <option value="2"></option>
              <option value="3"></option>
              <option value="4"></option>
              <option value="5"></option>
              <option value="6"></option>
              <option selected></option>
            </select>
          </span>
          <span class="ql-formats">
            <button class="ql-bold" title$="[[i18n('htmlEditor.bold')]]"></button>
            <button class="ql-italic" title$="[[i18n('htmlEditor.italic')]]"></button>
            <button class="ql-underline" title$="[[i18n('htmlEditor.underline')]]"></button>
            <button class="ql-strike" title$="[[i18n('htmlEditor.strike')]]"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-blockquote" title$="[[i18n('htmlEditor.blockquote')]]"></button>
            <button class="ql-code-block" title$="[[i18n('htmlEditor.codeBlock')]]"></button>
            <button class="ql-indent" value="-1" title$="[[i18n('htmlEditor.indent.decrease')]]"></button>
            <button class="ql-indent" value="+1" title$="[[i18n('htmlEditor.indent.increase')]]"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-align" value="" title$="[[i18n('htmlEditor.align.left')]]"></button>
            <button class="ql-align" value="center" title$="[[i18n('htmlEditor.align.center')]]"></button>
            <button class="ql-align" value="right" title$="[[i18n('htmlEditor.align.right')]]"></button>
          </span>
          <span class="ql-formats">
            <select class="ql-color" title$="[[i18n('htmlEditor.color')]]"></select>
            <select class="ql-background" title$="[[i18n('htmlEditor.backgroundColor')]]"></select>
          </span>
          <span class="ql-formats">
            <button class="ql-script" value="sub" title$="[[i18n('htmlEditor.subscript')]]"></button>
            <button class="ql-script" value="super" title$="[[i18n('htmlEditor.superscript')]]"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-list" value="ordered" title$="[[i18n('htmlEditor.list.numbered')]]"></button>
            <button class="ql-list" value="bullet" title$="[[i18n('htmlEditor.list.bulleted')]]"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-link" title$="[[i18n('htmlEditor.insert.link')]]"></button>
            <!-- hide the default Quill image upload button, then trigger it from the button with the custom icon -->
            <button
              id="qlImage"
              class="ql-image"
              style="display: none;"
              title$="[[i18n('htmlEditor.insert.image')]]"
            ></button>
            <button on-tap="_onImageUpload" title$="[[i18n('htmlEditor.insert.image')]]">
              <iron-icon icon="nuxeo:picture"></iron-icon>
            </button>
            <button on-tap="_onSearchImage" title$="[[i18n('htmlEditor.insert.imagesFromDocuments')]]">
              <iron-icon icon="nuxeo:search-picture"></iron-icon>
            </button>
            <button class="ql-video" title$="[[i18n('htmlEditor.insert.video')]]"></button>
          </span>
          <span class="ql-formats">
            <button class="ql-clean" title$="[[i18n('htmlEditor.clearFormatting')]]"></button>
          </span>
        </div>

        <div id="editor"></div>
      `;
    }

    static get is() {
      return 'nuxeo-html-editor';
    }

    static get properties() {
      return {
        /**
         * HTML value
         */
        value: {
          type: String,
          notify: true,
        },

        /**
         * Placeholder content to be displayed when empty
         */
        placeholder: {
          type: String,
          value: 'Type here...',
        },

        /**
         * When set the content will be read only.
         */
        readOnly: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        _editor: {
          type: Object,
        },
      };
    }

    static get observers() {
      return ['_valueChanged(value, _editor)', '_readOnlyChanged(readOnly, _editor)'];
    }

    static get importMeta() {
      return import.meta;
    }

    ready() {
      super.ready();
      // init editor
      const { placeholder, readOnly } = this;
      const modules = { toolbar: '#toolbar' };
      this._editor = new Quill(this.$.editor, { theme: 'snow', modules, placeholder, readOnly });

      // update value on change
      this._editor.on('text-change', () => {
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(200), () => this._updateValue());
      });
    }

    _updateValue() {
      this._internalChange = true;
      this.value = this._editor.getSemanticHTML();
      this._internalChange = false;
    }

    _valueChanged() {
      if (this._editor && !this._internalChange) {
        const delta = this._editor.clipboard.convert({ html: this.value });
        this._editor.setContents(delta, this.readOnly ? Quill.sources.SILENT : Quill.sources.USER);
        this._editor.setSelection(0, Quill.sources.SILENT);
      }
    }

    _readOnlyChanged() {
      if (this._editor) {
        this._editor.enable(!this.readOnly);
        this._editor.getModule('toolbar').container.style.display = this.readOnly ? 'none' : '';
      }
    }

    _onImageUpload() {
      this.$.qlImage.click();
    }

    _onSearchImage() {
      this.$.picker.open();
    }

    _onPickerSelected(e) {
      const selectedDocuments = e.detail && e.detail.selectedItems;
      if (selectedDocuments) {
        const templateToInsert = selectedDocuments
          .filter((doc) => doc.properties['file:content'] && doc.properties['file:content'].data)
          .map((doc) => `<img src="${doc.properties['file:content'].data}">`)
          .join('\n');
        this._editor.clipboard.dangerouslyPasteHTML(this._editor.getSelection(true).index, templateToInsert);
      }
    }
  }

  customElements.define(HTMLEditor.is, HTMLEditor);
}
