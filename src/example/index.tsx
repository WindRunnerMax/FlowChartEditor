import styles from "./index.module.scss";
import { FC, useRef, useState } from "react";
import { SVG_DATA, XML_DATA } from "./constant";
import { convertXMLToSVG } from "src/packages/utils/convert";
import { base64ToSvgString, EditorBus, stringToSvg, stringToXml } from "src/packages";
import { DiagramEditor } from "src/packages/core/editor";
import { getLanguage } from "src/packages/editor/i18n";
import { clearElement, getDrawIOSvgString } from "./utils";

getLanguage("en").then(res => {
  new DiagramEditor(document.body).start(res, stringToXml(XML_DATA), console.log);
});

export const DiagramExample: FC = () => {
  const [xmlExample, setXMLExample] = useState(XML_DATA);
  const [svgExample, setSVGExample] = useState(SVG_DATA);
  const xmlExampleContainer = useRef<HTMLDivElement>(null);
  const svgExampleContainer = useRef<HTMLDivElement>(null);

  const convertXML = (xml: string = xmlExample) => {
    const div = xmlExampleContainer.current;
    if (div) {
      const svg = convertXMLToSVG(xml);
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
    const bus = new EditorBus({
      data: xmlExample,
      onSave: (xml: string) => {
        const xmlDocument = stringToXml(xml);
        if (xmlDocument) {
          const str = getDrawIOSvgString(xmlDocument) || xml;
          setXMLExample(str);
          convertXML(str);
        }
      },
    });
    bus.startEdit();
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
