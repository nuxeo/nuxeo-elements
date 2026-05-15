/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-directory-suggestion.js';

suite('nuxeo-directory-suggestion extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-directory-suggestion directory-name="nature"></nuxeo-directory-suggestion>
      `,
    );
  });

  suite('_idFunction', () => {
    test('returns string item as-is', () => {
      expect(el._idFunction('myvalue')).to.equal('myvalue');
    });

    test('returns computedId when present', () => {
      expect(el._idFunction({ computedId: 'a/b' })).to.equal('a/b');
    });

    test('returns id when no computedId', () => {
      expect(el._idFunction({ id: 'abc' })).to.equal('abc');
    });

    test('returns uid fallback', () => {
      expect(el._idFunction({ uid: 'uid1' })).to.equal('uid1');
    });

    test('includes parent in id', () => {
      const item = {
        id: 'child',
        properties: {
          parent: { id: 'parent', properties: {} },
        },
      };
      const result = el._idFunction(item);
      expect(result).to.include('parent');
      expect(result).to.include('child');
    });
  });

  suite('_selectionFormatter', () => {
    test('returns escaped absoluteLabel', () => {
      const entry = { id: '1', absoluteLabel: '<b>Label</b>' };
      const result = el._selectionFormatter(entry);
      expect(result).to.not.include('<b>');
    });

    test('falls back to displayLabel', () => {
      const entry = { id: '1', displayLabel: 'My Label' };
      const result = el._selectionFormatter(entry);
      expect(result).to.include('My Label');
    });

    test('handles string entry without error', () => {
      const result = el._selectionFormatter({ displayLabel: 'raw' });
      expect(result).to.be.ok;
    });
  });

  suite('_resolveEntry', () => {
    test('returns object with id and displayLabel', () => {
      const result = el._resolveEntry({ id: 'x', displayLabel: 'X' });
      expect(result).to.have.property('id', 'x');
      expect(result).to.have.property('displayLabel', 'X');
    });

    test('resolves string entry', () => {
      const result = el._resolveEntry('myVal');
      expect(result).to.have.property('id', 'myVal');
    });
  });

  suite('_fetchLabel', () => {
    test('returns absoluteLabel when present', () => {
      const item = { absoluteLabel: 'Abs' };
      expect(el._fetchLabel(item)).to.equal('Abs');
    });

    test('returns displayLabel as fallback', () => {
      const item = { displayLabel: 'Display' };
      expect(el._fetchLabel(item)).to.equal('Display');
    });

    test('handles string entry', () => {
      const result = el._fetchLabel('someEntry');
      expect(result).to.be.a('string');
    });
  });

  suite('_computeParams', () => {
    test('includes directoryName and dbl10n', () => {
      el.directoryName = 'nature';
      el.dbl10n = true;
      const result = el._computeParams();
      expect(result.directoryName).to.equal('nature');
      expect(result.dbl10n).to.be.true;
    });

    test('merges extra params', () => {
      el.params = { custom: 'value' };
      const result = el._computeParams();
      expect(result.custom).to.equal('value');
    });

    test('uses lang from nuxeo.I18n.language', () => {
      window.nuxeo.I18n.language = 'fr';
      const result = el._computeParams();
      expect(result.lang).to.equal('fr');
      window.nuxeo.I18n.language = 'en';
    });

    test('defaults lang to en when language is null', () => {
      const origLang = window.nuxeo.I18n.language;
      window.nuxeo.I18n.language = null;
      const result = el._computeParams();
      expect(result.lang).to.equal('en');
      window.nuxeo.I18n.language = origLang;
    });
  });

  suite('connectedCallback', () => {
    test('sets dir attribute', () => {
      expect(el.getAttribute('dir')).to.be.ok;
    });
  });
});
