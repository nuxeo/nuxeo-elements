# PDF.js viewer

The PDF.js viewer is built from the [PDF.js](https://github.com/mozilla/pdf.js/) GitHub repository and integrated into the current directory.

The current version is built from the [v2.6.347](https://github.com/mozilla/pdf.js/releases/tag/v2.6.347) tag.

## How to Update

Clone the Repository:

    $ git clone git@github.com:mozilla/pdf.js.git
    $ cd pdf.js

Checkout the wanted commit/tag:

    $ git checkout v2.6.347

Apply the following patch to allow viewing a file in a static UI connected to a remote server with a CORS configuration allowing cross-domain requests:
- Revert file origin validation.
- Make cross-site Access-Control requests use credentials.

```
diff --git a/web/app.js b/web/app.js
index 43c1c49f6..c6725b5b4 100644
--- a/web/app.js
+++ b/web/app.js
@@ -1975,7 +1975,9 @@ function webViewerInitialized() {
     const queryString = document.location.search.substring(1);
     const params = parseQueryString(queryString);
     file = "file" in params ? params.file : AppOptions.get("defaultUrl");
-    validateFileURL(file);
+    // Revert https://github.com/mozilla/pdf.js/pull/6916 to allow viewing a file from a remote server
+    // with CORS headers properly configured in a static UI.
+    // validateFileURL(file);
   } else if (PDFJSDev.test("MOZCENTRAL")) {
     file = window.location.href;
   } else if (PDFJSDev.test("CHROME")) {
@@ -2103,7 +2105,7 @@ if (typeof PDFJSDev === "undefined" || PDFJSDev.test("GENERIC")) {
     }

     if (file) {
-      PDFViewerApplication.open(file);
+      PDFViewerApplication.open(file, { withCredentials: true, });
     }
   };
 } else if (PDFJSDev.test("MOZCENTRAL || CHROME")) {
```

Install the gulp package globally:

    $ npm install -g gulp-cli

Install all dependencies for PDF.js:

    $ npm install

Build the generic viewer:

    $ gulp generic

[Minify](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#minified) the JS files:

    $ gulp minified

Clean the viewer directory:

    $ rm -rf /path/to/repo/nuxeo-ui-elements/viewers/pdfjs/*/

Copy the generic viewer:

    $ rsync -av build/minified/ /path/to/repo/nuxeo-ui-elements/viewers/pdfjs/ --exclude=\*.{map,pdf}

Commit your changes:

    $ git commit -am "ELEMENTS-XXX: update PDF.js to 2.6.347"

# About Nuxeo

Nuxeo dramatically improves how content-based applications are built, managed and deployed, making customers more agile, innovative and successful. Nuxeo provides a next generation, enterprise ready platform for building traditional and cutting-edge content oriented applications. Combining a powerful application development environment with SaaS-based tools and a modular architecture, the Nuxeo Platform and Products provide clear business value to some of the most recognizable brands including Verizon, Electronic Arts, Sharp, FICO, the U.S. Navy, and Boeing. Nuxeo is headquartered in New York and Paris. More information is available at [www.nuxeo.com](http://www.nuxeo.com).
