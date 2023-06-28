import menu from "./routes.json";
import { MenuItem } from "./MenuItem";
import { useState } from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { FileDetail } from "./FileDetail";
import { RelationChart } from "./relation-chart";
import { sleep } from "./utils/utils";

sleep()

function App() {
  const [detail, setDetail] = useState("");

  const fetchDetail = async (path: string) => {
    setDetail(path);
  };

  const renderMenu = () => {
    return (
      <div className="menu">
        {menu.map((it, index) => (
          <MenuItem item={it} depth={0} key={index} loadData={fetchDetail} current={detail} />
        ))}
      </div>
    );
  };

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `源代码`,
      children: detail ? <FileDetail path={detail} /> : null,
    },
    {
      key: "2",
      label: `自顶向下树`,
      children: detail ? (
        <RelationChart isFromUp={true} filePath={detail} />
      ) : null,
    },
    {
      key: "3",
      label: `自底向上树`,
      children: detail ? (
        <RelationChart isFromUp={false} filePath={detail} />
      ) : null,
    },
  ];

  return (
    <div className="App">
      <div className="g-side">{renderMenu()}</div>
      <div className="g-content">
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </div>
    </div>
  );
}

export default App;
