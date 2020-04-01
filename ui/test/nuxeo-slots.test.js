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
import { fixture, flush, html, waitForChildListMutation, timePasses } from '@nuxeo/nuxeo-elements/test/test-helpers.js';
import * as polymer from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-bind.js';
import '../nuxeo-slots.js';
import '../nuxeo-filter.js';
/* eslint-disable no-unused-expressions */

// return all children excluding <nuxeo-slot>
function _content(slot) {
  return slot.parentElement.querySelectorAll(':not(nuxeo-slot)');
}

// asserts that all slot contributions are inserted before <nuxeo-slot>
function _assertPosition(slot) {
  const siblings = Array.from(slot.parentElement.children);
  const slotIdx = siblings.indexOf(slot);
  Array.from(_content(slot))
    .map((el) => siblings.indexOf(el))
    .forEach((contentIdx) => expect(contentIdx).to.be.below(slotIdx));
}

const makeSlot = (name, legacySlotName = false, contentKey) =>
  fixture(
    legacySlotName
      ? html`
          <nuxeo-slot slot="${name}" content-key=${contentKey || ''}></nuxeo-slot>
        `
      : html`
          <nuxeo-slot name="${name}" content-key=${contentKey || ''}></nuxeo-slot>
        `,
  );

const makeContent = async (name, slot, content, options = {}) => {
  const { order, disabled, priority } = options;
  const tmpl = content
    ? html`
        <template>${content}</template>
      `
    : '';
  const slContent = html`
    <nuxeo-slot-content
      name="${name}"
      slot="${slot}"
      order="${order || 0}"
      ?disabled=${disabled}
      priority="${priority || 0}"
    >
      ${tmpl}
    </nuxeo-slot-content>
  `;
  const fx = await fixture(slContent);
  await flush();
  return fx;
};

