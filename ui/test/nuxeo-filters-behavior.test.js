/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

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
import { fixture, html } from '@nuxeo/testing-helpers';
import { Polymer } from '@polymer/polymer/polymer-legacy.js';
import { FiltersBehavior } from '../nuxeo-filters-behavior.js';

window.Polymer = Polymer;

Polymer({
  is: 'nuxeo-filters-behavior-host',
  behaviors: [FiltersBehavior],
  // mimic Polymer.Base.get used by FiltersBehavior.hasContent
  get(path, root) {
    const segments = path.split('.');
    let cur = root;
    for (const seg of segments) {
      if (cur == null) return undefined;
      cur = cur[seg];
    }
    return cur;
  },
});

const docWith = (overrides = {}) => {
  return {
    type: 'File',
    state: 'project',
    isVersion: false,
    isProxy: false,
    isRecord: false,
    hasLegalHold: false,
    isUnderRetentionOrLegalHold: false,
    facets: ['Versionable'],
    schemas: [{ name: 'dublincore', prefix: 'dc' }],
    path: '/default-domain/workspaces/foo',
    contextParameters: {
      permissions: ['Read'],
      favorites: { isFavorite: false },
      subscribedNotifications: [],
      collections: [],
    },
    properties: {
      'file:content': null,
      'files:files': [],
      'uid:major_version': 0,
      'uid:minor_version': 0,
    },
    ...overrides,
  };
};

