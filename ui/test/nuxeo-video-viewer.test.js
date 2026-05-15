import { fixture, html, flush } from '@nuxeo/testing-helpers';
import '../viewers/nuxeo-video-viewer.js';

suite('nuxeo-video-viewer', () => {
  let element;

  suite('basic rendering', () => {
    setup(async () => {
      element = await fixture(
        html`
          <nuxeo-video-viewer></nuxeo-video-viewer>
        `,
      );
    });

    test('should render video element', () => {
      const video = element.$.video;
      expect(video).to.exist;
      expect(video.tagName).to.equal('VIDEO');
    });

    test('should set preload to auto by default', () => {
      expect(element.preload).to.equal('auto');
    });

    test('should set controls to false by default', () => {
      expect(element.controls).to.be.false;
    });

    test('should initialize storyboard as empty array', () => {
      expect(element.storyboard).to.be.an('array').that.is.empty;
    });
  });

  suite('play/stop/pause/isPaused', () => {
    setup(async () => {
      element = await fixture(
        html`
          <nuxeo-video-viewer></nuxeo-video-viewer>
        `,
      );
    });

    test('play() should call video.play()', () => {
      const stub = sinon.stub(element.$.video, 'play');
      element.play();
      expect(stub).to.have.been.calledOnce;
      stub.restore();
    });

    test('stop() should call video.pause() and reset currentTime to 0', () => {
      const stub = sinon.stub(element.$.video, 'pause');
      element.$.video.currentTime = 30;
      element.stop();
      expect(stub).to.have.been.calledOnce;
      expect(element.$.video.currentTime).to.equal(0);
      stub.restore();
    });

    test('pause() should call video.pause()', () => {
      const stub = sinon.stub(element.$.video, 'pause');
      element.pause();
      expect(stub).to.have.been.calledOnce;
      stub.restore();
    });

    test('isPaused() should return video.paused', () => {
      expect(element.isPaused()).to.be.true;
    });
  });

  suite('_hasStoryboard', () => {
    setup(async () => {
      element = await fixture(
        html`
          <nuxeo-video-viewer></nuxeo-video-viewer>
        `,
      );
    });

    test('should return false for empty storyboard', () => {
      element.storyboard = [];
      expect(element._hasStoryboard()).to.be.false;
    });

    test('should return falsy for null storyboard', () => {
      element.storyboard = null;
      const result = element._hasStoryboard();
      expect(!!result).to.be.false;
    });

    test('should return true for populated storyboard', () => {
      element.storyboard = [{ timecode: 0, content: { data: 'thumb.jpg' } }];
      expect(element._hasStoryboard()).to.be.true;
    });

    test('should add hasStoryboard class when storyboard exists', () => {
      element.storyboard = [{ timecode: 0, content: { data: 'thumb.jpg' } }];
      element._hasStoryboard();
      expect(element.$.video.classList.contains('hasStoryboard')).to.be.true;
    });

    test('should remove hasStoryboard class when storyboard is empty', () => {
      element.$.video.classList.add('hasStoryboard');
      element.storyboard = [];
      element._hasStoryboard();
      expect(element.$.video.classList.contains('hasStoryboard')).to.be.false;
    });
  });

  suite('_jumpTo', () => {
    setup(async () => {
      element = await fixture(
        html`
          <nuxeo-video-viewer></nuxeo-video-viewer>
        `,
      );
    });

    test('should set video currentTime from thumbnail timecode', () => {
      const mockEvent = { model: { thumbnail: { timecode: 42.5 } } };
      element._jumpTo(mockEvent);
      expect(element.$.video.currentTime).to.equal(42.5);
    });
  });

  suite('_getThumbnailUrl', () => {
    test('should return viewUrl when available', async () => {
      element = await fixture(
        html`
          <nuxeo-video-viewer></nuxeo-video-viewer>
        `,
      );
      const thumbnail = { content: { viewUrl: 'http://view.url/thumb.jpg', data: 'http://data.url/thumb.jpg' } };
      expect(element._getThumbnailUrl(thumbnail)).to.equal('http://view.url/thumb.jpg');
    });

    test('should return data when viewUrl is not available', async () => {
      element = await fixture(
        html`
          <nuxeo-video-viewer></nuxeo-video-viewer>
        `,
      );
      const thumbnail = { content: { data: 'http://data.url/thumb.jpg' } };
      expect(element._getThumbnailUrl(thumbnail)).to.equal('http://data.url/thumb.jpg');
    });
  });

  suite('_getSourceUrl', () => {
    test('should return viewUrl when available', async () => {
      element = await fixture(
        html`
          <nuxeo-video-viewer></nuxeo-video-viewer>
        `,
      );
      const source = { viewUrl: 'http://view.url/video.mp4', data: 'http://data.url/video.mp4' };
      expect(element._getSourceUrl(source)).to.equal('http://view.url/video.mp4');
    });

    test('should return data when viewUrl is not available', async () => {
      element = await fixture(
        html`
          <nuxeo-video-viewer></nuxeo-video-viewer>
        `,
      );
      const source = { data: 'http://data.url/video.mp4' };
      expect(element._getSourceUrl(source)).to.equal('http://data.url/video.mp4');
    });
  });

  suite('rendering with sources', () => {
    test('should render source elements when sources provided', async () => {
      const sources = [
        { viewUrl: 'http://example.com/video.mp4', type: 'video/mp4' },
        { data: 'http://example.com/video.webm', type: 'video/webm' },
      ];
      element = await fixture(
        html`
          <nuxeo-video-viewer .sources="${sources}"></nuxeo-video-viewer>
        `,
      );
      await flush();
      const sourceEls = element.$.video.querySelectorAll('source');
      expect(sourceEls.length).to.equal(2);
    });

    test('should set poster attribute', async () => {
      element = await fixture(
        html`
          <nuxeo-video-viewer poster="poster.jpg"></nuxeo-video-viewer>
        `,
      );
      expect(element.$.video.getAttribute('poster')).to.equal('poster.jpg');
    });
  });
});
