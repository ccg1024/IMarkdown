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

## 简述

codemirror是被设计成一系列功能的集合，方便开发者能够自定义添加或删除特定的功能，而不变之处在于初始化视图时较为复杂。

视图状态的更行受到`redux`，`Elm`的启发，除了少部分特殊情况除外，视图的状态由自身属性`state`决定。同时，要避免直接与该属性进行写操作。而是通过`dispatch`方法，配合`transaction`进行操作。

数据流通常为：

1. 视图设计事件监听

2. 触发DOM事件

3. 将DOM事件转化成事务`transaction`，并执行

4. 得到新状态，更新视图

## 文档偏移

codemirror通过平面字符串的偏移来确定文档的位置，同时，字符串是存储在树形结构中，方便使用较小的开销来更新文档。同时，数据结构是通过行号来定义下标的，同样可以非常方便的获取每行的信息。

## 文档改变

文档的变化会非常准确的描述旧文档的哪些位置被新的内容所替代，方便扩展能够准确的追踪文档的行为，同时实现诸如撤销，协同操作等功能。

## 选择

与文档一样，视图的状态属性中还存储着当前的选择内容。选择可以由多个范围组成，每个范围可以是一个光标或从`anchor`到`head`之间的内容。

重叠的范围会被自动合并，范围集合会被排序——`state.selection`属性总是存储一个有序，不重叠的范围阵列。

这些范围集合中，只有一个会被浏览器选中，其他的被codemirror维护。通常，一个视图只支持一个选中的范围。多范围选中需要配置额外的扩展。

## 事务

由状态的更新方法创造。

## cursor

自定义一个光标元素的原因：在一个codemiror作者分享新编辑器`prosemirror`的视频上提到，不同的浏览器对于`contentEditable`的规则会有所差异，同时，当图片插入到文档中时，如何定位光标比较困难。所以在`prosemirror`中是启用`contentEditable`，但设置监听，事务的更新由作者来控制。或许codemirror6中也是类似的方式。

codemirror6本身是使用一个`mutation observer`来监听文档的所有改变，通过编辑器自身方法进行重绘受影响的节点，而不是通过浏览器原生编辑事件修改内容。

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

## 2023-06-12

修复插件`code-block-extension`特定情况下未更新问题：

**问题**

当打开存在历史定位的文档时，编辑器会使用`EditorView.scrollIntoView`定位历史位置，但定位后，代码块未被插件高亮。

**原因**

为了减少无用渲染，插件使用`syntaxTree`来解析文档，并在视图区进行语法树迭代，但当历史定位距离文档顶部超过一定距离后，虽然编辑器的视图区域时正常定位的，但语法树的解析并没有到达预期的位置。使得后续的渲染装饰器没有被运行。

**解决**

使用`ensureSyntaxTree`方法替换`syntaxTree`方法，前者在将在提供的延迟时间内竟可能获取到目标位置的语法树。

## 2023-06-14

**问题**

动态`padding`是通过codemirror插件更新循环中某个视图属性来触发的，但是该属性除了窗口大小变化之外，`viewport`的变化也会触发该属性为真，导致许多无意义的变化，尝试添加dom的resize事件监听，但没有被触发。暂时不知道原因。

**妥协方案**

插件更新`padding`前对比前后差异来决定是否改变，同时移除codemirror扩展`crosshairCursor`，该扩展是让鼠标指针呈现十字，window系统通过`alt`按键触发，mac系统通过`option`按键触发。触发后会导致`padding`插件的更新。

## 2023-06-19

使用设计codemirror插件，实现标题定位导航。通过`pubsub-js`进行插件与组件间的通信，文字变化采用节流进行优化，标题变化只会更新当前输入行以下的内容，当前所处标题高亮通过codemirror的滚动来控制。点击点击标题只会进行跳转。

**小问题**

因为是使用滚动来控制添加或删除某个标题的高亮css类，因此在打开新文件时，会出现没有一个标题高亮或着标题高亮错误的情况，滚动后会自动修正当前高亮标题。
