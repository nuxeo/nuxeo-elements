/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

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
import '../nuxeo-document-comments/nuxeo-document-comment.js';
import '../nuxeo-document-comments/nuxeo-document-comment-thread.js';
import {
  fakeServer,
  fixture,
  flush,
  html,
  isElementVisible,
  pressAndReleaseKeyOn,
  tap,
  timePasses,
  waitForEvent,
} from '@nuxeo/testing-helpers';

suite('nuxeo-document-comment-thread', () => {
  let element;
  let server;

  setup(async () => {
    server = fakeServer.create();
    server.respondWith('get', '/api/v1/id/doc-id/@comment/', {
      'entity-type': 'comments',
      entries: [],
      totalSize: 0,
    });
    // Arrange
    element = await fixture(
      html`
        <nuxeo-document-comment-thread uid="doc-id"></nuxeo-document-comment-thread>
      `,
    );
  });

  teardown(() => {
    server.restore();
  });

  suite('Visibility', () => {
    suite('Input Container', () => {
      test('Should display input area when thread level is less than 3', () => {
        expect(isElementVisible(element.root.querySelector('#inputContainer'))).to.be.true;
      });

      test('Should not display input area when thread level is greater than 2', async () => {
        element.set('level', 3);
        await flush();

        expect(isElementVisible(element.root.querySelector('#inputContainer'))).to.be.false;
      });

      test('Should not display edition actions when the input is empty', () => {
        const inputArea = element.shadowRoot.querySelector('.input-area');
        expect(isElementVisible(inputArea.querySelector('[name="submit"]'))).to.be.false;
        expect(isElementVisible(inputArea.querySelector('[name="clear"]'))).to.be.false;
      });

      test('Should not display edition actions when the input is blank', async () => {
        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = '                ';
        await flush();

        expect(isElementVisible(inputArea.querySelector('[name="submit"]'))).to.be.false;
        expect(isElementVisible(inputArea.querySelector('[name="clear"]'))).to.be.false;
      });

      test('Should display edition actions when the input has non-blank content', async () => {
        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'This is my new comment';
        await flush();

        expect(isElementVisible(inputArea.querySelector('[name="submit"]'))).to.be.true;
        expect(isElementVisible(inputArea.querySelector('[name="clear"]'))).to.be.true;
      });
    });

    suite('Listing Comments', () => {
      test('Should request comments with author and repliesSummary fetch headers', async () => {
        element._refresh();
        await flush();

        const request = server.getLastRequest('get', '/api/v1/id/doc-id/@comment/');
        expect(request).to.exist;
        expect(request.headers['fetch-comment']).to.equal('repliesSummary,author');
      });

      test('Should not display any comment when thread has an empty array of comments', () => {
        expect(element.shadowRoot.querySelectorAll('nuxeo-document-comment').length).to.equal(0);
      });

      test('Should display all the comments when less than 10 comments are returned from server', async () => {
        const comment = {
          'entity-type': 'comment',
          parentId: 'doc-id',
          id: 'comment-id',
          numberOfReplies: 0,
          author: 'John Doe',
          creationDate: '2019-12-09',
          text: 'This is my testing comment',
        };

        server.respondWith('get', '/api/v1/id/doc-id/@comment/', {
          'entity-type': 'comments',
          entries: Array(4).fill(comment),
          totalSize: 4,
        });

        element._refresh();
        await flush();

        expect(element.shadowRoot.querySelectorAll('nuxeo-document-comment').length).to.equal(4);
      });

      test('Should not display "load more" link when less than 10 comments are returned from server', async () => {
        const comment = {
          'entity-type': 'comment',
          parentId: 'doc-id',
          id: 'comment-id',
          numberOfReplies: 0,
          author: 'John Doe',
          creationDate: '2019-12-09',
          text: 'This is my testing comment',
        };

        server.respondWith('get', '/api/v1/id/doc-id/@comment/', {
          'entity-type': 'comments',
          entries: Array(4).fill(comment),
          totalSize: 4,
        });

        element._refresh();
        await flush();

        expect(isElementVisible(element.shadowRoot.querySelector('span.more-content'))).to.be.false;
      });

      test('Should display only 10 comments when more than 10 comments are returned from server', async () => {
        const comment = {
          'entity-type': 'comment',
          parentId: 'doc-id',
          id: 'comment-id',
          numberOfReplies: 0,
          author: 'John Doe',
          creationDate: '2019-12-09',
          text: 'This is my testing comment',
        };

        server.respondWith('get', '/api/v1/id/doc-id/@comment/', {
          'entity-type': 'comments',
          entries: Array(10).fill(comment),
          totalSize: 12,
        });

        element._refresh();
        await flush();

        expect(element.shadowRoot.querySelectorAll('nuxeo-document-comment').length).to.equal(10);
      });

      test('Should display "load more" link when more than 10 comments are returned from server', async () => {
        const comment = {
          'entity-type': 'comment',
          parentId: 'doc-id',
          id: 'comment-id',
          numberOfReplies: 0,
          author: 'John Doe',
          creationDate: '2019-12-09',
          text: 'This is my testing comment',
        };

        server.respondWith('get', '/api/v1/id/doc-id/@comment/', {
          'entity-type': 'comments',
          entries: Array(10).fill(comment),
          totalSize: 12,
        });

        element._refresh();
        await flush();

        expect(isElementVisible(element.shadowRoot.querySelector('span.more-content'))).to.be.true;
      });

      suite('Reconciliation', () => {
        // The server returns entries newest first, while the element keeps `comments` oldest first.
        const buildComment = (id, creationDate) => {
          return {
            'entity-type': 'comment',
            parentId: 'doc-id',
            id,
            numberOfReplies: 0,
            author: 'John Doe',
            creationDate,
            text: `This is comment ${id}`,
          };
        };

        const newest = buildComment('comment-id-5', '2019-12-05');
        const newer = buildComment('comment-id-4', '2019-12-04');
        const oldestLoaded = buildComment('comment-id-3', '2019-12-03');
        const older = buildComment('comment-id-2', '2019-12-02');
        const oldest = buildComment('comment-id-1', '2019-12-01');

        const respondWith = (entries, totalSize) => {
          server.respondWith('get', '/api/v1/id/doc-id/@comment/', {
            'entity-type': 'comments',
            entries,
            totalSize,
          });
        };

        const loadedIds = () => element.comments.map((entry) => entry.id);

        test('Should prepend every entry, oldest first, when no comment is loaded yet', async () => {
          respondWith([newest, newer, oldestLoaded], 3);

          element._refresh();
          await flush();

          expect(loadedIds()).to.deep.equal(['comment-id-3', 'comment-id-4', 'comment-id-5']);
        });

        test('Should only prepend the entries older than the oldest loaded comment', async () => {
          respondWith([newest, newer, oldestLoaded], 5);
          element._refresh();
          await flush();
          expect(loadedIds()).to.deep.equal(['comment-id-3', 'comment-id-4', 'comment-id-5']);

          // "Load all" replays the page already held plus the two older comments.
          respondWith([newest, newer, oldestLoaded, older, oldest], 5);
          element._loadMore();
          await flush();

          expect(loadedIds()).to.deep.equal([
            'comment-id-1',
            'comment-id-2',
            'comment-id-3',
            'comment-id-4',
            'comment-id-5',
          ]);
          expect(element.allCommentsLoaded).to.be.true;
        });

        test('Should not duplicate comments when every entry is already loaded', async () => {
          respondWith([newest, newer, oldestLoaded], 3);
          element._refresh();
          await flush();

          element._loadMore();
          await flush();

          expect(loadedIds()).to.deep.equal(['comment-id-3', 'comment-id-4', 'comment-id-5']);
        });

        test('Should keep an entry sharing the creation date of the oldest loaded comment but not its id', async () => {
          respondWith([oldestLoaded], 2);
          element._refresh();
          await flush();

          respondWith([oldestLoaded, buildComment('comment-id-3-bis', '2019-12-03')], 2);
          element._loadMore();
          await flush();

          expect(loadedIds()).to.deep.equal(['comment-id-3-bis', 'comment-id-3']);
        });

        test('Should not mutate the entries of the server response', async () => {
          element.set('comments', [oldestLoaded]);
          const response = {
            'entity-type': 'comments',
            entries: [newest, newer, oldestLoaded, older],
            totalSize: 4,
          };
          const get = sinon.stub(element.$.commentRequest, 'get').returns(Promise.resolve(response));

          element._fetchComments(true);
          await flush();

          expect(response.entries.map((entry) => entry.id)).to.deep.equal([
            'comment-id-5',
            'comment-id-4',
            'comment-id-3',
            'comment-id-2',
          ]);
          expect(loadedIds()).to.deep.equal(['comment-id-2', 'comment-id-3']);
          get.restore();
        });
      });
    });
  });

  suite('Events', () => {
    const commentOne = {
      'entity-type': 'comment',
      parentId: 'doc-id',
      id: 'comment-id-one',
      numberOfReplies: 0,
      author: 'John Doe',
      creationDate: '2019-12-09',
      text: 'This is my testing comment',
    };

    const commentTwo = {
      'entity-type': 'comment',
      parentId: 'doc-id',
      id: 'comment-id-two',
      numberOfReplies: 0,
      author: 'Mary Poppins',
      creationDate: '2019-12-19',
      text: 'Cool!',
    };

    setup(async () => {
      server.respondWith('get', '/api/v1/id/doc-id/@comment/', {
        'entity-type': 'comments',
        entries: [commentOne, commentTwo],
        totalSize: 2,
      });

      element._refresh();
      await flush();
    });

    test('Should remove comment from list when deletion event is received', async () => {
      const comment = element.shadowRoot.querySelectorAll('nuxeo-document-comment')[0];
      comment.dispatchEvent(
        new CustomEvent('delete-comment', { bubbles: true, composed: true, detail: { commentId: 'comment-id-two' } }),
      );
      await flush();

      const commentList = element.shadowRoot.querySelectorAll('nuxeo-document-comment');
      expect(commentList.length).to.equal(1);
      expect(commentList[0].comment).to.be.deep.equal(commentOne);
    });

    test('Should edit comment from list when edition event is received', async () => {
      const comment = element.shadowRoot.querySelectorAll('nuxeo-document-comment')[0];
      comment.dispatchEvent(
        new CustomEvent('edit-comment', {
          bubbles: true,
          composed: true,
          detail: {
            commentId: 'comment-id-two',
            modificationDate: '2019-12-20',
            text: 'Cool! It is working perfectly',
          },
        }),
      );
      await flush();

      const commentList = element.shadowRoot.querySelectorAll('nuxeo-document-comment');
      expect(commentList.length).to.equal(2);
      const text = commentList[0].shadowRoot.querySelector('.text').firstElementChild.textContent;
      expect(text).to.be.equal('Cool! It is working perfectly');
    });
  });

  suite('Interactions', () => {
    suite('Creating Comments', () => {
      setup(() => {
        server.respondWith('post', '/api/v1/id/doc-id/@comment/');
      });

      test('Should clear the input when clicking on "clear" button', async () => {
        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'This is my new comment';
        await flush();

        tap(inputArea.querySelector('[name="clear"]'));

        expect(inputArea.querySelector('#inputContainer').value).to.equal('');
      });

      test('Should submit the input when clicking on "submit" button', async () => {
        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'I am editing this comment';
        await flush();

        tap(inputArea.querySelector('[name="submit"]'));

        await timePasses();
        const request = server.getLastRequest('post', '/api/v1/id/doc-id/@comment/');

        expect(request).to.exist;
        expect(request.headers['fetch-comment']).to.equal('author');
        expect(request.body).to.deep.equal({
          'entity-type': 'comment',
          parentId: 'doc-id',
          text: 'I am editing this comment',
        });
      });

      test('Should submit the input when pressing "CTRL + Enter" keys', async () => {
        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'I am editing this comment';
        pressAndReleaseKeyOn(inputArea.querySelector('#inputContainer'), 13, ['ctrl']);

        await timePasses();
        const request = server.getLastRequest('post', '/api/v1/id/doc-id/@comment/');

        expect(request).to.exist;
        expect(request.headers['fetch-comment']).to.equal('author');
        expect(request.body).to.deep.equal({
          'entity-type': 'comment',
          parentId: 'doc-id',
          text: 'I am editing this comment',
        });
      });

      test('Should list the new comment when server returns submission success', async () => {
        server.respondWith('post', '/api/v1/id/doc-id/@comment/', {
          'entity-type': 'comment',
          parentId: 'doc-id',
          id: 'comment-id-one',
          numberOfReplies: 0,
          author: 'Mary Poppins',
          creationDate: '2019-12-19',
          text: 'I am creating this comment',
        });

        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'I am creating this comment';
        pressAndReleaseKeyOn(inputArea.querySelector('#inputContainer'), 13, ['ctrl']);

        await flush();

        const commentsList = element.shadowRoot.querySelectorAll('nuxeo-document-comment');
        expect(commentsList.length).to.equal(1);
        const text = commentsList[0].shadowRoot.querySelector('#content .text').firstElementChild.textContent;
        expect(text).to.be.equal('I am creating this comment');
      });

      test('Should not list the new comment when server returns submission error', async () => {
        server.rejectWith('post', '/api/v1/id/doc-id/@comment/', { status: 500 });

        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'I am creating this comment';
        pressAndReleaseKeyOn(inputArea.querySelector('#inputContainer'), 13, ['ctrl']);

        await flush();

        const commentsList = element.shadowRoot.querySelectorAll('nuxeo-document-comment');
        expect(commentsList.length).to.equal(0);
      });

      test('Should fire "notify" event when server returns submission error', async () => {
        server.rejectWith('post', '/api/v1/id/doc-id/@comment/', { status: 404 });

        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'I am creating this comment';
        pressAndReleaseKeyOn(inputArea.querySelector('#inputContainer'), 13, ['ctrl']);

        const event = await waitForEvent(element, 'notify');
        expect(event.detail).to.exist.and.to.have.key('message');
        expect(event.detail.message).to.not.be.empty;
      });
    });
  });
});

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
