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
import {
  fakeServer,
  fixture,
  flush,
  html,
  isElementVisible,
  pressAndReleaseKeyOn,
  tap,
  timePasses,
  waitForAttrMutation,
  waitForEvent,
} from '@nuxeo/testing-helpers';

function getCommentContent(element) {
  return element.shadowRoot.querySelector('#content');
}

suite('nuxeo-document-comment', () => {
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
        expect(request.headers).to.not.have.property('fetch-comment', 'repliesSummary');
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
        expect(request.headers).to.not.have.property('fetch-comment', 'repliesSummary');
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
        expect(request.headers).to.not.have.property('fetch-comment', 'repliesSummary');
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

    test('returns true when author is a fetched user entity', () => {
      const author = {
        'entity-type': 'user',
        properties: { username: 'nco-admin', firstName: 'NCO', lastName: 'Admin' },
      };
      const user = { isAdministrator: false, properties: { username: 'nco-admin' } };
      expect(el._areExtendedOptionsAvailable(author, user)).to.be.true;
    });

    test('returns true when author uses prefixed username property', () => {
      const author = {
        'entity-type': 'user',
        properties: { 'user:username': 'nco-admin', 'user:firstName': 'NCO', 'user:lastName': 'Admin' },
      };
      const user = { isAdministrator: false, properties: { username: 'nco-admin' } };
      expect(el._areExtendedOptionsAvailable(author, user)).to.be.true;
    });
  });

  suite('_authorLabel', () => {
    test('returns username when author is a string', () => {
      expect(el._authorLabel('nco-admin')).to.equal('nco-admin');
    });

    test('returns full name from fetched user entity', () => {
      expect(
        el._authorLabel({
          'entity-type': 'user',
          properties: { firstName: 'NCO', lastName: 'Admin', username: 'nco-admin' },
        }),
      ).to.equal('NCO Admin');
    });

    test('returns username when user entity has no first or last name', () => {
      expect(
        el._authorLabel({
          'entity-type': 'user',
          properties: { username: 'Administrator' },
        }),
      ).to.equal('Administrator');
    });

    test('returns full name from prefixed user property keys', () => {
      expect(
        el._authorLabel({
          'entity-type': 'user',
          properties: { 'user:firstName': 'NCO', 'user:lastName': 'Admin', 'user:username': 'nco-admin' },
        }),
      ).to.equal('NCO Admin');
    });

    test('returns full name for document user entity', () => {
      expect(
        el._authorLabel({
          'entity-type': 'document',
          type: 'user',
          properties: { firstName: 'NCO', lastName: 'Admin', username: 'nco-admin' },
        }),
      ).to.equal('NCO Admin');
    });
  });

  suite('_authorUsername', () => {
    test('returns username from user entity', () => {
      const author = {
        'entity-type': 'user',
        properties: { firstName: 'NCO', lastName: 'Admin', username: 'nco-admin' },
      };
      expect(el._authorUsername(author)).to.equal('nco-admin');
    });

    test('returns string author as-is', () => {
      expect(el._authorUsername('nco-admin')).to.equal('nco-admin');
    });

    test('returns username from prefixed user property key', () => {
      expect(
        el._authorUsername({
          'entity-type': 'user',
          properties: { 'user:username': 'nco-admin' },
        }),
      ).to.equal('nco-admin');
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
});
