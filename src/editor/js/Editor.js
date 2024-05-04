/* eslint-disable */
/* eslint-enable no-undef, prettier/prettier, no-unused-vars */

import {
  mxEventSource,
  mxResources,
  mxEventObject,
  mxEvent,
  mxUtils,
  mxClient,
  mxGraph,
  mxCodec,
  mxRectangle,
  mxDivResizer,
  mxPopupMenu,
  mxPoint,
  mxConstants,
  mxGraphView,
  mxMouseEvent,
  mxPolyline,
  mxGraphHandler,
  mxConnectionHandler,
  mxCellMarker,
  mxRectangleShape,
  mxPopupMenuHandler,
  mxUndoManager,
} from "../../core/mxgraph";

import { ChangePageSetup } from "./EditorUi";
import { Graph } from "./Graph";
import {
  noColorImage,
  moveImage,
  rowMoveImage,
  helpImage,
  checkmarkImage,
  closeImage,
  clearImage,
  lockedImage,
  unlockedImage,
  transparentImage,
} from "../images/base64";
export { Editor, ErrorDialog, Dialog, FilenameDialog, PageSetupDialog };

/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Editor constructor executed on page load.
 */
function Editor(chromeless, themes, model, graph, editable) {
  mxEventSource.call(this);
  this.chromeless = chromeless != null ? chromeless : this.chromeless;
  this.initStencilRegistry();
  this.graph = graph || this.createGraph(themes, model);
  this.editable = editable != null ? editable : !chromeless;
  this.undoManager = this.createUndoManager();
  this.status = "";

  this.getOrCreateFilename = function () {
    return this.filename || mxResources.get("drawing", [Editor.pageCounter]) + ".xml";
  };

  this.getFilename = function () {
    return this.filename;
  };

  // Sets the status and fires a statusChanged event
  this.setStatus = value => {
    // + Bind Editor(this)
    this.status = value;
    this.fireEvent(new mxEventObject("statusChanged"));
  };

  // Returns the current status
  this.getStatus = function () {
    return this.status;
  };

  // Updates modified state if graph changes
  this.graphChangeListener = function (sender, eventObject) {
    const edit = eventObject != null ? eventObject.getProperty("edit") : null;

    if (edit == null || !edit.ignoreEdit) {
      this.setModified(true);
    }
  };

  this.graph.getModel().addListener(
    mxEvent.CHANGE,
    mxUtils.bind(this, function () {
      this.graphChangeListener.apply(this, arguments);
    })
  );

  // Sets persistent graph state defaults
  this.graph.resetViewOnRootChange = false;
  this.init();
}

/**
 * Counts open editor tabs (must be global for cross-window access)
 */
Editor.pageCounter = 0;

// Cross-domain window access is not allowed in FF, so if we
// were opened from another domain then this will fail.
(function () {
  try {
    let op = window;

    while (
      op.opener != null &&
      typeof op.opener.Editor !== "undefined" &&
      !isNaN(op.opener.Editor.pageCounter) &&
      // Workaround for possible infinite loop in FF https://drawio.atlassian.net/browse/DS-795
      op.opener != op
    ) {
      op = op.opener;
    }

    // Increments the counter in the first opener in the chain
    if (op != null) {
      op.Editor.pageCounter++;
      Editor.pageCounter = op.Editor.pageCounter;
    }
  } catch (e) {
    // ignore
  }
})();

/**
 * Specifies if local storage should be used (eg. on the iPad which has no filesystem)
 */
Editor.useLocalStorage = typeof Storage != "undefined" && mxClient.IS_IOS;

/**
 *
 */
Editor.moveImage = moveImage;

/**
 *
 */
Editor.rowMoveImage = rowMoveImage;

/**
 * Images below are for lightbox and embedding toolbars.
 */
Editor.helpImage = helpImage;

/**
 * Sets the default font size.
 */
Editor.checkmarkImage = checkmarkImage;

/**
 * Specifies the image URL to be used for the transparent background.
 */
Editor.ctrlKey = mxClient.IS_MAC ? "Cmd" : "Ctrl";

/**
 * Specifies the image URL to be used for the transparent background.
 */
Editor.hintOffset = 20;

/**
 * Specifies if the diagram should be saved automatically if possible. Default
 * is true.
 */
Editor.popupsAllowed = true;

/**
 * Editor inherits from mxEventSource
 */
mxUtils.extend(Editor, mxEventSource);

/**
 * Stores initial state of mxClient.NO_FO.
 */
Editor.prototype.originalNoForeignObject = mxClient.NO_FO;

/**
 * Specifies the image URL to be used for the transparent background.
 */
Editor.prototype.transparentImage = transparentImage;

/**
 * Specifies if the canvas should be extended in all directions. Default is true.
 */
Editor.prototype.extendCanvas = true;

/**
 * Specifies if the app should run in chromeless mode. Default is false.
 * This default is only used if the contructor argument is null.
 */
Editor.prototype.chromeless = false;

/**
 * Specifies the order of OK/Cancel buttons in dialogs. Default is true.
 * Cancel first is used on Macs, Windows/Confluence uses cancel last.
 */
Editor.prototype.cancelFirst = true;

/**
 * Specifies if the editor is enabled. Default is true.
 */
Editor.prototype.enabled = true;

/**
 * Contains the name which was used for the last save. Default value is null.
 */
Editor.prototype.filename = null;

/**
 * Contains the current modified state of the diagram. This is false for
 * new diagrams and after the diagram was saved.
 */
Editor.prototype.modified = false;

/**
 * Specifies if the diagram should be saved automatically if possible. Default
 * is true.
 */
Editor.prototype.autosave = false;

/**
 * Specifies the top spacing for the initial page view. Default is 0.
 */
Editor.prototype.initialTopSpacing = 0;

/**
 * Specifies the app name. Default is document.title.
 */
Editor.prototype.appName = document.title;

/**
 *
 */
Editor.prototype.editBlankUrl = window.location.protocol + "//" + window.location.host + "/";

/**
 * Default value for the graph container overflow style.
 */
Editor.prototype.defaultGraphOverflow = "hidden";

/**
 * Initializes the environment.
 */
