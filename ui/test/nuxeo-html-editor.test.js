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
import { fixture, html, isElementVisible } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-html-editor.js';

suite('nuxeo-html-editor', () => {
  test('should display the placeholder when empty', async () => {
    const editor = await fixture(
      html`
        <nuxeo-html-editor></nuxeo-html-editor>
      `,
    );
    expect(editor._editor.root.dataset.placeholder).to.equal('Type here...');
  });

  test('should sync the html value', async () => {
    const editor = await fixture(
      html`
        <nuxeo-html-editor value="Hello"></nuxeo-html-editor>
      `,
    );
    await new Promise((resolve) => {
      editor.addEventListener('value-changed', () => resolve());
      editor._editor.insertText(editor._editor.getLength() - 1, ' world!', 'user');
    });
    expect(editor.value).to.equal(`Hello world!`);
  });

  test('should hide the toolbar when readonly', async () => {
    const editor = await fixture(
      html`
        <nuxeo-html-editor read-only></nuxeo-html-editor>
      `,
    );
    expect(isElementVisible(editor._editor.getModule('toolbar').container)).to.be.false;
  });

  test('should show value when readonly', async () => {
    const editor = await fixture(
      html`
        <nuxeo-html-editor read-only value="Hello"></nuxeo-html-editor>
      `,
    );
    const text = editor.shadowRoot.querySelector('.ql-editor').textContent.trim();
    expect(text).to.equal(`Hello`);
  });
});

