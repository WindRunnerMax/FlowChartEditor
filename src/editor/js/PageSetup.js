/**
 * Change types
 */
export function PageSetup(ui, color, image, format, pageScale) {
  this.ui = ui;
  this.color = color;
  this.previousColor = color;
  this.image = image;
  this.previousImage = image;
  this.format = format;
  this.previousFormat = format;
  this.pageScale = pageScale;
  this.previousPageScale = pageScale;

  // Needed since null are valid values for color and image
  this.ignoreColor = false;
  this.ignoreImage = false;
}

/**
 * Implementation of the undoable page rename.
 */
PageSetup.prototype.execute = function () {
  let tmp = null;
  const graph = this.ui.editor.graph;

  if (!this.ignoreColor) {
    this.color = this.previousColor;
    tmp = graph.background;
    this.ui.setBackgroundColor(this.previousColor);
    this.previousColor = tmp;
  }

  if (!this.ignoreImage) {
    this.image = this.previousImage;
    tmp = graph.backgroundImage;
    this.ui.setBackgroundImage(this.previousImage);
    this.previousImage = tmp;
  }

  if (this.previousFormat != null) {
    this.format = this.previousFormat;
    tmp = graph.pageFormat;

    if (this.previousFormat.width != tmp.width || this.previousFormat.height != tmp.height) {
      this.ui.setPageFormat(this.previousFormat);
      this.previousFormat = tmp;
    }
  }

  if (this.foldingEnabled != null && this.foldingEnabled != this.ui.editor.graph.foldingEnabled) {
    this.ui.setFoldingEnabled(this.foldingEnabled);
    this.foldingEnabled = !this.foldingEnabled;
  }

  if (this.previousPageScale != null) {
    const currentPageScale = this.ui.editor.graph.pageScale;

    if (this.previousPageScale != currentPageScale) {
      this.ui.setPageScale(this.previousPageScale);
      this.previousPageScale = currentPageScale;
    }
  }
};
