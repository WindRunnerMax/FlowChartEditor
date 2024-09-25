# FlowChartEditor

<p>
<a href="https://github.com/WindrunnerMax/FlowChartEditor">GitHub</a>
<span>｜</span>
<a href="https://windrunnermax.github.io/FlowChartEditor/">Editor DEMO</a>
<span>｜</span>
<a href="https://github.com/WindrunnerMax/EveryDay/blob/master/Plugin/基于drawio构建流程图编辑器.md">BLOG</a>
<span>｜</span>
<a href="./TODO.md">TODO</a>
</p>


流程图编辑器，支持独立的流程图编辑器包以及`DrawIO`嵌入通信方案。  

```bash
# Install
$ npm i embed-drawio

# Development
$ npm run build:dist
$ npm run dev
```
## 独立编辑器
支持独立的流程图编辑器编辑与渲染。

使用方法可参考`example/index.tsx`，由于包体积原因，强烈建议以懒加载方式引入。

```js
import type { DiagramEditor } from "embed-drawio/dist/es/core/editor";
import type { DiagramViewer } from "embed-drawio/dist/es/core/viewer";

let editor: typeof DiagramEditor | null = null;
export const loadEditor = async (): Promise<typeof DiagramEditor> => {
  if (editor) return Promise.resolve(editor);
  const res = await Promise.all([
    import(/* webpackChunkName: "embed-drawio-editor" */ "embed-drawio/dist/es/core/editor"),
    // @ts-expect-error css declaration
    import(/* webpackChunkName: "embed-drawio-css" */ "embed-drawio/dist/es/index.css"),
  ]);
  editor = res[0].DiagramEditor;
  return editor;
};

let viewer: typeof DiagramViewer | null = null;
export const loadViewer = async (): Promise<typeof DiagramViewer> => {
  if (viewer) return Promise.resolve(viewer);
  const res = await Promise.all([
    import(/* webpackChunkName: "embed-drawio-viewer" */ "embed-drawio/dist/es/core/viewer"),
  ]);
  viewer = res[0].DiagramViewer;
  return viewer;
};
```

## 嵌入DrawIO
支持`DrawIO`的嵌入通信方案。

使用方法可参考`example/index.tsx`，由于`sideEffects`原因，强烈建议以路径方式引入。


```js
import { EditorEvent } from "embed-drawio/dist/es/event/basic";
import { EditorBus } from "embed-drawio/dist/es/event/index";

// ...
```
