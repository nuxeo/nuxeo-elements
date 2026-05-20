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
import { config } from '@nuxeo/nuxeo-elements';
import { FormatBehavior } from '../nuxeo-format-behavior.js';

window.Polymer = Polymer;

Polymer({
  is: 'nuxeo-format-behavior-host',
  behaviors: [FormatBehavior],
});

suite('Nuxeo.FormatBehavior', () => {
  let host;
  let originalLanguage;

  setup(async () => {
    host = await fixture(html`
      <nuxeo-format-behavior-host></nuxeo-format-behavior-host>
    `);
    originalLanguage = window.nuxeo.I18n.language;
    window.nuxeo.I18n.language = 'en';
    window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
  });

  teardown(() => {
    window.nuxeo.I18n.language = originalLanguage;
    config.set('dateFormat');
    config.set('dateTimeFormat');
    config.set('timezone');
  });

  suite('formatSize', () => {
    test('returns "" for falsy or negative input', () => {
      expect(host.formatSize(0)).to.equal('');
      expect(host.formatSize(undefined)).to.equal('');
      expect(host.formatSize(null)).to.equal('');
      expect(host.formatSize(-100)).to.equal('');
    });

    test('renders bytes when below 1 KB', () => {
      expect(host.formatSize(1)).to.equal('1 Bytes');
      expect(host.formatSize(512)).to.equal('512 Bytes');
    });

    test('renders KB with two decimals when between 1 KB and 1 MB', () => {
      expect(host.formatSize(2048)).to.equal('2.00 KB');
      expect(host.formatSize(1500)).to.equal('1.46 KB');
    });

    test('renders MB with two decimals when above 1 MB', () => {
      expect(host.formatSize(2 * 1024 * 1024)).to.equal('2.00 MB');
      expect(host.formatSize(5 * 1024 * 1024 + 100 * 1024)).to.equal('5.10 MB');
    });
  });

  suite('formatDate / formatDateTime', () => {
    const date = '2024-04-12T10:30:00.000Z';

    test('returns nothing when date is empty', () => {
      expect(host.formatDate('')).to.be.undefined;
      expect(host.formatDateTime(null)).to.be.undefined;
    });

    test('uses the explicit format argument when provided', () => {
      expect(host.formatDate(date, 'YYYY-MM-DD', 'Etc/UTC')).to.equal('2024-04-12');
      expect(host.formatDateTime(date, 'YYYY-MM-DD HH:mm', 'Etc/UTC')).to.equal('2024-04-12 10:30');
    });

    test('falls back to the configured Nuxeo.UI dateFormat / dateTimeFormat', () => {
      config.set('dateFormat', 'YYYY-MM-DD');
      config.set('dateTimeFormat', 'YYYY-MM-DD HH:mm');
      config.set('timezone', 'Etc/UTC');
      expect(host.formatDate(date)).to.equal('2024-04-12');
      expect(host.formatDateTime(date)).to.equal('2024-04-12 10:30');
    });

    test('supports the special "relative" format', () => {
      const result = host.formatDate(date, 'relative', 'Etc/UTC');
      expect(result).to.be.a('string');
      expect(result.length).to.be.greaterThan(0);
    });
  });

  suite('formatMimeType / formatRendition', () => {
    test('returns undefined for empty input', () => {
      expect(host.formatMimeType('')).to.be.undefined;
      expect(host.formatRendition()).to.be.undefined;
    });

    test('looks up the i18n key under the documented namespace', () => {
      window.nuxeo.I18n.en['mimetype.application/pdf'] = 'PDF document';
      window.nuxeo.I18n.en['exportButton.pdf'] = 'Export as PDF';
      expect(host.formatMimeType('application/pdf')).to.equal('PDF document');
      expect(host.formatRendition('pdf')).to.equal('Export as PDF');
    });
  });

  suite('formatVersion', () => {
    test('returns "" when the document or required properties are missing', () => {
      expect(host.formatVersion()).to.equal('');
      expect(host.formatVersion(null)).to.equal('');
      expect(host.formatVersion({})).to.equal('');
      expect(host.formatVersion({ properties: {} })).to.equal('');
      expect(host.formatVersion({ properties: { 'uid:major_version': 1 } })).to.equal('');
    });

    test('joins major and minor with a dot', () => {
      expect(
        host.formatVersion({
          properties: { 'uid:major_version': 3, 'uid:minor_version': 2 },
        }),
      ).to.equal('3.2');
      expect(
        host.formatVersion({
          properties: { 'uid:major_version': 0, 'uid:minor_version': 0 },
        }),
      ).to.equal('0.0');
    });
  });

  suite('formatDirectory', () => {
    test('returns the raw value when it is not a directory entry', () => {
      expect(host.formatDirectory('plain')).to.equal('plain');
      expect(host.formatDirectory({ 'entity-type': 'document' })).to.deep.equal({ 'entity-type': 'document' });
    });

    test('uses the localized label_<lang> when available', () => {
      window.nuxeo.I18n.language = 'fr';
      const entry = {
        'entity-type': 'directoryEntry',
        properties: { id: 'a', label_fr: 'France', label_en: 'England' },
      };
      expect(host.formatDirectory(entry)).to.equal('France');
    });

    test('joins the parent chain using the given separator', () => {
      window.nuxeo.I18n.language = 'en';
      const entry = {
        'entity-type': 'directoryEntry',
        properties: {
          id: 'leaf',
          label_en: 'Leaf',
          parent: {
            'entity-type': 'directoryEntry',
            properties: { id: 'mid', label_en: 'Middle', parent: undefined },
          },
        },
      };
      expect(host.formatDirectory(entry)).to.equal('Middle/Leaf');
      expect(host.formatDirectory(entry, ' > ')).to.equal('Middle > Leaf');
    });

    test('falls back to label, label_en or id when the localized field is missing', () => {
      window.nuxeo.I18n.language = 'fr';
      const fallbackToLabel = {
        'entity-type': 'directoryEntry',
        properties: { id: 'a', label: 'Generic' },
      };
      expect(host.formatDirectory(fallbackToLabel)).to.equal('Generic');
    });
  });

  suite('formatDocType / formatPermission / formatLifecycleState', () => {
    setup(() => {
      window.nuxeo.I18n.en['label.document.type.file'] = 'File';
      window.nuxeo.I18n.en['label.security.permission.read'] = 'Read access';
      window.nuxeo.I18n.en['label.ui.state.project'] = 'Project';
    });

    test('formatDocType returns undefined when no type is provided', () => {
      expect(host.formatDocType()).to.be.undefined;
      expect(host.formatDocType(null)).to.be.undefined;
    });

    test('formatDocType lowercases the type before lookup', () => {
      expect(host.formatDocType('File')).to.equal('File');
      expect(host.formatDocType('FILE')).to.equal('File');
    });

    test('formatPermission returns undefined when permission is empty', () => {
      expect(host.formatPermission()).to.be.undefined;
      expect(host.formatPermission('')).to.be.undefined;
    });

    test('formatPermission lowercases only the first character before lookup', () => {
      expect(host.formatPermission('Read')).to.equal('Read access');
    });

    test('formatPermission falls back to the raw key when no translation exists', () => {
      expect(host.formatPermission('Unknown')).to.equal('unknown');
    });

    test('formatLifecycleState returns the translation or the raw key on miss', () => {
      expect(host.formatLifecycleState('project')).to.equal('Project');
      expect(host.formatLifecycleState('archived')).to.equal('archived');
    });
  });

  suite('formatFulltext / formatPropertyXpath / escape helpers', () => {
    test('formatFulltext replaces dashes with spaces', () => {
      expect(host.formatFulltext('a-b-c')).to.equal('a b c');
      expect(host.formatFulltext('plain')).to.equal('plain');
    });

    test('formatPropertyXpath defaults to / -> . and accepts a custom regex', () => {
      expect(host.formatPropertyXpath('a/b/c')).to.equal('a.b.c');
      expect(host.formatPropertyXpath('a:b/c', /[:/]/g)).to.equal('a.b.c');
    });

    test('escapeRegExp escapes the documented metacharacters', () => {
      expect(host.escapeRegExp('a.b*c+(d)')).to.equal('a\\.b\\*c\\+\\(d\\)');
      expect(host.escapeRegExp('')).to.equal('');
      expect(host.escapeRegExp(undefined)).to.be.undefined;
    });

    test('escapeNxqlStringLiteral escapes single/double quotes and backslashes', () => {
      expect(host.escapeNxqlStringLiteral(`O'Neill`)).to.equal(`O\\'Neill`);
      expect(host.escapeNxqlStringLiteral(`a"b`)).to.equal(`a\\"b`);
      expect(host.escapeNxqlStringLiteral(`a\\b`)).to.equal(`a\\\\b`);
      expect(host.escapeNxqlStringLiteral('')).to.equal('');
      expect(host.escapeNxqlStringLiteral(undefined)).to.be.undefined;
    });
  });

  suite('_languageCode', () => {
    test('returns the prefix of the configured language code', () => {
      window.nuxeo.I18n.language = 'fr-FR';
      expect(host._languageCode()).to.equal('fr');
    });

    test('falls back to "en" when no language is configured', () => {
      window.nuxeo.I18n.language = '';
      expect(host._languageCode()).to.equal('en');
    });
  });
});
