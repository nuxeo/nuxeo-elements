/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
suite('Nuxeo.I18nBehavior extras', () => {
  let origLang;
  let origTranslate;
  let origLocaleResolver;

  setup(() => {
    origLang = window.nuxeo.I18n.language;
    origTranslate = window.nuxeo.I18n.translate;
    origLocaleResolver = window.nuxeo.I18n.localeResolver;
  });

  teardown(() => {
    window.nuxeo.I18n.language = origLang;
    window.nuxeo.I18n.translate = origTranslate;
    window.nuxeo.I18n.localeResolver = origLocaleResolver;
  });

  suite('translate', () => {
    test('returns key when no translation exists', () => {
      const result = window.nuxeo.I18n.translate('some.missing.key');
      expect(result).to.equal('some.missing.key');
    });

    test('returns translated value for current language', () => {
      window.nuxeo.I18n.language = 'en';
      window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
      window.nuxeo.I18n.en['test.key'] = 'Hello';
      expect(window.nuxeo.I18n.translate('test.key')).to.equal('Hello');
      delete window.nuxeo.I18n.en['test.key'];
    });

    test('substitutes numbered parameters', () => {
      window.nuxeo.I18n.language = 'en';
      window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
      window.nuxeo.I18n.en['test.param'] = 'Hi {0} from {1}';
      const result = window.nuxeo.I18n.translate('test.param', 'Alice', 'Bob');
      expect(result).to.equal('Hi Alice from Bob');
      delete window.nuxeo.I18n.en['test.param'];
    });

    test('defaults to "en" when language is null', () => {
      window.nuxeo.I18n.language = null;
      window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
      window.nuxeo.I18n.en['fallback.key'] = 'Fallback';
      expect(window.nuxeo.I18n.translate('fallback.key')).to.equal('Fallback');
      delete window.nuxeo.I18n.en['fallback.key'];
    });

    test('returns key when language has no translations', () => {
      window.nuxeo.I18n.language = 'zz';
      const result = window.nuxeo.I18n.translate('unknown.key');
      expect(result).to.equal('unknown.key');
    });
  });

  suite('loadLocale', () => {
    test('returns pending promise when no localeResolver', () => {
      window.nuxeo.I18n.localeResolver = null;
      const result = window.nuxeo.I18n.loadLocale();
      expect(result).to.be.a('promise');
    });

    test('dispatches i18n-locale-loaded on resolve', (done) => {
      const handler = () => {
        document.removeEventListener('i18n-locale-loaded', handler);
        done();
      };
      document.addEventListener('i18n-locale-loaded', handler);
      window.nuxeo.I18n.localeResolver = () => Promise.resolve();
      window.nuxeo.I18n.loadLocale();
    });
  });
});
