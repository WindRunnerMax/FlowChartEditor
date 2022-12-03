import { Codec, Graph } from "@maxgraph/core";
import mx from "./mxgraph";
import { svgToString } from "./svg";
import { stringToXml } from "./xml";

export const convertToSVG = xmlStr => {
  const element = document.createElement("div");
  const graph = new mx.mxGraph(element);
  graph.htmlLabels = true;
  graph.cellsEditable = false;
  graph.model.beginUpdate();
  const doc = mx.mxUtils.parseXml(xmlStr);
  const codec = new mx.mxCodec(doc);
  codec.decode(doc.documentElement, graph.getModel());
  graph.model.endUpdate();

  //graph.graphModelChanged([])
  // render as HTML node always. You probably won't want that in real world though
  graph.convertValueToString = function (cell) {
    return cell.value;
  };

  console.log("graph :>> ", graph);
  console.log(svgToString(element.firstChild));
  return 111;
};

// https://stackoverflow.com/questions/44179673/drawio-mxgraph-using-xmltosvg-loses-shapes-information
// https://stackoverflow.com/questions/46712699/converting-xml-to-svg-in-mxgraph-javascript

// const doc = mx.mxUtils.parseXml(xml);
// const codec = new mx.mxCodec(doc);
// const element = document.createElement("div");
// const graph = new mx.mxGraph(element);
// let elt = doc.documentElement.firstChild;
// const cells = [];
// while (elt != null) {
//   cells.push(codec.decodeCell(elt));
//   graph.refresh();
//   elt = elt.nextSibling;
// }
// graph.addCells(cells);
// graph.getModel().endUpdate();
// console.log("graph :>> ", graph, element);

// const doc = stringToXml(xml) as XMLDocument;
// const codec = new mx.mxCodec(doc);
// const element = document.createElement("div");
// const graph = new mx.mxGraph(element);
// graph.model.beginUpdate();
// graph.model.clear();
// graph.view.scale = 1;
// codec.decode(element, graph.getModel());
// graph.getModel().endUpdate();
// console.log("graph :>> ", graph);
// console.log(svgToString(element.firstChild as SVGElement));

// const doc = stringToXml(xml) as XMLDocument;
// const codec = new mx.mxCodec(doc);
// const element = document.createElement("div");
// const graph = new mx.mxGraph(element);
// const layout = new mx.mxFastOrganicLayout(graph);
// graph.getModel().beginUpdate();
// try {
//   const doc = mx.mxUtils.parseXml(xml);
//   const dec = new mx.mxCodec(doc);
//   dec.decode(doc.documentElement, graph.getModel());
//   const parent = graph.getDefaultParent();
//   console.log("layout :>> ", parent);
//   layout.execute(parent);
// } finally {
//   graph.getModel().endUpdate();
// }
// console.log("layout :>> ", layout);
// console.log(svgToString(element.firstChild as SVGElement));
