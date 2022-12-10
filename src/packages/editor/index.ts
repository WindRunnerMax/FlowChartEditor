import "./stencils";
import "./js/Shapes";

export { Actions, Action } from "./js/Actions";
export {
  ExportDialog,
  TextareaDialog,
  OpenDialog,
  ColorDialog,
  AboutDialog,
  OutlineWindow,
  EditDataDialog,
  EditDiagramDialog,
  LayersWindow,
} from "./js/Dialogs";

export {
  FilenameDialog,
  ErrorDialog,
  PageSetupDialog,
  Editor,
  OpenFile,
  Dialog,
  PrintDialog,
} from "./js/Editor";

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

// https://github.com/jgraph/mxgraph-js
// f43fc06f72ff5153e84ebfab8eed16a7d58a3b68
// python3 -m http.server 9000
