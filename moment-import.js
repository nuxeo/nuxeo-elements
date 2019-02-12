if (!window.moment) {
  // document object of the imported HTML file
  var ownerDocument = (document._currentScript || document.currentScript).ownerDocument;
  var script = ownerDocument.createElement('script');
  script.async = true;
  script.src = '../moment/min/moment-with-locales.min.js';
  ownerDocument.head.appendChild(script);
}
