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

  suite('adding tags to a document', () => {
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

    setup(async () => {
      el = await fixture(
        html`
          <nuxeo-tag-suggestion allow-new-tags></nuxeo-tag-suggestion>
        `,
      );
      el.document = { uid: 'doc-1', contextParameters: { tags: ['existing'] } };
      addExecute = sinon.stub(el.$.addTagOp, 'execute');
      addExecute.callsFake(() => Promise.resolve(tagsResponse('existing', ...el.$.addTagOp.params.tags.split(','))));
    });

    test('sends all the pasted comma-separated tags in a single request', async () => {
      const i18n = sinon.spy((key) => key);
      el.i18n = i18n;
      await paste('tag1,tag2,tag3,tag4');
      await wait();
      expect(addExecute.callCount).to.equal(1);
      expect(i18n).to.have.been.calledWith('tags.multipleAddedToDocument', 'tag1, tag2, tag3, tag4');
      expect(el.$.addTagOp.params).to.deep.equal({ tags: 'tag1,tag2,tag3,tag4' });
      expect(chips()).to.deep.equal(['existing', 'tag1', 'tag2', 'tag3', 'tag4']);
      expect(el.value).to.deep.equal(['existing', 'tag1', 'tag2', 'tag3', 'tag4']);
      expect(el.$.toast.text).to.contain('tags.multipleAddedToDocument');
    });

    test('sends a single added tag on its own', async () => {
      const i18n = sinon.spy((key) => key);
      el.i18n = i18n;
      await paste('tag1');
      await wait();
      expect(i18n).to.have.been.calledWith('tags.addedToDocument', 'tag1');
      expect(el.$.addTagOp.params).to.deep.equal({ tags: 'tag1' });
      expect(chips()).to.deep.equal(['existing', 'tag1']);
      expect(el.$.toast.text).to.contain('tags.addedToDocument');
      expect(el.$.toast.text).to.not.contain('multiple');
    });

    test('shows the label stored by the server on the matching tag', async () => {
      addExecute.callsFake(() => Promise.resolve(tagsResponse('mytag', 'existing', 'tag2')));
      await paste('my tag,tag2');
      await wait();
      expect(chips()).to.deep.equal(['existing', 'mytag', 'tag2']);
      expect(el.value).to.deep.equal(['existing', 'mytag', 'tag2']);
    });

    test('keeps the typed labels when the stored ones cannot be paired with certainty', async () => {
      addExecute.callsFake(() => Promise.resolve(tagsResponse('ab', 'existing', 'mytag')));
      await paste('my tag,a%b');
      await wait();
      expect(chips()).to.deep.equal(['existing', 'my tag', 'a%b']);
    });

    test('does not give a label to a tag when another add is still unconfirmed', async () => {
      el.document = { uid: 'doc-1', contextParameters: { tags: ['ab'] } };
      let resolveFirst;
      let resolveSecond;
      addExecute.onCall(0).returns(
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
      );
      addExecute.onCall(1).returns(
        new Promise((resolve) => {
          resolveSecond = resolve;
        }),
      );
      await paste('my tag');
      await paste('a%b');
      // "a%b" is stored as the existing "ab": the only unseen label is the one of the pending "my tag".
      resolveSecond(tagsResponse('ab', 'mytag'));
      await wait();
      expect(chips()).to.deep.equal(['ab', 'my tag', 'a%b']);
      resolveFirst(tagsResponse('ab', 'mytag'));
      await wait();
      expect(chips()).to.deep.equal(['ab', 'my tag', 'a%b']);
    });

    test('does not send the tags queued for a previous document to the new one', async () => {
      el._addedTagHandler({ id: 'tag1', item: {} });
      el.document = { uid: 'doc-2', contextParameters: { tags: [] } };
      el._addedTagHandler({ id: 'tag2', item: { displayLabel: 'tag2' } });
      await wait();
      expect(addExecute.callCount).to.equal(1);
      expect(el.$.addTagOp.params).to.deep.equal({ tags: 'tag2' });
    });

    test('does not abort a previous tag request', () => {
      expect(el.$.addTagOp.uncancelable).to.be.true;
    });

    test('does not relabel the tags of another document', async () => {
      let resolveAdd;
      addExecute.returns(
        new Promise((resolve) => {
          resolveAdd = resolve;
        }),
      );
      await paste('my tag');
      el.document = { uid: 'doc-2', contextParameters: { tags: ['my tag'] } };
      resolveAdd(tagsResponse('existing', 'mytag'));
      await wait();
      expect(chips()).to.deep.equal(['my tag']);
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
