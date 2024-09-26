const jsdom = require("jsdom");
const dom = new jsdom.JSDOM();
global.window = dom.window;
global.navigator = dom.window.navigator;
global.document = dom.window.document;
const Viewer = require("../dist/lib/core/viewer").DiagramViewer;
console.log("Viewer :>> ", Viewer);
