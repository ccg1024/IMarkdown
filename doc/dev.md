---
title: 开发文档
desc: imarkdown项目使用typescript重构后的开发文档
date: 2023-05-23
---
# electron

一个依赖包`@electron/remote`展示不知道干什么用，不知道是脚手架自动生产的还是后面自己安装的了，反正一在一个地方用到。是一个提供在渲染进程中使用主进程对象的方法。

## ipc

**渲染进程向主进程通信（单向）**，由渲染进行发起通信，主进程接受信息。但不回复

- `ipcRenderer.send()`

- `ipcMain.on()`

**渲染进程向主进程（双向）**，由渲染进程发起通信，主进程接受，可以回复。

- `ipcRenderer.invoke()`

- `ipcMain.handle()`

**主进程向渲染进程**

- `webContents`实例发送消息

- `ipcRenderer.on()`

# codemirror

开发依赖包

```shell
npm install @codemirror/autocomplete @codemirror/commands
npm install @codemirror/lang-markdown @codemirror/language
npm install @codemirror/language-data @codemirror/search
npm install @codemirror/state @codemirror/view
```

# main process

解析 yaml 头部格式：`npm i gray-matter`

# renderer process

组件间通信使用`pubsub-js`，`redux`

**pubsub-js**

```shell
npm install pubsub-js
npm install -D @types/pubsub-js
```

**redux**

```shell
npm install @reduxjs/toolkit react-redux
npm install @types/react-redux -D
```

markdown 语法转换工具：`remark`，`unified`

```shell
npm i rehype-react remark-gfm remark-math remark-parse remark-rehype unified
```
