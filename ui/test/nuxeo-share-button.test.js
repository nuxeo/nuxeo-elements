/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../actions/nuxeo-share-button.js';

suite('nuxeo-share-button extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-share-button></nuxeo-share-button>
      `,
    );
  });

  suite('_isAvailable', () => {
    test('returns truthy when doc exists', () => {
      expect(el._isAvailable({ uid: '1' })).to.be.ok;
    });

    test('returns falsy for null doc', () => {
      expect(el._isAvailable(null)).to.not.be.ok;
    });

    test('returns falsy for undefined doc', () => {
      expect(el._isAvailable(undefined)).to.not.be.ok;
    });
  });

  suite('_buildPermalink', () => {
    test('builds permalink for document', () => {
      const result = el._buildPermalink({ uid: 'doc1' });
      expect(result).to.include('#!/doc/doc1');
    });

    test('returns empty string for null document', () => {
      expect(el._buildPermalink(null)).to.equal('');
    });
  });

  suite('_copyLink', () => {
    let icon;
    let nativeInput;
    let execCommand;
    let clock;
    let notifications;

    setup(async () => {
      el.document = { uid: 'doc1' };
      await flush();
      icon = el.$.permalinkIcon;
      nativeInput = el.$.permalink.$.paperInput.$.nativeInput;
      notifications = [];
      el.addEventListener('notify', (e) => notifications.push(e.detail));
      execCommand = sinon.stub(window.document, 'execCommand');
      // Installed after the fixture has settled so the element's own startup timers run for real.
      clock = sinon.useFakeTimers();
    });

    teardown(() => {
      clock.restore();
      execCommand.restore();
    });

    test('selects the permalink and marks the icon as copied', () => {
      execCommand.returns(true);

      el._copyLink({ currentTarget: icon });

      expect(nativeInput.value).to.contain('#!/doc/doc1');
      expect(nativeInput.selectionStart).to.equal(0);
      expect(nativeInput.selectionEnd).to.equal(nativeInput.value.length);
      expect(icon.icon).to.equal('check');
      expect(icon.classList.contains('selected')).to.be.true;
    });

    test('notifies that the link was copied', () => {
      execCommand.returns(true);

      el._copyLink({ currentTarget: icon });

      expect(notifications).to.deep.equal([{ message: el.i18n('shareButton.operation.copied'), duration: 2000 }]);
    });

    test('clears the selection and restores the icon after 2 seconds', () => {
      execCommand.returns(true);

      el._copyLink({ currentTarget: icon });
      expect(icon.icon).to.equal('check');

      clock.tick(2000);

      expect(icon.icon).to.equal('link');
      expect(icon.classList.contains('selected')).to.be.false;
      expect(nativeInput.selectionStart).to.equal(0);
      expect(nativeInput.selectionEnd).to.equal(0);
    });

    test('reports nothing when the copy command fails', () => {
      execCommand.returns(false);

      el._copyLink({ currentTarget: icon });

      expect(icon.icon).to.equal('link');
      expect(icon.classList.contains('selected')).to.be.false;
      expect(notifications).to.be.empty;

      // No revert was scheduled either, so the icon stays put.
      clock.tick(2000);
      expect(icon.icon).to.equal('link');
    });
  });
});
