/* eslint-disable */
/* eslint-enable no-undef, prettier/prettier, no-unused-vars */

import {
  mxConstants,
  mxResources,
  mxEvent,
  mxUtils,
  mxClient,
  mxPopupMenu,
} from "../../core/mxgraph";
import { EditorUi } from "./EditorUi";
import { Menus } from "./Menus";
import { Editor, FilenameDialog } from "./Editor";
import { dropdownImage } from "../images/base64";

export { Toolbar };

/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Construcs a new toolbar for the given editor.
 */
function Toolbar(editorUi, container) {
  this.editorUi = editorUi;
  this.container = container;
  this.staticElements = [];
  this.init();

  // Global handler to hide the current menu
  this.gestureHandler = mxUtils.bind(this, function (evt) {
    if (
      this.editorUi.currentMenu != null &&
      mxEvent.getSource(evt) != this.editorUi.currentMenu.div
    ) {
      this.hideMenu();
    }
  });

  mxEvent.addGestureListeners(document, this.gestureHandler);
}

/**
 * Image for the dropdown arrow.
 */
Toolbar.prototype.dropdownImage = dropdownImage;

/**
 * Image element for the dropdown arrow.
 */
Toolbar.prototype.dropdownImageHtml =
  '<img border="0" style="position:absolute;right:4px;top:' +
  8 +
  'px;" src="' +
  Toolbar.prototype.dropdownImage +
  '" valign="middle"/>';

/**
 * Defines the background for selected buttons.
 */
Toolbar.prototype.selectedBackground = "#d0d0d0";

/**
 * Defines the background for selected buttons.
 */
Toolbar.prototype.unselectedBackground = "none";

/**
 * Array that contains the DOM nodes that should never be removed.
 */
Toolbar.prototype.staticElements = null;

/**
 * Adds the toolbar elements.
 */
