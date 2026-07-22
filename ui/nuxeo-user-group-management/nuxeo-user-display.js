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

/**
 * Returns a human-readable display name for a user entity,
 * preferring firstName + lastName, falling back to username.
 */
export function formatUserDisplayName(user) {
  if (!user) return '';
  const props = user.properties || {};
  const first = props.firstName || props['user:firstName'] || '';
  const last = props.lastName || props['user:lastName'] || '';
  const full = [first, last].join(' ').trim();
  return full || props.username || props['user:username'] || user.id || user.name || '';
}

/**
 * Returns the principal identifier for a user entity (the login username),
 * suitable for ACL queries and entity bindings.
 */
export function formatUserPrincipal(user) {
  if (!user) return '';
  const props = user.properties || {};
  return props.username || props['user:username'] || user.id || user.name || '';
}