Editor.prototype.init = function () {};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.isChromelessView = function () {
  return this.chromeless;
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.setAutosave = function (value) {
  this.autosave = value;
};

/**
 *
 */
Editor.prototype.getEditBlankUrl = function (params) {
  return this.editBlankUrl + params;
};

/**
 *
 */
Editor.prototype.editAsNew = function (xml, title) {
  let p = title != null ? "?title=" + encodeURIComponent(title) : "";

  if (
    typeof window.postMessage !== "undefined" &&
    (document.documentMode == null || document.documentMode >= 10)
  ) {
    let wnd = null;

    var l = mxUtils.bind(this, function (evt) {
      if (evt.data == "ready" && evt.source == wnd) {
        mxEvent.removeListener(window, "message", l);
        wnd.postMessage(xml, "*");
      }
    });

    mxEvent.addListener(window, "message", l);
    wnd = this.graph.openLink(
      this.getEditBlankUrl(p + (p.length > 0 ? "&" : "?") + "client=1"),
      null,
      true
    );
  } else {
    this.graph.openLink(this.getEditBlankUrl(p) + "#R" + encodeURIComponent(xml));
  }
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.createGraph = function (themes, model) {
  const graph = new Graph(null, model, null, null, themes);
  graph.transparentBackground = false;

  // Opens all links in a new window while editing
  if (!this.chromeless) {
    graph.isBlankLink = function (href) {
      return !this.isExternalProtocol(href);
    };
  }

  return graph;
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.resetGraph = function () {
  this.graph.gridEnabled = !this.isChromelessView();
  this.graph.graphHandler.guidesEnabled = true;
  this.graph.setTooltips(true);
  this.graph.setConnectable(true);
  this.graph.foldingEnabled = true;
  this.graph.scrollbars = this.graph.defaultScrollbars;
  this.graph.pageVisible = this.graph.defaultPageVisible;
  this.graph.pageBreaksVisible = this.graph.pageVisible;
  this.graph.preferPageSize = this.graph.pageBreaksVisible;
  this.graph.background = null;
  this.graph.pageScale = mxGraph.prototype.pageScale;
  this.graph.pageFormat = mxGraph.prototype.pageFormat;
  this.graph.currentScale = 1;
  this.graph.currentTranslate.x = 0;
  this.graph.currentTranslate.y = 0;
  this.updateGraphComponents();
  this.graph.view.setScale(1);
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.readGraphState = function (node) {
  this.graph.gridEnabled = node.getAttribute("grid") != "0" && !this.isChromelessView();
  this.graph.gridSize = parseFloat(node.getAttribute("gridSize")) || mxGraph.prototype.gridSize;
  this.graph.graphHandler.guidesEnabled = node.getAttribute("guides") != "0";
  this.graph.setTooltips(node.getAttribute("tooltips") != "0");
  this.graph.setConnectable(node.getAttribute("connect") != "0");
  this.graph.connectionArrowsEnabled = node.getAttribute("arrows") != "0";
  this.graph.foldingEnabled = node.getAttribute("fold") != "0";

  if (this.isChromelessView() && this.graph.foldingEnabled) {
    this.graph.foldingEnabled = false;
    this.graph.cellRenderer.forceControlClickHandler = this.graph.foldingEnabled;
  }

  const ps = parseFloat(node.getAttribute("pageScale"));

  if (!isNaN(ps) && ps > 0) {
    this.graph.pageScale = ps;
  } else {
    this.graph.pageScale = mxGraph.prototype.pageScale;
  }

  if (!this.graph.isLightboxView() && !this.graph.isViewer()) {
    const pv = node.getAttribute("page");

    if (pv != null) {
      this.graph.pageVisible = pv != "0";
    } else {
      this.graph.pageVisible = this.graph.defaultPageVisible;
    }
  } else {
    this.graph.pageVisible = false;
  }

  this.graph.pageBreaksVisible = this.graph.pageVisible;
  this.graph.preferPageSize = this.graph.pageBreaksVisible;

  const pw = parseFloat(node.getAttribute("pageWidth"));
  const ph = parseFloat(node.getAttribute("pageHeight"));

  if (!isNaN(pw) && !isNaN(ph)) {
    this.graph.pageFormat = new mxRectangle(0, 0, pw, ph);
  }

  // Loads the persistent state settings
  const bg = node.getAttribute("background");

  if (bg != null && bg.length > 0) {
    this.graph.background = bg;
  } else {
    this.graph.background = null;
  }
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.setGraphXml = function (node) {
  if (node != null) {
    const dec = new mxCodec(node.ownerDocument);

    if (node.nodeName == "mxGraphModel") {
      this.graph.model.beginUpdate();

      try {
        this.graph.model.clear();
        this.graph.view.scale = 1;
        this.readGraphState(node);
        this.updateGraphComponents();
        dec.decode(node, this.graph.getModel());
      } finally {
        this.graph.model.endUpdate();
      }

      this.fireEvent(new mxEventObject("resetGraphView"));
    } else if (node.nodeName == "root") {
      this.resetGraph();

      // Workaround for invalid XML output in Firefox 20 due to bug in mxUtils.getXml
      const wrapper = dec.document.createElement("mxGraphModel");
      wrapper.appendChild(node);

      dec.decode(wrapper, this.graph.getModel());
      this.updateGraphComponents();
      this.fireEvent(new mxEventObject("resetGraphView"));
    } else {
      throw {
        message: mxResources.get("cannotOpenFile"),
        node: node,
        toString: function () {
          return this.message;
        },
      };
    }
  } else {
    this.resetGraph();
    this.graph.model.clear();
    this.fireEvent(new mxEventObject("resetGraphView"));
  }
};

/**
 * Returns the XML node that represents the current diagram.
 */
Editor.prototype.getGraphXml = function (ignoreSelection) {
  ignoreSelection = ignoreSelection != null ? ignoreSelection : true;
  let node = null;

  if (ignoreSelection) {
    const enc = new mxCodec(mxUtils.createXmlDocument());
    node = enc.encode(this.graph.getModel());
  } else {
    node = this.graph.encodeCells(
      mxUtils.sortCells(this.graph.model.getTopmostCells(this.graph.getSelectionCells()))
    );
  }

  if (this.graph.view.translate.x != 0 || this.graph.view.translate.y != 0) {
    node.setAttribute("dx", Math.round(this.graph.view.translate.x * 100) / 100);
    node.setAttribute("dy", Math.round(this.graph.view.translate.y * 100) / 100);
  }

  node.setAttribute("grid", this.graph.isGridEnabled() ? "1" : "0");
  node.setAttribute("gridSize", this.graph.gridSize);
  node.setAttribute("guides", this.graph.graphHandler.guidesEnabled ? "1" : "0");
  node.setAttribute("tooltips", this.graph.tooltipHandler.isEnabled() ? "1" : "0");
  node.setAttribute("connect", this.graph.connectionHandler.isEnabled() ? "1" : "0");
  node.setAttribute("arrows", this.graph.connectionArrowsEnabled ? "1" : "0");
  node.setAttribute("fold", this.graph.foldingEnabled ? "1" : "0");
  node.setAttribute("page", this.graph.pageVisible ? "1" : "0");
  node.setAttribute("pageScale", this.graph.pageScale);
  node.setAttribute("pageWidth", this.graph.pageFormat.width);
  node.setAttribute("pageHeight", this.graph.pageFormat.height);

  if (this.graph.background != null) {
    node.setAttribute("background", this.graph.background);
  }

  return node;
};

/**
 * Keeps the graph container in sync with the persistent graph state
 */
Editor.prototype.updateGraphComponents = function () {
  const graph = this.graph;

  if (graph.container != null) {
    graph.view.validateBackground();
    graph.container.style.overflow = graph.scrollbars ? "auto" : this.defaultGraphOverflow;

    this.fireEvent(new mxEventObject("updateGraphComponents"));
  }
};

/**
 * Sets the modified flag.
 */
Editor.prototype.setModified = function (value) {
  this.modified = value;
};

/**
 * Sets the filename.
 */
Editor.prototype.setFilename = function (value) {
  this.filename = value;
};

/**
 * Creates and returns a new undo manager.
 */
Editor.prototype.createUndoManager = function () {
  const graph = this.graph;
  const undoMgr = new mxUndoManager();

  this.undoListener = function (sender, evt) {
    undoMgr.undoableEditHappened(evt.getProperty("edit"));
  };

  // Installs the command history
  const listener = mxUtils.bind(this, function () {
    this.undoListener.apply(this, arguments);
  });

  graph.getModel().addListener(mxEvent.UNDO, listener);
  graph.getView().addListener(mxEvent.UNDO, listener);

  // Keeps the selection in sync with the history
  const undoHandler = function (sender, evt) {
    const cand = graph.getSelectionCellsForChanges(
      evt.getProperty("edit").changes,
      function (change) {
        // Only selects changes to the cell hierarchy
        return !(change.constructor.name === "mxChildChange");
      }
    );

    if (cand.length > 0) {
      const cells = [];

      for (let i = 0; i < cand.length; i++) {
        if (graph.view.getState(cand[i]) != null) {
          cells.push(cand[i]);
        }
      }

      graph.setSelectionCells(cells);
    }
  };

  undoMgr.addListener(mxEvent.UNDO, undoHandler);
  undoMgr.addListener(mxEvent.REDO, undoHandler);

  return undoMgr;
};

/**
 * Adds basic stencil set (no namespace).
 */
Editor.prototype.initStencilRegistry = function () {};

/**
 * Creates and returns a new undo manager.
 */
Editor.prototype.destroy = function () {
  if (this.graph != null) {
    this.graph.destroy();
    this.graph = null;
  }
};

/**
 * Basic dialogs that are available in the viewer (print dialog).
 */
function Dialog(
  editorUi,
  elt,
  w,
  h,
  modal,
  closable,
  onClose,
  noScroll,
  transparent,
  onResize,
  ignoreBgClick
) {
  let dx = 0;

  if (mxClient.IS_VML && (document.documentMode == null || document.documentMode < 8)) {
    // Adds padding as a workaround for box model in older IE versions
    // This needs to match the total padding of geDialog in CSS
    dx = 80;
  }

  w += dx;
  h += dx;

  let w0 = w;
  let h0 = h;

  const ds = mxUtils.getDocumentSize();

  // Workaround for print dialog offset in viewer lightbox
  if (window.innerHeight != null) {
    ds.height = window.innerHeight;
  }

  let dh = ds.height;
  let left = Math.max(1, Math.round((ds.width - w - 64) / 2));
  let top = Math.max(1, Math.round((dh - h - editorUi.footerHeight) / 3));

  // Keeps window size inside available space
  if (!mxClient.IS_QUIRKS) {
    elt.style.maxHeight = "100%";
  }

  w = document.body != null ? Math.min(w, document.body.scrollWidth - 64) : w;
  h = Math.min(h, dh - 64);

  // Increments zIndex to put subdialogs and background over existing dialogs and background
  if (editorUi.dialogs.length > 0) {
    this.zIndex += editorUi.dialogs.length * 2;
  }

  if (this.bg == null) {
    this.bg = editorUi.createDiv("background");
    this.bg.style.position = "absolute";
    this.bg.style.background = Dialog.backdropColor;
    this.bg.style.height = dh + "px";
    this.bg.style.right = "0px";
    this.bg.style.zIndex = this.zIndex - 2;

    mxUtils.setOpacity(this.bg, this.bgOpacity);

    if (mxClient.IS_QUIRKS) {
      new mxDivResizer(this.bg);
    }
  }

  const origin = mxUtils.getDocumentScrollOrigin(document);
  this.bg.style.left = origin.x + "px";
  this.bg.style.top = origin.y + "px";
  left += origin.x;
  top += origin.y;

  if (modal) {
    document.body.appendChild(this.bg);
  }

  const div = editorUi.createDiv(transparent ? "geTransDialog" : "geDialog");
  const pos = this.getPosition(left, top, w, h);
  left = pos.x;
  top = pos.y;

  div.style.width = w + "px";
  div.style.height = h + "px";
  div.style.left = left + "px";
  div.style.top = top + "px";
  div.style.zIndex = this.zIndex;

  div.appendChild(elt);
  document.body.appendChild(div);

  // Adds vertical scrollbars if needed
  if (!noScroll && elt.clientHeight > div.clientHeight - 64) {
    elt.style.overflowY = "auto";
  }

  if (closable) {
    const img = document.createElement("img");

    img.setAttribute("src", Dialog.prototype.closeImage);
    img.setAttribute("title", mxResources.get("close"));
    img.className = "geDialogClose";
    img.style.top = top + 14 + "px";
    img.style.left = left + w + 38 - dx + "px";
    img.style.zIndex = this.zIndex;

    mxEvent.addListener(
      img,
      "click",
      mxUtils.bind(this, function () {
        editorUi.hideDialog(true);
      })
    );

    document.body.appendChild(img);
    this.dialogImg = img;

    if (!ignoreBgClick) {
      let mouseDownSeen = false;

      mxEvent.addGestureListeners(
        this.bg,
        mxUtils.bind(this, function () {
          mouseDownSeen = true;
        }),
        null,
        mxUtils.bind(this, function () {
          if (mouseDownSeen) {
            editorUi.hideDialog(true);
            mouseDownSeen = false;
          }
        })
      );
    }
  }

  this.resizeListener = mxUtils.bind(this, function () {
    if (onResize != null) {
      const newWH = onResize();

      if (newWH != null) {
        w0 = w = newWH.w;
        h0 = h = newWH.h;
      }
    }

    const ds = mxUtils.getDocumentSize();
    dh = ds.height;
    this.bg.style.height = dh + "px";

    left = Math.max(1, Math.round((ds.width - w - 64) / 2));
    top = Math.max(1, Math.round((dh - h - editorUi.footerHeight) / 3));
    w = document.body != null ? Math.min(w0, document.body.scrollWidth - 64) : w0;
    h = Math.min(h0, dh - 64);

    const pos = this.getPosition(left, top, w, h);
    left = pos.x;
    top = pos.y;

    div.style.left = left + "px";
    div.style.top = top + "px";
    div.style.width = w + "px";
    div.style.height = h + "px";

    // Adds vertical scrollbars if needed
    if (!noScroll && elt.clientHeight > div.clientHeight - 64) {
      elt.style.overflowY = "auto";
    }

    if (this.dialogImg != null) {
      this.dialogImg.style.top = top + 14 + "px";
      this.dialogImg.style.left = left + w + 38 - dx + "px";
    }
  });

  mxEvent.addListener(window, "resize", this.resizeListener);

  this.onDialogClose = onClose;
  this.container = div;

  editorUi.editor.fireEvent(new mxEventObject("showDialog"));
}

/**
 *
 */
Dialog.backdropColor = "white";

/**
 *
 */
Dialog.prototype.zIndex = mxPopupMenu.prototype.zIndex - 1;

/**
 *
 */
Dialog.prototype.noColorImage = noColorImage;

/**
 *
 */
Dialog.prototype.closeImage = closeImage;

/**
 *
 */
Dialog.prototype.clearImage = clearImage;

/**
 *
 */
Dialog.prototype.lockedImage = lockedImage;

/**
 *
 */
Dialog.prototype.unlockedImage = unlockedImage;

/**
 * Removes the dialog from the DOM.
 */
Dialog.prototype.bgOpacity = 80;

/**
 * Removes the dialog from the DOM.
 */
Dialog.prototype.getPosition = function (left, top) {
  return new mxPoint(left, top);
};

/**
 * Removes the dialog from the DOM.
 */
Dialog.prototype.close = function (cancel, isEsc) {
  if (this.onDialogClose != null) {
    if (this.onDialogClose(cancel, isEsc) == false) {
      return false;
    }

    this.onDialogClose = null;
  }

  if (this.dialogImg != null) {
    this.dialogImg.parentNode.removeChild(this.dialogImg);
    this.dialogImg = null;
  }

  if (this.bg != null && this.bg.parentNode != null) {
    this.bg.parentNode.removeChild(this.bg);
  }

  mxEvent.removeListener(window, "resize", this.resizeListener);
  this.container.parentNode.removeChild(this.container);
};

/**
 *
 */
function ErrorDialog(
  editorUi,
  title,
  message,
  buttonText,
  fn,
  retry,
  buttonText2,
  fn2,
  hide,
  buttonText3,
  fn3
) {
  hide = hide != null ? hide : true;

  const div = document.createElement("div");
  div.style.textAlign = "center";

  if (title != null) {
    const hd = document.createElement("div");
    hd.style.padding = "0px";
    hd.style.margin = "0px";
    hd.style.fontSize = "18px";
    hd.style.paddingBottom = "16px";
    hd.style.marginBottom = "10px";
    hd.style.borderBottom = "1px solid #c0c0c0";
    hd.style.color = "gray";
    hd.style.whiteSpace = "nowrap";
    hd.style.textOverflow = "ellipsis";
    hd.style.overflow = "hidden";
    mxUtils.write(hd, title);
    hd.setAttribute("title", title);
    div.appendChild(hd);
  }

  const p2 = document.createElement("div");
  p2.style.lineHeight = "1.2em";
  p2.style.padding = "6px";
  p2.innerHTML = message;
  div.appendChild(p2);

  const btns = document.createElement("div");
  btns.style.marginTop = "12px";
  btns.style.textAlign = "center";

  if (retry != null) {
    const retryBtn = mxUtils.button(mxResources.get("tryAgain"), function () {
      editorUi.hideDialog();
      retry();
    });
    retryBtn.className = "geBtn";
    btns.appendChild(retryBtn);

    btns.style.textAlign = "center";
  }

  if (buttonText3 != null) {
    const btn3 = mxUtils.button(buttonText3, function () {
      if (fn3 != null) {
        fn3();
      }
    });

    btn3.className = "geBtn";
    btns.appendChild(btn3);
  }

  const btn = mxUtils.button(buttonText, function () {
    if (hide) {
      editorUi.hideDialog();
    }

    if (fn != null) {
      fn();
    }
  });

  btn.className = "geBtn";
  btns.appendChild(btn);

  if (buttonText2 != null) {
    const mainBtn = mxUtils.button(buttonText2, function () {
      if (hide) {
        editorUi.hideDialog();
      }

      if (fn2 != null) {
        fn2();
      }
    });

    mainBtn.className = "geBtn gePrimaryBtn";
    btns.appendChild(mainBtn);
  }

  this.init = function () {
    btn.focus();
  };

  div.appendChild(btns);

  this.container = div;
}

/**
 * Constructs a new page setup dialog.
 */
function PageSetupDialog(editorUi) {
  const graph = editorUi.editor.graph;
  let row, td;

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.height = "100%";
  const tbody = document.createElement("tbody");

  row = document.createElement("tr");

  td = document.createElement("td");
  td.style.verticalAlign = "top";
  td.style.fontSize = "10pt";
  mxUtils.write(td, mxResources.get("paperSize") + ":");

  row.appendChild(td);

  td = document.createElement("td");
  td.style.verticalAlign = "top";
  td.style.fontSize = "10pt";

  const accessor = PageSetupDialog.addPageFormatPanel(td, "pagesetupdialog", graph.pageFormat);

  row.appendChild(td);
  tbody.appendChild(row);

  row = document.createElement("tr");

  td = document.createElement("td");
  mxUtils.write(td, mxResources.get("background") + ":");

  row.appendChild(td);

  td = document.createElement("td");
  td.style.whiteSpace = "nowrap";

  const backgroundInput = document.createElement("input");
  backgroundInput.setAttribute("type", "text");
  const backgroundButton = document.createElement("button");

  backgroundButton.style.width = "18px";
  backgroundButton.style.height = "18px";
  backgroundButton.style.marginRight = "20px";
  backgroundButton.style.backgroundPosition = "center center";
  backgroundButton.style.backgroundRepeat = "no-repeat";

  let newBackgroundColor = graph.background;

  function updateBackgroundColor() {
    if (newBackgroundColor == null || newBackgroundColor == mxConstants.NONE) {
      backgroundButton.style.backgroundColor = "";
      backgroundButton.style.backgroundImage = "url('" + Dialog.prototype.noColorImage + "')";
    } else {
      backgroundButton.style.backgroundColor = newBackgroundColor;
      backgroundButton.style.backgroundImage = "";
    }
  }

  updateBackgroundColor();

  mxEvent.addListener(backgroundButton, "click", function (evt) {
    editorUi.pickColor(newBackgroundColor || "none", function (color) {
      newBackgroundColor = color;
      updateBackgroundColor();
    });
    mxEvent.consume(evt);
  });

  td.appendChild(backgroundButton);

  mxUtils.write(td, mxResources.get("gridSize") + ":");

  const gridSizeInput = document.createElement("input");
  gridSizeInput.setAttribute("type", "number");
  gridSizeInput.setAttribute("min", "0");
  gridSizeInput.style.width = "40px";
  gridSizeInput.style.marginLeft = "6px";

  gridSizeInput.value = graph.getGridSize();
  td.appendChild(gridSizeInput);

  mxEvent.addListener(gridSizeInput, "change", function () {
    const value = parseInt(gridSizeInput.value);
    gridSizeInput.value = Math.max(1, isNaN(value) ? graph.getGridSize() : value);
  });

  row.appendChild(td);
  tbody.appendChild(row);

  row = document.createElement("tr");
  td = document.createElement("td");

  mxUtils.write(td, mxResources.get("image") + ":");

  row.appendChild(td);
  td = document.createElement("td");

  const changeImageLink = document.createElement("a");
  changeImageLink.style.textDecoration = "underline";
  changeImageLink.style.cursor = "pointer";
  changeImageLink.style.color = "#a0a0a0";

  let newBackgroundImage = graph.backgroundImage;

  function updateBackgroundImage() {
    if (newBackgroundImage == null) {
      changeImageLink.removeAttribute("title");
      changeImageLink.style.fontSize = "";
      changeImageLink.innerHTML = mxUtils.htmlEntities(mxResources.get("change")) + "...";
    } else {
      changeImageLink.setAttribute("title", newBackgroundImage.src);
      changeImageLink.style.fontSize = "11px";
      changeImageLink.innerHTML =
        mxUtils.htmlEntities(newBackgroundImage.src.substring(0, 42)) + "...";
    }
  }

  mxEvent.addListener(changeImageLink, "click", function (evt) {
    editorUi.showBackgroundImageDialog(function (image, failed) {
      if (!failed) {
        newBackgroundImage = image;
        updateBackgroundImage();
      }
    }, newBackgroundImage);

    mxEvent.consume(evt);
  });

  updateBackgroundImage();

  td.appendChild(changeImageLink);

  row.appendChild(td);
  tbody.appendChild(row);

  row = document.createElement("tr");
  td = document.createElement("td");
  td.colSpan = 2;
  td.style.paddingTop = "16px";
  td.setAttribute("align", "right");

  const cancelBtn = mxUtils.button(mxResources.get("cancel"), function () {
    editorUi.hideDialog();
  });
  cancelBtn.className = "geBtn";

  if (editorUi.editor.cancelFirst) {
    td.appendChild(cancelBtn);
  }

  const applyBtn = mxUtils.button(mxResources.get("apply"), function () {
    editorUi.hideDialog();
    const gridSize = parseInt(gridSizeInput.value);

    if (!isNaN(gridSize) && graph.gridSize !== gridSize) {
      graph.setGridSize(gridSize);
    }

    const change = new ChangePageSetup(
      editorUi,
      newBackgroundColor,
      newBackgroundImage,
      accessor.get()
    );
    change.ignoreColor = graph.background == newBackgroundColor;

    const oldSrc = graph.backgroundImage != null ? graph.backgroundImage.src : null;
    const newSrc = newBackgroundImage != null ? newBackgroundImage.src : null;

    change.ignoreImage = oldSrc === newSrc;

    if (
      graph.pageFormat.width != change.previousFormat.width ||
      graph.pageFormat.height != change.previousFormat.height ||
      !change.ignoreColor ||
      !change.ignoreImage
    ) {
      graph.model.execute(change);
    }
  });
  applyBtn.className = "geBtn gePrimaryBtn";
  td.appendChild(applyBtn);

  if (!editorUi.editor.cancelFirst) {
    td.appendChild(cancelBtn);
  }

  row.appendChild(td);
  tbody.appendChild(row);

  table.appendChild(tbody);
  this.container = table;
}

/**
 *
 */
PageSetupDialog.addPageFormatPanel = function (div, namePostfix, pageFormat, pageFormatListener) {
  const formatName = "format-" + namePostfix;

  const portraitCheckBox = document.createElement("input");
  portraitCheckBox.setAttribute("name", formatName);
  portraitCheckBox.setAttribute("type", "radio");
  portraitCheckBox.setAttribute("value", "portrait");

  const landscapeCheckBox = document.createElement("input");
  landscapeCheckBox.setAttribute("name", formatName);
  landscapeCheckBox.setAttribute("type", "radio");
  landscapeCheckBox.setAttribute("value", "landscape");

  const paperSizeSelect = document.createElement("select");
  paperSizeSelect.style.marginBottom = "8px";
  paperSizeSelect.style.width = "202px";

  const formatDiv = document.createElement("div");
  formatDiv.style.marginLeft = "4px";
  formatDiv.style.width = "210px";
  formatDiv.style.height = "24px";
  formatDiv.className = "form-options-line";

  portraitCheckBox.style.marginRight = "6px";
  formatDiv.appendChild(portraitCheckBox);

  const portraitSpan = document.createElement("span");
  portraitSpan.style.maxWidth = "100px";
  mxUtils.write(portraitSpan, mxResources.get("portrait"));
  formatDiv.appendChild(portraitSpan);

  landscapeCheckBox.style.marginLeft = "10px";
  landscapeCheckBox.style.marginRight = "6px";
  formatDiv.appendChild(landscapeCheckBox);

  const landscapeSpan = document.createElement("span");
  landscapeSpan.style.width = "100px";
  mxUtils.write(landscapeSpan, mxResources.get("landscape"));
  formatDiv.appendChild(landscapeSpan);

  const customDiv = document.createElement("div");
  customDiv.style.marginLeft = "4px";
  customDiv.style.width = "210px";
  customDiv.style.height = "24px";

  const widthInput = document.createElement("input");
  widthInput.setAttribute("size", "7");
  widthInput.style.textAlign = "right";
  customDiv.appendChild(widthInput);
  mxUtils.write(customDiv, " in x ");

  const heightInput = document.createElement("input");
  heightInput.setAttribute("size", "7");
  heightInput.style.textAlign = "right";
  customDiv.appendChild(heightInput);
  mxUtils.write(customDiv, " in");

  formatDiv.style.display = "none";
  customDiv.style.display = "none";

  const pf = new Object();
  const formats = PageSetupDialog.getFormats();

  for (let i = 0; i < formats.length; i++) {
    const f = formats[i];
    pf[f.key] = f;

    const paperSizeOption = document.createElement("option");
    paperSizeOption.setAttribute("value", f.key);
    mxUtils.write(paperSizeOption, f.title);
    paperSizeSelect.appendChild(paperSizeOption);
  }

  let customSize = false;

  function listener(sender, evt, force) {
    if (force || (widthInput != document.activeElement && heightInput != document.activeElement)) {
      let detected = false;

      for (let i = 0; i < formats.length; i++) {
        const f = formats[i];

        // Special case where custom was chosen
        if (customSize) {
          if (f.key == "custom") {
            paperSizeSelect.value = f.key;
            customSize = false;
          }
        } else if (f.format != null) {
          // Fixes wrong values for previous A4 and A5 page sizes
          if (f.key == "a4") {
            if (pageFormat.width == 826) {
              pageFormat = mxRectangle.fromRectangle(pageFormat);
              pageFormat.width = 827;
            } else if (pageFormat.height == 826) {
              pageFormat = mxRectangle.fromRectangle(pageFormat);
              pageFormat.height = 827;
            }
          } else if (f.key == "a5") {
            if (pageFormat.width == 584) {
              pageFormat = mxRectangle.fromRectangle(pageFormat);
              pageFormat.width = 583;
            } else if (pageFormat.height == 584) {
              pageFormat = mxRectangle.fromRectangle(pageFormat);
              pageFormat.height = 583;
            }
          }

          if (pageFormat.width == f.format.width && pageFormat.height == f.format.height) {
            paperSizeSelect.value = f.key;
            portraitCheckBox.setAttribute("checked", "checked");
            portraitCheckBox.defaultChecked = true;
            portraitCheckBox.checked = true;
            landscapeCheckBox.removeAttribute("checked");
            landscapeCheckBox.defaultChecked = false;
            landscapeCheckBox.checked = false;
            detected = true;
          } else if (pageFormat.width == f.format.height && pageFormat.height == f.format.width) {
            paperSizeSelect.value = f.key;
            portraitCheckBox.removeAttribute("checked");
            portraitCheckBox.defaultChecked = false;
            portraitCheckBox.checked = false;
            landscapeCheckBox.setAttribute("checked", "checked");
            landscapeCheckBox.defaultChecked = true;
            landscapeCheckBox.checked = true;
            detected = true;
          }
        }
      }

      // Selects custom format which is last in list
      if (!detected) {
        widthInput.value = pageFormat.width / 100;
        heightInput.value = pageFormat.height / 100;
        portraitCheckBox.setAttribute("checked", "checked");
        paperSizeSelect.value = "custom";
        formatDiv.style.display = "none";
        customDiv.style.display = "";
      } else {
        formatDiv.style.display = "";
        customDiv.style.display = "none";
      }
    }
  }

  listener();

  div.appendChild(paperSizeSelect);
  mxUtils.br(div);

  div.appendChild(formatDiv);
  div.appendChild(customDiv);

  let currentPageFormat = pageFormat;

  const update = function (evt, selectChanged) {
    const f = pf[paperSizeSelect.value];

    if (f.format != null) {
      widthInput.value = f.format.width / 100;
      heightInput.value = f.format.height / 100;
      customDiv.style.display = "none";
      formatDiv.style.display = "";
    } else {
      formatDiv.style.display = "none";
      customDiv.style.display = "";
    }

    const wi = parseFloat(widthInput.value);

    if (isNaN(wi) || wi <= 0) {
      widthInput.value = pageFormat.width / 100;
    }

    const hi = parseFloat(heightInput.value);

    if (isNaN(hi) || hi <= 0) {
      heightInput.value = pageFormat.height / 100;
    }

    let newPageFormat = new mxRectangle(
      0,
      0,
      Math.floor(parseFloat(widthInput.value) * 100),
      Math.floor(parseFloat(heightInput.value) * 100)
    );

    if (paperSizeSelect.value != "custom" && landscapeCheckBox.checked) {
      newPageFormat = new mxRectangle(0, 0, newPageFormat.height, newPageFormat.width);
    }

    // Initial select of custom should not update page format to avoid update of combo
    if (
      (!selectChanged || !customSize) &&
      (newPageFormat.width != currentPageFormat.width ||
        newPageFormat.height != currentPageFormat.height)
    ) {
      currentPageFormat = newPageFormat;

      // Updates page format and reloads format panel
      if (pageFormatListener != null) {
        pageFormatListener(currentPageFormat);
      }
    }
  };

  mxEvent.addListener(portraitSpan, "click", function (evt) {
    portraitCheckBox.checked = true;
    update(evt);
    mxEvent.consume(evt);
  });

  mxEvent.addListener(landscapeSpan, "click", function (evt) {
    landscapeCheckBox.checked = true;
    update(evt);
    mxEvent.consume(evt);
  });

  mxEvent.addListener(widthInput, "blur", update);
  mxEvent.addListener(widthInput, "click", update);
  mxEvent.addListener(heightInput, "blur", update);
  mxEvent.addListener(heightInput, "click", update);
  mxEvent.addListener(landscapeCheckBox, "change", update);
  mxEvent.addListener(portraitCheckBox, "change", update);
  mxEvent.addListener(paperSizeSelect, "change", function (evt) {
    // Handles special case where custom was chosen
    customSize = paperSizeSelect.value == "custom";
    update(evt, true);
  });

  update();

  return {
    set: function (value) {
      pageFormat = value;
      listener(null, null, true);
    },
    get: function () {
      return currentPageFormat;
    },
    widthInput: widthInput,
    heightInput: heightInput,
  };
};

/**
 *
 */
PageSetupDialog.getFormats = function () {
  return [
    {
      key: "letter",
      title: 'US-Letter (8,5" x 11")',
      format: mxConstants.PAGE_FORMAT_LETTER_PORTRAIT,
    },
    { key: "legal", title: 'US-Legal (8,5" x 14")', format: new mxRectangle(0, 0, 850, 1400) },
    { key: "tabloid", title: 'US-Tabloid (11" x 17")', format: new mxRectangle(0, 0, 1100, 1700) },
    {
      key: "executive",
      title: 'US-Executive (7" x 10")',
      format: new mxRectangle(0, 0, 700, 1000),
    },
    { key: "a0", title: "A0 (841 mm x 1189 mm)", format: new mxRectangle(0, 0, 3300, 4681) },
    { key: "a1", title: "A1 (594 mm x 841 mm)", format: new mxRectangle(0, 0, 2339, 3300) },
    { key: "a2", title: "A2 (420 mm x 594 mm)", format: new mxRectangle(0, 0, 1654, 2336) },
    { key: "a3", title: "A3 (297 mm x 420 mm)", format: new mxRectangle(0, 0, 1169, 1654) },
    { key: "a4", title: "A4 (210 mm x 297 mm)", format: mxConstants.PAGE_FORMAT_A4_PORTRAIT },
    { key: "a5", title: "A5 (148 mm x 210 mm)", format: new mxRectangle(0, 0, 583, 827) },
    { key: "a6", title: "A6 (105 mm x 148 mm)", format: new mxRectangle(0, 0, 413, 583) },
    { key: "a7", title: "A7 (74 mm x 105 mm)", format: new mxRectangle(0, 0, 291, 413) },
    { key: "b4", title: "B4 (250 mm x 353 mm)", format: new mxRectangle(0, 0, 980, 1390) },
    { key: "b5", title: "B5 (176 mm x 250 mm)", format: new mxRectangle(0, 0, 690, 980) },
    { key: "16-9", title: "16:9 (1600 x 900)", format: new mxRectangle(0, 0, 1600, 900) },
    { key: "16-10", title: "16:10 (1920 x 1200)", format: new mxRectangle(0, 0, 1920, 1200) },
    { key: "4-3", title: "4:3 (1600 x 1200)", format: new mxRectangle(0, 0, 1600, 1200) },
    { key: "custom", title: mxResources.get("custom"), format: null },
  ];
};

/**
 * Constructs a new filename dialog.
 */
function FilenameDialog(
  editorUi,
  filename,
  buttonText,
  fn,
  label,
  validateFn,
  content,
  helpLink,
  closeOnBtn,
  cancelFn,
  hints,
  w
) {
  closeOnBtn = closeOnBtn != null ? closeOnBtn : true;
  let row, td;

  const table = document.createElement("table");
  const tbody = document.createElement("tbody");
  table.style.marginTop = "8px";

  row = document.createElement("tr");

  td = document.createElement("td");
  td.style.whiteSpace = "nowrap";
  td.style.fontSize = "10pt";
  td.style.width = hints ? "80px" : "120px";
  mxUtils.write(td, (label || mxResources.get("filename")) + ":");

  row.appendChild(td);

  const nameInput = document.createElement("input");
  nameInput.setAttribute("value", filename || "");
  nameInput.style.marginLeft = "4px";
  nameInput.style.width = w != null ? w + "px" : "180px";

  const genericBtn = mxUtils.button(buttonText, function () {
    if (validateFn == null || validateFn(nameInput.value)) {
      if (closeOnBtn) {
        editorUi.hideDialog();
      }

      fn(nameInput.value);
    }
  });
  genericBtn.className = "geBtn gePrimaryBtn";

  this.init = function () {
    if (label == null && content != null) {
      return;
    }

    nameInput.focus();

    if (mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= 5 || mxClient.IS_QUIRKS) {
      nameInput.select();
    } else {
      document.execCommand("selectAll", false, null);
    }

    // Installs drag and drop handler for links
    if (Graph.fileSupport) {
      // Setup the dnd listeners
      const dlg = table.parentNode;

      if (dlg != null) {
        let dropElt = null;

        mxEvent.addListener(dlg, "dragleave", function (evt) {
          if (dropElt != null) {
            dropElt.style.backgroundColor = "";
            dropElt = null;
          }

          evt.stopPropagation();
          evt.preventDefault();
        });

        mxEvent.addListener(
          dlg,
          "dragover",
          mxUtils.bind(this, function (evt) {
            // IE 10 does not implement pointer-events so it can't have a drop highlight
            if (dropElt == null && (!mxClient.IS_IE || document.documentMode > 10)) {
              dropElt = nameInput;
              dropElt.style.backgroundColor = "#ebf2f9";
            }

            evt.stopPropagation();
            evt.preventDefault();
          })
        );

        mxEvent.addListener(
          dlg,
          "drop",
          mxUtils.bind(this, function (evt) {
            if (dropElt != null) {
              dropElt.style.backgroundColor = "";
              dropElt = null;
            }

            if (mxUtils.indexOf(evt.dataTransfer.types, "text/uri-list") >= 0) {
              nameInput.value = decodeURIComponent(evt.dataTransfer.getData("text/uri-list"));
              genericBtn.click();
            }

            evt.stopPropagation();
            evt.preventDefault();
          })
        );
      }
    }
  };

  td = document.createElement("td");
  td.style.whiteSpace = "nowrap";
  td.appendChild(nameInput);
  row.appendChild(td);

  if (label != null || content == null) {
    tbody.appendChild(row);

    if (hints != null) {
      if (editorUi.editor.diagramFileTypes != null) {
        const typeSelect = FilenameDialog.createFileTypes(
          editorUi,
          nameInput,
          editorUi.editor.diagramFileTypes
        );
        typeSelect.style.marginLeft = "6px";
        typeSelect.style.width = "74px";

        td.appendChild(typeSelect);
        nameInput.style.width = w != null ? w - 40 + "px" : "140px";
      }

      td.appendChild(FilenameDialog.createTypeHint(editorUi, nameInput, hints));
    }
  }

  if (content != null) {
    row = document.createElement("tr");
    td = document.createElement("td");
    td.colSpan = 2;
    td.appendChild(content);
    row.appendChild(td);
    tbody.appendChild(row);
  }

  row = document.createElement("tr");
  td = document.createElement("td");
  td.colSpan = 2;
  td.style.paddingTop = "20px";
  td.style.whiteSpace = "nowrap";
  td.setAttribute("align", "right");

  const cancelBtn = mxUtils.button(mxResources.get("cancel"), function () {
    editorUi.hideDialog();

    if (cancelFn != null) {
      cancelFn();
    }
  });
  cancelBtn.className = "geBtn";

  if (editorUi.editor.cancelFirst) {
    td.appendChild(cancelBtn);
  }

  if (helpLink != null) {
    const helpBtn = mxUtils.button(mxResources.get("help"), function () {
      editorUi.editor.graph.openLink(helpLink);
    });

    helpBtn.className = "geBtn";
    td.appendChild(helpBtn);
  }

  mxEvent.addListener(nameInput, "keypress", function (e) {
    if (e.keyCode == 13) {
      genericBtn.click();
    }
  });

  td.appendChild(genericBtn);

  if (!editorUi.editor.cancelFirst) {
    td.appendChild(cancelBtn);
  }

  row.appendChild(td);
  tbody.appendChild(row);
  table.appendChild(tbody);

  this.container = table;
}

/**
 *
 */
FilenameDialog.filenameHelpLink = null;

/**
 *
 */
FilenameDialog.createTypeHint = function (ui, nameInput, hints) {
  const hint = document.createElement("img");
  hint.style.cssText =
    "vertical-align:top;height:16px;width:16px;margin-left:4px;background-repeat:no-repeat;background-position:center bottom;cursor:pointer;";
  mxUtils.setOpacity(hint, 70);

  const nameChanged = function () {
    hint.setAttribute("src", Editor.helpImage);
    hint.setAttribute("title", mxResources.get("help"));

    for (let i = 0; i < hints.length; i++) {
      if (
        hints[i].ext.length > 0 &&
        nameInput.value.toLowerCase().substring(nameInput.value.length - hints[i].ext.length - 1) ==
          "." + hints[i].ext
      ) {
        hint.setAttribute("src", mxClient.imageBasePath + "/warning.png");
        hint.setAttribute("title", mxResources.get(hints[i].title));
        break;
      }
    }
  };

  mxEvent.addListener(nameInput, "keyup", nameChanged);
  mxEvent.addListener(nameInput, "change", nameChanged);
  mxEvent.addListener(hint, "click", function (evt) {
    const title = hint.getAttribute("title");

    if (hint.getAttribute("src") == Editor.helpImage) {
      ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
    } else if (title != "") {
      ui.showError(
        null,
        title,
        mxResources.get("help"),
        function () {
          ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
        },
        null,
        mxResources.get("ok"),
        null,
        null,
        null,
        340,
        90
      );
    }

    mxEvent.consume(evt);
  });

  nameChanged();

  return hint;
};

/**
 *
 */
FilenameDialog.createFileTypes = function (editorUi, nameInput, types) {
  const typeSelect = document.createElement("select");

  for (let i = 0; i < types.length; i++) {
    const typeOption = document.createElement("option");
    typeOption.setAttribute("value", i);
    mxUtils.write(
      typeOption,
      mxResources.get(types[i].description) + " (." + types[i].extension + ")"
    );
    typeSelect.appendChild(typeOption);
  }

  mxEvent.addListener(typeSelect, "change", function () {
    var ext = types[typeSelect.value].extension;
    const idx = nameInput.value.lastIndexOf(".");

    if (idx > 0) {
      var ext = types[typeSelect.value].extension;
      nameInput.value = nameInput.value.substring(0, idx + 1) + ext;
    } else {
      nameInput.value = nameInput.value + "." + ext;
    }

    if ("createEvent" in document) {
      const changeEvent = document.createEvent("HTMLEvents");
      changeEvent.initEvent("change", false, true);
      nameInput.dispatchEvent(changeEvent);
    } else {
      nameInput.fireEvent("onchange");
    }
  });

  const nameInputChanged = function () {
    const idx = nameInput.value.lastIndexOf(".");
    let active = 0;

    // Finds current extension
    if (idx > 0) {
      const ext = nameInput.value.toLowerCase().substring(idx + 1);

      for (let i = 0; i < types.length; i++) {
        if (ext == types[i].extension) {
          active = i;
          break;
        }
      }
    }

    typeSelect.value = active;
  };

  mxEvent.addListener(nameInput, "change", nameInputChanged);
  mxEvent.addListener(nameInput, "keyup", nameInputChanged);
  nameInputChanged();

  return typeSelect;
};

/**
 * Static overrides
 */
(function () {
  // Uses HTML for background pages (to support grid background image)
  mxGraphView.prototype.validateBackgroundPage = function () {
    const graph = this.graph;

    if (graph.container != null && !graph.transparentBackground) {
      if (graph.pageVisible) {
        const bounds = this.getBackgroundPageBounds();

        if (this.backgroundPageShape == null) {
          // Finds first element in graph container
          let firstChild = graph.container.firstChild;

          while (firstChild != null && firstChild.nodeType != mxConstants.NODETYPE_ELEMENT) {
            firstChild = firstChild.nextSibling;
          }

          if (firstChild != null) {
            this.backgroundPageShape = this.createBackgroundPageShape(bounds);
            this.backgroundPageShape.scale = 1;

            // Shadow filter causes problems in outline window in quirks mode. IE8 standards
            // also has known rendering issues inside mxWindow but not using shadow is worse.
            this.backgroundPageShape.isShadow = !mxClient.IS_QUIRKS;
            this.backgroundPageShape.dialect = mxConstants.DIALECT_STRICTHTML;
            this.backgroundPageShape.init(graph.container);

            // Required for the browser to render the background page in correct order
            firstChild.style.position = "absolute";
            graph.container.insertBefore(this.backgroundPageShape.node, firstChild);
            this.backgroundPageShape.redraw();

            this.backgroundPageShape.node.className = "geBackgroundPage";

            // Adds listener for double click handling on background
            mxEvent.addListener(
              this.backgroundPageShape.node,
              "dblclick",
              mxUtils.bind(this, function (evt) {
                graph.dblClick(evt);
              })
            );

            // Adds basic listeners for graph event dispatching outside of the
            // container and finishing the handling of a single gesture
            mxEvent.addGestureListeners(
              this.backgroundPageShape.node,
              mxUtils.bind(this, function (evt) {
                graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
              }),
              mxUtils.bind(this, function (evt) {
                // Hides the tooltip if mouse is outside container
                if (graph.tooltipHandler != null && graph.tooltipHandler.isHideOnHover()) {
                  graph.tooltipHandler.hide();
                }

                if (graph.isMouseDown && !mxEvent.isConsumed(evt)) {
                  graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
                }
              }),
              mxUtils.bind(this, function (evt) {
                graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
              })
            );
          }
        } else {
          this.backgroundPageShape.scale = 1;
          this.backgroundPageShape.bounds = bounds;
          this.backgroundPageShape.redraw();
        }
      } else if (this.backgroundPageShape != null) {
        this.backgroundPageShape.destroy();
        this.backgroundPageShape = null;
      }

      this.validateBackgroundStyles();
    }
  };

  // Updates the CSS of the background to draw the grid
  mxGraphView.prototype.validateBackgroundStyles = function () {
    const graph = this.graph;
    const color =
      graph.background == null || graph.background == mxConstants.NONE
        ? graph.defaultPageBackgroundColor
        : graph.background;
    const gridColor =
      color != null && this.gridColor != color.toLowerCase() ? this.gridColor : "#ffffff";
    let image = "none";
    let position = "";

    if (graph.isGridEnabled()) {
      let phase = 10;

      // Generates the SVG required for drawing the dynamic grid
      image = unescape(encodeURIComponent(this.createSvgGrid(gridColor)));
      image = btoa(image);
      image = "url(" + "data:image/svg+xml;base64," + image + ")";
      phase = graph.gridSize * this.scale * this.gridSteps;

      let x0 = 0;
      let y0 = 0;

      if (graph.view.backgroundPageShape != null) {
        const bds = this.getBackgroundPageBounds();

        x0 = 1 + bds.x;
        y0 = 1 + bds.y;
      }

      // Computes the offset to maintain origin for grid
      position =
        -Math.round(phase - mxUtils.mod(this.translate.x * this.scale - x0, phase)) +
        "px " +
        -Math.round(phase - mxUtils.mod(this.translate.y * this.scale - y0, phase)) +
        "px";
    }

    let canvas = graph.view.canvas;

    if (canvas.ownerSVGElement != null) {
      canvas = canvas.ownerSVGElement;
    }

    if (graph.view.backgroundPageShape != null) {
      graph.view.backgroundPageShape.node.style.backgroundPosition = position;
      graph.view.backgroundPageShape.node.style.backgroundImage = image;
      graph.view.backgroundPageShape.node.style.backgroundColor = color;
      graph.container.className = "geDiagramContainer geDiagramBackdrop";
      canvas.style.backgroundImage = "none";
      canvas.style.backgroundColor = "";
    } else {
      graph.container.className = "geDiagramContainer";
      canvas.style.backgroundPosition = position;
      canvas.style.backgroundColor = color;
      canvas.style.backgroundImage = image;
    }
  };

  // Returns the SVG required for painting the background grid.
  mxGraphView.prototype.createSvgGrid = function (color) {
    let tmp = this.graph.gridSize * this.scale;

    while (tmp < this.minGridSize) {
      tmp *= 2;
    }

    const tmp2 = this.gridSteps * tmp;

    // Small grid lines
    const d = [];

    for (let i = 1; i < this.gridSteps; i++) {
      const tmp3 = i * tmp;
      d.push(
        "M 0 " + tmp3 + " L " + tmp2 + " " + tmp3 + " M " + tmp3 + " 0 L " + tmp3 + " " + tmp2
      );
    }

    // KNOWN: Rounding errors for certain scales (eg. 144%, 121% in Chrome, FF and Safari). Workaround
    // in Chrome is to use 100% for the svg size, but this results in blurred grid for large diagrams.
    const size = tmp2;
    const svg =
      '<svg width="' +
      size +
      '" height="' +
      size +
      '" xmlns="' +
      mxConstants.NS_SVG +
      '">' +
      '<defs><pattern id="grid" width="' +
      tmp2 +
      '" height="' +
      tmp2 +
      '" patternUnits="userSpaceOnUse">' +
      '<path d="' +
      d.join(" ") +
      '" fill="none" stroke="' +
      color +
      '" opacity="0.2" stroke-width="1"/>' +
      '<path d="M ' +
      tmp2 +
      " 0 L 0 0 0 " +
      tmp2 +
      '" fill="none" stroke="' +
      color +
      '" stroke-width="1"/>' +
      '</pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>';

    return svg;
  };

  // Adds panning for the grid with no page view and disabled scrollbars
  const mxGraphPanGraph = mxGraph.prototype.panGraph;
  mxGraph.prototype.panGraph = function (dx, dy) {
    mxGraphPanGraph.apply(this, arguments);

    if (this.shiftPreview1 != null) {
      let canvas = this.view.canvas;

      if (canvas.ownerSVGElement != null) {
        canvas = canvas.ownerSVGElement;
      }

      const phase = this.gridSize * this.view.scale * this.view.gridSteps;
      const position =
        -Math.round(phase - mxUtils.mod(this.view.translate.x * this.view.scale + dx, phase)) +
        "px " +
        -Math.round(phase - mxUtils.mod(this.view.translate.y * this.view.scale + dy, phase)) +
        "px";
      canvas.style.backgroundPosition = position;
    }
  };

  // Draws page breaks only within the page
  mxGraph.prototype.updatePageBreaks = function (visible, width, height) {
    const scale = this.view.scale;
    const tr = this.view.translate;
    const fmt = this.pageFormat;
    const ps = scale * this.pageScale;

    const bounds2 = this.view.getBackgroundPageBounds();

    width = bounds2.width;
    height = bounds2.height;
    const bounds = new mxRectangle(scale * tr.x, scale * tr.y, fmt.width * ps, fmt.height * ps);

    // Does not show page breaks if the scale is too small
    visible = visible && Math.min(bounds.width, bounds.height) > this.minPageBreakDist;

    const horizontalCount = visible ? Math.ceil(height / bounds.height) - 1 : 0;
    const verticalCount = visible ? Math.ceil(width / bounds.width) - 1 : 0;
    const right = bounds2.x + width;
    const bottom = bounds2.y + height;

    if (this.horizontalPageBreaks == null && horizontalCount > 0) {
      this.horizontalPageBreaks = [];
    }

    if (this.verticalPageBreaks == null && verticalCount > 0) {
      this.verticalPageBreaks = [];
    }

    const drawPageBreaks = mxUtils.bind(this, function (breaks) {
      if (breaks != null) {
        const count = breaks == this.horizontalPageBreaks ? horizontalCount : verticalCount;

        for (var i = 0; i <= count; i++) {
          const pts =
            breaks == this.horizontalPageBreaks
              ? [
                  new mxPoint(
                    Math.round(bounds2.x),
                    Math.round(bounds2.y + (i + 1) * bounds.height)
                  ),
                  new mxPoint(Math.round(right), Math.round(bounds2.y + (i + 1) * bounds.height)),
                ]
              : [
                  new mxPoint(
                    Math.round(bounds2.x + (i + 1) * bounds.width),
                    Math.round(bounds2.y)
                  ),
                  new mxPoint(Math.round(bounds2.x + (i + 1) * bounds.width), Math.round(bottom)),
                ];

          if (breaks[i] != null) {
            breaks[i].points = pts;
            breaks[i].redraw();
          } else {
            const pageBreak = new mxPolyline(pts, this.pageBreakColor);
            pageBreak.dialect = this.dialect;
            pageBreak.isDashed = this.pageBreakDashed;
            pageBreak.pointerEvents = false;
            pageBreak.init(this.view.backgroundPane);
            pageBreak.redraw();

            breaks[i] = pageBreak;
          }
        }

        for (var i = count; i < breaks.length; i++) {
          breaks[i].destroy();
        }

        breaks.splice(count, breaks.length - count);
      }
    });

    drawPageBreaks(this.horizontalPageBreaks);
    drawPageBreaks(this.verticalPageBreaks);
  };

  // Disables removing relative children from parents
  const mxGraphHandlerShouldRemoveCellsFromParent =
    mxGraphHandler.prototype.shouldRemoveCellsFromParent;
  mxGraphHandler.prototype.shouldRemoveCellsFromParent = function (parent, cells) {
    for (let i = 0; i < cells.length; i++) {
      if (this.graph.getModel().isVertex(cells[i])) {
        const geo = this.graph.getCellGeometry(cells[i]);

        if (geo != null && geo.relative) {
          return false;
        }
      }
    }

    return mxGraphHandlerShouldRemoveCellsFromParent.apply(this, arguments);
  };

  // Overrides to ignore hotspot only for target terminal
  const mxConnectionHandlerCreateMarker = mxConnectionHandler.prototype.createMarker;
  mxConnectionHandler.prototype.createMarker = function () {
    const marker = mxConnectionHandlerCreateMarker.apply(this, arguments);

    marker.intersects = mxUtils.bind(this, function () {
      if (this.isConnecting()) {
        return true;
      }

      return mxCellMarker.prototype.intersects.apply(marker, arguments);
    });

    return marker;
  };

  // Creates background page shape
  mxGraphView.prototype.createBackgroundPageShape = function (bounds) {
    return new mxRectangleShape(bounds, "#ffffff", this.graph.defaultPageBorderColor);
  };

  // Fits the number of background pages to the graph
  mxGraphView.prototype.getBackgroundPageBounds = function () {
    const gb = this.getGraphBounds();

    // Computes unscaled, untranslated graph bounds
    const x = gb.width > 0 ? gb.x / this.scale - this.translate.x : 0;
    const y = gb.height > 0 ? gb.y / this.scale - this.translate.y : 0;
    const w = gb.width / this.scale;
    const h = gb.height / this.scale;

    const fmt = this.graph.pageFormat;
    const ps = this.graph.pageScale;

    const pw = fmt.width * ps;
    const ph = fmt.height * ps;

    const x0 = Math.floor(Math.min(0, x) / pw);
    const y0 = Math.floor(Math.min(0, y) / ph);
    const xe = Math.ceil(Math.max(1, x + w) / pw);
    const ye = Math.ceil(Math.max(1, y + h) / ph);

    const rows = xe - x0;
    const cols = ye - y0;

    const bounds = new mxRectangle(
      this.scale * (this.translate.x + x0 * pw),
      this.scale * (this.translate.y + y0 * ph),
      this.scale * rows * pw,
      this.scale * cols * ph
    );

    return bounds;
  };

  // Add panning for background page in VML
  const graphPanGraph = mxGraph.prototype.panGraph;
  mxGraph.prototype.panGraph = function (dx, dy) {
    graphPanGraph.apply(this, arguments);

    if (
      this.dialect != mxConstants.DIALECT_SVG &&
      this.view.backgroundPageShape != null &&
      (!this.useScrollbarsForPanning || !mxUtils.hasScrollbars(this.container))
    ) {
      this.view.backgroundPageShape.node.style.marginLeft = dx + "px";
      this.view.backgroundPageShape.node.style.marginTop = dy + "px";
    }
  };

  /**
   * Consumes click events for disabled menu items.
   */
  const mxPopupMenuAddItem = mxPopupMenu.prototype.addItem;
  mxPopupMenu.prototype.addItem = function (title, image, funct, parent, iconCls, enabled) {
    const result = mxPopupMenuAddItem.apply(this, arguments);

    if (enabled != null && !enabled) {
      mxEvent.addListener(result, "mousedown", function (evt) {
        mxEvent.consume(evt);
      });
    }

    return result;
  };

  /**
   * Selects tables before cells and rows.
   */
  const mxGraphHandlerIsPropagateSelectionCell = mxGraphHandler.prototype.isPropagateSelectionCell;
  mxGraphHandler.prototype.isPropagateSelectionCell = function (cell, immediate, me) {
    let result = false;
    const parent = this.graph.model.getParent(cell);

    if (immediate) {
      const geo = this.graph.getCellGeometry(cell);

      return (
        !this.graph.model.isEdge(cell) &&
        !this.graph.model.isEdge(parent) &&
        !this.graph.isSiblingSelected(cell) &&
        (geo == null || geo.relative || !this.graph.isContainer(parent) || this.graph.isPart(cell))
      );
    } else {
      result = mxGraphHandlerIsPropagateSelectionCell.apply(this, arguments);

      if (this.graph.isTableCell(cell) || this.graph.isTableRow(cell)) {
        let table = parent;

        if (!this.graph.isTable(table)) {
          table = this.graph.model.getParent(table);
        }

        result =
          !this.graph.selectionCellsHandler.isHandled(table) ||
          (this.graph.isCellSelected(table) && this.graph.isToggleEvent(me.getEvent())) ||
          (this.graph.isCellSelected(cell) && !this.graph.isToggleEvent(me.getEvent())) ||
          (this.graph.isTableCell(cell) && this.graph.isCellSelected(parent));
      }
    }

    return result;
  };

  /**
   * Returns last selected ancestor
   */
  mxPopupMenuHandler.prototype.getCellForPopupEvent = function (me) {
    let cell = me.getCell();
    const model = this.graph.getModel();
    let parent = model.getParent(cell);
    const state = this.graph.view.getState(parent);
    let selected = this.graph.isCellSelected(cell);

    while (state != null && (model.isVertex(parent) || model.isEdge(parent))) {
      const temp = this.graph.isCellSelected(parent);
      selected = selected || temp;

      if (temp || (!selected && (this.graph.isTableCell(cell) || this.graph.isTableRow(cell)))) {
        cell = parent;
      }

      parent = model.getParent(parent);
    }

    return cell;
  };
})();
