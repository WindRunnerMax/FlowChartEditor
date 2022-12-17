/* eslint-disable */
/* eslint-enable no-undef, prettier/prettier, no-unused-vars */
import { mxClient } from "../../core/mxgraph";
import arrow from "./arrow.gif";
import cross from "./cross.gif";
import hs from "./hs.png";
import hv from "./hv.png";

const base64 = { arrow, cross, hs, hv };

export const mxJSColor = {
  dir: "", // location of jscolor directory (leave empty to autodetect)
  bindClass: "color", // class name
  binding: true, // automatic binding via <input class="...">
  preloading: true, // use image preloading?

  init: function () {
    if (mxJSColor.preloading) {
      mxJSColor.preload();
    }
  },

  getDir: function () {
    if (!mxJSColor.dir) {
      const detected = mxJSColor.detectDir();
      mxJSColor.dir = detected !== false ? detected : "jscolor/";
    }
    return mxJSColor.dir;
  },

  detectDir: function () {
    let base = location.href;

    let e = document.getElementsByTagName("base");
    for (let i = 0; i < e.length; i += 1) {
      if (e[i].href) {
        base = e[i].href;
      }
    }

    e = document.getElementsByTagName("script");
    for (let i = 0; i < e.length; i += 1) {
      if (e[i].src && /(^|\/)jscolor\.js([?#].*)?$/i.test(e[i].src)) {
        const src = new mxURI(e[i].src);
        const srcAbs = src.toAbsolute(base);
        srcAbs.path = srcAbs.path.replace(/[^\/]+$/, ""); // remove filename
        srcAbs.query = null;
        srcAbs.fragment = null;
        return srcAbs.toString();
      }
    }
    return false;
  },

  preload: function () {
    for (const fn in mxJSColor.imgRequire) {
      if (mxJSColor.imgRequire.hasOwnProperty(fn)) {
        mxJSColor.loadImage(fn);
      }
    }
  },

  images: {
    pad: [181, 101],
    sld: [16, 101],
    cross: [15, 15],
    arrow: [7, 11],
  },

  imgRequire: {},
  imgLoaded: {},

  requireImage: function (filename) {
    mxJSColor.imgRequire[filename] = true;
  },

  loadImage: function (filename) {
    if (!mxJSColor.imgLoaded[filename]) {
      mxJSColor.imgLoaded[filename] = new Image();
      mxJSColor.imgLoaded[filename].src = mxJSColor.getDir() + filename;
    }
  },

  fetchElement: function (mixed) {
    return typeof mixed === "string" ? document.getElementById(mixed) : mixed;
  },

  addEvent: function (el, evnt, func) {
    if (el.addEventListener) {
      el.addEventListener(evnt, func, false);
    } else if (el.attachEvent) {
      el.attachEvent("on" + evnt, func);
    }
  },

  fireEvent: function (el, evnt) {
    if (!el) {
      return;
    }
    if (document.createEvent) {
      const ev = document.createEvent("HTMLEvents");
      ev.initEvent(evnt, true, true);
      el.dispatchEvent(ev);
    } else if (document.createEventObject) {
      const ev = document.createEventObject();
      el.fireEvent("on" + evnt, ev);
    } else if (el["on" + evnt]) {
      // alternatively use the traditional event model (IE5)
      el["on" + evnt]();
    }
  },

  getElementPos: function (e) {
    let e1 = e,
      e2 = e;
    let x = 0,
      y = 0;
    if (e1.offsetParent) {
      do {
        x += e1.offsetLeft;
        y += e1.offsetTop;
      } while ((e1 = e1.offsetParent));
    }
    while ((e2 = e2.parentNode) && e2.nodeName.toUpperCase() !== "BODY") {
      x -= e2.scrollLeft;
      y -= e2.scrollTop;
    }
    return [x, y];
  },

  getElementSize: function (e) {
    return [e.offsetWidth, e.offsetHeight];
  },

  getRelMousePos: function (e) {
    let x = 0,
      y = 0;
    if (!e) {
      e = window.event;
    }
    if (typeof e.offsetX === "number") {
      x = e.offsetX;
      y = e.offsetY;
    } else if (typeof e.layerX === "number") {
      x = e.layerX;
      y = e.layerY;
    }
    return { x: x, y: y };
  },

  getViewPos: function () {
    if (typeof window.pageYOffset === "number") {
      return [window.pageXOffset, window.pageYOffset];
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
      return [document.body.scrollLeft, document.body.scrollTop];
    } else if (
      document.documentElement &&
      (document.documentElement.scrollLeft || document.documentElement.scrollTop)
    ) {
      return [document.documentElement.scrollLeft, document.documentElement.scrollTop];
    } else {
      return [0, 0];
    }
  },

  getViewSize: function () {
    if (typeof window.innerWidth === "number") {
      return [window.innerWidth, window.innerHeight];
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
      return [document.body.clientWidth, document.body.clientHeight];
    } else if (
      document.documentElement &&
      (document.documentElement.clientWidth || document.documentElement.clientHeight)
    ) {
      return [document.documentElement.clientWidth, document.documentElement.clientHeight];
    } else {
      return [0, 0];
    }
  },
};

export function mxURI(uri) {
  // See RFC3986
  const obj = {};
  obj.scheme = null;
  obj.authority = null;
  obj.path = "";
  obj.query = null;
  obj.fragment = null;

  obj.parse = function (uri) {
    const m = uri.match(
      /^(([A-Za-z][0-9A-Za-z+.-]*)(:))?((\/\/)([^\/?#]*))?([^?#]*)((\?)([^#]*))?((#)(.*))?/
    );
    obj.scheme = m[3] ? m[2] : null;
    obj.authority = m[5] ? m[6] : null;
    obj.path = m[7];
    obj.query = m[9] ? m[10] : null;
    obj.fragment = m[12] ? m[13] : null;
    return obj;
  };

  obj.toString = function () {
    let result = "";
    if (obj.scheme !== null) {
      result = result + obj.scheme + ":";
    }
    if (obj.authority !== null) {
      result = result + "//" + obj.authority;
    }
    if (obj.path !== null) {
      result = result + obj.path;
    }
    if (obj.query !== null) {
      result = result + "?" + obj.query;
    }
    if (obj.fragment !== null) {
      result = result + "#" + obj.fragment;
    }
    return result;
  };

  obj.toAbsolute = function (base) {
    var base = new mxURI(base);
    const r = obj;
    const t = new mxURI();

    if (base.scheme === null) {
      return false;
    }

    if (r.scheme !== null && r.scheme.toLowerCase() === base.scheme.toLowerCase()) {
      r.scheme = null;
    }

    if (r.scheme !== null) {
      t.scheme = r.scheme;
      t.authority = r.authority;
      t.path = removeDotSegments(r.path);
      t.query = r.query;
    } else {
      if (r.authority !== null) {
        t.authority = r.authority;
        t.path = removeDotSegments(r.path);
        t.query = r.query;
      } else {
        if (r.path === "") {
          // TODO: == or === ?
          t.path = base.path;
          if (r.query !== null) {
            t.query = r.query;
          } else {
            t.query = base.query;
          }
        } else {
          if (r.path.substr(0, 1) === "/") {
            t.path = removeDotSegments(r.path);
          } else {
            if (base.authority !== null && base.path === "") {
              // TODO: == or === ?
              t.path = "/" + r.path;
            } else {
              t.path = base.path.replace(/[^\/]+$/, "") + r.path;
            }
            t.path = removeDotSegments(t.path);
          }
          t.query = r.query;
        }
        t.authority = base.authority;
      }
      t.scheme = base.scheme;
    }
    t.fragment = r.fragment;

    return t;
  };

  function removeDotSegments(path) {
    let out = "";
    while (path) {
      if (path.substr(0, 3) === "../" || path.substr(0, 2) === "./") {
        path = path.replace(/^\.+/, "").substr(1);
      } else if (path.substr(0, 3) === "/./" || path === "/.") {
        path = "/" + path.substr(3);
      } else if (path.substr(0, 4) === "/../" || path === "/..") {
        path = "/" + path.substr(4);
        out = out.replace(/\/?[^\/]*$/, "");
      } else if (path === "." || path === "..") {
        path = "";
      } else {
        const rm = path.match(/^\/?[^\/]*/)[0];
        path = path.substr(rm.length);
        out = out + rm;
      }
    }
    return out;
  }

  if (uri) {
    obj.parse(uri);
  }
  return obj;
}

/*
 * Usage example:
 * const myColor = new mxColor(myInputElement)
 */

export function mxColor(target, prop) {
  const obj = {};
  obj.required = true; // refuse empty values?
  obj.adjust = true; // adjust value to uniform notation?
  obj.hash = false; // prefix color with # symbol?
  obj.caps = true; // uppercase?
  obj.slider = true; // show the value/saturation slider?
  obj.valueElement = target; // value holder
  obj.styleElement = target; // where to reflect current color
  obj.onImmediateChange = null; // onchange callback (can be either string or function)
  obj.hsv = [0, 0, 1]; // read-only  0-6, 0-1, 0-1
  obj.rgb = [1, 1, 1]; // read-only  0-1, 0-1, 0-1

  obj.pickerOnfocus = true; // display picker on focus?
  obj.pickerMode = "HSV"; // HSV | HVS
  obj.pickerPosition = "bottom"; // left | right | top | bottom
  obj.pickerSmartPosition = true; // automatically adjust picker position when necessary
  obj.pickerButtonHeight = 20; // px
  obj.pickerClosable = false;
  obj.pickerCloseText = "Close";
  obj.pickerButtonColor = "ButtonText"; // px
  obj.pickerFace = 0; // px
  obj.pickerFaceColor = "ThreeDFace"; // CSS color
  obj.pickerBorder = 1; // px
  obj.pickerBorderColor = "ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight"; // CSS color
  obj.pickerInset = 1; // px
  obj.pickerInsetColor = "ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow"; // CSS color
  obj.pickerZIndex = 10000;

  for (const p in prop) {
    if (prop.hasOwnProperty(p)) {
      obj[p] = prop[p];
    }
  }

  obj.hidePicker = function () {
    if (isPickerOwner()) {
      removePicker();
    }
  };

  obj.showPicker = function () {
    if (!isPickerOwner()) {
      drawPicker(0, 0);
    }
  };

  obj.importColor = function () {
    if (!valueElement) {
      obj.exportColor();
    } else {
      if (!obj.adjust) {
        if (!obj.fromString(valueElement.value, leaveValue)) {
          styleElement.style.backgroundImage = styleElement.jscStyle.backgroundImage;
          styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
          styleElement.style.color = styleElement.jscStyle.color;
          obj.exportColor(leaveValue | leaveStyle);
        }
      } else if (!obj.required && /^\s*$/.test(valueElement.value)) {
        valueElement.value = "";
        styleElement.style.backgroundImage = styleElement.jscStyle.backgroundImage;
        styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
        styleElement.style.color = styleElement.jscStyle.color;
        obj.exportColor(leaveValue | leaveStyle);
      } else if (obj.fromString(valueElement.value)) {
        // OK
      } else {
        obj.exportColor();
      }
    }
  };

  obj.exportColor = function (flags) {
    if (!(flags & leaveValue) && valueElement) {
      let value = obj.toString();
      if (obj.caps) {
        value = value.toUpperCase();
      }
      if (obj.hash) {
        value = "#" + value;
      }
      valueElement.value = value;
    }
    if (!(flags & leaveStyle) && styleElement) {
      styleElement.style.backgroundImage = "none";
      styleElement.style.backgroundColor = "#" + obj.toString();
      styleElement.style.color =
        0.213 * obj.rgb[0] + 0.715 * obj.rgb[1] + 0.072 * obj.rgb[2] < 0.5 ? "#FFF" : "#000";
    }
    if (!(flags & leavePad) && isPickerOwner()) {
      redrawPad();
    }
    if (!(flags & leaveSld) && isPickerOwner()) {
      redrawSld();
    }
  };

  obj.fromHSV = function (h, s, v, flags) {
    // null = don't change
    (h < 0 && (h = 0)) || (h > 6 && (h = 6));
    (s < 0 && (s = 0)) || (s > 1 && (s = 1));
    (v < 0 && (v = 0)) || (v > 1 && (v = 1));
    obj.rgb = HSV_RGB(
      h === null ? obj.hsv[0] : (obj.hsv[0] = h),
      s === null ? obj.hsv[1] : (obj.hsv[1] = s),
      v === null ? obj.hsv[2] : (obj.hsv[2] = v)
    );
    obj.exportColor(flags);
  };

  obj.fromRGB = function (r, g, b, flags) {
    // null = don't change
    (r < 0 && (r = 0)) || (r > 1 && (r = 1));
    (g < 0 && (g = 0)) || (g > 1 && (g = 1));
    (b < 0 && (b = 0)) || (b > 1 && (b = 1));
    const hsv = RGB_HSV(
      r === null ? obj.rgb[0] : (obj.rgb[0] = r),
      g === null ? obj.rgb[1] : (obj.rgb[1] = g),
      b === null ? obj.rgb[2] : (obj.rgb[2] = b)
    );
    if (hsv[0] !== null) {
      obj.hsv[0] = hsv[0];
    }
    if (hsv[2] !== 0) {
      obj.hsv[1] = hsv[1];
    }
    obj.hsv[2] = hsv[2];
    obj.exportColor(flags);
  };

  obj.fromString = function (hex, flags) {
    const m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);
    if (!m) {
      return false;
    } else {
      if (m[1].length === 6) {
        // 6-char notation
        obj.fromRGB(
          parseInt(m[1].substr(0, 2), 16) / 255,
          parseInt(m[1].substr(2, 2), 16) / 255,
          parseInt(m[1].substr(4, 2), 16) / 255,
          flags
        );
      } else {
        // 3-char notation
        obj.fromRGB(
          parseInt(m[1].charAt(0) + m[1].charAt(0), 16) / 255,
          parseInt(m[1].charAt(1) + m[1].charAt(1), 16) / 255,
          parseInt(m[1].charAt(2) + m[1].charAt(2), 16) / 255,
          flags
        );
      }
      return true;
    }
  };

  obj.toString = function () {
    return (
      (0x100 | Math.round(255 * obj.rgb[0])).toString(16).substr(1) +
      (0x100 | Math.round(255 * obj.rgb[1])).toString(16).substr(1) +
      (0x100 | Math.round(255 * obj.rgb[2])).toString(16).substr(1)
    );
  };

  function RGB_HSV(r, g, b) {
    const n = Math.min(Math.min(r, g), b);
    const v = Math.max(Math.max(r, g), b);
    const m = v - n;
    if (m === 0) {
      return [null, 0, v];
    }
    const h = r === n ? 3 + (b - g) / m : g === n ? 5 + (r - b) / m : 1 + (g - r) / m;
    return [h === 6 ? 0 : h, m / v, v];
  }

  function HSV_RGB(h, s, v) {
    if (h === null) {
      return [v, v, v];
    }
    const i = Math.floor(h);
    const f = i % 2 ? h - i : 1 - (h - i);
    const m = v * (1 - s);
    const n = v * (1 - s * f);
    switch (i) {
      case 6:
      case 0:
        return [v, n, m];
      case 1:
        return [n, v, m];
      case 2:
        return [m, v, n];
      case 3:
        return [m, n, v];
      case 4:
        return [n, m, v];
      case 5:
        return [v, m, n];
    }
  }

  function removePicker() {
    delete mxJSColor.picker.owner;
    document.getElementsByTagName("body")[0].removeChild(mxJSColor.picker.boxB);
  }

  function drawPicker(x, y) {
    if (!mxJSColor.picker) {
      mxJSColor.picker = {
        box: document.createElement("div"),
        boxB: document.createElement("div"),
        pad: document.createElement("div"),
        padB: document.createElement("div"),
        padM: document.createElement("div"),
        sld: document.createElement("div"),
        sldB: document.createElement("div"),
        sldM: document.createElement("div"),
        btn: document.createElement("div"),
        btnS: document.createElement("span"),
        btnT: document.createTextNode(obj.pickerCloseText),
      };
      for (let i = 0, segSize = 4; i < mxJSColor.images.sld[1]; i += segSize) {
        const seg = document.createElement("div");
        seg.style.height = segSize + "px";
        seg.style.fontSize = "1px";
        seg.style.lineHeight = "0";
        mxJSColor.picker.sld.appendChild(seg);
      }
      mxJSColor.picker.sldB.appendChild(mxJSColor.picker.sld);
      mxJSColor.picker.box.appendChild(mxJSColor.picker.sldB);
      mxJSColor.picker.box.appendChild(mxJSColor.picker.sldM);
      mxJSColor.picker.padB.appendChild(mxJSColor.picker.pad);
      mxJSColor.picker.box.appendChild(mxJSColor.picker.padB);
      mxJSColor.picker.box.appendChild(mxJSColor.picker.padM);
      mxJSColor.picker.btnS.appendChild(mxJSColor.picker.btnT);
      mxJSColor.picker.btn.appendChild(mxJSColor.picker.btnS);
      mxJSColor.picker.box.appendChild(mxJSColor.picker.btn);
      mxJSColor.picker.boxB.appendChild(mxJSColor.picker.box);
    }

    const p = mxJSColor.picker;

    // controls interaction
    p.box.onmouseup = p.box.onmouseout = function () {
      if (!mxClient.IS_TOUCH) {
        target.focus();
      }
    };
    p.box.onmousemove = function (e) {
      if (holdPad || holdSld) {
        holdPad && setPad(e);
        holdSld && setSld(e);
        if (document.selection) {
          document.selection.empty();
        } else if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
        dispatchImmediateChange();
      }
    };
    p.padM.onmouseup = p.padM.onmouseout = function () {
      if (holdPad) {
        holdPad = false;
        mxJSColor.fireEvent(valueElement, "change");
      }
    };
    p.padM.onmousedown = function (e) {
      // if the slider is at the bottom, move it up
      switch (modeID) {
        case 0:
          if (obj.hsv[2] === 0) {
            obj.fromHSV(null, null, 1.0);
          }
          break;
        case 1:
          if (obj.hsv[1] === 0) {
            obj.fromHSV(null, 1.0, null);
          }
          break;
      }
      holdPad = true;
      setPad(e);
      dispatchImmediateChange();
    };
    p.sldM.onmouseup = p.sldM.onmouseout = function () {
      if (holdSld) {
        holdSld = false;
        mxJSColor.fireEvent(valueElement, "change");
      }
    };
    p.sldM.onmousedown = function (e) {
      holdSld = true;
      setSld(e);
      dispatchImmediateChange();
    };

    // picker
    const dims = getPickerDims(obj);
    p.box.style.width = dims[0] + "px";
    p.box.style.height = dims[1] + "px";

    // picker border
    p.boxB.style.position = "absolute";
    p.boxB.style.clear = "both";
    p.boxB.style.left = x + "px";
    p.boxB.style.top = y + "px";
    p.boxB.style.zIndex = obj.pickerZIndex;
    p.boxB.style.border = obj.pickerBorder + "px solid";
    p.boxB.style.borderColor = obj.pickerBorderColor;
    p.boxB.style.background = obj.pickerFaceColor;

    // pad image
    p.pad.style.width = mxJSColor.images.pad[0] + "px";
    p.pad.style.height = mxJSColor.images.pad[1] + "px";

    // pad border
    p.padB.style.position = "absolute";
    p.padB.style.left = obj.pickerFace + "px";
    p.padB.style.top = obj.pickerFace + "px";
    p.padB.style.border = obj.pickerInset + "px solid";
    p.padB.style.borderColor = obj.pickerInsetColor;

    // pad mouse area
    p.padM.style.position = "absolute";
    p.padM.style.left = "0";
    p.padM.style.top = "0";
    p.padM.style.width =
      obj.pickerFace +
      2 * obj.pickerInset +
      mxJSColor.images.pad[0] +
      mxJSColor.images.arrow[0] +
      "px";
    p.padM.style.height = p.box.style.height;
    p.padM.style.cursor = "crosshair";

    // slider image
    p.sld.style.overflow = "hidden";
    p.sld.style.width = mxJSColor.images.sld[0] + "px";
    p.sld.style.height = mxJSColor.images.sld[1] + "px";

    // slider border
    p.sldB.style.display = obj.slider ? "block" : "none";
    p.sldB.style.position = "absolute";
    p.sldB.style.right = obj.pickerFace + "px";
    p.sldB.style.top = obj.pickerFace + "px";
    p.sldB.style.border = obj.pickerInset + "px solid";
    p.sldB.style.borderColor = obj.pickerInsetColor;

    // slider mouse area
    p.sldM.style.display = obj.slider ? "block" : "none";
    p.sldM.style.position = "absolute";
    p.sldM.style.right = "0";
    p.sldM.style.top = "0";
    p.sldM.style.width =
      mxJSColor.images.sld[0] +
      mxJSColor.images.arrow[0] +
      obj.pickerFace +
      2 * obj.pickerInset +
      "px";
    p.sldM.style.height = p.box.style.height;
    try {
      p.sldM.style.cursor = "pointer";
    } catch (eOldIE) {
      p.sldM.style.cursor = "hand";
    }

    // "close" button
    function setBtnBorder() {
      const insetColors = obj.pickerInsetColor.split(/\s+/);
      const pickerOutsetColor =
        insetColors.length < 2
          ? insetColors[0]
          : insetColors[1] + " " + insetColors[0] + " " + insetColors[0] + " " + insetColors[1];
      p.btn.style.borderColor = pickerOutsetColor;
    }
    p.btn.style.display = obj.pickerClosable ? "block" : "none";
    p.btn.style.position = "absolute";
    p.btn.style.left = obj.pickerFace + "px";
    p.btn.style.bottom = obj.pickerFace + "px";
    p.btn.style.padding = "0 15px";
    p.btn.style.height = "18px";
    p.btn.style.border = obj.pickerInset + "px solid";
    setBtnBorder();
    p.btn.style.color = obj.pickerButtonColor;
    p.btn.style.font = "12px sans-serif";
    p.btn.style.textAlign = "center";
    try {
      p.btn.style.cursor = "pointer";
    } catch (eOldIE) {
      p.btn.style.cursor = "hand";
    }
    p.btn.onmousedown = function () {
      obj.hidePicker();
    };
    p.btnS.style.lineHeight = p.btn.style.height;

    // load images in optimal order
    switch (modeID) {
      case 0:
        var padImg = "hs.png";
        break;
      case 1:
        var padImg = "hv.png";
        break;
    }
    p.padM.style.backgroundImage = `url('${base64["cross"]}')`;
    p.padM.style.backgroundRepeat = "no-repeat";
    p.sldM.style.backgroundImage = `url('${base64["arrow"]}')`;
    p.sldM.style.backgroundRepeat = "no-repeat";
    p.pad.style.backgroundImage = `url('${base64[padImg.replace(".png", "")]}')`;
    p.pad.style.backgroundRepeat = "no-repeat";
    p.pad.style.backgroundPosition = "0 0";

    // place pointers
    redrawPad();
    redrawSld();

    mxJSColor.picker.owner = obj;
    document.getElementsByTagName("body")[0].appendChild(p.boxB);
  }

  function getPickerDims(o) {
    const dims = [
      2 * o.pickerInset +
        2 * o.pickerFace +
        mxJSColor.images.pad[0] +
        (o.slider
          ? 2 * o.pickerInset + 2 * mxJSColor.images.arrow[0] + mxJSColor.images.sld[0]
          : 0),
      o.pickerClosable
        ? 4 * o.pickerInset + 3 * o.pickerFace + mxJSColor.images.pad[1] + o.pickerButtonHeight
        : 2 * o.pickerInset + 2 * o.pickerFace + mxJSColor.images.pad[1],
    ];
    return dims;
  }

  function redrawPad() {
    // redraw the pad pointer
    switch (modeID) {
      case 0:
        var yComponent = 1;
        break;
      case 1:
        var yComponent = 2;
        break;
    }
    const x = Math.round((obj.hsv[0] / 6) * (mxJSColor.images.pad[0] - 1));
    const y = Math.round((1 - obj.hsv[yComponent]) * (mxJSColor.images.pad[1] - 1));
    mxJSColor.picker.padM.style.backgroundPosition =
      obj.pickerFace +
      obj.pickerInset +
      x -
      Math.floor(mxJSColor.images.cross[0] / 2) +
      "px " +
      (obj.pickerFace + obj.pickerInset + y - Math.floor(mxJSColor.images.cross[1] / 2)) +
      "px";

    // redraw the slider image
    const seg = mxJSColor.picker.sld.childNodes;

    switch (modeID) {
      case 0:
        var rgb = HSV_RGB(obj.hsv[0], obj.hsv[1], 1);
        for (var i = 0; i < seg.length; i += 1) {
          seg[i].style.backgroundColor =
            "rgb(" +
            rgb[0] * (1 - i / seg.length) * 100 +
            "%," +
            rgb[1] * (1 - i / seg.length) * 100 +
            "%," +
            rgb[2] * (1 - i / seg.length) * 100 +
            "%)";
        }
        break;
      case 1:
        var rgb,
          s,
          c = [obj.hsv[2], 0, 0];
        var i = Math.floor(obj.hsv[0]);
        var f = i % 2 ? obj.hsv[0] - i : 1 - (obj.hsv[0] - i);
        switch (i) {
          case 6:
          case 0:
            rgb = [0, 1, 2];
            break;
          case 1:
            rgb = [1, 0, 2];
            break;
          case 2:
            rgb = [2, 0, 1];
            break;
          case 3:
            rgb = [2, 1, 0];
            break;
          case 4:
            rgb = [1, 2, 0];
            break;
          case 5:
            rgb = [0, 2, 1];
            break;
        }
        for (var i = 0; i < seg.length; i += 1) {
          s = 1 - (1 / (seg.length - 1)) * i;
          c[1] = c[0] * (1 - s * f);
          c[2] = c[0] * (1 - s);
          seg[i].style.backgroundColor =
            "rgb(" + c[rgb[0]] * 100 + "%," + c[rgb[1]] * 100 + "%," + c[rgb[2]] * 100 + "%)";
        }
        break;
    }
  }

  function redrawSld() {
    // redraw the slider pointer
    switch (modeID) {
      case 0:
        var yComponent = 2;
        break;
      case 1:
        var yComponent = 1;
        break;
    }
    const y = Math.round((1 - obj.hsv[yComponent]) * (mxJSColor.images.sld[1] - 1));
    mxJSColor.picker.sldM.style.backgroundPosition =
      "0 " +
      (obj.pickerFace + obj.pickerInset + y - Math.floor(mxJSColor.images.arrow[1] / 2)) +
      "px";
  }

  function isPickerOwner() {
    return mxJSColor.picker && mxJSColor.picker.owner === obj;
  }

  function blurValue() {
    if (valueElement !== target) {
      obj.importColor();
    }
  }

  function setPad(e) {
    const mpos = mxJSColor.getRelMousePos(e);
    const x = mpos.x - obj.pickerFace - obj.pickerInset;
    const y = mpos.y - obj.pickerFace - obj.pickerInset;
    switch (modeID) {
      case 0:
        obj.fromHSV(
          x * (6 / (mxJSColor.images.pad[0] - 1)),
          1 - y / (mxJSColor.images.pad[1] - 1),
          null,
          leaveSld
        );
        break;
      case 1:
        obj.fromHSV(
          x * (6 / (mxJSColor.images.pad[0] - 1)),
          null,
          1 - y / (mxJSColor.images.pad[1] - 1),
          leaveSld
        );
        break;
    }
  }

  function setSld(e) {
    const mpos = mxJSColor.getRelMousePos(e);
    const y = mpos.y - obj.pickerFace - obj.pickerInset;
    switch (modeID) {
      case 0:
        obj.fromHSV(null, null, 1 - y / (mxJSColor.images.sld[1] - 1), leavePad);
        break;
      case 1:
        obj.fromHSV(null, 1 - y / (mxJSColor.images.sld[1] - 1), null, leavePad);
        break;
    }
  }

  function dispatchImmediateChange() {
    if (obj.onImmediateChange) {
      obj.onImmediateChange(obj);
    }
  }

  var modeID = obj.pickerMode.toLowerCase() === "hvs" ? 1 : 0;
  var valueElement = mxJSColor.fetchElement(obj.valueElement),
    styleElement = mxJSColor.fetchElement(obj.styleElement);
  var holdPad = false,
    holdSld = false;
  var leaveValue = 1 << 0,
    leaveStyle = 1 << 1,
    leavePad = 1 << 2,
    leaveSld = 1 << 3;

  // valueElement
  if (valueElement) {
    const updateField = function () {
      obj.fromString(valueElement.value, leaveValue);
      dispatchImmediateChange();
    };
    mxJSColor.addEvent(valueElement, "keyup", updateField);
    mxJSColor.addEvent(valueElement, "input", updateField);
    mxJSColor.addEvent(valueElement, "blur", blurValue);
    valueElement.setAttribute("autocomplete", "off");
  }

  // styleElement
  if (styleElement) {
    styleElement.jscStyle = {
      backgroundImage: styleElement.style.backgroundImage,
      backgroundColor: styleElement.style.backgroundColor,
      color: styleElement.style.color,
    };
  }

  // require images
  switch (modeID) {
    case 0:
      mxJSColor.requireImage("hs.png");
      break;
    case 1:
      mxJSColor.requireImage("hv.png");
      break;
  }
  mxJSColor.requireImage("cross.gif");
  mxJSColor.requireImage("arrow.gif");

  obj.importColor();
  return obj;
}
