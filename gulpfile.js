const { src, dest } = require("gulp");
const cleanCSS = require("gulp-clean-css");
const concat = require("gulp-concat");

function build() {
  return src([
    "./src/styles/diagram.css",
    "./src/editor/styles/common.css",
    "./src/editor/styles/grapheditor.css",
  ])
    .pipe(concat("index.css"))
    .pipe(cleanCSS({ compatibility: "*" }))
    .pipe(dest("dist/es"))
    .pipe(dest("dist/lib"));
}

exports.default = build;
