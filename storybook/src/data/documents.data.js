import uuid from 'uuid/v4';

export default class DocumentBuilder {
  static get entityType() {
    return 'document';
  }

  systemProperties = {};

  properties = {};

  facets = [];

  contextParameters = { favorites: {}, permissions: [] };

  setSystemProperties(systemProperty) {
    this.systemProperties = systemProperty;
    return this;
  }

  setProperties(properties) {
    this.properties = properties;
    return this;
  }

  setFacets(documentFacets) {
    this.facets = documentFacets;
    return this;
  }

  setContextParameters(contextParameters) {
    this.contextParameters = contextParameters;
    return this;
  }

  setPermissions(permissions) {
    this.contextParameters.permissions = permissions;
    return this;
  }

  setFileContent(name, data) {
    this.properties['file:content'] = {
      name,
      data,
    };
    return this;
  }

  setFavorite(favorite) {
    this.contextParameters.favorites.isFavorite = favorite;
    return this;
  }

  build() {
    const document = {
      'entity-type': DocumentBuilder.entityType,
      uid: uuid(),
      properties: this.properties,
      facets: this.facets,
      contextParameters: this.contextParameters,
    };
    Object.assign(document, this.systemProperties);
    return document;
  }
}
