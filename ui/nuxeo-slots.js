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
import '@nuxeo/nuxeo-elements/nuxeo-element.js';

import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { enqueueDebouncer } from '@polymer/polymer/lib/utils/flush.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { templatize } from '@polymer/polymer/lib/utils/templatize.js';
import { idlePeriod } from '@polymer/polymer/lib/utils/async.js';

// global slot registry
const REGISTRY = {};

function _getRegistry(slot) {
  REGISTRY[slot] = REGISTRY[slot] || { nodes: [], slots: [] };
  return REGISTRY[slot];
}

function _same(n1, n2) {
  const k1 = n1.getAttribute('name');
  const k2 = n2.getAttribute('name');
  return k1 && k2 && k1 === k2;
}

function _registerContent(node, slot) {
  const registry = _getRegistry(slot);
  // if content with same name exists check if we should override it
  const idx = registry.nodes.findIndex((n) => _same(node, n));
  if (idx !== -1) {
    // if new content has same or higher priority then do the override
    if (node.priority >= registry.nodes[idx].priority) {
      // if content has a template replace existing one
      if (node.template) {
        registry.nodes[idx] = node;
      } else {
        // merge
        registry.nodes[idx]._merge(node);
      }
    }
  } else {
    registry.nodes.push(node);
  }
  registry.nodes.sort((a, b) => a.order - b.order);
  registry.slots.forEach((s) => {
    s._updateContent();
  });
}

function _unregisterContent(node, slot) {
  const registry = _getRegistry(slot);
  const idx = registry.nodes.findIndex((n) => _same(node, n));
  if (idx !== -1) {
    registry.nodes.splice(idx, 1);
    registry.slots.forEach((s) => {
      s._updateContent();
    });
  }
}

// shared model
let sharedModel = {};
window.nuxeo = window.nuxeo || {};
window.nuxeo.slots = window.nuxeo.slots || {};
window.nuxeo.slots.setSharedModel = (model) => {
  sharedModel = model;
  Object.keys(REGISTRY).forEach(
    (k) =>
      REGISTRY[k] &&
      REGISTRY[k].slots &&
      REGISTRY[k].slots.forEach((slot) => {
        slot._updateSharedModel();
      }),
  );
};

