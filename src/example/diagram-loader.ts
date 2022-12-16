import type * as Diagram from "../packages";

let instance: typeof Diagram | null = null;

export const diagramLoader = (): Promise<typeof Diagram> => {
  if (instance) return Promise.resolve(instance);
  return import("../packages").then(res => {
    instance = res;
    return res;
  });
};
