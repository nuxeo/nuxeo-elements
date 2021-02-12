import { waitForAttrMutation, waitForEvent } from '@nuxeo/testing-helpers';

/**
 * Waits for a `<nuxeo-layout>` element to load a layout (or fail to do so).
 * @param {Object} layout - `<nuxeo-layout>` element
 * @returns {Promise<MutationRecord>} Promise object representing either the result of the layout load or the change in
 * the error attribute
 */
function waitForLayoutLoad(layout) {
  return Promise.race([waitForEvent(layout, 'element-changed'), waitForAttrMutation(layout.$.error, 'hidden', null)]);
}

/**
 * Gets the DOM element for a widget with the label `widgetLabel` from a `<nuxeo-layout>` element.
 * @param {string} widgetLabel - Value of the `label` attribute of the widget
 * @param {Object} layout - `<nuxeo-layout>` element
 * @returns {null|Element} The widget Element if it exists (and if the `<nuxeo-layout>` exists and has a layout loaded)
 */
function getWidgetFromLayout(widgetLabel, layout) {
  if (!layout || !layout.element) {
    return null;
  }
  return layout.element.shadowRoot.querySelector(`[role="widget"][name="${widgetLabel}"]`);
}

export { getWidgetFromLayout, waitForLayoutLoad };
