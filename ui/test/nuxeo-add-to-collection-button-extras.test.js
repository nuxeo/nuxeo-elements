/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-add-to-collection-button.js';

suite('nuxeo-add-to-collection-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-add-to-collection-button></nuxeo-add-to-collection-button>
      `,
    );
  });

  suite('_isAvailable', () => {
    test('returns true for collection member doc', () => {
      const doc = {
        facets: ['CollectionMember'],
        type: 'File',
        isVersion: false,
        isTrashed: false,
      };
      expect(el._isAvailable(doc)).to.be.ok;
    });

    test('returns falsy for null doc', () => {
      expect(el._isAvailable(null)).to.not.be.ok;
    });
  });

  suite('_resultsFilter', () => {
    test('returns true for valid entry', () => {
      expect(el._resultsFilter({ id: 'col1' })).to.be.true;
    });

    test('returns false for -999999 entry', () => {
      expect(el._resultsFilter({ id: 'some-999999' })).to.be.false;
    });

    test('returns falsy when id is empty', () => {
      expect(el._resultsFilter({ id: '' })).to.not.be.ok;
    });
  });

  suite('_resultFormatter', () => {
    test('escapes HTML for normal entry', () => {
      const result = el._resultFormatter({
        id: '1',
        displayLabel: '<b>Col</b>',
      });
      expect(result).to.not.include('<b>');
    });

    test('returns raw label for new entry (id = -1)', () => {
      const result = el._resultFormatter({
        id: -1,
        displayLabel: 'New Collection',
      });
      expect(result).to.include('New Collection');
      expect(result).to.include('iron-icon');
    });

    test('falls back to title', () => {
      const result = el._resultFormatter({
        id: '1',
        title: 'My Title',
      });
      expect(result).to.include('My Title');
    });
  });

  suite('_selectionFormatter', () => {
    test('escapes HTML for normal entry', () => {
      const result = el._selectionFormatter({
        id: '1',
        displayLabel: '<b>Col</b>',
      });
      expect(result).to.not.include('<b>');
    });

    test('returns raw label for new entry (id = -1)', () => {
      const result = el._selectionFormatter({
        id: -1,
        displayLabel: 'New Collection',
      });
      expect(result).to.equal('New Collection');
    });
  });

  suite('_escapeHTML', () => {
    test('escapes HTML entities', () => {
      const result = el._escapeHTML('<script>alert("x")</script>');
      expect(result).to.not.include('<script>');
    });

    test('returns non-string as-is', () => {
      expect(el._escapeHTML(123)).to.equal(123);
      expect(el._escapeHTML(null)).to.be.null;
    });

    test('escapes backslash', () => {
      const result = el._escapeHTML('a\\b');
      expect(result).to.include('&#92;');
    });

    test('escapes forward slash', () => {
      const result = el._escapeHTML('a/b');
      expect(result).to.include('&#47;');
    });
  });

  suite('_newEntryFormatter', () => {
    test('returns entry with id -1', () => {
      const result = el._newEntryFormatter('My Collection');
      expect(result.id).to.equal(-1);
      expect(result.displayLabel).to.include('My Collection');
    });
  });

  suite('_isValid', () => {
    test('returns truthy when collection is set', () => {
      el.collection = 'col1';
      expect(el._isValid()).to.be.ok;
    });

    test('returns falsy when collection is empty', () => {
      el.collection = '';
      expect(el._isValid()).to.not.be.ok;
    });
  });

  suite('_isNew', () => {
    test('returns true when collection is -1', () => {
      el.collection = -1;
      expect(el._isNew()).to.be.true;
    });

    test('returns false for a real collection', () => {
      el.collection = 'col-uuid';
      expect(el._isNew()).to.be.false;
    });
  });

  suite('_resetPopup', () => {
    test('clears collection and description', () => {
      el.collection = 'col1';
      el.description = 'desc';
      el._resetPopup();
      expect(el.collection).to.be.null;
      expect(el.description).to.equal('');
    });
  });
});
