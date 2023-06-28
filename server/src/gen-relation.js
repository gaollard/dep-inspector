"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser = __importStar(require("@babel/parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const traverse_1 = __importDefault(require("@babel/traverse"));
let root;
const nodes = [];
const cwd = process.cwd();
function createNode(filePath, isRoot = false) {
    return {
        id: filePath,
        relations: [],
        isRoot,
    };
}
const extension = [".tsx", ".ts", ".js"];
function parseFile(filePath, tree) {
    console.log(`[log] parseFile: ${filePath}`);
    const directoryPath = path_1.default.dirname(filePath);
    const code = fs_1.default.readFileSync(filePath);
    const ast = parser.parse(code.toString(), {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
    });
    const resolve = (_path) => {
        let result = _path;
        const isLocal = _path[0] === "/" || _path[0] === ".";
        if (isLocal) {
            result = path_1.default.resolve(directoryPath, _path);
            if (!path_1.default.extname(_path)) {
                for (let it of extension) {
                    if (fs_1.default.existsSync(result + it)) {
                        result += it;
                        break;
                    }
                }
            }
        }
        if (!nodes.some((it) => it.id === result)) {
            const node = createNode(result);
            if (isLocal &&
                fs_1.default.existsSync(result) &&
                extension.includes(path_1.default.extname(result))) {
                parseFile(result, node);
            }
            nodes.push(node);
        }
        return result;
    };
    (0, traverse_1.default)(ast, {
        ImportDeclaration(astPath) {
            tree.relations.push(resolve(astPath.node.source.value));
        },
        CallExpression(astPath) {
            if (astPath.node.callee.type === "Identifier" &&
                astPath.node.callee.name === "require") {
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
root = createNode(path_1.default.resolve(rootPath + "/src/index.tsx"), true);
nodes.push(root);
parseFile(root.id, root);
{
    const formatNodes = JSON.parse(JSON.stringify(nodes)
        .replaceAll(cwd + "/", "")
        .replaceAll("relations", "children"));
    formatNodes.forEach((it) => {
        const children = it.children;
        it.children = children.map((it) => {
            return formatNodes.find((el) => el.id === it);
        });
    });
    fs_1.default.writeFileSync("ui/public/up-to-bottom.js", "var data = " +
        JSON.stringify(formatNodes[0])
            .replaceAll("id", "name")
            .replaceAll(rootPath, ""));
}
