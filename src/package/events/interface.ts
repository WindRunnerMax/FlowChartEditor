export type Config = {
  compress?: boolean;
  format: "xml" | "svg" | "html";
  onSave?: (xml: string) => void;
  onExport?: (result: string) => void;
};

export type EditorMsg = {
  event: "init" | "load" | "config" | "save" | "export" | "error";
};
