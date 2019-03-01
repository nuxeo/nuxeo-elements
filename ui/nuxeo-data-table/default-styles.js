const $_documentContainer = document.createElement('template'); // eslint-disable-line camelcase

$_documentContainer.innerHTML = `<custom-style>
  <style>
    html {
      --iron-data-table: {
        font-weight: 400;
        line-height: 1.1;
        font-family: var(--nuxeo-app-font, 'Open Sans', Arial, sans-serif);
        color: var(--nuxeo-text-default, rgba(0, 0, 0, 0.87));
      };

      --iron-data-table-header: {
        background-color: var(--nuxeo-table-header-background, #fafafa);
        color: var(--nuxeo-text-default, rgba(0, 0, 0, 0.54));
        font-weight: 700;
        font-size: 1rem;
        height: 56px;
        border-bottom: 2px solid var(--nuxeo-border, #e3e3e3);
        min-height: 56px;
      };

      --iron-data-table-row: {
        border-bottom: 1px solid var(--nuxeo-border, #e3e3e3);
      };

      --iron-data-table-row-hover: {
        background-color: var(--nuxeo-container-hover, #eee);
      };

      --iron-data-table-row-selected: {
        color: var(--default-primary-color, #03A9FA);
      };

      --iron-data-table-row-after: {
        bottom: 0;
        content: "";
        height: 2px;
        left: 0;
        pointer-events: none;
        position: absolute;
        right: 0;
        transition: all 0.16s ease-in-out;

        -webkit-transform: scaleX(0.0);
        transform: scaleX(0.0);
        z-index: 1;
      };

      --iron-data-table-row-focused: {
        background-color: var(--nuxeo-container-hover, #eee);
      };

      --iron-data-table-row-focused-after: {
        -webkit-transform: scaleX(1.0);
        transform: scaleX(1.0);
      };
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);
