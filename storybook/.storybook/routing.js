import { RoutingBehavior } from '@nuxeo/nuxeo-ui-elements/nuxeo-routing-behavior';

/* default routing */
RoutingBehavior.__router = {
  baseUrl: '',
  useHashbang: true,
  browse() {
    return '#';
  },
  user() {
    return '#';
  },
  group() {
    return '#';
  },
};
