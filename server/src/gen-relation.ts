import * as parser from "@babel/parser";
import fs from "fs";
import path from "path";
import traverse from "@babel/traverse";

interface TreeNode {
  id: string;
  relations: string[];
  isRoot: boolean;
}

let root: TreeNode;
const nodes: TreeNode[] = [];
const cwd = process.cwd();

function createNode(filePath: string, isRoot = false): TreeNode {
  return {
    id: filePath,
    relations: [],
    isRoot,
  };
}

const extension = [".tsx", ".ts", ".js"];

function parseFile(filePath: string, tree: TreeNode) {
  console.log(`[log] parseFile: ${filePath}`);
  const directoryPath = path.dirname(filePath);
  const code = fs.readFileSync(filePath);
  const ast = parser.parse(code.toString(), {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const resolve = (_path: string) => {
    let result: string = _path;
    const isLocal = _path[0] === "/" || _path[0] === ".";

    if (isLocal) {
      result = path.resolve(directoryPath, _path);
      if (!path.extname(_path)) {
        for (let it of extension) {
          if (fs.existsSync(result + it)) {
            result += it;
            break;
          }
        }
      }
    }

    if (!nodes.some((it) => it.id === result)) {
      const node = createNode(result);
      if (
        isLocal &&
        fs.existsSync(result) &&
        extension.includes(path.extname(result))
      ) {
        parseFile(result, node);
      }
      nodes.push(node);
    }

    return result;
  };

  traverse(ast, {
    ImportDeclaration(astPath) {
      tree.relations.push(resolve(astPath.node.source.value));
    },
    CallExpression(astPath) {
      if (
        astPath.node.callee.type === "Identifier" &&
        astPath.node.callee.name === "require"
      ) {
        astPath.node.arguments.forEach((node) => {
          if (node.type === "StringLiteral") {
            tree.relations.push(resolve(node.value));
          }
        });
      }
    },
  });
}

const rootPath = "/Users/xiong.gao/Desktop/dep-inspector/ui";
root = createNode(path.resolve(rootPath + "/src/index.tsx"), true);
nodes.push(root);
parseFile(root.id, root);

{
  const formatNodes = JSON.parse(
    JSON.stringify(nodes)
      .replaceAll(cwd + "/", "")
      .replaceAll("relations", "children")
  );
  formatNodes.forEach((it: any) => {
    const children = it.children;
    it.children = children.map((it: any) => {
      return formatNodes.find((el: any) => el.id === it);
    });
  });

  fs.writeFileSync(
    "ui/public/up-to-bottom.js",
    "var data = " +
      JSON.stringify(formatNodes[0])
        .replaceAll("id", "name")
        .replaceAll(rootPath, "")
  );
}
