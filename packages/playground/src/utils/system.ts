function getSystemInfo() {
  const info = uni.getSystemInfoSync()
  const menuButton = uni.getMenuButtonBoundingClientRect()
  //   console.log('menuButton', menuButton)
  //   console.log('info', info)
  const {
    statusBarHeight,
    screenHeight,
    screenTop,
    model,
    safeAreaInsets,
    safeArea,
    windowHeight,
    windowTop
  } = info
  return {
    statusBarHeight,
    screenHeight,
    screenTop,
    model,
    safeAreaInsets,
    safeArea,
    windowHeight,
    windowTop,
    menuButton
  }
}
function formatSystemInfo(info: any) {
  const {
    statusBarHeight,
    screenHeight,
    screenTop,
    model,
    safeAreaInsets,
    safeArea,
    windowHeight,
    windowTop,
    menuButton
  } = info
  return [
    `model: ${model}`,
    `statusBarHeight: ${statusBarHeight}`,
    `screenHeight: ${screenHeight}`,
    `screenTop: ${screenTop}`,
    `windowHeight: ${windowHeight}`,
    `windowTop: ${windowTop}`,
    `safeAreaInsets.top: ${safeAreaInsets.top}`,
    `safeAreaInsets.bottom: ${safeAreaInsets.bottom}`,
    `safeArea.top: ${safeArea.top}`,
    `safeArea.bottom: ${safeArea.bottom}`,
    `menuButton.top: ${menuButton.top}`,
    `menuButton.bottom: ${menuButton.bottom}`,
    `menuButton.left: ${menuButton.left}`,
    `menuButton.right: ${menuButton.right}`,
    `menuButton.width: ${menuButton.width}`,
    `menuButton.height: ${menuButton.height}`
  ]
}

export { getSystemInfo, formatSystemInfo }
