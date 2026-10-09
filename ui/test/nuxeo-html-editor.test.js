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
