import { EditorEvents } from "./event";
import { Config, DEFAULT_URL, ExportMsg, MESSAGE_EVENT, SaveMsg } from "./interface";

export class EditorBus extends EditorEvents {
  private lock: boolean;
  protected url: string;
  private config: Config;
  protected iframe: HTMLIFrameElement | null;

  constructor(config: Config = { format: "xml" }) {
    super();
    this.lock = false;
    this.config = config;
    this.url = config.url || DEFAULT_URL;
    this.iframe = document.createElement("iframe");
  }

  public startEdit = () => {
    if (this.lock || !this.iframe) return void 0;
    this.lock = true;
    const iframe = this.iframe;
    const url =
      `${this.url}?` +
      [
        "embed=1",
        "spin=1",
        "proto=json",
        "configure=1",
        "noSaveBtn=1",
        "stealth=1",
        "libraries=0",
      ].join("&");
    iframe.setAttribute("src", url);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute(
      "style",
      "position:fixed;top:0;left:0;width:100%;height:100%;background-color:#fff;"
    );
    iframe.className = "drawio-iframe-container";
    document.body.style.overflow = "hidden";
    document.body.appendChild(iframe);
    window.addEventListener(MESSAGE_EVENT, this.handleMessageEvent);
  };

  public exitEdit = () => {
    this.lock = false;
    this.iframe && document.body.removeChild(this.iframe);
    this.iframe = null;
    document.body.style.overflow = "";
    window.removeEventListener(MESSAGE_EVENT, this.handleMessageEvent);
  };

  onConfig(): void {
    this.config.onConfig
      ? this.config.onConfig()
      : this.postMessage({
          action: "configure",
          config: {
            compressXml: this.config.compress ?? false,
            css: ".geTabContainer{display:none !important;}",
          },
        });
  }
  onInit(): void {
    this.config.onInit
      ? this.config.onInit()
      : this.postMessage({
          action: "load",
          autosave: 1,
          saveAndExit: "1",
          modified: "unsavedChanges",
          xml: this.config.data,
          title: this.config.title || "流程图",
        });
  }
  onLoad(): void {
    this.config.onLoad && this.config.onLoad();
  }
  onAutoSave(msg: SaveMsg): void {
    this.config.onAutoSave && this.config.onAutoSave(msg.xml);
  }
  onSave(msg: SaveMsg): void {
    this.config.onSave && this.config.onSave(msg.xml);
    if (this.config.onExport) {
      this.postMessage({
        action: "export",
        format: this.config.format,
        xml: msg.xml,
      });
    } else {
      if (msg.exit) this.exitEdit();
    }
  }
  onExit(msg: SaveMsg): void {
    this.config.onExit && this.config.onExit(msg.xml);
    this.exitEdit();
  }
  onExport(msg: ExportMsg): void {
    if (!this.config.onExport) return void 0;
    this.config.onExport(msg.data, this.config.format);
    this.exitEdit();
  }
}

// https://github.com/jgraph/drawio-integration
// https://github.com/jgraph/drawio-tools
// https://www.diagrams.net/doc/faq/supported-url-parameters
// https://www.diagrams.net/doc/faq/configure-diagram-editor
// https://desk.draw.io/support/solutions/articles/16000042544
