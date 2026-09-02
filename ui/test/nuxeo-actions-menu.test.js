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
import * as polymer from '@polymer/polymer/lib/utils/html-tag.js';
import '@nuxeo/nuxeo-elements/nuxeo-connection.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '../nuxeo-slots.js';
import '../actions/nuxeo-action-button-styles.js';
import '../actions/nuxeo-preview-button.js';
import '../widgets/nuxeo-actions-menu.js';

window.html = html; // make it available for building custom elements inline

suite('nuxeo-actions-menu', () => {
  function makeMenuContent(n = 5) {
    return html`
      ${[...Array(n)].map(
        () => html`
          <nuxeo-preview-button
            document='{ "entity-type": "document", "facets": [], "properties": { "file:content": "document content" } }'
          ></nuxeo-preview-button>
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
    return menu;
  }

  async function makeMenuWithNuxeoSlot(slot = 'SLOT') {
    const menu = await fixture(
      html`
        <div style="max-width: 160px;">
          <nuxeo-actions-menu>
            <nuxeo-slot slot="${slot}"></nuxeo-slot>
          </nuxeo-actions-menu>
        </div>
      `,
      true,
    );
    return menu;
  }

  async function makeNuxeoSlottedMenuContent(n = 5, slot = 'SLOT') {
    await fixture(
      html`
        <nuxeo-slot-content name="content" slot="${slot}">
          <template>
            ${makeMenuContent(n)}
          </template>
        </nuxeo-slot-content>
      `,
      true,
    );
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
    action.document = {
      'entity-type': 'document',
      facets: [],
      properties: {
        'file:content': {
          content: 'document content',
        },
      },
    };
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

    expect(menuActions(menu).length).to.be.equal(3);
    expect(dropdownActions(menu).length).to.be.equal(1);
    expect(dropdownButton(menu).hidden).to.be.false;
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

    // define nuxeo-test-button
    customElements.define(
      'nuxeo-test-button',
      class extends Nuxeo.Element {
        static get is() {
          return 'nuxeo-test-button';
        }

        static get template() {
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

  suite('_reparent', () => {
    test('reparents action when dialog opens from dropdown slot', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const action = dropdownActions(menu)[0];
      action.slot = 'dropdown';
      const event = new CustomEvent('iron-overlay-opened', { bubbles: true, composed: true });
      Object.defineProperty(event, 'composedPath', {
        value: () => [{ tagName: 'NUXEO-DIALOG' }, action, am],
      });
      Object.defineProperty(event, 'target', { value: action });
      am._reparent(event);
    });

    test('ignores event when source is not a dialog tagName', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const action = dropdownActions(menu)[0];
      action.slot = 'dropdown';
      const event = new CustomEvent('iron-overlay-opened', { bubbles: true, composed: true });
      Object.defineProperty(event, 'composedPath', {
        value: () => [{ tagName: 'DIV' }, action, am],
      });
      Object.defineProperty(event, 'target', { value: action });
      am._reparent(event);
      expect(action.parentElement).to.not.equal(am.$.reparent);
    });

    test('ignores event when target slot is not dropdown', async () => {
      const menu = await makeMenu(3);
      const am = actionsMenu(menu);
      const action = menuActions(menu)[0];
      const event = new CustomEvent('iron-overlay-opened', { bubbles: true, composed: true });
      Object.defineProperty(event, 'composedPath', {
        value: () => [{ tagName: 'NUXEO-DIALOG' }, action, am],
      });
      Object.defineProperty(event, 'target', { value: action });
      am._reparent(event);
      expect(action.parentElement).to.not.equal(am.$.reparent);
    });

    test('handles PAPER-DIALOG tagName as reparent trigger', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const action = dropdownActions(menu)[0];
      action.slot = 'dropdown';
      const event = new CustomEvent('iron-overlay-opened', { bubbles: true, composed: true });
      Object.defineProperty(event, 'composedPath', {
        value: () => [{ tagName: 'PAPER-DIALOG' }, action, am],
      });
      Object.defineProperty(event, 'target', { value: action });
      am._reparent(event);
    });
  });

  suite('_getMenuElements and _getDropdownElements', () => {
    test('_getMenuElements returns non-NUXEO-SLOT element nodes', async () => {
      const menu = await makeMenu(3);
      const am = actionsMenu(menu);
      const els = am._getMenuElements();
      expect(els).to.be.an('array');
      els.forEach((el) => {
        expect(el.nodeType).to.equal(Node.ELEMENT_NODE);
        expect(el.tagName).to.not.equal('NUXEO-SLOT');
      });
    });

    test('_getDropdownElements returns dropdown-slotted element nodes', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const els = am._getDropdownElements();
      expect(els).to.be.an('array');
      expect(els.length).to.be.greaterThan(0);
      els.forEach((el) => {
        expect(el.nodeType).to.equal(Node.ELEMENT_NODE);
        expect(el.tagName).to.not.equal('NUXEO-SLOT');
      });
    });
  });

  suite('_moveToMenu and _moveToDropdown', () => {
    test('_moveToMenu clears slot and removes show-label', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const action = dropdownActions(menu)[0];
      action.setAttribute('show-label', '');
      am._moveToMenu(action);
      expect(action.slot).to.equal('');
      expect(action.hasAttribute('show-label')).to.be.false;
    });

    test('_moveToDropdown sets dropdown slot and show-label', async () => {
      const menu = await makeMenu(3);
      const am = actionsMenu(menu);
      const action = menuActions(menu)[0];
      am._moveToDropdown(action);
      expect(action.slot).to.equal('dropdown');
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(action.hasAttribute('show-label')).to.be.true;
    });
  });

  suite('_onDropdownTriggerKeydown', () => {
    test('Enter key sets __openByKeyboard flag', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      am.__openByKeyboard = false;
      am._onDropdownTriggerKeydown({ key: 'Enter', preventDefault: sinon.spy() });
      expect(am.__openByKeyboard).to.be.true;
    });

    test('Space key sets flag and calls preventDefault', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      am.__openByKeyboard = false;
      const preventDefault = sinon.spy();
      am._onDropdownTriggerKeydown({ key: ' ', preventDefault });
      expect(am.__openByKeyboard).to.be.true;
      expect(preventDefault).to.have.been.calledOnce;
    });

    test('Spacebar key sets flag and calls preventDefault', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      am.__openByKeyboard = false;
      const preventDefault = sinon.spy();
      am._onDropdownTriggerKeydown({ key: 'Spacebar', preventDefault });
      expect(am.__openByKeyboard).to.be.true;
      expect(preventDefault).to.have.been.calledOnce;
    });

    test('other keys do not set __openByKeyboard', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      am.__openByKeyboard = false;
      am._onDropdownTriggerKeydown({ key: 'Tab', preventDefault: sinon.spy() });
      expect(am.__openByKeyboard).to.be.false;
    });

    test('ArrowDown key is ignored (early return)', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      am.__openByKeyboard = false;
      am._onDropdownTriggerKeydown({ key: 'ArrowDown', preventDefault: sinon.spy() });
      expect(am.__openByKeyboard).to.be.false;
    });
  });

  suite('_onDropdownOpen', () => {
    test('resets focus when __openByKeyboard is true', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      am.__openByKeyboard = true;
      const spy = sinon.stub(am, '_resetDropdownFocus');
      am._onDropdownOpen();
      expect(am.__openByKeyboard).to.be.false;
      expect(spy).to.have.been.calledOnce;
      spy.restore();
    });

    test('returns early when __openByKeyboard is false', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      am.__openByKeyboard = false;
      const spy = sinon.stub(am, '_resetDropdownFocus');
      am._onDropdownOpen();
      expect(spy).to.not.have.been.called;
      spy.restore();
    });
  });

  suite('_resetDropdownFocus', () => {
    test('sets listbox.selected and schedules focus on first dropdown item', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const menuBtn = am.$.dropdownButton;
      menuBtn.opened = true;
      am._resetDropdownFocus();
      const listbox = am.shadowRoot.querySelector('paper-listbox');
      if (listbox) {
        expect(listbox.selected).to.equal(0);
      }
    });

    test('returns early when menuButton.opened is false', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const menuBtn = am.$.dropdownButton;
      menuBtn.opened = false;
      am._resetDropdownFocus();
    });

    test('handles case with no dropdown items gracefully', async () => {
      const menu = await makeMenu(3);
      const am = actionsMenu(menu);
      const menuBtn = am.$.dropdownButton;
      menuBtn.opened = true;
      am._resetDropdownFocus();
    });
  });

  suite('_removeTabIndex', () => {
    test('removes tabindex from dropdown elements on Shift+Tab', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const items = am._getDropdownElements();
      items.forEach((item) => item.setAttribute('tabindex', '0'));
      am._removeTabIndex({ shiftKey: true, key: 'Tab' });
      await new Promise((resolve) => setTimeout(resolve, 50));
      items.forEach((item) => {
        expect(item.hasAttribute('tabindex')).to.be.false;
      });
    });

    test('does not remove tabindex when key is not Tab', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const items = am._getDropdownElements();
      const spies = items.map((item) => sinon.spy(item, 'removeAttribute'));
      am._removeTabIndex({ shiftKey: true, key: 'Enter' });
      spies.forEach((spy) => {
        expect(spy).to.not.have.been.calledWith('tabindex');
        spy.restore();
      });
    });

    test('does not remove tabindex when shiftKey is false', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const items = am._getDropdownElements();
      const spies = items.map((item) => sinon.spy(item, 'removeAttribute'));
      am._removeTabIndex({ shiftKey: false, key: 'Tab' });
      spies.forEach((spy) => {
        expect(spy).to.not.have.been.calledWith('tabindex');
        spy.restore();
      });
    });
  });

  suite('listnerRemove', () => {
    test('removes keydown event listener from dropdown elements', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const items = am._getDropdownElements();
      const spies = items.map((item) => sinon.spy(item, 'removeEventListener'));
      am.listnerRemove();
      spies.forEach((spy) => {
        expect(spy).to.have.been.calledWith('keydown', sinon.match.func);
        spy.restore();
      });
    });
  });

  suite('contentWidth', () => {
    test('returns the sum of menu element clientWidths', async () => {
      const menu = await makeMenu(3);
      const am = actionsMenu(menu);
      const w = am.contentWidth;
      expect(w).to.be.a('number');
      expect(w).to.be.at.least(0);
    });
  });

  suite('connectedCallback and disconnectedCallback', () => {
    test('disconnectedCallback removes event listeners', async () => {
      const menu = await makeMenu(3);
      const am = actionsMenu(menu);
      const removeSpy = sinon.spy(am, 'removeEventListener');
      am.disconnectedCallback();
      expect(removeSpy).to.have.been.calledWith('iron-resize');
      expect(removeSpy).to.have.been.calledWith('dom-change');
      expect(removeSpy).to.have.been.calledWith('iron-overlay-opened');
      removeSpy.restore();
    });
  });

  suite('_layout', () => {
    test('skips layout when event comes from reparent container', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const event = {
        type: 'iron-resize',
        composedPath: () => [{ id: 'reparent' }],
      };
      am._layout(event);
    });

    test('skips layout when event comes from dropdownButton', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      const event = {
        type: 'iron-resize',
        composedPath: () => [{ id: 'dropdownButton' }],
      };
      am._layout(event);
    });

    test('runs layout without event argument', async () => {
      const menu = await makeMenu(5);
      const am = actionsMenu(menu);
      am._layout();
    });

    test('hides dropdown button when no dropdown elements exist', async () => {
      const menu = await makeMenu(2);
      const am = actionsMenu(menu);
      am._layout();
      await flush();
      expect(am.$.dropdownButton.hidden).to.be.true;
    });
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
      const customEl = await fixture(
        html`
          <my-custom-slotted-menu-element>
            <nuxeo-slot name="SLOT"></nuxeo-slot>
          </my-custom-slotted-menu-element>
        `,
        true,
      );
      expect(menuActions(customEl).length).to.be.equal(3);
      expect(dropdownActions(customEl).length).to.be.equal(2);
      expect(dropdownButton(customEl).hidden).to.be.false;
    });
  });
});

suite('nuxeo-actions-menu accessible name', () => {
  test('the overflow trigger is named after what it opens', async () => {
    const menu = await fixture(
      html`
        <nuxeo-actions-menu></nuxeo-actions-menu>
      `,
    );
    await flush();
    const trigger = menu.shadowRoot.querySelector('#iconButton');
    expect(trigger).to.exist;
    expect(trigger.getAttribute('aria-label')).to.equal(menu.i18n('actionsMenu.ariaLabel'));
    // aria-labelledby would win over aria-label, so the old tooltip reference must be gone.
    expect(trigger.hasAttribute('aria-labelledby')).to.be.false;
  });
});
