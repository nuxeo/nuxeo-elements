/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
*/
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-document-preview.js';

const defaultBlob = {
  'mime-type': 'application/octet-stream',
  data: 'http://d',
  viewUrl: 'http://v',
};

const mkDoc = (extraProps, ctxParams) => {
  return {
    schemas: [],
    properties: Object.assign({ 'file:content': defaultBlob }, extraProps),
    contextParameters: ctxParams || {},
  };
};

suite('nuxeo-document-preview extras', () => {
  let el;

  setup(async () => {
    el = await fixture(
      html`
        <nuxeo-document-preview></nuxeo-document-preview>
      `,
    );
  });

  suite('_computeRendition', () => {
    test('returns rendition viewUrl', () => {
      const doc = {
        contextParameters: {
          renditions: [{ name: 'pdf', viewUrl: 'http://r/v', url: 'http://r/u' }],
        },
      };
      expect(el._computeRendition(doc, 'file:content', 'pdf')).to.equal('http://r/v');
    });

    test('falls back to rendition url', () => {
      const doc = {
        contextParameters: {
          renditions: [{ name: 'pdf', url: 'http://r/u' }],
        },
      };
      expect(el._computeRendition(doc, 'file:content', 'pdf')).to.equal('http://r/u');
    });

    test('returns falsy when no matching rendition', () => {
      const doc = { contextParameters: { renditions: [{ name: 'txt', url: 'http://r' }] } };
      expect(el._computeRendition(doc, 'file:content', 'pdf')).to.not.be.ok;
    });

    test('returns falsy for non-default xpath', () => {
      const doc = { contextParameters: { renditions: [{ name: 'pdf', url: 'http://r' }] } };
      expect(el._computeRendition(doc, 'other:xpath', 'pdf')).to.not.be.ok;
    });

    test('returns falsy when no contextParameters', () => {
      expect(el._computeRendition({}, 'file:content', 'pdf')).to.not.be.ok;
    });

    test('returns falsy when no renditions', () => {
      expect(el._computeRendition({ contextParameters: {} }, 'file:content', 'pdf')).to.not.be.ok;
    });
  });

  suite('_computeAudioSource', () => {
    test('returns viewUrl when available', () => {
      el._blob = { viewUrl: 'http://audio/v', data: 'http://audio/d' };
      expect(el._computeAudioSource()).to.equal('http://audio/v');
    });

    test('falls back to data', () => {
      el._blob = { data: 'http://audio/d' };
      expect(el._computeAudioSource()).to.equal('http://audio/d');
    });

    test('returns undefined for no blob', () => {
      el._blob = null;
      expect(el._computeAudioSource()).to.be.undefined;
    });
  });

  suite('_computePdfSource', () => {
    test('returns viewUrl when available', () => {
      expect(el._computePdfSource({ viewUrl: 'http://a', url: 'http://b' })).to.equal('http://a');
    });

    test('falls back to url', () => {
      expect(el._computePdfSource({ url: 'http://b' })).to.equal('http://b');
    });
  });

  suite('stop', () => {
    test('does nothing when no video/audio elements', () => {
      el.stop();
    });
  });

  suite('_computeImageSource - direct calls', () => {
    test('returns FullHD view url', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({
        'picture:views': [{ title: 'FullHD', content: { viewUrl: 'http://img/fullhd', data: 'http://img/data' } }],
      });
      el._blob = { 'mime-type': 'image/png', data: 'http://fallback' };
      expect(el._computeImageSource()).to.equal('http://img/fullhd');
    });

    test('falls back to data when no viewUrl on FullHD', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({
        'picture:views': [{ title: 'FullHD', content: { data: 'http://img/data' } }],
      });
      el._blob = {};
      expect(el._computeImageSource()).to.equal('http://img/data');
    });

    test('returns blob data fallback for image', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      el._blob = { 'mime-type': 'image/jpeg', data: 'http://blob/data' };
      expect(el._computeImageSource()).to.equal('http://blob/data');
    });

    test('returns blob viewUrl for image', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      el._blob = { 'mime-type': 'image/jpeg', viewUrl: 'http://blob/view', data: 'http://blob/data' };
      expect(el._computeImageSource()).to.equal('http://blob/view');
    });

    test('returns undefined for non-image blob', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      el._blob = { 'mime-type': 'application/pdf', data: 'http://pdf' };
      expect(el._computeImageSource()).to.be.undefined;
    });

    test('skips picture:views without FullHD', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({
        'picture:views': [{ title: 'Thumbnail', content: { data: 'x' } }],
      });
      el._blob = { 'mime-type': 'image/png', data: 'http://fallback' };
      expect(el._computeImageSource()).to.equal('http://fallback');
    });
  });

  suite('_computeVideoSources - direct calls', () => {
    test('returns transcoded videos', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({
        'vid:transcodedVideos': [
          { content: { viewUrl: 'http://v/view', data: 'http://v/data', 'mime-type': 'video/mp4' } },
        ],
      });
      const sources = el._computeVideoSources();
      expect(sources).to.have.length(1);
    });

    test('filters out null conversions', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({ 'vid:transcodedVideos': [null, { content: null }] });
      expect(el._computeVideoSources()).to.have.length(0);
    });

    test('falls back to blob for video', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      el._blob = { 'mime-type': 'video/mp4', viewUrl: 'http://v', data: 'http://d' };
      const sources = el._computeVideoSources();
      expect(sources).to.have.length(1);
    });

    test('returns undefined for non-video', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      el._blob = { 'mime-type': 'application/pdf', data: 'http://d' };
      expect(el._computeVideoSources()).to.be.undefined;
    });
  });

  suite('_computeStoryboard - direct calls', () => {
    test('returns storyboard for file:content', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({ 'vid:storyboard': [{ timecode: 0 }] });
      expect(el._computeStoryboard()).to.have.length(1);
    });

    test('returns undefined when no storyboard', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({});
      expect(el._computeStoryboard()).to.be.undefined;
    });
  });

  suite('_computeObjectSource - direct calls', () => {
    test('returns preview viewUrl with xpath', () => {
      el.xpath = 'file:content';
      el.document = mkDoc({}, { preview: { viewUrl: 'http://p/@preview/file' } });
      el._blob = { 'mime-type': 'application/pdf' };
      const result = el._computeObjectSource();
      expect(result).to.include('@blob/file:content/@preview/');
    });

    test('falls back to blob viewUrl', () => {
      el.document = mkDoc({});
      el._blob = { viewUrl: 'http://blob/v', url: 'http://blob/u' };
      expect(el._computeObjectSource()).to.equal('http://blob/v');
    });

    test('falls back to blob url', () => {
      el.document = mkDoc({});
      el._blob = { url: 'http://blob/u' };
      expect(el._computeObjectSource()).to.equal('http://blob/u');
    });
  });
});
