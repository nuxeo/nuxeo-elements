/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fakeServer, fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-document-comments/nuxeo-document-comment-thread.js';

suite('nuxeo-document-comment-thread extras', () => {
  let el;
  let server;

  setup(async () => {
    server = fakeServer.create();
    el = await fixture(
      html`
        <nuxeo-document-comment-thread uid="doc1"></nuxeo-document-comment-thread>
      `,
    );
  });

  teardown(() => {
    server.restore();
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

    test('returns true for non-string type (number)', () => {
      expect(el._isBlank(123)).to.be.true;
    });

    test('returns false for non-blank string', () => {
      expect(el._isBlank('hello')).to.be.false;
    });
  });

  suite('_allowReplies', () => {
    test('returns true for level 1', () => {
      expect(el._allowReplies(1)).to.be.true;
    });

    test('returns true for level 2', () => {
      expect(el._allowReplies(2)).to.be.true;
    });

    test('returns false for level 3', () => {
      expect(el._allowReplies(3)).to.be.false;
    });

    test('returns false for level 10', () => {
      expect(el._allowReplies(10)).to.be.false;
    });
  });

  suite('_moreAvailable', () => {
    test('returns true when length < total and not all loaded', () => {
      expect(el._moreAvailable(5, 10, false)).to.be.true;
    });

    test('returns false when length >= total', () => {
      expect(el._moreAvailable(10, 10, false)).to.be.false;
    });

    test('returns false when allCommentsLoaded is true', () => {
      expect(el._moreAvailable(5, 10, true)).to.be.false;
    });

    test('returns false when length > total', () => {
      expect(el._moreAvailable(15, 10, false)).to.be.false;
    });
  });

  suite('_computeTextLabel', () => {
    test('returns comment key for level 1', () => {
      const result = el._computeTextLabel(1, 'loadAll', 10);
      expect(result).to.be.a('string');
    });

    test('returns reply key for level 2', () => {
      const result = el._computeTextLabel(2, 'loadAll', 5);
      expect(result).to.be.a('string');
    });

    test('returns reply key for level 0', () => {
      const result = el._computeTextLabel(0, 'writePlaceholder', null);
      expect(result).to.be.a('string');
    });
  });

  suite('_computeMaxRows', () => {
    test('returns a positive number', () => {
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
        .returns('18')
        .withArgs('--nuxeo-comment-max-height')
        .returns('144');
      const result = el._computeMaxRows();
      expect(result).to.equal(Math.round(144 / 18));
      el.getComputedStyleValue.restore();
    });
  });

  suite('_checkForEnter', () => {
    test('submits on ctrl+enter with non-blank text', () => {
      const stub = sinon.stub(el, '_submitComment');
      el.text = 'some text';
      el._checkForEnter({ keyCode: 13, ctrlKey: true });
      expect(stub).to.have.been.calledOnce;
      stub.restore();
    });

    test('does not submit on enter without ctrl', () => {
      const stub = sinon.stub(el, '_submitComment');
      el.text = 'text';
      el._checkForEnter({ keyCode: 13, ctrlKey: false });
      expect(stub).not.to.have.been.called;
      stub.restore();
    });

    test('does not submit when text is blank', () => {
      const stub = sinon.stub(el, '_submitComment');
      el.text = '  ';
      el._checkForEnter({ keyCode: 13, ctrlKey: true });
      expect(stub).not.to.have.been.called;
      stub.restore();
    });

    test('does not submit on other keys', () => {
      const stub = sinon.stub(el, '_submitComment');
      el.text = 'text';
      el._checkForEnter({ keyCode: 65, ctrlKey: true });
      expect(stub).not.to.have.been.called;
      stub.restore();
    });
  });

  suite('_clearInput', () => {
    test('resets text to empty string', () => {
      el.text = 'some value';
      el._clearInput();
      expect(el.text).to.equal('');
    });
  });

  suite('_handleDeleteEvent', () => {
    test('removes comment and decrements total', () => {
      el.comments = [{ id: 'c1' }, { id: 'c2' }];
      el._setTotal(2);
      const event = {
        detail: { commentId: 'c1' },
        stopPropagation: sinon.spy(),
      };
      el._handleDeleteEvent(event);
      expect(el.comments).to.have.lengthOf(1);
      expect(el.total).to.equal(1);
      expect(event.stopPropagation).to.have.been.called;
    });

    test('does nothing when comment not found', () => {
      el.comments = [{ id: 'c1' }];
      el._setTotal(1);
      const event = {
        detail: { commentId: 'c99' },
        stopPropagation: sinon.spy(),
      };
      el._handleDeleteEvent(event);
      expect(el.comments).to.have.lengthOf(1);
      expect(el.total).to.equal(1);
    });
  });

  suite('_handleEditEvent', () => {
    test('updates comment text and modificationDate', () => {
      el.comments = [{ id: 'c1', text: 'old', modificationDate: null }];
      const event = {
        detail: { commentId: 'c1', text: 'new', modificationDate: '2024-06-01' },
        stopPropagation: sinon.spy(),
      };
      el._handleEditEvent(event);
      expect(el.comments[0].text).to.equal('new');
      expect(el.comments[0].modificationDate).to.equal('2024-06-01');
      expect(event.stopPropagation).to.have.been.called;
    });

    test('does nothing when comment not found', () => {
      el.comments = [{ id: 'c1', text: 'old' }];
      const event = {
        detail: { commentId: 'c99', text: 'new', modificationDate: 'x' },
        stopPropagation: sinon.spy(),
      };
      el._handleEditEvent(event);
      expect(el.comments[0].text).to.equal('old');
    });
  });

  suite('_handleCommentsChange', () => {
    test('dispatches number-of-replies when path is comments.length', (done) => {
      el.comments = [{ id: '1' }];
      el.addEventListener('number-of-replies', (e) => {
        expect(e.detail.total).to.equal(1);
        done();
      });
      el._handleCommentsChange({ detail: { path: 'comments.length' } });
    });

    test('does nothing when path is not comments.length', () => {
      const spy = sinon.spy();
      el.addEventListener('number-of-replies', spy);
      el._handleCommentsChange({ detail: { path: 'comments.0.text' } });
      expect(spy).not.to.have.been.called;
    });
  });

  suite('_submitComment', () => {
    test('prevents default when event is provided', () => {
      const e = { preventDefault: sinon.spy() };
      el._isSubmitting = true;
      el._submitComment(e);
      expect(e.preventDefault).to.have.been.called;
    });

    test('returns early when already submitting', () => {
      el._isSubmitting = true;
      const spy = sinon.spy(el, '_clearRequest');
      el._submitComment();
      expect(spy).not.to.have.been.called;
      spy.restore();
    });
  });
});
