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
window.mxLoadResources = false;
window.mxForceIncludes = false;
window.mxLoadStylesheets = false;
window.mxResourceExtension = ".txt";

// https://github.com/jgraph/mxgraph/issues/479
const mx = factory();

// 需要用到的再引用 实际上还是把所有的包都打进来了
export const {
  mxGraph,
  mxCodec,
  mxConstants,
  mxSvgCanvas2D,
  mxImageExport,
  mxEventSource,
  mxResources,
  mxEventObject,
  mxEvent,
  mxUtils,
  mxClient,
  mxRectangle,
  mxDivResizer,
  mxPopupMenu,
  mxPoint,
  mxGraphView,
  mxMouseEvent,
  mxPolyline,
  mxGraphHandler,
  mxConnectionHandler,
  mxCellMarker,
  mxRectangleShape,
  mxPopupMenuHandler,
  mxUndoManager,
  mxText,
  mxRubberband,
  mxGraphModel,
  mxShape,
  mxEdgeStyle,
  mxSelectionCellsHandler,
  mxClipboard,
  mxEdgeHandler,
  mxCellRenderer,
  mxDragSource,
  mxGuide,
  mxImage,
  mxGraphLayout,
  mxObjectCodec,
  mxCellHighlight,
  mxLayoutManager,
  mxCompactTreeLayout,
  mxHierarchicalLayout,
  mxCircleLayout,
  mxFastOrganicLayout,
  mxStencilRegistry,
  mxStencil,
  mxConstraintHandler,
  mxEllipse,
  mxCellState,
  mxObjectIdentity,
  mxDictionary,
  mxConnectionConstraint,
  mxCellEditor,
  mxVertexHandler,
  mxOutline,
  mxPanningHandler,
  mxElbowEdgeHandler,
  mxImageShape,
  mxStackLayout,
  mxConnector,
  mxStyleRegistry,
  mxKeyHandler,
  mxCell,
  mxGeometry,
  mxXmlRequest,
  mxXmlCanvas2D,
  mxForm,
  mxWindow,
  mxMorphing,
  mxRadialTreeLayout,
  mxActor,
  mxMarker,
  mxCylinder,
  mxRhombus,
  mxPerimeter,
  mxArrowConnector,
  mxDoubleEllipse,
  mxHexagon,
  mxSwimlane,
  mxLabel,
  mxHandle,
  mxLine,
  mxTriangle,
  mxCloud,
  mxArrow,
  mxCodecRegistry,
} = mx;

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

mxUtils.getScrollOrigin = function (node, includeAncestors, includeDocument) {
  includeAncestors = includeAncestors != null ? includeAncestors : false;
  includeDocument = includeDocument != null ? includeDocument : false;
  const doc = node != null ? node.ownerDocument : document;
  const b = doc.body;
  const d = doc.documentElement;
  const result = new mxPoint();
  let fixed = false;
  while (node != null && node != b && node != d) {
    if (!isNaN(node.scrollLeft) && !isNaN(node.scrollTop)) {
      result.x += node.scrollLeft;
      result.y += node.scrollTop;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const style = mxUtils.getCurrentStyle(node);
    if (style != null) {
      fixed = fixed || style.position == "fixed";
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    node = includeAncestors ? node.parentNode : null;
  }
  if (!fixed && includeDocument) {
    const origin = mxUtils.getDocumentScrollOrigin(doc);
    result.x += origin.x;
    result.y += origin.y;
  }
  return result;
};
