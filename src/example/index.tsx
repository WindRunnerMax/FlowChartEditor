import styles from "./index.module.scss";
import { FC, useRef, useState } from "react";
import { SVG_DATA, XML_DATA } from "./constant";
import { convertXMLToSVG } from "src/package/utils/convert";
import { stringToSvg } from "src/package";
export const DiagramExample: FC = () => {
  const [xmlExample, setXMLExample] = useState(XML_DATA);
  const [svgExample, setSVGExample] = useState(SVG_DATA);
  const xmlExampleContainer = useRef<HTMLDivElement>(null);
  const svgExampleContainer = useRef<HTMLDivElement>(null);

  const convertXML = () => {
    const div = xmlExampleContainer.current;
    if (div) {
      const svg = convertXMLToSVG(xmlExample);
      div.childNodes.forEach(node => div.removeChild(node));
      svg && div.appendChild(svg);
    }
  };

  const convertSVG = () => {
    const div = svgExampleContainer.current;
    if (div) {
      const svg = stringToSvg(svgExample);
      div.childNodes.forEach(node => div.removeChild(node));
      svg && div.appendChild(svg);
    }
  };

  return (
    <div>
      <div>XML</div>
      <div className={styles.example}>
        <div>
          <textarea cols={30} rows={10} value={xmlExample} disabled></textarea>
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={convertXML}>显示图像</button>
          <button>在线编辑</button>
        </div>
        <div ref={xmlExampleContainer}></div>
      </div>

      <div>SVG</div>
      <div className={styles.example}>
        <div>
          <textarea cols={30} rows={10} value={svgExample} disabled></textarea>
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={convertSVG}>显示图像</button>
          <button>在线编辑</button>
        </div>
        <div ref={svgExampleContainer}></div>
      </div>
    </div>
  );
};
