"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Node {
    constructor(path, route, name, depth, leaf, children) {
        this.path = path;
        this.route = route;
        this.name = name;
        this.depth = depth;
        this.leaf = leaf;
        this.children = children;
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
const rootPath = path_1.default.resolve("ui");
const rootNode = new Node(rootPath, rootPath, "ui");
const ignorePath = [path_1.default.resolve("ui/node_modules"), path_1.default.resolve("ui/.git")];
function read(sPath, parent, depth) {
    const files = fs_1.default.readdirSync(sPath);
    files.forEach((file) => {
        const cPath = sPath + "/" + file;
        const stats = fs_1.default.statSync(cPath);
        const { name, ext } = path_1.default.parse(file);
        if (ignorePath.includes(cPath)) {
            return;
        }
        if (stats.isDirectory()) {
            const node = new Node(cPath, cPath.replace(rootPath, ""), file, depth, false);
            parent.children.push(node);
            read(cPath, node, depth + 1);
        }
        else {
            if (![".png"].includes(ext)) {
                const node = new Node(cPath, cPath.replace(rootPath, ""), file, depth, true);
                parent.children.push(node);
            }
        }
    });
}
read(rootPath, rootNode, 0);
fs_1.default.writeFileSync("ui/src/routes.json", JSON.stringify(rootNode.children));
