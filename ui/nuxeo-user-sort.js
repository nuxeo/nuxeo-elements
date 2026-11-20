/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.
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

/**
 * Sorts chosen by the user on a page provider, from a table header or from a sort selector, so that a reset can give
 * the provider back the sort it had before (ELEMENTS-2017). Keyed by page provider: per provider, the sort it had before
 * the user first changed it and the last sort the user chose.
 */
const userSorts = new WeakMap();

/**
 * Gives a page provider a sort the user chose. The sort the provider had before the user first changed it is remembered,
 * so `restoreDefaultSort` can give it back. A sort set otherwise in the meantime, e.g. by the page for another folder,
 * becomes the one to remember.
 *
 * @param {Object} provider The page provider.
 * @param {Object} sort The sort, as a map of property to direction.
 */
export function applyUserSort(provider, sort) {
  const entry = userSorts.get(provider);
  const defaultSort = entry && provider.sort === entry.userSort ? entry.defaultSort : provider.sort;
  userSorts.set(provider, { defaultSort, userSort: sort });
  provider.sort = sort;
}

/**
 * Gives a page provider back the sort it had before the user changed it, as long as it still holds the last sort the
 * user chose, and forgets both. A sort set otherwise since, e.g. by the page for another folder, is left alone.
 *
 * @param {Object} provider The page provider.
 * @return {boolean} `true` when the sort of the provider changed.
 */
export function restoreDefaultSort(provider) {
  const entry = userSorts.get(provider);
  userSorts.delete(provider);
  if (!entry || provider.sort !== entry.userSort) {
    return false;
  }
  const defaultSort = entry.defaultSort || {};
  if (JSON.stringify(defaultSort) === JSON.stringify(entry.userSort)) {
    return false;
  }
  provider.sort = defaultSort;
  return true;
}

// Also reachable as Nuxeo.UserSort, so an application can use it when present without depending on an Elements build
// that provides this module.
window.Nuxeo = window.Nuxeo || {};
Nuxeo.UserSort = { applyUserSort, restoreDefaultSort };
