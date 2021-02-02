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
import '../nuxeo-aggregation/nuxeo-checkbox-aggregation.js';
import '../search/nuxeo-search-form-layout.js';
import '../widgets/nuxeo-input.js';
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { fixture, flush, isElementVisible, html, waitForEvent, waitForAttrMutation } from '@nuxeo/testing-helpers';
import { LayoutBehavior } from '../nuxeo-layout-behavior.js';

// Export Polymer and PolymerElement for 1.x and 2.x compat
window.Polymer = Polymer;

window.nuxeo.I18n.language = 'en';
window.nuxeo.I18n.en = window.nuxeo.I18n.en || {};
window.nuxeo.I18n.en['documentSearchForm.layoutNotFound'] = 'Failed to find search layout for {0}.';

Nuxeo = Nuxeo || {};
Nuxeo.LayoutBehavior = LayoutBehavior;

// determine base module path (relies on @open-wc/webpack-import-meta-loader)
const { url } = import.meta;
const base = url.substring(0, url.lastIndexOf('/'));

suite('nuxeo-search-form-layout', () => {
  let searchFormLayout;
  const baseUrl = `${base}/layouts/search/`;
  const params = {
    param1: 'value1',
    param2: 'value2',
  };
  const aggregations = {
    aggregation1: 'value1',
    aggregation2: 'value2',
  };

  const awaitLayoutLoad = (layout) =>
    Promise.race([waitForEvent(layout, 'element-changed'), waitForAttrMutation(layout.$.error, 'hidden', null)]);

  const buildLayout = async (provider = 'pp_test', searchName = 'test') => {
    const dl = await fixture(
      html`
        <nuxeo-search-form-layout
          provider="${provider}"
          search-name="${searchName}"
          href-base="${baseUrl}"
          .params="${params}"
          .aggregations="${aggregations}"
        ></nuxeo-search-form-layout>
      `,
    );
    if (!dl.element) {
      await awaitLayoutLoad(dl.$.layout);
    }
    await flush();
    return dl;
  };

  const getWidget = (label) => {
    if (!searchFormLayout || !searchFormLayout.element) {
      return null;
    }
    return searchFormLayout.element.shadowRoot.querySelector(`[role="widget"][name="${label}"]`);
  };

  const assertNotFound = () => {
    expect(isElementVisible(searchFormLayout.$.layout.$.error)).to.be.true;
    expect(searchFormLayout.$.layout.$.error.code).to.equal('404');
    expect(searchFormLayout.$.layout.$.error.message).to.equal(
      `Failed to find search layout for ${searchFormLayout.searchName}.`,
    );
  };

  test('Should display an error when the layout is not found', async () => {
    searchFormLayout = await buildLayout('pp_other', 'other');
    // we have no such search layout, so it will result in 404
    assertNotFound();
  });

  test('Should load a layout when a search name is provided', async () => {
    searchFormLayout = await buildLayout();
    // check the load of the layout
    expect(searchFormLayout.element).to.exist;
    expect(searchFormLayout.element.tagName).to.equal('NUXEO-TEST-SEARCH-FORM');
    // assert layout integrity
    expect(searchFormLayout.element.provider).to.equal(searchFormLayout.provider);
    const { children } = searchFormLayout.element.shadowRoot;
    expect(children).to.have.lengthOf(2);
    expect(children[0].tagName).to.equal('NUXEO-INPUT');
    expect(children[1].tagName).to.equal('DIV');
    expect(children[1].children[0].tagName).to.equal('NUXEO-CHECKBOX-AGGREGATION');
    // assert params and aggregations
    expect(searchFormLayout.element.params).to.deep.equal(params);
    expect(searchFormLayout.element.aggregations).to.deep.equal(aggregations);
  });

  test('Should receive updated params when the layout params are changed', async () => {
    searchFormLayout = await buildLayout();
    const otherParams = {
      param1: 'value1',
    };
    searchFormLayout.element.params = otherParams;
    expect(searchFormLayout.params).to.deep.equal(otherParams);
  });

  test('Should fire a "search-form-layout-changed" event when the layout is loaded', async () => {
    // we need to add a listener for this event before hand, because we do not yet have the layout stamped,
    // and after `buildLayout` it can be too late to catch the event.
    const layoutChanged = new Promise((resolve) => {
      document.addEventListener('search-form-layout-changed', (e) => resolve(e));
    });
    searchFormLayout = await buildLayout();
    // check that the event was fired from the search form layout
    const event = await layoutChanged;
    expect(event.target).to.equal(searchFormLayout);
    // ensure that the event bubbles and is composed
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
    // verify event details
    expect(event.detail).to.exist;
    expect(event.detail.value).to.equal(searchFormLayout.element);
  });

  test('Should reload when layout name changes', async () => {
    searchFormLayout = await buildLayout();
    // check that the layout updates when the search name changes
    searchFormLayout.searchName = 'test2';
    const event = await waitForEvent(searchFormLayout, 'search-form-layout-changed');
    expect(event.detail).to.exist;
    const element = event.detail.value;
    expect(element).to.exist;
    expect(element.tagName).to.equal('NUXEO-TEST2-SEARCH-FORM');
    // assert layout integrity
    const { children } = element.shadowRoot;
    expect(children).to.have.lengthOf(1);
    expect(children[0].tagName).to.equal('NUXEO-INPUT');
  });

  test('Should do auto-focus when the layout is stamped', async () => {
    searchFormLayout = await buildLayout();
    const fulltextWidget = getWidget('Fulltext');
    expect(fulltextWidget.hasAttribute('autofocus')).to.be.true;
  });
});
