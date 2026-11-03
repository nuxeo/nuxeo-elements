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
import { fixture, flush, html, waitForEvent } from '@nuxeo/testing-helpers';
import '../nuxeo-tree/nuxeo-tree.js';
import '../nuxeo-tree/nuxeo-tree-node.js';

suite('nuxeo-tree-node', () => {
  test('should return the element name', () => {
    expect(Nuxeo.TreeNode.is).to.equal('nuxeo-tree-node');
  });

  test('should have opened property default to false', () => {
    expect(Nuxeo.TreeNode.properties.opened.value).to.be.false;
  });

  test('should have loading property default to false', () => {
    expect(Nuxeo.TreeNode.properties.loading.value).to.be.false;
  });

  suite('through a populated tree', () => {
    let tree;
    let node;
    let controller;

    setup(async () => {
      controller = {
        getChildren: sinon.stub().callsFake((data) => {
          if (data.id === 'root') {
            return Promise.resolve([
              { id: 'a', title: 'A' },
              { id: 'b', title: 'B' },
            ]);
          }
          return Promise.resolve([]);
        }),
        isLeaf: (data) => data.id !== 'root',
      };

      tree = await fixture(html`
        <nuxeo-tree>
          <template>
            <span select>[[item.title]]</span>
          </template>
        </nuxeo-tree>
      `);
      tree.controller = controller;
      tree.data = { id: 'root', title: 'Root' };
      await flush();
      node = tree.querySelector('nuxeo-tree-node');
      // wait for initial open and child rendering
      await new Promise((r) => setTimeout(r, 50));
    });

    test('opens the root and renders children', () => {
      expect(node).to.not.be.null;
      expect(node.opened).to.be.true;
    });

    test('close() toggles opened off', () => {
      node.close();
      expect(node.opened).to.be.false;
    });

    test('toggle flips the opened state when already updated', () => {
      const prev = node.opened;
      node.toggle();
      expect(node.opened).to.equal(!prev);
    });

    test('_selectNode dispatches a select event when no item in detail', async () => {
      const eventPromise = waitForEvent(node, 'select');
      node._selectNode({ detail: {} });
      const event = await eventPromise;
      expect(event.detail.item).to.deep.equal(node.data);
    });

    test('_selectNode dispatches a select event with detail.item when given', async () => {
      const item = { id: 'x' };
      const eventPromise = waitForEvent(node, 'select');
      node._selectNode({ detail: { item } });
      const event = await eventPromise;
      expect(event.detail.item).to.equal(item);
    });

    test('removeSelf removes node from DOM', async () => {
      const parent = node.parentNode;
      await node.removeSelf();
      expect(parent.contains(node)).to.be.false;
    });

    test('_loadMoreData increments page and fetches children when next is available', () => {
      node.isNextAvailable = true;
      node.loading = false;
      const initialPage = node.page;
      node._loadMoreData();
      expect(node.page).to.equal(initialPage + 1);
    });

    test('_loadMoreData is a no-op when loading', () => {
      node.isNextAvailable = true;
      node.loading = true;
      const initialPage = node.page;
      node._loadMoreData();
      expect(node.page).to.equal(initialPage);
    });

    test('_loadMoreData is a no-op when no next available', () => {
      node.isNextAvailable = false;
      node.loading = false;
      const initialPage = node.page;
      node._loadMoreData();
      expect(node.page).to.equal(initialPage);
    });

    test('open() resolves when already updated', async () => {
      const result = await node.open();
      expect(result).to.be.undefined;
    });

    test('changing data tears down every node the previous template instance stamped', async () => {
      const firstInstance = node._instance;
      expect(firstInstance).to.not.be.undefined;

      // `_instance.children` is a plain static array built by Polymer's TemplateInstanceBase (it is
      // only cast to NodeList for the type checker), so snapshotting it here is safe -- removing
      // the nodes from the DOM does not shrink it.
      const stamped = Array.from(firstInstance.children);
      expect(stamped.length, 'the template should have stamped at least one node').to.be.above(0);
      const stampedParent = stamped[0].parentNode;
      expect(stampedParent).to.not.be.null;

      // The `_renderNodeContent(data)` observer calls `_teardownInstance()` when an instance
      // already exists, which removes every stamped node from its parent before re-stamping.
      node.data = { id: 'root', title: 'Root renamed' };
      await flush();
      await new Promise((r) => setTimeout(r, 50));

      expect(node._instance, 'a fresh instance should have replaced the old one').to.not.equal(firstInstance);
      stamped.forEach((child) => {
        expect(stampedParent.contains(child), 'every stamped node should have been removed').to.be.false;
      });
    });
  });

  suite('with a toggle element in the template', () => {
    let tree;
    let node;

    setup(async () => {
      tree = await fixture(html`
        <nuxeo-tree>
          <template>
            <span select>[[item.title]]</span>
            <span toggle class="toggle">+</span>
          </template>
        </nuxeo-tree>
      `);
      tree.controller = {
        getChildren: sinon.stub().callsFake((data) => {
          if (data.id === 'root') {
            return Promise.resolve([{ id: 'a', title: 'A' }]);
          }
          return Promise.resolve([]);
        }),
        isLeaf: (data) => data.id !== 'root',
      };
      tree.data = { id: 'root', title: 'Root' };
      await flush();
      node = tree.querySelector('nuxeo-tree-node');
      await new Promise((r) => setTimeout(r, 50));
    });

    test('clicking a [toggle] element in the stamped template toggles the node', async () => {
      const toggle = node.querySelector('[toggle]');
      expect(toggle, 'the template should have stamped a [toggle] element').to.not.be.null;

      const before = node.opened;
      toggle.click();
      await flush();

      // proves `_setupToggleListener` bound the click handler to the [toggle] element
      expect(node.opened).to.equal(!before);
    });
  });
});
