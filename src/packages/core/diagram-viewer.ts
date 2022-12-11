import { stringToXml } from "../utils/xml";
import { DEFAULT_STYLE_XML } from "../styles/default";
import { Graph } from "../editor";
import { mxCodec } from "./mxgraph";

const themes: Record<string, Node> = {};
themes[Graph.prototype.defaultThemeName] = (
  stringToXml(DEFAULT_STYLE_XML) as XMLDocument
).documentElement;

export class DiagramViewer {
  private graph: Graph;
  constructor(private xml: XMLDocument | null) {
    const container = document.createElement("div");
    this.graph = new Graph(container, null, null, null, themes);
  }

  public renderSVG = (background: string | null, scale = 1, border = 1): SVGElement => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const model = this.graph.getModel();
    this.xml && new mxCodec(this.xml).decode(this.xml.documentElement, model);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const svg = this.graph.getSvg(background, scale, border);
    return svg;
  };
}
