# FlowChartEditor

 [Github](https://github.com/WindrunnerMax/FlowChartEditor) ｜ [Editor DEMO](https://windrunnermax.github.io/FlowChartEditor/) ｜ [BLOG](https://github.com/WindrunnerMax/EveryDay/blob/master/Plugin/%E5%9F%BA%E4%BA%8Edrawio%E6%9E%84%E5%BB%BA%E6%B5%81%E7%A8%8B%E5%9B%BE%E7%BC%96%E8%BE%91%E5%99%A8.md) ｜ [TODO](./TODO.md)

流程图编辑器，支持独立的流程图编辑器包以及`DrawIO`嵌入通信方案。  

```bash
$ npm i embed-drawio
```
## 独立编辑器
支持独立的流程图编辑器编辑与展示功能。

使用方法可参考`src/example/app.tsx`，由于包体积原因，强烈建议以懒加载方式引入。

```js
import type * as DiagramEditor from "embed-drawio/dist/packages/core/diagram-editor";
import type * as DiagramViewer from "embed-drawio/dist/packages/core/diagram-viewer";

let editor: typeof DiagramEditor | null = null;
export const diagramEditorLoader = (): Promise<typeof DiagramEditor> => {
  if (editor) return Promise.resolve(editor);
  return Promise.all([
    import(
      /* webpackChunkName: "embed-drawio-editor" */ "embed-drawio/dist/packages/core/diagram-editor"
    ),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import(/* webpackChunkName: "embed-drawio-css" */ "embed-drawio/dist/index.css"),
  ]).then(res => (editor = res[0]));
};

let viewer: typeof DiagramViewer | null = null;
export const diagramViewerLoader = (): Promise<typeof DiagramViewer> => {
  if (viewer) return Promise.resolve(viewer);
  return Promise.all([
    import(
      /* webpackChunkName: "embed-drawio-viewer" */ "embed-drawio/dist/packages/core/diagram-viewer"
    ),
  ]).then(res => (viewer = res[0]));
};
```

## 嵌入DrawIO
支持`DrawIO`的嵌入通信方案。

使用方法可参考`src/example/app.tsx`，由于`sideEffects`原因，强烈建议以路径方式引入。


```js
import { EditorEvents } from "embed-drawio/dist/packages/events/event";
import { EditorBus } from "embed-drawio/dist/packages/events/bus";

// ...
```
