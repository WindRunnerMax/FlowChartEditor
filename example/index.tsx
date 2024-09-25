import "./index.css";
import "../dist/es/index.css";
import ReactDOM from "react-dom";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { SVG_DATA, XML_DATA } from "./constant";
import { clearElement } from "./utils";
import { loadEditor, loadViewer } from "./loader";
import { stringToXml, xmlToString } from "../dist/es/utils/xml";
import { base64ToSvgString, stringToSvg } from "../dist/es/utils/svg";
import { getLanguage } from "../dist/es/editor/i18n";
import { EditorBus } from "../dist/es/event";

const DiagramExample: FC = () => {
  const [loading, setLoading] = useState(true);
  const [xmlExample, setXMLExample] = useState(XML_DATA);
  const [svgExample, setSVGExample] = useState(SVG_DATA);
  const xmlExampleContainer = useRef<HTMLDivElement>(null);
  const svgExampleContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Preload Diagram
    Promise.all([loadEditor(), loadViewer()]).then(() => {
      setLoading(false);
    });
  }, []);

  const convertXML = (xml: string = xmlExample) => {
    const div = xmlExampleContainer.current;
    if (div) {
      loadViewer().then(Viewer => {
        const diagramViewer = new Viewer(stringToXml(xml));
        const svg = diagramViewer.renderSVG(null, 1, 1);
        diagramViewer.destroy();
        clearElement(div);
        svg && div.appendChild(svg);
      });
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

  const editXML = async () => {
    const Editor = await loadEditor();
    const diagramEditor = new Editor(document.body, () => {
      diagramEditor.exit();
    });
    const lang = await getLanguage("zh");
    diagramEditor.start(lang, stringToXml(xmlExample), (xml: Node) => {
      const xmlString = xmlToString(xml);
      xmlString && setXMLExample(xmlString);
      xmlString && convertXML(xmlString);
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
      {loading ? (
        <>资源加载中...</>
      ) : (
        <>
          <div>MxGraph XML</div>
          <div className="example">
            <div>
              <textarea cols={30} rows={10} value={xmlExample} disabled></textarea>
            </div>
            <div className="buttonGroup">
              <button onClick={() => convertXML()}>显示图像</button>
              <button onClick={editXML}>在线编辑</button>
            </div>
            <div ref={xmlExampleContainer}></div>
          </div>

          <div>DrawIO SVG</div>
          <div className="example">
            <div>
              <textarea cols={30} rows={10} value={svgExample} disabled></textarea>
            </div>
            <div className="buttonGroup">
              <button onClick={() => convertSVG()}>显示图像</button>
              <button onClick={editSVG}>在线编辑</button>
            </div>
            <div ref={svgExampleContainer}></div>
          </div>
        </>
      )}
    </div>
  );
};

ReactDOM.render(<DiagramExample />, document.getElementById("root"));
