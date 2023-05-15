---
title: Dev doc
desc: 开发文档
---
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

一些变量含义：

- pos：字符串形式的下标。

- coords：页面位置，应该是 DOM 元素的 offsetTop

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

2023/04/25：发现，当创建空文件时，有几率出现上面的错误，当前的解决方法是创建空文件时，为初始化状态添加一行文字。也不知道是解决还是没有碰到触发错误的几率。

**FIXED**

出现错误的原因是，在对前一个文件进行跳转操作时，`vim`插件使用的是全局变量记录跳转位置，在只替换`state`的情况下切换文件时，从大文件切换到小文件，使用`G`等跳转命令时，会沿用上一个文件的一些数据，从而导致位置错误。

> 跳转时是从字符串下标进行转化的。

**临时解决方案**

在切换文件前，如果进行过往文件末尾方向跳转的行为，通过`gg`跳转到文件头部，再进行文件切换就不会出现该错误。

**最终解决方案**

错误的原因是新文件使用了旧文件在`codemirror/vim`项目中存在一个`PR`，就是说的这个问题，要求提供一个清空操作。给到的回复是某些原因没有实现这个功能，而是在创建一个新的`view`时，会自动清空跳转记录。因此，只需每次打开文件时新建一个`view`，同时将旧的销毁即可。

2023/4/29：将依赖包更新后，出现一些预想之外的问题，有可能是依赖之间的冲突，也有可能是新的包添加了更多的限制或者特性，`vim`插件在更新后就出现`<c-o>`快捷键被占用，在插入模式中无法正常激活打开文件面板，而是直接进入`normal`模式。同时，通过 visual 模式选择文件时，当选择到一行的末尾时，光标块显示位置与实际位置是有所偏差的，可通过查看高亮行号验证。其他问题有待发现。

> 总之，除非确定某个包需要更新来解决现存的问题，最好不要轻易将所有包更新。虽然 codemirror 中提及新的补丁有解决`draSelection`的问题，但更新包后依旧存在。

#### Issue

通过`decoration.line`方式给代码块添加背景高亮的形式与`drawSelection`插件是由一些冲突的，后者无法影响前者修改的区域。导致被选中的区域没有任何背景变化，在视角上难以区分。但`vim`模式又依赖`drawSelection`插件来实现 Visual 模式。

**Fixed**

只需要将为颜色设置透明度即可正常显示`drawSelection`部分，应该是显示层级的原因，设置的颜色显示优先级大于`drawSelection`的部分。同理，当前高亮行的颜色也需要设置透明度。

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

### 日志

#### 2023-04-26

- 添加`redux`模块，用来管理当前编辑文件的内容，方便在不同组件上进行引用。

- 解决每次更新后，预览模块整体重新渲染的问题。在使用`rehype-react`插件进行自定义组件设置时，使用回调函数的方式创建的组件就会在每次更新都进行渲染，直接使用变量形式赋值，在自定义组件中进行`node`操作。

> 但依旧是存在着编辑大文件出现卡顿的问题，虽然通过节流与防抖技术让正常的输入可以不怎么感觉到卡顿，输入速度过快，删除文字时还是很容易感觉到卡顿存。

> 测试中，编辑 100 行左右的文件时就会开始出现这样的问题即便在 DOM 树中只有当前编辑的位置重新渲染。

#### 2023-04-27

删除节流控制，只使用防抖函数进行处理，同时将模块从`preview.tsx`中抽离出来，整体效果比起同时使用节流与防抖要好，设置防抖时间为`300ms`

> 最终的解决方案应该是使用部分渲染——像 codemirror 一样，只将展示在屏幕内容的数据进行重绘。网上的三方库的案例为列表数据，怎么应用到虚拟 DOM 对象上还需要进一步探索。

`electron-forge`没有设置自动检查`main.js`文件的改动并重新加载，github 上有对这个问题的提问，里面的解决方案是在终端中输入`rs`来重新启动应用。

#### 2023-5-1

上述的输入卡顿问题是因为使用插件`react-syntax-highlighter`渲染预览模块导致的，将该部分替换成 codemirror 的`runmode`便可解决，经过测试 archlinux 的笔记文件，只有到文件内容达到一千多行时，才会出现些许的卡顿情况，且当输入速度不快时也不会感觉到，对于该项目而言足够了。

#### 2023-5-15

隐藏系统标题栏，待构建自定义标题栏。目前可用标题栏快捷键。

- `ctl/cmd+o`: 打开文件
- `ctl/cmd+s`: 保存文件
- `ctl/cmd+n`: 创建新文件
- `ctl/cmd+shift+p`: 仅预览
- `ctl/cmd+shift+e`: 仅编辑
- `ctl/cmd+shift+l`: 开启实时预览
- `ctl/cmd+shift+s`: 切换侧边栏
