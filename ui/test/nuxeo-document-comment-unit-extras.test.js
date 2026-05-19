/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-document-comments/nuxeo-document-comment.js';

suite('nuxeo-document-comment unit extras', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-document-comment
        .comment="${{
          id: 'c1',
          text: 'Hello world',
          author: 'jdoe',
          creationDate: '2024-01-01T00:00:00Z',
          numberOfReplies: 0,
        }}"
      ></nuxeo-document-comment>
    `);
  });

  suite('_isBlank', () => {
    test('returns true for null', () => {
      expect(el._isBlank(null)).to.be.true;
    });

    test('returns true for empty string', () => {
      expect(el._isBlank('')).to.be.true;
    });

    test('returns true for whitespace only', () => {
      expect(el._isBlank('   ')).to.be.true;
    });

    test('returns false for text', () => {
      expect(el._isBlank('hello')).to.be.false;
    });

    test('returns true for non-string', () => {
      expect(el._isBlank(123)).to.be.true;
    });
  });

  suite('_isRootElement', () => {
    test('returns true for level 1', () => {
      expect(el._isRootElement(1)).to.be.true;
    });

    test('returns false for level 2', () => {
      expect(el._isRootElement(2)).to.be.false;
    });
  });

  suite('_isSummaryVisible', () => {
    test('returns true when not expanded and has replies', () => {
      expect(el._isSummaryVisible(false, 3)).to.be.true;
    });

    test('returns false when expanded', () => {
      expect(el._isSummaryVisible(true, 3)).to.be.false;
    });

    test('returns false when no replies', () => {
      expect(el._isSummaryVisible(false, 0)).to.be.false;
    });
  });

  suite('_computeTextToDisplay', () => {
    test('returns full text when not truncated', () => {
      expect(el._computeTextToDisplay('Hello', 256, false)).to.equal('Hello');
    });

    test('truncates text when flag is true', () => {
      const longText = 'A'.repeat(300);
      const result = el._computeTextToDisplay(longText, 256, true);
      expect(result.length).to.be.below(300);
      expect(result.endsWith('…')).to.be.true;
    });
  });

  suite('_computeTruncatedFlag', () => {
    test('returns true for long text', () => {
      const longText = 'A'.repeat(300);
      expect(el._computeTruncatedFlag(false, longText, 256)).to.be.true;
    });

    test('returns false for short text', () => {
      expect(el._computeTruncatedFlag(false, 'Hello', 256)).to.be.false;
    });

    test('returns false when showFull is true', () => {
      const longText = 'A'.repeat(300);
      expect(el._computeTruncatedFlag(true, longText, 256)).to.be.false;
    });

    test('returns false when text is null', () => {
      expect(el._computeTruncatedFlag(false, null, 256)).to.be.false;
    });

    test('returns false when text is number', () => {
      expect(el._computeTruncatedFlag(false, 123, 256)).to.be.false;
    });
  });

  suite('_computeAvatarDimensions', () => {
    test('returns 24 for root level', () => {
      expect(el._computeAvatarDimensions(1)).to.equal(24);
    });

    test('returns 20 for sub-level', () => {
      expect(el._computeAvatarDimensions(2)).to.equal(20);
    });
  });

  suite('_computeAvatarFontSize', () => {
    test('returns 13 for root level', () => {
      expect(el._computeAvatarFontSize(1)).to.equal(13);
    });

    test('returns 11 for sub-level', () => {
      expect(el._computeAvatarFontSize(2)).to.equal(11);
    });
  });

  suite('_computeSubLevel', () => {
    test('returns level + 1', () => {
      expect(el._computeSubLevel(1)).to.equal(2);
      expect(el._computeSubLevel(3)).to.equal(4);
    });
  });

  suite('_computeTextLabel', () => {
    test('returns comment variant for level 1', () => {
      const result = el._computeTextLabel(1, 'placeholder');
      expect(result).to.be.a('string');
    });

    test('returns reply variant for level 2', () => {
      const result = el._computeTextLabel(2, 'placeholder');
      expect(result).to.be.a('string');
    });
  });

  suite('_computeConfirmationLabel', () => {
    test('returns withReplies for replies > 0', () => {
      const result = el._computeConfirmationLabel(3);
      expect(result).to.be.a('string');
    });

    test('returns withoutReplies for 0', () => {
      const result = el._computeConfirmationLabel(0);
      expect(result).to.be.a('string');
    });
  });

  suite('_computeDisabledClass', () => {
    test('returns disabled when submitting', () => {
      expect(el._computeDisabledClass(true)).to.equal('disabled');
    });

    test('returns empty when not submitting', () => {
      expect(el._computeDisabledClass(false)).to.equal('');
    });
  });

  suite('_areExtendedOptionsAvailable', () => {
    test('returns true for author match', () => {
      const user = { properties: { username: 'jdoe' } };
      expect(el._areExtendedOptionsAvailable('jdoe', user)).to.be.true;
    });

    test('returns true for admin', () => {
      const user = { isAdministrator: true };
      expect(el._areExtendedOptionsAvailable('other', user)).to.be.true;
    });

    test('returns false for different user', () => {
      const user = { properties: { username: 'other' }, isAdministrator: false };
      expect(el._areExtendedOptionsAvailable('jdoe', user)).to.be.false;
    });

    test('returns false for null user', () => {
      expect(el._areExtendedOptionsAvailable('jdoe', null)).to.not.be.ok;
    });
  });

  suite('_computeDateLabel', () => {
    test('returns formatted date for creation', () => {
      const item = { creationDate: '2024-01-01T00:00:00Z' };
      const result = el._computeDateLabel(item, 'creationDate');
      expect(result).to.be.a('string');
    });

    test('returns lastReply label', () => {
      const item = {
        creationDate: '2024-01-01T00:00:00Z',
        lastReplyDate: '2024-06-01T00:00:00Z',
      };
      const result = el._computeDateLabel(item, 'lastReplyDate');
      expect(result).to.be.a('string');
    });

    test('returns edited label for modified items', () => {
      const item = {
        creationDate: '2024-01-01T00:00:00Z',
        modificationDate: '2024-02-01T00:00:00Z',
      };
      const result = el._computeDateLabel(item, 'creationDate');
      expect(result).to.be.a('string');
    });

    test('returns undefined for null item', () => {
      expect(el._computeDateLabel(null, 'creationDate')).to.be.undefined;
    });
  });

  suite('_checkForEnter', () => {
    test('does nothing for non-enter key', () => {
      el._checkForEnter({ keyCode: 65, ctrlKey: true });
    });

    test('does nothing for enter without ctrl', () => {
      el._checkForEnter({ keyCode: 13, ctrlKey: false });
    });

    test('does nothing for blank text', () => {
      el.comment = { text: '   ' };
      el._checkForEnter({ keyCode: 13, ctrlKey: true });
    });
  });

  suite('_submitOnEnter', () => {
    test('does nothing for non-enter key', () => {
      el._submitOnEnter({ key: 'a' });
    });
  });

  suite('_cancelOnEnter', () => {
    test('does nothing for non-enter key', () => {
      el._cancelOnEnter({ key: 'a' });
    });
  });

  suite('_handleKey', () => {
    test('does nothing for non-enter/space', () => {
      el._handleKey({ key: 'a', preventDefault: sinon.stub() });
    });
  });

  suite('_handleRepliesChange', () => {
    test('collapses when 0 replies', () => {
      el.comment = { expanded: true, numberOfReplies: 3 };
      const evt = new CustomEvent('number-of-replies', {
        detail: { total: 0 },
      });
      evt.stopPropagation = sinon.stub();
      el._handleRepliesChange(evt);
    });

    test('updates numberOfReplies', () => {
      el.comment = { numberOfReplies: 0 };
      const evt = new CustomEvent('number-of-replies', {
        detail: { total: 5 },
      });
      evt.stopPropagation = sinon.stub();
      el._handleRepliesChange(evt);
    });
  });
});
