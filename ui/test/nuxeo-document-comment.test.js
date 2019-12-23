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
import {
  fixture,
  flush,
  html,
  isElementVisible,
  timePasses,
  waitForAttrMutation,
  waitForEvent,
} from '@nuxeo/nuxeo-elements/test/test-helpers';
import { pressAndReleaseKeyOn, tap } from '@polymer/iron-test-helpers/mock-interactions';
import fakeServer from '@nuxeo/nuxeo-elements/test/nuxeo-mock-client';

function getCommentContent(element) {
  return element.shadowRoot.querySelector('#content');
}

/* eslint-disable no-unused-expressions */
suite('<nuxeo-document-comment>', () => {
  const longText =
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. ' +
    'Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, ' +
    'nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. ' +
    'Nulla consequat massa quis enim. Donec.';

  let element;
  let server;

  setup(async () => {
    server = fakeServer.create({
      properties: {
        username: 'John Doe',
      },
    });

    const comment = {
      parentId: 'parent-id',
      id: 'comment-id',
      numberOfReplies: 0,
      author: 'John Doe',
      creationDate: '2019-12-09',
      text: 'This is my testing comment',
    };

    element = await fixture(
      html`
        <nuxeo-document-comment .comment="${comment}"></nuxeo-document-comment>
      `,
    );
  });

  teardown(() => {
    server.restore();
  });

  suite('Visibility', () => {
    test('Should not render any content if no comment data is provided', async () => {
      element.comment = null;
      await flush();

      expect(isElementVisible(getCommentContent(element))).to.be.false;
    });

    test('Should render content if comment data is provided', () => {
      expect(isElementVisible(getCommentContent(element))).to.be.true;
    });

    suite("Comment's Content", () => {
      test('Should not display "show all" option when comment has less than 256 characters', () => {
        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('span.pointer'))).to.be.false;
      });

      test('Should display "show all" option when comment has more than 256 characters', async () => {
        element.set('comment.text', longText);
        await flush();

        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('span.pointer'))).to.be.true;
      });

      test('Should display the whole text when comment has less than 256 characters', () => {
        const text = getCommentContent(element).querySelector('.text').firstElementChild.textContent;
        expect(text).to.be.equal('This is my testing comment');
      });

      test('Should display only 256 characters when comment is truncated', async () => {
        element.set('comment.text', longText);
        await flush();

        const text = getCommentContent(element).querySelector('.text').firstElementChild.textContent;
        expect(text).to.be.equal(
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. ' +
            'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. ' +
            'Donec quam felis, ultricies nec, pellentesque eu, pretium quis,…',
        );
        expect(text.length).to.be.equal(256);
      });
    });

    suite('Extended Options', () => {
      test('Should not display extended options when no user exists', async () => {
        element.currentUser = null;
        await flush();

        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('#options'))).to.be.false;
      });

      test('Should not display extended options when user is not the creator or an administrator', async () => {
        element.currentUser = {
          properties: {
            username: 'Mary',
          },
        };
        await flush();

        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('#options'))).to.be.false;
      });

      test("Should display extended options menu when user is the comment's creator", () => {
        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('#options'))).to.be.true;
      });

      test('Should display extended options menu when user is an administrator', async () => {
        element.currentUser = {
          properties: {
            username: 'Mary',
          },
          isAdministrator: true,
        };
        await flush();

        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('#options'))).to.be.true;
      });

      test('Should display the available extended options (edit and delete) when menu is expanded', async () => {
        const content = getCommentContent(element);
        const menu = content.querySelector('#options');
        expect(isElementVisible(menu)).to.be.true;
        tap(menu.querySelector('paper-icon-button'));

        if (!isElementVisible(menu.querySelector('paper-listbox'))) {
          await waitForAttrMutation(menu, 'focused', '');
        }

        expect(isElementVisible(menu.querySelector('[name="edit"]'))).to.be.true;
        expect(isElementVisible(menu.querySelector('[name="delete"]'))).to.be.true;
      });
    });

    suite('Reply Option', () => {
      test('Should not display reply option when comment has a depth level greater than 1', () => {
        element.set('level', 2);

        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('[name="reply"]'))).to.be.false;
      });

      test('Should not display reply option when comment is truncated (i.e. has more than 256 chars)', async () => {
        element.set('comment.text', longText);
        await flush();

        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('[name="reply"]'))).to.be.false;
      });

      test('Should display reply option when comment has a depth level equal to 1', () => {
        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('[name="reply"]'))).to.be.true;
      });
    });

    suite('Reply Summary', () => {
      test("Should not display information about replies when comment doesn't have replies", () => {
        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('#summary'))).to.be.false;
        expect(isElementVisible(content.querySelector('#thread'))).to.be.false;
      });

      test('Should display summary when there are replies and thread is not expanded', async () => {
        element.set('comment.numberOfReplies', 2);
        await flush();

        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('#summary'))).to.be.true;
        expect(isElementVisible(content.querySelector('#thread'))).to.be.false;
      });

      test('Should display thread when there are replies and summary is expanded', async () => {
        server.respondWith('get', '/api/v1/id/comment-id/@comment/', {
          'entity-type': 'comments',
          entries: [],
          totalSize: 0,
        });

        element.set('comment.numberOfReplies', 2);
        element.set('comment.expanded', true);
        await flush();

        const content = getCommentContent(element);
        expect(isElementVisible(content.querySelector('#summary'))).to.be.false;
        expect(isElementVisible(content.querySelector('#thread'))).to.be.true;
      });
    });

    suite('Editing', () => {
      setup(async () => {
        const editOption = getCommentContent(element).querySelector('#options [name="edit"]');
        tap(editOption);
        await flush();
      });

      test('Should have input focused when editing', () => {
        const content = getCommentContent(element);
        waitForAttrMutation(content.querySelector('#inputContainer'), 'focused', '');
      });

      test('Should have as input the existing comment when editing', () => {
        const inputContainer = getCommentContent(element).querySelector('#inputContainer');
        expect(inputContainer.value).to.equal('This is my testing comment');
      });

      suite('Input Container', () => {
        test('Should not display edition actions when the input is empty', async () => {
          const inputArea = getCommentContent(element).querySelector('.input-area');
          inputArea.querySelector('#inputContainer').value = undefined;
          await flush();

          expect(isElementVisible(inputArea.querySelector('[name="submit"]'))).to.be.false;
          expect(isElementVisible(inputArea.querySelector('[name="clear"]'))).to.be.false;
        });

        test('Should not display edition actions when the input is blank', async () => {
          const inputArea = getCommentContent(element).querySelector('.input-area');
          inputArea.querySelector('#inputContainer').value = '                ';
          await flush();

          expect(isElementVisible(inputArea.querySelector('[name="submit"]'))).to.be.false;
          expect(isElementVisible(inputArea.querySelector('[name="clear"]'))).to.be.false;
        });

        test('Should display edition actions when the input has non-blank content', async () => {
          const inputArea = getCommentContent(element).querySelector('.input-area');
          inputArea.querySelector('#inputContainer').value = 'This is my edited comment';
          await flush();

          expect(isElementVisible(inputArea.querySelector('[name="submit"]'))).to.be.true;
          expect(isElementVisible(inputArea.querySelector('[name="clear"]'))).to.be.true;
        });
      });
    });
  });

  suite('Interactions', () => {
    test('Should display whole content when clicking "show all" option', async () => {
      element.set('comment.text', longText);
      await flush();

      tap(element.shadowRoot.querySelector('span.pointer'));
      await flush();

      const div = element.shadowRoot.querySelector('.text');
      expect(div.firstElementChild.textContent).to.be.equal(longText);
    });

    test('Should expand thread and focus input when reply button is pressed', async () => {
      server.respondWith('get', '/api/v1/id/comment-id/@comment/', {
        'entity-type': 'comments',
        entries: [],
        totalSize: 0,
      });

      const content = getCommentContent(element);
      tap(content.querySelector('[name="reply"]'));
      await flush();

      const thread = content.querySelector('#thread');
      expect(isElementVisible(thread)).to.be.true;
      waitForAttrMutation(thread.shadowRoot.querySelector('#inputContainer'), 'focused', '');
    });

    suite('Editing', () => {
      setup(async () => {
        server.respondWith('put', '/api/v1/id/parent-id/@comment/comment-id');
        const editOption = getCommentContent(element).querySelector('#options [name="edit"]');
        tap(editOption);
        await flush();
      });

      test('Should clear the input when clicking on "clear" button', async () => {
        const inputArea = getCommentContent(element).querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'I am editing this comment';
        tap(inputArea.querySelector('[name="clear"]'));
        await flush();

        expect(isElementVisible(inputArea.querySelector('#inputContainer'))).to.be.false;

        const editOption = element.shadowRoot.querySelector('#options [name="edit"]');
        tap(editOption);
        await flush();

        expect(inputArea.querySelector('#inputContainer').value).to.equal('This is my testing comment');
      });

      test('Should submit the input when clicking on "submit" button', async () => {
        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'I am editing this comment';
        tap(inputArea.querySelector('[name="submit"]'));

        await timePasses();
        const request = server.getLastRequest('put', '/api/v1/id/parent-id/@comment/comment-id');

        expect(request).to.exist;
        expect(request.headers).to.not.have.property('fetch.comment', 'repliesSummary');
        expect(request.body).to.deep.equal({
          'entity-type': 'comment',
          parentId: 'parent-id',
          text: 'I am editing this comment',
        });
      });

      test('Should submit the input when pressing "CTRL + Enter" keys', async () => {
        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'I am editing this comment';
        pressAndReleaseKeyOn(inputArea.querySelector('#inputContainer'), 13, ['ctrl']);

        await timePasses();
        const request = server.getLastRequest('put', '/api/v1/id/parent-id/@comment/comment-id');

        expect(request).to.exist;
        expect(request.headers).to.not.have.property('fetch.comment', 'repliesSummary');
        expect(request.body).to.deep.equal({
          'entity-type': 'comment',
          parentId: 'parent-id',
          text: 'I am editing this comment',
        });
      });

      test('Should fire "edit-comment" event when server returns edition success', async () => {
        server.respondWith('put', '/api/v1/id/parent-id/@comment/comment-id', {
          'entity-type': 'comment',
          parentId: 'doc-id',
          id: 'comment-id',
          numberOfReplies: 0,
          author: 'John Doe',
          creationDate: '2019-12-19',
          modificationDate: '2019-12-25',
          text: 'I am editing this comment',
        });

        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'I am editing this comment';
        pressAndReleaseKeyOn(inputArea.querySelector('#inputContainer'), 13, ['ctrl']);

        const event = await waitForEvent(element, 'edit-comment');
        expect(event.detail).to.exist.and.to.have.keys(['commentId', 'modificationDate', 'text']);
        expect(event.detail.commentId).to.equal('comment-id');
        expect(event.detail.modificationDate).to.equal('2019-12-25');
        expect(event.detail.text).to.equal('I am editing this comment');
      });

      test('Should fire "notify" event when server returns submission error', async () => {
        server.rejectWith('put', '/api/v1/id/parent-id/@comment/comment-id', { status: 500 });

        const inputArea = element.shadowRoot.querySelector('.input-area');
        inputArea.querySelector('#inputContainer').value = 'I am editing this comment';
        pressAndReleaseKeyOn(inputArea.querySelector('#inputContainer'), 13, ['ctrl']);

        const event = await waitForEvent(element, 'notify');
        expect(event.detail).to.exist.and.to.have.key('message');
        expect(event.detail.message).to.not.be.empty;
      });
    });

    suite('Deletion', () => {
      setup(async () => {
        server.respondWith('delete', '/api/v1/id/parent-id/@comment/comment-id');
        const content = getCommentContent(element);
        const deleteOption = content.querySelector('#options [name="delete"]');
        tap(deleteOption);
        await flush();
        const confirmationDialog = element.shadowRoot.querySelector('#dialog');
        if (!isElementVisible(confirmationDialog)) {
          await waitForEvent(confirmationDialog, 'iron-overlay-opened');
        }
      });

      test('Should display confirmation dialog when delete button is pressed', () => {
        const confirmationDialog = element.shadowRoot.querySelector('#dialog');
        expect(isElementVisible(confirmationDialog)).to.be.true;
      });

      test('Should do nothing when user cancels deletion', async () => {
        tap(element.shadowRoot.querySelector('#dialog [name="dismiss"]'));

        const requests = server.getRequests('put');

        expect(requests.length).to.equal(0);
      });

      test('Should submit request when user confirms deletion', async () => {
        tap(element.shadowRoot.querySelector('#dialog [name="confirm"]'));

        await timePasses();
        const request = server.getLastRequest('delete', '/api/v1/id/parent-id/@comment/comment-id');

        expect(request).to.exist;
        expect(request.headers).to.not.have.property('fetch.comment', 'repliesSummary');
        expect(request.body).to.be.empty;
      });

      test('Should fire "delete-comment" event when server returns deletion success', async () => {
        tap(element.shadowRoot.querySelector('#dialog [name="confirm"]'));

        const event = await waitForEvent(element, 'delete-comment');
        expect(event.detail).to.exist.and.to.have.key('commentId');
        expect(event.detail.commentId).to.equal('comment-id');
      });

      test('Should fire "notify" event when server returns deletion error', async () => {
        server.rejectWith('delete', '/api/v1/id/parent-id/@comment/comment-id', { status: 404 });
        tap(element.shadowRoot.querySelector('#dialog [name="confirm"]'));

        const event = await waitForEvent(element, 'notify');
        expect(event.detail).to.exist.and.to.have.key('message');
        expect(event.detail.message).to.not.be.empty;
      });
    });
  });
});
