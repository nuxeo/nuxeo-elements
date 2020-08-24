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
import { fixture, flush, html, login } from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
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
  window.Nuxeo = window.Nuxeo || {};
  window.Nuxeo.UI = window.Nuxeo.UI || {};
  window.Nuxeo.UI.config = window.Nuxeo.UI.config || {};
  window.Nuxeo.UI.config.router = window.Nuxeo.UI.config.router || {};
  window.Nuxeo.UI.config.router.key = window.Nuxeo.UI.config.router.key || {};
  window.Nuxeo.UI.config.router.key = window.Nuxeo.UI.config.router.key || {};
  window.Nuxeo.UI.config.router.key[entityType] = value;
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
