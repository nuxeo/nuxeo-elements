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
    // These drive a real polling loop, so they need real timers. A fake clock leaked by an earlier suite
    // in the barrel would stop `setTimeout` firing, and Mocha could not time the test out either.
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

    test('names the dialog by its heading, so it is announced as more than "dialog"', () => {
      const dialog = el.shadowRoot.querySelector('#dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy, 'the dialog points at a label').to.be.ok;
      expect(dialog.querySelector(`#${labelledBy}`), 'which resolves to its heading').to.be.ok;
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

    test('replaces the progress notification when a later poll fails', async () => {
      // the error has to carry the command id, or Web UI opens a second snackbar and the sticky
      // "Exporting..." one keeps claiming the run is still going
      sinon.stub(el.$.request, 'post').returns(Promise.resolve(status('SCHEDULED')));
      let call = 0;
      sinon.stub(el.$.status, 'get').callsFake(() => {
        call += 1;
        // scheduled (quiet), then running (progress), then the poll breaks
        if (call === 1) return Promise.resolve(status('SCHEDULED'));
        if (call === 2) return Promise.resolve(status('RUNNING', { processed: 1, total: 10 }));
        return Promise.reject(new Error('network'));
      });
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      await el._export();

      const progress = notifications.find((n) => n.message === 'userGroupExport.poll');
      const failure = notifications.find((n) => n.message === 'userGroupExport.error');
      expect(progress, 'progress was reported first').to.be.ok;
      expect(failure, 'the failure was reported').to.be.ok;
      expect(failure.commandId, 'the error lands on the progress snackbar').to.equal(progress.commandId);
    });

    test('keeps saying it is exporting until the command finishes', async () => {
      // the same acknowledgement on every poll, replacing itself in one snackbar; the figures only arrive
      // with the completion message
      serve(
        status('SCHEDULED'),
        status('RUNNING', { processed: 40, total: 100 }),
        status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }),
      );
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      await el._export();
      const progress = notifications.find((n) => n.message === 'userGroupExport.poll');
      expect(progress, 'a progress notification').to.be.ok;
      // keyed on the run, not the command, so one click owns one snackbar however many commands it runs
      expect(progress.commandId).to.match(/^ugexport\d+$/);
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
    test('a member export reports once, not once per population', async () => {
      // both populations are empty, which used to produce four messages for a single click
      serve(status('COMPLETED', { total: 0 }));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'members';
      el.groupname = 'exporters';
      await el._export();

      const outcomes = notifications.filter((n) => n.message !== 'userGroupExport.poll');
      expect(outcomes, 'one outcome for the click').to.have.lengthOf(1);
      expect(outcomes[0].message).to.equal('userGroupExport.empty');
      // keyed on the run, so progress and outcome share one snackbar rather than opening several
      expect(outcomes[0].commandId).to.match(/^ugexport\d+$/);
    });

    test('a member export whose populations differ still reports one success', async () => {
      let call = 0;
      sinon.stub(el.$.request, 'post').returns(Promise.resolve(status('SCHEDULED')));
      sinon.stub(el.$.status, 'get').callsFake(() => {
        call += 1;
        // member users produce a file, member groups are empty
        return Promise.resolve(
          call === 1 ? status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }) : status('COMPLETED', { total: 0 }),
        );
      });
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'members';
      el.groupname = 'exporters';
      await el._export();

      const outcomes = notifications.filter((n) => n.message !== 'userGroupExport.poll');
      expect(outcomes).to.have.lengthOf(1);
      expect(outcomes[0].message).to.equal('userGroupExport.completed');
      expect(downloads).to.have.lengthOf(1);
    });

    test('a failure in either population is what the click reports', async () => {
      let call = 0;
      sinon.stub(el.$.request, 'post').returns(Promise.resolve(status('SCHEDULED')));
      sinon.stub(el.$.status, 'get').callsFake(() => {
        call += 1;
        return Promise.resolve(
          call === 1
            ? status('COMPLETED', { result: { url: 'nxbigblob/key-1' } })
            : status('COMPLETED', { errorCount: 2 }),
        );
      });
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o.message));
      el.exportType = 'members';
      el.groupname = 'exporters';
      await el._export();
      expect(notifications.filter((m) => m === 'userGroupExport.error')).to.have.lengthOf(1);
    });

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

  suite('download', () => {
    test('hands the blob to the browser through a transient anchor', () => {
      // the only place the file actually reaches the user, so it is exercised for real rather than stubbed
      el._triggerDownload.restore();
      const clicked = [];
      sinon.stub(HTMLAnchorElement.prototype, 'click').callsFake(function record() {
        clicked.push({ href: this.href, parent: !!this.parentNode });
      });

      el._triggerDownload('http://localhost:8080/nuxeo/nxbigblob/key-1');

      expect(clicked, 'the anchor was clicked once').to.have.lengthOf(1);
      expect(clicked[0].href).to.equal('http://localhost:8080/nuxeo/nxbigblob/key-1');
      expect(clicked[0].parent, 'it has to be in the document to be clickable').to.be.true;
      expect(document.querySelector('a[href*="nxbigblob"]'), 'and is taken out again').to.not.be.ok;
    });
  });

  suite('guards', () => {
    test('releases the Export button even if the run itself throws', async () => {
      // nothing is expected to throw here, but a dialog left permanently disabled would be the worst way
      // to find that out
      serve(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      sinon.stub(el, '_reportOutcome').throws(new Error('boom'));
      el.exportType = 'users';

      let caught;
      await el._export().catch((error) => {
        caught = error;
      });

      expect(caught && caught.message, 'the failure is not swallowed').to.equal('boom');
      expect(el.exporting, 'the button is usable again').to.be.false;
    });

    test('a status that is not there has not failed', () => {
      expect(el._hasFailed(null)).to.be.false;
      expect(el._hasFailed(undefined)).to.be.false;
    });

    test('says nothing when no request produced an outcome', () => {
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el._reportOutcome([], 'users', 'ugexport1');
      expect(notifications).to.be.empty;
    });

    test('a poll belonging to a superseded run settles without asking the server', async () => {
      const get = sinon.stub(el.$.status, 'get');
      // a token the dialog has already moved past
      const stale = (el._runToken || 0) - 1;
      expect(await el._poll('cmd-1', 'users', stale, 'ugexport1')).to.be.null;
      expect(get.called, 'no request goes out for an abandoned run').to.be.false;
    });

    test('a request that fails after the run was superseded reports nothing', async () => {
      sinon.stub(el.$.request, 'post').returns(Promise.reject(new Error('boom')));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      const stale = (el._runToken || 0) - 1;
      expect(await el._run({ path: 'user/search/bulk/userCSVExport' }, stale, 'ugexport1', 'users')).to.be.null;
      expect(notifications).to.be.empty;
    });
  });

  suite('abort', () => {
    test('offers an abort on the progress notification and asks the server to stop the command', async () => {
      serve(status('RUNNING'), status('ABORTED'));
      const put = sinon.stub(el.$.abortRequest, 'put').resolves({});
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      const running = el._export();
      await tick();

      const progress = notifications.find((n) => n.message === 'userGroupExport.poll');
      expect(progress, 'the export reports progress').to.be.ok;
      expect(progress.abort, 'with an abort the snackbar can offer').to.be.a('function');

      progress.abort();
      await running;

      expect(el.$.abortRequest.path).to.equal('bulk/cmd-1/abort');
      expect(put.calledOnce, 'the command is aborted server side').to.be.true;
      const outcome = notifications.filter((n) => n.message !== 'userGroupExport.poll').pop();
      expect(outcome.message).to.equal('userGroupExport.aborted');
      expect(downloads).to.be.empty;
    });

    test('stops a member export instead of running the second population', async () => {
      const posts = [];
      sinon.stub(el.$.request, 'post').callsFake(() => {
        posts.push(el.$.request.path);
        return Promise.resolve(status('SCHEDULED'));
      });
      sinon.stub(el.$.abortRequest, 'put').resolves({});
      let call = 0;
      sinon.stub(el.$.status, 'get').callsFake(() => {
        call += 1;
        return Promise.resolve(call === 1 ? status('RUNNING') : status('ABORTED'));
      });
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'members';
      el.groupname = 'exporters';
      const running = el._export();
      await tick();

      notifications.find((n) => n.message === 'userGroupExport.poll').abort();
      await running;

      expect(posts, 'the second population is never submitted').to.have.lengthOf(1);
      const outcomes = notifications.filter((n) => n.message !== 'userGroupExport.poll');
      expect(outcomes).to.have.lengthOf(1);
      expect(outcomes[0].message).to.equal('userGroupExport.aborted');
    });

    test('says the run was aborted even when the command it stopped had already finished', async () => {
      // the abort and the final poll race; the user asked for the export to stop, so that is the answer
      serve(status('RUNNING'), status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      sinon.stub(el.$.abortRequest, 'put').resolves({});
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      const running = el._export();
      await tick();
      notifications.find((n) => n.message === 'userGroupExport.poll').abort();
      await running;

      const outcome = notifications.filter((n) => n.message !== 'userGroupExport.poll').pop();
      expect(outcome.message).to.equal('userGroupExport.aborted');
      expect(downloads, 'the file the stopped command left behind is not handed over').to.be.empty;
    });

    test('sends an abort clicked between the two member populations to the command that follows', async () => {
      // the click lands while the second command is unnamed; aiming it at the finished first one would
      // let the second run on and download its file
      const secondSubmission = deferred();
      const posts = [];
      sinon.stub(el.$.request, 'post').callsFake(() => {
        posts.push(el.$.request.path);
        return posts.length === 1
          ? Promise.resolve(Object.assign(status('SCHEDULED'), { commandId: 'cmd-1' }))
          : secondSubmission.promise;
      });
      const put = sinon.stub(el.$.abortRequest, 'put').resolves({});
      let call = 0;
      sinon.stub(el.$.status, 'get').callsFake(() => {
        call += 1;
        if (call === 1) {
          return Promise.resolve(status('RUNNING'));
        }
        if (call === 2) {
          return Promise.resolve(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
        }
        return Promise.resolve(status('ABORTED'));
      });
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'members';
      el.groupname = 'exporters';
      const running = el._export();
      await tick();
      await tick();
      await tick();
      expect(posts, 'the second population is being submitted').to.have.lengthOf(2);

      notifications.find((n) => n.message === 'userGroupExport.poll').abort();
      expect(put.called, 'there is no command to stop yet').to.be.false;

      secondSubmission.settle(Object.assign(status('SCHEDULED'), { commandId: 'cmd-2' }));
      await running;

      expect(el.$.abortRequest.path, 'the request reaches the command it was meant for').to.equal('bulk/cmd-2/abort');
      expect(put.calledOnce).to.be.true;
      expect(downloads, 'only the population that finished before the abort').to.deep.equal([
        'http://localhost:8080/nuxeo/nxbigblob/key-1',
      ]);
    });

    test('stops advertising progress once an abort is on its way', async () => {
      serve(status('RUNNING'), status('RUNNING'), status('ABORTED'));
      sinon.stub(el.$.abortRequest, 'put').resolves({});
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      const running = el._export();
      await tick();
      notifications.find((n) => n.message === 'userGroupExport.poll').abort();
      const before = notifications.filter((n) => n.message === 'userGroupExport.poll').length;
      await running;
      const after = notifications.filter((n) => n.message === 'userGroupExport.poll').length;
      expect(after, 'no further "still exporting" after the abort').to.equal(before);
    });

    test('leaves the export running when the server refuses the abort', async () => {
      serve(status('RUNNING'), status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      sinon.stub(el.$.abortRequest, 'put').rejects(new Error('409'));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      const running = el._export();
      await tick();
      notifications.find((n) => n.message === 'userGroupExport.poll').abort();
      await running;
      // the command ran to completion, so the file is still handed over
      expect(downloads).to.have.lengthOf(1);
      expect(el.exporting).to.be.false;
      const outcome = notifications.filter((n) => n.message !== 'userGroupExport.poll').pop();
      expect(outcome.message, 'nothing was stopped, so the run reports what it did').to.equal(
        'userGroupExport.completed',
      );
    });

    test('still covers the second member population when the server refuses the abort', async () => {
      const posts = [];
      sinon.stub(el.$.request, 'post').callsFake(() => {
        posts.push(el.$.request.path);
        return Promise.resolve(Object.assign(status('SCHEDULED'), { commandId: `cmd-${posts.length}` }));
      });
      sinon.stub(el.$.abortRequest, 'put').rejects(new Error('409'));
      let call = 0;
      sinon.stub(el.$.status, 'get').callsFake(() => {
        call += 1;
        return Promise.resolve(
          call === 1 ? status('RUNNING') : status('COMPLETED', { result: { url: `nxbigblob/key-${call}` } }),
        );
      });
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'members';
      el.groupname = 'exporters';
      const running = el._export();
      await tick();
      notifications.find((n) => n.message === 'userGroupExport.poll').abort();
      await running;

      expect(posts, 'a refused abort stopped nothing, so both populations still run').to.have.lengthOf(2);
      expect(downloads).to.have.lengthOf(2);
      const outcome = notifications.filter((n) => n.message !== 'userGroupExport.poll').pop();
      expect(outcome.message).to.equal('userGroupExport.completed');
    });

    test('waits for the abort to be answered before acting on a command that completed', async () => {
      // the refusal arrives after the last poll, so the run holds the file back until it knows whether
      // it was stopped rather than guessing
      let refuse;
      const refusal = new Promise((resolve, reject) => {
        refuse = reject;
      });
      serve(status('RUNNING'), status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      sinon.stub(el.$.abortRequest, 'put').returns(refusal);
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      const running = el._export();
      await tick();
      notifications.find((n) => n.message === 'userGroupExport.poll').abort();
      await tick();
      expect(downloads, 'nothing is decided while the abort is unanswered').to.be.empty;

      refuse(new Error('409'));
      await running;

      expect(downloads, 'refused, so the file the command produced still arrives').to.have.lengthOf(1);
      const outcome = notifications.filter((n) => n.message !== 'userGroupExport.poll').pop();
      expect(outcome.message).to.equal('userGroupExport.completed');
    });

    test('ignores an abort answered after the dialog left the page', async () => {
      let accept;
      const answer = new Promise((resolve) => {
        accept = resolve;
      });
      serve(status('RUNNING'), status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      sinon.stub(el.$.abortRequest, 'put').returns(answer);
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      const running = el._export();
      await tick();
      notifications.find((n) => n.message === 'userGroupExport.poll').abort();
      // the command completes, so the run is waiting on the abort when the dialog is taken away
      await tick();
      el.disconnectedCallback();
      accept({});
      await running;

      expect(downloads, 'nothing is downloaded against a dialog that has left the page').to.be.empty;
      expect(
        notifications.filter((n) => n.message && n.message !== 'userGroupExport.poll'),
        'and nothing is reported to a screen that is gone',
      ).to.be.empty;
    });

    test('puts progress back when the server refuses the abort and the export runs on', async () => {
      // Web UI removes the snackbar as soon as Abort is clicked, so without this the export would carry
      // on invisibly, with no way to ask it to stop again
      serve(
        status('RUNNING'),
        status('RUNNING'),
        status('RUNNING'),
        status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }),
      );
      sinon.stub(el.$.abortRequest, 'put').rejects(new Error('409'));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      const running = el._export();
      await tick();

      const announced = notifications.filter((n) => n.message === 'userGroupExport.poll');
      expect(announced, 'announced once to begin with').to.have.lengthOf(1);
      announced[0].abort();
      await running;

      const progress = notifications.filter((n) => n.message === 'userGroupExport.poll');
      expect(progress.length, 'the export says again that it is still going').to.be.greaterThan(1);
      expect(progress[progress.length - 1].abort, 'and can be asked to stop a second time').to.be.a('function');
      expect(downloads, 'it was never stopped, so its file arrives').to.have.lengthOf(1);
    });

    test('submits nothing more once a run has been told to stop between its populations', async () => {
      // the request lands with nothing being polled to receive it, so there is no command to stop —
      // the run must still not open the next one
      const posts = [];
      sinon.stub(el.$.request, 'post').callsFake(() => {
        posts.push(el.$.request.path);
        return Promise.resolve(status('SCHEDULED'));
      });
      el._runToken = 1;
      el._abort();

      const outcomes = await el._runEach(
        [{ path: 'group/exporters/@groups/bulk/groupCSVExport' }],
        1,
        'ugexport1',
        'groups',
      );
      expect(posts).to.be.empty;
      expect(outcomes).to.be.empty;
    });

    test('stops a member export whose first command was aborted elsewhere', async () => {
      // stopped through another tab or the bulk API, so nothing was clicked here; the run must still
      // not go on to download the second population under an outcome that says it was aborted
      const posts = [];
      sinon.stub(el.$.request, 'post').callsFake(() => {
        posts.push(el.$.request.path);
        return Promise.resolve(status('SCHEDULED'));
      });
      sinon.stub(el.$.status, 'get').resolves(status('ABORTED', { result: { url: 'nxbigblob/key-1' } }));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o.message));
      el.exportType = 'members';
      el.groupname = 'exporters';
      await el._export();

      expect(posts, 'the second population is never submitted').to.have.lengthOf(1);
      expect(downloads).to.be.empty;
      expect(notifications).to.include('userGroupExport.aborted');
    });

    test('ignores an abort offered by a snackbar left over from an earlier run', async () => {
      let call = 0;
      sinon.stub(el.$.request, 'post').resolves(status('SCHEDULED'));
      sinon.stub(el.$.status, 'get').callsFake(() => {
        call += 1;
        // the first run is cut off while polling; the second runs long enough to be interfered with
        return Promise.resolve(
          call >= 3 ? status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }) : status('RUNNING'),
        );
      });
      const put = sinon.stub(el.$.abortRequest, 'put').resolves({});
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      const abandoned = el._export();
      await tick();
      const stale = notifications.find((n) => n.message === 'userGroupExport.poll');
      el.disconnectedCallback();
      await abandoned;

      const live = el._export();
      await tick();
      stale.abort();
      await live;

      expect(put.called, 'the old snackbar has no hold over the run that followed it').to.be.false;
      expect(downloads, 'which therefore runs to completion').to.have.lengthOf(1);
    });
  });

  suite('terminal states', () => {
    test('treats an expired command as a failure instead of polling for ever', async () => {
      serve(status('UNKNOWN'));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o.message));
      el.exportType = 'users';
      await el._export();
      expect(el.$.status.get.callCount, 'UNKNOWN ends the poll').to.equal(1);
      expect(notifications).to.include('userGroupExport.error');
      expect(notifications).to.not.include('userGroupExport.empty');
      expect(downloads).to.be.empty;
    });

    test('keeps polling through every in-flight state', () => {
      ['SCHEDULED', 'SCROLLING_RUNNING', 'RUNNING'].forEach((state) => {
        expect(el._isRunning(status(state)), state).to.be.true;
      });
      ['COMPLETED', 'ABORTED', 'UNKNOWN'].forEach((state) => {
        expect(el._isRunning(status(state)), state).to.be.false;
      });
    });
  });

  suite('notifications', () => {
    test('two dialogs on the page do not share a snackbar', async () => {
      // the search screen and the group details screen each hold one; a per-element counter gave both
      // their first run the same key and the two runs overwrote each other
      const other = await fixture(
        html`
          <nuxeo-user-group-export-dialog></nuxeo-user-group-export-dialog>
        `,
      );
      await flush();
      sinon.stub(other, '_triggerDownload');
      sinon.stub(other.$.dialog, 'close');
      other.pollInterval = 0;
      other.$.nx.url = 'http://localhost:8080/nuxeo';
      sinon.stub(other.$.request, 'post').resolves(status('SCHEDULED'));
      sinon.stub(other.$.status, 'get').resolves(status('COMPLETED', { result: { url: 'nxbigblob/key-2' } }));

      const keys = [];
      serve(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
      sinon.stub(el, 'notify').callsFake((o) => keys.push(o.commandId));
      sinon.stub(other, 'notify').callsFake((o) => keys.push(o.commandId));
      el.exportType = 'users';
      other.exportType = 'groups';
      await el._export();
      await other._export();

      expect(keys).to.have.lengthOf(2);
      expect(keys[0], 'each run owns its own snackbar').to.not.equal(keys[1]);
    });
  });

  suite('live region', () => {
    test('says it is exporting once, not on every poll', async () => {
      // Web UI re-reads the snackbar into its screen-reader live region on each notification, so an
      // unchanged message repeated every second would talk over the user for the whole export
      serve(status('SCHEDULED'), status('RUNNING'), status('RUNNING'), status('COMPLETED', { total: 0 }));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o.message));
      el.exportType = 'users';
      await el._export();
      expect(el.$.status.get.callCount, 'it did keep polling').to.be.greaterThan(2);
      expect(
        notifications.filter((m) => m === 'userGroupExport.poll'),
        'announced once',
      ).to.have.lengthOf(1);
    });

    test('the single notification aborts whichever command is polling now', async () => {
      // the run is announced once, but a member export moves on to a second command behind that snackbar
      const posts = [];
      sinon.stub(el.$.request, 'post').callsFake(() => {
        posts.push(el.$.request.path);
        return Promise.resolve(Object.assign(status('SCHEDULED'), { commandId: `cmd-${posts.length}` }));
      });
      let stopped = false;
      sinon.stub(el.$.abortRequest, 'put').callsFake(() => {
        stopped = true;
        return Promise.resolve({});
      });
      let call = 0;
      sinon.stub(el.$.status, 'get').callsFake(() => {
        call += 1;
        // the first population finishes; the second keeps running until the user steps in
        if (call === 1) {
          return Promise.resolve(status('COMPLETED', { result: { url: 'nxbigblob/key-1' } }));
        }
        return Promise.resolve(status(stopped ? 'ABORTED' : 'RUNNING'));
      });
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'members';
      el.groupname = 'exporters';
      const running = el._export();
      await tick();
      await tick();

      const progress = notifications.find((n) => n.message === 'userGroupExport.poll');
      expect(progress, 'the run was announced').to.be.ok;
      progress.abort();
      await running;

      expect(el.$.abortRequest.path, 'the command still running is the one stopped').to.equal('bulk/cmd-2/abort');
    });
  });

  suite('teardown', () => {
    test('drops a scheduled poll when the dialog is removed', () => {
      el._pollTimeout = window.setTimeout(() => {}, 10000);
      el.disconnectedCallback();
      expect(el._pollTimeout).to.be.null;
      expect(el.exporting).to.be.false;
    });

    test('takes its sticky progress snackbar down on the way out', async () => {
      // only the outcome replaces it, and a run cut short by teardown never reports one, so the
      // snackbar would be left claiming an export that is no longer running
      serve(status('RUNNING'));
      const notifications = [];
      sinon.stub(el, 'notify').callsFake((o) => notifications.push(o));
      el.exportType = 'users';
      const running = el._export();
      await tick();
      const progress = notifications.find((n) => n.message === 'userGroupExport.poll');
      expect(progress, 'the export announced itself').to.be.ok;

      el.disconnectedCallback();
      await running;

      const closed = notifications.find((n) => n.close);
      expect(closed, 'the run closes its snackbar').to.be.ok;
      expect(closed.commandId, 'the one it opened').to.equal(progress.commandId);
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

    test('a late response from a superseded poll does not disarm the live one', async () => {
      // disconnect, reattach, export again: the first run's response is still out, and clearing the shared
      // cancel slot on its way through would leave the new export with nothing able to settle it
      const first = deferred();
      const second = deferred();
      let call = 0;
      sinon.stub(el.$.request, 'post').returns(Promise.resolve(status('SCHEDULED')));
      sinon.stub(el.$.status, 'get').callsFake(() => {
        call += 1;
        return call === 1 ? first.promise : second.promise;
      });
      el.exportType = 'users';
      const abandoned = el._export();
      await tick();

      el.disconnectedCallback();
      await abandoned;

      const live = el._export();
      await tick();
      const cancelLive = el._cancelPoll;
      expect(cancelLive, 'the live poll can be cancelled').to.be.a('function');

      first.settle(status('RUNNING'));
      await tick();
      expect(el._cancelPoll, 'the abandoned response left the live handle alone').to.equal(cancelLive);

      el.disconnectedCallback();
      const outcome = await Promise.race([
        live.then(() => 'settled'),
        new Promise((resolve) => setTimeout(() => resolve('pending'), 2000)),
      ]);
      expect(outcome, 'the live export still settles on cancellation').to.equal('settled');
    });

    test('settles the export when the dialog is disconnected between two polls', async () => {
      // the next tick is only scheduled, so cancellation has nothing in flight to notice it; the poll must
      // be settled by the cancellation itself or this await would never return
      serve(status('RUNNING', { processed: 1, total: 10 }));
      el.pollInterval = 10000;
      el.exportType = 'users';
      const running = el._export();
      await tick();
      expect(el.$.status.get.callCount, 'the first poll went out').to.equal(1);

      el.disconnectedCallback();

      // raced, so a regression fails this test instead of stalling the whole run
      const outcome = await Promise.race([
        running.then(() => 'settled'),
        new Promise((resolve) => setTimeout(() => resolve('pending'), 2000)),
      ]);
      expect(outcome, 'the cancelled export must settle').to.equal('settled');
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
