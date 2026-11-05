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
import { fixture, html, timePasses } from '@nuxeo/testing-helpers';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '../widgets/nuxeo-user-suggestion.js';

suite('nuxeo-user-suggestion', () => {
  test('prefixed mode intialization', async () => {
    const value = [
      {
        'entity-type': 'user',
        extendedGroups: [
          {
            label: 'My awesome group',
            name: 'awesome',
            url: 'group/awesome',
          },
        ],
        id: 'jdoe',
        isAdministrator: false,
        isAnonymous: false,
        properties: {
          company: 'nuxeo',
          email: 'jdoe@nuxeo.com',
          firstName: 'John',
          groups: ['awesome'],
          lastName: 'Doe',
          tenantId: null,
          username: 'jdoe',
        },
      },
      {
        company: 'Nux',
        displayIcon: true,
        displayLabel: 'Bob Jones',
        email: 'bob@jones.com',
        'entity-type': 'user',
        firstName: 'Bob',
        groups: [],
        id: 'bjones',
        lastName: 'Jones',
        prefixed_id: 'user:bjones',
        tenantId: null,
        type: 'USER_TYPE',
        username: 'bjones',
      },
      {
        'entity-type': 'group',
        grouplabel: 'Awesome group',
        groupname: 'awesome',
        id: 'awesome',
        properties: {
          description: 'Group of awesome users',
          grouplabel: 'Awesome group',
          groupname: 'awesome',
          tenantId: null,
        },
      },
    ];
    const prefixedWidget = await fixture(html`
      <nuxeo-user-suggestion multiple prefixed .value="${value}"></nuxeo-user-suggestion>
    `);
    await timePasses(100);

    const s2 = dom(prefixedWidget.root).querySelector('#s2');
    const items = dom(s2.root).querySelectorAll('.selectivity-multiple-selected-item');

    expect(items.length).to.be.equal(3);
    expect(items[0].textContent).to.be.equal('John Doe');
    expect(items[1].textContent).to.be.equal('Bob Jones');
    expect(items[2].textContent).to.be.equal('Awesome group');
  });
});

