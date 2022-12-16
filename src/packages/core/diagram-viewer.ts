import { stringToXml, xmlToString } from "../utils/xml";
import { DEFAULT_STYLE_XML } from "../styles/default";
import { Graph } from "../editor";
import { mxCodec } from "./mxgraph";
import { stringToSvg, svgToString } from "../utils/svg";

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

export const convertSVGToBase64 = (xml: string | XMLDocument): string | null => {
  const xmlDoc = typeof xml === "string" ? stringToXml(xml) : xml;
  const viewer = new DiagramViewer(xmlDoc);
  const svg = viewer.renderSVG(null, 1, 1);
  const svgString = svgToString(svg);
  if (svgString) {
    return "data:image/svg+xml;base64," + btoa(svgString);
  }
  return null;
};

export const downloadSVG = (
  xml: string | XMLDocument,
  name = "image.jpg"
): Promise<(() => void) | null> => {
  return new Promise(r => {
    const svgBase64 = convertSVGToBase64(xml);
    if (svgBase64) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = window.devicePixelRatio || 1;
        canvas.width = image.width * ratio;
        canvas.height = image.height * ratio;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.scale(ratio, ratio);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        const exportFn = () => {
          const link = document.createElement("a");
          link.download = name;
          link.href = canvas.toDataURL("image/jpeg");
          link.click();
        };
        r(exportFn);
      };
      image.src = svgBase64;
    } else {
      r(null);
    }
  });
};

export { stringToXml, svgToString, xmlToString, stringToSvg };
