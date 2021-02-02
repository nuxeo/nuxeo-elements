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
import '../nuxeo-document-layout.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-textarea';
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { fixture, flush, isElementVisible, html, waitForEvent, waitForAttrMutation } from '@nuxeo/testing-helpers';
import { LayoutBehavior } from '../nuxeo-layout-behavior.js';

// Export Polymer and PolymerElement for 1.x and 2.x compat
window.Polymer = Polymer;

window.nuxeo.I18n.language = 'en';
window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
window.nuxeo.I18n.en['documentLayout.notFound'] = 'Failed to find {0} layout for {1}.';

Nuxeo = Nuxeo || {};
Nuxeo.LayoutBehavior = LayoutBehavior;

// determine base module path (relies on @open-wc/webpack-import-meta-loader)
const { url } = import.meta;
const base = url.substring(0, url.lastIndexOf('/'));

suite('nuxeo-document-layout', () => {
  let documentLayout;
  const baseUrl = `${base}/layouts/document/`;

  const buildDoc = (props = {}) => {
    return { type: 'Test', uid: '12ae', properties: props };
  };

  const awaitLayoutLoad = (layout) =>
    Promise.race([waitForEvent(layout, 'element-changed'), waitForAttrMutation(layout.$.error, 'hidden', null)]);

  const buildLayout = async (doc = buildDoc(), layout = 'edit') => {
    const dl = await fixture(
      html`
        <nuxeo-document-layout .document="${doc}" layout="${layout}" href-base="${baseUrl}"></nuxeo-document-layout>
      `,
    );
    if (!dl.element) {
      await awaitLayoutLoad(dl.$.layout);
    }
    await flush();
    return dl;
  };

  const getWidget = (label) => {
    if (!documentLayout || !documentLayout.element) {
      return null;
    }
    return documentLayout.element.shadowRoot.querySelector(`[role="widget"][name="${label}"]`);
  };

  const assertNotFound = () => {
    expect(isElementVisible(documentLayout.$.layout.$.error)).to.be.true;
    expect(documentLayout.$.layout.$.error.code).to.equal('404');
    expect(documentLayout.$.layout.$.error.message).to.equal(
      `Failed to find ${documentLayout.layout} layout for ${documentLayout.document.type}.`,
    );
    expect(documentLayout.$.layout.$.error.url).to.equal(documentLayout._href);
  };

  test('Should display an error when the layout is not found', async () => {
    documentLayout = await buildLayout(buildDoc(), 'metadata');
    // we have no such view layout, so it will result in 404
    assertNotFound();
  });

  test('Should load a layout when a document and a layout are provided', async () => {
    documentLayout = await buildLayout();
    // check the layout was loaded
    expect(documentLayout.element).to.exist;
    expect(documentLayout.element.tagName).to.equal('NUXEO-TEST-EDIT-LAYOUT');
    // assert layout integrity
    expect(documentLayout.element.document).to.equal(documentLayout.document);
    const { children } = documentLayout.element.shadowRoot;
    expect(children).to.have.lengthOf(3);
    expect(children[0].tagName).to.equal('STYLE');
    expect(children[1].tagName).to.equal('NUXEO-INPUT');
    expect(children[2].tagName).to.equal('NUXEO-TEXTAREA');
  });

  test('Should fire a "document-layout-changed" event when the layout is loaded', async () => {
    // we need to add a listener for this event before hand, because we do not yet have the layout stamped,
    // and after `buildLayout` it can be too late to catch the event.
    const layoutChanged = new Promise((resolve) => {
      document.addEventListener('document-layout-changed', (e) => resolve(e));
    });
    documentLayout = await buildLayout();
    // check that the event was fired from the document layout
    const event = await layoutChanged;
    expect(event.target).to.equal(documentLayout);
    // ensure that the event bubbles and is composed
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
    // verify event details
    expect(event.detail).to.exist;
    expect(event.detail.element).to.equal(documentLayout.element);
    expect(event.detail.layout).to.equal(documentLayout.layout);
  });

  test('Should reload when layout name changes', async () => {
    documentLayout = await buildLayout();
    expect(documentLayout.element).to.exist;
    expect(documentLayout.element.tagName).to.equal('NUXEO-TEST-EDIT-LAYOUT');
    // check that the layout updates when the layout name changes
    documentLayout.layout = 'view';
    const event = await waitForEvent(documentLayout, 'document-layout-changed');
    expect(event.detail).to.exist;
    const { element } = event.detail;
    expect(element).to.exist;
    expect(element.tagName).to.equal('NUXEO-TEST-VIEW-LAYOUT');
    // assert layout integrity
    const { children } = element.shadowRoot;
    expect(children).to.have.lengthOf(3);
    expect(children[0].tagName).to.equal('STYLE');
    expect(children[1].tagName).to.equal('H1');
    expect(children[2].tagName).to.equal('DIV');
  });

  test('Should reload when document changes', async () => {
    documentLayout = await buildLayout();
    expect(documentLayout.element).to.exist;
    expect(documentLayout.element.tagName).to.equal('NUXEO-TEST-EDIT-LAYOUT');
    // check that the layout updates when the document changes
    documentLayout.document = { type: 'File', uid: '12ae', properties: {} };
    const event = await waitForEvent(documentLayout, 'document-layout-changed');
    expect(event.detail).to.exist;
    expect(event.detail.element).to.be.undefined;
    // check 404 for unexisting layout
    assertNotFound();
  });

  test('Should reload when href template changes', async () => {
    documentLayout = await buildLayout();
    expect(documentLayout.element).to.exist;
    expect(documentLayout.element.tagName).to.equal('NUXEO-TEST-EDIT-LAYOUT');
    // check that the layout updates when the href template changes
    documentLayout.hrefTemplate = '../dummy-layout.html';
    const event = await waitForEvent(documentLayout, 'document-layout-changed');
    expect(event.detail).to.exist;
    const { element } = event.detail;
    expect(element).to.exist;
    expect(element.tagName).to.equal('DUMMY-LAYOUT');
    // assert layout integrity
    const { children } = element.shadowRoot;
    expect(children).to.have.lengthOf(2);
    expect(children[0].tagName).to.equal('SPAN');
    expect(children[1].tagName).to.equal('NUXEO-INPUT');
  });

  test('Should reload when href base changes', async () => {
    documentLayout = await buildLayout();
    expect(documentLayout.element).to.exist;
    expect(documentLayout.element.tagName).to.equal('NUXEO-TEST-EDIT-LAYOUT');
    // check that the layout updates when the href base changes
    documentLayout.hrefBase = `${base}/layout/`;
    const event = await waitForEvent(documentLayout, 'document-layout-changed');
    expect(event.detail).to.exist;
    expect(event.detail.element).to.be.undefined;
    // check 404 for unexisting layout
    assertNotFound();
  });

  test('Should return a valid href when calling the "hrefFunction" method', async () => {
    documentLayout = await buildLayout(buildDoc({ myProp: 'MyValue' }));
    let href = documentLayout.hrefFunction(documentLayout.document, documentLayout.layout);
    expect(href).to.equal(`test/nuxeo-test-edit-layout.html`);
    // eslint-disable-next-line no-template-curly-in-string
    documentLayout.hrefTemplate = 'folder/nuxeo-${document.properties.myProp}-${layout}-layout.html';
    href = documentLayout.hrefFunction(documentLayout.document, documentLayout.layout);
    expect(href).to.equal(`folder/nuxeo-myvalue-edit-layout.html`);
  });

  test('Should do input validation when the "validate" method is called', async () => {
    documentLayout = await buildLayout();
    // check that validation fails if required fields are not filled
    expect(documentLayout.validate()).to.be.false;
    const myTitle = 'My Title';
    getWidget('Title').value = myTitle;
    // assert that validation passes if required fields are filled
    expect(documentLayout.document.properties['dc:title']).to.equal(myTitle);
    expect(documentLayout.validate()).to.be.true;
  });

  test('Should do custom input validation when a "validate" method is available on the layout', async () => {
    documentLayout = await buildLayout(
      buildDoc({
        'dc:title': 'My Title',
        'dc:description': 'My Title',
      }),
    );
    // check that validation fails if title and description are the same (custom validation)
    expect(typeof documentLayout.element.validate).to.equal('function');
    sinon.spy(documentLayout.$.layout, 'validate');
    expect(documentLayout.validate()).to.be.false;
    expect(documentLayout.$.layout.validate.calledOnce).to.be.true;
    const myDescription = 'My Description';
    // assert that validation passes if the values differ
    getWidget('Description').value = myDescription;
    expect(documentLayout.document.properties['dc:description']).to.equal(myDescription);
    expect(documentLayout.validate()).to.be.true;
    expect(documentLayout.$.layout.validate.calledTwice).to.be.true;
  });

  test('Should do auto-focus when the layout is stamped', async () => {
    documentLayout = await buildLayout();
    const titleWidget = getWidget('Title');
    expect(titleWidget.hasAttribute('autofocus')).to.be.true;
    expect(documentLayout.element.shadowRoot.activeElement).to.equal(titleWidget);
  });

  test('Should do auto-focus when the "applyAutoFocus" method is called', async () => {
    documentLayout = await buildLayout();
    const button = await fixture(
      html`
        <button>Button</button>
      `,
    );
    // note that apply auto-focus will only work if the current active element is not already a child
    // of the document layout
    button.focus();
    expect(documentLayout.element.shadowRoot.activeElement).to.be.null;
    expect(typeof documentLayout.applyAutoFocus).to.equal('function');
    documentLayout.applyAutoFocus();
    expect(documentLayout.element.shadowRoot.activeElement).to.equal(getWidget('Title'));
  });

  test('Should display an error when reporting a global violation', async () => {
    // setup error message label and report
    const messageKey = 'global.validation.error';
    const messageValue = 'A validation error';
    window.nuxeo.I18n.en[messageKey] = messageValue;
    const report = {
      'entity-type': 'validation_report',
      has_error: true,
      number: 1,
      violations: [{ messageKey }],
    };

    documentLayout = await buildLayout();
    expect(typeof documentLayout.reportValidation).to.equal('function');
    // display validation report on layout
    documentLayout.reportValidation(report);
    flush();
    const errors = documentLayout.shadowRoot.querySelectorAll('span.error');
    expect(errors).to.have.lengthOf(1);
    expect(errors[0].textContent).to.equal(messageValue);
    // no field should be marked as invalid
    expect(getWidget('Title').invalid).to.be.false;
    expect(getWidget('Description').invalid).to.be.false;
  });

  test('Should display an error when reporting a field constraint violation', async () => {
    // setup error message label and report
    const messageKey = 'label.schema.constraint.violation.PatternConstraint';
    const messageValue = '"{0}" does not match the pattern "{2}"';
    window.nuxeo.I18n.en[messageKey] = messageValue;
    const invalidValue = '12';
    const pattern = '^[a-zA-Z ]*$';
    const message = messageValue.replace('{0}', invalidValue).replace('{2}', pattern);
    const report = {
      'entity-type': 'validation_report',
      has_error: true,
      number: 1,
      violations: [
        {
          messageKey: 'label.schema.constraint.violation.PatternConstraint.validation.letterOnly',
          message: "This value must match the format '^[a-zA-Z ]*$'.",
          invalid_value: invalidValue,
          constraint: {
            'entity-type': 'validation_constraint',
            name: 'PatternConstraint',
            parameters: { Pattern: pattern },
          },
          path: [{ field_name: 'dc:description', is_list_item: false }],
        },
      ],
    };

    documentLayout = await buildLayout();
    expect(typeof documentLayout.reportValidation).to.equal('function');
    // display validation report on layout
    documentLayout.reportValidation(report);
    flush();
    const errors = documentLayout.shadowRoot.querySelectorAll('span.error');
    expect(errors).to.have.lengthOf(1);
    expect(errors[0].textContent).to.equal(message);
    // only the description field should be flagged as invalid
    expect(getWidget('Title').invalid).to.be.false;
    expect(getWidget('Description').invalid).to.be.true;
  });
});