suite('nuxeo-user-suggestion extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-user-suggestion></nuxeo-user-suggestion>
      `,
    );
  });

  suite('_selectionFormatter', () => {
    test('returns firstName + lastName for user entity with both', () => {
      const item = {
        'entity-type': 'user',
        properties: { firstName: 'John', lastName: 'Doe' },
      };
      const result = el._selectionFormatter(item);
      expect(result).to.include('John Doe');
    });

    test('returns grouplabel for group entity with grouplabel', () => {
      const item = { 'entity-type': 'group', grouplabel: 'Admins' };
      const result = el._selectionFormatter(item);
      expect(result).to.include('Admins');
    });

    test('returns groupname when grouplabel is missing', () => {
      const item = { 'entity-type': 'group', grouplabel: '', groupname: 'admins' };
      const result = el._selectionFormatter(item);
      expect(result).to.include('admins');
    });

    test('returns displayLabel when entity-type is neither user nor group', () => {
      const item = { 'entity-type': 'other', displayLabel: 'Custom Label' };
      const result = el._selectionFormatter(item);
      expect(result).to.include('Custom Label');
    });

    test('returns id when no displayLabel', () => {
      const item = { id: 'user1' };
      const result = el._selectionFormatter(item);
      expect(result).to.include('user1');
    });

    test('returns item itself when no id', () => {
      const result = el._selectionFormatter('plain-string');
      expect(result).to.include('plain-string');
    });

    test('returns empty-ish span for null item', () => {
      const result = el._selectionFormatter(null);
      expect(result).to.be.a('string');
    });

    test('handles user entity missing firstName', () => {
      const item = {
        'entity-type': 'user',
        properties: { firstName: '', lastName: 'Doe' },
      };
      const result = el._selectionFormatter(item);
      expect(result).to.be.a('string');
    });

    test('handles user entity missing properties', () => {
      const item = { 'entity-type': 'user', displayLabel: 'Fallback' };
      const result = el._selectionFormatter(item);
      expect(result).to.include('Fallback');
    });
  });

  suite('_resultFormatter', () => {
    test('returns user-group-formatter for USER_TYPE', () => {
      const item = { type: 'USER_TYPE', id: 'jdoe' };
      const result = el._resultFormatter(item);
      expect(result).to.include('nuxeo-user-group-formatter');
    });

    test('returns user-group-formatter for GROUP_TYPE', () => {
      const item = { type: 'GROUP_TYPE', id: 'admins' };
      const result = el._resultFormatter(item);
      expect(result).to.include('nuxeo-user-group-formatter');
    });

    test('returns displayLabel fallback when type is missing', () => {
      const item = { displayLabel: 'Some Label' };
      const result = el._resultFormatter(item);
      expect(result).to.include('Some Label');
    });

    test('returns title fallback when displayLabel is missing', () => {
      const item = { title: 'Fallback Title' };
      const result = el._resultFormatter(item);
      expect(result).to.include('Fallback Title');
    });

    test('returns displayLabel when type is not USER_TYPE or GROUP_TYPE', () => {
      const item = { type: 'OTHER', displayLabel: 'Other' };
      const result = el._resultFormatter(item);
      expect(result).to.include('Other');
    });
  });

  suite('_resolveEntry', () => {
    test('returns the item as-is when it has entity-type', () => {
      const item = { 'entity-type': 'user', id: 'jdoe' };
      expect(el._resolveEntry(item)).to.equal(item);
    });

    test('returns id/displayLabel object when item is a string', () => {
      const result = el._resolveEntry('jdoe');
      expect(result.id).to.equal('jdoe');
      expect(result.displayLabel).to.equal('jdoe');
    });

    test('includes prefixed_id when prefixed is true', () => {
      el.prefixed = true;
      const result = el._resolveEntry('jdoe');
      expect(result.prefixed_id).to.equal('jdoe');
    });

    test('wraps null into id/displayLabel object', () => {
      const result = el._resolveEntry(null);
      expect(result).to.have.property('id', null);
      expect(result).to.have.property('displayLabel', null);
    });

    test('wraps undefined into id/displayLabel object', () => {
      const result = el._resolveEntry(undefined);
      expect(result).to.have.property('id', undefined);
      expect(result).to.have.property('displayLabel', undefined);
    });
  });

  suite('_idFunction', () => {
    test('returns item.id when not prefixed', () => {
      el.prefixed = false;
      expect(el._idFunction({ id: 'jdoe' })).to.equal('jdoe');
    });

    test('returns prefixed_id when prefixed and available', () => {
      el.prefixed = true;
      expect(el._idFunction({ prefixed_id: 'user:jdoe', 'entity-type': 'user', id: 'jdoe' })).to.equal('user:jdoe');
    });

    test('constructs prefixed id when prefixed but no prefixed_id', () => {
      el.prefixed = true;
      expect(el._idFunction({ 'entity-type': 'user', id: 'jdoe' })).to.equal('user:jdoe');
    });

    test('constructs group prefixed id', () => {
      el.prefixed = true;
      expect(el._idFunction({ 'entity-type': 'group', id: 'admins' })).to.equal('group:admins');
    });
  });

  suite('_computeParams', () => {
    test('includes searchType and groupRestriction', () => {
      el.searchType = 'USER_TYPE';
      el.groupRestriction = 'myGroup';
      const result = el._computeParams();
      expect(result.searchType).to.equal('USER_TYPE');
      expect(result.groupRestriction).to.equal('myGroup');
    });

    test('merges custom params over defaults', () => {
      el.params = { customKey: 'val' };
      const result = el._computeParams();
      expect(result.customKey).to.equal('val');
    });
  });
  suite('bare id label resolution', () => {
    const jdoe = { 'entity-type': 'user', id: 'jdoe', properties: { firstName: 'John', lastName: 'Doe' } };
    const bmartin = { 'entity-type': 'user', id: 'bmartin', properties: { firstName: 'Bob', lastName: 'Martin' } };
    const labels = (widget) =>
      Array.from(dom(widget.$.s2.root).querySelectorAll('.preserve-white-space'))
        .map((n) => n.textContent.trim())
        .filter(Boolean);

    // Mimics nuxeo-resource: the path is read asynchronously and a new request aborts the previous one.
    const stubGet = (widget, entities) => {
      const resource = widget.$.entityResource;
      let current = 0;
      return sinon.stub(resource, 'get').callsFake(() => {
        current += 1;
        const request = current;
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const id = decodeURIComponent(resource.path.split('/')[1]);
            if (request !== current) {
              reject(new Error('aborted'));
            } else if (Object.prototype.hasOwnProperty.call(entities, id)) {
              resolve(entities[id]);
            } else {
              reject(new Error('404'));
            }
          }, 5);
        });
      });
    };

    test('multiple: resolves ids into full names without firing a change', async () => {
      const widget = await fixture(
        html`
          <nuxeo-user-suggestion multiple search-type="USER_TYPE"></nuxeo-user-suggestion>
        `,
      );
      const get = stubGet(widget, { jdoe, bmartin });
      widget.value = ['jdoe', 'bmartin'];
      const onChange = sinon.spy();
      widget.addEventListener('value-changed', onChange);
      await timePasses(200);
      expect(labels(widget)).to.deep.equal(['John Doe', 'Bob Martin']);
      expect(get.callCount).to.equal(2);
      expect(widget.value).to.deep.equal(['jdoe', 'bmartin']);
      expect(onChange.callCount).to.equal(0);
    });

    test('single: resolves the id into a full name', async () => {
      const widget = await fixture(
        html`
          <nuxeo-user-suggestion search-type="USER_TYPE"></nuxeo-user-suggestion>
        `,
      );
      stubGet(widget, { bmartin });
      widget.value = 'bmartin';
      await timePasses(200);
      expect(labels(widget)).to.deep.equal(['Bob Martin']);
      expect(widget.value).to.equal('bmartin');
    });

    test('unknown ids fall back to the id and do not throw', async () => {
      const widget = await fixture(
        html`
          <nuxeo-user-suggestion multiple search-type="USER_TYPE"></nuxeo-user-suggestion>
        `,
      );
      stubGet(widget, { jdoe });
      widget.value = ['jdoe', 'deleted'];
      await timePasses(200);
      expect(labels(widget)).to.deep.equal(['John Doe', 'deleted']);
    });

    test('ids named like Object.prototype members are looked up', async () => {
      const widget = await fixture(
        html`
          <nuxeo-user-suggestion search-type="USER_TYPE"></nuxeo-user-suggestion>
        `,
      );
      const odd = { 'entity-type': 'user', id: 'constructor', properties: { firstName: 'Odd', lastName: 'Name' } };
      const get = stubGet(widget, { constructor: odd });
      widget.value = 'constructor';
      await timePasses(200);
      expect(get.callCount).to.equal(1);
      expect(labels(widget)).to.deep.equal(['Odd Name']);
    });

    test('replacing the value while a lookup is pending still resolves the selection', async () => {
      const widget = await fixture(
        html`
          <nuxeo-user-suggestion multiple search-type="USER_TYPE"></nuxeo-user-suggestion>
        `,
      );
      stubGet(widget, { jdoe, bmartin });
      widget.value = ['jdoe'];
      await timePasses(1);
      widget.value = ['jdoe', 'bmartin'];
      await timePasses(200);
      expect(labels(widget)).to.deep.equal(['John Doe', 'Bob Martin']);
      widget.value = ['bmartin'];
      await timePasses(50);
      expect(labels(widget)).to.deep.equal(['Bob Martin']);
    });

    test('prefixed ids look up the matching user or group', async () => {
      const widget = await fixture(
        html`
          <nuxeo-user-suggestion multiple prefixed></nuxeo-user-suggestion>
        `,
      );
      const group = { 'entity-type': 'group', id: 'admins', grouplabel: 'Administrators' };
      const get = stubGet(widget, { jdoe, admins: group });
      widget.value = ['user:jdoe', 'group:admins'];
      await timePasses(200);
      expect(labels(widget)).to.deep.equal(['John Doe', 'Administrators']);
      expect(get.callCount).to.equal(2);
      expect(widget.value).to.deep.equal(['user:jdoe', 'group:admins']);
    });
  });
});
