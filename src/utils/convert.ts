import { mxGraph, mxCodec, mxSvgCanvas2D, mxImageExport } from "../core/mxgraph";
import { DEFAULT_STYLE_XML } from "../styles/default";
import { isString } from "laser-utils/dist/es/is";
import { stringToXml } from "./xml";

const XMLNS = "http://www.w3.org/2000/svg";

export const convertXMLToSVG = (
  xml: string | XMLDocument,
  style?: string | XMLDocument
): SVGElement | null => {
  const element = document.createElement("div");
  const doc = isString(xml) ? stringToXml(xml) : xml;
  const stylesheet = style
    ? isString(style)
      ? stringToXml(style)
      : style
    : stringToXml(DEFAULT_STYLE_XML);
  if (doc) {
    const graph = new mxGraph(element);
    const codec = new mxCodec(doc);
    graph.model.beginUpdate();
    graph.setEnabled(false);
    codec.decode(doc.documentElement, graph.getModel());
    stylesheet && codec.decode(stylesheet.documentElement, graph.getStylesheet());
    graph.model.endUpdate();
    const svg = document.createElementNS(XMLNS, "svg");
    const bounds = graph.getGraphBounds();
    svg.setAttribute("xmlns", XMLNS);
    svg.setAttribute("width", bounds.width.toString());
    svg.setAttribute("height", bounds.height.toString());
    svg.setAttribute("viewBox", "0 0 " + bounds.width + " " + bounds.height);
    svg.setAttribute("version", "1.1");
    const canvas = new mxSvgCanvas2D(svg);
    canvas.translate(-bounds.x, -bounds.y);
    const exporter = new mxImageExport();
    const state = graph.getView().getState(graph.model.root);
    exporter.drawState(state, canvas);
    return svg;
  }
  return null;
};
