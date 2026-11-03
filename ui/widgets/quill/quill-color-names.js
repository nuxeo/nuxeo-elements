/**
@license
©2023 Hyland Software, Inc. and its affiliates. All rights reserved. 
All Hyland product names are registered or unregistered trademarks of Hyland Software, Inc. or its affiliates.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Number of swatches Quill lays out per row in its color palette. Arrow Up/Down move by a row.
 */
export const COLOR_PICKER_COLUMNS = 7;

/**
 * Translation key for every color Quill puts in the text and background palettes, so a swatch
 * can be announced as "Dark red" instead of "#a10000" — or, as today, as nothing at all.
 * Keys follow the palette layout: a grey column, then six hues in five shades.
 */
export const COLOR_NAMES = {
  '#000000': 'htmlEditor.colorName.black',
  '#e60000': 'htmlEditor.colorName.red',
  '#ff9900': 'htmlEditor.colorName.orange',
  '#ffff00': 'htmlEditor.colorName.yellow',
  '#008a00': 'htmlEditor.colorName.green',
  '#0066cc': 'htmlEditor.colorName.blue',
  '#9933ff': 'htmlEditor.colorName.purple',
  '#ffffff': 'htmlEditor.colorName.white',
  '#facccc': 'htmlEditor.colorName.veryLightRed',
  '#ffebcc': 'htmlEditor.colorName.veryLightOrange',
  '#ffffcc': 'htmlEditor.colorName.veryLightYellow',
  '#cce8cc': 'htmlEditor.colorName.veryLightGreen',
  '#cce0f5': 'htmlEditor.colorName.veryLightBlue',
  '#ebd6ff': 'htmlEditor.colorName.veryLightPurple',
  '#bbbbbb': 'htmlEditor.colorName.lightGray',
  '#f06666': 'htmlEditor.colorName.lightRed',
  '#ffc266': 'htmlEditor.colorName.lightOrange',
  '#ffff66': 'htmlEditor.colorName.lightYellow',
  '#66b966': 'htmlEditor.colorName.lightGreen',
  '#66a3e0': 'htmlEditor.colorName.lightBlue',
  '#c285ff': 'htmlEditor.colorName.lightPurple',
  '#888888': 'htmlEditor.colorName.gray',
  '#a10000': 'htmlEditor.colorName.darkRed',
  '#b26b00': 'htmlEditor.colorName.darkOrange',
  '#b2b200': 'htmlEditor.colorName.darkYellow',
  '#006100': 'htmlEditor.colorName.darkGreen',
  '#0047b2': 'htmlEditor.colorName.darkBlue',
  '#6b24b2': 'htmlEditor.colorName.darkPurple',
  '#444444': 'htmlEditor.colorName.darkGray',
  '#5c0000': 'htmlEditor.colorName.veryDarkRed',
  '#663d00': 'htmlEditor.colorName.veryDarkOrange',
  '#666600': 'htmlEditor.colorName.veryDarkYellow',
  '#003700': 'htmlEditor.colorName.veryDarkGreen',
  '#002966': 'htmlEditor.colorName.veryDarkBlue',
  '#3d1466': 'htmlEditor.colorName.veryDarkPurple',
};
