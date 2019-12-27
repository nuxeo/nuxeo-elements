import uuid from 'uuid/v4';

const randomDate = (start = new Date(new Date().getFullYear(), 0, 1), end = new Date()) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const comments = [
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 0,
    author: 'John Doe',
    creationDate: randomDate(),
    modificationDate: '2019-12-24T10:45:00.206Z',
    text: 'This is a cool element!',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 0,
    author: 'Administrator',
    creationDate: randomDate(),
    text: 'I am here to keep this ordered...',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 0,
    author: 'Mary Poppins',
    creationDate: randomDate(),
    text:
      'A comment containing a lots of characters:\nLorem ipsum dolor sit amet, consectetuer adipiscing elit. ' +
      'Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis ' +
      'parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, ' +
      'pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, ' +
      'vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. ' +
      'Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. ' +
      'Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, ' +
      'consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. ' +
      'Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. ' +
      'Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. ' +
      'Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem ' +
      'neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. ' +
      'Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. ' +
      'Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. ' +
      'Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum ' +
      ' sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. ' +
      'Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. ' +
      'Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus ' +
      'et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. ' +
      'Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. ' +
      'Integer ante arcu, accumsan a, consectetuer eget, posuere ut,',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 0,
    author: 'Arnold Schwarzenegger',
    creationDate: randomDate(),
    modificationDate: undefined,
    text: 'What the hell?',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 0,
    author: 'Mary Poppins',
    creationDate: randomDate(),
    text: 'Not sure if I got what you said last time.',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 5,
    lastReplyDate: new Date(),
    author: 'John Doe',
    creationDate: randomDate(),
    text:
      'Let me create a big testing comment:\n\nLorem ipsum dolor sit amet, consectetuer adipiscing elit. ' +
      'Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis ' +
      'parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, ' +
      'pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, ' +
      'vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. ' +
      'Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. ' +
      'Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, ' +
      'consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. ' +
      'Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. ' +
      'Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. ' +
      'Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem ' +
      'neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. ' +
      'Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. ' +
      'Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. ' +
      'Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum ' +
      ' sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. ' +
      'Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. ' +
      'Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus ' +
      'et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. ' +
      'Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. ' +
      'Integer ante arcu, accumsan a, consectetuer eget, posuere ut,',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 0,
    author: 'Administrator',
    creationDate: randomDate(),
    text: 'Everything seems fine.',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 2,
    lastReplyDate: new Date(),
    author: 'Cristiano Ronaldo',
    creationDate: randomDate(),
    text: 'Best! Top!',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 0,
    author: 'Arnold Schwarzenegger',
    creationDate: randomDate(),
    modificationDate: undefined,
    text: 'Strong!',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 0,
    author: 'Cristiano Ronaldo',
    creationDate: randomDate(),
    text: 'So, lets talk about soccer?',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 0,
    author: 'Mary Poppins',
    creationDate: randomDate(),
    modificationDate: undefined,
    text: 'What about music? Lets start a thread here.',
  },
  {
    'entity-type': 'comment',
    parentId: 'doc-id',
    id: uuid(),
    numberOfReplies: 0,
    author: 'Chuck Norris',
    creationDate: randomDate(),
    text: 'Some of my jokes: "Chuck Norris can kill two stones with one bird."',
  },
];

export const getCommentsSample = comments.sort((a, b) => (a.creationDate > b.creationDate ? -1 : 1));
