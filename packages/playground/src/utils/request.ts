function reqFetch(options: UniApp.RequestOptions & { useComplete?: boolean }) {
  const { url, data, header, method = 'GET', useComplete = false } = options
  return new Promise((resolve, reject) => {
    const option: UniApp.RequestOptions = {
      url,
      data,
      header,
      method
    }
    if (useComplete) {
      option.complete = (res) => {
        resolve(res)
      }
    } else {
      option.success = (res) => {
        resolve(res)
      }
      option.fail = (err) => {
        reject(err)
      }
    }
    uni.request(option)
  })
}

export default reqFetch
