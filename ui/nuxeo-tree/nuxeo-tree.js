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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import './nuxeo-tree-node.js';

{
  /**
   * An element to display a tree.
   *
   * + The template represents the DOM to create for the nodes
   * + The `data` property specifies the model of a node
   * + The `controller` provides helpers to render a given node, and these methods __must__ be implemented.
   *
   * ### Template model
   *
   * Given the following `data` array:
   *
   * ##### data.json
   *
   * ```js
   * [
   *   title: 'root',
   *   children: [
   *     {
   *       title: 'a',
   *       children: []
   *     },
   *     {
   *       title: 'b',
   *       children: [
   *         {title: 'x'},
   *         {title: 'y'}
   *       ]
   *     }
   *   ]
   * ]
   * ```
   *
   * The following code would render the tree (note the `title` property is bound from the model
   * object provided to the template scope, and there are also other properties such as `opened`
   * and `isLeaf` which are added to the binding scope):
   *
   * ```html
   * <nuxeo-tree data="[[data]]" controller="[[controller]]">
   *   <template>
   *     <template is="dom-if" if="[[!opened]]">
   *       <iron-icon icon="hardware:keyboard-arrow-right" toggle></iron-icon>
   *     </template>
   *     <template is="dom-if" if="[[opened]]">
   *       <iron-icon icon="hardware:keyboard-arrow-down" toggle></iron-icon>
   *     </template>
   *     <span select>My title is: [[item.title]]</span>
   *     <span>Am I a leaf? [[isLeaf]]</span>
   *   </template>
   * </nuxeo-tree>
   * ```
   *
   * The attribute `[toggle]` can be added to any element in the template to toggle a node between opened and closed.
   *
   * The attribute `[select]` can be added to any element in the template to select a node when clicking the element.
   * It will result in the tree firing a 'select' event having the node data as item of the event's detail.
   *
   * In addition to the template, you must also provide a `controller`.
   * For example, for the previous sample:
   *
   * ```js
   * controller = {
   *   // How to get children of a node. Returns a promise.
   *   getChildren: function(node) {
   *     return Promise.resolve(node.children);
   *   },
   *
   *   // Logics you may want to have to control if a node is a leaf.
   *   isLeaf: function(node) {
   *     return node.children.length === 0;
   *   }
   * };
   * ```
   *
   * `nuxeo-tree`
   * @memberof Nuxeo
   * @demo demo/nuxeo-tree/index.html
   */
  class Tree extends Nuxeo.Element {
    static get template() {
      return html`
        <style>
          :host {
            display: block;
            @apply --nuxeo-tree-theme;
          }
        </style>

        <slot></slot>
      `;
    }

    static get is() {
      return 'nuxeo-tree';
    }

    static get properties() {
      return {
        data: Object,

        /**
         * An object for accessing information for rendering a tree item.
         *
         * getChildren(node) : Promise<Array<Object>>
         * isLeaf(node) : Boolean
         */
        controller: Object,

        /**
         * Template used to render each tree item.
         */
        template: Object,

        nodeKey: {
          type: String,
          value: 'id',
        },
      };
    }

    static get observers() {
      return ['_update(data, controller)'];
    }

    /**
     * Initializes the tree whenever the data and/or controller changes.
     */
    _update() {
      if (this.data && this.controller) {
        const template = dom(this).querySelector('template');
        if (this._root) {
          dom(this).removeChild(this._root);
        }
        this._root = document.createElement('nuxeo-tree-node');
        this._root.id = 'root';
        this._root.template = template;
        this._root.dataHost = this.dataHost;
        this._root.controller = this.controller;
        this._root.nodeKey = this.nodeKey;
        this._root.data = this.data;
        this._root.dataset[this.nodeKey] = this.data[this.nodeKey];
        dom(this).appendChild(this._root);
        this._root.open();
      }
    }

    /**
     * Find and open a set of nodes given a set of keys.
     * Nodes keys must be sorted in terms of hierarchy, otherwise some nodes
     * might not be rendered yet.
     */
    open() {
      this._openNodes(arguments); // eslint-disable-line prefer-rest-params
    }

    /**
     * Recursively opens a set of nodes.
     */
    _openNodes(keys) {
      if (!keys || keys.length === 0) {
        return;
      }
      const node = this._find(keys[0]);
      if (node) {
        node.open().then(() => {
          this._openNodes(Array.prototype.slice.call(keys, 1));
        });
      }
    }

    /**
     * Find a node by key.
     */
    _find(key) {
      return this.querySelector(`[data-${this.nodeKey}="${key}"]`);
    }

    removeNodes(keys) {
      if (!keys || keys.length === 0) {
        return;
      }
      const node = this._find(keys[0]);
      if (node) {
        node.removeSelf().then(() => {
          this.removeNodes(Array.prototype.slice.call(keys, 1));
        });
      }
    }
  }

  customElements.define(Tree.is, Tree);
  Nuxeo.Tree = Tree;
}
