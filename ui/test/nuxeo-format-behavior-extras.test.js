/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { FormatBehavior } from '../nuxeo-format-behavior.js';

const fb = FormatBehavior[1];

suite('Nuxeo.FormatBehavior extras', () => {
  suite('formatSize', () => {
    test('returns empty string for null', () => {
      expect(fb.formatSize(null)).to.equal('');
    });

    test('returns empty string for 0', () => {
      expect(fb.formatSize(0)).to.equal('');
    });

    test('returns empty string for negative', () => {
      expect(fb.formatSize(-100)).to.equal('');
    });

    test('returns MB for values over 1MB', () => {
      const result = fb.formatSize(2 * 1048576);
      expect(result).to.include('MB');
      expect(result).to.include('2.00');
    });

    test('returns KB for values between 1KB and 1MB', () => {
      const result = fb.formatSize(2 * 1024);
      expect(result).to.include('KB');
    });

    test('returns Bytes for values under 1KB', () => {
      const result = fb.formatSize(500);
      expect(result).to.include('Bytes');
      expect(result).to.include('500');
    });

    test('returns KB for exactly 1025 bytes', () => {
      const result = fb.formatSize(1025);
      expect(result).to.include('KB');
    });

    test('returns MB for exactly 1048577 bytes', () => {
      const result = fb.formatSize(1048577);
      expect(result).to.include('MB');
    });
  });

  suite('formatVersion', () => {
    test('returns version string for valid doc', () => {
      const doc = {
        properties: { 'uid:major_version': 1, 'uid:minor_version': 2 },
      };
      expect(fb.formatVersion(doc)).to.equal('1.2');
    });

    test('returns version 0.0', () => {
      const doc = {
        properties: { 'uid:major_version': 0, 'uid:minor_version': 0 },
      };
      expect(fb.formatVersion(doc)).to.equal('0.0');
    });

    test('returns empty string when major is null', () => {
      const doc = {
        properties: { 'uid:major_version': null, 'uid:minor_version': 1 },
      };
      expect(fb.formatVersion(doc)).to.equal('');
    });

    test('returns empty string when minor is null', () => {
      const doc = {
        properties: { 'uid:major_version': 1, 'uid:minor_version': null },
      };
      expect(fb.formatVersion(doc)).to.equal('');
    });

    test('returns empty string when properties missing', () => {
      expect(fb.formatVersion({})).to.equal('');
    });

    test('returns empty string for null doc', () => {
      expect(fb.formatVersion(null)).to.equal('');
    });
  });

  suite('formatDirectory', () => {
    test('returns value as-is when not directory entry', () => {
      expect(fb.formatDirectory('simple')).to.equal('simple');
    });

    test('returns value when entity-type is not directoryEntry', () => {
      const val = { 'entity-type': 'document' };
      expect(fb.formatDirectory(val)).to.equal(val);
    });

    test('uses label when properties.label exists', () => {
      const val = {
        'entity-type': 'directoryEntry',
        properties: { label: 'My Label', parent: null },
      };
      const ctx = { ...fb, _absoluteDirectoryPath: (e, l, _s) => e.properties[l] };
      expect(ctx.formatDirectory(val)).to.equal('My Label');
    });

    test('falls back to language label when no label property', () => {
      const val = {
        'entity-type': 'directoryEntry',
        properties: { label_en: 'English Label', parent: null },
      };
      const ctx = {
        ...fb,
        _languageCode: () => 'en',
        _absoluteDirectoryPath: (e, l) => e.properties[l],
      };
      expect(ctx.formatDirectory(val)).to.equal('English Label');
    });

    test('returns null for null value', () => {
      expect(fb.formatDirectory(null)).to.be.null;
    });
  });

  suite('_absoluteDirectoryPath', () => {
    test('returns simple label when no parent', () => {
      const entry = { properties: { label: 'A', parent: null } };
      expect(fb._absoluteDirectoryPath(entry, 'label', '/')).to.equal('A');
    });

    test('appends subPath when provided', () => {
      const entry = { properties: { label: 'A', parent: null } };
      expect(fb._absoluteDirectoryPath(entry, 'label', '/', 'B')).to.equal('A/B');
    });

    test('recurses into parent directoryEntry', () => {
      const parent = {
        'entity-type': 'directoryEntry',
        properties: { label: 'Parent', parent: null },
      };
      const entry = { properties: { label: 'Child', parent } };
      const result = fb._absoluteDirectoryPath(entry, 'label', '/');
      expect(result).to.equal('Parent/Child');
    });
  });

  suite('_formatDate', () => {
    test('returns undefined for falsy date', () => {
      const ctx = { _languageCode: () => 'en' };
      expect(fb._formatDate.call(ctx, null, 'LL')).to.be.undefined;
    });

    test('returns undefined for empty string date', () => {
      const ctx = { _languageCode: () => 'en' };
      expect(fb._formatDate.call(ctx, '', 'LL')).to.be.undefined;
    });

    test('formats with relative format', () => {
      const ctx = { _languageCode: () => 'en' };
      const result = fb._formatDate.call(ctx, '2020-01-01', 'relative');
      expect(result).to.be.a('string');
    });

    test('formats with standard format', () => {
      const ctx = { _languageCode: () => 'en' };
      const result = fb._formatDate.call(ctx, '2024-06-15', 'YYYY-MM-DD');
      expect(result).to.equal('2024-06-15');
    });

    test('formats in UTC when timezone is Etc/UTC', () => {
      const ctx = { _languageCode: () => 'en' };
      const result = fb._formatDate.call(ctx, '2024-06-15T12:00:00Z', 'YYYY-MM-DD', 'Etc/UTC');
      expect(result).to.equal('2024-06-15');
    });
  });

  suite('formatMimeType', () => {
    test('returns undefined for empty value', () => {
      const ctx = { i18n: (k) => k };
      expect(fb.formatMimeType.call(ctx, '')).to.be.undefined;
    });

    test('returns undefined for null', () => {
      const ctx = { i18n: (k) => k };
      expect(fb.formatMimeType.call(ctx, null)).to.be.undefined;
    });

    test('returns translated key for valid mime', () => {
      const ctx = { i18n: (k) => k };
      expect(fb.formatMimeType.call(ctx, 'image/png')).to.equal('mimetype.image/png');
    });
  });

  suite('formatRendition', () => {
    test('returns undefined for empty', () => {
      const ctx = { i18n: (k) => k };
      expect(fb.formatRendition.call(ctx, '')).to.be.undefined;
    });

    test('returns undefined for null', () => {
      const ctx = { i18n: (k) => k };
      expect(fb.formatRendition.call(ctx, null)).to.be.undefined;
    });

    test('returns key for valid rendition', () => {
      const ctx = { i18n: (k) => k };
      expect(fb.formatRendition.call(ctx, 'pdf')).to.equal('exportButton.pdf');
    });
  });

  suite('formatDocType', () => {
    test('returns undefined for null', () => {
      const ctx = { _getI18nWithPrefix: fb._getI18nWithPrefix, i18n: (k) => k };
      expect(fb.formatDocType.call(ctx, null)).to.be.undefined;
    });

    test('returns undefined for empty', () => {
      const ctx = { _getI18nWithPrefix: fb._getI18nWithPrefix, i18n: (k) => k };
      expect(fb.formatDocType.call(ctx, '')).to.be.undefined;
    });

    test('returns lowercased type key', () => {
      const ctx = { _getI18nWithPrefix: fb._getI18nWithPrefix, i18n: (k) => k };
      const result = fb.formatDocType.call(ctx, 'File');
      expect(result).to.equal('file');
    });
  });

  suite('formatPermission', () => {
    test('returns undefined for null', () => {
      const ctx = { _getI18nWithPrefix: fb._getI18nWithPrefix, i18n: (k) => k };
      expect(fb.formatPermission.call(ctx, null)).to.be.undefined;
    });

    test('returns undefined for empty', () => {
      const ctx = { _getI18nWithPrefix: fb._getI18nWithPrefix, i18n: (k) => k };
      expect(fb.formatPermission.call(ctx, '')).to.be.undefined;
    });

    test('lowercases first character', () => {
      const ctx = { _getI18nWithPrefix: fb._getI18nWithPrefix, i18n: (k) => k };
      const result = fb.formatPermission.call(ctx, 'Write');
      expect(result).to.equal('write');
    });
  });

  suite('_getI18nWithPrefix', () => {
    test('returns key when i18n returns the same label', () => {
      const ctx = { i18n: (k) => k };
      expect(fb._getI18nWithPrefix.call(ctx, 'prefix', 'key')).to.equal('key');
    });

    test('returns translated string when i18n resolves', () => {
      const ctx = { i18n: () => 'Translated' };
      expect(fb._getI18nWithPrefix.call(ctx, 'prefix', 'key')).to.equal('Translated');
    });
  });

  suite('formatFulltext', () => {
    test('replaces hyphens with spaces', () => {
      expect(fb.formatFulltext('hello-world-test')).to.equal('hello world test');
    });

    test('returns text without hyphens as-is', () => {
      expect(fb.formatFulltext('hello world')).to.equal('hello world');
    });
  });

  suite('formatPropertyXpath', () => {
    test('replaces slashes with dots by default', () => {
      expect(fb.formatPropertyXpath('files/0/file')).to.equal('files.0.file');
    });

    test('uses custom regex when provided', () => {
      expect(fb.formatPropertyXpath('a-b-c', /-/g)).to.equal('a.b.c');
    });
  });

  suite('escapeRegExp', () => {
    test('escapes special characters', () => {
      expect(fb.escapeRegExp('[test]')).to.equal('\\[test\\]');
    });

    test('returns falsy for null', () => {
      expect(fb.escapeRegExp(null)).to.not.be.ok;
    });

    test('returns falsy for empty', () => {
      expect(fb.escapeRegExp('')).to.equal('');
    });

    test('escapes parentheses', () => {
      expect(fb.escapeRegExp('(a)')).to.equal('\\(a\\)');
    });
  });

  suite('escapeNxqlStringLiteral', () => {
    test('escapes single quotes', () => {
      expect(fb.escapeNxqlStringLiteral("it's")).to.equal("it\\'s");
    });

    test('escapes double quotes', () => {
      expect(fb.escapeNxqlStringLiteral('say "hi"')).to.equal('say \\"hi\\"');
    });

    test('escapes backslashes', () => {
      expect(fb.escapeNxqlStringLiteral('a\\b')).to.equal('a\\\\b');
    });

    test('returns falsy for null', () => {
      expect(fb.escapeNxqlStringLiteral(null)).to.not.be.ok;
    });

    test('returns empty for empty string', () => {
      expect(fb.escapeNxqlStringLiteral('')).to.equal('');
    });
  });

  suite('_languageCode', () => {
    test('returns language code from window.nuxeo.I18n', () => {
      const origLang = window.nuxeo && window.nuxeo.I18n && window.nuxeo.I18n.language;
      if (window.nuxeo && window.nuxeo.I18n) {
        window.nuxeo.I18n.language = 'fr-FR';
      }
      const result = fb._languageCode();
      expect(result).to.be.a('string');
      if (window.nuxeo && window.nuxeo.I18n && origLang !== undefined) {
        window.nuxeo.I18n.language = origLang;
      }
    });

    test('returns "en" when language is not set', () => {
      const origLang = window.nuxeo && window.nuxeo.I18n && window.nuxeo.I18n.language;
      if (window.nuxeo && window.nuxeo.I18n) {
        window.nuxeo.I18n.language = null;
      }
      expect(fb._languageCode()).to.equal('en');
      if (window.nuxeo && window.nuxeo.I18n && origLang !== undefined) {
        window.nuxeo.I18n.language = origLang;
      }
    });
  });
});