suite('nuxeo-html-editor extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-html-editor></nuxeo-html-editor>
      `,
    );
  });

  suite('_valueChanged', () => {
    test('does nothing when _editor is not set', () => {
      el._editor = null;
      el._valueChanged();
    });

    test('does nothing when _internalChange is true', () => {
      el._internalChange = true;
      const spy = sinon.spy(el._editor.clipboard, 'convert');
      el._valueChanged();
      expect(spy).not.to.have.been.called;
      spy.restore();
    });

    test('updates editor contents when _editor is set and not internal', () => {
      el._internalChange = false;
      el.value = '<p>Hello</p>';
      const spy = sinon.spy(el._editor, 'setContents');
      el._valueChanged();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });
  });

  suite('_readOnlyChanged', () => {
    test('does nothing when _editor is not set', () => {
      el._editor = null;
      el._readOnlyChanged();
    });

    test('enables editor when readOnly is false', () => {
      el.readOnly = false;
      const enableSpy = sinon.spy(el._editor, 'enable');
      el._readOnlyChanged();
      expect(enableSpy).to.have.been.calledWith(true);
      enableSpy.restore();
    });

    test('disables editor and hides toolbar when readOnly is true', () => {
      el.readOnly = true;
      const enableSpy = sinon.spy(el._editor, 'enable');
      el._readOnlyChanged();
      expect(enableSpy).to.have.been.calledWith(false);
      enableSpy.restore();
    });
  });

  suite('_updateValue', () => {
    test('sets _internalChange during update', () => {
      el._updateValue();
      expect(el._internalChange).to.be.false;
      expect(el.value).to.be.a('string');
    });
  });

  suite('_onImageUpload', () => {
    test('clicks the hidden qlImage button', () => {
      const spy = sinon.spy(el.$.qlImage, 'click');
      el._onImageUpload();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });
  });

  suite('_onSearchImage', () => {
    test('opens the picker', () => {
      const spy = sinon.spy(el.$.picker, 'open');
      el._onSearchImage();
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });
  });

  suite('_onPickerSelected', () => {
    test('inserts images from selected documents', () => {
      const spy = sinon.spy(el._editor.clipboard, 'dangerouslyPasteHTML');
      el._onPickerSelected({
        detail: {
          selectedItems: [{ properties: { 'file:content': { data: 'http://img.png' } } }],
        },
      });
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('filters out documents without file:content', () => {
      const spy = sinon.spy(el._editor.clipboard, 'dangerouslyPasteHTML');
      el._onPickerSelected({
        detail: {
          selectedItems: [{ properties: {} }],
        },
      });
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('does nothing when selectedItems is null', () => {
      el._onPickerSelected({ detail: {} });
    });

    test('does nothing when detail is null', () => {
      el._onPickerSelected({});
    });
  });

  suite('ready (RTL handling)', () => {
    test('sets dir attribute from document if not already set', async () => {
      const origDir = document.documentElement.getAttribute('dir');
      document.documentElement.setAttribute('dir', 'rtl');
      const rtlEl = await fixture(
        html`
          <nuxeo-html-editor></nuxeo-html-editor>
        `,
      );
      expect(rtlEl.getAttribute('dir')).to.equal('rtl');
      if (origDir) {
        document.documentElement.setAttribute('dir', origDir);
      } else {
        document.documentElement.removeAttribute('dir');
      }
    });
  });
});

suite('nuxeo-html-editor color pickers', () => {
  let el;
  let colorPicker;
  let backgroundPicker;

  const press = (target, key) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }));
  const labelOf = (picker) => picker.querySelector('.ql-picker-label');
  const optionsOf = (picker) => picker.querySelector('.ql-picker-options');
  const itemsOf = (picker) => Array.from(picker.querySelectorAll('.ql-picker-item'));
  const instanceOf = (picker) => el._editor.theme.pickers.find((candidate) => candidate.container === picker);
  const openPalette = (picker) => {
    labelOf(picker).focus();
    press(labelOf(picker), 'ArrowDown');
  };
  // Quill restores focus from a setTimeout so that the browser applies it after the DOM settles.
  const settle = (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-html-editor></nuxeo-html-editor>
      `,
    );
    colorPicker = el.shadowRoot.querySelector('.ql-color.ql-picker');
    backgroundPicker = el.shadowRoot.querySelector('.ql-background.ql-picker');
  });

  test('exposes both palettes as labelled listboxes', () => {
    [colorPicker, backgroundPicker].forEach((picker) => {
      expect(labelOf(picker).getAttribute('aria-haspopup')).to.equal('listbox');
      expect(optionsOf(picker).getAttribute('role')).to.equal('listbox');
    });
    expect(optionsOf(colorPicker).getAttribute('aria-label')).to.equal(el.i18n('htmlEditor.color'));
    expect(optionsOf(backgroundPicker).getAttribute('aria-label')).to.equal(el.i18n('htmlEditor.backgroundColor'));
  });

  test('gives every swatch an accessible name instead of a bare color fill', () => {
    const items = itemsOf(colorPicker);
    expect(items).to.have.lengthOf(35);
    items.forEach((item) => {
      expect(item.getAttribute('role')).to.equal('option');
      expect(item.getAttribute('aria-label')).to.be.a('string').and.to.not.be.empty;
      expect(item.getAttribute('title')).to.equal(item.getAttribute('aria-label'));
    });
  });

  test('announces a color by name rather than by hex value', () => {
    const red = itemsOf(colorPicker).find((item) => item.getAttribute('data-value') === '#e60000');
    expect(red.getAttribute('aria-label')).to.equal(el.i18n('htmlEditor.colorName.red'));
    expect(red.getAttribute('aria-label')).to.not.contain('#e60000');
  });

  test('names the format clearing swatch after the palette it belongs to', () => {
    const defaultOf = (picker) => itemsOf(picker).find((item) => !item.hasAttribute('data-value'));
    expect(defaultOf(colorPicker).getAttribute('aria-label')).to.equal(el.i18n('htmlEditor.colorPicker.automatic'));
    expect(defaultOf(backgroundPicker).getAttribute('aria-label')).to.equal(
      el.i18n('htmlEditor.colorPicker.noBackground'),
    );
  });

  test('never announces the background palette with the text color wording', () => {
    el.i18n = (key, ...args) => (args.length > 0 ? `${key}(${args.join('|')})` : key);
    el._syncColorPicker(instanceOf(backgroundPicker));
    expect(labelOf(backgroundPicker).getAttribute('aria-label')).to.equal(
      'htmlEditor.colorPicker.selected(htmlEditor.backgroundColor|htmlEditor.colorPicker.noBackground)',
    );
  });

  test('announces the picker name and the selected color on the trigger', () => {
    el.i18n = (key, ...args) => (args.length > 0 ? `${key}(${args.join('|')})` : key);
    el._syncColorPicker(instanceOf(colorPicker));
    expect(labelOf(colorPicker).getAttribute('aria-label')).to.equal(
      'htmlEditor.colorPicker.selected(htmlEditor.color|htmlEditor.colorPicker.automatic)',
    );
  });

  test('opens the palette with ArrowDown and moves focus onto the selected swatch', () => {
    openPalette(colorPicker);
    expect(colorPicker.classList.contains('ql-expanded')).to.be.true;
    expect(labelOf(colorPicker).getAttribute('aria-expanded')).to.equal('true');
    expect(el.shadowRoot.activeElement).to.equal(itemsOf(colorPicker)[0]);
  });

  test('walks the palette with the arrow keys', () => {
    openPalette(colorPicker);
    const items = itemsOf(colorPicker);
    press(items[0], 'ArrowRight');
    expect(el.shadowRoot.activeElement).to.equal(items[1]);
    press(items[1], 'ArrowDown');
    expect(el.shadowRoot.activeElement).to.equal(items[8]);
    press(items[8], 'ArrowLeft');
    expect(el.shadowRoot.activeElement).to.equal(items[7]);
    press(items[7], 'ArrowUp');
    expect(el.shadowRoot.activeElement).to.equal(items[0]);
  });

  test('jumps to the first and last swatch with Home and End', () => {
    openPalette(colorPicker);
    const items = itemsOf(colorPicker);
    press(items[0], 'End');
    expect(el.shadowRoot.activeElement).to.equal(items[items.length - 1]);
    press(items[items.length - 1], 'Home');
    expect(el.shadowRoot.activeElement).to.equal(items[0]);
  });

  test('does not move past the edges of the palette', () => {
    openPalette(colorPicker);
    const items = itemsOf(colorPicker);
    press(items[0], 'ArrowLeft');
    expect(el.shadowRoot.activeElement).to.equal(items[0]);
    press(items[0], 'ArrowUp');
    expect(el.shadowRoot.activeElement).to.equal(items[0]);
  });

  test('reverses the horizontal arrow keys when the editor is right to left', () => {
    el.setAttribute('dir', 'rtl');
    openPalette(colorPicker);
    const items = itemsOf(colorPicker);
    el._focusColorItem(items, 3);
    press(items[3], 'ArrowRight');
    expect(el.shadowRoot.activeElement).to.equal(items[2]);
  });

  test('applies the focused color with Space and hands focus back to the trigger', () => {
    el._editor.setText('Hello');
    el._editor.setSelection(0, 5);
    openPalette(colorPicker);
    const items = itemsOf(colorPicker);
    press(items[0], 'ArrowRight');
    press(items[1], ' ');
    expect(el._editor.getFormat(0, 5).color).to.equal('#e60000');
    expect(colorPicker.classList.contains('ql-expanded')).to.be.false;
    expect(el.shadowRoot.activeElement).to.equal(labelOf(colorPicker));
  });

  test('marks the applied color as the selected option', () => {
    el._editor.setText('Hello');
    el._editor.setSelection(0, 5);
    const items = itemsOf(colorPicker);
    items[1].click();
    expect(items[1].getAttribute('aria-selected')).to.equal('true');
    expect(items[1].tabIndex).to.equal(0);
    expect(items[0].getAttribute('aria-selected')).to.equal('false');
    expect(items[0].tabIndex).to.equal(-1);
  });

  test('marks the format clearing swatch as selected while Quill marks nothing', () => {
    const items = itemsOf(colorPicker);
    items.forEach((item) => item.classList.remove('ql-selected'));
    el._syncColorPicker(instanceOf(colorPicker));
    // The trigger already announces "Automatic color"; the listbox has to agree with it.
    expect(items[0].getAttribute('aria-selected')).to.equal('true');
    expect(items[0].tabIndex).to.equal(0);
    expect(items.filter((item) => item.getAttribute('aria-selected') !== 'false')).to.have.lengthOf(1);
  });

  test('closes the palette on Escape and restores focus to the trigger', async () => {
    openPalette(colorPicker);
    press(itemsOf(colorPicker)[0], 'Escape');
    expect(colorPicker.classList.contains('ql-expanded')).to.be.false;
    await settle();
    expect(el.shadowRoot.activeElement).to.equal(labelOf(colorPicker));
  });

  test('closes the palette once focus moves to another control', () => {
    openPalette(colorPicker);
    colorPicker.dispatchEvent(
      new FocusEvent('focusout', { relatedTarget: el.$.toolbar.querySelector('button.ql-bold'), bubbles: true }),
    );
    expect(colorPicker.classList.contains('ql-expanded')).to.be.false;
  });

  test('keeps the palette open while focus moves between its swatches', () => {
    openPalette(colorPicker);
    colorPicker.dispatchEvent(new FocusEvent('focusout', { relatedTarget: itemsOf(colorPicker)[3], bubbles: true }));
    expect(colorPicker.classList.contains('ql-expanded')).to.be.true;
  });

  test('falls back to the raw value for a color that is not in the palette', () => {
    expect(el._colorName('#123456', 'none')).to.equal('#123456');
    expect(el._colorName('', 'none')).to.equal('none');
  });

  test('leaves the other Quill pickers untouched', () => {
    const header = el.shadowRoot.querySelector('.ql-header.ql-picker');
    expect(optionsOf(header).getAttribute('role')).to.be.null;
    expect(itemsOf(header)[0].getAttribute('role')).to.equal('button');
  });

  test('does nothing when the theme exposes no pickers', () => {
    el._editor.theme.pickers = null;
    expect(() => el._setupColorPickers()).to.not.throw();
  });
});
