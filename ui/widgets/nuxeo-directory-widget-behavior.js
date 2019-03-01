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
import '@polymer/polymer/polymer-legacy.js';
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronValidatableBehavior } from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import { I18nBehavior } from '../nuxeo-i18n-behavior.js';

/**
 * `Nuxeo.DirectoryWidgetBehavior` provides helpers to build a widget to select Nuxeo vocabulary entrie(s).
 *
 * @polymerBehavior
 */
export const DirectoryWidgetBehavior = [I18nBehavior, IronFormElementBehavior,
  IronValidatableBehavior, {

    properties: {
      /**
       * Name of the directory.
       */
      directoryName: {
        type: String,
      },

      /**
       * Checking this option means that the labels are localized with translations provided
       * in the directory itself (i.e. in fields). Otherwise labels are translated as usual
       * picking values in messages*.properties files.
       */
      dbl10n: { type: Boolean, value: false },

      /**
       * Label.
       */
      label: String,

      /**
       * In case of hierarchical vocabulary, if true, parent item can be selected.
       */
      canSelectParent: Boolean,

      /**
       * Set to `true` for read only mode.
       */
      readonly: {
        type: Boolean,
        value: false,
      },

      /**
       * Function used to get the id from the choice object.
       */
      idFunction: {
        type: Function,
        value() {
          return this._idFunction.bind(this);
        },
      },

      /**
       * Error message to show when `invalid` is true.
       */
      errorMessage: String,

      /**
       * Formatter for the entries.
       */
      format: {
        type: Function,
        value() {
          return this._formatter.bind(this);
        },
      },

      /**
       * Fired when the directory entries are loaded.
       *
       * @event directory-entries-loaded
       */

      _entries: Array,
    },

    observers: [
      '_fetchEntries(directoryName)',
    ],

    _fetchEntries() {
      if (this.directoryName) {
        this.value = [];
        this.async(() => {
          this.$.op.params = {
            directoryName: this.directoryName,
            dbl10n: this.dbl10n,
            canSelectParent: this.canSelectParent,
            localize: true,
            lang: (window.nuxeo.I18n.language) ? window.nuxeo.I18n.language.split('-')[0] : 'en',
          };
          this.$.op.execute().then((resp) => {
            this._entries = [];
            resp.forEach((entry) => {
              this._populate(entry);
            });
            this.dispatchEvent(new CustomEvent('directory-entries-loaded', {
              composed: true,
              bubbles: true,
            }));
          });
        });
      }
    },

    _formatter(entry) {
      return entry.absoluteLabel || entry.displayLabel;
    },

    _idFunction(item) {
      return item.id || item.computedId || item.uid;
    },

    _populate(entry) {
      if (this.canSelectParent || !entry.children) {
        entry.checked = this._isChecked(entry);
        this._entries.push(entry);
      }
      if (entry.children) {
        entry.children.forEach((child) => {
          this._populate(child);
        });
      }
    },
  }];
