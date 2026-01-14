# PDF.js viewer

The PDF.js viewer is built from the [PDF.js](https://github.com/mozilla/pdf.js/) GitHub repository and integrated into the current directory.

The current version is built from the [v5.4.394](https://github.com/mozilla/pdf.js/releases/tag/v5.4.394) tag.

## How to Update

Clone the Repository:

    $ git clone git@github.com:mozilla/pdf.js.git
    $ cd pdf.js

Checkout the wanted commit/tag:

    $ git checkout v5.4.394

Next, install Node.js via the official package or via nvm. If everything worked out, install all dependencies for PDF.js:

    $ npm install

In order to bundle all src/ files into two production scripts and build the generic viewer, run:

    $ npx gulp generic

Copy the generated build and web folders and add them in the pdfjs folder of the ELEMENTS repository.

Commit your changes:

    $ git commit -am "ELEMENTS-XXX: update PDF.js to 5.4.394"


Apply the following patch to allow viewing a file in a static UI connected to a remote server with a CORS configuration allowing cross-domain requests:
- Revert file origin validation.
- Make cross-site Access-Control requests use credentials.
---
 ui/viewers/pdfjs/web/viewer.css | 6 +++++-
 1 file changed, 5 insertions(+), 1 deletion(-)

diff --git a/ui/viewers/pdfjs/web/viewer.css b/ui/viewers/pdfjs/web/viewer.css
index 83e4fda50..87c0a5218 100644
--- a/ui/viewers/pdfjs/web/viewer.css
+++ b/ui/viewers/pdfjs/web/viewer.css
@@ -12,7 +12,11 @@
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */
-
+/*Customization */
+#print, #download, #editorModeSeparator, #editorFreeText, #editorInk, #editorStamp, #secondaryPrint, #secondaryDownload{
+  display:none !important;
+}
+/*           */
 .messageBar{
   --closing-button-icon:url(images/messageBar_closingButton.svg);
   --message-bar-close-button-color:var(--text-primary-color);

From fbce360b2fd88c777a31f96e33b337c4cafe6d86 Mon Sep 17 00:00:00 2001
From: vaibhavagarwal4-lab <Vaibhav.Agarwal@hyland.com>
Date: Tue, 9 Dec 2025 23:25:10 +0530
Subject: [PATCH 2/4] comment changed

---
 ui/viewers/pdfjs/web/viewer.css | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

diff --git a/ui/viewers/pdfjs/web/viewer.css b/ui/viewers/pdfjs/web/viewer.css
index 87c0a5218..4d3dbbfad 100644
--- a/ui/viewers/pdfjs/web/viewer.css
+++ b/ui/viewers/pdfjs/web/viewer.css
@@ -12,11 +12,11 @@
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */
-/*Customization */
+/*Customization starts here */
 #print, #download, #editorModeSeparator, #editorFreeText, #editorInk, #editorStamp, #secondaryPrint, #secondaryDownload{
   display:none !important;
 }
-/*           */
+/* Customization ends here */
 .messageBar{
   --closing-button-icon:url(images/messageBar_closingButton.svg);
   --message-bar-close-button-color:var(--text-primary-color);

From 6ee6cf6a17a86c945ec046745aa9ed94fdd9e515 Mon Sep 17 00:00:00 2001
From: vaibhavagarwal4-lab <Vaibhav.Agarwal@hyland.com>
Date: Thu, 11 Dec 2025 12:46:24 +0530
Subject: [PATCH 3/4] hidden buttons

---
 ui/viewers/pdfjs/web/viewer.css | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

diff --git a/ui/viewers/pdfjs/web/viewer.css b/ui/viewers/pdfjs/web/viewer.css
index 4d3dbbfad..8efc086f3 100644
--- a/ui/viewers/pdfjs/web/viewer.css
+++ b/ui/viewers/pdfjs/web/viewer.css
@@ -13,7 +13,7 @@
  * limitations under the License.
  */
 /*Customization starts here */
-#print, #download, #editorModeSeparator, #editorFreeText, #editorInk, #editorStamp, #secondaryPrint, #secondaryDownload{
+#printButton, #downloadButton, #editorModeSeparator, #editorFreeText, #editorInk, #editorStamp, #secondaryPrint, #secondaryDownload{
   display:none !important;
 }
 /* Customization ends here */

From b8d33c852061acad4754d488ba8928e3f1edd9b8 Mon Sep 17 00:00:00 2001
From: vaibhavagarwal4-lab <Vaibhav.Agarwal@hyland.com>
Date: Thu, 11 Dec 2025 14:07:37 +0530
Subject: [PATCH 4/4] hidden highlight button

---
 ui/viewers/pdfjs/web/viewer.css | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

diff --git a/ui/viewers/pdfjs/web/viewer.css b/ui/viewers/pdfjs/web/viewer.css
index 8efc086f3..71e6942ce 100644
--- a/ui/viewers/pdfjs/web/viewer.css
+++ b/ui/viewers/pdfjs/web/viewer.css
@@ -13,7 +13,7 @@
  * limitations under the License.
  */
 /*Customization starts here */
-#printButton, #downloadButton, #editorModeSeparator, #editorFreeText, #editorInk, #editorStamp, #secondaryPrint, #secondaryDownload{
+#printButton, #downloadButton,#editorHighlightButton, #editorModeSeparator, #editorFreeText, #editorInk, #editorStamp, #secondaryPrint, #secondaryDownload{
   display:none !important;
 }
 /* Customization ends here */










