import videoURL from '../video/sample.mp4';

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
        data: videoURL,
        appLinks: [],
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
        codec: 'h264 (Main) (avc1 / 0x31637661)',
        bitRate: 300.0,
        streamInfo: 'Stream #0:0(und):',
        type: 'Video',
      },
      {
        codec: 'aac (LC) (mp4a / 0x6134706D)',
        bitRate: 160.0,
        streamInfo: 'Stream #0:0(und):',
        type: 'Audio',
      },
      {
        codec: 'aac (LC) (mp4a / 0x6134706D)',
        bitRate: 160.0,
        streamInfo: 'Stream #0:0(und):',
        type: 'Audio',
      },
      {
        codec: 'bin_data (text / 0x74786574)',
        bitRate: 160.0,
        streamInfo: 'Stream #0:0(und):',
        type: 'Data',
      },
    ],
    width: 320,
    format: 'mov,mp4,m4a,3gp,3g2,mj2',
    height: 176,
  },
};
