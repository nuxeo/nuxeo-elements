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
import '@webcomponents/html-imports/html-imports.min.js';
import {
  fixture,
  flush,
  html,
  isElementVisible,
  waitChanged,
  waitForEvent,
  waitForAttrMutation,
} from '@nuxeo/testing-helpers';
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import '../nuxeo-layout.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-html-editor.js';
import '../nuxeo-data-table/iron-data-table.js';

// determine base module path (relies on @open-wc/webpack-import-meta-loader)
const { url } = import.meta;
const base = url.substring(0, url.lastIndexOf('/'));

// Export Polymer and PolymerElement for 1.x and 2.x compat
window.Polymer = Polymer;

const layoutLoad = async (layout) => (!layout.element ? waitChanged(layout, 'element') : null);

suite('nuxeo-layout', () => {
  suite('Error handling', () => {
    test('Should display nuxeo-error when layout is not found', async () => {
      const layout = await fixture(
        html`
          <nuxeo-layout href="notfound.html"></nuxeo-layout>
        `,
      );

      const nuxeoError = layout.$.error;
      if (!isElementVisible(nuxeoError)) {
        await waitForAttrMutation(nuxeoError, 'hidden', null);
      }
      expect(isElementVisible(layout.$.container)).to.be.false;
      expect(isElementVisible(nuxeoError)).to.be.true;
    });
  });

  suite('Stamping', () => {
    test('Should map model into layout when model is defined', async () => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/dummy-layout.html" model='{"text": "dummy"}'></nuxeo-layout>
      `);
      await layoutLoad(layout);

      expect(isElementVisible(layout.$.error)).to.be.false;
      expect(layout.element.tagName).to.equal('DUMMY-LAYOUT');
      expect(layout.element.shadowRoot.querySelector('span')).to.exist;
      expect(layout.element.shadowRoot.querySelector('span').innerText).to.equal('dummy');
      expect(layout.element.shadowRoot.querySelector('nuxeo-input')).to.exist;
    });

    test('Should not map model into layout when model is empty', async () => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/dummy-layout.html" model=""></nuxeo-layout>
      `);
      await layoutLoad(layout);

      expect(layout.element.shadowRoot.querySelector('span')).to.exist;
      expect(layout.element.shadowRoot.querySelector('nuxeo-input')).to.exist;
      expect(layout.element.shadowRoot.querySelector('span').innerText).to.be.empty;
      expect(layout.element.shadowRoot.querySelector('nuxeo-input').innerText).to.be.empty;
    });

    test('Should not display the layout when href is empty', async () => {
      const layout = await fixture(html`
        <nuxeo-layout href=""></nuxeo-layout>
      `);

      expect(isElementVisible(layout)).to.be.false;
    });

    test('Should stamp a new layout when href changes', async () => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/dummy-layout.html"></nuxeo-layout>
      `);
      await layoutLoad(layout);

      expect(layout.element.tagName).to.equal('DUMMY-LAYOUT');
      expect(layout.element.shadowRoot.querySelector('span')).to.exist;
      expect(layout.element.shadowRoot.querySelector('nuxeo-input')).to.exist;

      layout.href = `${base}/layouts/document/test/nuxeo-test-view-layout.html`;
      await flush();

      if (layout.element.tagName === 'DUMMY-LAYOUT') {
        await waitChanged(layout, 'element');
      }

      expect(layout.element.tagName).to.equal('NUXEO-TEST-VIEW-LAYOUT');
      expect(layout.element.shadowRoot.querySelector('h1')).to.exist;
      expect(layout.element.shadowRoot.querySelector('span')).to.not.exist;
      expect(layout.element.shadowRoot.querySelector('nuxeo-input')).to.not.exist;
    });
  });

  suite('Validation', () => {
    test('Should validate the layout when fields are valid', async () => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/dummy-layout.html" model='{"text": "valid", "data": "foo"}'></nuxeo-layout>
      `);
      await layoutLoad(layout);

      const nuxeoInput = layout.element.shadowRoot.querySelector('nuxeo-input');
      sinon.spy(nuxeoInput, 'validate');
      sinon.spy(layout.element, 'validate');

      const validity = await layout.validate();
      expect(validity).to.be.true;
      expect(nuxeoInput.invalid).to.be.false;
      expect(nuxeoInput.validate.calledOnce).to.be.true;
      expect(layout.element.validate.calledOnce).to.be.true;
    });

    test('Should invalidate the layout when native validation is invalid', async () => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/dummy-layout.html" model=""></nuxeo-layout>
      `);
      await layoutLoad(layout);

      const nuxeoInput = layout.element.shadowRoot.querySelector('nuxeo-input');
      const validity = await layout.validate();
      expect(validity).to.be.false;
      expect(nuxeoInput.invalid).to.be.true;
    });

    test('Should not run custom validation when native validation fails', async () => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/dummy-layout.html" model=""></nuxeo-layout>
      `);
      await layoutLoad(layout);

      const nuxeoInput = layout.element.shadowRoot.querySelector('nuxeo-input');
      sinon.spy(nuxeoInput, 'validate');
      sinon.spy(layout.element, 'validate');
      const validity = await layout.validate();
      expect(validity).to.be.false;
      expect(nuxeoInput.invalid).to.be.true;
      expect(nuxeoInput.validate.calledOnce).to.be.true;
      expect(layout.element.validate.notCalled).to.be.true;
    });

    test('Should invalidate the layout when custom validation is invalid', async () => {
      const layout = await fixture(html`
        <nuxeo-layout
          href="${base}/layouts/dummy-layout.html"
          model='{"text": "invalid", "data": "foo"}'
        ></nuxeo-layout>
      `);
      await layoutLoad(layout);

      const nuxeoInput = layout.element.shadowRoot.querySelector('nuxeo-input');
      sinon.spy(nuxeoInput, 'validate');
      sinon.spy(layout.element, 'validate');
      const validity = await layout.validate();
      expect(validity).to.be.false;
      expect(nuxeoInput.invalid).to.be.false;
      expect(nuxeoInput.validate.calledOnce).to.be.true;
      expect(layout.element.validate.calledOnce).to.be.true;
    });
  });

  suite('Complex layouts', () => {
    test('Should close dialog when nuxeo-html-editor is used in nuxeo-data-table-form', async () => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/document/complex/nuxeo-complex-create-layout.html"></nuxeo-layout>
      `);
      await layoutLoad(layout);

      // add a new entry to the data table that uses a nuxeo-html-editor
      const table = layout.element.shadowRoot.querySelector('nuxeo-data-table');
      const { dialog, save } = table.$;
      const addEntryButton = table.shadowRoot.querySelector('#addEntry');
      const htmlEditor = table.querySelector('nuxeo-data-table-form').shadowRoot.querySelector('nuxeo-html-editor');

      // check the dialog is closed and opened it
      expect(isElementVisible(dialog)).to.be.false;
      addEntryButton.click();
      await waitForEvent(dialog, 'iron-overlay-opened');
      expect(dialog.opened).to.be.true;
      expect(isElementVisible(dialog)).to.be.true;

      // add some content to the html editor and save the new entry
      htmlEditor.value = 'Random html content';
      save.click();
      await waitForEvent(dialog, 'iron-overlay-closed');
      expect(isElementVisible(dialog)).to.be.false;

      // assert the new row was added with the correct content
      const rows = table.querySelectorAll('nuxeo-data-table-row');
      expect(rows.length).to.be.equal(2);
      expect(rows[1].textContent.trim()).to.equal('Random html content');
    });
  });
});
