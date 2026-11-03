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

    // Expected labels follow AbstractTagService#cleanLabel: lowercase, then remove spaces, "/", "\", "'" and "%".
    [
      {
        paste: "plain,my tag,a%b,it's",
        server: ['ab', 'plain', 'its', 'mytag'],
        chips: ['plain', 'mytag', 'ab', 'its'],
      },
      { paste: 'my tag,a%b', server: ['ab', 'mytag'], chips: ['mytag', 'ab'] },
      { paste: 'my tag,my-tag', server: ['my-tag', 'mytag'], chips: ['mytag', 'my-tag'] },
      { paste: 'a%b,a-b', server: ['a-b', 'ab'], chips: ['ab', 'a-b'] },
      { paste: 'a%b,a-b', server: ['ab', 'a-b'], chips: ['ab', 'a-b'] },
      { paste: 'a%b,ab', server: ['a-b', 'ab'], chips: ['ab'] },
      { paste: 'a%b,a/b', server: ['a-b', 'ab'], chips: ['ab'] },
      { paste: 'a%b,a/b', server: ['ab', 'a-b'], chips: ['ab'] },
      { paste: 'a-%b,a%b', server: ['a-b', 'ab'], chips: ['a-b', 'ab'] },
      { paste: 'my tag,my%tag', server: ['mytag'], chips: ['mytag'] },
      { paste: 'my tag,other tag', server: ['mytag', 'othertag'], chips: ['mytag', 'othertag'] },
    ].forEach(({ paste: text, server, chips: expected }) => {
      test(`shows the label stored by the server when pasting "${text}" (${server.join(', ')})`, async () => {
        addExecute.callsFake(() => Promise.resolve(tagsResponse('existing', ...server)));
        await paste(text);
        await settle();
        expect(chips()).to.deep.equal(['existing', ...expected]);
        expect(el.value).to.deep.equal(['existing', ...expected]);
      });
    });

    test('keeps the typed label when the stored one cannot be told apart', async () => {
      addExecute.callsFake(() => Promise.resolve(tagsResponse('existing', 'ab%c', 'abc')));
      await paste('a b%c');
      await settle();
      expect(chips()).to.deep.equal(['existing', 'a b%c']);
    });

    test('shows the stored label when a removal is queued while the tag is being added', async () => {
      let resolveAdd;
      addExecute.callsFake(
        () =>
          new Promise((resolve) => {
            resolveAdd = resolve;
          }),
      );
      const added = entry('my tag');
      el._addedTagHandler(added);
      await wait();
      el._removedTagHandler(entry('existing'));
      resolveAdd(tagsResponse('existing', 'mytag'));
      await settle();
      expect(added.item.displayLabel).to.equal('mytag');
    });

    test('starts a new batch when tags are added to another document', async () => {
      const calls = [];
      let resolveRemove;
      removeExecute.callsFake(
        () =>
          new Promise((resolve) => {
            resolveRemove = resolve;
          }),
      );
      addExecute.callsFake(() => {
        calls.push(`${el.$.addTagOp.input} ${el.$.addTagOp.params.tags}`);
        return Promise.resolve(tagsResponse());
      });
      el._removedTagHandler(entry('existing'));
      await wait();
      el._addedTagHandler(entry('a1'));
      el.document = { uid: 'doc-2', contextParameters: { tags: [] } };
      el._addedTagHandler(entry('b1'));
      resolveRemove({});
      await settle();
      await settle();
      expect(calls).to.deep.equal(['doc-1 a1', 'doc-2 b1']);
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

    test('removes the pasted tags and tells the user when they could not be saved', async () => {
      addExecute.rejects(new Error('boom'));
      await paste('tag1,tag2');
      await settle();
      await wait();
      expect(el.value).to.deep.equal(['existing']);
      expect(chips()).to.deep.equal(['existing']);
      expect(removeExecute.callCount).to.equal(0);
      expect(el.$.toast.text).to.contain('tags.addToDocumentFailed');
    });

    test('shows a tag again and tells the user when it could not be removed', async () => {
      removeExecute.rejects(new Error('boom'));
      el.$.s2.value = [];
      el._removedTagHandler(entry('existing'));
      await settle();
      await wait();
      expect(el.value).to.deep.equal(['existing']);
      expect(chips()).to.deep.equal(['existing']);
      expect(addExecute.callCount).to.equal(0);
      expect(el.$.toast.text).to.contain('tags.removeFromDocumentFailed');
    });

    // Simulates the user adding/removing a chip: updates the selection, then notifies the widget like selectivity.
    const addChip = (id) => {
      const added = entry(id);
      el.value = [...(el.value || []), id];
      el._addedTagHandler(added);
      return added;
    };
    const removeChip = (id) => {
      el.value = (el.value || []).filter((value) => value !== id);
      el._removedTagHandler(entry(id));
    };

    test('keeps a re-added tag when its first add fails', async () => {
      let rejectFirstAdd;
      addExecute.onFirstCall().returns(
        new Promise((resolve, reject) => {
          rejectFirstAdd = reject;
        }),
      );
      addExecute.callsFake(() => Promise.resolve(tagsResponse('existing', 'a')));
      addChip('a');
      await wait();
      removeChip('a');
      addChip('a');
      rejectFirstAdd(new Error('boom'));
      await settle();
      await settle();
      await settle();
      expect(addExecute.callCount).to.equal(2);
      expect(el.value).to.deep.equal(['existing', 'a']);
    });

    test('does not show a removed tag again when a later removal of it succeeds', async () => {
      let call = 0;
      removeExecute.callsFake(() => {
        call += 1;
        return call === 1 ? Promise.reject(new Error('boom')) : Promise.resolve({});
      });
      addExecute.callsFake(() => Promise.resolve(tagsResponse('existing')));
      removeChip('existing');
      addChip('existing');
      removeChip('existing');
      await settle();
      await settle();
      await settle();
      expect(el.value).to.deep.equal([]);
    });

    test('does not show a tag again when neither its add nor its removal was saved', async () => {
      let rejectAdd;
      addExecute.returns(
        new Promise((resolve, reject) => {
          rejectAdd = reject;
        }),
      );
      removeExecute.rejects(new Error('boom'));
      addChip('x');
      await wait();
      removeChip('x');
      rejectAdd(new Error('boom'));
      await settle();
      await settle();
      expect(removeExecute.callCount).to.equal(1);
      expect(el.value).to.deep.equal(['existing']);
    });

    // Removes a chip through selectivity, which notifies the widget with the item it currently holds.
    const clickRemove = (label) => {
      const item = Array.from(el.$.s2._selectivity.el.querySelectorAll('.selectivity-multiple-selected-item')).find(
        (chip) => chip.textContent.trim() === label,
      );
      item.querySelector('.selectivity-multiple-selected-item-remove').click();
    };

    test('uses the stored label as the chip id once a sanitized tag is saved', async () => {
      addExecute.callsFake(() => Promise.resolve(tagsResponse('existing', 'mytag')));
      await paste('my tag');
      await settle();
      await wait();
      expect(el.value).to.deep.equal(['existing', 'mytag']);
      expect(
        Array.from(el.$.s2._selectivity.el.querySelectorAll('.selectivity-multiple-selected-item')).map(
          (item) => item.dataset.itemId,
        ),
      ).to.deep.equal(['existing', 'mytag']);
    });

    test('shows the stored label again each time removing a sanitized tag fails', async () => {
      addExecute.callsFake(() => Promise.resolve(tagsResponse('existing', 'mytag')));
      removeExecute.rejects(new Error('boom'));
      await paste('my tag');
      await settle();
      clickRemove('mytag');
      await settle();
      await wait();
      expect(el.value).to.deep.equal(['existing', 'mytag']);
      clickRemove('mytag');
      await settle();
      await wait();
      expect(el.value).to.deep.equal(['existing', 'mytag']);
      expect(chips()).to.deep.equal(['existing', 'mytag']);
    });

    test('shows the stored label when a sanitized tag removed before its add completed cannot be removed', async () => {
      let resolveAdd;
      addExecute.returns(
        new Promise((resolve) => {
          resolveAdd = resolve;
        }),
      );
      removeExecute.rejects(new Error('boom'));
      addChip('my tag');
      await wait();
      removeChip('my tag');
      resolveAdd(tagsResponse('existing', 'mytag'));
      await settle();
      await settle();
      await wait();
      expect(el.value).to.deep.equal(['existing', 'mytag']);
    });

    test('keeps a queued sanitized tag consistent after an earlier add failed', async () => {
      let rejectFirstAdd;
      addExecute.onFirstCall().returns(
        new Promise((resolve, reject) => {
          rejectFirstAdd = reject;
        }),
      );
      addExecute.callsFake(() => Promise.resolve(tagsResponse('existing', 'mytag')));
      removeExecute.rejects(new Error('boom'));
      addChip('x');
      await wait();
      removeChip('existing');
      addChip('my tag');
      rejectFirstAdd(new Error('boom'));
      await settle();
      await settle();
      await settle();
      await wait();
      expect(el.value).to.have.members(['existing', 'mytag']);
      clickRemove('mytag');
      await settle();
      await wait();
      expect(el.value).to.have.members(['existing', 'mytag']);
    });

    test('removes a variant of an existing tag when it could not be added', async () => {
      el.document = { uid: 'doc-1', contextParameters: { tags: ['mytag'] } };
      addExecute.rejects(new Error('boom'));
      addChip('my tag');
      await settle();
      await wait();
      expect(el.value).to.deep.equal(['mytag']);
    });

    test('lets a re-added sanitized tag roll back when an earlier add of it completes first', async () => {
      let resolveFirstAdd;
      addExecute.onFirstCall().returns(
        new Promise((resolve) => {
          resolveFirstAdd = resolve;
        }),
      );
      addExecute.onSecondCall().rejects(new Error('boom'));
      addChip('my tag');
      await wait();
      removeChip('my tag');
      addChip('my tag');
      resolveFirstAdd(tagsResponse('existing', 'mytag'));
      await settle();
      await settle();
      await settle();
      await wait();
      expect(el.value).to.deep.equal(['existing']);
    });

    test('does not roll back tags of another document after a failure', async () => {
      addExecute.rejects(new Error('boom'));
      el._addedTagHandler(entry('tag1'));
      el.document = { uid: 'doc-2', contextParameters: { tags: ['other'] } };
      await settle();
      expect(el.value).to.deep.equal(['other']);
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
