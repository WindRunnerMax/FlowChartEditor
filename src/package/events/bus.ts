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
        "ui=atlas",
        "spin=1",
        "proto=json",
        "configure=1",
        "libraries=1",
        "noSaveBtn=1",
      ].join("&");
    iframe.setAttribute("src", url);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute(
      "style",
      "position:absolute;top:0;left:0;width:100%;height:100%;background-color:#fff;"
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
          config: { compressXml: this.config.compress ?? false },
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
          title: "Flow Chart",
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
    if (msg.fmt === "svg") {
      this.config.onExport(msg.svg, "svg");
    } else if (msg.fmt === "xml") {
      this.config.onExport(msg.xml, "xml");
    }
    this.exitEdit();
  }
}
