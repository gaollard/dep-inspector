const fs = require("fs");
const path = require("path");
const parseFileDep = require('./parse-file-dep');

class Node {
  constructor(path, route, name, depth, leaf) {
    this.path = path;
    this.route = route;
    this.name = name;
    this.depth = depth;
    this.leaf = leaf;
    this.deps = [];
    if (!this.leaf) {
      this.children = [];
    }
  }
}

const rootPath = path.resolve("ui");
const rootNode = new Node(rootPath, rootPath, "ui");
const ignorePath = [path.resolve("ui/node_modules"), path.resolve("ui/.git")];

function read(sPath, parent, depth) {
  const files = fs.readdirSync(sPath);
  files.forEach((file) => {
    const cPath = sPath + "/" + file;
    const stats = fs.statSync(cPath);
    const { name, ext } = path.parse(file);
    if (ignorePath.includes(cPath)) {
      return;
    }
    if (stats.isDirectory()) {
      const node = new Node(
        cPath,
        cPath.replace(rootPath, ""),
        file,
        depth,
        false
      );
      parent.children.push(node);
      read(cPath, node, depth + 1);
    } else {
      if (![".png"].includes(ext)) {
        const rel = parseFileDep(cPath, false);
        const node = new Node(
          cPath,
          cPath.replace(rootPath, ""),
          file,
          depth,
          true,
        );
        node.deps = rel.children;
        parent.children.push(node);
      }
    }
  });
}

read(rootPath, rootNode, 0);

fs.writeFileSync("ui/src/routes.json", JSON.stringify(rootNode.children));