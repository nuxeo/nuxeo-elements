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

/**
 * Test suite for ELEMENTS-1873: Localized date picker placeholder
 *
 * Verifies that the date picker input placeholder uses localized abbreviations
 * (dayAbbr, monthAbbr, yearAbbr) instead of hardcoded English abbreviations.
 *
 * The localization chain works as follows:
 * 1. External i18n (messages.json / messages-fr.json) → loaded by I18nBehavior
 * 2. nuxeo-date-picker.js passes them via bridge: this.$.date.set('i18n.dayAbbr', ...)
 * 3. custom-date-picker.js prefers these external values over its internal dictionary
 *
 * This test covers both the external bridge path and the internal dictionary fallback.
 *
 * NOTE: Only English and French locales carry the new keys in this PR.
 * Other locale translations will arrive via Crowdin in a separate PR.
 */
import { fixture, html } from '@nuxeo/testing-helpers';
import moment from '@nuxeo/moment/min/moment-with-locales.js';
import '../widgets/custom-date-picker.js';

/**
 * Gets the inner <input> element from the custom-date-picker shadow DOM.
 */
function getDateInput(picker) {
  return picker.shadowRoot.querySelector('#dateInput');
}

/**
 * Creates a custom-date-picker fixture.
 */
async function makePicker() {
  return fixture(html`<custom-date-picker></custom-date-picker>`);
}

