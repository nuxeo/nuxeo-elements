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
import { fn as moment } from 'moment';
import { FormatBehavior } from '../nuxeo-format-behavior.js';
import '../widgets/nuxeo-date.js';
/* eslint-disable no-unused-expressions */

suite('nuxeo-format-behavior', () => {
  let formatBehavior;
  suiteSetup(() => {
    // Run Before All Tests, i.e. Once
    // eslint-disable-next-line prefer-destructuring
    formatBehavior = FormatBehavior[1];
  });

  setup(() => {
    // Run Before Each Test, i.e. X times, being X the number of tests in this suite
  });

  suite('Date Formatting', () => {
    suiteSetup(() => {
      // Arrange
      sinon.stub(window, 'Nuxeo');
      // window.Nuxeo = {};
    });

    setup(() => {});

    test('Should return undefined When an empty date is used', () => {
      // Act
      const dateFormatted = formatBehavior.formatDate('');

      // Assert
      expect(dateFormatted).to.be.undefined;
    });

    test('Should return undefined When a null date is used', () => {
      // Act
      const dateFormatted = formatBehavior.formatDate(null);

      // Assert
      expect(dateFormatted).to.be.undefined;
    });

    test('Should return undefined When an undefined date is used', () => {
      // Act
      const dateFormatted = formatBehavior.formatDate(undefined);

      // Assert
      expect(dateFormatted).to.be.undefined;
    });

    test('Should call "moment.to" When "relative" format is used', () => {
      // Arrange
      const localeSpy = sinon.spy(moment, 'locale');
      const toSpy = sinon.spy(moment, 'to');
      const date = Date.now();

      // Act
      const dateFormatted = formatBehavior.formatDate(date, 'relative');

      // Assert
      expect(localeSpy.calledWithExactly('en')).to.be.true;
      expect(toSpy.calledOnceWithExactly(date)).to.be.true;
      expect(dateFormatted).to.be.a('string');

      moment.locale.restore();
      moment.to.restore();
    });

    test('Should call "moment.format" When any format different than "relative" is used', () => {
      // Arrange
      const localeSpy = sinon.spy(moment, 'locale');
      const formatSpy = sinon.spy(moment, 'format');
      const date = Date.now();

      // Act
      const dateFormatted = formatBehavior.formatDate(date, 'LL');

      // Assert
      expect(localeSpy.calledWithExactly('en')).to.be.true;
      expect(formatSpy.calledOnceWithExactly('LL')).to.be.true;
      expect(dateFormatted).to.be.a('string');

      moment.locale.restore();
      moment.format.restore();
    });

    teardown(() => {});
  });

  suite('Mime Type Formatting', () => {
    test('Should return undefined When an empty label is used', () => {
      // Act
      const mimeType = formatBehavior.formatMimeType('');

      // Assert
      expect(mimeType).to.be.undefined;
    });

    test('Should call i18n When label is not empty', () => {
      // Arrange
      formatBehavior.i18n = (key) => key; // Overcoming sinon limitation
      const i18nSpy = sinon.spy(formatBehavior, 'i18n');

      // Act
      const mimeType = formatBehavior.formatMimeType('audio');

      // Assert
      expect(i18nSpy.calledOnceWithExactly('mimetype.audio')).to.be.true;
      expect(mimeType).to.be.a('string');

      formatBehavior.i18n.restore();
      formatBehavior.i18n = undefined;
    });
  });

  teardown(() => {
    // Run After Each Test, i.e. X times, being X the number of tests in this suite
  });
  suiteTeardown(() => {
    // Run After All tests, i.e. Once
    window.Nuxeo.restore();
  });
});
