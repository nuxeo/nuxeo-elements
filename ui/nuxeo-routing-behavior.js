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
import { config } from '@nuxeo/nuxeo-elements';

/**
 * `Nuxeo.RoutingBehavior` provides a `urlFor` helper function for reverse routing.
 *
 * @polymerBehavior Nuxeo.RoutingBehavior
 */
export const RoutingBehavior = {
  properties: {
    router: {
      type: Object,
      observer: '_routerChanged',
      value() {
        return RoutingBehavior.__router;
      },
    },
    urlFor: {
      type: Function,
      computed: '_computeUrlFor(router)',
    },
    navigateTo: {
      type: Function,
      computed: '_computeNavigateTo(router)',
    },
  },

  attached() {
    // initialize router
    this._updateRouter();

    this.routerChangedHandler = this._updateRouter.bind(this);

    document.addEventListener('nuxeo-router-changed', this.routerChangedHandler);
  },

  detached() {
    document.removeEventListener('nuxeo-router-changed', this.routerChangedHandler);
  },

  _updateRouter() {
    this.router = this.router || RoutingBehavior.__router;
  },

  // Caches the router
  _routerChanged(router) {
    if (router && !RoutingBehavior.__router) {
      // eslint-disable-next-line no-use-before-define
      setRouter(router);
    }
  },

  _generateUrl(baseUrl, path) {
    const base = `${baseUrl}${this.router.useHashbang ? `${baseUrl.endsWith('/') ? '' : '/'}#!` : ''}`;
    return `${base}${base.endsWith('/') || path.startsWith('/') ? '' : '/'}${path}`;
  },

  /**
   * Returns a computed `urlFor` method, based on the current `router`.
   */
  _computeUrlFor() {
    return function(...args) {
      if (this.router) {
        const [route, ...params] = args;
        if (!route) {
          return '';
        }
        const baseUrl = this.router.baseUrl || '';
        let path;
        if (typeof route === 'object') {
          if (!Object.keys(route).length) {
            return '';
          }
          path = this._routeEntity(...args);
          const isFullpath = /^http(s)?:\/\//.test(path);
          if (!isFullpath) {
            path = this._generateUrl(baseUrl, path);
          }
        } else {
          if (route.startsWith('/')) {
            return baseUrl + route;
          }
          if (!this.router[route]) {
            console.error(`Could not generate a url for route ${route}`);
            return;
          }
          path = this._generateUrl(baseUrl, this.router[route].apply(this, params));
        }
        return path;
      }
    };
  },

  /**
   * Returns a computed `navigateTo` method, based on the current `router`.
   * Invokes `router.navigate` to trigger the actual navigation.
   */
  _computeNavigateTo() {
    return function(...args) {
      if (this.router) {
        const [route, ...params] = args;
        let path;
        if (typeof route === 'object') {
          path = this._routeEntity(...args);
        } else {
          if (route.startsWith('/')) {
            this.router.navigate((this.router.baseUrl || '') + route);
          }
          if (!this.router[route]) {
            console.error(`Could not navigate to a url for route ${route}`);
          }
          path = this.router[route].apply(this, params);
        }
        this.router.navigate(path);
      } else {
        console.error('No router defined');
      }
    };
  },

  _routeEntity(...args) {
    if (args.length === 0) {
      return;
    }
    const [obj, ...params] = args;
    if (typeof obj !== 'object') {
      throw new Error(`cannot resolve route: "${obj}" is not a valid entity object`);
    }
    let entityType = obj['entity-type'];
    if (!entityType) {
      // XXX Sometimes we don't have the entity type. For example, on nuxeo-document-storage, we were not storing it.
      // In such cases, we'll assume we are dealing with a document if it has both a path and a uid properties.
      if (obj.path && obj.uid) {
        entityType = 'document';
      } else {
        throw new Error(`cannot resolve route: object does not have an "entity-type"`);
      }
    }
    let routeKey = config.get(`router.key.${entityType}`);
    let baseUrl = '';
    let fn = this.router[entityType];
    if (entityType === 'document') {
      routeKey = routeKey || 'path';
      if (obj.isProxy || obj.isVersion) {
        routeKey = 'uid';
      }
      if (obj.repository && Nuxeo.UI && Nuxeo.UI.repositories && Nuxeo.UI.repositories.length > 1) {
        baseUrl = `${window.location.origin}${Nuxeo.UI.repositories.find((r) => r.name === obj.repository).href}`;
      }
      // XXX we keep `routeKey === 'path' && this.router.browse` to keep compat routers that override the document
      // document` method and do not know how to handle paths
      fn = (routeKey === 'path' && this.router.browse) || fn;
    }
    routeKey = routeKey || 'id'; // let `id` be the default key
    const routeVal = obj[routeKey];
    if (!routeVal) {
      throw new Error(`invalid router key: ${routeKey}`);
    }
    const path = fn(routeVal, ...params);
    // if we have a baseURL (i.e., we have a repository), let's generate the full URL
    return baseUrl ? this._generateUrl(baseUrl, path) : path;
  },
};

export const setRouter = (router) => {
  RoutingBehavior.__router = router;
  if (document) {
    document.dispatchEvent(new Event('nuxeo-router-changed'));
  }
};
