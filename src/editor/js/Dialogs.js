/* eslint-disable */
/* eslint-enable no-undef, prettier/prettier, no-unused-vars */

import {
  mxConstants,
  mxResources,
  mxEventObject,
  mxEvent,
  mxUtils,
  mxClient,
  mxRectangle,
  mxPopupMenu,
  mxCell,
  mxWindow,
} from "../../core/mxgraph";

import { Editor, Dialog, FilenameDialog } from "./Editor";
import { mxJSColor, mxColor } from "../jscolor/jscolor";
import { EditorUi } from "./EditorUi";
import { PRESENT_COLORS, DEFAULT_COLORS } from "../constant";

export { ColorDialog, OutlineWindow, LayersWindow };

/**
 * Constructs a new color dialog.
 */
function ColorDialog(editorUi, color, apply, cancelFn) {
  this.editorUi = editorUi;

  const input = document.createElement("input");
  input.style.marginBottom = "10px";
  input.style.width = "216px";

  // Required for picker to render in IE
  if (mxClient.IS_IE) {
    input.style.marginTop = "10px";
    document.body.appendChild(input);
  }

  const applyFunction = apply != null ? apply : this.createApplyFunction();

  function doApply() {
    let color = input.value;

    // Blocks any non-alphabetic chars in colors
    if (/(^#?[a-zA-Z0-9]*$)/.test(color)) {
      if (color != "none" && color.charAt(0) != "#") {
        color = "#" + color;
      }

      ColorDialog.addRecentColor(color != "none" ? color.substring(1) : color, 12);
      applyFunction(color);
      editorUi.hideDialog();
    } else {
      editorUi.handleError({ message: mxResources.get("invalidInput") });
    }
  }

  this.init = function () {
    if (!mxClient.IS_TOUCH) {
      input.focus();
    }
  };

  const picker = new mxColor(input);
  picker.pickerOnfocus = false;
  picker.showPicker();

  const div = document.createElement("div");
  mxJSColor.picker.box.style.position = "relative";
  mxJSColor.picker.box.style.width = "230px";
  mxJSColor.picker.box.style.height = "100px";
  mxJSColor.picker.box.style.paddingBottom = "10px";
  div.appendChild(mxJSColor.picker.box);

  const center = document.createElement("center");

  function createRecentColorTable() {
    const table = addPresets(
      ColorDialog.recentColors.length == 0 ? ["FFFFFF"] : ColorDialog.recentColors,
      11,
      "FFFFFF",
      true
    );
    table.style.marginBottom = "8px";

    return table;
  }

  function addPresets(presets, rowLength, defaultColor, addResetOption) {
    rowLength = rowLength != null ? rowLength : 12;
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.setAttribute("cellspacing", "0");
    table.style.marginBottom = "20px";
    table.style.cellSpacing = "0px";
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    const rows = presets.length / rowLength;

    for (let row = 0; row < rows; row++) {
      var tr = document.createElement("tr");

      for (let i = 0; i < rowLength; i++) {
        (function (clr) {
          const td = document.createElement("td");
          td.style.border = "1px solid black";
          td.style.padding = "0px";
          td.style.width = "16px";
          td.style.height = "16px";

          if (clr == null) {
            clr = defaultColor;
          }

          if (clr == "none") {
            td.style.background = "url('" + Dialog.prototype.noColorImage + "')";
          } else {
            td.style.backgroundColor = "#" + clr;
          }

          tr.appendChild(td);

          if (clr != null) {
            td.style.cursor = "pointer";

            mxEvent.addListener(td, "click", function () {
              if (clr == "none") {
                picker.fromString("ffffff");
                input.value = "none";
              } else {
                picker.fromString(clr);
              }
            });

            mxEvent.addListener(td, "dblclick", doApply);
          }
        })(presets[row * rowLength + i]);
      }

      tbody.appendChild(tr);
    }

    if (addResetOption) {
      const td = document.createElement("td");
      td.setAttribute("title", mxResources.get("reset"));
      td.style.border = "1px solid black";
      td.style.padding = "0px";
      td.style.width = "16px";
      td.style.height = "16px";
      td.style.backgroundImage = "url('" + Dialog.prototype.closeImage + "')";
      td.style.backgroundPosition = "center center";
      td.style.backgroundRepeat = "no-repeat";
      td.style.cursor = "pointer";

      tr.appendChild(td);

      mxEvent.addListener(td, "click", function () {
        ColorDialog.resetRecentColors();
        table.parentNode.replaceChild(createRecentColorTable(), table);
      });
    }

    center.appendChild(table);

    return table;
  }

  div.appendChild(input);
  mxUtils.br(div);

  // Adds recent colors
  createRecentColorTable();

  // Adds presets
  let table = addPresets(this.presetColors);
  table.style.marginBottom = "8px";
  table = addPresets(this.defaultColors);
  table.style.marginBottom = "16px";

  div.appendChild(center);

  const buttons = document.createElement("div");
  buttons.style.textAlign = "right";
  buttons.style.whiteSpace = "nowrap";

  const cancelBtn = mxUtils.button(mxResources.get("cancel"), function () {
    editorUi.hideDialog();

    if (cancelFn != null) {
      cancelFn();
    }
  });
  cancelBtn.className = "geBtn";

  if (editorUi.editor.cancelFirst) {
    buttons.appendChild(cancelBtn);
  }

  const applyBtn = mxUtils.button(mxResources.get("apply"), doApply);
  applyBtn.className = "geBtn gePrimaryBtn";
  buttons.appendChild(applyBtn);

  if (!editorUi.editor.cancelFirst) {
    buttons.appendChild(cancelBtn);
  }

  if (color != null) {
    if (color == "none") {
      picker.fromString("ffffff");
      input.value = "none";
    } else {
      picker.fromString(color);
    }
  }

  div.appendChild(buttons);
  this.picker = picker;
  this.colorInput = input;

  // LATER: Only fires if input if focused, should always
  // fire if this dialog is showing.
  mxEvent.addListener(div, "keydown", function (e) {
    if (e.keyCode == 27) {
      editorUi.hideDialog();

      if (cancelFn != null) {
        cancelFn();
      }

      mxEvent.consume(e);
    }
  });

  this.container = div;
}

/**
 * Creates function to apply value
 */
ColorDialog.prototype.presetColors = PRESENT_COLORS;

/**
 * Creates function to apply value
 */
ColorDialog.prototype.defaultColors = ["none", ...DEFAULT_COLORS];

/**
 * Creates function to apply value
 */
ColorDialog.prototype.createApplyFunction = function () {
  return mxUtils.bind(this, function (color) {
    const graph = this.editorUi.editor.graph;

    graph.getModel().beginUpdate();
    try {
      graph.setCellStyles(this.currentColorKey, color);
      this.editorUi.fireEvent(
        new mxEventObject(
          "styleChanged",
          "keys",
          [this.currentColorKey],
          "values",
          [color],
          "cells",
          graph.getSelectionCells()
        )
      );
    } finally {
      graph.getModel().endUpdate();
    }
  });
};

/**
 *
 */
ColorDialog.recentColors = [];

/**
 * Adds recent color for later use.
 */
ColorDialog.addRecentColor = function (color, max) {
  if (color != null) {
    mxUtils.remove(color, ColorDialog.recentColors);
    ColorDialog.recentColors.splice(0, 0, color);

    if (ColorDialog.recentColors.length >= max) {
      ColorDialog.recentColors.pop();
    }
  }
};

/**
 * Adds recent color for later use.
 */
ColorDialog.resetRecentColors = function () {
  ColorDialog.recentColors = [];
};

/**
 *
 */
function OutlineWindow(editorUi, x, y, w, h) {
  const graph = editorUi.editor.graph;

  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.border = "1px solid whiteSmoke";
  div.style.overflow = "hidden";

  this.window = new mxWindow(mxResources.get("outline"), div, x, y, w, h, true, true);
  this.window.minimumSize = new mxRectangle(0, 0, 80, 80);
  this.window.destroyOnClose = false;
  this.window.setMaximizable(false);
  this.window.setResizable(true);
  this.window.setClosable(true);
  this.window.setVisible(true);

  this.window.setLocation = function (x, y) {
    const iw =
      window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
    const ih =
      window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;

    x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
    y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

    if (this.getX() != x || this.getY() != y) {
      mxWindow.prototype.setLocation.apply(this, arguments);
    }
  };

  const resizeListener = mxUtils.bind(this, function () {
    const x = this.window.getX();
    const y = this.window.getY();

    this.window.setLocation(x, y);
  });

  mxEvent.addListener(window, "resize", resizeListener);

  const outline = editorUi.createOutline(this.window);

  this.destroy = function () {
    mxEvent.removeListener(window, "resize", resizeListener);
    this.window.destroy();
    outline.destroy();
  };

  this.window.addListener(
    mxEvent.RESIZE,
    mxUtils.bind(this, function () {
      outline.update(false);
      outline.outline.sizeDidChange();
    })
  );

  this.window.addListener(
    mxEvent.SHOW,
    mxUtils.bind(this, function () {
      this.window.fit();
      outline.suspended = false;
      outline.outline.refresh();
      outline.update();
    })
  );

  this.window.addListener(
    mxEvent.HIDE,
    mxUtils.bind(this, function () {
      outline.suspended = true;
    })
  );

  this.window.addListener(
    mxEvent.NORMALIZE,
    mxUtils.bind(this, function () {
      outline.suspended = false;
      outline.update();
    })
  );

  this.window.addListener(
    mxEvent.MINIMIZE,
    mxUtils.bind(this, function () {
      outline.suspended = true;
    })
  );

  const outlineCreateGraph = outline.createGraph;
  outline.createGraph = function () {
    const g = outlineCreateGraph.apply(this, arguments);
    g.gridEnabled = false;
    g.pageScale = graph.pageScale;
    g.pageFormat = graph.pageFormat;
    g.background =
      graph.background == null || graph.background == mxConstants.NONE
        ? graph.defaultPageBackgroundColor
        : graph.background;
    g.pageVisible = graph.pageVisible;

    const current = mxUtils.getCurrentStyle(graph.container);
    div.style.backgroundColor = current.backgroundColor;

    return g;
  };

  function update() {
    outline.outline.pageScale = graph.pageScale;
    outline.outline.pageFormat = graph.pageFormat;
    outline.outline.pageVisible = graph.pageVisible;
    outline.outline.background =
      graph.background == null || graph.background == mxConstants.NONE
        ? graph.defaultPageBackgroundColor
        : graph.background;

    const current = mxUtils.getCurrentStyle(graph.container);
    div.style.backgroundColor = current.backgroundColor;

    if (
      graph.view.backgroundPageShape != null &&
      outline.outline.view.backgroundPageShape != null
    ) {
      outline.outline.view.backgroundPageShape.fill = graph.view.backgroundPageShape.fill;
    }

    outline.outline.refresh();
  }

  outline.init(div);

  editorUi.editor.addListener("resetGraphView", update);
  editorUi.addListener("pageFormatChanged", update);
  editorUi.addListener("backgroundColorChanged", update);
  editorUi.addListener("backgroundImageChanged", update);
  editorUi.addListener("pageViewChanged", function () {
    update();
    outline.update(true);
  });

  if (outline.outline.dialect == mxConstants.DIALECT_SVG) {
    const zoomInAction = editorUi.actions.get("zoomIn");
    const zoomOutAction = editorUi.actions.get("zoomOut");

    mxEvent.addMouseWheelListener(function (evt, up) {
      let outlineWheel = false;
      let source = mxEvent.getSource(evt);

      while (source != null) {
        if (source == outline.outline.view.canvas.ownerSVGElement) {
          outlineWheel = true;
          break;
        }

        source = source.parentNode;
      }

      if (outlineWheel) {
        if (up) {
          zoomInAction.funct();
        } else {
          zoomOutAction.funct();
        }
      }
    });
  }
}

/**
 *
 */
function LayersWindow(editorUi, x, y, w, h) {
  const graph = editorUi.editor.graph;

  const div = document.createElement("div");
  div.style.userSelect = "none";
  div.style.background = Dialog.backdropColor == "white" ? "whiteSmoke" : Dialog.backdropColor;
  div.style.border = "1px solid whiteSmoke";
  div.style.height = "100%";
  div.style.marginBottom = "10px";
  div.style.overflow = "auto";

  const tbarHeight = !EditorUi.compactUi ? "30px" : "26px";

  const listDiv = document.createElement("div");
  listDiv.style.backgroundColor =
    Dialog.backdropColor == "white" ? "#dcdcdc" : Dialog.backdropColor;
  listDiv.style.position = "absolute";
  listDiv.style.overflow = "auto";
  listDiv.style.left = "0px";
  listDiv.style.right = "0px";
  listDiv.style.top = "0px";
  listDiv.style.bottom = parseInt(tbarHeight) + 7 + "px";
  div.appendChild(listDiv);

  let dragSource = null;
  let dropIndex = null;

  mxEvent.addListener(div, "dragover", function (evt) {
    evt.dataTransfer.dropEffect = "move";
    dropIndex = 0;
    evt.stopPropagation();
    evt.preventDefault();
  });

  // Workaround for "no element found" error in FF
  mxEvent.addListener(div, "drop", function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
  });

  let layerCount = null;
  let selectionLayer = null;
  const ldiv = document.createElement("div");

  ldiv.className = "geToolbarContainer";
  ldiv.style.position = "absolute";
  ldiv.style.bottom = "0px";
  ldiv.style.left = "0px";
  ldiv.style.right = "0px";
  ldiv.style.height = tbarHeight;
  ldiv.style.overflow = "hidden";
  ldiv.style.padding = !EditorUi.compactUi ? "1px" : "4px 0px 3px 0px";
  ldiv.style.backgroundColor =
    Dialog.backdropColor == "white" ? "whiteSmoke" : Dialog.backdropColor;
  ldiv.style.borderWidth = "1px 0px 0px 0px";
  ldiv.style.borderColor = "#c3c3c3";
  ldiv.style.borderStyle = "solid";
  ldiv.style.display = "block";
  ldiv.style.whiteSpace = "nowrap";

  if (mxClient.IS_QUIRKS) {
    ldiv.style.filter = "none";
  }

  const link = document.createElement("a");
  link.className = "geButton";

  if (mxClient.IS_QUIRKS) {
    link.style.filter = "none";
  }

  const removeLink = link.cloneNode();
  removeLink.innerHTML =
    '<div class="geSprite geSprite-delete" style="display:inline-block;"></div>';

  mxEvent.addListener(removeLink, "click", function (evt) {
    if (graph.isEnabled()) {
      graph.model.beginUpdate();
      try {
        const index = graph.model.root.getIndex(selectionLayer);
        graph.removeCells([selectionLayer], false);

        // Creates default layer if no layer exists
        if (graph.model.getChildCount(graph.model.root) == 0) {
          graph.model.add(graph.model.root, new mxCell());
          graph.setDefaultParent(null);
        } else if (index > 0 && index <= graph.model.getChildCount(graph.model.root)) {
          graph.setDefaultParent(graph.model.getChildAt(graph.model.root, index - 1));
        } else {
          graph.setDefaultParent(null);
        }
      } finally {
        graph.model.endUpdate();
      }
    }

    mxEvent.consume(evt);
  });

  if (!graph.isEnabled()) {
    removeLink.className = "geButton mxDisabled";
  }

  ldiv.appendChild(removeLink);

  const insertLink = link.cloneNode();
  insertLink.setAttribute("title", mxUtils.trim(mxResources.get("moveSelectionTo", [""])));
  insertLink.innerHTML =
    '<div class="geSprite geSprite-insert" style="display:inline-block;"></div>';

  mxEvent.addListener(insertLink, "click", function (evt) {
    if (graph.isEnabled() && !graph.isSelectionEmpty()) {
      editorUi.editor.graph.popupMenuHandler.hideMenu();

      const menu = new mxPopupMenu(
        mxUtils.bind(this, function (menu, parent) {
          for (let i = layerCount - 1; i >= 0; i--) {
            mxUtils.bind(this, function (child) {
              const item = menu.addItem(
                graph.convertValueToString(child) || mxResources.get("background"),
                null,
                mxUtils.bind(this, function () {
                  graph.moveCells(graph.getSelectionCells(), 0, 0, false, child);
                }),
                parent
              );

              if (
                graph.getSelectionCount() == 1 &&
                graph.model.isAncestor(child, graph.getSelectionCell())
              ) {
                menu.addCheckmark(item, Editor.checkmarkImage);
              }
            })(graph.model.getChildAt(graph.model.root, i));
          }
        })
      );
      menu.div.className += " geMenubarMenu";
      menu.smartSeparators = true;
      menu.showDisabled = true;
      menu.autoExpand = true;

      // Disables autoexpand and destroys menu when hidden
      menu.hideMenu = mxUtils.bind(this, function () {
        mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
        menu.destroy();
      });

      const offset = mxUtils.getOffset(insertLink);
      menu.popup(offset.x, offset.y + insertLink.offsetHeight, null, evt);

      // Allows hiding by clicking on document
      editorUi.setCurrentMenu(menu);
    }
  });

  ldiv.appendChild(insertLink);

  const dataLink = link.cloneNode();
  dataLink.innerHTML = '<div class="geSprite geSprite-dots" style="display:inline-block;"></div>';
  dataLink.setAttribute("title", mxResources.get("rename"));

  mxEvent.addListener(dataLink, "click", function (evt) {
    if (graph.isEnabled()) {
      editorUi.showDataDialog(selectionLayer);
    }

    mxEvent.consume(evt);
  });

  if (!graph.isEnabled()) {
    dataLink.className = "geButton mxDisabled";
  }

  ldiv.appendChild(dataLink);

  function renameLayer(layer) {
    if (graph.isEnabled() && layer != null) {
      const label = graph.convertValueToString(layer);
      const dlg = new FilenameDialog(
        editorUi,
        label || mxResources.get("background"),
        mxResources.get("rename"),
        mxUtils.bind(this, function (newValue) {
          if (newValue != null) {
            graph.cellLabelChanged(layer, newValue);
          }
        }),
        mxResources.get("enterName")
      );
      editorUi.showDialog(dlg.container, 300, 100, true, true);
      dlg.init();
    }
  }

  const duplicateLink = link.cloneNode();
  duplicateLink.innerHTML =
    '<div class="geSprite geSprite-duplicate" style="display:inline-block;"></div>';

  mxEvent.addListener(duplicateLink, "click", function () {
    if (graph.isEnabled()) {
      let newCell = null;
      graph.model.beginUpdate();
      try {
        newCell = graph.cloneCell(selectionLayer);
        graph.cellLabelChanged(newCell, mxResources.get("untitledLayer"));
        newCell.setVisible(true);
        newCell = graph.addCell(newCell, graph.model.root);
        graph.setDefaultParent(newCell);
      } finally {
        graph.model.endUpdate();
      }

      if (newCell != null && !graph.isCellLocked(newCell)) {
        graph.selectAll(newCell);
      }
    }
  });

  if (!graph.isEnabled()) {
    duplicateLink.className = "geButton mxDisabled";
  }

  ldiv.appendChild(duplicateLink);

  const addLink = link.cloneNode();
  addLink.innerHTML = '<div class="geSprite geSprite-plus" style="display:inline-block;"></div>';
  addLink.setAttribute("title", mxResources.get("addLayer"));

  mxEvent.addListener(addLink, "click", function (evt) {
    if (graph.isEnabled()) {
      graph.model.beginUpdate();

      try {
        const cell = graph.addCell(new mxCell(mxResources.get("untitledLayer")), graph.model.root);
        graph.setDefaultParent(cell);
      } finally {
        graph.model.endUpdate();
      }
    }

    mxEvent.consume(evt);
  });

  if (!graph.isEnabled()) {
    addLink.className = "geButton mxDisabled";
  }

  ldiv.appendChild(addLink);
  div.appendChild(ldiv);

  function refresh() {
    layerCount = graph.model.getChildCount(graph.model.root);
    listDiv.innerHTML = "";

    function addLayer(index, label, child, defaultParent) {
      const ldiv = document.createElement("div");
      ldiv.className = "geToolbarContainer";

      ldiv.style.overflow = "hidden";
      ldiv.style.position = "relative";
      ldiv.style.padding = "4px";
      ldiv.style.height = "22px";
      ldiv.style.display = "block";
      ldiv.style.backgroundColor =
        Dialog.backdropColor == "white" ? "whiteSmoke" : Dialog.backdropColor;
      ldiv.style.borderWidth = "0px 0px 1px 0px";
      ldiv.style.borderColor = "#c3c3c3";
      ldiv.style.borderStyle = "solid";
      ldiv.style.whiteSpace = "nowrap";
      ldiv.setAttribute("title", label);

      const left = document.createElement("div");
      left.style.display = "inline-block";
      left.style.width = "100%";
      left.style.textOverflow = "ellipsis";
      left.style.overflow = "hidden";

      mxEvent.addListener(ldiv, "dragover", function (evt) {
        evt.dataTransfer.dropEffect = "move";
        dropIndex = index;
        evt.stopPropagation();
        evt.preventDefault();
      });

      mxEvent.addListener(ldiv, "dragstart", function (evt) {
        dragSource = ldiv;

        // Workaround for no DnD on DIV in FF
        if (mxClient.IS_FF) {
          // LATER: Check what triggers a parse as XML on this in FF after drop
          evt.dataTransfer.setData("Text", "<layer/>");
        }
      });

      mxEvent.addListener(ldiv, "dragend", function (evt) {
        if (dragSource != null && dropIndex != null) {
          graph.addCell(child, graph.model.root, dropIndex);
        }

        dragSource = null;
        dropIndex = null;
        evt.stopPropagation();
        evt.preventDefault();
      });

      const btn = document.createElement("img");
      btn.setAttribute("draggable", "false");
      btn.setAttribute("align", "top");
      btn.setAttribute("border", "0");
      btn.style.padding = "4px";
      btn.setAttribute("title", mxResources.get("lockUnlock"));

      const style = graph.getCurrentCellStyle(child);

      if (mxUtils.getValue(style, "locked", "0") == "1") {
        btn.setAttribute("src", Dialog.prototype.lockedImage);
      } else {
        btn.setAttribute("src", Dialog.prototype.unlockedImage);
      }

      if (graph.isEnabled()) {
        btn.style.cursor = "pointer";
      }

      mxEvent.addListener(btn, "click", function (evt) {
        if (graph.isEnabled()) {
          let value = null;

          graph.getModel().beginUpdate();
          try {
            value = mxUtils.getValue(style, "locked", "0") == "1" ? null : "1";
            graph.setCellStyles("locked", value, [child]);
          } finally {
            graph.getModel().endUpdate();
          }

          if (value == "1") {
            graph.removeSelectionCells(graph.getModel().getDescendants(child));
          }

          mxEvent.consume(evt);
        }
      });

      left.appendChild(btn);

      const inp = document.createElement("input");
      inp.setAttribute("type", "checkbox");
      inp.setAttribute(
        "title",
        mxResources.get("hideIt", [child.value || mxResources.get("background")])
      );
      inp.style.marginLeft = "4px";
      inp.style.marginRight = "6px";
      inp.style.marginTop = "4px";
      left.appendChild(inp);

      if (graph.model.isVisible(child)) {
        inp.setAttribute("checked", "checked");
        inp.defaultChecked = true;
      }

      mxEvent.addListener(inp, "click", function (evt) {
        graph.model.setVisible(child, !graph.model.isVisible(child));
        mxEvent.consume(evt);
      });

      mxUtils.write(left, label);
      ldiv.appendChild(left);

      if (graph.isEnabled()) {
        // Fallback if no drag and drop is available
        if (
          mxClient.IS_TOUCH ||
          mxClient.IS_POINTER ||
          mxClient.IS_VML ||
          (mxClient.IS_IE && document.documentMode < 10)
        ) {
          const right = document.createElement("div");
          right.style.display = "block";
          right.style.textAlign = "right";
          right.style.whiteSpace = "nowrap";
          right.style.position = "absolute";
          right.style.right = "6px";
          right.style.top = "6px";

          // Poor man's change layer order
          if (index > 0) {
            const img2 = document.createElement("a");

            img2.setAttribute("title", mxResources.get("toBack"));

            img2.className = "geButton";
            img2.style.cssFloat = "none";
            img2.innerHTML = "&#9660;";
            img2.style.width = "14px";
            img2.style.height = "14px";
            img2.style.fontSize = "14px";
            img2.style.margin = "0px";
            img2.style.marginTop = "-1px";
            right.appendChild(img2);

            mxEvent.addListener(img2, "click", function (evt) {
              if (graph.isEnabled()) {
                graph.addCell(child, graph.model.root, index - 1);
              }

              mxEvent.consume(evt);
            });
          }

          if (index >= 0 && index < layerCount - 1) {
            const img1 = document.createElement("a");

            img1.setAttribute("title", mxResources.get("toFront"));

            img1.className = "geButton";
            img1.style.cssFloat = "none";
            img1.innerHTML = "&#9650;";
            img1.style.width = "14px";
            img1.style.height = "14px";
            img1.style.fontSize = "14px";
            img1.style.margin = "0px";
            img1.style.marginTop = "-1px";
            right.appendChild(img1);

            mxEvent.addListener(img1, "click", function (evt) {
              if (graph.isEnabled()) {
                graph.addCell(child, graph.model.root, index + 1);
              }

              mxEvent.consume(evt);
            });
          }

          ldiv.appendChild(right);
        }

        if (!mxClient.IS_IE || document.documentMode >= 10) {
          ldiv.setAttribute("draggable", "true");
          ldiv.style.cursor = "move";
        }
      }

      mxEvent.addListener(ldiv, "dblclick", function (evt) {
        const nodeName = mxEvent.getSource(evt).nodeName;

        if (nodeName != "INPUT" && nodeName != "IMG") {
          renameLayer(child);
          mxEvent.consume(evt);
        }
      });

      if (graph.getDefaultParent() == child) {
        ldiv.style.background = Dialog.backdropColor == "white" ? "#e6eff8" : "#505759";
        ldiv.style.fontWeight = graph.isEnabled() ? "bold" : "";
        selectionLayer = child;
      } else {
        mxEvent.addListener(ldiv, "click", function () {
          if (graph.isEnabled()) {
            graph.setDefaultParent(defaultParent);
            graph.view.setCurrentRoot(null);
            refresh();
          }
        });
      }

      listDiv.appendChild(ldiv);
    }

    // Cannot be moved or deleted
    for (var i = layerCount - 1; i >= 0; i--) {
      mxUtils.bind(this, function (child) {
        addLayer(
          i,
          graph.convertValueToString(child) || mxResources.get("background"),
          child,
          child
        );
      })(graph.model.getChildAt(graph.model.root, i));
    }

    const label = graph.convertValueToString(selectionLayer) || mxResources.get("background");
    removeLink.setAttribute("title", mxResources.get("removeIt", [label]));
    duplicateLink.setAttribute("title", mxResources.get("duplicateIt", [label]));
    dataLink.setAttribute("title", mxResources.get("editData"));

    if (graph.isSelectionEmpty()) {
      insertLink.className = "geButton mxDisabled";
    }
  }

  refresh();
  graph.model.addListener(mxEvent.CHANGE, function () {
    refresh();
  });

  graph.selectionModel.addListener(mxEvent.CHANGE, function () {
    if (graph.isSelectionEmpty()) {
      insertLink.className = "geButton mxDisabled";
    } else {
      insertLink.className = "geButton";
    }
  });

  this.window = new mxWindow(mxResources.get("layers"), div, x, y, w, h, true, true);
  this.window.minimumSize = new mxRectangle(0, 0, 120, 120);
  this.window.destroyOnClose = false;
  this.window.setMaximizable(false);
  this.window.setResizable(true);
  this.window.setClosable(true);
  this.window.setVisible(true);

  this.init = function () {
    listDiv.scrollTop = listDiv.scrollHeight - listDiv.clientHeight;
  };

  this.window.addListener(
    mxEvent.SHOW,
    mxUtils.bind(this, function () {
      this.window.fit();
    })
  );

  // Make refresh available via instance
  this.refreshLayers = refresh;

  this.window.setLocation = function (x, y) {
    const iw =
      window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
    const ih =
      window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;

    x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
    y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

    if (this.getX() != x || this.getY() != y) {
      mxWindow.prototype.setLocation.apply(this, arguments);
    }
  };

  const resizeListener = mxUtils.bind(this, function () {
    const x = this.window.getX();
    const y = this.window.getY();

    this.window.setLocation(x, y);
  });

  mxEvent.addListener(window, "resize", resizeListener);

  this.destroy = function () {
    mxEvent.removeListener(window, "resize", resizeListener);
    this.window.destroy();
  };
}
