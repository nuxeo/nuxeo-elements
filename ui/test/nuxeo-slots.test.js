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
import { fixture, flush, html, waitForChildListMutation } from '@nuxeo/testing-helpers';
import * as polymer from '@polymer/polymer';
import '../nuxeo-slots.js';

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

const makeSlot = (name, legacySlotName = false) =>
  fixture(
    legacySlotName
      ? html`
          <nuxeo-slot slot="${name}"></nuxeo-slot>
        `
      : html`
          <nuxeo-slot name="${name}"></nuxeo-slot>
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
