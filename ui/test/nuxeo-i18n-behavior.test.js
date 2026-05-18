/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

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
import { fixture, html } from '@nuxeo/testing-helpers';
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { I18nBehavior, XHRLocaleResolver, setI18n } from '../nuxeo-i18n-behavior.js';

window.Polymer = Polymer;

Polymer({
  is: 'nuxeo-i18n-behavior-host',
  behaviors: [I18nBehavior],
});

suite('Nuxeo.I18nBehavior', () => {
  let originalLanguage;
  let originalEn;
  let originalFr;
  let originalTranslate;
  let originalResolver;

  setup(() => {
    originalLanguage = window.nuxeo.I18n.language;
    originalEn = window.nuxeo.I18n.en;
    originalFr = window.nuxeo.I18n.fr;
    originalTranslate = window.nuxeo.I18n.translate;
    originalResolver = window.nuxeo.I18n.localeResolver;
    window.nuxeo.I18n.en = {};
    window.nuxeo.I18n.language = 'en';
  });

  teardown(() => {
    window.nuxeo.I18n.language = originalLanguage;
    window.nuxeo.I18n.en = originalEn;
    window.nuxeo.I18n.fr = originalFr;
    window.nuxeo.I18n.translate = originalTranslate;
    window.nuxeo.I18n.localeResolver = originalResolver;
  });

  suite('translate', () => {
    test('returns the key when no translation exists', () => {
      expect(window.nuxeo.I18n.translate('not.found')).to.equal('not.found');
    });

    test('returns the value of a known key', () => {
      window.nuxeo.I18n.en['hello'] = 'Hello';
      expect(window.nuxeo.I18n.translate('hello')).to.equal('Hello');
    });

    test('substitutes positional parameters {0}, {1}, …', () => {
      window.nuxeo.I18n.en['greet'] = 'Hi {0}, you have {1} messages';
      expect(window.nuxeo.I18n.translate('greet', 'Ada', 3)).to.equal('Hi Ada, you have 3 messages');
    });

    test('falls back to the key when language is unset', () => {
      window.nuxeo.I18n.language = '';
      expect(window.nuxeo.I18n.translate('something')).to.equal('something');
    });
  });

  suite('I18nBehavior properties / lifecycle', () => {
    test('exposes the translate function as `i18n` on the host', async () => {
      const host = await fixture(html`
        <nuxeo-i18n-behavior-host></nuxeo-i18n-behavior-host>
      `);
      expect(host.i18n).to.equal(window.nuxeo.I18n.translate);
    });

    test('refreshI18n re-binds when translate is replaced', async () => {
      const host = await fixture(html`
        <nuxeo-i18n-behavior-host></nuxeo-i18n-behavior-host>
      `);
      const newTranslate = (key) => `T:${key}`;
      window.nuxeo.I18n.translate = newTranslate;
      host.refreshI18n();
      expect(host.i18n).to.equal(newTranslate);
    });

    test('listens for the i18n-locale-loaded event and refreshes', async () => {
      const host = await fixture(html`
        <nuxeo-i18n-behavior-host></nuxeo-i18n-behavior-host>
      `);
      window.nuxeo.I18n.translate = (key) => `XX:${key}`;
      document.dispatchEvent(new Event('i18n-locale-loaded'));
      expect(host.i18n('greet')).to.equal('XX:greet');
    });
  });

  suite('setI18n', () => {
    test('merges values into window.nuxeo.I18n and dispatches the loaded event', () => {
      const spy = sinon.spy();
      document.addEventListener('i18n-locale-loaded', spy);
      setI18n({ language: 'fr', fr: { hello: 'Bonjour' } });
      try {
        expect(window.nuxeo.I18n.language).to.equal('fr');
        expect(window.nuxeo.I18n.fr.hello).to.equal('Bonjour');
        expect(spy.calledOnce).to.be.true;
      } finally {
        document.removeEventListener('i18n-locale-loaded', spy);
      }
    });
  });

  suite('XHRLocaleResolver', () => {
    let server;

    setup(() => {
      server = sinon.fakeServer.create();
      server.respondImmediately = true;
    });

    teardown(() => {
      server.restore();
    });

    test('loads the requested locale file', async () => {
      window.nuxeo.I18n.language = 'fr';
      const dict = { hello: 'Bonjour' };
      server.respondWith('GET', '/i18n/messages-fr.json', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(dict),
      ]);
      const resolver = XHRLocaleResolver('/i18n');
      await resolver();
      expect(window.nuxeo.I18n.fr).to.deep.equal(dict);
      expect(window.nuxeo.I18n.language).to.equal('fr');
    });

    test('uses the reference messages.json for english', async () => {
      window.nuxeo.I18n.language = 'en';
      const dict = { hello: 'Hello' };
      server.respondWith('GET', '/i18n/messages.json', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(dict),
      ]);
      const resolver = XHRLocaleResolver('/i18n');
      await resolver();
      expect(window.nuxeo.I18n.en).to.deep.equal(dict);
    });

    test('strips regional prefix when language starts with "en-"', async () => {
      window.nuxeo.I18n.language = 'en-US';
      server.respondWith('GET', '/i18n/messages.json', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ key: 'val' }),
      ]);
      const resolver = XHRLocaleResolver('/i18n');
      await resolver();
      expect(window.nuxeo.I18n.language).to.equal('en');
    });

    test('falls back to the english reference file on 404', async () => {
      window.nuxeo.I18n.language = 'xx';
      server.respondWith('GET', '/i18n/messages-xx.json', [404, {}, 'not found']);
      server.respondWith('GET', '/i18n/messages.json', [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ hello: 'Hello' }),
      ]);
      const resolver = XHRLocaleResolver('/i18n');
      await resolver();
      expect(window.nuxeo.I18n.language).to.equal('en');
      expect(window.nuxeo.I18n.en).to.deep.equal({ hello: 'Hello' });
    });
  });

  suite('loadLocale', () => {
    test('returns a never-resolving promise when no resolver is configured', () => {
      window.nuxeo.I18n.localeResolver = null;
      const result = window.nuxeo.I18n.loadLocale();
      expect(result).to.be.an.instanceof(Promise);
    });

    test('runs the resolver and dispatches i18n-locale-loaded', async () => {
      const spy = sinon.spy();
      document.addEventListener('i18n-locale-loaded', spy);
      try {
        window.nuxeo.I18n.localeResolver = () => Promise.resolve();
        await window.nuxeo.I18n.loadLocale();
        expect(spy.calledOnce).to.be.true;
      } finally {
        document.removeEventListener('i18n-locale-loaded', spy);
      }
    });
  });
});
