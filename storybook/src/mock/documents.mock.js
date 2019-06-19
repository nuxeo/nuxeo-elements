import image from './nuxeo-logo.jpg';

export const DOCUMENT1 = {
  'entity-type': 'document',
  uid: '1',
  facets: [],
  properties: {
    'file:content': {
      name: 'stuff.json',
      data: '',
    },
  },
  contextParameters: {
    permissions: ['Write'],
  },
};

export const DOCUMENT2 = {
  'entity-type': 'document',
  uid: '2',
  facets: [],
  properties: {
    'file:content': {
      name: 'stuff.json',
      data: '',
    },
  },
  contextParameters: {
    favorites: {
      isFavorite: false,
    },
    permissions: ['Write'],
  },
};

export const DOCUMENT3 = {
  'entity-type': 'document',
  uid: '3',
  facets: [],
  properties: {
    'file:content': {
      name: 'stuff.json',
      data: '',
    },
  },
  contextParameters: {
    favorites: {
      isFavorite: false,
    },
    permissions: ['Write'],
  },
};

export const DOCUMENT_DOWNLOAD = {
  'entity-type': 'document',
  uid: '3',
  facets: [],
  properties: {
    'file:content': {
      data: image,
    },
  },
  contextParameters: {
    favorites: {
      isFavorite: false,
    },
    permissions: ['Write'],
  },
};

export const DOCUMENTS = [DOCUMENT1, DOCUMENT2, DOCUMENT3, DOCUMENT_DOWNLOAD];
