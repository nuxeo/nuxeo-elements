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
import './quill/quill-snow.js';

{
  /**
   * `nuxeo-html-editor`
   * @memberof Nuxeo
   */
  class HTMLEditor extends Nuxeo.Element {
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
        </style>

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
      const toolbar = [
        [{ header: [1, 2, 3, 4, 5, 6, false] }], // headings
        ['bold', 'italic', 'underline', 'strike'], // style buttons
        [{ align: '' }, { align: 'center' }, { align: 'right' }], // text alignment
        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
        ['blockquote'], // blockquote
        [{ list: 'ordered' }, { list: 'bullet' }], // lists
        ['link', 'image'], // links and media
        ['clean'], // remove formatting button
      ];

      const { placeholder, readOnly } = this;
      this._editor = new Quill(this.$.editor, { theme: 'snow', modules: { toolbar }, placeholder, readOnly });

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
        this._editor.setContents(delta, Quill.sources.USER);
        this._editor.setSelection(0, Quill.sources.SILENT);
      }
    }

    _readOnlyChanged() {
      if (this._editor) {
        this._editor.enable(!this.readOnly);
        this._editor.getModule('toolbar').container.style.display = this.readOnly ? 'none' : '';
      }
    }
  }

  customElements.define(HTMLEditor.is, HTMLEditor);
}