{
  /**
   * Custom element to help build pluggable applications.
   * Slots allow dynamic registration of content which will be stamped in the slot's parent.
   *
   * Example:
   *
   *     <nuxeo-slot name="MY_SLOT">
   *       <!-- <nuxeo-slot-content slot="MY_SLOT"> will appear here -->
   *     </nuxeo-slot>
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-slots/index.html
   */
  class Slot extends Nuxeo.Element {
    static get is() {
      return 'nuxeo-slot';
    }

    static get properties() {
      return {
        /**
         * A unique name for this slot.
         */
        name: {
          type: String,
          observer: '_register',
        },

        /**
         * @deprecated since version 2.4.14, use `name` instead.
         * A unique name for this slot.
         */
        slot: {
          type: String,
          reflectToAttribute: true,
          observer: '_slotChanged',
        },

        /**
         * An object containing key/values to serve as properties in stamped slot content.
         */
        model: {
          type: Object,
          value() {
            return {};
          },
        },

        /**
         * Returns true if this slot is empty.
         */
        empty: {
          type: Boolean,
          value: false,
          notify: true,
        },

        /**
         * Attribute to use as a deduplicationng key of content.
         *
         * Only one contribution with the a given value for this attribute will be stamped. And empty value means no
         * dedupping will occur.
         */
        contentKey: {
          type: String,
          observer: '_updateContent',
        },
      };
    }

    static get observers() {
      return ['_updateModel(model.*)'];
    }

    get slotName() {
      return this.name || this.slot;
    }

    connectedCallback() {
      super.connectedCallback();
      this.unAttached = [];
      this._updateContent();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.unAttached = null;
      this._unregister(this.slotName);
    }

    _slotChanged(newSlot, oldSlot) {
      if (this.name) {
        // If we have `name` defined, it means that `slot` denotes a native HTML slot to which this element is assigned
        // to. In this case, we need to update the content so that it is redrawn under this native slot (or its topmost
        // assigned slot, in case of nested native slots).
        this._updateContent();
      } else {
        this._register(newSlot, oldSlot);
      }
    }

    _register(newSlotName, oldSlotName) {
      if (oldSlotName) {
        this._unregister(oldSlotName);
      }
      _getRegistry(newSlotName).slots.push(this);
    }

    _unregister(slot) {
      const idx = _getRegistry(slot).slots.indexOf(this);
      _getRegistry(slot).slots.splice(idx, 1);
    }

    _clearContent() {
      if (!this._instances) {
        return;
      }
      this._instances.forEach((instance) => {
        const c$ = instance.children;
        if (c$ && c$.length) {
          // use first child parent, for case when dom-if may have been detached
          const p = dom(dom(c$[0]).parentNode);
          // eslint-disable-next-line no-cond-assign
          for (let i = 0, n; i < c$.length && (n = c$[i]); i++) {
            if (n.parentNode) {
              p.removeChild(n);
            }
          }
        }
      });
    }

    /**
     * Returns a pair with:
     * 1) parent: the effective parent of this element
     * 2) parentSlot: the native HTML slot in the parent where this element will be displayed.
     *
     * NB: The effective parent consists of the actual parentNode if this element is not assigned to a
     * native HTML slot, in which case parentSlot is null.
     */
    _effectiveParent() {
      let parent = null;
      let parentSlot = null;
      if (!this.assignedSlot) {
        parent = this.parentNode;
      } else {
        parentSlot = this;
        while (parentSlot.assignedSlot) {
          parentSlot = parentSlot.assignedSlot;
        }
        parent = parentSlot.getRootNode().host;
      }
      return { parent, parentSlot };
    }

    _filterTemplateMutator(filter, instance, pos) {
      // dedup filter
      this._dedup(instance, pos);
      const keys = Array.from(instance.children)
        .filter((c) => c.nodeType === Node.ELEMENT_NODE && c.hasAttribute(this.contentKey))
        .map((c) => c.getAttribute(this.contentKey));
      if (keys.length === 0) {
        return;
      }
      // dedup with previous filters
      const filters = this._instances
        .slice(0, pos + 1)
        .map((i) =>
          i.children.filter((c) => c.nodeType === Node.ELEMENT_NODE && c.parentNode && c.matches('nuxeo-filter')),
        )
        .flat();
      const idx = filters.indexOf(filter);
      const dups = [];
      const consumedValues = new Set();
      filters
        .slice(0, idx)
        .filter((f) => f.check() && f._instance)
        .forEach((f) => {
          Array.from(f._instance.children)
            .filter((c) => c.nodeType === Node.ELEMENT_NODE && c.matches(`[${this.contentKey}]`))
            .forEach((n) => {
              const key = n.hasAttribute(this.contentKey) && n.getAttribute(this.contentKey);
              if (!key || consumedValues.has(key)) {
                return;
              }
              consumedValues.add(key);
              const results = Array.from(instance.root.children).filter(
                (c) => c.nodeType === Node.ELEMENT_NODE && c.parentNode && c.matches(`[${this.contentKey}="${key}"]`),
              );
              dups.push(...results);
            });
        });
      dups.forEach((d) => instance.root.removeChild(d));
      // this._filterReinstate(instance, pos);
      // TODO call update content of filters after pos
    }

    _filterReinstate(instance) {
      // do not reinstate this if any of the previous nuxeo-filters in this._instances checks true
      const filters = this._instances
        .map((i) =>
          i.children.filter((c) => c.nodeType === Node.ELEMENT_NODE && c.parentNode && c.matches('nuxeo-filter')),
        )
        .flat();
      if (filters.length === 0 || (filters.length > 0 && !filters.some((f) => f.check()))) {
        const keys = Array.from(instance.children)
          .filter((c) => c.nodeType === Node.ELEMENT_NODE && c.hasAttribute(this.contentKey))
          .map((c) => c.getAttribute(this.contentKey));
        this._reinstateNodes(keys);
      }
    }

    /**
     * Removes duplicated contributions from this slot's content. It receives as parameters `tmpl`, which represents a
     * template instance to be stamped by the slot, and `pos`, which represents the position of the content to be
     * stamped inside the parent element. Contributions are considered unique based on the attribute defined by
     * `contentKey`. This methods checks for duplicates in the template instance in the parent folder and it takes into
     * account the insertion position.
     *
     * Nuxeo filters are a special case. They lack the ability to dedup content, but they can receive a
     * `templateMutator`, which modifies the template before stamping. Nuxeo slot add the `_dedup` method as the
     * template mutator for nuxeo-filters stamped by it.
     */
    _dedup(tmpl, pos = this._instances.length) {
      const consumedValues = new Set();
      const dups = [];
      const dupsInParent = [];
      // add dedup callback to filter
      Array.from(tmpl.root.children)
        .filter((c) => c.matches('nuxeo-filter'))
        .forEach((f) => {
          f._templateMutator = function(filter, instance) {
            this._filterTemplateMutator(filter, instance, pos);
          }.bind(this);
          f._onClear = this._filterReinstate.bind(this);
        });
      // dedup template instance
      Array.from(tmpl.root.children)
        .filter((c) => c.nodeType === Node.ELEMENT_NODE && c.matches(`[${this.contentKey}]`))
        .forEach((n) => {
          const key = n.hasAttribute(this.contentKey) && n.getAttribute(this.contentKey);
          if (!key || consumedValues.has(key)) {
            return;
          }
          consumedValues.add(key);
          const results = Array.from(tmpl.root.children).filter((c) => c.matches(`[${this.contentKey}="${key}"]`));
          // check if previous instances already have contribs with the same attribute value
          // contributions after `pos` will be ignored
          const prevDup =
            this._instances &&
            this._instances
              .slice(0, pos)
              .some((i) =>
                i.children
                  .filter((c) => c.nodeType === Node.ELEMENT_NODE && c.parentNode)
                  .some((c) => c.matches(`[${this.contentKey}="${key}"]`)),
              );
          // if we already have a previous contibution with the same attribute value, then discard those in the current
          // instance; if not, keep the first with the same value, as the others are dupplicates.
          dups.push(...(prevDup ? results : results.slice(1)));
          this._instances.slice(pos).forEach((i) => {
            const dp = i.children.filter(
              (c) => c.nodeType === Node.ELEMENT_NODE && c.parentNode && c.matches(`[${this.contentKey}="${key}"]`),
            );
            dupsInParent.push(...dp);
          });
        });
      dups.forEach((d) => tmpl.root.removeChild(d));
      dupsInParent.forEach((d) => this.parentNode.removeChild(d));
      this.unAttached.push(...dupsInParent);
    }

    /**
     * This method checks if any of the unattached nodes (resulting from calling `_dedup`) can be reinserted as slot
     * content without causing a duplicate. Unattached nodes with contribution key in `excludeKeys` will be skipped.
     */
    _reinstateNodes(excludeKeys) {
      if (!this.unAttached) {
        return;
      }
      const consumedValues = new Set(excludeKeys);
      Array.from(this.unAttached).forEach((node) => {
        const name = node.hasAttribute(this.contentKey) && node.getAttribute(this.contentKey);
        if (!name || consumedValues.has(name)) {
          return;
        }
        consumedValues.add(name);
        const prevDup =
          this._instances &&
          this._instances.some((i) =>
            i.children
              .filter((c) => c.nodeType === Node.ELEMENT_NODE && c.parentNode)
              .some((c) => c.matches(`[${this.contentKey}="${name}"]`)),
          );
        if (!prevDup) {
          const { parent, parentSlot } = this._effectiveParent();
          if (parentSlot) {
            const slotName = parentSlot.getAttribute('name');
            if (slotName) {
              node.setAttribute('slot', slotName);
            } else {
              node.removeAttribute('slot');
            }
            if (this.parentNode === parent) {
              parent.insertBefore(node, this);
            } else {
              parent.appendChild(node);
            }
          } else {
            parent.insertBefore(node, this);
          }
          this.unAttached.splice(this.unAttached.indexOf(node), 1);
        }
      });
    }

    _render() {
      // render
      const { parent, parentSlot } = this._effectiveParent();
      // keep track of stamped instances
      this._instances = [];
      _getRegistry(this.slotName).nodes.forEach((node) => {
        const { template } = node;
        if (!node.disabled && template) {
          delete template.__templatizeOwner;
          const ctor = templatize(template, this);
          // setting the model in the constructor seems to require instanceProps to be properly set
          // so we're doing it ourselves after
          const el = new ctor({}); // eslint-disable-line new-cap
          Object.keys(sharedModel).forEach((shared) => el._setPendingProperty(shared, sharedModel[shared]));
          Object.keys(this.model).forEach((prop) => el._setPendingProperty(prop, this.model[prop]));
          el._flushProperties();
          // dedup
          if (this.contentKey) {
            this._dedup(el);
          }
          // do not add empty templates
          if (el.root.querySelectorAll('*').length > 0) {
            this._instances.push(el);
            if (parentSlot) {
              const slotName = parentSlot.getAttribute('name');
              el.children
                .filter((c) => c.nodeType === Node.ELEMENT_NODE)
                .forEach((c) => {
                  if (slotName) {
                    c.setAttribute('slot', slotName);
                  } else {
                    c.removeAttribute('slot');
                  }
                });
              if (this.parentNode === parent) {
                parent.insertBefore(el.root, this);
              } else {
                parent.appendChild(el.root);
              }
            } else {
              parent.insertBefore(el.root, this);
            }
          }
        }
      });
      this.set('empty', this._instances.length === 0);
    }

    _updateContent() {
      this.__renderDebouncer = Debouncer.debounce(this.__renderDebouncer, idlePeriod, () => {
        this._clearContent();
        this._render();
      });
      // enqueuing is needed for testing, as it allows content to be stamped on flush
      enqueueDebouncer(this.__renderDebouncer);
    }

    // Forward model changes as properties
    _updateModel(change) {
      if (change.path === 'model') {
        Object.keys(change.value).forEach((prop) => {
          this._forwardHostProp(prop, change.value[prop]);
        });
      } else {
        this._forwardHostProp(change.path.slice('model.'.length + 1), change.value);
      }
    }

    _updateSharedModel() {
      Object.keys(sharedModel).forEach((prop) => {
        this._forwardHostProp(prop, sharedModel[prop]);
      });
    }

    // Implements extension point from Templatizer mixin
    // Called as side-effect of a host property change, responsible for
    // notifying parent.<prop> path change on instance
    _forwardHostProp(prop, value) {
      if (!this._instances) {
        return;
      }
      this._instances.forEach((instance) => {
        instance.set(prop, value);
      }, this);
    }
  }

  customElements.define(Slot.is, Slot);
  Nuxeo.Slot = Slot;
}

