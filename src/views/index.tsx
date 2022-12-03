import styles from "./index.module.scss";
import React, { FC, useState } from "react";
import { XML_DATA } from "./data";
import { convertToSVG } from "src/core/utils/convert";
export const DiagramExample: FC = () => {
  const convert = () => {
    console.log(convertToSVG(XML_DATA));
  };

  return (
    <div>
      <div>
        <textarea cols={30} rows={10} value={XML_DATA} disabled></textarea>
        <button onClick={convert}>转换</button>
      </div>
    </div>
  );
};
