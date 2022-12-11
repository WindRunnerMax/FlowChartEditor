export const clearElement = (element: HTMLElement | null): void => {
  element && element.childNodes.forEach(node => element.removeChild(node));
};

export const getDrawIOSvgString = (xml: XMLDocument) => {
  return xmlToString(xml.documentElement.firstChild?.firstChild || null);
};
export const xmlToString = (xml: Node | null): string | null => {
  if (!xml) return null;
  try {
    const serialize = new XMLSerializer();
    return serialize.serializeToString(xml);
  } catch (error) {
    console.log("XmlToString Error: ", error);
    return null;
  }
};

export const stringToXml = (str: string): XMLDocument | null => {
  try {
    const parser = new DOMParser();
    return parser.parseFromString(str, "text/xml") as XMLDocument;
  } catch (error) {
    console.log("StringToXml Error: ", error);
    return null;
  }
};

export const svgToString = (svg: Node | null): string | null => {
  if (!svg) return null;
  try {
    const serialize = new XMLSerializer();
    return serialize.serializeToString(svg);
  } catch (error) {
    console.log("SvgToString Error: ", error);
    return null;
  }
};

export const stringToSvg = (str: string): SVGElement | null => {
  try {
    const parser = new DOMParser();
    return parser.parseFromString(str, "image/svg+xml").firstChild as SVGElement;
  } catch (error) {
    console.log("StringToSvg Error: ", error);
    return null;
  }
};

export const base64ToSvgString = (base64: string): string | null => {
  try {
    const svg = atob(base64.replace("data:image/svg+xml;base64,", ""));
    return svg;
  } catch (error) {
    console.log("base64ToSvgString Error: ", error);
    return null;
  }
};
