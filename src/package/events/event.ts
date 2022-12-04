import { EditorMsg, ExportMsg, InitMsg, SaveMsg } from "./interface";

export abstract class EditorEvents {
  protected abstract url: string;
  protected abstract iframe: HTMLIFrameElement | null;

  abstract onInit(msg: InitMsg): void;
  abstract onLoad(msg: InitMsg): void;
  abstract onConfig(msg: InitMsg): void;
  abstract onAutoSave(msg: SaveMsg): void;
  abstract onSave(msg: SaveMsg): void;
  abstract onExit(msg: SaveMsg): void;
  abstract onExport(msg: ExportMsg): void;

  protected postMessage = (message: unknown) => {
    this.iframe &&
      this.iframe.contentWindow &&
      this.iframe.contentWindow.postMessage(message, this.url);
  };

  protected handleMessageEvent = (event: MessageEvent) => {
    if (this.iframe && event.source === this.iframe.contentWindow && event.data) {
      try {
        const msg = JSON.parse(event.data) as EditorMsg;
        this.handleMessage(msg);
        console.log("msg", msg);
      } catch (error) {
        console.log("MessageEvent Error", Error);
      }
    }
  };

  private handleMessage = (msg: EditorMsg) => {
    switch (msg.event) {
      case "init":
        return this.onInit(msg);
      case "load":
        return this.onLoad(msg);
      case "config":
        return this.onConfig(msg);
      case "autosave":
        return this.onAutoSave(msg);
      case "save":
        return this.onSave(msg);
      case "export":
        return this.onExport(msg);
      case "exit":
        return this.onExit(msg);
    }
  };
}
