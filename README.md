[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/nuxeo/nuxeo-elements)
![Tests](https://github.com/nelsonsilva/nuxeo-elements/workflows/Build/badge.svg)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b6e719e30d53435e8a76230067aade3b)](https://www.codacy.com/app/Nuxeo/nuxeo-elements)
[![Coverage Status](https://coveralls.io/repos/github/nuxeo/nuxeo-elements/badge.svg)](https://coveralls.io/github/nuxeo/nuxeo-elements)

[![Browser Status](https://badges.herokuapp.com/sauce/nuxeo-elements?name=nuxeo-elements-master)](https://saucelabs.com/u/nuxeo-elements)

# About nuxeo-elements

**Nuxeo Elements** helps developers build custom elements and web applications with Nuxeo using [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). It is build on top of [Polymer 3](https://polymer-library.polymer-project.org/3.0/docs/about_30).

## Dependencies

To install the project's dependencies:

```
npm install
npm run bootstrap
```

## Quickstart

To run all unit tests with:

```
npm test
```

You can run the unit tests for a given package (`core`, `ui` or `dataviz`) via:

```
npm run test:<package>
```

There is also a `grep` argument that can be used to run a specific set of tests

```
# Runs all the tests present on "core/test/nuxeo-connection.test.js" file

npm run test:core -- --grep nuxeo-connection.test.js
```

To watch the tests for changes you can use:

```
npm run test:watch -- --package=<package>
```

Demos can be setup using:

```
npm run docs
```

## Documentation

- [Nuxeo Elements](https://doc.nuxeo.com/x/XJCRAQ) in our Developer Documentation Center.
- [Online](http://nuxeo.github.io/nuxeo-elements) reference and demos.

## Report & Contribute

We are glad to welcome new developers on this initiative, and even simple usage feedback is great.
- Ask your questions on [Nuxeo Answers](http://answers.nuxeo.com)
- Report issues on our [JIRA](https://jira.nuxeo.com/browse/ELEMENTS)
- Contribute: Send pull requests!

## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)

(C) Copyright Nuxeo Corp. (http://nuxeo.com/)

All images, icons, fonts, and videos contained in this folder are copyrighted by Nuxeo, all rights reserved.

## About Nuxeo
Nuxeo dramatically improves how content-based applications are built, managed and deployed, making customers more agile, innovative and successful. Nuxeo provides a next generation, enterprise ready platform for building traditional and cutting-edge content oriented applications. Combining a powerful application development environment with SaaS-based tools and a modular architecture, the Nuxeo Platform and Products provide clear business value to some of the most recognizable brands including Verizon, Electronic Arts, Sharp, FICO, the U.S. Navy, and Boeing. Nuxeo is headquartered in New York and Paris. More information is available at [www.nuxeo.com](http://www.nuxeo.com).
