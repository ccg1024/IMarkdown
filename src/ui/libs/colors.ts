type ColorItem = {
  backgroundColorLight: string
  backgroundColorDark: string
  activeColorLight?: string
}
type UiColor = {
  leftSideBarFixed: ColorItem
  leftSideBar: ColorItem
}
const uiColor: UiColor = {
  leftSideBarFixed: {
    backgroundColorDark: '#171920',
    backgroundColorLight: '#171920',
    activeColorLight: 'rgba(255, 255, 255, 0.08)'
  },
  leftSideBar: {
    backgroundColorLight: '#F4F4F3',
    backgroundColorDark: '#F4F4F3'
  }
}

export default uiColor
