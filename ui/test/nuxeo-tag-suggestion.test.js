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
    const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
    // Waits until the tag operations queued so far, and the synchronization that follows them, are done.
    const settle = async () => {
      for (let i = 0; i < 5; i++) {
        await wait();

        await el._tagOpQueue;
      }
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
    // Simulates the user adding/removing a chip: updates the selection, then notifies the widget like selectivity.
    const addChip = (id) => {
      el.value = [...(el.value || []), id];
      el._addedTagHandler(entry(id));
    };
    const removeChip = (id) => {
      el.value = (el.value || []).filter((value) => value !== id);
      el._removedTagHandler(entry(id));
    };
    // Removes a chip through selectivity, which notifies the widget with the item it currently holds.
    const clickRemove = (label) => {
      const item = Array.from(el.$.s2._selectivity.el.querySelectorAll('.selectivity-multiple-selected-item')).find(
        (chip) => chip.textContent.trim() === label,
      );
      item.querySelector('.selectivity-multiple-selected-item-remove').click();
    };

    // A fake server storing the labels as AbstractTagService#cleanLabel does: lowercase, then remove spaces, "/",
    // "\", "'" and "%". Each operation stays pending until the test settles it, or settles at once in auto mode.
    let server;
    let pending;
    let auto;
    let failing;
    let sentTags;
    let readFails;
    const clean = (label) => label.toLowerCase().replace(/[ /\\'%]/g, '');
    const serverTags = (uid = 'doc-1') => server.get(uid) || [];
    const tagsResponse = (labels) => {
      return {
        properties: {
          'nxtag:tags': labels.map((label) => {
            return { label, username: 'Administrator' };
          }),
        },
      };
    };
    const operation = (apply, respond) => {
      let settleOp;
      const promise = new Promise((resolve, reject) => {
        settleOp = (fail) => {
          if (fail) {
            reject(new Error('boom'));
          } else {
            apply();
            resolve(respond());
          }
        };
      });
      if (auto) {
        settleOp(failing);
      } else {
        pending.push(settleOp);
      }
      return promise;
    };
    // Settles the oldest pending operation (operations run one at a time, so it is the one in flight).
    const next = async (fail = false) => {
      await wait();
      pending.shift()(fail);
      await wait();
    };

    setup(async () => {
      el = await fixture(
        html`
          <nuxeo-tag-suggestion allow-new-tags></nuxeo-tag-suggestion>
        `,
      );
      server = new Map([
        ['doc-1', ['existing']],
        ['doc-2', ['other']],
      ]);
      pending = [];
      auto = true;
      failing = false;
      readFails = false;
      sentTags = [];
      sinon.stub(el.$.addTagOp, 'execute').callsFake(() => {
        const uid = el.$.addTagOp.input;
        const { tags } = el.$.addTagOp.params;
        sentTags.push(tags);
        return operation(
          () => {
            const labels = serverTags(uid);
            tags.split(',').forEach((tag) => {
              if (!labels.includes(clean(tag))) {
                labels.push(clean(tag));
              }
            });
            server.set(uid, labels);
          },
          () => tagsResponse(serverTags(uid)),
        );
      });
      sinon.stub(el.$.removeTagOp, 'execute').callsFake(() => {
        const uid = el.$.removeTagOp.input;
        const { tags } = el.$.removeTagOp.params;
        return operation(
          () =>
            server.set(
              uid,
              serverTags(uid).filter((label) => label !== clean(tags)),
            ),
          () => undefined,
        );
      });
      sinon
        .stub(el.$.tagsDoc, 'get')
        .callsFake(() =>
          readFails
            ? Promise.reject(new Error('boom'))
            : Promise.resolve({ contextParameters: { tags: [...serverTags(el.$.tagsDoc.docId)] } }),
        );
      el.document = { uid: 'doc-1', contextParameters: { tags: ['existing'] } };
    });

    const expectServerTags = (uid = 'doc-1') => {
      expect(el.value).to.have.members(serverTags(uid));
      expect(el.value).to.have.length(serverTags(uid).length);
      expect(chips()).to.have.members(serverTags(uid));
    };

    test('sends all the pasted comma-separated tags in a single request', async () => {
      await paste('tag1,tag2,tag3,tag4');
      await settle();
      expect(sentTags).to.deep.equal(['tag1,tag2,tag3,tag4']);
      expect(el.$.addTagOp.input).to.equal('doc-1');
      expect(chips()).to.deep.equal(['existing', 'tag1', 'tag2', 'tag3', 'tag4']);
      expect(serverTags()).to.deep.equal(['existing', 'tag1', 'tag2', 'tag3', 'tag4']);
      expect(el.$.toast.text).to.contain('tags.multipleAddedToDocument');
    });

    test('keeps the single tag message when one tag is added', async () => {
      await paste('tag1');
      await settle();
      expect(sentTags).to.deep.equal(['tag1']);
      expect(chips()).to.deep.equal(['existing', 'tag1']);
      expect(el.$.toast.text).to.contain('tags.addedToDocument');
    });

    [
      { tags: [], paste: "plain,my tag,a%b,it's", chips: ['plain', 'mytag', 'ab', 'its'] },
      { tags: [], paste: 'my tag,my-tag', chips: ['mytag', 'my-tag'] },
      { tags: [], paste: 'a%b,a-b', chips: ['ab', 'a-b'] },
      { tags: [], paste: 'my tag,my%tag', chips: ['mytag'] },
      { tags: ['a-b'], paste: 'a%b,ab', chips: ['a-b', 'ab'] },
      { tags: ['a-b'], paste: 'a%b,a/b', chips: ['a-b', 'ab'] },
      { tags: ['a-b'], paste: 'a-%b,a%b', chips: ['a-b', 'ab'] },
      { tags: ['mytag'], paste: 'my tag,other tag', chips: ['mytag', 'othertag'] },
    ].forEach(({ tags, paste: text, chips: expected }) => {
      test(`shows the labels stored by the server when pasting "${text}" on [${tags.join(', ')}]`, async () => {
        server.set('doc-1', [...tags]);
        el.document = { uid: 'doc-1', contextParameters: { tags: [...tags] } };
        await paste(text);
        await settle();
        expect(chips()).to.deep.equal(expected);
        expectServerTags();
      });
    });

    test('shows the server tags in their stored order when the response order differs', async () => {
      el.$.addTagOp.execute.callsFake(() => Promise.resolve(tagsResponse(['ab', 'existing', 'mytag'])));
      await paste('my tag,a%b');
      await settle();
      expect(chips()).to.deep.equal(['existing', 'mytag', 'ab']);
    });

    test('shows every server tag when the stored label of a tag cannot be told apart', async () => {
      el.$.addTagOp.execute.callsFake(() => Promise.resolve(tagsResponse(['existing', 'ab%c', 'abc'])));
      await paste('a b%c');
      await settle();
      expect(chips()).to.deep.equal(['existing', 'ab%c', 'abc']);
    });

    test('uses the stored label as the chip id once a sanitized tag is saved', async () => {
      await paste('my tag');
      await settle();
      expect(el.value).to.deep.equal(['existing', 'mytag']);
      expect(
        Array.from(el.$.s2._selectivity.el.querySelectorAll('.selectivity-multiple-selected-item')).map(
          (item) => item.dataset.itemId,
        ),
      ).to.deep.equal(['existing', 'mytag']);
    });

    test('starts a new batch when tags are added to another document', async () => {
      auto = false;
      removeChip('existing');
      addChip('a1');
      el.document = { uid: 'doc-2', contextParameters: { tags: ['other'] } };
      addChip('b1');
      await next();
      await next();
      await next();
      await settle();
      expect(sentTags).to.deep.equal(['a1', 'b1']);
      expect(serverTags('doc-1')).to.deep.equal(['a1']);
      expectServerTags('doc-2');
    });

    test('runs tag operations one at a time so none is aborted', async () => {
      auto = false;
      addChip('tag1');
      removeChip('existing');
      await wait();
      expect(el.$.addTagOp.execute.callCount).to.equal(1);
      expect(el.$.removeTagOp.execute.callCount).to.equal(0);
      await next();
      expect(el.$.removeTagOp.execute.callCount).to.equal(1);
      expect(el.$.removeTagOp.params).to.deep.equal({ tags: 'existing' });
      await next();
      await settle();
      expectServerTags();
    });

    test('sends a tag added after a removal after that removal', async () => {
      const calls = [];
      el.$.addTagOp.execute.callsFake(() => {
        calls.push(`add ${el.$.addTagOp.params.tags}`);
        return Promise.resolve(tagsResponse(['existing']));
      });
      el.$.removeTagOp.execute.callsFake(() => {
        calls.push(`remove ${el.$.removeTagOp.params.tags}`);
        return Promise.resolve();
      });
      el._addedTagHandler(entry('tag1'));
      el._removedTagHandler(entry('tag2'));
      el._addedTagHandler(entry('tag2'));
      await settle();
      expect(calls).to.deep.equal(['add tag1', 'remove tag2', 'add tag2']);
    });

    test('removes the pasted tags and tells the user when they could not be saved', async () => {
      failing = true;
      await paste('tag1,tag2');
      await settle();
      expect(chips()).to.deep.equal(['existing']);
      expect(el.$.toast.text).to.contain('tags.addToDocumentFailed');
    });

    test('shows a tag again and tells the user when it could not be removed', async () => {
      failing = true;
      removeChip('existing');
      await settle();
      expect(chips()).to.deep.equal(['existing']);
      expect(el.$.toast.text).to.contain('tags.removeFromDocumentFailed');
    });

    test('keeps processing queued operations after a failure', async () => {
      auto = false;
      addChip('tag1');
      removeChip('existing');
      await next(true);
      expect(el.$.removeTagOp.execute.callCount).to.equal(1);
      await next();
      await settle();
      expectServerTags();
    });

    // Edits made while earlier operations are still pending: once nothing is left, the chips are the server tags.
    [
      {
        name: 'a tag removed and re-added while its first add fails',
        tags: ['existing'],
        steps: ['add a', 'remove a', 'add a', 'fail', 'ok', 'ok'],
      },
      {
        name: 'a failed removal followed by a re-add and a successful removal',
        tags: ['existing'],
        steps: ['remove existing', 'add existing', 'remove existing', 'fail', 'ok', 'ok'],
      },
      {
        name: 'a tag whose add and removal both fail',
        tags: ['existing'],
        steps: ['add x', 'remove x', 'fail', 'fail'],
      },
      {
        name: 'a sanitized tag removed before its add completed, the removal failing',
        tags: ['existing'],
        steps: ['add my tag', 'remove my tag', 'ok', 'fail'],
      },
      {
        name: 'a failed add, then a queued sanitized add and a failed removal',
        tags: ['existing'],
        steps: ['add x', 'remove existing', 'add my tag', 'fail', 'fail', 'ok'],
      },
      { name: 'a variant of an existing tag that could not be added', tags: ['mytag'], steps: ['add my tag', 'fail'] },
      {
        name: 'a sanitized tag re-added while its first add is pending, the re-add failing',
        tags: ['existing'],
        steps: ['add my tag', 'remove my tag', 'add my tag', 'ok', 'ok', 'fail'],
      },
      {
        name: 'an existing tag removed while a variant of it is being added',
        tags: ['mytag'],
        steps: ['add my tag', 'remove mytag', 'ok', 'ok'],
      },
      {
        name: 'a sanitized tag removed and re-added, only its first add succeeding',
        tags: ['existing'],
        steps: ['add my tag', 'remove my tag', 'add my tag', 'ok', 'fail', 'fail'],
      },
    ].forEach(({ name, tags, steps }) => {
      test(`shows the server tags after ${name}`, async () => {
        auto = false;
        server.set('doc-1', [...tags]);
        el.document = { uid: 'doc-1', contextParameters: { tags: [...tags] } };
        for (const step of steps) {
          const [action, ...rest] = step.split(' ');
          const id = rest.join(' ');
          if (action === 'add') {
            addChip(id);
          } else if (action === 'remove') {
            removeChip(id);
          } else {
            await next(action === 'fail');
          }
        }
        await settle();
        expect(pending).to.have.length(0);
        expectServerTags();
      });
    });

    test('shows the stored label again each time removing a sanitized tag fails', async () => {
      await paste('my tag');
      await settle();
      failing = true;
      clickRemove('mytag');
      await settle();
      expect(chips()).to.deep.equal(['existing', 'mytag']);
      clickRemove('mytag');
      await settle();
      expect(chips()).to.deep.equal(['existing', 'mytag']);
      expectServerTags();
    });

    test('shows the server tags after random edits, failures and sanitized labels', async function() {
      this.timeout(30000);
      // Deterministic pseudo-random sequence, so a failure can be reproduced.
      let seed = 2298;
      const random = (n) => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed % n;
      };
      const words = ['a', 'my tag', 'mytag', 'my%tag', 'a-b', 'a%b', 'ab', 'a/b'];
      auto = false;
      for (let run = 0; run < 40; run++) {
        server.set('doc-1', ['existing']);
        el.document = { uid: 'doc-1', contextParameters: { tags: ['existing'] } };
        readFails = random(4) === 0;
        await settle();
        for (let step = 0; step < 12; step++) {
          const choice = random(5);
          const value = el.value || [];
          if (choice === 0) {
            const word = words[random(words.length)];
            if (!value.includes(word)) {
              addChip(word);
            }
          } else if (choice === 1 && value.length) {
            removeChip(value[random(value.length)]);
          } else if (choice === 2) {
            // The page refreshes the document with the tags the server has at that moment.
            el.document = { uid: 'doc-1', contextParameters: { tags: [...serverTags()] } };
          } else if (pending.length) {
            await next(random(3) === 0);
          }
        }
        // The queue starts the next operation a few ticks after the previous one settles.
        while (pending.length || el._pendingTagOps) {
          if (pending.length) {
            await next(random(3) === 0);
          } else {
            await wait();
          }
        }
        await settle();
        if (readFails) {
          // Without a way to read the tags again, the chips are the known tags, each shown once.
          expect(el.value).to.have.length(new Set(el.value).size);
        } else {
          expectServerTags();
        }
      }
    });

    test('reads the tags again when the document is refreshed while tag operations are pending', async () => {
      server.set('doc-1', ['c']);
      el.document = { uid: 'doc-1', contextParameters: { tags: ['c'] } };
      auto = false;
      addChip('a');
      removeChip('c');
      await next();
      // A refresh of the document read before the tag was added.
      el.document = { uid: 'doc-1', contextParameters: { tags: ['c'] } };
      await next();
      await settle();
      expect(serverTags()).to.deep.equal(['a']);
      expectServerTags();
    });

    // Tags stored before labels were cleaned keep their label; removing one untags the cleaned form instead.
    ['My Tag', 'Foo'].forEach((label) => {
      test(`shows the legacy label "${label}" again when the server did not remove it`, async () => {
        server.set('doc-1', [label]);
        el.document = { uid: 'doc-1', contextParameters: { tags: [label] } };
        removeChip(label);
        await settle();
        expect(serverTags()).to.deep.equal([label]);
        expectServerTags();
      });
    });

    test('shows the known tags when they cannot be read again after a failure', async () => {
      el.$.tagsDoc.get.rejects(new Error('boom'));
      failing = true;
      await paste('tag1,tag2');
      await settle();
      expect(chips()).to.deep.equal(['existing']);
    });

    test('does not update the tags of a document the user left', async () => {
      auto = false;
      addChip('tag1');
      el.document = { uid: 'doc-2', contextParameters: { tags: ['other'] } };
      await next(true);
      await settle();
      expect(el.$.addTagOp.input).to.equal('doc-1');
      expect(el.value).to.deep.equal(['other']);
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
