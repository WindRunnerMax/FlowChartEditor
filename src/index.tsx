import ReactDOM from "react-dom";
import { DiagramExample } from "./example";
import "./packages/editor/styles/grapheditor.css";
import { stringToXml } from "./packages";
import { DEFAULT_STYLE_XML } from "./packages/core/style";
import { Editor, EditorUi, Graph } from "./packages/editor";
import { mxResources } from "./packages/core/mxgraph";
import { langEN } from "./packages/editor/resources/lang-en";

mxResources.parse(langEN);
const themes: Record<string, Node> = {};
themes[Graph.prototype.defaultThemeName] = stringToXml(DEFAULT_STYLE_XML)!.documentElement;
new EditorUi(new Editor(false, themes));

ReactDOM.render(<DiagramExample />, document.getElementById("root"));
