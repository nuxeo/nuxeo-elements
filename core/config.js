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

Nuxeo = Nuxeo || {};
Nuxeo.UI = Nuxeo.UI || {};
Nuxeo.UI.config = Nuxeo.UI.config || {};
const { config } = Nuxeo.UI;

Object.assign(config, {
  get(path) {
    return path.split('.').reduce((a, b) => a && a[b], this);
  },
  set(path, value) {
    const parentPath = path.substring(0, path.lastIndexOf('.'));
    let parent = this.get(parentPath);
    if (!parent) {
      parent = path
        .split('.')
        .slice(0, -1)
        .reduce((a, b) => {
          a[b] = a[b] || {};
          return a[b];
        }, this);
    }
    parent[path.substring(path.lastIndexOf('.') + 1)] = value;
  },
});

export default config;
