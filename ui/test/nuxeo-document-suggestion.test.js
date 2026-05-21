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
import { fixture, flush, html, login } from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { config } from '@nuxeo/nuxeo-elements';
import '../widgets/nuxeo-document-suggestion.js';

// Return Selectivity Entries
function getSuggestions(suggestionWidget, timeout = 1000) {
  const s2 = dom(suggestionWidget.root).querySelector('#s2');
  const start = Date.now();
  const waitForLoaded = (resolve, reject) => {
    const result = dom(s2.root).querySelectorAll(
      `.selectivity-${suggestionWidget.multiple ? 'multiple' : 'single'}-selected-item`,
    );
    const timedOut = timeout && Date.now() - start >= timeout;
    if (result && (result.length > 0 || timedOut)) {
      resolve(Array.from(result));
    } else if (timedOut) {
      reject(new Error('Timeout: No suggestions'));
    } else {
      setTimeout(waitForLoaded.bind(this, resolve, reject), 30);
    }
  };
  return new Promise(waitForLoaded);
}

// Mock router
const router = {
  browse: (path) => path,
  document: (uid) => `/doc/${uid}`,
};

function setNuxeoRouterKey(entityType, value) {
  config.set(`router.key.${entityType}`, value);
}

suite('nuxeo-document-suggestion', () => {
  let server;

  setup(async () => {
    server = await login();
    server.respondWith('POST', '/api/v1/automation/Document.FetchByProperty', (xhr) => {
      const { params } = JSON.parse(xhr.requestBody);
      const response = {
        'entity-type': 'documents',
        entries: [],
      };

      // Mock response according to request body parameters
      if (params.values === 'existingDocId' || params.values.includes('existingDocId')) {
        response.entries.push({
          'entity-type': 'document',
          facets: ['Folderish', 'NXTag', 'SuperSpace'],
          path: '/default-domain/workspaces/toto',
          repository: 'default',
          state: 'project',
          title: 'Some Title',
          type: 'Workspace',
          uid: 'existingDocId',
        });
      }
      xhr.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(response));
    });
  });

  let widget;

  suite('Single Suggestion Selection', () => {
    setup(async () => {
      widget = await fixture(html`
        <nuxeo-document-suggestion readonly .router=${router}></nuxeo-document-suggestion>
      `);
      sinon.spy(widget, '_resolveDocs');
    });

    test('Should be able to resolve document and display its title', async () => {
      widget.value = 'existingDocId';
      await flush();
      const entries = await getSuggestions(widget);
      expect(entries.length).to.be.equal(1);
      expect(entries[0].childElementCount).to.be.equal(1);
      expect(entries[0].children[0].nodeName.toLowerCase()).to.be.equal('a');
      expect(entries[0].children[0].textContent).to.be.equal('Some Title');
      expect(entries[0].children[0].href.endsWith('/default-domain/workspaces/toto')).to.be.true;
      expect(widget._resolveDocs.calledOnce).to.be.equal(true);
    });

    test('Should be able to resolve document and display its title when resolving with document UID', async () => {
      setNuxeoRouterKey('document', 'uid');
      widget.value = 'existingDocId';
      await flush();
      const entries = await getSuggestions(widget);
      setNuxeoRouterKey('document'); // reset document key to undefined
      expect(entries.length).to.be.equal(1);
      expect(entries[0].childElementCount).to.be.equal(1);
      expect(entries[0].children[0].nodeName.toLowerCase()).to.be.equal('a');
      expect(entries[0].children[0].textContent).to.be.equal('Some Title');
      expect(entries[0].children[0].href.endsWith('/doc/existingDocId')).to.be.true;
      expect(widget._resolveDocs.calledOnce).to.be.equal(true);
    });

    test('Should not be able to resolve document but display its UID', async () => {
      widget.value = 'deletedDocId';
      await flush();
      const entries = await getSuggestions(widget);
      expect(entries.length).to.be.equal(1);
      expect(entries[0].childElementCount).to.be.equal(1);
      expect(entries[0].children[0].nodeName.toLowerCase()).to.be.equal('span');
      expect(entries[0].children[0].textContent).to.be.equal('deletedDocId');
      expect(widget._resolveDocs.calledOnce).to.be.equal(true);
    });

    test('Should be able to handle empty value', async () => {
      widget.value = '';
      await flush();
      const entries = await getSuggestions(widget);
      expect(entries.length).to.be.equal(0);
      expect(widget._resolveDocs.notCalled).to.be.equal(true);
    });

    test('Should not need to resolve document since it already exists', async () => {
      widget.value = {
        'entity-type': 'document',
        facets: ['Folderish', 'NXTag', 'SuperSpace'],
        path: '/default-domain/workspaces/toto',
        repository: 'default',
        state: 'project',
        title: 'Some Title',
        type: 'Workspace',
        uid: 'existingDocId',
      };
      await flush();
      const entries = await getSuggestions(widget);
      expect(entries.length).to.be.equal(1);
      expect(entries[0].childElementCount).to.be.equal(1);
      expect(entries[0].children[0].nodeName.toLowerCase()).to.be.equal('a');
      expect(entries[0].children[0].textContent).to.be.equal('Some Title');
      expect(widget._resolveDocs.notCalled).to.be.equal(true);
    });
  });

  suite('Multiple Suggestion Selection', () => {
    setup(async () => {
      widget = await fixture(html`
        <nuxeo-document-suggestion readonly multiple .router=${router}></nuxeo-document-suggestion>
      `);
      sinon.spy(widget, '_resolveDocs');
    });

    test('Should be able to resolve the existing documents and reconciliate the deleted ones', async () => {
      widget.value = ['existingDocId', 'deletedDocId'];
      await flush();
      const entries = await getSuggestions(widget);
      expect(entries.length).to.be.equal(2);
      expect(entries[0].childElementCount).to.be.equal(1);
      expect(entries[0].children[0].nodeName.toLowerCase()).to.be.equal('a');
      expect(entries[0].children[0].textContent).to.be.equal('Some Title');
      expect(entries[0].children[0].href.endsWith('/default-domain/workspaces/toto')).to.be.true;

      expect(entries[1].childElementCount).to.be.equal(1);
      expect(entries[1].children[0].nodeName.toLowerCase()).to.be.equal('span');
      expect(entries[1].children[0].textContent).to.be.equal('deletedDocId');

      expect(widget._resolveDocs.calledOnce).to.be.equal(true);
    });

    test('Should be able to resolve the existing documents and reconciliate when resolving with UID', async () => {
      setNuxeoRouterKey('document', 'uid');
      widget.value = ['existingDocId', 'deletedDocId'];
      await flush();
      const entries = await getSuggestions(widget);
      setNuxeoRouterKey('document'); // reset document key to undefined
      expect(entries.length).to.be.equal(2);
      expect(entries[0].childElementCount).to.be.equal(1);
      expect(entries[0].children[0].nodeName.toLowerCase()).to.be.equal('a');
      expect(entries[0].children[0].textContent).to.be.equal('Some Title');
      expect(entries[0].children[0].href.endsWith('/doc/existingDocId')).to.be.true;

      expect(entries[1].childElementCount).to.be.equal(1);
      expect(entries[1].children[0].nodeName.toLowerCase()).to.be.equal('span');
      expect(entries[1].children[0].textContent).to.be.equal('deletedDocId');

      expect(widget._resolveDocs.calledOnce).to.be.equal(true);
    });

    test('Should not need to resolve documents since, at least, one is already resolved', async () => {
      widget.value = [
        'deletedDocId',
        {
          'entity-type': 'document',
          facets: ['Folderish', 'NXTag', 'SuperSpace'],
          path: '/default-domain/workspaces/toto',
          repository: 'default',
          state: 'project',
          title: 'Some Title',
          type: 'Workspace',
          uid: 'existingDocId',
        },
      ];
      await flush();
      const entries = await getSuggestions(widget);
      expect(entries.length).to.be.equal(2);

      expect(entries[0].childElementCount).to.be.equal(1);
      expect(entries[0].children[0].nodeName.toLowerCase()).to.be.equal('span');
      expect(entries[0].children[0].textContent).to.be.equal('deletedDocId');

      expect(entries[1].childElementCount).to.be.equal(1);
      expect(entries[1].children[0].nodeName.toLowerCase()).to.be.equal('a');
      expect(entries[1].children[0].textContent).to.be.equal('Some Title');

      expect(widget._resolveDocs.notCalled).to.be.equal(true);
    });

    test('Should be able to handle empty value', async () => {
      widget.value = [];
      await flush();
      const entries = await getSuggestions(widget);
      expect(entries.length).to.be.equal(0);
      expect(widget._resolveDocs.notCalled).to.be.equal(true);
    });
  });
});

