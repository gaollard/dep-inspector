import { useEffect, useRef } from "react";
import menuRoutes from "./routes.json";
import { TreeNode } from "./MenuItem";

interface Node {
  name: string;
  children?: Node[];
}

function initChart(el: HTMLDivElement, data: any) {
  var myChart = (window as any).echarts.init(el);

  myChart.showLoading();
  myChart.hideLoading();
  myChart.setOption({
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    series: [
      {
        type: "tree",
        data: [data],
        top: "1%",
        left: "7%",
        bottom: "1%",
        right: "20%",
        symbolSize: 7,
        label: {
          position: "left",
          verticalAlign: "middle",
          align: "bottom",
          fontSize: 16,
        },
        leaves: {
          label: {
            position: "right",
            verticalAlign: "middle",
            align: "left",
          },
        },
        emphasis: {
          focus: "descendant",
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
      },
    ],
  });
}

function findNode(filePath: string) {
  let result;
  const traverse = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      if (node.path === filePath) {
        result = node;
      } else {
        traverse(node.children || []);
      }
    });
  };

  traverse(menuRoutes);

  return result;
}

function getDataForUpToBottom(filePath: string) {
  const node = findNode(filePath) as unknown as TreeNode;

  const formatData = (node: TreeNode) => {
    const newNode: Node = {
      name: node.name,
      children: [],
    };

    newNode.children = (node.deps || []).map((it) => {
      const node = findNode(it) as unknown as TreeNode;
      return node
        ? formatData(node)
        : {
            name: it,
          };
    });
  
    return newNode;
  };

  const data = formatData(node);

  return data;

  return {
    name: node.name,
    children: [],
  };
}

function getDataFormBottomToUp(filePath: string) {
  var tNode = findNode(filePath) as unknown as TreeNode;
  var node = { name: tNode.name, children: [] };

  traverse(node, tNode, menuRoutes);

  function traverse(target: Node, source: TreeNode, nodes: TreeNode[]) {
    nodes.forEach((child) => {
      if (child.deps.includes(source.path)) {
        const n = {
          name: child.name,
          children: [],
        };
        target.children!.push(n);
        traverse(n, child, menuRoutes);
      } else {
        if (child.children && child.children.length) {
          traverse(target, source, child.children);
        }
      }
    });
  }

  console.log(tNode);
  console.log(node);

  return node;
}

export function RelationChart({
  isFromUp,
  filePath,
}: {
  isFromUp?: boolean;
  filePath: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initChart(
      ref.current as HTMLDivElement,
      isFromUp
        ? getDataForUpToBottom(filePath)
        : getDataFormBottomToUp(filePath)
    );
  });

  return <div id="top-to-bottom-chart" ref={ref}></div>;
}
