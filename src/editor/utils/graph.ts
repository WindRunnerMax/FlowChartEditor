import { mxImage } from "../../core/mxgraph";
import { refreshTarget } from "../images/base64";
import { GRAPH } from "./constant";

export const createSvgImage = (
  w: number,
  h: number,
  data: string,
  coordWidth?: string,
  coordHeight?: string
) => {
  const viewBox = coordWidth && coordHeight ? `viewBox="0 0 ${coordWidth} ${coordHeight}"` : "";
  const tmp = unescape(
    encodeURIComponent(
      `${
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'
      }${w}px" height="${h}px" ${viewBox} version="1.1">${data}</svg>`
    )
  );
  return new mxImage(`data:image/svg+xml;base64,${btoa(tmp)}`, w, h);
};

export const TRIANGLE_UP_IMAGE = createSvgImage(
  18,
  28,
  `<path d="m 6 26 L 12 26 L 12 12 L 18 12 L 9 1 L 1 12 L 6 12 z" stroke="#fff" fill="${GRAPH.ARROW_FILL}"/>`
);

export const TRIANGLE_RIGHT_IMAGE = createSvgImage(
  26,
  18,
  `<path d="m 1 6 L 14 6 L 14 1 L 26 9 L 14 18 L 14 12 L 1 12 z" stroke="#fff" fill="${GRAPH.ARROW_FILL}"/>`
);

export const TRIANGLE_DOWN_IMAGE = createSvgImage(
  18,
  26,
  `<path d="m 6 1 L 6 14 L 1 14 L 9 26 L 18 14 L 12 14 L 12 1 z" stroke="#fff" fill="${GRAPH.ARROW_FILL}"/>`
);

export const TRIANGLE_LEFT_IMAGE = createSvgImage(
  28,
  18,
  `<path d="m 1 9 L 12 1 L 12 6 L 26 6 L 26 12 L 12 12 L 12 18 z" stroke="#fff" fill="${GRAPH.ARROW_FILL}"/>`
);

export const REFRESH_TARGET_IMAGE = new mxImage(refreshTarget, 38, 38);

export const ROUND_DROP_IMAGE = createSvgImage(
  26,
  26,
  `<circle cx="13" cy="13" r="12" stroke="#fff" fill="${GRAPH.ARROW_FILL}"/>`
);
