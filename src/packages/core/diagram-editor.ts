import "../editor/styles/common.css";
import "../editor/styles/grapheditor.css";
import "../styles/diagram.scss";
import { stringToXml, xmlToString } from "../utils/xml";
import { DEFAULT_STYLE_XML } from "../styles/default";
import { Editor, EditorUi, Graph } from "../editor";
import { mxEvent, mxResources } from "./mxgraph";
import { getLanguage, Language } from "../editor/i18n";

const themes: Record<string, Node> = {};
themes[Graph.prototype.defaultThemeName] = (
  stringToXml(DEFAULT_STYLE_XML) as XMLDocument
).documentElement;

export class DiagramEditor {
  private editor: Editor | null;
  private editorUi: EditorUi | null;
  private diagramContainer: HTMLElement;
  private scrollTop: number;

  constructor(
    private container: HTMLElement,
    private createExitButton: (container: HTMLDivElement) => void
  ) {
    this.scrollTop = 0;
    this.editor = null;
    this.editorUi = null;
    this.diagramContainer = document.createElement("div");
    this.diagramContainer.className = "diagram-container geEditor";
  }

  public start = (
    lang: Language,
    init?: XMLDocument | null,
    onXMLChange?: (xml: Element) => void
  ): void => {
    this.container.appendChild(this.diagramContainer);
    this.scrollTop = document.documentElement.scrollTop;
    this.container.style.overflow = "hidden";
    document.documentElement.scrollTop = 0;
    mxResources.parse(lang);
    this.editor = new Editor(false, themes);
    this.editorUi = new EditorUi(this.editor, this.diagramContainer, null, this.createExitButton);
    if (init) {
      this.editorUi.editor.setGraphXml(init.documentElement);
    }
    this.editor.graph.getModel().addListener(mxEvent.CHANGE, () => {
      onXMLChange && onXMLChange(this.editorUi && this.editorUi.editor.getGraphXml());
    });
  };

  public exit = (): void => {
    this.container.style.overflow = "";
    document.documentElement.scrollTop = this.scrollTop;
    mxEvent.removeAllListeners(window);
    mxEvent.removeAllListeners(document);
    this.editor && this.editor.destroy();
    this.editorUi && this.editorUi.destroy();
    this.container.removeChild(this.diagramContainer);
  };
}

export { stringToXml, getLanguage, xmlToString };
