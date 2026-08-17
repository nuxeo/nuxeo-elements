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
import { fixture, flush, html } from '@nuxeo/testing-helpers';
import '../nuxeo-tree/nuxeo-tree.js';

suite('nuxeo-tree', () => {
  test('should return the element name', () => {
    expect(Nuxeo.Tree.is).to.equal('nuxeo-tree');
  });

  test('should have default nodeKey as id', () => {
    expect(Nuxeo.Tree.properties.nodeKey.value).to.equal('id');
  });

  suite('with data and controller', () => {
    let tree;
    let controller;

    setup(async () => {
      controller = {
        getChildren: sinon.stub().resolves([]),
        isLeaf: () => false,
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
    });

    test('_update creates a root nuxeo-tree-node', () => {
      const root = tree.querySelector('nuxeo-tree-node');
      expect(root).to.not.be.null;
      expect(root.id).to.equal('root');
    });

    test('_update replaces the existing root when data changes', async () => {
      const firstRoot = tree.querySelector('nuxeo-tree-node');
      tree.data = { id: 'root2', title: 'Root2' };
      await flush();
      const secondRoot = tree.querySelector('nuxeo-tree-node');
      expect(secondRoot).to.not.equal(firstRoot);
    });

    test('_find returns the matching node by key', () => {
      const node = tree._find('root');
      expect(node).to.not.be.null;
      expect(node.tagName.toLowerCase()).to.equal('nuxeo-tree-node');
    });

    test('_find returns null for an unknown key', () => {
      expect(tree._find('missing')).to.be.null;
    });

    test('open with no keys is a no-op', () => {
      expect(() => tree.open()).to.not.throw();
    });

    test('_openNodes returns early with empty keys', () => {
      expect(() => tree._openNodes([])).to.not.throw();
      expect(() => tree._openNodes(null)).to.not.throw();
    });

    test('removeNodes is a no-op with empty keys', () => {
      expect(() => tree.removeNodes([])).to.not.throw();
      expect(() => tree.removeNodes(null)).to.not.throw();
    });

    test('removeNodes removes matching node when found', async () => {
      const node = tree._find('root');
      const removeSpy = sinon.spy(node, 'removeSelf');
      tree.removeNodes(['root']);
      expect(removeSpy).to.have.been.called;
      removeSpy.restore();
    });

    // WEBUI-1877: a consumer puts role="tree"/role="treeitem" around these nodes, so the layout-only
    // wrappers must not sit in the accessibility tree as untyped nodes.
    test('the node wrappers are presentational and children form a group', () => {
      const root = tree.querySelector('nuxeo-tree-node');
      expect(root.getAttribute('role')).to.equal('none');
      expect(root.querySelector('#content').getAttribute('role')).to.equal('none');
      expect(root.querySelector('#children').getAttribute('role')).to.equal('group');
    });

    test('an explicit role on a node is preserved', async () => {
      const node = document.createElement('nuxeo-tree-node');
      node.setAttribute('role', 'treeitem');
      tree.appendChild(node);
      await flush();
      expect(node.getAttribute('role')).to.equal('treeitem');
      node.remove();
    });
  });
});
