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
import '@webcomponents/html-imports/html-imports.min.js';
import '../nuxeo-data-table/iron-data-table.js';
import '../nuxeo-document-picker/nuxeo-document-picker.js';
import '../widgets/nuxeo-dialog.js';
import '../widgets/nuxeo-input.js';
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
window.nuxeo.I18n.en['documentPicker.dialog'] = 'Select documents';
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
    const picker = await buildPicker();
    const { dialog, selectButton } = picker.$;
    // dialog is closed and the select button is not visible
    expect(isElementVisible(dialog)).to.be.false;
    expect(isElementVisible(selectButton)).to.be.false;
    // open the picker dialog
    picker.open();
    await waitForDialogOpen(dialog);
    // XXX the search is not being automatically triggered after the dialog is opened
    picker.$.resultsView
      .$$('div.form')
      .querySelector('paper-button.search')
      .click();
    await flush();
    const table = picker.$.resultsView.results.results.querySelector('nuxeo-data-table');
    const checkboxes = Array.from(
      table.querySelectorAll('nuxeo-data-table-checkbox:not([style*="visibility: hidden;"])'),
    );
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

  suite('keyboard accessibility', () => {
    const ctrlEnter = (target, key = 'Enter') =>
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key, ctrlKey: true, bubbles: true, composed: true, cancelable: true }),
      );
    const openAndSearch = async (picker) => {
      picker.open();
      await waitForDialogOpen(picker.$.dialog);
      // XXX the search is not being automatically triggered after the dialog is opened
      picker.$.resultsView
        .$$('div.form')
        .querySelector('paper-button.search')
        .click();
      await flush();
    };
    const selectFirstResult = async (picker) => {
      const table = picker.$.resultsView.results.results.querySelector('nuxeo-data-table');
      table.querySelectorAll('nuxeo-data-table-checkbox:not([style*="visibility: hidden;"])')[0].click();
      await flush();
    };

    test('Should name the dialog after whatever opened it', async () => {
      const picker = await buildPicker();
      expect(picker.$.dialog.getAttribute('aria-label')).to.equal('Select documents');
      picker.dialogLabel = 'Insert images from existing documents';
      await flush();
      expect(picker.$.dialog.getAttribute('aria-label')).to.equal('Insert images from existing documents');
    });

    test('Should move focus to the search field when the dialog is opened', async () => {
      const picker = await buildPicker();
      picker.open();
      await waitForDialogOpen(picker.$.dialog);
      await flush();
      const { form } = picker.$.resultsView;
      expect(form.shadowRoot.activeElement).to.equal(form.$.searchInput);
    });

    test('Should let Escape cancel the picker and give focus back', async () => {
      const picker = await buildPicker();
      picker.open();
      await waitForDialogOpen(picker.$.dialog);
      // `modal` alone leaves paper-dialog-behavior swallowing Escape
      expect(picker.$.dialog.noCancelOnEscKey).to.be.false;
      expect(picker.$.dialog.restoreFocusOnClose).to.be.true;
      picker.$.dialog.cancel();
      await waitForDialogClose(picker.$.dialog);
      expect(picker.$.dialog.opened).to.be.false;
    });

    test('Should confirm the selection with Ctrl+Enter', async () => {
      const picker = await buildPicker();
      await openAndSearch(picker);
      await selectFirstResult(picker);
      expect(picker.$.selectButton.disabled).to.be.false;
      const picked = new Promise((resolve) => picker.addEventListener('picked', resolve));
      ctrlEnter(picker.$.resultsView);
      const event = await picked;
      expect(event.detail.selectedItems).to.have.lengthOf(1);
      await waitForDialogClose(picker.$.dialog);
      expect(picker.$.dialog.opened).to.be.false;
    });

    test('Should advertise both the Ctrl and the Cmd shortcut on the select button', async () => {
      const picker = await buildPicker();
      expect(picker.$.selectButton.getAttribute('aria-keyshortcuts')).to.equal('Control+Enter Meta+Enter');
    });

    test('Should keep listening for the shortcut after the picker is moved in the DOM', async () => {
      const picker = await buildPicker();
      const parent = picker.parentNode;
      parent.removeChild(picker);
      parent.appendChild(picker);
      await flush();
      picker.open();
      await waitForDialogOpen(picker.$.dialog);
      const spy = sinon.spy(picker, '_onSelect');
      picker.$.selectButton.disabled = false;
      ctrlEnter(picker.$.dialog);
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('Should ignore Ctrl+Enter while nothing is selected', async () => {
      const picker = await buildPicker();
      await openAndSearch(picker);
      const spy = sinon.spy(picker, '_onSelect');
      expect(picker.$.selectButton.disabled).to.be.true;
      ctrlEnter(picker.$.resultsView);
      expect(spy).to.not.have.been.called;
      spy.restore();
      expect(picker.$.dialog.opened).to.be.true;
    });

    test('Should ignore Ctrl+Enter once the dialog is closing', async () => {
      const picker = await buildPicker();
      await openAndSearch(picker);
      await selectFirstResult(picker);
      const spy = sinon.spy(picker, '_onSelect');
      ctrlEnter(picker.$.resultsView);
      expect(spy).to.have.been.calledOnce;
      await waitForDialogClose(picker.$.dialog);
      expect(picker.$.dialog.opened).to.be.false;
      ctrlEnter(picker.$.dialog);
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('Should leave a plain Enter to the control that has focus', async () => {
      const picker = await buildPicker();
      await openAndSearch(picker);
      await selectFirstResult(picker);
      const spy = sinon.spy(picker, '_onSelect');
      picker.$.resultsView.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true }),
      );
      expect(spy).to.not.have.been.called;
      spy.restore();
      expect(picker.$.dialog.opened).to.be.true;
    });
  });

  test('Should refine the results through a search and clear it', async () => {
    const picker = await buildPicker();
    const { dialog } = picker.$;
    // open the picker dialog
    picker.open();
    await waitForDialogOpen(dialog);
    // XXX the search is not being automatically triggered after the dialog is opened
    picker.$.resultsView
      .$$('div.form')
      .querySelector('paper-button.search')
      .click();
    await flush();
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
