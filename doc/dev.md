---
title: 开发文档
desc: imarkdown项目使用typescript重构后的开发文档
date: 2023-5-23
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

# 日志

## before

在实时预览时，使用`useTransition`设置低优先级事件，这样可以结局在长文件上，输入卡顿问题。当前测试在2000多行的文件上，依旧是没有什么卡顿的，当处理5000行左右的文件时，则会存在输入卡顿现象了。

## 2023-06-02

优化插件`code-block-highlight`，直接使用`syntaxTree`对可视迭代可视区域内的内容即可，无需对整个文档内容进行处理。

使用`Decoration.widget`添加图片预览功能，但使用图片预览后，图片后续的内容需要空一行来纠正实时预览的同步滚动问题：

> 未空行的内容会被当做图片内容，滚动时，在预览界面会被当做图片部分进行处理。

## 2023-06-07

修改`SideBar`组件，为其添加路由功能，方便侧边栏右侧内容的分类渲染。使用的路由组件为`HashRouter`，如果使用`BrowserRouter`，会出现一些错误。在stackoverflow上一则帖子说前者是基于文件环境，后者基于请求环境。[How to use React Router with Electron?](https://stackoverflow.com/questions/36505404/how-to-use-react-router-with-electron)


