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
import { fixture, html, login, waitForEvent } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-file.js';
import { UploaderBehavior } from '../widgets/nuxeo-uploader-behavior.js';

suite('Nuxeo.UploaderBehavior', () => {
  let DefaultUploadProvider;
  setup(async () => {
    DefaultUploadProvider = UploaderBehavior.getProviders().default;
    const MyProvider = function() {};
    MyProvider.prototype.accepts = DefaultUploadProvider.prototype.accepts;
    MyProvider.prototype.upload = DefaultUploadProvider.prototype.upload;
    MyProvider.prototype.hasProgress = DefaultUploadProvider.prototype.hasProgress;
    MyProvider.prototype.cancelBatch = DefaultUploadProvider.prototype.cancelBatch;
    MyProvider.prototype.batchExecute = DefaultUploadProvider.prototype.batchExecute;
    UploaderBehavior.registerProvider('myProvider', MyProvider);

    await login();
  });

  suite('upload providers', () => {
    let noProvider;
    let withProvider;

    setup(async () => {
      noProvider = await fixture(
        html`
          <nuxeo-file></nuxeo-file>
        `,
      );
      withProvider = await fixture(
        html`
          <nuxeo-file provider="myProvider"></nuxeo-file>
        `,
      );
    });

    teardown(() => {
      // Some tests in this suite mutate the global default provider via
      // `UploaderBehavior.defaultProvider = 'myProvider'`. Restore the
      // baseline so sibling suites get a clean DefaultUploadProvider.
      UploaderBehavior.defaultProvider = 'default';
    });

    test('can contribute a new upload provider', () => {
      const MyProvider2 = function() {};
      MyProvider2.prototype.accepts = DefaultUploadProvider.prototype.accepts;
      MyProvider2.prototype.upload = DefaultUploadProvider.prototype.upload;
      MyProvider2.prototype.hasProgress = DefaultUploadProvider.prototype.hasProgress;
      MyProvider2.prototype.cancelBatch = DefaultUploadProvider.prototype.cancelBatch;
      MyProvider2.prototype.batchExecute = DefaultUploadProvider.prototype.batchExecute;
      UploaderBehavior.registerProvider('myProvider2', MyProvider2);
      expect(UploaderBehavior.defaultProvider).to.be.equal('default');
      expect(Object.keys(UploaderBehavior.getProviders())).to.have.all.members([
        'default',
        'myProvider',
        'myProvider2',
      ]);
    });

    test('can have elements with both default and explicit providers', () => {
      expect(noProvider._provider).to.be.equal('default');
      expect(noProvider.provider).to.be.undefined;
      expect(withProvider._provider).to.be.equal('myProvider');
      expect(withProvider.provider).to.be.equal(withProvider._provider);
    });

    test('can switch default provider', () => {
      UploaderBehavior.defaultProvider = 'myProvider';
      expect(noProvider._provider).to.be.equal('myProvider');
      expect(noProvider.provider).to.be.undefined;
      expect(withProvider._provider).to.be.equal('myProvider');
      expect(withProvider.provider).to.be.equal(withProvider._provider);

      UploaderBehavior.defaultProvider = 'default';
      expect(noProvider._provider).to.be.equal('default');
      expect(noProvider.provider).to.be.undefined;
      expect(withProvider._provider).to.be.equal('myProvider');
      expect(withProvider.provider).to.be.equal(withProvider._provider);
    });

    test('can switch provider for a single element', () => {
      noProvider.provider = 'default';
      expect(noProvider._provider).to.be.equal('default');
      expect(noProvider.provider).to.be.equal(noProvider._provider);
      expect(withProvider._provider).to.be.equal('myProvider');
      expect(withProvider.provider).to.be.equal(withProvider._provider);

      UploaderBehavior.defaultProvider = 'myProvider';
      expect(noProvider._provider).to.be.equal('default');
      expect(noProvider.provider).to.be.equal(noProvider._provider);
      expect(withProvider._provider).to.be.equal('myProvider');
      expect(withProvider.provider).to.be.equal(withProvider._provider);
    });
  });
});

