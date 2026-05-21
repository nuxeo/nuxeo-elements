/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-document-thumbnail/nuxeo-document-thumbnail.js';

suite('nuxeo-document-thumbnail extras', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-document-thumbnail></nuxeo-document-thumbnail>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.DocumentThumbnail.is).to.equal('nuxeo-document-thumbnail');
  });

  test('connectedCallback sets dir attribute when missing', () => {
    expect(el.hasAttribute('dir')).to.be.true;
  });

  suite('_thumbnail', () => {
    test('returns empty string when document is missing', () => {
      expect(el._thumbnail(null)).to.equal('');
      expect(el._thumbnail(undefined)).to.equal('');
    });

    test('returns empty string when document has no uid', () => {
      expect(el._thumbnail({})).to.equal('');
    });

    test('returns empty string when contextParameters.thumbnail is missing', () => {
      expect(el._thumbnail({ uid: 'd1' })).to.equal('');
    });

    test('returns the thumbnail URL when valid (no follow-redirect)', () => {
      const doc = {
        uid: 'd1',
        contextParameters: { thumbnail: { url: 'http://example/thumb' } },
      };
      const url = el._thumbnail(doc);
      expect(url).to.include('clientReason=view');
      expect(url).to.include('?clientReason=view');
    });

    test('appends with & when URL already has a query string', () => {
      const doc = {
        uid: 'd1',
        contextParameters: { thumbnail: { url: 'http://example/thumb?foo=bar' } },
      };
      const url = el._thumbnail(doc);
      expect(url).to.include('&clientReason=view');
    });
  });

  suite('_error', () => {
    test('falls back to a base64 png placeholder', () => {
      el._error();
      expect(el.$.img.src).to.include('data:image/png;base64');
    });
  });

  suite('_title', () => {
    test('returns empty string for falsy document', () => {
      expect(el._title(null)).to.equal('');
      expect(el._title({})).to.equal('');
    });

    test('returns an i18n string when document has title', () => {
      const title = el._title({ title: 'My Doc' });
      expect(title).to.be.a('string');
    });
  });

  suite('isFollowRedirectEnabled', () => {
    let originalConfig;

    setup(() => {
      originalConfig = (Nuxeo.UI && Nuxeo.UI.config) || null;
    });

    teardown(() => {
      if (Nuxeo.UI) {
        Nuxeo.UI.config = originalConfig;
      }
    });

    test('returns false when no config is present', () => {
      Nuxeo.UI = Nuxeo.UI || {};
      Nuxeo.UI.config = {};
      expect(el.isFollowRedirectEnabled()).to.be.false;
    });

    test('returns true when config.url.followRedirect is "true"', () => {
      Nuxeo.UI = Nuxeo.UI || {};
      Nuxeo.UI.config = { url: { followRedirect: 'true' } };
      expect(el.isFollowRedirectEnabled()).to.be.true;
    });

    test('returns false when followRedirect is some other value', () => {
      Nuxeo.UI = Nuxeo.UI || {};
      Nuxeo.UI.config = { url: { followRedirect: 'false' } };
      expect(el.isFollowRedirectEnabled()).to.be.false;
    });

    test('respects follow-redirect flag inside _thumbnail', () => {
      Nuxeo.UI = Nuxeo.UI || {};
      Nuxeo.UI.config = { url: { followRedirect: 'true' } };
      const doc = {
        uid: 'd1',
        contextParameters: { thumbnail: { url: 'http://example/thumb' } },
      };
      const url = el._thumbnail(doc);
      expect(url).to.equal('http://example/thumb');
    });
  });
});
