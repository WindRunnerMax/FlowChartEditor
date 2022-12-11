import styles from "./index.module.scss";
import { FC, useRef, useState } from "react";
import { SVG_DATA, XML_DATA } from "./constant";
import {
  base64ToSvgString,
  DiagramEditor,
  DiagramViewer,
  EditorBus,
  getLanguage,
  stringToSvg,
  stringToXml,
  xmlToString,
} from "src/packages";
import { clearElement } from "./utils";
import ReactDOM from "react-dom";

export const DiagramExample: FC = () => {
  const [xmlExample, setXMLExample] = useState(XML_DATA);
  const [svgExample, setSVGExample] = useState(SVG_DATA);
  const xmlExampleContainer = useRef<HTMLDivElement>(null);
  const svgExampleContainer = useRef<HTMLDivElement>(null);

  const convertXML = (xml: string = xmlExample) => {
    const div = xmlExampleContainer.current;
    if (div) {
      const diagramViewer = new DiagramViewer(stringToXml(xml));
      const svg = diagramViewer.renderSVG(null, 1, 1);
      clearElement(div);
      svg && div.appendChild(svg);
    }
  };

  const convertSVG = (svgString: string = svgExample) => {
    const div = svgExampleContainer.current;
    if (div) {
      const svg = stringToSvg(svgString);
      clearElement(div);
      svg && div.appendChild(svg);
    }
  };

  const editXML = () => {
    const renderExit = (el: HTMLDivElement) => {
      ReactDOM.render(
        <div onClick={diagramEditor.exit} className="diagram-exit-btn">
          Exit
        </div>,
        el
      );
    };
    const diagramEditor = new DiagramEditor(document.body, renderExit);
    getLanguage("en").then(res => {
      diagramEditor.start(res, stringToXml(xmlExample), (xml: Node) => {
        const xmlString = xmlToString(xml);
        xmlString && setXMLExample(xmlString);
        xmlString && convertXML(xmlString);
      });
    });
  };

  const editSVG = () => {
    const bus = new EditorBus({
      data: svgExample,
      format: "xmlsvg",
      onExport: (svg: string) => {
        const svgStr = base64ToSvgString(svg);
        if (svgStr) {
          setSVGExample(svgStr);
          convertSVG(svgStr);
        }
      },
    });
    bus.startEdit();
  };

  return (
    <div>
      <div>MxGraph XML</div>
      <div className={styles.example}>
        <div>
          <textarea cols={30} rows={10} value={xmlExample} disabled></textarea>
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={() => convertXML()}>显示图像</button>
          <button onClick={editXML}>在线编辑</button>
        </div>
        <div ref={xmlExampleContainer}></div>
      </div>

      <div>DrawIO SVG</div>
      <div className={styles.example}>
        <div>
          <textarea cols={30} rows={10} value={svgExample} disabled></textarea>
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={() => convertSVG()}>显示图像</button>
          <button onClick={editSVG}>在线编辑</button>
        </div>
        <div ref={svgExampleContainer}></div>
      </div>
    </div>
  );
};
