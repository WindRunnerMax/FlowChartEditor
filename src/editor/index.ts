import "./js/Shapes";
import { mxWindow } from "../core/mxgraph";
import close from "./images/close";
import normalize from "./images/normalize";
import maximize from "./images/maximize";
import minimize from "./images/minimize";
import resize from "./images/close";

mxWindow.prototype.closeImage = close;
mxWindow.prototype.normalizeImage = normalize;
mxWindow.prototype.maximizeImage = maximize;
mxWindow.prototype.minimizeImage = minimize;
mxWindow.prototype.resizeImage = resize;

export { Editor } from "./js/Editor";
export { EditorUi } from "./js/EditorUi";
export { Graph } from "./js/Graph";

// python3 -m http.server 9000
// https://github.com/jgraph/mxgraph-js f43fc06f72ff5153e84ebfab8eed16a7d58a3b68
// https://jgraph.github.io/mxgraph/javascript/examples/grapheditor/www/index.html
