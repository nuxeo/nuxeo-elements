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
import '../nuxeo-document-picker/nuxeo-document-picker.js';
import '../widgets/nuxeo-dialog.js';
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { fixture, flush, html, isElementVisible, waitForEvent } from '@nuxeo/testing-helpers';
import { LayoutBehavior } from '../nuxeo-layout-behavior.js';
import { waitForLayoutLoad } from './ui-test-helpers.js';

// Export Polymer and PolymerElement for 1.x and 2.x compat
window.Polymer = Polymer;

window.nuxeo.I18n.language = 'en';
window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
window.nuxeo.I18n.en['command.cancel'] = 'Cancel';
window.nuxeo.I18n.en['command.clear'] = 'Clear';
window.nuxeo.I18n.en['command.search'] = 'Search';
window.nuxeo.I18n.en['command.select'] = 'Select';
window.nuxeo.I18n.en['pickerSearch.title'] = 'Quick Search';
window.nuxeo.I18n.en['resultsView.filters.heading'] = 'Filters';

Nuxeo = Nuxeo || {};
Nuxeo.LayoutBehavior = LayoutBehavior;

// determine base module path (relies on @open-wc/webpack-import-meta-loader)
const { url } = import.meta;
const base = url.substring(0, url.lastIndexOf('/'));

