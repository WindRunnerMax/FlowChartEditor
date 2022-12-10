import "../editor/styles/common.css";
import "../editor/styles/grapheditor.css";
import "../styles/diagram.scss";
import { stringToXml } from "../utils/xml";
import { DEFAULT_STYLE_XML } from "../styles/style";
import { Editor, EditorUi, Graph } from "../editor";
import { mxResources } from "./mxgraph";
import { langEN } from "../editor/resources/lang-en";

export const startEdit = () => {
  const container = document.createElement("div");
  container.className = "diagram-container geEditor";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  document.body.appendChild(container);
  mxResources.parse(langEN);
  const themes: Record<string, Node> = {};
  themes[Graph.prototype.defaultThemeName] = (
    stringToXml(DEFAULT_STYLE_XML) as XMLDocument
  ).documentElement;
  new EditorUi(new Editor(false, themes), container);
};
