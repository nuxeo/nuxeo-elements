export default {
  'vid:transcodedVideos': [
    {
      name: 'WebM 480p',
      content: {
        name: 'sample.webm',
        'mime-type': 'video/webm',
        encoding: null,
        digestAlgorithm: 'MD5',
        digest: '046356f7764cbd67acfc4365eb106e06',
        length: '401187',
        data: 'videoURL',
        appLinks: [],
        downloadData: 'videoURL&clientReason=download',
      },
      info: {
        duration: 10.03,
        frameRate: 25.0,
        streams: [
          {
            codec: 'vp9 (Profile 0)',
            bitRate: 0.0,
            type: 'Video',
          },
          {
            codec: 'vorbis',
            bitRate: 0.0,
            streamInfo: 'Stream #0:1: Audio: vorbis, 48000 Hz, stereo, fltp (default)',
            type: 'Audio',
          },
        ],
        width: 872,
        format: 'matroska,webm',
        height: 480,
      },
    },
  ],
  'vid:info': {
    duration: 10.03,
    frameRate: 25.0,
    streams: [
      {
        codec: 'vp9 (Profile 0)',
        bitRate: 0.0,
        type: 'Video',
      },
      {
        codec: 'vorbis',
        bitRate: 0.0,
        streamInfo: 'Stream #0:1: Audio: vorbis, 48000 Hz, stereo, fltp (default)',
        type: 'Audio',
      },
    ],
    width: 872,
    format: 'matroska,webm',
    height: 480,
  },
};
