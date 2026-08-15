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
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@nuxeo/quill/dist/quill.js';
import '../nuxeo-document-picker/nuxeo-document-picker.js';
import './quill/quill-snow.js';
import { COLOR_NAMES, COLOR_PICKER_COLUMNS } from './quill/quill-color-names.js';
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
          :host {
            display: flex;
            flex-direction: column;
            min-height: 30em;
          }

          #editor {
            outline: none;
            overflow: hidden;
            height: 100%;
          }

          div#editor > * {
            margin-top: 0;
            margin-bottom: 28px;
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
      if (!this.hasAttribute('dir')) {
        const direction = document.documentElement.getAttribute('dir');
        this.setAttribute('dir', direction);
      }
      // init editor
      const { placeholder, readOnly } = this;
      const modules = { toolbar: '#toolbar' };
      this._editor = new Quill(this.$.editor, { theme: 'snow', modules, placeholder, readOnly });
      this._setupColorPickers();
      if (this.getAttribute('dir') === 'rtl') {
        this._editor.format('align', 'right');
        this._editor.format('direction', 'rtl');
      }
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

    /**
     * Quill replaces the color `<select>`s with a palette of bare `<span>`s whose only
     * distinguishing feature is an inline background color: nothing names the trigger or the
     * swatches, and the only key the palette answers to is Enter on the trigger itself. Turn each
     * palette into a listbox of named options and give it the roving focus that pattern implies.
     */
    _setupColorPickers() {
      const { theme } = this._editor;
      const { pickers } = theme || {};
      (pickers || [])
        .filter((picker) => picker.container.classList.contains('ql-color-picker'))
        .forEach((picker) => this._setupColorPicker(picker));
    }

    _setupColorPicker(picker) {
      const { container, label, options } = picker;
      const { name, fallback } = this._colorPickerLabels(picker);
      label.setAttribute('aria-haspopup', 'listbox');
      options.setAttribute('role', 'listbox');
      options.setAttribute('aria-label', name);
      Array.from(options.children).forEach((item) => {
        const colorName = this._colorName(item.dataset.value, fallback);
        item.setAttribute('role', 'option');
        item.setAttribute('aria-label', colorName);
        // The swatch conveys its color by fill alone; a tooltip gives sighted users the name too.
        item.setAttribute('title', colorName);
      });

      const { selectItem, togglePicker } = picker;
      picker.selectItem = (item, trigger) => {
        // Quill closes the palette on selection but leaves focus on the now hidden swatch.
        const restoreFocus = trigger && this._hasColorItemFocus(picker);
        selectItem.call(picker, item, trigger);
        this._syncColorPicker(picker);
        if (restoreFocus) {
          label.focus();
        }
      };
      picker.togglePicker = () => {
        togglePicker.call(picker);
        this._syncColorPicker(picker);
      };

      label.addEventListener('keydown', (e) => this._onColorLabelKeydown(picker, e));
      options.addEventListener('keydown', (e) => this._onColorOptionKeydown(picker, e));
      // A palette left open once focus has moved on hides whatever comes after it.
      container.addEventListener('focusout', (e) => {
        if (container.classList.contains('ql-expanded') && !container.contains(e.relatedTarget)) {
          picker.close();
        }
      });

      this._syncColorPicker(picker);
    }

    _colorPickerLabels(picker) {
      const background = picker.container.classList.contains('ql-background');
      return {
        name: this.i18n(background ? 'htmlEditor.backgroundColor' : 'htmlEditor.color'),
        // The first swatch of each palette clears the format rather than applying a color.
        fallback: this.i18n(background ? 'htmlEditor.colorPicker.noBackground' : 'htmlEditor.colorPicker.automatic'),
      };
    }

    _colorName(value, fallback) {
      if (!value) {
        return fallback;
      }
      const key = COLOR_NAMES[value.toLowerCase()];
      return key ? this.i18n(key) : value;
    }

    _syncColorPicker(picker) {
      const { label, options } = picker;
      const { name, fallback } = this._colorPickerLabels(picker);
      const items = Array.from(options.children);
      // Until a color is applied Quill can leave the palette unmarked, in which case the first
      // swatch — the one that clears the format, and the one the trigger names — is in effect.
      const selected = options.querySelector('.ql-picker-item.ql-selected') || items[0];
      items.forEach((item) => {
        item.setAttribute('aria-selected', String(item === selected));
        // Roving tabindex: the listbox is entered once, then navigated with the arrow keys.
        item.tabIndex = item === selected ? 0 : -1;
      });
      const { dataset = {} } = selected || {};
      const current = this._colorName(dataset.value, fallback);
      label.setAttribute('aria-label', this.i18n('htmlEditor.colorPicker.selected', name, current));
    }

    _hasColorItemFocus(picker) {
      const { activeElement: active } = this.shadowRoot || {};
      return !!active && picker.options.contains(active);
    }

    _focusColorItem(items, index) {
      const item = items[index];
      if (!item) {
        return;
      }
      items.forEach((candidate) => {
        candidate.tabIndex = candidate === item ? 0 : -1;
      });
      item.focus();
    }

    _onColorLabelKeydown(picker, e) {
      if (!['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        return;
      }
      // Quill's own listener already toggled the palette on Enter.
      if (e.key !== 'Enter') {
        e.preventDefault();
        if (!picker.container.classList.contains('ql-expanded')) {
          picker.togglePicker();
        }
      }
      if (!picker.container.classList.contains('ql-expanded')) {
        return;
      }
      const items = Array.from(picker.options.children);
      this._focusColorItem(items, Math.max(0, items.indexOf(picker.options.querySelector('.ql-selected'))));
    }

    _onColorOptionKeydown(picker, e) {
      const items = Array.from(picker.options.children);
      const index = items.indexOf(e.target);
      if (index < 0) {
        return;
      }
      const columns = Math.min(COLOR_PICKER_COLUMNS, items.length);
      const forward = this.getAttribute('dir') === 'rtl' ? -1 : 1;
      let next;
      switch (e.key) {
        case 'ArrowRight':
          next = index + forward;
          break;
        case 'ArrowLeft':
          next = index - forward;
          break;
        case 'ArrowDown':
          next = index + columns;
          break;
        case 'ArrowUp':
          next = index - columns;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = items.length - 1;
          break;
        case ' ':
          e.preventDefault();
          items[index].click();
          return;
        default:
          return;
      }
      e.preventDefault();
      if (next >= 0 && next < items.length) {
        this._focusColorItem(items, next);
      }
    }
  }

  customElements.define(HTMLEditor.is, HTMLEditor);
}
