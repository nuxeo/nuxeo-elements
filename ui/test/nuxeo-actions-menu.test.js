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
import * as polymer from '@polymer/polymer/lib/utils/html-tag.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '../nuxeo-slots.js';
import '../actions/nuxeo-action-button-styles.js';
import '../actions/nuxeo-preview-button.js';
import '../widgets/nuxeo-actions-menu.js';

window.html = html; // make it available for building custom elements inline

/* eslint-disable no-unused-expressions */
suite('nuxeo-actions-menu', () => {
  function makeMenuContent(n = 5) {
    return html`
      ${[...Array(n)].map(
        () => html`
          <nuxeo-preview-button document='{ "entity-type": "document", "facets": [] }'></nuxeo-preview-button>
        `,
      )}
    `;
  }

  async function makeMenu(n = 5) {
    const menu = fixture(html`
      <div style="max-width: 160px;">
        <nuxeo-actions-menu>
          ${makeMenuContent(n)}
        </nuxeo-actions-menu>
      </div>
    `);
    await flush();
    return menu;
  }

  async function makeMenuWithNuxeoSlot(slot = 'SLOT') {
    const menu = await fixture(html`
      <div style="max-width: 160px;">
        <nuxeo-actions-menu>
          <nuxeo-slot slot="${slot}"></nuxeo-slot>
        </nuxeo-actions-menu>
      </div>
    `);
    await flush();
    return menu;
  }

  async function makeNuxeoSlottedMenuContent(n = 5, slot = 'SLOT') {
    await fixture(html`
      <nuxeo-slot-content name="content" slot="${slot}">
        <template>
          ${makeMenuContent(n)}
        </template>
      </nuxeo-slot-content>
    `);
    await flush();
  }

  function actionsMenu(el) {
    return (el.shadowRoot || el).querySelector('nuxeo-actions-menu');
  }

  function menuActions(el) {
    // We're relying on getContentChildren because a query by `:not([slot="dropdown"]):not(nuxeo-slot)` is too generic
    // when using a slot with a nuxeo-slot inside, thus causing some elements to be returned twice. This could be fixed
    // with `:scope > :not([slot="dropdown"]):not(nuxeo-slot)`, but `:scope` is not supported on Edge.
    return actionsMenu(el)
      .getContentChildren()
      .filter((i) => i.tagName !== 'NUXEO-SLOT');
  }

  function dropdownActions(el) {
    return actionsMenu(el)
      .getContentChildren('slot[name="dropdown"]')
      .filter((i) => i.tagName !== 'NUXEO-SLOT');
  }

  function dropdownButton(el) {
    return actionsMenu(el).$.dropdownButton;
  }

  async function removeAction(el) {
    const menu = actionsMenu(el);
    const lastChild = menu.lastElementChild;
    menu.removeChild(lastChild);
    await flush();
  }

  async function addAction(el) {
    const menu = actionsMenu(el);
    const action = document.createElement('nuxeo-preview-button');
    action.document = '{ "entity-type": "document", "facets": [] }';
    menu.appendChild(action);
    await flush();
  }

  setup(async () => {
    await login();
  });

  test('menu for 4 with 3 elements', async () => {
    const menu = await makeMenu(3);
    expect(menuActions(menu).length).to.be.equal(3);
    expect(dropdownActions(menu).length).to.be.equal(0);
    expect(dropdownButton(menu).hidden).to.be.true;
  });

  test('menu for 4 with 5 elements', async () => {
    const menu = await makeMenu(5);
    expect(menuActions(menu).length).to.be.equal(3);
    expect(dropdownActions(menu).length).to.be.equal(2);
    expect(dropdownButton(menu).hidden).to.be.false;
  });

  test('menu of 4 with 4 elements (no dropdown button should be visible)', async () => {
    const menu = await makeMenu(4);
    expect(menuActions(menu).length).to.be.equal(4);
    expect(dropdownActions(menu).length).to.be.equal(0);
    expect(dropdownButton(menu).hidden).to.be.true;
  });

  test('menu of 4 with varying number of elements', async () => {
    const menu = await makeMenu(4);
    expect(menuActions(menu).length).to.be.equal(4);
    expect(dropdownActions(menu).length).to.be.equal(0);
    expect(dropdownButton(menu).hidden).to.be.true;
    await removeAction(menu);

    expect(menuActions(menu).length).to.be.equal(3);
    expect(dropdownActions(menu).length).to.be.equal(0);
    expect(dropdownButton(menu).hidden).to.be.true;
    await addAction(menu);

    expect(menuActions(menu).length).to.be.equal(4);
    expect(dropdownActions(menu).length).to.be.equal(0);
    expect(dropdownButton(menu).hidden).to.be.true;
    await addAction(menu);

    expect(menuActions(menu).length).to.be.equal(3);
    expect(dropdownActions(menu).length).to.be.equal(2);
    expect(dropdownButton(menu).hidden).to.be.false;
    await removeAction(menu);

    expect(menuActions(menu).length).to.be.equal(4);
    expect(dropdownActions(menu).length).to.be.equal(0);
    expect(dropdownButton(menu).hidden).to.be.true;
  });

  test('menu with nuxeo-slotted content', async () => {
    const menu = await makeMenuWithNuxeoSlot();
    await makeNuxeoSlottedMenuContent();

    expect(menuActions(menu).length).to.be.equal(3);
    expect(dropdownActions(menu).length).to.be.equal(2);
    expect(dropdownButton(menu).hidden).to.be.false;
  });

  test('menu with unresolved nuxeo-slotted content', async () => {
    const menu = await makeMenuWithNuxeoSlot();

    await fixture(html`
      <nuxeo-slot-content name="content" slot="SLOT">
        <template>
          <nuxeo-test-button icon="icons:home"></nuxeo-test-button>
          ${makeMenuContent(5)}
        </template>
      </nuxeo-slot-content>
    `);

    await flush();

    // define nuxeo-test-button
    customElements.define(
      'nuxeo-test-button',
      class extends Nuxeo.Element {
        static get is() {
          return 'nuxeo-test-button';
        }

        static get template() {
          // eslint-disable-next-line no-undef
          return polymer.html`
          <style include="nuxeo-action-button-styles"></style>
          <div class="action">
            <paper-icon-button icon="[[icon]]"></paper-icon-button>
            <span class="label" hidden$="[[!showLabel]]">Label</span>
          </div>
        `;
        }

        static get properties() {
          return {
            icon: String,
            showLabel: {
              type: Boolean,
              value: false,
            },
          };
        }
      },
    );

    await customElements.whenDefined('nuxeo-test-button');

    await flush();

    expect(menuActions(menu).length).to.be.equal(3);
    expect(dropdownActions(menu).length).to.be.equal(3);
    expect(dropdownButton(menu).hidden).to.be.false;
  });

  suite('compatibility with nuxeo-slots and native HTML slots', () => {
    class CustomSlottedMenuElement extends Nuxeo.Element {
      static get is() {
        return 'my-custom-slotted-menu-element';
      }

      static get template() {
        return polymer.html`
          <div style="max-width: 160px;">
            <nuxeo-actions-menu>
              <slot>
                <nuxeo-slot slot="SLOT"></nuxeo-slot>
              </slot>
            </nuxeo-actions-menu>
          </div>
        `;
      }
    }
    customElements.define(CustomSlottedMenuElement.is, CustomSlottedMenuElement);

    test('menu with nuxeo-slot in a native slot', async () => {
      // nuxeo-slot is the only element right now that works in a native slot inside the actions menu,
      // since it has dedicated logics to reallocate its children
      await makeNuxeoSlottedMenuContent();
      const customEl = await fixture(html`
        <my-custom-slotted-menu-element>
          <nuxeo-slot name="SLOT"></nuxeo-slot>
        </my-custom-slotted-menu-element>
      `);
      await flush();
      expect(menuActions(customEl).length).to.be.equal(3);
      expect(dropdownActions(customEl).length).to.be.equal(2);
      expect(dropdownButton(customEl).hidden).to.be.false;
    });
  });
});
