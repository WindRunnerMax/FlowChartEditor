import factory from "mxgraph";

declare global {
  interface Window {
    mxBasePath: string;
    mxLoadResources: boolean;
    mxForceIncludes: boolean;
    mxLoadStylesheets: boolean;
    mxResourceExtension: string;
  }
}

window.mxBasePath = "static";
window.mxLoadResources = true;
window.mxForceIncludes = false;
window.mxLoadStylesheets = true;
window.mxResourceExtension = ".txt";

const mx = factory({
  // https://github.com/jgraph/mxgraph/issues/479
  mxBasePath: "static",
});

// 需要用到的再引用 实际上还是把所有的包都打进来了
export const { mxGraph, mxCodec, mxConstants } = mx;

// https://github.com/maxGraph/maxGraph/issues/102
// https://github.com/jgraph/mxgraph/blob/master/javascript/src/js/io/mxCodec.js#L423
mxCodec.prototype.decode = function (node, into) {
  this.updateElements();
  let obj: unknown = null;
  if (node && node.nodeType == mxConstants.NODETYPE_ELEMENT) {
    let ctor: unknown = null;
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore // 因为需要处理的`XML Node`可能不在`Window`上
      ctor = mx[node.nodeName] || window[node.nodeName];
    } catch (error) {
      console.log(`NODE ${node.nodeName} IS NOT FOUND`, error);
    }
    const dec = mx.mxCodecRegistry.getCodec(ctor);
    if (dec) {
      obj = dec.decode(this, node, into);
    } else {
      obj = node.cloneNode(true);
      obj && (obj as Element).removeAttribute("as");
    }
  }
  return obj;
};
