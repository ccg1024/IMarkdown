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