suite('nuxeo-slot', () => {
  [{ legacySlotName: false }, { legacySlotName: true }].forEach((conf) => {
    suite(conf.legacySlotName ? '"slot" attribute as nuxeo-slot name (legacy)' : '', () => {
      let slot1;
      let slot2;

      setup(async () => {
        slot1 = await makeSlot('SLOT1', conf.legacySlotName);
        slot2 = await makeSlot('SLOT2', conf.legacySlotName);
      });

      test('empty slots and content', async () => {
        expect(_content(slot1)).to.be.empty;

        await makeContent('empty', 'SLOT1');

        expect(_content(slot1)).to.be.empty;
      });

      test('slot content', async () => {
        await makeContent(
          'content1',
          'SLOT1',
          html`
            <span>Content 1</span>
          `,
          { order: 1 },
        );

        _assertPosition(slot1);
        expect(_content(slot1).length).to.be.equal(1);
        expect(_content(slot2)).to.be.empty;

        await makeContent(
          'content2',
          'SLOT1',
          html`
            <span>Content 2</span>
          `,
          { order: 2 },
        );

        _assertPosition(slot1);
        expect(_content(slot1).length).to.be.equal(2);
        expect(_content(slot2)).to.be.empty;

        await makeContent(
          'content3',
          'SLOT2',
          html`
            <span>Content 3</span>
          `,
        );

        expect(_content(slot1).length).to.be.equal(2);
        _assertPosition(slot2);
        expect(_content(slot2).length).to.be.equal(1);

        const content1 = _content(slot1);
        const content2 = _content(slot2);
        expect(content1[0].textContent).to.be.equal('Content 1');
        expect(content1[1].textContent).to.be.equal('Content 2');
        expect(content2[0].textContent).to.be.equal('Content 3');
      });

      test('slot content order', async () => {
        await makeContent(
          'content2',
          'SLOT1',
          html`
            <span>Content 2</span>
          `,
          { order: 2 },
        );

        expect(_content(slot1).length).to.be.equal(1);

        await makeContent(
          'content1',
          'SLOT1',
          html`
            <span>Content 1</span>
          `,
          { order: 1 },
        );

        _assertPosition(slot1);
        const content = _content(slot1);
        expect(content.length).to.be.equal(2);

        // check content 1 was moved to first
        expect(content[0].textContent).to.be.equal('Content 1');
      });

      test('slot content disabled', async () => {
        await makeContent(
          'content1',
          'SLOT1',
          html`
            <span>Content 1</span>
          `,
        );

        expect(_content(slot1).length).to.be.equal(1);

        await makeContent('content1', 'SLOT1', '', { disabled: true });

        expect(_content(slot1)).to.be.empty;
      });

      test('slot content re-enabled', async () => {
        await makeContent(
          'content',
          'SLOT1',
          html`
            <span>Disabled content</span>
          `,
          { disabled: true },
        );

        expect(_content(slot1)).to.be.empty;

        await makeContent('content', 'SLOT1');

        _assertPosition(slot1);
        const content = _content(slot1);
        expect(content.length).to.be.equal(1);
        expect(content[0].textContent).to.be.equal('Disabled content');
      });

      test('slot content override', async () => {
        await makeContent(
          'content1',
          'SLOT1',
          html`
            <span>Content 1</span>
          `,
        );
        await makeContent(
          'content2',
          'SLOT1',
          html`
            <span>Content 2</span>
          `,
        );

        let content = _content(slot1);
        expect(content.length).to.be.equal(2);
        expect(content[0].textContent).to.be.equal('Content 1');

        await makeContent(
          'content1',
          'SLOT1',
          html`
            <span>Content 1 override</span>
          `,
          { order: 3 },
        );
        _assertPosition(slot1);
        content = _content(slot1);
        expect(content.length).to.be.equal(2);

        // check content 1 was moved to last
        expect(content[1].textContent).to.be.equal('Content 1 override');
      });

      test('slot content priority', async () => {
        await makeContent(
          'content1',
          'SLOT1',
          html`
            <span>Content 1</span>
          `,
        );

        await makeContent(
          'content1',
          'SLOT1',
          html`
            <span>Content 1 override</span>
          `,
          { priority: 10 },
        );

        _assertPosition(slot1);
        const content = _content(slot1);
        expect(content.length).to.be.equal(1);
        expect(content[0].textContent).to.be.equal('Content 1 override');
      });

      test('slot shared model', async () => {
        await makeContent(
          'content3',
          'SLOT1',
          html`
            <span>[[property]]</span>
          `,
        );

        window.nuxeo.slots.setSharedModel({ property: 'test1' });

        const content = _content(slot1);
        expect(content.length).to.be.equal(1);
        expect(content[0].textContent).to.be.equal('test1');
        window.nuxeo.slots.setSharedModel({ property: 'test2' });
        expect(content[0].textContent).to.be.equal('test2');
      });

      test('slot content with unfinished DOM distribution', async () => {
        const slotContent = await makeContent('empty', 'SLOT1');
        const content = _content(slot1);
        expect(content).to.be.empty;
        const text = 'I was loaded late.';
        slotContent.innerHTML = `<template><span>${text}</span></template>`;
        await flush();
        const mutation = await waitForChildListMutation(slot1.parentElement);
        expect(mutation.addedNodes.length).to.be.equal(1);
        expect(mutation.addedNodes[0].textContent).to.be.equal(text);
        expect(_content(slot1).length).to.be.equal(1);
      });
    });
  });

  suite('slot content deduplication', () => {
    let slot3;
    setup(async () => {
      slot3 = await makeSlot('SLOT3', false, 'name');
    });

    test('content dedup by "name" attribute', async () => {
      sinon.spy(slot3, '_render');
      sinon.spy(slot3, '_dedup');

      await makeContent(
        'content1',
        'SLOT3',
        html`
          <p>Content</p>
        `,
        { order: 1 },
      );
      expect(slot3._render.calledOnce).to.be.true;
      expect(slot3._dedup.calledOnce).to.be.true;
      await makeContent(
        'content2',
        'SLOT3',
        html`
          <span name="name">Contrib 1</span>
          <span name="name">Contrib 2</span>
        `,
        { order: 3 },
      );
      expect(slot3._render.calledTwice).to.be.true;
      expect(slot3._dedup.calledThrice).to.be.true;
      let content = _content(slot3);
      expect(content.length).to.be.equal(2);
      expect(content[0].textContent).to.be.equal('Content');
      expect(content[1].textContent).to.be.equal('Contrib 1');
      await makeContent(
        'content3',
        'SLOT3',
        html`
          <span name="name">Contrib 3</span>
        `,
        { order: 4 },
      );
      expect(slot3._render.calledThrice).to.be.true;
      expect(slot3._dedup.callCount).to.equal(6);
      content = _content(slot3);
      expect(content.length).to.be.equal(2);
      expect(content[0].textContent).to.be.equal('Content');
      expect(content[1].textContent).to.be.equal('Contrib 1');
      await makeContent(
        'content3',
        'SLOT3',
        html`
          <span name="name">Contrib 4</span>
        `,
        { order: 2 },
      );
      expect(slot3._render.callCount).to.equal(4);
      expect(slot3._dedup.callCount).to.equal(9);
      content = _content(slot3);
      expect(content.length).to.be.equal(2);
      expect(content[0].textContent).to.be.equal('Content');
      expect(content[1].textContent).to.be.equal('Contrib 4');
    });

    test('content dedup by "name" attribute using nuxeo-filter', async () => {
      sinon.spy(slot3, '_render');
      sinon.spy(slot3, '_dedup');

      await makeContent(
        'content1',
        'SLOT3',
        html`
          <p>Content</p>
        `,
        { order: 1 },
      );
      await makeContent(
        'content2',
        'SLOT3',
        html`
          <span name="name">Contrib 1</span>
        `,
        { order: 4 },
      );
      expect(slot3._render.calledTwice).to.be.true;
      expect(slot3._dedup.calledThrice).to.be.true;
      let content = _content(slot3);
      expect(content.length).to.be.equal(2);
      expect(content[0].textContent).to.be.equal('Content');
      expect(content[1].textContent).to.be.equal('Contrib 1');

      await makeContent(
        'content3',
        'SLOT3',
        html`
          <nuxeo-filter document='{"facets":["Folderish"]}' facet="Folderish">
            <template>
              <span name="name">Contrib 2</span>
              <span name="name">Contrib 3</span>
            </template>
          </nuxeo-filter>
        `,
        { order: 2 },
      );
      expect(slot3._render.calledThrice).to.be.true;
      expect(slot3._dedup.callCount).to.equal(7);
      content = _content(slot3);
      expect(content.length).to.be.equal(4);
      expect(content[0].textContent).to.be.equal('Content');
      expect(content[1].textContent).to.be.equal('Contrib 2');
      expect(content[2].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[3].tagName).to.be.equal('TEMPLATE');

      // check that if we have no duplicates amongst filters, contributed in different slot content elements
      await makeContent(
        'content4',
        'SLOT3',
        html`
          <nuxeo-filter document='{"facets":["Folderish"]}' facet="Folderish">
            <template>
              <span name="name">Contrib 4</span>
              <span name="name">Contrib 5</span>
            </template>
          </nuxeo-filter>
          <nuxeo-filter document='{"facets":["Folderish"]}' facet="File">
            <template>
              <span name="name">Contrib 6</span>
              <span name="name">Contrib 7</span>
            </template>
          </nuxeo-filter>
          <nuxeo-filter document='{"facets":["Folderish"]}' facet="File">
            <template>
              <span>Contrib 8</span>
            </template>
          </nuxeo-filter>
        `,
        { order: 2 },
      );
      expect(slot3._render.callCount).to.equal(4);
      expect(slot3._dedup.callCount).to.equal(13);
      content = _content(slot3);
      expect(content.length).to.be.equal(10);
      expect(content[0].textContent).to.be.equal('Content');
      expect(content[1].textContent).to.be.equal('Contrib 2');
      expect(content[2].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[3].tagName).to.be.equal('TEMPLATE');
      expect(content[4].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[5].tagName).to.be.equal('TEMPLATE');
      expect(content[6].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[7].tagName).to.be.equal('TEMPLATE');
      expect(content[8].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[9].tagName).to.be.equal('TEMPLATE');

      // check that we have no duplicates on filters contributed in the same slot content, but we still perserve
      // contributions without a key on filters
      // the hack above is a dirt workaround for databinding for polymer element with lit-html
      const filter1 = content[2];
      filter1.set('document', { facets: ['File'] });
      const filter2 = content[4];
      filter2.set('document', { facets: ['File'] });
      const filter3 = content[6];
      filter3.set('document', { facets: ['File'] });
      const filter4 = content[8];
      filter4.set('document', { facets: ['File'] });
      await flush();
      await timePasses(50); // give enough time for re-instate to run
      expect(slot3._render.callCount).to.equal(4);
      expect(slot3._dedup.callCount).to.equal(15);
      content = _content(slot3);
      expect(content.length).to.be.equal(11);
      expect(content[0].textContent).to.be.equal('Content');
      expect(content[1].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[2].tagName).to.be.equal('TEMPLATE');
      expect(content[3].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[4].tagName).to.be.equal('TEMPLATE');
      expect(content[5].textContent).to.be.equal('Contrib 6');
      expect(content[6].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[7].tagName).to.be.equal('TEMPLATE');
      expect(content[8].textContent).to.be.equal('Contrib 8');
      expect(content[9].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[10].tagName).to.be.equal('TEMPLATE');

      // let's invalid all filters and make sure that the first contribution with a key is back
      filter1.set('document', { facets: ['Picture'] });
      filter2.set('document', { facets: ['Picture'] });
      filter3.set('document', { facets: ['Picture'] });
      filter4.set('document', { facets: ['Picture'] });
      await flush();
      await timePasses(50); // give enough time for re-instate to run
      expect(slot3._render.callCount).to.equal(4);
      expect(slot3._dedup.callCount).to.equal(15);
      content = _content(slot3);
      expect(content.length).to.be.equal(10);
      expect(content[0].textContent).to.be.equal('Content');
      expect(content[1].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[2].tagName).to.be.equal('TEMPLATE');
      expect(content[3].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[4].tagName).to.be.equal('TEMPLATE');
      expect(content[5].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[6].tagName).to.be.equal('TEMPLATE');
      expect(content[7].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[8].tagName).to.be.equal('TEMPLATE');
      // NOTE: this contribution is back, but in a different position on the DOM
      // this shouldn't be an issue?
      expect(content[9].textContent).to.be.equal('Contrib 1');

      // check that a rerender preserves the correct order
      slot3._updateContent();
      await flush();
      await timePasses(50); // give enough time for re-instate to run
      expect(slot3._render.callCount).to.equal(5);
      expect(slot3._dedup.callCount).to.equal(21);
      content = _content(slot3);
      expect(content.length).to.be.equal(10);
      expect(content[0].textContent).to.be.equal('Content');
      expect(content[1].textContent).to.be.equal('Contrib 2');
      expect(content[2].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[3].tagName).to.be.equal('TEMPLATE');
      expect(content[4].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[5].tagName).to.be.equal('TEMPLATE');
      expect(content[6].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[7].tagName).to.be.equal('TEMPLATE');
      expect(content[8].tagName).to.be.equal('NUXEO-FILTER');
      expect(content[9].tagName).to.be.equal('TEMPLATE');

      // TODO this won't work with filters with different
      await makeContent(
        'content5',
        'SLOT3',
        html`
          <nuxeo-filter user='{"isAdministrator": true}' expression="user.isAdministrator">
            <template>
              <span name="name">Contrib 9</span>
            </template>
          </nuxeo-filter>
        `,
        { order: 2 },
      );
    });
  });

  suite('compatibility with native HTML slots', () => {
    let customEl;

    class CustomSlottedElement extends Nuxeo.Element {
      static get is() {
        return 'my-custom-slotted-element';
      }

      static get template() {
        return polymer.html`
          <div id="page">
            <slot></slot>
            <div id="header">
              <slot name="header">
              </slot>
            </div>
            <div id="body">
              <slot name="body">
              </slot>
            </div>
          </div>
        `;
      }
    }
    customElements.define(CustomSlottedElement.is, CustomSlottedElement);

    setup(async () => {
      customEl = await fixture(html`
        <my-custom-slotted-element>
          <nuxeo-slot name="SLOT3" slot="header"></nuxeo-slot>
        </my-custom-slotted-element>
      `);
    });

    test('nuxeo-slot can be assigned to native slots', async () => {
      const nxSlot = customEl.querySelector('nuxeo-slot[name="SLOT3"]');
      expect(nxSlot).to.not.be.null;
      expect(nxSlot.name).to.be.equal('SLOT3');
      expect(nxSlot.parentElement).to.be.equal(customEl);
      expect(nxSlot.assignedSlot).to.not.be.null;
      expect(nxSlot.assignedSlot.getAttribute('name')).to.equal('header');
      expect(nxSlot.slot).to.equal('header');
    });

    test('nuxeo-slot content is assigned and re-assigned to the same native slot', async () => {
      const nxSlot = customEl.querySelector('nuxeo-slot[name="SLOT3"]');
      // let's contribute content to the nuxeo-slot
      await makeContent(
        'content',
        'SLOT3',
        html`
          <span>Content</span>
        `,
      );
      _assertPosition(nxSlot);
      let [content] = _content(nxSlot);
      expect(content.parentElement).to.be.equal(nxSlot.parentElement);
      expect(content.assignedSlot).to.be.equal(nxSlot.assignedSlot);

      // switch slots and check if the content is correctly updated
      nxSlot.slot = 'body';
      await flush();
      _assertPosition(nxSlot);
      [content] = _content(nxSlot);
      expect(nxSlot.parentElement).to.be.equal(customEl);
      expect(nxSlot.assignedSlot).to.not.be.null;
      expect(nxSlot.assignedSlot.getAttribute('name')).to.equal('body');
      expect(content.parentElement).to.be.equal(nxSlot.parentElement);
      expect(content.assignedSlot).to.be.equal(nxSlot.assignedSlot);

      nxSlot.slot = '';
      await flush();
      _assertPosition(nxSlot);
      [content] = _content(nxSlot);
      expect(nxSlot.parentElement).to.be.equal(customEl);
      expect(nxSlot.assignedSlot).to.not.be.null;
      expect(nxSlot.assignedSlot.getAttribute('name')).to.be.null;
      expect(content.parentElement).to.be.equal(nxSlot.parentElement);
      expect(content.assignedSlot).to.be.equal(nxSlot.assignedSlot);
    });
  });
});
