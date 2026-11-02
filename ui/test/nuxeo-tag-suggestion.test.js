/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../widgets/nuxeo-tag-suggestion.js';

suite('nuxeo-tag-suggestion extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-tag-suggestion></nuxeo-tag-suggestion>
      `,
    );
  });

  suite('_resultFormatter', () => {
    test('renders new tag with class', () => {
      const result = el._resultFormatter({
        displayLabel: 'NewTag',
        newTag: true,
      });
      expect(result).to.include('s2newTag');
      expect(result).to.include('NewTag');
    });

    test('renders existing tag', () => {
      const result = el._resultFormatter({
        displayLabel: 'ExistingTag',
        newTag: false,
      });
      expect(result).to.include('s2existingTag');
      expect(result).to.include('ExistingTag');
    });

    test('escapes HTML in tag label', () => {
      const result = el._resultFormatter({
        displayLabel: '<script>alert(1)</script>',
        newTag: false,
      });
      expect(result).to.not.include('<script>');
    });
  });

  suite('_newEntryFormatter', () => {
    test('lowercases term', () => {
      const result = el._newEntryFormatter('MyTag');
      expect(result.id).to.equal('mytag');
      expect(result.newTag).to.be.true;
    });

    test('handles null term', () => {
      const result = el._newEntryFormatter(null);
      expect(result.id).to.be.null;
    });
  });

  suite('_observeDocument', () => {
    test('sets value from contextParameters.tags', () => {
      el.document = {
        contextParameters: { tags: ['tag1', 'tag2'] },
      };
      el._observeDocument();
      expect(el.value).to.deep.equal(['tag1', 'tag2']);
    });

    test('sets empty value when no tags enricher', () => {
      el.document = { contextParameters: {} };
      el._observeDocument();
      expect(el.value).to.deep.equal([]);
    });

    test('sets empty value for null document', () => {
      el.document = null;
      el._observeDocument();
      expect(el.value).to.deep.equal([]);
    });

    test('sets empty value for doc without contextParameters', () => {
      el.document = {};
      el._observeDocument();
      expect(el.value).to.deep.equal([]);
    });
  });

  suite('_addedTagHandler', () => {
    test('does nothing when no document', () => {
      el.document = null;
      el._addedTagHandler({ id: 'tag1', item: {} });
    });
  });

  suite('adding and removing tags on a document', () => {
    const entry = (id) => {
      return { id, item: { id, displayLabel: id } };
    };
    const tagsResponse = (...labels) => {
      return {
        properties: {
          'nxtag:tags': labels.map((label) => {
            return { label, username: 'Administrator' };
          }),
        },
      };
    };
    const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
    const settle = async () => {
      await wait();
      await el._tagOpQueue;
    };
    const paste = async (text) => {
      const input = el.$.s2.shadowRoot.querySelector('.selectivity-multiple-input');
      input.value = text;
      input.dispatchEvent(new Event('paste', { bubbles: true, composed: true }));
      await wait(50);
    };
    const chips = () =>
      Array.from(el.$.s2._selectivity.el.querySelectorAll('.selectivity-multiple-selected-item')).map((item) =>
        item.textContent.trim(),
      );
    let addExecute;
    let removeExecute;
    let sentTags;

    setup(async () => {
      el = await fixture(
        html`
          <nuxeo-tag-suggestion allow-new-tags></nuxeo-tag-suggestion>
        `,
      );
      el.document = { uid: 'doc-1', contextParameters: { tags: ['existing'] } };
      sentTags = [];
      addExecute = sinon.stub(el.$.addTagOp, 'execute');
      addExecute.callsFake(() => {
        sentTags.push(el.$.addTagOp.params.tags);
        return Promise.resolve(tagsResponse('existing', ...el.$.addTagOp.params.tags.split(',')));
      });
      removeExecute = sinon.stub(el.$.removeTagOp, 'execute').resolves({});
    });

    test('sends all the pasted comma-separated tags in a single request', async () => {
      await paste('tag1,tag2,tag3,tag4');
      await settle();
      expect(sentTags).to.deep.equal(['tag1,tag2,tag3,tag4']);
      expect(el.$.addTagOp.input).to.equal('doc-1');
      expect(chips()).to.deep.equal(['existing', 'tag1', 'tag2', 'tag3', 'tag4']);
      expect(el.value).to.deep.equal(['existing', 'tag1', 'tag2', 'tag3', 'tag4']);
      expect(el.$.toast.text).to.contain('tags.multipleAddedToDocument');
    });

    test('keeps the single tag message when one tag is added', async () => {
      await paste('tag1');
      await settle();
      expect(sentTags).to.deep.equal(['tag1']);
      expect(chips()).to.deep.equal(['existing', 'tag1']);
      expect(el.$.toast.text).to.contain('tags.addedToDocument');
    });

    test('shows the label sanitized by the server on the matching tag', async () => {
      addExecute.callsFake(() => Promise.resolve(tagsResponse('existing', 'tag1', 'clean', 'tag3')));
      await paste('tag1,dirty,tag3');
      await settle();
      expect(chips()).to.deep.equal(['existing', 'tag1', 'clean', 'tag3']);
      expect(el.value).to.deep.equal(['existing', 'tag1', 'clean', 'tag3']);
    });

    test('runs tag operations one at a time so none is aborted', async () => {
      let resolveAdd;
      addExecute.callsFake(() => {
        sentTags.push(el.$.addTagOp.params.tags);
        return new Promise((resolve) => {
          resolveAdd = resolve;
        });
      });
      el._addedTagHandler(entry('tag1'));
      el._removedTagHandler(entry('existing'));
      await wait();
      expect(addExecute.callCount).to.equal(1);
      expect(removeExecute.callCount).to.equal(0);
      resolveAdd(tagsResponse('existing', 'tag1'));
      await settle();
      expect(removeExecute.callCount).to.equal(1);
      expect(el.$.removeTagOp.params).to.deep.equal({ tags: 'existing' });
    });

    test('sends a tag added after a removal after that removal', async () => {
      const calls = [];
      addExecute.callsFake(() => {
        calls.push(`add ${el.$.addTagOp.params.tags}`);
        return Promise.resolve(tagsResponse('existing'));
      });
      removeExecute.callsFake(() => {
        calls.push(`remove ${el.$.removeTagOp.params.tags}`);
        return Promise.resolve({});
      });
      el._addedTagHandler(entry('tag1'));
      el._removedTagHandler(entry('tag2'));
      el._addedTagHandler(entry('tag2'));
      await settle();
      await settle();
      expect(calls).to.deep.equal(['add tag1', 'remove tag2', 'add tag2']);
    });

    test('keeps processing queued operations after a failure', async () => {
      addExecute.rejects(new Error('boom'));
      el._addedTagHandler(entry('tag1'));
      el._removedTagHandler(entry('existing'));
      await settle();
      expect(removeExecute.callCount).to.equal(1);
    });

    test('does not update the tags when the document changed meanwhile', async () => {
      const added = entry('dirty');
      addExecute.callsFake(() => Promise.resolve(tagsResponse('clean')));
      el._addedTagHandler(added);
      el.document = { uid: 'doc-2', contextParameters: { tags: [] } };
      await settle();
      expect(el.$.addTagOp.input).to.equal('doc-1');
      expect(added.item.displayLabel).to.equal('dirty');
    });
  });

  suite('_removedTagHandler', () => {
    test('does nothing when no document', () => {
      el.document = null;
      el._removedTagHandler({ id: 'tag1', item: { displayLabel: 'tag1' } });
    });
  });

  suite('_initSelection', () => {
    test('maps value to objects', () => {
      el.value = ['a', 'b'];
      const result = [];
      el._initSelection(null, (items) => {
        result.push(...items);
      });
      expect(result).to.have.length(2);
      expect(result[0].id).to.equal('a');
      expect(result[0].displayLabel).to.equal('a');
    });
  });
});
