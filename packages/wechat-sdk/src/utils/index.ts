export function getNetworkType() {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType)
      },
      fail: (err) => {
        resolve('unknown')
      }
    })
  })
}

export function getSystemInfo() {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        resolve({})
      }
    })
  })
}

export function getRoute() {
  if (!getCurrentPages) return ''
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.route
}
