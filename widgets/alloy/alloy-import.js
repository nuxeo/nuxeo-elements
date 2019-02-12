/*  XXX CKEditor causes firefox to crash when scripts are inlined, moved to index.html */
/* <script src="alloy-editor-all.js"></script> */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
CKEDITOR.config.customConfig = ''; // skip loading config.js
CKEDITOR.config.language = 'en'; // force en locale since it is the only one being vulcanized
AlloyEditor._langResourceRequested = true; // skip loading of language file
/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
    // Define changes to default configuration here.
    // For complete reference see:
    // http://docs.ckeditor.com/#!/api/CKEDITOR.config

    // The toolbar groups arrangement, optimized for a single toolbar row.
    config.toolbarGroups = [
        { name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
        { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
        { name: 'forms' },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
        { name: 'links' },
        { name: 'insert' },
        { name: 'styles' },
        { name: 'colors' },
        { name: 'tools' },
        { name: 'others' },
        { name: 'about' }
    ];

    // The default plugins included in the basic setup define some buttons that
    // are not needed in a basic editor. They are removed here.
    config.removeButtons = 'Cut,Copy,Paste,Undo,Redo,Anchor,Underline,Strike,Subscript,Superscript';

    // Dialog windows are also simplified.
    config.removeDialogTabs = 'link:advanced';
};
/*
Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.lang['en']={"editor":"Rich Text Editor","editorPanel":"Rich Text Editor panel","common":{"editorHelp":"Press ALT 0 for help","browseServer":"Browse Server","url":"URL","protocol":"Protocol","upload":"Upload","uploadSubmit":"Send it to the Server","image":"Image","flash":"Flash","form":"Form","checkbox":"Checkbox","radio":"Radio Button","textField":"Text Field","textarea":"Textarea","hiddenField":"Hidden Field","button":"Button","select":"Selection Field","imageButton":"Image Button","notSet":"<not set>","id":"Id","name":"Name","langDir":"Language Direction","langDirLtr":"Left to Right (LTR)","langDirRtl":"Right to Left (RTL)","langCode":"Language Code","longDescr":"Long Description URL","cssClass":"Stylesheet Classes","advisoryTitle":"Advisory Title","cssStyle":"Style","ok":"OK","cancel":"Cancel","close":"Close","preview":"Preview","resize":"Resize","generalTab":"General","advancedTab":"Advanced","validateNumberFailed":"This value is not a number.","confirmNewPage":"Any unsaved changes to this content will be lost. Are you sure you want to load new page?","confirmCancel":"You have changed some options. Are you sure you want to close the dialog window?","options":"Options","target":"Target","targetNew":"New Window (_blank)","targetTop":"Topmost Window (_top)","targetSelf":"Same Window (_self)","targetParent":"Parent Window (_parent)","langDirLTR":"Left to Right (LTR)","langDirRTL":"Right to Left (RTL)","styles":"Style","cssClasses":"Stylesheet Classes","width":"Width","height":"Height","align":"Alignment","alignLeft":"Left","alignRight":"Right","alignCenter":"Center","alignJustify":"Justify","alignTop":"Top","alignMiddle":"Middle","alignBottom":"Bottom","alignNone":"None","invalidValue":"Invalid value.","invalidHeight":"Height must be a number.","invalidWidth":"Width must be a number.","invalidCssLength":"Value specified for the \"%1\" field must be a positive number with or without a valid CSS measurement unit (px, %, in, cm, mm, em, ex, pt, or pc).","invalidHtmlLength":"Value specified for the \"%1\" field must be a positive number with or without a valid HTML measurement unit (px or %).","invalidInlineStyle":"Value specified for the inline style must consist of one or more tuples with the format of \"name : value\", separated by semi-colons.","cssLengthTooltip":"Enter a number for a value in pixels or a number with a valid CSS unit (px, %, in, cm, mm, em, ex, pt, or pc).","unavailable":"%1<span class=\"cke_accessibility\">, unavailable</span>","keyboard":{"8":"Backspace","13":"Enter","16":"Shift","17":"Ctrl","18":"Alt","32":"Space","35":"End","36":"Home","46":"Delete","224":"Command"},"keyboardShortcut":"Keyboard shortcut"},"basicstyles":{"bold":"Bold","italic":"Italic","strike":"Strikethrough","subscript":"Subscript","superscript":"Superscript","underline":"Underline"},"blockquote":{"toolbar":"Block Quote"},"clipboard":{"copy":"Copy","copyError":"Your browser security settings don't permit the editor to automatically execute copying operations. Please use the keyboard for that (Ctrl/Cmd+C).","cut":"Cut","cutError":"Your browser security settings don't permit the editor to automatically execute cutting operations. Please use the keyboard for that (Ctrl/Cmd+X).","paste":"Paste","pasteArea":"Paste Area","pasteMsg":"Please paste inside the following box using the keyboard (<strong>Ctrl/Cmd+V</strong>) and hit OK","securityMsg":"Because of your browser security settings, the editor is not able to access your clipboard data directly. You are required to paste it again in this window.","title":"Paste"},"horizontalrule":{"toolbar":"Insert Horizontal Line"},"indent":{"indent":"Increase Indent","outdent":"Decrease Indent"},"justify":{"block":"Justify","center":"Center","left":"Align Left","right":"Align Right"},"list":{"bulletedlist":"Insert/Remove Bulleted List","numberedlist":"Insert/Remove Numbered List"},"pastefromword":{"confirmCleanup":"The text you want to paste seems to be copied from Word. Do you want to clean it before pasting?","error":"It was not possible to clean up the pasted data due to an internal error","title":"Paste from Word","toolbar":"Paste from Word"},"removeformat":{"toolbar":"Remove Format"},"undo":{"redo":"Redo","undo":"Undo"},"widget":{"move":"Click and drag to move","label":"%1 widget"}};AlloyEditor.Strings = {"alignCenter":"Center","alignJustify":"Justify","alignLeft":"Left","alignRight":"Right","bold":"Bold","bulletedlist":"Insert/Remove Bulleted List","cancel":"Cancel","horizontalrule":"Insert Horizontal Line","italic":"Italic","numberedlist":"Insert/Remove Numbered List","quote":"Block Quote","removeformat":"Remove Format","strike":"Strikethrough","subscript":"Subscript","superscript":"Superscript","underline":"Underline","formatted":"Formatted","h1":"Heading 1","h2":"Heading 2","normal":"Normal","indent":"Increase Indent","outdent":"Decrease Indent","blockStyles":"Block Styles","inlineStyles":"Inline Styles","objectStyles":"Object Styles","styles":"Styles","cell":"Cell","cellDelete":"Delete Cells","cellInsertAfter":"Insert Cell After","cellInsertBefore":"Insert Cell Before","cellMerge":"Merge Cells","cellMergeDown":"Merge Down","cellMergeRight":"Merge Right","cellSplitHorizontal":"Split Cell Horizontally","cellSplitVertical":"Split Cell Vertically","column":"Column","columnDelete":"Delete Columns","columnInsertAfter":"Insert Column After","columnInsertBefore":"Insert Column Before","deleteTable":"Delete Table","headers":"Headers","headersBoth":"Both","headersColumn":"First column","headersNone":"None","headersRow":"First Row","row":"Row","rowDelete":"Delete Rows","rowInsertAfter":"Insert Row After","rowInsertBefore":"Insert Row Before","add":"Add","ariaUpdateNoToolbar":"No toolbars are available","ariaUpdateOneToolbar":"{toolbars} toolbar is available. Press ALT+F10 to focus.","ariaUpdateManyToolbars":"{toolbars} toolbars are available. Press ALT+F10 to focus.","camera":"Insert Image from Camera","cameraDisabled":"The browser does not support this action, or it is available on https only (Chrome).","cite":"Cite","clearInput":"Clear Input Field","code":"Code","columns":"Cols","confirm":"Confirm","deleteEmbed":"Delete embed","editLink":"Type or paste link here","image":"Insert Image","link":"Link","linkTargetBlank":"_blank (new tab)","linkTargetDefault":"default","linkTargetParent":"_parent","linkTargetSelf":"_self (same tab)","linkTargetTop":"_top","removeLink":"Remove link","rows":"Rows","table":"Insert Table"};/**
 * Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

// This file contains style definitions that can be used by CKEditor plugins.
//
// The most common use for it is the "stylescombo" plugin which shows the Styles drop-down
// list containing all styles in the editor toolbar. Other plugins, like
// the "div" plugin, use a subset of the styles for their features.
//
// If you do not have plugins that depend on this file in your editor build, you can simply
// ignore it. Otherwise it is strongly recommended to customize this file to match your
// website requirements and design properly.
//
// For more information refer to: http://docs.ckeditor.com/#!/guide/dev_styles-section-style-rules

CKEDITOR.stylesSet.add( 'default', [
    /* Block styles */

    // These styles are already available in the "Format" drop-down list ("format" plugin),
    // so they are not needed here by default. You may enable them to avoid
    // placing the "Format" combo in the toolbar, maintaining the same features.
    /*
    { name: 'Paragraph',		element: 'p' },
    { name: 'Heading 1',		element: 'h1' },
    { name: 'Heading 2',		element: 'h2' },
    { name: 'Heading 3',		element: 'h3' },
    { name: 'Heading 4',		element: 'h4' },
    { name: 'Heading 5',		element: 'h5' },
    { name: 'Heading 6',		element: 'h6' },
    { name: 'Preformatted Text',element: 'pre' },
    { name: 'Address',			element: 'address' },
    */

    { name: 'Italic Title',		element: 'h2', styles: { 'font-style': 'italic' } },
    { name: 'Subtitle',			element: 'h3', styles: { 'color': '#aaa', 'font-style': 'italic' } },
    {
        name: 'Special Container',
        element: 'div',
        styles: {
            padding: '5px 10px',
            background: '#eee',
            border: '1px solid #ccc'
        }
    },

    /* Inline styles */

    // These are core styles available as toolbar buttons. You may opt enabling
    // some of them in the Styles drop-down list, removing them from the toolbar.
    // (This requires the "stylescombo" plugin.)
    /*
    { name: 'Strong',			element: 'strong', overrides: 'b' },
    { name: 'Emphasis',			element: 'em'	, overrides: 'i' },
    { name: 'Underline',		element: 'u' },
    { name: 'Strikethrough',	element: 'strike' },
    { name: 'Subscript',		element: 'sub' },
    { name: 'Superscript',		element: 'sup' },
    */

    { name: 'Marker',			element: 'span', attributes: { 'class': 'marker' } },

    { name: 'Big',				element: 'big' },
    { name: 'Small',			element: 'small' },
    { name: 'Typewriter',		element: 'tt' },

    { name: 'Computer Code',	element: 'code' },
    { name: 'Keyboard Phrase',	element: 'kbd' },
    { name: 'Sample Text',		element: 'samp' },
    { name: 'Variable',			element: 'var' },

    { name: 'Deleted Text',		element: 'del' },
    { name: 'Inserted Text',	element: 'ins' },

    { name: 'Cited Work',		element: 'cite' },
    { name: 'Inline Quotation',	element: 'q' },

    { name: 'Language: RTL',	element: 'span', attributes: { 'dir': 'rtl' } },
    { name: 'Language: LTR',	element: 'span', attributes: { 'dir': 'ltr' } },

    /* Object styles */

    {
        name: 'Styled Image (left)',
        element: 'img',
        attributes: { 'class': 'left' }
    },

    {
        name: 'Styled Image (right)',
        element: 'img',
        attributes: { 'class': 'right' }
    },

    {
        name: 'Compact Table',
        element: 'table',
        attributes: {
            cellpadding: '5',
            cellspacing: '0',
            border: '1',
            bordercolor: '#ccc'
        },
        styles: {
            'border-collapse': 'collapse'
        }
    },

    { name: 'Borderless Table',		element: 'table',	styles: { 'border-style': 'hidden', 'background-color': '#E6E6FA' } },
    { name: 'Square Bulleted List',	element: 'ul',		styles: { 'list-style-type': 'square' } },

    /* Widget styles */

    { name: 'Clean Image', type: 'widget', widget: 'image', attributes: { 'class': 'image-clean' } },
    { name: 'Grayscale Image', type: 'widget', widget: 'image', attributes: { 'class': 'image-grayscale' } },

    { name: 'Featured Snippet', type: 'widget', widget: 'codeSnippet', attributes: { 'class': 'code-featured' } },

    { name: 'Featured Formula', type: 'widget', widget: 'mathjax', attributes: { 'class': 'math-featured' } },

    { name: '240p', type: 'widget', widget: 'embedSemantic', attributes: { 'class': 'embed-240p' } },
    { name: '360p', type: 'widget', widget: 'embedSemantic', attributes: { 'class': 'embed-360p' } },
    { name: '480p', type: 'widget', widget: 'embedSemantic', attributes: { 'class': 'embed-480p' } },
    { name: '720p', type: 'widget', widget: 'embedSemantic', attributes: { 'class': 'embed-720p' } },
    { name: '1080p', type: 'widget', widget: 'embedSemantic', attributes: { 'class': 'embed-1080p' } },

    // Adding space after the style name is an intended workaround. For now, there
    // is no option to create two styles with the same name for different widget types. See #16664.
    { name: '240p ', type: 'widget', widget: 'embed', attributes: { 'class': 'embed-240p' } },
    { name: '360p ', type: 'widget', widget: 'embed', attributes: { 'class': 'embed-360p' } },
    { name: '480p ', type: 'widget', widget: 'embed', attributes: { 'class': 'embed-480p' } },
    { name: '720p ', type: 'widget', widget: 'embed', attributes: { 'class': 'embed-720p' } },
    { name: '1080p ', type: 'widget', widget: 'embed', attributes: { 'class': 'embed-1080p' } }

] );
