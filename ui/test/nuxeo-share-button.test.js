/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
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

  suite('copy link control accessibility', () => {
    test('is a button that keyboard users can reach', () => {
      const button = el.$.permalinkIcon;
      expect(button.tagName).to.equal('PAPER-ICON-BUTTON');
      expect(button.getAttribute('role')).to.equal('button');
      expect(button.tabIndex).to.equal(0);
    });

    test('exposes an accessible name', () => {
      expect(el.$.permalinkIcon.getAttribute('aria-label')).to.equal(el.i18n('shareButton.operation.copy'));
    });

    test('has a polite live region for the copy confirmation', () => {
      const status = el.$.copyStatus;
      expect(status.getAttribute('role')).to.equal('status');
      expect(status.getAttribute('aria-live')).to.equal('polite');
    });
  });

  suite('_copyLink', () => {
    let execCommand;

    teardown(() => {
      if (execCommand) {
        execCommand.restore();
        execCommand = null;
      }
    });

    test('announces the confirmation when the copy succeeds', () => {
      execCommand = sinon.stub(window.document, 'execCommand').returns(true);
      el._copyLink();
      expect(el._copyStatus).to.equal(el.i18n('shareButton.operation.copied'));
      expect(el.$.permalinkIcon.icon).to.equal('check');
    });

    test('stays silent when the copy command fails', () => {
      execCommand = sinon.stub(window.document, 'execCommand').returns(false);
      el._copyLink();
      expect(el._copyStatus).to.equal('');
      expect(el.$.permalinkIcon.icon).to.equal('link');
    });

    test('hands focus back to the button when activated from the keyboard', () => {
      execCommand = sinon.stub(window.document, 'execCommand').returns(true);
      const focus = sinon.spy(el.$.permalinkIcon, 'focus');
      // Clicks synthesized from Enter/Space carry a detail of 0.
      el._copyLink({ detail: 0 });
      expect(focus.called).to.be.true;
      focus.restore();
    });

    test('leaves focus alone when activated with a pointer', () => {
      execCommand = sinon.stub(window.document, 'execCommand').returns(true);
      const focus = sinon.spy(el.$.permalinkIcon, 'focus');
      el._copyLink({ detail: 1 });
      expect(focus.called).to.be.false;
      focus.restore();
    });

    test('ignores a repeat activation while the confirmation is showing', () => {
      execCommand = sinon.stub(window.document, 'execCommand').returns(true);
      el._copyLink({ detail: 0 });
      el._copyLink({ detail: 0 });
      expect(execCommand.callCount).to.equal(1);
    });
  });
});