Toolbar.prototype.init = function () {
  let sw = screen.width;

  // Takes into account initial compact mode
  sw -= screen.height > 740 ? 56 : 0;

  if (sw >= 700) {
    const formatMenu = this.addMenu(
      "",
      mxResources.get("view") + " (" + mxResources.get("panTooltip") + ")",
      true,
      "viewPanels",
      null,
      true
    );
    this.addDropDownArrow(formatMenu, "geSprite-formatpanel", 38, 50, -4, -3, 36, -8);
    this.addSeparator();
  }

  const viewMenu = this.addMenu(
    "",
    mxResources.get("zoom") + " (Alt+Mousewheel)",
    true,
    "viewZoom",
    null,
    true
  );
  viewMenu.showDisabled = true;
  viewMenu.style.whiteSpace = "nowrap";
  viewMenu.style.position = "relative";
  viewMenu.style.overflow = "hidden";

  if (EditorUi.compactUi) {
    viewMenu.style.width = mxClient.IS_QUIRKS ? "58px" : "50px";
  } else {
    viewMenu.style.width = mxClient.IS_QUIRKS ? "62px" : "36px";
  }

  if (sw >= 420) {
    this.addSeparator();
    var elts = this.addItems(["zoomIn", "zoomOut"]);
    elts[0].setAttribute(
      "title",
      mxResources.get("zoomIn") + " (" + this.editorUi.actions.get("zoomIn").shortcut + ")"
    );
    elts[1].setAttribute(
      "title",
      mxResources.get("zoomOut") + " (" + this.editorUi.actions.get("zoomOut").shortcut + ")"
    );
  }

  // Updates the label if the scale changes
  this.updateZoom = mxUtils.bind(this, function () {
    viewMenu.innerHTML =
      Math.round(this.editorUi.editor.graph.view.scale * 100) + "%" + this.dropdownImageHtml;

    if (EditorUi.compactUi) {
      viewMenu.getElementsByTagName("img")[0].style.right = "1px";
      viewMenu.getElementsByTagName("img")[0].style.top = "5px";
    }
  });

  this.editorUi.editor.graph.view.addListener(mxEvent.EVENT_SCALE, this.updateZoom);
  this.editorUi.editor.addListener("resetGraphView", this.updateZoom);

  var elts = this.addItems(["-", "undo", "redo"]);
  elts[1].setAttribute(
    "title",
    mxResources.get("undo") + " (" + this.editorUi.actions.get("undo").shortcut + ")"
  );
  elts[2].setAttribute(
    "title",
    mxResources.get("redo") + " (" + this.editorUi.actions.get("redo").shortcut + ")"
  );

  if (sw >= 320) {
    var elts = this.addItems(["-", "delete"]);
    elts[1].setAttribute(
      "title",
      mxResources.get("delete") + " (" + this.editorUi.actions.get("delete").shortcut + ")"
    );
  }

  if (sw >= 550) {
    this.addItems(["-", "toFront", "toBack"]);
  }

  if (sw >= 740) {
    this.addItems(["-", "fillColor"]);

    if (sw >= 780) {
      this.addItems(["strokeColor"]);

      if (sw >= 820) {
        this.addItems(["shadow"]);
      }
    }
  }

  if (sw >= 400) {
    this.addSeparator();

    if (sw >= 440) {
      this.edgeShapeMenu = this.addMenuFunction(
        "",
        mxResources.get("connection"),
        false,
        mxUtils.bind(this, function (menu) {
          this.editorUi.menus
            .edgeStyleChange(
              menu,
              "",
              [mxConstants.STYLE_SHAPE, "width"],
              [null, null],
              "geIcon geSprite geSprite-connection",
              null,
              true
            )
            .setAttribute("title", mxResources.get("line"));
          this.editorUi.menus
            .edgeStyleChange(
              menu,
              "",
              [mxConstants.STYLE_SHAPE, "width"],
              ["link", null],
              "geIcon geSprite geSprite-linkedge",
              null,
              true
            )
            .setAttribute("title", mxResources.get("link"));
          this.editorUi.menus
            .edgeStyleChange(
              menu,
              "",
              [mxConstants.STYLE_SHAPE, "width"],
              ["flexArrow", null],
              "geIcon geSprite geSprite-arrow",
              null,
              true
            )
            .setAttribute("title", mxResources.get("arrow"));
          this.editorUi.menus
            .edgeStyleChange(
              menu,
              "",
              [mxConstants.STYLE_SHAPE, "width"],
              ["arrow", null],
              "geIcon geSprite geSprite-simplearrow",
              null,
              true
            )
            .setAttribute("title", mxResources.get("simpleArrow"));
        })
      );

      this.addDropDownArrow(this.edgeShapeMenu, "geSprite-connection", 44, 50, 0, 0, 22, -4);
    }

    this.edgeStyleMenu = this.addMenuFunction(
      "geSprite-orthogonal",
      mxResources.get("waypoints"),
      false,
      mxUtils.bind(this, function (menu) {
        this.editorUi.menus
          .edgeStyleChange(
            menu,
            "",
            [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
            [null, null, null],
            "geIcon geSprite geSprite-straight",
            null,
            true
          )
          .setAttribute("title", mxResources.get("straight"));
        this.editorUi.menus
          .edgeStyleChange(
            menu,
            "",
            [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
            ["orthogonalEdgeStyle", null, null],
            "geIcon geSprite geSprite-orthogonal",
            null,
            true
          )
          .setAttribute("title", mxResources.get("orthogonal"));
        this.editorUi.menus
          .edgeStyleChange(
            menu,
            "",
            [
              mxConstants.STYLE_EDGE,
              mxConstants.STYLE_ELBOW,
              mxConstants.STYLE_CURVED,
              mxConstants.STYLE_NOEDGESTYLE,
            ],
            ["elbowEdgeStyle", null, null, null],
            "geIcon geSprite geSprite-horizontalelbow",
            null,
            true
          )
          .setAttribute("title", mxResources.get("simple"));
        this.editorUi.menus
          .edgeStyleChange(
            menu,
            "",
            [
              mxConstants.STYLE_EDGE,
              mxConstants.STYLE_ELBOW,
              mxConstants.STYLE_CURVED,
              mxConstants.STYLE_NOEDGESTYLE,
            ],
            ["elbowEdgeStyle", "vertical", null, null],
            "geIcon geSprite geSprite-verticalelbow",
            null,
            true
          )
          .setAttribute("title", mxResources.get("simple"));
        this.editorUi.menus
          .edgeStyleChange(
            menu,
            "",
            [
              mxConstants.STYLE_EDGE,
              mxConstants.STYLE_ELBOW,
              mxConstants.STYLE_CURVED,
              mxConstants.STYLE_NOEDGESTYLE,
            ],
            ["isometricEdgeStyle", null, null, null],
            "geIcon geSprite geSprite-horizontalisometric",
            null,
            true
          )
          .setAttribute("title", mxResources.get("isometric"));
        this.editorUi.menus
          .edgeStyleChange(
            menu,
            "",
            [
              mxConstants.STYLE_EDGE,
              mxConstants.STYLE_ELBOW,
              mxConstants.STYLE_CURVED,
              mxConstants.STYLE_NOEDGESTYLE,
            ],
            ["isometricEdgeStyle", "vertical", null, null],
            "geIcon geSprite geSprite-verticalisometric",
            null,
            true
          )
          .setAttribute("title", mxResources.get("isometric"));
        this.editorUi.menus
          .edgeStyleChange(
            menu,
            "",
            [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
            ["orthogonalEdgeStyle", "1", null],
            "geIcon geSprite geSprite-curved",
            null,
            true
          )
          .setAttribute("title", mxResources.get("curved"));
        this.editorUi.menus
          .edgeStyleChange(
            menu,
            "",
            [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
            ["entityRelationEdgeStyle", null, null],
            "geIcon geSprite geSprite-entity",
            null,
            true
          )
          .setAttribute("title", mxResources.get("entityRelation"));
      })
    );

    this.addDropDownArrow(this.edgeStyleMenu, "geSprite-orthogonal", 44, 50, 0, 0, 22, -4);
  }

  // - Toolbar ADD PLus
  this.addTableDropDown();
};

/**
 * Adds the toolbar elements.
 */
Toolbar.prototype.addTableDropDown = function () {
  this.addSeparator();

  // KNOWN: All table stuff does not work with undo/redo
  // KNOWN: Lost focus after click on submenu with text (not icon) in quirks and IE8. This is because the TD seems
  // to catch the focus on click in these browsers. NOTE: Workaround in mxPopupMenu for icon items (without text).
  var elt = this.addMenuFunction(
    "geIcon geSprite geSprite-table",
    mxResources.get("table"),
    false,
    mxUtils.bind(this, function (menu) {
      const graph = this.editorUi.editor.graph;
      const cell = graph.getSelectionCell();

      if (!graph.isTableCell(cell) && !graph.isTableRow(cell) && !graph.isTable(cell)) {
        this.editorUi.menus.addInsertTableCellItem(menu);
      } else {
        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            try {
              graph.insertTableColumn(cell, true);
            } catch (e) {
              this.editorUi.handleError(e);
            }
          }),
          null,
          "geIcon geSprite geSprite-insertcolumnbefore"
        );
        elt.setAttribute("title", mxResources.get("insertColumnBefore"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            try {
              graph.insertTableColumn(cell, false);
            } catch (e) {
              this.editorUi.handleError(e);
            }
          }),
          null,
          "geIcon geSprite geSprite-insertcolumnafter"
        );
        elt.setAttribute("title", mxResources.get("insertColumnAfter"));

        elt = menu.addItem(
          "Delete column",
          null,
          mxUtils.bind(this, function () {
            if (cell != null) {
              try {
                graph.deleteTableColumn(cell);
              } catch (e) {
                this.editorUi.handleError(e);
              }
            }
          }),
          null,
          "geIcon geSprite geSprite-deletecolumn"
        );
        elt.setAttribute("title", mxResources.get("deleteColumn"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            try {
              graph.insertTableRow(cell, true);
            } catch (e) {
              this.editorUi.handleError(e);
            }
          }),
          null,
          "geIcon geSprite geSprite-insertrowbefore"
        );
        elt.setAttribute("title", mxResources.get("insertRowBefore"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            try {
              graph.insertTableRow(cell, false);
            } catch (e) {
              this.editorUi.handleError(e);
            }
          }),
          null,
          "geIcon geSprite geSprite-insertrowafter"
        );
        elt.setAttribute("title", mxResources.get("insertRowAfter"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            try {
              graph.deleteTableRow(cell);
            } catch (e) {
              this.editorUi.handleError(e);
            }
          }),
          null,
          "geIcon geSprite geSprite-deleterow"
        );
        elt.setAttribute("title", mxResources.get("deleteRow"));
      }
    })
  );

  elt.style.position = "relative";
  elt.style.whiteSpace = "nowrap";
  elt.style.overflow = "hidden";
  elt.innerHTML =
    '<div class="geSprite geSprite-table" style="margin-left:-2px;"></div>' +
    this.dropdownImageHtml;
  elt.style.width = mxClient.IS_QUIRKS ? "50px" : "30px";

  // Fix for item size in kennedy theme
  if (EditorUi.compactUi) {
    elt.getElementsByTagName("img")[0].style.left = "22px";
    elt.getElementsByTagName("img")[0].style.top = "5px";
  }

  return elt;
};

