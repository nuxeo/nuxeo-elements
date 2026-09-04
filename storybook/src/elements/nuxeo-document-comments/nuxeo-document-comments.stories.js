import '@nuxeo/nuxeo-ui-elements/nuxeo-document-comments/nuxeo-document-comment';
import '@nuxeo/nuxeo-ui-elements/nuxeo-document-comments/nuxeo-document-comment-thread';
import { html } from 'lit';
import { v4 as uuid } from 'uuid';
import { getCommentsSample } from '../../data/comments.data.js';
import { analyse } from '../../../.storybook/analysis';

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
    return { entries: [], totalSize: 0 };
  }
  const replies = [];
  const repliesSample = commentsSample.filter((c) => c.numberOfReplies === 0);
  for (let i = 0; i < comment.numberOfReplies; i++) {
    replies.push(repliesSample[Math.floor(Math.random() * repliesSample.length)]);
  }
  return { entries: replies, totalSize: comment ? comment.numberOfReplies : commentsSample.length };
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

const commentAnalysis = analyse('nuxeo-document-comment');
const threadAnalysis = analyse('nuxeo-document-comment-thread');

export default {
  title: 'UI/Comments',
};

export const NuxeoDocumentComment = {
  parameters: {
    docs: { description: { story: commentAnalysis.notes } },
  },
  args: {
    level: '1',
    hasReplies: false,
    isTruncated: false,
    moreContentColor: '#1f28bf',
    placeholderColor: '#939caa',
  },
  argTypes: {
    level: { control: 'radio', options: ['1', '2'], name: 'Comment Type' },
    moreContentColor: { control: 'color', name: '--nuxeo-comment-more-content-color' },
    placeholderColor: { control: 'color', name: '--nuxeo-comment-placeholder-color' },
  },
  render: (args) => {
    const comment = Object.assign(
      {},
      commentsSample.find(
        (entry) =>
          (args.hasReplies ? entry.numberOfReplies > 0 : entry.numberOfReplies === 0) &&
          (args.isTruncated ? entry.text.length >= 256 : entry.text.length < 256),
      ),
    );
    return html`
      <style>
        nuxeo-document-comment {
          --nuxeo-comment-more-content-color: ${args.moreContentColor};
          --nuxeo-comment-placeholder-color: ${args.placeholderColor};
        }
      </style>
      <nuxeo-document-comment .comment="${comment}" .level="${Number(args.level)}"></nuxeo-document-comment>
    `;
  },
};

export const NuxeoDocumentCommentThread = {
  parameters: {
    docs: { description: { story: threadAnalysis.notes } },
  },
  args: {
    moreContentColor: '#1f28bf',
    placeholderColor: '#939caa',
  },
  argTypes: {
    moreContentColor: { control: 'color', name: '--nuxeo-comment-more-content-color' },
    placeholderColor: { control: 'color', name: '--nuxeo-comment-placeholder-color' },
  },
  render: (args) => html`
    <style>
      nuxeo-document-comment-thread {
        --nuxeo-comment-more-content-color: ${args.moreContentColor};
        --nuxeo-comment-placeholder-color: ${args.placeholderColor};
      }
    </style>
    <nuxeo-document-comment-thread uid="doc-id"></nuxeo-document-comment-thread>
  `,
};
