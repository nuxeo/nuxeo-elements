import { create } from '@storybook/theming';
import NECLogo from '../src/img/nuxeo-elements-catalog.svg';

export default create({
  base: 'light',
  brandTitle: 'Nuxeo Elements Catalog',
  brandUrl: 'https://nuxeo.com',
  brandImage: NECLogo,
});
