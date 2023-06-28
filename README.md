# 代码依赖分析可视化

![20230628182836](http://s3.airtlab.com/blog/20230628182836.png)

![20230628182851](http://s3.airtlab.com/blog/20230628182851.png)

![20230628182913](http://s3.airtlab.com/blog/20230628182913.png)

## 1、技术调研

- js-code-structure 分析 js 文件之间的依赖
- dependency-tree 依赖树分析
- 自研 AST 解析 

## 2、图还是树

图的结构，在可视化的呈现上效果不佳

## 3、方案设计

### 1. 使用 AST 提取依赖路径

要做文件级别的依赖分析，就需要提取每个文件中的依赖路径，提取依赖路径有 2 个方法：

- 使用正则表达式，优点是方便实现，缺点是难以剔除注释，灵活度也受限；
- 先进行词法分析和语法分析，得到 AST（抽象语法树）后，遍历每个语法树节点，此方案的优点是分析精确，缺点是实现起来要比纯正则麻烦，如果对应语言没有提供 parser API（如 Less），那就不好实现。

#### import 语句

```ts
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

const ast = parser.parse(`import a from 'fs'; var s = 1 + 2;`, {
  sourceType: 'module'
});

traverse(ast, {
  ImportDeclaration(path) {
    console.log(path)
  },
});
```

#### require 语句

`require()` 在 babel 中被认为是一个 `CallExpression`，需要自己处理


### 2. 图的数据结构

**a.js**
```js
import { sleep } from 'b.js'
import * as c from 'c.js'
import d from 'd.js' 
```

**b.js**
```js
export const sleep = () => {}
```

**c.js**
```js
export const eat = () => {}
```

**d.js**
```js
export default fetch = () => {}
```

关系可表示为：

```js
var nodes = [
  {
    id: 'a.js',
  },
  {
    id: 'b.js',
  },
];

var edges = [
  {
    from: 'b.js',
    to: 'a.js',
    bridge: [
      'sleep'
    ]
  },
  {
    from: 'c.js',
    to: 'a.js',
    bridge: [
      '*'
    ]
  },
   {
    from: 'd.js',
    to: 'a.js',
    bridge: [
      'default'
    ]
  }
]
```