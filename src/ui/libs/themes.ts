interface ThemeColor {
  editor: {
    codeBlockHighlight: string
    gutterBackground: string
    gutterForeground: string
    activeGutterBackground: string
    activeGutterForeground: string
    fatCursor: string
    activeLine: string
  }
}

export const lightThemeColor: ThemeColor = {
  editor: {
    codeBlockHighlight: '#cccccc22',
    gutterBackground: '#ffffff',
    gutterForeground: '#8f8f8f',
    activeGutterBackground: '#cccccc44',
    activeGutterForeground: '#8f8f8f',
    fatCursor: '#48BB78',
    activeLine: '#cccccc44'
  }
}

export const darkThemeColor: ThemeColor = {
  editor: {
    codeBlockHighlight: 'RGBA(0, 0, 0, 0.24)',
    gutterBackground: '#ffffff',
    gutterForeground: '#8f8f8f',
    activeGutterBackground: '#cccccc44',
    activeGutterForeground: '#8f8f8f',
    fatCursor: '#48BB78',
    activeLine: '#cccccc44'
  }
}