const flushAll = () => new Promise((res) => setTimeout(res, 0));

const fakeFile = (name = 'a.txt', type = 'text/plain') => {
  const blob = new Blob(['hello'], { type });
  return new File([blob], name, { type });
};

suite('Nuxeo.UploaderBehavior – DefaultUploadProvider', () => {
  let DefaultUploadProvider;
  let connection;
  let provider;

  setup(() => {
    DefaultUploadProvider = UploaderBehavior.getProviders().default;
    connection = {
      batchUpload: sinon.stub(),
      operation: sinon.stub(),
    };
    provider = new DefaultUploadProvider(connection, '', false);
  });

  test('accepts() returns true when no accept filter is configured', () => {
    expect(provider.accepts({ name: 'file.exe', type: 'application/x-exec' })).to.be.true;
  });

  test('accepts() matches by mime-type prefix', () => {
    const p = new DefaultUploadProvider(connection, 'image/,video/', false);
    expect(p.accepts({ name: 'a.png', type: 'image/png' })).to.be.true;
    expect(p.accepts({ name: 'a.mp4', type: 'video/mp4' })).to.be.true;
    expect(p.accepts({ name: 'a.txt', type: 'text/plain' })).to.be.false;
  });

  test('accepts() matches by extension when mime-type is missing', () => {
    const p = new DefaultUploadProvider(connection, '.png,.gif', false);
    expect(p.accepts({ name: 'logo.png', type: '' })).to.be.true;
    expect(p.accepts({ name: 'logo.gif', type: '' })).to.be.true;
    expect(p.accepts({ name: 'logo.jpg', type: '' })).to.be.false;
  });

  test('hasAbort / hasProgress always report false for the default provider', () => {
    expect(provider.hasAbort()).to.be.false;
    expect(provider.hasProgress()).to.be.false;
  });

  test('cancelBatch() releases the uploader and batch id', () => {
    provider.uploader = { _batchId: 'b1', cancel: sinon.spy() };
    provider.batchId = 'b1';
    provider.cancelBatch();
    expect(provider.uploader).to.be.null;
    expect(provider.batchId).to.be.null;
  });

  test('cancelBatch() is a no-op when there is no active uploader', () => {
    provider.uploader = null;
    expect(() => provider.cancelBatch()).to.not.throw();
  });

  test('_ensureBatch creates a new batch when none exists', async () => {
    const uploader = { _batchId: 'b' };
    connection.batchUpload.resolves(uploader);
    await provider._ensureBatch();
    expect(provider.uploader).to.equal(uploader);
    expect(connection.batchUpload.calledOnce).to.be.true;
  });

  test('_ensureBatch reuses the existing batch when batchAppend is true', async () => {
    const p = new DefaultUploadProvider(connection, '', true);
    p.uploader = { _batchId: 'existing' };
    await p._ensureBatch();
    expect(connection.batchUpload.called).to.be.false;
  });

  test('_ensureBatch creates new batch when batchAppend is true but no uploader', async () => {
    const p = new DefaultUploadProvider(connection, '', true);
    p.uploader = null;
    const uploader = { _batchId: 'new' };
    connection.batchUpload.resolves(uploader);
    await p._ensureBatch();
    expect(p.uploader).to.equal(uploader);
  });

  test('cancelBatch skips cancel when uploader has no _batchId', () => {
    provider.uploader = { _batchId: null, cancel: sinon.spy() };
    provider.batchId = 'b1';
    provider.cancelBatch();
    expect(provider.uploader).to.be.null;
  });

  test('cancelBatch() returns a Promise that resolves after uploader.cancel() completes', async () => {
    const cancel = sinon.stub().resolves();
    provider.uploader = { _batchId: 'b1', cancel };
    provider.batchId = 'b1';
    const result = provider.cancelBatch();
    expect(result).to.be.an.instanceof(Promise);
    // uploader / batchId are detached synchronously so a fresh batch can start immediately
    expect(provider.uploader).to.be.null;
    expect(provider.batchId).to.be.null;
    await result;
    expect(cancel).to.have.been.calledOnce;
  });

  test('cancelBatch() returns a resolved Promise when there is no active uploader', async () => {
    provider.uploader = null;
    const result = provider.cancelBatch();
    expect(result).to.be.an.instanceof(Promise);
    await result;
  });

  test('cancelBatch() defers uploader.cancel() until in-flight per-blob POSTs settle', async () => {
    let resolveInflight;
    const inflight = new Promise((r) => {
      resolveInflight = r;
    });
    const cancel = sinon.stub().resolves();
    provider.uploader = { _batchId: 'b1', _promises: [inflight], cancel };
    provider.batchId = 'b1';
    const done = provider.cancelBatch();
    // cancel must NOT be issued while the POST is still in flight
    await flushAll();
    expect(cancel).not.to.have.been.called;
    resolveInflight();
    await done;
    expect(cancel).to.have.been.calledOnce;
  });

  test('cancelBatch() still cancels when an in-flight per-blob POST rejects', async () => {
    const rejected = Promise.reject(new Error('nope'));
    const cancel = sinon.stub().resolves();
    provider.uploader = { _batchId: 'b1', _promises: [rejected], cancel };
    provider.batchId = 'b1';
    await provider.cancelBatch();
    expect(cancel).to.have.been.calledOnce;
  });

  test('upload does nothing when files is null', () => {
    provider.upload(null, sinon.spy());
  });

  test('upload does nothing when files is undefined', () => {
    provider.upload(undefined, sinon.spy());
  });

  test('upload invokes callback with uploadStarted when callback is a function', async () => {
    const cb = sinon.spy();
    const uploader = {
      _batchId: 'b',
      upload: sinon.stub().resolves({ batch: { _batchId: 'b' }, blob: { fileIdx: 0 } }),
      done: sinon.stub().resolves({ batch: { _batchId: 'b' } }),
    };
    connection.batchUpload.resolves(uploader);
    const files = [fakeFile()];
    provider.upload(files, cb);
    await new Promise((r) => setTimeout(r, 50));
    expect(cb).to.have.been.calledWith(sinon.match({ type: 'uploadStarted' }));
  });

  test('upload skips uploadStarted callback when callback is not a function', async () => {
    const uploader = {
      _batchId: 'b',
      upload: sinon.stub().resolves({ batch: { _batchId: 'b' }, blob: { fileIdx: 0 } }),
      done: sinon.stub().resolves({ batch: { _batchId: 'b' } }),
    };
    connection.batchUpload.resolves(uploader);
    provider.upload([fakeFile()], 'not-a-function');
  });

  test('upload waits for every per-blob POST to settle before calling uploader.done()', async () => {
    const cb = sinon.spy();
    let resolveA;
    let resolveB;
    const upload = sinon.stub();
    upload.onCall(0).returns(
      new Promise((r) => {
        resolveA = r;
      }),
    );
    upload.onCall(1).returns(
      new Promise((r) => {
        resolveB = r;
      }),
    );
    const done = sinon.stub().resolves({ batch: { _batchId: 'b' } });
    const uploader = { _batchId: 'b', upload, done };
    connection.batchUpload.resolves(uploader);
    provider.upload([fakeFile('a.txt'), fakeFile('b.txt')], cb);
    await flushAll();
    resolveA({ batch: { _batchId: 'b' }, blob: { fileIdx: 0 } });
    await flushAll();
    expect(done).not.to.have.been.called;
    resolveB({ batch: { _batchId: 'b' }, blob: { fileIdx: 1 } });
    await new Promise((r) => setTimeout(r, 20));
    expect(done).to.have.been.calledOnce;
    expect(cb).to.have.been.calledWith(sinon.match({ type: 'batchFinished', batchId: 'b' }));
  });

  test('upload emits batchFailed and skips uploader.done() when a per-blob POST rejects', async () => {
    const cb = sinon.spy();
    const err = new Error('bad');
    const upload = sinon.stub();
    upload.onCall(0).resolves({ batch: { _batchId: 'b' }, blob: { fileIdx: 0 } });
    upload.onCall(1).rejects(err);
    const done = sinon.stub().resolves({ batch: { _batchId: 'b' } });
    const uploader = { _batchId: 'b', upload, done };
    connection.batchUpload.resolves(uploader);
    provider.upload([fakeFile('a.txt'), fakeFile('b.txt')], cb);
    await new Promise((r) => setTimeout(r, 50));
    expect(cb).to.have.been.calledWith(sinon.match({ type: 'uploadInterrupted', error: err }));
    expect(cb).to.have.been.calledWith(sinon.match({ type: 'batchFailed', error: err, batchId: 'b' }));
    expect(done).not.to.have.been.called;
  });

  test('upload skips batchFinished when the uploader is cleared mid-flight', async () => {
    const cb = sinon.spy();
    let resolveUpload;
    const upload = sinon.stub().returns(
      new Promise((r) => {
        resolveUpload = r;
      }),
    );
    const done = sinon.stub().resolves({ batch: { _batchId: 'b' } });
    const uploader = { _batchId: 'b', upload, done };
    connection.batchUpload.resolves(uploader);
    provider.upload([fakeFile()], cb);
    await flushAll();
    // Simulate cancelBatch() detaching the uploader while the POST is still pending
    provider.uploader = null;
    resolveUpload({ batch: { _batchId: 'b' }, blob: { fileIdx: 0 } });
    await new Promise((r) => setTimeout(r, 20));
    expect(done).not.to.have.been.called;
    expect(cb).not.to.have.been.calledWith(sinon.match({ type: 'batchFinished' }));
  });

  test('upload emits batchFailed when uploader.done() itself rejects', async () => {
    const cb = sinon.spy();
    const doneErr = new Error('done failed');
    const uploader = {
      _batchId: 'b',
      upload: sinon.stub().resolves({ batch: { _batchId: 'b' }, blob: { fileIdx: 0 } }),
      done: sinon.stub().rejects(doneErr),
    };
    connection.batchUpload.resolves(uploader);
    provider.upload([fakeFile()], cb);
    await new Promise((r) => setTimeout(r, 50));
    expect(cb).to.have.been.calledWith(sinon.match({ type: 'batchFailed', error: doneErr, batchId: 'b' }));
  });

  test('accepts returns false when file has no mime and no extension match', () => {
    const p = new DefaultUploadProvider(connection, '.pdf', false);
    expect(p.accepts({ name: 'noext', type: '' })).to.be.false;
  });

  test('batchExecute passes headers and context when provided', async () => {
    const op = {
      input: sinon.stub().returnsThis(),
      params: sinon.stub().returnsThis(),
      context: sinon.stub().returnsThis(),
      execute: sinon.stub().resolves('result'),
    };
    connection.operation.resolves(op);
    provider.uploader = {};
    const result = await provider.batchExecute('MyOp', { context: { foo: 'bar' }, key: 'val' }, { 'X-Custom': '1' });
    expect(op.context).to.have.been.calledWith({ foo: 'bar' });
    expect(result).to.equal('result');
  });

  test('batchExecute skips headers/context when not provided', async () => {
    const op = {
      input: sinon.stub().returnsThis(),
      params: sinon.stub().returnsThis(),
      context: sinon.stub().returnsThis(),
      execute: sinon.stub().resolves('ok'),
    };
    connection.operation.resolves(op);
    provider.uploader = {};
    await provider.batchExecute('MyOp', {}, null);
    expect(op.context).not.to.have.been.called;
  });
});

