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
  mxEdgeHandler,
  mxClipboard,
  mxEventSource,
} from "../../core/mxgraph";

import { Editor, FilenameDialog } from "./Editor";
import { LayersWindow, OutlineWindow } from "./Dialogs";
import { ChangePageSetup } from "./EditorUi";

export { Actions, Action };

/**
 * Copyright (c) 2006-2020, JGraph Ltd
 * Copyright (c) 2006-2020, draw.io AG
 *
 * Constructs the actions object for the given UI.
 */
function Actions(editorUi) {
  this.editorUi = editorUi;
  this.actions = new Object();
  this.init();
}

/**
 * Adds the default actions.
 */
Actions.prototype.init = function () {
  const ui = this.editorUi;
  const editor = ui.editor;
  const graph = editor.graph;
  const isGraphEnabled = function () {
    return Action.prototype.isEnabled.apply(this, arguments) && graph.isEnabled();
  };

  // - File actions

  // Edit actions
  this.addAction(
    "undo",
    function () {
      ui.undo();
    },
    null,
    "sprite-undo",
    Editor.ctrlKey + "+Z"
  );
  this.addAction(
    "redo",
    function () {
      ui.redo();
    },
    null,
    "sprite-redo",
    !mxClient.IS_WIN ? Editor.ctrlKey + "+Shift+Z" : Editor.ctrlKey + "+Y"
  );
  this.addAction(
    "cut",
    function () {
      mxClipboard.cut(graph);
    },
    null,
    "sprite-cut",
    Editor.ctrlKey + "+X"
  );
  this.addAction(
    "copy",
    function () {
      try {
        mxClipboard.copy(graph);
      } catch (e) {
        ui.handleError(e);
      }
    },
    null,
    "sprite-copy",
    Editor.ctrlKey + "+C"
  );
  this.addAction(
    "paste",
    function () {
      if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
        mxClipboard.paste(graph);
      }
    },
    false,
    "sprite-paste",
    Editor.ctrlKey + "+V"
  );
  this.addAction("pasteHere", function () {
    if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
      graph.getModel().beginUpdate();
      try {
        const cells = mxClipboard.paste(graph);

        if (cells != null) {
          let includeEdges = true;

          for (let i = 0; i < cells.length && includeEdges; i++) {
            includeEdges = includeEdges && graph.model.isEdge(cells[i]);
          }

          const t = graph.view.translate;
          const s = graph.view.scale;
          const dx = t.x;
          const dy = t.y;
          let bb = null;

          if (cells.length == 1 && includeEdges) {
            const geo = graph.getCellGeometry(cells[0]);

            if (geo != null) {
              bb = geo.getTerminalPoint(true);
            }
          }

          bb = bb != null ? bb : graph.getBoundingBoxFromGeometry(cells, includeEdges);

          if (bb != null) {
            const x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
            const y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));

            graph.cellsMoved(cells, x - bb.x, y - bb.y);
          }
        }
      } finally {
        graph.getModel().endUpdate();
      }
    }
  });

  this.addAction(
    "copySize",
    function () {
      const cell = graph.getSelectionCell();

      if (graph.isEnabled() && cell != null && graph.getModel().isVertex(cell)) {
        const geo = graph.getCellGeometry(cell);

        if (geo != null) {
          ui.copiedSize = new mxRectangle(geo.x, geo.y, geo.width, geo.height);
        }
      }
    },
    null,
    null,
    "Alt+Shift+X"
  );

  this.addAction(
    "pasteSize",
    function () {
      if (graph.isEnabled() && !graph.isSelectionEmpty() && ui.copiedSize != null) {
        graph.getModel().beginUpdate();

        try {
          const cells = graph.getSelectionCells();

          for (let i = 0; i < cells.length; i++) {
            if (graph.getModel().isVertex(cells[i])) {
              let geo = graph.getCellGeometry(cells[i]);

              if (geo != null) {
                geo = geo.clone();
                geo.width = ui.copiedSize.width;
                geo.height = ui.copiedSize.height;

                graph.getModel().setGeometry(cells[i], geo);
              }
            }
          }
        } finally {
          graph.getModel().endUpdate();
        }
      }
    },
    null,
    null,
    "Alt+Shift+V"
  );

  function deleteCells(includeEdges) {
    // Cancels interactive operations
    graph.escape();
    const select = graph.deleteCells(
      graph.getDeletableCells(graph.getSelectionCells()),
      includeEdges
    );

    if (select != null) {
      graph.setSelectionCells(select);
    }
  }

  this.addAction(
    "delete",
    function (evt) {
      deleteCells(evt != null && mxEvent.isShiftDown(evt));
    },
    null,
    null,
    "Delete"
  );
  this.addAction(
    "deleteAll",
    function () {
      deleteCells(true);
    },
    null,
    null,
    Editor.ctrlKey + "+Delete"
  );
  this.addAction(
    "duplicate",
    function () {
      try {
        graph.setSelectionCells(graph.duplicateCells());
      } catch (e) {
        ui.handleError(e);
      }
    },
    null,
    null,
    Editor.ctrlKey + "+D"
  );
  this.put(
    "turn",
    new Action(
      mxResources.get("turn") + " / " + mxResources.get("reverse"),
      function (evt) {
        graph.turnShapes(graph.getSelectionCells(), evt != null ? mxEvent.isShiftDown(evt) : false);
      },
      null,
      null,
      Editor.ctrlKey + "+R"
    )
  );
  this.addAction(
    "selectVertices",
    function () {
      graph.selectVertices(null, true);
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+I"
  );
  this.addAction(
    "selectEdges",
    function () {
      graph.selectEdges();
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+E"
  );
  this.addAction(
    "selectAll",
    function () {
      graph.selectAll(null, true);
    },
    null,
    null,
    Editor.ctrlKey + "+A"
  );
  this.addAction(
    "selectNone",
    function () {
      graph.clearSelection();
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+A"
  );
  this.addAction(
    "lockUnlock",
    function () {
      if (!graph.isSelectionEmpty()) {
        graph.getModel().beginUpdate();
        try {
          const defaultValue = graph.isCellMovable(graph.getSelectionCell()) ? 1 : 0;
          graph.toggleCellStyles(mxConstants.STYLE_MOVABLE, defaultValue);
          graph.toggleCellStyles(mxConstants.STYLE_RESIZABLE, defaultValue);
          graph.toggleCellStyles(mxConstants.STYLE_ROTATABLE, defaultValue);
          graph.toggleCellStyles(mxConstants.STYLE_DELETABLE, defaultValue);
          graph.toggleCellStyles(mxConstants.STYLE_EDITABLE, defaultValue);
          graph.toggleCellStyles("connectable", defaultValue);
        } finally {
          graph.getModel().endUpdate();
        }
      }
    },
    null,
    null,
    Editor.ctrlKey + "+L"
  );

  // Navigation actions
  this.addAction(
    "home",
    function () {
      graph.home();
    },
    null,
    null,
    "Shift+Home"
  );
  this.addAction(
    "exitGroup",
    function () {
      graph.exitGroup();
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+Home"
  );
  this.addAction(
    "enterGroup",
    function () {
      graph.enterGroup();
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+End"
  );
  this.addAction(
    "collapse",
    function () {
      graph.foldCells(true);
    },
    null,
    null,
    Editor.ctrlKey + "+Home"
  );
  this.addAction(
    "expand",
    function () {
      graph.foldCells(false);
    },
    null,
    null,
    Editor.ctrlKey + "+End"
  );

  // Arrange actions
  this.addAction(
    "toFront",
    function () {
      graph.orderCells(false);
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+F"
  );
  this.addAction(
    "toBack",
    function () {
      graph.orderCells(true);
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+B"
  );
  this.addAction(
    "group",
    function () {
      if (graph.getSelectionCount() == 1) {
        graph.setCellStyles("container", "1");
      } else {
        graph.setSelectionCell(graph.groupCells(null, 0));
      }
    },
    null,
    null,
    Editor.ctrlKey + "+G"
  );
  this.addAction(
    "ungroup",
    function () {
      if (
        graph.getSelectionCount() == 1 &&
        graph.getModel().getChildCount(graph.getSelectionCell()) == 0
      ) {
        graph.setCellStyles("container", "0");
      } else {
        graph.setSelectionCells(graph.ungroupCells());
      }
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+U"
  );
  this.addAction("removeFromGroup", function () {
    graph.removeCellsFromParent();
  });
  // Adds action
  this.addAction(
    "edit",
    function () {
      if (graph.isEnabled()) {
        graph.startEditingAtCell();
      }
    },
    null,
    null,
    "F2/Enter"
  );

  // - Edit Edit Tooltip Action

  // - Insert Image Action
  // - Insert Link Action

  this.addAction(
    "autosize",
    function () {
      const cells = graph.getSelectionCells();

      if (cells != null) {
        graph.getModel().beginUpdate();
        try {
          for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];

            if (graph.getModel().getChildCount(cell)) {
              graph.updateGroupBounds([cell], 20);
            } else {
              const state = graph.view.getState(cell);
              let geo = graph.getCellGeometry(cell);

              if (
                graph.getModel().isVertex(cell) &&
                state != null &&
                state.text != null &&
                geo != null &&
                graph.isWrapping(cell)
              ) {
                geo = geo.clone();
                geo.height = state.text.boundingBox.height / graph.view.scale;
                graph.getModel().setGeometry(cell, geo);
              } else {
                graph.updateCellSize(cell);
              }
            }
          }
        } finally {
          graph.getModel().endUpdate();
        }
      }
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+Y"
  );
  this.addAction("formattedText", function () {
    const refState = graph.getView().getState(graph.getSelectionCell());

    if (refState != null) {
      graph.stopEditing();
      const value = refState.style["html"] == "1" ? null : "1";

      graph.getModel().beginUpdate();
      try {
        const cells = graph.getSelectionCells();

        for (let i = 0; i < cells.length; i++) {
          const state = graph.getView().getState(cells[i]);

          if (state != null) {
            const html = mxUtils.getValue(state.style, "html", "0");

            if (html == "1" && value == null) {
              var label = graph.convertValueToString(state.cell);

              if (mxUtils.getValue(state.style, "nl2Br", "1") != "0") {
                // Removes newlines from HTML and converts breaks to newlines
                // to match the HTML output in plain text
                label = label.replace(/\n/g, "").replace(/<br\s*.?>/g, "\n");
              }

              // Removes HTML tags
              const temp = document.createElement("div");
              temp.innerHTML = graph.sanitizeHtml(label);
              label = mxUtils.extractTextWithWhitespace(temp.childNodes);

              graph.cellLabelChanged(state.cell, label);
              graph.setCellStyles("html", value, [cells[i]]);
            } else if (html == "0" && value == "1") {
              // Converts HTML tags to text
              var label = mxUtils.htmlEntities(graph.convertValueToString(state.cell), false);

              if (mxUtils.getValue(state.style, "nl2Br", "1") != "0") {
                // Converts newlines in plain text to breaks in HTML
                // to match the plain text output
                label = label.replace(/\n/g, "<br/>");
              }

              graph.cellLabelChanged(state.cell, graph.sanitizeHtml(label));
              graph.setCellStyles("html", value, [cells[i]]);
            }
          }
        }

        ui.fireEvent(
          new mxEventObject(
            "styleChanged",
            "keys",
            ["html"],
            "values",
            [value != null ? value : "0"],
            "cells",
            cells
          )
        );
      } finally {
        graph.getModel().endUpdate();
      }
    }
  });
  this.addAction("wordWrap", function () {
    const state = graph.getView().getState(graph.getSelectionCell());
    let value = "wrap";

    graph.stopEditing();

    if (state != null && state.style[mxConstants.STYLE_WHITE_SPACE] == "wrap") {
      value = null;
    }

    graph.setCellStyles(mxConstants.STYLE_WHITE_SPACE, value);
  });
  this.addAction("rotation", function () {
    let value = "0";
    const state = graph.getView().getState(graph.getSelectionCell());

    if (state != null) {
      value = state.style[mxConstants.STYLE_ROTATION] || value;
    }

    const dlg = new FilenameDialog(
      ui,
      value,
      mxResources.get("apply"),
      function (newValue) {
        if (newValue != null && newValue.length > 0) {
          graph.setCellStyles(mxConstants.STYLE_ROTATION, newValue);
        }
      },
      mxResources.get("enterValue") + " (" + mxResources.get("rotation") + " 0-360)"
    );

    ui.showDialog(dlg.container, 375, 80, true, true);
    dlg.init();
  });
  // View actions
  this.addAction(
    "resetView",
    function () {
      graph.zoomTo(1);
      ui.resetScrollbars();
    },
    null,
    null,
    "Home"
  );
  this.addAction(
    "zoomIn",
    function () {
      if (graph.isFastZoomEnabled()) {
        graph.lazyZoom(true, true, ui.buttonZoomDelay);
      } else {
        graph.zoomIn();
      }
    },
    null,
    null,
    Editor.ctrlKey + " + (Numpad) / Alt+Mousewheel"
  );
  this.addAction(
    "zoomOut",
    function () {
      if (graph.isFastZoomEnabled()) {
        graph.lazyZoom(false, true, ui.buttonZoomDelay);
      } else {
        graph.zoomOut();
      }
    },
    null,
    null,
    Editor.ctrlKey + " - (Numpad) / Alt+Mousewheel"
  );
  this.addAction(
    "fitWindow",
    function () {
      const bounds = graph.isSelectionEmpty()
        ? graph.getGraphBounds()
        : graph.getBoundingBox(graph.getSelectionCells());
      const t = graph.view.translate;
      const s = graph.view.scale;
      bounds.width /= s;
      bounds.height /= s;
      bounds.x = bounds.x / s - t.x;
      bounds.y = bounds.y / s - t.y;

      const cw = graph.container.clientWidth - 10;
      const ch = graph.container.clientHeight - 10;
      const scale = Math.floor(20 * Math.min(cw / bounds.width, ch / bounds.height)) / 20;
      graph.zoomTo(scale);

      if (mxUtils.hasScrollbars(graph.container)) {
        graph.container.scrollTop =
          (bounds.y + t.y) * scale - Math.max((ch - bounds.height * scale) / 2 + 5, 0);
        graph.container.scrollLeft =
          (bounds.x + t.x) * scale - Math.max((cw - bounds.width * scale) / 2 + 5, 0);
      }
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+H"
  );
  this.addAction(
    "fitPage",
    mxUtils.bind(this, function () {
      if (!graph.pageVisible) {
        this.get("pageView").funct();
      }

      const fmt = graph.pageFormat;
      const ps = graph.pageScale;
      const cw = graph.container.clientWidth - 10;
      const ch = graph.container.clientHeight - 10;
      const scale = Math.floor(20 * Math.min(cw / fmt.width / ps, ch / fmt.height / ps)) / 20;
      graph.zoomTo(scale);

      if (mxUtils.hasScrollbars(graph.container)) {
        const pad = graph.getPagePadding();
        graph.container.scrollTop = pad.y * graph.view.scale - 1;
        graph.container.scrollLeft =
          Math.min(
            pad.x * graph.view.scale,
            (graph.container.scrollWidth - graph.container.clientWidth) / 2
          ) - 1;
      }
    }),
    null,
    null,
    Editor.ctrlKey + "+J"
  );
  this.addAction(
    "fitTwoPages",
    mxUtils.bind(this, function () {
      if (!graph.pageVisible) {
        this.get("pageView").funct();
      }

      const fmt = graph.pageFormat;
      const ps = graph.pageScale;
      const cw = graph.container.clientWidth - 10;
      const ch = graph.container.clientHeight - 10;

      const scale = Math.floor(20 * Math.min(cw / (2 * fmt.width) / ps, ch / fmt.height / ps)) / 20;
      graph.zoomTo(scale);

      if (mxUtils.hasScrollbars(graph.container)) {
        const pad = graph.getPagePadding();
        graph.container.scrollTop = Math.min(
          pad.y,
          (graph.container.scrollHeight - graph.container.clientHeight) / 2
        );
        graph.container.scrollLeft = Math.min(
          pad.x,
          (graph.container.scrollWidth - graph.container.clientWidth) / 2
        );
      }
    }),
    null,
    null,
    Editor.ctrlKey + "+Shift+J"
  );
  this.addAction(
    "fitPageWidth",
    mxUtils.bind(this, function () {
      if (!graph.pageVisible) {
        this.get("pageView").funct();
      }

      const fmt = graph.pageFormat;
      const ps = graph.pageScale;
      const cw = graph.container.clientWidth - 10;

      const scale = Math.floor((20 * cw) / fmt.width / ps) / 20;
      graph.zoomTo(scale);

      if (mxUtils.hasScrollbars(graph.container)) {
        const pad = graph.getPagePadding();
        graph.container.scrollLeft = Math.min(
          pad.x * graph.view.scale,
          (graph.container.scrollWidth - graph.container.clientWidth) / 2
        );
      }
    })
  );
  this.put(
    "customZoom",
    new Action(
      mxResources.get("custom") + "...",
      mxUtils.bind(this, function () {
        const dlg = new FilenameDialog(
          this.editorUi,
          parseInt(graph.getView().getScale() * 100),
          mxResources.get("apply"),
          mxUtils.bind(this, function (newValue) {
            const val = parseInt(newValue);

            if (!isNaN(val) && val > 0) {
              graph.zoomTo(val / 100);
            }
          }),
          mxResources.get("zoom") + " (%)"
        );
        this.editorUi.showDialog(dlg.container, 300, 80, true, true);
        dlg.init();
      }),
      null,
      null,
      Editor.ctrlKey + "+0"
    )
  );
  this.addAction(
    "pageScale...",
    mxUtils.bind(this, function () {
      const dlg = new FilenameDialog(
        this.editorUi,
        parseInt(graph.pageScale * 100),
        mxResources.get("apply"),
        mxUtils.bind(this, function (newValue) {
          const val = parseInt(newValue);

          if (!isNaN(val) && val > 0) {
            const change = new ChangePageSetup(ui, null, null, null, val / 100);
            change.ignoreColor = true;
            change.ignoreImage = true;

            graph.model.execute(change);
          }
        }),
        mxResources.get("pageScale") + " (%)"
      );
      this.editorUi.showDialog(dlg.container, 300, 80, true, true);
      dlg.init();
    })
  );

  // Option actions
  let action = null;
  action = this.addAction(
    "grid",
    function () {
      graph.setGridEnabled(!graph.isGridEnabled());
      ui.fireEvent(new mxEventObject("gridEnabledChanged"));
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+G"
  );
  action.setToggleAction(true);
  action.setSelectedCallback(function () {
    return graph.isGridEnabled();
  });
  action.setEnabled(false);

  action = this.addAction("guides", function () {
    graph.graphHandler.guidesEnabled = !graph.graphHandler.guidesEnabled;
    ui.fireEvent(new mxEventObject("guidesEnabledChanged"));
  });
  action.setToggleAction(true);
  action.setSelectedCallback(function () {
    return graph.graphHandler.guidesEnabled;
  });
  action.setEnabled(false);

  action = this.addAction("tooltips", function () {
    graph.tooltipHandler.setEnabled(!graph.tooltipHandler.isEnabled());
  });
  action.setToggleAction(true);
  action.setSelectedCallback(function () {
    return graph.tooltipHandler.isEnabled();
  });

  action = this.addAction("collapseExpand", function () {
    const change = new ChangePageSetup(ui);
    change.ignoreColor = true;
    change.ignoreImage = true;
    change.foldingEnabled = !graph.foldingEnabled;

    graph.model.execute(change);
  });
  action.setToggleAction(true);
  action.setSelectedCallback(function () {
    return graph.foldingEnabled;
  });
  action.isEnabled = isGraphEnabled;
  action = this.addAction("scrollbars", function () {
    ui.setScrollbars(!ui.hasScrollbars());
  });
  action.setToggleAction(true);
  action.setSelectedCallback(function () {
    return graph.scrollbars;
  });
  action = this.addAction(
    "pageView",
    mxUtils.bind(this, function () {
      ui.setPageVisible(!graph.pageVisible);
    })
  );
  action.setToggleAction(true);
  action.setSelectedCallback(function () {
    return graph.pageVisible;
  });
  action = this.addAction(
    "connectionArrows",
    function () {
      graph.connectionArrowsEnabled = !graph.connectionArrowsEnabled;
      ui.fireEvent(new mxEventObject("connectionArrowsChanged"));
    },
    null,
    null,
    "Alt+Shift+A"
  );
  action.setToggleAction(true);
  action.setSelectedCallback(function () {
    return graph.connectionArrowsEnabled;
  });
  action = this.addAction(
    "connectionPoints",
    function () {
      graph.setConnectable(!graph.connectionHandler.isEnabled());
      ui.fireEvent(new mxEventObject("connectionPointsChanged"));
    },
    null,
    null,
    "Alt+Shift+P"
  );
  action.setToggleAction(true);
  action.setSelectedCallback(function () {
    return graph.connectionHandler.isEnabled();
  });
  action = this.addAction("copyConnect", function () {
    graph.connectionHandler.setCreateTarget(!graph.connectionHandler.isCreateTarget());
    ui.fireEvent(new mxEventObject("copyConnectChanged"));
  });
  action.setToggleAction(true);
  action.setSelectedCallback(function () {
    return graph.connectionHandler.isCreateTarget();
  });
  action.isEnabled = isGraphEnabled;

  // - AutoSave Action
  // - Help Action
  // - About Action

  // Font style actions
  const toggleFontStyle = mxUtils.bind(this, function (key, style, fn, shortcut) {
    return this.addAction(
      key,
      function () {
        if (fn != null && graph.cellEditor.isContentEditing()) {
          fn();
        } else {
          graph.stopEditing(false);

          graph.getModel().beginUpdate();
          try {
            const cells = graph.getSelectionCells();
            graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, style, cells);

            // Removes bold and italic tags and CSS styles inside labels
            if ((style & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
              graph.updateLabelElements(graph.getSelectionCells(), function (elt) {
                elt.style.fontWeight = null;

                if (elt.nodeName == "B") {
                  graph.replaceElement(elt);
                }
              });
            } else if ((style & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
              graph.updateLabelElements(graph.getSelectionCells(), function (elt) {
                elt.style.fontStyle = null;

                if (elt.nodeName == "I") {
                  graph.replaceElement(elt);
                }
              });
            } else if ((style & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
              graph.updateLabelElements(graph.getSelectionCells(), function (elt) {
                elt.style.textDecoration = null;

                if (elt.nodeName == "U") {
                  graph.replaceElement(elt);
                }
              });
            }

            for (let i = 0; i < cells.length; i++) {
              if (graph.model.getChildCount(cells[i]) == 0) {
                graph.autoSizeCell(cells[i], false);
              }
            }
          } finally {
            graph.getModel().endUpdate();
          }
        }
      },
      null,
      null,
      shortcut
    );
  });

  toggleFontStyle(
    "bold",
    mxConstants.FONT_BOLD,
    function () {
      document.execCommand("bold", false, null);
    },
    Editor.ctrlKey + "+B"
  );
  toggleFontStyle(
    "italic",
    mxConstants.FONT_ITALIC,
    function () {
      document.execCommand("italic", false, null);
    },
    Editor.ctrlKey + "+I"
  );
  toggleFontStyle(
    "underline",
    mxConstants.FONT_UNDERLINE,
    function () {
      document.execCommand("underline", false, null);
    },
    Editor.ctrlKey + "+U"
  );

  // Color actions
  this.addAction("fontColor...", function () {
    ui.menus.pickColor(mxConstants.STYLE_FONTCOLOR, "forecolor", "000000");
  });
  this.addAction("strokeColor...", function () {
    ui.menus.pickColor(mxConstants.STYLE_STROKECOLOR);
  });
  this.addAction("fillColor...", function () {
    ui.menus.pickColor(mxConstants.STYLE_FILLCOLOR);
  });
  this.addAction("gradientColor...", function () {
    ui.menus.pickColor(mxConstants.STYLE_GRADIENTCOLOR);
  });
  this.addAction("backgroundColor...", function () {
    ui.menus.pickColor(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, "backcolor");
  });
  this.addAction("borderColor...", function () {
    ui.menus.pickColor(mxConstants.STYLE_LABEL_BORDERCOLOR);
  });

  // Format actions
  this.addAction("vertical", function () {
    ui.menus.toggleStyle(mxConstants.STYLE_HORIZONTAL, true);
  });
  this.addAction("shadow", function () {
    ui.menus.toggleStyle(mxConstants.STYLE_SHADOW);
  });
  this.addAction("solid", function () {
    graph.getModel().beginUpdate();
    try {
      graph.setCellStyles(mxConstants.STYLE_DASHED, null);
      graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
      ui.fireEvent(
        new mxEventObject(
          "styleChanged",
          "keys",
          [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
          "values",
          [null, null],
          "cells",
          graph.getSelectionCells()
        )
      );
    } finally {
      graph.getModel().endUpdate();
    }
  });
  this.addAction("dashed", function () {
    graph.getModel().beginUpdate();
    try {
      graph.setCellStyles(mxConstants.STYLE_DASHED, "1");
      graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
      ui.fireEvent(
        new mxEventObject(
          "styleChanged",
          "keys",
          [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
          "values",
          ["1", null],
          "cells",
          graph.getSelectionCells()
        )
      );
    } finally {
      graph.getModel().endUpdate();
    }
  });
  this.addAction("dotted", function () {
    graph.getModel().beginUpdate();
    try {
      graph.setCellStyles(mxConstants.STYLE_DASHED, "1");
      graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, "1 4");
      ui.fireEvent(
        new mxEventObject(
          "styleChanged",
          "keys",
          [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
          "values",
          ["1", "1 4"],
          "cells",
          graph.getSelectionCells()
        )
      );
    } finally {
      graph.getModel().endUpdate();
    }
  });
  this.addAction("sharp", function () {
    graph.getModel().beginUpdate();
    try {
      graph.setCellStyles(mxConstants.STYLE_ROUNDED, "0");
      graph.setCellStyles(mxConstants.STYLE_CURVED, "0");
      ui.fireEvent(
        new mxEventObject(
          "styleChanged",
          "keys",
          [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
          "values",
          ["0", "0"],
          "cells",
          graph.getSelectionCells()
        )
      );
    } finally {
      graph.getModel().endUpdate();
    }
  });
  this.addAction("rounded", function () {
    graph.getModel().beginUpdate();
    try {
      graph.setCellStyles(mxConstants.STYLE_ROUNDED, "1");
      graph.setCellStyles(mxConstants.STYLE_CURVED, "0");
      ui.fireEvent(
        new mxEventObject(
          "styleChanged",
          "keys",
          [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
          "values",
          ["1", "0"],
          "cells",
          graph.getSelectionCells()
        )
      );
    } finally {
      graph.getModel().endUpdate();
    }
  });
  this.addAction("toggleRounded", function () {
    if (!graph.isSelectionEmpty() && graph.isEnabled()) {
      graph.getModel().beginUpdate();
      try {
        const cells = graph.getSelectionCells();
        const style = graph.getCurrentCellStyle(cells[0]);
        const value = mxUtils.getValue(style, mxConstants.STYLE_ROUNDED, "0") == "1" ? "0" : "1";

        graph.setCellStyles(mxConstants.STYLE_ROUNDED, value);
        graph.setCellStyles(mxConstants.STYLE_CURVED, null);
        ui.fireEvent(
          new mxEventObject(
            "styleChanged",
            "keys",
            [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
            "values",
            [value, "0"],
            "cells",
            graph.getSelectionCells()
          )
        );
      } finally {
        graph.getModel().endUpdate();
      }
    }
  });
  this.addAction("curved", function () {
    graph.getModel().beginUpdate();
    try {
      graph.setCellStyles(mxConstants.STYLE_ROUNDED, "0");
      graph.setCellStyles(mxConstants.STYLE_CURVED, "1");
      ui.fireEvent(
        new mxEventObject(
          "styleChanged",
          "keys",
          [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
          "values",
          ["0", "1"],
          "cells",
          graph.getSelectionCells()
        )
      );
    } finally {
      graph.getModel().endUpdate();
    }
  });
  this.addAction("collapsible", function () {
    const state = graph.view.getState(graph.getSelectionCell());
    let value = "1";

    if (state != null && graph.getFoldingImage(state) != null) {
      value = "0";
    }

    graph.setCellStyles("collapsible", value);
    ui.fireEvent(
      new mxEventObject(
        "styleChanged",
        "keys",
        ["collapsible"],
        "values",
        [value],
        "cells",
        graph.getSelectionCells()
      )
    );
  });

  // - Edit Style Action

  this.addAction(
    "setAsDefaultStyle",
    function () {
      if (graph.isEnabled() && !graph.isSelectionEmpty()) {
        ui.setDefaultStyle(graph.getSelectionCell());
      }
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+D"
  );
  this.addAction(
    "clearDefaultStyle",
    function () {
      if (graph.isEnabled()) {
        ui.clearDefaultStyle();
      }
    },
    null,
    null,
    Editor.ctrlKey + "+Shift+R"
  );
  this.addAction("addWaypoint", function () {
    const cell = graph.getSelectionCell();

    if (cell != null && graph.getModel().isEdge(cell)) {
      const handler = editor.graph.selectionCellsHandler.getHandler(cell);

      if (handler instanceof mxEdgeHandler) {
        const t = graph.view.translate;
        const s = graph.view.scale;
        let dx = t.x;
        let dy = t.y;

        let parent = graph.getModel().getParent(cell);
        let pgeo = graph.getCellGeometry(parent);

        while (graph.getModel().isVertex(parent) && pgeo != null) {
          dx += pgeo.x;
          dy += pgeo.y;

          parent = graph.getModel().getParent(parent);
          pgeo = graph.getCellGeometry(parent);
        }

        const x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
        const y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));

        handler.addPointAt(handler.state, x, y);
      }
    }
  });
  this.addAction("removeWaypoint", function () {
    // TODO: Action should run with "this" set to action
    const rmWaypointAction = ui.actions.get("removeWaypoint");

    if (rmWaypointAction.handler != null) {
      // NOTE: Popupevent handled and action updated in Menus.createPopupMenu
      rmWaypointAction.handler.removePoint(rmWaypointAction.handler.state, rmWaypointAction.index);
    }
  });
  this.addAction(
    "clearWaypoints",
    function () {
      let cells = graph.getSelectionCells();

      if (cells != null) {
        cells = graph.addAllEdges(cells);

        graph.getModel().beginUpdate();
        try {
          for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];

            if (graph.getModel().isEdge(cell)) {
              let geo = graph.getCellGeometry(cell);

              if (geo != null) {
                geo = geo.clone();
                geo.points = null;
                graph.getModel().setGeometry(cell, geo);
              }
            }
          }
        } finally {
          graph.getModel().endUpdate();
        }
      }
    },
    null,
    null,
    "Alt+Shift+C"
  );
  action = this.addAction(
    "subscript",
    mxUtils.bind(this, function () {
      if (graph.cellEditor.isContentEditing()) {
        document.execCommand("subscript", false, null);
      }
    }),
    null,
    null,
    Editor.ctrlKey + "+,"
  );
  action = this.addAction(
    "superscript",
    mxUtils.bind(this, function () {
      if (graph.cellEditor.isContentEditing()) {
        document.execCommand("superscript", false, null);
      }
    }),
    null,
    null,
    Editor.ctrlKey + "+."
  );
  action = this.addAction(
    "indent",
    mxUtils.bind(this, function () {
      // NOTE: Alt+Tab for outdent implemented via special code in
      // keyHandler.getFunction in EditorUi.js. Ctrl+Tab is reserved.
      if (graph.cellEditor.isContentEditing()) {
        document.execCommand("indent", false, null);
      }
    }),
    null,
    null,
    "Shift+Tab"
  );
  this.addAction("image...", function () {
    if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
      const title = mxResources.get("image") + " (" + mxResources.get("url") + "):";
      const state = graph.getView().getState(graph.getSelectionCell());
      let value = "";

      if (state != null) {
        value = state.style[mxConstants.STYLE_IMAGE] || value;
      }

      const selectionState = graph.cellEditor.saveSelection();

      ui.showImageDialog(
        title,
        value,
        function (newValue, w, h) {
          // Inserts image into HTML text
          if (graph.cellEditor.isContentEditing()) {
            graph.cellEditor.restoreSelection(selectionState);
            graph.insertImage(newValue, w, h);
          } else {
            let cells = graph.getSelectionCells();

            if (newValue != null && (newValue.length > 0 || cells.length > 0)) {
              let select = null;

              graph.getModel().beginUpdate();
              try {
                // Inserts new cell if no cell is selected
                if (cells.length == 0) {
                  const pt = graph.getFreeInsertPoint();
                  cells = [
                    graph.insertVertex(
                      graph.getDefaultParent(),
                      null,
                      "",
                      pt.x,
                      pt.y,
                      w,
                      h,
                      "shape=image;imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;"
                    ),
                  ];
                  select = cells;
                  graph.fireEvent(new mxEventObject("cellsInserted", "cells", select));
                }

                graph.setCellStyles(
                  mxConstants.STYLE_IMAGE,
                  newValue.length > 0 ? newValue : null,
                  cells
                );

                // Sets shape only if not already shape with image (label or image)
                const style = graph.getCurrentCellStyle(cells[0]);

                if (
                  style[mxConstants.STYLE_SHAPE] != "image" &&
                  style[mxConstants.STYLE_SHAPE] != "label"
                ) {
                  graph.setCellStyles(mxConstants.STYLE_SHAPE, "image", cells);
                } else if (newValue.length == 0) {
                  graph.setCellStyles(mxConstants.STYLE_SHAPE, null, cells);
                }

                if (graph.getSelectionCount() == 1) {
                  if (w != null && h != null) {
                    const cell = cells[0];
                    let geo = graph.getModel().getGeometry(cell);

                    if (geo != null) {
                      geo = geo.clone();
                      geo.width = w;
                      geo.height = h;
                      graph.getModel().setGeometry(cell, geo);
                    }
                  }
                }
              } finally {
                graph.getModel().endUpdate();
              }

              if (select != null) {
                graph.setSelectionCells(select);
                graph.scrollCellToVisible(select[0]);
              }
            }
          }
        },
        graph.cellEditor.isContentEditing(),
        !graph.cellEditor.isContentEditing()
      );
    }
  }).isEnabled = isGraphEnabled;
  action = this.addAction(
    "layers",
    mxUtils.bind(this, function () {
      if (this.layersWindow == null) {
        // LATER: Check outline window for initial placement
        this.layersWindow = new LayersWindow(ui, document.body.offsetWidth - 280, 120, 220, 196);
        this.layersWindow.window.addListener("show", function () {
          ui.fireEvent(new mxEventObject("layers"));
        });
        this.layersWindow.window.addListener("hide", function () {
          ui.fireEvent(new mxEventObject("layers"));
        });
        this.layersWindow.window.setVisible(true);
        ui.fireEvent(new mxEventObject("layers"));

        this.layersWindow.init();
      } else {
        this.layersWindow.window.setVisible(!this.layersWindow.window.isVisible());
      }
    }),
    null,
    null,
    Editor.ctrlKey + "+Shift+L"
  );
  action.setToggleAction(true);
  action.setSelectedCallback(
    mxUtils.bind(this, function () {
      return this.layersWindow != null && this.layersWindow.window.isVisible();
    })
  );
  action = this.addAction(
    "formatPanel",
    mxUtils.bind(this, function () {
      ui.toggleFormatPanel();
    }),
    null,
    null,
    Editor.ctrlKey + "+Shift+P"
  );
  action.setToggleAction(true);
  action.setSelectedCallback(
    mxUtils.bind(this, function () {
      return ui.formatWidth > 0;
    })
  );
  action = this.addAction(
    "outline",
    mxUtils.bind(this, function () {
      if (this.outlineWindow == null) {
        // LATER: Check layers window for initial placement
        this.outlineWindow = new OutlineWindow(ui, document.body.offsetWidth - 260, 100, 180, 180);
        this.outlineWindow.window.addListener("show", function () {
          ui.fireEvent(new mxEventObject("outline"));
        });
        this.outlineWindow.window.addListener("hide", function () {
          ui.fireEvent(new mxEventObject("outline"));
        });
        this.outlineWindow.window.setVisible(true);
        ui.fireEvent(new mxEventObject("outline"));
      } else {
        this.outlineWindow.window.setVisible(!this.outlineWindow.window.isVisible());
      }
    }),
    null,
    null,
    Editor.ctrlKey + "+Shift+O"
  );

  action.setToggleAction(true);
  action.setSelectedCallback(
    mxUtils.bind(this, function () {
      return this.outlineWindow != null && this.outlineWindow.window.isVisible();
    })
  );
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.addAction = function (key, funct, enabled, iconCls, shortcut) {
  let title;

  if (key.substring(key.length - 3) == "...") {
    key = key.substring(0, key.length - 3);
    title = mxResources.get(key) + "...";
  } else {
    title = mxResources.get(key);
  }

  return this.put(key, new Action(title, funct, enabled, iconCls, shortcut));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.put = function (name, action) {
  this.actions[name] = action;

  return action;
};

/**
 * Returns the action for the given name or null if no such action exists.
 */
Actions.prototype.get = function (name) {
  return this.actions[name];
};

/**
 * Constructs a new action for the given parameters.
 */
function Action(label, funct, enabled, iconCls, shortcut) {
  mxEventSource.call(this);
  this.label = label;
  this.funct = this.createFunction(funct);
  this.enabled = enabled != null ? enabled : true;
  this.iconCls = iconCls;
  this.shortcut = shortcut;
  this.visible = true;
}

// Action inherits from mxEventSource
mxUtils.extend(Action, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.createFunction = function (funct) {
  return funct;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setEnabled = function (value) {
  if (this.enabled != value) {
    this.enabled = value;
    this.fireEvent(new mxEventObject("stateChanged"));
  }
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isEnabled = function () {
  return this.enabled;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setToggleAction = function (value) {
  this.toggleAction = value;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setSelectedCallback = function (funct) {
  this.selectedCallback = funct;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isSelected = function () {
  return this.selectedCallback();
};
