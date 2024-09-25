import { xmlToString } from "../src/utils/xml";

export const clearElement = (element: HTMLElement | null): void => {
  element && element.childNodes.forEach(node => element.removeChild(node));
};

export const getDrawIOSvgString = (xml: XMLDocument) => {
  return xmlToString(xml.documentElement.firstChild?.firstChild || null);
};