suite('nuxeo-document-picker', () => {
  const baseUrl = `${base}/layouts/search/`;
  const buildPicker = async (searchName = 'picker', waitForLoad = true) => {
    const picker = await fixture(
      html`
        <nuxeo-document-picker
          href-base="${baseUrl}"
          provider="${searchName}"
          page-size="40"
          schemas="dublincore,file"
          enrichers="thumbnail,permissions,highlight"
          search-name="${searchName}"
        ></nuxeo-document-picker>
      `,
    );
    if (!waitForLoad) {
      return picker;
    }
    const searchForm = picker.$.resultsView.$$('nuxeo-search-form-layout');
    const searchResults = picker.$.resultsView.$$('nuxeo-search-results-layout');
    if (!searchForm.element) {
      await waitForLayoutLoad(searchForm.$.layout);
    }
    if (!searchResults.element) {
      await waitForLayoutLoad(searchResults.$.results);
    }
    await flush();
    return picker;
  };
  const waitForDialogOpen = async (dialog) => {
    if (!isElementVisible(dialog)) {
      await waitForEvent(dialog, 'iron-overlay-opened');
      await flush();
    }
  };
  const waitForDialogClose = async (dialog) => {
    if (isElementVisible(dialog)) {
      await waitForEvent(dialog, 'iron-overlay-closed');
      await flush();
    }
  };

  test('Should close the dialog when the close button is clicked', async () => {
    const picker = await buildPicker();
    const { closeButton, dialog } = picker.$;
    // dialog is closed and the button is not visible
    expect(dialog.opened).to.be.false;
    expect(isElementVisible(dialog)).to.be.false;
    expect(isElementVisible(closeButton)).to.be.false;
    // open the picker dialog
    picker.open();
    await waitForDialogOpen(dialog);
    // dialog is opened and the close button is now visible
    expect(dialog.opened).to.be.true;
    expect(isElementVisible(dialog)).to.be.true;
    expect(isElementVisible(closeButton)).to.be.true;
    // click the close button
    closeButton.click();
    await waitForDialogClose(dialog);
    // dialog is closed and the close button is no longer visible
    expect(dialog.opened).to.be.false;
    expect(isElementVisible(dialog)).to.be.false;
    expect(isElementVisible(closeButton)).to.be.false;
  });

  test('Should close the dialog when the cancel button is clicked', async () => {
    // XXX a new picker with missing layouts needs to be created for the previous one to be properly flushed
    // XXX if not, the next results layout of the next picker won't be stamped and it won't have a nuxeo-results
    await buildPicker('flush1', false);
    const picker = await buildPicker();
    const { cancelButton, dialog } = picker.$;
    // dialog is closed and the cancel button is not visible
    expect(dialog.opened).to.be.false;
    expect(isElementVisible(dialog)).to.be.false;
    expect(isElementVisible(cancelButton)).to.be.false;
    // open the picker dialog
    picker.open();
    await waitForDialogOpen(dialog);
    // dialog is opened and the cancel button is now visible
    expect(dialog.opened).to.be.true;
    expect(isElementVisible(dialog)).to.be.true;
    expect(isElementVisible(cancelButton)).to.be.true;
    // click the cancel button
    cancelButton.click();
    await waitForDialogClose(dialog);
    // dialog is closed and the cancel button is no longer visible
    expect(dialog.opened).to.be.false;
    expect(isElementVisible(dialog)).to.be.false;
    expect(isElementVisible(cancelButton)).to.be.false;
  });

  test('Should select results from the available options and return them', async () => {
    // XXX a new picker with missing layouts needs to be created for the previous one to be properly flushed
    // XXX if not, the next results layout of the next picker won't be stamped and it won't have a nuxeo-results
    await buildPicker('flush2', false);
    const picker = await buildPicker();
    const { dialog, selectButton } = picker.$;
    // dialog is closed and the select button is not visible
    expect(isElementVisible(dialog)).to.be.false;
    expect(isElementVisible(selectButton)).to.be.false;
    // open the picker dialog
    picker.open();
    await waitForDialogOpen(dialog);
    const table = picker.$.resultsView.results.results.querySelector('nuxeo-data-table');
    const checkboxes = Array.from(table.querySelectorAll('nuxeo-data-table-checkbox:not([header])'));
    // dialog is opened and the select button is now visible, but disabled
    expect(isElementVisible(dialog)).to.be.true;
    expect(isElementVisible(selectButton)).to.be.true;
    expect(selectButton.disabled).to.be.true;
    // table contains 3 unselected results
    expect(table.selectedItems).to.have.lengthOf(0);
    expect(table.items).to.have.lengthOf(3);
    expect(checkboxes).to.have.lengthOf(3);
    // select the first result
    checkboxes[0].click();
    // select button is still visible and now enabled
    expect(isElementVisible(selectButton)).to.be.true;
    expect(selectButton.disabled).to.be.false;
    // table contains 3 results, the first of them is selected
    expect(table.selectedItems).to.have.lengthOf(1);
    expect(table.selectedItems[0].uid).to.equal('uid1');
    expect(table.items).to.have.lengthOf(3);
    expect(checkboxes).to.have.lengthOf(3);
    // setup a listener so that when the picked event is fired (after confirming the selection) it can be validated
    const receivedEvent = new Promise((resolve) => {
      document.addEventListener('picked', (e) => {
        const { selectedItems } = e.detail;
        expect(selectedItems).to.have.lengthOf(1);
        expect(selectedItems[0].uid).to.equal('uid1');
        resolve(e);
      });
    });
    // click the select button
    selectButton.click();
    await waitForDialogClose(dialog);
    // wait for the picked event
    await receivedEvent;
    // dialog is closed and the select button is no longer visible
    expect(isElementVisible(dialog)).to.be.false;
    expect(isElementVisible(selectButton)).to.be.false;
  });

  test('Should refine the results through a search and clear it', async () => {
    // XXX a new picker with missing layouts needs to be created for the previous one to be properly flushed
    // XXX if not, the next results layout of the next picker won't be stamped and it won't have a nuxeo-results
    await buildPicker('flush3', false);
    const picker = await buildPicker();
    const { dialog } = picker.$;
    // open the picker dialog
    picker.open();
    await waitForDialogOpen(dialog);
    // get all the relevant elements in the picker dialog
    const { searchInput } = picker.$.resultsView.form.$;
    const resultsViewForm = picker.$.resultsView.$$('div.form');
    const clearButton = resultsViewForm.querySelector('paper-button.clear');
    const searchButton = resultsViewForm.querySelector('paper-button.search');
    const table = picker.$.resultsView.results.results.querySelector('nuxeo-data-table');
    // search input is empty
    expect(searchInput.value).to.be.undefined;
    // table contains 3 unselected results
    expect(table.selectedItems).to.have.lengthOf(0);
    expect(table.items).to.have.lengthOf(3);
    // search for 'green' documents
    searchInput.value = 'green';
    searchButton.click();
    // table contains a single unselected result
    expect(table.selectedItems).to.have.lengthOf(0);
    expect(table.items).to.have.lengthOf(1);
    expect(table.items[0].title).to.equal('Swirl Blue Green');
    // clear the search
    clearButton.click();
    // search input is empty
    expect(searchInput.value).to.be.undefined;
    // table contains 3 unselected results
    expect(table.selectedItems).to.have.lengthOf(0);
    expect(table.items).to.have.lengthOf(3);
  });
});
