/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-user-group-management/nuxeo-user-group-export-dialog.js';

/** Builds the bulk status the server returns for a command, with or without an assembled blob. */
const status = (state, extra) =>
  Object.assign({ 'entity-type': 'bulkStatus', commandId: 'cmd-1', state, total: 3 }, extra);

suite('nuxeo-user-group-export-dialog', () => {
  let el;
  let downloads;

  setup(async () => {
    // These tests drive a real polling loop, so they need real timers. Suites that run earlier in the
    // aggregate barrel install sinon fake timers, and a clock one of them fails to restore would stop
    // `window.setTimeout` firing here — the awaited export would never settle and Mocha could not time it
    // out either, because its own timeout uses the same faked timer. Undo any such leak up front.
    if (sinon.clock && typeof sinon.clock.restore === 'function') {
      sinon.clock.restore();
    }
    el = await fixture(
      html`
        <nuxeo-user-group-export-dialog></nuxeo-user-group-export-dialog>
      `,
    );
    await flush();
    el.pollInterval = 0;
    downloads = [];
    sinon.stub(el, '_triggerDownload').callsFake((url) => downloads.push(url));
    // the dialog is never opened in these tests, so closing it is stubbed out
    sinon.stub(el.$.dialog, 'close');
    el.$.nx.url = 'http://localhost:8080/nuxeo';
  });

  /** Replays a submit-then-poll exchange: `post` returns the command, `get` the statuses in order. */
  const serve = (...statuses) => {
    const posts = [];
    sinon.stub(el.$.request, 'post').callsFake(() => {
      posts.push(el.$.request.path);
      return Promise.resolve(status('SCHEDULED'));
    });
    const queue = statuses.slice();
    sinon.stub(el.$.status, 'get').callsFake(() => Promise.resolve(queue.length > 1 ? queue.shift() : queue[0]));
    return posts;
  };

  /** A promise plus the handles to settle it, so a test can hold a request open across a disconnect. */
  const deferred = () => {
    let settle;
    const promise = new Promise((resolve) => {
      settle = resolve;
    });
    return { promise, settle };
  };

  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

  suite('dialog', () => {
    test('titles each export', () => {
      el.exportType = 'users';
      expect(el._titleKey).to.equal('userGroupExport.users.heading');
      el.exportType = 'groups';
      expect(el._titleKey).to.equal('userGroupExport.groups.heading');
      el.exportType = 'members';
      expect(el._titleKey).to.equal('userGroupExport.members.heading');
    });

    test('has no title for an unknown export', () => {
      el.exportType = 'whatever';
      expect(el._titleKey).to.equal('');
    });

    test('open resets the format and records the group', () => {
      el.format = 'something-else';
      sinon.stub(el.$.dialog, 'open');
      el.open('members', 'administrators');
      expect(el.exportType).to.equal('members');
      expect(el.groupname).to.equal('administrators');
      expect(el.format).to.equal('csv');
      expect(el.$.dialog.open.calledOnce).to.be.true;
      el.$.dialog.open.restore();
    });

    test('offers CSV only', () => {
      expect(el.formats).to.deep.equal(['csv']);
      expect(el._formatLabel('csv')).to.equal('userGroupExport.format.csv');
    });
  });

  suite('endpoints', () => {
    test('posts all users to the user search bulk endpoint', async () => {
      const posts = serve(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      el.exportType = 'users';
      await el._export();
      expect(posts).to.deep.equal(['user/search/bulk/userCSVExport']);
    });

    test('posts all groups to the group search bulk endpoint', async () => {
      const posts = serve(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      el.exportType = 'groups';
      await el._export();
      expect(posts).to.deep.equal(['group/search/bulk/groupCSVExport']);
    });

    test('exports the members as the two populations the server exposes', async () => {
      const posts = serve(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      el.exportType = 'members';
      el.groupname = 'exporters';
      await el._export();
      expect(posts).to.deep.equal([
        'group/exporters/@users/bulk/userCSVExport',
        'group/exporters/@groups/bulk/groupCSVExport',
      ]);
    });

    test('leaves the group id for the client to encode', async () => {
      // nuxeo-resource percent-encodes the path and restores '/', so a slash in a group name survives and a
      // '?' is encoded. Encoding here would be applied twice and the request would 404.
      const posts = serve(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      el.exportType = 'members';
      el.groupname = 'managers/web ui?x';
      await el._export();
      expect(posts).to.deep.equal([
        'group/managers/web ui?x/@users/bulk/userCSVExport',
        'group/managers/web ui?x/@groups/bulk/groupCSVExport',
      ]);
    });

    test('ignores an unknown export type', async () => {
      el.exportType = 'whatever';
      await el._export();
      expect(downloads).to.be.empty;
    });

    test('does not export members without a group', async () => {
      const posts = serve(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      el.exportType = 'members';
      el.groupname = undefined;
      await el._export();
      expect(posts).to.be.empty;
      expect(el.exporting).to.be.false;
    });
  });

  suite('polling', () => {
    test('waits for the command to leave its running states', async () => {
      serve(
        status('SCHEDULED'),
        status('SCROLLING_RUNNING'),
        status('RUNNING'),
        status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }),
      );
      el.exportType = 'users';
      await el._export();
      expect(el.$.status.get.callCount).to.equal(4);
      expect(downloads).to.deep.equal(['http://localhost:8080/nuxeo/nxbigblob/key-1']);
    });

    test('stops instead of polling forever on a response that is not a bulk status', async () => {
      sinon.stub(el.$.request, 'post').returns(Promise.resolve(status('SCHEDULED')));
      sinon.stub(el.$.status, 'get').returns(Promise.resolve({ error: 'Invalid json' }));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o.message));
      el.exportType = 'users';
      await el._export();
      expect(notifications).to.include('userGroupExport.error');
      expect(el.exporting).to.be.false;
      expect(downloads).to.be.empty;
    });

    test('reports progress while the command is still running', async () => {
      serve(
        status('RUNNING', { processed: 40, total: 100 }),
        status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }),
      );
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      await el._export();
      const progress = notifications.find((n) => n.message === 'userGroupExport.progress');
      expect(progress, 'a progress notification').to.be.ok;
      // keyed by the command so each update replaces the same snackbar
      expect(progress.commandId).to.equal('cmd-1');
    });

    test('resolves the download against the connection, trailing slash or not', async () => {
      el.$.nx.url = 'http://localhost:8080/nuxeo/';
      serve(status('COMPLETED', { result: { url: 'nxbigblob/key-2' } }));
      el.exportType = 'users';
      await el._export();
      expect(downloads).to.deep.equal(['http://localhost:8080/nuxeo/nxbigblob/key-2']);
    });
  });

  suite('outcomes', () => {
    test('reports an empty population when nothing matched', async () => {
      serve(status('COMPLETED', { total: 0 }));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o.message));
      el.exportType = 'users';
      await el._export();
      expect(notifications).to.include('userGroupExport.empty');
      expect(downloads).to.be.empty;
    });

    test('reports a failure when the command completed with errors, blob or not', async () => {
      for (const extra of [
        { errorCount: 2, result: { url: 'nxbigblob/key-1' } },
        { errorCount: 2 },
        { error: true, result: { url: 'nxbigblob/key-1' } },
      ]) {
        downloads.length = 0;
        const notifications = [];
        serve(status('COMPLETED', extra));
        sinon.stub(el, 'notify').callsFake((o) => notifications.push(o.message));
        el.exportType = 'users';

        await el._export();
        expect(notifications, JSON.stringify(extra)).to.include('userGroupExport.error');
        expect(notifications, JSON.stringify(extra)).to.not.include('userGroupExport.completed');
        // a partial file is not the population that was asked for, so it is not handed over
        expect(downloads, JSON.stringify(extra)).to.be.empty;
        sinon.restore();
        sinon.stub(el, '_triggerDownload').callsFake((url) => downloads.push(url));
        sinon.stub(el.$.dialog, 'close');
      }
    });

    test('reports a failure when a non-empty command produced no blob', async () => {
      serve(status('COMPLETED', { total: 5 }));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o.message));
      el.exportType = 'users';
      await el._export();
      expect(notifications).to.include('userGroupExport.error');
      expect(notifications).to.not.include('userGroupExport.empty');
      expect(downloads).to.be.empty;
    });

    test('downloads nothing when the command was aborted', async () => {
      serve(status('ABORTED', { result: { url: 'nxbigblob/key-1' } }));
      el.exportType = 'users';
      await el._export();
      expect(downloads).to.be.empty;
    });

    test('reports a failed submission without rejecting', async () => {
      sinon.stub(el.$.request, 'post').returns(Promise.reject(new Error('403')));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o.message));
      el.exportType = 'users';
      await el._export();
      expect(notifications).to.include('userGroupExport.error');
      expect(el.exporting).to.be.false;
    });

    test('releases the Export button once every request is done', async () => {
      serve(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      el.exportType = 'members';
      el.groupname = 'g';
      const running = el._export();
      expect(el.exporting).to.be.true;
      await running;
      expect(el.exporting).to.be.false;
      expect(downloads).to.have.lengthOf(2);
    });
  });

  suite('teardown', () => {
    test('drops a scheduled poll when the dialog is removed', () => {
      el._pollTimeout = window.setTimeout(() => {}, 10000);
      el.disconnectedCallback();
      expect(el._pollTimeout).to.be.null;
      expect(el.exporting).to.be.false;
    });

    test('ignores a submission that resolves after the dialog was disconnected', async () => {
      const submission = deferred();
      sinon.stub(el.$.request, 'post').returns(submission.promise);
      const polls = sinon.stub(el.$.status, 'get');
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o.message));
      el.exportType = 'users';
      const running = el._export();

      el.disconnectedCallback();
      submission.settle(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      await running;

      expect(polls.called, 'polling must not start').to.be.false;
      expect(downloads).to.be.empty;
      expect(notifications).to.be.empty;
    });

    test('does not restart polling when a status resolves after the dialog was disconnected', async () => {
      sinon.stub(el.$.request, 'post').returns(Promise.resolve(status('SCHEDULED')));
      const pending = deferred();
      const polls = sinon.stub(el.$.status, 'get').returns(pending.promise);
      el.exportType = 'users';
      const running = el._export();
      await tick();
      expect(polls.callCount, 'the first poll goes out').to.equal(1);

      el.disconnectedCallback();
      pending.settle(status('RUNNING', { processed: 1, total: 10 }));
      await running;

      expect(polls.callCount, 'no further poll is scheduled').to.equal(1);
      expect(downloads).to.be.empty;
    });

    test('does not start the queued member export after the dialog was disconnected', async () => {
      const posts = [];
      const submission = deferred();
      sinon.stub(el.$.request, 'post').callsFake(() => {
        posts.push(el.$.request.path);
        return submission.promise;
      });
      el.exportType = 'members';
      el.groupname = 'exporters';
      const running = el._export();
      // the chain starts on a microtask, so let the first submission go out before cutting the dialog off
      await tick();
      expect(posts, 'the first population is submitted').to.have.lengthOf(1);

      el.disconnectedCallback();
      submission.settle(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      await running;

      expect(posts, 'the second population is never submitted').to.have.lengthOf(1);
      expect(downloads).to.be.empty;
    });
  });
});
