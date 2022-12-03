export const svgToString = (svg: Node): string | null => {
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
