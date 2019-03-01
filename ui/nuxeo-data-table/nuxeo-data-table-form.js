/* Part of `nuxeo-data-table` */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/iron-form/iron-form.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import '@polymer/paper-button/paper-button.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

{
  class DataTableForm extends mixinBehaviors([Templatizer, I18nBehavior], Nuxeo.Element) {
    static get template() {
      return html`
    <style>
      #container {
        margin: 24px;
      }
    </style>
    <iron-form id="editForm">
      <form>
        <div id="container"></div>
      </form>
    </iron-form>
`;
    }

    static get is() {
      return 'nuxeo-data-table-form';
    }

    static get properties() {
      return {
        item: {
          type: Object,
          notify: true,
          observer: '_itemChanged',
        },
        slot: {
          value: 'form',
          type: String,
          reflectToAttribute: true,
          readonly: true,
        },
        index: Number,
      };
    }

    ready() {
      super.ready();
      const template = this.queryEffectiveChildren('template');
      // custom notification for the `item` property
      this._instanceProps = { item: true };
      this.templatize(template);
      this.instance = this.stamp({ item: this.item });
      this.instance.dispatchEvent = function () {
      };
      dom(this.$.container).appendChild(this.instance.root);
    }

    validateItem() {
      return this.$.editForm.validate();
    }

    _itemChanged() {
      if (this.instance) {
        this.instance.item = this.item;
        this.instance.i18n = this.i18n;
      }
    }

    _notifyInstancePropV2(inst, prop, value) {
      this.notifyPath(prop, value);
    }
  }

  customElements.define(DataTableForm.is, DataTableForm);
  Nuxeo.DataTableForm = DataTableForm;
}
