import type * as Diagram from "../src";

let instance: typeof Diagram | null = null;

export const diagramLoader = (): Promise<typeof Diagram> => {
  if (instance) return Promise.resolve(instance);
  return import("../src/").then(res => {
    instance = res;
    return res;
  });
};