suite('custom-date-picker localized placeholder (ELEMENTS-1873)', () => {
  let picker;
  let savedLocale;
  let originalLanguages;

  setup(async () => {
    savedLocale = moment.locale();
    // Save original navigator.languages to restore later
    originalLanguages = navigator.languages;
    picker = await makePicker();
  });

  teardown(() => {
    moment.locale(savedLocale);
    // Restore navigator.languages
    Object.defineProperty(navigator, 'languages', {
      value: originalLanguages,
      configurable: true,
    });
  });

  // ---------------------------------------------------------------------------
  // English locale placeholder tests
  // ---------------------------------------------------------------------------

  suite('English locale placeholder', () => {
    test('_getDatePlaceholder returns mm/dd/yyyy for en-US locale', () => {
      moment.locale('en');
      picker._setupI18n('en-US');
      Object.defineProperty(navigator, 'languages', { value: ['en-US'], configurable: true });

      const placeholder = picker._getDatePlaceholder();

      // English US moment longDateFormat('L') = "MM/DD/YYYY"
      // With i18n: dayAbbr=dd, monthAbbr=mm, yearAbbr=yyyy => "mm/dd/yyyy"
      expect(placeholder).to.equal('mm/dd/yyyy');
    });

    test('_getDatePlaceholder returns dd/mm/yyyy for en-GB locale', () => {
      moment.locale('en-gb');
      picker._setupI18n('en-GB');
      Object.defineProperty(navigator, 'languages', { value: ['en-GB'], configurable: true });

      const placeholder = picker._getDatePlaceholder();

      // English GB moment longDateFormat('L') = "DD/MM/YYYY"
      // With i18n: dayAbbr=dd, monthAbbr=mm, yearAbbr=yyyy => "dd/mm/yyyy"
      expect(placeholder).to.equal('dd/mm/yyyy');
    });
  });

  // ---------------------------------------------------------------------------
  // English i18n dictionary tests
  // ---------------------------------------------------------------------------

  suite('English i18n dictionary contains required abbreviation keys', () => {
    test('English locale has dayAbbr, monthAbbr, yearAbbr keys', () => {
      picker._setupI18n('en');

      const dayAbbr = picker._getLocalizedText('dayAbbr');
      const monthAbbr = picker._getLocalizedText('monthAbbr');
      const yearAbbr = picker._getLocalizedText('yearAbbr');

      expect(dayAbbr).to.equal('dd');
      expect(monthAbbr).to.equal('mm');
      expect(yearAbbr).to.equal('yyyy');
    });

    test('English locale has expectedFormat key with interpolation', () => {
      picker._setupI18n('en');

      const expectedFormat = picker._getLocalizedText('expectedFormat', { format: 'mm/dd/yyyy' });

      expect(expectedFormat).to.equal('Expected format: mm/dd/yyyy');
    });
  });

  // ---------------------------------------------------------------------------
  // Fallback behavior (non-English locales fall back to English until Crowdin)
  // ---------------------------------------------------------------------------

  suite('fallback for locales without new keys', () => {
    test('unsupported locale falls back to English abbreviations', () => {
      // Use a locale not in the dictionary (e.g. Japanese)
      picker._setupI18n('ja');

      const dayAbbr = picker._getLocalizedText('dayAbbr');
      const monthAbbr = picker._getLocalizedText('monthAbbr');
      const yearAbbr = picker._getLocalizedText('yearAbbr');

      // Should fall back to English
      expect(dayAbbr).to.equal('dd');
      expect(monthAbbr).to.equal('mm');
      expect(yearAbbr).to.equal('yyyy');
    });

    test('non-English locale without new keys falls back to English abbreviations', () => {
      // French locale does not yet carry dayAbbr/monthAbbr/yearAbbr (Crowdin pending)
      picker._setupI18n('fr');

      const dayAbbr = picker._getLocalizedText('dayAbbr');
      const monthAbbr = picker._getLocalizedText('monthAbbr');
      const yearAbbr = picker._getLocalizedText('yearAbbr');

      // Falls back to English until Crowdin delivers fr translations
      expect(dayAbbr).to.equal('dd');
      expect(monthAbbr).to.equal('mm');
      expect(yearAbbr).to.equal('yyyy');
    });
  });

  // ---------------------------------------------------------------------------
  // Error message tests (English)
  // ---------------------------------------------------------------------------

  suite('English error messages use localized format', () => {
    test('English error message contains English format hint', () => {
      moment.locale('en');
      picker._setupI18n('en-US');
      Object.defineProperty(navigator, 'languages', { value: ['en-US'], configurable: true });

      const expectedFormat = picker._getDatePlaceholder();
      const incorrectFormat = picker._getLocalizedText('incorrectFormat');
      const expectedFormatMsg = picker._getLocalizedText('expectedFormat', { format: expectedFormat });

      const fullMessage = `${incorrectFormat} ${expectedFormatMsg}`;

      expect(fullMessage).to.include('Incorrect date format.');
      expect(fullMessage).to.include('Expected format:');
      expect(fullMessage).to.include('mm/dd/yyyy');
    });
  });

  // ---------------------------------------------------------------------------
  // Placeholder separator preservation tests
  // ---------------------------------------------------------------------------

  suite('locale-specific date separators are preserved', () => {
    test('German uses dots as separators', () => {
      moment.locale('de');
      picker._setupI18n('de');
      Object.defineProperty(navigator, 'languages', { value: ['de'], configurable: true });

      const placeholder = picker._getDatePlaceholder();

      // German format is DD.MM.YYYY so separator is "."
      expect(placeholder).to.include('.');
      expect(placeholder).to.not.include('/');
    });

    test('French uses slashes as separators', () => {
      moment.locale('fr');
      picker._setupI18n('fr');
      Object.defineProperty(navigator, 'languages', { value: ['fr'], configurable: true });

      const placeholder = picker._getDatePlaceholder();

      // French format is DD/MM/YYYY so separator is "/"
      expect(placeholder).to.include('/');
    });

    test('en-US uses slashes as separators', () => {
      moment.locale('en');
      picker._setupI18n('en-US');
      Object.defineProperty(navigator, 'languages', { value: ['en-US'], configurable: true });

      const placeholder = picker._getDatePlaceholder();
      expect(placeholder).to.include('/');
    });
  });

  // ---------------------------------------------------------------------------
  // Placeholder renders in the input DOM element
  // ---------------------------------------------------------------------------

  suite('placeholder renders in the input DOM element', () => {
    test('input placeholder attribute is set', () => {
      const input = getDateInput(picker);
      expect(input).to.exist;

      const placeholderAttr = input.getAttribute('placeholder');
      expect(placeholderAttr).to.be.a('string').and.not.be.empty;
    });
  });

  // ---------------------------------------------------------------------------
  // External i18n bridge tests (messages.json → nuxeo-date-picker → custom-date-picker)
  // ---------------------------------------------------------------------------

  suite('external i18n bridge overrides internal dictionary', () => {
    test('_getDatePlaceholder prefers i18n bridge values over internal dictionary', () => {
      moment.locale('fr');
      picker._setupI18n('fr');
      Object.defineProperty(navigator, 'languages', { value: ['fr'], configurable: true });

      // Simulate nuxeo-date-picker bridge setting French abbreviations from messages-fr.json
      picker.set('i18n.dayAbbr', 'jj');
      picker.set('i18n.monthAbbr', 'mm');
      picker.set('i18n.yearAbbr', 'aaaa');

      const placeholder = picker._getDatePlaceholder();

      // French format is DD/MM/YYYY → should be jj/mm/aaaa
      expect(placeholder).to.equal('jj/mm/aaaa');
    });

    test('_getDatePlaceholder falls back to internal dictionary when bridge values are absent', () => {
      moment.locale('en');
      picker._setupI18n('en-US');
      Object.defineProperty(navigator, 'languages', { value: ['en-US'], configurable: true });

      // Do NOT set i18n bridge values — should fall back to internal dictionary
      const placeholder = picker._getDatePlaceholder();

      // English US: MM/DD/YYYY → mm/dd/yyyy from internal dictionary
      expect(placeholder).to.equal('mm/dd/yyyy');
    });

    test('partial bridge values: set dayAbbr only, others fallback to internal', () => {
      moment.locale('fr');
      picker._setupI18n('fr');
      Object.defineProperty(navigator, 'languages', { value: ['fr'], configurable: true });

      // Only set dayAbbr via bridge, leave others to internal fallback
      picker.set('i18n.dayAbbr', 'jj');

      const placeholder = picker._getDatePlaceholder();

      // French format DD/MM/YYYY: dayAbbr='jj' (bridge), monthAbbr='mm' (internal), yearAbbr='yyyy' (internal)
      expect(placeholder).to.equal('jj/mm/yyyy');
    });
  });

  // ---------------------------------------------------------------------------
  // _getExpectedFormatMessage tests
  // ---------------------------------------------------------------------------

  suite('_getExpectedFormatMessage uses external i18n template', () => {
    test('uses external i18n expectedFormat template with {0} placeholder', () => {
      // Simulate bridge providing the French template from messages-fr.json
      picker.set('i18n.expectedFormat', 'Format attendu\u00a0: {0}');

      const message = picker._getExpectedFormatMessage('jj/mm/aaaa');

      expect(message).to.equal('Format attendu\u00a0: jj/mm/aaaa');
    });

    test('uses external i18n expectedFormat template with English value', () => {
      // Simulate bridge providing the English template from messages.json
      picker.set('i18n.expectedFormat', 'Expected format: {0}');

      const message = picker._getExpectedFormatMessage('mm/dd/yyyy');

      expect(message).to.equal('Expected format: mm/dd/yyyy');
    });

    test('falls back to internal dictionary when bridge expectedFormat is absent', () => {
      picker._setupI18n('en');

      // Do NOT set i18n.expectedFormat — should fall back to internal dictionary
      const message = picker._getExpectedFormatMessage('mm/dd/yyyy');

      expect(message).to.equal('Expected format: mm/dd/yyyy');
    });
  });
});
