import '@polymer/polymer/polymer-legacy.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';

window.saulis = window.saulis || {};

/** @polymerBehavior */
saulis.DataTableTemplatizerBehaviorImpl = {
  properties: {
    expanded: Boolean,
    index: Number,
    item: Object,
    selected: Boolean,
    table: Object,
    template: Object,

    // singleton
    _forwardedParentProps: {
      type: Object,
      value: {},
    },

    _instance: {
      type: Object,
      computed: '_templatize(template)',
    },
  },

  observers: [
    '_expandedChanged(_instance, expanded)',
    '_indexChanged(_instance, index)',
    '_itemChanged(_instance, item)',
    '_itemPathChanged(_instance, item.*)',
    '_selectedChanged(_instance, selected)',
  ],

  created() {
    this._instanceProps = {
      column: true,
      expanded: true,
      index: true,
      item: true,
      selected: true,
    };
  },

  detached() {
    this.table = null;
    this._instance = null;
  },

  _templatize(template) {

    if (!template) {
      return;
    }

    delete template.__templatizeOwner;

    this.templatize(template);

    // fix _rootDataHost to the context where template has been defined
    if (template._rootDataHost) {
      this._getRootDataHost = function () {
        return template._rootDataHost;
      };
    }

    const instance = this.stamp({});


    // initializing new template instance with previously forwarded parent props.
    // could be done with observers, but this is simpler.
    Object.keys(this._forwardedParentProps).forEach((key) => {
      instance[key] = this._forwardedParentProps[key];
    });

    dom(this).insertBefore(instance.root, dom(this).firstElementChild);

    return instance;
  },

  _expandedChanged(instance, expanded) {
    // store original expanded value to detect when value change has
    // originated from within the template.
    this._expanded = expanded;

    if (instance) {
      instance.expanded = expanded;
    }
  },

  _indexChanged(instance, index) {
    if (instance) {
      instance.index = index;
    }
  },

  _itemChanged(instance, item) {
    if (instance) {
      instance.item = item;
    }
  },

  _itemPathChanged(instance, item) {
    // TODO: hack to avoid: https://github.com/Polymer/polymer/issues/3307
    this._parentProps = this._parentProps || {};

    if (instance) {
      instance.notifyPath(item.path, item.value);
    }
  },

  _selectedChanged(instance, selected) {
    // store original selected value to detect when value change has
    // originated from within the template.
    this._selected = selected;

    if (instance) {
      instance.selected = selected;
    }
  },

  /** templatizer */
  _forwardHostPropV2(prop, value) {
    // store props to initialize new instances.
    this._forwardedParentProps[prop] = value;
    if (this._instance) {
      this._instance[prop] = value;
    }
  },

  _notifyInstancePropV2(inst, prop, value) {
    if (prop === 'expanded' && inst.item && this._expanded !== value) {
      if (value) {
        this.table.expandItem(inst.item);
      } else {
        this.table.collapseItem(inst.item);
      }
    }

    if (prop === 'selected' && inst.item && this._selected !== value) {
      if (value) {
        this.table.selectItem(inst.item);
      } else {
        this.table.deselectItem(inst.item);
      }
    }
  },

  _forwardInstancePath(inst, path, value) {
    if (path.indexOf('item') === 0) {
      // instance.notifyPath above will call _forwardInstancePath recursively,
      // so need to debounce to avoid firing the same event multiple times.
      this.table._debouncer = Debouncer.debounce(
        this.table._debouncer,
        microTask, () => {
          this.table.dispatchEvent(new CustomEvent('item-changed', {
            composed: true,
            bubbles: true,
            // stripping 'item.' from path.
            detail: { item: inst.item, path: path.substring(5), value },
          }));
        },
      );
    }
  },
};

/** @polymerBehavior */
saulis.DataTableTemplatizerBehavior = [Templatizer, saulis.DataTableTemplatizerBehaviorImpl];
