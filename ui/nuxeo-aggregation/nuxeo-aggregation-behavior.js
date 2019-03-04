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
/**
 * @polymerBehavior Nuxeo.AggregationBehavior
 */
export const AggregationBehavior = {
  properties: {

    data: {
      type: Object,
    },

    value: {
      type: Array,
      value: [],
      notify: true,
    },

    buckets: {
      type: Object,
      computed: '_computeBuckets(data)',
    },

    _isEmpty: {
      type: Boolean,
      value: true,
    },

    /**
     * Sort buckets by label instead of doc count.
     */
    sortByLabel: Boolean,

    /**
     * Function used to format the label of the aggregate entry.
     */
    labelFormatter: {
      type: Function,
      value() {
        return this._computeLabel.bind(this);
      },
    },

  },

  observers: [
    '_observeData(data)',
  ],

  _observeData() {
    if (this.data && this.data.extendedBuckets) {
      this._isEmpty = this.data.extendedBuckets.length === 0;
    } else {
      this._isEmpty = true;
    }
  },

  _computeBuckets(data) {
    if (data) {
      const buckets = data.extendedBuckets;
      const selectedBuckets = data.selection;
      buckets.forEach((item) => {
        item.checked = selectedBuckets.indexOf(item.key) >= 0;
        item.label = this.labelFormatter(item);
      });
      if (this.sortByLabel) {
        buckets.sort((a, b) => {
          if (a.label < b.label) {
            return -1;
          } else if (a.label > b.label) {
            return 1;
          }
          return 0;
        });
      }
      return buckets;
    }
  },

  _computeValues() {
    const values = [];
    this.buckets.forEach((item) => {
      if (item.checked) {
        values.push(item.key);
      }
    });
    this.value = values;
  },

  _computeLabel(item) {
    let i18nKey;
    if (item.fetchedKey) {
      const entry = item.fetchedKey;
      if (entry['entity-type'] === 'directoryEntry') {
        return this.labelForDirectoryEntry(entry);
      } else if (entry['entity-type'] === 'user') {
        return this.labelForUserEntry(entry);
      } else if (entry['entity-type'] === 'document') {
        return entry.properties['dc:title'] || this.i18n('aggregation.format.document.field.unknown', 'dc:title');
      } else {
        i18nKey = this.i18n(`label.ui.aggregate.${item.key}`);
        return i18nKey === `label.ui.aggregate.${item.key}` ? item.key : i18nKey;
      }
    } else {
      i18nKey = this.i18n(`label.ui.aggregate.${item.key}`);
      return i18nKey === `label.ui.aggregate.${item.key}` ? item.key : i18nKey;
    }
  },

  labelForDirectoryEntry(entry) {
    let lang = window.nuxeo.I18n.language || 'en';
    if (lang.indexOf('-') > -1) {
      lang = lang.split('-')[0];
    }
    const labels = [];
    while (entry) {
      if (entry.properties[`label_${lang}`]) {
        labels.push(entry.properties[`label_${lang}`]);
      } else if (entry.properties.label) {
        labels.push(entry.properties.label);
      } else if (entry.properties.label_en) {
        labels.push(entry.properties.label_en);
      } else {
        labels.push(entry.properties.id);
      }
      entry = entry.properties.parent;
    }
    return labels.reverse().join('/');
  },

  labelForUserEntry(entry) {
    if (entry.properties === undefined) {
      return entry.id;
    } else if (entry.properties.firstName && entry.properties.firstName.length > 0
     && entry.properties.lastName && entry.properties.lastName.length > 0) {
      return `${entry.properties.firstName} ${entry.properties.lastName}`;
    } else {
      return entry.properties.username;
    }
  },

};
