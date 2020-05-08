/**
@license
(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

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
        // TODO
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
        expect(request.headers).to.not.have.property('fetch-comment', 'repliesSummary');
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
        expect(request.headers).to.not.have.property('fetch.comment', 'repliesSummary');
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