/**
 * Adds the toolbar elements.
 */
Toolbar.prototype.addDropDownArrow = function (
  menu,
  sprite,
  width,
  atlasWidth,
  left,
  top,
  atlasDelta,
  atlasLeft
) {
  atlasDelta = atlasDelta != null ? atlasDelta : 32;
  left = EditorUi.compactUi ? left : atlasLeft;

  menu.style.whiteSpace = "nowrap";
  menu.style.overflow = "hidden";
  menu.style.position = "relative";
  menu.innerHTML =
    '<div class="geSprite ' +
    sprite +
    '" style="margin-left:' +
    left +
    "px;margin-top:" +
    top +
    'px;"></div>' +
    this.dropdownImageHtml;
  menu.style.width = mxClient.IS_QUIRKS ? atlasWidth + "px" : atlasWidth - atlasDelta + "px";

  if (mxClient.IS_QUIRKS) {
    menu.style.height = EditorUi.compactUi ? "24px" : "26px";
  }

  // Fix for item size in kennedy theme
  if (EditorUi.compactUi) {
    menu.getElementsByTagName("img")[0].style.left = "24px";
    menu.getElementsByTagName("img")[0].style.top = "5px";
    menu.style.width = mxClient.IS_QUIRKS ? width + "px" : width - 10 + "px";
  }
};