{
  /**
   * Registers the given template as content in a `nuxeo-slot`.
   * Each content should have a unique `name` that can later be used to override properties
   * (ex: disabling previously contributed content)
   *
   * Example:
   *     <nuxeo-slot-content slot="MY_SLOT">
   *       <template>
   *         This content will go into MY_SLOT
   *       </template>
   *     </nuxeo-slot-content>
   *
   * @memberof Nuxeo
   * @demo demo/nuxeo-slots/index.html
   */
  class SlotContent extends Nuxeo.Element {
    static get is() {
      return 'nuxeo-slot-content';
    }

    static get properties() {
      return {
        /**
         * The name of the slot where this content is to be displayed.
         * Multiple slot names can be set as comma separated values, ex: SLOT1, SLOT2
         */
        slot: {
          type: String,
          value: '',
          observer: '_slotChanged',
        },

        /**
         * Allows dynamic attach/detach of slot content.
         */
        disabled: {
          type: Boolean,
          value: false,
        },

        /**
         * Controls ordering of slot content nodes in a slot.
         */
        order: {
          type: Number,
          value: 0,
        },

        /**
         * Controls merging of slot content with same name.
         */
        priority: {
          type: Number,
          value: 0,
        },
      };
    }

    static get observers() {
      return ['_register(disabled, order, priority)'];
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._unregister(this.slot);
    }

    get template() {
      return dom(this).querySelector('template');
    }

    _merge(other) {
      this.slot = other.slot;
      this.disabled = other.disabled;
      this.order = other.order;
      this.priority = other.priority;
    }

    _slotChanged(_, oldSlot) {
      if (oldSlot) {
        this._unregister(oldSlot);
      }
      this._register();
    }

    _register() {
      // Note that nuxeo-slot-content expects to have a template as content, but it is not required. It can
      // be used without a template for disabling content or redefining priorities or order. Therefore, we should
      // make sure we wait for the template in case the DOM distribution of the element is not yet complete. An
      // exception can be made when we're disabling content, in which case the template will always be ignored.
      if (!this.disabled) {
        this.__ensureTemplate();
      }
      this.slot.split(',').forEach((slot) => {
        _registerContent(this, slot);
      });
    }

    _unregister(slots) {
      slots.split(',').forEach((slot) => {
        _unregisterContent(this, slot);
      });
    }

    __ensureTemplate() {
      // This method returns `true` if there is a template and `false` otherwise. If there's no template,
      // it sets a mutation observer to re-trigger `_register` when a template is added to this element's dom.
      // see https://github.com/Polymer/polymer/blob/v3.3.1/lib/elements/dom-repeat.js#L342-L355
      if (!this.template) {
        // // Wait until childList changes and template should be there by then
        this.observer = new MutationObserver(() => {
          if (this.querySelector('template')) {
            this.observer.disconnect();
            this._register();
          } else {
            throw new Error('nuxeo-slot-content requires a <template> child');
          }
        });
        this.observer.observe(this, { childList: true });
        return false;
      }
      return true;
    }
  }

  customElements.define(SlotContent.is, SlotContent);
  Nuxeo.SlotContent = SlotContent;
}
