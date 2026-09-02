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
