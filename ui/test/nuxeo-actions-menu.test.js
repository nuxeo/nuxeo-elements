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
import { fixture, flush, html, login } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import * as polymer from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-test-helpers/mock-interactions.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '../nuxeo-slots.js';
import '../actions/nuxeo-action-button-styles.js';
import '../actions/nuxeo-preview-button.js';
import '../widgets/nuxeo-actions-menu.js';

window.html = html; // make it available for building custom elements inline

const makeMenu = async (n) => {
  const menu = fixture(html`
    <div style="max-width: 160px;">
      <nuxeo-actions-menu>
        ${[...Array(n)].map(
          () => html`
            <nuxeo-preview-button document='{ "entity-type": "document", "facets": [] }'></nuxeo-preview-button>
          `,
        )}
      </nuxeo-actions-menu>
    </div>
  `);
  await flush();
  return menu;
};

/* eslint-disable no-unused-expressions */
suite('<nuxeo-actions-menu>', () => {
  function menuActions(div) {
    return div.querySelector('nuxeo-actions-menu').querySelectorAll(':not([slot="dropdown"]):not(nuxeo-slot)');
  }

  function dropdownActions(div) {
    return div.querySelector('nuxeo-actions-menu').querySelectorAll('[slot="dropdown"]:not(nuxeo-slot)');
  }

  function dropdownButton(div) {
    return div.querySelector('nuxeo-actions-menu').$.dropdownButton;
  }

  async function removeAction(div) {
    const menu = div.querySelector('nuxeo-actions-menu');
    const lastChild = menu.lastElementChild;
    menu.removeChild(lastChild);
    await flush();
  }

  async function addAction(div) {
    const menu = div.querySelector('nuxeo-actions-menu');
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

  test('menu with slotted content', async () => {
    const menu = await fixture(html`
      <div style="max-width: 160px;">
        <nuxeo-actions-menu>
          <nuxeo-slot slot="SLOT"></nuxeo-slot>
        </nuxeo-actions-menu>
      </div>
    `);
    await flush();

    await fixture(html`
      <nuxeo-slot-content name="content" slot="SLOT">
        <template>
          ${[...Array(5)].map(
            () => html`
              <nuxeo-preview-button document='{ "entity-type": "document", "facets": [] }'></nuxeo-preview-button>
            `,
          )}
        </template>
      </nuxeo-slot-content>
    `);

    await flush();

    expect(menuActions(menu).length).to.be.equal(3);
    expect(dropdownActions(menu).length).to.be.equal(2);
    expect(dropdownButton(menu).hidden).to.be.false;
  });

  test('menu with unresolved slotted content', async () => {
    const menu = await fixture(html`
      <div style="max-width: 160px;">
        <nuxeo-actions-menu>
          <nuxeo-slot slot="SLOT"></nuxeo-slot>
        </nuxeo-actions-menu>
      </div>
    `);
    await flush();

    await fixture(html`
      <nuxeo-slot-content name="content" slot="SLOT">
        <template>
          <nuxeo-test-button icon="icons:home"></nuxeo-test-button>
          ${[...Array(5)].map(
            () => html`
              <nuxeo-preview-button document='{ "entity-type": "document", "facets": [] }'></nuxeo-preview-button>
            `,
          )}
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
});
