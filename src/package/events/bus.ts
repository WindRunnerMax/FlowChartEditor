import { Config } from "./interface";

export const createEditor = (config: Config) => {
  const editorConfig = {
    compressXml: config.compress ?? true,
  };
  const start = () => {
    // ...
  };
  return { start };
};