suite('nuxeo-document-suggestion extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-document-suggestion></nuxeo-document-suggestion>
      `,
    );
  });

  suite('_selectionFormatter', () => {
    test('returns anchor tag for document object', () => {
      const doc = { title: 'My Doc', uid: 'id1', path: '/my/doc' };
      const fn = Nuxeo.DocumentSuggestion.prototype._selectionFormatter;
      const ctx = { urlFor: () => '/doc/id1' };
      const result = fn.call(ctx, doc);
      expect(result).to.include('<a');
      expect(result).to.include('My Doc');
    });

    test('returns span for string input', () => {
      const result = el._selectionFormatter('plain-string');
      expect(result).to.include('<span>');
      expect(result).to.include('plain-string');
    });
  });

  suite('_resultFormatter', () => {
    test('returns title and path in escaped form', () => {
      const doc = { title: 'Doc', path: '/a/b' };
      const result = el._resultFormatter(doc);
      expect(result).to.include('Doc');
      expect(result).to.include('a');
      expect(result).to.include('b');
    });
  });

  suite('_docIdFunction', () => {
    test('returns string as-is', () => {
      expect(el._docIdFunction('some-id')).to.equal('some-id');
    });

    test('returns uid when idProperty is ecm:uuid', () => {
      el.idProperty = 'ecm:uuid';
      expect(el._docIdFunction({ uid: 'u1', path: '/p' })).to.equal('u1');
    });

    test('returns path when idProperty is ecm:path', () => {
      el.idProperty = 'ecm:path';
      expect(el._docIdFunction({ uid: 'u1', path: '/p' })).to.equal('/p');
    });

    test('returns property value for custom idProperty', () => {
      el.idProperty = 'dc:title';
      expect(el._docIdFunction({ properties: { 'dc:title': 'MyTitle' } })).to.equal('MyTitle');
    });
  });

  suite('_computeParams', () => {
    test('includes default params', () => {
      const result = el._computeParams();
      expect(result.providerName).to.equal('default_document_suggestion');
      expect(result.pageProviderName).to.equal('default_document_suggestion');
      expect(result.repository).to.equal('default');
      expect(result.page).to.equal(0);
      expect(result.pageSize).to.equal(20);
    });

    test('merges custom params', () => {
      el.params = { customKey: 'val' };
      const result = el._computeParams();
      expect(result.customKey).to.equal('val');
    });
  });

  suite('_initSelection', () => {
    test('returns undefined when element is null', () => {
      expect(el._initSelection(null, sinon.spy())).to.be.undefined;
    });

    test('calls callback directly for object elements (not id refs)', () => {
      const cb = sinon.spy();
      const item = { title: 'Doc', uid: 'u1' };
      el._initSelection(item, cb);
      expect(cb).to.have.been.calledWith(item);
    });

    test('warns for unknown format entries', () => {
      const warnStub = sinon.stub(console, 'warn');
      el._initSelection(42, sinon.spy());
      expect(warnStub).to.have.been.calledOnce;
      warnStub.restore();
    });

    test('resolves string element via _resolveDocs', () => {
      const resolveStub = sinon.stub(el, '_resolveDocs');
      el._initSelection('some-id', sinon.spy());
      expect(resolveStub).to.have.been.calledOnce;
      resolveStub.restore();
    });

    test('handles multiple: resolves array of strings', () => {
      el.multiple = true;
      const resolveStub = sinon.stub(el, '_resolveDocs');
      el._initSelection(['id1', 'id2'], sinon.spy());
      expect(resolveStub).to.have.been.calledOnce;
      resolveStub.restore();
    });

    test('handles multiple: calls callback for array of objects', () => {
      el.multiple = true;
      const cb = sinon.spy();
      const items = [
        { title: 'A', uid: 'a' },
        { title: 'B', uid: 'b' },
      ];
      el._initSelection(items, cb);
      expect(cb).to.have.been.calledWith(items);
    });

    test('handles multiple: warns for unknown format in array', () => {
      el.multiple = true;
      const warnStub = sinon.stub(console, 'warn');
      el._initSelection([42, 43], sinon.spy());
      expect(warnStub).to.have.been.calledOnce;
      warnStub.restore();
    });

    test('handles multiple: empty string array calls callback', () => {
      el.multiple = true;
      const cb = sinon.spy();
      el._initSelection([], cb);
      expect(cb).to.have.been.calledWith([]);
    });
  });

  suite('_resolveDocs', () => {
    test('calls operation and returns single entry for non-multiple', () => {
      el.multiple = false;
      const entry = { uid: 'u1', title: 'Doc' };
      sinon.stub(el.$.op, 'execute').resolves({ entries: [entry] });
      const cb = sinon.spy();
      el._resolveDocs('u1', cb);
      return new Promise((r) => setTimeout(r, 50)).then(() => {
        expect(cb).to.have.been.calledWith(entry);
        el.$.op.execute.restore();
      });
    });

    test('returns docs when entries is empty for non-multiple', () => {
      el.multiple = false;
      sinon.stub(el.$.op, 'execute').resolves({ entries: [] });
      const cb = sinon.spy();
      el._resolveDocs('u1', cb);
      return new Promise((r) => setTimeout(r, 50)).then(() => {
        expect(cb).to.have.been.calledWith('u1');
        el.$.op.execute.restore();
      });
    });

    test('reconciles missing entries for multiple', () => {
      el.multiple = true;
      el.idProperty = 'ecm:uuid';
      const entry = { uid: 'u1', title: 'Doc' };
      sinon.stub(el.$.op, 'execute').resolves({ entries: [entry] });
      const cb = sinon.spy();
      el._resolveDocs(['u1', 'u2'], cb);
      return new Promise((r) => setTimeout(r, 50)).then(() => {
        expect(cb).to.have.been.calledOnce;
        const args = cb.firstCall.args[0];
        expect(args).to.have.lengthOf(2);
        expect(args[0]).to.equal(entry);
        expect(args[1]).to.equal('u2');
        el.$.op.execute.restore();
      });
    });

    test('returns all entries when counts match for multiple', () => {
      el.multiple = true;
      const e1 = { uid: 'u1' };
      const e2 = { uid: 'u2' };
      sinon.stub(el.$.op, 'execute').resolves({ entries: [e1, e2] });
      const cb = sinon.spy();
      el._resolveDocs(['u1', 'u2'], cb);
      return new Promise((r) => setTimeout(r, 50)).then(() => {
        expect(cb).to.have.been.calledWith([e1, e2]);
        el.$.op.execute.restore();
      });
    });
  });
});
