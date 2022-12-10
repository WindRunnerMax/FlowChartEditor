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
