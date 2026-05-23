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
import { fixture, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-operation-button.js';

suite('nuxeo-operation-button', () => {
  let el;

  setup(async () => {
    el = await fixture(html`
      <nuxeo-operation-button label="my.label"></nuxeo-operation-button>
    `);
  });

  test('should return the element name', () => {
    expect(Nuxeo.OperationButton.is).to.equal('nuxeo-operation-button');
  });

  test('should have default property values', () => {
    expect(Nuxeo.OperationButton.properties.showLabel.value).to.be.false;
    expect(Nuxeo.OperationButton.properties.tooltipPosition.value).to.equal('bottom');
    expect(Nuxeo.OperationButton.properties.event.value).to.equal('operation-executed');
    expect(Nuxeo.OperationButton.properties.async.value).to.be.false;
    expect(Nuxeo.OperationButton.properties.pollInterval.value).to.equal(1000);
    expect(Nuxeo.OperationButton.properties.download.value).to.be.false;
  });

  suite('_computeTooltip', () => {
    test('returns tooltip when provided', () => {
      expect(el._computeTooltip('my-tooltip', 'my-label')).to.equal('my-tooltip');
    });

    test('falls back to label when no tooltip is provided', () => {
      expect(el._computeTooltip(undefined, 'my-label')).to.equal('my-label');
    });

    test('falls back to label when tooltip is empty', () => {
      expect(el._computeTooltip('', 'my-label')).to.equal('my-label');
    });
  });

  suite('_hasBulkStatus', () => {
    test('returns truthy when entity-type is bulkStatus', () => {
      expect(el._hasBulkStatus({ 'entity-type': 'bulkStatus' })).to.be.ok;
    });

    test('returns falsy when entity-type is something else', () => {
      expect(el._hasBulkStatus({ 'entity-type': 'document' })).to.not.be.ok;
    });

    test('returns falsy for null/undefined', () => {
      expect(el._hasBulkStatus(null)).to.not.be.ok;
      expect(el._hasBulkStatus(undefined)).to.not.be.ok;
    });
  });

  suite('_isRunning', () => {
    test('returns true when bulkStatus is RUNNING (state)', () => {
      expect(el._isRunning({ 'entity-type': 'bulkStatus', state: 'RUNNING' })).to.be.true;
    });

    test('returns true when bulkStatus is RUNNING (value.state)', () => {
      expect(el._isRunning({ 'entity-type': 'bulkStatus', value: { state: 'RUNNING' } })).to.be.true;
    });

    test('returns false when bulkStatus is not RUNNING', () => {
      expect(el._isRunning({ 'entity-type': 'bulkStatus', state: 'COMPLETED' })).to.be.false;
    });

    test('returns true when plain status is "RUNNING"', () => {
      expect(el._isRunning('RUNNING')).to.be.true;
    });

    test('returns false when plain status is anything else', () => {
      expect(el._isRunning('IDLE')).to.be.false;
    });
  });

  suite('_isAborted', () => {
    test('returns true when bulkStatus state is ABORTED', () => {
      expect(el._isAborted({ 'entity-type': 'bulkStatus', state: 'ABORTED' })).to.be.true;
    });

    test('returns true when bulkStatus value.state is ABORTED', () => {
      expect(el._isAborted({ 'entity-type': 'bulkStatus', value: { state: 'ABORTED' } })).to.be.true;
    });

    test('returns false when bulkStatus is RUNNING', () => {
      expect(el._isAborted({ 'entity-type': 'bulkStatus', state: 'RUNNING' })).to.be.false;
    });

    test('returns true for non-bulk status when not running', () => {
      expect(el._isAborted('IDLE')).to.be.true;
    });

    test('returns false for non-bulk status that is running', () => {
      expect(el._isAborted('RUNNING')).to.be.false;
    });
  });

  suite('_isPageProviderDisplayBehavior', () => {
    test('returns truthy when input has all required behaviors', () => {
      const previous = Nuxeo.PageProviderDisplayBehavior;
      const fakeBehavior = { foo: 'bar' };
      Nuxeo.PageProviderDisplayBehavior = [fakeBehavior];
      try {
        const input = { behaviors: [fakeBehavior] };
        expect(el._isPageProviderDisplayBehavior(input)).to.be.ok;
      } finally {
        Nuxeo.PageProviderDisplayBehavior = previous;
      }
    });

    test('returns falsy when input lacks behaviors', () => {
      expect(el._isPageProviderDisplayBehavior({})).to.not.be.ok;
    });

    test('returns falsy for null input', () => {
      expect(el._isPageProviderDisplayBehavior(null)).to.not.be.ok;
    });
  });

  suite('_isSelectAllActive', () => {
    test('returns falsy when input is not a page provider display', () => {
      expect(el._isSelectAllActive({})).to.not.be.ok;
    });
  });

  suite('_onPollStart', () => {
    test('does nothing without commandId in detail', () => {
      const spy = sinon.spy(el, 'notify');
      el._onPollStart({ detail: {} });
      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('notifies a scheduled message when commandId is present', () => {
      const spy = sinon.spy(el, 'notify');
      el._onPollStart({ detail: { commandId: 'cmd1' } });
      expect(spy).to.have.been.called;
      const arg = spy.firstCall.args[0];
      expect(arg.commandId).to.equal('cmd1');
      expect(arg.dismissible).to.be.true;
      spy.restore();
    });
  });

  suite('_onPollUpdate', () => {
    test('does nothing without commandId', () => {
      const spy = sinon.spy(el, 'notify');
      el._onPollUpdate({ detail: {} });
      expect(spy).to.not.have.been.called;
      spy.restore();
    });

    test('notifies running message when status is RUNNING', () => {
      const spy = sinon.spy(el, 'notify');
      el._onPollUpdate({
        detail: { 'entity-type': 'bulkStatus', commandId: 'cmd1', processed: 1, total: 2, state: 'RUNNING' },
      });
      expect(spy).to.have.been.called;
      const arg = spy.firstCall.args[0];
      expect(arg.commandId).to.equal('cmd1');
      spy.restore();
    });

    test('notifies scheduled message when status is not RUNNING', () => {
      const spy = sinon.spy(el, 'notify');
      el._onPollUpdate({
        detail: { 'entity-type': 'bulkStatus', commandId: 'cmd1', processed: 1, total: 2, state: 'COMPLETED' },
      });
      expect(spy).to.have.been.called;
      spy.restore();
    });
  });

  suite('_onPollError', () => {
    test('notifies an error message', () => {
      const spy = sinon.spy(el, 'notify');
      el._onPollError({ detail: { error: 'oops' } });
      expect(spy).to.have.been.called;
      const arg = spy.firstCall.args[0];
      expect(arg.error).to.exist;
      spy.restore();
    });
  });

  suite('_triggerDownload', () => {
    test('creates and clicks an anchor element', () => {
      const realCreate = document.createElement.bind(document);
      const anchor = realCreate('a');
      const clickStub = sinon.stub(anchor, 'click');
      const createStub = sinon.stub(document, 'createElement').callsFake((tag) => {
        if (tag === 'a') {
          return anchor;
        }
        return realCreate(tag);
      });
      try {
        el._triggerDownload('file.txt', 'about:blank');
        expect(clickStub).to.have.been.called;
        expect(anchor.download).to.equal('file.txt');
        expect(anchor.getAttribute('href')).to.equal('about:blank');
      } finally {
        createStub.restore();
      }
    });
  });

  suite('_download', () => {
    test('without content-disposition triggers anchor download with url', () => {
      const downloadStub = sinon.stub(el, '_triggerDownload');
      el._download({ url: 'http://example/file.bin', headers: { get: () => null } });
      expect(downloadStub).to.have.been.calledWith('', 'http://example/file.bin');
      downloadStub.restore();
    });

    test('with content-disposition + async triggers anchor download with url', () => {
      const downloadStub = sinon.stub(el, '_triggerDownload');
      el.async = true;
      const response = {
        url: 'http://example/file.bin',
        headers: { get: () => 'attachment; filename=my-file.txt' },
      };
      el._download(response);
      expect(downloadStub).to.have.been.called;
      downloadStub.restore();
    });
  });
});