/**
 * Sets the current font name.
 */
Toolbar.prototype.setFontName = function (value) {
  if (this.fontMenu != null) {
    this.fontMenu.innerHTML =
      '<div style="width:60px;overflow:hidden;display:inline-block;">' +
      mxUtils.htmlEntities(value) +
      "</div>" +
      this.dropdownImageHtml;
  }
};

/**
 * Sets the current font name.
 */
Toolbar.prototype.setFontSize = function (value) {
  if (this.sizeMenu != null) {
    this.sizeMenu.innerHTML =
      '<div style="width:24px;overflow:hidden;display:inline-block;">' +
      value +
      "</div>" +
      this.dropdownImageHtml;
  }
};

/**
 * Hides the current menu.
 */
Toolbar.prototype.createTextToolbar = function () {
  const graph = this.editorUi.editor.graph;

  const styleElt = this.addMenu("", mxResources.get("style"), true, "formatBlock");
  styleElt.style.position = "relative";
  styleElt.style.whiteSpace = "nowrap";
  styleElt.style.overflow = "hidden";
  styleElt.innerHTML = mxResources.get("style") + this.dropdownImageHtml;

  if (EditorUi.compactUi) {
    styleElt.style.paddingRight = "18px";
    styleElt.getElementsByTagName("img")[0].style.right = "1px";
    styleElt.getElementsByTagName("img")[0].style.top = "5px";
  }

  this.addSeparator();

  this.fontMenu = this.addMenu("", mxResources.get("fontFamily"), true, "fontFamily");
  this.fontMenu.style.position = "relative";
  this.fontMenu.style.whiteSpace = "nowrap";
  this.fontMenu.style.overflow = "hidden";
  this.fontMenu.style.width = mxClient.IS_QUIRKS ? "80px" : "60px";

  this.setFontName(Menus.prototype.defaultFont);

  if (EditorUi.compactUi) {
    this.fontMenu.style.paddingRight = "18px";
    this.fontMenu.getElementsByTagName("img")[0].style.right = "1px";
    this.fontMenu.getElementsByTagName("img")[0].style.top = "5px";
  }

  this.addSeparator();

  this.sizeMenu = this.addMenu(
    Menus.prototype.defaultFontSize,
    mxResources.get("fontSize"),
    true,
    "fontSize"
  );
  this.sizeMenu.style.position = "relative";
  this.sizeMenu.style.whiteSpace = "nowrap";
  this.sizeMenu.style.overflow = "hidden";
  this.sizeMenu.style.width = mxClient.IS_QUIRKS ? "44px" : "24px";

  this.setFontSize(Menus.prototype.defaultFontSize);

  if (EditorUi.compactUi) {
    this.sizeMenu.style.paddingRight = "18px";
    this.sizeMenu.getElementsByTagName("img")[0].style.right = "1px";
    this.sizeMenu.getElementsByTagName("img")[0].style.top = "5px";
  }

  const elts = this.addItems(["-", "undo", "redo", "-", "bold", "italic", "underline"]);
  elts[1].setAttribute(
    "title",
    mxResources.get("undo") + " (" + this.editorUi.actions.get("undo").shortcut + ")"
  );
  elts[2].setAttribute(
    "title",
    mxResources.get("redo") + " (" + this.editorUi.actions.get("redo").shortcut + ")"
  );
  elts[4].setAttribute(
    "title",
    mxResources.get("bold") + " (" + this.editorUi.actions.get("bold").shortcut + ")"
  );
  elts[5].setAttribute(
    "title",
    mxResources.get("italic") + " (" + this.editorUi.actions.get("italic").shortcut + ")"
  );
  elts[6].setAttribute(
    "title",
    mxResources.get("underline") + " (" + this.editorUi.actions.get("underline").shortcut + ")"
  );

  // KNOWN: Lost focus after click on submenu with text (not icon) in quirks and IE8. This is because the TD seems
  // to catch the focus on click in these browsers. NOTE: Workaround in mxPopupMenu for icon items (without text).
  const alignMenu = this.addMenuFunction(
    "",
    mxResources.get("align"),
    false,
    mxUtils.bind(this, function (menu) {
      elt = menu.addItem(
        "",
        null,
        mxUtils.bind(this, function (evt) {
          graph.cellEditor.alignText(mxConstants.ALIGN_LEFT, evt);
        }),
        null,
        "geIcon geSprite geSprite-left"
      );
      elt.setAttribute("title", mxResources.get("left"));

      elt = menu.addItem(
        "",
        null,
        mxUtils.bind(this, function (evt) {
          graph.cellEditor.alignText(mxConstants.ALIGN_CENTER, evt);
        }),
        null,
        "geIcon geSprite geSprite-center"
      );
      elt.setAttribute("title", mxResources.get("center"));

      elt = menu.addItem(
        "",
        null,
        mxUtils.bind(this, function (evt) {
          graph.cellEditor.alignText(mxConstants.ALIGN_RIGHT, evt);
        }),
        null,
        "geIcon geSprite geSprite-right"
      );
      elt.setAttribute("title", mxResources.get("right"));

      elt = menu.addItem(
        "",
        null,
        mxUtils.bind(this, function () {
          document.execCommand("justifyfull", false, null);
        }),
        null,
        "geIcon geSprite geSprite-justifyfull"
      );
      elt.setAttribute("title", mxResources.get("justifyfull"));

      elt = menu.addItem(
        "",
        null,
        mxUtils.bind(this, function () {
          document.execCommand("insertorderedlist", false, null);
        }),
        null,
        "geIcon geSprite geSprite-orderedlist"
      );
      elt.setAttribute("title", mxResources.get("numberedList"));

      elt = menu.addItem(
        "",
        null,
        mxUtils.bind(this, function () {
          document.execCommand("insertunorderedlist", false, null);
        }),
        null,
        "geIcon geSprite geSprite-unorderedlist"
      );
      elt.setAttribute("title", mxResources.get("bulletedList"));

      elt = menu.addItem(
        "",
        null,
        mxUtils.bind(this, function () {
          document.execCommand("outdent", false, null);
        }),
        null,
        "geIcon geSprite geSprite-outdent"
      );
      elt.setAttribute("title", mxResources.get("decreaseIndent"));

      elt = menu.addItem(
        "",
        null,
        mxUtils.bind(this, function () {
          document.execCommand("indent", false, null);
        }),
        null,
        "geIcon geSprite geSprite-indent"
      );
      elt.setAttribute("title", mxResources.get("increaseIndent"));
    })
  );

  alignMenu.style.position = "relative";
  alignMenu.style.whiteSpace = "nowrap";
  alignMenu.style.overflow = "hidden";
  alignMenu.innerHTML =
    '<div class="geSprite geSprite-left" style="margin-left:-2px;"></div>' + this.dropdownImageHtml;
  alignMenu.style.width = mxClient.IS_QUIRKS ? "50px" : "30px";

  if (EditorUi.compactUi) {
    alignMenu.getElementsByTagName("img")[0].style.left = "22px";
    alignMenu.getElementsByTagName("img")[0].style.top = "5px";
  }

  const formatMenu = this.addMenuFunction(
    "",
    mxResources.get("format"),
    false,
    mxUtils.bind(this, function (menu) {
      elt = menu.addItem(
        "",
        null,
        this.editorUi.actions.get("subscript").funct,
        null,
        "geIcon geSprite geSprite-subscript"
      );
      elt.setAttribute("title", mxResources.get("subscript") + " (" + Editor.ctrlKey + "+,)");

      elt = menu.addItem(
        "",
        null,
        this.editorUi.actions.get("superscript").funct,
        null,
        "geIcon geSprite geSprite-superscript"
      );
      elt.setAttribute("title", mxResources.get("superscript") + " (" + Editor.ctrlKey + "+.)");

      // KNOWN: IE+FF don't return keyboard focus after color dialog (calling focus doesn't help)
      elt = menu.addItem(
        "",
        null,
        this.editorUi.actions.get("fontColor").funct,
        null,
        "geIcon geSprite geSprite-fontcolor"
      );
      elt.setAttribute("title", mxResources.get("fontColor"));

      elt = menu.addItem(
        "",
        null,
        this.editorUi.actions.get("backgroundColor").funct,
        null,
        "geIcon geSprite geSprite-fontbackground"
      );
      elt.setAttribute("title", mxResources.get("backgroundColor"));

      elt = menu.addItem(
        "",
        null,
        mxUtils.bind(this, function () {
          document.execCommand("removeformat", false, null);
        }),
        null,
        "geIcon geSprite geSprite-removeformat"
      );
      elt.setAttribute("title", mxResources.get("removeFormat"));
    })
  );

  formatMenu.style.position = "relative";
  formatMenu.style.whiteSpace = "nowrap";
  formatMenu.style.overflow = "hidden";
  formatMenu.innerHTML =
    '<div class="geSprite geSprite-dots" style="margin-left:-2px;"></div>' + this.dropdownImageHtml;
  formatMenu.style.width = mxClient.IS_QUIRKS ? "50px" : "30px";

  if (EditorUi.compactUi) {
    formatMenu.getElementsByTagName("img")[0].style.left = "22px";
    formatMenu.getElementsByTagName("img")[0].style.top = "5px";
  }

  this.addSeparator();

  this.addButton("geIcon geSprite geSprite-code", mxResources.get("html"), function () {
    graph.cellEditor.toggleViewMode();

    if (
      graph.cellEditor.textarea.innerHTML.length > 0 &&
      (graph.cellEditor.textarea.innerHTML != "&nbsp;" || !graph.cellEditor.clearOnChange)
    ) {
      window.setTimeout(function () {
        document.execCommand("selectAll", false, null);
      });
    }
  });

  this.addSeparator();

  // - Insert Image Menu
  // - Insert Link Menu

  // KNOWN: All table stuff does not work with undo/redo
  // KNOWN: Lost focus after click on submenu with text (not icon) in quirks and IE8. This is because the TD seems
  // to catch the focus on click in these browsers. NOTE: Workaround in mxPopupMenu for icon items (without text).
  var elt = this.addMenuFunction(
    "geIcon geSprite geSprite-table",
    mxResources.get("table"),
    false,
    mxUtils.bind(this, function (menu) {
      let elt = graph.getSelectedElement();
      const cell = graph.getParentByNames(elt, ["TD", "TH"], graph.cellEditor.text2);
      const row = graph.getParentByName(elt, "TR", graph.cellEditor.text2);

      if (row == null) {
        this.editorUi.menus.addInsertTableItem(menu);
      } else {
        const table = graph.getParentByName(row, "TABLE", graph.cellEditor.text2);

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            try {
              graph.selectNode(graph.insertColumn(table, cell != null ? cell.cellIndex : 0));
            } catch (e) {
              this.editorUi.handleError(e);
            }
          }),
          null,
          "geIcon geSprite geSprite-insertcolumnbefore"
        );
        elt.setAttribute("title", mxResources.get("insertColumnBefore"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            try {
              graph.selectNode(graph.insertColumn(table, cell != null ? cell.cellIndex + 1 : -1));
            } catch (e) {
              this.editorUi.handleError(e);
            }
          }),
          null,
          "geIcon geSprite geSprite-insertcolumnafter"
        );
        elt.setAttribute("title", mxResources.get("insertColumnAfter"));

        elt = menu.addItem(
          "Delete column",
          null,
          mxUtils.bind(this, function () {
            if (cell != null) {
              try {
                graph.deleteColumn(table, cell.cellIndex);
              } catch (e) {
                this.editorUi.handleError(e);
              }
            }
          }),
          null,
          "geIcon geSprite geSprite-deletecolumn"
        );
        elt.setAttribute("title", mxResources.get("deleteColumn"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            try {
              graph.selectNode(graph.insertRow(table, row.sectionRowIndex));
            } catch (e) {
              this.editorUi.handleError(e);
            }
          }),
          null,
          "geIcon geSprite geSprite-insertrowbefore"
        );
        elt.setAttribute("title", mxResources.get("insertRowBefore"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            try {
              graph.selectNode(graph.insertRow(table, row.sectionRowIndex + 1));
            } catch (e) {
              this.editorUi.handleError(e);
            }
          }),
          null,
          "geIcon geSprite geSprite-insertrowafter"
        );
        elt.setAttribute("title", mxResources.get("insertRowAfter"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            try {
              graph.deleteRow(table, row.sectionRowIndex);
            } catch (e) {
              this.editorUi.handleError(e);
            }
          }),
          null,
          "geIcon geSprite geSprite-deleterow"
        );
        elt.setAttribute("title", mxResources.get("deleteRow"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            // Converts rgb(r,g,b) values
            const color = table.style.borderColor.replace(
              /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
              function ($0, $1, $2, $3) {
                return (
                  "#" +
                  ("0" + Number($1).toString(16)).substr(-2) +
                  ("0" + Number($2).toString(16)).substr(-2) +
                  ("0" + Number($3).toString(16)).substr(-2)
                );
              }
            );
            this.editorUi.pickColor(color, function (newColor) {
              if (newColor == null || newColor == mxConstants.NONE) {
                table.removeAttribute("border");
                table.style.border = "";
                table.style.borderCollapse = "";
              } else {
                table.setAttribute("border", "1");
                table.style.border = "1px solid " + newColor;
                table.style.borderCollapse = "collapse";
              }
            });
          }),
          null,
          "geIcon geSprite geSprite-strokecolor"
        );
        elt.setAttribute("title", mxResources.get("borderColor"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            // Converts rgb(r,g,b) values
            const color = table.style.backgroundColor.replace(
              /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
              function ($0, $1, $2, $3) {
                return (
                  "#" +
                  ("0" + Number($1).toString(16)).substr(-2) +
                  ("0" + Number($2).toString(16)).substr(-2) +
                  ("0" + Number($3).toString(16)).substr(-2)
                );
              }
            );
            this.editorUi.pickColor(color, function (newColor) {
              if (newColor == null || newColor == mxConstants.NONE) {
                table.style.backgroundColor = "";
              } else {
                table.style.backgroundColor = newColor;
              }
            });
          }),
          null,
          "geIcon geSprite geSprite-fillcolor"
        );
        elt.setAttribute("title", mxResources.get("backgroundColor"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            const value = table.getAttribute("cellPadding") || 0;

            const dlg = new FilenameDialog(
              this.editorUi,
              value,
              mxResources.get("apply"),
              mxUtils.bind(this, function (newValue) {
                if (newValue != null && newValue.length > 0) {
                  table.setAttribute("cellPadding", newValue);
                } else {
                  table.removeAttribute("cellPadding");
                }
              }),
              mxResources.get("spacing")
            );
            this.editorUi.showDialog(dlg.container, 300, 80, true, true);
            dlg.init();
          }),
          null,
          "geIcon geSprite geSprite-fit"
        );
        elt.setAttribute("title", mxResources.get("spacing"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            table.setAttribute("align", "left");
          }),
          null,
          "geIcon geSprite geSprite-left"
        );
        elt.setAttribute("title", mxResources.get("left"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            table.setAttribute("align", "center");
          }),
          null,
          "geIcon geSprite geSprite-center"
        );
        elt.setAttribute("title", mxResources.get("center"));

        elt = menu.addItem(
          "",
          null,
          mxUtils.bind(this, function () {
            table.setAttribute("align", "right");
          }),
          null,
          "geIcon geSprite geSprite-right"
        );
        elt.setAttribute("title", mxResources.get("right"));
      }
    })
  );

  elt.style.position = "relative";
  elt.style.whiteSpace = "nowrap";
  elt.style.overflow = "hidden";
  elt.innerHTML =
    '<div class="geSprite geSprite-table" style="margin-left:-2px;"></div>' +
    this.dropdownImageHtml;
  elt.style.width = mxClient.IS_QUIRKS ? "50px" : "30px";

  // Fix for item size in kennedy theme
  if (EditorUi.compactUi) {
    elt.getElementsByTagName("img")[0].style.left = "22px";
    elt.getElementsByTagName("img")[0].style.top = "5px";
  }
};

