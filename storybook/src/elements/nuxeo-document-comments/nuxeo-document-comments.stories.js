import '@nuxeo/nuxeo-ui-elements/nuxeo-document-comments/nuxeo-document-comment';
import '@nuxeo/nuxeo-ui-elements/nuxeo-document-comments/nuxeo-document-comment-thread';
import { boolean, color, radios } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html';
import uuid from 'uuid/v4';
import { getCommentsSample } from '../../data/comments.data.js';

const commentsSample = getCommentsSample;
const server = window.nuxeo.mock;
server.respondWith('delete', new RegExp(/\/api\/v1\/id\/(\S+)\/@comment\/(\S+)/));
server.respondWith('get', new RegExp(/\/api\/v1\/id\/(\S+)\/@comment\//), ({ queryParams }, args) => {
  const id = args[0];
  if (id === 'doc-id') {
    return {
      entries: commentsSample.slice(0, queryParams.pageSize === 0 ? commentsSample.length : 10),
      totalSize: commentsSample.length,
    };
  }
  const comment = commentsSample.find((c) => c.id === id);
  if (!comment) {
    return {
      entries: [],
      totalSize: 0,
    };
  }
  const replies = [];
  // To avoid showing threads with more than two levels
  const repliesSample = commentsSample.filter((c) => c.numberOfReplies === 0);
  for (let i = 0; i < comment.numberOfReplies; i++) {
    replies.push(repliesSample[Math.floor(Math.random() * repliesSample.length)]);
  }
  return {
    entries: replies,
    totalSize: comment ? comment.numberOfReplies : commentsSample.length,
  };
});
server.respondWith('post', new RegExp(/\/api\/v1\/id\/(\S+)\/@comment\//), ({ body }) => {
  return {
    'entity-type': 'comment',
    parentId: body.parentId,
    id: uuid(),
    numberOfReplies: 0,
    author: 'Administrator',
    creationDate: new Date(),
    text: body.text,
  };
});
server.respondWith('put', new RegExp(/\/api\/v1\/id\/(\S+)\/@comment\/(\S+)/), ({ body }, args) => {
  const parentId = args[0];
  const id = args[1];
  let comment = commentsSample.find((c) => c.id === parentId && c.parentId === id);
  if (!comment) {
    comment = {
      'entity-type': 'comment',
      parentId,
      id,
      numberOfReplies: 0,
      author: 'Administrator',
      creationDate: new Date(),
    };
  }
  comment.modificationDate = new Date();
  comment.text = body.text;
  return comment;
});

storiesOf('UI/Comments', module)
  .addElement('nuxeo-document-comment', () => {
    const level = radios('Comment Type', { Comment: '1', Response: '2' }, '1', 'States');
    const hasReplies = boolean('Has Replies?', false, 'States');
    const isTruncated = boolean('Is text big?', false, 'States');
    const comment = Object.assign(
      {},
      commentsSample.find(
        (entry) =>
          (hasReplies ? entry.numberOfReplies > 0 : entry.numberOfReplies === 0) &&
          (isTruncated ? entry.text.length >= 256 : entry.text.length < 256),
      ),
    );
    return html`
      <style>
        nuxeo-document-comment {
          --nuxeo-comment-more-content-color: ${color('--nuxeo-comment-more-content-color', '#1f28bf', 'CSS')};
          --nuxeo-comment-placeholder-color: ${color('--nuxeo-comment-placeholder-color', '#939caa', 'CSS')};
        }
      </style>
      <nuxeo-document-comment .comment="${comment}" .level="${Number(level)}"></nuxeo-document-comment>
    `;
  })
  .addElement(
    'nuxeo-document-comment-thread',
    () =>
      html`
        <style>
          nuxeo-document-comment-thread {
            --nuxeo-comment-more-content-color: ${color('--nuxeo-comment-more-content-color', '#1f28bf', 'CSS')};
            --nuxeo-comment-placeholder-color: ${color('--nuxeo-comment-placeholder-color', '#939caa', 'CSS')};
          }
        </style>
        <nuxeo-document-comment-thread uid="doc-id"></nuxeo-document-comment-thread>
      `,
  );
