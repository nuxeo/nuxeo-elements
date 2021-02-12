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
import '@webcomponents/html-imports/html-imports.min.js';
import '../nuxeo-data-table/iron-data-table.js';
import '../nuxeo-data-grid/nuxeo-data-grid.js';
import '../nuxeo-data-list/nuxeo-data-list.js';
import '../search/nuxeo-search-results-layout.js';
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { fixture, flush, isElementVisible, html } from '@nuxeo/testing-helpers';
import { waitForLayoutLoad } from './ui-test-helpers.js';
import { LayoutBehavior } from '../nuxeo-layout-behavior.js';

// Export Polymer and PolymerElement for 1.x and 2.x compat
window.Polymer = Polymer;

window.nuxeo.I18n.language = 'en';
window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
window.nuxeo.I18n.en['searchResults.layoutNotFound'] = 'Failed to find search layout for {0}.';

Nuxeo = Nuxeo || {};
Nuxeo.LayoutBehavior = LayoutBehavior;

// determine base module path (relies on @open-wc/webpack-import-meta-loader)
const { url } = import.meta;
const base = url.substring(0, url.lastIndexOf('/'));

suite('nuxeo-search-results-layout', () => {
  let searchResultsLayout;
  const baseUrl = `${base}/layouts/search/`;

  const buildLayout = async (searchName = 'test') => {
    const sl = await fixture(
      html`
        <nuxeo-search-results-layout search-name="${searchName}" href-base="${baseUrl}"> </nuxeo-search-results-layout>
      `,
    );
    if (!sl.element) {
      await waitForLayoutLoad(sl.$.results);
    }
    await flush();
    return sl;
  };

  const assertNotFound = () => {
    expect(isElementVisible(searchResultsLayout.$.results.$.error)).to.be.true;
    expect(searchResultsLayout.$.results.$.error.code).to.equal('404');
    expect(searchResultsLayout.$.results.$.error.message).to.equal(
      `Failed to find search layout for ${searchResultsLayout.searchName}.`,
    );
  };

  test('Should display an error when the layout is not found', async () => {
    searchResultsLayout = await buildLayout('other');
    // we have no such results layout, so it will result in 404
    assertNotFound();
  });

  test('Should load a layout when a search name is provided', async () => {
    searchResultsLayout = await buildLayout();
    // check the load of the layout
    expect(searchResultsLayout.element).to.exist;
    expect(searchResultsLayout.element.tagName).to.equal('NUXEO-TEST-SEARCH-RESULTS');
    // assert layout integrity
    const { children } = searchResultsLayout.element.shadowRoot;
    expect(children).to.have.lengthOf(1);
    expect(children[0].tagName).to.equal('NUXEO-RESULTS');
    const dataGrid = children[0].children[0];
    expect(dataGrid.tagName).to.equal('NUXEO-DATA-GRID');
    const dataTable = children[0].children[1];
    expect(dataTable.tagName).to.equal('NUXEO-DATA-TABLE');
    const dataList = children[0].children[2];
    expect(dataList.tagName).to.equal('NUXEO-DATA-LIST');
    expect(dataTable.children).to.have.lengthOf(3);
    expect(dataTable.children[0].tagName).to.equal('NUXEO-DATA-TABLE-COLUMN');
    expect(dataTable.children[1].tagName).to.equal('NUXEO-DATA-TABLE-COLUMN');
    expect(dataTable.children[2].tagName).to.equal('NUXEO-DATA-TABLE-ROW');
  });

  test('Should get the results when triggering the fetch of the loaded layout', async () => {
    searchResultsLayout = await buildLayout();
    sinon.spy(searchResultsLayout.results, 'fetch');
    await searchResultsLayout.fetch();
    expect(searchResultsLayout.results.fetch.calledOnce).to.be.true;
    const { items } = searchResultsLayout.results.view;
    expect(items.length).to.equal(2);
    expect(items[0].uid).to.equal('uid1');
    expect(items[1].uid).to.equal('uid2');
  });

  test('Should clear the results when triggering the reset of the loaded layout', async () => {
    searchResultsLayout = await buildLayout();
    sinon.spy(searchResultsLayout.results, 'fetch');
    await searchResultsLayout.fetch();
    expect(searchResultsLayout.results.fetch.calledOnce).to.be.true;
    sinon.spy(searchResultsLayout.results, 'reset');
    await searchResultsLayout.reset();
    expect(searchResultsLayout.results.reset.calledOnce).to.be.true;
    expect(searchResultsLayout.results.view.items.length).to.equal(0);
  });
});
