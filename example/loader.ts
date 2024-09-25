import type { DiagramEditor } from "../dist/es/core/editor";
import type { DiagramViewer } from "../dist/es/core/viewer";

let editor: typeof DiagramEditor | null = null;
let viewer: typeof DiagramViewer | null = null;

export const loadEditor = (): Promise<typeof DiagramEditor> => {
  if (editor) return Promise.resolve(editor);
  return import("../dist/es/core/editor").then(res => {
    editor = res.DiagramEditor;
    return editor;
  });
};

export const loadViewer = (): Promise<typeof DiagramViewer> => {
  if (viewer) return Promise.resolve(viewer);
  return import("../dist/es/core/viewer").then(res => {
    viewer = res.DiagramViewer;
    return viewer;
  });
};