/**
 * Hides the current menu.
 */
Toolbar.prototype.hideMenu = function () {
  this.editorUi.hideCurrentMenu();
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenu = function (label, tooltip, showLabels, name, c, showAll, ignoreState) {
  const menu = this.editorUi.menus.get(name);
  const elt = this.addMenuFunction(
    label,
    tooltip,
    showLabels,
    function () {
      menu.funct.apply(menu, arguments);
    },
    c,
    showAll
  );

  if (!ignoreState) {
    menu.addListener("stateChanged", function () {
      elt.setEnabled(menu.enabled);
    });
  }

  return elt;
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenuFunction = function (label, tooltip, showLabels, funct, c, showAll) {
  return this.addMenuFunctionInContainer(
    c != null ? c : this.container,
    label,
    tooltip,
    showLabels,
    funct,
    showAll
  );
};

/**
 * Adds a label to the toolbar.
 */
Toolbar.prototype.addMenuFunctionInContainer = function (
  container,
  label,
  tooltip,
  showLabels,
  funct,
  showAll
) {
  const elt = showLabels ? this.createLabel(label) : this.createButton(label);
  this.initElement(elt, tooltip);
  this.addMenuHandler(elt, showLabels, funct, showAll);
  container.appendChild(elt);

  return elt;
};

/**
 * Adds a separator to the separator.
 */
Toolbar.prototype.addSeparator = function (c) {
  c = c != null ? c : this.container;
  const elt = document.createElement("div");
  elt.className = "geSeparator";
  c.appendChild(elt);

  return elt;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItems = function (keys, c, ignoreDisabled) {
  const items = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (key == "-") {
      items.push(this.addSeparator(c));
    } else {
      items.push(this.addItem("geSprite-" + key.toLowerCase(), key, c, ignoreDisabled));
    }
  }

  return items;
};

/**
 * Adds given action item
 */
Toolbar.prototype.addItem = function (sprite, key, c, ignoreDisabled) {
  const action = this.editorUi.actions.get(key);
  let elt = null;

  if (action != null) {
    let tooltip = action.label;

    if (action.shortcut != null) {
      tooltip += " (" + action.shortcut + ")";
    }

    elt = this.addButton(sprite, tooltip, action.funct, c);

    if (!ignoreDisabled) {
      elt.setEnabled(action.enabled);

      action.addListener("stateChanged", function () {
        elt.setEnabled(action.enabled);
      });
    }
  }

  return elt;
};

/**
 * Adds a button to the toolbar.
 */
Toolbar.prototype.addButton = function (classname, tooltip, funct, c) {
  const elt = this.createButton(classname);
  c = c != null ? c : this.container;

  this.initElement(elt, tooltip);
  this.addClickHandler(elt, funct);
  c.appendChild(elt);

  return elt;
};

/**
 * Initializes the given toolbar element.
 */
Toolbar.prototype.initElement = function (elt, tooltip) {
  // Adds tooltip
  if (tooltip != null) {
    elt.setAttribute("title", tooltip);
  }

  this.addEnabledState(elt);
};

/**
 * Adds enabled state with setter to DOM node (avoids JS wrapper).
 */
Toolbar.prototype.addEnabledState = function (elt) {
  const classname = elt.className;

  elt.setEnabled = function (value) {
    elt.enabled = value;

    if (value) {
      elt.className = classname;
    } else {
      elt.className = classname + " mxDisabled";
    }
  };

  elt.setEnabled(true);
};

/**
 * Adds enabled state with setter to DOM node (avoids JS wrapper).
 */
Toolbar.prototype.addClickHandler = function (elt, funct) {
  if (funct != null) {
    mxEvent.addListener(elt, "click", function (evt) {
      if (elt.enabled) {
        funct(evt);
      }

      mxEvent.consume(evt);
    });

    // Prevents focus
    mxEvent.addListener(
      elt,
      mxClient.IS_POINTER ? "pointerdown" : "mousedown",
      mxUtils.bind(this, function (evt) {
        evt.preventDefault();
      })
    );
  }
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createButton = function (classname) {
  const elt = document.createElement("a");
  elt.className = "geButton";

  const inner = document.createElement("div");

  if (classname != null) {
    inner.className = "geSprite " + classname;
  }

  elt.appendChild(inner);

  return elt;
};

/**
 * Creates and returns a new button.
 */
Toolbar.prototype.createLabel = function (label) {
  const elt = document.createElement("a");
  elt.className = "geLabel";
  mxUtils.write(elt, label);

  return elt;
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Toolbar.prototype.addMenuHandler = function (elt, showLabels, funct, showAll) {
  if (funct != null) {
    const graph = this.editorUi.editor.graph;
    let menu = null;
    let show = true;

    mxEvent.addListener(
      elt,
      "click",
      mxUtils.bind(this, function (evt) {
        if (show && (elt.enabled == null || elt.enabled)) {
          graph.popupMenuHandler.hideMenu();
          menu = new mxPopupMenu(funct);
          menu.div.className += " geToolbarMenu";
          menu.showDisabled = showAll;
          menu.labels = showLabels;
          menu.autoExpand = true;

          const offset = mxUtils.getOffset(elt);
          menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
          this.editorUi.setCurrentMenu(menu, elt);

          // Workaround for scrollbar hiding menu items
          if (!showLabels && menu.div.scrollHeight > menu.div.clientHeight) {
            menu.div.style.width = "40px";
          }

          menu.hideMenu = mxUtils.bind(this, function () {
            mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
            this.editorUi.resetCurrentMenu();
            menu.destroy();
          });

          // Extends destroy to reset global state
          menu.addListener(
            mxEvent.EVENT_HIDE,
            mxUtils.bind(this, function () {
              this.currentElt = null;
            })
          );
        }

        show = true;
        mxEvent.consume(evt);
      })
    );

    // Hides menu if already showing and prevents focus
    mxEvent.addListener(
      elt,
      mxClient.IS_POINTER ? "pointerdown" : "mousedown",
      mxUtils.bind(this, function (evt) {
        show = this.currentElt != elt;
        evt.preventDefault();
      })
    );
  }
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Toolbar.prototype.destroy = function () {
  if (this.gestureHandler != null) {
    mxEvent.removeGestureListeners(document, this.gestureHandler);
    this.gestureHandler = null;
  }
};
