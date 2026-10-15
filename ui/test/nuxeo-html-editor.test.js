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
import { fixture, html, isElementVisible, timePasses } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-html-editor.js';

const keydown = (target, key, shiftKey = false) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, composed: true, cancelable: true }),
  );

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

  suite('image controls keyboard accessibility', () => {
    const buttonFor = (icon) =>
      Array.from(el.$.toolbar.querySelectorAll('button')).find((button) =>
        button.querySelector(`iron-icon[icon="${icon}"]`),
      );

    test('announces that the repository button opens a dialog', () => {
      expect(buttonFor('nuxeo:search-picture').getAttribute('aria-haspopup')).to.equal('dialog');
    });

    test('names the picker dialog after the button that opens it', () => {
      expect(el.$.picker.dialogLabel).to.equal(el.i18n('htmlEditor.insert.imagesFromDocuments'));
    });

    test('carries on in the document once an image has been inserted', () => {
      el._onPickerSelected({
        detail: { selectedItems: [{ properties: { 'file:content': { data: 'http://img.png' } } }] },
      });
      expect(el._editor.hasFocus()).to.be.true;
    });
  });

  suite('link popup keyboard accessibility', () => {
    let tooltip;

    setup(async () => {
      el.value = '<p>Nuxeo home</p>';
      await timePasses(0);
      tooltip = el._tooltip;
    });

    test('exposes the popup as a labelled dialog', () => {
      expect(tooltip.root.getAttribute('role')).to.equal('dialog');
      expect(tooltip.root.getAttribute('aria-label')).to.be.ok;
      expect(tooltip.textbox.getAttribute('aria-label')).to.be.ok;
    });

    test('turns the save and remove controls into focusable buttons', () => {
      ['a.ql-action', 'a.ql-remove'].forEach((selector) => {
        const control = tooltip.root.querySelector(selector);
        expect(control.getAttribute('role')).to.equal('button');
        expect(control.getAttribute('tabindex')).to.equal('0');
        expect(control.getAttribute('aria-label')).to.be.ok;
      });
    });

    test('opens the popup and focuses the url field when nothing is selected', async () => {
      el._editor.setSelection(0, 0);
      el._onLinkAction(true);
      await timePasses(0);
      expect(tooltip.root.classList.contains('ql-hidden')).to.be.false;
      expect(el.shadowRoot.activeElement).to.equal(tooltip.textbox);
    });

    test('inserts the typed url as a link when the caret is collapsed', () => {
      el._editor.setSelection(0, 0);
      el._onLinkAction(true);
      tooltip.textbox.value = 'https://www.nuxeo.com';
      tooltip.save();
      expect(el._editor.getSemanticHTML()).to.contain('https://www.nuxeo.com');
      expect(el._editor.getText()).to.contain('https://www.nuxeo.com');
    });

    test('links the current selection without inserting extra text', () => {
      el._editor.setSelection(0, 10);
      el._onLinkAction(true);
      expect(tooltip.textbox.value).to.equal('Nuxeo home');
      tooltip.textbox.value = 'https://www.nuxeo.com';
      tooltip.save();
      expect(el._editor.getSemanticHTML()).to.contain('href="https://www.nuxeo.com"');
      expect(el._editor.getText().trim()).to.equal('Nuxeo home');
    });

    test('prefixes only selected email addresses with mailto:', () => {
      [
        ['john@nuxeo.com', 'mailto:john@nuxeo.com'],
        ['john@sub@nuxeo.com', 'mailto:john@sub@nuxeo.com'],
        ['john @nuxeo.com', 'john @nuxeo.com'],
        ['john@nuxeo', 'john@nuxeo'],
      ].forEach(([text, expected]) => {
        el.value = `<p>${text}</p>`;
        el._editor.setSelection(0, text.length);
        el._onLinkAction(true);
        expect(tooltip.textbox.value).to.equal(expected);
      });
    });

    test('removes the link when the toolbar button is toggled off', () => {
      const spy = sinon.spy(el._editor, 'format');
      el._onLinkAction(false);
      expect(spy).to.have.been.calledWith('link', false);
      spy.restore();
    });

    test('keeps Tab inside the popup while editing', () => {
      el._editor.setSelection(0, 10);
      el._onLinkAction(true);
      const action = tooltip.root.querySelector('a.ql-action');
      keydown(tooltip.textbox, 'Tab');
      expect(el.shadowRoot.activeElement).to.equal(action);
      keydown(action, 'Tab', true);
      expect(el.shadowRoot.activeElement).to.equal(tooltip.textbox);
    });

    test('saves the link when the save control is activated with Enter', () => {
      el._editor.setSelection(0, 10);
      el._onLinkAction(true);
      tooltip.textbox.value = 'https://www.nuxeo.com';
      keydown(tooltip.root.querySelector('a.ql-action'), 'Enter');
      expect(el._editor.getSemanticHTML()).to.contain('href="https://www.nuxeo.com"');
    });

    test('dismisses the popup when the remove control is activated with Space', () => {
      el._editor.setSelection(0, 10);
      el._onLinkAction(true);
      keydown(tooltip.root.querySelector('a.ql-remove'), ' ');
      expect(tooltip.root.classList.contains('ql-hidden')).to.be.true;
    });

    test('closes the popup on Escape and gives focus back to the toolbar button', () => {
      el._editor.setSelection(0, 10);
      el._onLinkAction(true);
      keydown(tooltip.textbox, 'Escape');
      expect(tooltip.root.classList.contains('ql-hidden')).to.be.true;
      expect(el.shadowRoot.activeElement).to.equal(el.$.toolbar.querySelector('button.ql-link'));
    });

    test('leaves focus alone when the popup is hidden', () => {
      tooltip.hide();
      keydown(tooltip.textbox, 'Escape');
      expect(el.shadowRoot.activeElement).to.not.equal(el.$.toolbar.querySelector('button.ql-link'));
    });

    test('labels the popup and all of its controls for the video mode', () => {
      tooltip.root.setAttribute('data-mode', 'video');
      tooltip.root.classList.remove('ql-editing');
      el._updateTooltipLabels();
      const labelOf = (selector) => tooltip.root.querySelector(selector).getAttribute('aria-label');
      expect(tooltip.root.getAttribute('aria-label')).to.equal(el.i18n('htmlEditor.video.dialog'));
      expect(tooltip.textbox.getAttribute('aria-label')).to.equal(el.i18n('htmlEditor.video.url'));
      expect(labelOf('a.ql-action')).to.equal(el.i18n('htmlEditor.video.edit'));
      expect(labelOf('a.ql-remove')).to.equal(el.i18n('htmlEditor.video.remove'));
      expect(labelOf('a.ql-preview')).to.equal(el.i18n('htmlEditor.video.visit'));
    });

    test('never announces the video popup controls with the link wording', () => {
      tooltip.root.setAttribute('data-mode', 'video');
      tooltip.root.classList.remove('ql-editing');
      el._updateTooltipLabels();
      const names = ['a.ql-action', 'a.ql-remove', 'a.ql-preview'].map((selector) =>
        tooltip.root.querySelector(selector).getAttribute('aria-label'),
      );
      ['htmlEditor.link.edit', 'htmlEditor.link.remove', 'htmlEditor.link.visit'].forEach((key) => {
        expect(names).to.not.contain(el.i18n(key));
      });
    });

    test('updates the popup labels when its mode changes without a class mutation', async () => {
      tooltip.root.setAttribute('data-mode', 'link');
      tooltip.root.classList.remove('ql-editing');
      el._updateTooltipLabels();
      tooltip.root.setAttribute('data-mode', 'video');
      await timePasses(0);
      expect(tooltip.root.getAttribute('aria-label')).to.equal(el.i18n('htmlEditor.video.dialog'));
      expect(tooltip.textbox.getAttribute('aria-label')).to.equal(el.i18n('htmlEditor.video.url'));
    });

    test('gives focus back to the video toolbar button when the video popup is dismissed', () => {
      el._editor.setSelection(0, 0);
      el.$.toolbar.querySelector('button.ql-video').click();
      keydown(tooltip.textbox, 'Escape');
      expect(tooltip.root.classList.contains('ql-hidden')).to.be.true;
      expect(el.shadowRoot.activeElement).to.equal(el.$.toolbar.querySelector('button.ql-video'));
    });

    test('stops observing the popup while detached and resumes once reattached', () => {
      el.disconnectedCallback();
      expect(el._tooltipObserver).to.be.null;
      el.connectedCallback();
      expect(el._tooltipObserver).to.be.ok;
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
  // Quill only marks a swatch once it knows what is in effect, which needs an editor selection.
  const selectAll = (text = 'Hello') => {
    el._editor.setText(text);
    el._editor.setSelection(0, text.length);
  };

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
    selectAll();
    el._syncColorPicker(instanceOf(backgroundPicker));
    expect(labelOf(backgroundPicker).getAttribute('aria-label')).to.equal(
      'htmlEditor.colorPicker.selected(htmlEditor.backgroundColor|htmlEditor.colorPicker.noBackground)',
    );
  });

  test('announces the picker name and the selected color on the trigger', () => {
    el.i18n = (key, ...args) => (args.length > 0 ? `${key}(${args.join('|')})` : key);
    selectAll();
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

  // A screen reader keeps the arrow keys to itself until focus is on an option, and it activates
  // the trigger by pointer, so opening has to move focus however it happened.
  test('moves focus into the palette when it is opened by pointer', async () => {
    labelOf(colorPicker).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
    expect(colorPicker.classList.contains('ql-expanded')).to.be.true;
    await settle();
    expect(el.shadowRoot.activeElement).to.equal(itemsOf(colorPicker)[0]);
  });

  test('leaves focus alone when the palette is closed again by pointer', async () => {
    const label = labelOf(colorPicker);
    label.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
    label.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
    expect(colorPicker.classList.contains('ql-expanded')).to.be.false;
    await settle();
    expect(itemsOf(colorPicker)).to.not.contain(el.shadowRoot.activeElement);
  });

  ['ArrowLeft', 'ArrowRight'].forEach((key) => {
    test(`opens the palette with ${key} and moves focus onto the selected swatch`, () => {
      labelOf(colorPicker).focus();
      press(labelOf(colorPicker), key);
      expect(colorPicker.classList.contains('ql-expanded')).to.be.true;
      expect(el.shadowRoot.activeElement).to.equal(itemsOf(colorPicker)[0]);
    });
  });

  test('describes the palette as running left to right', () => {
    [colorPicker, backgroundPicker].forEach((picker) => {
      expect(optionsOf(picker).getAttribute('aria-orientation')).to.equal('horizontal');
    });
  });

  // These names are written straight onto Quill's DOM, so unlike the template bindings they have
  // to be rewritten by hand when a locale lands after the editor was built.
  test('renames the palette when the locale changes', () => {
    el.i18n = (key) => `xx:${key}`;
    [colorPicker, backgroundPicker].forEach((picker) => {
      const items = itemsOf(picker);
      expect(optionsOf(picker).getAttribute('aria-label')).to.match(/^xx:/);
      expect(labelOf(picker).getAttribute('aria-label')).to.match(/^xx:/);
      expect(items[1].getAttribute('aria-label')).to.equal('xx:htmlEditor.colorName.red');
      expect(items[1].getAttribute('title')).to.equal('xx:htmlEditor.colorName.red');
    });
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

  // Quill floats every swatch left and has no right to left override, so the palette keeps its
  // left to right order and mirroring the arrows would send them the wrong way.
  test('keeps the horizontal arrow keys unmirrored when the editor is right to left', () => {
    el.setAttribute('dir', 'rtl');
    openPalette(colorPicker);
    const items = itemsOf(colorPicker);
    el._focusColorItem(items, 3);
    press(items[3], 'ArrowRight');
    expect(el.shadowRoot.activeElement).to.equal(items[4]);
    press(items[4], 'ArrowLeft');
    expect(el.shadowRoot.activeElement).to.equal(items[3]);
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

  test('applies the focused color with Enter and hands focus back to the trigger', () => {
    el._editor.setText('Hello');
    el._editor.setSelection(0, 5);
    openPalette(colorPicker);
    const items = itemsOf(colorPicker);
    press(items[0], 'ArrowRight');
    press(items[1], 'Enter');
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

  // The swatch that clears the format is at a different index in each palette, so both have to be
  // driven through Quill rather than assumed to be the first one.
  [
    ['text', () => colorPicker, 'htmlEditor.color', 'htmlEditor.colorPicker.automatic'],
    ['background', () => backgroundPicker, 'htmlEditor.backgroundColor', 'htmlEditor.colorPicker.noBackground'],
  ].forEach(([palette, pickerOf, nameKey, clearKey]) => {
    test(`names the ${palette} format clearing swatch while no color is applied`, () => {
      el.i18n = (key, ...args) => (args.length > 0 ? `${key}(${args.join('|')})` : key);
      const picker = pickerOf();
      selectAll();
      el._syncColorPicker(instanceOf(picker));
      const items = itemsOf(picker);
      const cleared = items.find((item) => !item.hasAttribute('data-value'));
      expect(cleared.getAttribute('aria-selected')).to.equal('true');
      expect(cleared.tabIndex).to.equal(0);
      expect(items.filter((item) => item.getAttribute('aria-selected') !== 'false')).to.have.lengthOf(1);
      // The listbox and the trigger have to agree on what is in effect.
      expect(labelOf(picker).getAttribute('aria-label')).to.equal(
        `htmlEditor.colorPicker.selected(${nameKey}|${clearKey})`,
      );
    });
  });

  // Quill unmarks the palette when the selection spans several colors and when its color is not
  // one of the swatches. Reporting the clear swatch for either would claim a color that is not in
  // effect. Assertions stay on primitives: a failing chai assertion over DOM nodes hangs the run.
  const selectedCount = (picker) =>
    itemsOf(picker).filter((item) => item.getAttribute('aria-selected') === 'true').length;

  [
    [
      'the selection spans several colors',
      () => {
        el._editor.setText('Hello');
        // Two explicit colors: leaving part of the range uncolored reads as no color, not mixed.
        el._editor.formatText(0, 2, 'color', '#e60000');
        el._editor.formatText(2, 3, 'color', '#0066cc');
        el._editor.setSelection(0, 5);
      },
    ],
    [
      'the color is not one of the swatches',
      () => {
        el._editor.setText('Hello');
        el._editor.formatText(0, 5, 'color', '#123456');
        el._editor.setSelection(0, 5);
      },
    ],
  ].forEach(([state, arrange]) => {
    test(`reports no selected swatch while ${state}`, () => {
      el.i18n = (key, ...args) => (args.length > 0 ? `${key}(${args.join('|')})` : key);
      arrange();
      el._syncColorPicker(instanceOf(colorPicker));
      expect(selectedCount(colorPicker)).to.equal(0);
      expect(labelOf(colorPicker).getAttribute('aria-label')).to.equal('htmlEditor.color');
      // The listbox still has to be reachable by Tab.
      expect(itemsOf(colorPicker)[0].tabIndex).to.equal(0);
    });
  });

  // Opening a palette focuses the swatch already in effect, so re-picking it is the first thing a
  // keyboard user does. Quill's selectItem returns early in that case and never closes the palette.
  [['Enter'], [' ', 'Space']].forEach(([key, label = key]) => {
    test(`closes the palette when ${label} re-picks the color already applied`, () => {
      el._editor.setText('Hello');
      el._editor.setSelection(0, 5);
      const items = itemsOf(colorPicker);
      items[1].click();
      openPalette(colorPicker);
      expect(el.shadowRoot.activeElement).to.equal(items[1]);
      press(items[1], key);
      expect(el._editor.getFormat(0, 5).color).to.equal('#e60000');
      expect(colorPicker.classList.contains('ql-expanded')).to.be.false;
      expect(el.shadowRoot.activeElement).to.equal(labelOf(colorPicker));
    });
  });

  test('rings a focused swatch in a way that does not depend on its own fill', () => {
    openPalette(colorPicker);
    const { outlineStyle, outlineWidth, boxShadow } = getComputedStyle(el.shadowRoot.activeElement);
    expect(outlineStyle).to.equal('solid');
    expect(parseFloat(outlineWidth)).to.be.at.least(2);
    expect(boxShadow)
      .to.contain('inset')
      .and.to.contain('rgb(255, 255, 255)');
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
