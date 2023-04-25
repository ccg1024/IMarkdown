**$PROJECT_ROOT**

- src: code place

  - "components/": React components file

    - file_dir.jsx: Side bar and recent file component
    - my_theme.jsx: Global theme component
    - use_codemirror.jsx: Codemirror initial setup

  - "css/": Stylesheet files

    - App.css
    - editor.css
    - index.css
    - preview.css

  - "img/": Some project material
  - "utils/": Some callback functions

    - after_load.jsx: some callback functions collection
      - `toggleView`: toggle editor pane and preview pane

  - index.js: Index page
  - App.js: Mainly renders page, used by index.js
  - editor.jsx: Editor components

    - Save file IPC
    - Codemirror initial and reset

  - preview.jsx: Preview components, use react-markdown
  - main.js: Electront main program
  - preload.js: IPC pre-load function
  - renderer.js: Render file and call index.js
  - renderer.d.ts: A type file to solve the warning message of the editor when the IPC method is called

### Codemirror

```html
<div class="cm-editor [cm-focused] [generated classes]">
  <div class="cm-scroller">
    <div class="cm-gutters">
      <div class="cm-gutter [...]">
        <!-- One gutter element for each line -->
        <div class="cm-gutterElement">...</div>
      </div>
    </div>
    <div class="cm-content" contenteditable="true">
      <!-- The actual document content -->
      <div class="cm-line">Content goes here</div>
      <div class="cm-line">...</div>
    </div>
    <div class="cm-selectionLayer">
      <!-- Positioned rectangles to draw the selection -->
      <div class="cm-selectionBackground"></div>
    </div>
    <div class="cm-cursorLayer">
      <!-- Positioned elements to draw cursors -->
      <div class="cm-cursor"></div>
    </div>
  </div>
</div>
```

### Electron

开发过程中发现，在`preload.js`中暴露接口的方式下，无法通过`ipcRenderer.removeListener`来取消通道的监听。但通过`ipcRenderer.removeAllListeners`可以取消该通道下的所有监听。

### codemirror

获取光标位置（得到的是字符串坐标形式）.

```js
cm.state.selection.main.head
```

修改整个文档，但保留撤销历史。（用于文件内容的格式化）

```js
cm.dispatch({ changes: { from: 0, to: cm.state.doc.length, insert: text } })
```

#### vim

如果设置了`overflow:hidden`属性，使用 Vim 中的`G`进行跳转时，会在部分长度的文件中出现长度报错问题，猜测应该是将字符串长度对应到`viewport`滚动过程中出现错误。

### prettier

在浏览器中使用 prettier：https://prettier.io/docs/en/browser.html

### 关联文件

为了让特定的文件与应用关联起来，需要在不同的`maker`中配置相应的`extendInfo`属性。

> 不同平台对应不同的`maker`来生成打包文件。

### remark

```shell
$ npm i assert process
$ npm i unified remark-gfm remark-parse remark-react
```

> remark-react is no recommended, using remark-rehype and rehype-react

the purpose of each package

- `assert`: the `assert` module from Node.js, for the browser

- `process`: provide `nextTick` functinality in browser

- `unified`: An interface for processing text using syntax trees. It's what powers **remark(markdown)**, **retext(natural language)**, and **rehype(HTML)**

- `remark-gfm`: remark plugin to support GFM(autolink literals, footnotes, strikethrough, tables, tasklists)

- `remark-parse`: a tool that transforms markdown with plugins, work with `unified`.

- `remark-react`: Legacy plugin to transform to React, not recommended

> **当前问题：同时使用编辑模块与预览模块进行同步编辑时，文件达到一定的大小，就会出现一些卡顿问题，虽然使用`unified`模块渲染的结果在卡顿方面要没那么明显，但依旧存在**。

> 同时，位置同步时，当一行的内容超过真个预览界面时，无法正常显示正在编辑的位置。
