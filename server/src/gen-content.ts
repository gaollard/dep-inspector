import fs from "fs";
import path from "path";

class Node {
  constructor(
    public path: string,
    public route: string,
    public name: string,
    public depth?: number,
    public leaf?: boolean,
    public children?: Node[]
  ) {
    this.path = path;
    this.route = route;
    this.leaf = leaf;
    this.name = name;
    this.depth = depth;
    if (!this.leaf) {
      this.children = [];
    }
  }
}

const rootPath = path.resolve("ui");
const rootNode = new Node(rootPath, rootPath, "ui");

const ignorePath = [path.resolve("ui/node_modules"), path.resolve("ui/.git")];

function read(sPath: string, parent: Node, depth: number) {
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
      parent.children!.push(node);
      read(cPath, node, depth + 1);
    } else {
      if (![".png"].includes(ext)) {
        const node = new Node(
          cPath,
          cPath.replace(rootPath, ""),
          file,
          depth,
          true
        );
        parent.children!.push(node);
      }
    }
  });
}

read(rootPath, rootNode, 0);
fs.writeFileSync("ui/src/routes.json", JSON.stringify(rootNode.children));
