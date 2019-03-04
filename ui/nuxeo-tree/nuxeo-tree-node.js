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
import '@polymer/iron-collapse/iron-collapse.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/polymer/lib/utils/templatize.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom, flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  /**
   * Part of `nuxeo-tree`
   * @appliesMixin Polymer.Templatizer
   * @appliesMixin Nuxeo.I18nBehavior
   * @memberof Nuxeo
   */
  class TreeNode extends mixinBehaviors([Templatizer, I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      :host {
        display: block;
        @apply --nuxeo-tree-node-theme;
      }

      ::slotted(iron-collapse) {
        padding-left: 1em;
        @apply --nuxeo-tree-children-theme;
      }

      ::slotted(.more) {
        @apply --nuxeo-tree-node-more-theme;
      }

      ::slotted(#content) {
        position: relative;
        margin: .1rem 0 .2rem;
      }

      ::slotted(#content iron-icon) {
        margin-top: -0.25rem;
      }

      ::slotted(span iron-icon) {
        width: .95rem;
        margin: 0 .1rem .3rem 0;
      }

    </style>

    <slot></slot>
`;
    }

    static get is() {
      return 'nuxeo-tree-node';
    }

    static get properties() {
      return {
        data: Object,

        _children: {
          type: Array,
        },

        /**
         * An object for accessing information for rendering a tree node.
         *
         * getChildren(node) : Promise<Array<Object>>
         * isLeaf(node) : Boolean
         */
        controller: Object,

        opened: {
          type: Boolean,
          value: false,
          observer: '_openedChanged',
        },

        loading: {
          type: Boolean,
          value: false,
          observer: '_loadingChanged',
        },

        /**
         * Template used to render each tree node.
         */
        template: Object,

        nodeKey: {
          type: String,
          value: 'id',
        },
        page: {
          type: Number,
          value: 1,
        },
        isNextAvailable: {
          type: Boolean,
          value: false,
        },

        _parentModel: {
          type: Boolean,
          value: true,
        },
      };
    }

    static get observers() {
      return [
        '_renderNodeContent(data)',
      ];
    }

    toggle() {
      if (this._updated) {
        this.opened = !this.opened;
      } else {
        this._fetchChildren();
        this.opened = true;
      }
    }

    _selectNode(e) {
      let detail;
      if (!e.detail.item) {
        detail = { item: this.data };
      } else {
        detail = { item: e.detail.item };
      }
      this.dispatchEvent(new CustomEvent('select', {
        composed: true,
        bubbles: true,
        detail,
      }));
    }

    open() {
      this.opened = true;
      if (!this._updated) {
        return this._fetchChildren();
      }
      return Promise.resolve();
    }

    close() {
      this.opened = false;
    }

    _renderNodeContent() {
      if (this.template) {
        if (this._instance) {
          // re-render if data changes
          this._teardownInstance();
          this._fetchChildren();
        }
        this.template.__templatizeOwner = null; // XXX: find a way to remove this line
        // templatize must be called once before stamp is called
        this.templatize(this.template, true);
        // stamp and prepare bindings
        this._instance = this.stamp({});
        this._instance.item = this.data;
        this._instance.opened = this.opened;
        this._instance.loading = this.loading;
        this._instance.isLeaf = this.controller.isLeaf(this.data);
        this.dataset[this.nodeKey] = this.data[this.nodeKey];

        const content = document.createElement('div');
        content.id = 'content';
        dom(content).appendChild(this._instance.root);
        dom(this).appendChild(content);

        const children = document.createElement('iron-collapse');
        children.id = 'children';
        children.opened = this.opened;
        children.loading = this.loading;
        children.noAnimation = 'true';
        dom(this).appendChild(children);

        flush();
        // append node content
        // this.$.content.appendChild(this._instance.root);
        this._setupToggleListener();
      }
    }

    _renderChildNodes() {
      if (this.template) {
        return new Promise(((resolve) => {
          // clear <iron-collapse> content in case we are re-rendering
          const children = dom(this).querySelector('#children');
          while (children.lastChild) {
            children.removeChild(children.lastChild);
          }

          const items = this._children || [];
          for (let i = 0; i < items.length; i++) {
            const el = document.createElement('nuxeo-tree-node');
            el.controller = this.controller;
            el.template = this.template;
            el.nodeKey = this.nodeKey;
            el.dataHost = this._instance._rootDataHost;
            el.data = items[i];
            children.appendChild(el);
          }
          if (this.isNextAvailable) {
            const addMore = document.createElement('a');
            addMore.setAttribute('class', 'more');
            addMore.appendChild(document.createTextNode(this.i18n('tree.loadMore')));
            this.listen(addMore, 'click', '_loadMoreData');
            children.appendChild(addMore);
          }
          resolve();
          this.loading = false;
        }));
      }
    }

    _loadMoreData() {
      if (this.isNextAvailable && !this.loading) {
        this.page = this.page + 1;
        this._fetchChildren();
      }
    }

    _fetchChildren() {
      this.loading = true;
      if (this.page === 1) {
        this._children = [];
        this.isNextAvailable = true;
      }
      if (this.isNextAvailable) {
        return this.controller.getChildren(this.data, this.page).then((results) => {
          if (results.items) {
            results.items.forEach((doc) => {
              this.push('_children', doc);
            });
            this.isNextAvailable = results.isNextAvailable;
          } else {
            this._children = results;
            this.isNextAvailable = false;
          }
          this._updated = true;
          return this._renderChildNodes();
        });
      }
    }

    _setupToggleListener() {
      flush();
      const selectElts = dom(this).querySelector('#content').querySelectorAll('[select]');
      for (let i = 0; i < selectElts.length; i++) {
        this.listen(selectElts[i], 'click', '_selectNode');
      }
      const toggleEls = dom(this).querySelector('#content').querySelectorAll('[toggle]');
      for (let i = 0; i < toggleEls.length; i++) {
        this.listen(toggleEls[i], 'click', 'toggle');
      }
    }

    // Implements extension point from Templatizer mixin
    // Called as side-effect of a host property change, responsible for
    // notifying parent.<prop> path change on instance
    _forwardParentProp(prop, value) {
      if (this._instance) {
        this._instance[prop] = value;
      }
    }

    _teardownInstance() {
      const children = this._instance.children;
      if (children && children.length) {
        const parent = dom(dom(children[0]).parentNode);
        for (let i = 0; i < children.length; i++) {
          parent.removeChild(children[i]);
        }
      }
      this._instance = null;
      this._updated = false;
    }

    _openedChanged() {
      if (this._instance) {
        dom(this).querySelector('#children').opened = this.opened;
        this._instance.notifyPath('opened', this.opened);
        this._setupToggleListener();
      }
    }

    _loadingChanged() {
      if (this._instance) {
        dom(this).querySelector('#children').loading = this.loading;
        this._instance.notifyPath('loading', this.loading);
      }
    }

    removeSelf() {
      this.remove();
      return Promise.resolve();
    }
  }

  customElements.define(TreeNode.is, TreeNode);
  Nuxeo.TreeNode = TreeNode;
}
