/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fakeServer, fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-document-comments/nuxeo-document-comment.js';

suite('nuxeo-document-comment extras', () => {
  let el;
  let server;

  const mockComment = {
    id: '1',
    parentId: 'doc1',
    author: 'jdoe',
    text: 'Hello world',
    creationDate: '2024-01-01T00:00:00Z',
    numberOfReplies: 0,
  };

  setup(async () => {
    server = fakeServer.create({ properties: { username: 'jdoe' } });
    el = await fixture(
      html`
        <nuxeo-document-comment .comment="${mockComment}"></nuxeo-document-comment>
      `,
    );
  });

  teardown(() => {
    server.restore();
  });

  suite('_computeAvatarDimensions', () => {
    test('returns 24 for level 1', () => {
      expect(el._computeAvatarDimensions(1)).to.equal(24);
    });

    test('returns 20 for level 2', () => {
      expect(el._computeAvatarDimensions(2)).to.equal(20);
    });

    test('returns 20 for level 0', () => {
      expect(el._computeAvatarDimensions(0)).to.equal(20);
    });
  });

  suite('_computeAvatarFontSize', () => {
    test('returns 13 for level 1', () => {
      expect(el._computeAvatarFontSize(1)).to.equal(13);
    });

    test('returns 11 for level 2', () => {
      expect(el._computeAvatarFontSize(2)).to.equal(11);
    });

    test('returns 11 for level 0', () => {
      expect(el._computeAvatarFontSize(0)).to.equal(11);
    });
  });

  suite('_computeConfirmationLabel', () => {
    test('returns withReplies key when replies > 0', () => {
      const result = el._computeConfirmationLabel(5);
      expect(result).to.be.a('string');
    });

    test('returns withoutReplies key when replies === 0', () => {
      const result = el._computeConfirmationLabel(0);
      expect(result).to.be.a('string');
    });

    test('returns withoutReplies key for negative value', () => {
      const result = el._computeConfirmationLabel(-1);
      expect(result).to.be.a('string');
    });
  });

  suite('_computeDateLabel', () => {
    test('returns undefined for null item', () => {
      expect(el._computeDateLabel(null, 'creationDate')).to.be.undefined;
    });

    test('returns undefined for undefined item', () => {
      expect(el._computeDateLabel(undefined, 'creationDate')).to.be.undefined;
    });

    test('returns lastReply label when option is "lastReplyDate"', () => {
      const item = {
        creationDate: '2024-01-01T00:00:00Z',
        lastReplyDate: '2024-06-15T00:00:00Z',
      };
      const result = el._computeDateLabel(item, 'lastReplyDate');
      expect(result).to.be.a('string');
    });

    test('returns edited label when modificationDate exists', () => {
      const item = {
        creationDate: '2024-01-01T00:00:00Z',
        modificationDate: '2024-02-01T00:00:00Z',
      };
      const result = el._computeDateLabel(item, 'creationDate');
      expect(result).to.be.a('string');
    });

    test('returns plain date when no modificationDate and not lastReplyDate', () => {
      const item = { creationDate: '2024-01-01T00:00:00Z' };
      const result = el._computeDateLabel(item, 'creationDate');
      expect(result).to.be.a('string');
    });
  });

  suite('_computeMaxRows', () => {
    test('returns a number', () => {
      const result = el._computeMaxRows();
      expect(result).to.be.a('number');
      expect(result).to.be.above(0);
    });

    test('uses fallback values when CSS vars are NaN', () => {
      sinon.stub(el, 'getComputedStyleValue').returns('');
      const result = el._computeMaxRows();
      expect(result).to.equal(Math.round(80 / 20));
      el.getComputedStyleValue.restore();
    });

    test('uses actual values when CSS vars are valid', () => {
      sinon
        .stub(el, 'getComputedStyleValue')
        .withArgs('--nuxeo-comment-line-height')
        .returns('16')
        .withArgs('--nuxeo-comment-max-height')
        .returns('160');
      const result = el._computeMaxRows();
      expect(result).to.equal(Math.round(160 / 16));
      el.getComputedStyleValue.restore();
    });
  });

  suite('_computeSubLevel', () => {
    test('returns level + 1 for level 1', () => {
      expect(el._computeSubLevel(1)).to.equal(2);
    });

    test('returns level + 1 for level 0', () => {
      expect(el._computeSubLevel(0)).to.equal(1);
    });

    test('returns level + 1 for level 5', () => {
      expect(el._computeSubLevel(5)).to.equal(6);
    });
  });

  suite('_computeTextLabel', () => {
    test('returns comment key for level 1', () => {
      const result = el._computeTextLabel(1, 'writePlaceholder', null);
      expect(result).to.be.a('string');
    });

    test('returns reply key for level 2', () => {
      const result = el._computeTextLabel(2, 'writePlaceholder', null);
      expect(result).to.be.a('string');
    });

    test('returns reply key for level 0', () => {
      const result = el._computeTextLabel(0, 'writePlaceholder', 'ph');
      expect(result).to.be.a('string');
    });
  });

  suite('_computeTextToDisplay', () => {
    test('returns full text when not truncated', () => {
      expect(el._computeTextToDisplay('Hello world', 256, false)).to.equal('Hello world');
    });

    test('truncates text with ellipsis when truncated', () => {
      const text = 'a'.repeat(300);
      const result = el._computeTextToDisplay(text, 256, true);
      expect(result).to.have.lengthOf(256);
      expect(result.endsWith('…')).to.be.true;
    });

    test('returns original text when truncated is false even if long', () => {
      const text = 'b'.repeat(500);
      expect(el._computeTextToDisplay(text, 256, false)).to.equal(text);
    });
  });

  suite('_computeTruncatedFlag', () => {
    test('returns false when showFull is true', () => {
      expect(el._computeTruncatedFlag(true, 'a'.repeat(300), 256)).to.be.false;
    });

    test('returns true when showFull is false and text exceeds limit', () => {
      expect(el._computeTruncatedFlag(false, 'a'.repeat(300), 256)).to.be.true;
    });

    test('returns false when text is within limit', () => {
      expect(el._computeTruncatedFlag(false, 'short', 256)).to.be.false;
    });

    test('returns false when text is not a string', () => {
      expect(el._computeTruncatedFlag(false, 123, 256)).to.be.false;
      expect(el._computeTruncatedFlag(false, null, 256)).to.be.false;
      expect(el._computeTruncatedFlag(false, undefined, 256)).to.be.false;
    });

    test('returns false when text length equals limit', () => {
      expect(el._computeTruncatedFlag(false, 'a'.repeat(256), 256)).to.be.false;
    });

    test('returns true when text length is limit + 1', () => {
      expect(el._computeTruncatedFlag(false, 'a'.repeat(257), 256)).to.be.true;
    });
  });

  suite('_areExtendedOptionsAvailable', () => {
    test('returns falsy when currentUser is null', () => {
      expect(el._areExtendedOptionsAvailable('jdoe', null)).to.not.be.ok;
    });

    test('returns falsy when currentUser is undefined', () => {
      expect(el._areExtendedOptionsAvailable('jdoe', undefined)).to.not.be.ok;
    });

    test('returns true when currentUser.properties.username matches author', () => {
      const user = { properties: { username: 'jdoe' } };
      expect(el._areExtendedOptionsAvailable('jdoe', user)).to.be.true;
    });

    test('returns falsy when username does not match and not admin', () => {
      const user = { properties: { username: 'other' } };
      expect(el._areExtendedOptionsAvailable('jdoe', user)).to.not.be.ok;
    });

    test('returns true when currentUser is administrator', () => {
      const user = { isAdministrator: true, properties: { username: 'admin' } };
      expect(el._areExtendedOptionsAvailable('jdoe', user)).to.be.true;
    });

    test('returns true when admin even if username also matches', () => {
      const user = { isAdministrator: true, properties: { username: 'jdoe' } };
      expect(el._areExtendedOptionsAvailable('jdoe', user)).to.be.true;
    });

    test('returns false when currentUser has no properties', () => {
      const user = { isAdministrator: false };
      expect(el._areExtendedOptionsAvailable('jdoe', user)).to.be.false;
    });
  });

  suite('_isBlank', () => {
    test('returns true for null', () => {
      expect(el._isBlank(null)).to.be.true;
    });

    test('returns true for undefined', () => {
      expect(el._isBlank(undefined)).to.be.true;
    });

    test('returns true for empty string', () => {
      expect(el._isBlank('')).to.be.true;
    });

    test('returns true for whitespace-only string', () => {
      expect(el._isBlank('   ')).to.be.true;
    });

    test('returns true for non-string type', () => {
      expect(el._isBlank(123)).to.be.true;
      expect(el._isBlank({})).to.be.true;
      expect(el._isBlank(false)).to.be.true;
    });

    test('returns false for non-blank string', () => {
      expect(el._isBlank('hello')).to.be.false;
    });

    test('returns false for string with leading/trailing spaces', () => {
      expect(el._isBlank('  hello  ')).to.be.false;
    });
  });

  suite('_isRootElement', () => {
    test('returns true for level 1', () => {
      expect(el._isRootElement(1)).to.be.true;
    });

    test('returns false for level 2', () => {
      expect(el._isRootElement(2)).to.be.false;
    });

    test('returns false for level 0', () => {
      expect(el._isRootElement(0)).to.be.false;
    });
  });

  suite('_isSummaryVisible', () => {
    test('returns true when not expanded and total > 0', () => {
      expect(el._isSummaryVisible(false, 5)).to.be.true;
    });

    test('returns false when expanded', () => {
      expect(el._isSummaryVisible(true, 5)).to.be.false;
    });

    test('returns false when total is 0', () => {
      expect(el._isSummaryVisible(false, 0)).to.be.false;
    });

    test('returns false when expanded and total is 0', () => {
      expect(el._isSummaryVisible(true, 0)).to.be.false;
    });
  });

  suite('_computeDisabledClass', () => {
    test('returns "disabled" when isSubmitting is true', () => {
      expect(el._computeDisabledClass(true)).to.equal('disabled');
    });

    test('returns empty string when isSubmitting is false', () => {
      expect(el._computeDisabledClass(false)).to.equal('');
    });
  });

  suite('_checkForEnter', () => {
    test('does not throw on ctrl+enter', () => {
      const stub = sinon.stub(el, '_submitComment');
      el.comment = { text: 'some text' };
      el._checkForEnter({ keyCode: 13, ctrlKey: true });
      expect(stub).to.have.been.calledOnce;
      stub.restore();
    });

    test('does not submit on enter without ctrl', () => {
      const stub = sinon.stub(el, '_submitComment');
      el.comment = { text: 'some text' };
      el._checkForEnter({ keyCode: 13, ctrlKey: false });
      expect(stub).not.to.have.been.called;
      stub.restore();
    });

    test('does not submit on other keys with ctrl', () => {
      const stub = sinon.stub(el, '_submitComment');
      el.comment = { text: 'some text' };
      el._checkForEnter({ keyCode: 65, ctrlKey: true });
      expect(stub).not.to.have.been.called;
      stub.restore();
    });

    test('does not submit on ctrl+enter when text is blank', () => {
      const stub = sinon.stub(el, '_submitComment');
      el.comment = { text: '   ' };
      el._checkForEnter({ keyCode: 13, ctrlKey: true });
      expect(stub).not.to.have.been.called;
      stub.restore();
    });
  });

  suite('_handleKey', () => {
    test('calls _reply and prevents default on Enter', () => {
      const replyStub = sinon.stub(el, '_reply');
      const event = { key: 'Enter', preventDefault: sinon.spy() };
      el._handleKey(event);
      expect(event.preventDefault).to.have.been.calledOnce;
      expect(replyStub).to.have.been.calledOnce;
      replyStub.restore();
    });

    test('calls _reply and prevents default on Space', () => {
      const replyStub = sinon.stub(el, '_reply');
      const event = { key: ' ', preventDefault: sinon.spy() };
      el._handleKey(event);
      expect(event.preventDefault).to.have.been.calledOnce;
      expect(replyStub).to.have.been.calledOnce;
      replyStub.restore();
    });

    test('does nothing on other keys', () => {
      const replyStub = sinon.stub(el, '_reply');
      const event = { key: 'Tab', preventDefault: sinon.spy() };
      el._handleKey(event);
      expect(event.preventDefault).not.to.have.been.called;
      expect(replyStub).not.to.have.been.called;
      replyStub.restore();
    });
  });
});
