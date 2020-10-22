import DocumentBuilder from './documents.data';

import image01 from '../img/image01.jpg';
import image02 from '../img/image02.jpg';
import image03 from '../img/image03.jpg';
import image04 from '../img/image04.jpg';
import image05 from '../img/image05.jpg';
import image06 from '../img/image06.jpg';
import image07 from '../img/image07.jpg';
import image08 from '../img/image08.jpg';
import image09 from '../img/image09.jpg';
import image10 from '../img/image10.jpg';

const images = [image01, image02, image03, image04, image05, image06, image07, image08, image09, image10];

const companyNames = [
  'Oyope',
  'Babbleset',
  'Twimm',
  'Flipstorm',
  'Feedmix',
  'Dabjam',
  'Photobug',
  'Browsezoom',
  'Yadel',
  'Zooxo',
];

const departments = [
  'Marketing',
  'Training',
  'Accounting',
  'Product Management',
  'Legal',
  'Engineering',
  'Support',
  'Research and Development',
  'Services',
  'Sales',
];

const users = [
  'cmagauran0@sbwire.com',
  'tgorgler1@wordpress.org',
  'wfogg2@photobucket.com',
  'cvanezis3@nymag.com',
  'ageist4@washingtonpost.com',
  'cwhilder5@bluehost.com',
  'blemmen9@salon.com',
  'phydechambers8@artisteer.com',
  'mcorbould7@symantec.com',
  'gmaddicks6@macromedia.com',
];

const dates = [
  '8/16/2018',
  '9/18/2018',
  '7/20/2018',
  '10/21/2018',
  '3/3/2019',
  '9/10/2018',
  '5/24/2019',
  '7/22/2018',
  '12/8/2018',
  '9/28/2018',
];

export const cities = [
  'Lisbon',
  'Paris',
  'San Francisco',
  'Oslo',
  'New York',
  'Copenhagen',
  'London',
  'Madrid',
  'Rome',
  'Berlin',
];

export const LIST = (numberOfItems) => {
  const list = { data: [] };

  for (let index = 0; index < numberOfItems; index++) {
    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const documentBuilder = new DocumentBuilder()
      .setProperties({
        company_name: random(companyNames),
        department: random(departments),
        user: random(users),
        city: random(cities),
        date: random(dates),
      })
      .setContextParameters({
        thumbnail: {
          url: random(images),
        },
      })
      .setPermissions(['Write', 'ManageWorkflows']);
    list.data.push(documentBuilder.build());
  }

  return list;
};
