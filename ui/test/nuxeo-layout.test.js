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
import '../widgets/nuxeo-file.js';

// determine base module path (relies on @open-wc/webpack-import-meta-loader)
const { url } = import.meta;
const base = url.substring(0, url.lastIndexOf('/'));

// Export Polymer and PolymerElement for 1.x and 2.x compat
window.Polymer = Polymer;

window.nuxeo.I18n.language = 'en';
window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
window.nuxeo.I18n.en['layout.validation.requiredField'] = 'This field is required.';
window.nuxeo.I18n.en['layout.validation.requiredField.named'] = '{0} is required.';
window.nuxeo.I18n.en['layout.validation.invalidField.named'] = '{0} has an invalid value.';
window.nuxeo.I18n.en['layout.validation.invalidForm'] = 'The form contains invalid values, please review your entries.';

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

    test('Should invalidate the layout if nuxeo-file is still loading', async () => {
      const layout = await fixture(html`
        <nuxeo-layout
          href="${base}/layouts/document/file/nuxeo-file-widget-create-layout.html"
          model='{"text": "Title", "longText": "Description"}'
        ></nuxeo-layout>
      `);
      await layoutLoad(layout);

      // mark the nuxeo-file has performing a file upload
      const fileInput = layout.element.shadowRoot.querySelector('nuxeo-file');
      fileInput.uploading = true;

      // the nuxeo-file should be invalid because it is still uploading
      let validity = await layout.validate();
      expect(validity).to.be.false;
      expect(fileInput.invalid).to.be.true;

      // when the file upload finishes, the nuxeo-file should be valid
      fileInput.uploading = false;
      validity = await layout.validate();
      expect(validity).to.be.true;
      expect(fileInput.invalid).to.be.false;
    });

    test('Should invalidate the layout if a required field is missing in custom element', async () => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/document/custom/nuxeo-custom-element-create-layout.html"></nuxeo-layout>
      `);
      await layoutLoad(layout);

      // the layout should be invalid, because there's an empty required field
      let validity = await layout.validate();
      expect(validity).to.be.false;

      // add some text to make the layout valid
      const customElement = layout.element.shadowRoot.querySelector('nuxeo-custom-element');
      const textInputs = customElement.shadowRoot.querySelectorAll('nuxeo-input');
      expect(textInputs.length).to.be.equal(2);
      textInputs[0].value = 'Random text';
      textInputs[1].value = 'Random text';

      // the layout should be valid
      validity = await layout.validate();
      expect(validity).to.be.true;
    });
  });

  // WEBUI-482: an invalid field must not be signalled by colour alone, so validation also gives
  // every failing widget a text message naming the field and publishes the list to the host.
  suite('Validation error reporting', () => {
    const buildDummyLayout = async (model = '') => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/dummy-layout.html" model="${model}"></nuxeo-layout>
      `);
      await layoutLoad(layout);
      return layout;
    };

    test('Should report a message naming the field for an empty required field', async () => {
      const layout = await buildDummyLayout();
      const nuxeoInput = layout.element.shadowRoot.querySelector('nuxeo-input');
      nuxeoInput.label = 'Title';

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      const { errors } = (await reported).detail;

      expect(errors).to.have.lengthOf(1);
      expect(errors[0].element).to.equal(nuxeoInput);
      expect(errors[0].label).to.equal('Title');
      expect(errors[0].message).to.equal('Title is required.');
      // the widget itself now renders the message instead of relying on colour alone
      expect(nuxeoInput.errorMessage).to.equal('Title is required.');
    });

    test('Should fall back to an unnamed message when the field has no label', async () => {
      const layout = await buildDummyLayout();

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      const { errors } = (await reported).detail;

      expect(errors[0].label).to.equal('');
      expect(errors[0].message).to.equal('This field is required.');
    });

    test('Should distinguish an invalid value from a missing one', async () => {
      const layout = await buildDummyLayout();
      const nuxeoInput = layout.element.shadowRoot.querySelector('nuxeo-input');
      nuxeoInput.label = 'Title';
      nuxeoInput.pattern = '[0-9]+';
      nuxeoInput.value = 'not a number';

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      const { errors } = (await reported).detail;

      expect(errors[0].message).to.equal('Title has an invalid value.');
    });

    test('Should keep the error message provided by the layout', async () => {
      const layout = await buildDummyLayout();
      const nuxeoInput = layout.element.shadowRoot.querySelector('nuxeo-input');
      nuxeoInput.label = 'Title';
      nuxeoInput.errorMessage = 'Please provide a title';

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      const { errors } = (await reported).detail;

      expect(errors[0].message).to.equal('Please provide a title');
      expect(nuxeoInput.errorMessage).to.equal('Please provide a title');
    });

    test('Should refresh its own fallback message when the reason for the failure changes', async () => {
      const layout = await buildDummyLayout();
      const nuxeoInput = layout.element.shadowRoot.querySelector('nuxeo-input');
      nuxeoInput.label = 'Title';

      expect(await layout.validate()).to.be.false;
      expect(nuxeoInput.errorMessage).to.equal('Title is required.');

      nuxeoInput.pattern = '[0-9]+';
      nuxeoInput.value = 'not a number';

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;

      expect((await reported).detail.errors[0].message).to.equal('Title has an invalid value.');
      expect(nuxeoInput.errorMessage).to.equal('Title has an invalid value.');
    });

    test('Should report an empty error list when every field is valid', async () => {
      const layout = await buildDummyLayout('{"text": "valid", "data": "foo"}');

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.true;

      expect((await reported).detail.errors).to.be.empty;
    });

    // The reported errors must match the validity we return, including when the layout runs its own
    // validation: an empty list for an invalid form would let hosts clear their error summary.
    test('Should report a form level error when the layout rejects an otherwise valid form', async () => {
      const layout = await buildDummyLayout('{"text": "invalid", "data": "foo"}');

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      const { errors } = (await reported).detail;

      expect(errors).to.have.lengthOf(1);
      expect(errors[0].element).to.equal(layout.element);
      expect(errors[0].message).to.equal('The form contains invalid values, please review your entries.');
    });

    test('Should report the failing widgets rather than a form level error when both fail', async () => {
      const layout = await buildDummyLayout('{"text": "invalid"}');
      const nuxeoInput = layout.element.shadowRoot.querySelector('nuxeo-input');
      nuxeoInput.label = 'Title';

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      const { errors } = (await reported).detail;

      expect(errors).to.have.lengthOf(1);
      expect(errors[0].element).to.equal(nuxeoInput);
      expect(errors[0].message).to.equal('Title is required.');
    });
  });

  // WEBUI-482 / WEBUI-180: fields a layout stamps at runtime - extra rows of a multivalued property,
  // branches of a dom-if - must be reported the same way as the ones present when the form loaded.
  suite('Validation error reporting for dynamically stamped fields', () => {
    const buildDynamicLayout = async () => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/dynamic-fields-layout.html"></nuxeo-layout>
      `);
      await layoutLoad(layout);
      return layout;
    };

    test('Should report a named message for each field stamped by a dom-repeat', async () => {
      const layout = await buildDynamicLayout();
      layout.element.push('rows', { label: 'Subject 1' }, { label: 'Subject 2' });
      await flush();

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      const { errors } = (await reported).detail;

      expect(errors.map((error) => error.message)).to.deep.equal([
        'Title is required.',
        'Subject 1 is required.',
        'Subject 2 is required.',
      ]);
      const inputs = layout.element.shadowRoot.querySelectorAll('nuxeo-input');
      expect(Array.from(inputs).map((input) => input.errorMessage)).to.deep.equal([
        'Title is required.',
        'Subject 1 is required.',
        'Subject 2 is required.',
      ]);
    });

    test('Should report a field stamped by a dom-if only once its branch is rendered', async () => {
      const layout = await buildDynamicLayout();

      let reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      expect((await reported).detail.errors).to.have.lengthOf(1);

      layout.element.showExtra = true;
      await flush();

      reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      const { errors } = (await reported).detail;

      expect(errors).to.have.lengthOf(2);
      expect(errors[1].message).to.equal('Extra is required.');
    });

    test('Should drop a removed field from the reported errors', async () => {
      const layout = await buildDynamicLayout();
      layout.element.push('rows', { label: 'Subject 1' });
      await flush();

      let reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      expect((await reported).detail.errors).to.have.lengthOf(2);

      layout.element.pop('rows');
      await flush();

      reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      const { errors } = (await reported).detail;

      expect(errors).to.have.lengthOf(1);
      expect(errors[0].message).to.equal('Title is required.');
    });
  });

  // WEBUI-180: a layout generated for a required multivalued property flags the entry widget of the
  // row form, which is disabled while the entry dialog is closed. The failure went unreported and
  // the save was refused without saying why, so the table has to report it on the form's behalf.
  suite('Validation error reporting for required multivalued properties', () => {
    const buildMultivaluedLayout = async (model = '') => {
      const layout = await fixture(html`
        <nuxeo-layout href="${base}/layouts/multivalued-required-layout.html" model="${model}"></nuxeo-layout>
      `);
      await layoutLoad(layout);
      await flush();
      return layout;
    };

    test('Should name the multivalued field when it has no entry', async () => {
      const layout = await buildMultivaluedLayout('{"title": "a title"}');

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.false;
      const { errors } = (await reported).detail;

      const table = layout.element.shadowRoot.querySelector('nuxeo-data-table');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0].element).to.equal(table);
      expect(errors[0].message).to.equal('Multi String is required.');
      expect(table.errorMessage).to.equal('Multi String is required.');
    });

    test('Should report nothing once the multivalued field has an entry', async () => {
      const layout = await buildMultivaluedLayout('{"title": "a title", "items": ["alpha"]}');

      const reported = waitForEvent(layout, 'layout-validation-errors');
      expect(await layout.validate()).to.be.true;

      expect((await reported).detail.errors).to.be.empty;
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
      // XXX needed because until a certain point, the items object is shared between all instances that extend
      // the nuxeo-page-provider-display-behavior. Can be removed after ELEMENTS-1442 is fixed.
      table.items.pop();
    });
  });
});
