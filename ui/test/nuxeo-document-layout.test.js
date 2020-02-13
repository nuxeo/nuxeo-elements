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
import {
  fixture,
  flush,
  isElementVisible,
  html,
  waitForEvent,
  waitForAttrMutation,
} from '@nuxeo/nuxeo-elements/test/test-helpers';
import { LayoutBehavior } from '../nuxeo-layout-behavior.js';

// Export Polymer and PolymerElement for 1.x and 2.x compat
window.Polymer = Polymer;

window.nuxeo.I18n.language = 'en';
window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};

Nuxeo = Nuxeo || {};
Nuxeo.LayoutBehavior = LayoutBehavior;

/* eslint-disable no-unused-expressions */
suite('<nuxeo-document-layout>', () => {
  let documentLayout;

  const buildDoc = (props) => {
    const doc = { type: 'Test', uid: '12ae', properties: {} };
    Object.assign(doc.properties, props);
    return doc;
  };

  const buildLayout = async (doc = buildDoc(), layout = 'edit') => {
    const dl = await fixture(
      html`
        <nuxeo-document-layout .document="${doc}" layout="${layout}"></nuxeo-document-layout>
      `,
    );
    if (!dl.element) {
      await Promise.race([
        waitForEvent(dl.$.layout, 'element-changed'),
        waitForAttrMutation(dl.$.layout.$.error, 'hidden', null),
      ]);
    }
    await flush();
    return dl;
  };

  const getWidget = (label) => {
    if (!documentLayout || !documentLayout.element) {
      return null;
    }
    return documentLayout.element.shadowRoot.querySelector(`[role="widget"][label="${label}"]`);
  };

  test('Should display an error when the layout is not found', async () => {
    documentLayout = await buildLayout(buildDoc(), 'view'); // we have no such view layout, so it will result in 404
    expect(documentLayout.$.layout.$.error.hidden).to.be.false;
    expect(documentLayout.$.layout.$.error.message).to.equal('documentView.layoutNotFound');
    isElementVisible(documentLayout.$.layout.$.error);
    expect(documentLayout.element).to.be.undefined;
  });

  test('Should load a layout', async () => {
    documentLayout = await buildLayout();
    // check the layout was loaded
    expect(documentLayout.element).to.not.be.null;
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
    const ePromise = new Promise((resolve) => {
      document.addEventListener('document-layout-changed', (e) => resolve(e));
    });
    documentLayout = await buildLayout();
    // check that the event was fired from the document layout
    const event = await ePromise;
    expect(event.target).to.equal(documentLayout);
    // ensure that the event bubbles and is composed
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
    // verify event details
    expect(event.detail).to.exist;
    expect(event.detail.element).to.equal(documentLayout.element);
    expect(event.detail.layout).to.equal(documentLayout.layout);
  });

  test('Should do input validation', async () => {
    documentLayout = await buildLayout();
    // check that validation fails if required fields are not filled
    expect(documentLayout.validate()).to.be.false;
    const myTitle = 'My Title';
    getWidget('Title').value = myTitle;
    // assert that validation passes if required fields are filled
    expect(documentLayout.document.properties['dc:title']).to.equal(myTitle);
    expect(documentLayout.validate()).to.be.true;
  });

  test('Should do custom input validation if "validate" method is available on layout', async () => {
    documentLayout = await buildLayout(
      buildDoc({
        'dc:title': 'My Title',
        'dc:description': 'My Title',
      }),
    );

    // check that validation fails if title and description are the same (custom validation)
    expect(typeof documentLayout.element.validate).to.equal('function');
    sinon.spy(documentLayout.element, 'validate');
    expect(documentLayout.validate()).to.be.false;
    expect(documentLayout.element.validate.calledOnce).to.be.true;
    const myDescription = 'My Description';
    // assert that validation passes if the values differ
    getWidget('Description').value = myDescription;
    expect(documentLayout.document.properties['dc:description']).to.equal(myDescription);
    expect(documentLayout.validate()).to.be.true;
    expect(documentLayout.element.validate.calledTwice).to.be.true;
  });

  test('Should do auto-focus', async () => {
    documentLayout = await buildLayout();
    const titleWidget = getWidget('Title');
    expect(titleWidget.hasAttribute('autofocus')).to.be.true;
    expect(documentLayout.element.shadowRoot.activeElement).to.equal(titleWidget);
  });

  test('Should allow auto-focus to be explicitly applied', async () => {
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

  test('Should report validation (global)', async () => {
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

  test('Should report validation (field constraint)', async () => {
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
