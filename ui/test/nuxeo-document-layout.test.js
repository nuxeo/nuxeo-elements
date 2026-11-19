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
import '../nuxeo-document-layout.js';
import '../widgets/nuxeo-input.js';
import '../widgets/nuxeo-textarea';
import '../nuxeo-data-table/iron-data-table.js';
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { fixture, flush, isElementVisible, html, waitForEvent } from '@nuxeo/testing-helpers';
import { getWidgetFromLayout, waitForLayoutLoad } from './ui-test-helpers.js';
import { LayoutBehavior } from '../nuxeo-layout-behavior.js';

// Export Polymer and PolymerElement for 1.x and 2.x compat
window.Polymer = Polymer;

window.nuxeo.I18n.language = 'en';
window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
window.nuxeo.I18n.en['documentLayout.notFound'] = 'Failed to find {0} layout for {1}.';
window.nuxeo.I18n.en['layout.validation.requiredField.named'] = '{0} is required.';
window.nuxeo.I18n.en['layout.validation.invalidForm'] = 'The form contains invalid values, please review your entries.';

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

  const waitForLayoutOrError = (dl, timeout = 2500) =>
    Promise.race([
      waitForLayoutLoad(dl.$.layout),
      new Promise((resolve) => {
        const check = () => {
          if (dl.element || (dl.$.layout.$.error && !dl.$.layout.$.error.hidden)) {
            resolve();
          } else {
            setTimeout(check, 50);
          }
        };
        check();
        setTimeout(resolve, timeout);
      }),
    ]);

  const buildLayout = async (doc = buildDoc(), layout = 'edit') => {
    const dl = await fixture(
      html`
        <nuxeo-document-layout .document="${doc}" layout="${layout}" href-base="${baseUrl}"></nuxeo-document-layout>
      `,
    );
    if (!dl.element) {
      await waitForLayoutOrError(dl);
    }
    await flush();
    return dl;
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
    documentLayout.document = { type: 'File', uid: '12ae', properties: {} };
    const event = await waitForEvent(documentLayout, 'document-layout-changed');
    expect(event.detail).to.exist;
    expect(event.detail.element).to.be.undefined;
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
    documentLayout.hrefBase = `${base}/layout/`;
    const event = await waitForEvent(documentLayout, 'document-layout-changed');
    expect(event.detail).to.exist;
    expect(event.detail.element).to.be.undefined;
    assertNotFound();
  });

  test('Should return a valid href when calling the "hrefFunction" method', async () => {
    documentLayout = await buildLayout(buildDoc({ myProp: 'MyValue' }));
    let href = documentLayout.hrefFunction(documentLayout.document, documentLayout.layout);
    expect(href).to.equal(`test/nuxeo-test-edit-layout.html`);

    documentLayout.hrefTemplate = 'folder/nuxeo-${document.properties.myProp}-${layout}-layout.html';
    href = documentLayout.hrefFunction(documentLayout.document, documentLayout.layout);
    expect(href).to.equal(`folder/nuxeo-myvalue-edit-layout.html`);
  });

  test('Should do input validation when the "validate" method is called', async () => {
    documentLayout = await buildLayout();
    // check that validation fails if required fields are not filled
    expect(documentLayout.validate()).to.be.false;
    const myTitle = 'My Title';
    getWidgetFromLayout('Title', documentLayout).value = myTitle;
    // assert that validation passes if required fields are filled
    expect(documentLayout.document.properties['dc:title']).to.equal(myTitle);
    expect(documentLayout.validate()).to.be.true;
  });

  // WEBUI-482: the failing field names must also be conveyed as text, not only by the widget colour.
  test('Should list the fields that failed validation in the error summary', async () => {
    documentLayout = await buildLayout();
    expect(documentLayout.validate()).to.be.false;
    await flush();

    const { error } = documentLayout.$;
    expect(isElementVisible(error)).to.be.true;
    expect(error.getAttribute('role')).to.equal('alert');
    const errors = documentLayout.shadowRoot.querySelectorAll('span.error');
    expect(errors).to.have.lengthOf(1);
    expect(errors[0].textContent).to.equal('Title is required.');

    // the summary is cleared once the required field is filled in
    getWidgetFromLayout('Title', documentLayout).value = 'My Title';
    expect(documentLayout.validate()).to.be.true;
    await flush();
    expect(documentLayout.shadowRoot.querySelectorAll('span.error')).to.be.empty;
    expect(isElementVisible(error)).to.be.false;
  });

  test('Should ignore validation errors reported by a layout nested inside its own', async () => {
    documentLayout = await buildLayout();
    expect(documentLayout.validate()).to.be.false;
    await flush();
    expect(documentLayout.shadowRoot.querySelectorAll('span.error')).to.have.lengthOf(1);

    // `layout-validation-errors` bubbles, so an inner layout must not take over the summary
    documentLayout.element.dispatchEvent(
      new CustomEvent('layout-validation-errors', {
        bubbles: true,
        composed: true,
        detail: { errors: [{ element: null, label: 'Inner', message: 'Inner is required.' }] },
      }),
    );
    await flush();

    const errors = documentLayout.shadowRoot.querySelectorAll('span.error');
    expect(errors).to.have.lengthOf(1);
    expect(errors[0].textContent).to.equal('Title is required.');
  });

  // WEBUI-482: the summary must never go empty while the form is still invalid, which happens when
  // the layout's own validation is what rejected the form.
  test('Should keep the summary populated when the layout rejects an otherwise valid form', async () => {
    documentLayout = await buildLayout(
      buildDoc({
        'dc:title': 'My Title',
        'dc:description': 'My Title',
      }),
    );
    expect(documentLayout.validate()).to.be.false;
    await flush();

    const { error } = documentLayout.$;
    expect(isElementVisible(error)).to.be.true;
    const errors = documentLayout.shadowRoot.querySelectorAll('span.error');
    expect(errors).to.have.lengthOf(1);
    expect(errors[0].textContent).to.equal('The form contains invalid values, please review your entries.');

    // the summary is cleared once the custom validation passes
    getWidgetFromLayout('Description', documentLayout).value = 'My Description';
    expect(documentLayout.validate()).to.be.true;
    await flush();
    expect(documentLayout.shadowRoot.querySelectorAll('span.error')).to.be.empty;
    expect(isElementVisible(error)).to.be.false;
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
    getWidgetFromLayout('Description', documentLayout).value = myDescription;
    expect(documentLayout.document.properties['dc:description']).to.equal(myDescription);
    expect(documentLayout.validate()).to.be.true;
    expect(documentLayout.$.layout.validate.calledTwice).to.be.true;
  });

  test('Should do auto-focus when the layout is stamped', async () => {
    documentLayout = await buildLayout();
    const titleWidget = getWidgetFromLayout('Title', documentLayout);
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
    expect(documentLayout.element.shadowRoot.activeElement).to.equal(getWidgetFromLayout('Title', documentLayout));
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
    expect(getWidgetFromLayout('Title', documentLayout).invalid).to.be.false;
    expect(getWidgetFromLayout('Description', documentLayout).invalid).to.be.false;
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
    expect(getWidgetFromLayout('Title', documentLayout).invalid).to.be.false;
    expect(getWidgetFromLayout('Description', documentLayout).invalid).to.be.true;
  });

  suite('Required list of complex entries rejected by the server (ELEMENTS-2143)', () => {
    // The client cannot see whether a list of complex entries is required, so an empty one is only
    // rejected on save. The server message does not name the field, the layout has to.
    const notNullReport = (field) => {
      return {
        'entity-type': 'validation_report',
        has_error: true,
        number: 1,
        violations: [
          {
            messageKey: 'label.schema.constraint.violation.NotNullConstraint',
            invalid_value: null,
            constraint: { 'entity-type': 'validation_constraint', name: 'NotNullConstraint', parameters: {} },
            path: [{ field_name: field, is_list_item: false }],
          },
        ],
      };
    };

    const buildFaqLayout = () => buildLayout({ type: 'FormTestDoc', uid: '1', properties: { 'my:faq': [] } }, 'create');
    const faqTable = (dl) => dl.element.shadowRoot.querySelector('nuxeo-data-table');

    suiteSetup(() => {
      window.nuxeo.I18n.en['label.schema.constraint.violation.NotNullConstraint'] = 'Value is required.';
    });

    test('Should accept an empty optional FAQ list on the client', async () => {
      documentLayout = await buildFaqLayout();
      getWidgetFromLayout('title', documentLayout).value = 'a title';
      expect(await documentLayout.validate()).to.be.true;
      expect(faqTable(documentLayout).invalid).to.be.false;
    });

    test('Should name the field in the summary and inline, and flag the table', async () => {
      documentLayout = await buildFaqLayout();
      const table = faqTable(documentLayout);

      documentLayout.reportValidation(notNullReport('my:faq'));
      flush();
      await new Promise((resolve) => setTimeout(resolve, 20));

      const errors = documentLayout.shadowRoot.querySelectorAll('span.error');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0].textContent).to.equal('FAQ is required.');
      expect(table.invalid).to.be.true;
      expect(table.errorMessage).to.equal('FAQ is required.');
      expect(table.$.table.getAttribute('aria-invalid')).to.equal('true');
      expect(table.$.table.getAttribute('aria-describedby')).to.equal(table.shadowRoot.querySelector('.error').id);
    });

    test('Should keep the server message for a property bound to no widget', async () => {
      documentLayout = await buildFaqLayout();

      documentLayout.reportValidation(notNullReport('my:other'));
      flush();

      const errors = documentLayout.shadowRoot.querySelectorAll('span.error');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0].textContent).to.equal('Value is required.');
    });

    test('Should keep the server message when the widget has no label to name it by', async () => {
      documentLayout = await buildFaqLayout();
      sinon.stub(documentLayout.$.layout, '_requiredViolationMessage').returns('');

      documentLayout.reportValidation(notNullReport('my:faq'));
      flush();

      const errors = documentLayout.shadowRoot.querySelectorAll('span.error');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0].textContent).to.equal('Value is required.');
      expect(faqTable(documentLayout).invalid).to.be.true;
    });

    test('Should not name the list for a required field nested in one of its rows', async () => {
      documentLayout = await buildFaqLayout();
      const table = faqTable(documentLayout);
      const report = notNullReport('my:faq');
      report.violations[0].path = [
        { field_name: 'my:faq', is_list_item: false },
        { field_name: 'item', is_list_item: true, index: 0 },
        { field_name: 'question', is_list_item: false },
      ];

      documentLayout.reportValidation(report);
      flush();

      const messages = Array.from(documentLayout.shadowRoot.querySelectorAll('span.error')).map((e) => e.textContent);
      expect(messages).to.not.include('FAQ is required.');
      expect(messages).to.include('Value is required.');
      expect(table.invalid).to.be.true;
      expect(table.errorMessage).to.not.equal('FAQ is required.');
    });

    test('Should replace an injected required message when the server reports another failure', async () => {
      window.nuxeo.I18n.en['label.schema.constraint.violation.SizeConstraint'] = 'Wrong size.';
      documentLayout = await buildFaqLayout();
      const table = faqTable(documentLayout);
      const sizeReport = notNullReport('my:faq');
      sizeReport.violations[0].messageKey = 'label.schema.constraint.violation.SizeConstraint';
      sizeReport.violations[0].constraint = { 'entity-type': 'validation_constraint', name: 'SizeConstraint' };

      documentLayout.reportValidation(notNullReport('my:faq'));
      expect(table.errorMessage).to.equal('FAQ is required.');

      documentLayout.reportValidation(sizeReport);
      flush();
      expect(table.errorMessage).to.equal('Wrong size.');
      expect(documentLayout.shadowRoot.querySelector('span.error').textContent).to.equal('Wrong size.');
    });

    test('Should keep a message the author configured when the server reports another failure', async () => {
      window.nuxeo.I18n.en['label.schema.constraint.violation.SizeConstraint'] = 'Wrong size.';
      documentLayout = await buildFaqLayout();
      const table = faqTable(documentLayout);
      table.errorMessage = 'Check the FAQ.';
      const sizeReport = notNullReport('my:faq');
      sizeReport.violations[0].messageKey = 'label.schema.constraint.violation.SizeConstraint';
      sizeReport.violations[0].constraint = { 'entity-type': 'validation_constraint', name: 'SizeConstraint' };

      documentLayout.reportValidation(sizeReport);
      expect(table.errorMessage).to.equal('Check the FAQ.');
    });

    test('Should fall back to the constraint message when the violation has no parameters', async () => {
      window.nuxeo.I18n.en['label.schema.constraint.violation.SizeConstraint'] = 'Wrong size.';
      documentLayout = await buildFaqLayout();

      documentLayout.reportValidation({
        'entity-type': 'validation_report',
        has_error: true,
        number: 1,
        violations: [
          {
            messageKey: 'label.schema.constraint.violation.SizeConstraint.untranslated',
            constraint: { 'entity-type': 'validation_constraint', name: 'SizeConstraint' },
            path: [{ field_name: 'my:faq', is_list_item: false }],
          },
        ],
      });
      flush();

      const errors = documentLayout.shadowRoot.querySelectorAll('span.error');
      expect(errors).to.have.lengthOf(1);
      expect(errors[0].textContent).to.equal('Wrong size.');
      // only a required violation names the field; the table message is left alone
      expect(faqTable(documentLayout).errorMessage).to.not.be.ok;
    });
  });
});
