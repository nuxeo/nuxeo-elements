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
  uid: '4',
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

export const DOCUMENT_TRASHED = {
  'entity-type': 'document',
  isTrashed: true,
  uid: '5',
  contextParameters: {
    permissions: ['Write', 'ManageWorkflows'],
  },
};

export const TABLE = {
  properties: {
    data: [
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 1',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 2',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 3',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 1',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 2',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 3',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 1',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 2',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 3',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 1',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 2',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 3',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 1',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 2',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
      {
        date: '2019-07-01T23:00:00.000Z',
        document: 'default:36e5ea39-6f08-48d1-9ca1-68d17b328e65',
        name: 'Example 3',
        directory: 'acknowledgement',
        user: 'user:Administrator',
      },
    ],
  },
};

export const TABLE_EMPTY = {
  properties: {
    data: [],
  },
};

export const DOCUMENTS = [DOCUMENT1, DOCUMENT2, DOCUMENT3];
