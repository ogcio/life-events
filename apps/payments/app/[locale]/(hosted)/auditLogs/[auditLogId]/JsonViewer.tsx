import React from "react";
import styles from "./JsonViewer.module.scss";

export const JsonViewer = ({ json }: { json: Record<string, unknown> }) => {
  const jsonString = JSON.stringify(json, null, 2);

  return (
    <div className={styles.container}>
      <pre>
        <code>
          {jsonString.split("\n").map((line, index) => (
            <div key={index}>
              <span className={styles.lineNumber}>{index + 1}</span>
              <span>{renderHighlightedLine(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

const renderHighlightedLine = (line: string) => {
  const tokens = line
    .split(/("[^"]+":|\b\d+\b|".*?"|true|false|null)/g)
    .filter(Boolean);

  return (
    <>
      {tokens.map((token, index) => {
        let style = {};

        if (/^".+":$/.test(token)) {
          // Keys
          style = { color: "#e06c75" };
        } else if (/^".*"$/.test(token)) {
          // String values
          style = { color: "#98c379" };
        } else if (/^\b\d+\b$/.test(token)) {
          // Number values
          style = { color: "#d19a66" };
        } else if (/true|false|null/.test(token)) {
          // Boolean and null values
          style = { color: "#56b6c2" };
        }

        return (
          <span key={index} style={style}>
            {token}
          </span>
        );
      })}
    </>
  );
};
