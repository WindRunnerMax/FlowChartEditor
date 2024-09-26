import "../editor/js/Shapes";
import { stringToXml } from "../utils/xml";
import { DEFAULT_STYLE_XML } from "../styles/default";
import { Graph } from "../editor/js/Graph";
import { mxCodec, mxEvent } from "./mxgraph";

const themes: Record<string, Node> = {};
themes[Graph.prototype.defaultThemeName] = (
  stringToXml(DEFAULT_STYLE_XML) as XMLDocument
).documentElement;

export class DiagramViewer {
  private graph: Graph | null;
  private container: HTMLDivElement | null;

  constructor(private xml: XMLDocument | null) {
    const container = document.createElement("div");
    const graph = new Graph(container, null, null, null, themes, true);
    this.container = container;
    this.graph = graph;
  }

  public renderSVG = (background: string | null, scale = 1, border = 1): SVGElement | null => {
    if (!this.graph) return null;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const model = this.graph.getModel();
    this.xml && new mxCodec(this.xml).decode(this.xml.documentElement, model);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const svg = this.graph.getSvg(background, scale, border);
    return svg;
  };

  public destroy = (): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.graph && this.graph.destroy();
    this.container && mxEvent.removeAllListeners(this.container);
    this.graph = null;
    this.container = null;
  };

  public static xmlToSvg = (
    xml: XMLDocument | null,
    background: string | null,
    scale = 1,
    border = 1
  ): SVGElement | null => {
    if (!xml) return null;
    const viewer = new DiagramViewer(xml);
    const svg = viewer.renderSVG(background, scale, border);
    viewer.destroy();
    return svg;
  };
}