suite('Nuxeo.UploaderBehavior – host integration', () => {
  setup(async () => {
    await login();
  });

  test('uploadFiles short-circuits when files are not accepted', async () => {
    const el = await fixture(html`
      <nuxeo-file accept="image/"></nuxeo-file>
    `);
    const consoleWarn = sinon.stub(console, 'warn');
    try {
      el.uploadFiles([fakeFile('a.txt', 'text/plain')]);
      expect(consoleWarn.calledOnce).to.be.true;
      expect(consoleWarn.firstCall.args[0]).to.contain('image/');
    } finally {
      consoleWarn.restore();
    }
  });

  test('uploadFiles throws if no connection has been wired up', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    el.connection = null;
    expect(() => el.uploadFiles([fakeFile()])).to.throw(/connection/i);
  });

  test('hasAbort / hasProgress / accepts delegate to the underlying provider', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    expect(el.hasAbort()).to.be.false;
    expect(el.hasProgress()).to.be.false;
    expect(el.accepts(fakeFile())).to.be.true;
    expect(el.accepts([fakeFile(), fakeFile('b.png', 'image/png')])).to.be.true;
  });

  test('accepts returns false when no provider instance is available', () => {
    const isolated = { _instance: null, accepts: UploaderBehavior.accepts };
    expect(isolated.accepts({ length: 0 })).to.be.false;
  });

  test('_uploadStarted pushes a file with progress=0 / error=false / complete=false', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    el.files = [];
    const file = fakeFile();
    el._uploadStarted(file);
    expect(file.progress).to.equal(0);
    expect(file.error).to.be.false;
    expect(file.complete).to.be.false;
    expect(el.uploading).to.be.true;
    expect(el.files).to.have.lengthOf(1);
  });

  test('_uploadFinished marks the file as complete', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    el.files = [{ name: 'x', progress: 0, complete: false, error: false }];
    el._uploadFinished(0);
    expect(el.files[0].progress).to.equal(100);
    expect(el.files[0].complete).to.be.true;
    expect(el.files[0].index).to.equal(0);
  });

  test('_batchStart updates state and fires the batchStart event', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    setTimeout(() => el._batchStart('batch-1'), 0);
    const event = await waitForEvent(el, 'batchStart');
    expect(event.detail.batchId).to.equal('batch-1');
    expect(el.batchId).to.equal('batch-1');
  });

  test('_batchFinished resets uploading flag and fires the batchFinished event', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    el.uploading = true;
    el.files = [fakeFile('uploaded.txt')];
    setTimeout(() => el._batchFinished('batch-2'), 0);
    const event = await waitForEvent(el, 'batchFinished');
    expect(event.detail.batchId).to.equal('batch-2');
    expect(el.uploading).to.be.false;
  });

  test('_batchFailed fires batchFailed and marks unfinished files in error', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    el.files = [
      { name: 'a', complete: true },
      { name: 'b', complete: false },
    ];
    el.uploading = true;
    const err = new Error('boom');
    setTimeout(() => el._batchFailed(err, 'batch-3'), 0);
    const event = await waitForEvent(el, 'batchFailed');
    expect(event.detail.error).to.equal(err);
    expect(event.detail.batchId).to.equal('batch-3');
    expect(el.uploading).to.be.false;
    expect(el.files[0].error).to.be.false;
    expect(el.files[1].error).to.equal(err);
  });

  test('_uploadInterrupted fires the event and decorates the matching file', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    const file = fakeFile();
    el.files = [file];
    setTimeout(() => el._uploadInterrupted(file, 'oops'), 0);
    const event = await waitForEvent(el, 'uploadInterrupted');
    expect(event.detail.file).to.equal(file);
    expect(event.detail.error).to.equal('oops');
    expect(el.files[0].error).to.equal('oops');
  });

  test('_uploadInterrupted falls back to a generic message when no error is provided', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    const file = fakeFile();
    el.files = [file];
    setTimeout(() => el._uploadInterrupted(file), 0);
    const event = await waitForEvent(el, 'uploadInterrupted');
    expect(event.detail.error).to.equal('Upload Interrupted!');
  });

  test('_uploadProgressUpdated and _uploadSpeedUpdated only update the requested fields', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    el.files = [{ name: 'a' }];
    el._uploadProgressUpdated(0, 42);
    el._uploadSpeedUpdated(0, el.files[0], 100);
    expect(el.files[0].progress).to.equal(42);
    expect(el.files[0].speed).to.equal(100);
  });

  test('drag/drop helpers update the host class and prevent the default action', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    const event = { preventDefault: sinon.spy() };
    el._dragover(event);
    expect(event.preventDefault.calledOnce).to.be.true;
    el._dragleave();
    // _drop without files should still preventDefault and not throw
    const dropEvent = {
      preventDefault: sinon.spy(),
      dataTransfer: { items: [], files: [] },
    };
    el._drop(dropEvent);
    expect(dropEvent.preventDefault.calledOnce).to.be.true;
  });

  test('uploadFiles routes provider events through the right handlers', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    let cb;
    el._instance = {
      upload(_files, callback) {
        cb = callback;
      },
    };
    sinon.stub(el, 'accepts').returns(true);
    el.uploadFiles([fakeFile()]);
    const file = fakeFile();
    cb({ type: 'uploadStarted', file });
    expect(el.files[0]).to.equal(file);

    cb({ type: 'uploadProgress', fileIdx: 0, progress: 50 });
    expect(el.files[0].progress).to.equal(50);

    cb({ type: 'uploadCompleted', fileIdx: 0 });
    expect(el.files[0].complete).to.be.true;

    setTimeout(() => cb({ type: 'batchStart', batchId: 'bb' }), 0);
    const ev = await waitForEvent(el, 'batchStart');
    expect(ev.detail.batchId).to.equal('bb');

    cb({ type: 'unknown-event' });
    await flushAll();
  });

  test('uploadFiles clears files when batchAppend is false', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    el.files = [fakeFile()];
    el.batchAppend = false;
    el._instance = {
      upload() {},
    };
    sinon.stub(el, 'accepts').returns(true);
    el.uploadFiles([fakeFile()]);
    expect(el.files).to.have.lengthOf(0);
  });

  test('uploadFiles preserves files when batchAppend is true', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    el.files = [fakeFile()];
    el.batchAppend = true;
    el._instance = {
      upload(_files, callback) {
        callback({ type: 'uploadStarted', file: fakeFile() });
      },
    };
    sinon.stub(el, 'accepts').returns(true);
    el.uploadFiles([fakeFile()]);
    expect(el.files.length).to.be.above(1);
  });

  test('_uploadInterrupted fires event even when file not in list', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    const file = fakeFile();
    el.files = [];
    setTimeout(() => el._uploadInterrupted(file, 'err'), 0);
    const event = await waitForEvent(el, 'uploadInterrupted');
    expect(event.detail.error).to.equal('err');
  });

  test('_reloadProvider sets _provider to default when provider is cleared', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    el.provider = '';
    el._reloadProvider();
    expect(el._provider).to.exist;
  });

  test('_accepts returns false when _instance is null', () => {
    const isolated = { _instance: null, _accepts: UploaderBehavior._accepts };
    expect(isolated._accepts(fakeFile())).to.be.false;
  });

  test('accepts returns false for empty array when instance is null', () => {
    const isolated = { _instance: null, accepts: UploaderBehavior.accepts };
    expect(isolated.accepts([])).to.be.false;
  });

  test('_drop handles files and folders in dataTransfer', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    sinon.stub(el, 'uploadFiles');
    el.notify = sinon.stub();
    const dropEvent = {
      preventDefault: sinon.spy(),
      dataTransfer: {
        items: [
          {
            webkitGetAsEntry: () => {
              return { isDirectory: true };
            },
          },
          {
            webkitGetAsEntry: () => {
              return { isDirectory: false };
            },
          },
        ],
        files: [{}, fakeFile()],
      },
    };
    el._drop(dropEvent);
    expect(dropEvent.preventDefault).to.have.been.called;
    expect(el.uploadFiles).to.have.been.calledOnce;
    expect(el.notify).to.have.been.calledOnce;
  });

  test('_drop does not call uploadFiles when only folders', async () => {
    const el = await fixture(html`
      <nuxeo-file></nuxeo-file>
    `);
    sinon.stub(el, 'uploadFiles');
    el.notify = sinon.stub();
    const dropEvent = {
      preventDefault: sinon.spy(),
      dataTransfer: {
        items: [
          {
            webkitGetAsEntry: () => {
              return { isDirectory: true };
            },
          },
        ],
        files: [{}],
      },
    };
    el._drop(dropEvent);
    expect(el.uploadFiles).not.to.have.been.called;
    expect(el.notify).to.have.been.calledOnce;
  });
});
