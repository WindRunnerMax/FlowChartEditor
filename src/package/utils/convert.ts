import { mxGraph, mxCodec } from "../core/mxgraph";
import { DEFAULT_STYLE_XML } from "../core/style";
import { stringToXml } from "./xml";

const opt = Object.prototype.toString;
const isString = (value: unknown): value is string => {
  return opt.call(value) === "[object String]";
};

export const convertXMLToSVG = (
  xml: string | XMLDocument,
  style?: string | XMLDocument
): SVGElement | null => {
  const element = document.createElement("div");
  const doc = isString(xml) ? stringToXml(xml) : xml;
  const sheet = style
    ? isString(style)
      ? stringToXml(style)
      : style
    : stringToXml(DEFAULT_STYLE_XML);
  if (doc) {
    const graph = new mxGraph(element);
    graph.model.beginUpdate();
    const codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());
    sheet && codec.decode(sheet.documentElement, graph.getStylesheet());
    graph.model.endUpdate();
    const svg = element.firstChild ? element.firstChild.cloneNode(true) : null;
    return svg as SVGElement;
  }
  return null;
};
