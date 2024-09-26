import { isString } from "laser-utils/dist/es/is";
import type { Func } from "laser-utils/dist/es/types";

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

export const svgToBase64 = (svg: string | SVGElement): string | null => {
  const svgString = isString(svg) ? svg : svgToString(svg);
  if (svgString) {
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  }
  return null;
};

export const makeSVGDownloader = (svg: string | SVGElement, name = "image.jpg") => {
  return new Promise<Func.Plain | null>(r => {
    const svgBase64 = svgToBase64(svg);
    if (!svgBase64) {
      r(null);
      return void 0;
    }
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
      const func = () => {
        const link = document.createElement("a");
        link.download = name;
        link.href = canvas.toDataURL("image/jpeg");
        link.click();
      };
      r(func);
    };
    image.src = svgBase64;
  });
};
