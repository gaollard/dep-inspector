const parser = require("@babel/parser");
const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;

module.exports = function parseFileDep(filePath, isRecursive) {
  const _nodes = [];
  const _extension = [".tsx", ".ts", ".js"];
  const node = createNode(path.resolve(filePath), true);
  _nodes.push(node);

  if (!_extension.includes(path.extname(filePath))) {
    return node;
  }

  _parseFile(node.id, node);

  function createNode(filePath, isRoot = false) {
    return {
      id: filePath,
      name: filePath,
      children: [],
      isRoot,
    };
  }

  function _parseFile(filePath, fileNode) {
    console.log(`[log] _parseFile: ${filePath}`);
    const directoryPath = path.dirname(filePath);

    const code = fs.readFileSync(filePath);
    const ast = parser.parse(code.toString(), {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    const resolve = (_path) => {
      let result = _path;
      const isLocal = _path[0] === "/" || _path[0] === ".";
      if (isLocal) {
        result = path.resolve(directoryPath, _path);
        if (!path.extname(_path)) {
          for (let it of _extension) {
            if (fs.existsSync(result + it)) {
              result += it;
              break;
            }
          }
        }
      }
      if (!_nodes.some((it) => it.id === result)) {
        const node = createNode(result);
        if (
          isRecursive &&
          isLocal &&
          fs.existsSync(result) &&
          _extension.includes(path.extname(result))
        ) {
          _parseFile(result, node);
        }
        _nodes.push(node);
      }
      return result;
    };

    traverse(ast, {
      ImportDeclaration(astPath) {
        fileNode.children.push(resolve(astPath.node.source.value));
      },
      CallExpression(astPath) {
        if (
          astPath.node.callee.type === "Identifier" &&
          astPath.node.callee.name === "require"
        ) {
          astPath.node.arguments.forEach((node) => {
            if (node.type === "StringLiteral") {
              fileNode.children.push(resolve(node.value));
            }
          });
        }
      },
    });
  }

  return node;
};
