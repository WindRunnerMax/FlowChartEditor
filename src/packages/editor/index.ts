import "./js/Shapes";
import { mxWindow } from "../core/mxgraph";
import close from "./images/close.gif";
import normalize from "./images/normalize.gif";
import maximize from "./images/maximize.gif";
import minimize from "./images/minimize.gif";
import resize from "./images/close.gif";

mxWindow.prototype.closeImage = close;
mxWindow.prototype.normalizeImage = normalize;
mxWindow.prototype.maximizeImage = maximize;
mxWindow.prototype.minimizeImage = minimize;
mxWindow.prototype.resizeImage = resize;

export { Actions, Action } from "./js/Actions";
export { ColorDialog, OutlineWindow, LayersWindow } from "./js/Dialogs";

export { FilenameDialog, ErrorDialog, Editor, Dialog } from "./js/Editor";

export { ChangePageSetup, EditorUi } from "./js/EditorUi";

export {
  StyleFormatPanel,
  TextFormatPanel,
  Format,
  ArrangePanel,
  BaseFormatPanel,
  DiagramFormatPanel,
} from "./js/Format";

export { TableLayout, Graph, HoverIcons } from "./js/Graph";
export { Menubar, Menu, Menus } from "./js/Menus";
export { Sidebar } from "./js/Sidebar";
export { Toolbar } from "./js/Toolbar";

// python3 -m http.server 9000
// https://github.com/jgraph/mxgraph-js f43fc06f72ff5153e84ebfab8eed16a7d58a3b68
// https://jgraph.github.io/mxgraph/javascript/examples/grapheditor/www/index.html