suite('Nuxeo.FiltersBehavior', () => {
  let host;

  setup(async () => {
    host = await fixture(html`
      <nuxeo-filters-behavior-host></nuxeo-filters-behavior-host>
    `);
  });

  suite('favorite / subscription / collection / trashed', () => {
    test('isFavorite reads contextParameters.favorites.isFavorite', () => {
      expect(host.isFavorite()).to.not.be.ok;
      expect(host.isFavorite(docWith())).to.be.false;
      expect(host.isFavorite(docWith({ contextParameters: { favorites: { isFavorite: true } } }))).to.be.true;
    });

    test('isSubscribed checks subscribedNotifications length', () => {
      expect(host.isSubscribed()).to.not.be.ok;
      expect(host.isSubscribed(docWith())).to.be.false;
      expect(host.isSubscribed(docWith({ contextParameters: { subscribedNotifications: ['x'] } }))).to.be.true;
    });

    test('isCollectionMember is the negation of the NotCollectionMember facet', () => {
      expect(host.isCollectionMember()).to.be.false;
      expect(host.isCollectionMember(docWith({ facets: [] }))).to.be.true;
      expect(host.isCollectionMember(docWith({ facets: ['NotCollectionMember'] }))).to.be.false;
    });

    test('isTrashed prefers the explicit isTrashed flag, falls back to lifecycle state', () => {
      expect(host.isTrashed()).to.be.false;
      expect(host.isTrashed(docWith({ isTrashed: true }))).to.be.true;
      expect(host.isTrashed(docWith({ isTrashed: false }))).to.be.false;
      expect(host.isTrashed(docWith({ state: 'deleted', isTrashed: undefined }))).to.be.true;
      expect(host.isTrashed(docWith({ state: 'project', isTrashed: undefined }))).to.be.false;
    });
  });

  suite('hasState / hasFacet / hasPermission / hasType', () => {
    test('returns false for missing input', () => {
      expect(host.hasState()).to.be.undefined;
      expect(host.hasFacet()).to.be.undefined;
      expect(host.hasPermission()).to.be.undefined;
      expect(host.hasType()).to.be.undefined;
    });

    test('matches the requested value', () => {
      const doc = docWith();
      expect(host.hasState(doc, 'project')).to.be.true;
      expect(host.hasState(doc, 'archived')).to.be.false;
      expect(host.hasFacet(doc, 'Versionable')).to.be.true;
      expect(host.hasFacet(doc, 'Folderish')).to.be.false;
      expect(host.hasPermission(doc, 'Read')).to.be.true;
      expect(host.hasPermission(doc, 'Write')).to.be.false;
      expect(host.hasType(doc, 'File')).to.be.true;
      expect(host.hasType(doc, 'Folder')).to.be.false;
    });
  });

  suite('path predicates', () => {
    test('pathMatches honours the regex', () => {
      const doc = docWith({ path: '/default-domain/section' });
      expect(host.pathMatches(doc, '^/default-domain')).to.be.true;
      expect(host.pathMatches(doc, '^/foo')).to.be.false;
    });

    test('pathStartsWith is anchored at the beginning', () => {
      const doc = docWith({ path: '/default-domain/workspaces/foo' });
      expect(host.pathStartsWith(doc, '/default-domain')).to.be.true;
      expect(host.pathStartsWith(doc, '/workspaces')).to.be.false;
    });
  });

  suite('content / attachments / versions / collections / schema', () => {
    test('hasContent honours the xpath argument', () => {
      const doc = docWith({ properties: { 'file:content': { name: 'x.pdf' }, 'files:files': [] } });
      expect(host.hasContent(doc)).to.deep.equal({ name: 'x.pdf' });
      expect(host.hasContent(docWith())).to.be.null;
      expect(host.hasContent()).to.be.false;
    });

    test('hasAttachments checks files:files length', () => {
      expect(host.hasAttachments()).to.not.be.ok;
      expect(host.hasAttachments(docWith())).to.be.false;
      const withAttachments = docWith({ properties: { 'files:files': [{ file: {} }] } });
      expect(host.hasAttachments(withAttachments)).to.be.true;
    });

    test('hasVersions returns true when major or minor version is positive', () => {
      expect(host.hasVersions(docWith())).to.be.false;
      expect(host.hasVersions(docWith({ properties: { 'uid:major_version': 1, 'uid:minor_version': 0 } }))).to.be.true;
      expect(host.hasVersions(docWith({ properties: { 'uid:major_version': 0, 'uid:minor_version': 1 } }))).to.be.true;
    });

    test('hasCollections checks contextParameters.collections length', () => {
      expect(host.hasCollections()).to.not.be.ok;
      expect(host.hasCollections(docWith())).to.be.false;
      expect(host.hasCollections(docWith({ contextParameters: { collections: [{ id: 'c1' }] } }))).to.be.true;
    });

    test('hasSchema accepts both prefix and name', () => {
      const doc = docWith({ schemas: [{ name: 'dublincore', prefix: 'dc' }] });
      expect(host.hasSchema(doc, 'dc')).to.be.true;
      expect(host.hasSchema(doc, 'dublincore')).to.be.true;
      expect(host.hasSchema(doc, 'unknown')).to.be.false;
    });
  });

  suite('immutability / version / record / proxy flags', () => {
    test('isVersion / isProxy / isRecord / isUnderRetentionOrLegalHold simply forward the flag', () => {
      expect(host.isVersion(docWith({ isVersion: true }))).to.be.true;
      expect(host.isProxy(docWith({ isProxy: true }))).to.be.true;
      expect(host.isRecord(docWith({ isRecord: true }))).to.be.true;
      expect(host.isUnderRetentionOrLegalHold(docWith({ isUnderRetentionOrLegalHold: true }))).to.be.true;
    });

    test('isImmutable is derived from the Immutable facet', () => {
      expect(host.isImmutable(docWith())).to.be.false;
      expect(host.isImmutable(docWith({ facets: ['Immutable'] }))).to.be.true;
    });

    test('isPublishable requires the right facet, permission and lifecycle', () => {
      expect(
        host.isPublishable(
          docWith({
            facets: ['Publishable'],
            contextParameters: { permissions: ['WriteVersion'] },
          }),
        ),
      ).to.be.true;
      expect(
        host.isPublishable(
          docWith({
            isProxy: true,
            facets: ['Publishable'],
            contextParameters: { permissions: ['WriteVersion'] },
          }),
        ),
      ).to.be.false;
      expect(host.isPublishable(docWith())).to.be.false;
    });

    test('isPublication requires both the proxy flag and the Immutable facet', () => {
      expect(host.isPublication(docWith({ isProxy: true, facets: ['Immutable'] }))).to.be.true;
      expect(host.isPublication(docWith({ isProxy: true }))).to.be.false;
      expect(host.isPublication(docWith({ facets: ['Immutable'] }))).to.be.false;
    });

    test('isTaggable rejects proxies and versions', () => {
      const taggable = docWith({ contextParameters: { permissions: ['Write'] } });
      expect(host.isTaggable(taggable)).to.be.true;
      expect(host.isTaggable({ ...taggable, isProxy: true })).to.be.false;
      expect(host.isTaggable({ ...taggable, isVersion: true })).to.be.false;
    });
  });

  suite('retention / legal hold', () => {
    test('canSetRetention requires permissions, content and no running workflow', () => {
      const base = docWith({
        properties: { 'file:content': { name: 'a.pdf' } },
        contextParameters: {
          permissions: ['MakeRecord', 'SetRetention'],
        },
      });
      expect(host.canSetRetention(base)).to.be.true;
      expect(host.canSetRetention({ ...base, hasLegalHold: true })).to.be.false;
      expect(host.canSetRetention({ ...base, isVersion: true })).to.be.false;
      expect(
        host.canSetRetention({
          ...base,
          contextParameters: {
            permissions: ['MakeRecord'],
            runningWorkflows: [],
          },
        }),
      ).to.be.false;
      expect(
        host.canSetRetention({
          ...base,
          contextParameters: {
            permissions: ['MakeRecord', 'SetRetention'],
            runningWorkflows: [{ id: 'w1' }],
          },
        }),
      ).to.be.false;
    });

    test('canSetLegalHold requires Write/MakeRecord/ManageLegalHold and content', () => {
      const base = docWith({
        properties: { 'file:content': { name: 'a.pdf' } },
        contextParameters: { permissions: ['MakeRecord', 'ManageLegalHold'] },
      });
      expect(host.canSetLegalHold(base)).to.be.true;
      expect(host.canSetLegalHold({ ...base, isVersion: true })).to.be.false;
      expect(host.canSetLegalHold({ ...base, contextParameters: { permissions: ['MakeRecord'] } })).to.be.false;
    });

    test('isRetentionDateIndeterminate compares against the documented sentinel', () => {
      expect(host.isRetentionDateIndeterminate()).to.not.be.ok;
      expect(host.isRetentionDateIndeterminate({ retainUntil: '9999-01-01T00:00:00.000+00:00' })).to.be.true;
      expect(host.isRetentionDateIndeterminate({ retainUntil: '2030-01-01T00:00:00.000+00:00' })).to.be.false;
    });
  });

  suite('users / workflows', () => {
    test('isMember walks extendedGroups for the requested name', () => {
      expect(host.isMember()).to.not.be.ok;
      const user = { extendedGroups: [{ name: 'admins' }, { name: 'powerusers' }] };
      expect(host.isMember(user, 'admins')).to.deep.equal({ name: 'admins' });
      expect(host.isMember(user, 'guests')).to.be.undefined;
    });

    test('hasAdministrationPermissions accepts both isAdministrator and powerusers membership', () => {
      expect(host.hasAdministrationPermissions()).to.not.be.ok;
      expect(host.hasAdministrationPermissions({ isAdministrator: true })).to.be.true;
      expect(host.hasAdministrationPermissions({ extendedGroups: [{ name: 'powerusers' }] })).to.deep.equal({
        name: 'powerusers',
      });
      expect(host.hasAdministrationPermissions({ extendedGroups: [{ name: 'guests' }] })).to.be.undefined;
    });

    test('hasRunningWorkflows / hasRunnableWorkflows guard against missing context', () => {
      expect(host.hasRunningWorkflows()).to.be.false;
      expect(host.hasRunningWorkflows({})).to.be.false;
      expect(host.hasRunningWorkflows({ contextParameters: {} })).to.not.be.ok;
      expect(host.hasRunningWorkflows({ contextParameters: { runningWorkflows: [{ id: 'w' }] } })).to.be.true;
      expect(host.hasRunnableWorkflows()).to.be.false;
      expect(host.hasRunnableWorkflows({})).to.be.false;
      expect(host.hasRunnableWorkflows({ contextParameters: { runnableWorkflows: [{ id: 'p' }] } })).to.be.true;
    });
  });
});
