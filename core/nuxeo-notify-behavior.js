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
import '@polymer/polymer/polymer-legacy.js';

let fallback;

/**
 * Sets an element as the default fallback notification target. See `NotifyBehavior.notify` for more details.
 *
 * @param {*} el The element to be set as the fallback notification target.
 */
export const setFallbackNotificationTarget = (el) => {
  fallback = el;
};

/**
 * @polymerBehavior Nuxeo.NotifyBehavior
 */
export const NotifyBehavior = {
  /**
   * Fires a notification event. The event will be fired from the current element if it is attached to the DOM.
   * Otherwise, it will be fired from the fallback notification target, if defined. It can be set with
   * `setFallbackNotificationTarget`.
   *
   * @param {*} options the event options; these might vary according to who's handling the event.
   */
  notify(options) {
    const target = this.isConnected ? this : fallback;
    if (!target) {
      return;
    }
    target.dispatchEvent(
      new CustomEvent('notify', {
        composed: true,
        bubbles: true,
        detail: options,
      }),
    );
  },
};
