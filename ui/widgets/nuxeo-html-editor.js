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
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

  // Controls rendered inside Quill's link tooltip, in DOM order.
  const TOOLTIP_CONTROLS = 'a.ql-preview, input[type="text"], a.ql-action, a.ql-remove';

  // The tooltip is shared by the link and video buttons, so its labels depend on the mode.
  const TOOLTIP_LABELS = {
    link: { dialog: 'htmlEditor.link.dialog', url: 'htmlEditor.link.url' },
    video: { dialog: 'htmlEditor.video.dialog', url: 'htmlEditor.video.url' },
  };

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
      const modules = {
        toolbar: { container: '#toolbar', handlers: { link: (value) => this._onLinkAction(value) } },
      };
      this._editor = new Quill(this.$.editor, { theme: 'snow', modules, placeholder, readOnly });
      if (this.getAttribute('dir') === 'rtl') {
        this._editor.format('align', 'right');
        this._editor.format('direction', 'rtl');
      }
      // update value on change
      this._editor.on('text-change', () => {
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(200), () => this._updateValue());
      });
      this._setupTooltipAccessibility();
    }

    connectedCallback() {
      super.connectedCallback();
      this._observeTooltip();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._tooltipObserver) {
        this._tooltipObserver.disconnect();
        this._tooltipObserver = null;
      }
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

    /**
     * Toolbar handler for the link button.
     *
     * Quill's own handler returns early when the selection is empty, which leaves the button
     * inert for anyone who reaches it with the keyboard without having selected text first.
     * Here the popup always opens, and a collapsed caret inserts the URL as its own link.
     */
    _onLinkAction(value) {
      if (!value) {
        this._editor.format('link', false, Quill.sources.USER);
        return;
      }
      const range = this._editor.getSelection(true);
      if (!range || !this._tooltip) {
        return;
      }
      this._linkInsertRange = range.length === 0 ? range : null;
      let preview = range.length > 0 ? this._editor.getText(range) : '';
      if (EMAIL_PATTERN.test(preview) && preview.indexOf('mailto:') !== 0) {
        preview = `mailto:${preview}`;
      }
      this._tooltip.edit('link', preview);
    }

    /**
     * Quill's link tooltip ships as a bare `<input>` flanked by two anchors with no `href`,
     * so its Save/Edit/Remove controls are neither focusable nor named. Give them button
     * semantics, keep focus inside the popup while it is open and honour Enter/Escape.
     */
    _setupTooltipAccessibility() {
      const tooltip = this._editor.theme && this._editor.theme.tooltip;
      if (!tooltip || !tooltip.root) {
        return;
      }
      this._tooltip = tooltip;
      tooltip.root.setAttribute('role', 'dialog');
      tooltip.root.querySelectorAll('a.ql-action, a.ql-remove').forEach((control) => {
        control.setAttribute('role', 'button');
        control.setAttribute('tabindex', '0');
      });
      // Capture phase: Quill's own handler hides the popup on Escape, and once it is hidden
      // there is nothing left to hand focus back from.
      tooltip.root.addEventListener('keydown', (e) => this._onTooltipKeydown(e), true);

      // Quill only formats an existing selection, so nothing is linked when the caret is collapsed.
      const { save } = tooltip;
      tooltip.save = () => {
        const url = tooltip.textbox.value;
        const range = this._linkInsertRange;
        this._linkInsertRange = null;
        if (range && url && tooltip.root.getAttribute('data-mode') === 'link') {
          this._editor.insertText(range.index, url, 'link', url, Quill.sources.USER);
          this._editor.setSelection(range.index + url.length, Quill.sources.SILENT);
          tooltip.textbox.value = '';
          tooltip.hide();
          return;
        }
        save.call(tooltip);
      };

      this._updateTooltipLabels();
      this._observeTooltip();
    }

    _observeTooltip() {
      if (!this._tooltip || this._tooltipObserver) {
        return;
      }
      this._tooltipObserver = new MutationObserver(() => this._onTooltipStateChanged());
      this._tooltipObserver.observe(this._tooltip.root, { attributes: true, attributeFilter: ['class'] });
    }

    _onTooltipStateChanged() {
      this._updateTooltipLabels();
      const editing = this._isTooltipEditing();
      // Entering edit mode is the point where the user is expected to type, so take focus there.
      if (editing && !this._tooltipEditing) {
        this._tooltip.textbox.focus();
        this._tooltip.textbox.select();
      }
      this._tooltipEditing = editing;
    }

    _updateTooltipLabels() {
      const { root } = this._tooltip;
      const labels = TOOLTIP_LABELS[root.getAttribute('data-mode')] || TOOLTIP_LABELS.link;
      root.setAttribute('aria-label', this.i18n(labels.dialog));
      this._tooltip.textbox.setAttribute('aria-label', this.i18n(labels.url));
      const action = root.querySelector('a.ql-action');
      const remove = root.querySelector('a.ql-remove');
      const preview = root.querySelector('a.ql-preview');
      if (action) {
        action.setAttribute(
          'aria-label',
          root.classList.contains('ql-editing')
            ? this.i18n('htmlEditor.tooltip.save')
            : this.i18n('htmlEditor.link.edit'),
        );
      }
      if (remove) {
        remove.setAttribute('aria-label', this.i18n('htmlEditor.link.remove'));
      }
      if (preview) {
        preview.setAttribute('aria-label', this.i18n('htmlEditor.link.visit'));
      }
    }

    _isTooltipEditing() {
      const { classList } = this._tooltip.root;
      return !classList.contains('ql-hidden') && classList.contains('ql-editing');
    }

    _onTooltipKeydown(e) {
      if (this._tooltip.root.classList.contains('ql-hidden')) {
        return;
      }
      const target = e.composedPath()[0];
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this._closeTooltip();
      } else if ((e.key === 'Enter' || e.key === ' ') && target.matches && target.matches('a.ql-action, a.ql-remove')) {
        e.preventDefault();
        target.click();
      } else if (e.key === 'Tab' && this._isTooltipEditing()) {
        // While editing, the popup behaves as a dialog: Tab must not escape it.
        const controls = this._visibleTooltipControls();
        const index = controls.indexOf(target);
        if (controls.length === 0 || index < 0) {
          return;
        }
        e.preventDefault();
        const next = (index + (e.shiftKey ? -1 : 1) + controls.length) % controls.length;
        controls[next].focus();
      }
    }

    _visibleTooltipControls() {
      return Array.from(this._tooltip.root.querySelectorAll(TOOLTIP_CONTROLS)).filter(
        (control) => control.getClientRects().length > 0,
      );
    }

    _closeTooltip() {
      const editing = this._tooltip.root.classList.contains('ql-editing');
      const linkButton = editing && this.$.toolbar.querySelector('button.ql-link');
      // Move focus out before hiding: the browser resets focus to the body when the
      // focused control disappears, which would strand a keyboard user at the top of the page.
      if (linkButton) {
        linkButton.focus();
      } else {
        this._editor.focus();
      }
      this._tooltip.hide();
      this._linkInsertRange = null;
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
