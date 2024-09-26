const jsdom = require("jsdom");
const dom = new jsdom.JSDOM();
global.window = dom.window;
global.navigator = dom.window.navigator;
global.document = dom.window.document;
global.Image = dom.window.Image;
global.DOMParser = dom.window.DOMParser;
const Viewer = require("../dist/lib/core/viewer").DiagramViewer;
const XML_DATA = `<mxGraphModel dx="1186" dy="670" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
<root>
  <mxCell id="0" />
  <mxCell id="1" parent="0" />
  <mxCell id="9v9bDfxMJK_rrW6hIOUh-4" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="9v9bDfxMJK_rrW6hIOUh-1" target="9v9bDfxMJK_rrW6hIOUh-3">
    <mxGeometry relative="1" as="geometry" />
  </mxCell>
  <mxCell id="9v9bDfxMJK_rrW6hIOUh-1" value="Start" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
    <mxGeometry x="200" y="140" width="120" height="60" as="geometry" />
  </mxCell>
  <mxCell id="9v9bDfxMJK_rrW6hIOUh-3" value="End" style="whiteSpace=wrap;html=1;rounded=0;" vertex="1" parent="1">
    <mxGeometry x="400" y="140" width="120" height="60" as="geometry" />
  </mxCell>
</root>
</mxGraphModel>`;
const parser = new DOMParser();
const xml = parser.parseFromString(XML_DATA, "text/xml");
const svg = Viewer.xmlToSvg(xml);
const serialize = new dom.window.XMLSerializer();
const svgString = serialize.serializeToString(svg);
console.log(svgString);
