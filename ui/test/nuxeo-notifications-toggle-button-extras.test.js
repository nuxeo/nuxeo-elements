/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-notifications-toggle-button.js';

suite('nuxeo-notifications-toggle-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-notifications-toggle-button></nuxeo-notifications-toggle-button>
      `,
    );
  });

  suite('_isAvailable', () => {
    test('returns truthy for non-version doc', () => {
      expect(el._isAvailable({ uid: '1', isVersion: false })).to.be.ok;
    });

    test('returns falsy for version doc', () => {
      expect(el._isAvailable({ uid: '1', isVersion: true })).to.not.be.ok;
    });

    test('returns falsy for null', () => {
      expect(el._isAvailable(null)).to.not.be.ok;
    });
  });

  suite('_computeLabel', () => {
    test('returns doNotNotify label when subscribed', () => {
      const result = el._computeLabel(true);
      expect(result).to.be.a('string');
    });

    test('returns notify label when not subscribed', () => {
      const result = el._computeLabel(false);
      expect(result).to.be.a('string');
    });
  });

  suite('_documentChanged', () => {
    test('sets subscribed from doc', () => {
      el.document = {
        contextParameters: {
          subscribedNotifications: ['Creation'],
        },
      };
      el._documentChanged();
    });

    test('handles doc without contextParameters', () => {
      el.document = {};
      el._documentChanged();
    });
  });

  suite('documentUnsubscribedHandler', () => {
    test('unsets subscribed on matching uid', () => {
      el.document = { uid: 'doc1' };
      el.subscribed = true;
      const event = new CustomEvent('document-unsubscribed', {
        detail: { docUid: 'doc1' },
      });
      window.dispatchEvent(event);
    });

    test('ignores non-matching uid', () => {
      el.document = { uid: 'doc1' };
      el.subscribed = true;
      const event = new CustomEvent('document-unsubscribed', {
        detail: { docUid: 'doc2' },
      });
      window.dispatchEvent(event);
    });

    test('ignores when no document set', () => {
      el.document = null;
      const event = new CustomEvent('document-unsubscribed', {
        detail: { docUid: 'doc1' },
      });
      window.dispatchEvent(event);
    });
  });
});
