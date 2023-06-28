import { useEffect, useState } from "react";
import axios from "axios";
import { Highlight, themes } from "prism-react-renderer";

export function FileDetail({ path }: { path: string }) {
  const [detail, setDetail] = useState("");
  const [language, setLang] = useState("");

  const fetchDetail = async (path: string) => {
    axios({
      method: "GET",
      url: `/get-file-content?url=${encodeURIComponent(path)}`,
      responseType: "text",
    }).then((res) => {
      if (path.includes(".html")) {
        setLang("html");
      }
      if (path.includes(".css")) {
        setLang("css");
      }
      if (path.includes(".tsx")) {
        setLang("tsx");
      }
      if (path.includes(".json")) {
        setLang("json");
      }
      if (path.includes(".js")) {
        setLang("js");
      }
      setDetail(res.data);
    });
  };

  useEffect(() => {
    fetchDetail(path);
  }, [path]);

  return (
    <Highlight theme={themes.shadesOfPurple} code={detail} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <div className="file-content" style={{ display: "flex", ...style }}>
          <pre className="lines" style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="line-num">{i + 1}</span>
              </div>
            ))}
          </pre>
          <pre className="code-editor" style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {/* <span className="line-num">{i + 1}</span> */}
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        </div>
      )}
    </Highlight>
  );
}