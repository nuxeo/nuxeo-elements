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
import { fixture, flush, html, isElementVisible, tap, waitForEvent } from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom';
import '../actions/nuxeo-delete-document-button.js';

const getActionDiv = (button) => dom(button.root).querySelector('.action');

suite('nuxeo-delete-document-button', () => {
  let button;

  const deletableDocument = {
    'entity-type': 'document',
    uid: '1',
    contextParameters: {
      permissions: ['Remove'],
    },
    facets: [],
    isTrashed: false,
    isVersion: false,
    type: 'File',
  };

  setup(async () => {
    button = await fixture(
      html`
        <nuxeo-delete-document-button></nuxeo-delete-document-button>
      `,
    );
  });

  suite('Button Visibility', () => {
    test('Should not be visible when document is null', async () => {
      button.document = null;
      await flush();
      expect(isElementVisible(getActionDiv(button))).to.be.false;
    });

    test('Should not be visible when document is a version', async () => {
      button.document = {
        isVersion: true,
      };
      await flush();
      expect(isElementVisible(getActionDiv(button))).to.be.false;
    });

    test('Should not be visible when no "Remove" permissions is granted', async () => {
      button.document = {
        contextParameters: {
          permissions: ['Read'],
        },
        isVersion: false,
      };
      await flush();
      expect(isElementVisible(getActionDiv(button))).to.be.false;
    });

    test('Should not be visible when document is already trashed and no hard deletion is desired', async () => {
      button.document = {
        contextParameters: {
          permissions: ['Remove'],
        },
        isTrashed: true,
        isVersion: false,
      };
      await flush();
      expect(isElementVisible(getActionDiv(button))).to.be.false;
    });

    test('Should be visible otherwise', async () => {
      button.document = deletableDocument;
      await flush();

      const actionDiv = getActionDiv(button);
      expect(isElementVisible(actionDiv)).to.be.true;
      expect(isElementVisible(actionDiv.querySelector('paper-icon-button'))).to.be.true;
      expect(isElementVisible(actionDiv.querySelector('.label'))).to.be.false;
    });

    test('Should have corresponding information when "hard" property is set', async () => {
      button.document = deletableDocument;
      button.hard = true;
      button.showLabel = true;
      await flush();

      const actionDiv = getActionDiv(button);
      expect(isElementVisible(actionDiv)).to.be.true;

      const label = actionDiv.querySelector('.label');
      expect(isElementVisible(label)).to.be.true;
      expect(label.textContent.trim()).to.equal('deleteButton.tooltip.permanently');

      const icon = actionDiv.querySelector('paper-icon-button');
      expect(isElementVisible(icon)).to.be.true;
      expect(icon.icon).to.equal('nuxeo:delete-permanently');
    });

    test('Should have corresponding information when "hard" property is not set', async () => {
      button.document = deletableDocument;
      button.showLabel = true;
      await flush();

      const actionDiv = getActionDiv(button);
      expect(isElementVisible(actionDiv)).to.be.true;

      const label = actionDiv.querySelector('.label');
      expect(isElementVisible(label)).to.be.true;
      expect(label.textContent.trim()).to.equal('deleteButton.tooltip');

      const icon = actionDiv.querySelector('paper-icon-button');
      expect(isElementVisible(icon)).to.be.true;
      expect(icon.icon).to.equal('nuxeo:delete');
    });
  });

  suite('Operation Calling', () => {
    setup(async () => {
      button.document = deletableDocument;
      await flush();
    });

    teardown(() => {
      window.confirm.restore();
    });

    test('Should not call any operation when the confirmation is not done', async () => {
      sinon.stub(window, 'confirm').returns(false);
      sinon.spy(button.$.deleteOp, 'execute');
      sinon.spy(button.$.trashOp, 'execute');

      const actionDiv = getActionDiv(button);
      tap(actionDiv);

      expect(button.$.deleteOp.execute.notCalled).to.be.true;
      expect(button.$.trashOp.execute.notCalled).to.be.true;
    });

    test('Should call Document.Delete operation when "hard" property is set', async () => {
      sinon.stub(window, 'confirm').returns(true);
      sinon.spy(button.$.deleteOp, 'execute');
      sinon.spy(button.$.trashOp, 'execute');

      button.hard = true;
      await flush();
      const actionDiv = getActionDiv(button);
      tap(actionDiv);

      expect(button.$.deleteOp.execute.calledOnce).to.be.true;
      expect(button.$.trashOp.execute.notCalled).to.be.true;
    });

    test('Should call Document.Trash operation when "hard" property is not set', async () => {
      sinon.stub(window, 'confirm').returns(true);
      sinon.spy(button.$.deleteOp, 'execute');
      sinon.spy(button.$.trashOp, 'execute');

      const actionDiv = getActionDiv(button);
      tap(actionDiv);

      expect(button.$.deleteOp.execute.notCalled).to.be.true;
      expect(button.$.trashOp.execute.calledOnce).to.be.true;
    });

    test('Should return "document-deleted" event when operation returns an error', async () => {
      sinon.stub(window, 'confirm').returns(true);
      sinon.stub(button.$.trashOp, 'execute').rejects(new Error('Some error'));

      const actionDiv = getActionDiv(button);
      tap(actionDiv);

      expect(button.$.trashOp.execute.calledOnce).to.be.true;

      const event = await waitForEvent(button, 'document-deleted');
      expect(event.detail).to.exist.and.to.have.keys(['doc', 'error', 'hard']);
      expect(event.detail.doc).to.equal(deletableDocument);
      expect(event.detail.error).to.not.be.null;
      expect(event.detail.hard).to.be.false;
    });

    test('Should also return "document-deleted" event when operation is successful', async () => {
      sinon.stub(window, 'confirm').returns(true);
      sinon.stub(button.$.deleteOp, 'execute').resolves();

      button.hard = true;
      await flush();
      const actionDiv = getActionDiv(button);
      tap(actionDiv);

      expect(button.$.deleteOp.execute.calledOnce).to.be.true;

      const event = await waitForEvent(button, 'document-deleted');
      expect(event.detail)
        .to.exist.and.to.have.keys(['doc', 'hard'])
        .and.not.to.have.key('error');
      expect(event.detail.doc).to.equal(deletableDocument);
      expect(event.detail.hard).to.be.true;
    });
  });
});
