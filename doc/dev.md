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

### prettier

在浏览器中使用 prettier：https://prettier.io/docs/en/browser.html

### 关联文件

为了让特定的文件与应用关联起来，需要在不同的`maker`中配置相应的`extendInfo`属性。

> 不同平台对应不同的`maker`来生成打包文件。
