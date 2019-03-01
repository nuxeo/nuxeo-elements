import '@polymer/iron-iconset-svg/iron-iconset-svg.js';

const $_documentContainer = document.createElement('template'); // eslint-disable-line camelcase

$_documentContainer.innerHTML = `<iron-iconset-svg size="24" name="data-table">
  <svg>
    <defs>
      <g id="arrow-upward"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path></g>
    </defs>
  </svg>
</iron-iconset-svg>`;

document.head.appendChild($_documentContainer.content);
