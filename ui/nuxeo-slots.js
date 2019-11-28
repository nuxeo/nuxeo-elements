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
      this._updateContent();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
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
            p.removeChild(n);
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
