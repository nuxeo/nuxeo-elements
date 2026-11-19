/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { applyUserSort, hasUserSort, restoreDefaultSort } from '../nuxeo-user-sort.js';

suite('nuxeo-user-sort (ELEMENTS-2017)', () => {
  const pageDefault = { 'dc:created': 'asc' };
  let provider;

  setup(() => {
    provider = { sort: pageDefault };
  });

  test('gives back the sort the provider had before the user changed it', () => {
    applyUserSort(provider, { 'dc:title': 'asc' });

    expect(restoreDefaultSort(provider)).to.be.true;
    expect(provider.sort).to.equal(pageDefault);
  });

  test('keeps the sort from before the first user change across later ones, from any control', () => {
    applyUserSort(provider, { 'dc:title': 'asc' }); // a table header
    applyUserSort(provider, { 'dc:coverage': 'asc' }); // the sort selector of the grid view
    applyUserSort(provider, { 'dc:title': 'desc' }); // the table header again

    expect(restoreDefaultSort(provider)).to.be.true;
    expect(provider.sort).to.equal(pageDefault);
  });

  test('takes a sort the page set in the meantime as the one to give back', () => {
    applyUserSort(provider, { 'dc:title': 'asc' });
    const folderSort = { 'ecm:pos': 'ASC' };
    provider.sort = folderSort;
    applyUserSort(provider, { 'dc:title': 'desc' });

    expect(restoreDefaultSort(provider)).to.be.true;
    expect(provider.sort).to.equal(folderSort);
  });

  test('leaves a sort the page set since the last user change, even an equal one', () => {
    applyUserSort(provider, { 'dc:title': 'asc' });
    const setByThePage = { 'dc:title': 'asc' };
    provider.sort = setByThePage;

    expect(restoreDefaultSort(provider)).to.be.false;
    expect(provider.sort).to.equal(setByThePage);
  });

  test('does nothing when the user never changed the sort, or when it already is the default', () => {
    expect(restoreDefaultSort(provider)).to.be.false;
    expect(provider.sort).to.equal(pageDefault);

    const same = { 'dc:created': 'asc' };
    applyUserSort(provider, same);
    expect(restoreDefaultSort(provider)).to.be.false;
    expect(provider.sort).to.equal(same);
  });

  test('forgets what it gave back, and keeps each provider apart', () => {
    const other = { sort: { 'dc:modified': 'desc' } };
    applyUserSort(provider, { 'dc:title': 'asc' });
    applyUserSort(other, { 'dc:title': 'desc' });

    expect(restoreDefaultSort(provider)).to.be.true;
    expect(restoreDefaultSort(provider)).to.be.false;
    expect(restoreDefaultSort(other)).to.be.true;
    expect(other.sort).to.deep.equal({ 'dc:modified': 'desc' });
  });

  test('is also reachable as Nuxeo.UserSort, for applications that must not import it', () => {
    expect(Nuxeo.UserSort.applyUserSort).to.equal(applyUserSort);
    expect(Nuxeo.UserSort.restoreDefaultSort).to.equal(restoreDefaultSort);
    expect(Nuxeo.UserSort.hasUserSort).to.equal(hasUserSort);
  });

  test('tells whether the provider holds the last sort the user chose', () => {
    expect(hasUserSort(provider)).to.be.false;

    applyUserSort(provider, { 'dc:title': 'asc' });
    expect(hasUserSort(provider)).to.be.true;

    // a sort set by the page since, even an equal one
    provider.sort = { 'dc:title': 'asc' };
    expect(hasUserSort(provider)).to.be.false;

    applyUserSort(provider, {});
    expect(hasUserSort(provider)).to.be.true;
    restoreDefaultSort(provider);
    expect(hasUserSort(provider)).to.be.false;
  });

  test('gives back an empty sort when the provider had none', () => {
    const unsorted = {};
    applyUserSort(unsorted, { 'dc:title': 'asc' });

    expect(restoreDefaultSort(unsorted)).to.be.true;
    expect(unsorted.sort).to.deep.equal({});
  });
});
