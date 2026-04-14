# PDF.js viewer

The PDF.js viewer is built from the [PDF.js](https://github.com/mozilla/pdf.js/) GitHub repository and integrated into the current directory.

The current version is built from the [v5.4.624](https://github.com/mozilla/pdf.js/releases/tag/v5.4.624) tag.

## How to Update

Clone the Repository:

    $ git clone git@github.com:mozilla/pdf.js.git
    $ cd pdf.js

Checkout the wanted commit/tag:

    $ git checkout v5.4.624

Next, install Node.js via the official package or via nvm. If everything worked out, install all dependencies for PDF.js:

    $ npm install

In order to bundle all src/ files into two production scripts and build the generic viewer, run:

    $ npx gulp generic

Copy the generated build and web directories from pdf.js/build/generic/build and pdf.js/build/generic/web,and add them to the ELEMENTS repository under ui/viewers/pdfjs/.

Commit your changes:

    $ git commit -am "ELEMENTS-XXX: update PDF.js to 5.4.624"


Apply the following patch for making customizations for hiding print and download icons.
https://patch-diff.githubusercontent.com/raw/nuxeo/nuxeo-elements/pull/1302.patch