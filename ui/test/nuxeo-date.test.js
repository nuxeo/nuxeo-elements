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
import { fixture, html, isElementVisible } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import '../widgets/nuxeo-date.js';
/* eslint-disable no-unused-expressions */

suite('nuxeo-date', () => {
  suiteSetup(() => {
    // Run Before All Tests, i.e. Once
  });

  let element;
  setup(async () => {
    // Run Before Each Test, i.e. X times, being X the number of tests in this suite

    // Arrange
    element = await fixture(
      html`
        <nuxeo-date></nuxeo-date>
      `,
    );
  });

  suite('Format Behavior Usage', () => {
    let formatDateSpy;
    let formatDatetimeSpy;
    setup(() => {
      // Arrange
      formatDateSpy = sinon.spy(element, 'formatDate');
      formatDatetimeSpy = sinon.spy(element, 'formatDateTime');
    });

    test('Should call format methods When a non-empty value is used', () => {
      // Act
      element.datetime = 'a non empty value';

      // Assert
      expect(formatDateSpy.calledOnceWithExactly(element.datetime, element.format)).to.be.true;
      expect(formatDatetimeSpy.calledOnceWithExactly(element.datetime, element.tooltipFormat)).to.be.true;
    });

    test('Should also call format methods When an empty value is used', async () => {
      // Act
      element.datetime = null;

      // Assert
      expect(formatDateSpy.calledOnceWithExactly(element.datetime, element.format)).to.be.true;
      expect(formatDatetimeSpy.calledOnceWithExactly(element.datetime, element.format)).to.be.true;
    });

    teardown(() => {
      formatDateSpy.restore();
      formatDatetimeSpy.restore();
    });
  });

  suite('Visibility', () => {
    test('Should not be visible When an empty value is used', () => {
      // Act
      element.datetime = '';

      // Assert
      expect(isElementVisible(element.$.datetime)).to.be.false;
    });

    test('Should be visible When a non-empty value is used', async () => {
      // Act
      element.datetime = 'a non-empty value';

      // Assert
      expect(isElementVisible(element.$.datetime)).to.be.true;
    });
  });

  teardown(() => {
    // Run After Each Test, i.e. X times, being X the number of tests in this suite
  });
  suiteTeardown(() => {
    // Run After All tests, i.e. Once
  });
});
